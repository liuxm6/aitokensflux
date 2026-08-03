import type { Language, PageKey } from "../types";
import manifestData from "./pages.json";

export type SeoLanguage = "zh" | "en";

export type SeoLocalizedText = {
  zh: string;
  en: string;
};

export type SeoManifestFaq = {
  question: SeoLocalizedText;
  answer: SeoLocalizedText;
};

export type SeoManifestPage = {
  key: string;
  path: string;
  aliases: string[];
  title: SeoLocalizedText;
  description: SeoLocalizedText;
  breadcrumb: SeoLocalizedText;
  schemas: string[];
  faq?: SeoManifestFaq[];
};

export type SeoManifest = {
  siteUrl: string;
  productionHost: string;
  shareImagePath: string;
  pages: SeoManifestPage[];
  noindexPaths: string[];
  noindexPrefixes: string[];
};

export type SeoRouteResolution = {
  language: SeoLanguage;
  pageKey: PageKey | null;
  canonicalPath?: string;
  redirectPath?: string;
  noindex: boolean;
  notFound: boolean;
};

export type BrowserSeoMetadata = {
  language: SeoLanguage;
  title: string;
  description: string;
  robots: "index, follow" | "noindex, nofollow";
  canonical?: string;
  alternates?: {
    "zh-CN": string;
    en: string;
    "x-default": string;
  };
  image?: string;
  schema?: Record<string, unknown>;
};

export type SeoMetadataHelpers = {
  resolveSeoRoute: (pathname: string) => SeoRouteResolution;
  localizePublicHref: (
    href: string,
    language: Language,
    origin?: string,
  ) => string;
  getLanguageSwitchHref: (
    pathname: string,
    search: string,
    hash: string,
    language: Language,
  ) => string;
  getRouteLanguage: (pathname: string) => SeoLanguage | null;
  buildSeoMetadata: (pathname: string, host: string) => BrowserSeoMetadata;
};

const expectedPagePaths = {
  home: "/",
  pricing: "/pricing",
  docs: "/docs",
  userAgreement: "/user-agreement",
  privacyPolicy: "/privacy-policy",
} as const;

const pageKeyMap = {
  home: "home",
  pricing: "subscribe",
  docs: "setup",
  userAgreement: "userAgreement",
  privacyPolicy: "privacyPolicy",
} as const satisfies Record<keyof typeof expectedPagePaths, PageKey>;

const customerSeoSiteUrl = "https://aitokensflux.com";
const customerSeoProductionHost = "aitokensflux.com";
const customerSeoShareImagePath = "/og/aitokensflux-social-card.png";
const brandTitle = "AI Tokens Flux";
const brandDescription = {
  zh: "AI Tokens Flux 提供 Claude Code、Codex 与 Grok API 统一接入。",
  en: "AI Tokens Flux provides unified Claude Code, Codex and Grok API access.",
} satisfies SeoLocalizedText;

type ResolvedSeoRoute = SeoRouteResolution & {
  page?: SeoManifestPage;
};

function normalizeDecodedSeoPath(value: string) {
  let path = value;
  if (!path || path === "/") return "/";
  if (!path.startsWith("/")) path = `/${path}`;
  return path.replace(/\/+$/, "");
}

function decodeSeoPath(value: string): string | null {
  let path: string;
  try {
    path = decodeURIComponent(value.trim());
  } catch {
    return null;
  }
  return normalizeDecodedSeoPath(path);
}

function normalizeManifestPath(value: string, preserveTrailingSlash = false) {
  const rawPath = value.trim();
  if (
    !rawPath.startsWith("/") ||
    rawPath.includes("?") ||
    rawPath.includes("#") ||
    (rawPath !== "/" && rawPath.includes("//"))
  ) {
    return null;
  }

  const normalized = decodeSeoPath(rawPath);
  if (!normalized) return null;
  const segments = normalized.split("/");
  if (segments.some((segment) => segment === "." || segment === "..")) {
    return null;
  }

  const expected =
    preserveTrailingSlash && rawPath.endsWith("/") && normalized !== "/"
      ? `${normalized}/`
      : normalized;
  return rawPath === expected ? expected : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseLocalizedText(value: unknown): SeoLocalizedText | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.zh !== "string" ||
    !value.zh.trim() ||
    typeof value.en !== "string" ||
    !value.en.trim()
  ) {
    return null;
  }
  return { zh: value.zh, en: value.en };
}

