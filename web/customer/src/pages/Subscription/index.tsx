import {
  Calendar,
  Check,
  CircleDollarSign,
  LoaderCircle,
  Play,
  X,
} from "lucide-react";
import type { ComponentType } from "react";
import { useContext, useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/common/EmptyState";
import { Pill } from "../../components/common/Pill";
import { Footer } from "../../components/layout/Footer";
import { PaygTopupSection } from "../../components/topup/PaygTopupSection";
import { PriceCard } from "../../components/topup/PriceCard";
import { AuthContext } from "../../context/Auth";
import { LanguageContext, T } from "../../context/Language";
import { useToastMessage } from "../../context/Toast";
import { formatQuotaMoney } from "../../helpers/format";
import { navigateTo } from "../../helpers/navigation";
import {
  getEpayMethods,
  getPaymentLaunchMessage,
  getSubscriptionPaymentError,
  isSubscriptionPaymentSuccess,
  launchSubscriptionPayment,
} from "../../helpers/payments";
import { recordsToPricePlans } from "../../helpers/plans";
import { localizeText, localizeKey } from "../../i18n/localization";
import {
  buySubscriptionWithBalance,
  buySubscriptionWithCreem,
  buySubscriptionWithEpay,
  buySubscriptionWithStripe,
  buySubscriptionWithWaffoPancake,
  fetchCustomerSelf,
  fetchCustomerStatus,
  fetchPublicPlans,
  fetchSelfSubscription,
  fetchTopupInfo,
} from "../../services/customer-api";
import type {
  CustomerPricePlan,
  CustomerStatus,
  Language,
  PurchaseLaunch,
  PurchasePaymentProvider,
  PurchaseProgress,
  PurchaseStepKey,
  PurchaseStepState,
  SelfSubscriptionData,
  SubscriptionPlanRecord,
  TopupInfo,
} from "../../types";

type MarketingHeaderComponent = ComponentType;
type TopupDialogComponent = ComponentType<{ onClose: () => void }>;

const purchaseStepOrder: PurchaseStepKey[] = ["order", "paymentInfo", "launch"];

const purchaseStepLabels: Record<PurchaseStepKey, string> = {
  order: "Create order",
  paymentInfo: "Get payment details",
  launch: "Launch payment",
};

function getPurchaseStepStatusLabel(
  state: PurchaseStepState,
  language: Language,
) {
  if (state === "done") return localizeKey(language, "Done");
  if (state === "processing") return localizeKey(language, "Processing");
  if (state === "error") return localizeKey(language, "Failed");
  return localizeKey(language, "Waiting");
}

export function PurchaseProgressDialog({
  progress,
  onClose,
  onLaunch,
}: {
  progress: PurchaseProgress;
  onClose: () => void;
  onLaunch: (launch: PurchaseLaunch) => void;
}) {
  const { language } = useContext(LanguageContext);
  const isProcessing = Object.values(progress.steps).some(
    (state) => state === "processing",
  );
  const hasError = Object.values(progress.steps).some(
    (state) => state === "error",
  );
  const title = hasError
    ? localizeKey(language, "Payment needs attention")
    : isProcessing
      ? localizeKey(language, "Preparing payment")
      : progress.launch
        ? localizeKey(language, "Payment page ready")
        : localizeKey(language, "Purchase successful");

  useEffect(() => {
    if (!progress.canClose) return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, progress.canClose]);

  return (
    <div className="purchase-dialog" role="dialog" aria-modal="true">
      <div className="purchase-backdrop" />
      <div className="purchase-panel">
        {progress.canClose ? (
          <button
            aria-label={localizeKey(language, "Close")}
            className="purchase-close"
            type="button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        ) : null}
        <div className="purchase-head">
          <span className="purchase-kicker">{progress.planName}</span>
          <h2>{title}</h2>
          <p>{progress.message}</p>
        </div>
        <div className="purchase-steps">
          {purchaseStepOrder.map((step) => {
            const state = progress.steps[step];
            const label = purchaseStepLabels[step];
            return (
              <div className={`purchase-step ${state}`} key={step}>
                <span className="purchase-step-icon">
                  {state === "done" ? <Check size={18} /> : null}
                  {state === "processing" ? <LoaderCircle size={18} /> : null}
                  {state === "error" ? <X size={18} /> : null}
                </span>
                <span className="purchase-step-label">
                  {localizeKey(language, label)}
                </span>
                <span className="purchase-step-state">
                  {getPurchaseStepStatusLabel(state, language)}
                </span>
              </div>
            );
          })}
        </div>
        {progress.error ? (
          <div className="purchase-error">{progress.error}</div>
        ) : null}
        {progress.launch && progress.canClose ? (
          <div className="purchase-actions">
            <button
              className="btn btn-dark btn-block"
              type="button"
              onClick={() => onLaunch(progress.launch as PurchaseLaunch)}
            >
              <Play size={16} />
              <T id="Open payment page" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

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

function PlanPurchaseDialog({
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
          <div className="plan-purchase-row">
            <span>
              <T id="Plan name" />
            </span>
            <strong>{plan.name}</strong>
          </div>
          <div className="plan-purchase-row">
            <span>
              <T id="Validity period" />
            </span>
            <strong>
              <Calendar size={14} />
              {localizeText(language, plan.periodLabelZh, plan.periodLabelEn)}
            </strong>
          </div>
          {!resetIsNever ? (
            <div className="plan-purchase-row">
              <span>
                <T id="Reset period" />
              </span>
              <strong>
                {localizeText(language, plan.resetLabelZh, plan.resetLabelEn)}
              </strong>
            </div>
          ) : null}
          {plan.upgradeGroup ? (
            <div className="plan-purchase-row">
              <span>
                <T id="Upgrade group" />
              </span>
              <strong>{plan.upgradeGroup}</strong>
            </div>
          ) : null}
          <div className="plan-purchase-divider" />
          <div className="plan-purchase-row amount">
            <span>
              <T id="Amount due" />
            </span>
            <b>{plan.price}</b>
          </div>
          <div className="plan-purchase-row received">
            <span>
              <T id="Received amount" />
            </span>
            <strong>
              {localizeText(language, plan.quotaLabelZh, plan.quotaLabelEn)}
            </strong>
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
            {!allowBalancePay ? (
              <p>
                <T id="This plan does not allow balance payment." />
              </p>
            ) : !balanceEnough ? (
              <p>
                <T id="Insufficient balance." />
              </p>
            ) : null}
            <button
              className="btn btn-soft btn-block"
              disabled={payButtonDisabled || !allowBalancePay || !balanceEnough}
              type="button"
              onClick={() => void onPay("balance")}
            >
              <CircleDollarSign size={16} />
              <T id="Pay with balance" />
            </button>
          </div>

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
  );
}

export function createSubscribePage({
  MarketingHeader,
  TopupDialog,
}: {
  MarketingHeader: MarketingHeaderComponent;
  TopupDialog: TopupDialogComponent;
}) {
  return function SubscribePage() {
    const { user, setUser } = useContext(AuthContext);
    const { language } = useContext(LanguageContext);
    const [status, setStatus] = useState<CustomerStatus | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlanRecord[]>([]);
    const [topupInfo, setTopupInfo] = useState<TopupInfo | null>(null);
    const [selfSubscription, setSelfSubscription] =
      useState<SelfSubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    useToastMessage(message);
    const [buyingPlanId, setBuyingPlanId] = useState<number | null>(null);
    const [selectedPurchasePlan, setSelectedPurchasePlan] =
      useState<CustomerPricePlan | null>(null);
    const [selectedEpayMethod, setSelectedEpayMethod] = useState("");
    const [topupDialogOpen, setTopupDialogOpen] = useState(false);
    const [purchaseProgress, setPurchaseProgress] =
      useState<PurchaseProgress | null>(null);

    useEffect(() => {
      let mounted = true;
      setLoading(true);
      void Promise.all([
        fetchCustomerStatus(),
        fetchPublicPlans(),
        fetchTopupInfo(),
      ]).then(([statusRes, plansRes, topupInfoRes]) => {
        if (!mounted) return;
        if (statusRes.success && statusRes.data) setStatus(statusRes.data);
        setPlans(plansRes.success && plansRes.data ? plansRes.data : []);
        if (topupInfoRes.success && topupInfoRes.data) {
          setTopupInfo(topupInfoRes.data);
        }
        setLoading(false);
      });
      return () => {
        mounted = false;
      };
    }, []);

    useEffect(() => {
      if (!user?.id) {
        setSelfSubscription(null);
        return;
      }
      let mounted = true;
      void fetchSelfSubscription().then((response) => {
        if (!mounted) return;
        setSelfSubscription(
          response.success && response.data ? response.data : null,
        );
      });
      return () => {
        mounted = false;
      };
    }, [user?.id]);

    const displayPlans = useMemo(
      () => recordsToPricePlans(plans, status),
      [plans, status],
    );

    const planPurchaseCountMap = useMemo(() => {
      const map = new Map<number, number>();
      for (const item of selfSubscription?.all_subscriptions ?? []) {
        const planId = item?.subscription?.plan_id;
        if (!planId) continue;
        map.set(planId, (map.get(planId) || 0) + 1);
      }
      return map;
    }, [selfSubscription]);

    const getPlanPurchaseCount = (planId?: number) =>
      planId ? planPurchaseCountMap.get(planId) || 0 : 0;

    const setPurchaseSteps = (
      steps: Partial<Record<PurchaseStepKey, PurchaseStepState>>,
    ) => {
      setPurchaseProgress((current) =>
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

    const updatePurchaseProgress = (
      patch: Partial<Omit<PurchaseProgress, "steps">>,
    ) => {
      setPurchaseProgress((current) =>
        current
          ? {
              ...current,
              ...patch,
            }
          : current,
      );
    };

    const handleLaunchPayment = (launch: PurchaseLaunch) => {
      setPurchaseSteps({ launch: "processing" });
      const launched = launchSubscriptionPayment(launch);
      const nextMessage = getPaymentLaunchMessage(launch, launched, language);
      setPurchaseSteps({ launch: "done" });
      updatePurchaseProgress({
        message: nextMessage,
        error: undefined,
        canClose: true,
      });
      setMessage(nextMessage);
    };

    const handleBuyPlan = (plan: CustomerPricePlan) => {
      if (!user?.id) {
        navigateTo("/sign-in");
        return;
      }
      if (!plan.planId) {
        navigateTo("/dashboard/billing");
        return;
      }
      setMessage("");
      setSelectedEpayMethod(getEpayMethods(topupInfo)[0]?.type || "");
      setSelectedPurchasePlan(plan);
    };

    const handleOpenTopup = () => {
      if (!user?.id) {
        navigateTo("/sign-in");
        return;
      }
      setTopupDialogOpen(true);
    };

    const refreshPurchaseState = async () => {
      const [selfRes, subscriptionRes] = await Promise.all([
        fetchCustomerSelf(),
        fetchSelfSubscription(),
      ]);
      if (selfRes.success && selfRes.data) setUser(selfRes.data);
      if (subscriptionRes.success && subscriptionRes.data) {
        setSelfSubscription(subscriptionRes.data);
      }
    };

    const handlePurchasePayment = async (
      provider: PurchasePaymentProvider,
      paymentMethod?: string,
    ) => {
      const plan = selectedPurchasePlan;
      if (!user?.id) {
        navigateTo("/sign-in");
        return;
      }
      if (!plan?.planId) {
        setSelectedPurchasePlan(null);
        navigateTo("/dashboard/billing");
        return;
      }
      const purchaseLimit = Number(plan.maxPurchasePerUser || 0);
      const purchaseCount = getPlanPurchaseCount(plan.planId);
      if (purchaseLimit > 0 && purchaseCount >= purchaseLimit) {
        const errorMessage = localizeKey(
          language,
          "Purchase limit reached ({{current}}/{{limit}})",
          { current: purchaseCount, limit: purchaseLimit },
        );
        setMessage(errorMessage);
        return;
      }
      if (provider === "epay" && !paymentMethod) {
        const errorMessage = localizeKey(
          language,
          "Please select a payment method.",
        );
        setMessage(errorMessage);
        return;
      }

      setSelectedPurchasePlan(null);
      setMessage("");
      setBuyingPlanId(plan.planId);
      setPurchaseProgress({
        planName: plan.name,
        steps: {
          order: "processing",
          paymentInfo: "pending",
          launch: "pending",
        },
        message: localizeKey(language, "Creating order..."),
        canClose: false,
      });

      try {
        if (provider === "balance") {
          const balanceEnough = Number(user.quota ?? 0) >= plan.requiredQuota;
          if (plan.allowBalancePay === false || !balanceEnough) {
            const errorMessage =
              plan.allowBalancePay === false
                ? localizeKey(
                    language,
                    "This plan does not allow balance payment.",
                  )
                : localizeKey(language, "Insufficient balance.");
            setPurchaseSteps({ order: "error" });
            updatePurchaseProgress({
              message: errorMessage,
              error: errorMessage,
              canClose: true,
            });
            setMessage(errorMessage);
            return;
          }
          updatePurchaseProgress({
            message: localizeKey(
              language,
              "Completing purchase with balance...",
            ),
          });
          const response = await buySubscriptionWithBalance(plan.planId);
          if (!response.success) {
            const errorMessage =
              response.message ||
              localizeKey(language, "Failed to purchase plan");
            setPurchaseSteps({ order: "error" });
            updatePurchaseProgress({
              message: errorMessage,
              error: errorMessage,
              canClose: true,
            });
            setMessage(errorMessage);
            return;
          }
          setPurchaseSteps({
            order: "done",
            paymentInfo: "done",
            launch: "done",
          });
          const successMessage = localizeKey(
            language,
            "Plan purchased successfully.",
          );
          updatePurchaseProgress({
            message: successMessage,
            error: undefined,
            canClose: true,
          });
          setMessage(successMessage);
          await refreshPurchaseState();
          return;
        }

        updatePurchaseProgress({
          message: localizeKey(language, "Getting payment details..."),
        });
        setPurchaseSteps({ paymentInfo: "processing" });

        const response =
          provider === "stripe"
            ? await buySubscriptionWithStripe(plan.planId)
            : provider === "creem"
              ? await buySubscriptionWithCreem(plan.planId)
              : provider === "waffoPancake"
                ? await buySubscriptionWithWaffoPancake(plan.planId)
                : await buySubscriptionWithEpay(
                    plan.planId,
                    paymentMethod || selectedEpayMethod,
                  );

        if (!isSubscriptionPaymentSuccess(response)) {
          const errorMessage = getSubscriptionPaymentError(response, language);
          setPurchaseSteps({ order: "error", paymentInfo: "pending" });
          updatePurchaseProgress({
            message: errorMessage,
            error: errorMessage,
            canClose: true,
          });
          setMessage(errorMessage);
          return;
        }

        setPurchaseSteps({
          order: "done",
          paymentInfo: "done",
          launch: "processing",
        });
        updatePurchaseProgress({
          message: localizeKey(
            language,
            "Payment details received. Launching payment...",
          ),
        });

        const epayParams =
          response.data && typeof response.data === "object"
            ? response.data
            : {};
        const paymentUrl =
          response.data?.pay_link || response.data?.checkout_url;
        const launch =
          provider === "epay" && response.url
            ? ({
                type: "epay",
                url: response.url,
                params: epayParams,
              } satisfies PurchaseLaunch)
            : typeof paymentUrl === "string" && paymentUrl
              ? ({
                  type: "url",
                  url: paymentUrl,
                  target: provider === "waffoPancake" ? "currentTab" : "newTab",
                } satisfies PurchaseLaunch)
              : null;

        if (!launch) {
          const errorMessage = localizeKey(
            language,
            "Payment link was not returned.",
          );
          setPurchaseSteps({ launch: "error" });
          updatePurchaseProgress({
            message: errorMessage,
            error: errorMessage,
            canClose: true,
          });
          setMessage(errorMessage);
          return;
        }

        updatePurchaseProgress({ launch });
        handleLaunchPayment(launch);
      } catch {
        const errorMessage = localizeKey(
          language,
          "Purchase flow failed. Please try again.",
        );
        setPurchaseSteps({ order: "error" });
        updatePurchaseProgress({
          message: errorMessage,
          error: errorMessage,
          canClose: true,
        });
        setMessage(errorMessage);
      } finally {
        setBuyingPlanId(null);
      }
    };

    return (
      <>
        <MarketingHeader />
        <main className="section">
          <div className="wrap">
            <div className="center pricing-title">
              <Pill>
                <T id="Pricing" />
              </Pill>
              <h1 className="h-sec">
                <T id="Pay for how you use AI" />
              </h1>
              <p className="lead">
                <T id="Pay-as-you-go credits never expire. Subscriptions fit steady builders and teams." />
              </p>
            </div>
            {loading ? (
              <EmptyState id="Loading plans" />
            ) : displayPlans.length > 0 ? (
              <div className="price-grid">
                {displayPlans.map((plan) => {
                  const purchaseLimit = Number(plan.maxPurchasePerUser || 0);
                  const purchaseCount = getPlanPurchaseCount(plan.planId);
                  const limitReached =
                    purchaseLimit > 0 && purchaseCount >= purchaseLimit;
                  const processing = buyingPlanId !== null;
                  return (
                    <PriceCard
                      key={plan.planId ?? plan.name}
                      plan={plan}
                      disabled={processing || limitReached}
                      disabledLabelId={
                        limitReached
                          ? "Limit reached"
                          : processing
                            ? "Processing"
                            : undefined
                      }
                      onBuy={handleBuyPlan}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState id="No available plans" />
            )}
            {!loading ? (
              <PaygTopupSection
                status={status}
                topupInfo={topupInfo}
                onTopup={handleOpenTopup}
              />
            ) : null}
          </div>
        </main>
        {selectedPurchasePlan ? (
          <PlanPurchaseDialog
            plan={selectedPurchasePlan}
            status={status}
            topupInfo={topupInfo}
            userQuota={Number(user?.quota || 0)}
            purchaseCount={getPlanPurchaseCount(selectedPurchasePlan.planId)}
            selectedEpayMethod={selectedEpayMethod}
            onSelectedEpayMethodChange={setSelectedEpayMethod}
            onClose={() => setSelectedPurchasePlan(null)}
            onPay={handlePurchasePayment}
          />
        ) : null}
        {purchaseProgress ? (
          <PurchaseProgressDialog
            progress={purchaseProgress}
            onClose={() => setPurchaseProgress(null)}
            onLaunch={handleLaunchPayment}
          />
        ) : null}
        {topupDialogOpen ? (
          <TopupDialog onClose={() => setTopupDialogOpen(false)} />
        ) : null}
        <Footer />
      </>
    );
  };
}
