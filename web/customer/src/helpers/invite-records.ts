import type { InviteRecordTab, UsageLog } from "../types";

const inviterGrantMarker = "\u9080\u8bf7\u7528\u6237\u8d60\u9001";
const inviteeGrantMarker = "\u4f7f\u7528\u9080\u8bf7\u7801\u8d60\u9001";
const inviteMarker = "\u9080\u8bf7";
const quotaUnitMarker = "\u70b9\u989d\u5ea6";

export function getInviteLogKind(log: UsageLog): InviteRecordTab | null {
  const content = log.content || "";
  const lower = content.toLowerCase();
  if (
    content.includes(inviterGrantMarker) ||
    lower.includes("invite user") ||
    lower.includes("inviter")
  ) {
    return "inviter";
  }
  if (
    content.includes(inviteeGrantMarker) ||
    lower.includes("invite code") ||
    lower.includes("invitee")
  ) {
    return "invitee";
  }
  if (content.includes(inviteMarker) || lower.includes("invite")) {
    return "all";
  }
  return null;
}

export function isInviteLog(log: UsageLog) {
  return getInviteLogKind(log) !== null;
}

export function extractInviteQuotaLabel(content?: string) {
  if (!content) return "-";
  const normalized = content.replace(/\uff04/g, "$");
  const currencyMatch = normalized.match(/[$¥¤]\s*\d+(?:\.\d+)?/);
  if (currencyMatch) return currencyMatch[0].replace(/\s+/g, "");
  const tokenMatch = normalized.match(
    new RegExp(`\\d+(?:\\.\\d+)?\\s*(?:${quotaUnitMarker}|tokens?)`, "i"),
  );
  return tokenMatch?.[0] ?? "-";
}
