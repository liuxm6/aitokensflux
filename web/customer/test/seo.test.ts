import { describe, expect, test } from "bun:test";
import { getPageKey } from "../src/helpers/navigation";
import {
  detectCustomerLanguage,
  getCustomerHtmlLanguage,
  selectCustomerLanguageForPath,
} from "../src/i18n/languages";
import manifestData from "../src/seo/pages.json";
import {
  buildSeoMetadata,
  createSeoMetadataHelpers,
  getLanguageSwitchHref,
  getRouteLanguage,
  localizePublicHref,
  resolveSeoRoute,
} from "../src/seo/metadata";

describe("customer SEO routes", () => {
  test("resolves canonical languages and aliases", () => {
    expect(resolveSeoRoute("/")).toMatchObject({
      language: "zh",
      pageKey: "home",
      canonicalPath: "/",
    });
    expect(resolveSeoRoute("/en/pricing")).toMatchObject({
      language: "en",
      pageKey: "subscribe",
      canonicalPath: "/en/pricing",
    });
    expect(resolveSeoRoute("/subscribe").canonicalPath).toBe("/pricing");
    expect(resolveSeoRoute("/en/setup").canonicalPath).toBe("/en/docs");
  });

  test("decodes request paths once and fails closed on malformed encoding", () => {
    expect(resolveSeoRoute("/%64ocs")).toMatchObject({
      pageKey: "setup",
      canonicalPath: "/docs",
      notFound: false,
    });
    expect(resolveSeoRoute("/en/%64ocs")).toMatchObject({
      language: "en",
      pageKey: "setup",
      canonicalPath: "/en/docs",
      notFound: false,
    });
    expect(resolveSeoRoute("/docs%2F").canonicalPath).toBe("/docs");
    expect(
      localizePublicHref("/%64ocs", "en", "https://aitokensflux.com"),
    ).toBe("/en/docs");
    expect(resolveSeoRoute("/%2Fdocs")).toMatchObject({
      pageKey: null,
      noindex: true,
      notFound: true,
    });
    for (const pathname of ["/%2564ocs", "/en/%2564ocs", "/en/docs%252F"]) {
      expect(resolveSeoRoute(pathname), pathname).toMatchObject({
        pageKey: null,
        noindex: true,
        notFound: true,
      });
      expect(
        buildSeoMetadata(pathname, "aitokensflux.com").canonical,
        pathname,
      ).toBeUndefined();
    }

    const malformed = resolveSeoRoute("/%");
    expect(malformed).toMatchObject({
      pageKey: null,
      noindex: true,
      notFound: true,
    });
    expect(malformed.canonicalPath).toBeUndefined();
    const malformedMetadata = buildSeoMetadata("/%", "aitokensflux.com");
    expect(malformedMetadata.robots).toBe("noindex, nofollow");
    expect(malformedMetadata.canonical).toBeUndefined();
    expect(malformedMetadata.alternates).toBeUndefined();
    expect(malformedMetadata.image).toBeUndefined();
    expect(malformedMetadata.schema).toBeUndefined();
    expect(getRouteLanguage("/%")).toBeNull();
    expect(localizePublicHref("/%", "en", "https://aitokensflux.com")).toBe(
      "/%",
    );
  });

  test("localizes only public internal links", () => {
    expect(
      localizePublicHref("/docs#codex", "en", "https://aitokensflux.com"),
    ).toBe("/en/docs#codex");
    expect(
      localizePublicHref("/subscribe", "zh", "https://aitokensflux.com"),
    ).toBe("/pricing");
    expect(
      localizePublicHref("/dashboard", "en", "https://aitokensflux.com"),
    ).toBe("/dashboard");
    expect(
      localizePublicHref(
        "https://example.com/docs",
        "en",
        "https://aitokensflux.com",
      ),
    ).toBe("https://example.com/docs");
  });

  test("switches public language URLs", () => {
    expect(
      getLanguageSwitchHref("/docs", "?tool=codex", "#windows", "en"),
    ).toBe("/en/docs?tool=codex#windows");
    expect(getLanguageSwitchHref("/en/pricing", "", "#plans", "zh")).toBe(
      "/pricing#plans",
    );
    expect(getRouteLanguage("/pricing")).toBe("zh");
    expect(getRouteLanguage("/en/docs")).toBe("en");
    expect(getRouteLanguage("/dashboard")).toBeNull();
  });

  test("gates indexing by host", () => {
    expect(buildSeoMetadata("/en/docs", "aitokensflux.com").robots).toBe(
      "index, follow",
    );
    expect(buildSeoMetadata("/pricing", "preview.example.com").robots).toBe(
      "noindex, nofollow",
    );
  });

  test("builds canonical metadata only for public pages", () => {
    const publicMetadata = buildSeoMetadata("/en/docs", "aitokensflux.com");
    expect(publicMetadata.canonical).toBe("https://aitokensflux.com/en/docs");
    expect(publicMetadata.alternates?.["zh-CN"]).toBe(
      "https://aitokensflux.com/docs",
    );
    expect(publicMetadata.schema?.["@context"]).toBe("https://schema.org");

    const privateMetadata = buildSeoMetadata(
      "/dashboard/api-key",
      "aitokensflux.com",
    );
    expect(privateMetadata.robots).toBe("noindex, nofollow");
    expect(privateMetadata.canonical).toBeUndefined();
    expect(privateMetadata.alternates).toBeUndefined();
    expect(privateMetadata.schema).toBeUndefined();
  });

  test("adapts public and private entry routes", () => {
    expect(getPageKey("/en/docs")).toBe("setup");
    expect(getPageKey("/en/dashboard/api-key")).toBe("apikeys");
    expect(getPageKey("/en/oauth/github")).toBe("oauthCallback");
    expect(detectCustomerLanguage("/")).toBe("zh");
    expect(detectCustomerLanguage("/en/docs")).toBe("en");
  });

  test("preserves manual UI language across refresh and public navigation", () => {
    expect(selectCustomerLanguageForPath("/en/docs", "ru", true)).toBe("en");
    expect(selectCustomerLanguageForPath("/docs", "zh-TW", true)).toBe("zh-TW");
    expect(selectCustomerLanguageForPath("/pricing", "ru", true)).toBe("ru");
    expect(selectCustomerLanguageForPath("/", "en", true)).toBe("zh");
    expect(selectCustomerLanguageForPath("/docs", "zh-TW", false)).toBe("zh");
    expect(selectCustomerLanguageForPath("/dashboard", "ru", true)).toBe("ru");
  });

  test("maps the actual UI language to the document language", () => {
    expect(getCustomerHtmlLanguage("en")).toBe("en");
    expect(getCustomerHtmlLanguage("zh")).toBe("zh-CN");
    expect(getCustomerHtmlLanguage("zh-TW")).toBe("zh-Hant");
    expect(getCustomerHtmlLanguage("ru")).toBe("ru");
  });

  test("fails closed when the runtime SEO manifest violates invariants", () => {
    const invalidManifests: Array<
      [string, (manifest: typeof manifestData) => void]
    > = [
      [
        "fixed site URL",
        (manifest) => (manifest.siteUrl = "https://example.com"),
      ],
      [
        "fixed production host",
        (manifest) => (manifest.productionHost = "example.com"),
      ],
      [
        "fixed share image",
        (manifest) => (manifest.shareImagePath = "/other.png"),
      ],
      ["exact page count", (manifest) => manifest.pages.pop()],
      ["fixed page path", (manifest) => (manifest.pages[1].path = "/plans")],
      ["localized page text", (manifest) => (manifest.pages[0].title.en = "")],
      [
        "alias collision",
        (manifest) => manifest.pages[1].aliases.push(manifest.pages[2].path),
      ],
      [
        "duplicate alias",
        (manifest) =>
          manifest.pages[2].aliases.push(manifest.pages[1].aliases[0]),
      ],
      [
        "alias noindex collision",
        (manifest) => manifest.noindexPaths.push(manifest.pages[1].aliases[0]),
      ],
      [
        "canonical noindex collision",
        (manifest) => manifest.noindexPaths.push(manifest.pages[2].path),
      ],
      [
        "canonical noindex prefix collision",
        (manifest) => manifest.noindexPrefixes.push("/doc"),
      ],
      [
        "duplicate noindex path",
        (manifest) => manifest.noindexPaths.push(manifest.noindexPaths[0]),
      ],
      [
        "overlapping noindex path and prefix",
        (manifest) => manifest.noindexPrefixes.push("/dashboard/"),
      ],
      ["invalid noindex path", (manifest) => manifest.noindexPaths.push("/%")],
      [
        "localized home FAQ",
        (manifest) => (manifest.pages[0].faq[0].answer.zh = " "),
      ],
    ];

    for (const [name, mutate] of invalidManifests) {
      const manifest = structuredClone(manifestData);
      mutate(manifest);
      const helpers = createSeoMetadataHelpers(manifest);
      const resolution = helpers.resolveSeoRoute("/docs");
      const metadata = helpers.buildSeoMetadata("/docs", "aitokensflux.com");

      expect(resolution, name).toMatchObject({
        pageKey: null,
        noindex: true,
        notFound: true,
      });
      expect(resolution.canonicalPath, name).toBeUndefined();
      expect(helpers.getRouteLanguage("/docs"), name).toBeNull();
      expect(
        helpers.localizePublicHref("/docs", "en", "https://aitokensflux.com"),
        name,
      ).toBe("/docs");
      expect(metadata.robots, name).toBe("noindex, nofollow");
      expect(metadata.canonical, name).toBeUndefined();
      expect(metadata.alternates, name).toBeUndefined();
      expect(metadata.image, name).toBeUndefined();
      expect(metadata.schema, name).toBeUndefined();
    }
  });

  test("scopes React JSON-LD ownership to the customer marker", async () => {
    const source = await Bun.file(
      new URL("../src/components/common/Seo.tsx", import.meta.url),
    ).text();

    expect(source).toContain("script[data-customer-seo-jsonld]");
    expect(source).not.toContain('script[type="application/ld+json"]');
  });

  test("keeps the standalone docs heading in the accessible content layer", async () => {
    const source = await Bun.file(
      new URL("../src/components/setup/SetupPage.tsx", import.meta.url),
    ).text();
    const hiddenStart = source.indexOf(
      '<div className="setup-wizard-bg" aria-hidden="true">',
    );
    const hiddenEnd = source.indexOf("</div>", hiddenStart);
    const contentStart = source.indexOf("<section", hiddenEnd);
    const wizardContentIndex = source.indexOf("{wizardContent}", contentStart);
    const headingIndex = source.indexOf("<h1", contentStart);

    expect(source.match(/<h1\b/g)).toHaveLength(1);
    expect(source.slice(hiddenStart, hiddenEnd)).not.toContain("<h1");
    expect(headingIndex).toBeGreaterThan(contentStart);
    expect(headingIndex).toBeLessThan(wizardContentIndex);
    expect(source.slice(headingIndex, wizardContentIndex)).toContain(
      'id="Claude Code and Codex API setup guide"',
    );
  });
});
