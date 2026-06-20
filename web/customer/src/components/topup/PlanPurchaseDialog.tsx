import { Calendar, CircleDollarSign, X } from "lucide-react";
import { useContext, useEffect, useMemo } from "react";
import { LanguageContext, T } from "../../context/Language";
import { formatQuotaMoney } from "../../helpers/format";
import { getEpayMethods } from "../../helpers/payments";
import { localizeKey, localizeText } from "../../i18n/localization";
import type {
  CustomerPricePlan,
  CustomerStatus,
  PurchasePaymentProvider,
  TopupInfo,
} from "../../types";

function StripeWordmark() {
  return (
    <svg
      aria-hidden="true"
      className="stripe-wordmark"
      focusable="false"
      viewBox="0 0 76 32"
    >
      <rect height="32" rx="8" width="76" />
      <text x="38" y="21">
        stripe
      </text>
    </svg>
  );
}

export function PlanPurchaseDialog({
  plan,
  status,
  topupInfo,
  userQuota,
  purchaseCount,
  selectedEpayMethod,
  onSelectedEpayMethodChange,
  onClose,
  onPay,
}: {
  plan: CustomerPricePlan;
  status: CustomerStatus | null;
  topupInfo: TopupInfo | null;
  userQuota: number;
  purchaseCount: number;
  selectedEpayMethod: string;
  onSelectedEpayMethodChange: (method: string) => void;
  onClose: () => void;
  onPay: (
    provider: PurchasePaymentProvider,
    paymentMethod?: string,
  ) => void | Promise<void>;
}) {
  const { language } = useContext(LanguageContext);
  const epayMethods = useMemo(() => getEpayMethods(topupInfo), [topupInfo]);
  const balanceCost = Math.max(0, plan.requiredQuota);
  const availableQuota = Math.max(0, Number(userQuota || 0));
  const allowBalancePay = plan.allowBalancePay !== false;
  const balanceEnough = availableQuota >= balanceCost;
  const purchaseLimit = Number(plan.maxPurchasePerUser || 0);
  const purchaseLimitReached =
    purchaseLimit > 0 && purchaseCount >= purchaseLimit;
  const hasStripe = Boolean(
    topupInfo?.enable_stripe_topup && plan.stripePriceId,
  );
  const hasCreem = Boolean(
    topupInfo?.enable_creem_topup && plan.creemProductId,
  );
  const hasWaffoPancake = Boolean(
    topupInfo?.enable_waffo_pancake_topup && plan.waffoPancakeProductId,
  );
  const hasEpay = Boolean(topupInfo?.enable_online_topup && epayMethods.length);
  const hasOnlinePayment = hasStripe || hasCreem || hasWaffoPancake || hasEpay;
  const resetIsNever = plan.resetLabelEn === "No automatic reset";

  useEffect(() => {
    if (!selectedEpayMethod && epayMethods[0]?.type) {
      onSelectedEpayMethodChange(epayMethods[0].type);
    }
  }, [epayMethods, onSelectedEpayMethodChange, selectedEpayMethod]);

  const payButtonDisabled = purchaseLimitReached;

  return (
    <div className="purchase-dialog" role="dialog" aria-modal="true">
      <button
        aria-label={localizeKey(language, "Close")}
        className="purchase-backdrop as-button"
        type="button"
        onClick={onClose}
      />
      <div className="purchase-panel plan-purchase-panel">
        <button
          aria-label={localizeKey(language, "Close")}
          className="purchase-close"
          type="button"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <div className="purchase-head">
          <span className="purchase-kicker">{plan.name}</span>
          <h2>
            <T id="Purchase subscription" />
          </h2>
          <p>
            <T id="Confirm the plan and choose a payment method." />
          </p>
        </div>

        <div className="plan-purchase-summary">
          <div className="plan-purchase-title-row">
            <span>
              <T id="Plan name" />
            </span>
            <strong>{plan.name}</strong>
          </div>
          <div className="plan-purchase-meta">
            <span>
              <Calendar size={14} />
              {localizeText(language, plan.periodLabelZh, plan.periodLabelEn)}
            </span>
            {!resetIsNever ? (
              <span>
                {localizeText(language, plan.resetLabelZh, plan.resetLabelEn)}
              </span>
            ) : null}
            {plan.upgradeGroup ? <span>{plan.upgradeGroup}</span> : null}
          </div>
          <div className="plan-purchase-amount-grid">
            <div className="plan-purchase-amount-card due">
              <span>
                <T id="Amount due" />
              </span>
              <b>{plan.price}</b>
            </div>
            <div className="plan-purchase-amount-card received">
              <span>
                <T id="Received amount" />
              </span>
              <b>
                {localizeText(language, plan.quotaLabelZh, plan.quotaLabelEn)}
              </b>
            </div>
          </div>
        </div>
        <div className="purchase-settlement-notice">
          <T id="CNY and USD are settled 1:1." />
        </div>

        {purchaseLimitReached ? (
          <div className="plan-purchase-alert warning">
            <T
              id="Purchase limit reached ({{current}}/{{limit}})"
              values={{ current: purchaseCount, limit: purchaseLimit }}
            />
          </div>
        ) : null}

        <div className="plan-purchase-methods">
          {allowBalancePay ? (
            <div className="plan-purchase-payment-section">
              <div className="plan-purchase-method-title">
                <T id="Balance payment" />
              </div>
              <div className="balance-payment-box">
                <div>
                  <span>
                    <T id="Amount due" />
                  </span>
                  <strong>{formatQuotaMoney(balanceCost, status)}</strong>
                </div>
                <div>
                  <span>
                    <T id="Available" />
                  </span>
                  <strong>{formatQuotaMoney(availableQuota, status)}</strong>
                </div>
                {!balanceEnough ? (
                  <p>
                    <T id="Insufficient balance." />
                  </p>
                ) : null}
                <button
                  className="btn btn-soft btn-block"
                  disabled={payButtonDisabled || !balanceEnough}
                  type="button"
                  onClick={() => void onPay("balance")}
                >
                  <CircleDollarSign size={16} />
                  <T id="Pay with balance" />
                </button>
              </div>
            </div>
          ) : null}

          <div className="plan-purchase-payment-section">
            <div className="plan-purchase-method-title">
              <T id="Online payment" />
            </div>
            {hasOnlinePayment ? (
              <div className="payment-method-grid">
                {hasStripe ? (
                  <button
                    aria-label="Stripe"
                    className="payment-method-button stripe"
                    disabled={payButtonDisabled}
                    type="button"
                    onClick={() => void onPay("stripe")}
                  >
                    <StripeWordmark />
                  </button>
                ) : null}
                {hasCreem ? (
                  <button
                    className="payment-method-button"
                    disabled={payButtonDisabled}
                    type="button"
                    onClick={() => void onPay("creem")}
                  >
                    <CircleDollarSign size={16} />
                    Creem
                  </button>
                ) : null}
                {hasWaffoPancake ? (
                  <button
                    className="payment-method-button"
                    disabled={payButtonDisabled}
                    type="button"
                    onClick={() => void onPay("waffoPancake")}
                  >
                    <CircleDollarSign size={16} />
                    Waffo Pancake
                  </button>
                ) : null}
                {hasEpay ? (
                  <div className="epay-payment-row">
                    <select
                      className="payment-method-select"
                      disabled={payButtonDisabled}
                      value={selectedEpayMethod}
                      onChange={(event) =>
                        onSelectedEpayMethodChange(event.currentTarget.value)
                      }
                    >
                      {epayMethods.map((method) => (
                        <option key={method.type} value={method.type}>
                          {method.name || method.type}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn btn-dark"
                      disabled={payButtonDisabled || !selectedEpayMethod}
                      type="button"
                      onClick={() => void onPay("epay", selectedEpayMethod)}
                    >
                      <T id="Pay" />
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="plan-purchase-alert">
                <T id="No online payment method is available." />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
