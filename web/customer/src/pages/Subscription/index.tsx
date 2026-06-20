import type { ComponentType } from "react";
import { useContext, useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/common/EmptyState";
import { Pill } from "../../components/common/Pill";
import { Footer } from "../../components/layout/Footer";
import { PaygTopupSection } from "../../components/topup/PaygTopupSection";
import { PriceCard } from "../../components/topup/PriceCard";
import { AuthContext } from "../../context/Auth";
import { T } from "../../context/Language";
import { navigateTo } from "../../helpers/navigation";
import { recordsToPricePlans } from "../../helpers/plans";
import { usePlanPurchase } from "../../hooks/usePlanPurchase";
import {
  fetchCustomerStatus,
  fetchPublicPlans,
  fetchTopupInfo,
} from "../../services/customer-api";
import type {
  CustomerStatus,
  SubscriptionPlanRecord,
  TopupInfo,
} from "../../types";

type MarketingHeaderComponent = ComponentType;
type TopupDialogComponent = ComponentType<{ onClose: () => void }>;

export function createSubscribePage({
  MarketingHeader,
  TopupDialog,
}: {
  MarketingHeader: MarketingHeaderComponent;
  TopupDialog: TopupDialogComponent;
}) {
  return function SubscribePage() {
    const { user } = useContext(AuthContext);
    const [status, setStatus] = useState<CustomerStatus | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlanRecord[]>([]);
    const [topupInfo, setTopupInfo] = useState<TopupInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [topupDialogOpen, setTopupDialogOpen] = useState(false);

    const purchase = usePlanPurchase({ status, topupInfo });

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

    const displayPlans = useMemo(
      () => recordsToPricePlans(plans, status),
      [plans, status],
    );

    const handleOpenTopup = () => {
      if (!user?.id) {
        navigateTo("/sign-in");
        return;
      }
      setTopupDialogOpen(true);
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
                  const purchaseCount = purchase.getPlanPurchaseCount(
                    plan.planId,
                  );
                  const limitReached =
                    purchaseLimit > 0 && purchaseCount >= purchaseLimit;
                  const processing = purchase.buyingPlanId !== null;
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
                      onBuy={purchase.openPurchase}
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
        {purchase.dialogs}
        {topupDialogOpen ? (
          <TopupDialog onClose={() => setTopupDialogOpen(false)} />
        ) : null}
        <Footer />
      </>
    );
  };
}
