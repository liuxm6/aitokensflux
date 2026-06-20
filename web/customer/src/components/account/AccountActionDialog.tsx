import { Eye, EyeOff, LoaderCircle, X } from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Turnstile from "react-turnstile";
import { AuthInput } from "../auth/AuthInput";
import { LanguageContext } from "../../context/Language";
import { useToastMessage } from "../../context/Toast";
import { getBoundEmail } from "../../helpers/account";
import { localizeCopy } from "../../i18n/localization";
import { apiRequest, buildQuery } from "../../services/api";
import type {
  AccountDialogMode,
  CustomerStatus,
  CustomerUser,
} from "../../types";

function isValidEmail(value: string) {
  const email = value.trim();
  return (
    email.length > 0 &&
    email.length <= 50 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function getDialogExitDelay() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : 150;
}

export function AccountActionDialog({
  mode,
  user,
  onClose,
  onUserChange,
}: {
  mode: AccountDialogMode;
  user: CustomerUser;
  onClose: () => void;
  onUserChange: (user: CustomerUser | null) => void;
}) {
  const { language } = useContext(LanguageContext);
  const isEmailMode = mode === "email";
  const currentEmail = getBoundEmail(user);
  const closeTimerRef = useRef<number | null>(null);
  const [status, setStatus] = useState<CustomerStatus | null>(null);
  const [statusLoaded, setStatusLoaded] = useState(!isEmailMode);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [message, setMessage] = useState<{
    type: "info" | "error" | "success";
    text: string;
  } | null>(null);
  useToastMessage(message);
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [emailForm, setEmailForm] = useState({
    email: "",
    code: "",
  });
  const [isClosing, setIsClosing] = useState(false);
  const turnstileEnabled = Boolean(status?.turnstile_check);
  const turnstileReady = !turnstileEnabled || Boolean(turnstileToken);

  const requestClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(onClose, getDialogExitDelay());
  }, [isClosing, onClose]);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [requestClose]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isEmailMode) return;
    let mounted = true;
    void apiRequest<CustomerStatus>("/api/status", { method: "GET" })
      .then((response) => {
        if (mounted && response.success && response.data) {
          setStatus(response.data);
        }
      })
      .finally(() => {
        if (mounted) setStatusLoaded(true);
      });
    return () => {
      mounted = false;
    };
  }, [isEmailMode]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(
      () => setCooldown((value) => value - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const copy = localizeCopy(language, {
    title: isEmailMode ? "Change email" : "Change password",
    subtitle: isEmailMode
      ? "After verification, email sign-in uses the new address."
      : "Enter your current password and set a new one.",
    currentEmail: "Current email",
    notBound: "Not bound",
    currentPassword: "Current password",
    currentPasswordPlaceholder: "Enter current password",
    newPassword: "New password",
    newPasswordPlaceholder: "Enter new password",
    confirmPassword: "Confirm new password",
    confirmPasswordPlaceholder: "Enter new password again",
    newEmail: "New email",
    newEmailPlaceholder: "Enter new email address",
    code: "Email verification code",
    codePlaceholder: "Enter verification code",
    getCode: cooldown > 0 ? `${cooldown}s` : "Get code",
    cancel: "Cancel",
    submit: "Save changes",
    emailRule: "Enter a valid email, up to 50 characters",
    sameEmail: "New email must be different from current email",
    statusLoading: "Loading site security settings. Try again shortly.",
    turnstileRequired: "Complete the human verification first",
    codeRequired: "Enter the email verification code",
    currentRequired: "Enter your current password",
    passwordRule: "Password must be 8-20 characters",
    passwordSame: "New password must be different",
    passwordMismatch: "Passwords do not match",
    codeSent: "Verification code sent. Check your inbox.",
    passwordSuccess: "Password changed",
    emailSuccess: "Email changed",
    close: "Close",
  });

  const updatePasswordValue = (
    key: keyof typeof passwordForm,
    value: string,
  ) => {
    setPasswordForm((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };

  const updateEmailValue = (key: keyof typeof emailForm, value: string) => {
    setEmailForm((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };

  const closeAfterSuccess = () => {
    window.setTimeout(requestClose, 650);
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const currentPassword = passwordForm.current;
    const nextPassword = passwordForm.next;
    if (!currentPassword) {
      setMessage({ type: "error", text: copy.currentRequired });
      return;
    }
    if (nextPassword.length < 8 || nextPassword.length > 20) {
      setMessage({ type: "error", text: copy.passwordRule });
      return;
    }
    if (currentPassword === nextPassword) {
      setMessage({ type: "error", text: copy.passwordSame });
      return;
    }
    if (nextPassword !== passwordForm.confirm) {
      setMessage({ type: "error", text: copy.passwordMismatch });
      return;
    }
    setLoading(true);
    const response = await apiRequest("/api/user/self", {
      method: "PUT",
      body: JSON.stringify({
        original_password: currentPassword,
        password: nextPassword,
      }),
    });
    setLoading(false);
    if (response.success) {
      setMessage({ type: "success", text: copy.passwordSuccess });
      closeAfterSuccess();
      return;
    }
    setMessage({
      type: "error",
      text: response.message || copy.passwordRule,
    });
  };

  const handleSendEmailCode = async () => {
    const email = emailForm.email.trim();
    if (!isValidEmail(email)) {
      setMessage({ type: "error", text: copy.emailRule });
      return;
    }
    if (currentEmail && email === currentEmail) {
      setMessage({ type: "error", text: copy.sameEmail });
      return;
    }
    if (!statusLoaded) {
      setMessage({ type: "info", text: copy.statusLoading });
      return;
    }
    if (!turnstileReady) {
      setMessage({ type: "error", text: copy.turnstileRequired });
      return;
    }
    setCodeLoading(true);
    const response = await apiRequest(
      `/api/verification${buildQuery({
        email,
        turnstile: turnstileToken,
      })}`,
      { method: "GET" },
    );
    setCodeLoading(false);
    if (response.success) {
      setCooldown(60);
      setMessage({ type: "success", text: copy.codeSent });
      return;
    }
    setMessage({
      type: "error",
      text: response.message || copy.codeRequired,
    });
  };

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = emailForm.email.trim();
    const code = emailForm.code.trim();
    if (!isValidEmail(email)) {
      setMessage({ type: "error", text: copy.emailRule });
      return;
    }
    if (currentEmail && email === currentEmail) {
      setMessage({ type: "error", text: copy.sameEmail });
      return;
    }
    if (!code) {
      setMessage({ type: "error", text: copy.codeRequired });
      return;
    }
    setLoading(true);
    const response = await apiRequest("/api/oauth/email/bind", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    setLoading(false);
    if (response.success) {
      onUserChange({ ...user, email });
      setMessage({ type: "success", text: copy.emailSuccess });
      closeAfterSuccess();
      return;
    }
    setMessage({
      type: "error",
      text: response.message || copy.codeRequired,
    });
  };

  return (
    <div
      className={`account-dialog${isClosing ? " closing" : ""}`}
      role="presentation"
    >
      <button
        className="account-dialog-backdrop"
        type="button"
        onClick={requestClose}
        aria-label={copy.close}
      />
      <section className="account-dialog-panel" aria-label={copy.title}>
        <button
          className="account-dialog-close"
          type="button"
          onClick={requestClose}
          aria-label={copy.close}
        >
          <X size={20} />
        </button>
        <div className="account-dialog-head">
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
        <div className="account-readonly">
          <span>{copy.currentEmail}</span>
          <strong>{currentEmail || copy.notBound}</strong>
        </div>
        {isEmailMode ? (
          <form className="account-dialog-form" onSubmit={handleEmailSubmit}>
            <AuthInput
              autoComplete="email"
              label={copy.newEmail}
              maxLength={50}
              placeholder={copy.newEmailPlaceholder}
              type="email"
              value={emailForm.email}
              onChange={(value) => updateEmailValue("email", value)}
            />
            <AuthInput
              button={
                <button
                  disabled={codeLoading || cooldown > 0}
                  type="button"
                  onClick={() => void handleSendEmailCode()}
                >
                  {codeLoading ? (
                    <LoaderCircle className="spin" size={16} />
                  ) : (
                    copy.getCode
                  )}
                </button>
              }
              autoComplete="one-time-code"
              label={copy.code}
              placeholder={copy.codePlaceholder}
              value={emailForm.code}
              onChange={(value) => updateEmailValue("code", value)}
            />
            {turnstileEnabled && status?.turnstile_site_key ? (
              <div className="auth-turnstile">
                <Turnstile
                  sitekey={status.turnstile_site_key}
                  onVerify={setTurnstileToken}
                  onExpire={() => setTurnstileToken("")}
                  onError={() => setTurnstileToken("")}
                />
              </div>
            ) : null}
            <div className="account-dialog-actions">
              <button
                className="auth-secondary"
                type="button"
                onClick={requestClose}
              >
                {copy.cancel}
              </button>
              <button className="auth-submit" disabled={loading} type="submit">
                {loading ? (
                  <LoaderCircle className="spin" size={17} />
                ) : (
                  copy.submit
                )}
              </button>
            </div>
          </form>
        ) : (
          <form className="account-dialog-form" onSubmit={handlePasswordSubmit}>
            <AuthInput
              button={
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((value) => !value)}
                  aria-label={
                    showCurrentPassword ? "Hide password" : "Show password"
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              }
              autoComplete="current-password"
              label={copy.currentPassword}
              placeholder={copy.currentPasswordPlaceholder}
              type={showCurrentPassword ? "text" : "password"}
              value={passwordForm.current}
              onChange={(value) => updatePasswordValue("current", value)}
            />
            <AuthInput
              button={
                <button
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  aria-label={
                    showNewPassword ? "Hide password" : "Show password"
                  }
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              autoComplete="new-password"
              label={copy.newPassword}
              placeholder={copy.newPasswordPlaceholder}
              type={showNewPassword ? "text" : "password"}
              value={passwordForm.next}
              onChange={(value) => updatePasswordValue("next", value)}
            />
            <AuthInput
              button={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              }
              autoComplete="new-password"
              label={copy.confirmPassword}
              placeholder={copy.confirmPasswordPlaceholder}
              type={showConfirmPassword ? "text" : "password"}
              value={passwordForm.confirm}
              onChange={(value) => updatePasswordValue("confirm", value)}
            />
            <div className="account-dialog-actions">
              <button
                className="auth-secondary"
                type="button"
                onClick={requestClose}
              >
                {copy.cancel}
              </button>
              <button className="auth-submit" disabled={loading} type="submit">
                {loading ? (
                  <LoaderCircle className="spin" size={17} />
                ) : (
                  copy.submit
                )}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
