# Customer SEO Crawlability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the customer site reliably indexable in Simplified Chinese and English with stable URLs, server-rendered metadata, correct HTTP status codes, sitemap/robots endpoints, and matching client-side navigation semantics.

**Architecture:** Store public-page SEO copy and routes in one JSON manifest embedded by Go and imported by React. A focused Go service resolves routes, injects the customer HTML head, serves robots/sitemap, redirects aliases, and returns real 404 responses; TypeScript helpers and one React component keep the SPA URL language and metadata synchronized.

**Tech Stack:** Go 1.25.1, Gin, html/template, React 19, TypeScript 6, Rsbuild 2, Bun, testify, Bun test.

## Global Constraints

- Modify the customer theme under web/customer only; do not modify web/default or web/classic.
- Preserve all protected project/organization names, metadata, branding, and attributions.
- All Go JSON marshal/unmarshal calls use common.Marshal and common.Unmarshal.
- Add no third-party dependencies.
- Canonical, sitemap, and schema URLs always use https://aitokensflux.com, never the request Host.
- Only Host aitokensflux.com may emit index, follow; all other hosts emit noindex, nofollow.
- Public SEO languages are Simplified Chinese (zh-CN) and English (en). Traditional Chinese and Russian remain UI languages but are excluded from sitemap/hreflang.
- Keep API, auth, billing, pricing data, databases, and admin routing unchanged.
- Follow the existing customer TypeScript style: double quotes and semicolons.
- New Go tests use require for setup/fatal assertions and assert for value checks.

---

## File Structure

New files:

- web/customer/src/seo/pages.json: shared route, localized metadata, breadcrumb, FAQ, alias, and noindex data.
- web/customer/src/seo/metadata.ts: typed route/language resolution and browser metadata.
- web/customer/src/components/common/Seo.tsx: idempotent DOM-head synchronization.
- web/customer/test/seo.test.ts: Bun tests for canonical/language behavior.
- router/customer_seo.go: config validation, response rendering, robots, and sitemap.
- router/customer_seo_test.go: deterministic Go regression tests.
- web/customer/public/og/aitokensflux-social-card.svg and .png: 1200×630 social card.

Modified files:

- main.go and router/web-router.go: embed/pass SEO config and serve route-aware responses.
- web/customer/index.html: safe noindex fallback and replacement markers.
- web/customer/package.json: focused SEO test script.
- web/customer/src/App.tsx, navigation/language helpers, AppLink, LanguageButton: URL-language behavior and client metadata.
- Home, Subscription, SetupPage, MarketingHeader, Footer, PriceCard, Dashboard, Token, and locale files: semantic H1s and canonical links.

---

### Task 1: Shared Manifest and Go Route Resolution

**Files:**
- Create: web/customer/src/seo/pages.json
- Create: router/customer_seo.go
- Create: router/customer_seo_test.go
- Modify: main.go
- Modify: router/web-router.go

**Interfaces:**
- Produces: parseCustomerSEOConfig(data []byte) (customerSEOConfig, error)
- Produces: customerSEOConfig.resolve(path string) customerSEOResolution
- Produces fields: Language, Page, CanonicalPath, RedirectPath, NoIndex, NotFound
- Consumed by Tasks 2 and 3.

- [ ] **Step 1: Write failing manifest and resolver tests**

~~~go
func loadCustomerSEOTestConfig(t *testing.T) customerSEOConfig {
    t.Helper()
    data, err := os.ReadFile("../web/customer/src/seo/pages.json")
    require.NoError(t, err)
    config, err := parseCustomerSEOConfig(data)
    require.NoError(t, err)
    return config
}

func TestCustomerSEOConfigResolvesRoutes(t *testing.T) {
    config := loadCustomerSEOTestConfig(t)
    tests := []struct {
        path, language, key, canonical, redirect string
    }{
        {"/", "zh", "home", "/", ""},
        {"/en", "en", "home", "/en", ""},
        {"/pricing", "zh", "pricing", "/pricing", ""},
        {"/en/docs", "en", "docs", "/en/docs", ""},
        {"/subscribe", "zh", "pricing", "/pricing", "/pricing"},
        {"/en/setup", "en", "docs", "/en/docs", "/en/docs"},
    }
    for _, tt := range tests {
        t.Run(tt.path, func(t *testing.T) {
            result := config.resolve(tt.path)
            require.NotNil(t, result.Page)
            assert.Equal(t, tt.language, result.Language)
            assert.Equal(t, tt.key, result.Page.Key)
            assert.Equal(t, tt.canonical, result.CanonicalPath)
            assert.Equal(t, tt.redirect, result.RedirectPath)
            assert.False(t, result.NoIndex)
            assert.False(t, result.NotFound)
        })
    }
}

