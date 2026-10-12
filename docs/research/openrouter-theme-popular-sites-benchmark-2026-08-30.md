# AI API 路由平台主题：热门产品官网基准调研

> 调研日期：2026-08-30  
> 调研对象：OpenRouter、Vercel、Linear、Stripe、Raycast、Anthropic / Claude  
> 目的：比较一线产品官网的首屏、导航、信息节奏、产品证据、动效、CTA 与移动端处理，提炼适用于 AI API 路由平台主题的设计模式。

## 调研方法与边界

本次仅使用各品牌第一方官网在调研日公开返回的页面、HTML、样式类、响应式资源和产品文档作为依据。由于当时无可用交互式浏览器，本报告不把推断写成视觉事实：桌面内容结构来自官网页面；移动端结论仅在页面存在明确断点、移动专用素材、移动导航标记或响应式布局类时记录，并在相关段落说明证据性质。

纳入页面：

- OpenRouter 首页与 Provider Routing 官方文档
- Vercel 首页与 AI 产品页
- Linear 首页
- Stripe 中国官网首页与 Payments 产品页
- Raycast 首页
- Anthropic 首页与 Claude 产品概览页

Linear 的 `/product` 页面仅返回轻量页面壳，Raycast 的 `/core-features` 返回 404，因此未将二者作为产品页证据，也未据此推测页面内容。

## 执行摘要

六组站点并不存在一个可以原样复刻的“最佳首页”。对 AI API 路由平台最有效的组合是：采用 OpenRouter 的价值表达和双 CTA，用 Linear 的真实产品界面建立第一层理解，按照 Stripe 的证据层级推进内容，再吸收 Vercel 的能力—案例映射、Raycast 的交互解释型动效，以及 Anthropic 的可信度叙事。

关键不是让页面显得更“AI”，而是尽快回答四个商业问题：平台替用户连接了什么、如何做出路由决策、为什么比直连更可靠、接入需要多少成本。抽象光效、漂浮 Logo 和宏大口号都不能替代这些证据。

## 横向比较

| 站点 | 首屏结构 | 导航 | 首个强证据 | CTA | 动效 | 移动端处理 |
| --- | --- | --- | --- | --- | --- | --- |
| OpenRouter | 明确 H1、副文案、双 CTA，随后直接展示平台规模 | 搜索、模型、榜单、应用、企业、文档与账户入口，偏产品目录型 | 300T+ 月 Token、10M+ 用户、80+ Provider、500+ 模型；后续为真实模型与产品卡 | `Get API Key` + `Discover Models` | Provider 图标轮换、卡片 hover、局部漂浮 | 隐藏完整搜索与主导航，品牌缩为 glyph；CTA 从双列变单列，能力卡按断点重排 |
| Vercel | “Agentic Infrastructure”主张、受众语境切换、双 CTA 与定制场景 | 桌面 mega menu；移动端全屏 dialog 与分组详情 | Notion、Zapier、Mintlify 案例把量级与具体基础设施能力绑定 | `Deploy now` + `Talk to sales` | Hero 场景切换、渐隐过渡、文字变化，并提供 reduced-motion 处理 | CTA 小屏纵排；案例使用独立移动与桌面素材；Logo 移动端 marquee、桌面静态 |
| Linear | 主张与副文案后，立即展示近乎真实的完整产品 UI | 产品、资源、客户、价格、动态、联系、登录、注册 | Sidebar、Issue、Activity、Slack 来源、Agent task 等真实工作流 | 首屏主要依赖顶栏 `Sign up`，页面内 CTA 较弱 | 标题模糊/位移入场，产品场景与内容滚动展示 | 有独立移动视觉与文案断行；复杂能力内容转为横向卡片/滚动 |
| Stripe | 大标题、业务说明、单 CTA、动态规模数据和彩色波形 | 产品、解决方案、开发者、资源、价格；登录与销售入口 | GDP 份额数据及来源说明，随后是全球客户 Logo、产品与案例 | `立即开始`，导航补充 `联系销售` | 波形、Logo marquee、数据状态指示等多层品牌动效 | 波形分别提供 desktop/tablet/mobile 资源；移动菜单层级化，底部固定两项转化入口 |
| Raycast | 极短价值主张、产品说明、系统检测型下载入口 | 商店、Pro、AI、各平台、团队、企业、博客、价格、登录 | 真实扩展卡、操作系统窗口、AI 界面与专业用户背书 | 以下载为主，辅以新品公告和商店入口 | 键盘、扩展卡 stagger、AI 窗口轮播、人物轮播 | 已核验移动导航 toggle 与响应式图片 `sizes`；因无浏览器截图，不进一步推断最终视觉表现 |
| Anthropic / Claude | Anthropic 以研究与安全使命开场；Claude 以“thinking partner”与可输入 Prompt 开场 | Anthropic 按研究、承诺、产品、资源、公司组织；Claude 更聚焦使用场景 | Anthropic 用研究、安全和发布内容建立可信度；Claude 直接提供可执行的产品入口 | Anthropic 为阅读/了解；Claude 的 Prompt 输入框本身就是 CTA | 问题网络、Lottie、自动播放静音视频，均服务于叙事或体验 | Anthropic 在小屏重排问题网络并设固定比例，移动菜单全屏；动效存在 reduced-motion 处理 |

