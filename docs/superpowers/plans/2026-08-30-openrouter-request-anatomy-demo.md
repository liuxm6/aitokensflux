# OpenRouter Request Anatomy Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new self-contained v8 interactive Demo whose homepage visualizes one request from API entry through normalization, scoring, primary routing and fallback, while preserving every v7 secondary/tertiary page and interaction.

**Architecture:** Fork the approved v7 HTML into a fresh Visual Companion session, replace only the homepage template, homepage-scoped CSS and homepage-specific JavaScript branches, and keep the shared router plus all deep-page templates and logic intact. Store new homepage behavior in one isolated `homeState`, derive route results from deterministic scenarios and the existing `detailCatalog`, then verify static invariants and browser behavior through an isolated Chromium CDP session.

**Tech Stack:** Static HTML, scoped CSS, vanilla JavaScript, in-memory Mock state, hash routing, Visual Companion preview server, Bun-based CDP checks, Microsoft Edge Chromium.

## Global Constraints

- Use `docs/superpowers/specs/2026-08-30-openrouter-request-anatomy-demo-design.md` as the source of truth.
- Input file: `.superpowers/brainstorm/93984-1787991725/content/openrouter-customer-routing-decision-v7.html`.
- Approved input SHA-256: `2ca34d7e880c86e83be38447c05fc93e8735f9bf32561a121bcf27099c3c39c6`.
- Output file: `.superpowers/brainstorm/51334-1788079980/content/openrouter-customer-request-anatomy-v8.html`.
- Preview URL: `http://localhost:49946/?key=713940f9565a195b85b1fe13c0fe326f371291efebfd206bf2165f97127f35e2`.
- Do not overwrite v7, the three-direction comparison, or any previously displayed file.
- Do not modify `web/customer/`, `web/openrouter/`, backend code, Docker, CI/CD, production release files, PostgreSQL, or user-owned dirty worktree changes.
- Do not add or commit any `.superpowers/` file. Only this tracked implementation plan may be committed.
- Preserve every template from `<template id="page-models">` through the end of the template block byte-for-byte.
- Preserve the v7 deep-page CSS final computed behavior; new styling is limited to the shared navigation/Demo strip and selectors scoped below `.anatomy-home`.
- Preserve model search, provider/ability/context filters, sort, view mode, three-model comparison, detail tabs, detail estimator, rankings periods, Mock Key creation/search, copy feedback, command search, keyboard routing, focus restoration and mobile navigation.
- Do not add Chat Playground, request sending, `fetch`, XHR, Axios, WebSocket/SSE application logic, persistence, remote fonts, remote images, production credentials or real provider data.
- Homepage indicators read price, context, latency and availability from the existing `detailCatalog`; do not create conflicting metric literals in JavaScript.
- Strategy scores are deterministic `0–100` values and higher is better.
- Primary, fallback, scores, roles, reason, market highlight and accessibility state update in one render pass.
- Main interactive targets are at least `44px`; no business text is smaller than `12px`.
- `prefers-reduced-motion: reduce` renders the final route state without path movement.
- At `1440 × 900`, the full page including header and footer has a target `scrollHeight` of `2400–2700px`.
- At `390 × 844` and `375 × 812`, the first viewport shows the brand, title, primary CTA, primary route and one fallback summary; the complete five-step anatomy follows immediately below.

---

## File Map

- Create `.superpowers/brainstorm/51334-1788079980/content/openrouter-customer-request-anatomy-v8.html`: the complete v8 Demo.
- Create `/private/tmp/openrouter-request-anatomy-v8-static.mjs`: disposable syntax, content, forbidden-feature, frozen-template and frozen-deep-JS assertions.
- Create `/private/tmp/openrouter-request-anatomy-v8-cdp.mjs`: disposable route, interaction, accessibility-state, console, network and frozen-flow browser regression suite.
- Create `/private/tmp/openrouter-request-anatomy-v8-visual.mjs`: disposable multi-viewport screenshot, overflow, first-viewport and page-height audit.
- Create `/private/tmp/openrouter-request-anatomy-v8-reduced-motion.mjs`: disposable reduced-motion audit.
- Produce screenshots under `/private/tmp/openrouter-request-anatomy-v8-shots/`; do not add them to Git.

### Task 1: Fork v7 and establish immutable boundaries

**Files:**
- Create: `.superpowers/brainstorm/51334-1788079980/content/openrouter-customer-request-anatomy-v8.html`
- Create: `/private/tmp/openrouter-request-anatomy-v8-static.mjs`
- Read: `.superpowers/brainstorm/93984-1787991725/content/openrouter-customer-routing-decision-v7.html`

**Interfaces:**
- Consumes: complete v7 HTML, hash router, shared overlays, `detailCatalog`, `codeExamples`, all route templates and existing event delegation.
- Produces: a byte-identical v8 starting point and a repeatable invariant checker used after every later task.

- [ ] **Step 1: Confirm the source digest**

Run:

```bash
shasum -a 256 .superpowers/brainstorm/93984-1787991725/content/openrouter-customer-routing-decision-v7.html
```

Expected:

```text
2ca34d7e880c86e83be38447c05fc93e8735f9bf32561a121bcf27099c3c39c6
```

- [ ] **Step 2: Copy v7 to the fresh v8 semantic filename**

Run:

```bash
cp .superpowers/brainstorm/93984-1787991725/content/openrouter-customer-routing-decision-v7.html \
  .superpowers/brainstorm/51334-1788079980/content/openrouter-customer-request-anatomy-v8.html
```

- [ ] **Step 3: Create the invariant checker**

Create `/private/tmp/openrouter-request-anatomy-v8-static.mjs` with:

```js
import fs from 'node:fs'

const baselinePath = process.argv[2]
const candidatePath = process.argv[3]
const baseline = fs.readFileSync(baselinePath, 'utf8')
const candidate = fs.readFileSync(candidatePath, 'utf8')

function extract(html, startText, endText) {
  const start = html.indexOf(startText)
  const end = html.indexOf(endText, start)
  if (start < 0 || end < 0) throw new Error(`Boundary missing: ${startText}`)
  return html.slice(start, end)
}

const scriptMatch = candidate.match(/<script>([\s\S]*)<\/script>/)
if (!scriptMatch) throw new Error('Inline script missing')
new Function(scriptMatch[1])

const frozenBaseline = extract(baseline, '<template id="page-models">', '<script>')
const frozenCandidate = extract(candidate, '<template id="page-models">', '<script>')
if (frozenBaseline !== frozenCandidate) throw new Error('Frozen templates changed')

function extractFunction(source, name) {
  const signature = `function ${name}(`
  const start = source.indexOf(signature)
  if (start < 0) throw new Error(`Function missing: ${name}`)
  const braceStart = source.indexOf('{', start)
  let depth = 0
  let quote = ''
  let escaped = false
  for (let index = braceStart; index < source.length; index += 1) {
    const character = source[index]
    if (quote) {
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === quote) quote = ''
      continue
    }
    if (character === "'" || character === '"' || character === '`') {
      quote = character
      continue
    }
    if (character === '{') depth += 1
    if (character === '}') {
      depth -= 1
      if (depth === 0) return source.slice(start, index + 1)
    }
  }
  throw new Error(`Function not closed: ${name}`)
}