func TestCustomerSEOConfigSeparatesNoIndexAndNotFound(t *testing.T) {
    config := loadCustomerSEOTestConfig(t)
    privatePage := config.resolve("/en/dashboard/api-key")
    assert.True(t, privatePage.NoIndex)
    assert.False(t, privatePage.NotFound)
    unknownPage := config.resolve("/en/not-a-real-page")
    assert.True(t, unknownPage.NoIndex)
    assert.True(t, unknownPage.NotFound)
}
~~~

Run:

~~~bash
go test ./router -run TestCustomerSEOConfig -count=1
~~~

Expected: FAIL because the config types/functions do not exist.

- [ ] **Step 2: Create the exact shared manifest**

Use this schema:

~~~json
{
  "siteUrl": "https://aitokensflux.com",
  "productionHost": "aitokensflux.com",
  "shareImagePath": "/og/aitokensflux-social-card.png",
  "pages": [
    {
      "key": "home",
      "path": "/",
      "aliases": [],
      "title": {
        "zh": "AI Tokens Flux｜Claude Code、Codex、Grok API 统一网关",
        "en": "AI Tokens Flux | Unified Claude Code, Codex & Grok API Gateway"
      },
      "description": {
        "zh": "AI Tokens Flux 提供稳定的 Claude Code、Codex 与 Grok API 统一接入，支持按量计费、透明模型价格、用量查询和快速配置。",
        "en": "AI Tokens Flux provides unified Claude Code, Codex and Grok API access with usage-based billing, transparent model pricing and fast setup."
      },
      "breadcrumb": {"zh": "首页", "en": "Home"},
      "schemas": ["Organization", "WebSite", "WebPage", "Service", "FAQPage"],
      "faq": [
        {
          "question": {"zh": "AI Tokens Flux 会改变我现有的工具吗？", "en": "Will AI Tokens Flux change my existing tools?"},
          "answer": {"zh": "不会。它只在请求层重新路由，你的 Claude Code、Codex 和 VS Code 工作流、命令与脚本保持不变。", "en": "No. It only reroutes requests, so your Claude Code, Codex and VS Code workflows, commands and scripts stay unchanged."}
        },
        {
          "question": {"zh": "按量余额会过期吗？", "en": "Do pay-as-you-go credits expire?"},
          "answer": {"zh": "按量余额永不过期；订阅方案会按各自的计费周期重置。", "en": "Pay-as-you-go credits never expire. Subscription plans reset on their billing cycle."}
        },
        {
          "question": {"zh": "支持哪些模型？", "en": "Which models are supported?"},
          "answer": {"zh": "平台提供 Claude、OpenAI Codex 和 Grok 等前沿模型的兼容 API，实际可用模型以价格页展示为准。", "en": "The platform provides compatible APIs for frontier Claude, OpenAI Codex and Grok models. Current availability is listed on the pricing page."}
        },
        {
          "question": {"zh": "代码和请求数据安全吗？", "en": "Are my code and request data safe?"},
          "answer": {"zh": "API Key 由用户自行管理并可随时吊销；网关不留存请求内容。", "en": "API keys are user-managed and revocable at any time, and the gateway does not retain request content."}
        }
      ]
    },
    {
      "key": "pricing",
      "path": "/pricing",
      "aliases": ["/subscribe"],
      "title": {"zh": "Claude Code、Codex、Grok API 价格｜AI Tokens Flux", "en": "Claude Code, Codex & Grok API Pricing | AI Tokens Flux"},
      "description": {"zh": "查看 Claude Code、Codex 与 Grok API 的透明模型价格、按量充值和订阅方案，按实际 Token 用量付费。", "en": "Compare transparent Claude Code, Codex and Grok API pricing, pay-as-you-go credit and subscription plans based on actual token usage."},
      "breadcrumb": {"zh": "价格", "en": "Pricing"},
      "schemas": ["WebPage", "BreadcrumbList"]
    },
    {
      "key": "docs",
      "path": "/docs",
      "aliases": ["/setup"],
      "title": {"zh": "Claude Code 与 Codex API 接入文档｜AI Tokens Flux", "en": "Claude Code & Codex API Setup Guide | AI Tokens Flux"},
      "description": {"zh": "按照分步文档在 macOS、Windows 或 Linux 配置 Claude Code 与 OpenAI Codex，接入 AI Tokens Flux 统一 API 网关。", "en": "Follow step-by-step macOS, Windows and Linux instructions to connect Claude Code and OpenAI Codex to the AI Tokens Flux API gateway."},
      "breadcrumb": {"zh": "接入文档", "en": "Setup guide"},
      "schemas": ["WebPage", "BreadcrumbList"]
    },
    {
      "key": "userAgreement",
      "path": "/user-agreement",
      "aliases": [],
      "title": {"zh": "用户协议与服务条款｜AI Tokens Flux", "en": "User Agreement and Terms of Service | AI Tokens Flux"},
      "description": {"zh": "阅读 AI Tokens Flux 用户协议与服务条款，了解账户、API 使用、计费、退款、责任和服务规则。", "en": "Read the AI Tokens Flux user agreement and terms covering accounts, API usage, billing, refunds, responsibilities and service rules."},
      "breadcrumb": {"zh": "用户协议", "en": "User agreement"},
      "schemas": ["WebPage", "BreadcrumbList"]
    },
    {
      "key": "privacyPolicy",
      "path": "/privacy-policy",
      "aliases": [],
      "title": {"zh": "隐私政策｜AI Tokens Flux", "en": "Privacy Policy | AI Tokens Flux"},
      "description": {"zh": "了解 AI Tokens Flux 如何收集、使用、保存和保护账户信息、支付信息、日志与相关个人数据。", "en": "Learn how AI Tokens Flux collects, uses, stores and protects account, payment, log and related personal data."},
      "breadcrumb": {"zh": "隐私政策", "en": "Privacy policy"},
      "schemas": ["WebPage", "BreadcrumbList"]
    }
  ],
  "noindexPaths": [
    "/dashboard", "/dashboard/billing", "/dashboard/usage", "/dashboard/api-key", "/dashboard/invite-record", "/dashboard/settings",
    "/console/connect", "/atf-switch/connect", "/topup", "/wallet", "/usage", "/usage-logs", "/apikeys", "/keys", "/invite", "/settings",
    "/fathers-day", "/sign-in", "/login", "/register", "/sign-up", "/user/reset", "/reset"
  ],
  "noindexPrefixes": ["/oauth/"]
}
~~~

