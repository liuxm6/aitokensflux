# Customer 主题优化最终报告

## 交付范围

- 工作树：`/Users/ouyeel/work/code/tokenflux/.worktrees/customer-homepage-gemini`
- 分支：`feat/customer-theme-polish`
- 修改范围：`web/customer/` 与本报告
- 保持现有浅色中性色调和绿色主色 `#0fb477`
- 未修改路由契约、API、表单提交字段、支付逻辑或业务流程
- 未部署到生产环境

## 已完成优化

1. 建立 Customer 前端回归测试护栏，覆盖弹窗、菜单、路由、表单、异步状态、表格、样式层和首页结构。
2. 引入统一的无障碍弹窗基础，支持 portal、焦点循环、Escape、焦点恢复和背景隔离。
3. 补齐嵌套弹窗栈，确保 Escape 只关闭最上层弹窗。
4. 将账户、认证、支付、充值和确认操作迁移到一致的弹窗交互。
5. 统一语言菜单和账户菜单的方向键、Home、End、Escape、外部点击行为。
6. 改善移动导航焦点管理、背景 inert、独立关闭按钮和触发器焦点恢复。
7. 增加 Skip Link、路由焦点和页面标题/描述更新。
8. 支持 reduced-motion，避免减弱动画偏好下的滚动与 Hero 动画问题。
9. 增加字段级错误、`aria-invalid`、`aria-describedby` 和首个错误字段自动聚焦。
10. 将移动端输入字号和主要交互目标调整到更可靠的触控尺寸。
11. 为首页、Dashboard、Usage、Invite、API Keys、Billing 区分加载、空、错误和重试状态。
12. 为数据表补齐 caption、表头 scope、可聚焦滚动区域和移动端卡片摘要。
13. 建立 tokens、base、dialogs、marketing 四层语义样式结构。
14. 对非首页路由实施懒加载，降低首页初始主包体积。
15. 根据用户提供的原版截图恢复首页品牌型首屏，重新以短标题和动态模型品牌作为视觉主角。
16. 保留并统一 Claude、Codex、Grok、Gemini Hero 轮播和模型费率分组。
17. 将售后群福利卡恢复到 Hero 内容流内部，并恢复原版 720px 最大宽度和垂直节奏。
18. 将核心能力恢复为原版四列轻量分隔布局，移除后加的 2+2 卡片化覆盖。
19. 补齐英文、简体中文、繁体中文、俄文四种语言文案。
20. 最终浏览器审查修复了路由自动聚焦标题的默认描边，以及 700px/768px 模型费率栏横向溢出。
21. Task 5 浏览器终验修复了 760px 及以下卡片式模型费率表的文档流重叠，并保留 768px 及以上桌面表格的内容自适应高度。
22. 将首页品牌绿 CTA 的默认文字对比度从约 2.69:1 提升到 5.40:1，hover 状态提升到 5.89:1。
23. 完成 375、390、700、768、900、1024、1440 七个正式视口，以及 720、760 临界回归和 reduced-motion 的隔离 Chromium 审查。
24. 将首页 minimal nav 对齐为桌面 80px、移动 72px 内容高度，并将所有正式视口的 Hero 顶部 padding 统一为 96px。
25. 将桌面 80px minimal nav 规则收紧到首页专用 `home-nav` 标记，恢复 `/console/connect` 与 `/fathers-day` 的既有 82px minimal nav。
26. 最终审查将嵌套 Dialog 的非顶层节点设为 `aria-hidden` 与 `inert`，并在顶层关闭后恢复原状态。
27. Toast viewport 改为 `document.body` portal，避免被应用根节点的 inert/aria-hidden 隔离。
28. 非首页懒路由增加局部错误边界、四语言错误态和可恢复重试；真实 ChunkLoadError 使用 route/runtime reload 绕过 Rspack rejected promise 缓存。
29. 模型费率明确区分 loading、error、成功空数据和成功有数据；删除开发样例费率，不再用假数据遮蔽真实空态。
30. 语言切换只更新 metadata，不再触发路由标题聚焦；菜单选择后焦点恢复语言按钮。
31. 加载骨架与首页交互动效收紧为仅 `transform`/`opacity`，并保留 reduced-motion。
32. 复核并修复嵌套 WeChat Dialog 的视觉层级，使其 `z-index: 5100` 高于账户外层 `5000`，Toast 继续位于 `10000`。
33. 将页面滚动锁改为首层快照与全局计数，嵌套 Dialog 同时卸载也能恢复原 overflow/overscroll。
34. 为 Auth/Setup 懒路由错误增加真实 fixed overlay，错误与重试按钮在首屏可见，背景 root 保持 inert。
35. 为模型费率请求增加 latest-request 与 unmount 失效保护，旧响应不能覆盖较新的失败或 retry 恢复。

