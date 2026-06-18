import type { LanguageOption } from "../types";
import type { Language } from "../types";

export const CUSTOMER_LANGUAGE_STORAGE_KEY = "customer-lang";
export const CUSTOMER_LANGUAGE_SOURCE_STORAGE_KEY = "customer-lang-source";
export const CUSTOMER_LANGUAGE_SOURCE_MANUAL = "manual";
export const INTERFACE_LANGUAGE_COOKIE_NAME = "i18next";

export const languageOptions: LanguageOption[] = [
  { value: "zh", label: "简体中文", shortLabel: "简" },
  { value: "zh-TW", label: "繁體中文", shortLabel: "繁" },
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

export function readCookie(name: string) {
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const cookie of cookies) {
    const [rawName, ...rawValueParts] = cookie.split("=");
    if (rawName?.trim() !== name) continue;
    return decodeURIComponent(rawValueParts.join("=").trim());
  }
  return null;
}

export function detectCustomerLanguage(): Language {
  const storedLanguage = normalizeCustomerLanguage(
    window.localStorage.getItem(CUSTOMER_LANGUAGE_STORAGE_KEY),
  );
  const isManualLanguage =
    window.localStorage.getItem(CUSTOMER_LANGUAGE_SOURCE_STORAGE_KEY) ===
    CUSTOMER_LANGUAGE_SOURCE_MANUAL;
  if (isManualLanguage && storedLanguage) return storedLanguage;

  const edgeLanguage = normalizeCustomerLanguage(
    readCookie(INTERFACE_LANGUAGE_COOKIE_NAME),
  );
  if (edgeLanguage) return edgeLanguage;
  if (storedLanguage) return storedLanguage;

  const browserLanguage = normalizeCustomerLanguage(navigator.language);
  return browserLanguage ?? "zh";
}