for (const name of [
  'normalizeRoute',
  'templateForRoute',
  'activeNavForRoute',
  'navigate',
  'openOverlay',
  'closeOverlay',
  'trapOverlayFocus',
  'showToast',
  'copyText',
  'updateModelResults',
  'updateModelDetail',
  'updateEstimator',
  'updateRanking',
  'renderMockKeys',
  'filterKeys',
  'openKeyModal',
  'renderCommands'
]) {
  if (extractFunction(baseline, name) !== extractFunction(candidate, name)) {
    throw new Error(`Frozen function changed: ${name}`)
  }
}

for (const forbidden of ['fetch(', 'XMLHttpRequest', 'axios', 'new WebSocket', 'EventSource', 'setInterval(', 'Chat Playground']) {
  if (candidate.includes(forbidden)) throw new Error(`Forbidden content: ${forbidden}`)
}

for (const required of [
  'class="anatomy-home"',
  'data-routing-strategy="balanced"',
  'data-routing-strategy="fast"',
  'data-routing-strategy="cost"',
  'data-failover-replay',
  'data-home-code-language="javascript"',
  'data-home-code-language="python"',
  'data-home-code-language="curl"',
  'TokenFlux 请求剖面交互 Demo · 页面数据均为 Mock'
]) {
  if (!candidate.includes(required)) throw new Error(`Required marker missing: ${required}`)
}

console.log('Static invariants OK')
```

- [ ] **Step 4: Prove the checker fails before homepage replacement**

Run:

```bash
node /private/tmp/openrouter-request-anatomy-v8-static.mjs \
  .superpowers/brainstorm/93984-1787991725/content/openrouter-customer-routing-decision-v7.html \
  .superpowers/brainstorm/51334-1788079980/content/openrouter-customer-request-anatomy-v8.html
```

Expected: FAIL with `Required marker missing: class="anatomy-home"`.

- [ ] **Step 5: Record the no-commit checkpoint**

Run:

```bash
git status --short -- .superpowers/brainstorm/51334-1788079980/content/openrouter-customer-request-anatomy-v8.html
```

Expected: the file is covered by the existing untracked `.superpowers/brainstorm/` directory and is not staged. Do not run `git add` for it.

### Task 2: Build the request-anatomy homepage and scoped visual system

**Files:**
- Modify: `.superpowers/brainstorm/51334-1788079980/content/openrouter-customer-request-anatomy-v8.html`

**Interfaces:**
- Consumes: shared `.button`, `.page-shell`, provider SVG symbols, `data-route`, Customer tokens and the frozen route templates.
- Produces: `.anatomy-home`, a five-stage request thread, strategy controls, market ledger, failover replay, three-language quick start, final CTA and fixed footer.

- [ ] **Step 1: Update only the approved shared frame details**

Keep the existing header DOM, IDs, routes, search, service status, console and mobile-menu controls. Replace the banner contents with:

```html
<div class="prototype-banner">
  <span>交互原型 · 页面数据与路由结果均为 Mock</span>
