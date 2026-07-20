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

## 自动化验证

Customer 前端：

- `bun test`：12 个测试文件，37 个测试通过，0 失败，160 个断言。
- `bun run typecheck`：通过。
- `bun run build`：通过。
- `bun run format:check`：通过。
- `git diff --check`：通过。
- `rg -n '[—–]' web/customer/src/pages/Home web/customer/src/i18n/locales`：无匹配，按预期退出 1。

完整 Go 项目：

- `go test ./...`：通过。

最终 Customer 构建体积：

- CSS：151.8 KB，gzip 30.0 KB。
- 主 JS：756.3 KB，gzip 216.1 KB。
- React：189.0 KB，gzip 59.7 KB。
- 总量：2878.8 KB，gzip 930.7 KB。

初始主包约为 881.8 KB / gzip 249.5 KB，懒加载后主包减少约 125.6 KB / gzip 33.5 KB。

## 真实浏览器审查

Chrome DevTools MCP 在当前会话未配置，按 Task 5 简报使用缓存中的 Playwright Chromium 1223 和独立无状态 context 完成。浏览器只访问已知 localhost 地址；DOM、console 和网络结果均按不可信数据处理；未读取 cookie、localStorage、sessionStorage、token 或其他认证材料。

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

最终截图使用新的无状态 browser context，从 `scrollY = 0` 直接通过 Chromium `captureBeyondViewport` 捕获完整页面；未执行 hover 或页面滚动，截图中没有 fixed nav 或 Skip Link 的中段重复伪影。

`0f322d0a` 只收紧非首页 header 的样式作用域，首页视觉尺寸和页面内容未变化；本轮 fresh 重跑全部首页视口与两个非首页路由的 computed 验证，没有重复生成相同截图。

## 设计 Pre-flight

- 设计判断：面向开发者的 B2B AI 网关首页保留式精修，延续轻量、清晰、绿色主色的原有视觉语言。
- 设计参数：`DESIGN_VARIANCE: 5`、`MOTION_INTENSITY: 3`、`VISUAL_DENSITY: 4`。
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
- 当前按用户要求保留功能分支和 worktree，不自动合并、推送或创建 PR。
- 本次只完成本地验证、报告和提交，未部署生产环境。
