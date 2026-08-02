# 客户站 SEO 与搜索引擎收录优化设计

## 背景

客户站 `web/customer/` 当前是由 Go 服务端托管的 React 单页应用。所有前端路由共用同一份 HTML，只有通用标题和描述；canonical、语言替代链接、社交分享元数据、结构化数据、robots 和 sitemap 均未配置。未知页面也会由 SPA fallback 返回 HTTP 200，容易被搜索引擎识别为软 404。

本次优化面向简体中文和英文搜索，重点覆盖 Google、Bing 和百度，并围绕以下搜索意图组织页面信息：

- 中文：Claude Code API、Codex API、Grok API、AI API 中转、AI 模型网关、Claude Code 国内接入
- 英文：Claude Code API、Codex API、Grok API、AI API gateway、unified AI API
- 品牌：AI Tokens Flux、aitokensflux

## 目标

1. 让搜索引擎在不执行 JavaScript 时也能读取每个公开页面的关键元数据。
2. 为简体中文和英文提供稳定、独立、可互相声明的规范 URL。
3. 明确区分可索引页面、私有页面、临时页面和不存在的页面。
4. 消除重复 URL、软 404 和测试环境误收录风险。
5. 保持现有 React 交互、认证、计费、API 和管理后台行为不变。

## 非目标

- 不引入完整 SSR 框架或重写现有前端路由。
- 不修改 `web/default/` 或 `web/classic/`。
- 不索引登录后控制台、充值、用量、API Key、OAuth 等页面。
- 不伪造评分、评论、站内搜索框或其他不存在的结构化数据。
- 不调整 API、计费、认证或模型价格数据来源。

## 页面与语言 URL

简体中文继续使用现有无前缀 URL，英文使用 `/en` 前缀。默认站点和 `x-default` 均指向简体中文页面。

| 页面 | 简体中文 canonical | 英文 canonical | 索引策略 |
| --- | --- | --- | --- |
| 首页 | `/` | `/en` | index, follow |
| 价格 | `/pricing` | `/en/pricing` | index, follow |
| 接入文档 | `/docs` | `/en/docs` | index, follow |
| 用户协议 | `/user-agreement` | `/en/user-agreement` | index, follow |
| 隐私政策 | `/privacy-policy` | `/en/privacy-policy` | index, follow |

旧公开地址使用永久重定向收敛权重：

- `/subscribe` → `/pricing`
- `/setup` → `/docs`
- `/en/subscribe` → `/en/pricing`
- `/en/setup` → `/en/docs`

每个可索引页面声明 `zh-CN`、`en` 和 `x-default` 三个 alternate 链接。React 的语言切换应在简体中文和英文之间切换到对应 URL，而不是仅修改本地状态；现有繁体中文和俄文仍可作为界面语言使用，但本次不为其创建可索引 URL，也不写入 sitemap。

## 索引边界

以下页面保持可访问，但返回 `noindex, nofollow`，且不进入 sitemap：

- 登录、注册、重置密码
- OAuth 回调和客户端连接回调
- Dashboard、充值、用量、API Key、邀请和设置
- 临时或过期活动页面，例如父亲节活动页

未知路径返回真实 HTTP 404，并携带 `noindex, nofollow`。API、管理后台和 OAuth 回调路径不进入 sitemap；robots 只阻止抓取无页面价值的接口与管理路径，不阻止搜索引擎读取普通私有页面上的 `noindex`。

## SEO 页面配置

新增一份同时供 Go 服务端和 React 前端读取的中英文 SEO 页面清单，作为以下字段的唯一来源：

- 页面标识和规范路径
- 中文、英文 title
- 中文、英文 description
- robots 策略
- Open Graph 类型和分享信息
- 页面结构化数据类型
- breadcrumb 名称

首页标题基线为：

- 中文：`AI Tokens Flux｜Claude Code、Codex、Grok API 统一网关`
- 英文：`AI Tokens Flux | Unified Claude Code, Codex & Grok API Gateway`

其他公开页面使用独立、准确的标题和描述。文案自然覆盖目标关键词，不使用重复堆砌或隐藏关键词。所有 title 和 description 在实现时应检查常见搜索结果展示长度，并确保中英文语义一致。

## 服务端首屏输出

Go Web 路由在返回客户站 HTML 前执行以下流程：

1. 规范化请求路径并识别可选的 `/en` 语言前缀。
2. 命中旧公开地址时返回 301 canonical 跳转。
3. 命中公开页面时，从 SEO 清单生成该语言的 head 内容。
4. 命中私有或临时页面时，输出通用品牌信息和 `noindex, nofollow`。
5. 未命中任何页面时返回客户站 404 页面，HTTP 状态为 404，并输出 `noindex, nofollow`。

服务端输出至少包含：

- `<html lang>`
- 唯一 `<title>` 和 `meta[name="description"]`
- `meta[name="robots"]`
- canonical
- `hreflang="zh-CN"`、`hreflang="en"`、`hreflang="x-default"`
- Open Graph 基础字段
- Twitter Card 基础字段
- 对应页面的 JSON-LD

SEO 标签通过构建模板中的明确占位区域插入。所有 HTML 属性、文本和 JSON-LD 数据必须经过正确转义。canonical、sitemap 和结构化数据固定使用 `https://aitokensflux.com`，不得根据不可信的请求 Host 拼接。