## 最终审查修复

### 1. 嵌套 Dialog、Toast 与视觉层级

- 根因：原 Dialog 栈只保存标识，未隔离非顶层 Dialog；Toast viewport 又位于 `#root` 内，根节点 inert 时会一起失去可见/交互语义。
- 首次修复：`96a9936e fix(customer): isolate nested dialog layers`，涉及 `Dialog.tsx`、`Toast/index.tsx`、`dialog.test.tsx`。
- RED：`bun test tests/dialog.test.tsx` 为 2 pass / 2 fail；下层 Dialog 缺少 `aria-hidden="true"`，Toast viewport 仍在 root 内。
- GREEN：同命令为 4 pass / 0 fail / 26 expect；Dialog 与 overlay 组合为 7 pass / 0 fail / 36 expect，`tsc -b` 通过。
- 二次视觉根因：浏览器截图确认顶层 WeChat Dialog 虽已在 DOM/无障碍栈暴露，但 `.auth-dialog` 的 `z-index: 100` 低于外层 `.auth-overlay` 的 `5000`，实际画面仍被账户弹窗遮挡。
- TDD 补充：新增样式层级契约后 RED 明确为 `Expected > 5000, Received 100`；`6fc5284c fix(customer): raise nested auth dialog layer` 将顶层设为 `5100`，GREEN 为 12 pass / 0 fail / 75 expect。
- Chromium `143.0.7499.4` 复核：外层 `aria-hidden=true`、`inert=true`、z=5000；WeChat 顶层未隐藏、未 inert、z=5100；Toast 位于 body portal、z=10000、无隐藏祖先。Toast Close 可关闭，Escape 只关闭内层，外层恢复且焦点回到 `Continue with WeChat`。0 pageerror、0 requestfailed。
- 最终截图：`/tmp/customer-homepage-final-review-nested-dialog-toast-fixed.png`。

### 2. 懒路由错误恢复与 ChunkLoadError 二次根因

- 根因：非首页 `React.lazy` rejection 直接冒泡到应用根错误页，用户无法在当前路由恢复。
- 首次修复：`5818eeac fix(customer): recover failed lazy routes`，为懒页增加局部错误边界、四语言 `Failed to load page` 和普通 rejected loader 的新 `lazy(loader)` 重试。
- RED：`bun test tests/app-navigation.test.tsx` 为 7 pass / 1 fail，预期 `Failed to load page`，实际为根级 `Application crashed`。
- GREEN：首次修复后 8 pass / 0 fail / 33 expect。
- 二次根因：Rspack 开发模式 lazy-compilation proxy 会缓存 rejected chunk promise；即使创建新的 `React.lazy`，同一 chunk 也不会再次请求。
- 补充 RED：`bun test tests/app-navigation.test.tsx -t "bundler caches"` 预期 reload 1 次，实际 0 次。
- 补充 GREEN：`2c330a2c fix(customer): recover cached lazy chunks` 将 ChunkLoadError 重试切换为当前 route/runtime reload；`-t "route code splitting"` 为 4 pass / 0 fail / 11 expect。
- 浏览器：首次 abort `/static/js/async/src_pages_FathersDay_index_tsx.js` 显示可重试错误；点击后 `chunkRequests: 2`，恢复 `/fathers-day` 与标题 `To the Fathers Who Write Code`，焦点在 H1，0 pageerror。

