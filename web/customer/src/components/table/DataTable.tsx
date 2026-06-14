import { useContext } from "react";
import type { ReactNode } from "react";
import { LanguageContext } from "../../context/Language";
import { localizeKey } from "../../i18n/localization";

export function DataTable({
  className,
  headers,
  rows,
  rowKeys,
}: {
  className?: string;
  headers: string[];
  rows: ReactNode[][];
  rowKeys?: Array<number | string>;
}) {
  const { language } = useContext(LanguageContext);

  return (
    <div className={["table-wrap", className].filter(Boolean).join(" ")}>
      <table className="table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{localizeKey(language, header)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowKeys?.[rowIndex] ?? rowIndex}>
              {row.map((cell, index) => (
                <td key={`${headers[index] ?? "cell"}-${index}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
