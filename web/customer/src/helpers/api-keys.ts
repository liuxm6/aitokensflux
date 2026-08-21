import type { UserGroupSelectOption } from "../components/token/user-groups";
import { localizeKey } from "../i18n/localization";
import type {
  ApiKeyCreateForm,
  CustomerStatus,
  CustomerToken,
  Language,
} from "../types";
import {
  formatTimestamp,
  getDefaultApiKeyCreateForm,
  getQuotaPerUnit,
  toDateInputValue,
} from "./format";

export function buildTokenUpdatePayload(
  token: CustomerToken,
  name: string,
  group: string,
  expiredTime: number,
  remainQuota: number,
  unlimitedQuota: boolean,
  crossGroupRetry: boolean,
) {
  return {
    id: token.id,
    name,
    expired_time: expiredTime,
    remain_quota: unlimitedQuota ? 0 : remainQuota,
    unlimited_quota: unlimitedQuota,
    model_limits_enabled: Boolean(token.model_limits_enabled),
    model_limits: token.model_limits || "",
    allow_ips: token.allow_ips ?? "",
    group,
    cross_group_retry: group === "auto" ? crossGroupRetry : false,
  };
}

export function getApiKeyEditForm(
  token: CustomerToken,
  status?: CustomerStatus | null,
): ApiKeyCreateForm {
  const expiredTime = Number(token.expired_time ?? -1);
  return {
    name: token.name || "",
    group: token.group || "",
    expiryMode: expiredTime > 0 ? "custom" : "never",
    expiryDate:
      expiredTime > 0
        ? toDateInputValue(new Date(expiredTime * 1000))
        : getDefaultApiKeyCreateForm().expiryDate,
    quotaLimit: getApiKeyQuotaLimitInputValue(token.remain_quota ?? 0, status),
    unlimitedQuota: Boolean(token.unlimited_quota),
  };
}

export function getApiKeyQuotaLimitInputValue(
  quota: number,
  status?: CustomerStatus | null,
) {
  const value =
    status?.quota_display_type?.toUpperCase() === "TOKENS"
      ? Number(quota)
      : Number(quota) / getQuotaPerUnit(status);
  if (!Number.isFinite(value)) return "0";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(6).replace(/\.?0+$/, "");
}

export function formatTokenGroupLabel(
  token: CustomerToken,
  groupOptions: UserGroupSelectOption[],
  language: Language,
) {
  const group = (token.group || "").trim();
  if (!group) return localizeKey(language, "Select group");
  const option = groupOptions.find((item) => item.name === group);
  if (!option) return group;
  const parts = [group];
  if (option.ratio) parts.push(option.ratio);
  return parts.join(" · ");
}

export function formatApiKey(key: string) {
  if (!key) return "sk-";
  return key.startsWith("sk-") ? key : `sk-${key}`;
}

export function isApiKeyExpired(expiredTime?: number | null) {
  return (
    Number(expiredTime ?? 0) > 0 && Number(expiredTime) <= Date.now() / 1000
  );
}

export function getApiKeyExpiryLabel(
  expiredTime: number | null | undefined,
  language: Language,
) {
  if (!expiredTime || expiredTime < 0) {
    return localizeKey(language, "Expires: Never");
  }
  const date = formatTimestamp(expiredTime);
  if (isApiKeyExpired(expiredTime)) {
    return localizeKey(language, "Expired: {{date}}", { date });
  }
  return localizeKey(language, "Expires: {{date}}", { date });
}

export function getApiKeyDisplayName(
  token: Pick<CustomerToken, "name">,
  language: Language,
) {
  const name = token.name?.trim() ?? "";
  return name ? name : localizeKey(language, "Unnamed key");
}
