import { useContext, useEffect } from "react";
import { LanguageContext } from "../../context/Language";
import { getCustomerHtmlLanguage } from "../../i18n/languages";
import { buildSeoMetadata } from "../../seo/metadata";

function upsertMeta(
  attribute: "name" | "property",
  key: string,
  content?: string,
) {
  const selector = `meta[${attribute}="${key}"]`;
  const matches = Array.from(document.head.querySelectorAll(selector));
  if (!content) {
    matches.forEach((element) => element.remove());
    return;
  }

  const element = matches.shift() ?? document.createElement("meta");
  element.setAttribute(attribute, key);
  element.setAttribute("content", content);
  if (!element.parentNode) document.head.append(element);
  matches.forEach((duplicate) => duplicate.remove());
}

function upsertLink(rel: string, href?: string, hrefLang?: string) {
  const selector = hrefLang
    ? `link[rel="${rel}"][hreflang="${hrefLang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  const matches = Array.from(document.head.querySelectorAll(selector));
  if (!href) {
    matches.forEach((element) => element.remove());
    return;
  }

  const element = matches.shift() ?? document.createElement("link");
  element.setAttribute("rel", rel);
  element.setAttribute("href", href);
  if (hrefLang) element.setAttribute("hreflang", hrefLang);
  if (!element.parentNode) document.head.append(element);
  matches.forEach((duplicate) => duplicate.remove());
}

export function Seo({ pathname }: { pathname: string }) {
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    const metadata = buildSeoMetadata(pathname, window.location.host);
    document.title = metadata.title;
    document.documentElement.lang = getCustomerHtmlLanguage(language);

    upsertMeta("name", "description", metadata.description);
    upsertMeta("name", "robots", metadata.robots);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:title", metadata.title);
    upsertMeta("property", "og:description", metadata.description);
    upsertMeta("property", "og:url", metadata.canonical);
    upsertMeta("property", "og:image", metadata.image);
    upsertMeta(
      "property",
      "og:locale",
      metadata.language === "en" ? "en_US" : "zh_CN",
    );
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", metadata.title);
    upsertMeta("name", "twitter:description", metadata.description);
    upsertMeta("name", "twitter:image", metadata.image);

    upsertLink("canonical", metadata.canonical);
    upsertLink("alternate", metadata.alternates?.["zh-CN"], "zh-CN");
    upsertLink("alternate", metadata.alternates?.en, "en");
    upsertLink("alternate", metadata.alternates?.["x-default"], "x-default");

    const scripts = Array.from(
      document.head.querySelectorAll<HTMLScriptElement>(
        "script[data-customer-seo-jsonld]",
      ),
    );
    if (!metadata.schema) {
      scripts.forEach((script) => script.remove());
      return;
    }

    const script = scripts.shift() ?? document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-customer-seo-jsonld", "");
    script.textContent = JSON.stringify(metadata.schema);
    if (!script.parentNode) document.head.append(script);
    scripts.forEach((duplicate) => duplicate.remove());
  }, [language, pathname]);

  return null;
}
