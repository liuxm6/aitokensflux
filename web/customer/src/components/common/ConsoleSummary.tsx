import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useContext } from "react";
import { LanguageContext } from "../../context/Language";
import { localizeKey } from "../../i18n/localization";

type ConsoleSummaryItem = {
  labelId: string;
  value: ReactNode;
  hintId?: string;
  icon?: LucideIcon;
  tone?: "accent" | "neutral";
};

export function ConsoleSummary({
  items,
  labelId = "Account overview",
}: {
  items: ConsoleSummaryItem[];
  labelId?: string;
}) {
  const { language } = useContext(LanguageContext);

  return (
    <ul aria-label={localizeKey(language, labelId)} className="console-summary">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li
            className={`console-summary-item ${item.tone ?? "neutral"}`}
            key={item.labelId}
          >
            <div className="console-summary-label">
              {Icon ? (
                <span className="console-summary-icon" aria-hidden="true">
                  <Icon size={17} />
                </span>
              ) : null}
              <span>{localizeKey(language, item.labelId)}</span>
            </div>
            <strong className="console-summary-value">{item.value}</strong>
            {item.hintId ? (
              <span className="console-summary-hint">
                {localizeKey(language, item.hintId)}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
