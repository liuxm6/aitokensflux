import {
  Eye,
  EyeOff,
  Fingerprint,
  Globe2,
  KeyRound,
  LoaderCircle,
  Send,
  X,
} from "lucide-react";
import Turnstile from "react-turnstile";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { AuthInput } from "../../components/auth/AuthInput";
import {
  GitHubMark,
  LinuxDOMark,
} from "../../components/auth/AuthProviderMarks";
import { TelegramLoginWidget } from "../../components/auth/TelegramLoginWidget";
import { AppLink } from "../../components/common/AppLink";
import { Brand } from "../../components/common/Brand";
import { AccessibleDialog } from "../../components/common/ui/Dialog";
import { LanguageButton } from "../../components/layout/LanguageButton";
import { AuthContext } from "../../context/Auth";
import { LanguageContext, T } from "../../context/Language";
import { useToastMessage } from "../../context/Toast";
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
  buildCustomOAuthUrl,
  buildDiscordOAuthUrl,
  buildGitHubOAuthUrl,
  buildLinuxDOOAuthUrl,
  buildOIDCOAuthUrl,
  getOAuthState,
  getStoredAffCode,
  redirectToOAuth,
} from "../../helpers/oauth";
import { localizeKey, localizeCopy } from "../../i18n/localization";
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
  const wechatTitleId = useId();
  const wechatDescriptionId = useId();
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

  const copy = localizeCopy(language, {
    title: isRegister
      ? "Register"
      : isEmailCodeLogin
        ? "Email code sign in"
        : "Account password sign in",
    email: isRegister || isEmailCodeLogin ? "Email" : "Email / username",
    emailPlaceholder:
      isRegister || isEmailCodeLogin
        ? "Enter your email"
        : "Enter your email or username",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    verificationCode: "Email verification code",
    verificationPlaceholder:
      isEmailCodeLogin || emailVerificationRequired
        ? "Enter code"
        : "No code required",
    inviteCode: "Invite code",
    invitePlaceholder: "Invite code (optional)",
    getCode: cooldown > 0 ? `${cooldown}s` : "Get code",
    submit: isRegister ? "Register" : "Sign in",
    codeLogin: "Sign in with email code",
    passwordLogin: "Sign in with password",
    googleLogin: "Sign in with Google",
    forgot: "Forgot password?",
    agreement: "I have read and agree to",
    userAgreement: "User Agreement and Terms of Service",
    privacyPolicy: "Privacy Policy",
    and: "and",
    switchText: isRegister
      ? "Already have an account? Sign in"
      : "No account? Register",
    invalidEmail: "Enter a valid email",
    emailRule: "Enter a valid email, up to 50 characters",
    accountRule: "Enter your email or username, up to 50 characters",
    passwordRule: "Password must be 8-20 characters",
    loginPasswordRule: "Enter your password",
    agreementRequired: "Please agree to the legal terms first",
    codeRequired: "Enter the email verification code",
    loginDisabled: "Password login is disabled",
    registerDisabled: "Password registration is disabled",
    turnstileRequired: "Complete the human verification first",
    codeNotRequired: "Email verification code is not required",
    unsupported: "This sign-in method is not available yet",
    passkeyUnsupported: "Passkey is not available in this environment",
    passkeyLogin: "Sign in with Passkey",
    wechatLogin: "Continue with WeChat",
    githubLogin: "Continue with GitHub",
    discordLogin: "Continue with Discord",
    oidcLogin: "Continue with OIDC",
    linuxdoLogin: "Continue with LinuxDO",
    telegramLogin: "Continue with Telegram",
    customLogin: "Continue with {{name}}",
    oauthInitFailed: "Failed to initialize OAuth",
    resetSent: "Reset email sent. Check your inbox.",
    resetNeedEmail: "Enter your account email first",
    twoFaTitle: "Two-factor verification",
    twoFaText:
      "Enter an authenticator code or backup code to finish signing in.",
    twoFaCode: useBackupCode ? "Backup code" : "Verification code",
    twoFaPlaceholder: useBackupCode
      ? "Enter 8-character backup code"
      : "Enter 6-digit code",
    twoFaSubmit: "Verify and sign in",
    useBackupCode: useBackupCode ? "Use verification code" : "Use backup code",
    backToLogin: "Back to password sign in",
    wechatTitle: "WeChat sign in",
    wechatHelp:
      "Scan the QR code, follow the account, and enter the verification code.",
    wechatPlaceholder: "Enter WeChat verification code",
    submitWechat: "Sign in",
    noWechatQr: "WeChat QR code is not configured",
    otherOptions: "Other sign-in options",
    success: isRegister ? "Registered. Signing in..." : "Signed in",
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

  const renderLegalConsent = () => {
    return (
      <label className="auth-terms">
        <input
          checked={agreed}
          type="checkbox"
          onChange={(event) => setAgreed(event.currentTarget.checked)}
        />
        <span>{copy.agreement}</span>
        <AppLink href="/user-agreement">{copy.userAgreement}</AppLink>
        {status?.privacy_policy_enabled ? <span>{copy.and}</span> : null}
        {status?.privacy_policy_enabled ? (
          <AppLink href="/privacy-policy">{copy.privacyPolicy}</AppLink>
        ) : null}
      </label>
    );
  };

  const renderTurnstile = () => {
    if (!turnstileEnabled || !status?.turnstile_site_key) return null;
    return (
      <div className="auth-turnstile">
        <Turnstile
          sitekey={status.turnstile_site_key}
          appearance="interaction-only"
          size="flexible"
          onVerify={setTurnstileToken}
          onExpire={() => setTurnstileToken("")}
          onError={() => setTurnstileToken("")}
        />
      </div>
    );
  };

  const renderOAuthOptions = () => {
    if (!hasOAuthOptions) return null;
    return (
      <>
        <div className="auth-divider">
          <span>{copy.otherOptions}</span>
        </div>
        <div className="auth-oauth">
          {status?.wechat_login ? (
            <button
              className="auth-secondary"
              disabled={oauthLoading === "wechat"}
              type="button"
              onClick={() => {
                if (!requireTurnstile()) return;
                setWeChatOpen(true);
              }}
            >
              <span className="provider-dot wechat">WX</span>
              {copy.wechatLogin}
            </button>
          ) : null}
          {status?.github_oauth && status.github_client_id ? (
            <button
              className="auth-secondary"
              disabled={!!oauthLoading}
              type="button"
              onClick={() =>
                void beginOAuth("github", (state) =>
                  buildGitHubOAuthUrl(status.github_client_id!, state),
                )
              }
            >
              {oauthLoading === "github" ? (
                <LoaderCircle className="spin" size={16} />
              ) : (
                <GitHubMark />
              )}
              {copy.githubLogin}
            </button>
          ) : null}
          {status?.discord_oauth && status.discord_client_id ? (
            <button
              className="auth-secondary"
              disabled={!!oauthLoading}
              type="button"
              onClick={() =>
                void beginOAuth("discord", (state) =>
                  buildDiscordOAuthUrl(status.discord_client_id!, state),
                )
              }
            >
              <span className="provider-dot discord">D</span>
              {copy.discordLogin}
            </button>
          ) : null}
          {status?.oidc_enabled &&
          status.oidc_authorization_endpoint &&
          status.oidc_client_id ? (
            <button
              className="auth-secondary"
              disabled={!!oauthLoading}
              type="button"
              onClick={() =>
                void beginOAuth("oidc", (state) =>
                  buildOIDCOAuthUrl(
                    status.oidc_authorization_endpoint!,
                    status.oidc_client_id!,
                    state,
                  ),
                )
              }
            >
              <Globe2 size={17} />
              {copy.oidcLogin}
            </button>
          ) : null}
          {status?.linuxdo_oauth && status.linuxdo_client_id ? (
            <button
              className="auth-secondary"
              disabled={!!oauthLoading}
              type="button"
              onClick={() =>
                void beginOAuth("linuxdo", (state) =>
                  buildLinuxDOOAuthUrl(status.linuxdo_client_id!, state),
                )
              }
            >
              <LinuxDOMark />
              {copy.linuxdoLogin}
            </button>
          ) : null}
          {customOAuthProviders.map((provider) => (
            <button
              className="auth-secondary"
              disabled={!!oauthLoading}
              key={provider.slug}
              type="button"
              onClick={() =>
                void beginOAuth(`custom-${provider.slug}`, (state) =>
                  buildCustomOAuthUrl(provider, state),
                )
              }
            >
              <span className="provider-dot custom">
                {provider.name.slice(0, 1).toUpperCase()}
              </span>
              {copy.customLogin.replace("{{name}}", provider.name)}
            </button>
          ))}
          {status?.telegram_oauth && status.telegram_bot_name ? (
            <div className="telegram-widget-wrap">
              <TelegramLoginWidget
                botName={status.telegram_bot_name}
                onAuth={(payload) => void handleTelegramAuth(payload)}
              />
            </div>
          ) : status?.telegram_oauth ? (
            <button
              className="auth-secondary"
              type="button"
              onClick={() =>
                setMessage({ type: "info", text: copy.unsupported })
              }
            >
              <Send size={17} />
              {copy.telegramLogin}
            </button>
          ) : null}
          {!isRegister && status?.passkey_login ? (
            <button
              className="auth-secondary"
              disabled={!!oauthLoading || !passkeySupported}
              type="button"
              onClick={() => void handlePasskeyLogin()}
            >
              {oauthLoading === "passkey" ? (
                <LoaderCircle className="spin" size={16} />
              ) : (
                <Fingerprint size={17} />
              )}
              {copy.passkeyLogin}
            </button>
          ) : null}
        </div>
      </>
    );
  };

  const renderAuthShell = (
    label: string,
    content: ReactNode,
    extra?: ReactNode,
    showSignInAction = false,
  ) => {
    if (modal) {
      return (
        <AccessibleDialog
          ariaLabel={label}
          backdropClassName="auth-overlay-backdrop"
          className={`auth-overlay${isClosing ? " closing" : ""}`}
          closeDisabled={isClosing}
          closeLabel={localizeKey(language, "Close")}
          initialFocusRef={authCloseButtonRef}
          panelClassName="auth-overlay-panel"
          onClose={requestClose}
        >
          {content}
          {extra}
        </AccessibleDialog>
      );
    }

    return (
      <main className="auth-page">
        <div className="auth-top">
          <Brand />
          <div className="auth-actions">
            <LanguageButton />
            {showSignInAction ? (
              <AppLink className="btn btn-ghost btn-sm" href="/sign-in">
                <T id="Sign in / Register" />
              </AppLink>
            ) : null}
          </div>
        </div>
        <div className="auth-bg" aria-hidden="true">
          <h1>Claude Code / OpenAI Codex</h1>
        </div>
        <div className="auth-scrim" />
        {content}
        {extra}
      </main>
    );
  };

  if (twoFaRequired) {
    return renderAuthShell(
      copy.twoFaTitle,
      <>
        <section className="auth-modal" aria-label={copy.twoFaTitle}>
          <button
            ref={authCloseButtonRef}
            className="auth-close"
            type="button"
            onClick={requestClose}
            aria-label={localizeKey(language, "Close")}
          >
            <X size={24} />
          </button>
          <div className="auth-form">
            <h1>{copy.twoFaTitle}</h1>
            <p className="auth-note">{copy.twoFaText}</p>
            <AuthInput
              autoComplete="one-time-code"
              error={fieldErrors.twoFaCode}
              icon={KeyRound}
              inputRef={twoFaCodeInputRef}
              label={copy.twoFaCode}
              placeholder={copy.twoFaPlaceholder}
              value={twoFaCode}
              onChange={(value) => {
                setTwoFaCode(value);
                setFieldErrors((current) => ({
                  ...current,
                  twoFaCode: undefined,
                }));
              }}
            />
            <button
              className="auth-submit"
              disabled={loading}
              type="button"
              onClick={() => void handleTwoFaSubmit()}
            >
              {loading ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                copy.twoFaSubmit
              )}
            </button>
            <button
              className="auth-secondary"
              type="button"
              onClick={() => {
                setUseBackupCode((value) => !value);
                setTwoFaCode("");
                setMessage(null);
              }}
            >
              {copy.useBackupCode}
            </button>
            <button
              className="auth-link-btn"
              type="button"
              onClick={() => {
                setTwoFaRequired(false);
                setTwoFaCode("");
                setMessage(null);
              }}
            >
              {copy.backToLogin}
            </button>
          </div>
        </section>
      </>,
    );
  }

  return renderAuthShell(
    copy.title,
    <>
      <section
        className={`auth-modal auth-mode-${modeTransition}`}
        aria-label={copy.title}
      >
        <button
          ref={authCloseButtonRef}
          className="auth-close"
          type="button"
          onClick={requestClose}
          aria-label={localizeKey(language, "Close")}
        >
          <X size={24} />
        </button>
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
                    <button
                      disabled={codeLoading || cooldown > 0}
                      type="button"
                      onClick={() => void handleSendCode()}
                    >
                      {codeLoading ? (
                        <LoaderCircle className="spin" size={16} />
                      ) : (
                        copy.getCode
                      )}
                    </button>
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
                <button
                  disabled={codeLoading || cooldown > 0}
                  type="button"
                  onClick={() => void handleSendCode()}
                >
                  {codeLoading ? (
                    <LoaderCircle className="spin" size={16} />
                  ) : (
                    copy.getCode
                  )}
                </button>
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
          {renderTurnstile()}
          <button className="auth-submit" disabled={loading} type="submit">
            {loading ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              copy.submit
            )}
          </button>
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
          {renderOAuthOptions()}
          {renderLegalConsent()}
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
    </>,
    wechatOpen ? (
      <AccessibleDialog
        ariaDescribedBy={wechatDescriptionId}
        ariaLabelledBy={wechatTitleId}
        backdropClassName="auth-dialog-backdrop"
        className="auth-dialog"
        closeLabel={localizeKey(language, "Close")}
        initialFocusRef={wechatCloseButtonRef}
        panelClassName="auth-dialog-panel"
        onClose={() => setWeChatOpen(false)}
      >
        <button
          ref={wechatCloseButtonRef}
          className="auth-close"
          type="button"
          onClick={() => setWeChatOpen(false)}
          aria-label={localizeKey(language, "Close")}
        >
          <X size={22} />
        </button>
        <h2 id={wechatTitleId}>{copy.wechatTitle}</h2>
        {wechatQrCode ? (
          <img
            className="wechat-qr"
            src={wechatQrCode}
            alt={localizeKey(language, "WeChat QR code")}
          />
        ) : (
          <div className="wechat-empty">{copy.noWechatQr}</div>
        )}
        <p id={wechatDescriptionId}>{copy.wechatHelp}</p>
        <AuthInput
          autoComplete="one-time-code"
          error={fieldErrors.wechatCode}
          inputRef={wechatCodeInputRef}
          label={copy.verificationCode}
          placeholder={copy.wechatPlaceholder}
          value={wechatCode}
          onChange={(value) => {
            setWeChatCode(value);
            setFieldErrors((current) => ({
              ...current,
              wechatCode: undefined,
            }));
          }}
        />
        <button
          className="auth-submit"
          disabled={oauthLoading === "wechat"}
          type="button"
          onClick={() => void handleWeChatSubmit()}
        >
          {oauthLoading === "wechat" ? (
            <LoaderCircle className="spin" size={18} />
          ) : (
            copy.submitWechat
          )}
        </button>
      </AccessibleDialog>
    ) : null,
    true,
  );
}
