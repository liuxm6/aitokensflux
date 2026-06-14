import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  KeyRound,
  RotateCcw,
  Search,
} from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/common/EmptyState";
import { ModelIcon } from "../../components/common/ModelIcon";
import { Panel } from "../../components/common/ui/Panel";
import {
  ConsolePageTitle,
  CustomerShell,
} from "../../components/layout/CustomerShell";
import { LanguageContext, T } from "../../context/Language";
import { useToastMessage } from "../../context/Toast";
import { getQuotaPerUnit, normalizePageItems } from "../../helpers/format";
import { localizeKey } from "../../i18n/localization";
import {
  fetchCustomerStatus,
  fetchUserLogs,
  fetchUserLogStats,
} from "../../services/customer-api";
import type {
  CustomerLogStats,
  CustomerStatus,
  Language,
  UsageLog,
} from "../../types";

type LogOther = Record<string, unknown>;
type DetailSegment = {
  text: string;
  muted?: boolean;
  danger?: boolean;
};

type UsageQueryOverride = {
  startDateTime?: string;
  endDateTime?: string;
  modelName?: string;
};

const usagePageSizeDefault = 100;
const usagePageSizeOptions = [50, 100, 200];

function padDatePart(value: number) {
  return `${value}`.padStart(2, "0");
}

function toDateTimeLocalValue(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(
    date.getDate(),
  )}T${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
}

function getDefaultUsageDateTimes() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return {
    startDateTime: toDateTimeLocalValue(start),
    endDateTime: toDateTimeLocalValue(now),
  };
}

