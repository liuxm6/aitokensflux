import { Fingerprint, Globe2, LoaderCircle, Send } from "lucide-react";
import type { AuthPageCopy } from "../../helpers/auth-copy";
import {
  buildCustomOAuthUrl,
  buildDiscordOAuthUrl,
  buildGitHubOAuthUrl,
  buildLinuxDOOAuthUrl,
  buildOIDCOAuthUrl,
} from "../../helpers/oauth";
import type {
  CustomOAuthProvider,
  CustomerStatus,
  TelegramAuthPayload,
} from "../../types";
import { GitHubMark, LinuxDOMark } from "./AuthProviderMarks";
import { TelegramLoginWidget } from "./TelegramLoginWidget";

export function AuthOAuthOptions({
  status,
  copy,
  oauthLoading,
  customOAuthProviders,
  passkeySupported,
  isRegister,
  onWeChat,
  onBeginOAuth,
  onTelegramAuth,
  onUnsupported,
  onPasskeyLogin,
}: {
  status: CustomerStatus | null;
  copy: AuthPageCopy;
  oauthLoading: string;
  customOAuthProviders: CustomOAuthProvider[];
  passkeySupported: boolean;
  isRegister: boolean;
  onWeChat: () => void;
  onBeginOAuth: (key: string, buildUrl: (state: string) => string) => void;
  onTelegramAuth: (payload: TelegramAuthPayload) => void;
  onUnsupported: () => void;
  onPasskeyLogin: () => void;
}) {
  return (
    <>
      <div className="auth-divider">
        <span>{copy.otherOptions}</span>
      </div>
      <div className="auth-oauth">
        {status?.wechat_login ? (
          <button
            aria-busy={oauthLoading === "wechat" || undefined}
            className="auth-secondary"
            disabled={oauthLoading === "wechat"}
            type="button"
            onClick={onWeChat}
          >
            <span className="provider-dot wechat">WX</span>
            {copy.wechatLogin}
          </button>
        ) : null}
        {status?.github_oauth && status.github_client_id ? (
          <button
            aria-busy={oauthLoading === "github" || undefined}
            className="auth-secondary"
            disabled={!!oauthLoading}
            type="button"
            onClick={() =>
              onBeginOAuth("github", (state) =>
                buildGitHubOAuthUrl(status.github_client_id!, state),
              )
            }
          >
            {oauthLoading === "github" ? (
              <LoaderCircle aria-hidden="true" className="spin" size={16} />
            ) : (
              <GitHubMark />
            )}
            {copy.githubLogin}
          </button>
        ) : null}
        {status?.discord_oauth && status.discord_client_id ? (
          <button
            aria-busy={oauthLoading === "discord" || undefined}
            className="auth-secondary"
            disabled={!!oauthLoading}
            type="button"
            onClick={() =>
              onBeginOAuth("discord", (state) =>
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
            aria-busy={oauthLoading === "oidc" || undefined}
            className="auth-secondary"
            disabled={!!oauthLoading}
            type="button"
            onClick={() =>
              onBeginOAuth("oidc", (state) =>
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
            aria-busy={oauthLoading === "linuxdo" || undefined}
            className="auth-secondary"
            disabled={!!oauthLoading}
            type="button"
            onClick={() =>
              onBeginOAuth("linuxdo", (state) =>
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
            aria-busy={oauthLoading === `custom-${provider.slug}` || undefined}
            className="auth-secondary"
            disabled={!!oauthLoading}
            key={provider.slug}
            type="button"
            onClick={() =>
              onBeginOAuth(`custom-${provider.slug}`, (state) =>
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
              onAuth={onTelegramAuth}
            />
          </div>
        ) : status?.telegram_oauth ? (
          <button
            className="auth-secondary"
            type="button"
            onClick={onUnsupported}
          >
            <Send size={17} />
            {copy.telegramLogin}
          </button>
        ) : null}
        {!isRegister && status?.passkey_login ? (
          <button
            aria-busy={oauthLoading === "passkey" || undefined}
            className="auth-secondary"
            disabled={!!oauthLoading || !passkeySupported}
            type="button"
            onClick={onPasskeyLogin}
          >
            {oauthLoading === "passkey" ? (
              <LoaderCircle aria-hidden="true" className="spin" size={16} />
            ) : (
              <Fingerprint size={17} />
            )}
            {copy.passkeyLogin}
          </button>
        ) : null}
      </div>
    </>
  );
}