</div>
```

Add a final shared-frame override before the homepage layer:

```css
:root { --header-height: 72px; }
.app-header {
  border-bottom-color: #e4e7ec;
  background: #ffffff;
  box-shadow: 0 1px 0 rgb(16 24 40 / 2%);
  backdrop-filter: none;
}
.header-inner { width: min(calc(100% - 40px), 1280px); }
.brand-mark {
  border-color: #abefc6;
  background: #ecfdf3;
  box-shadow: none;
}
.brand-mark i { background: #0fb477; box-shadow: none; }
.brand em { color: #067647; }
.header-search {
  border-color: #e4e7ec;
  background: #f8fafb;
  color: #667085;
}
.nav-link:hover, .nav-link.active {
  background: #ecfdf3;
  color: #067647;
}
.nav-link.active { box-shadow: none; }
.prototype-banner {
  min-height: 32px;
  padding: 7px 16px;
  border-bottom-color: #e4e7ec;
  background: #f8fafb;
  color: #667085;
  font-size: 12px;
}
#app, .console-shell {
  min-height: calc(100vh - var(--header-height) - 32px);
}
.app-header :focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgb(15 180 119 / 13%);
}
@media (max-width: 767px) {
  .brand > span:last-child { display: inline; }
}
```

- [ ] **Step 2: Replace only the `page-home` template**

Replace the v7 block from `<template id="page-home">` up to but not including `<template id="page-models">` with this structure and exact visible copy:

```html
<template id="page-home">
  <div class="anatomy-home" data-primary-route="claude-3.7" data-failover-state="idle">
    <!-- Reuse the four existing inline provider <symbol> definitions. -->
    <main class="anatomy-shell">
      <section class="anatomy-hero" aria-labelledby="home-title">
        <div class="anatomy-intro">
          <p class="anatomy-kicker">OpenAI-compatible routing · REQ_8F2A</p>
          <h1 id="home-title">每次请求，<br>都知道为什么这样选。</h1>
          <p class="anatomy-lead">统一接入多个模型，根据性能、价格与可用性，为每次请求选择更合适的路径。</p>
          <div class="anatomy-actions">
            <button class="button primary" type="button" data-route="#/console/keys">创建 API Key</button>
            <button class="anatomy-text-link" type="button" data-route="#/models">浏览全部模型 <span aria-hidden="true">→</span></button>
          </div>
          <div class="mobile-route-summary" aria-label="当前路由摘要">
            <div><small>主路由</small><strong data-mobile-primary>Claude 3.7 Sonnet</strong></div>
            <div><small>备用路径</small><strong data-mobile-fallback>Gemini 2.5 Pro</strong></div>
          </div>
        </div>
        <div class="anatomy-strategies" role="group" aria-label="路由策略">
          <span>路由策略</span>
          <button type="button" data-routing-strategy="balanced" aria-pressed="true">平衡</button>
          <button type="button" data-routing-strategy="fast" aria-pressed="false">速度优先</button>
          <button type="button" data-routing-strategy="cost" aria-pressed="false">成本优先</button>
        </div>
        <div class="request-anatomy" aria-label="请求路由剖面">
          <article class="anatomy-stage anatomy-entry" data-anatomy-stage="entry">
            <span class="stage-index">01</span><span class="stage-label">API 入口</span>
            <strong>POST</strong><code>/v1/chat/completions</code><small>REQ_8F2A</small>
          </article>
          <article class="anatomy-stage anatomy-normalize" data-anatomy-stage="normalize">
            <span class="stage-index">02</span><span class="stage-label">协议归一化</span>
            <dl><div><dt>schema</dt><dd>openai.chat</dd></div><div><dt>messages</dt><dd>1</dd></div><div><dt>stream</dt><dd>true</dd></div></dl>
          </article>
          <section class="anatomy-stage anatomy-score" data-anatomy-stage="score" aria-labelledby="candidate-title">
            <span class="stage-index">03</span><span class="stage-label" id="candidate-title">候选评分</span>
            <div class="candidate-stack">
              <button type="button" class="candidate-node" data-candidate-id="claude-3.7" aria-expanded="false"><span data-candidate-rank>#1</span><b>Claude 3.7</b><strong data-candidate-score>94</strong><small data-candidate-role>主路由</small></button>
              <button type="button" class="candidate-node" data-candidate-id="gemini-2.5" aria-expanded="false"><span data-candidate-rank>#2</span><b>Gemini 2.5</b><strong data-candidate-score>89</strong><small data-candidate-role>低延迟备用</small></button>
              <button type="button" class="candidate-node" data-candidate-id="deepseek-v3" aria-expanded="false"><span data-candidate-rank>#4</span><b>DeepSeek V3</b><strong data-candidate-score>84</strong><small data-candidate-role>成本候选</small></button>
              <button type="button" class="candidate-node" data-candidate-id="gpt-4.1" aria-expanded="false"><span data-candidate-rank>#3</span><b>GPT-4.1</b><strong data-candidate-score>86</strong><small data-candidate-role>质量候选</small></button>
            </div>
            <div class="candidate-detail" data-candidate-detail hidden></div>
          </section>
          <article class="anatomy-stage anatomy-primary" data-anatomy-stage="primary">
            <span class="stage-index">04</span><span class="stage-label">主路由</span>
            <span class="route-status">已选择</span><h2 data-primary-name>Claude 3.7 Sonnet</h2>
            <dl><div><dt>score</dt><dd data-primary-score>94</dd></div><div><dt>p50</dt><dd data-primary-latency>612ms</dd></div><div><dt>availability</dt><dd data-primary-uptime>99.98%</dd></div></dl>
          </article>
          <article class="anatomy-stage anatomy-fallback" data-anatomy-stage="fallback">
            <span class="stage-index">05</span><span class="stage-label">备用路径</span>
            <span class="route-status secondary">已建立</span><h2 data-fallback-name>Gemini 2.5 Pro</h2><p data-fallback-role>低延迟备用</p>
          </article>
          <div class="request-thread" aria-hidden="true"><span></span><i></i></div>
          <footer class="anatomy-reason"><span>选择理由</span><strong data-routing-reason>综合质量、健康度、延迟与成本后的最高加权分</strong></footer>
        </div>
      </section>

      <section class="market-snapshot" aria-labelledby="market-title">
        <header><div><span>02 · Model market</span><h2 id="market-title">透明选择，从同一组指标开始。</h2><p>完整价格和性能指标只在这里集中呈现。</p></div><button class="button" type="button" data-route="#/models">查看全部模型</button></header>
        <div class="market-table" role="table" aria-label="模型市场快照">
          <div class="market-head" role="row"><span>模型</span><span>上下文</span><span>输入 / 1M</span><span>输出 / 1M</span><span>示例 p50</span><span>示例可用率</span></div>
          <div data-market-rows></div>
        </div>
      </section>

      <section class="failover-replay" aria-labelledby="failover-title">
        <header><span>03 · Failover replay</span><h2 id="failover-title">上游超时，请求仍然继续。</h2><p>主动回放一次确定性的主备切换过程。</p></header>
        <div class="failover-track">
          <article data-failover-primary><small>当前主路由</small><strong data-failover-primary-name>Claude 3.7 Sonnet</strong><span data-failover-primary-status>正常</span></article>
          <span class="failover-line" aria-hidden="true"></span>
          <article data-failover-fallback><small>备用路径</small><strong data-failover-fallback-name>Gemini 2.5 Pro</strong><span data-failover-fallback-status>待命</span></article>
          <article class="failover-result" aria-live="polite"><small>结果</small><strong data-failover-result>主路由正常，备用路径已建立</strong><span data-failover-latency>—</span></article>
        </div>
        <button class="button" type="button" data-failover-replay>模拟上游超时</button>
      </section>

      <section class="unified-interface" aria-labelledby="interface-title">
        <div><span>04 · Unified interface</span><h2 id="interface-title">一套请求格式，随时切换模型。</h2><p>复用熟悉的 OpenAI SDK，只替换 Base URL 和模型标识。</p><div class="interface-actions"><button class="button primary" type="button" data-route="#/console/keys">创建 API Key</button><button class="anatomy-text-link" type="button" data-route="#/docs">阅读接入文档 →</button></div></div>
        <div class="interface-code">
          <div class="home-code-tabs" role="tablist" aria-label="代码语言">
            <button role="tab" type="button" data-home-code-language="javascript" aria-selected="true">JavaScript</button>
            <button role="tab" type="button" data-home-code-language="python" aria-selected="false">Python</button>
            <button role="tab" type="button" data-home-code-language="curl" aria-selected="false">cURL</button>
            <button class="inline-copy" type="button" data-copy-home-code>复制代码</button>
          </div>
          <pre role="tabpanel" tabindex="0"><code data-home-code></code></pre>
        </div>
      </section>

      <section class="anatomy-final" aria-labelledby="final-title">
        <h2 id="final-title">从一个接口开始，让每次选择都有依据。</h2>
        <div><button class="button primary" type="button" data-route="#/console/keys">创建 API Key</button><button class="button" type="button" data-route="#/models">浏览全部模型</button></div>
      </section>
    </main>
    <footer class="anatomy-footer"><span>TokenFlux 请求剖面交互 Demo · 页面数据均为 Mock</span><nav><button type="button" data-route="#/docs">文档</button><button type="button" data-route="#/pricing">价格</button><button type="button" data-route="#/console">控制台</button></nav></footer>
  </div>
