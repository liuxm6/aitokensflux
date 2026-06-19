import { Check } from "lucide-react";
import { useContext } from "react";
import { LanguageContext } from "../../context/Language";
import { localizeKey, localizeText } from "../../i18n/localization";
import type { CustomerPricePlan } from "../../types";
import { AppLink } from "../common/AppLink";

export function PriceCard({
  plan,
  onBuy,
  disabled = false,
  disabledLabelId,
  disabledLabelZh,
  disabledLabelEn,
}: {
  plan: CustomerPricePlan;
  onBuy?: (plan: CustomerPricePlan) => void;
  disabled?: boolean;
  disabledLabelId?: string;
  disabledLabelZh?: string;
  disabledLabelEn?: string;
}) {
  const { language } = useContext(LanguageContext);
  const features = plan.featuresZh.map((feature, index) =>
    localizeText(language, feature, plan.featuresEn[index] ?? feature),
  );
  const description = plan.descriptionZh
    ? localizeText(
        language,
        plan.descriptionZh,
        plan.descriptionEn ?? plan.descriptionZh,
      )
    : plan.hideDescription
      ? ""
      : plan.rate;
  const priceLabel = plan.priceZh
    ? localizeText(language, plan.priceZh, plan.priceEn ?? plan.priceZh)
    : plan.price;
  const receivedAmount = localizeText(
    language,
    plan.quotaLabelZh,
    plan.quotaLabelEn,
  );
  const promoZh = plan.promoZh?.trim();
  const promoEn = plan.promoEn?.trim() || promoZh;
  const promoLabel =
    promoZh && promoEn
      ? localizeText(language, `限时 ${promoZh}`, `Limited time ${promoEn}`)
      : "";
  const showSaving = Boolean(
    plan.saveZh.trim() && (!promoZh || plan.saveZh.trim() !== promoZh),
  );
  const showMeta = showSaving || Boolean(plan.originalPriceZh);
  const buttonClass = "btn btn-dark price-cta";

  return (
    <div
      className={`price${plan.tint ? ` ${plan.tint}` : ""}${
        plan.variant ? ` plan-${plan.variant}` : ""
      }${promoLabel ? " has-promo" : ""}`}
    >
      {promoLabel ? <div className="price-promo">{promoLabel}</div> : null}
      <div className="price-head">
        <div className="tag">{plan.name}</div>
      </div>
      <div className="amt">
        {priceLabel}
        {plan.hideSuffix ? null : (
          <small>/{localizeText(language, plan.suffixZh, plan.suffixEn)}</small>
        )}
      </div>
      <div className="price-received">
        <span>{localizeKey(language, "Received amount")}</span>
        <b>{receivedAmount}</b>
      </div>
      {showMeta ? (
        <div className="price-meta">
          {showSaving ? (
            <div className="price-saving">
              {localizeText(language, plan.saveZh, plan.saveEn)}
            </div>
          ) : null}
          {plan.originalPriceZh ? (
            <div className="price-original">
              {localizeText(
                language,
                plan.originalPriceZh,
                plan.originalPriceEn ?? plan.originalPriceZh,
              )}
            </div>
          ) : null}
        </div>
      ) : null}
      {description ? <div className="equiv">{description}</div> : null}
      <ul>
        {features.map((feature, index) => (
          <li key={`${feature}-${index}`}>
            <Check size={16} />
            {feature}
          </li>
        ))}
      </ul>
      {onBuy ? (
        <button
          className={buttonClass}
          disabled={disabled}
          type="button"
          onClick={() => onBuy(plan)}
        >
          {disabled && disabledLabelId
            ? localizeKey(language, disabledLabelId)
            : disabled
              ? disabledLabelEn
                ? localizeText(
                    language,
                    disabledLabelZh ?? disabledLabelEn,
                    disabledLabelEn,
                  )
                : localizeKey(language, "Unavailable")
              : localizeText(language, plan.ctaZh, plan.ctaEn)}
        </button>
      ) : (
        <AppLink className={buttonClass} href="/subscribe">
          {localizeText(language, plan.ctaZh, plan.ctaEn)}
        </AppLink>
      )}
    </div>
  );
}