function parseFaq(value: unknown): SeoManifestFaq | null {
  if (!isRecord(value)) return null;
  const question = parseLocalizedText(value.question);
  const answer = parseLocalizedText(value.answer);
  return question && answer ? { question, answer } : null;
}

function parsePage(value: unknown): SeoManifestPage | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.key !== "string" ||
    typeof value.path !== "string" ||
    !Array.isArray(value.aliases) ||
    !value.aliases.every((alias) => typeof alias === "string") ||
    !Array.isArray(value.schemas) ||
    !value.schemas.every(
      (schema) => typeof schema === "string" && Boolean(schema.trim()),
    )
  ) {
    return null;
  }

  const title = parseLocalizedText(value.title);
  const description = parseLocalizedText(value.description);
  const breadcrumb = parseLocalizedText(value.breadcrumb);
  if (!title || !description || !breadcrumb) return null;

  let faq: SeoManifestFaq[] | undefined;
  if (value.faq !== undefined) {
    if (!Array.isArray(value.faq)) return null;
    const parsedFaq = value.faq.map(parseFaq);
    if (parsedFaq.some((item) => !item)) return null;
    faq = parsedFaq as SeoManifestFaq[];
  }

  return {
    key: value.key,
    path: value.path,
    aliases: [...value.aliases],
    title,
    description,
    breadcrumb,
    schemas: [...value.schemas],
    faq,
  };
}

function validateSeoManifest(data: unknown): SeoManifest | null {
  if (!isRecord(data)) return null;
  if (
    data.siteUrl !== customerSeoSiteUrl ||
    data.productionHost !== customerSeoProductionHost ||
    data.shareImagePath !== customerSeoShareImagePath ||
    !Array.isArray(data.pages) ||
    data.pages.length !== Object.keys(expectedPagePaths).length ||
    !Array.isArray(data.noindexPaths) ||
    !data.noindexPaths.every((path) => typeof path === "string") ||
    !Array.isArray(data.noindexPrefixes) ||
    !data.noindexPrefixes.every((prefix) => typeof prefix === "string")
  ) {
    return null;
  }

  const parsedPages = data.pages.map(parsePage);
  if (parsedPages.some((page) => !page)) return null;
  const pages = parsedPages as SeoManifestPage[];
  const pageKeys = new Set<string>();
  const canonicalPaths = new Set<string>();
  const aliases = new Set<string>();

  for (const page of pages) {
    if (!(page.key in expectedPagePaths) || pageKeys.has(page.key)) return null;
    pageKeys.add(page.key);
    const expectedPath =
      expectedPagePaths[page.key as keyof typeof expectedPagePaths];
    const path = normalizeManifestPath(page.path);
    if (!path || path !== expectedPath || canonicalPaths.has(path)) return null;
    page.path = path;
    canonicalPaths.add(path);

    for (let index = 0; index < page.aliases.length; index += 1) {
      const alias = normalizeManifestPath(page.aliases[index]);
      if (!alias || aliases.has(alias)) return null;
      page.aliases[index] = alias;
      aliases.add(alias);
    }

    if (page.key === "home" && (!page.faq || page.faq.length === 0)) {
      return null;
    }
  }

  for (const alias of aliases) {
    if (canonicalPaths.has(alias)) return null;
  }

  const noindexPaths: string[] = [];
  const noindexPathSet = new Set<string>();
  for (const value of data.noindexPaths) {
    const path = normalizeManifestPath(value);
    if (
      !path ||
      noindexPathSet.has(path) ||
      canonicalPaths.has(path) ||
      aliases.has(path)
    ) {
      return null;
    }
    noindexPathSet.add(path);
    noindexPaths.push(path);
  }

  const noindexPrefixes: string[] = [];
  const noindexPrefixSet = new Set<string>();
  for (const value of data.noindexPrefixes) {
    const prefix = normalizeManifestPath(value, true);
    if (!prefix || prefix === "/" || noindexPrefixSet.has(prefix)) return null;
    for (const existing of noindexPrefixes) {
      if (prefix.startsWith(existing) || existing.startsWith(prefix))
        return null;
    }
    noindexPrefixSet.add(prefix);
    noindexPrefixes.push(prefix);
  }

  for (const path of [...canonicalPaths, ...aliases]) {
    if (noindexPrefixes.some((prefix) => path.startsWith(prefix))) return null;
  }
  for (const path of noindexPaths) {
    if (noindexPrefixes.some((prefix) => path.startsWith(prefix))) return null;
  }

  return {
    siteUrl: customerSeoSiteUrl,
    productionHost: customerSeoProductionHost,
    shareImagePath: customerSeoShareImagePath,
    pages,
    noindexPaths,
    noindexPrefixes,
  };
}

