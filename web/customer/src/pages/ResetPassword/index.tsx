import { Check, Copy, KeyRound } from "lucide-react";
import { useContext, useState } from "react";
import { AuthSubmitButton } from "../../components/auth/AuthSubmitButton";
import { AppLink } from "../../components/common/AppLink";
import { Brand } from "../../components/common/Brand";
import { FormField } from "../../components/common/ui/FormField";
import { LanguageButton } from "../../components/layout/LanguageButton";
import { LanguageContext } from "../../context/Language";
import { useToast } from "../../context/Toast";
import { useCopyFeedback } from "../../hooks/useCopyFeedback";
import { localizeCopy } from "../../i18n/localization";
import { apiRequest } from "../../services/api";

type ResetPasswordResponse = string;

function getSearchParam(name: string) {
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

export function ResetPasswordPage() {
  const { language } = useContext(LanguageContext);
  const notify = useToast();
  const [loading, setLoading] = useState(false);
  const [copied, markCopied] = useCopyFeedback(false, 2000);
  const [newPassword, setNewPassword] = useState("");

  const email = getSearchParam("email");
  const token = getSearchParam("token");
  const isValidResetLink = Boolean(email && token);

  const copy = localizeCopy(language, {
    title: "Reset password",
    description:
      "Confirm this password reset request to generate a new password for your account.",
    invalidLink:
      "Invalid reset link. Please request a new password reset email.",
    email: "Email",
    emailPlaceholder: "Waiting for reset link...",
    confirm: "Confirm reset",
    resetting: "Resetting password...",
    newPassword: "New password",
    success:
      "Password reset successfully. Save the new password below before signing in.",
    passwordCopied: "Password copied",
    copy: "Copy",
    backToSignIn: "Back to sign in",
    requestNew: "Request a new reset email",
  });

  const handleCopy = async () => {
    if (!newPassword) return;
    await navigator.clipboard?.writeText(newPassword);
    markCopied(true);
    notify({ type: "success", message: copy.passwordCopied });
  };

  const handleSubmit = async () => {
    if (!isValidResetLink) {
      notify({ type: "error", message: copy.invalidLink });
      return;
    }

    setLoading(true);
    const response = await apiRequest<ResetPasswordResponse>(
      "/api/user/reset",
      {
        method: "POST",
        body: JSON.stringify({ email, token }),
      },
    );
    setLoading(false);

    if (!response.success || !response.data) {
      notify({
        type: "error",
        message: response.message || copy.invalidLink,
      });
      return;
    }

    setNewPassword(response.data);
    await navigator.clipboard?.writeText(response.data);
    markCopied(true);
    notify({ type: "success", message: copy.success });
  };

  return (
    <main className="auth-page">
      <div className="auth-top">
        <Brand />
        <div className="auth-actions">
          <LanguageButton />
        </div>
      </div>
      <div className="auth-bg" aria-hidden="true">
        <h1>Claude Code / OpenAI Codex</h1>
      </div>
      <div className="auth-scrim" />
      <section className="auth-modal" aria-label={copy.title}>
        <div className="auth-form">
          <div className="auth-form-head">
            <h1>{copy.title}</h1>
            <p className="auth-note">
              {newPassword ? copy.success : copy.description}
            </p>
          </div>

          <FormField
            className="auth-field"
            controlClassName="auth-input"
            error={!isValidResetLink ? copy.invalidLink : undefined}
            label={copy.email}
            prefix={<KeyRound size={18} />}
          >
            <input
              readOnly
              placeholder={copy.emailPlaceholder}
              type="email"
              value={email}
            />
          </FormField>

          {newPassword ? (
            <FormField
              action={
                <button
                  aria-label={copy.copy}
                  type="button"
                  onClick={() => void handleCopy()}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              }
              className="auth-field"
              controlClassName="auth-input with-action"
              label={copy.newPassword}
            >
              <input readOnly className="mono" value={newPassword} />
            </FormField>
          ) : (
            <AuthSubmitButton
              disabled={loading || !isValidResetLink}
              label={copy.confirm}
              loading={loading}
              loadingLabel={copy.resetting}
              type="button"
              onClick={() => void handleSubmit()}
            />
          )}

          <AppLink className="auth-secondary" href="/sign-in">
            {newPassword ? copy.backToSignIn : copy.requestNew}
          </AppLink>
        </div>
      </section>
    </main>
  );
}
