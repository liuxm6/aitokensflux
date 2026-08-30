# OpenRouter V6 Polish Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于已确认的 V6 基线制作一个更紧凑、精致、响应式完整的交互 Demo，同时逐字保留全部页面 DOM、路由、JavaScript、Mock 数据与 Customer 色系。

**Architecture:** 先复制 V6 为新的语义化产物，再只在 `<head>` 末尾追加一层 scoped CSS override。静态守卫把整个 `<body>` 与 V6 基线逐字比较，因此首页 DOM、二三级模板和 JavaScript 都无法被误改；浏览器回归在隔离 Edge Profile 中验证所有交互与六个视口。

**Tech Stack:** 单文件 HTML/CSS/JavaScript Demo、Node/Bun 静态检查、Edge CDP、Visual Companion 本地预览。

## Global Constraints

- 唯一输入基线：`.superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6.html`
- 基线 SHA-256：`10aaa4fb35aa6780c57adb09c24ca003bbcb39d12c0e738d9e68782b6803aa58`
- 输出：`.superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6-polished.html`
- 不覆盖原 V6、版本画廊归档或任何已展示文件。
- 不修改 `web/customer/`、`web/openrouter/`、后端、数据库、Docker、CI 或生产配置。
- 整个 `<body>` 必须与 V6 基线逐字一致；只允许在 `<head>` 追加 scoped CSS。
- 不增加或改变路由、Hash 别名、导航目标、控件、文案、Mock 数值、状态转换或 JavaScript。
- 不增加 Chat Playground、真实请求、`fetch`、XHR、Axios、应用 WebSocket、SSE、远程字体或远程图片。
- 新 override 不写任何颜色字面量，只复用 V6 已有 CSS 变量；深色表面仍只存在于 Quickstart 与代码窗口。
- `.superpowers/` Demo 与 `/private/tmp` 检查脚本不得提交。
- 浏览器验证必须使用新建、禁用扩展的隔离 Profile，禁止连接用户真实 Edge Profile。

---

### Task 1: 创建隔离产物与静态守卫

**Files:**
- Create: `.superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6-polished.html`
- Create: `/private/tmp/openrouter-v6-polish-static.mjs`

**Interfaces:**
- Consumes: V6 基线文件与固定 SHA-256。
- Produces: 与 V6 完全相同的初始候选文件；后续任务依赖静态守卫验证 `<body>` 冻结、无新增颜色字面量和无网络能力。

- [ ] **Step 1: 写静态守卫**

```js
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash } from 'node:crypto'

const baselinePath = '/Users/ouyeel/work/code/tokenflux/.superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6.html'
const candidatePath = '/Users/ouyeel/work/code/tokenflux/.superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6-polished.html'
const expectedBaselineSha = '10aaa4fb35aa6780c57adb09c24ca003bbcb39d12c0e738d9e68782b6803aa58'

const sha256 = (value) => createHash('sha256').update(value).digest('hex')
const baseline = fs.readFileSync(baselinePath, 'utf8')
const candidate = fs.readFileSync(candidatePath, 'utf8')
const baselineBody = baseline.slice(baseline.indexOf('<body>'))
const candidateBody = candidate.slice(candidate.indexOf('<body>'))
const marker = '/* V6 POLISH: approved presentation-only overrides. */'

assert.equal(sha256(baseline), expectedBaselineSha, 'V6 baseline SHA changed')
assert.equal(candidateBody, baselineBody, 'candidate body, templates, or JavaScript changed')
assert.ok(candidate.includes(marker), 'polish override marker missing')

const overrideStart = candidate.indexOf(marker)
const overrideEnd = candidate.indexOf('</style>', overrideStart)
assert.ok(overrideStart >= 0 && overrideEnd > overrideStart, 'polish override block missing')
const override = candidate.slice(overrideStart, overrideEnd)

assert.equal(/#[0-9a-f]{3,8}\b/i.test(override), false, 'new hex color found')
assert.equal(/\b(?:rgb|rgba|hsl|hsla|oklch)\(/i.test(override), false, 'new functional color found')
assert.equal(/https?:\/\//i.test(override), false, 'remote asset URL found')

for (const forbidden of ['fetch(', 'XMLHttpRequest', 'axios', 'new WebSocket', 'EventSource', 'Chat Playground']) {
  assert.equal(candidate.includes(forbidden), false, `forbidden capability found: ${forbidden}`)
}

console.log('V6 polish static invariants OK')
```

- [ ] **Step 2: 运行守卫并确认候选文件尚不存在**

