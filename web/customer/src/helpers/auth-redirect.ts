import { getPageKey } from "./navigation";

const authRedirectStorageKey = "customer-auth-redirect";

function currentPath() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function normalizeAuthRedirect(value?: string | null) {
  if (!value) return "";

  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return "";

    const page = getPageKey(url.pathname);
    if (page === "signin" || page === "signup" || page === "oauthCallback") {
      return "";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "";
  }
}

export function getAuthRedirectFromSearch(search = window.location.search) {
  return normalizeAuthRedirect(new URLSearchParams(search).get("redirect"));
}

export function storeAuthRedirect(value?: string | null) {
  const target = normalizeAuthRedirect(value);
  if (!target) return "";

  try {
    window.sessionStorage.setItem(authRedirectStorageKey, target);
  } catch {
    // Browser storage can be disabled; keep the in-page redirect flow working.
  }
  return target;
}

export function consumeStoredAuthRedirect() {
  let value: string | null = "";
  try {
    value = window.sessionStorage.getItem(authRedirectStorageKey);
    window.sessionStorage.removeItem(authRedirectStorageKey);
  } catch {
    value = "";
  }
  const target = normalizeAuthRedirect(value);
  return target;
}

export function buildSignInPathWithRedirect(value = currentPath()) {
  const target = storeAuthRedirect(value);
  if (!target) return "/sign-in";

  return `/sign-in?redirect=${encodeURIComponent(target)}`;
}
