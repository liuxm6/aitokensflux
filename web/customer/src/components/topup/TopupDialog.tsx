import { Check, CircleDollarSign, LoaderCircle, Play, X } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { EmptyState } from "../common/EmptyState";
import { AuthContext } from "../../context/Auth";
import { LanguageContext, T } from "../../context/Language";
import { useToastMessage } from "../../context/Toast";
import {
  formatCurrencyAmount,
  formatQuotaMoney,
} from "../../helpers/format";
import { navigateTo } from "../../helpers/navigation";
import {
  getApiPaymentError,
  getDefaultTopupAmount,
  getPaymentLaunchMessage,
  getTopupAmountUnit,
  getTopupDiscountRate,
  getTopupLaunch,
  getTopupPaymentOptions,
  getTopupPresetAmounts,
  formatTopupAmount,
  formatTopupPaymentAmount,
  isApiSuccess,
  launchSubscriptionPayment,
  parseCreemProducts,
} from "../../helpers/payments";
import { localizeKey } from "../../i18n/localization";
import { PurchaseProgressDialog } from "./PurchaseProgressDialog";
import {
  calculateTopupAmount,
  fetchCustomerSelf,
  fetchCustomerStatus,
  fetchTopupInfo,
  redeemTopupCode,
  requestCreemTopupPayment,
  requestTopupPayment,
} from "../../services/customer-api";
import type {
  CreemProduct,
  CustomerStatus,
  PurchaseLaunch,
  PurchaseProgress,
  PurchaseStepKey,
  PurchaseStepState,
  TopupInfo,
  TopupPaymentOption,
  TopupPaymentProvider,
  TopupPaymentResponse,
} from "../../types";