Run:

```bash
node /private/tmp/openrouter-v6-polish-static.mjs
```

Expected: FAIL with `ENOENT` for `openrouter-customer-premium-v6-polished.html`.

- [ ] **Step 3: 复制固定 V6 基线**

Run:

```bash
cp .superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6.html .superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6-polished.html
```

- [ ] **Step 4: 再次运行守卫并确认缺少精修层**

Run:

```bash
node /private/tmp/openrouter-v6-polish-static.mjs
```

Expected: FAIL with `polish override marker missing`，证明守卫能区分未修改的复制品。

---

### Task 2: 完成桌面 V6 精修层

**Files:**
- Modify: `.superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6-polished.html` immediately before `</head>`
- Test: `/private/tmp/openrouter-v6-polish-static.mjs`

**Interfaces:**
- Consumes: Task 1 的候选文件与静态守卫。
- Produces: Hero、路由轨迹、指标、能力矩阵、模型账本和 Quickstart 的桌面精修 CSS；不产生 DOM 或脚本变化。

- [ ] **Step 1: 在 `</head>` 前追加精修样式块**

```html
<style>
  /* V6 POLISH: approved presentation-only overrides. */
  @media (min-width: 768px) {
  .premium-hero {
    min-height: 600px;
  }

  .premium-hero-copy {
    width: min(100%, 900px);
    padding-bottom: 124px;
  }

  .premium-overline {
    margin-bottom: 16px;
  }

  .premium-title {
    max-width: 840px;
    margin-bottom: 18px;
    font-size: clamp(60px, 5.4vw, 68px);
    font-weight: 740;
    line-height: 1.01;
    letter-spacing: -0.052em;
  }

  .premium-subtitle {
    font-size: 16px;
    line-height: 1.7;
  }

  .premium-actions {
    margin-top: 24px;
  }

  .route-field {
    inset: 16px 0 0;
  }

  .route-field::before {
    top: 20px;
    bottom: 36px;
    background-size: 72px 72px;
    opacity: 0.25;
  }

  .route-trace {
    stroke-width: 1.15;
    opacity: 0.68;
  }

  .route-trace:nth-of-type(3) {
    stroke: var(--accent);
    stroke-width: 1.6;
    opacity: 0.92;
  }

  .route-origin {
    top: 60.5%;
    box-shadow: var(--shadow);
  }

  .provider-a { top: 84.8%; }
  .provider-o { top: 88.2%; }
  .provider-g { top: 91%; }
  .provider-d { top: 88.2%; }
  .provider-q { top: 84.8%; }

  .provider-g {
    border-color: var(--accent);
    background: var(--accent-faint);
    color: var(--accent-soft);
  }

  .provider-g::after {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-faint);
    content: '';
  }

  .signal-track {
    margin: -1px 0 58px;
  }

  .signal-track::before {
    top: -58px;
    height: 58px;
  }

  .signal-item {
    min-height: 92px;
    padding: 18px 24px;
  }

  .signal-item b {
    font-size: 21px;
  }

  .signal-item span {
    font-size: 12px;
  }

  .capability-mosaic {
    gap: 18px;
    padding-bottom: 76px;
  }

  .capability-mosaic::before {
    top: -58px;
    height: 42px;
  }

  .capability-panel {
    min-height: 342px;
    gap: 22px;
    padding: 30px;
  }

  .capability-copy h2 {
    margin-bottom: 12px;
    line-height: 1.16;
  }

  .capability-copy p {
    margin-bottom: 20px;
    font-size: 14px;
    line-height: 1.65;
  }

  .capability-copy button {
    min-height: 44px;
  }

  .access-interface code,
  .routing-interface .routing-head,
  .economics-interface b,
  .economics-interface span,
  .policy-interface > div b {
    font-size: 10px;
  }

  .access-interface span,
  .routing-interface > div,
  .policy-interface > div,
  .policy-interface p,
  .policy-interface strong {
    font-size: 11px;
  }

  .routing-interface > div {
    min-height: 46px;
  }

  .premium-models {
    padding: 62px 0 72px;
  }

  .premium-section-head {
    margin-bottom: 22px;
  }

  .premium-section-head h2 {
    font-size: clamp(30px, 2.8vw, 40px);
  }

  .ledger-model {
    padding: 18px 18px 16px;
  }

  .ledger-model p b {
    font-size: 14px;
  }

  .ledger-model p small,
  .ledger-model dt {
    font-size: 10px;
  }

  .ledger-model dl {
    margin-top: 18px;
    padding-top: 12px;
  }

  .ledger-model dd,
  .ledger-model > em {
    font-size: 11px;
  }

  .ledger-model > em {
    margin-top: 9px;
  }

  .quickstart-stage {
    grid-template-columns: minmax(0, 0.72fr) minmax(0, 1fr);
    gap: 44px;
    margin-bottom: 72px;
    padding: 42px;
  }

  .quickstart-copy h2 {
    font-size: clamp(30px, 2.8vw, 40px);
  }

  .quickstart-copy p {
    margin-bottom: 22px;
  }

  .quickstart-stage pre {
    line-height: 1.7;
  }
  }
</style>
```

