import { getQuotaPerUnit } from "./format";
import { localizeKey } from "../i18n/localization";
import type { CustomerStatus, Language, UsageLog } from "../types";

export type LogOther = Record<string, unknown>;
export type DetailSegment = {
  text: string;
  muted?: boolean;
  danger?: boolean;
};

export type UsageQueryOverride = {
  startDateTime?: string;
  endDateTime?: string;
  modelName?: string;
};

export const usagePageSizeDefault = 100;
export const usagePageSizeOptions = [50, 100, 200];

export function padDatePart(value: number) {
  return `${value}`.padStart(2, "0");
}

export function toDateTimeLocalValue(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(
    date.getDate(),
  )}T${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
}

export function getDefaultUsageDateTimes() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return {
    startDateTime: toDateTimeLocalValue(start),
    endDateTime: toDateTimeLocalValue(now),
  };
}

export function parseDateTimeTimestamp(value: string) {
  const timestamp = Math.floor(new Date(value).getTime() / 1000);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function getUnixRangeFromDateTimes(
  startDateTime: string,
  endDateTime: string,
) {
  return {
    start: parseDateTimeTimestamp(startDateTime),
    end: parseDateTimeTimestamp(endDateTime),
  };
}

export function formatUsageDateTime(timestamp?: number | null) {
  if (!timestamp) return "-";
  const date = new Date(timestamp * 1000);
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(
    date.getDate(),
  )} ${padDatePart(date.getHours())}:${padDatePart(
    date.getMinutes(),
  )}:${padDatePart(date.getSeconds())}`;
}

export function formatInteger(value?: number | null) {
  return new Intl.NumberFormat("en-US").format(Number(value ?? 0));
}

export function formatQuotaMoneyDetailed(
  quota?: number | null,
  status?: CustomerStatus | null,
  digits = 6,
) {
  const numericQuota = Number(quota ?? 0);
  if (!numericQuota) return "$0";
  const value = numericQuota / getQuotaPerUnit(status);
  return `$${value.toFixed(digits)}`;
}

export function formatCompactPrice(value: number) {
  if (!Number.isFinite(value)) return "-";
  const fixed = Math.abs(value) >= 1 ? value.toFixed(2) : value.toFixed(6);
  return fixed.replace(/\.?0+$/, "");
}

export function formatDuration(seconds?: number | null) {
  const value = Number(seconds ?? 0);
  if (!Number.isFinite(value) || value <= 0) return "-";
  if (value < 1) return `${Math.round(value * 1000)}ms`;
  return `${value.toFixed(1)}s`;
}

export function parseLogOther(other?: string): LogOther {
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

export function getNumberValue(other: LogOther, key: string) {
  const value = other[key];
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

export function getBooleanValue(other: LogOther, key: string) {
  return other[key] === true;
}

export function getStringValue(other: LogOther, key: string) {
  const value = other[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function getCacheReadTokens(other: LogOther) {
  return getNumberValue(other, "cache_tokens") ?? 0;
}

export function getCacheWriteTokens(other: LogOther) {
  const explicitTotal = getNumberValue(other, "cache_write_tokens");
  if (explicitTotal !== undefined) return explicitTotal;
  const splitTotal =
    (getNumberValue(other, "cache_creation_tokens_5m") ?? 0) +
    (getNumberValue(other, "cache_creation_tokens_1h") ?? 0);
  if (splitTotal > 0) return splitTotal;
  return getNumberValue(other, "cache_creation_tokens") ?? 0;
}

export function getDisplayInputTokens(log: UsageLog, other: LogOther) {
  return getNumberValue(other, "input_tokens_total") ?? log.prompt_tokens ?? 0;
}

export function getFirstResponseSeconds(other: LogOther) {
  const firstResponseMs =
    getNumberValue(other, "frt") ??
    getNumberValue(other, "first_response_time_ms") ??
    getNumberValue(other, "ttft_ms");
  if (firstResponseMs && firstResponseMs > 0) return firstResponseMs / 1000;
  return undefined;
}

export function getResponseTone(seconds?: number | null, completionTokens = 0) {
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

export function getFirstResponseTone(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds)) return "neutral";
  if (seconds < 5) return "success";
  if (seconds < 10) return "warning";
  return "danger";
}

export function getLogTypeMeta(type: number) {
  if (type === 2) return { labelId: "Consumption", tone: "success" };
  if (type === 5) return { labelId: "Error", tone: "danger" };
  if (type === 6) return { labelId: "Refund", tone: "warning" };
  if (type === 1) return { labelId: "Top-up", tone: "info" };
  return { labelId: "Other", tone: "muted" };
}

export function getCacheSummary(other: LogOther, language: Language) {
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

export function getCacheTokenLine(other: LogOther, language: Language) {
  return getCacheSummary(other, language) || localizeKey(language, "No cache");
}

export function isViolationFeeLog(other: LogOther) {
  return (
    getBooleanValue(other, "violation_fee") ||
    Boolean(getStringValue(other, "violation_fee_code")) ||
    Boolean(getStringValue(other, "violation_fee_marker"))
  );
}

export function getMappedModelSubline(other: LogOther, language: Language) {
  const upstreamModelName = getStringValue(other, "upstream_model_name");
  if (!getBooleanValue(other, "is_model_mapped") || !upstreamModelName) {
    return "";
  }
  return localizeKey(language, "Actual model: {{model}}", {
    model: upstreamModelName,
  });
}

export function buildBillingSegments(
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

export function getPageItems(current: number, total: number) {
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
