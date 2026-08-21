import type { PageKey } from "../types";
import { getPageKey } from "./navigation";

const PREFETCH_LOADERS: Partial<Record<PageKey, () => Promise<unknown>>> = {
  signin: () => import("../pages/Auth"),
  signup: () => import("../pages/Auth"),
  setup: () => import("../pages/Setup"),
  dashboard: () => import("../pages/Dashboard"),
  topup: () => import("../pages/TopUp"),
  usage: () => import("../pages/Log"),
  apikeys: () => import("../pages/Token"),
  invite: () => import("../pages/Invite"),
  settings: () => import("../pages/Setting"),
  subscribe: () => import("../pages/Subscription"),
  resetPassword: () => import("../pages/ResetPassword"),
  userAgreement: () => import("../pages/UserAgreement"),
  privacyPolicy: () => import("../pages/UserAgreement"),
  atfSwitchConnect: () => import("../pages/ATFSwitchConnect"),
};

const warmed = new Set<PageKey>();

export function getPrefetchPageKey(href: string): PageKey | null {
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    const page = getPageKey(url.pathname);
    return PREFETCH_LOADERS[page] ? page : null;
  } catch {
    return null;
  }
}

export function prefetchPageKey(page: PageKey) {
  if (warmed.has(page)) return;
  const load = PREFETCH_LOADERS[page];
  if (!load) return;
  warmed.add(page);
  void load();
}

export function prefetchHref(href: string) {
  const page = getPrefetchPageKey(href);
  if (page) prefetchPageKey(page);
}

export function prefetchLikelyNextPages() {
  prefetchPageKey("signin");
  prefetchPageKey("setup");
  prefetchPageKey("subscribe");
}