- [ ] **Step 2: 运行静态守卫**

Run:

```bash
node /private/tmp/openrouter-v6-polish-static.mjs
```

Expected: `V6 polish static invariants OK`.

- [ ] **Step 3: 检查候选文件空白与基线隔离**

Run:

```bash
git diff --check --no-index .superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6.html .superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6-polished.html
```

Expected: only the appended `<style>` block differs; no whitespace errors.

---

### Task 3: 完成平板、移动端与 Reduced Motion 精修

**Files:**
- Modify: `.superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6-polished.html` inside the appended polish `<style>` block
- Test: `/private/tmp/openrouter-v6-polish-static.mjs`

**Interfaces:**
- Consumes: Task 2 的桌面精修层。
- Produces: 2×2 平板能力区、移动端五 Provider 3+2 路由图、44px 搜索入口、横屏压缩与 Reduced Motion 最终态。

- [ ] **Step 1: 在精修样式块末尾追加响应式规则**

```css
@media (max-width: 1179px) {
  .premium-hero {
    min-height: 580px;
  }

  .premium-hero-copy {
    padding-bottom: 136px;
  }

  .capability-panel {
    min-height: 0;
    gap: 20px;
    padding: 26px;
  }

  .routing-interface,
  .economics-interface {
    align-self: stretch;
    margin-top: 4px;
  }

  .quickstart-stage {
    gap: 32px;
    padding: 34px;
  }
}

@media (max-width: 900px) {
  .header-search {
    width: 44px;
    min-width: 44px;
    height: 44px;
    justify-content: center;
    margin-left: auto;
    padding: 0;
  }

  .header-search span:not(:first-child) {
    display: none;
  }
}

@media (max-width: 767px) {
  .premium-hero {
    min-height: 580px;
  }

  .premium-hero-copy {
    padding-bottom: 168px;
  }

  .premium-title {
    max-width: 520px;
    font-size: clamp(40px, 11.4vw, 44px);
    line-height: 1.04;
  }

  .premium-subtitle {
    font-size: 15px;
    line-height: 1.65;
  }

  .premium-actions {
    gap: 10px;
    margin-top: 22px;
  }

  .route-field svg {
    display: none;
  }

  .route-field::before {
    display: block;
    inset: 0;
    width: auto;
    height: auto;
    background:
      linear-gradient(var(--border-strong), var(--border-strong)) 50% 68% / 1px 8% no-repeat,
      linear-gradient(var(--border-strong), var(--border-strong)) 50% 76% / 60% 1px no-repeat,
      linear-gradient(var(--border-strong), var(--border-strong)) 50% 76% / 1px 12% no-repeat,
      linear-gradient(var(--border-strong), var(--border-strong)) 50% 88% / 28% 1px no-repeat;
    content: '';
    mask-image: none;
    opacity: 1;
  }

  .route-origin {
    top: 64%;
  }

  .route-provider,
  .route-provider:not(.provider-g) {
    display: flex;
    min-width: 74px;
    height: 42px;
    justify-content: center;
  }

  .provider-a { top: 80%; left: 22%; }
  .provider-o { top: 80%; left: 50%; }
  .provider-g { top: 80%; left: 78%; }
  .provider-d { top: 92%; left: 37%; }
  .provider-q { top: 92%; left: 63%; }

  .signal-track {
    margin-bottom: 48px;
  }

  .signal-item {
    min-height: 88px;
    padding: 16px;
  }

  .capability-mosaic {
    gap: 12px;
    padding-bottom: 58px;
  }

  .capability-panel {
    padding: 22px;
  }

  .premium-models {
    padding: 52px 0 58px;
  }

  .quickstart-stage {
    gap: 26px;
    margin-bottom: 58px;
    padding: 26px 22px;
  }
}

@media (max-width: 420px) {
  .premium-hero {
    min-height: 570px;
  }

  .premium-hero-copy {
    padding-bottom: 176px;
  }

  .premium-title {
    max-width: 350px;
    font-size: 40px;
  }

  .route-provider,
  .route-provider:not(.provider-g) {
    width: 42px;
    min-width: 42px;
    padding: 0;
  }

  .route-provider small {
    display: none;
  }
}

@media (max-height: 500px) and (min-width: 700px) and (max-width: 900px) {
  .premium-hero {
    min-height: 500px;
  }

  .premium-hero-copy {
    padding-bottom: 132px;
  }

  .premium-title {
    font-size: 46px;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .capability-panel,
  .ledger-model,
  .capability-copy button::after {
    transition: none;
  }
}
```

