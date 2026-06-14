import type { CustomerStatus } from "../types";

export function normalizeServerAddress(value?: string | null) {
  const trimmed = (value || "").trim();
  return (trimmed || window.location.origin).replace(/\/+$/, "");
}

export function getConfiguredServerAddress(status?: CustomerStatus | null) {
  return normalizeServerAddress(
    status?.server_address ?? status?.serverAddress,
  );
}

export function getOpenAICompatibleServerAddress(value?: string | null) {
  const normalized = normalizeServerAddress(value);
  return /\/v1$/i.test(normalized) ? normalized : `${normalized}/v1`;
}

export function getOpenAICompatibleBaseUrl(status?: CustomerStatus | null) {
  return getOpenAICompatibleServerAddress(
    status?.server_address ?? status?.serverAddress,
  );
}
