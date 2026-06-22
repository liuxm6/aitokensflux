import { translateLocale } from "../i18n/locales";
import { detectCustomerLanguage } from "../i18n/languages";
import type { ApiResponse } from "../types";

const API_REQUEST_TIMEOUT_MS = 8000;
const TURNSTILE_HEADER_NAME = "X-Turnstile-Token";

function mergeRequestHeaders(headers?: HeadersInit) {
  const merged = new Headers();
  merged.set("Content-Type", "application/json");

  const uid = window.localStorage.getItem("uid");
  if (uid) merged.set("New-API-User", uid);

  if (headers) {
    new Headers(headers).forEach((value, key) => {
      merged.set(key, value);
    });
  }

  return merged;
}

export function withTurnstileHeader(
  turnstileToken?: string,
  headers?: HeadersInit,
): HeadersInit | undefined {
  if (!turnstileToken) return headers;

  const merged = new Headers(headers);
  merged.set(TURNSTILE_HEADER_NAME, turnstileToken);
  return merged;
}

function getNetworkErrorMessage(error: unknown) {
  const language = detectCustomerLanguage();
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
    const { headers, ...requestOptions } = options;
    const response = await fetch(url, {
      ...requestOptions,
      credentials: "include",
      headers: mergeRequestHeaders(headers),
      signal: controller.signal,
    });
    const data = (await response.json().catch(() => ({}))) as ApiResponse<T>;
    if (!response.ok) {
      return {
        success: false,
        message:
          data.message ||
          response.statusText ||
          translateLocale(detectCustomerLanguage(), "Request failed"),
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