## 分站观察

### OpenRouter：最贴近主题语义，但还可以更快证明“为什么这样路由”

首页以“The Unified Interface For Every Model”直接定义品类，副文案用价格、可用性和免订阅说明收益，再用 `Get API Key` 与 `Discover Models` 同时服务高意向开发者和探索型访客。Hero 下方立即出现四个硬指标，接着才展开能力卡、Featured Models、Agents、工作方式和内容，这种顺序非常适合路由平台。

它的优势还在于产品卡不是纯装饰：模型/Provider 图标、价格、余额、API Key 等元素让访客看到真实产品概念。官方路由文档进一步证明了价格负载均衡、Provider 排序与分区、吞吐量/延迟阈值、BYOK、Fallback、参数支持、数据政策、ZDR、Provider 允许/忽略、量化和最大价格等能力。

可借鉴的是明确品类、双 CTA、首屏后硬指标，以及把 Provider 选择条件变成可见产品证据。不应照搬其品牌文案、Provider 浮动图标或具体视觉资产。对新主题而言，最重要的升级是把文档里的“决策逻辑”提前到首页：让用户在首屏附近看到一次真实路由选择，而不只是看到模型数量。

### Vercel：用客户结果证明基础设施能力

Vercel 首页把“Agentic Infrastructure”作为高层主张，用 `Deploy now` 和 `Talk to sales` 划分自助与销售转化。真正有参考价值的是后续案例：Notion、Zapier、Mintlify 不只是品牌 Logo，而是把可核验的业务量级与 Durable Orchestration、Sandboxed Environments、AI Model Gateway、Fluid Compute、Global Delivery 等具体能力对应起来。

其首页和 `/ai` 页都采用强定制 Hero，AI 页还将 AI SDK、AI Gateway、Sandbox 等产品入口放在清晰的产品导航中。移动端则不是简单缩小桌面页面：CTA 改为全宽纵排，案例使用独立移动图片，客户 Logo 在移动端变为 marquee；复杂桌面 mega menu 在窄屏转成全屏 dialog 和 `<details>` 分组。

路由平台应借鉴“客户场景 + 精确能力 + 结果”的证据格式，以及为复杂产品场景准备移动专用表达。不宜复制其宽泛的部署平台定位、重量级 Hero 和过于庞大的网格体系。

### Linear：真实产品界面就是首屏最强说明书

Linear 用“The product development system for teams and agents”定义系统级价值，随后直接放入高保真的产品界面：侧边栏、Inbox、Issue、Activity、Slack 来源和 Agent task 同时出现。访客无需先读长篇功能文案，就能理解产品如何融入工作流。