- [ ] **Step 3: Implement typed parsing and validation**

Define localized text, FAQ, page, config, and resolution structs with matching JSON tags. Use common.Unmarshal. Reject wrong site URL/host, empty localized fields, empty page keys, duplicate canonical paths, duplicate aliases, and aliases that collide with canonical paths.

Implement:

~~~go
func normalizeCustomerSEOPath(value string) string
func splitCustomerSEOLanguage(requestPath string) (language, basePath string)
func customerSEOCanonicalPath(language, basePath string) string
func (config customerSEOConfig) resolve(requestPath string) customerSEOResolution
~~~

Resolution order is canonical page, alias, exact noindex path, noindex prefix, unknown. Strip optional /en before matching. Copy a matched page before returning its address.

- [ ] **Step 4: Embed and pass the manifest**

In main.go:

~~~go
//go:embed web/customer/src/seo/pages.json
var customerSEOConfig []byte
~~~

Add CustomerSEOConfig []byte to router.ThemeAssets and pass customerSEOConfig beside CustomerIndexPage.

- [ ] **Step 5: Verify and commit**

~~~bash
gofmt -w router/customer_seo.go router/customer_seo_test.go main.go router/web-router.go
go test ./router -run TestCustomerSEOConfig -count=1
~~~

Expected: PASS.

~~~bash
git add web/customer/src/seo/pages.json router/customer_seo.go router/customer_seo_test.go main.go router/web-router.go
git commit -m "feat(customer): define shared SEO route manifest"
~~~

---

### Task 2: Server HTML Metadata, Redirects, Host Gating, and 404s

