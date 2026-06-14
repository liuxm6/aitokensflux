import { Check, CircleDollarSign } from "lucide-react";
import { useMemo } from "react";
import { T } from "../../context/Language";
import {
  formatTopupAmount,
  getDefaultTopupAmount,
  getTopupPresetAmounts,
} from "../../helpers/payments";
import type { CustomerStatus, TopupInfo } from "../../types";

export function PaygTopupSection({
  status,
  topupInfo,
  onTopup,
}: {
  status: CustomerStatus | null;
  topupInfo: TopupInfo | null;
  onTopup: () => void;
}) {
  const presetAmounts = useMemo(
    () => (topupInfo ? getTopupPresetAmounts(topupInfo).slice(0, 4) : []),
    [topupInfo],
  );
  const defaultAmount = topupInfo ? getDefaultTopupAmount(topupInfo) : 0;

  return (
    <div className="payg-service-section">
      <div className="payg-service-divider">
        <span>
          <T id="Pay-as-you-go service" />
        </span>
      </div>
      <div className="payg-service-card">
        <div className="payg-service-main">
          <h2>
            <T id="AI Coding pay-as-you-go service" />
          </h2>
          <div className="payg-service-amount">
            {defaultAmount > 0 ? (
              <T
                id="From {{amount}}"
                values={{ amount: formatTopupAmount(defaultAmount, status) }}
              />
            ) : (
              <T id="Custom amount top-up" />
            )}
          </div>
          <p>
            <T id="Top up credits anytime. Use the same instant top-up flow as the dashboard." />
          </p>
          {presetAmounts.length > 0 ? (
            <div className="payg-service-presets">
              <span>
                <T id="Common top-up amounts" />
              </span>
              <div>
                {presetAmounts.map((amount) => (
                  <b key={amount}>{formatTopupAmount(amount, status)}</b>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <div className="payg-service-features">
          {[
            "Credits never expire and can be used anytime",
            "Use as much as you need without renewal",
            "Works with Claude Code / Codex",
            "Add balance alongside Pro / Max / Ultra plans",
            "Choose amount and payment method after signing in",
          ].map((feature) => (
            <div className="payg-service-feature" key={feature}>
              <Check size={16} />
              <T id={feature} />
            </div>
          ))}
        </div>
        <div className="payg-service-action">
          <button className="btn btn-dark" type="button" onClick={onTopup}>
            <CircleDollarSign size={16} />
            <T id="Top up now" />
          </button>
        </div>
      </div>
    </div>
  );
}
