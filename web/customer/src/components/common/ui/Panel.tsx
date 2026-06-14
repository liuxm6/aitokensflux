import type { ReactNode } from "react";
import { useContext } from "react";
import { LanguageContext } from "../../../context/Language";
import { localizeKey } from "../../../i18n/localization";

export function Panel({
  titleId,
  children,
  action,
  className,
}: {
  titleId?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const { language } = useContext(LanguageContext);

  return (
    <section className={`panel${className ? ` ${className}` : ""}`}>
      {titleId ? (
        <div className="panel-h">
          <h2>{localizeKey(language, titleId)}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