### 3. 模型费率错误态与真实空态

- 根因：`success:false` 和网络 rejection 被错误折叠为成功空 grouped；开发样例费率又遮蔽了真实后端成功空响应。
- 修复：`2c0fc046 fix(customer): preserve pricing error state`，涉及 `Home/index.tsx` 和新增 `home-model-pricing.test.tsx`。失败不再写入空 grouped；只有真实 `success:true` 才进入数据/空态，并删除 `DEV_SAMPLE_PRICING`。
- RED：`bun test tests/home-model-pricing.test.tsx` 为 1 pass / 3 fail；`success:false`、网络 rejection、retry recovery 均错误落到 EmptyState，真实成功空响应测试已通过。
- GREEN：4 pass / 0 fail / 9 expect；Home 组合为 12 pass / 0 fail / 32 expect。
- 真实后端 fresh 结果：`/api/pricing/public` 为 `success:true, data_count:0, vendor_count:0`；`/api/subscription/plans` 为 `success:true, data_count:0`。首页明确显示 `No model pricing is available`，不再注入开发样例。
- 浏览器 390 与 1440：empty、loading、error、retry 后 fixture data 四种状态均无横向溢出或 pricing/plans 重叠；retry 后四个 provider tabs 出现，0 pageerror、0 requestfailed。

### 4. 语言切换与路由焦点

- 根因：metadata 更新与路由标题聚焦共用 effect，语言变化会再次把焦点移到 H1；Dropdown 选择后卸载菜单，焦点随后落到 body。
- 修复：`7429862f fix(customer): preserve focus on language changes`，将 metadata 与 route focus effect 分离，并在 Dropdown selection 后恢复 trigger。
- RED：`bun test tests/app-navigation.test.tsx -t "language selection"` 初始期望 BUTTON、实际 H1；拆分 effect 后期望 BUTTON、实际 BODY。
- GREEN：单测 1 pass / 0 fail / 3 expect；app-navigation + menu 为 12 pass / 0 fail / 47 expect，typecheck 通过。
- 浏览器：`/fathers-day` 选择简体中文后 title/description 正确本地化，active element 为 `.lang-btn`；点击 header brand SPA 返回首页后焦点移到 H1。0 pageerror、0 requestfailed。

### 5. Motion 契约与 reduced-motion

- 根因：Skeleton 使用 `background-position` 动画，`.mp-tab` 仍含 color/border/background transition；旧测试只检查部分 marketing CSS，没有覆盖最终 Customer CSS import surface。
- 修复：`0ccdc3ee fix(customer): constrain loading motion`，Skeleton 改为 opacity pulse，移除 `.mp-tab` 非 transform/opacity transition，并让契约扫描最终 Customer CSS surface。
- RED：`bun test tests/style-layers.test.ts -t "homepage and loading motion"` 报告 `transition: color`、`border-color`、`background` 与两条 `state-skeleton-shift: background-position`。
- GREEN：聚焦 1 pass / 0 fail / 8 expect；完整 style-layers 为 7 pass / 0 fail / 47 expect；style + async-state 为 9 pass / 0 fail / 54 expect，typecheck 通过。
- Chromium 390/1440 loading：动画名 `state-skeleton-pulse`，关键帧属性仅 opacity；390 reduced-motion 为 `animationName: none`、`animationCount: 0`。

### 收尾格式修复

- 首次 final `format:check` 精确发现 `Dialog.tsx`、`lazy-pages.tsx`、`style-layers.test.ts` 三个文件未符合 Prettier；测试、typecheck、build 均已通过。
- `f0aa6ccb style(customer): format final review fixes` 只包含机械格式差异；相关 21 tests / 111 expect 和 `format:check` 随后通过。