export function TopupDialog({ onClose }: { onClose: () => void }) {
  const { user, setUser } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const [status, setStatus] = useState<CustomerStatus | null>(null);
  const [topupInfo, setTopupInfo] = useState<TopupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  useToastMessage(message);
  const [topupAmount, setTopupAmount] = useState(0);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [amountLoading, setAmountLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState("");
  const [redemptionCode, setRedemptionCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [topupProgress, setTopupProgress] = useState<PurchaseProgress | null>(
    null,
  );

  const paymentOptions = useMemo(
    () => getTopupPaymentOptions(topupInfo),
    [topupInfo],
  );
  const presetAmounts = useMemo(
    () => getTopupPresetAmounts(topupInfo),
    [topupInfo],
  );
  const creemProducts = useMemo(
    () => parseCreemProducts(topupInfo?.creem_products),
    [topupInfo?.creem_products],
  );
  const selectedPaymentMethod =
    paymentOptions.find((item) => item.id === selectedPaymentMethodId) ??
    paymentOptions[0];

  const loadTopupDialog = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [statusRes, selfRes, infoRes] = await Promise.all([
      fetchCustomerStatus(),
      fetchCustomerSelf(),
      fetchTopupInfo(),
    ]);
    if (statusRes.success && statusRes.data) setStatus(statusRes.data);
    if (selfRes.success && selfRes.data) setUser(selfRes.data);
    if (infoRes.success && infoRes.data) setTopupInfo(infoRes.data);
    if (!infoRes.success) {
      setMessage(
        infoRes.message ||
          localizeKey(language, "Failed to load top-up settings"),
      );
    } else {
      setMessage("");
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadTopupDialog();
  }, [user?.id]);

  useEffect(() => {
    if (!topupInfo) return;
    setTopupAmount((current) =>
      current > 0 ? current : getDefaultTopupAmount(topupInfo),
    );
  }, [topupInfo]);

  useEffect(() => {
    if (paymentOptions.length === 0) {
      setSelectedPaymentMethodId("");
      return;
    }
    if (!paymentOptions.some((item) => item.id === selectedPaymentMethodId)) {
      setSelectedPaymentMethodId(paymentOptions[0].id);
    }
  }, [paymentOptions, selectedPaymentMethodId]);

  useEffect(() => {
    if (!selectedPaymentMethod || topupAmount <= 0) {
      setPaymentAmount(null);
      setAmountLoading(false);
      return;
    }
    if (topupAmount < selectedPaymentMethod.minTopup) {
      setPaymentAmount(null);
      setAmountLoading(false);
      return;
    }

    let cancelled = false;
    setAmountLoading(true);
    const timeout = window.setTimeout(() => {
      void calculateTopupAmount(topupAmount, selectedPaymentMethod.provider)
        .then((response) => {
          if (cancelled) return;
          if (isApiSuccess(response) && response.data !== undefined) {
            const parsed = Number(response.data);
            setPaymentAmount(Number.isFinite(parsed) ? parsed : null);
          } else {
            setPaymentAmount(null);
          }
        })
        .finally(() => {
          if (!cancelled) setAmountLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [selectedPaymentMethod, topupAmount]);

  const refreshTopupAfterAction = async () => {
    const selfRes = await fetchCustomerSelf();
    if (selfRes.success && selfRes.data) setUser(selfRes.data);
  };

  const setTopupSteps = (
    steps: Partial<Record<PurchaseStepKey, PurchaseStepState>>,
  ) => {
    setTopupProgress((current) =>
      current
        ? {
            ...current,
            steps: {
              ...current.steps,
              ...steps,
            },
          }
        : current,
    );
  };

  const updateTopupProgress = (
    patch: Partial<Omit<PurchaseProgress, "steps">>,
  ) => {
    setTopupProgress((current) =>
      current
        ? {
            ...current,
            ...patch,
          }
        : current,
    );
  };

  const handleLaunchTopupPayment = (launch: PurchaseLaunch) => {
    setTopupSteps({ launch: "processing" });
    const launched = launchSubscriptionPayment(launch);
    const nextMessage = getPaymentLaunchMessage(launch, launched, language);
    setTopupSteps({ launch: "done" });
    updateTopupProgress({
      message: nextMessage,
      error: undefined,
      canClose: true,
    });
    setMessage(nextMessage);
    void refreshTopupAfterAction();
  };

  const startTopupPayment = async (
    title: string,
    provider: TopupPaymentProvider | "creem",
    request: () => Promise<TopupPaymentResponse>,
    loadingKey: string,
  ) => {
    if (!user?.id) {
      navigateTo("/sign-in");
      return;
    }
    setMessage("");
    setPaymentLoading(loadingKey);
    setTopupProgress({
      planName: title,
      steps: {
        order: "processing",
        paymentInfo: "pending",
        launch: "pending",
      },
      message: localizeKey(language, "Creating order..."),
      canClose: false,
    });

    try {
      setTopupSteps({ paymentInfo: "processing" });
      updateTopupProgress({
        message: localizeKey(language, "Getting payment details..."),
      });
      const response = await request();
      if (!isApiSuccess(response)) {
        const errorMessage = getApiPaymentError(response, language);
        setTopupSteps({ order: "error", paymentInfo: "pending" });
        updateTopupProgress({
          message: errorMessage,
          error: errorMessage,
          canClose: true,
        });
        setMessage(errorMessage);
        return;
      }

      const launch = getTopupLaunch(response, provider);
      if (!launch) {
        const errorMessage = localizeKey(
          language,
          "Payment link was not returned.",
        );
        setTopupSteps({
          order: "done",
          paymentInfo: "done",
          launch: "error",
        });
        updateTopupProgress({
          message: errorMessage,
          error: errorMessage,
          canClose: true,
        });
        setMessage(errorMessage);
        return;
      }

      setTopupSteps({
        order: "done",
        paymentInfo: "done",
        launch: "processing",
      });
      updateTopupProgress({
        message: localizeKey(
          language,
          "Payment details received. Launching payment...",
        ),
        launch,
      });
      handleLaunchTopupPayment(launch);
    } catch {
      const errorMessage = localizeKey(
        language,
        "Top-up flow failed. Please try again.",
      );
      setTopupSteps({ order: "error" });
      updateTopupProgress({
        message: errorMessage,
        error: errorMessage,
        canClose: true,
      });
      setMessage(errorMessage);
    } finally {
      setPaymentLoading("");
    }
  };

  const handleTopupPayment = async (option: TopupPaymentOption) => {
    const amount = Math.floor(Number(topupAmount || 0));
    if (amount < option.minTopup) {
      setMessage(
        localizeKey(language, "Minimum top-up amount is {{amount}}", {
          amount: option.minTopup,
        }),
      );
      return;
    }
    await startTopupPayment(
      `${option.name} · ${formatTopupAmount(amount, status)}`,
      option.provider,
      () => requestTopupPayment(amount, option),
      option.id,
    );
  };

  const handleCreemPayment = async (product: CreemProduct) => {
    const productId = product.productId || product.product_id || "";
    if (!productId) {
      setMessage(localizeKey(language, "Product is not configured."));
      return;
    }
    await startTopupPayment(
      product.name || "Creem",
      "creem",
      () => requestCreemTopupPayment(productId),
      `creem:${productId}`,
    );
  };

  const handleRedeemCode = async () => {
    const code = redemptionCode.trim();
    if (!code) {
      setMessage(localizeKey(language, "Enter a redemption code."));
      return;
    }
    setRedeeming(true);
    setMessage("");
    try {
      const response = await redeemTopupCode(code);
      if (!isApiSuccess(response)) {
        setMessage(getApiPaymentError(response, language, "Redemption failed"));
        return;
      }
      const quota = Number(response.data || 0);
      setMessage(
        localizeKey(language, "Redeemed {{amount}} successfully.", {
          amount: formatQuotaMoney(quota, status),
        }),
      );
      setRedemptionCode("");
      await refreshTopupAfterAction();
    } finally {
      setRedeeming(false);
    }
  };

  const paygLeft = formatQuotaMoney(user?.quota ?? 0, status);
  const complianceBlocked = topupInfo?.payment_compliance_confirmed === false;
  const paymentDisabled =
    complianceBlocked ||
    !selectedPaymentMethod ||
    topupAmount < selectedPaymentMethod.minTopup ||
    Boolean(paymentLoading);
  const discountRate = getTopupDiscountRate(topupInfo, topupAmount);
  const hasDiscount =
    discountRate > 0 && discountRate < 1 && paymentAmount !== null;
  const originalPaymentAmount = hasDiscount
    ? Number(paymentAmount) / discountRate
    : null;
  const hasCreemTopup = Boolean(
    topupInfo?.enable_creem_topup && creemProducts.length > 0,
  );
  const redemptionEnabled = topupInfo
    ? topupInfo.enable_redemption !== false
    : false;
  const hasAuxTopupActions =
    redemptionEnabled || Boolean(topupInfo?.topup_link);

  return (
    <>
      <div
        className="purchase-dialog topup-dialog"
        role="dialog"
        aria-modal="true"
      >
        <button
          aria-label={localizeKey(language, "Close")}
          className="purchase-backdrop as-button"
          type="button"
          onClick={onClose}
        />
        <div className="purchase-panel topup-dialog-panel">
          <button
            aria-label={localizeKey(language, "Close")}
            className="purchase-close"
            type="button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
          <div className="purchase-head topup-dialog-head">
            <h2>
              <T id="Top up" />
            </h2>
          </div>

          {loading ? (
            <EmptyState id="Loading top-up options" />
          ) : (
            <div className="topup-dialog-content">
              <div className="billing-balance topup-dialog-balance">
                <span>
                  <T id="Balance" />
                </span>
                <b className="mono">{paygLeft}</b>
              </div>
              <div className="topup-settlement-notice">
                <T id="CNY and USD are settled 1:1." />
              </div>

              {complianceBlocked ? (
                <div className="billing-alert">
                  <T id="Payment compliance has not been confirmed by admin yet." />
                </div>
              ) : null}

              <div
                className={`billing-form-grid topup-form-grid${
                  hasCreemTopup ? "" : " single"
                }`}
              >
                <div className="billing-main-form">
                  <label className="billing-field">
                    <span>
                      <T id="Top-up amount" />
                    </span>
                    <div className="billing-input-row">
                      <input
                        min={selectedPaymentMethod?.minTopup ?? 1}
                        step="1"
                        type="number"
                        value={topupAmount || ""}
                        onChange={(event) =>
                          setTopupAmount(Number(event.currentTarget.value || 0))
                        }
                      />
                      <b>{getTopupAmountUnit(status)}</b>
                    </div>
                  </label>

                  {presetAmounts.length > 0 ? (
                    <div className="billing-preset-grid">
                      {presetAmounts.slice(0, 8).map((amount) => {
                        const selected = amount === topupAmount;
                        const presetDiscount = getTopupDiscountRate(
                          topupInfo,
                          amount,
                        );
                        return (
                          <button
                            className={`billing-preset${selected ? " active" : ""}`}
                            key={amount}
                            type="button"
                            onClick={() => setTopupAmount(amount)}
                          >
                            <span>{formatTopupAmount(amount, status)}</span>
                            {presetDiscount > 0 && presetDiscount < 1 ? (
                              <small>{Math.round(presetDiscount * 100)}%</small>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  <div className="billing-pay-summary">
                    <span>
                      <T id="Estimated payment" />
                    </span>
                    <strong>
                      {amountLoading ? (
                        <T id="Calculating..." />
                      ) : (
                        formatTopupPaymentAmount(paymentAmount, status)
                      )}
                    </strong>
                    {hasDiscount && originalPaymentAmount !== null ? (
                      <small>
                        <T
                          id="Original {{amount}}"
                          values={{
                            amount: formatTopupPaymentAmount(
                              originalPaymentAmount,
                              status,
                            ),
                          }}
                        />
                      </small>
                    ) : null}
                  </div>

                  {paymentOptions.length > 0 ? (
                    <div className="billing-methods">
                      <span className="billing-section-label">
                        <T id="Payment method" />
                      </span>
                      <div className="billing-method-grid">
                        {paymentOptions.map((option) => {
                          const active =
                            option.id === selectedPaymentMethod?.id;
                          const belowMin = topupAmount < option.minTopup;
                          const processing = paymentLoading === option.id;
                          return (
                            <button
                              className={`billing-method ${
                                option.provider === "stripe" ? "stripe" : ""
                              }${active ? " active" : ""}`}
                              disabled={processing}
                              key={option.id}
                              type="button"
                              onClick={() =>
                                setSelectedPaymentMethodId(option.id)
                              }
                            >
                              {option.provider === "stripe" ? (
                                <>
                                  <span className="stripe-brand" aria-hidden>
                                    stripe
                                  </span>
                                  <span className="billing-method-copy">
                                    <span>{option.name}</span>
                                    <small className="billing-method-note">
                                      <T id="WeChat Pay / Alipay" />
                                    </small>
                                    {belowMin ? (
                                      <small className="billing-method-note warning">
                                        <T
                                          id="Min {{amount}}"
                                          values={{ amount: option.minTopup }}
                                        />
                                      </small>
                                    ) : null}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <CircleDollarSign size={16} />
                                  <span>{option.name}</span>
                                  {belowMin ? (
                                    <small>
                                      <T
                                        id="Min {{amount}}"
                                        values={{ amount: option.minTopup }}
                                      />
                                    </small>
                                  ) : null}
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        className="btn btn-flux btn-block"
                        disabled={paymentDisabled}
                        type="button"
                        onClick={() =>
                          selectedPaymentMethod
                            ? void handleTopupPayment(selectedPaymentMethod)
                            : undefined
                        }
                      >
                        {paymentLoading &&
                        paymentLoading === selectedPaymentMethod?.id ? (
                          <LoaderCircle className="spin" size={16} />
                        ) : (
                          <CircleDollarSign size={16} />
                        )}
                        <T id="Top up now" />
                      </button>
                    </div>
                  ) : (
                    <div className="billing-alert">
                      <T id="No online payment method is enabled." />
                    </div>
                  )}
                </div>

                {hasCreemTopup ? (
                  <div className="billing-side-form">
                    <div className="billing-side-section">
                      <span className="billing-section-label">Creem</span>
                      <div className="billing-creem-grid">
                        {creemProducts.map((product) => {
                          const productId =
                            product.productId ||
                            product.product_id ||
                            product.name ||
                            "";
                          return (
                            <button
                              className="billing-creem-product"
                              disabled={
                                complianceBlocked ||
                                paymentLoading === `creem:${productId}`
                              }
                              key={productId}
                              type="button"
                              onClick={() => void handleCreemPayment(product)}
                            >
                              <strong>{product.name || "Creem"}</strong>
                              <span>
                                {formatCurrencyAmount(
                                  Number(product.price || 0),
                                  product.currency || "USD",
                                )}
                              </span>
                              {product.quota ? (
                                <small>
                                  {formatQuotaMoney(product.quota, status)}
                                </small>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {hasAuxTopupActions ? (
                <div className="topup-dialog-tools">
                  {redemptionEnabled ? (
                    <div className="billing-redemption-row topup-redemption-inline">
                      <span className="billing-section-label">
                        <T id="Redemption code" />
                      </span>
                      <input
                        placeholder={localizeKey(language, "Enter code")}
                        value={redemptionCode}
                        onChange={(event) =>
                          setRedemptionCode(event.currentTarget.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !complianceBlocked) {
                            void handleRedeemCode();
                          }
                        }}
                      />
                      <button
                        className="btn btn-ghost"
                        disabled={redeeming || complianceBlocked}
                        type="button"
                        onClick={() => void handleRedeemCode()}
                      >
                        {redeeming ? (
                          <LoaderCircle className="spin" size={15} />
                        ) : (
                          <Check size={15} />
                        )}
                        <T id="Redeem" />
                      </button>
                    </div>
                  ) : null}
                  {topupInfo?.topup_link ? (
                    <button
                      className="billing-link-button"
                      type="button"
                      onClick={() =>
                        window.open(topupInfo.topup_link, "_blank")
                      }
                    >
                      <Play size={15} />
                      <T id="Open external top-up link" />
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
      {topupProgress ? (
        <PurchaseProgressDialog
          progress={topupProgress}
          onClose={() => setTopupProgress(null)}
          onLaunch={handleLaunchTopupPayment}
        />
      ) : null}
    </>
  );
}
