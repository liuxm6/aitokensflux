import { LoaderCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { AppLink } from "../../components/common/AppLink";
import { Brand } from "../../components/common/Brand";
import { LanguageButton } from "../../components/layout/LanguageButton";
import { AuthContext } from "../../context/Auth";
import { LanguageContext } from "../../context/Language";
import { useToastMessage } from "../../context/Toast";
import { localizeKey } from "../../i18n/localization";
import { consumeStoredAuthRedirect } from "../../helpers/auth-redirect";
import { navigateTo } from "../../helpers/navigation";
import { apiRequest, buildQuery } from "../../services/api";
import type { CustomerUser } from "../../types";

function getSearchParam(name: string) {
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

export function OAuthCallbackPage() {
  const { language } = useContext(LanguageContext);
  const { setUser } = useContext(AuthContext);
  const [message, setMessage] = useState(
    localizeKey(language, "Completing sign in..."),
  );
  const [failed, setFailed] = useState(false);
  useToastMessage(failed ? { type: "error", text: message } : null);

  useEffect(() => {
    let mounted = true;
    const provider =
      window.location.pathname.split("/").filter(Boolean)[1] ?? "";
    const code = getSearchParam("code");
    const state = getSearchParam("state");
    const error =
      getSearchParam("error_description") || getSearchParam("error");

    const finish = async () => {
      if (error) {
        if (!mounted) return;
        setFailed(true);
        setMessage(error);
        return;
      }
      if (!provider || !code) {
        if (!mounted) return;
        setFailed(true);
        setMessage(localizeKey(language, "Missing OAuth callback parameters"));
        return;
      }
      const response = await apiRequest<CustomerUser>(
        `/api/oauth/${provider}${buildQuery({ code, state })}`,
        { method: "GET" },
      );
      if (!mounted) return;
      if (response.success && response.data) {
        setUser(response.data);
        navigateTo(consumeStoredAuthRedirect() || "/dashboard");
        return;
      }
      const self = await apiRequest<CustomerUser>("/api/user/self", {
        method: "GET",
      });
      if (!mounted) return;
      if (self.success && self.data) {
        setUser(self.data);
        navigateTo(consumeStoredAuthRedirect() || "/dashboard");
        return;
      }
      setFailed(true);
      setMessage(
        response.message || localizeKey(language, "OAuth sign in failed"),
      );
    };

    void finish();
    return () => {
      mounted = false;
    };
  }, [language, setUser]);

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
      <section className="auth-modal">
        <div className="auth-form">
          <h1>{localizeKey(language, "Sign-in callback")}</h1>
          <div className={`auth-message ${failed ? "error" : "info"}`}>
            {failed ? null : <LoaderCircle className="spin" size={16} />}
            {message}
          </div>
          {failed ? (
            <AppLink className="auth-secondary" href="/sign-in">
              {localizeKey(language, "Back to sign in")}
            </AppLink>
          ) : null}
        </div>
      </section>
    </main>
  );
}
