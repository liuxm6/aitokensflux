import { Check, ChevronDown } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { LanguageContext } from "../../context/Language";
import { languageOptions } from "../../i18n/languages";

export function LanguageButton() {
  const { language, setLanguage } = useContext(LanguageContext);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected =
    languageOptions.find((item) => item.value === language) ??
    languageOptions[0];

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div className="lang-wrap" ref={menuRef}>
      <button
        className="lang-btn"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="lang-symbol">Aa</span>
        <span>{selected.shortLabel}</span>
        <ChevronDown size={13} />
      </button>
      {open ? (
        <div className="lang-menu" role="menu">
          {languageOptions.map((item) => (
            <button
              className={`lang-option${
                item.value === language ? " active" : ""
              }`}
              key={item.value}
              type="button"
              onClick={() => {
                setLanguage(item.value);
                setOpen(false);
              }}
            >
              <span>{item.label}</span>
              {item.value === language ? <Check size={18} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
