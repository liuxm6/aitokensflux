import { apiRequest, buildQuery, withTurnstileHeader } from "../services/api";
import type { CustomOAuthProvider } from "../types";

export function getSearchParam(name: string) {
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

export function getStoredAffCode() {
  return (
    getSearchParam("aff") ||
    getSearchParam("aff_code") ||
    getSearchParam("invite_code") ||
    window.localStorage.getItem("aff") ||
    ""
  ).trim();
}

export async function getOAuthState(turnstileToken?: string) {
  const aff = getStoredAffCode();
  const response = await apiRequest<string>(
    `/api/oauth/state${buildQuery({ aff })}`,
    { method: "GET", headers: withTurnstileHeader(turnstileToken) },
  );
  return response.success && response.data ? response.data : "";
}

export function redirectToOAuth(url: string) {
  window.location.assign(url);
}

export function buildGitHubOAuthUrl(clientId: string, state: string) {
  return `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&state=${encodeURIComponent(state)}&scope=user:email`;
}

export function buildDiscordOAuthUrl(clientId: string, state: string) {
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set(
    "redirect_uri",
    `${window.location.origin}/oauth/discord`,
  );
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify+openid");
  url.searchParams.set("state", state);
  return url.toString();
}

export function buildOIDCOAuthUrl(
  authUrl: string,
  clientId: string,
  state: string,
) {
  const url = new URL(authUrl);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${window.location.origin}/oauth/oidc`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("state", state);
  return url.toString();
}

export function buildLinuxDOOAuthUrl(clientId: string, state: string) {
  return `https://connect.linux.do/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&state=${encodeURIComponent(state)}`;
}

export function buildCustomOAuthUrl(
  provider: CustomOAuthProvider,
  state: string,
) {
  const url = new URL(provider.authorization_endpoint);
  url.searchParams.set("client_id", provider.client_id);
  url.searchParams.set(
    "redirect_uri",
    `${window.location.origin}/oauth/${provider.slug}`,
  );
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", provider.scopes || "openid profile email");
  url.searchParams.set("state", state);
  return url.toString();
}
