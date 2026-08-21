import { X } from "lucide-react";
import type { RefObject } from "react";
import { useContext, useId } from "react";
import { LanguageContext } from "../../context/Language";
import { localizeKey } from "../../i18n/localization";
import type { AuthPageCopy } from "../../helpers/auth-copy";
import { AccessibleDialog } from "../common/ui/Dialog";
import { AuthInput } from "./AuthInput";
import { AuthSubmitButton } from "./AuthSubmitButton";

export function WeChatAuthDialog({
  copy,
  qrCode,
  code,
  codeError,
  submitting,
  closeButtonRef,
  codeInputRef,
  onClose,
  onChangeCode,
  onSubmit,
}: {
  copy: AuthPageCopy;
  qrCode: string;
  code: string;
  codeError?: string;
  submitting: boolean;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  codeInputRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onChangeCode: (value: string) => void;
  onSubmit: () => void;
}) {
  const { language } = useContext(LanguageContext);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <AccessibleDialog
      ariaDescribedBy={descriptionId}
      ariaLabelledBy={titleId}
      backdropClassName="auth-dialog-backdrop"
      className="auth-dialog"
      closeLabel={localizeKey(language, "Close")}
      initialFocusRef={closeButtonRef}
      panelClassName="auth-dialog-panel"
      onClose={onClose}
    >
      <button
        ref={closeButtonRef}
        className="auth-close"
        type="button"
        onClick={onClose}
        aria-label={localizeKey(language, "Close")}
      >
        <X size={22} />
      </button>
      <h2 id={titleId}>{copy.wechatTitle}</h2>
      {qrCode ? (
        <img
          className="wechat-qr"
          src={qrCode}
          alt={localizeKey(language, "WeChat QR code")}
        />
      ) : (
        <div className="wechat-empty">{copy.noWechatQr}</div>
      )}
      <p id={descriptionId}>{copy.wechatHelp}</p>
      <AuthInput
        autoComplete="one-time-code"
        error={codeError}
        inputRef={codeInputRef}
        label={copy.verificationCode}
        placeholder={copy.wechatPlaceholder}
        value={code}
        onChange={onChangeCode}
      />
      <AuthSubmitButton
        disabled={submitting}
        label={copy.submitWechat}
        loading={submitting}
        type="button"
        onClick={onSubmit}
      />
    </AccessibleDialog>
  );
}
