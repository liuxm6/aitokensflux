import type { ReactNode } from "react";
import { useContext } from "react";
import { LanguageContext } from "../../context/Language";
import { localizeKey } from "../../i18n/localization";

export function ConsolePageHeader({
  titleId,
  descriptionId,
  action,
}: {
  titleId: string;
  descriptionId?: string;
  action?: ReactNode;
}) {
  const { language } = useContext(LanguageContext);

  return (
    <header className="console-page-header">
      <div className="console-page-heading">
        <h1 className="console-page-title">{localizeKey(language, titleId)}</h1>
        {descriptionId ? <p>{localizeKey(language, descriptionId)}</p> : null}
      </div>
      {action ? <div className="console-page-actions">{action}</div> : null}
    </header>
  );
}