function fallbackLanguage(pathname: string): SeoLanguage {
  const path = pathname.trim();
  return path === "/en" || path.startsWith("/en/") ? "en" : "zh";
}

function localizedValue(value: SeoLocalizedText, language: SeoLanguage) {
  return language === "en" ? value.en : value.zh;
}

function htmlLanguage(language: SeoLanguage) {
  return language === "en" ? "en" : "zh-CN";
}

function normalizeHost(host: string) {
  const value = host.trim().toLowerCase();
  if (!value || value.includes("://")) return "";
  try {
    return new URL(`http://${value}`).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function createSeoMetadataHelpers(data: unknown): SeoMetadataHelpers {
  const manifest = validateSeoManifest(data);

  function splitSeoLanguage(pathname: string) {
    const path = decodeSeoPath(pathname);
    if (!path) return null;
    if (path === "/en") {
      return { language: "en" as const, basePath: "/" };
    }
    if (path.startsWith("/en/")) {
      return {
        language: "en" as const,
        basePath: normalizeDecodedSeoPath(path.slice(3)),
      };
    }
    return { language: "zh" as const, basePath: path };
  }

  function canonicalPath(language: SeoLanguage, basePath: string) {
    const path = normalizeDecodedSeoPath(basePath);
    if (language !== "en") return path;
    return path === "/" ? "/en" : `/en${path}`;
  }

  function absoluteUrl(path: string) {
    const normalized = normalizeDecodedSeoPath(path);
    return `${manifest?.siteUrl ?? customerSeoSiteUrl}${normalized}`;
  }

  function resolveSeoRouteWithPage(pathname: string): ResolvedSeoRoute {
    const splitPath = splitSeoLanguage(pathname);
    if (!manifest || !splitPath) {
      return {
        language: splitPath?.language ?? fallbackLanguage(pathname),
        pageKey: null,
        noindex: true,
        notFound: true,
      };
    }

    const { language, basePath } = splitPath;
    for (const page of manifest.pages) {
      if (page.path !== basePath) continue;
      return {
        language,
        pageKey: pageKeyMap[page.key as keyof typeof pageKeyMap] ?? null,
        page,
        canonicalPath: canonicalPath(language, page.path),
        noindex: false,
        notFound: false,
      };
    }
    for (const page of manifest.pages) {
      if (!page.aliases.includes(basePath)) continue;
      const path = canonicalPath(language, page.path);
      return {
        language,
        pageKey: pageKeyMap[page.key as keyof typeof pageKeyMap] ?? null,
        page,
        canonicalPath: path,
        redirectPath: path,
        noindex: false,
        notFound: false,
      };
    }

    const noindexPath = manifest.noindexPaths.includes(basePath);
    const noindexPrefix = manifest.noindexPrefixes.some((prefix) =>
      basePath.startsWith(prefix),
    );
    return {
      language,
      pageKey: null,
      noindex: true,
      notFound: !noindexPath && !noindexPrefix,
    };
  }

  function resolveSeoRoute(pathname: string): SeoRouteResolution {
    const { page: _page, ...resolution } = resolveSeoRouteWithPage(pathname);
    return resolution;
  }

  function localizePublicHref(
    href: string,
    language: Language,
    origin = typeof window === "undefined"
      ? customerSeoSiteUrl
      : window.location.origin,
  ) {
    if (!manifest || href.startsWith("#") || href.startsWith("?")) return href;

    let originUrl: URL;
    let url: URL;
    try {
      originUrl = new URL(origin);
      url = new URL(href, originUrl);
    } catch {
      return href;
    }
    if (url.origin !== originUrl.origin) return href;

    const resolution = resolveSeoRouteWithPage(url.pathname);
    if (!resolution.page) return href;

    const targetLanguage: SeoLanguage = language === "en" ? "en" : "zh";
    const path = canonicalPath(targetLanguage, resolution.page.path);
    const localized = `${path}${url.search}${url.hash}`;
    const isAbsolute = /^[a-z][a-z\d+.-]*:/i.test(href);
    return isAbsolute ? `${url.origin}${localized}` : localized;
  }

  function getLanguageSwitchHref(
    pathname: string,
    search: string,
    hash: string,
    language: Language,
  ) {
    const resolution = resolveSeoRouteWithPage(pathname);
    if (!resolution.page) return `${pathname}${search}${hash}`;
    const targetLanguage: SeoLanguage = language === "en" ? "en" : "zh";
    return `${canonicalPath(targetLanguage, resolution.page.path)}${search}${hash}`;
  }

  function getRouteLanguage(pathname: string): SeoLanguage | null {
    const resolution = resolveSeoRouteWithPage(pathname);
    return resolution.page ? resolution.language : null;
  }

  function buildSeoMetadata(
    pathname: string,
    host: string,
  ): BrowserSeoMetadata {
    const resolution = resolveSeoRouteWithPage(pathname);
    const robots =
      manifest &&
      resolution.page &&
      normalizeHost(host) === manifest.productionHost
        ? "index, follow"
        : "noindex, nofollow";
    const metadata: BrowserSeoMetadata = {
      language: resolution.language,
      title: brandTitle,
      description: localizedValue(brandDescription, resolution.language),
      robots,
    };
    if (!manifest || !resolution.page || !resolution.canonicalPath) {
      return metadata;
    }

    const page = resolution.page;
    const canonical = absoluteUrl(resolution.canonicalPath);
    const zhUrl = absoluteUrl(canonicalPath("zh", page.path));
    const enUrl = absoluteUrl(canonicalPath("en", page.path));
    metadata.title = localizedValue(page.title, resolution.language);
    metadata.description = localizedValue(
      page.description,
      resolution.language,
    );
    metadata.canonical = canonical;
    metadata.alternates = {
      "zh-CN": zhUrl,
      en: enUrl,
      "x-default": zhUrl,
    };
    metadata.image = absoluteUrl(manifest.shareImagePath);
    metadata.schema = buildSchema(page, resolution.language, metadata);
    return metadata;
  }

  function buildSchema(
    page: SeoManifestPage,
    language: SeoLanguage,
    metadata: BrowserSeoMetadata,
  ) {
    const canonical = metadata.canonical ?? customerSeoSiteUrl;
    const rootUrl = absoluteUrl("/");
    const graph: Record<string, unknown>[] = [
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: metadata.title,
        description: metadata.description,
        inLanguage: htmlLanguage(language),
        isPartOf: { "@id": `${rootUrl}#website` },
      },
    ];

    if (page.key === "home") {
      graph.push(
        {
          "@type": "Organization",
          "@id": `${rootUrl}#organization`,
          name: brandTitle,
          url: rootUrl,
        },
        {
          "@type": "WebSite",
          "@id": `${rootUrl}#website`,
          url: rootUrl,
          name: brandTitle,
          inLanguage: htmlLanguage(language),
          publisher: { "@id": `${rootUrl}#organization` },
        },
        {
          "@type": "Service",
          "@id": `${rootUrl}#service`,
          name: brandTitle,
          description: metadata.description,
          url: canonical,
          provider: { "@id": `${rootUrl}#organization` },
        },
        {
          "@type": "FAQPage",
          "@id": `${canonical}#faq`,
          mainEntity: (page.faq ?? []).map((faq) => ({
            "@type": "Question",
            name: localizedValue(faq.question, language),
            acceptedAnswer: {
              "@type": "Answer",
              text: localizedValue(faq.answer, language),
            },
          })),
        },
      );
    } else {
      graph.push({
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: language === "en" ? "Home" : "首页",
            item: absoluteUrl(canonicalPath(language, "/")),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: localizedValue(page.breadcrumb, language),
            item: canonical,
          },
        ],
      });
    }

    return {
      "@context": "https://schema.org",
      "@graph": graph,
    };
  }

  return {
    resolveSeoRoute,
    localizePublicHref,
    getLanguageSwitchHref,
    getRouteLanguage,
    buildSeoMetadata,
  };
}

const defaultHelpers = createSeoMetadataHelpers(manifestData);

export const resolveSeoRoute = defaultHelpers.resolveSeoRoute;
export const localizePublicHref = defaultHelpers.localizePublicHref;
export const getLanguageSwitchHref = defaultHelpers.getLanguageSwitchHref;
export const getRouteLanguage = defaultHelpers.getRouteLanguage;
export const buildSeoMetadata = defaultHelpers.buildSeoMetadata;