</template>
```

- [ ] **Step 3: Replace the active v7 homepage CSS block with the v8 scoped layer**

Replace the block beginning with `.routing-home {` at the current v7 line 4038 through the last `.routing-home` reduced-motion rule immediately before `</style>`. Put the Step 1 shared-frame overrides first, then the new `.anatomy-home` layer. Do not delete Customer variables at current lines 4016–4036 or any earlier deep-page/shared selectors.

Implement these layout contracts:

```css
.anatomy-home {
  --ah-paper: #fbfbf9;
  --ah-bg: #f4f6f8;
  --ah-panel: #ffffff;
  --ah-panel-muted: #f8fafb;
  --ah-panel-subtle: #fbfcfd;
  --ah-ink: #101828;
  --ah-ink-strong: #07090d;
  --ah-muted: #667085;
  --ah-muted-soft: #98a2b3;
  --ah-line: #e4e7ec;
  --ah-line-strong: #d9dee6;
  --ah-accent: #0fb477;
  --ah-accent-hover: #0aa668;
  --ah-accent-soft: #ecfdf3;
  --ah-accent-line: #abefc6;
  --ah-accent-ink: #067647;
  --ah-warning: #b54708;
  --ah-danger: #d92d20;
  color: var(--ah-ink);
  background: var(--ah-paper);
  font-variant-numeric: tabular-nums;
}
.anatomy-shell { width: min(calc(100% - 48px), 1280px); margin: 0 auto; }
.anatomy-hero { min-height: calc(900px - 104px); padding: 72px 0 48px; display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); align-content: start; gap: 34px 24px; }
.anatomy-intro { grid-column: 1 / 9; max-width: 840px; }
.anatomy-intro h1 { margin: 18px 0 20px; max-width: 12ch; font-size: clamp(64px, 5.2vw, 72px); line-height: .98; letter-spacing: -.035em; }
.mobile-route-summary { display: none; }
.anatomy-strategies { grid-column: 9 / 13; align-self: end; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.request-anatomy { grid-column: 1 / -1; position: relative; display: grid; grid-template-columns: 1.02fr .98fr 1.8fr 1.15fr 1.05fr; gap: 10px; min-height: 312px; }
.anatomy-stage { position: relative; z-index: 2; min-width: 0; padding: 18px; border: 1px solid var(--ah-line); background: var(--ah-panel); }
.request-thread { position: absolute; z-index: 1; inset: 50% 3% auto 3%; height: 1px; background: var(--ah-line-strong); }
.anatomy-home.is-thread-ready .request-thread span { transform: scaleX(1); }
.candidate-node.is-primary, .anatomy-primary { border-color: var(--ah-accent-line); background: var(--ah-accent-soft); }
.market-snapshot, .failover-replay, .unified-interface { padding: 112px 0; border-top: 1px solid var(--ah-line); }
.market-head, .market-row { display: grid; grid-template-columns: minmax(260px, 1.8fr) repeat(5, minmax(100px, .72fr)); align-items: center; }
.failover-replay { display: grid; grid-template-columns: minmax(280px, .72fr) minmax(0, 1.28fr); gap: 64px; }
.unified-interface { display: grid; grid-template-columns: minmax(0, .82fr) minmax(560px, 1.18fr); gap: 72px; }
.anatomy-final { min-height: 420px; display: grid; place-content: center; text-align: center; }
```

Use these additional exact state contracts:

```css
.anatomy-strategies button,
.candidate-node,
.home-code-tabs button,
.anatomy-text-link,
.anatomy-footer button {
  min-height: 44px;
}
.anatomy-strategies button[aria-pressed="true"],
.home-code-tabs button[aria-selected="true"] {
  border-color: var(--ah-accent-line);
  background: var(--ah-accent-soft);
  color: var(--ah-accent-ink);
}
.candidate-detail[hidden] { display: none; }
.candidate-detail {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid var(--ah-line);
  background: var(--ah-panel-muted);
}
.anatomy-home[data-failover-state="simulating"] [data-failover-primary] {
  border-color: #b54708;
}
.anatomy-home[data-failover-state="failed-over"] [data-failover-fallback],
.anatomy-home[data-failover-state="failed-over"] .market-row.is-recommended {
  border-color: var(--ah-accent-line);
  background: var(--ah-accent-soft);
}
.interface-code {
  overflow: hidden;
  border: 1px solid var(--ah-line-strong);
  border-radius: 14px;
  background: var(--ah-ink-strong);
  color: #ffffff;
}
.interface-code pre { min-height: 300px; margin: 0; padding: 28px; overflow: auto; }
.anatomy-home :focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgb(15 180 119 / 13%);
}
.anatomy-footer {
  display: flex;
  min-height: 88px;
  align-items: center;
  justify-content: space-between;
  padding: 24px max(24px, calc((100vw - 1280px) / 2));
  border-top: 1px solid var(--ah-line);
  color: var(--ah-muted);
}
```

Do not add a large outer card around `.request-anatomy`.

- [ ] **Step 4: Make the static checker pass for structure and frozen templates**

Run:

```bash
node /private/tmp/openrouter-request-anatomy-v8-static.mjs \
  .superpowers/brainstorm/93984-1787991725/content/openrouter-customer-routing-decision-v7.html \
  .superpowers/brainstorm/51334-1788079980/content/openrouter-customer-request-anatomy-v8.html
```

Expected: `Static invariants OK`.

### Task 3: Replace v7 homepage logic with one deterministic `homeState`

**Files:**
- Modify: `.superpowers/brainstorm/51334-1788079980/content/openrouter-customer-request-anatomy-v8.html`
- Modify: `/private/tmp/openrouter-request-anatomy-v8-static.mjs`

**Interfaces:**
- Consumes: `detailCatalog`, `codeExamples`, `setupCurrentPage(route)`, `clickHandler(event)`, shared `copyText()` and the Task 2 data attributes.
- Produces: `homeState`, `routingScenarios`, `resetHomeState()`, `renderRequestAnatomy()`, `setRoutingStrategy()`, `runFailoverReplay()`, `resetFailoverReplay()`, `renderMarketRecommendation()` and `setHomeCodeLanguage()`.

- [ ] **Step 1: Replace the old homepage variables and scenario map**

Remove `homeRouteFrame`, `activeRouteStrategy` and `routeStrategyData`. Add:

```js
var homeState = {
  routingStrategy: 'balanced',
  failoverState: 'idle',
  homeCodeLanguage: 'javascript',
  expandedCandidateId: '',
  failoverTimerIds: [],
  routeFrameIds: []
}

