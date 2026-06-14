import type { Language } from "../../types";
import type { TranslationValues } from "../../types";
import { enTranslations } from "./en";
import { ruTranslations, translateRu } from "./ru";
import { zhTWTranslations } from "./zh-TW";
import { zhTranslations } from "./zh";

export type CustomerTranslationMap = Record<string, string>;

export const localeTranslations: Record<Language, CustomerTranslationMap> = {
  en: enTranslations,
  zh: zhTranslations,
  "zh-TW": zhTWTranslations,
  ru: ruTranslations,
};

export function translateLocale(language: Language, key: string) {
  if (language === "ru") return translateRu(key);
  return localeTranslations[language][key] ?? key;
}

export function interpolateTranslation(
  value: string,
  values?: TranslationValues,
) {
  if (!values) return value;
  return Object.entries(values).reduce(
    (text, [key, replacement]) =>
      text.replaceAll(`{{${key}}}`, String(replacement)),
    value,
  );
}
