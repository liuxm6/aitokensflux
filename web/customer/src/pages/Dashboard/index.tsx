import { FileText } from "lucide-react";
import type { ComponentType } from "react";
import { useContext, useEffect, useState } from "react";
import {
  ErrorState,
  LoadingState,
} from "../../components/common/ui/AsyncState";
import { SectionLabel } from "../../components/common/SectionLabel";
import { DashboardPlanList } from "../../components/dashboard/DashboardPlanList";
import { DashboardWalletCard } from "../../components/dashboard/DashboardWalletCard";
import { TutorialCard } from "../../components/dashboard/TutorialCard";
import { CustomerShell } from "../../components/layout/CustomerShell";
import { ConsolePageHeader } from "../../components/layout/ConsolePageHeader";
import { Panel } from "../../components/common/ui/Panel";
import { SupportChannelGrid } from "../../components/support/SupportChannels";
import { AuthContext } from "../../context/Auth";
import { T } from "../../context/Language";
import { pageMeta } from "../../constants/page-meta";
import {
  formatQuotaMoney,
  getActiveSubscriptionRecords,
  getTodayUnixRange,
  mapPlansById,
} from "../../helpers/format";
import { scrollElementIntoView } from "../../helpers/motion";
import {
  fetchCustomerSelf,
  fetchCustomerStatus,
  fetchPublicPlans,
  fetchSelfSubscription,
  fetchUserLogStats,
} from "../../services/customer-api";
import type {
  CustomerLogStats,
  CustomerStatus,
  CustomerSubscriptionRecord,
  SubscriptionPlanRecord,
} from "../../types";

type TopupDialogComponent = ComponentType<{ onClose: () => void }>;

export function createDashboardPage({
  TopupDialog,
}: {
  TopupDialog: TopupDialogComponent;
}) {
  return function DashboardPage() {
    const { user, setUser } = useContext(AuthContext);
    const [status, setStatus] = useState<CustomerStatus | null>(null);
    const [logStats, setLogStats] = useState<CustomerLogStats | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlanRecord[]>([]);
    const [subscriptions, setSubscriptions] = useState<
      CustomerSubscriptionRecord[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [topupDialogOpen, setTopupDialogOpen] = useState(false);

    useEffect(() => {
      if (!user?.id) return;
      let mounted = true;
      const today = getTodayUnixRange();
      setLoading(true);
      setLoadError(false);
      void Promise.all([
        fetchCustomerStatus(),
        fetchCustomerSelf(),
        fetchUserLogStats(today.start, today.end),
        fetchSelfSubscription(),
        fetchPublicPlans(),
      ]).then(([statusRes, selfRes, statsRes, subRes, plansRes]) => {
        if (!mounted) return;
        if (statusRes.success && statusRes.data) setStatus(statusRes.data);
        if (selfRes.success && selfRes.data) setUser(selfRes.data);
        if (statsRes.success && statsRes.data) setLogStats(statsRes.data);
        if (subRes.success && subRes.data) {
          setSubscriptions(subRes.data.subscriptions ?? []);
        }
        if (plansRes.success && plansRes.data) setPlans(plansRes.data);
        setLoadError(
          !selfRes.success ||
            !statsRes.success ||
            !subRes.success ||
            !plansRes.success,
        );
        setLoading(false);
      });
      return () => {
        mounted = false;
      };
    }, [reloadKey, user?.id]);

    useEffect(() => {
      if (loading || window.location.hash !== "#dashboard-wallet") return;

      const timer = window.setTimeout(() => {
        const wallet = document.getElementById("dashboard-wallet");
        if (wallet) scrollElementIntoView(wallet);
      }, 80);

      return () => window.clearTimeout(timer);
    }, [loading]);

    const planMap = mapPlansById(plans);
    const activeSubscriptionRecords =
      getActiveSubscriptionRecords(subscriptions);
    const account = user ?? undefined;
    const balance = account?.quota ?? 0;

    return (
      <CustomerShell crumbId="Dashboard" page="dashboard">
        <ConsolePageHeader
          descriptionId={pageMeta.dashboard.descriptionId}
          titleId="Dashboard"
        />

        {!loading && !loadError ? (
          <DashboardWalletCard
            balanceLabel={formatQuotaMoney(balance, status)}
            requestCount={account?.request_count ?? 0}
            todayUsedLabel={formatQuotaMoney(logStats?.quota ?? 0, status)}
            onTopup={() => setTopupDialogOpen(true)}
          />
        ) : null}

        {loading ? (
          <Panel className="dashboard-plan-panel">
            <LoadingState id="Loading current plan" />
          </Panel>
        ) : loadError ? (
          <Panel className="dashboard-plan-panel">
            <ErrorState
              id="Failed to load dashboard data"
              onRetry={() => setReloadKey((value) => value + 1)}
            />
          </Panel>
        ) : (
          <DashboardPlanList
            planMap={planMap}
            records={activeSubscriptionRecords}
            status={status}
          />
        )}
        {topupDialogOpen ? (
          <TopupDialog onClose={() => setTopupDialogOpen(false)} />
        ) : null}

        <SectionLabel id="Support & community" />
        <Panel className="dashboard-support-panel">
          <div className="dashboard-support-head">
            <strong>
              <T id="Choose the support channel that works for you." />
            </strong>
            <span>
              <T id="Support groups are best for real-time help. Email is best for account, order, and security issues." />
            </span>
          </div>
          <SupportChannelGrid />
        </Panel>

        <SectionLabel id="Setup tutorials" />
        <Panel className="tutorial-panel">
          <p className="muted-title">
            <T id="Choose your setup method" />
          </p>
          <div className="tutorial-grid">
            <TutorialCard
              href="/docs"
              icon={FileText}
              subtitleId="Claude Code · Codex · Windows / macOS / Linux"
              titleId="Terminal / VS Code text tutorial"
            />
          </div>
        </Panel>
      </CustomerShell>
    );
  };
}
