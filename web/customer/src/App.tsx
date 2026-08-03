import { useCallback, useEffect, useMemo, useState } from "react";
import { protectedPages } from "./constants/navigation";
import { AuthContext } from "./context/Auth";
import { ConfirmActionContext } from "./context/ConfirmAction";
import { LanguageContext, T } from "./context/Language";
import { ToastProvider } from "./context/Toast";
import { AccountActionDialog } from "./components/account/AccountActionDialog";
import { AppLink } from "./components/common/AppLink";
import { CodeBlock } from "./components/common/CodeBlock";
import { ConfirmActionDialog } from "./components/common/ConfirmActionDialog";
import { Pill } from "./components/common/Pill";
import { Seo } from "./components/common/Seo";
import { MarketingHeader } from "./components/layout/MarketingHeader";
import { TopupDialog } from "./components/topup/TopupDialog";
import { createHomePage } from "./pages/Home";
import { AuthPage } from "./pages/Auth";
import { createDashboardPage } from "./pages/Dashboard";
import { createFathersDayPage } from "./pages/FathersDay";
import { InvitePage } from "./pages/Invite";
import { UsagePage } from "./pages/Log";
import { createNotFoundPage } from "./pages/NotFound";
import { OAuthCallbackPage } from "./pages/OAuth";
import { ResetPasswordPage } from "./pages/ResetPassword";
import { ATFSwitchConnectPage } from "./pages/ATFSwitchConnect";
import { createSettingsPage } from "./pages/Setting";
import { createSetupPage } from "./pages/Setup";
import { createSubscribePage } from "./pages/Subscription";
import { ApiKeysPage } from "./pages/Token";
import { TopupPage } from "./pages/TopUp";
import { createLegalPage } from "./pages/UserAgreement";
import { apiRequest, shouldClearStoredUser } from "./services/api";
import {
  fetchCustomerSelf,
  fetchCustomerStatus,
} from "./services/customer-api";
import { persistUser, readStoredUser } from "./helpers/account";
import { getAuthRedirectFromSearch } from "./helpers/auth-redirect";
import {
  ensureTraditionalConverter,
  isTraditionalChinese,
} from "./i18n/localization";
import {
  CUSTOMER_LANGUAGE_SOURCE_MANUAL,
  CUSTOMER_LANGUAGE_SOURCE_STORAGE_KEY,
  CUSTOMER_LANGUAGE_STORAGE_KEY,
  detectCustomerLanguage,
} from "./i18n/languages";
import { getPageKey, navigateTo } from "./helpers/navigation";
import { getConfiguredServerAddress } from "./helpers/server-address";
import { getRouteLanguage, localizePublicHref } from "./seo/metadata";
import type {
  Language,
  PageKey,
  CustomerUser,
  ConfirmActionConfig,
} from "./types";

function getCurrentPath() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function isAuthRoute(page: PageKey) {
  return page === "signin" || page === "signup";
}

function isConnectRoute(page: PageKey) {
  return page === "atfSwitchConnect";
}

const SubscribePage = createSubscribePage({ MarketingHeader, TopupDialog });
const FathersDayPage = createFathersDayPage({ MarketingHeader, TopupDialog });
const DashboardPage = createDashboardPage({ TopupDialog });
const SetupPage = createSetupPage({
  MarketingHeader,
  Pill,
  T,
  AppLink,
  CodeBlock,
  fetchCustomerStatus,
  getConfiguredServerAddress,
  navigateTo,
});
const HomePage = createHomePage({ MarketingHeader, TopupDialog });
const LegalPage = createLegalPage({ MarketingHeader });
const NotFoundPage = createNotFoundPage({ MarketingHeader });
const SettingsPage = createSettingsPage({ AccountActionDialog });

