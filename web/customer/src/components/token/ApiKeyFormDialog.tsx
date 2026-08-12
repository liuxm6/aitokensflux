import { KeyRound, LoaderCircle, Pencil, X } from "lucide-react";
import { type FormEvent, useContext, useId, useRef } from "react";
import { AccessibleDialog } from "../common/ui/Dialog";
import { LanguageContext, T } from "../../context/Language";
import {
  formatQuotaTokens,
  getApiKeyQuotaLimitUnit,
  parseApiKeyQuotaLimit,
  toDateInputValue,
} from "../../helpers/format";
import { localizeKey } from "../../i18n/localization";
import { formatUserGroupOptionLabel } from "./user-groups";
import type { UserGroupSelectOption } from "./user-groups";
import type {
  ApiKeyCreateForm,
  ApiKeyExpiryMode,
  CustomerStatus,
} from "../../types";

export function ApiKeyFormDialog({
  form,
  groupOptions,
  groupsLoading,
  mode,
  status,
  submitting,
  tokenName = "",
  onChange,
  onClose,
  onSubmit,
}: {
  form: ApiKeyCreateForm;
  groupOptions: UserGroupSelectOption[];
  groupsLoading: boolean;
  mode: "create" | "edit";
  status: CustomerStatus | null;
  submitting: boolean;
  tokenName?: string;
  onChange: (form: ApiKeyCreateForm) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}) {
  const { language } = useContext(LanguageContext);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const isEdit = mode === "edit";

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
    <AccessibleDialog
      ariaLabelledBy={titleId}
      backdropClassName="purchase-backdrop as-button"
      className="purchase-dialog key-create-dialog"
      closeDisabled={submitting}
      closeLabel={localizeKey(language, "Close")}
      initialFocusRef={closeButtonRef}
      panelClassName="purchase-panel key-create-panel"
      onClose={onClose}
    >
      <button
        ref={closeButtonRef}
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
        <h2 id={titleId}>
          {isEdit ? <T id="Edit key" /> : <T id="Create key" />}
        </h2>
        {isEdit && tokenName ? <p>{tokenName}</p> : null}
      </div>
      <form className="key-create-form" onSubmit={handleSubmit}>
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

        <label className="key-create-field">
          <span>
            <T id="Group" />
            <b className="required-dot">*</b>
          </span>
          <select
            className="console-select"
            disabled={submitting || groupsLoading}
            required
            value={form.group}
            onChange={(event) => setField("group", event.target.value)}
          >
            <option value="">
              {groupsLoading
                ? localizeKey(language, "Loading groups...")
                : localizeKey(language, "Select group")}
            </option>
            {groupOptions.map((option) => (
              <option key={option.name} value={option.name}>
                {formatUserGroupOptionLabel(option)}
              </option>
            ))}
          </select>
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
            <T id="Enter a quota limit for this key." />
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
            disabled={submitting || groupsLoading}
          >
            {submitting ? (
              <LoaderCircle size={16} />
            ) : isEdit ? (
              <Pencil size={16} />
            ) : (
              <KeyRound size={16} />
            )}
            {isEdit ? <T id="Save changes" /> : <T id="Create key" />}
          </button>
        </div>
      </form>
    </AccessibleDialog>
  );
}
