import {
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  MonitorCog,
} from "lucide-react";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppLink } from "../../components/common/AppLink";
import { MarketingHeader } from "../../components/layout/MarketingHeader";
import { AuthContext } from "../../context/Auth";
import { LanguageContext, T } from "../../context/Language";
import { useToastMessage } from "../../context/Toast";
import { buildSignInPathWithRedirect } from "../../helpers/auth-redirect";
import { navigateTo } from "../../helpers/navigation";
import { localizeKey } from "../../i18n/localization";
import { connectATFSwitch } from "../../services/customer-api";
import type { ATFSwitchConnectData, CustomerUser } from "../../types";

type ConnectMode = "import" | "login";

const LOCAL_CALLBACK_DEFAULT_PORT = 17654;
const LOCAL_CALLBACK_MIN_PORT = 17654;
const LOCAL_CALLBACK_MAX_PORT = 17658;

function getLocalCallbackPort() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("callback_port") || params.get("callbackPort");
  const port = Number(value);

  if (
    Number.isInteger(port) &&
    port >= LOCAL_CALLBACK_MIN_PORT &&
    port <= LOCAL_CALLBACK_MAX_PORT
  ) {
    return port;
  }

  return LOCAL_CALLBACK_DEFAULT_PORT;
}

const localCallbackUrls = (path: string) => {
  const hosts = ["127.0.0.1", "localhost"];
  const port = getLocalCallbackPort();
  return hosts.map((host) => `http://${host}:${port}${path}`);
};

const supportedApps: Record<string, { label: string; model: string }> = {
  claude: { label: "Claude Code", model: "claude-sonnet-4.6" },
  "claude-desktop": { label: "Claude Desktop", model: "claude-sonnet-4.6" },
  codex: { label: "Codex", model: "gpt-5.5" },
  gemini: { label: "Gemini CLI", model: "gemini-2.5-pro" },
  opencode: { label: "OpenCode", model: "claude-sonnet-4.6" },
  openclaw: { label: "OpenClaw", model: "claude-sonnet-4.6" },
  hermes: { label: "Hermes", model: "claude-sonnet-4.6" },
};

function normalizeApp(value: string | null) {
  const app = (value || "claude").trim().toLowerCase();
  if (app === "claude_desktop" || app === "claudedesktop") {
    return "claude-desktop";
  }
  return supportedApps[app] ? app : "claude";
}

function normalizeMode(value: string | null): ConnectMode {
  return value === "login" ? "login" : "import";
}

async function postToLocalCallback(url: string, payload: unknown) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) return false;

    const body = (await response.json().catch(() => null)) as {
      ok?: unknown;
    } | null;
    return body?.ok === true;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function openATFSwitch(deepLink: string) {
  for (const callbackUrl of localCallbackUrls("/v1/import")) {
    try {
      const opened = await postToLocalCallback(callbackUrl, { url: deepLink });
      if (opened) return true;
    } catch {
      // Try the next dev/prod callback port, then fall back to the OS protocol.
    }
  }

  window.location.assign(deepLink);
  return false;
}

async function notifyATFSwitchLogin(
  app: string,
  providerId: string,
  user: CustomerUser,
  auth: ATFSwitchConnectData,
  identity?: string,
) {
  const accountEmail =
    identity === "email"
      ? auth.accountEmail?.trim() ||
        auth.account_email?.trim() ||
        auth.userEmail?.trim() ||
        auth.user_email?.trim() ||
        auth.email?.trim() ||
        user.email?.trim() ||
        undefined
      : undefined;
  const accessToken = auth.accessToken || auth.access_token;
  const payload = {
    app,
    providerId,
    userId: auth.user_id || String(user.id),
    apiKey: auth.api_key,
    accessToken,
    access_token: accessToken,
    baseUrl: auth.endpoint,
    base_url: auth.endpoint,
    ...(accountEmail
      ? {
          email: accountEmail,
          accountEmail,
          account_email: accountEmail,
          userEmail: accountEmail,
          user_email: accountEmail,
          username: user.username,
          displayName: user.display_name,
          display_name: user.display_name,
          user: {
            email: accountEmail,
            username: user.username,
            name: user.display_name,
            displayName: user.display_name,
          },
        }
      : {}),
  };

  for (const callbackUrl of localCallbackUrls("/v1/auth-complete")) {
    try {
      const notified = await postToLocalCallback(callbackUrl, payload);
      if (notified) return true;
    } catch {
      // ATF Switch may not be running; browser login is still complete.
    }
  }

  return false;
}

