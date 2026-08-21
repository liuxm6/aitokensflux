import { Eye, EyeOff } from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthCloseButton } from "../../components/auth/AuthCloseButton";
import { AuthCodeSendButton } from "../../components/auth/AuthCodeSendButton";
import { AuthInput } from "../../components/auth/AuthInput";
import { AuthLegalConsent } from "../../components/auth/AuthLegalConsent";
import { AuthOAuthOptions } from "../../components/auth/AuthOAuthOptions";
import { AuthShell } from "../../components/auth/AuthShell";
import { AuthSubmitButton } from "../../components/auth/AuthSubmitButton";
import { AuthTurnstile } from "../../components/auth/AuthTurnstile";
import { AuthTwoFactorForm } from "../../components/auth/AuthTwoFactorForm";
import { WeChatAuthDialog } from "../../components/auth/WeChatAuthDialog";
import { AuthContext } from "../../context/Auth";
import { LanguageContext } from "../../context/Language";
import { useToastMessage } from "../../context/Toast";
import { buildAuthCopy } from "../../helpers/auth-copy";
import {
  generateUsernameFromEmail,
  isValidEmail,
} from "../../helpers/auth-form";
import {
  getAuthRedirectFromSearch,
  storeAuthRedirect,
} from "../../helpers/auth-redirect";
import {
  getAuthModeEnterDelay,
  getAuthModeExitDelay,
  getDialogExitDelay,
} from "../../helpers/motion";
import {
  buildAssertionResult,
  isPasskeySupported,
  prepareCredentialRequestOptions,
} from "../../helpers/passkeys";
import { navigateTo } from "../../helpers/navigation";
import {
  getOAuthState,
  getStoredAffCode,
  redirectToOAuth,
} from "../../helpers/oauth";
import { localizeKey } from "../../i18n/localization";
import {
  apiRequest,
  buildQuery,
  withTurnstileHeader,
} from "../../services/api";
import type {
  AuthFormValues,
  AuthLoginMethod,
  AuthMode,
  CustomerStatus,
  CustomerUser,
  LoginData,
  TelegramAuthPayload,
} from "../../types";

type AuthPageProps = {
  modal?: boolean;
  onClose?: () => void;
  successPath?: string;
};

type AuthFieldName =
  "email" | "password" | "verificationCode" | "twoFaCode" | "wechatCode";

