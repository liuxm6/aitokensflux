import type { LanguageOption } from "../types";
import type { Language } from "../types";
import { getRouteLanguage } from "../seo/metadata";

export const CUSTOMER_LANGUAGE_STORAGE_KEY = "customer-lang";
export const CUSTOMER_LANGUAGE_SOURCE_STORAGE_KEY = "customer-lang-source";
export const CUSTOMER_LANGUAGE_SOURCE_MANUAL = "manual";
export const INTERFACE_LANGUAGE_COOKIE_NAME = "i18next";

export const languageOptions: LanguageOption[] = [
  { value: "zh-TW", label: "繁體中文", shortLabel: "繁" },
  { value: "zh", label: "简体中文", shortLabel: "简" },
  { value: "en", label: "English", shortLabel: "EN" },
  { value: "ru", label: "Русский", shortLabel: "RU" },
];

export function normalizeCustomerLanguage(
  value?: string | null,
): Language | null {
  if (!value) return null;

  const normalized = value.trim().replace(/_/g, "-").toLowerCase();
  if (normalized === "zh-tw" || normalized.startsWith("zh-hant")) {
    return "zh-TW";
  }
  if (normalized === "zh" || normalized.startsWith("zh-")) return "zh";
  if (normalized === "ru" || normalized.startsWith("ru-")) return "ru";
  if (normalized === "en" || normalized.startsWith("en-")) return "en";
  if (
    normalized === "fr" ||
    normalized.startsWith("fr-") ||
    normalized === "ja" ||
    normalized.startsWith("ja-") ||
    normalized === "vi" ||
    normalized.startsWith("vi-")
  ) {
    return "en";
  }
  return null;
}

function normalizeAutoCustomerLanguage(value?: string | null): Language | null {
  const language = normalizeCustomerLanguage(value);
  return language === "zh" ? "zh-TW" : language;
}

export function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const cookie of cookies) {
    const [rawName, ...rawValueParts] = cookie.split("=");
    if (rawName?.trim() !== name) continue;
    return decodeURIComponent(rawValueParts.join("=").trim());
  }
  return null;
}

export function selectCustomerLanguageForPath(
  pathname: string,
  preferredLanguage: Language | null,
  isManualLanguage: boolean,
): Language {
  const routeLanguage = getRouteLanguage(pathname);
  if (routeLanguage === "en") return "en";
  if (routeLanguage === "zh") {
    if (
      isManualLanguage &&
      (preferredLanguage === "zh-TW" || preferredLanguage === "ru")
    ) {
      return preferredLanguage;
    }
    return "zh";
  }
  return preferredLanguage ?? "zh-TW";
}

export function getCustomerHtmlLanguage(language: Language) {
  if (language === "en") return "en";
  if (language === "zh") return "zh-CN";
  if (language === "zh-TW") return "zh-Hant";
  return "ru";
}

export function detectCustomerLanguage(
  pathname = window.location.pathname,
): Language {
  const storedLanguage = normalizeCustomerLanguage(
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(CUSTOMER_LANGUAGE_STORAGE_KEY),
  );
  const isManualLanguage =
    typeof window !== "undefined" &&
    window.localStorage.getItem(CUSTOMER_LANGUAGE_SOURCE_STORAGE_KEY) ===
      CUSTOMER_LANGUAGE_SOURCE_MANUAL;
  const routeLanguage = getRouteLanguage(pathname);
  if (routeLanguage) {
    return selectCustomerLanguageForPath(
      pathname,
      storedLanguage,
      isManualLanguage,
    );
  }
  if (isManualLanguage && storedLanguage) return storedLanguage;

  const edgeLanguage = normalizeAutoCustomerLanguage(
    readCookie(INTERFACE_LANGUAGE_COOKIE_NAME),
  );
  if (edgeLanguage) return edgeLanguage;
  if (storedLanguage) {
    return storedLanguage === "zh" ? "zh-TW" : storedLanguage;
  }

  const browserLanguage = normalizeAutoCustomerLanguage(
    typeof navigator === "undefined" ? null : navigator.language,
  );
  return browserLanguage ?? "zh-TW";
}