var routingScenarios = {
  balanced: {
    scores: { 'claude-3.7': 94, 'gemini-2.5': 89, 'deepseek-v3': 84, 'gpt-4.1': 86 },
    primary: 'claude-3.7',
    fallback: 'gemini-2.5',
    fallbackRole: '低延迟备用',
    reason: '综合质量、健康度、延迟与成本后的最高加权分',
    roles: { 'claude-3.7': '主路由', 'gemini-2.5': '低延迟备用', 'deepseek-v3': '成本候选', 'gpt-4.1': '质量候选' },
    failoverReason: 'Claude 3.7 Sonnet 超时，已切换至低延迟备用 Gemini 2.5 Pro'
  },
  fast: {
    scores: { 'claude-3.7': 82, 'gemini-2.5': 96, 'deepseek-v3': 87, 'gpt-4.1': 74 },
    primary: 'gemini-2.5',
    fallback: 'deepseek-v3',
    fallbackRole: '快速备用',
    reason: '当前候选中首 Token 延迟最低，并保留快速备用路径',
    roles: { 'claude-3.7': '稳定候选', 'gemini-2.5': '主路由', 'deepseek-v3': '快速备用', 'gpt-4.1': '待命' },
    failoverReason: 'Gemini 2.5 Pro 超时，已切换至快速备用 DeepSeek V3'
  },
  cost: {
    scores: { 'claude-3.7': 71, 'gemini-2.5': 86, 'deepseek-v3': 98, 'gpt-4.1': 63 },
    primary: 'deepseek-v3',
    fallback: 'gemini-2.5',
    fallbackRole: '低延迟备用',
    reason: '在健康阈值内选择当前预估成本最低的候选',
    roles: { 'claude-3.7': '质量候选', 'gemini-2.5': '低延迟备用', 'deepseek-v3': '主路由', 'gpt-4.1': '待命' },
    failoverReason: 'DeepSeek V3 超时，已切换至低延迟备用 Gemini 2.5 Pro'
  }
}
```

- [ ] **Step 2: Implement isolated lifecycle and rendering**

Add these functions:

```js
function clearHomeTimers() {
  homeState.failoverTimerIds.forEach(window.clearTimeout)
  homeState.routeFrameIds.forEach(window.cancelAnimationFrame)
  homeState.failoverTimerIds = []
  homeState.routeFrameIds = []
}

function resetHomeState() {
  clearHomeTimers()
  homeState.routingStrategy = 'balanced'
  homeState.failoverState = 'idle'
  homeState.homeCodeLanguage = 'javascript'
  homeState.expandedCandidateId = ''
}

function activeRoutingScenario() {
  return routingScenarios[homeState.routingStrategy] || routingScenarios.balanced
}

function rankedCandidateIds(scenario) {
  return Object.keys(scenario.scores).sort(function (left, right) {
    return scenario.scores[right] - scenario.scores[left]
  })
}

function renderRequestAnatomy() {
  var home = document.querySelector('.anatomy-home')
  if (!home) return
  var scenario = activeRoutingScenario()
  var primary = detailCatalog[scenario.primary]
  var fallback = detailCatalog[scenario.fallback]
  var ranks = rankedCandidateIds(scenario)

  home.setAttribute('data-primary-route', scenario.primary)
  home.setAttribute('data-failover-state', homeState.failoverState)
  home.querySelectorAll('[data-routing-strategy]').forEach(function (button) {
    var active = button.getAttribute('data-routing-strategy') === homeState.routingStrategy
    button.setAttribute('aria-pressed', active ? 'true' : 'false')
    button.classList.toggle('active', active)
  })
  home.querySelectorAll('[data-candidate-id]').forEach(function (button) {
    var id = button.getAttribute('data-candidate-id')
    button.classList.toggle('is-primary', id === scenario.primary)
    button.classList.toggle('is-fallback', id === scenario.fallback)
    button.querySelector('[data-candidate-score]').textContent = scenario.scores[id]
    button.querySelector('[data-candidate-rank]').textContent = '#' + (ranks.indexOf(id) + 1)
    button.querySelector('[data-candidate-role]').textContent = scenario.roles[id]
    button.setAttribute('aria-expanded', id === homeState.expandedCandidateId ? 'true' : 'false')
  })
  home.querySelector('[data-primary-name]').textContent = primary.name
  home.querySelector('[data-primary-score]').textContent = scenario.scores[scenario.primary]
  home.querySelector('[data-primary-latency]').textContent = primary.latency
  home.querySelector('[data-primary-uptime]').textContent = primary.uptime
  home.querySelector('[data-fallback-name]').textContent = fallback.name
  home.querySelector('[data-fallback-role]').textContent = scenario.fallbackRole
  home.querySelector('[data-mobile-primary]').textContent = primary.name
  home.querySelector('[data-mobile-fallback]').textContent = fallback.name
  home.querySelector('[data-routing-reason]').textContent = scenario.reason
  renderCandidateDetail()
  renderMarketRecommendation()
  renderFailoverState()
}
```

Implement `renderCandidateDetail()` so it reads `detailCatalog[homeState.expandedCandidateId]`, renders labels `成本`、`速度`、`稳定性`, and hides the detail block when no candidate is expanded.

```js
function renderCandidateDetail() {
  var detail = document.querySelector('[data-candidate-detail]')
  if (!detail) return
  var model = detailCatalog[homeState.expandedCandidateId]
  if (!model) {
    detail.hidden = true
    detail.textContent = ''
    return
  }
  detail.hidden = false
  detail.innerHTML =
    '<div><span>成本</span><strong>' + model.input + ' / ' + model.output + '</strong></div>' +
    '<div><span>速度</span><strong>' + model.latency + '</strong></div>' +
    '<div><span>稳定性</span><strong>' + model.uptime + '</strong></div>'
}
```

- [ ] **Step 3: Implement market rows from `detailCatalog`**

Use this fixed order:

```js
var homeMarketIds = ['claude-3.7', 'gpt-4.1', 'gemini-2.5', 'deepseek-v3', 'qwen-3', 'claude-haiku']
```

`renderMarketRecommendation()` creates or refreshes six keyboard-focusable rows with route destinations `#/models/claude-3.7`, `#/models/gpt-4.1`, `#/models/gemini-2.5`, `#/models/deepseek-v3`, `#/models/qwen-3` and `#/models/claude-haiku`, using the existing provider/name/context/input/output/latency/uptime fields plus a visible `推荐` or `已接管` label. In `failed-over`, highlight the fallback; otherwise highlight the strategy primary.

```js
function renderMarketRecommendation() {
  var container = document.querySelector('[data-market-rows]')
  if (!container) return
  var scenario = activeRoutingScenario()
  var recommendedId = homeState.failoverState === 'failed-over' ? scenario.fallback : scenario.primary
  container.innerHTML = homeMarketIds.map(function (id) {
    var model = detailCatalog[id]
    var recommended = id === recommendedId
    var recommendation = recommended
      ? '<em>' + (homeState.failoverState === 'failed-over' ? '已接管' : '推荐') + '</em>'
      : ''
    return '<div class="market-row' + (recommended ? ' is-recommended' : '') + '" role="row" tabindex="0" data-route="#/models/' + id + '">' +
      '<span class="market-model" role="cell"><b>' + model.name + '</b><small>' + model.provider + '</small>' + recommendation + '</span>' +
      '<span role="cell" data-label="上下文">' + model.context + '</span>' +
      '<span role="cell" data-label="输入 / 1M">' + model.input + '</span>' +
      '<span role="cell" data-label="输出 / 1M">' + model.output + '</span>' +
      '<span role="cell" data-label="示例 p50">' + model.latency + '</span>' +
      '<span role="cell" data-label="示例可用率">' + model.uptime + '</span>' +
      '</div>'
  }).join('')
}
```

