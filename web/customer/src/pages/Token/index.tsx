import {
  ArrowRight,
  Check,
  Copy,
  KeyRound,
  LoaderCircle,
  X,
} from "lucide-react";
import { type FormEvent, useContext, useEffect, useState } from "react";
import { AppLink } from "../../components/common/AppLink";
import { EmptyState } from "../../components/common/EmptyState";
import { SectionLabel } from "../../components/common/SectionLabel";
import { Panel } from "../../components/common/ui/Panel";
import {
  ConsolePageTitle,
  CustomerShell,
} from "../../components/layout/CustomerShell";
import { ConfirmActionContext } from "../../context/ConfirmAction";
import { LanguageContext, T } from "../../context/Language";
import { useToastMessage } from "../../context/Toast";
import {
  formatQuotaRate,
  formatQuotaTokens,
  formatTimestamp,
  getApiKeyExpiryTimestamp,
  getApiKeyQuotaLimitUnit,
  getDefaultApiKeyCreateForm,
  normalizePageData,
  parseApiKeyQuotaLimit,
  toDateInputValue,
} from "../../helpers/format";
import {
  getConfiguredServerAddress,
  getOpenAICompatibleBaseUrl,
} from "../../helpers/server-address";
import { localizeKey } from "../../i18n/localization";
import { apiRequest, buildQueryFromValues } from "../../services/api";
import { fetchCustomerStatus } from "../../services/customer-api";
import type {
  ApiKeyCreateForm,
  ApiKeyExpiryMode,
  CustomerStatus,
  CustomerToken,
  Language,
  PageData,
} from "../../types";

