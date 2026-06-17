import {
  ArrowRight,
  ArrowRightLeft,
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
import {
  fetchCustomerStatus,
  fetchUserModels,
} from "../../services/customer-api";
import type {
  ApiKeyCreateForm,
  ApiKeyExpiryMode,
  CustomerStatus,
  CustomerToken,
  Language,
  PageData,
} from "../../types";

const CC_SWITCH_APP_CONFIGS = {
  claude: {
    label: "Claude",
    defaultName: "My Claude",
    defaultModel: "claude-sonnet-4.6",
    modelFields: [
      { key: "model", labelId: "Primary Model", required: true },
      { key: "haikuModel", labelId: "Haiku Model", required: false },
      { key: "sonnetModel", labelId: "Sonnet Model", required: false },
      { key: "opusModel", labelId: "Opus Model", required: false },
    ],
  },
  codex: {
    label: "Codex",
    defaultName: "My Codex",
    defaultModel: "gpt-5.5",
    modelFields: [{ key: "model", labelId: "Primary Model", required: true }],
  },
  gemini: {
    label: "Gemini",
    defaultName: "My Gemini",
    defaultModel: "gemini-2.5-pro",
    modelFields: [{ key: "model", labelId: "Primary Model", required: true }],
  },
} as const;

type CCSwitchApp = keyof typeof CC_SWITCH_APP_CONFIGS;

type CCSwitchDialogState = {
  token: CustomerToken;
  apiKey: string;
} | null;

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
  const [ccSwitchDialog, setCcSwitchDialog] =
    useState<CCSwitchDialogState>(null);
  const [ccSwitchApp, setCcSwitchApp] = useState<CCSwitchApp>("claude");
  const [ccSwitchName, setCcSwitchName] = useState<string>(
    CC_SWITCH_APP_CONFIGS.claude.defaultName,
  );
  const [ccSwitchModels, setCcSwitchModels] = useState<Record<string, string>>({
    model: CC_SWITCH_APP_CONFIGS.claude.defaultModel,
  });
  const [ccSwitchModelOptions, setCcSwitchModelOptions] = useState<string[]>(
    [],
  );
  const [ccSwitchModelsLoading, setCcSwitchModelsLoading] = useState(false);
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

  const readTokenKey = async (token: CustomerToken) => {
    setTokenMessage(localizeKey(language, "Reading key..."));
    const response = await apiRequest<{ key: string }>(
      `/api/token/${token.id}/key`,
      { method: "POST" },
    );
    if (!response.success || !response.data?.key) {
      setTokenMessage(
        response.message || localizeKey(language, "Failed to read key"),
      );
      return null;
    }
    return formatApiKey(response.data.key);
  };

  const copyToken = async (token: CustomerToken) => {
    const apiKey = await readTokenKey(token);
    if (!apiKey) return;
    await navigator.clipboard?.writeText(apiKey);
    setTokenMessage(localizeKey(language, "Key copied"));
  };

  const loadCcSwitchModels = async () => {
    if (ccSwitchModelsLoading || ccSwitchModelOptions.length > 0) return;
    setCcSwitchModelsLoading(true);
    const response = await fetchUserModels();
    setCcSwitchModelsLoading(false);
    if (response.success && Array.isArray(response.data)) {
      setCcSwitchModelOptions(response.data);
      return;
    }
    setTokenMessage(
      response.message || localizeKey(language, "Failed to load models"),
    );
  };

  const openCcSwitchDialog = async (token: CustomerToken) => {
    const apiKey = await readTokenKey(token);
    if (!apiKey) return;

    const app = "claude";
    const config = CC_SWITCH_APP_CONFIGS[app];
    setCcSwitchApp(app);
    setCcSwitchName(config.defaultName);
    setCcSwitchModels({ model: config.defaultModel });
    setCcSwitchDialog({ token, apiKey });
    setTokenMessage("");
    void loadCcSwitchModels();
  };

  const handleCcSwitchAppChange = (app: CCSwitchApp) => {
    const config = CC_SWITCH_APP_CONFIGS[app];
    setCcSwitchApp(app);
    setCcSwitchName(config.defaultName);
    setCcSwitchModels({ model: config.defaultModel });
  };

  const openCcSwitch = () => {
    if (!ccSwitchDialog) return;
    if (!ccSwitchModels.model?.trim()) {
      setTokenMessage(localizeKey(language, "Please select a primary model"));
      return;
    }

    const url = buildCcSwitchUrl({
      app: ccSwitchApp,
      name:
        ccSwitchName.trim() || CC_SWITCH_APP_CONFIGS[ccSwitchApp].defaultName,
      models: ccSwitchModels,
      apiKey: ccSwitchDialog.apiKey,
      serverAddress: gatewayOrigin,
      openaiBaseUrl: openaiGatewayUrl,
    });
    window.open(url, "_blank");
    setCcSwitchDialog(null);
    setTokenMessage(localizeKey(language, "Opening CC Switch..."));
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
                  <div className="key-row-actions">
                    <button
                      className="btn btn-ghost btn-sm key-action"
                      type="button"
                      onClick={() => void openCcSwitchDialog(token)}
                    >
                      <ArrowRightLeft size={15} />
                      CC Switch
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
      <CCSwitchImportDialog
        app={ccSwitchApp}
        modelOptions={ccSwitchModelOptions}
        models={ccSwitchModels}
        modelsLoading={ccSwitchModelsLoading}
        name={ccSwitchName}
        open={Boolean(ccSwitchDialog)}
        tokenName={ccSwitchDialog?.token.name || ""}
        onAppChange={handleCcSwitchAppChange}
        onChangeModels={setCcSwitchModels}
        onChangeName={setCcSwitchName}
        onClose={() => setCcSwitchDialog(null)}
        onSubmit={openCcSwitch}
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

function CCSwitchImportDialog({
  app,
  name,
  models,
  modelOptions,
  modelsLoading,
  open,
  tokenName,
  onAppChange,
  onChangeName,
  onChangeModels,
  onClose,
  onSubmit,
}: {
  app: CCSwitchApp;
  name: string;
  models: Record<string, string>;
  modelOptions: string[];
  modelsLoading: boolean;
  open: boolean;
  tokenName: string;
  onAppChange: (app: CCSwitchApp) => void;
  onChangeName: (name: string) => void;
  onChangeModels: (models: Record<string, string>) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const { language } = useContext(LanguageContext);
  if (!open) return null;

  const currentConfig = CC_SWITCH_APP_CONFIGS[app];
  const modelListId = `cc-switch-models-${app}`;

  const updateModel = (key: string, value: string) => {
    onChangeModels({ ...models, [key]: value });
  };

  return (
    <div className="purchase-dialog cc-switch-dialog" role="dialog" aria-modal>
      <button
        className="purchase-backdrop as-button"
        type="button"
        aria-label={localizeKey(language, "Close")}
        onClick={onClose}
      />
      <div className="purchase-panel cc-switch-panel">
        <button
          className="purchase-close"
          type="button"
          aria-label={localizeKey(language, "Close")}
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <div className="purchase-head key-create-head">
          <span className="purchase-kicker">CC Switch</span>
          <h2>
            <T id="Import to CC Switch" />
          </h2>
          {tokenName ? <p>{tokenName}</p> : null}
        </div>

        <div className="key-create-form">
          <label className="key-create-field">
            <span>
              <T id="Application" />
            </span>
            <select
              className="console-select"
              value={app}
              onChange={(event) =>
                onAppChange(event.target.value as CCSwitchApp)
              }
            >
              {(
                Object.entries(CC_SWITCH_APP_CONFIGS) as [
                  CCSwitchApp,
                  (typeof CC_SWITCH_APP_CONFIGS)[CCSwitchApp],
                ][]
              ).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
          </label>

          <label className="key-create-field">
            <span>
              <T id="Name" />
            </span>
            <input
              className="console-input"
              value={name}
              placeholder={currentConfig.defaultName}
              onChange={(event) => onChangeName(event.target.value)}
            />
          </label>

          <datalist id={modelListId}>
            {modelOptions.map((model) => (
              <option key={model} value={model} />
            ))}
          </datalist>

          {currentConfig.modelFields.map((field) => (
            <label className="key-create-field" key={field.key}>
              <span>
                {localizeKey(language, field.labelId)}
                {field.required ? <b className="required-dot">*</b> : null}
              </span>
              <input
                className="console-input"
                list={modelListId}
                value={models[field.key] || ""}
                placeholder={localizeKey(
                  language,
                  "Select or enter model name",
                )}
                onChange={(event) => updateModel(field.key, event.target.value)}
              />
            </label>
          ))}

          {modelsLoading ? (
            <p className="cc-switch-hint">
              <T id="Loading models..." />
            </p>
          ) : null}

          <div className="key-create-actions">
            <button className="btn btn-ghost" type="button" onClick={onClose}>
              <T id="Cancel" />
            </button>
            <button className="btn btn-flux" type="button" onClick={onSubmit}>
              <ArrowRightLeft size={16} />
              <T id="Open CC Switch" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildCcSwitchUrl({
  app,
  name,
  models,
  apiKey,
  serverAddress,
  openaiBaseUrl,
}: {
  app: CCSwitchApp;
  name: string;
  models: Record<string, string>;
  apiKey: string;
  serverAddress: string;
  openaiBaseUrl: string;
}) {
  const endpoint = app === "codex" ? openaiBaseUrl : serverAddress;
  const params = new URLSearchParams();
  params.set("resource", "provider");
  params.set("app", app);
  params.set("name", name);
  params.set("endpoint", endpoint);
  params.set("apiKey", apiKey);
  for (const [key, value] of Object.entries(models)) {
    const trimmed = value.trim();
    if (trimmed) params.set(key, trimmed);
  }
  params.set("homepage", serverAddress);
  params.set("enabled", "true");
  return `ccswitch://v1/import?${params.toString()}`;
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
