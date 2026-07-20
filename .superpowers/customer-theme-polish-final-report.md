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

## 提交记录

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

## 自动化验证

Customer 前端：

- `bun test`：12 个测试文件，30 个测试通过，0 失败，119 个断言。
- `bun run typecheck`：通过。
- `bun run build`：通过。
- `bun run format:check`：通过。
- `git diff --check`：通过。

完整 Go 项目：

- `go test ./...`：通过。

最终 Customer 构建体积：

- CSS：146.3 KB，gzip 29.1 KB。
- 主 JS：756.0 KB，gzip 215.9 KB。
- React：189.0 KB，gzip 59.7 KB。
- 总量：2873.0 KB，gzip 929.6 KB。

初始主包约为 881.8 KB / gzip 249.5 KB，懒加载后主包减少约 125.3 KB / gzip 33.6 KB。

## 真实浏览器审查

使用 Playwright Chromium Headless 完成：

- 首页断点：375、390、700、768、1024、1440。
- 全部断点均无页面级 JavaScript 错误，最终无横向溢出。
- 繁体中文首屏恢复为“輕鬆上手”“穩定好用的 AI 編程解決方案”“配置文檔”“立即使用”。
- 1440px 下福利卡宽度恢复为 720px，并完整位于首屏 Hero 内。
- 在 390 和 1440 下检查：首页、登录、注册、接入设置、套餐、Dashboard 及其 Billing/Usage/API Key/Invite/Settings 子路由、用户协议、隐私政策和未知路由。
- 所有检查路由均正确更新标题，未登录保护路由保持原有登录弹窗流程。
- 验证语言菜单键盘导航、Escape 关闭、焦点恢复、Skip Link、弹窗 Escape、浏览器前进/后退和 reduced-motion。
- 首页确认同时保留 Grok 与 Gemini，并保持既定区块顺序。
- 公共首页会按现有业务逻辑发起未登录充值信息探测，产生两个预期的 `/api/user/topup/info` 401；无 page error，未改变该业务行为。

截图：

- `/tmp/customer-homepage-original-restored-1440.png`
- `/tmp/customer-homepage-original-restored-390-full.png`

## 本地运行

- Customer：<http://localhost:5175>
- Backend：<http://localhost:3010>
- Backend exec session：`35571`
- Backend listener PID：`12410`
- Customer exec session：`6687`
- Customer listener PID：`12464`
- Backend 数据库：`/tmp/tokenflux-customer-theme.db`，由本机已有 SQLite 数据库复制后独立运行。

健康检查：

- `GET http://localhost:3010/api/status`：200，`success: true`。
- Customer 首页及登录、注册、设置、套餐入口：200。

## 环境说明

- 本机 Docker daemon 未运行，因此没有启动 Docker PostgreSQL/Redis 开发栈；后端使用本地 Go + 临时 SQLite 副本运行。
- 当前按用户要求保留功能分支和 worktree，不自动合并、推送或创建 PR。