function App() {
  const [language, setLanguageState] = useState<Language>(() =>
    detectCustomerLanguage(window.location.pathname),
  );
  const setLanguage = useCallback((nextLanguage: Language) => {
    window.localStorage.setItem(
      CUSTOMER_LANGUAGE_SOURCE_STORAGE_KEY,
      CUSTOMER_LANGUAGE_SOURCE_MANUAL,
    );
    window.localStorage.setItem(CUSTOMER_LANGUAGE_STORAGE_KEY, nextLanguage);
    setLanguageState(nextLanguage);
  }, []);
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [translationVersion, setTranslationVersion] = useState(0);
  const [user, setCurrentUser] = useState<CustomerUser | null>(() =>
    readStoredUser(),
  );
  const [page, setPage] = useState<PageKey>(() =>
    getPageKey(window.location.pathname),
  );
  const [authReturnPath, setAuthReturnPath] = useState(() => {
    const initialPage = getPageKey(window.location.pathname);
    if (isAuthRoute(initialPage)) return getAuthRedirectFromSearch() || "/";
    if (isConnectRoute(initialPage)) return getCurrentPath();
    if (protectedPages.has(initialPage) && !user?.id) return "/";
    return getCurrentPath();
  });
  const [authChecking, setAuthChecking] = useState(() => Boolean(user?.id));
  const [confirmAction, setConfirmAction] =
    useState<ConfirmActionConfig | null>(null);

  useEffect(() => {
    const onPopState = () => {
      const nextPathname = window.location.pathname;
      const nextPage = getPageKey(nextPathname);
      const routeLanguage = getRouteLanguage(nextPathname);
      setPathname(nextPathname);
      setPage(nextPage);
      if (routeLanguage) {
        const storedLanguage = window.localStorage.getItem(
          CUSTOMER_LANGUAGE_STORAGE_KEY,
        );
        const preserveLocalLanguage =
          window.localStorage.getItem(CUSTOMER_LANGUAGE_SOURCE_STORAGE_KEY) ===
            CUSTOMER_LANGUAGE_SOURCE_MANUAL &&
          routeLanguage === "zh" &&
          (storedLanguage === "zh-TW" || storedLanguage === "ru");
        setLanguageState(
          preserveLocalLanguage ? storedLanguage : routeLanguage,
        );
      }
      if (isAuthRoute(nextPage)) {
        const redirectTarget = getAuthRedirectFromSearch();
        if (redirectTarget) setAuthReturnPath(redirectTarget);
        return;
      }
      if (
        isConnectRoute(nextPage) ||
        (!isAuthRoute(nextPage) && (!protectedPages.has(nextPage) || user?.id))
      ) {
        setAuthReturnPath(getCurrentPath());
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [user?.id]);

  useEffect(() => {
    window.localStorage.setItem(CUSTOMER_LANGUAGE_STORAGE_KEY, language);
    if (isTraditionalChinese(language)) {
      void ensureTraditionalConverter().then(() => {
        setTranslationVersion((version) => version + 1);
      });
    }
  }, [language]);

  useEffect(() => {
    if (!user?.id) {
      setAuthChecking(false);
      return;
    }
    let mounted = true;
    setAuthChecking(true);
    void fetchCustomerSelf()
      .then((response) => {
        if (!mounted) return;
        if (response.success && response.data) {
          persistUser(response.data);
          setCurrentUser(response.data);
          return;
        }
        if (shouldClearStoredUser(response)) {
          persistUser(null);
          setCurrentUser(null);
        }
      })
      .finally(() => {
        if (mounted) setAuthChecking(false);
      });
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const languageContextValue = useMemo(
    () => ({ language, setLanguage, translationVersion }),
    [language, translationVersion],
  );

  const confirmContextValue = useMemo(
    () => ({
      requestConfirm: (config: ConfirmActionConfig) => setConfirmAction(config),
    }),
    [],
  );

  const performSignOut = async () => {
    await apiRequest("/api/user/logout", { method: "GET" }).catch(() => null);
    persistUser(null);
    setCurrentUser(null);
    setAuthChecking(false);
    navigateTo(localizePublicHref("/", language));
  };

  const authContextValue = useMemo(
    () => ({
      user,
      authChecking,
      setUser: (nextUser: CustomerUser | null) => {
        persistUser(nextUser);
        setCurrentUser(nextUser);
        setAuthChecking(false);
      },
      signOut: async () => {
        setConfirmAction({
          title: { id: "Notice" },
          message: { id: "Sign out of the current account?" },
          onConfirm: performSignOut,
        });
      },
    }),
    [authChecking, language, user],
  );

  const getAuthReturnTarget = () => {
    const target = authReturnPath || "/";
    const targetPage = getPageKey(
      new URL(target, window.location.origin).pathname,
    );
    if (isAuthRoute(targetPage)) return "/";
    if (
      !user &&
      protectedPages.has(targetPage) &&
      !isConnectRoute(targetPage)
    ) {
      return "/";
    }
    return target;
  };

  const renderPage = (currentPage: PageKey) => {
    if (!user && protectedPages.has(currentPage)) {
      return <HomePage />;
    }

    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "dashboard":
        return <DashboardPage />;
      case "topup":
        return <TopupPage />;
      case "usage":
        return <UsagePage />;
      case "apikeys":
        return <ApiKeysPage />;
      case "invite":
        return <InvitePage />;
      case "settings":
        return <SettingsPage />;
      case "atfSwitchConnect":
        return <ATFSwitchConnectPage />;
      case "subscribe":
        return <SubscribePage />;
      case "fathersDay":
        return <FathersDayPage />;
      case "setup":
        return <SetupPage />;
      case "signin":
      case "signup":
        return <HomePage />;
      case "oauthCallback":
        return <OAuthCallbackPage />;
      case "resetPassword":
        return <ResetPasswordPage />;
      case "userAgreement":
        return <LegalPage type="userAgreement" />;
      case "privacyPolicy":
        return <LegalPage type="privacyPolicy" />;
      case "notFound":
        return <NotFoundPage />;
    }
  };

  const authOverlayOpen =
    isAuthRoute(page) || (!user && protectedPages.has(page));
  const authBackgroundPage = (() => {
    if (!isAuthRoute(page)) return "home";
    const targetPage = getPageKey(
      new URL(authReturnPath || "/", window.location.origin).pathname,
    );
    if (isAuthRoute(targetPage)) return "home";
    if (isConnectRoute(targetPage)) return "home";
    if (!user && protectedPages.has(targetPage)) return "home";
    if (targetPage === "oauthCallback") return "home";
    return targetPage;
  })();
  const content = renderPage(authOverlayOpen ? authBackgroundPage : page);
  const overlayScrollLocked = authOverlayOpen;

  useEffect(() => {
    if (!overlayScrollLocked) return;

    const body = document.body;
    const root = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousRootOverscroll = root.style.overscrollBehavior;

    body.style.overflow = "hidden";
    root.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    root.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = previousBodyOverflow;
      root.style.overflow = previousRootOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
      root.style.overscrollBehavior = previousRootOverscroll;
    };
  }, [overlayScrollLocked]);

  return (
    <LanguageContext.Provider value={languageContextValue}>
      <Seo pathname={pathname} />
      <ToastProvider>
        <ConfirmActionContext.Provider value={confirmContextValue}>
          <AuthContext.Provider value={authContextValue}>
            {content}
            {authOverlayOpen ? (
              <AuthPage
                modal
                onClose={() =>
                  navigateTo(getAuthReturnTarget(), { preserveScroll: true })
                }
                successPath={getAuthReturnTarget()}
              />
            ) : null}
            {confirmAction ? (
              <ConfirmActionDialog
                config={confirmAction}
                onClose={() => setConfirmAction(null)}
              />
            ) : null}
          </AuthContext.Provider>
        </ConfirmActionContext.Provider>
      </ToastProvider>
    </LanguageContext.Provider>
  );
}

export { App };