- [ ] **Step 4: Implement failover state transitions**

Add:

```js
function resetFailoverReplay() {
  homeState.failoverTimerIds.forEach(window.clearTimeout)
  homeState.failoverTimerIds = []
  homeState.failoverState = 'idle'
  renderRequestAnatomy()
}

function setRoutingStrategy(strategy) {
  if (!routingScenarios[strategy]) return
  homeState.failoverTimerIds.forEach(window.clearTimeout)
  homeState.failoverTimerIds = []
  homeState.routingStrategy = strategy
  homeState.failoverState = 'idle'
  homeState.expandedCandidateId = ''
  renderRequestAnatomy()
}

function runFailoverReplay() {
  if (homeState.failoverState === 'simulating') return
  resetFailoverReplay()
  homeState.failoverState = 'simulating'
  renderRequestAnatomy()
  homeState.failoverTimerIds.push(window.setTimeout(function () {
    homeState.failoverState = 'failed-over'
    homeState.failoverTimerIds = []
    renderRequestAnatomy()
  }, 620))
}
```

`renderFailoverState()` uses `detailCatalog[fallback].latency`, adds `126`, and renders `551ms`, `646ms` or `551ms` for the three scenarios:

```js
function renderFailoverState() {
  var home = document.querySelector('.anatomy-home')
  if (!home) return
  var scenario = activeRoutingScenario()
  var primary = detailCatalog[scenario.primary]
  var fallback = detailCatalog[scenario.fallback]
  var button = home.querySelector('[data-failover-replay]')
  var primaryStatus = home.querySelector('[data-failover-primary-status]')
  var fallbackStatus = home.querySelector('[data-failover-fallback-status]')
  var result = home.querySelector('[data-failover-result]')
  var latency = home.querySelector('[data-failover-latency]')
  home.querySelector('[data-failover-primary-name]').textContent = primary.name
  home.querySelector('[data-failover-fallback-name]').textContent = fallback.name

  if (homeState.failoverState === 'simulating') {
    primaryStatus.textContent = '超时'
    fallbackStatus.textContent = '正在接管'
    result.textContent = '正在切换备用路径'
    latency.textContent = '—'
    button.textContent = '正在切换…'
    button.disabled = true
    return
  }
  if (homeState.failoverState === 'failed-over') {
    primaryStatus.textContent = '已超时'
    fallbackStatus.textContent = '已接管'
    result.textContent = scenario.failoverReason
    latency.textContent = String(Number(fallback.latency.replace('ms', '')) + 126) + 'ms'
    button.textContent = '重新播放'
    button.disabled = false
    return
  }
  primaryStatus.textContent = '正常'
  fallbackStatus.textContent = '待命'
  result.textContent = '主路由正常，备用路径已建立'
  latency.textContent = '—'
  button.textContent = '模拟上游超时'
  button.disabled = false
}
```

- [ ] **Step 5: Implement isolated homepage code tabs**

Add:

```js
function homeCodeText(language) {
  return codeExamples[language].replace(/__MODEL__/g, 'anthropic/claude-3.7-sonnet')
}

function setHomeCodeLanguage(language) {
  if (!codeExamples[language]) return
  homeState.homeCodeLanguage = language
  document.querySelectorAll('[data-home-code-language]').forEach(function (button) {
    var active = button.getAttribute('data-home-code-language') === language
    button.setAttribute('aria-selected', active ? 'true' : 'false')
    button.classList.toggle('active', active)
  })
  var code = document.querySelector('[data-home-code]')
  if (code) code.textContent = homeCodeText(language)
}
```

Do not mutate `codeExamples`. Keep the existing model-detail `[data-code-language]` and docs `[data-doc-language]` branches unchanged.

- [ ] **Step 6: Replace only the old homepage lifecycle/event branches**

In `setupCurrentPage(route)`:

```js
if (route === '#/home') {
  resetHomeState()
  renderRequestAnatomy()
  setHomeCodeLanguage('javascript')
  startRequestAnatomyAnimation()
} else {
  clearHomeTimers()
}
```

In `clickHandler(event)`, replace the old `[data-route-strategy]` branch with separate branches for:

```text
[data-routing-strategy]  -> reset failover, set strategy, render once
[data-candidate-id]      -> toggle expandedCandidateId, render once
[data-failover-replay]   -> runFailoverReplay()
[data-home-code-language] -> setHomeCodeLanguage()
[data-copy-home-code]    -> copyText(homeCodeText(homeState.homeCodeLanguage))
```

Remove `renderHomeRouteDecision()`, `startHomeRouteAnimation()`, `stopHomeRouteAnimation()` and their old event branch. Preserve all adjacent deep-page branches.

Add delegated candidate explanation behavior:

```js
document.addEventListener('pointerover', function (event) {
  if (event.pointerType && event.pointerType !== 'mouse') return
  var candidate = event.target.closest('[data-candidate-id]')
  if (!candidate) return
  homeState.expandedCandidateId = candidate.getAttribute('data-candidate-id')
  renderCandidateDetail()
})

document.addEventListener('focusin', function (event) {
  var candidate = event.target.closest('[data-candidate-id]')
  if (!candidate) return
  homeState.expandedCandidateId = candidate.getAttribute('data-candidate-id')
  renderCandidateDetail()
})
```

The click branch keeps the same candidate open on hover-capable mouse devices and toggles `expandedCandidateId` on touch devices detected through `matchMedia('(hover: none)').matches`. Each render synchronizes `aria-expanded`.

In the existing document `keydown` listener, add only these branches before the generic route-row branch:

```js
if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.market-row[role="row"][data-route]')) {
  event.preventDefault()
  navigate(event.target.getAttribute('data-route'))
  return
}
if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && event.target.matches('[data-home-code-language]')) {
  event.preventDefault()
  var homeTabs = Array.from(document.querySelectorAll('[data-home-code-language]'))
  var homeTabIndex = homeTabs.indexOf(event.target)
  var homeDirection = event.key === 'ArrowRight' ? 1 : -1
  var nextHomeTab = homeTabs[(homeTabIndex + homeDirection + homeTabs.length) % homeTabs.length]
  nextHomeTab.focus()
  nextHomeTab.click()
  return
}
```