其信息节奏也很清楚：品牌主张 → 真实界面 → 客户 Logo → 新一代产品工具定位 → Intake、Planning、AI、Build 等四段工作流 → Changelog。社会证明不是孤立装饰，页面还明确给出“over 40,000 product teams”。移动端使用独立视觉与断行，并把复杂能力转成横向卡片，而不是硬压缩桌面工作台。

路由平台最值得借鉴的是：首个产品场景应展示真实的请求、候选 Provider、价格/延迟/健康状态、选择结果和 Fallback，而不是通用 AI 插画；正文按“发送请求—执行策略—故障切换—观测与结算”组织，比按内部模块罗列功能更容易理解。不宜复制 Linear 的超长沉浸页面、偏弱的页面内 CTA 或其品牌化暗色气质。

### Stripe：建立从规模到接入的证据阶梯

Stripe 首页先用业务结果定义价值，再展示带来源与更新时间的规模数据，紧接全球客户 Logo，然后依次进入多产品能力、全球数据、客户案例、开发者代码/集成方式和最新动态。它同时覆盖了管理者的可信度判断和开发者的接入判断。

移动端细节尤其成熟：Hero 波形为 desktop、tablet、mobile 分别提供资源，而移动菜单不仅折叠导航，还在底部固定“立即开始”和“联系销售”，确保浏览复杂目录后仍有明确出口。

路由平台可复用这种证据阶梯：平台规模/状态 → Provider 与模型生态 → 路由能力 → 客户结果 → API 示例与迁移成本。规模数据必须可解释、可更新，不能为了视觉效果制造动态数字。不应复制 Stripe 的彩虹渐变、金融平台级多产品复杂度或与路由业务无关的 GDP 式宏观指标。

### Raycast：动效应展示产品交互，不应只制造气氛

Raycast 从极短主张进入下载，随后用真实扩展卡、键盘操作、系统窗口、AI 场景和人物背书不断证明“快捷入口”如何工作。其动效数量虽多，但主要围绕键盘、扩展出现顺序、AI 窗口切换和用户证言，动效对象本身就是产品。

对路由主题而言，可借鉴的是让状态变化承担解释任务：请求进入、策略筛选、首选 Provider 失败、Fallback 接管、响应完成。每个动作都应对应一个可描述的产品事件。不宜复制深色霓虹风格、多个同时循环的展示区，或消费者效率工具式的超长体验页面。移动端仅确认了导航 toggle 和响应式资源标记，本报告不对其最终小屏构图作额外判断。

### Anthropic / Claude：信任叙事与“CTA 即产品”

Anthropic 首页不是以功能列表开场，而是把研究、产品与安全放在同一价值框架中。随后通过“hard questions”问题网络、最新模型发布、研究和安全材料建立长期可信度。问题网络有滚动触发、`prefers-reduced-motion` 和小屏重排，说明品牌动效也可以有明确语义并具备可访问性。

Claude 产品页则采用完全不同的转化方式：首屏 Prompt 输入框可直接将问题带到 Claude，新用户无需先理解全部能力便能开始体验；后续再按问题拆解、复杂工作、学习、编码、研究、分析、创作和模型组织内容。

路由平台应借鉴对安全、数据策略、可靠性和透明度的持续证明，也可以让 CTA 尽量接近真实任务，例如“获取 API Key”或“用示例请求测试路由”。但不应让研究使命压过产品价值，也不应在缺乏真实、低风险执行环境时复制自由 Prompt Playground。

## 值得借鉴的主题模式

### 1. 一个视口内完成价值、行动和可信度闭环

首屏建议包含：一句品类定义、一句可量化收益、两个不同意图的 CTA，以及一组可核验的平台证据。主 CTA 为“获取 API Key / 开始接入”，次 CTA 为“浏览模型 / 查看路由方式”。指标应优先选择 Provider 数、模型数、近期可用性、处理规模或可验证延迟，而不是抽象“更智能”。

### 2. 用真实路由决策取代抽象 Hero 插画

最具说服力的首屏产品场景可以只演示一条请求：

