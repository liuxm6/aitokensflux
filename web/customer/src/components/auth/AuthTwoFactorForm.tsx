import { KeyRound } from "lucide-react";
import type { RefObject } from "react";
import type { AuthPageCopy } from "../../helpers/auth-copy";
import { AuthCloseButton } from "./AuthCloseButton";
import { AuthInput } from "./AuthInput";
import { AuthSubmitButton } from "./AuthSubmitButton";

export function AuthTwoFactorForm({
  closeButtonRef,
  closeLabel,
  copy,
  fieldError,
  loading,
  twoFaCode,
  twoFaCodeInputRef,
  onBack,
  onChangeCode,
  onClose,
  onSubmit,
  onToggleBackup,
}: {
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  closeLabel: string;
  copy: AuthPageCopy;
  fieldError?: string;
  loading: boolean;
  twoFaCode: string;
  twoFaCodeInputRef: RefObject<HTMLInputElement | null>;
  onBack: () => void;
  onChangeCode: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  onToggleBackup: () => void;
}) {
  return (
    <section className="auth-modal" aria-label={copy.twoFaTitle}>
      <AuthCloseButton
        buttonRef={closeButtonRef}
        label={closeLabel}
        onClick={onClose}
      />
      <div className="auth-form">
        <h1>{copy.twoFaTitle}</h1>
        <p className="auth-note">{copy.twoFaText}</p>
        <AuthInput
          autoComplete="one-time-code"
          error={fieldError}
          icon={KeyRound}
          inputRef={twoFaCodeInputRef}
          label={copy.twoFaCode}
          placeholder={copy.twoFaPlaceholder}
          value={twoFaCode}
          onChange={onChangeCode}
        />
        <AuthSubmitButton
          disabled={loading}
          label={copy.twoFaSubmit}
          loading={loading}
          type="button"
          onClick={onSubmit}
        />
        <button
          className="auth-secondary"
          type="button"
          onClick={onToggleBackup}
        >
          {copy.useBackupCode}
        </button>
        <button className="auth-link-btn" type="button" onClick={onBack}>
          {copy.backToLogin}
        </button>
      </div>
    </section>
  );
}