**Files:**
- Modify: router/customer_seo.go
- Modify: router/customer_seo_test.go
- Modify: router/web-router.go
- Modify: web/customer/index.html

**Interfaces:**
- Consumes: customerSEOConfig.resolve.
- Produces: newCustomerSEOService(configBytes, indexPage []byte) (*customerSEOService, error)
- Produces: customerSEOService.servePage(c *gin.Context)

- [ ] **Step 1: Write failing response tests**

Use a minimal HTML fixture containing customer-seo-start/customer-seo-end markers. Test:

- / on aitokensflux.com: 200, zh-CN, index/follow, Chinese title, root canonical.
- /en/docs on aitokensflux.com: 200, en, index/follow, English title/canonical.
- /en/setup: 301 Location /en/docs.
- /dashboard/api-key: 200, noindex/nofollow.
- /pricing on preview.example.com: 200, noindex/nofollow.
- /missing-page: 404, noindex/nofollow.
- JSON-LD parses through common.Unmarshal into map[string]any.

Core assertion pattern:

~~~go
recorder := performCustomerSEORequest(t, service, "/en/docs", "aitokensflux.com")
assert.Equal(t, http.StatusOK, recorder.Code)
assert.Contains(t, recorder.Body.String(), "lang=\"en\"")
assert.Contains(t, recorder.Body.String(), "https://aitokensflux.com/en/docs")
assert.Contains(t, recorder.Body.String(), "index, follow")
~~~

Run:

~~~bash
go test ./router -run TestCustomerSEOServiceServes -count=1
~~~

Expected: FAIL because customerSEOService does not exist.

- [ ] **Step 2: Add a safe direct-static fallback block**

In web/customer/index.html replace the generic title/description with:

~~~html
<!--customer-seo-start-->
<title>AI Tokens Flux</title>
<meta name="description" content="AI Tokens Flux 提供 Claude Code、Codex 与 Grok API 统一接入。" />
<meta name="robots" content="noindex, nofollow" />
<!--customer-seo-end-->
~~~

Keep html lang="zh-CN" as the exact language replacement anchor.

- [ ] **Step 3: Implement the service and safe head rendering**

customerSEOService stores the validated config, a cloned index template, and a rendered-document cache keyed by page/language/robots/status.

Use html/template for title, description, robots, canonical, hreflang, Open Graph, and Twitter fields. Use common.Marshal for one JSON-LD graph. Replace any case-insensitive closing script sequence in JSON bytes before inserting the trusted static JSON into the script element.

Every public page emits:

- html lang
- title and description
- robots
- canonical
- zh-CN, en, x-default alternates
- og:type=website, og:title, og:description, og:url, og:image, og:locale
- twitter:card=summary_large_image and matching title/description/image
- JSON-LD WebPage

Home additionally emits Organization, WebSite, Service, and FAQPage from manifest FAQ. Other public pages emit BreadcrumbList with home and current page.

Private/unknown pages emit brand fallback metadata with no canonical/alternates. Unknown status is 404. Alias redirects discard query parameters and point to the clean canonical path.

- [ ] **Step 4: Integrate without changing API/admin ordering**

In SetWebRouter construct the service once. On config/template failure, log common.SysError and use a safe service that serves the original noindex index and real 404s.

Keep NoRoute order:

1. shouldReturnRelayNotFound
2. classic/default admin HTML
3. customerSEO.servePage

Explicit public URL language owns Content-Language. Existing edge language behavior remains for admin and non-public UI decisions.

- [ ] **Step 5: Verify and commit**

~~~bash
gofmt -w router/customer_seo.go router/customer_seo_test.go router/web-router.go
go test ./router -run TestCustomerSEO -count=1
go test ./router -count=1
~~~

Expected: PASS.

~~~bash
git add router/customer_seo.go router/customer_seo_test.go router/web-router.go web/customer/index.html
git commit -m "feat(customer): serve crawlable route metadata"
~~~

---

### Task 3: Robots and Multilingual Sitemap

**Files:**
- Modify: router/customer_seo.go
- Modify: router/customer_seo_test.go
- Modify: router/web-router.go

**Interfaces:**
- Produces: customerSEOService.serveRobots
- Produces: customerSEOService.serveSitemap
- Sitemap contains exactly ten canonical URLs.

