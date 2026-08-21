import { localizeCopy, localizeKey } from "../i18n/localization";
import type { Language } from "../types";

export function getCodeSendLabel(language: Language, cooldown: number) {
  if (cooldown > 0) {
    return localizeKey(language, "{{seconds}}s", { seconds: cooldown });
  }
  return localizeKey(language, "Get code");
}

export function buildAuthCopy(
  language: Language,
  {
    isRegister,
    isEmailCodeLogin,
    emailVerificationRequired,
    cooldown,
    useBackupCode,
  }: {
    isRegister: boolean;
    isEmailCodeLogin: boolean;
    emailVerificationRequired: boolean;
    cooldown: number;
    useBackupCode: boolean;
  },
) {
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
    getCode: "Get code",
    submit: isRegister ? "Register" : "Sign in",
    codeLogin: "Sign in with email code",
    passwordLogin: "Sign in with password",
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

  return {
    ...copy,
    getCode: getCodeSendLabel(language, cooldown),
  };
}

export type AuthPageCopy = ReturnType<typeof buildAuthCopy>;