Do not change the existing detail-tab arrow handling, command shortcut, Escape handling or deep-page keyboard routes.

- [ ] **Step 7: Strengthen and run static assertions**

Extend the static checker to reject:

```js
for (const retired of [
  'var activeRouteStrategy',
  'var routeStrategyData',
  'function renderHomeRouteDecision',
  'function startHomeRouteAnimation',
  'function stopHomeRouteAnimation'
]) {
  if (candidate.includes(retired)) throw new Error(`Retired homepage logic remains: ${retired}`)
}
```

Run the checker and JavaScript syntax check. Expected: both exit 0.

### Task 4: Implement responsive, motion and accessibility contracts

**Files:**
- Modify: `.superpowers/brainstorm/51334-1788079980/content/openrouter-customer-request-anatomy-v8.html`

**Interfaces:**
- Consumes: Task 2 DOM and Task 3 state attributes.
- Produces: desktop horizontal thread, tablet two-row anatomy, mobile summary plus vertical five-step thread, visible focus, reduced motion and no page overflow.

- [ ] **Step 1: Add explicit desktop/tablet/mobile breakpoints**

Implement:

```css
@media (max-width: 1199px) {
  .anatomy-shell { width: min(calc(100% - 40px), 1080px); }
  .anatomy-intro { grid-column: 1 / 9; }
  .anatomy-strategies { grid-column: 9 / 13; }
  .request-anatomy { grid-template-columns: 1fr 1fr 1.7fr; }
  .anatomy-primary, .anatomy-fallback { grid-row: 2; }
  .anatomy-primary { grid-column: 2; }
  .anatomy-fallback { grid-column: 3; }
}
@media (max-width: 959px) {
  .anatomy-hero { display: block; min-height: 0; padding-top: 64px; }
  .anatomy-strategies { margin: 36px 0 20px; }
  .request-anatomy { display: grid; grid-template-columns: 1fr 1fr; }
  .anatomy-score { grid-column: 1 / -1; }
  .failover-replay, .unified-interface { grid-template-columns: 1fr; gap: 36px; }
  .market-head { display: none; }
  .market-row { grid-template-columns: minmax(0, 1fr) auto; }
}
@media (max-width: 767px) {
  .anatomy-shell { width: min(calc(100% - 28px), 640px); }
  .anatomy-intro h1 { max-width: 10ch; font-size: clamp(40px, 11.2vw, 44px); }
  .anatomy-actions { align-items: stretch; }
  .anatomy-actions .button { width: 100%; min-height: 48px; }
  .anatomy-text-link { min-height: 44px; }
  .request-anatomy { display: flex; flex-direction: column; padding-left: 28px; }
  .request-thread { inset: 16px auto 16px 10px; width: 1px; height: auto; }
  .anatomy-stage { min-height: auto; }
  .candidate-stack { display: grid; grid-template-columns: 1fr 1fr; }
  .mobile-route-summary { display: grid; }
  .market-row { padding: 18px 0; }
  .anatomy-final { min-height: 360px; }
}
@media (max-height: 500px) and (orientation: landscape) {
  .anatomy-hero { min-height: 0; padding-block: 40px; }
  .anatomy-intro h1 { font-size: 48px; }
}
```

Keep `.mobile-route-summary` hidden above `767px` and display it below that breakpoint. Its `data-mobile-primary` and `data-mobile-fallback` fields are updated by `renderRequestAnatomy()`; it must not maintain separate state.

- [ ] **Step 2: Add visible focus and touch-safe candidate expansion**

All strategy buttons, candidate nodes, code tabs, model rows, replay, CTA and footer links use `:focus-visible` with `0 0 0 3px rgb(15 180 119 / 13%)`. Candidate nodes remain native buttons and expose `aria-expanded`; expanded details remain visible after touch until another candidate is selected.

- [ ] **Step 3: Add reduced-motion behavior**

```css
@media (prefers-reduced-motion: reduce) {
  .anatomy-home *, .anatomy-home *::before, .anatomy-home *::after {
    scroll-behavior: auto !important;
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
  .request-thread span { transform: scaleX(1) !important; }
}
```

`startRequestAnatomyAnimation()` uses:

```js
function startRequestAnatomyAnimation() {
  var home = document.querySelector('.anatomy-home')
  if (!home) return
  home.classList.remove('is-thread-ready')
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    home.classList.add('is-thread-ready')
    return
  }
  var firstFrame = window.requestAnimationFrame(function () {
    var secondFrame = window.requestAnimationFrame(function () {
      home.classList.add('is-thread-ready')
      homeState.routeFrameIds = []
    })
    homeState.routeFrameIds.push(secondFrame)
  })
  homeState.routeFrameIds.push(firstFrame)
}
```

- [ ] **Step 4: Run static checks and inspect scoped color declarations**

Run:

```bash
node /private/tmp/openrouter-request-anatomy-v8-static.mjs \
  .superpowers/brainstorm/93984-1787991725/content/openrouter-customer-routing-decision-v7.html \
  .superpowers/brainstorm/51334-1788079980/content/openrouter-customer-request-anatomy-v8.html

rg -n '#[0-9a-fA-F]{3,8}|rgb\(' \
  .superpowers/brainstorm/51334-1788079980/content/openrouter-customer-request-anatomy-v8.html
```

Expected: static checks pass. Manually inspect only the final `.anatomy-home`/shared-frame layer against the approved Customer values; do not rewrite frozen v7 historical literals.

### Task 5: Add browser regressions and validate frozen behavior

**Files:**
- Create: `/private/tmp/openrouter-request-anatomy-v8-cdp.mjs`
- Modify: `.superpowers/brainstorm/51334-1788079980/content/openrouter-customer-request-anatomy-v8.html` only when a verified browser defect is found.

**Interfaces:**
- Consumes: live preview URL, an isolated Edge CDP endpoint and the completed v8 artifact.
- Produces: deterministic evidence for new homepage behavior and all frozen routes/interactions.

- [ ] **Step 1: Start isolated Edge CDP**

Run Edge with a fresh temporary profile and remote debugging port `9333`:

```bash
open -na "Microsoft Edge" --args \
  --remote-debugging-port=9333 \
  --user-data-dir=/private/tmp/tokenflux-openrouter-v8-edge \
  --no-first-run \
  --no-default-browser-check
```

Expected: `curl -s http://127.0.0.1:9333/json/version` returns browser metadata and a `webSocketDebuggerUrl`.

- [ ] **Step 2: Create the Bun CDP suite**

The script must:

