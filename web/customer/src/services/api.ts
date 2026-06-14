import { translateLocale } from "../i18n/locales";
import type { ApiResponse } from "../types";
import type { Language } from "../types";

const API_REQUEST_TIMEOUT_MS = 8000;

function getCurrentLanguage(): Language {
  const language =
    window.localStorage.getItem("customer-lang") || navigator.language;
  if (language === "zh-TW" || language.toLowerCase().startsWith("zh-tw")) {
    return "zh-TW";
  }
  const normalizedLanguage = language.toLowerCase();
  if (normalizedLanguage.startsWith("zh")) return "zh";
  if (normalizedLanguage.startsWith("ru")) return "ru";
  return "en";
}

function getNetworkErrorMessage(error: unknown) {
  const language = getCurrentLanguage();
  if (error instanceof DOMException && error.name === "AbortError") {
    return translateLocale(language, "Request timed out. Please try again.");
  }
  return translateLocale(
    language,
    "Network request failed. Please check the backend service.",
  );
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    API_REQUEST_TIMEOUT_MS,
  );
  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(window.localStorage.getItem("uid")
          ? { "New-API-User": window.localStorage.getItem("uid") ?? "" }
          : {}),
        ...(options.headers ?? {}),
      },
      ...options,
      signal: controller.signal,
    });
    const data = (await response.json().catch(() => ({}))) as ApiResponse<T>;
    if (!response.ok) {
      return {
        success: false,
        message:
          data.message ||
          response.statusText ||
          translateLocale(getCurrentLanguage(), "Request failed"),
        status: response.status,
      };
    }
    return {
      ...data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      message: getNetworkErrorMessage(error),
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

export function shouldClearStoredUser(response: ApiResponse<unknown>) {
  return response.status === 401 || response.status === 200;
}

export function buildQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const value = search.toString();
  return value ? `?${value}` : "";
}

export function buildQueryFromValues(
  params: Record<string, string | number | undefined>,
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const value = search.toString();
  return value ? `?${value}` : "";
}
