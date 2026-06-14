import { CircleDollarSign, FileText, KeyRound } from "lucide-react";
import type { ComponentType } from "react";
import { useContext, useEffect, useState } from "react";
import { AppLink } from "../../components/common/AppLink";
import { EmptyState } from "../../components/common/EmptyState";
import { SectionLabel } from "../../components/common/SectionLabel";
import { TutorialCard } from "../../components/dashboard/TutorialCard";
import {
  ConsolePageTitle,
  CustomerShell,
} from "../../components/layout/CustomerShell";
import { Panel } from "../../components/common/ui/Panel";
import { AuthContext } from "../../context/Auth";
import { LanguageContext, T } from "../../context/Language";
import {
  formatQuotaMoney,
  formatQuotaRate,
  formatQuotaTokens,
  formatSubscriptionResetDisplayTime,
  formatTimestamp,
  getActiveSubscriptionRecords,
  getTodayUnixRange,
  mapPlansById,
} from "../../helpers/format";
import {
  formatPlanResetPeriod,
  formatSubscriptionPeriod,
  getPlanRate,
} from "../../helpers/plans";
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
    const [status, setStatus] = useState<CustomerStatus | null>(null);
    const [logStats, setLogStats] = useState<CustomerLogStats | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlanRecord[]>([]);
    const [subscriptions, setSubscriptions] = useState<
      CustomerSubscriptionRecord[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [topupDialogOpen, setTopupDialogOpen] = useState(false);

    useEffect(() => {
      if (!user?.id) return;
      let mounted = true;
      const today = getTodayUnixRange();
      setLoading(true);
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
        setLoading(false);
      });
      return () => {
        mounted = false;
      };
    }, [user?.id]);

    const planMap = mapPlansById(plans);
    const activeSubscriptionRecords =
      getActiveSubscriptionRecords(subscriptions);
    const account = user ?? undefined;
    const balance = account?.quota ?? 0;

    return (
      <CustomerShell crumbId="Dashboard" page="dashboard">
        <div className="dashboard-title-row">
          <ConsolePageTitle id="Current plan" />
        </div>

        {loading ? (
          <Panel className="dashboard-plan-panel">
            <EmptyState id="Loading current plan" />
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

        <Panel className="dashboard-wallet-panel">
          <div className="wallet-panel-head">
            <div className="wallet-line standalone">
              <span>
                <T id="Wallet balance" />{" "}
                <b className="mono">{formatQuotaMoney(balance, status)}</b>
              </span>
              <span className="bar">|</span>
              <span className="mono">{formatQuotaRate(status)}</span>
              <span className="bar">|</span>
              <span>
                <T id="Today used" />{" "}
                <span className="mono">
                  {formatQuotaMoney(logStats?.quota ?? 0, status)}
                </span>
              </span>
            </div>
            <button
              className="btn btn-flux btn-sm"
              type="button"
              onClick={() => setTopupDialogOpen(true)}
            >
              <CircleDollarSign size={15} />
              <T id="Top up now" />
            </button>
          </div>
        </Panel>
        {topupDialogOpen ? (
          <TopupDialog onClose={() => setTopupDialogOpen(false)} />
        ) : null}

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
  const remainingPercent =
    total > 0 ? Math.min(100, (remaining / total) * 100) : 100;
  const totalMoneyLabel =
    total > 0 ? formatQuotaMoney(total, status) : undefined;
  const period = plan ? formatSubscriptionPeriod(plan) : null;
  const reset = plan ? formatPlanResetPeriod(plan) : null;
  const quotaLabel =
    total > 0 ? formatQuotaTokens(total) : localizeKey(language, "Unlimited");
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
          <PlanFact labelId="Rate" value={getPlanRate(plan, status)} />
          <PlanFact labelId="Plan quota" value={quotaLabel} />
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
        <i className="consume-progress" aria-hidden="true">
          <b
            style={{
              width: `${Math.max(0, Math.min(100, remainingPercent))}%`,
            }}
          />
        </i>
      </div>
    </Panel>
  );
}
