import { customerRoutes } from "../constants/navigation";
import { resolveSeoRoute } from "../seo/metadata";
import { scrollToPosition } from "./motion";
import type { PageKey } from "../types";

const scrollPreservedPaths = new Set([
  "/sign-in",
  "/login",
  "/register",
  "/sign-up",
  "/setup",
  "/docs",
]);

function normalizePath(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

export function shouldPreserveScroll(pathname: string) {
  return scrollPreservedPaths.has(normalizePath(pathname));
}

export function navigateTo(
  path: string,
  options: { preserveScroll?: boolean } = {},
) {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  const url = new URL(path, window.location.origin);
  if (!options.preserveScroll && !shouldPreserveScroll(url.pathname)) {
    scrollToPosition(0);
  }
}

export function getPageKey(pathname: string): PageKey {
  const seoRoute = resolveSeoRoute(pathname);
  if (seoRoute.pageKey) return seoRoute.pageKey;

  let normalized = normalizePath(pathname);
  if (normalized.startsWith("/en/")) {
    normalized = normalizePath(normalized.slice(3));
  }
  if (normalized.startsWith("/oauth/")) return "oauthCallback";
  return customerRoutes[normalized] ?? "notFound";
}

export function getMarketingNavCurrent(
  pathname: string,
  hash = "",
): "features" | "pricing" | "docs" | null {
  const page = getPageKey(pathname);
  if (page === "subscribe") return "pricing";
  if (page === "setup") return "docs";
  if (page === "home" && hash === "#features") return "features";
  return null;
}

export function isInternalPath(href: string) {
  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}