- [ ] **Step 2: 运行静态守卫**

Run:

```bash
node /private/tmp/openrouter-v6-polish-static.mjs
```

Expected: `V6 polish static invariants OK`.

- [ ] **Step 3: 确认候选 `<body>` 与基线逐字一致**

Run:

```bash
node -e "const fs=require('fs');const a=fs.readFileSync('.superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6.html','utf8');const b=fs.readFileSync('.superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6-polished.html','utf8');const body=s=>s.slice(s.indexOf('<body>'));if(body(a)!==body(b))process.exit(1);console.log('BODY IDENTICAL')"
```

Expected: `BODY IDENTICAL`.

---

### Task 4: 发布隔离预览并运行完整浏览器回归

**Files:**
- Create: `.superpowers/brainstorm/51008-1788097225/content/openrouter-customer-premium-v6-polished-preview.html`
- Create: `/private/tmp/openrouter-v6-polish-cdp.mjs`
- Modify from copy: `/private/tmp/openrouter-request-anatomy-v8-cdp.mjs`

**Interfaces:**
- Consumes: Task 3 候选文件和现有 951 行 CDP suite。
- Produces: Visual Companion 可访问预览与 8 场景 V6 功能回归报告。

- [ ] **Step 1: 复制候选文件到当前预览目录**

Run:

```bash
cp .superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6-polished.html .superpowers/brainstorm/51008-1788097225/content/openrouter-customer-premium-v6-polished-preview.html
```

- [ ] **Step 2: 复用 CDP 监控骨架并改为 V6 的 8 个场景**

```js
const sessionKey = '74239a63946439cbb8104f9d2d62024310b3c8c7c54a8f4c12225f186532a226'
const cdpPort = process.env.CDP_PORT ?? '9444'
const previewUrl = `http://localhost:60086/?key=${sessionKey}#/home`
const createTargetUrl = `http://127.0.0.1:${cdpPort}/json/new?${encodeURIComponent(previewUrl)}`
const sourcePath = '/Users/ouyeel/work/code/tokenflux/.superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6-polished.html'
const cdpHttpOrigin = `http://127.0.0.1:${cdpPort}`
```

保留原 suite 的 CDP client、受监控 reload、Runtime/Log/Network 诊断、有限超时、焦点与点击辅助函数；把 `.anatomy-home` readiness 改为 `.premium-home`，删除 V8 专属策略、候选、Failover 和首页代码标签场景。V6 suite 固定为以下 8 个场景：

```js
const scenarios = [
  'CDP boot, isolated Edge, and artifact network-primitives audit',
  'V6 home structure, five providers, CTA and route-connected final state',
  'home capability, model ledger, and Quickstart navigation targets',
  'all static routes, eight detail IDs, alias, and unknown hash',
  'models search, filters, sort, views, and three-model comparison',
  'detail tabs, estimator, code tabs, and copy',
  'rankings, docs, Mock Key, command search, and focus restoration',
  'mobile menu, diagnostics, exact Companion socket, and zero application requests',
]
```

场景 2 必须断言 `.route-provider` 为 5 个、名称依次包含 `Anthropic/OpenAI/Google/DeepSeek/Qwen`、两个 Hero CTA 的 `data-route` 分别为 `#/console/keys` 和 `#/models`，并在动画完成后确认 `.premium-home.route-connected` 存在。场景 3 必须逐一点击四个能力入口、四个模型账本条目和 Quickstart 两个按钮，并断言对应 Hash；每次点击后返回 `#/home`。场景 4–7 复用原 suite 已验证通过的 V6 共享模板断言。场景 8 在 `390×844` 验证移动菜单与五个可见 Provider 节点，再运行完整诊断。

- [ ] **Step 3: 启动全新隔离 Edge Profile**

