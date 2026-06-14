import { Copy, Gift, RefreshCw } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { EmptyState } from "../../components/common/EmptyState";
import { SectionLabel } from "../../components/common/SectionLabel";
import { RewardPair } from "../../components/dashboard/RewardPair";
import {
  ConsolePageTitle,
  CustomerShell,
} from "../../components/layout/CustomerShell";
import { DataTable } from "../../components/table/DataTable";
import { Panel } from "../../components/common/ui/Panel";
import { AuthContext } from "../../context/Auth";
import { LanguageContext, T } from "../../context/Language";
import { useToastMessage } from "../../context/Toast";
import {
  formatDateTime,
  formatQuotaMoney,
  getQuotaPerUnit,
  normalizePageItems,
} from "../../helpers/format";
import {
  extractInviteQuotaLabel,
  getInviteLogKind,
  isInviteLog,
} from "../../helpers/invite-records";
import { localizeKey } from "../../i18n/localization";
import { apiRequest } from "../../services/api";
import {
  fetchCustomerSelf,
  fetchCustomerStatus,
  fetchUserLogs,
} from "../../services/customer-api";
import type {
  CustomerStatus,
  InviteRecordTab,
  Language,
  UsageLog,
} from "../../types";

function buildInviteLink(code: string) {
  return `${window.location.origin}/register?aff=${encodeURIComponent(code)}`;
}

function getCurrentMonthUnixRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return {
    start: Math.floor(start.getTime() / 1000),
    end: Math.floor(end.getTime() / 1000),
  };
}

function getInviteLogTypeLabel(
  kind: InviteRecordTab | null,
  language: Language,
) {
  if (kind === "inviter") {
    return localizeKey(language, "Referral reward");
  }
  if (kind === "invitee") {
    return localizeKey(language, "Invitee bonus");
  }
  return localizeKey(language, "Referral");
}

