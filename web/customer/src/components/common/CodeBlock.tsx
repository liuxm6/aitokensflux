import { Check, Copy } from "lucide-react";
import type { ReactNode } from "react";
import { useContext, useState } from "react";
import { LanguageContext } from "../../context/Language";
import { localizeKey } from "../../i18n/localization";

export function CodeBlock({
  value,
  children,
}: {
  value: string;
  children?: ReactNode;
}) {
  const { language } = useContext(LanguageContext);
  const [copied, setCopied] = useState(false);

  const copyValue = () => {
    void navigator.clipboard?.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <pre className="code">
      <button
        aria-label={localizeKey(language, "Copy")}
        className="copy"
        type="button"
        onClick={copyValue}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <code>{children ?? value}</code>
    </pre>
  );
}