function parseDateTimeTimestamp(value: string) {
  const timestamp = Math.floor(new Date(value).getTime() / 1000);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getUnixRangeFromDateTimes(startDateTime: string, endDateTime: string) {
  return {
    start: parseDateTimeTimestamp(startDateTime),
    end: parseDateTimeTimestamp(endDateTime),
  };
}

function formatUsageDateTime(timestamp?: number | null) {
  if (!timestamp) return "-";
  const date = new Date(timestamp * 1000);
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(
    date.getDate(),
  )} ${padDatePart(date.getHours())}:${padDatePart(
    date.getMinutes(),
  )}:${padDatePart(date.getSeconds())}`;
}

function formatInteger(value?: number | null) {
  return new Intl.NumberFormat("en-US").format(Number(value ?? 0));
}

function formatQuotaMoneyDetailed(
  quota?: number | null,
  status?: CustomerStatus | null,
  digits = 6,
) {
  const numericQuota = Number(quota ?? 0);
  if (!numericQuota) return "$0";
  const value = numericQuota / getQuotaPerUnit(status);
  return `$${value.toFixed(digits)}`;
}

function formatCompactPrice(value: number) {
  if (!Number.isFinite(value)) return "-";
  const fixed = Math.abs(value) >= 1 ? value.toFixed(2) : value.toFixed(6);
  return fixed.replace(/\.?0+$/, "");
}

function formatDuration(seconds?: number | null) {
  const value = Number(seconds ?? 0);
  if (!Number.isFinite(value) || value <= 0) return "-";
  if (value < 1) return `${Math.round(value * 1000)}ms`;
  return `${value.toFixed(1)}s`;
}

function parseLogOther(other?: string): LogOther {
  if (!other) return {};
  try {
    const parsed: unknown = JSON.parse(other);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as LogOther;
    }
  } catch {
    return {};
  }
  return {};
}

function getNumberValue(other: LogOther, key: string) {
  const value = other[key];
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function getBooleanValue(other: LogOther, key: string) {
  return other[key] === true;
}

function getStringValue(other: LogOther, key: string) {
  const value = other[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getEffectiveGroupRatio(other: LogOther) {
  const userGroupRatio = getNumberValue(other, "user_group_ratio");
  if (userGroupRatio && userGroupRatio > 0) return userGroupRatio;
  const groupRatio = getNumberValue(other, "group_ratio");
  return groupRatio && groupRatio > 0 ? groupRatio : undefined;
}

function formatRatio(value?: number) {
  if (!value || !Number.isFinite(value)) return "";
  return `${value.toFixed(3).replace(/\.?0+$/, "")}x`;
}

function getCacheReadTokens(other: LogOther) {
  return getNumberValue(other, "cache_tokens") ?? 0;
}

function getCacheWriteTokens(other: LogOther) {
  const explicitTotal = getNumberValue(other, "cache_write_tokens");
  if (explicitTotal !== undefined) return explicitTotal;
  const splitTotal =
    (getNumberValue(other, "cache_creation_tokens_5m") ?? 0) +
    (getNumberValue(other, "cache_creation_tokens_1h") ?? 0);
  if (splitTotal > 0) return splitTotal;
  return getNumberValue(other, "cache_creation_tokens") ?? 0;
}

function getDisplayInputTokens(log: UsageLog, other: LogOther) {
  return getNumberValue(other, "input_tokens_total") ?? log.prompt_tokens ?? 0;
}

function getFirstResponseSeconds(other: LogOther) {
  const firstResponseMs =
    getNumberValue(other, "frt") ??
    getNumberValue(other, "first_response_time_ms") ??
    getNumberValue(other, "ttft_ms");
  if (firstResponseMs && firstResponseMs > 0) return firstResponseMs / 1000;
  return undefined;
}

function getResponseTone(seconds?: number | null, completionTokens = 0) {
  const value = Number(seconds ?? 0);
  if (!Number.isFinite(value) || value <= 0) return "neutral";
  if (completionTokens >= 100) {
    const tokensPerSecond = completionTokens / value;
    if (tokensPerSecond >= 30) return "success";
    if (tokensPerSecond >= 15) return "warning";
    return "danger";
  }
  if (value < 10) return "success";
  if (value < 30) return "warning";
  return "danger";
}

function getFirstResponseTone(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds)) return "neutral";
  if (seconds < 5) return "success";
  if (seconds < 10) return "warning";
  return "danger";
}

function getLogTypeMeta(type: number) {
  if (type === 2) return { labelId: "Consumption", tone: "success" };
  if (type === 5) return { labelId: "Error", tone: "danger" };
  if (type === 6) return { labelId: "Refund", tone: "warning" };
  if (type === 1) return { labelId: "Top-up", tone: "info" };
  return { labelId: "Other", tone: "muted" };
}

function getTokenSubline(log: UsageLog, other: LogOther) {
  const parts = [log.group || getStringValue(other, "billing_source")].filter(
    Boolean,
  );
  const ratio = formatRatio(getEffectiveGroupRatio(other));
  if (ratio) parts.push(ratio);
  return parts.join(" · ");
}

function getCacheSummary(other: LogOther, language: Language) {
  const parts: string[] = [];
  const cacheReadTokens = getCacheReadTokens(other);
  const cacheWriteTokens = getCacheWriteTokens(other);
  if (cacheReadTokens > 0) {
    parts.push(
      localizeKey(language, "Cache read {{tokens}}", {
        tokens: formatInteger(cacheReadTokens),
      }),
    );
  }
  if (cacheWriteTokens > 0) {
    parts.push(
      localizeKey(language, "Cache write {{tokens}}", {
        tokens: formatInteger(cacheWriteTokens),
      }),
    );
  }
  return parts.join(" · ");
}

function getCacheTokenLine(other: LogOther, language: Language) {
  return getCacheSummary(other, language) || localizeKey(language, "No cache");
}

function isViolationFeeLog(other: LogOther) {
  return (
    getBooleanValue(other, "violation_fee") ||
    Boolean(getStringValue(other, "violation_fee_code")) ||
    Boolean(getStringValue(other, "violation_fee_marker"))
  );
}

function getMappedModelSubline(other: LogOther, language: Language) {
  const upstreamModelName = getStringValue(other, "upstream_model_name");
  if (!getBooleanValue(other, "is_model_mapped") || !upstreamModelName) {
    return "";
  }
  return localizeKey(language, "Actual model: {{model}}", {
    model: upstreamModelName,
  });
}

function buildBillingSegments(
  log: UsageLog,
  other: LogOther,
  language: Language,
  status?: CustomerStatus | null,
): DetailSegment[] {
  const segments: DetailSegment[] = [];

  if (log.type === 5) {
    segments.push({ text: localizeKey(language, "Error"), danger: true });
    if (log.content) segments.push({ text: log.content, muted: true });
    return segments;
  }

  if (log.type === 6) {
    segments.push({ text: localizeKey(language, "Async task refund") });
    if (log.content) segments.push({ text: log.content, muted: true });
    return segments;
  }

  if (log.type !== 2) {
    if (log.content) segments.push({ text: log.content });
    return segments;
  }

  if (isViolationFeeLog(other)) {
    const violationCode = getStringValue(other, "violation_fee_code");
    segments.push({
      text: localizeKey(language, "Violation fee"),
      danger: true,
    });
    if (violationCode) segments.push({ text: violationCode, muted: true });
    segments.push({
      text: `${localizeKey(language, "Fee")}: ${formatQuotaMoneyDetailed(
        getNumberValue(other, "fee_quota") ?? log.quota ?? 0,
        status,
      )}`,
      muted: true,
    });
    return segments;
  }

  if (getStringValue(other, "billing_mode") === "tiered_expr") {
    segments.push({
      text: `${localizeKey(language, "Dynamic pricing")} · ${
        getStringValue(other, "matched_tier") ||
        localizeKey(language, "Matched tier")
      }`,
    });
    const cacheSummary = getCacheSummary(other, language);
    if (cacheSummary) segments.push({ text: cacheSummary, muted: true });
    return segments;
  }

  const modelPrice = getNumberValue(other, "model_price");
  if (modelPrice !== undefined && modelPrice >= 0) {
    segments.push({
      text: `${localizeKey(language, "Per request")} · $${formatCompactPrice(
        modelPrice,
      )}`,
    });
  } else if (getNumberValue(other, "model_ratio") !== undefined) {
    const modelRatio = getNumberValue(other, "model_ratio") ?? 0;
    const completionRatio = getNumberValue(other, "completion_ratio") ?? 0;
    const inputPrice = modelRatio * 2;
    const outputPrice = inputPrice * completionRatio;
    segments.push({
      text: `${localizeKey(language, "Standard")} · $${formatCompactPrice(
        inputPrice,
      )} / $${formatCompactPrice(outputPrice)}/M`,
    });
    const cacheSummary = getCacheSummary(other, language);
    if (cacheSummary) segments.push({ text: cacheSummary, muted: true });
  } else {
    const ratio = formatRatio(getEffectiveGroupRatio(other));
    if (ratio) {
      segments.push({
        text: `${localizeKey(language, "Group ratio")} ${ratio}`,
      });
    }
  }

  if (getStringValue(other, "billing_source") === "subscription") {
    const planTitle = getStringValue(other, "subscription_plan_title");
    const consumed = getNumberValue(other, "subscription_consumed");
    const remain = getNumberValue(other, "subscription_remain");
    const total = getNumberValue(other, "subscription_total");
    segments.push({
      text: planTitle
        ? `${localizeKey(language, "Subscription")} · ${planTitle}`
        : localizeKey(language, "Subscription"),
      muted: true,
    });
    if (consumed !== undefined) {
      segments.push({
        text: `${localizeKey(language, "Subscription used")}: ${formatInteger(
          consumed,
        )}`,
        muted: true,
      });
    }
    if (remain !== undefined && total !== undefined) {
      segments.push({
        text: `${localizeKey(language, "Subscription remaining")}: ${formatInteger(
          remain,
        )}/${formatInteger(total)}`,
        muted: true,
      });
    }
  }

  if (getBooleanValue(other, "is_system_prompt_overwritten")) {
    segments.push({
      text: localizeKey(language, "System prompt override"),
      danger: true,
    });
  }

  if (log.content) segments.push({ text: log.content, muted: true });
  if (log.request_id) segments.push({ text: log.request_id, muted: true });

  return segments.length > 0
    ? segments
    : [{ text: localizeKey(language, "Standard") }];
}

function getPageItems(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const items: Array<number | "ellipsis-left" | "ellipsis-right"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("ellipsis-left");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push("ellipsis-right");
  items.push(total);
  return items;
}

export function UsagePage() {
  const { language } = useContext(LanguageContext);
  const defaultDateTimes = useMemo(() => getDefaultUsageDateTimes(), []);
  const [status, setStatus] = useState<CustomerStatus | null>(null);
  const [startDateTime, setStartDateTime] = useState(
    defaultDateTimes.startDateTime,
  );
  const [endDateTime, setEndDateTime] = useState(defaultDateTimes.endDateTime);
  const [modelName, setModelName] = useState("");
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [stats, setStats] = useState<CustomerLogStats | null>(null);
  const [usagePage, setUsagePage] = useState(1);
  const [usagePageSize, setUsagePageSize] = useState(usagePageSizeDefault);
  const [usageTotal, setUsageTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  useToastMessage(message);

  const getQuery = (override?: UsageQueryOverride) => ({
    startDateTime: override?.startDateTime ?? startDateTime,
    endDateTime: override?.endDateTime ?? endDateTime,
    modelName: override?.modelName ?? modelName,
  });

  const loadUsage = async (
    nextPage = usagePage,
    nextPageSize = usagePageSize,
    override?: UsageQueryOverride,
  ) => {
    const query = getQuery(override);
    const normalizedPage = Math.max(1, nextPage);
    const range = getUnixRangeFromDateTimes(
      query.startDateTime,
      query.endDateTime,
    );
    if (!range.start || !range.end || range.start > range.end) {
      setMessage(localizeKey(language, "Start date cannot be after end date"));
      return;
    }
    setLoading(true);
    const trimmedFilters = {
      modelName: query.modelName.trim() || undefined,
      type: 2,
    };
    const [statusRes, statsRes, logsRes] = await Promise.all([
      fetchCustomerStatus(),
      fetchUserLogStats(range.start, range.end, trimmedFilters),
      fetchUserLogs({
        page: normalizedPage,
        pageSize: nextPageSize,
        type: trimmedFilters.type,
        startTimestamp: range.start,
        endTimestamp: range.end,
        modelName: trimmedFilters.modelName,
      }),
    ]);
    if (statusRes.success && statusRes.data) setStatus(statusRes.data);
    if (statsRes.success && statsRes.data) setStats(statsRes.data);
    if (logsRes.success) {
      const items = normalizePageItems(logsRes.data);
      setLogs(items);
      setUsagePage(
        Array.isArray(logsRes.data)
          ? normalizedPage
          : (logsRes.data?.page ?? normalizedPage),
      );
      setUsagePageSize(
        Array.isArray(logsRes.data)
          ? nextPageSize
          : (logsRes.data?.page_size ?? nextPageSize),
      );
      setUsageTotal(
        Array.isArray(logsRes.data)
          ? items.length
          : (logsRes.data?.total ?? items.length),
      );
      setMessage("");
    } else {
      setMessage(
        logsRes.message ||
          localizeKey(language, "Failed to load usage details"),
      );
    }
    setLoading(false);
  };

  const resetFilters = () => {
    const nextDates = getDefaultUsageDateTimes();
    setStartDateTime(nextDates.startDateTime);
    setEndDateTime(nextDates.endDateTime);
    setModelName("");
    void loadUsage(1, usagePageSizeDefault, {
      startDateTime: nextDates.startDateTime,
      endDateTime: nextDates.endDateTime,
      modelName: "",
    });
  };

  const usageTotalPages = Math.max(
    1,
    Math.ceil(usageTotal / Math.max(1, usagePageSize)),
  );
  const usageStartRow =
    usageTotal === 0 ? 0 : (usagePage - 1) * usagePageSize + 1;
  const usageEndRow =
    usageTotal === 0 ? 0 : Math.min(usagePage * usagePageSize, usageTotal);

  const goUsagePage = (nextPage: number) => {
    if (loading) return;
    const boundedPage = Math.min(Math.max(1, nextPage), usageTotalPages);
    if (boundedPage === usagePage) return;
    void loadUsage(boundedPage);
  };

  const changePageSize = (value: number) => {
    setUsagePageSize(value);
    void loadUsage(1, value);
  };

  useEffect(() => {
    void loadUsage(1, usagePageSizeDefault);
  }, []);

  return (
    <CustomerShell crumbId="Usage" page="usage">
      <ConsolePageTitle id="Usage details" />
      <Panel className="usage-panel usage-detail-panel">
        <div className="usage-toolbar">
          <div className="usage-filter-grid">
            <div className="usage-date-time-range">
              <Clock3 size={16} />
              <input
                aria-label={localizeKey(language, "Start time")}
                type="datetime-local"
                value={startDateTime}
                onChange={(event) =>
                  setStartDateTime(event.currentTarget.value)
                }
              />
              <span>~</span>
              <input
                aria-label={localizeKey(language, "End time")}
                type="datetime-local"
                value={endDateTime}
                onChange={(event) => setEndDateTime(event.currentTarget.value)}
              />
            </div>
            <input
              className="usage-filter-control"
              value={modelName}
              placeholder={localizeKey(language, "Model name")}
              onChange={(event) => setModelName(event.currentTarget.value)}
            />
            <div className="usage-filter-inline-actions">
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={resetFilters}
              >
                <RotateCcw size={15} />
                <T id="Reset" />
              </button>
              <button
                className="btn btn-flux btn-sm"
                type="button"
                onClick={() => void loadUsage(1)}
              >
                <Search size={15} />
                <T id="Search" />
              </button>
            </div>
          </div>
          <div className="usage-filter-actions">
            <div className="usage-stat-pills" aria-live="polite">
              <span>
                <T id="Total consumed" />
                <b>{formatQuotaMoneyDetailed(stats?.quota ?? 0, status, 4)}</b>
              </span>
              <span>
                RPM <b>{formatInteger(stats?.rpm ?? 0)}</b>
              </span>
              <span>
                TPM <b>{formatInteger(stats?.tpm ?? 0)}</b>
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <EmptyState id="Loading usage details" />
        ) : logs.length > 0 ? (
          <div className="usage-table-wrap">
            <table className="usage-log-table">
              <thead>
                <tr>
                  {[
                    "Time",
                    "Token",
                    "Model",
                    "Latency",
                    "Tokens",
                    "Cost",
                    "Details",
                  ].map((header) => (
                    <th key={header}>{localizeKey(language, header)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const other = parseLogOther(log.other);
                  const typeMeta = getLogTypeMeta(log.type);
                  const firstResponseSeconds = getFirstResponseSeconds(other);
                  const completionTokens = log.completion_tokens ?? 0;
                  const useTime = Number(log.use_time ?? 0);
                  const tokensPerSecond =
                    log.is_stream && useTime > 0
                      ? Math.round(completionTokens / useTime)
                      : 0;
                  const latencyTone = getResponseTone(
                    log.use_time,
                    completionTokens,
                  );
                  const firstResponseTone =
                    getFirstResponseTone(firstResponseSeconds);
                  const cacheTokenLine = getCacheTokenLine(other, language);
                  const tokenSubline = getTokenSubline(log, other);
                  const modelSubline = getMappedModelSubline(other, language);
                  const detailSegments = buildBillingSegments(
                    log,
                    other,
                    language,
                    status,
                  );
                  const visibleDetailSegments = detailSegments.slice(0, 2);
                  const hiddenDetailCount = Math.max(
                    0,
                    detailSegments.length - visibleDetailSegments.length,
                  );
                  const isSubscriptionBilling =
                    getStringValue(other, "billing_source") === "subscription";

                  return (
                    <tr key={`${log.id}-${log.created_at}-${log.request_id}`}>
                      <td>
                        <div className="usage-time-main mono">
                          {formatUsageDateTime(log.created_at)}
                        </div>
                        <span
                          className={`usage-type-dot usage-type-${typeMeta.tone}`}
                        >
                          {localizeKey(language, typeMeta.labelId)}
                        </span>
                      </td>
                      <td>
                        <div className="usage-token-pill">
                          <KeyRound size={14} />
                          <span className="mono">{log.token_name || "-"}</span>
                        </div>
                        {tokenSubline ? (
                          <div className="usage-cell-subtle">
                            {tokenSubline}
                          </div>
                        ) : null}
                      </td>
                      <td>
                        <div className="usage-model-pill">
                          <span className="usage-model-icon">
                            <ModelIcon modelName={log.model_name} />
                          </span>
                          <span className="mono">{log.model_name || "-"}</span>
                        </div>
                        {modelSubline ? (
                          <div className="usage-cell-subtle">
                            {modelSubline}
                          </div>
                        ) : null}
                      </td>
                      <td>
                        <div className="usage-latency-row">
                          <span className={`usage-latency-pill ${latencyTone}`}>
                            {formatDuration(log.use_time)}
                          </span>
                          {firstResponseSeconds ? (
                            <span
                              className={`usage-latency-pill ${firstResponseTone}`}
                            >
                              {formatDuration(firstResponseSeconds)}
                            </span>
                          ) : null}
                        </div>
                        <div className="usage-cell-subtle">
                          {log.is_stream
                            ? localizeKey(language, "Stream · {{rate}} t/s", {
                                rate: tokensPerSecond,
                              })
                            : localizeKey(language, "Non-stream")}
                        </div>
                      </td>
                      <td>
                        <div className="usage-token-count mono">
                          {formatInteger(getDisplayInputTokens(log, other))} /{" "}
                          {formatInteger(completionTokens)}
                        </div>
                        <div className="usage-cell-subtle">
                          {cacheTokenLine}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`usage-cost-pill mono${
                            isSubscriptionBilling ? " subscription" : ""
                          }`}
                        >
                          {isSubscriptionBilling
                            ? localizeKey(language, "Subscription")
                            : formatQuotaMoneyDetailed(log.quota ?? 0, status)}
                        </span>
                        {isSubscriptionBilling ? (
                          <div className="usage-cell-subtle mono">
                            {formatQuotaMoneyDetailed(log.quota ?? 0, status)}
                          </div>
                        ) : null}
                      </td>
                      <td>
                        <div className="usage-detail-stack">
                          {visibleDetailSegments.map((segment, index) => (
                            <div
                              key={`${segment.text}-${index}`}
                              className={`${
                                index === 0
                                  ? "usage-detail-main"
                                  : "usage-cell-subtle"
                              }${segment.danger ? " danger" : ""}${
                                segment.muted ? " muted" : ""
                              }`}
                              title={segment.text}
                            >
                              {segment.text}
                              {index === 0 && hiddenDetailCount > 0 ? (
                                <span className="usage-detail-more">
                                  +{hiddenDetailCount}
                                </span>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState id="No usage details" />
        )}

        {!loading && usageTotal > 0 ? (
          <div className="usage-pagination">
            <div className="usage-page-size">
              <select
                value={usagePageSize}
                aria-label={localizeKey(language, "Rows per page")}
                onChange={(event) => changePageSize(Number(event.target.value))}
              >
                {usagePageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span>
                <T id="Rows per page" />
              </span>
            </div>
            <span>
              {localizeKey(language, "{{start}}-{{end}} of {{total}}", {
                start: usageStartRow,
                end: usageEndRow,
                total: usageTotal,
              })}
            </span>
            <div className="usage-page-nav">
              <button
                className="usage-page-button"
                disabled={usagePage <= 1}
                type="button"
                onClick={() => goUsagePage(1)}
                aria-label={localizeKey(language, "First page")}
              >
                <ChevronsLeft size={15} />
              </button>
              <button
                className="usage-page-button"
                disabled={usagePage <= 1}
                type="button"
                onClick={() => goUsagePage(usagePage - 1)}
                aria-label={localizeKey(language, "Previous")}
              >
                <ChevronLeft size={15} />
              </button>
              <span className="usage-page-label">
                {localizeKey(language, "Page {{page}} of {{total}}", {
                  page: usagePage,
                  total: usageTotalPages,
                })}
              </span>
              {getPageItems(usagePage, usageTotalPages).map((item) =>
                typeof item === "number" ? (
                  <button
                    key={item}
                    className={`usage-page-button${
                      item === usagePage ? " active" : ""
                    }`}
                    type="button"
                    onClick={() => goUsagePage(item)}
                  >
                    {item}
                  </button>
                ) : (
                  <span key={item} className="usage-page-ellipsis">
                    ...
                  </span>
                ),
              )}
              <button
                className="usage-page-button"
                disabled={usagePage >= usageTotalPages}
                type="button"
                onClick={() => goUsagePage(usagePage + 1)}
                aria-label={localizeKey(language, "Next")}
              >
                <ChevronRight size={15} />
              </button>
              <button
                className="usage-page-button"
                disabled={usagePage >= usageTotalPages}
                type="button"
                onClick={() => goUsagePage(usageTotalPages)}
                aria-label={localizeKey(language, "Last page")}
              >
                <ChevronsRight size={15} />
              </button>
            </div>
          </div>
        ) : null}
      </Panel>
    </CustomerShell>
  );
}