- [ ] **Step 1: Write failing endpoint tests**

~~~go
func TestCustomerSEOServiceServesRobots(t *testing.T) {
    service := newCustomerSEOTestService(t)
    recorder := performCustomerSEOEndpoint(t, service.serveRobots, "/robots.txt")
    assert.Equal(t, http.StatusOK, recorder.Code)
    assert.Equal(t, "text/plain; charset=utf-8", recorder.Header().Get("Content-Type"))
    assert.Contains(t, recorder.Body.String(), "Disallow: /api/")
    assert.Contains(t, recorder.Body.String(), "Disallow: /admin/")
    assert.Contains(t, recorder.Body.String(), "Sitemap: https://aitokensflux.com/sitemap.xml")
    assert.NotContains(t, recorder.Body.String(), "Disallow: /dashboard")
}

func TestCustomerSEOServiceSitemapHasOnlyCanonicalPublicURLs(t *testing.T) {
    service := newCustomerSEOTestService(t)
    recorder := performCustomerSEOEndpoint(t, service.serveSitemap, "/sitemap.xml")
    body := recorder.Body.String()
    assert.Equal(t, 10, strings.Count(body, "<url>"))
    assert.Contains(t, body, "https://aitokensflux.com/en/docs")
    assert.Contains(t, body, "hreflang=\"zh-CN\"")
    assert.Contains(t, body, "hreflang=\"en\"")
    assert.Contains(t, body, "hreflang=\"x-default\"")
    assert.NotContains(t, body, "/subscribe")
    assert.NotContains(t, body, "/dashboard")
}
~~~

Run:

~~~bash
go test ./router -run "TestCustomerSEOService(ServesRobots|Sitemap)" -count=1
~~~

Expected: FAIL because the methods do not exist.

- [ ] **Step 2: Implement deterministic endpoints**

robots.txt content:

~~~text
User-agent: *
Allow: /
Disallow: /api/
Disallow: /v1/
Disallow: /admin/
Disallow: /oauth/

Sitemap: https://aitokensflux.com/sitemap.xml
~~~

Generate sitemap from the five manifest pages × two languages. Declare sitemap and XHTML namespaces. Each URL contains alternate links for zh-CN, en, and x-default. Do not emit lastmod.

Register before NoRoute:

~~~go
router.GET("/robots.txt", customerSEO.serveRobots)
router.GET("/sitemap.xml", customerSEO.serveSitemap)
~~~

- [ ] **Step 3: Verify and commit**

~~~bash
gofmt -w router/customer_seo.go router/customer_seo_test.go router/web-router.go
go test ./router -run TestCustomerSEO -count=1
go test ./router -count=1
~~~

Expected: PASS.

~~~bash
git add router/customer_seo.go router/customer_seo_test.go router/web-router.go
git commit -m "feat(customer): publish robots and multilingual sitemap"
~~~

---

### Task 4: Frontend SEO Route and Language Helpers

**Files:**
- Create: web/customer/src/seo/metadata.ts
- Create: web/customer/test/seo.test.ts
- Modify: web/customer/package.json
- Modify: web/customer/src/constants/navigation.ts
- Modify: web/customer/src/helpers/navigation.ts
- Modify: web/customer/src/i18n/languages.ts

**Interfaces:**
- Produces: resolveSeoRoute(pathname)
- Produces: localizePublicHref(href, language, origin)
- Produces: getLanguageSwitchHref(pathname, search, hash, language)
- Produces: getRouteLanguage(pathname)
- Produces: buildSeoMetadata(pathname, host)

- [ ] **Step 1: Write failing Bun tests**

~~~ts
import { describe, expect, test } from "bun:test";
import {
  buildSeoMetadata,
  getLanguageSwitchHref,
  getRouteLanguage,
  localizePublicHref,
  resolveSeoRoute,
} from "../src/seo/metadata";