export function ATFSwitchConnectPage() {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [deepLink, setDeepLink] = useState("");
  const loginNotifiedRef = useRef(false);
  useToastMessage(message);

  const app = useMemo(
    () => normalizeApp(new URLSearchParams(window.location.search).get("app")),
    [],
  );
  const mode = useMemo(
    () =>
      normalizeMode(new URLSearchParams(window.location.search).get("mode")),
    [],
  );
  const providerId = useMemo(
    () => new URLSearchParams(window.location.search).get("provider") || "",
    [],
  );
  const identity = useMemo(
    () => new URLSearchParams(window.location.search).get("identity") || "",
    [],
  );
  const isLoginOnly = mode === "login";
  const appInfo = supportedApps[app] ?? supportedApps.claude;

  const redirectToSignIn = useCallback(() => {
    navigateTo(buildSignInPathWithRedirect());
  }, []);

  const handleOpenDeepLink = async (value: string) => {
    setLoading(true);
    setMessage(localizeKey(language, "Opening ATF Switch..."));
    try {
      const openedLocally = await openATFSwitch(value);
      if (openedLocally) {
        setConnected(true);
        setMessage(
          localizeKey(
            language,
            "ATF Switch opened. Please confirm import in the desktop app.",
          ),
        );
      } else {
        setMessage(
          localizeKey(language, "Authorization ready. Opening ATF Switch..."),
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : localizeKey(language, "Failed to open ATF Switch"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOnly = useCallback(async () => {
    if (!user?.id) {
      redirectToSignIn();
      return;
    }

    setLoading(true);
    setMessage(localizeKey(language, "Confirming sign in..."));
    try {
      const response = await connectATFSwitch(app, "atf-switch", identity);
      if (
        !response.success ||
        !(response.data?.access_token || response.data?.accessToken)
      ) {
        setMessage(
          response.message ||
            localizeKey(language, "Failed to prepare authorization"),
        );
        return;
      }
      const notified = await notifyATFSwitchLogin(
        app,
        providerId,
        user,
        response.data,
        identity,
      );
      setConnected(notified);
      setMessage(
        localizeKey(
          language,
          notified
            ? "ATF Switch authorization synced. You can return to the desktop app."
            : "Could not reach ATF Switch. Keep the desktop app open and click Sync to ATF Switch again.",
        ),
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : localizeKey(language, "Failed to open ATF Switch"),
      );
    } finally {
      setLoading(false);
    }
  }, [app, identity, language, providerId, redirectToSignIn, user]);

  useEffect(() => {
    if (!isLoginOnly || !user?.id || loginNotifiedRef.current) {
      return;
    }

    loginNotifiedRef.current = true;
    void handleLoginOnly();
  }, [handleLoginOnly, isLoginOnly, user?.id]);

  const handleConnect = async () => {
    if (isLoginOnly) {
      await handleLoginOnly();
      return;
    }

    if (connected && deepLink) {
      await handleOpenDeepLink(deepLink);
      return;
    }

    if (!user?.id) {
      redirectToSignIn();
      return;
    }
    setLoading(true);
    setMessage(localizeKey(language, "Preparing authorization..."));
    try {
      const response = await connectATFSwitch(app, "atf-switch", identity);
      if (!response.success || !response.data?.deep_link) {
        setMessage(
          response.message ||
            localizeKey(language, "Failed to prepare authorization"),
        );
        return;
      }
      setConnected(true);
      setDeepLink(response.data.deep_link);
      setMessage(
        localizeKey(language, "Authorization ready. Opening ATF Switch..."),
      );
      await handleOpenDeepLink(response.data.deep_link);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : localizeKey(language, "Failed to prepare authorization"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="connect-page">
      <MarketingHeader minimal />
      <main className="connect-main">
        <section className="connect-panel">
          <div className="connect-mark">
            <MonitorCog size={28} />
          </div>
          <p className="connect-eyebrow">ATF Switch</p>
          <h1>
            <T id="Authorize Ai Tokens Flux" />
          </h1>
          <p className="connect-copy">
            <T
              id={
                isLoginOnly
                  ? "Sign in to Ai Tokens Flux. Existing ATF Switch provider settings will not be changed."
                  : "Connect your browser account to the desktop app without copying an API key."
              }
            />
          </p>

          <div className="connect-summary">
            <span>
              <T id="Target app" />
            </span>
            <strong>{appInfo.label}</strong>
            <span>
              <T id="Default model" />
            </span>
            <strong>{appInfo.model}</strong>
          </div>

          <button
            className="btn btn-flux connect-action"
            type="button"
            disabled={loading}
            onClick={() => void handleConnect()}
          >
            {loading ? <LoaderCircle size={18} className="spin" /> : null}
            {connected ? <CheckCircle2 size={18} /> : null}
            <T
              id={
                isLoginOnly
                  ? connected
                    ? "Synced to ATF Switch"
                    : "Sync to ATF Switch"
                  : connected
                    ? "Open ATF Switch again"
                    : "Authorize and open ATF Switch"
              }
            />
          </button>

          {message ? <p className="connect-status">{message}</p> : null}

          <AppLink className="connect-secondary" href="/dashboard/api-key">
            <ExternalLink size={15} />
            <T id="Manage API keys" />
          </AppLink>
        </section>
      </main>
    </div>
  );
}