export function ApiKeysPage() {
  const { requestConfirm } = useContext(ConfirmActionContext);
  const { language } = useContext(LanguageContext);
  const tokenPageSizeDefault = 10;
  const [status, setStatus] = useState<CustomerStatus | null>(null);
  const [tokens, setTokens] = useState<CustomerToken[]>([]);
  const [tokenPage, setTokenPage] = useState(1);
  const [tokenPageSize, setTokenPageSize] = useState(tokenPageSizeDefault);
  const [tokenTotal, setTokenTotal] = useState(0);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [tokenMessage, setTokenMessage] = useState("");
  const [baseCopied, setBaseCopied] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ApiKeyCreateForm>(() =>
    getDefaultApiKeyCreateForm(),
  );
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  useToastMessage(tokenMessage);
  useToastMessage(createMessage);
  const gatewayOrigin = getConfiguredServerAddress(status);
  const openaiGatewayUrl = getOpenAICompatibleBaseUrl(status);

  const loadTokens = async (nextPage = tokenPage) => {
    const normalizedPage = Math.max(1, nextPage);
    setLoadingTokens(true);
    const response = await apiRequest<PageData<CustomerToken>>(
      `/api/token/${buildQueryFromValues({
        p: normalizedPage,
        size: tokenPageSize,
      })}`,
      { method: "GET" },
    );
    if (response.success) {
      const pageData = normalizePageData(
        response.data,
        normalizedPage,
        tokenPageSize,
      );
      const resolvedPageSize = Math.max(1, pageData.pageSize);
      const maxPage = Math.max(1, Math.ceil(pageData.total / resolvedPageSize));
      if (
        pageData.items.length === 0 &&
        pageData.total > 0 &&
        normalizedPage > maxPage
      ) {
        setLoadingTokens(false);
        void loadTokens(maxPage);
        return;
      }
      setTokens(pageData.items);
      setTokenPage(Math.min(Math.max(1, pageData.page), maxPage));
      setTokenPageSize(resolvedPageSize);
      setTokenTotal(pageData.total);
      setTokenMessage("");
    } else {
      setTokenMessage(
        response.message || localizeKey(language, "Failed to load API keys"),
      );
    }
    setLoadingTokens(false);
  };

  const openCreateDialog = () => {
    setCreateForm(getDefaultApiKeyCreateForm());
    setCreateMessage("");
    setCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    if (!createSubmitting) setCreateDialogOpen(false);
  };

  const createToken = async () => {
    const name = createForm.name.trim();
    if (!name) {
      setCreateMessage(localizeKey(language, "Please enter a key name"));
      return;
    }
    if (name.length > 50) {
      setCreateMessage(
        localizeKey(language, "Key name cannot exceed 50 characters"),
      );
      return;
    }
    const expiredTime = getApiKeyExpiryTimestamp(createForm);
    if (expiredTime === null) {
      setCreateMessage(localizeKey(language, "Please choose a valid time"));
      return;
    }
    let remainQuota = 0;
    if (!createForm.unlimitedQuota) {
      if (!createForm.quotaLimit.trim()) {
        setCreateMessage(localizeKey(language, "Please enter a quota limit"));
        return;
      }
      remainQuota = parseApiKeyQuotaLimit(createForm.quotaLimit, status);
      if (!Number.isFinite(remainQuota) || remainQuota < 0) {
        setCreateMessage(
          localizeKey(language, "Quota limit must be 0 or greater"),
        );
        return;
      }
    }

    setCreateSubmitting(true);
    setCreateMessage(localizeKey(language, "Creating key..."));
    setTokenMessage("");
    const response = await apiRequest("/api/token/", {
      method: "POST",
      body: JSON.stringify({
        name,
        expired_time: expiredTime,
        remain_quota: remainQuota,
        unlimited_quota: createForm.unlimitedQuota,
      }),
    });
    setCreateSubmitting(false);
    if (!response.success) {
      setCreateMessage(
        response.message || localizeKey(language, "Failed to create key"),
      );
      return;
    }
    setCreateDialogOpen(false);
    setTokenMessage(localizeKey(language, "Key created"));
    await loadTokens(1);
  };

  const updateTokenStatus = async (
    token: CustomerToken,
    nextStatus: number,
  ) => {
    setTokenMessage(
      nextStatus === 1
        ? localizeKey(language, "Enabling key...")
        : localizeKey(language, "Disabling key..."),
    );
    const response = await apiRequest("/api/token/?status_only=true", {
      method: "PUT",
      body: JSON.stringify({ id: token.id, status: nextStatus }),
    });
    if (!response.success) {
      setTokenMessage(
        response.message ||
          localizeKey(language, "Failed to update key status"),
      );
      return;
    }
    setTokenMessage(
      nextStatus === 1
        ? localizeKey(language, "Key enabled")
        : localizeKey(language, "Key disabled"),
    );
    await loadTokens(tokenPage);
  };

  const toggleTokenStatus = async (token: CustomerToken) => {
    const nextStatus = token.status === 1 ? 2 : 1;
    if (nextStatus !== 2) {
      await updateTokenStatus(token, nextStatus);
      return;
    }
    const tokenName = token.name || "default";
    requestConfirm({
      title: { id: "Notice" },
      message: {
        id: 'Disable API key "{{name}}"? Requests using this key will fail.',
        values: { name: tokenName },
      },
      onConfirm: () => updateTokenStatus(token, nextStatus),
    });
  };

  const deleteTokenNow = async (token: CustomerToken) => {
    setTokenMessage(localizeKey(language, "Deleting key..."));
    const response = await apiRequest(`/api/token/${token.id}`, {
      method: "DELETE",
    });
    if (!response.success) {
      setTokenMessage(
        response.message || localizeKey(language, "Failed to delete key"),
      );
      return;
    }
    setTokenMessage(localizeKey(language, "Key deleted"));
    await loadTokens(tokenPage);
  };

  const deleteToken = (token: CustomerToken) => {
    const tokenName = token.name || "default";
    requestConfirm({
      title: { id: "Notice" },
      message: {
        id: 'Delete API key "{{name}}"? This cannot be undone.',
        values: { name: tokenName },
      },
      onConfirm: () => deleteTokenNow(token),
    });
  };

  const copyToken = async (token: CustomerToken) => {
    setTokenMessage(localizeKey(language, "Reading key..."));
    const response = await apiRequest<{ key: string }>(
      `/api/token/${token.id}/key`,
      { method: "POST" },
    );
    if (!response.success || !response.data?.key) {
      setTokenMessage(
        response.message || localizeKey(language, "Failed to read key"),
      );
      return;
    }
    await navigator.clipboard?.writeText(formatApiKey(response.data.key));
    setTokenMessage(localizeKey(language, "Key copied"));
  };

  const copyBaseUrl = async () => {
    await navigator.clipboard?.writeText(openaiGatewayUrl);
    setBaseCopied(true);
    window.setTimeout(() => setBaseCopied(false), 1200);
  };

  useEffect(() => {
    void fetchCustomerStatus().then((response) => {
      if (response.success && response.data) setStatus(response.data);
    });
    void loadTokens();
  }, []);

  const tokenTotalPages = Math.max(
    1,
    Math.ceil(tokenTotal / Math.max(1, tokenPageSize)),
  );
  const tokenStartRow =
    tokenTotal === 0 ? 0 : (tokenPage - 1) * tokenPageSize + 1;
  const tokenEndRow =
    tokenTotal === 0 ? 0 : Math.min(tokenPage * tokenPageSize, tokenTotal);

  const goTokenPage = (nextPage: number) => {
    if (loadingTokens) return;
    const boundedPage = Math.min(Math.max(1, nextPage), tokenTotalPages);
    if (boundedPage === tokenPage) return;
    void loadTokens(boundedPage);
  };

  return (
    <CustomerShell crumbId="API Access" page="apikeys">
      <ConsolePageTitle id="API Access" />
      <Panel className="api-access-panel">
        <div className="api-access-head">
          <p>
            <T id="Use the following Base URL instead of official endpoints with your API key" />
          </p>
          <div>
            <AppLink className="btn btn-ghost btn-sm" href="/setup">
              <T id="Examples" />
            </AppLink>
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={() => void copyBaseUrl()}
            >
              {baseCopied ? <Check size={15} /> : <Copy size={15} />}
              <T id="Copy Base URL" />
            </button>
          </div>
        </div>
        <div className="base-url-list">
          <BaseUrlSwapRow
            from="https://api.openai.com"
            label="OpenAI"
            to={openaiGatewayUrl}
          />
          <BaseUrlSwapRow
            from="https://api.anthropic.com"
            label="Claude"
            to={gatewayOrigin}
          />
        </div>
      </Panel>

      <SectionLabel id="API Keys" />
      <Panel className="key-panel">
        <div className="key-toolbar">
          <button
            className="btn btn-flux btn-sm"
            type="button"
            onClick={openCreateDialog}
          >
            <KeyRound size={15} />
            <T id="Create key" />
          </button>
        </div>
        {loadingTokens ? (
          <EmptyState id="Loading API keys" />
        ) : tokens.length > 0 ? (
          <div className="key-list">
            {tokens.map((token) => {
              const expiryLabel = getApiKeyExpiryLabel(
                token.expired_time,
                language,
              );
              return (
                <div className="key-row" key={token.id}>
                  <strong>{token.name || "default"}</strong>
                  <span
                    className={
                      token.status === 1 ? "enabled-badge" : "enabled-badge off"
                    }
                  >
                    {token.status === 1 ? (
                      <T id="Enabled" />
                    ) : (
                      <T id="Disabled" />
                    )}
                  </span>
                  <span className="mono key-mask">
                    {formatApiKey(token.key)}
                  </span>
                  <span className="key-meta">
                    <span className="mono key-quota">
                      {token.unlimited_quota ? (
                        <T id="Unlimited" />
                      ) : (
                        formatQuotaTokens(token.remain_quota ?? 0)
                      )}
                    </span>
                    <span
                      className={
                        isApiKeyExpired(token.expired_time)
                          ? "key-expiry expired"
                          : "key-expiry"
                      }
                    >
                      {expiryLabel}
                    </span>
                  </span>
                  <button
                    className="inline-copy"
                    type="button"
                    aria-label={localizeKey(language, "Copy key")}
                    onClick={() => void copyToken(token)}
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    className="btn btn-soft btn-sm key-action"
                    type="button"
                    onClick={() => void toggleTokenStatus(token)}
                  >
                    {token.status === 1 ? (
                      <T id="Disable" />
                    ) : (
                      <T id="Enable" />
                    )}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm key-action"
                    type="button"
                    onClick={() => void deleteToken(token)}
                  >
                    <T id="Delete" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="key-empty">
            <EmptyState id="No API keys yet" />
            <button
              className="btn btn-flux btn-sm"
              type="button"
              onClick={openCreateDialog}
            >
              <T id="Create first key" />
            </button>
          </div>
        )}
        {!loadingTokens && tokenTotal > tokenPageSize ? (
          <div className="usage-pagination key-pagination">
            <span>
              {localizeKey(language, "{{start}}-{{end}} of {{total}}", {
                start: tokenStartRow,
                end: tokenEndRow,
                total: tokenTotal,
              })}
            </span>
            <div>
              <button
                className="btn btn-ghost btn-sm"
                disabled={tokenPage <= 1}
                type="button"
                onClick={() => goTokenPage(tokenPage - 1)}
              >
                <T id="Previous" />
              </button>
              <b>
                {tokenPage} / {tokenTotalPages}
              </b>
              <button
                className="btn btn-ghost btn-sm"
                disabled={tokenPage >= tokenTotalPages}
                type="button"
                onClick={() => goTokenPage(tokenPage + 1)}
              >
                <T id="Next" />
              </button>
            </div>
          </div>
        ) : null}
      </Panel>
      <ApiKeyCreateDialog
        open={createDialogOpen}
        form={createForm}
        status={status}
        submitting={createSubmitting}
        onChange={setCreateForm}
        onClose={closeCreateDialog}
        onSubmit={createToken}
      />
    </CustomerShell>
  );
}

function ApiKeyCreateDialog({
  open,
  form,
  status,
  submitting,
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  form: ApiKeyCreateForm;
  status: CustomerStatus | null;
  submitting: boolean;
  onChange: (form: ApiKeyCreateForm) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}) {
  const { language } = useContext(LanguageContext);
  if (!open) return null;

  const quotaUnit = getApiKeyQuotaLimitUnit(status);
  const quotaLimit = parseApiKeyQuotaLimit(form.quotaLimit, status);
  const quotaPreview =
    !form.unlimitedQuota &&
    form.quotaLimit.trim() &&
    Number.isFinite(quotaLimit)
      ? formatQuotaTokens(quotaLimit)
      : "";

  const setField = <K extends keyof ApiKeyCreateForm>(
    key: K,
    value: ApiKeyCreateForm[K],
  ) => onChange({ ...form, [key]: value });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit();
  };

  return (
    <div className="purchase-dialog key-create-dialog" role="dialog" aria-modal>
      <button
        className="purchase-backdrop as-button"
        type="button"
        aria-label={localizeKey(language, "Close")}
        disabled={submitting}
        onClick={onClose}
      />
      <form className="purchase-panel key-create-panel" onSubmit={handleSubmit}>
        <button
          className="purchase-close"
          type="button"
          aria-label={localizeKey(language, "Close")}
          disabled={submitting}
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <div className="purchase-head key-create-head">
          <span className="purchase-kicker">
            <T id="API key" />
          </span>
          <h2>
            <T id="Create key" />
          </h2>
        </div>
        <div className="key-create-form">
          <label className="key-create-field">
            <span>
              <T id="Name" />
            </span>
            <input
              className="console-input"
              maxLength={50}
              placeholder={localizeKey(language, "e.g. Production")}
              value={form.name}
              onChange={(event) => setField("name", event.target.value)}
            />
          </label>

          <div className="key-create-grid">
            <label className="key-create-field">
              <span>
                <T id="Valid until" />
              </span>
              <select
                className="console-select"
                value={form.expiryMode}
                onChange={(event) =>
                  setField("expiryMode", event.target.value as ApiKeyExpiryMode)
                }
              >
                <option value="never">
                  {localizeKey(language, "Never expires")}
                </option>
                <option value="7d">{localizeKey(language, "7 days")}</option>
                <option value="30d">{localizeKey(language, "30 days")}</option>
                <option value="90d">{localizeKey(language, "90 days")}</option>
                <option value="custom">
                  {localizeKey(language, "Custom date")}
                </option>
              </select>
            </label>
            <label className="key-create-field">
              <span>
                <T id="Expiry date" />
              </span>
              <input
                className="console-input"
                disabled={form.expiryMode !== "custom"}
                min={toDateInputValue(new Date())}
                type="date"
                value={form.expiryDate}
                onChange={(event) => setField("expiryDate", event.target.value)}
              />
            </label>
          </div>

          <div className="key-create-grid key-create-quota-grid">
            <label className="key-create-field">
              <span>
                <T id="Quota ({{unit}})" values={{ unit: quotaUnit }} />
              </span>
              <input
                className="console-input"
                disabled={form.unlimitedQuota}
                inputMode="decimal"
                min="0"
                placeholder="10"
                step={quotaUnit === "tokens" ? "1" : "0.01"}
                type="number"
                value={form.quotaLimit}
                onChange={(event) => setField("quotaLimit", event.target.value)}
              />
            </label>
            <label className="key-create-check">
              <input
                checked={form.unlimitedQuota}
                type="checkbox"
                onChange={(event) =>
                  setField("unlimitedQuota", event.target.checked)
                }
              />
              <span>
                <T id="Unlimited quota" />
              </span>
            </label>
          </div>

          <div className="key-create-hint">
            {form.unlimitedQuota ? (
              <T id="With unlimited quota enabled, this key is not capped at the key level." />
            ) : quotaPreview ? (
              <T
                id="Submitted quota: {{quota}}"
                values={{ quota: quotaPreview }}
              />
            ) : (
              <T
                id="Conversion: {{rate}}"
                values={{ rate: formatQuotaRate(status) }}
              />
            )}
          </div>

          <div className="key-create-actions">
            <button
              className="btn btn-ghost"
              type="button"
              disabled={submitting}
              onClick={onClose}
            >
              <T id="Cancel" />
            </button>
            <button
              className="btn btn-flux"
              type="submit"
              disabled={submitting}
            >
              {submitting ? <LoaderCircle size={16} /> : <KeyRound size={16} />}
              <T id="Create key" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function formatApiKey(key: string) {
  if (!key) return "sk-";
  return key.startsWith("sk-") ? key : `sk-${key}`;
}

function isApiKeyExpired(expiredTime?: number | null) {
  return (
    Number(expiredTime ?? 0) > 0 && Number(expiredTime) <= Date.now() / 1000
  );
}

function getApiKeyExpiryLabel(
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

function BaseUrlSwapRow({
  label,
  from,
  to,
}: {
  label: string;
  from: string;
  to: string;
}) {
  return (
    <div className="base-url-row">
      <strong className="mono">{label}</strong>
      <span className="mono muted-url">{from}</span>
      <ArrowRight size={16} />
      <b className="mono">{to}</b>
    </div>
  );
}