describe("customer SEO routes", () => {
  test("resolves canonical languages and aliases", () => {
    expect(resolveSeoRoute("/")).toMatchObject({language: "zh", pageKey: "home", canonicalPath: "/"});
    expect(resolveSeoRoute("/en/pricing")).toMatchObject({language: "en", pageKey: "subscribe", canonicalPath: "/en/pricing"});
    expect(resolveSeoRoute("/subscribe").canonicalPath).toBe("/pricing");
    expect(resolveSeoRoute("/en/setup").canonicalPath).toBe("/en/docs");
  });

  test("localizes only public internal links", () => {
    expect(localizePublicHref("/docs#codex", "en", "https://aitokensflux.com")).toBe("/en/docs#codex");
    expect(localizePublicHref("/subscribe", "zh", "https://aitokensflux.com")).toBe("/pricing");
    expect(localizePublicHref("/dashboard", "en", "https://aitokensflux.com")).toBe("/dashboard");
    expect(localizePublicHref("https://example.com/docs", "en", "https://aitokensflux.com")).toBe("https://example.com/docs");
  });

  test("switches public language URLs", () => {
    expect(getLanguageSwitchHref("/docs", "?tool=codex", "#windows", "en")).toBe("/en/docs?tool=codex#windows");
    expect(getLanguageSwitchHref("/en/pricing", "", "#plans", "zh")).toBe("/pricing#plans");
    expect(getRouteLanguage("/pricing")).toBe("zh");
    expect(getRouteLanguage("/en/docs")).toBe("en");
    expect(getRouteLanguage("/dashboard")).toBeNull();
  });

  test("gates indexing by host", () => {
    expect(buildSeoMetadata("/en/docs", "aitokensflux.com").robots).toBe("index, follow");
    expect(buildSeoMetadata("/pricing", "preview.example.com").robots).toBe("noindex, nofollow");
  });
});
~~~

Add package script:

~~~json
"test:seo": "bun test test/seo.test.ts"
~~~

Run bun run test:seo; expected FAIL because metadata.ts does not exist.

- [ ] **Step 2: Implement typed helpers**

Import pages.json with resolveJsonModule. Define SeoLanguage, localized text, manifest page, resolution, and BrowserSeoMetadata types.

Map manifest page keys:

~~~ts
const pageKeyMap = {
  home: "home",
  pricing: "subscribe",
  docs: "setup",
  userAgreement: "userAgreement",
  privacyPolicy: "privacyPolicy",
} as const satisfies Record<string, PageKey>;
~~~

Match Go normalization exactly. localizePublicHref leaves external/private URLs unchanged, canonicalizes public aliases, preserves search/hash, prefixes English public URLs, and uses unprefixed URLs for other UI languages.

buildSeoMetadata mirrors Go title/description/robots/canonical/alternates/image/schema. Unknown/private pages have no canonical/alternates and are noindex.

- [ ] **Step 3: Update route and language entry points**

Ensure customerRoutes contains /pricing and /docs while retaining /subscribe and /setup for development fallback.

getPageKey first uses resolveSeoRoute, then handles the optional /en prefix for OAuth/private paths.

detectCustomerLanguage accepts pathname and returns getRouteLanguage(pathname) before storage/cookie/browser detection, making / and /en stable SEO-language URLs.

- [ ] **Step 4: Verify and commit**

~~~bash
cd web/customer
bun run test:seo
bun run typecheck
cd ../..
~~~

Expected: PASS.

~~~bash
git add web/customer/package.json web/customer/src/seo/metadata.ts web/customer/test/seo.test.ts web/customer/src/constants/navigation.ts web/customer/src/helpers/navigation.ts web/customer/src/i18n/languages.ts
git commit -m "feat(customer): add localized SEO route helpers"
~~~

---

### Task 5: React Head Synchronization and Language Navigation

**Files:**
- Create: web/customer/src/components/common/Seo.tsx
- Modify: web/customer/src/App.tsx
- Modify: web/customer/src/components/common/AppLink.tsx
- Modify: web/customer/src/components/layout/LanguageButton.tsx

**Interfaces:**
- Consumes Task 4 helpers.
- Produces Seo({pathname}) mounted once under LanguageContext.Provider.

- [ ] **Step 1: Create idempotent head synchronization**

Seo.tsx uses useEffect and buildSeoMetadata. It must:

- set document.title and html lang;
- upsert description, robots, Open Graph, and Twitter meta elements;
- upsert/remove canonical and three hreflang links;
- replace one script[data-customer-seo-jsonld] using textContent = JSON.stringify(data);
- remove canonical/hreflang/og:url for private and unknown pages;
- use twitter:card summary_large_image.

Use small upsertMeta and upsertLink helpers; neither helper is exported.

