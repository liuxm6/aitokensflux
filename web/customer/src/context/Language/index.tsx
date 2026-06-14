import { createContext, type ReactNode, useContext } from "react";
import { localizeKey, localizePairNode } from "../../i18n/localization";
import type { DualTextProps, Language, TranslationKeyProps } from "../../types";

export const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  translationVersion: number;
}>({
  language: "zh",
  setLanguage: () => undefined,
  translationVersion: 0,
});

export function T(props: DualTextProps | TranslationKeyProps) {
  const { language } = useContext(LanguageContext);
  if ("id" in props)
    return <>{localizeKey(language, props.id, props.values)}</>;
  return <>{localizePairNode(language, props.zh, props.en)}</>;
}

export type LocalizedNode = ReactNode;
