import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { protectedPages } from "./constants/navigation";
import { AuthContext } from "./context/Auth";
import { ConfirmActionContext } from "./context/ConfirmAction";
import { LanguageContext } from "./context/Language";
import { ToastProvider } from "./context/Toast";
import { ConfirmActionDialog } from "./components/common/ConfirmActionDialog";
import { Seo } from "./components/common/Seo";
import { RouteFocus } from "./components/common/RouteFocus";
import { MarketingHeader } from "./components/layout/MarketingHeader";
import { TopupDialog } from "./components/topup/TopupDialog";
import { createHomePage } from "./pages/Home";
import {
  LazyApiKeysPage,
  LazyATFSwitchConnectPage,
  LazyAuthPage,
  LazyDashboardPage,
  LazyFathersDayPage,
  LazyInvitePage,
  LazyLegalPage,
  LazyNotFoundPage,
  LazyOAuthCallbackPage,
  LazyResetPasswordPage,
  LazySettingsPage,
  LazySetupPage,
  LazySubscribePage,
  LazyTopupPage,
  LazyUsagePage,
  RouteLoadingState,
} from "./pages/lazy-pages";
import { apiRequest, shouldClearStoredUser } from "./services/api";
import { fetchCustomerSelf } from "./services/customer-api";
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
  normalizeCustomerLanguage,
  selectCustomerLanguageForPath,
} from "./i18n/languages";
import { getPageKey, navigateTo } from "./helpers/navigation";
import { localizePublicHref, resolveSeoRoute } from "./seo/metadata";
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

function isSetupRoute(page: PageKey) {
  return page === "setup";
}

function isConnectRoute(page: PageKey) {
  return page === "atfSwitchConnect";
}

const HomePage = createHomePage({ MarketingHeader, TopupDialog });

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
    const initialPathname = window.location.pathname;
    const initialPage = getPageKey(initialPathname);
    if (isAuthRoute(initialPage)) return getAuthRedirectFromSearch() || "/";
    if (
      isSetupRoute(initialPage) &&
      resolveSeoRoute(initialPathname).redirectPath
    ) {
      return "/";
    }
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
      const nextSetupOverlay =
        isSetupRoute(nextPage) &&
        Boolean(resolveSeoRoute(nextPathname).redirectPath);
      setPathname(nextPathname);
      setPage(nextPage);
      const storedLanguage = normalizeCustomerLanguage(
        window.localStorage.getItem(CUSTOMER_LANGUAGE_STORAGE_KEY),
      );
      const isManualLanguage =
        window.localStorage.getItem(CUSTOMER_LANGUAGE_SOURCE_STORAGE_KEY) ===
        CUSTOMER_LANGUAGE_SOURCE_MANUAL;
      setLanguageState(
        selectCustomerLanguageForPath(
          nextPathname,
          isManualLanguage ? storedLanguage : language,
          isManualLanguage,
        ),
      );
      if (isAuthRoute(nextPage)) {
        const redirectTarget = getAuthRedirectFromSearch();
        if (redirectTarget) setAuthReturnPath(redirectTarget);
        return;
      }
      if (
        isConnectRoute(nextPage) ||
        (!isAuthRoute(nextPage) &&
          !nextSetupOverlay &&
          (!protectedPages.has(nextPage) || user?.id))
      ) {
        setAuthReturnPath(getCurrentPath());
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [language, user?.id]);

  useEffect(() => {
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
        return <LazyDashboardPage />;
      case "topup":
        return <LazyTopupPage />;
      case "usage":
        return <LazyUsagePage />;
      case "apikeys":
        return <LazyApiKeysPage />;
      case "invite":
        return <LazyInvitePage />;
      case "settings":
        return <LazySettingsPage />;
      case "atfSwitchConnect":
        return <LazyATFSwitchConnectPage />;
      case "subscribe":
        return <LazySubscribePage />;
      case "fathersDay":
        return <LazyFathersDayPage />;
      case "setup":
        return <LazySetupPage />;
      case "signin":
      case "signup":
        return <HomePage />;
      case "oauthCallback":
        return <LazyOAuthCallbackPage />;
      case "resetPassword":
        return <LazyResetPasswordPage />;
      case "userAgreement":
        return <LazyLegalPage type="userAgreement" />;
      case "privacyPolicy":
        return <LazyLegalPage type="privacyPolicy" />;
      case "notFound":
        return <LazyNotFoundPage />;
    }
  };

  const authOverlayOpen =
    isAuthRoute(page) || (!user && protectedPages.has(page));
  const setupOverlayOpen =
    isSetupRoute(page) && Boolean(resolveSeoRoute(pathname).redirectPath);
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
  const setupBackgroundPage = (() => {
    const targetPage = getPageKey(
      new URL(authReturnPath || "/", window.location.origin).pathname,
    );
    if (isAuthRoute(targetPage) || isSetupRoute(targetPage)) return "home";
    if (!user && protectedPages.has(targetPage)) return "home";
    if (targetPage === "oauthCallback") return "home";
    return targetPage;
  })();
  const content = renderPage(
    authOverlayOpen
      ? authBackgroundPage
      : setupOverlayOpen
        ? setupBackgroundPage
        : page,
  );

  return (
    <LanguageContext.Provider value={languageContextValue}>
      <Seo pathname={pathname} />
      <ToastProvider>
        <ConfirmActionContext.Provider value={confirmContextValue}>
          <AuthContext.Provider value={authContextValue}>
            <Suspense fallback={<RouteLoadingState />}>
              <RouteFocus
                focusRoute={!authOverlayOpen && !setupOverlayOpen}
                language={language}
                page={page}
              >
                {content}
              </RouteFocus>
            </Suspense>
            <Suspense fallback={null}>
              {authOverlayOpen ? (
                <LazyAuthPage
                  modal
                  onClose={() =>
                    navigateTo(getAuthReturnTarget(), { preserveScroll: true })
                  }
                  successPath={getAuthReturnTarget()}
                />
              ) : null}
              {setupOverlayOpen ? (
                <LazySetupPage
                  modal
                  onClose={() =>
                    navigateTo(getAuthReturnTarget(), { preserveScroll: true })
                  }
                />
              ) : null}
            </Suspense>
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