export function InvitePage() {
  const { user, setUser } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const inviteFetchLimit = 200;
  const invitePageSize = 10;
  const [status, setStatus] = useState<CustomerStatus | null>(null);
  const [affCode, setAffCode] = useState(user?.aff_code ?? "");
  const [inviteLogs, setInviteLogs] = useState<UsageLog[]>([]);
  const [recordTab, setRecordTab] = useState<InviteRecordTab>("all");
  const [invitePage, setInvitePage] = useState(1);
  const [monthInviteCount, setMonthInviteCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [message, setMessage] = useState("");
  useToastMessage(message);

  const loadInvite = async (clearMessage = true) => {
    setLoading(true);
    const month = getCurrentMonthUnixRange();
    const [statusRes, selfRes, affRes, logsRes, monthLogsRes] =
      await Promise.all([
        fetchCustomerStatus(),
        fetchCustomerSelf(),
        apiRequest<string>("/api/user/aff", { method: "GET" }),
        fetchUserLogs({ page: 1, pageSize: inviteFetchLimit, type: 4 }),
        fetchUserLogs({
          page: 1,
          pageSize: 100,
          type: 4,
          startTimestamp: month.start,
          endTimestamp: month.end,
        }),
      ]);
    if (statusRes.success && statusRes.data) setStatus(statusRes.data);
    if (selfRes.success && selfRes.data) {
      setUser(selfRes.data);
      setAffCode(selfRes.data.aff_code || "");
    }
    if (affRes.success && affRes.data) setAffCode(affRes.data);
    if (logsRes.success) {
      setInviteLogs(normalizePageItems(logsRes.data).filter(isInviteLog));
      if (clearMessage) setMessage("");
    } else {
      setMessage(
        logsRes.message ||
          localizeKey(language, "Failed to load referral records"),
      );
    }
    if (monthLogsRes.success) {
      setMonthInviteCount(
        normalizePageItems(monthLogsRes.data).filter(
          (item) => getInviteLogKind(item) === "inviter",
        ).length,
      );
    }
    setLoading(false);
  };

  const copyInviteLink = async () => {
    const code = affCode || user?.aff_code || "";
    if (!code) {
      setMessage(localizeKey(language, "Invite code is not ready"));
      return;
    }
    await navigator.clipboard?.writeText(buildInviteLink(code));
    setMessage(localizeKey(language, "Invite link copied"));
  };

  const transferRewards = async () => {
    const quota = user?.aff_quota ?? 0;
    const minQuota = getQuotaPerUnit(status);
    if (quota <= 0) {
      setMessage(localizeKey(language, "No withdrawable rewards"));
      return;
    }
    if (quota < minQuota) {
      setMessage(
        localizeKey(language, "Minimum withdrawal is {{amount}}", {
          amount: formatQuotaMoney(minQuota, status),
        }),
      );
      return;
    }
    setTransferring(true);
    const response = await apiRequest("/api/user/aff_transfer", {
      method: "POST",
      body: JSON.stringify({ quota }),
    });
    setTransferring(false);
    if (!response.success) {
      setMessage(
        response.message || localizeKey(language, "Withdrawal failed"),
      );
      return;
    }
    setMessage(localizeKey(language, "Rewards moved to balance"));
    void loadInvite(false);
  };

  useEffect(() => {
    void loadInvite();
  }, [user?.id]);

  useEffect(() => {
    setInvitePage(1);
  }, [recordTab]);

  const code = affCode || user?.aff_code || "-";
  const inviteLink = code === "-" ? "-" : buildInviteLink(code);
  const filteredInviteLogs = inviteLogs.filter((log) => {
    if (recordTab === "all") return true;
    return getInviteLogKind(log) === recordTab;
  });
  const inviteTotal = filteredInviteLogs.length;
  const inviteTotalPages = Math.max(1, Math.ceil(inviteTotal / invitePageSize));
  const boundedInvitePage = Math.min(invitePage, inviteTotalPages);
  const inviteStartIndex = (boundedInvitePage - 1) * invitePageSize;
  const inviteRows = filteredInviteLogs.slice(
    inviteStartIndex,
    inviteStartIndex + invitePageSize,
  );
  const inviteStartRow = inviteTotal === 0 ? 0 : inviteStartIndex + 1;
  const inviteEndRow =
    inviteTotal === 0
      ? 0
      : Math.min(inviteStartIndex + inviteRows.length, inviteTotal);
  const withdrawableQuota = user?.aff_quota ?? 0;
  const minTransferQuota = getQuotaPerUnit(status);
  const inviterRewardQuota = Math.max(
    0,
    Number(status?.quota_for_inviter ?? 0),
  );
  const inviterRewardAmount = formatQuotaMoney(inviterRewardQuota, status);

  useEffect(() => {
    if (invitePage > inviteTotalPages) setInvitePage(inviteTotalPages);
  }, [invitePage, inviteTotalPages]);

  const goInvitePage = (nextPage: number) => {
    const boundedPage = Math.min(Math.max(1, nextPage), inviteTotalPages);
    if (boundedPage !== invitePage) setInvitePage(boundedPage);
  };

  return (
    <CustomerShell crumbId="Referrals" page="invite">
      <ConsolePageTitle id="Referral rewards" />
      <Panel className="invite-hero">
        <div>
          <div className="lbl">
            <T id="Invite code" />
          </div>
          <div className="invite-code mono">{code}</div>
        </div>
        <div>
          <b>
            <T id="Invite friends to sign up. Rewards are credited to referral quota." />
          </b>
          <p>
            <T id="Rewards follow the gateway settings after a friend signs up with your code." />
          </p>
          <small className="invite-link mono">{inviteLink}</small>
        </div>
        {inviterRewardQuota > 0 ? (
          <div className="invite-reward-callout">
            <Gift size={22} />
            <div>
              <span>
                <T id="Invite reward" />
              </span>
              <strong>
                <T
                  id="Earn {{amount}} per referral"
                  values={{ amount: inviterRewardAmount }}
                />
              </strong>
              <small>
                <T id="Credited after a friend signs up with your invite code." />
              </small>
            </div>
          </div>
        ) : null}
        <button
          className="btn btn-ghost btn-sm"
          type="button"
          onClick={() => void copyInviteLink()}
        >
          <Copy size={16} />
          <T id="Copy link" />
        </button>
        <button
          className="btn btn-ghost btn-sm"
          type="button"
          onClick={() => void loadInvite()}
        >
          <RefreshCw size={16} />
          <T id="Refresh" />
        </button>
      </Panel>
      <SectionLabel id="Reward statistics" />
      <Panel className="reward-panel">
        <div className="reward-head">
          <div>
            <span>
              <T id="Withdrawable amount" />
            </span>
            <strong className="mono">
              {formatQuotaMoney(user?.aff_quota ?? 0, status)}
            </strong>
          </div>
          <div className="reward-note">
            <span>?</span>
            <T id="Withdraw moves referral quota into account balance" />
          </div>
          <button
            className="btn btn-flux btn-sm"
            disabled={transferring || withdrawableQuota < minTransferQuota}
            type="button"
            onClick={() => void transferRewards()}
          >
            <T id={transferring ? "Moving" : "Move to balance"} />
          </button>
        </div>
        <div className="plan-divider" />
        <div className="reward-grid">
          <RewardPair
            labelAId="This month"
            labelBId="Total referrals"
            valueA={`${monthInviteCount}`}
            valueB={`${user?.aff_count ?? 0}`}
          />
          <RewardPair
            accent
            labelAId="Total rewards"
            labelBId="Withdrawable"
            valueA={formatQuotaMoney(user?.aff_history_quota ?? 0, status)}
            valueB={formatQuotaMoney(user?.aff_quota ?? 0, status)}
          />
        </div>
      </Panel>

      <SectionLabel id="Invite records" />
      <Panel className="invite-record-panel">
        <div className="invite-tabs">
          {[
            ["all", "All records"],
            ["inviter", "Referral rewards"],
            ["invitee", "Invitee bonuses"],
          ].map(([tab, labelId]) => (
            <button
              className={recordTab === tab ? "active" : ""}
              key={labelId}
              type="button"
              onClick={() => setRecordTab(tab as InviteRecordTab)}
            >
              <T id={labelId} />
            </button>
          ))}
          <div className="invite-filter-actions">
            <button type="button" onClick={() => void loadInvite()}>
              <RefreshCw size={15} />
              <T id="Refresh" />
            </button>
          </div>
        </div>
        {loading ? (
          <EmptyState id="Loading referral records" />
        ) : inviteRows.length > 0 ? (
          <DataTable
            headers={["Time", "Type", "Record", "Quota"]}
            rows={inviteRows.map((log) => [
              formatDateTime(log.created_at),
              getInviteLogTypeLabel(getInviteLogKind(log), language),
              log.content || "-",
              extractInviteQuotaLabel(log.content),
            ])}
          />
        ) : (
          <EmptyState id="No invite records" />
        )}
        {!loading && inviteTotal > invitePageSize ? (
          <div className="usage-pagination invite-pagination">
            <span>
              {localizeKey(language, "{{start}}-{{end}} of {{total}}", {
                start: inviteStartRow,
                end: inviteEndRow,
                total: inviteTotal,
              })}
            </span>
            <div>
              <button
                className="btn btn-ghost btn-sm"
                disabled={boundedInvitePage <= 1}
                type="button"
                onClick={() => goInvitePage(boundedInvitePage - 1)}
              >
                <T id="Previous" />
              </button>
              <b>
                {boundedInvitePage} / {inviteTotalPages}
              </b>
              <button
                className="btn btn-ghost btn-sm"
                disabled={boundedInvitePage >= inviteTotalPages}
                type="button"
                onClick={() => goInvitePage(boundedInvitePage + 1)}
              >
                <T id="Next" />
              </button>
            </div>
          </div>
        ) : null}
      </Panel>
    </CustomerShell>
  );
}