## 独立整包复审与 Important 修复

独立 reviewer 首轮结果为 0 Critical / 3 Important，三项均按 TDD 修复后窄范围复审通过：Spec compliance PASS、Code quality PASS、0 Critical、0 Important、1 Minor、Ready to merge Yes。

### 1. 嵌套 Dialog 同时卸载后的滚动锁

- 根因：每层 Dialog 各自保存/恢复 overflow；内层把外层已经设置的 `hidden` 当成原状态，同时卸载时最后一个 cleanup 会把 `hidden` 写回。
- RED：`bun test tests/dialog.test.tsx` 为 4 pass / 1 fail，期望原 `scroll`，实际 `hidden`。
- GREEN：`092883dd fix(customer): restore nested dialog scroll lock` 引入首层快照与全局计数；5 pass / 0 fail / 32 expect。

### 2. Auth/Setup overlay lazy rejection 首屏不可见

- 根因：正常 Auth/Setup 会 portal 为 overlay，但 loader rejection 的 ErrorState 仍在 Home 普通文档流末尾；900px 视口中错误框顶部约 4213px。
- RED：app-navigation 为 10 pass / 1 fail，缺少 inert overlay 呈现。
- GREEN：`19572638 fix(customer): expose lazy overlay failures` 为 Auth/Setup 启用 overlay presentation，复用 `AccessibleDialog`；11 pass / 0 fail / 43 expect。
- Chromium `143.0.7499.4`：`/sign-in` 首次 Auth chunk abort 后 ErrorState 位于 y=400.0-549.7，`scrollY=0`，dialog 在 root 外，root inert/aria-hidden，Try again 获焦点；retry 后 `authChunkRequests: 2`，恢复 Account password sign in，0 pageerror。
- 截图：`/tmp/customer-homepage-final-review-auth-lazy-overlay-error.png`、`/tmp/customer-homepage-final-review-auth-lazy-overlay-recovered.png`。

### 3. 模型费率乱序响应

- 根因：StrictMode、retry 或网络延迟可产生并发请求；较旧成功响应会覆盖较新的失败或恢复数据。
- RED：home-model-pricing 为 4 pass / 2 fail；旧 empty 覆盖新 failure，旧请求覆盖 `claude-latest` retry 结果。
- GREEN：`aa6b565c fix(customer): ignore stale pricing responses` 使用递增 request id，并在 effect cleanup 时失效；6 pass / 0 fail / 18 expect。
- 三项聚焦组合：22 pass / 0 fail / 93 expect；typecheck、format check、diff check 均通过。
- 唯一 Minor：尚无“组件 unmount 后再 resolve deferred pricing request”的独立直接测试；实现的 cleanup 自增 id 与统一 success/catch guard 已覆盖该行为，不阻塞交付。

## 本报告提交前的实现与验证提交

