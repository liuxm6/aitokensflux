import { useContext } from "react";
import { LanguageContext } from "../../context/Language";
import { localizeKey } from "../../i18n/localization";

export function RewardPair({
  labelAId,
  valueA,
  labelBId,
  valueB,
  accent = false,
}: {
  labelAId: string;
  valueA: string;
  labelBId: string;
  valueB: string;
  accent?: boolean;
}) {
  const { language } = useContext(LanguageContext);

  return (
    <div className="reward-pair">
      <div>
        <span>{localizeKey(language, labelAId)}</span>
        <b className="mono">{valueA}</b>
      </div>
      <div>
        <span>{localizeKey(language, labelBId)}</span>
        <b className={`mono${accent ? " amber" : ""}`}>{valueB}</b>
      </div>
    </div>
  );
}
