import {
  Activity,
  BookOpen,
  CircleDollarSign,
  FileText,
  KeyRound,
  Layers3,
  Wallet,
} from "lucide-react";
import type { ComponentType } from "react";
import { useContext, useEffect, useState } from "react";
import { AppLink } from "../../components/common/AppLink";
import { ConsoleSummary } from "../../components/common/ConsoleSummary";
import {
  ErrorState,
  LoadingState,
} from "../../components/common/ui/AsyncState";
import { SectionLabel } from "../../components/common/SectionLabel";
import { TutorialCard } from "../../components/dashboard/TutorialCard";
import { CustomerShell } from "../../components/layout/CustomerShell";
import { ConsolePageHeader } from "../../components/layout/ConsolePageHeader";
import { Panel } from "../../components/common/ui/Panel";
import { SupportChannelGrid } from "../../components/support/SupportChannels";
import { AuthContext } from "../../context/Auth";
import { LanguageContext, T } from "../../context/Language";
import { pageMeta } from "../../constants/page-meta";
import {
  formatQuotaMoney,
  formatSubscriptionResetDisplayTime,
  formatTimestamp,
  getActiveSubscriptionRecords,
  getTodayUnixRange,
  mapPlansById,
} from "../../helpers/format";
import {
  formatPlanResetPeriod,
  formatSubscriptionPeriod,
} from "../../helpers/plans";
import { scrollElementIntoView } from "../../helpers/motion";
import { localizeText, localizeKey } from "../../i18n/localization";
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
  SubscriptionPlan,
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
    const { language } = useContext(LanguageContext);
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
    const primarySubscription = activeSubscriptionRecords[0];
    const primaryPlan = primarySubscription
      ? (primarySubscription.plan ??
        planMap.get(primarySubscription.subscription.plan_id))
      : undefined;
    const currentPlanLabel = primarySubscription
      ? primaryPlan?.title || `#${primarySubscription.subscription.plan_id}`
      : localizeKey(language, "No current plan");

    return (
      <CustomerShell crumbId="Dashboard" page="dashboard">
        <ConsolePageHeader
          action={
            <button
              className="btn btn-flux btn-sm"
              type="button"
              onClick={() => setTopupDialogOpen(true)}
            >
              <CircleDollarSign size={15} />
              <T id="Top up now" />
            </button>
          }
          descriptionId={pageMeta.dashboard.descriptionId}
          titleId="Dashboard"
        />

        {!loading && !loadError ? (
          <>
            <ConsoleSummary
              items={[
                {
                  icon: Wallet,
                  labelId: "Wallet balance",
                  tone: "accent",
                  value: (
                    <span className="mono">
                      {formatQuotaMoney(balance, status)}
                    </span>
                  ),
                },
                {
                  icon: Activity,
                  labelId: "Today used",
                  value: (
                    <span className="mono">
                      {formatQuotaMoney(logStats?.quota ?? 0, status)}
                    </span>
                  ),
                },
                {
                  icon: KeyRound,
                  labelId: "Request count",
                  value: (
                    <span className="mono">{account?.request_count ?? 0}</span>
                  ),
                },
                {
                  icon: Layers3,
                  labelId: "Current plan",
                  value: currentPlanLabel,
                },
              ]}
            />
            <nav
              aria-label={localizeKey(language, "Common actions")}
              className="dashboard-quick-actions"
            >
              <AppLink href="/dashboard/billing">
                <CircleDollarSign size={18} />
                <T id="Billing" />
              </AppLink>
              <AppLink href="/dashboard/usage">
                <Activity size={18} />
                <T id="View usage" />
              </AppLink>
              <AppLink href="/dashboard/api-key">
                <KeyRound size={18} />
                <T id="Manage API keys" />
              </AppLink>
              <AppLink href="/setup">
                <BookOpen size={18} />
                <T id="Docs" />
              </AppLink>
            </nav>
            <SectionLabel id="Current plan" />
          </>
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
        ) : activeSubscriptionRecords.length > 0 ? (
          <div className="dashboard-plan-list">
            {activeSubscriptionRecords.map((record, index) => (
              <ActiveSubscriptionItem
                key={record.subscription.id}
                plan={record.plan ?? planMap.get(record.subscription.plan_id)}
                record={record}
                showBuyAction={index === 0}
                status={status}
              />
            ))}
          </div>
        ) : (
          <NoCurrentPlanCard />
        )}

        <div id="dashboard-wallet">
          <Panel className="dashboard-wallet-panel">
            <div className="wallet-panel-head">
              <div className="wallet-line standalone">
                <span>
                  <T id="Wallet balance" />{" "}
                  <b className="mono">{formatQuotaMoney(balance, status)}</b>
                </span>
                <span>
                  <T id="Today used" />{" "}
                  <span className="mono">
                    {formatQuotaMoney(logStats?.quota ?? 0, status)}
                  </span>
                </span>
                <span className="wallet-settlement-note">
                  <T id="CNY and USD are settled 1:1." />
                </span>
              </div>
            </div>
          </Panel>
        </div>
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
              href="/setup"
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

function NoCurrentPlanCard() {
  return (
    <Panel className="dashboard-plan-panel no-current-plan-panel">
      <div className="no-current-plan-content">
        <div>
          <strong>
            <T id="No current plan" />
          </strong>
          <span>
            <T id="After purchasing a plan, quota, validity, and remaining balance will appear here." />
          </span>
        </div>
        <AppLink className="btn btn-flux btn-sm" href="/subscribe">
          <KeyRound size={15} />
          <T id="Buy plan" />
        </AppLink>
      </div>
    </Panel>
  );
}

function PlanFact({ labelId, value }: { labelId: string; value: string }) {
  const { language } = useContext(LanguageContext);

  return (
    <div className="plan-fact">
      <span>{localizeKey(language, labelId)}</span>
      <strong className="mono">{value}</strong>
    </div>
  );
}

function ActiveSubscriptionItem({
  record,
  plan,
  showBuyAction = false,
  status,
}: {
  record: CustomerSubscriptionRecord;
  plan?: SubscriptionPlan;
  showBuyAction?: boolean;
  status?: CustomerStatus | null;
}) {
  const { language } = useContext(LanguageContext);
  const subscription = record.subscription;
  const title = plan?.title || `#${subscription.plan_id}`;
  const total = Number(subscription.amount_total ?? plan?.total_amount ?? 0);
  const used = Number(subscription.amount_used ?? 0);
  const remaining = total > 0 ? Math.max(0, total - used) : 0;
  const usedPercent = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const totalMoneyLabel =
    total > 0 ? formatQuotaMoney(total, status) : undefined;
  const period = plan ? formatSubscriptionPeriod(plan) : null;
  const reset = plan ? formatPlanResetPeriod(plan) : null;
  const quotaLabel =
    total > 0
      ? formatQuotaMoney(total, status)
      : localizeKey(language, "Unlimited");
  const remainingLabel =
    total > 0
      ? formatQuotaMoney(remaining, status)
      : localizeKey(language, "Unlimited");
  const periodLabel = period
    ? localizeText(language, period.zh, period.en)
    : "-";
  const resetLabel = reset
    ? localizeText(language, reset.zh, reset.en)
    : localizeKey(language, "No reset");
  const nextReset = formatSubscriptionResetDisplayTime(subscription);

  return (
    <Panel className="dashboard-plan-panel subscription-plan-card">
      <div className="plan-head">
        <div className="plan-facts">
          <PlanFact labelId="Current plan" value={title} />
          <PlanFact
            labelId="Valid until"
            value={formatTimestamp(subscription.end_time)}
          />
          <PlanFact labelId="Received amount" value={quotaLabel} />
        </div>
        {showBuyAction ? (
          <AppLink className="btn btn-flux btn-sm" href="/subscribe">
            <T id="Buy now" />
          </AppLink>
        ) : null}
      </div>
      <div className="plan-divider" />
      <div className="plan-detail-line">
        <span className="soft-badge">
          <T id="Active" />
        </span>
        <span>{title}</span>
        <span className="bar">|</span>
        <span>{periodLabel}</span>
        <span className="bar">|</span>
        <b className="mono">{quotaLabel}</b>
        <span className="bar">|</span>
        <span>{resetLabel}</span>
        <span className="bar">|</span>
        <span>
          <T id="Next reset" /> <span className="mono">{nextReset}</span>
        </span>
      </div>
      <div className="consume-grid">
        <div className="consume-values">
          <div className="usage-quota">
            <span>
              <T id="Plan used" />
            </span>
            <div>
              <strong className="mono">{formatQuotaMoney(used, status)}</strong>
              {totalMoneyLabel ? (
                <span className="mono"> / {totalMoneyLabel}</span>
              ) : null}
              {totalMoneyLabel ? (
                <span className="usage-percent mono">
                  {usedPercent.toFixed(1)}%
                </span>
              ) : null}
            </div>
          </div>
          <div className="usage-quota">
            <span>
              <T id="Plan remaining" />
            </span>
            <div>
              <strong className="mono">{remainingLabel}</strong>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