- `cd6abcb1` feat(customer): add Gemini pricing group
- `14918a23` feat(customer): add Gemini homepage hero
- `4ab306f3` fix(customer): show Gemini with reduced motion
- `989631fb` fix(customer): avoid hero clipping near mobile breakpoint
- `4ae46a13` docs(customer): design progressive theme polish
- `56089826` test(customer): add frontend regression harness
- `65396628` style(customer): normalize existing frontend formatting
- `60367869` feat(customer): add accessible dialog foundation
- `afcbc06b` feat(customer): migrate account dialogs to shared focus handling
- `067a9734` feat(customer): migrate payment dialogs to shared focus handling
- `3f1a0c34` feat(customer): unify accessible overlay behavior
- `aeb8d7fe` feat(customer): improve keyboard navigation and route focus
- `341e7465` feat(customer): add accessible form feedback
- `252336bf` feat(customer): improve async and table states
- `d9238f08` refactor(customer): establish semantic style layers
- `ac4bd345` perf(customer): split customer routes
- `bfa5b40f` feat(customer): polish homepage hierarchy
- `84db3d10` fix(customer): polish focus and pricing breakpoints
- `fb3c774a` docs(customer): define original homepage restoration
- `8b02cd72` style(customer): refine homepage visual rhythm
- `e903bf86` fix(customer): limit homepage polish transitions
- `db47a8d1` style(customer): adapt homepage pricing states
- `659902b5` style(customer): polish homepage supporting sections
- `642bb4ca` fix(customer): restore mobile pricing table flow
- `9f786c75` fix(customer): align mobile pricing breakpoint
- `a710dd73` fix(customer): improve homepage button contrast
- `df8259b0` fix(customer): preserve homepage hover contrast
- `71753a37` refactor(customer): scope homepage polish
- `bdfa71f5` docs(customer): record homepage polish validation
- `38076dcf` fix(customer): align homepage frame dimensions
- `a5e13fe4` docs(customer): finalize homepage frame validation
- `0f322d0a` fix(customer): scope compact nav to homepage
- `6d444bf0` docs(customer): finalize scoped nav validation
- `96a9936e` fix(customer): isolate nested dialog layers
- `5818eeac` fix(customer): recover failed lazy routes
- `2c0fc046` fix(customer): preserve pricing error state
- `7429862f` fix(customer): preserve focus on language changes
- `0ccdc3ee` fix(customer): constrain loading motion
- `2c330a2c` fix(customer): recover cached lazy chunks
- `f0aa6ccb` style(customer): format final review fixes
- `6fc5284c` fix(customer): raise nested auth dialog layer
- `092883dd` fix(customer): restore nested dialog scroll lock
- `19572638` fix(customer): expose lazy overlay failures
- `aa6b565c` fix(customer): ignore stale pricing responses

## 自动化验证

Customer 前端：

- `bun test`：13 个测试文件，50 个测试通过，0 失败，215 个断言。
- `bun run typecheck`：通过。
- `bun run build`：通过。
- `bun run format:check`：通过。
- `git diff --check`：通过。
- `rg -n '[—–]' web/customer/src/pages/Home web/customer/src/i18n/locales`：无匹配，按预期退出 1。

完整 Go 项目：

- `go test ./...`：通过。

最终 Customer 构建体积：

- CSS：151.7 KB，gzip 30.0 KB。
- 主 JS：758.7 KB，gzip 216.8 KB。
- React：189.0 KB，gzip 59.7 KB。
- 总量：2881.1 KB，gzip 931.4 KB。

初始主包约为 881.8 KB / gzip 249.5 KB，懒加载后主包减少约 123.1 KB / gzip 32.7 KB。

## 真实浏览器审查

Chrome DevTools MCP 在当前会话未配置，按 Task 5 简报使用隔离 Playwright（主审查记录为 1.60.0）和 Chromium `143.0.7499.4` 的独立无状态 context 完成。浏览器只访问已知 localhost 地址；DOM、console 和网络结果均按不可信数据处理；未读取 cookie、localStorage、sessionStorage、token 或其他认证材料。

正式视口结果：

