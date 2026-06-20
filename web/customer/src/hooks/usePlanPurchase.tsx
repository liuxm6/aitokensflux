import { useContext, useEffect, useMemo, useState } from "react";
import { PlanPurchaseDialog } from "../components/topup/PlanPurchaseDialog";
import { PurchaseProgressDialog } from "../components/topup/PurchaseProgressDialog";
import { AuthContext } from "../context/Auth";
import { LanguageContext } from "../context/Language";
import { useToastMessage } from "../context/Toast";
import { navigateTo } from "../helpers/navigation";
import {
  getEpayMethods,
  getPaymentLaunchMessage,
  getSubscriptionPaymentError,
  isSubscriptionPaymentSuccess,
  launchSubscriptionPayment,
} from "../helpers/payments";
import {
  buySubscriptionWithBalance,
  buySubscriptionWithCreem,
  buySubscriptionWithEpay,
  buySubscriptionWithStripe,
  buySubscriptionWithWaffoPancake,
  fetchCustomerSelf,
  fetchSelfSubscription,
} from "../services/customer-api";
import { localizeKey } from "../i18n/localization";
import type {
  CustomerPricePlan,
  CustomerStatus,
  PurchaseLaunch,
  PurchasePaymentProvider,
  PurchaseProgress,
  PurchaseStepKey,
  PurchaseStepState,
  SelfSubscriptionData,
  TopupInfo,
} from "../types";

/**
 * Shared subscription-plan purchase flow. Owns the purchase state machine and
 * renders the plan-confirmation + progress dialogs, so any page (Subscription,
 * Father's Day campaign, ...) can offer real on-page payment without
 * duplicating the ~250-line flow.
 */
export function usePlanPurchase({
  status,
  topupInfo,
}: {
  status: CustomerStatus | null;
  topupInfo: TopupInfo | null;
}) {
  const { user, setUser } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const [selfSubscription, setSelfSubscription] =
    useState<SelfSubscriptionData | null>(null);
  const [message, setMessage] = useState("");
  useToastMessage(message);
  const [buyingPlanId, setBuyingPlanId] = useState<number | null>(null);
  const [selectedPurchasePlan, setSelectedPurchasePlan] =
    useState<CustomerPricePlan | null>(null);
  const [selectedEpayMethod, setSelectedEpayMethod] = useState("");
  const [purchaseProgress, setPurchaseProgress] =
    useState<PurchaseProgress | null>(null);

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

  const openPurchase = (plan: CustomerPricePlan) => {
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
          message: localizeKey(language, "Completing purchase with balance..."),
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

  const dialogs = (
    <>
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
    </>
  );

  return { openPurchase, getPlanPurchaseCount, buyingPlanId, dialogs };
}
