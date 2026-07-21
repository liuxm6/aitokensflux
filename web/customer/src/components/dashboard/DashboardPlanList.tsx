import { ChevronDown, KeyRound } from "lucide-react";
import type { ContextType } from "react";
import { useContext, useState } from "react";
import { LanguageContext, T } from "../../context/Language";
import {
  formatQuotaMoney,
  formatSubscriptionResetDisplayTime,
  formatTimestamp,
} from "../../helpers/format";
import {
  formatPlanResetPeriod,
  formatSubscriptionPeriod,
} from "../../helpers/plans";
import { localizeKey, localizeText } from "../../i18n/localization";
import type {
  CustomerStatus,
  CustomerSubscriptionRecord,
  SubscriptionPlan,
} from "../../types";
import { AppLink } from "../common/AppLink";
import { Panel } from "../common/ui/Panel";

const PLAN_BATCH_SIZE = 5;

type DashboardLanguage = ContextType<typeof LanguageContext>["language"];

type PlanPresentation = {
  nextReset: string;
  periodLabel: string;
  quotaLabel: string;
  remainingLabel: string;
  resetLabel: string;
  title: string;
  totalMoneyLabel?: string;
  usedLabel: string;
  usedPercent?: string;
  validUntil: string;
};

function getPlanPresentation(
  language: DashboardLanguage,
  record: CustomerSubscriptionRecord,
  plan: SubscriptionPlan | undefined,
  status: CustomerStatus | null,
): PlanPresentation {
  const subscription = record.subscription;
  const title = plan?.title || `#${subscription.plan_id}`;
  const total = Number(subscription.amount_total ?? plan?.total_amount ?? 0);
  const used = Number(subscription.amount_used ?? 0);
  const remaining = total > 0 ? Math.max(0, total - used) : 0;
  const period = plan ? formatSubscriptionPeriod(plan) : null;
  const reset = plan ? formatPlanResetPeriod(plan) : null;
  const quotaLabel =
    total > 0
      ? formatQuotaMoney(total, status)
      : localizeKey(language, "Unlimited");

  return {
    nextReset: formatSubscriptionResetDisplayTime(subscription),
    periodLabel: period ? localizeText(language, period.zh, period.en) : "-",
    quotaLabel,
    remainingLabel:
      total > 0
        ? formatQuotaMoney(remaining, status)
        : localizeKey(language, "Unlimited"),
    resetLabel: reset
      ? localizeText(language, reset.zh, reset.en)
      : localizeKey(language, "No reset"),
    title,
    totalMoneyLabel: total > 0 ? formatQuotaMoney(total, status) : undefined,
    usedLabel: formatQuotaMoney(used, status),
    usedPercent:
      total > 0
        ? `${Math.min(100, (used / total) * 100).toFixed(1)}%`
        : undefined,
    validUntil: formatTimestamp(subscription.end_time),
  };
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

function SubscriptionDetailBody({
  presentation,
}: {
  presentation: PlanPresentation;
}) {
  return (
    <>
      <div className="plan-divider" />
      <div className="plan-detail-line">
        <span className="soft-badge">
          <T id="Active" />
        </span>
        <span>{presentation.title}</span>
        <span className="bar">|</span>
        <span>{presentation.periodLabel}</span>
        <span className="bar">|</span>
        <b className="mono">{presentation.quotaLabel}</b>
        <span className="bar">|</span>
        <span>{presentation.resetLabel}</span>
        <span className="bar">|</span>
        <span>
          <T id="Next reset" />{" "}
          <span className="mono">{presentation.nextReset}</span>
        </span>
      </div>
      <div className="consume-grid">
        <div className="consume-values">
          <div className="usage-quota">
            <span>
              <T id="Plan used" />
            </span>
            <div>
              <strong className="mono">{presentation.usedLabel}</strong>
              {presentation.totalMoneyLabel ? (
                <span className="mono">
                  {" "}/ {presentation.totalMoneyLabel}
                </span>
              ) : null}
              {presentation.usedPercent ? (
                <span className="usage-percent mono">
                  {presentation.usedPercent}
                </span>
              ) : null}
            </div>
          </div>
          <div className="usage-quota">
            <span>
              <T id="Plan remaining" />
            </span>
            <div>
              <strong className="mono">{presentation.remainingLabel}</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ActiveSubscriptionItem({
  record,
  plan,
  status,
}: {
  record: CustomerSubscriptionRecord;
  plan?: SubscriptionPlan;
  status: CustomerStatus | null;
}) {
  const { language } = useContext(LanguageContext);
  const presentation = getPlanPresentation(language, record, plan, status);

  return (
    <Panel className="dashboard-plan-panel subscription-plan-card">
      <div className="plan-head">
        <div className="plan-facts">
          <PlanFact labelId="Current plan" value={presentation.title} />
          <PlanFact labelId="Valid until" value={presentation.validUntil} />
          <PlanFact labelId="Received amount" value={presentation.quotaLabel} />
        </div>
        <AppLink className="btn btn-flux btn-sm" href="/subscribe">
          <T id="Buy now" />
        </AppLink>
      </div>
      <SubscriptionDetailBody presentation={presentation} />
    </Panel>
  );
}

function CompactSubscriptionItem({
  expanded,
  record,
  plan,
  status,
  onToggle,
}: {
  expanded: boolean;
  record: CustomerSubscriptionRecord;
  plan?: SubscriptionPlan;
  status: CustomerStatus | null;
  onToggle: () => void;
}) {
  const { language } = useContext(LanguageContext);
  const presentation = getPlanPresentation(language, record, plan, status);
  const controlId = `dashboard-plan-details-${record.subscription.id}`;
  const actionLabel = `${localizeKey(
    language,
    expanded ? "Collapse" : "Expand",
  )} ${presentation.title}`;

  return (
    <Panel className="dashboard-plan-disclosure-card">
      <button
        aria-controls={controlId}
        aria-expanded={expanded}
        aria-label={actionLabel}
        className="dashboard-plan-disclosure"
        type="button"
        onClick={onToggle}
      >
        <span className="dashboard-plan-disclosure-title">
          <span className="soft-badge">
            <T id="Active" />
          </span>
          <strong>{presentation.title}</strong>
        </span>
        <span className="dashboard-plan-disclosure-meta">
          <span>
            <T id="Valid until" />{" "}
            <b className="mono">{presentation.validUntil}</b>
          </span>
          <span>
            <T id="Plan remaining" />{" "}
            <b className="mono">{presentation.remainingLabel}</b>
          </span>
        </span>
        <ChevronDown aria-hidden="true" size={18} />
      </button>
      {expanded ? (
        <div className="dashboard-plan-disclosure-details" id={controlId}>
          <div className="plan-facts dashboard-plan-disclosure-facts">
            <PlanFact
              labelId="Received amount"
              value={presentation.quotaLabel}
            />
          </div>
          <SubscriptionDetailBody presentation={presentation} />
        </div>
      ) : null}
    </Panel>
  );
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

export function DashboardPlanList({
  records,
  planMap,
  status,
}: {
  records: CustomerSubscriptionRecord[];
  planMap: Map<number, SubscriptionPlan>;
  status: CustomerStatus | null;
}) {
  const { language } = useContext(LanguageContext);
  const [visibleCount, setVisibleCount] = useState(PLAN_BATCH_SIZE);
  const [expandedPlanIds, setExpandedPlanIds] = useState<Set<number>>(
    () => new Set(),
  );

  if (records.length === 0) {
    return (
      <>
        <h2 className="console-section-title">
          <T id="Current plan" />
        </h2>
        <NoCurrentPlanCard />
      </>
    );
  }

  const visibleRecords = records.slice(0, visibleCount);
  const remainingCount = Math.max(0, records.length - visibleRecords.length);

  return (
    <section aria-labelledby="dashboard-plans-title">
      <div className="dashboard-plans-heading">
        <h2 className="console-section-title" id="dashboard-plans-title">
          <T id="Current plan" />
        </h2>
        <span className="dashboard-plan-count mono">{records.length}</span>
      </div>
      <div className="dashboard-plan-list">
        {visibleRecords.map((record, index) => {
          const plan = record.plan ?? planMap.get(record.subscription.plan_id);
          if (index === 0) {
            return (
              <ActiveSubscriptionItem
                key={record.subscription.id}
                plan={plan}
                record={record}
                status={status}
              />
            );
          }

          const expanded = expandedPlanIds.has(record.subscription.id);
          return (
            <CompactSubscriptionItem
              expanded={expanded}
              key={record.subscription.id}
              plan={plan}
              record={record}
              status={status}
              onToggle={() => {
                setExpandedPlanIds((current) => {
                  const next = new Set(current);
                  if (next.has(record.subscription.id)) {
                    next.delete(record.subscription.id);
                  } else {
                    next.add(record.subscription.id);
                  }
                  return next;
                });
              }}
            />
          );
        })}
      </div>
      {remainingCount > 0 ? (
        <button
          className="btn btn-ghost dashboard-plans-more"
          type="button"
          onClick={() =>
            setVisibleCount((current) =>
              Math.min(records.length, current + PLAN_BATCH_SIZE),
            )
          }
        >
          {localizeKey(language, "Show more plans ({{count}} remaining)", {
            count: remainingCount,
          })}
        </button>
      ) : null}
    </section>
  );
}