export function AuthPage({
  modal = false,
  onClose,
  successPath,
}: AuthPageProps = {}) {
  const { language } = useContext(LanguageContext);
  const { setUser } = useContext(AuthContext);
  const closeTimerRef = useRef<number | null>(null);
  const modeExitTimerRef = useRef<number | null>(null);
  const modeEnterTimerRef = useRef<number | null>(null);
  const authCloseButtonRef = useRef<HTMLButtonElement>(null);
  const wechatCloseButtonRef = useRef<HTMLButtonElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const verificationCodeInputRef = useRef<HTMLInputElement>(null);
  const twoFaCodeInputRef = useRef<HTMLInputElement>(null);
  const wechatCodeInputRef = useRef<HTMLInputElement>(null);
  const [activeMode, setActiveMode] = useState<AuthMode>(() =>
    ["/register", "/sign-up"].includes(window.location.pathname)
      ? "register"
      : "login",
  );
  const [loginMethod, setLoginMethod] = useState<AuthLoginMethod>("password");
  const [values, setValues] = useState<AuthFormValues>({
    email: "",
    password: "",
    verificationCode: "",
    inviteCode: getStoredAffCode(),
  });
  const [status, setStatus] = useState<CustomerStatus | null>(null);
  const [agreed, setAgreed] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: "info" | "error" | "success";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<AuthFieldName, string>>
  >({});
  useToastMessage(message);
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState("");
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [wechatOpen, setWeChatOpen] = useState(false);
  const [wechatCode, setWeChatCode] = useState("");
  const [twoFaRequired, setTwoFaRequired] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [modeTransition, setModeTransition] = useState<"idle" | "out" | "in">(
    "idle",
  );
  const isRegister = activeMode === "register";
  const isEmailCodeLogin = !isRegister && loginMethod === "emailCode";
  const emailVerificationRequired = !!status?.email_verification;
  const requiresLegalConsent = true;
  const turnstileEnabled = Boolean(status?.turnstile_check);
  const turnstileReady = !turnstileEnabled || Boolean(turnstileToken);
  const passwordAuthEnabled = isRegister
    ? status?.register_enabled !== false &&
      status?.password_register_enabled !== false
    : status?.password_login_enabled !== false;
  const canShowRegisterLink =
    !status?.self_use_mode_enabled && status?.register_enabled !== false;
  const wechatQrCode =
    status?.wechat_qrcode ||
    status?.wechat_qr_code ||
    status?.wechat_qrcode_image_url ||
    status?.wechat_qr_code_image_url ||
    status?.wechat_account_qrcode_image_url ||
    status?.WeChatAccountQRCodeImageURL ||
    "";
  const customOAuthProviders = status?.custom_oauth_providers ?? [];
  const hasOAuthOptions = Boolean(
    status?.wechat_login ||
    status?.github_oauth ||
    status?.discord_oauth ||
    status?.oidc_enabled ||
    status?.linuxdo_oauth ||
    status?.telegram_oauth ||
    customOAuthProviders.length > 0 ||
    (!isRegister && status?.passkey_login && passkeySupported),
  );
  const redirectTarget = getAuthRedirectFromSearch();
  const authSuccessPath = redirectTarget || successPath || "/dashboard";
  const navigateAfterAuth = useCallback(() => {
    navigateTo(authSuccessPath);
  }, [authSuccessPath]);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }
    navigateTo("/");
  }, [onClose]);

  const requestClose = useCallback(() => {
    if (!modal) {
      handleClose();
      return;
    }
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(
      handleClose,
      getDialogExitDelay(),
    );
  }, [handleClose, isClosing, modal]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
      if (modeExitTimerRef.current !== null) {
        window.clearTimeout(modeExitTimerRef.current);
      }
      if (modeEnterTimerRef.current !== null) {
        window.clearTimeout(modeEnterTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const aff = getStoredAffCode();
    if (aff) window.localStorage.setItem("aff", aff);
    if (aff) {
      setValues((current) => ({
        ...current,
        inviteCode: current.inviteCode || aff,
      }));
    }
    void apiRequest<CustomerStatus>("/api/status").then((response) => {
      if (mounted && response.success && response.data) {
        setStatus(response.data);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    void isPasskeySupported()
      .then(setPasskeySupported)
      .catch(() => setPasskeySupported(false));
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(
      () => setCooldown((value) => value - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const copy = buildAuthCopy(language, {
    isRegister,
    isEmailCodeLogin,
    emailVerificationRequired,
    cooldown,
    useBackupCode,
  });

  const switchMode = (nextMode: AuthMode) => {
    if (nextMode === activeMode || loading || modeTransition !== "idle") return;

    const commitMode = () => {
      setActiveMode(nextMode);
      setLoginMethod("password");
      window.history.replaceState(
        null,
        "",
        nextMode === "register" ? "/register" : "/sign-in",
      );
      setMessage(null);
      setFieldErrors({});
      setUseBackupCode(false);
      setTwoFaCode("");
      setValues((current) => ({
        ...current,
        verificationCode: "",
      }));

      const enterDelay = getAuthModeEnterDelay();
      if (enterDelay === 0) {
        setModeTransition("idle");
        return;
      }
      setModeTransition("in");
      modeEnterTimerRef.current = window.setTimeout(
        () => setModeTransition("idle"),
        enterDelay,
      );
    };

    const exitDelay = getAuthModeExitDelay();
    if (exitDelay === 0) {
      commitMode();
      return;
    }
    setModeTransition("out");
    modeExitTimerRef.current = window.setTimeout(commitMode, exitDelay);
  };

  const updateValue = (key: keyof AuthFormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setMessage(null);
  };

  const showFieldError = (field: AuthFieldName, text: string) => {
    setFieldErrors({ [field]: text });
    setMessage(null);
    const fieldRefs: Record<AuthFieldName, typeof emailInputRef> = {
      email: emailInputRef,
      password: passwordInputRef,
      verificationCode: verificationCodeInputRef,
      twoFaCode: twoFaCodeInputRef,
      wechatCode: wechatCodeInputRef,
    };
    fieldRefs[field].current?.focus();
    return false;
  };

  const validateBase = () => {
    const account = values.email.trim();
    if (isRegister && !isValidEmail(account)) {
      return showFieldError("email", copy.emailRule);
    }
    if (!isRegister && (account.length === 0 || account.length > 50)) {
      return showFieldError("email", copy.accountRule);
    }
    if (
      isRegister &&
      (values.password.length < 8 || values.password.length > 20)
    ) {
      return showFieldError("password", copy.passwordRule);
    }
    if (!isRegister && values.password.length === 0) {
      return showFieldError("password", copy.loginPasswordRule);
    }
    if (requiresLegalConsent && !agreed) {
      setMessage({ type: "error", text: copy.agreementRequired });
      return false;
    }
    if (!turnstileReady) {
      setMessage({ type: "error", text: copy.turnstileRequired });
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const validateEmailCodeLogin = () => {
    if (!isValidEmail(values.email)) {
      return showFieldError("email", copy.emailRule);
    }
    if (!values.verificationCode.trim()) {
      return showFieldError("verificationCode", copy.codeRequired);
    }
    if (requiresLegalConsent && !agreed) {
      setMessage({ type: "error", text: copy.agreementRequired });
      return false;
    }
    if (!turnstileReady) {
      setMessage({ type: "error", text: copy.turnstileRequired });
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleLogin = async () => {
    if (!passwordAuthEnabled) {
      setMessage({ type: "error", text: copy.loginDisabled });
      return;
    }
    if (!validateBase()) return;
    setLoading(true);
    try {
      const response = await apiRequest<LoginData>("/api/user/login", {
        method: "POST",
        headers: withTurnstileHeader(turnstileToken),
        body: JSON.stringify({
          username: values.email.trim(),
          password: values.password,
        }),
      });

      if (!response.success || !response.data) {
        setMessage({
          type: "error",
          text: response.message || copy.loginDisabled,
        });
        return;
      }
      if (response.data.require_2fa) {
        setTwoFaRequired(true);
        setMessage(null);
        return;
      }
      setMessage({ type: "success", text: copy.success });
      setUser(response.data);
      navigateAfterAuth();
    } finally {
      setLoading(false);
    }
  };

  const handleEmailCodeLogin = async () => {
    if (!validateEmailCodeLogin()) return;
    setLoading(true);
    try {
      const response = await apiRequest<LoginData>(
        "/api/user/email-code/login",
        {
          method: "POST",
          headers: withTurnstileHeader(turnstileToken),
          body: JSON.stringify({
            email: values.email.trim(),
            verification_code: values.verificationCode.trim(),
          }),
        },
      );

      if (!response.success || !response.data) {
        setMessage({
          type: "error",
          text: response.message || copy.codeRequired,
        });
        return;
      }
      if (response.data.require_2fa) {
        setTwoFaRequired(true);
        setMessage(null);
        return;
      }
      setMessage({ type: "success", text: copy.success });
      setUser(response.data);
      navigateAfterAuth();
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!passwordAuthEnabled) {
      setMessage({ type: "error", text: copy.registerDisabled });
      return;
    }
    if (!validateBase()) return;
    if (emailVerificationRequired && !values.verificationCode.trim()) {
      showFieldError("verificationCode", copy.codeRequired);
      return;
    }

    setLoading(true);
    try {
      const email = values.email.trim();
      const username = generateUsernameFromEmail(email);
      const registerResponse = await apiRequest("/api/user/register", {
        method: "POST",
        headers: withTurnstileHeader(turnstileToken),
        body: JSON.stringify({
          username,
          email,
          password: values.password,
          verification_code: values.verificationCode.trim() || undefined,
          aff_code: values.inviteCode.trim() || getStoredAffCode() || undefined,
        }),
      });

      if (!registerResponse.success) {
        setMessage({
          type: "error",
          text: registerResponse.message || copy.registerDisabled,
        });
        return;
      }

      setMessage({ type: "success", text: copy.success });
      const loginResponse = await apiRequest<LoginData>("/api/user/login", {
        method: "POST",
        body: JSON.stringify({
          username: email,
          password: values.password,
        }),
      });

      if (loginResponse.success && loginResponse.data) {
        setUser(loginResponse.data);
        navigateAfterAuth();
        return;
      }

      navigateTo("/sign-in");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void (isRegister
      ? handleRegister()
      : isEmailCodeLogin
        ? handleEmailCodeLogin()
        : handleLogin());
  };

  const handleSendCode = async () => {
    if (!isValidEmail(values.email)) {
      showFieldError("email", copy.emailRule);
      return;
    }
    if (!isEmailCodeLogin && !emailVerificationRequired) {
      setMessage({ type: "info", text: copy.codeNotRequired });
      return;
    }
    if (!turnstileReady) {
      setMessage({ type: "error", text: copy.turnstileRequired });
      return;
    }
    setFieldErrors((current) => ({ ...current, email: undefined }));
    setCodeLoading(true);
    const response = await apiRequest(
      `/api/verification${buildQuery({
        email: values.email.trim(),
        purpose: isEmailCodeLogin ? "l" : undefined,
      })}`,
      { method: "GET", headers: withTurnstileHeader(turnstileToken) },
    );
    setCodeLoading(false);
    if (response.success) {
      setCooldown(60);
      setMessage({
        type: "success",
        text: localizeKey(
          language,
          "Verification code sent. Check your inbox.",
        ),
      });
    } else {
      setMessage({
        type: "error",
        text: response.message || copy.codeRequired,
      });
    }
  };

  const handleForgotPassword = async () => {
    if (!isValidEmail(values.email)) {
      showFieldError(
        "email",
        values.email.trim() ? copy.emailRule : copy.resetNeedEmail,
      );
      return;
    }
    if (!turnstileReady) {
      setMessage({ type: "error", text: copy.turnstileRequired });
      return;
    }
    setLoading(true);
    const response = await apiRequest(
      `/api/reset_password${buildQuery({
        email: values.email.trim(),
      })}`,
      { method: "GET", headers: withTurnstileHeader(turnstileToken) },
    );
    setLoading(false);
    setMessage({
      type: response.success ? "success" : "error",
      text: response.success
        ? copy.resetSent
        : response.message || copy.resetNeedEmail,
    });
  };

  const requireTurnstile = () => {
    if (!turnstileReady) {
      setMessage({ type: "error", text: copy.turnstileRequired });
      return false;
    }
    return true;
  };

  const resetSessionBeforeOAuth = async () => {
    setUser(null);
    await apiRequest("/api/user/logout", { method: "GET" }).catch(() => null);
  };

  const beginOAuth = async (
    key: string,
    buildUrl: (state: string) => string,
  ) => {
    if (requiresLegalConsent && !agreed) {
      setMessage({ type: "error", text: copy.agreementRequired });
      return;
    }
    if (!requireTurnstile()) return;
    setOAuthLoading(key);
    try {
      await resetSessionBeforeOAuth();
      storeAuthRedirect(authSuccessPath);
      const state = await getOAuthState(turnstileToken);
      if (!state) {
        setMessage({ type: "error", text: copy.oauthInitFailed });
        setOAuthLoading("");
        return;
      }
      redirectToOAuth(buildUrl(state));
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : copy.oauthInitFailed,
      });
      setOAuthLoading("");
    }
  };

  const handlePasskeyLogin = async () => {
    if (requiresLegalConsent && !agreed) {
      setMessage({ type: "error", text: copy.agreementRequired });
      return;
    }
    if (!passkeySupported) {
      setMessage({ type: "error", text: copy.passkeyUnsupported });
      return;
    }
    if (!requireTurnstile()) return;
    setOAuthLoading("passkey");
    try {
      const begin = await apiRequest("/api/user/passkey/login/begin", {
        method: "POST",
        headers: withTurnstileHeader(turnstileToken),
      });
      if (!begin.success || !begin.data) {
        setMessage({
          type: "error",
          text: begin.message || copy.passkeyUnsupported,
        });
        return;
      }
      const publicKey = prepareCredentialRequestOptions(begin.data);
      const credential = (await navigator.credentials.get({
        publicKey,
      })) as PublicKeyCredential | null;
      const payload = buildAssertionResult(credential);
      if (!payload) {
        setMessage({ type: "error", text: copy.passkeyUnsupported });
        return;
      }
      const finish = await apiRequest<CustomerUser>(
        "/api/user/passkey/login/finish",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      if (finish.success && finish.data) {
        setUser(finish.data);
        navigateAfterAuth();
        return;
      }
      setMessage({
        type: "error",
        text: finish.message || copy.passkeyUnsupported,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error && error.name === "AbortError"
            ? copy.unsupported
            : copy.passkeyUnsupported,
      });
    } finally {
      setOAuthLoading("");
    }
  };

  const handleWeChatSubmit = async () => {
    if (requiresLegalConsent && !agreed) {
      setMessage({ type: "error", text: copy.agreementRequired });
      return;
    }
    if (!wechatCode.trim()) {
      showFieldError("wechatCode", copy.codeRequired);
      return;
    }
    if (!turnstileReady) {
      setMessage({ type: "error", text: copy.turnstileRequired });
      return;
    }
    setOAuthLoading("wechat");
    const response = await apiRequest<CustomerUser>(
      `/api/oauth/wechat${buildQuery({
        code: wechatCode.trim(),
      })}`,
      { method: "GET", headers: withTurnstileHeader(turnstileToken) },
    );
    setOAuthLoading("");
    if (response.success && response.data) {
      setUser(response.data);
      navigateAfterAuth();
      return;
    }
    setMessage({ type: "error", text: response.message || copy.unsupported });
  };

  const handleTelegramAuth = async (payload: TelegramAuthPayload) => {
    if (requiresLegalConsent && !agreed) {
      setMessage({ type: "error", text: copy.agreementRequired });
      return;
    }
    if (!requireTurnstile()) return;
    const fields: Array<keyof TelegramAuthPayload> = [
      "id",
      "first_name",
      "last_name",
      "username",
      "photo_url",
      "auth_date",
      "hash",
      "lang",
    ];
    const params = new URLSearchParams();
    for (const field of fields) {
      const value = payload[field];
      if (value !== undefined && value !== null && value !== "") {
        params.set(field, String(value));
      }
    }
    setOAuthLoading("telegram");
    const response = await apiRequest<CustomerUser>(
      `/api/oauth/telegram/login?${params.toString()}`,
      { method: "GET", headers: withTurnstileHeader(turnstileToken) },
    );
    setOAuthLoading("");
    if (response.success && response.data) {
      setUser(response.data);
      navigateAfterAuth();
      return;
    }
    setMessage({ type: "error", text: response.message || copy.unsupported });
  };

  const handleTwoFaSubmit = async () => {
    const code = twoFaCode.trim();
    if (useBackupCode ? code.length !== 8 : !/^\d{6}$/.test(code)) {
      showFieldError("twoFaCode", copy.codeRequired);
      return;
    }
    setLoading(true);
    const response = await apiRequest<CustomerUser>("/api/user/login/2fa", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    setLoading(false);
    if (response.success && response.data) {
      setUser(response.data);
      navigateAfterAuth();
      return;
    }
    setMessage({ type: "error", text: response.message || copy.codeRequired });
  };

  const closeLabel = localizeKey(language, "Close");
  const oauthOptions = hasOAuthOptions ? (
    <AuthOAuthOptions
      copy={copy}
      customOAuthProviders={customOAuthProviders}
      isRegister={isRegister}
      oauthLoading={oauthLoading}
      passkeySupported={passkeySupported}
      status={status}
      onBeginOAuth={(key, buildUrl) => void beginOAuth(key, buildUrl)}
      onPasskeyLogin={() => void handlePasskeyLogin()}
      onTelegramAuth={(payload) => void handleTelegramAuth(payload)}
      onUnsupported={() => setMessage({ type: "info", text: copy.unsupported })}
      onWeChat={() => {
        if (!requireTurnstile()) return;
        setWeChatOpen(true);
      }}
    />
  ) : null;

  if (twoFaRequired) {
    return (
      <AuthShell
        closeLabel={closeLabel}
        initialFocusRef={authCloseButtonRef}
        isClosing={isClosing}
        label={copy.twoFaTitle}
        modal={modal}
        onClose={requestClose}
      >
        <AuthTwoFactorForm
          closeButtonRef={authCloseButtonRef}
          closeLabel={closeLabel}
          copy={copy}
          fieldError={fieldErrors.twoFaCode}
          loading={loading}
          twoFaCode={twoFaCode}
          twoFaCodeInputRef={twoFaCodeInputRef}
          onBack={() => {
            setTwoFaRequired(false);
            setTwoFaCode("");
            setMessage(null);
          }}
          onChangeCode={(value) => {
            setTwoFaCode(value);
            setFieldErrors((current) => ({
              ...current,
              twoFaCode: undefined,
            }));
          }}
          onClose={requestClose}
          onSubmit={() => void handleTwoFaSubmit()}
          onToggleBackup={() => {
            setUseBackupCode((value) => !value);
            setTwoFaCode("");
            setMessage(null);
          }}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      closeLabel={closeLabel}
      extra={
        wechatOpen ? (
          <WeChatAuthDialog
            closeButtonRef={wechatCloseButtonRef}
            code={wechatCode}
            codeError={fieldErrors.wechatCode}
            codeInputRef={wechatCodeInputRef}
            copy={copy}
            qrCode={wechatQrCode}
            submitting={oauthLoading === "wechat"}
            onChangeCode={(value) => {
              setWeChatCode(value);
              setFieldErrors((current) => ({
                ...current,
                wechatCode: undefined,
              }));
            }}
            onClose={() => setWeChatOpen(false)}
            onSubmit={() => void handleWeChatSubmit()}
          />
        ) : null
      }
      initialFocusRef={authCloseButtonRef}
      isClosing={isClosing}
      label={copy.title}
      modal={modal}
      showSignInAction
      onClose={requestClose}
    >
      <section
        className={`auth-modal auth-mode-${modeTransition}`}
        aria-label={copy.title}
      >
        <AuthCloseButton
          buttonRef={authCloseButtonRef}
          label={closeLabel}
          onClick={requestClose}
        />
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-head">
            <h1>{copy.title}</h1>
          </div>
          <AuthInput
            error={fieldErrors.email}
            inputRef={emailInputRef}
            label={copy.email}
            maxLength={50}
            placeholder={copy.emailPlaceholder}
            type={isRegister || isEmailCodeLogin ? "email" : "text"}
            autoComplete={isRegister || isEmailCodeLogin ? "email" : "username"}
            value={values.email}
            onChange={(value) => updateValue("email", value)}
          />
          {!isEmailCodeLogin ? (
            <AuthInput
              button={
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={localizeKey(
                    language,
                    showPassword ? "Hide password" : "Show password",
                  )}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              label={copy.password}
              placeholder={copy.passwordPlaceholder}
              type={showPassword ? "text" : "password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              error={fieldErrors.password}
              inputRef={passwordInputRef}
              value={values.password}
              onChange={(value) => updateValue("password", value)}
            />
          ) : null}
          {isRegister ? (
            <>
              {emailVerificationRequired ? (
                <AuthInput
                  button={
                    <AuthCodeSendButton
                      ariaLabel={localizeKey(language, "Get code")}
                      disabled={codeLoading || cooldown > 0}
                      label={copy.getCode}
                      loading={codeLoading}
                      onClick={() => void handleSendCode()}
                    />
                  }
                  autoComplete="one-time-code"
                  error={fieldErrors.verificationCode}
                  inputRef={verificationCodeInputRef}
                  label={copy.verificationCode}
                  placeholder={copy.verificationPlaceholder}
                  value={values.verificationCode}
                  onChange={(value) => updateValue("verificationCode", value)}
                />
              ) : null}
              <AuthInput
                autoComplete="off"
                label={copy.inviteCode}
                placeholder={copy.invitePlaceholder}
                value={values.inviteCode}
                onChange={(value) => updateValue("inviteCode", value)}
              />
            </>
          ) : isEmailCodeLogin ? (
            <AuthInput
              button={
                <AuthCodeSendButton
                  ariaLabel={localizeKey(language, "Get code")}
                  disabled={codeLoading || cooldown > 0}
                  label={copy.getCode}
                  loading={codeLoading}
                  onClick={() => void handleSendCode()}
                />
              }
              autoComplete="one-time-code"
              error={fieldErrors.verificationCode}
              inputRef={verificationCodeInputRef}
              label={copy.verificationCode}
              placeholder={copy.verificationPlaceholder}
              value={values.verificationCode}
              onChange={(value) => updateValue("verificationCode", value)}
            />
          ) : (
            <div className="auth-forgot">
              <button type="button" onClick={() => void handleForgotPassword()}>
                {copy.forgot}
              </button>
            </div>
          )}
          <AuthTurnstile
            appearance="interaction-only"
            enabled={turnstileEnabled}
            siteKey={status?.turnstile_site_key}
            size="flexible"
            onToken={setTurnstileToken}
          />
          <AuthSubmitButton
            disabled={loading}
            label={copy.submit}
            loading={loading}
          />
          {!isRegister ? (
            <button
              className="auth-secondary"
              disabled={loading}
              type="button"
              onClick={() => {
                setLoginMethod((method) =>
                  method === "password" ? "emailCode" : "password",
                );
                setValues((current) => ({
                  ...current,
                  password: "",
                  verificationCode: "",
                }));
                setMessage(null);
              }}
            >
              {isEmailCodeLogin ? copy.passwordLogin : copy.codeLogin}
            </button>
          ) : null}
          {oauthOptions}
          <AuthLegalConsent
            agreed={agreed}
            copy={copy}
            privacyEnabled={Boolean(status?.privacy_policy_enabled)}
            onAgreedChange={setAgreed}
          />
        </form>
        {canShowRegisterLink || isRegister ? (
          <div className="auth-switch">
            <button
              type="button"
              disabled={loading || modeTransition !== "idle"}
              onClick={() => switchMode(isRegister ? "login" : "register")}
            >
              {copy.switchText}
            </button>
          </div>
        ) : null}
      </section>
    </AuthShell>
  );
}
