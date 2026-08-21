import { ArrowRight, Check, Copy } from "lucide-react";
import { useContext } from "react";
import { LanguageContext } from "../../context/Language";
import { localizeKey } from "../../i18n/localization";

export function BaseUrlSwapRow({
  copied,
  label,
  from,
  onCopy,
  to,
}: {
  copied: boolean;
  label: string;
  from: string;
  onCopy: () => void;
  to: string;
}) {
  const { language } = useContext(LanguageContext);

  return (
    <div className="base-url-row">
      <strong className="mono">{label}</strong>
      <span className="mono muted-url">{from}</span>
      <ArrowRight size={16} />
      <button
        aria-label={localizeKey(language, copied ? "Copied" : "Copy")}
        className="mono base-url-copy"
        type="button"
        onClick={onCopy}
      >
        <span>{to}</span>
        {copied ? <Check size={15} /> : <Copy size={15} />}
      </button>
    </div>
  );
}
