import type { CustomerUser } from "../types";

const USER_STORAGE_KEY = "customer-user";
export const SUPPORT_EMAIL = "mr.liuxm6@gmail.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function buildSupportMailto(subject?: string, body?: string) {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString();
  return `mailto:${SUPPORT_EMAIL}${query ? `?${query}` : ""}`;
}

export function readStoredUser(): CustomerUser | null {
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as CustomerUser;
    if (user?.id) window.localStorage.setItem("uid", String(user.id));
    return user;
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem("uid");
    return null;
  }
}

export function persistUser(user: CustomerUser | null) {
  if (user) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    window.localStorage.setItem("uid", String(user.id));
  } else {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem("uid");
  }
}

export function isEmailAddress(value?: string | null) {
  const email = value?.trim() ?? "";
  return email.length > 0 && email.length <= 50 && EMAIL_PATTERN.test(email);
}

export function getBoundEmail(user: CustomerUser | null) {
  const email = user?.email?.trim() ?? "";
  return isEmailAddress(email) ? email : "";
}

export function getUserLabel(user: CustomerUser | null) {
  return (
    getBoundEmail(user) || user?.display_name || user?.username || "Account"
  );
}

export function getAccountIdentifier(user: CustomerUser | null) {
  return getBoundEmail(user) || getUserLabel(user);
}