| 视口      |                页面宽度 | nav 内容 / 整体；Hero top | Hero                                  | 模型费率 wrapper / table | 空套餐                          | 支持 / Footer |
| --------- | ----------------------: | ------------------------- | ------------------------------------- | ------------------------ | ------------------------------- | ------------- |
| 375x812   |   375 / 375，无横向溢出 | 72 / 73px；96px           | 标题、轮播、CTA、福利卡均在首屏       | 738 / 702px，无重叠      | empty-state 96px，至 PAYG 140px | 单列 / 单列   |
| 390x844   |   390 / 390，无横向溢出 | 72 / 73px；96px           | 标题、轮播、CTA、福利卡均在首屏       | 738 / 702px，无重叠      | empty-state 96px，至 PAYG 140px | 单列 / 单列   |
| 700x900   |   700 / 700，无横向溢出 | 80 / 81px；96px           | 单品牌轮播完整，福利卡在首屏          | 738 / 702px，无重叠      | empty-state 96px，至 PAYG 140px | 3+2 / 两列    |
| 768x1024  |   768 / 768，无横向溢出 | 80 / 81px；96px           | 双品牌轮播完整，福利卡在首屏          | 224.5 / 208.5px，无重叠  | empty-state 96px，至 PAYG 140px | 3+2 / 两列    |
| 900x900   |   900 / 900，无横向溢出 | 80 / 81px；96px           | 标题、轮播、CTA、福利卡均在首屏       | 224.5 / 208.5px，无重叠  | empty-state 96px，至 PAYG 140px | 3+2 / 两列    |
| 1024x900  | 1024 / 1024，无横向溢出 | 80 / 81px；96px           | 标题、轮播、CTA、福利卡均在首屏       | 224.5 / 208.5px，无重叠  | empty-state 96px，至 PAYG 140px | 五列 / 四列   |
| 1440x1000 | 1440 / 1440，无横向溢出 | 80 / 81px；96px           | 标题、轮播、CTA、720px 福利卡均在首屏 | 224.5 / 208.5px，无重叠  | empty-state 96px，至 PAYG 140px | 五列 / 四列   |

补充边界与交互证据：

- 720x900、760x900 下卡片表 wrapper / table 均为 738 / 702px，完整参与文档流；768x1024 恢复桌面表格 224.5 / 208.5px。
- 1440x1000 下首页 header 带 `home-nav`，nav inner / header 为 80 / 81px；`/console/connect` 与 `/fathers-day` 不带 `home-nav`，均恢复为 82 / 83px。
- `/console/connect` 是受保护路由，浏览器验证在隔离 context 中使用非敏感伪用户和 `/api/user/self` fixture 进入真实页面；未使用或读取任何真实凭据。
- 七个正式视口均为 HTTP 200、0 个 Playwright `pageerror`、0 个 Playwright `requestfailed`；模型轮播在 3.25 秒采样前后发生切换。
- 每次开发模式加载会记录 2 个 `/api/user/topup/info` 401 console resource error；它们来自现有未登录充值信息探测，没有页面级 JavaScript 异常，因此不能表述为 clean console。
- Hero 无障碍标签始终包含 `Google Gemini`，模型费率 tab 始终包含 Gemini。
- 六个首页 CTA 在全部正式视口均为单行、无裁切；品牌绿默认状态对比度 5.40:1，hover 状态 5.89:1。
- reduced-motion 在 375x812 和 1440x1000 下停止轮播，同时静态显示 Claude、Codex、Grok、Gemini，Hero 仍完整位于首屏。
- 支持区在 375/390 为单列，在 700/768/900 为 3+2，在 1024/1440 为五列；Footer 分别为一列、两列、四列；FAQ 在所有视口均位于容器内。

最终截图：

- `/tmp/customer-homepage-task5-375x812.png`
- `/tmp/customer-homepage-task5-390x844.png`
- `/tmp/customer-homepage-task5-700x900.png`
- `/tmp/customer-homepage-task5-768x1024.png`
- `/tmp/customer-homepage-task5-900x900.png`
- `/tmp/customer-homepage-task5-1024x900.png`
- `/tmp/customer-homepage-task5-1440x1000.png`
- `/tmp/customer-homepage-task5-720x900.png`
- `/tmp/customer-homepage-task5-760x900.png`
- `/tmp/customer-homepage-task5-375x812-reduced.png`
- `/tmp/customer-homepage-task5-1440x1000-reduced.png`
- `/tmp/customer-homepage-final-review-390-empty.png`
- `/tmp/customer-homepage-final-review-1440-empty.png`
- `/tmp/customer-homepage-final-review-390-loading.png`
- `/tmp/customer-homepage-final-review-1440-loading.png`
- `/tmp/customer-homepage-final-review-390-loading-reduced.png`
- `/tmp/customer-homepage-final-review-390-error.png`
- `/tmp/customer-homepage-final-review-390-data.png`
- `/tmp/customer-homepage-final-review-1440-error.png`
- `/tmp/customer-homepage-final-review-1440-data.png`
- `/tmp/customer-homepage-final-review-lazy-error.png`
- `/tmp/customer-homepage-final-review-lazy-recovered.png`
- `/tmp/customer-homepage-final-review-route-focus.png`
- `/tmp/customer-homepage-final-review-nested-dialog-toast-fixed.png`
- `/tmp/customer-homepage-final-review-auth-lazy-overlay-error.png`
- `/tmp/customer-homepage-final-review-auth-lazy-overlay-recovered.png`