只允许正式客户主域名输出 `index, follow`。本地地址、IP、管理域名和其他非正式域名即使访问公开路径，也应降级为 `noindex, nofollow`，避免测试或镜像环境污染搜索结果。

可按“语言 + 规范页面 + 是否正式主域名”缓存生成后的 HTML。SEO 清单缺失或解析失败时使用安全的通用品牌描述并降级为 `noindex, nofollow`，不得输出错误 canonical。

## React 客户端行为

React 根据当前规范路由和语言同步维护服务端输出的 SEO 信息，包括：

- `document.title`
- description 和 robots
- canonical 和 hreflang
- Open Graph 与 Twitter Card
- JSON-LD
- `document.documentElement.lang`

这样可以保证 SPA 内部导航后浏览器状态正确，同时服务端仍负责爬虫首次请求所需的完整 head。

站内公开链接全部改用 canonical 地址，减少不必要的重定向。英文页面导航必须保留 `/en` 前缀。直接访问 `/docs` 或 `/en/docs` 时应呈现独立、语义清晰的文档主内容；现有弹窗式接入体验可以保留给站内交互，但不能成为爬虫访问文档 URL 时唯一的内容表达。

## 页面语义与内容

公开页面遵循以下规则：

- 每页只有一个准确描述页面主题的 H1。
- 标题层级按 H1、H2、H3 顺序组织。
- 首页 H1 明确表达 Claude Code、Codex、Grok 与统一 AI API 网关能力。
- 价格页 H1 聚焦透明的模型 API 定价。
- 文档页 H1 聚焦 Claude Code、Codex 等工具的 API 接入。
- 链接文字描述目标内容，避免仅使用“点击这里”等弱语义文案。
- 有信息意义的图片提供准确 alt，装饰图继续使用空 alt 或 `aria-hidden`。
- 首页保留指向价格、文档、用户协议和隐私政策的可抓取内部链接。

本次只调整为搜索和用户理解服务的必要文案，不进行无关的首页视觉重构。

## 结构化数据

使用 JSON-LD 输出与页面真实内容一致的数据：

- 首页：`Organization`、`WebSite`、`WebPage`、`Service`
- 首页 FAQ：`FAQPage`，问题和答案必须与页面可见内容一致
- 价格页、文档页和法律页：`WebPage`、`BreadcrumbList`

结构化数据中的 URL、名称、描述和语言与 canonical 和页面可见内容保持一致。组织 logo 使用站内稳定品牌资源。新增一张 1200×630 的静态品牌分享图，供中英文 Open Graph 和 Twitter Card 共用。

## Robots 与 Sitemap

Go 服务端提供：

- `/robots.txt`：允许抓取公开页面，阻止 API、管理后台和无页面价值的回调路径，并声明 sitemap 地址。
- `/sitemap.xml`：仅列出五类公开页面的中英文 canonical URL，共十个 URL；每项包含中英文 alternate 链接。

私有页面、旧别名、临时活动页、404 页面和查询参数变体不进入 sitemap。`lastmod` 只在存在可靠构建或内容更新时间时输出，不使用每次请求的当前时间伪造更新。

## 错误处理与安全

- 所有页面配置在启动或测试阶段验证路径唯一性、语言字段完整性和 robots 策略。
- HTML 和 JSON-LD 注入值必须转义，避免标签闭合或脚本注入。
- 不从 Host、查询参数或用户数据生成 canonical。
- 未识别路径始终采用 404 + noindex 的安全默认值。
- SEO 失败不得影响 API、认证、支付或已登录控制台业务。

## 验证

### 后端自动化测试

使用 Gin 测试路由和 `httptest` 编写确定性的表格测试，覆盖：

- 中英文公开页面返回 200 和正确 title、description、canonical、hreflang、robots
- 旧公开地址返回 301 到对应 canonical
- 私有页面返回 200 和 `noindex, nofollow`
- 未知页面返回 404 和 `noindex, nofollow`
- 非正式 Host 上公开页面降级为 noindex
- robots 内容、Content-Type 和 sitemap 声明
- sitemap XML、URL 集合和中英文 alternate 链接
- JSON-LD 可以解析且内容与页面配置一致

新增或重写的 Go 测试使用 `testify/require` 进行前置与致命断言，使用 `testify/assert` 进行非致命值检查。

### 前端与构建检查

在 `web/customer/` 执行：

- `bun run format:check`
- `bun run typecheck`
- `bun run build`

检查客户端导航、语言切换、文档直接访问、价格页、登录页和 404 页面，确认页面标签与可见内容同步。

### 构建产物与协议检查

- 使用 `curl` 确认不执行 JavaScript 时仍能读取公开页面元数据。
- 验证公开页面 HTTP 状态、重定向目标和 404 状态。
- 解析 sitemap XML 和 JSON-LD，确认语法有效。
- 确认 sitemap 不包含私有、旧别名或活动页面。
- 确认现有 API、认证、价格请求和客户控制台导航不受影响。

## 实施边界

预计改动集中在：

- `web/customer/` 的 HTML 模板、路由与 SEO 客户端同步逻辑
- 客户站公开页面的必要语义文案和 canonical 链接
- `router/` 的客户 HTML、robots、sitemap、重定向和 404 行为
- `main.go` 与客户站嵌入资源之间的 SEO 配置传递
- 对应的 Go 路由测试和前端构建检查

不改动默认主题、经典主题、业务 API、数据库、计费、认证流程或生产部署配置。
