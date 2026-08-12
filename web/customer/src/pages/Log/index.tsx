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
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/common/ui/AsyncState";
import { ModelIcon } from "../../components/common/ModelIcon";
import { Panel } from "../../components/common/ui/Panel";
import { CustomerShell } from "../../components/layout/CustomerShell";
import { ConsolePageHeader } from "../../components/layout/ConsolePageHeader";
import { pageMeta } from "../../constants/page-meta";
import { LanguageContext, T } from "../../context/Language";
import { useToastMessage } from "../../context/Toast";
import { normalizePageItems } from "../../helpers/format";
import {
  buildBillingSegments,
  formatDuration,
  formatInteger,
  formatQuotaMoneyDetailed,
  formatUsageDateTime,
  getCacheTokenLine,
  getDefaultUsageDateTimes,
  getDisplayInputTokens,
  getFirstResponseSeconds,
  getFirstResponseTone,
  getLogTypeMeta,
  getMappedModelSubline,
  getPageItems,
  getResponseTone,
  getStringValue,
  getUnixRangeFromDateTimes,
  parseLogOther,
  usagePageSizeDefault,
  usagePageSizeOptions,
} from "../../helpers/usage-log";
import type { UsageQueryOverride } from "../../helpers/usage-log";
import { useLatestRequest } from "../../hooks/useLatestRequest";
import { localizeKey } from "../../i18n/localization";
import {
  fetchCustomerStatus,
  fetchUserLogs,
  fetchUserLogStats,
} from "../../services/customer-api";
import type { CustomerLogStats, CustomerStatus, UsageLog } from "../../types";

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
  const [loadError, setLoadError] = useState(false);
  const [message, setMessage] = useState("");
  useToastMessage(message);
  const beginUsageRequest = useLatestRequest();

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
    setLoadError(false);
    const isCurrent = beginUsageRequest();
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
    if (!isCurrent()) return;
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
      setLoadError(false);
      setMessage("");
    } else {
      setLoadError(true);
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
      <ConsolePageHeader
        descriptionId={pageMeta.usage.descriptionId}
        titleId="Usage details"
      />
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
              aria-label={localizeKey(language, "Model name")}
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
          <LoadingState id="Loading usage details" />
        ) : loadError ? (
          <ErrorState
            id="Failed to load usage details"
            onRetry={() => void loadUsage(1)}
          />
        ) : logs.length > 0 ? (
          <div
            aria-labelledby="usage-records-caption"
            className="usage-table-wrap"
            role="region"
            tabIndex={0}
          >
            <table className="usage-log-table">
              <caption className="sr-only" id="usage-records-caption">
                {localizeKey(language, "Usage records")}
              </caption>
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
                    <th key={header} scope="col">
                      {localizeKey(language, header)}
                    </th>
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
                      <td data-label={localizeKey(language, "Time")}>
                        <div className="usage-time-main mono">
                          {formatUsageDateTime(log.created_at)}
                        </div>
                        <span
                          className={`usage-type-dot usage-type-${typeMeta.tone}`}
                        >
                          {localizeKey(language, typeMeta.labelId)}
                        </span>
                      </td>
                      <td data-label={localizeKey(language, "Token")}>
                        <div className="usage-token-pill">
                          <KeyRound size={14} />
                          <span className="mono">{log.token_name || "-"}</span>
                        </div>
                      </td>
                      <td data-label={localizeKey(language, "Model")}>
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
                      <td data-label={localizeKey(language, "Latency")}>
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
                      <td data-label={localizeKey(language, "Tokens")}>
                        <div className="usage-token-count mono">
                          {formatInteger(getDisplayInputTokens(log, other))} /{" "}
                          {formatInteger(completionTokens)}
                        </div>
                        <div className="usage-cell-subtle">
                          {cacheTokenLine}
                        </div>
                      </td>
                      <td data-label={localizeKey(language, "Cost")}>
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
                      <td data-label={localizeKey(language, "Details")}>
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
            <nav
              aria-label={localizeKey(language, "Usage pagination")}
              className="usage-page-nav"
            >
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
                    aria-current={item === usagePage ? "page" : undefined}
                    aria-label={localizeKey(language, "Page {{page}}", {
                      page: item,
                    })}
                    className={`usage-page-button${
                      item === usagePage ? " active" : ""
                    }`}
                    type="button"
                    onClick={() => goUsagePage(item)}
                  >
                    {item}
                  </button>
                ) : (
                  <span
                    key={item}
                    aria-hidden="true"
                    className="usage-page-ellipsis"
                  >
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
            </nav>
          </div>
        ) : null}
      </Panel>
    </CustomerShell>
  );
}
