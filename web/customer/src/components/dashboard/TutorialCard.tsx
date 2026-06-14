import { ChevronLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useContext } from "react";
import { AppLink } from "../common/AppLink";
import { LanguageContext } from "../../context/Language";
import { localizeKey } from "../../i18n/localization";

export function TutorialCard({
  icon: Icon,
  titleId,
  subtitleId,
  href,
}: {
  icon: LucideIcon;
  titleId: string;
  subtitleId: string;
  href: string;
}) {
  const { language } = useContext(LanguageContext);

  return (
    <AppLink className="tutorial-card" href={href}>
      <span className="line-icon">
        <Icon size={22} />
      </span>
      <span>
        <strong>{localizeKey(language, titleId)}</strong>
        <small>{localizeKey(language, subtitleId)}</small>
      </span>
      <ChevronLeft className="tutorial-arrow" size={18} />
    </AppLink>
  );
}