最终截图使用新的无状态 browser context，从 `scrollY = 0` 直接通过 Chromium `captureBeyondViewport` 捕获完整页面；未执行 hover 或页面滚动，截图中没有 fixed nav 或 Skip Link 的中段重复伪影。

`0f322d0a` 只收紧非首页 header 的样式作用域，首页视觉尺寸和页面内容未变化；本轮 fresh 重跑全部首页视口与两个非首页路由的 computed 验证，没有重复生成相同截图。

## 设计 Pre-flight

- 设计判断：面向开发者的 B2B AI 网关首页保留式精修，延续轻量、清晰、绿色主色的原有视觉语言。
- 设计参数：`DESIGN_VARIANCE: 7`、`MOTION_INTENSITY: 6`、`VISUAL_DENSITY: 3`。
- 实现基础：现有 React + 原生 CSS 语义层，不引入第二套设计系统或新依赖。
- 通过项：全页浅色主题锁定、绿色主色一致、角色化圆角体系、Hero 两行内且首屏完整、CTA 单行、按钮默认和 hover 对比度达到 AA、无页面级横向溢出、无破折号字符、无滚动监听、动效支持 reduced-motion、支持/FAQ/Footer 响应式折叠正确。
- 项目批准例外：浅色单主题是明确产品选择；动态供应商 Logo 是 Hero 主视觉，因此不增加生成摄影；唯一近黑 CTA 是有意的对比区块；Lucide 继续作为既有 UI 图标家族，供应商品牌 Logo 使用现有品牌图标资源。
- 框架尺寸：`38076dcf` 已将首页桌面 minimal nav 内容高度修正为 80px（含边框 81px）、首页移动端修正为 72px（含边框 73px），并将 Hero 顶部 padding 统一为 96px；所有正式视口均符合目标尺寸。

## 本地运行

- Customer：<http://localhost:5175>
- Backend：<http://localhost:3010>
- Backend listener PID：`12410`
- Customer listener PID：`12464`
- Backend 数据库：`/tmp/tokenflux-customer-theme.db`，由本机已有 SQLite 数据库复制后独立运行。

健康检查：

- `GET http://localhost:3010/api/status`：200，`success: true`。
- Customer 首页及登录、注册、设置、套餐入口：200。

## 环境说明

- 本机 Docker daemon 未运行，因此没有启动 Docker PostgreSQL/Redis 开发栈；后端使用本地 Go + 临时 SQLite 副本运行。
- Motion 回归测试精确覆盖本轮 Skeleton、`.mp-tab` 和首页 marketing transitions，但不是全仓 CSS 动效审计器。
- 真实浏览器已覆盖无需认证的 modal Auth/WeChat 嵌套流；需要认证或支付配置的 Topup/PurchaseProgress 嵌套流由组件回归测试保护，本轮未伪造真实支付业务。
- 前一轮构建曾出现一次仅影响当次 Rspack 持久化缓存的 `Directory not empty (os error 66)` 警告；最终 fresh build 未复现且正常生成 37 个产物。
- 当前按用户要求保留功能分支和 worktree，不自动合并、推送或创建 PR。
- 本次只完成本地验证、报告和提交，未部署生产环境。
