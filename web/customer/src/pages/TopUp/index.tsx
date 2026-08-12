import { Calendar, CircleDollarSign, RefreshCw } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/common/ui/AsyncState";
import { CustomerShell } from "../../components/layout/CustomerShell";
import { ConsolePageHeader } from "../../components/layout/ConsolePageHeader";
import { Panel } from "../../components/common/ui/Panel";
import { TabList, TabPanel } from "../../components/common/ui/TabList";
import { DataTable } from "../../components/table/DataTable";
import { TopupDialog } from "../../components/topup/TopupDialog";
import { pageMeta } from "../../constants/page-meta";
import { AuthContext } from "../../context/Auth";
import { LanguageContext, T } from "../../context/Language";
import { useToastMessage } from "../../context/Toast";
import {
  formatCurrencyAmount,
  formatDateTime,
  formatQuotaMoney,
  normalizePageItems,
} from "../../helpers/format";
import {
  getSubscriptionSourceLabel,
  getSubscriptionStatusLabel,
  getTopupStatusLabel,
} from "../../helpers/payments";
import { localizeKey } from "../../i18n/localization";
import {
  fetchCustomerSelf,
  fetchCustomerStatus,
  fetchSelfSubscription,
  fetchUserTopups,
} from "../../services/customer-api";
import type {
  BillingRecordType,
  CustomerStatus,
  CustomerSubscriptionRecord,
  TopupRecord,
} from "../../types";

const BILLING_RECORD_TABS_ID = "billing-records";

const BILLING_RECORD_TABS: { value: BillingRecordType; labelId: string }[] = [
  { value: "all", labelId: "All" },
  { value: "subscription", labelId: "Plan subscriptions" },
  { value: "topup", labelId: "PAYG top-ups" },
];

function BillingTypeChip({
  label,
  type,
}: {
  label: string;
  type: "subscription" | "topup";
}) {
  const Icon = type === "subscription" ? Calendar : CircleDollarSign;

  return (
    <span className={`billing-type-chip ${type}`}>
      <span className="billing-type-icon">
        <Icon aria-hidden="true" size={15} />
      </span>
      <span>{label}</span>
    </span>
  );
}

