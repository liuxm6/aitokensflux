import { describe, expect, test } from "bun:test";
import { getPageKey } from "../src/helpers/navigation";
import { detectCustomerLanguage } from "../src/i18n/languages";
import {
  buildSeoMetadata,
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
    const stageStart = source.indexOf('{stage === "tool"', contentStart);
    const headingIndex = source.indexOf("<h1", contentStart);

    expect(source.match(/<h1\b/g)).toHaveLength(1);
    expect(source.slice(hiddenStart, hiddenEnd)).not.toContain("<h1");
    expect(headingIndex).toBeGreaterThan(contentStart);
    expect(headingIndex).toBeLessThan(stageStart);
    expect(source.slice(headingIndex, stageStart)).toContain(
      'id="Claude Code and Codex API setup guide"',
    );
  });
});
