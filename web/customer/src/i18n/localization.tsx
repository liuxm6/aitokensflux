import type { ReactNode } from "react";

import {
  interpolateTranslation,
  localeTranslations,
  translateLocale,
} from "./locales";

import type { Language, TranslationValues } from "../types";

let zhToTw = (value: string) => value;

let zhToTwReady = false;

export async function ensureTraditionalConverter() {
  if (zhToTwReady) return;
  const OpenCC = await import("opencc-js");
  zhToTw = OpenCC.Converter({ from: "cn", to: "tw" });
  zhToTwReady = true;
}

export function isEnglish(language: Language) {
  return language === "en";
}

export function isRussian(language: Language) {
  return language === "ru";
}

export function usesEnglishSource(language: Language) {
  return isEnglish(language) || isRussian(language);
}

export function isTraditionalChinese(language: Language) {
  return language === "zh-TW";
}

export function localizeZh(language: Language, value: string) {
  return isTraditionalChinese(language)
    ? zhToTw(value).replace(/登錄/g, "登入")
    : value;
}

export function localizeText(language: Language, zh: string, en: string) {
  if (isEnglish(language) || isRussian(language)) {
    return translateLocale(language, en);
  }
  const translated = localeTranslations[language][en];
  if (translated) return translated;
  return localizeZh(language, zh);
}

export function localizeKey(
  language: Language,
  key: string,
  values?: TranslationValues,
) {
  return interpolateTranslation(translateLocale(language, key), values);
}

export function localizeNode(language: Language, value: ReactNode): ReactNode {
  if (!isTraditionalChinese(language)) return value;
  if (typeof value === "string") return localizeZh(language, value);
  if (Array.isArray(value)) {
    return value.map((item) => localizeNode(language, item));
  }
  return value;
}

export function localizeRuNode(value: ReactNode): ReactNode {
  if (typeof value === "string") return translateLocale("ru", value);
  if (Array.isArray(value)) return value.map((item) => localizeRuNode(item));
  return value;
}

export function localizePairNode(
  language: Language,
  zh: ReactNode,
  en: ReactNode,
) {
  if (typeof zh === "string" && typeof en === "string") {
    return localizeText(language, zh, en);
  }
  if (isEnglish(language)) return en;
  if (isRussian(language)) return localizeRuNode(en);
  return localizeNode(language, zh);
}

export function localizeCopy<T extends Record<string, string>>(
  language: Language,
  copy: T,
) {
  return Object.fromEntries(
    Object.entries(copy).map(([key, value]) => [
      key,
      translateLocale(language, value),
    ]),
  ) as T;
}