- [ ] **Step 2: Make App URL-language aware and docs standalone**

In App.tsx:

- initialize with detectCustomerLanguage(window.location.pathname);
- on popstate, update PageKey and apply explicit getRouteLanguage when non-null;
- render SetupPage directly for setup;
- remove isSetupRoute, setupOverlayOpen, setupBackgroundPage, setup modal rendering, and setup-based scroll lock;
- preserve auth overlays;
- mount Seo with current pathname inside LanguageContext.Provider;
- sign out to localizePublicHref("/", language).

Final content selection:

~~~tsx
const content = renderPage(authOverlayOpen ? authBackgroundPage : page);
const overlayScrollLocked = authOverlayOpen;
~~~

- [ ] **Step 3: Canonicalize links and language switching**

AppLink reads LanguageContext, computes resolvedHref = localizePublicHref(href, language), and uses resolvedHref both in the anchor and SPA click handler.

LanguageButton selection:

~~~ts
const target = getLanguageSwitchHref(
  window.location.pathname,
  window.location.search,
  window.location.hash,
  item.value,
);
setLanguage(item.value);
if (target) navigateTo(target, { preserveScroll: true });
setOpen(false);
~~~

English uses /en public URLs. Simplified Chinese uses unprefixed canonical URLs. Traditional Chinese/Russian use unprefixed public URLs while remaining local UI languages.

- [ ] **Step 4: Verify and commit**

~~~bash
cd web/customer
bun run test:seo
bun run typecheck
bun run build
cd ../..
~~~

Expected: PASS; dist/index.html retains both customer SEO markers.

~~~bash
git add web/customer/src/components/common/Seo.tsx web/customer/src/App.tsx web/customer/src/components/common/AppLink.tsx web/customer/src/components/layout/LanguageButton.tsx web/customer/src/seo/metadata.ts
git commit -m "feat(customer): synchronize SEO across SPA navigation"
~~~

---

### Task 6: Public Semantics, Canonical Links, and Social Card

**Files:**
- Create: web/customer/public/og/aitokensflux-social-card.svg
- Create: web/customer/public/og/aitokensflux-social-card.png
- Modify: web/customer/src/pages/Home/index.tsx
- Modify: web/customer/src/pages/Subscription/index.tsx
- Modify: web/customer/src/components/setup/SetupPage.tsx
- Modify: web/customer/src/components/layout/MarketingHeader.tsx
- Modify: web/customer/src/components/layout/Footer.tsx
- Modify: web/customer/src/components/topup/PriceCard.tsx
- Modify: web/customer/src/pages/Dashboard/index.tsx
- Modify: web/customer/src/pages/Token/index.tsx
- Modify: web/customer/src/i18n/locales/en.ts, zh.ts, zh-TW.ts, ru.ts

**Interfaces:**
- Consumes manifest FAQ and localized AppLink.
- Produces exactly one visible H1 per public route and visible FAQ equal to schema FAQ.

- [ ] **Step 1: Add exact H1 translations and hierarchy**

English source keys:

~~~text
Unified Claude Code, Codex and Grok API gateway
Transparent Claude Code, Codex and Grok API pricing
Claude Code and Codex API setup guide
~~~

Chinese:

~~~text
Claude Code、Codex 与 Grok API 统一网关
透明的 Claude Code、Codex 与 Grok API 价格
Claude Code 与 Codex API 接入指南
~~~

Traditional Chinese:

~~~text
Claude Code、Codex 與 Grok API 統一閘道
透明的 Claude Code、Codex 與 Grok API 價格
Claude Code 與 Codex API 接入指南
~~~

Russian:

~~~text
Единый API-шлюз для Claude Code, Codex и Grok
Прозрачные цены API Claude Code, Codex и Grok
Руководство по подключению API Claude Code и Codex
~~~

Use the first key for Home H1, second for pricing H1, third for standalone docs H1. Change SetupPicker and selected-tool guide headings from h1 to h2.

- [ ] **Step 2: Render visible FAQ from manifest**

Replace hard-coded FAQ copy with home.faq from pages.json. Use zh for Simplified/Traditional Chinese and en for English/Russian source. Apply localizeZh for Traditional Chinese. Keep first details open and preserve current markup/classes.

- [ ] **Step 3: Replace old public aliases**

