import { useContext } from "react";
import { LanguageContext } from "../../context/Language";
import { localizeKey, localizePairNode } from "../../i18n/localization";
import type { TranslationKeyProps } from "../../types";

type EmptyStateProps = TranslationKeyProps | { zh: string; en: string };

export function EmptyState(props: EmptyStateProps) {
  const { language } = useContext(LanguageContext);

  return (
    <div className="empty">
      {"id" in props
        ? localizeKey(language, props.id, props.values)
        : localizePairNode(language, props.zh, props.en)}
    </div>
  );
}
