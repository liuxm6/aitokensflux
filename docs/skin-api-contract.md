# Skin ↔ Platform API contract (P0)

This document describes the minimum HTTP contract between the **Skin** static site (`openrouter-theme` / customer UI) and **Platform** (`aitokensflux` backend). Skin is always a separate origin and must use cross-origin `fetch` with cookies.

## Base URL

Skin reads the Platform API base from its own configuration (e.g. `VITE_API_BASE` or equivalent). All paths below are relative to that origin.

## Authentication model

1. **Session cookie** — After `POST /api/user/login` or `POST /api/user/register`, Platform sets an HTTP-only session cookie (`session`). Skin must send `credentials: "include"` on every API call.
2. **`New-API-User` header** — After login, Skin stores the user id (e.g. in `localStorage`) and sends it on each authenticated request as `New-API-User: <userId>`. Platform validates that the header matches the session user id. Header name is case-insensitive (`New-Api-User` is equivalent).
3. **`Auth-Version` response header** — Present on successful auth middleware handling. Skin may use it to distinguish auth failures from handler errors (see `web/customer/src/services/api.ts`).

## CORS and cookies (Platform configuration)

Cross-origin Skin **cannot** use `Access-Control-Allow-Origin: *` with credentials. Platform operators must set:

| Variable | Purpose |
|----------|---------|
| `SKIN_ORIGINS` | Comma-separated allowed Skin origins (e.g. `https://app.aitokensflux.com,https://staging-skin.example.com`). No path, query, or fragment. |
| `SESSION_COOKIE_SECURE=true` | Required for `SameSite=None` when Skin is on a different site than Platform. |
| `SESSION_COOKIE_TRUSTED_URL` | HTTPS URLs Platform trusts when secure cookies are enabled (existing setting; use Platform’s public HTTPS URL). |

When `SKIN_ORIGINS` is set, Platform reflects the request `Origin` if it is on the allowlist, sets `Access-Control-Allow-Credentials: true`, and exposes `Auth-Version`. `/api/*` and `/v1/*` routes run CORS middleware.

For **same registrable domain** (e.g. `skin.example.com` → `api.example.com`), `SameSite=Lax` may be used without `SESSION_COOKIE_SECURE`. For **cross-site** Skin (different eTLD+1), use secure cookies with `SameSite=None`.

## P0 endpoints

### Health / bootstrap

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `GET` | `/api/status` | No | Public status and feature flags for Skin bootstrap. |

### Session (TC0)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `POST` | `/api/user/login` | No | JSON body: username/password. Optional `X-Turnstile-Token` when Turnstile is enabled. |
| `POST` | `/api/user/register` | No | Registration when enabled. Optional `X-Turnstile-Token`. |
| `GET` | `/api/user/self` | Session + `New-API-User` | Current user profile. |
| `GET` | `/api/user/logout` | Session (recommended) | Clears session cookie. |

### Bot protection

| Header | When |
|--------|------|
| `X-Turnstile-Token` | Required on login/register (and other Turnstile-gated routes) when Platform Turnstile is enabled. |

### API keys (dashboard token CRUD)

Authenticated routes under `/api/token/` (session + `New-API-User`). Skin uses the same paths as the embedded customer theme.

### Model catalog & pricing

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `GET` | `/api/user/models` | Session + `New-API-User` | User-visible model list. |
| `GET` | `/api/pricing/public` | Nav/module policy | Public pricing surface for Skin pricing pages. |

### Chat relay

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `POST` | `/v1/chat/completions` | API key (`Authorization: Bearer …`) | Standard OpenAI-compatible relay; not session-based. |

## Client reference implementation

- `web/customer/src/services/api.ts` — `credentials: "include"`, `New-API-User`, Turnstile header helper.
- `web/customer/src/components/Auth/index.tsx` — login/register flows and uid persistence.

## Out of scope (this contract)

- Embedding `web/customer` in Platform static assets (being removed in favor of separate Skin deploy).
- Admin/default theme same-origin dashboard (unchanged).
