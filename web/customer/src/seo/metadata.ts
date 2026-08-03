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

type SeoManifest = {
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

const pageKeyMap = {
  home: "home",
  pricing: "subscribe",
  docs: "setup",
  userAgreement: "userAgreement",
  privacyPolicy: "privacyPolicy",
} as const satisfies Record<string, PageKey>;

const manifest = manifestData as SeoManifest;
const brandTitle = "AI Tokens Flux";
const brandDescription = {
  zh: "AI Tokens Flux 提供 Claude Code、Codex 与 Grok API 统一接入。",
  en: "AI Tokens Flux provides unified Claude Code, Codex and Grok API access.",
} satisfies SeoLocalizedText;

type ResolvedSeoRoute = SeoRouteResolution & {
  page?: SeoManifestPage;
};

function normalizeSeoPath(value: string) {
  let path = value.trim();
  if (!path || path === "/") return "/";
  if (!path.startsWith("/")) path = `/${path}`;
  return path.replace(/\/+$/, "");
}

function splitSeoLanguage(pathname: string) {
  const path = normalizeSeoPath(pathname);
  if (path === "/en") {
    return { language: "en" as const, basePath: "/" };
  }
  if (path.startsWith("/en/")) {
    return {
      language: "en" as const,
      basePath: normalizeSeoPath(path.slice(3)),
    };
  }
  return { language: "zh" as const, basePath: path };
}

function canonicalPath(language: SeoLanguage, basePath: string) {
  const path = normalizeSeoPath(basePath);
  if (language !== "en") return path;
  return path === "/" ? "/en" : `/en${path}`;
}

function absoluteUrl(path: string) {
  return `${manifest.siteUrl.replace(/\/+$/, "")}${normalizeSeoPath(path)}`;
}

function localizedValue(value: SeoLocalizedText, language: SeoLanguage) {
  return language === "en" ? value.en : value.zh;
}

function htmlLanguage(language: SeoLanguage) {
  return language === "en" ? "en" : "zh-CN";
}

function resolveSeoRouteWithPage(pathname: string): ResolvedSeoRoute {
  const { language, basePath } = splitSeoLanguage(pathname);
  for (const page of manifest.pages) {
    if (normalizeSeoPath(page.path) !== basePath) continue;
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
    if (!page.aliases.some((alias) => normalizeSeoPath(alias) === basePath)) {
      continue;
    }
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

  const noindexPath = manifest.noindexPaths.some(
    (path) => normalizeSeoPath(path) === basePath,
  );
  const noindexPrefix = manifest.noindexPrefixes.some((prefix) => {
    const normalized = normalizeSeoPath(prefix);
    const value =
      prefix.trim().endsWith("/") && normalized !== "/"
        ? `${normalized}/`
        : normalized;
    return basePath.startsWith(value);
  });
  return {
    language,
    pageKey: null,
    noindex: true,
    notFound: !noindexPath && !noindexPrefix,
  };
}

export function resolveSeoRoute(pathname: string): SeoRouteResolution {
  const { page: _page, ...resolution } = resolveSeoRouteWithPage(pathname);
  return resolution;
}

export function localizePublicHref(
  href: string,
  language: Language,
  origin = typeof window === "undefined"
    ? manifest.siteUrl
    : window.location.origin,
) {
  if (href.startsWith("#") || href.startsWith("?")) return href;

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

export function getLanguageSwitchHref(
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

export function getRouteLanguage(pathname: string): SeoLanguage | null {
  const resolution = resolveSeoRouteWithPage(pathname);
  return resolution.page ? resolution.language : null;
}

export function buildSeoMetadata(
  pathname: string,
  host: string,
): BrowserSeoMetadata {
  const resolution = resolveSeoRouteWithPage(pathname);
  const robots =
    resolution.page && normalizeHost(host) === manifest.productionHost
      ? "index, follow"
      : "noindex, nofollow";
  const metadata: BrowserSeoMetadata = {
    language: resolution.language,
    title: brandTitle,
    description: localizedValue(brandDescription, resolution.language),
    robots,
  };
  if (!resolution.page || !resolution.canonicalPath) return metadata;

  const page = resolution.page;
  const canonical = absoluteUrl(resolution.canonicalPath);
  const zhUrl = absoluteUrl(canonicalPath("zh", page.path));
  const enUrl = absoluteUrl(canonicalPath("en", page.path));
  metadata.title = localizedValue(page.title, resolution.language);
  metadata.description = localizedValue(page.description, resolution.language);
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

function normalizeHost(host: string) {
  const value = host.trim().toLowerCase();
  if (!value || value.includes("://")) return "";
  try {
    return new URL(`http://${value}`).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function buildSchema(
  page: SeoManifestPage,
  language: SeoLanguage,
  metadata: BrowserSeoMetadata,
) {
  const canonical = metadata.canonical ?? manifest.siteUrl;
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
