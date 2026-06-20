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
  useMemo,
  useRef,
  useState,
} from "react";
import { AuthInput } from "../../components/auth/AuthInput";
import { AppLink } from "../../components/common/AppLink";
import { Brand } from "../../components/common/Brand";
import { LanguageButton } from "../../components/layout/LanguageButton";
import { AuthContext } from "../../context/Auth";
import { LanguageContext, T } from "../../context/Language";
import { useToastMessage } from "../../context/Toast";
import {
  getAuthRedirectFromSearch,
  storeAuthRedirect,
} from "../../helpers/auth-redirect";
import {
  buildAssertionResult,
  isPasskeySupported,
  prepareCredentialRequestOptions,
} from "../../helpers/passkeys";
import { navigateTo } from "../../helpers/navigation";
import { localizeKey, localizeCopy } from "../../i18n/localization";
import { apiRequest, buildQuery } from "../../services/api";
import type {
  AuthFormValues,
  AuthLoginMethod,
  AuthMode,
  CustomOAuthProvider,
  CustomerStatus,
  CustomerUser,
  LoginData,
  TelegramAuthPayload,
} from "../../types";

function getSearchParam(name: string) {
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

function getStoredAffCode() {
  return (
    getSearchParam("aff") ||
    getSearchParam("aff_code") ||
    getSearchParam("invite_code") ||
    window.localStorage.getItem("aff") ||
    ""
  ).trim();
}

async function getOAuthState(turnstileToken?: string) {
  const aff = getStoredAffCode();
  const response = await apiRequest<string>(
    `/api/oauth/state${buildQuery({ aff, turnstile: turnstileToken })}`,
    { method: "GET" },
  );
  return response.success && response.data ? response.data : "";
}

function redirectToOAuth(url: string) {
  window.location.assign(url);
}

function buildGitHubOAuthUrl(clientId: string, state: string) {
  return `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&state=${encodeURIComponent(state)}&scope=user:email`;
}

function buildDiscordOAuthUrl(clientId: string, state: string) {
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set(
    "redirect_uri",
    `${window.location.origin}/oauth/discord`,
  );
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify+openid");
  url.searchParams.set("state", state);
  return url.toString();
}

function buildOIDCOAuthUrl(authUrl: string, clientId: string, state: string) {
  const url = new URL(authUrl);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${window.location.origin}/oauth/oidc`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("state", state);
  return url.toString();
}

function buildLinuxDOOAuthUrl(clientId: string, state: string) {
  return `https://connect.linux.do/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&state=${encodeURIComponent(state)}`;
}

function buildCustomOAuthUrl(provider: CustomOAuthProvider, state: string) {
  const url = new URL(provider.authorization_endpoint);
  url.searchParams.set("client_id", provider.client_id);
  url.searchParams.set(
    "redirect_uri",
    `${window.location.origin}/oauth/${provider.slug}`,
  );
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", provider.scopes || "openid profile email");
  url.searchParams.set("state", state);
  return url.toString();
}

function isValidEmail(value: string) {
  const email = value.trim();
  return (
    email.length > 0 &&
    email.length <= 50 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function generateUsernameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "";
  const stem = localPart
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}_-]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 13);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${stem || "user"}-${suffix}`.slice(0, 20);
}

function getDialogExitDelay() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : 150;
}

function getAuthModeExitDelay() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 90;
}

function getAuthModeEnterDelay() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : 170;
}

type AuthPageProps = {
  modal?: boolean;
  onClose?: () => void;
  successPath?: string;
};

function GitHubMark() {
  return (
    <svg className="github-mark" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.92.58.11.79-.25.79-.56v-1.98c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.67 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.03 0 0 .96-.31 3.15 1.17A10.9 10.9 0 0 1 12 5.58c.97 0 1.95.13 2.86.39 2.19-1.48 3.15-1.17 3.15-1.17.62 1.57.23 2.74.11 3.03.74.8 1.18 1.82 1.18 3.07 0 4.4-2.68 5.37-5.24 5.66.42.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LinuxDOMark() {
  return (
    <svg
      className="linuxdo-mark"
      viewBox="0 0 16 16"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.44 0h.13c.09 0 .19 0 .28 0h.43c.09 0 .18 0 .27 0h.25c.09 0 .17.03.26.08.15.03.29.06.44.08 1.97.38 3.78 1.47 4.95 3.11.04.06.09.12.13.18.67.96 1.15 2.11 1.3 3.28v.26c0 .15 0 .29 0 .44v.13c0 .09 0 .19 0 .28v.43c0 .09 0 .18 0 .27v.25c0 .09-.03.17-.08.26-.03.15-.06.29-.08.44-.38 1.97-1.47 3.78-3.11 4.95-.06.04-.12.09-.18.13-.96.67-2.11 1.15-3.28 1.3h-.26c-.15 0-.29 0-.44 0h-.13c-.09 0-.19 0-.28 0h-.43c-.09 0-.18 0-.27 0h-.25c-.09 0-.17-.03-.26-.08-.15-.03-.29-.06-.44-.08-1.97-.38-3.78-1.47-4.95-3.11L.59 12.6c-.67-.96-1.15-2.11-1.3-3.28v-.26c0-.15 0-.29 0-.44v-.13c0-.09 0-.19 0-.28v-.43c0-.09 0-.18 0-.27v-.25c0-.09.03-.17.08-.26.03-.15.06-.29.08-.44.38-1.97 1.47-3.78 3.11-4.95.06-.04.12-.09.18-.13C4.42.73 5.57.26 6.74.1c.26-.03.41-.1.7-.1Z"
        fill="#efefef"
      />
      <path
        d="M1.27 11.33h13.45c-.94 1.89-2.51 3.21-4.51 3.88-1.99.59-3.96.37-5.8-.57-1.25-.7-2.67-1.9-3.14-3.3Z"
        fill="#feb005"
      />
      <path
        d="M12.54 1.99c.87.7 1.82 1.59 2.18 2.68H1.27c.87-1.74 2.33-3.13 4.2-3.78 2.44-.79 5-.47 7.07 1.1Z"
        fill="#1d1d1f"
      />
    </svg>
  );
}

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
    if (!modal) return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modal, requestClose]);

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
    setMessage(null);
  };

  const validateBase = () => {
    const account = values.email.trim();
    if (isRegister && !isValidEmail(account)) {
      setMessage({ type: "error", text: copy.emailRule });
      return false;
    }
    if (!isRegister && (account.length === 0 || account.length > 50)) {
      setMessage({ type: "error", text: copy.accountRule });
      return false;
    }
    if (
      isRegister &&
      (values.password.length < 8 || values.password.length > 20)
    ) {
      setMessage({ type: "error", text: copy.passwordRule });
      return false;
    }
    if (!isRegister && values.password.length === 0) {
      setMessage({ type: "error", text: copy.loginPasswordRule });
      return false;
    }
    if (requiresLegalConsent && !agreed) {
      setMessage({ type: "error", text: copy.agreementRequired });
      return false;
    }
    if (!turnstileReady) {
      setMessage({ type: "error", text: copy.turnstileRequired });
      return false;
    }
    return true;
  };

  const validateEmailCodeLogin = () => {
    if (!isValidEmail(values.email)) {
      setMessage({ type: "error", text: copy.emailRule });
      return false;
    }
    if (!values.verificationCode.trim()) {
      setMessage({ type: "error", text: copy.codeRequired });
      return false;
    }
    if (requiresLegalConsent && !agreed) {
      setMessage({ type: "error", text: copy.agreementRequired });
      return false;
    }
    if (!turnstileReady) {
      setMessage({ type: "error", text: copy.turnstileRequired });
      return false;
    }
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
      const response = await apiRequest<LoginData>(
        `/api/user/login${buildQuery({ turnstile: turnstileToken })}`,
        {
          method: "POST",
          body: JSON.stringify({
            username: values.email.trim(),
            password: values.password,
          }),
        },
      );

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
        `/api/user/email-code/login${buildQuery({ turnstile: turnstileToken })}`,
        {
          method: "POST",
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
      setMessage({ type: "error", text: copy.codeRequired });
      return;
    }

    setLoading(true);
    try {
      const email = values.email.trim();
      const username = generateUsernameFromEmail(email);
      const registerResponse = await apiRequest(
        `/api/user/register${buildQuery({ turnstile: turnstileToken })}`,
        {
          method: "POST",
          body: JSON.stringify({
            username,
            email,
            password: values.password,
            verification_code: values.verificationCode.trim() || undefined,
            aff_code:
              values.inviteCode.trim() || getStoredAffCode() || undefined,
          }),
        },
      );

      if (!registerResponse.success) {
        setMessage({
          type: "error",
          text: registerResponse.message || copy.registerDisabled,
        });
        return;
      }

      setMessage({ type: "success", text: copy.success });
      const loginResponse = await apiRequest<LoginData>(
        `/api/user/login${buildQuery({ turnstile: turnstileToken })}`,
        {
          method: "POST",
          body: JSON.stringify({
            username: email,
            password: values.password,
          }),
        },
      );

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
      setMessage({ type: "error", text: copy.emailRule });
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
    setCodeLoading(true);
    const response = await apiRequest(
      `/api/verification${buildQuery({
        email: values.email.trim(),
        purpose: isEmailCodeLogin ? "l" : undefined,
        turnstile: turnstileToken,
      })}`,
      { method: "GET" },
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
      setMessage({
        type: "error",
        text: values.email.trim() ? copy.emailRule : copy.resetNeedEmail,
      });
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
        turnstile: turnstileToken,
      })}`,
      { method: "GET" },
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
      const begin = await apiRequest(
        `/api/user/passkey/login/begin${buildQuery({
          turnstile: turnstileToken,
        })}`,
        {
          method: "POST",
        },
      );
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
      setMessage({ type: "error", text: copy.codeRequired });
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
        turnstile: turnstileToken,
      })}`,
      { method: "GET" },
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
    if (turnstileToken) params.set("turnstile", turnstileToken);
    setOAuthLoading("telegram");
    const response = await apiRequest<CustomerUser>(
      `/api/oauth/telegram/login?${params.toString()}`,
      { method: "GET" },
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
      setMessage({ type: "error", text: copy.codeRequired });
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
        <div
          className={`auth-overlay${isClosing ? " closing" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <button
            className="auth-overlay-backdrop"
            type="button"
            onClick={requestClose}
            aria-label={localizeKey(language, "Close")}
          />
          {content}
          {extra}
        </div>
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
              icon={KeyRound}
              label={copy.twoFaCode}
              placeholder={copy.twoFaPlaceholder}
              value={twoFaCode}
              onChange={setTwoFaCode}
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              label={copy.password}
              placeholder={copy.passwordPlaceholder}
              type={showPassword ? "text" : "password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
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
      <div className="auth-dialog">
        <div
          className="auth-dialog-backdrop"
          onClick={() => setWeChatOpen(false)}
        />
        <section className="auth-dialog-panel">
          <button
            className="auth-close"
            type="button"
            onClick={() => setWeChatOpen(false)}
            aria-label={localizeKey(language, "Close")}
          >
            <X size={22} />
          </button>
          <h2>{copy.wechatTitle}</h2>
          {wechatQrCode ? (
            <img className="wechat-qr" src={wechatQrCode} alt="WeChat QR" />
          ) : (
            <div className="wechat-empty">{copy.noWechatQr}</div>
          )}
          <p>{copy.wechatHelp}</p>
          <AuthInput
            autoComplete="one-time-code"
            label={copy.verificationCode}
            placeholder={copy.wechatPlaceholder}
            value={wechatCode}
            onChange={setWeChatCode}
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
        </section>
      </div>
    ) : null,
    true,
  );
}

function TelegramLoginWidget({
  botName,
  onAuth,
}: {
  botName: string;
  onAuth: (payload: TelegramAuthPayload) => void;
}) {
  const containerId = useMemo(
    () => `telegram-login-${Math.random().toString(36).slice(2)}`,
    [],
  );
  const callbackName = useMemo(
    () => `onTelegramAuth${Math.random().toString(36).slice(2)}`,
    [],
  );

  useEffect(() => {
    const windowRef = window as typeof window & {
      [key: string]: (payload: TelegramAuthPayload) => void;
    };
    windowRef[callbackName] = onAuth;
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", `${callbackName}(user)`);
    container.appendChild(script);
    return () => {
      delete windowRef[callbackName];
      container.innerHTML = "";
    };
  }, [botName, callbackName, containerId, onAuth]);

  return <div className="telegram-widget" id={containerId} />;
}