1. Create a new page with a `PUT` request to `http://127.0.0.1:9333/json/new?http%3A%2F%2Flocalhost%3A49946%2F%3Fkey%3D713940f9565a195b85b1fe13c0fe326f371291efebfd206bf2165f97127f35e2%23%2Fhome`.
2. Enable `Page`, `Runtime`, `Network` and `Log`.
3. Record console exceptions and failed network requests.
4. Verify initial `balanced` state: Claude `94`, Gemini fallback and synchronized `aria-pressed`.
5. Switch to `fast`: Gemini `96`, DeepSeek fallback, market highlight Gemini.
6. Switch to `cost`: DeepSeek `98`, Gemini fallback.
7. Expand a candidate and verify `aria-expanded`, price, latency and availability labels.
8. Trigger failover and wait until `failed-over`; verify `551ms` or `646ms`, reason text, button `重新播放` and market highlight fallback.
9. Verify JavaScript, Python and cURL home tabs, then copy feedback.
10. Navigate through every route and model-detail ID plus the compatibility alias.
11. Verify models search/filter/sort/view/compare, detail tabs/estimator/code tabs, rankings periods, docs code tabs, Mock Key creation/search, command search/Escape, modal focus restoration and mobile menu.
12. Navigate away during `simulating`, return to home and verify reset to balanced/idle/JavaScript/no expanded candidate.
13. Assert there are no application `fetch`/XHR/WebSocket/SSE requests, JavaScript exceptions or new 404s.

Use a small `CdpClient` class with a monotonically increasing command ID, pending promise map, `send(method, params)`, `evaluate(expression)`, `click(selector)`, `type(selector, text)` and `waitFor(expression, timeoutMs)`.

- [ ] **Step 3: Run the suite**

Run:

```bash
bun /private/tmp/openrouter-request-anatomy-v8-cdp.mjs
```

Expected: one `PASS` line per scenario and final `All v8 interaction regressions passed`.

- [ ] **Step 4: Fix only proven defects and rerun**

For each failure, reproduce it with a narrowed CDP expression, patch only the v8 file, rerun the static checker, then rerun the complete CDP suite. Do not modify frozen templates to satisfy a homepage test.

### Task 6: Run visual, viewport and reduced-motion audits

**Files:**
- Create: `/private/tmp/openrouter-request-anatomy-v8-visual.mjs`
- Create: `/private/tmp/openrouter-request-anatomy-v8-reduced-motion.mjs`
- Create: `/private/tmp/openrouter-request-anatomy-v8-shots/`
- Modify: `.superpowers/brainstorm/51334-1788079980/content/openrouter-customer-request-anatomy-v8.html` only for verified visual defects.

**Interfaces:**
- Consumes: passing static and interaction checks.
- Produces: screenshot evidence at seven target viewports, overflow/page-height measurements, first-viewport assertions and reduced-motion verification.

- [ ] **Step 1: Capture required viewport evidence**

Use CDP `Emulation.setDeviceMetricsOverride` and `Page.captureScreenshot` for:

```text
1440 × 900
1280 × 800
1024 × 768
768 × 1024
390 × 844
375 × 812
844 × 390
```

Save full-page PNG files under `/private/tmp/openrouter-request-anatomy-v8-shots/` with semantic names.

- [ ] **Step 2: Assert layout metrics in every viewport**

For every viewport assert:

```js
document.documentElement.scrollWidth <= document.documentElement.clientWidth
```

Also assert no visible interactive element has a bounding box narrower or shorter than `44px`, except inline text links explicitly allowed by the spec. At `1440 × 900`, assert `scrollHeight >= 2400 && scrollHeight <= 2700`.

At `390 × 844` and `375 × 812`, assert the brand, `#home-title`, primary CTA, `[data-mobile-primary]` and `[data-mobile-fallback]` bottom edges are within the first viewport.

- [ ] **Step 3: Visually inspect the screenshots**

Inspect the seven screenshots and specifically reject:

- a left-copy/right-dashboard Hero;
- an outer rounded SaaS card around the full request thread;
- clipped candidate labels or model metrics;
- repeated card-grid rhythm;
- unreadable mobile data;
- missing main/fallback summary;
- large empty gaps that push `scrollHeight` above target;
- any dark full-width marketing section;
- colors outside the approved homepage palette.

- [ ] **Step 4: Verify reduced motion**

Use CDP `Emulation.setEmulatedMedia` with `features: [{name: 'prefers-reduced-motion', value: 'reduce'}]`, reload home, and assert `.anatomy-home.is-thread-ready` is present immediately and no active CSS animation has a duration above `0.01ms`.

- [ ] **Step 5: Iterate until the visual audit passes**

Patch only the scoped v8 homepage layer, rerun static checks, CDP regressions and all seven screenshots after each visual correction. Stop only when all automated assertions pass and the screenshots satisfy the approved hierarchy.

### Task 7: Final verification and preview handoff

**Files:**
- Verify: `.superpowers/brainstorm/51334-1788079980/content/openrouter-customer-request-anatomy-v8.html`
- Verify: `docs/superpowers/specs/2026-08-30-openrouter-request-anatomy-demo-design.md`

**Interfaces:**
- Consumes: completed v8 Demo and all disposable checks.
- Produces: a live, user-reviewable Demo without changing tracked product code.

- [ ] **Step 1: Run the full verification chain**

```bash
node /private/tmp/openrouter-request-anatomy-v8-static.mjs \
  .superpowers/brainstorm/93984-1787991725/content/openrouter-customer-routing-decision-v7.html \
  .superpowers/brainstorm/51334-1788079980/content/openrouter-customer-request-anatomy-v8.html

bun /private/tmp/openrouter-request-anatomy-v8-cdp.mjs

bun /private/tmp/openrouter-request-anatomy-v8-visual.mjs

bun /private/tmp/openrouter-request-anatomy-v8-reduced-motion.mjs
```

Expected: all checks pass.

- [ ] **Step 2: Verify the live preview server and artifact**

Run:

```bash
test -f .superpowers/brainstorm/51334-1788079980/state/server-info
test ! -f .superpowers/brainstorm/51334-1788079980/state/server-stopped
shasum -a 256 .superpowers/brainstorm/51334-1788079980/content/openrouter-customer-request-anatomy-v8.html
```

Record the final digest and confirm the complete preview URL remains:

```text
http://localhost:49946/?key=713940f9565a195b85b1fe13c0fe326f371291efebfd206bf2165f97127f35e2
```

- [ ] **Step 3: Verify Git isolation**

Run:

```bash
git status --short --branch
git diff --cached --name-status
```

Expected: no `.superpowers/` artifact is staged or committed, and no user-owned dirty file was modified by this implementation.

- [ ] **Step 4: Present the Demo for user review**

Report the semantic v8 filename, final SHA-256, verification results and the full keyed preview URL. Ask the user to inspect the homepage, strategy switching, failover replay and one secondary/tertiary route before requesting visual changes.
