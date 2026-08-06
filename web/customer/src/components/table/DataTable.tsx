import { useContext, useId } from "react";
import type { ReactNode } from "react";
import { LanguageContext } from "../../context/Language";
import { localizeKey } from "../../i18n/localization";

export function DataTable({
  className,
  caption,
  captionId,
  headers,
  mobileLabels,
  numericColumns,
  rows,
  rowKeys,
}: {
  className?: string;
  caption?: string;
  captionId?: string;
  headers: string[];
  mobileLabels?: string[];
  numericColumns?: number[];
  rows: ReactNode[][];
  rowKeys?: Array<number | string>;
}) {
  const { language } = useContext(LanguageContext);
  const generatedCaptionId = useId();
  const resolvedCaptionId = captionId ?? generatedCaptionId;
  const localizedCaption = caption
    ? localizeKey(language, caption)
    : localizeKey(language, "Data table");

  return (
    <div
      aria-label={caption ? undefined : localizedCaption}
      aria-labelledby={caption ? resolvedCaptionId : undefined}
      className={["table-wrap", className].filter(Boolean).join(" ")}
      role="region"
      tabIndex={0}
    >
      <table className="table">
        <caption className="sr-only" id={resolvedCaptionId}>
          {localizedCaption}
        </caption>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col">
                {localizeKey(language, header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowKeys?.[rowIndex] ?? rowIndex}>
              {row.map((cell, index) => (
                <td
                  data-label={localizeKey(
                    language,
                    mobileLabels?.[index] ?? headers[index] ?? "",
                  )}
                  data-numeric={numericColumns?.includes(index) || undefined}
                  key={`${headers[index] ?? "cell"}-${index}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
