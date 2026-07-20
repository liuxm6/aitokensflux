import { Check, ChevronDown } from "lucide-react";
import { useContext, useState } from "react";
import { DropdownMenu } from "../common/ui/DropdownMenu";
import { LanguageContext } from "../../context/Language";
import { languageOptions } from "../../i18n/languages";
import { localizeKey } from "../../i18n/localization";

export function LanguageButton() {
  const { language, setLanguage } = useContext(LanguageContext);
  const [open, setOpen] = useState(false);
  const selected =
    languageOptions.find((item) => item.value === language) ??
    languageOptions[0];

  return (
    <DropdownMenu
      className="lang-wrap"
      menuClassName="lang-menu"
      menuLabel={localizeKey(language, "Language")}
      open={open}
      triggerAriaLabel={localizeKey(language, "Language")}
      triggerClassName="lang-btn"
      triggerContent={
        <>
          <span className="lang-symbol">Aa</span>
          <span>{selected.shortLabel}</span>
          <ChevronDown size={13} />
        </>
      }
      onOpenChange={setOpen}
    >
      {languageOptions.map((item) => (
        <button
          className={`lang-option${item.value === language ? " active" : ""}`}
          key={item.value}
          type="button"
          onClick={() => setLanguage(item.value)}
        >
          <span>{item.label}</span>
          {item.value === language ? <Check size={18} /> : null}
        </button>
      ))}
    </DropdownMenu>
  );
}
