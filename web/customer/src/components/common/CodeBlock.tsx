import { Check, Copy } from "lucide-react";
import type { ReactNode } from "react";
import { useContext } from "react";
import { LanguageContext } from "../../context/Language";
import { useCopyFeedback } from "../../hooks/useCopyFeedback";
import { localizeKey } from "../../i18n/localization";

export function CodeBlock({
  value,
  children,
}: {
  value: string;
  children?: ReactNode;
}) {
  const { language } = useContext(LanguageContext);
  const [copied, markCopied] = useCopyFeedback(false, 1200);

  const copyValue = () => {
    void navigator.clipboard?.writeText(value);
    markCopied(true);
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