Run:

```bash
TASK_V6_EDGE_PROFILE=$(mktemp -d /private/tmp/tokenflux-openrouter-v6-edge.XXXXXX)
'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge' --remote-debugging-port=9444 --user-data-dir="$TASK_V6_EDGE_PROFILE" --disable-extensions --disable-component-extensions-with-background-pages --disable-background-networking --no-first-run --no-default-browser-check about:blank
```

Expected: `http://127.0.0.1:9444/json/list` 只出现该临时 Profile 的空白页，不出现扩展、用户页面或登录态。

- [ ] **Step 4: 运行 CDP suite**

Run:

```bash
CDP_PORT=9444 bun /private/tmp/openrouter-v6-polish-cdp.mjs
```

Expected: 8/8 PASS；应用异步请求 0、异常 0、Log 错误 0、404 为 0。

---

### Task 5: 六视口视觉审计与修复循环

**Files:**
- Create: `/private/tmp/openrouter-v6-polish-visual.mjs`
- Create: `/private/tmp/openrouter-v6-polish-shots/*.png`
- Modify if needed: `.superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6-polished.html`
- Sync after every fix: `.superpowers/brainstorm/51008-1788097225/content/openrouter-customer-premium-v6-polished-preview.html`

**Interfaces:**
- Consumes: Task 4 的隔离 Edge 和预览 URL。
- Produces: 六视口截图、布局测量和完成视觉审计的最终候选。

- [ ] **Step 1: 捕获指定视口截图与布局指标**

视口必须固定为：

```js
const viewports = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1180x820', width: 1180, height: 820 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'mobile-375x812', width: 375, height: 812 },
  { name: 'mobile-landscape-844x390', width: 844, height: 390 },
]
```

每个视口记录：`document.documentElement.scrollWidth`、`clientWidth`、`scrollHeight`、Hero 标题行数、所有可见按钮最小尺寸及首页关键区块矩形。

- [ ] **Step 2: 验证布局合同**

Expected:

```text
scrollWidth === clientWidth
桌面 Hero 标题行数 <= 2
390×844 完整显示品牌、标题、说明、双 CTA 和路由核心结果
所有主要可见点击目标 >= 44×44px
五个 Provider 节点在 <=420px 均可见
平板四张能力卡无固定高度造成的大面积空洞
Customer 色系不变，Quickstart/代码窗是唯一深色表面
```

- [ ] **Step 3: 逐张人工查看截图并只修复 Critical/Important 问题**

每次修复后依次运行：

```bash
node /private/tmp/openrouter-v6-polish-static.mjs
cp .superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6-polished.html .superpowers/brainstorm/51008-1788097225/content/openrouter-customer-premium-v6-polished-preview.html
CDP_PORT=9444 bun /private/tmp/openrouter-v6-polish-cdp.mjs
```

Expected: 静态守卫通过、8/8 PASS、六视口合同全部通过。

---

### Task 6: 融合参考图的 Hero 环境光视觉

**Files:**
- Modify: `.superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6-polished.html` inside the appended V6 polish `<style>`
- Sync: `.superpowers/brainstorm/51008-1788097225/content/openrouter-customer-premium-v6-polished-preview.html`
- Modify: `/private/tmp/openrouter-v6-polish-static.mjs`
- Modify: `/private/tmp/openrouter-v6-polish-visual.mjs`
- Refresh: `/private/tmp/openrouter-v6-polish-shots/*.png`

**Interfaces:**
- Consumes: Task 5 已通过审查的 V6 精修候选，以及用户提供的 AI Tokens Flux Hero 参考图。
- Produces: 保留现有内容与 Customer 色系、但具有柔和多向环境光和中央聚焦感的 V6 Hero；不新增 DOM、文案、资产或交互。

- [ ] **Step 1: 扩展静态守卫并先验证失败**

守卫新增以下合同：

```text
.premium-hero::before 必须存在且只位于 V6 POLISH override
环境光必须使用 radial-gradient + color-mix
只允许引用 --surface-1 / --info / --warning / --accent 与 transparent
不得修改 :root token，不得出现新增 Hex/RGB/HSL/OKLCH 色值
```

Run:

```bash
node /private/tmp/openrouter-v6-polish-static.mjs
```

Expected: FAIL，指出 Hero ambient halo 缺失。

- [ ] **Step 2: 在 scoped CSS 中增加静态环境光层**

环境光层使用 `.premium-hero::before`，位于网格/路由轨迹之后、Hero 文案之前：