export function TopupPage() {
  const { user, setUser } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const billingFetchLimit = 200;
  const billingPageSize = 10;
  const [status, setStatus] = useState<CustomerStatus | null>(null);
  const [records, setRecords] = useState<TopupRecord[]>([]);
  const [subscriptionRecords, setSubscriptionRecords] = useState<
    CustomerSubscriptionRecord[]
  >([]);
  const [recordType, setRecordType] = useState<BillingRecordType>("all");
  const [billingPage, setBillingPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [message, setMessage] = useState("");
  const [topupDialogOpen, setTopupDialogOpen] = useState(false);
  useToastMessage(message);

  const loadBilling = async () => {
    setLoading(true);
    setLoadError(false);
    const [statusRes, selfRes, recordsRes, subRes] = await Promise.all([
      fetchCustomerStatus(),
      fetchCustomerSelf(),
      fetchUserTopups(1, billingFetchLimit),
      fetchSelfSubscription(),
    ]);
    if (statusRes.success && statusRes.data) setStatus(statusRes.data);
    if (selfRes.success && selfRes.data) setUser(selfRes.data);
    if (recordsRes.success) {
      setRecords(normalizePageItems(recordsRes.data));
    } else {
      setRecords([]);
    }
    if (subRes.success && subRes.data) {
      setSubscriptionRecords(subRes.data.all_subscriptions ?? []);
    } else {
      setSubscriptionRecords([]);
    }
    if (recordsRes.success && subRes.success) {
      setLoadError(false);
      setMessage("");
    } else {
      setLoadError(true);
      setMessage(
        recordsRes.message ||
          subRes.message ||
          localizeKey(language, "Failed to load billing records"),
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadBilling();
  }, [user?.id]);

  useEffect(() => {
    setBillingPage(1);
  }, [recordType]);

  const paygLeft = formatQuotaMoney(user?.quota ?? 0, status);
  const allBillingRows = useMemo(() => {
    const topupRows = records
      .filter((record) => Number(record.amount || 0) > 0)
      .map((record) => ({
        id: `topup-${record.id}`,
        type: "topup" as const,
        sortTime: record.create_time || record.complete_time || 0,
        cells: [
          formatDateTime(record.create_time || record.complete_time),
          <BillingTypeChip
            label={localizeKey(language, "PAYG top-up")}
            type="topup"
          />,
          <span
            className="billing-record-reference mono"
            title={record.trade_no || "-"}
          >
            {record.trade_no || "-"}
          </span>,
          record.payment_method || record.payment_provider || "-",
          formatQuotaMoney(record.amount, status),
          `$${Number(record.money || 0).toFixed(2)}`,
          getTopupStatusLabel(record.status, language),
        ],
      }));

    const subscriptionRows = subscriptionRecords.map((record) => {
      const subscription = record.subscription;
      const total = Number(
        subscription.amount_total ?? record.plan?.total_amount ?? 0,
      );
      const source = (subscription.source || "").toLowerCase();
      return {
        id: `subscription-${subscription.id}`,
        type: "subscription" as const,
        sortTime:
          subscription.start_time ||
          subscription.created_at ||
          subscription.end_time ||
          0,
        cells: [
          formatDateTime(subscription.start_time || subscription.created_at),
          <BillingTypeChip
            label={localizeKey(language, "Plan subscription")}
            type="subscription"
          />,
          <span
            className="billing-record-reference"
            title={record.plan?.title || `#${subscription.plan_id}`}
          >
            {record.plan?.title || `#${subscription.plan_id}`}
          </span>,
          getSubscriptionSourceLabel(subscription.source, language),
          total > 0
            ? formatQuotaMoney(total, status)
            : localizeKey(language, "Unlimited"),
          source === "admin"
            ? "-"
            : record.plan
              ? formatCurrencyAmount(
                  record.plan.price_amount,
                  record.plan.currency,
                )
              : "-",
          getSubscriptionStatusLabel(subscription.status, language),
        ],
      };
    });

    return [...topupRows, ...subscriptionRows]
      .filter((record) => recordType === "all" || record.type === recordType)
      .sort((a, b) => b.sortTime - a.sortTime);
  }, [language, recordType, records, status, subscriptionRecords]);
  const billingTotal = allBillingRows.length;
  const billingTotalPages = Math.max(
    1,
    Math.ceil(billingTotal / billingPageSize),
  );
  const boundedBillingPage = Math.min(billingPage, billingTotalPages);
  const billingStartIndex = (boundedBillingPage - 1) * billingPageSize;
  const billingRows = allBillingRows.slice(
    billingStartIndex,
    billingStartIndex + billingPageSize,
  );
  const billingStartRow = billingTotal === 0 ? 0 : billingStartIndex + 1;
  const billingEndRow =
    billingTotal === 0
      ? 0
      : Math.min(billingStartIndex + billingRows.length, billingTotal);

  useEffect(() => {
    if (billingPage > billingTotalPages) setBillingPage(billingTotalPages);
  }, [billingPage, billingTotalPages]);

  const goBillingPage = (nextPage: number) => {
    const boundedPage = Math.min(Math.max(1, nextPage), billingTotalPages);
    if (boundedPage !== billingPage) setBillingPage(boundedPage);
  };

  const emptyCopy =
    recordType === "subscription"
      ? "No plan subscription records"
      : recordType === "topup"
        ? "No PAYG top-up records"
        : "No billing records";

  return (
    <CustomerShell crumbId="Billing" page="topup">
      <ConsolePageHeader
        action={
          <>
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={() => void loadBilling()}
            >
              <RefreshCw size={15} />
              <T id="Refresh" />
            </button>
            <button
              className="btn btn-flux btn-sm"
              type="button"
              onClick={() => setTopupDialogOpen(true)}
            >
              <CircleDollarSign size={15} />
              <T id="Top up now" />
            </button>
          </>
        }
        descriptionId={pageMeta.topup.descriptionId}
        titleId="Billing records"
      />
      <Panel className="record-panel">
        <div className="record-toolbar">
          <div className="record-left">
            <TabList
              className="segmented-tabs"
              idPrefix={BILLING_RECORD_TABS_ID}
              label={localizeKey(language, "Billing record filter")}
              tabs={BILLING_RECORD_TABS.map((tab) => ({
                value: tab.value,
                label: localizeKey(language, tab.labelId),
              }))}
              value={recordType}
              onChange={setRecordType}
            />
            <span className="balance-pill">
              <T id="PAYG left" /> <b className="mono">{paygLeft}</b>
            </span>
          </div>
        </div>
        <TabPanel idPrefix={BILLING_RECORD_TABS_ID} value={recordType}>
          {loading ? (
            <LoadingState id="Loading billing records" />
          ) : loadError ? (
            <ErrorState
              id="Failed to load billing records"
              onRetry={() => void loadBilling()}
            />
          ) : billingRows.length > 0 ? (
            <DataTable
              caption="Billing records"
              className="billing-record-table"
              headers={[
                "Time",
                "Type",
                "Name / Trade No.",
                "Method",
                "Quota",
                "Paid",
                "Status",
              ]}
              mobileLabels={[
                "Time",
                "Type",
                "Name / Trade No.",
                "Method",
                "Quota",
                "Paid",
                "Status",
              ]}
              numericColumns={[4, 5]}
              rowKeys={billingRows.map((record) => record.id)}
              rows={billingRows.map((record) => record.cells)}
            />
          ) : (
            <EmptyState id={emptyCopy} />
          )}
        </TabPanel>
        {!loading && billingTotal > billingPageSize ? (
          <div className="usage-pagination record-pagination">
            <span>
              {localizeKey(language, "{{start}}-{{end}} of {{total}}", {
                start: billingStartRow,
                end: billingEndRow,
                total: billingTotal,
              })}
            </span>
            <div>
              <button
                className="btn btn-ghost btn-sm"
                disabled={boundedBillingPage <= 1}
                type="button"
                onClick={() => goBillingPage(boundedBillingPage - 1)}
              >
                <T id="Previous" />
              </button>
              <b>
                {boundedBillingPage} / {billingTotalPages}
              </b>
              <button
                className="btn btn-ghost btn-sm"
                disabled={boundedBillingPage >= billingTotalPages}
                type="button"
                onClick={() => goBillingPage(boundedBillingPage + 1)}
              >
                <T id="Next" />
              </button>
            </div>
          </div>
        ) : null}
      </Panel>
      {topupDialogOpen ? (
        <TopupDialog onClose={() => setTopupDialogOpen(false)} />
      ) : null}
    </CustomerShell>
  );
}
