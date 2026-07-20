import { lazy, type ComponentType } from "react";
import { AccountActionDialog } from "../components/account/AccountActionDialog";
import { AppLink } from "../components/common/AppLink";
import { CodeBlock } from "../components/common/CodeBlock";
import { Pill } from "../components/common/Pill";
import { LoadingState } from "../components/common/ui/AsyncState";
import { MarketingHeader } from "../components/layout/MarketingHeader";
import { TopupDialog } from "../components/topup/TopupDialog";
import { T } from "../context/Language";
import { navigateTo } from "../helpers/navigation";
import { getConfiguredServerAddress } from "../helpers/server-address";
import { fetchCustomerStatus } from "../services/customer-api";
import type { PageKey } from "../types";

export function createLazyPage<PageComponent extends ComponentType<any>>(
  loader: () => Promise<{ default: PageComponent }>,
) {
  return lazy(loader);
}

export function isLazyPageKey(page: PageKey) {
  return page !== "home";
}

export function RouteLoadingState() {
  return <LoadingState id="Loading page" lines={2} />;
}

export const LazyAuthPage = createLazyPage(() =>
  import("./Auth").then((module) => ({ default: module.AuthPage })),
);

export const LazyDashboardPage = createLazyPage(() =>
  import("./Dashboard").then((module) => ({
    default: module.createDashboardPage({ TopupDialog }),
  })),
);

export const LazyFathersDayPage = createLazyPage(() =>
  import("./FathersDay").then((module) => ({
    default: module.createFathersDayPage({ MarketingHeader, TopupDialog }),
  })),
);

export const LazyInvitePage = createLazyPage(() =>
  import("./Invite").then((module) => ({ default: module.InvitePage })),
);

export const LazyUsagePage = createLazyPage(() =>
  import("./Log").then((module) => ({ default: module.UsagePage })),
);

export const LazyNotFoundPage = createLazyPage(() =>
  import("./NotFound").then((module) => ({
    default: module.createNotFoundPage({ MarketingHeader }),
  })),
);

export const LazyOAuthCallbackPage = createLazyPage(() =>
  import("./OAuth").then((module) => ({
    default: module.OAuthCallbackPage,
  })),
);

export const LazyResetPasswordPage = createLazyPage(() =>
  import("./ResetPassword").then((module) => ({
    default: module.ResetPasswordPage,
  })),
);

export const LazyATFSwitchConnectPage = createLazyPage(() =>
  import("./ATFSwitchConnect").then((module) => ({
    default: module.ATFSwitchConnectPage,
  })),
);

export const LazySettingsPage = createLazyPage(() =>
  import("./Setting").then((module) => ({
    default: module.createSettingsPage({ AccountActionDialog }),
  })),
);

export const LazySetupPage = createLazyPage(() =>
  import("./Setup").then((module) => ({
    default: module.createSetupPage({
      MarketingHeader,
      Pill,
      T,
      AppLink,
      CodeBlock,
      fetchCustomerStatus,
      getConfiguredServerAddress,
      navigateTo,
    }),
  })),
);

export const LazySubscribePage = createLazyPage(() =>
  import("./Subscription").then((module) => ({
    default: module.createSubscribePage({ MarketingHeader, TopupDialog }),
  })),
);

export const LazyApiKeysPage = createLazyPage(() =>
  import("./Token").then((module) => ({ default: module.ApiKeysPage })),
);

export const LazyTopupPage = createLazyPage(() =>
  import("./TopUp").then((module) => ({ default: module.TopupPage })),
);

export const LazyLegalPage = createLazyPage(() =>
  import("./UserAgreement").then((module) => ({
    default: module.createLegalPage({ MarketingHeader }),
  })),
);