```css
.premium-hero {
  isolation: isolate;
}

.premium-hero::before {
  position: absolute;
  z-index: 0;
  inset: -12% -8% -8%;
  background:
    radial-gradient(circle at 50% 34%, color-mix(in srgb, var(--surface-1) 92%, transparent) 0 20%, transparent 56%),
    radial-gradient(circle at -4% 46%, color-mix(in srgb, var(--info) 14%, transparent) 0, transparent 48%),
    radial-gradient(circle at 104% 42%, color-mix(in srgb, var(--warning) 13%, transparent) 0, transparent 50%),
    radial-gradient(circle at 14% 108%, color-mix(in srgb, var(--accent) 14%, transparent) 0, transparent 46%);
  content: '';
  pointer-events: none;
  opacity: 0.88;
}

.route-field {
  z-index: 1;
}

@media (max-width: 767px) {
  .premium-hero::before {
    inset: -8% -28% -4%;
    opacity: 0.72;
  }
}
```

允许在六视口截图审计中微调位置、混合比例和透明度，但只能使用上述既有 Customer token，且中心文字对比、路由线清晰度和首屏合同优先。

- [ ] **Step 3: 更新视觉合同并重新捕获六视口**

视觉脚本新增：

```text
六视口 `.premium-hero::before` computed background-image 均包含 4 个 radial-gradient
环境光伪元素不形成第三个深色面积表面
固定 Customer token 与代表计算色仍为 0 mismatch
390×844 标题、说明、双 CTA、route origin、五 Provider 与四项 Signal 仍完整处于首屏
```

Run:

```bash
node /private/tmp/openrouter-v6-polish-static.mjs
cp .superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6-polished.html .superpowers/brainstorm/51008-1788097225/content/openrouter-customer-premium-v6-polished-preview.html
CDP_PORT=9444 bun /private/tmp/openrouter-v6-polish-visual.mjs
CDP_PORT=9444 bun /private/tmp/openrouter-v6-polish-cdp.mjs
```

Expected: 静态守卫通过；六视口自动合同通过；12 张截图人工确认环境光可见但不压过标题或路由；功能回归 8/8 PASS。

- [ ] **Step 4: 独立审查参考图融合**

Reviewer 必须确认：只吸收环境光与中央聚焦感；没有复制 Claude/Codex 内容、Logo、操作系统图标或售后卡；没有新增色值、DOM、JavaScript、网络能力或深色表面；移动和横屏仍清晰。

Expected: Critical/Important 为零。

---

### Task 7: 独立审查、最终同步和交付

**Files:**
- Verify: `.superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6-polished.html`
- Verify: `.superpowers/brainstorm/51008-1788097225/content/openrouter-customer-premium-v6-polished-preview.html`
- Verify: `/private/tmp/openrouter-v6-polish-static.mjs`
- Verify: `/private/tmp/openrouter-v6-polish-cdp.mjs`

**Interfaces:**
- Consumes: Task 5 最终候选、测试报告与截图。
- Produces: 可供用户查看的 V6 精修 Demo、精确预览链接和最终验证摘要。

- [ ] **Step 1: 派独立 reviewer 检查规格一致性与回归风险**

Reviewer 必须核对：V6 视觉识别是否保留、`<body>` 是否逐字一致、Customer 色系是否无新增值、移动五节点是否清楚、六视口是否无溢出、测试是否真实覆盖现有交互。

- [ ] **Step 2: 修复所有 Critical/Important 发现并复审**

Expected: Reviewer 输出 `Approved`，Critical 和 Important 均为零。

- [ ] **Step 3: 最终全链验证**

Run:

```bash
node /private/tmp/openrouter-v6-polish-static.mjs
shasum -a 256 .superpowers/brainstorm/93984-1787991725/content/openrouter-customer-premium-v6-polished.html .superpowers/brainstorm/51008-1788097225/content/openrouter-customer-premium-v6-polished-preview.html
CDP_PORT=9444 bun /private/tmp/openrouter-v6-polish-cdp.mjs
git status --short
```

Expected: 静态守卫通过；源文件与预览 SHA 相同；CDP 8/8 PASS；Git 中 `.superpowers/` 仍为未跟踪且未暂存，用户已有改动保持原状。

- [ ] **Step 4: 打开最终预览**

URL:

```text
http://localhost:60086/?key=74239a63946439cbb8104f9d2d62024310b3c8c7c54a8f4c12225f186532a226#/home
```

不得提交 `.superpowers/` 或 `/private/tmp` 文件。
