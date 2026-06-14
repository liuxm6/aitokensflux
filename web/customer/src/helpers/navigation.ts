import { customerRoutes } from "../constants/navigation";
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export function getPageKey(pathname: string): PageKey {
  const normalized = normalizePath(pathname);
  if (normalized.startsWith("/oauth/")) return "oauthCallback";
  return customerRoutes[normalized] ?? "notFound";
}

export function isInternalPath(href: string) {
  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}