~~~bash
rg -n 'href="/(subscribe|setup)"' web/customer/src
~~~

Replace every /subscribe with /pricing and every /setup with /docs in all listed files. Re-run; expected no output.

- [ ] **Step 4: Create and render the social card**

Create a 1200×630 SVG with dark navy #07131f, green #0fb477, AI Tokens Flux, and subtitle Unified Claude Code · Codex · Grok API Gateway. Do not include third-party logos.

Generate PNG:

~~~bash
mkdir -p web/customer/public/og
sips -s format png web/customer/public/og/aitokensflux-social-card.svg --out web/customer/public/og/aitokensflux-social-card.png
sips -z 630 1200 web/customer/public/og/aitokensflux-social-card.png
sips -g pixelWidth -g pixelHeight web/customer/public/og/aitokensflux-social-card.png
~~~

Expected: width 1200, height 630.

- [ ] **Step 5: Format, verify, and commit**

~~~bash
cd web/customer
bun run format
bun run format:check
bun run test:seo
bun run typecheck
bun run build
test -f dist/og/aitokensflux-social-card.png
cd ../..
rg -n 'href="/(subscribe|setup)"' web/customer/src
git diff --check
~~~

Expected: all checks pass; alias search has no output.

~~~bash
git add web/customer/public/og web/customer/src/pages/Home/index.tsx web/customer/src/pages/Subscription/index.tsx web/customer/src/components/setup/SetupPage.tsx web/customer/src/components/layout/MarketingHeader.tsx web/customer/src/components/layout/Footer.tsx web/customer/src/components/topup/PriceCard.tsx web/customer/src/pages/Dashboard/index.tsx web/customer/src/pages/Token/index.tsx web/customer/src/i18n/locales/en.ts web/customer/src/i18n/locales/zh.ts web/customer/src/i18n/locales/zh-TW.ts web/customer/src/i18n/locales/ru.ts
git commit -m "feat(customer): strengthen public SEO semantics"
~~~

---

### Task 7: Integrated Regression Verification

**Files:**
- Modify only Tasks 1-6 files if verification finds a defect.
- Preserve unrelated untracked docs/research and the existing untracked design file.

- [ ] **Step 1: Run complete relevant checks**

~~~bash
go test ./router -count=1
go test ./... -count=1
cd web/customer
bun run format:check
bun run test:seo
bun run typecheck
bun run build
cd ../..
~~~

Expected: all pass. If the repository-wide Go suite fails outside touched code, capture the exact package/test and confirm router tests still pass.

- [ ] **Step 2: Verify build artifacts and protocol contracts**

~~~bash
rg -n 'customer-seo-start|customer-seo-end|noindex, nofollow' web/customer/dist/index.html
test -f web/customer/dist/og/aitokensflux-social-card.png
git diff --check 2b3dd37b..HEAD
~~~

Add one full Gin-engine test in router/web-router_test.go that proves:

~~~go
assert.Equal(t, http.StatusMovedPermanently, request("/subscribe", "aitokensflux.com").Code)
assert.Equal(t, http.StatusOK, request("/en/docs", "aitokensflux.com").Code)
assert.Equal(t, http.StatusNotFound, request("/definitely-missing", "aitokensflux.com").Code)
assert.Equal(t, http.StatusNotFound, request("/v1/definitely-missing", "aitokensflux.com").Code)
~~~

This guards against swallowing relay/API 404s or changing admin behavior.

- [ ] **Step 3: Review scope and secrets**

~~~bash
git status --short
git diff --stat 2b3dd37b..HEAD
git diff --check 2b3dd37b..HEAD
git diff 2b3dd37b..HEAD -- . ':!docs/research/**' | rg -n -i 'password|private[_ -]?key|api[_ -]?key\s*[:=]|secret\s*[:=]'
~~~

Expected: only planned files; no whitespace errors; no credentials; protected identifiers remain intact.

- [ ] **Step 4: Commit verification fixes only if files changed**

~~~bash
git add router/web-router_test.go router/customer_seo.go router/customer_seo_test.go web/customer
git commit -m "test(customer): verify SEO routing integration"
~~~

Do not create an empty commit.

- [ ] **Step 5: Handoff**

Report indexed routes, English alternates, noindex/404 behavior, redirects, robots/sitemap URLs, exact checks/results, unrelated failures, and the commit list.
