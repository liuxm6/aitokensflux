import { useContext } from "react";
import { LanguageContext } from "../../context/Language";
import { localizeKey } from "../../i18n/localization";

export function SectionLabel({ id }: { id: string }) {
  const { language } = useContext(LanguageContext);

  return <h2 className="console-section-title">{localizeKey(language, id)}</h2>;
}
