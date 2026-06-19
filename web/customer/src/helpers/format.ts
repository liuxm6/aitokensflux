import type {
  ApiKeyCreateForm,
  CustomerStatus,
  CustomerSubscription,
  CustomerSubscriptionRecord,
  PageData,
  SubscriptionPlanRecord,
} from "../types";

export const DEFAULT_QUOTA_PER_UNIT = 500000;

export function getQuotaPerUnit(status?: CustomerStatus | null) {
  const value = Number(status?.quota_per_unit);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_QUOTA_PER_UNIT;
}

export function formatCompactNumber(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (abs >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${Math.round(value)}`;
}

export function formatCurrencyAmount(amount?: number, currency?: string) {
  const value = Number(amount ?? 0);
  const normalized = Number.isFinite(value) ? value : 0;
  const code = (currency || "USD").toUpperCase();
  const hasFraction = Math.abs(normalized - Math.trunc(normalized)) > 0.000001;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 6,
    }).format(normalized);
  } catch {
    return `${code} ${normalized.toFixed(hasFraction ? 2 : 0)}`;
  }
}

export function formatQuotaMoney(
  quota?: number | null,
  status?: CustomerStatus | null,
) {
  const value = Number(quota ?? 0) / getQuotaPerUnit(status);
  return `$${value.toFixed(2)}`;
}

export function formatQuotaTokens(quota?: number | null) {
  return `${formatCompactNumber(Number(quota ?? 0))} tokens`;
}

export function formatTimestamp(timestamp?: number | null) {
  if (!timestamp) return "-";
  return new Date(timestamp * 1000).toLocaleDateString();
}

export function formatSubscriptionResetDisplayTime(
  subscription?: CustomerSubscription | null,
) {
  return subscription?.end_time ? formatTimestamp(subscription.end_time) : "-";
}

export function formatDateTime(timestamp?: number | null) {
  if (!timestamp) return "-";
  return new Date(timestamp * 1000).toLocaleString();
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultApiKeyExpiryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return toDateInputValue(date);
}

export function getDefaultApiKeyCreateForm(): ApiKeyCreateForm {
  return {
    name: "",
    expiryMode: "never",
    expiryDate: getDefaultApiKeyExpiryDate(),
    quotaLimit: "10",
    unlimitedQuota: true,
  };
}

export function getApiKeyExpiryTimestamp(form: ApiKeyCreateForm) {
  if (form.expiryMode === "never") return -1;
  if (form.expiryMode === "custom") {
    if (!form.expiryDate) return null;
    const customDate = new Date(`${form.expiryDate}T23:59:59`);
    const timestamp = Math.floor(customDate.getTime() / 1000);
    return Number.isFinite(timestamp) ? timestamp : null;
  }
  const days = Number.parseInt(form.expiryMode.replace("d", ""), 10);
  if (!Number.isFinite(days) || days <= 0) return null;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return Math.floor(date.getTime() / 1000);
}

export function parseApiKeyQuotaLimit(
  value: string,
  status?: CustomerStatus | null,
) {
  const amount = Number(value.trim());
  if (!Number.isFinite(amount)) return Number.NaN;
  if (status?.quota_display_type?.toUpperCase() === "TOKENS") {
    return Math.floor(amount);
  }
  return Math.round(amount * getQuotaPerUnit(status));
}

export function getApiKeyQuotaLimitUnit(status?: CustomerStatus | null) {
  return status?.quota_display_type?.toUpperCase() === "TOKENS"
    ? "tokens"
    : "USD";
}

export function getUnixRangeFromDates(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59`);
  return {
    start: Math.floor(start.getTime() / 1000),
    end: Math.floor(end.getTime() / 1000),
  };
}

export function getTodayUnixRange() {
  const today = toDateInputValue(new Date());
  return getUnixRangeFromDates(today, today);
}

export function getDefaultUsageDates() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
}

export function normalizePageItems<T>(data: PageData<T> | T[] | undefined) {
  if (Array.isArray(data)) return data;
  return data?.items ?? [];
}

export function normalizePageData<T>(
  data: PageData<T> | T[] | undefined,
  fallbackPage: number,
  fallbackPageSize: number,
) {
  const items = normalizePageItems(data);
  if (Array.isArray(data)) {
    return {
      items,
      page: fallbackPage,
      pageSize: fallbackPageSize,
      total: items.length,
    };
  }
  return {
    items,
    page: data?.page ?? fallbackPage,
    pageSize: data?.page_size ?? fallbackPageSize,
    total: data?.total ?? items.length,
  };
}

export function getActiveSubscriptionRecords(
  records?: CustomerSubscriptionRecord[],
): CustomerSubscriptionRecord[] {
  const now = Math.floor(Date.now() / 1000);
  return (records ?? [])
    .filter(
      (item) =>
        item.subscription.status === "active" &&
        item.subscription.end_time > now,
    )
    .sort((a, b) => {
      const quotaDiff =
        Number(b.subscription.amount_total || 0) -
        Number(a.subscription.amount_total || 0);
      if (quotaDiff !== 0) return quotaDiff;
      return b.subscription.end_time - a.subscription.end_time;
    });
}

export function mapPlansById(records?: SubscriptionPlanRecord[]) {
  return new Map((records ?? []).map((item) => [item.plan.id, item.plan]));
}