1. 请求进入统一 API。
2. 根据价格、延迟、上下文长度、数据政策和健康状态筛选。
3. 选中首选 Provider，并显示选择原因。
4. 模拟一次故障后切换到备选 Provider。
5. 返回响应，同时显示耗时、费用和请求 ID。

这同时覆盖 Linear 的真实 UI、Vercel 的能力映射和 Raycast 的解释型动效。

### 3. 按决策顺序安排信息，而不是堆功能

推荐节奏：

1. Hero：统一接口价值、双 CTA、单条真实路由演示。
2. 平台证据：规模、状态、Provider / 模型覆盖。
3. 核心能力：可靠性、成本、性能、策略与数据控制。
4. 工作流：接入、路由、Fallback、观测、结算。
5. 客户/场景：每个案例绑定具体能力和结果。
6. 开发者证据：兼容 API 示例、SDK、迁移步骤和文档入口。
7. 信任层：数据政策、ZDR/BYOK、安全、状态页与透明度。
8. 末尾 CTA：重复自助接入和企业咨询两条路径。

### 4. 动效只表达状态变化，并默认可降级

首页同一时间应只有一个主要运动焦点。路由演示采用一次性、短时、可暂停的状态过渡；避免持续漂浮的 Provider Logo、多个 marquee 和不断变化的数字互相争夺注意力。所有非必要动效应响应 `prefers-reduced-motion`，关闭动效后仍能从静态状态读懂完整流程。

### 5. 移动端重新编排复杂证据

移动端应保留品牌、登录/注册或主 CTA，其他导航进入层级清晰的菜单。双 CTA 改为全宽纵排；桌面的多列路由拓扑改成单条决策卡、分步状态或横向滚动；图表和产品截图提供移动专用裁切，而不是整体缩小到不可读。末尾或菜单底部保持稳定转化入口。

## 不应照搬的做法

- 不复制任何竞品的品牌资产、措辞、Logo 排列、配色或标志性动画。
- 不用无语义的光晕、粒子、浮动 Provider 图标代替产品说明。
- 不在首屏同时展示模型市场、聊天、排名、价格、企业方案等所有产品面。
- 不把未经解释的“大数字”当作可信度；指标应带口径，必要时附更新时间或状态来源。
- 不让企业研究叙事、安全口号或抽象“AI 未来”压过统一接口、路由可靠性与迁移成本。
- 不把桌面 mega menu、完整控制台或复杂拓扑按比例缩到手机上。
- 不为了显得活跃而同时启用波形、marquee、轮播、数字跳动和悬浮动画。
- 不提供无法真实执行、会泄露凭据或会产生意外费用的伪 Playground。

## 推荐的主题首屏蓝图

首屏左侧用一句话说明“一个 API 接入多个模型，并按价格、性能与可用性自动路由”，下方用两行以内解释兼容性和 Fallback。主 CTA 获取 API Key，次 CTA 查看模型与价格。右侧不是抽象插画，而是一张可读的路由决策卡：展示请求模型、三个 Provider 候选、过滤理由、选中结果、响应耗时与成本。

首屏底部紧接四项可信数据。进入下一屏后，用一次短动画演示首选 Provider 失败和备选接管；再用四张能力卡分别解释可靠性、成本控制、性能策略和数据政策。之后依次给出客户案例、兼容 API 代码、三步迁移、状态/安全证据和末尾双 CTA。这样既保留产品型官网的节奏，也不会让视觉展示压过 API 路由的核心价值。

## 官方来源

以下页面均于 2026-08-30 访问：

- [OpenRouter](https://openrouter.ai/)
- [OpenRouter Provider Routing](https://openrouter.ai/docs/guides/routing/provider-selection)
- [Vercel](https://vercel.com/)
- [Vercel AI](https://vercel.com/ai)
- [Linear](https://linear.app/)
- [Stripe 中国官网](https://stripe.com/cn)
- [Stripe Payments](https://stripe.com/cn/payments)
- [Raycast](https://www.raycast.com/)
- [Anthropic](https://www.anthropic.com/)
- [Claude 产品概览](https://claude.com/product/overview)

