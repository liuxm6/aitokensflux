# Cursor、Kiro 与 Factory.ai 的 Claude 使用额度性价比

> 调研日期：2026-07-29（Asia/Shanghai）  
> 范围：只比较官方公布的订阅价格、包含额度、Claude 消耗规则与超额规则；不采用第三方评测或网友实测。

## 结论摘要

官方资料使用了三套不可直接换算的单位：Cursor 按模型的 API-priced usage（美元等值）扣费，Kiro 按内部 credit（工作量单位）扣费，Factory 按未公开绝对上限的 Standard Credits 和滚动 Rate Limits 控制用量。因此，官方数据不足以严格证明“同样的 Claude 任务在哪个平台一定更便宜”。

实际选择建议：

- Claude Opus 重度使用、重视账单可预测性：优先看 Cursor Ultra。它每月 $200，官方文档口径包含 $400 API-priced agent usage；Claude 按实际模型 API 成本扣减，额度最透明。[Cursor Pricing][cursor-pricing] [Cursor Plans & Usage][cursor-plans]
- Claude Sonnet 中轻度使用、预算约 $20：可先试 Kiro Pro。它每月 $20，包含 1,000 credits；同一任务相对 Auto，Sonnet 按 1.3x、Opus 按 2.2x、Haiku 按 0.4x credits 消耗。[Kiro Pricing][kiro-pricing] [Kiro Models][kiro-models]
- Kiro 的 Pro、Pro+、Pro Max、Power 在“订阅费/包含 credits”上完全同价：都是每 $1 获得 50 credits。升级只增加容量，不改善单位价格。[Kiro Pricing][kiro-pricing]
- Cursor 内部若只看“包含 API-priced usage / 订阅费”，Ultra 最划算，其次 Pro+、Pro；Teams 的额外费用主要购买团队管理能力。[Cursor Pricing][cursor-pricing] [Cursor Plans & Usage][cursor-plans]
- Factory 的 Claude credit 倍率略低于 Kiro：Sonnet 为 1.2x 对 1.3x，Opus 为 2x 对 2.2x，Haiku 都是 0.4x；但 Factory 不公开 Pro 的绝对 Standard Credits，因此不能据此断言 Factory 可完成更多任务。[Factory Models][factory-models] [Factory Individual Plans][factory-individual]
- Factory Plus（$100）约为 Pro 的 5 倍用量，Max（$200）约为 Pro 的 10 倍用量，和月费同比增长，没有公开的升级折扣；其主要差异是容量和功能。[Factory Individual Plans][factory-individual]

## Cursor

### 当前订阅价格与包含额度

Cursor 当前定价页列出的月费如下；个人方案中 Pro+ 宣传为 Claude 等模型 3x usage，Ultra 为 20x usage。这里的 3x/20x 是相对 Pro 的方案用量宣传口径，不是 Claude 单次请求的计费倍率。[Cursor Pricing][cursor-pricing]

| 方案 | 月费 | 官方文档的 included API-priced agent usage | 额度/订阅费 |
|---|---:|---:|---:|
| Hobby | $0 | 官方未公布固定美元额度 | 无法计算 |
| Pro | $20 | $20/月 | 1.00x |
| Pro+ | $60 | $70/月 | 1.17x |
| Ultra | $200 | $400/月 | 2.00x |
| Teams | $40/用户/月 | $20/用户/月 | 0.50x |

月费来自当前 [Cursor Pricing][cursor-pricing]；API-priced usage、usage-based pricing 和团队超额控制来自 [Cursor Plans & Usage][cursor-plans]。Teams 还包含集中结算、用量分析和团队管理等能力，不能只按模型额度评价其完整价值。

### Claude 的扣费方式

Cursor 当前不是给 Claude 固定“请求次数”，而是按照所选模型的实际 API inference cost 消耗方案内美元等值额度。实际消耗会受模型版本、输入/输出 token、上下文长度和缓存使用影响。[Cursor Plans & Usage][cursor-plans] [Cursor Models][cursor-models]

这意味着：

- Cursor 没有公布一个适用于所有 Claude Sonnet/Opus 版本的固定 credits 倍率。
- 同样的 token 量下，价格更高的 Opus 会比 Sonnet 更快消耗同一美元额度。
- 旧版“500 fast requests”或 request multiplier 属于旧计费体系，不应与当前 API-priced usage 混算。2025 年的官方定价说明记录了这一迁移背景。[June 2025 Pricing][cursor-june-pricing]

### 超额规则

方案内额度用尽后，可以启用 usage-based/on-demand usage，继续按模型实际 API-priced usage 计费；若不启用，则会受到用量限制。Teams 的额外支出由管理员控制并进入团队账单。[Cursor Plans & Usage][cursor-plans]

可近似表达为：

```text
Cursor 月成本 = 订阅费 + max(当月模型 API-priced usage - 方案包含 usage, 0)
```

## Kiro

### 当前订阅价格与包含额度

Kiro 官方定价页当前列出以下个人方案。付费方案可使用 premium models；页面明确举例包括 Auto、Claude Sonnet 4.6 和 Claude Opus 4.8，但模型可用性可能因国家或地区而异。[Kiro Pricing][kiro-pricing]

| 方案 | 月费 | 每月 credits | 每 $1 包含 credits | 按 add-on 单价折算的名义价值 |
|---|---:|---:|---:|---:|
| Free | $0 | 50 | — | $2 |
| Pro | $20 | 1,000 | 50 | $40 |
| Pro+ | $40 | 2,000 | 50 | $80 |
| Pro Max | $100 | 5,000 | 50 | $200 |
| Power | $200 | 10,000 | 50 | $400 |

“名义价值”仅用官方 add-on 价格 $0.04/credit 做平台内部比较，不能视为 Claude API 美元额度，也不能与 Cursor 的 API-priced usage 直接等值换算。[Kiro Pricing][kiro-pricing]

### credit 与 Claude 模型消耗

Kiro 官方将 credit 定义为响应用户 prompt 的“工作量单位”：简单 prompt 可能少于 1 credit，复杂任务（例如执行 spec task）通常超过 1 credit，并精确计量到 0.01 credit。[Kiro Pricing][kiro-pricing]

Kiro 官方模型文档给出的 Claude 消耗倍率如下；倍率表示同一工作量相对于 Auto 的 credit 消耗，不是 token 价格倍率。[Kiro Models][kiro-models]

| Claude 模型 | 相对 Auto 的 credit 消耗 |
|---|---:|
| Haiku 4.5 | 0.4x |
| Sonnet 5、4.6、4.5、4.0 | 1.3x |
| Opus 5、4.8、4.7、4.6、4.5 | 2.2x |

例如：

```text
同一个任务在 Auto 消耗 X credits：
Haiku 消耗 0.4X，Sonnet 消耗 1.3X，Opus 消耗 2.2X credits。
```

因此，在基础任务本身消耗 `X` 个 Auto credits 的前提下，1,000 credits 理论上可承载约 `769.2 / X` 个 Sonnet 同类任务，或 `454.5 / X` 个 Opus 同类任务。但 Kiro 没有公布 credit 到输入/输出 token 或 API 美元成本的换算公式，且每个任务的基础 `X` 会随工作量变化，所以仍无法把“1,000 Kiro credits”换算成固定请求数或 Claude API 美元额度。[Kiro Pricing][kiro-pricing] [Kiro Models][kiro-models]

### 超额规则

- 个人付费方案：可以购买 add-on credits，价格为 $0.04/credit；pack 从 $5（125 credits）起，最高 $100。未使用的 add-on credits 可结转，但购买后 12 个月到期。[Kiro Pricing][kiro-pricing] [Kiro Add-on Credits][kiro-addons]
- Teams/Enterprise：管理员可以开启 overages，超出方案额度的部分按 $0.04/credit 在月底结算；默认关闭。[Kiro Pricing][kiro-pricing]
- 月度订阅 credits：每个账单月开始时重置，未使用部分不结转。[Kiro Pricing][kiro-pricing]

可近似表达为：

```text
Kiro 月成本 = 订阅费 + 额外购买 credits × $0.04
```

但不同模型和任务复杂度会改变实际 credit 消耗。

## Factory.ai

### 当前订阅价格与用量口径

Factory 个人计划不是公开固定 Claude 请求数或固定美元额度，而是使用 Standard Credits，并同时受 5 小时、7 天、30 天三个独立滚动窗口约束。发送请求时必须在三个窗口中都还有余量。[Factory Individual Plans][factory-individual]

| 方案 | 月费 | 官方公布的相对用量 | 绝对 Standard Credits |
|---|---:|---:|---:|
| Pro | $20 | 基准 | 未公开 |
| Plus | $100 | 约 5x Pro | 未公开 |
| Max | $200 | 约 10x Pro | 未公开 |

Plus 和 Max 的月费分别也是 Pro 的 5 倍、10 倍，因此官方数据没有显示单位额度随升级变便宜。未使用的 Standard Usage 不结转。Standard Usage 用尽后，可切换到具有独立限制的 Droid Core 开放权重模型池；若要继续使用标准模型，可以购买最低 $10、不过期的 USD-denominated Extra Usage。[Factory Individual Plans][factory-individual]

### Claude 模型消耗倍率

Factory 官方模型页给出的当前倍率如下。倍率驱动 Standard Credit 消耗，但 Factory 未公布一个 Standard Credit 对应多少 token、API 美元或固定任务量。[Factory Models][factory-models]

| Claude 模型 | Factory 倍率 | Kiro 倍率 | 对比 |
|---|---:|---:|---|
| Haiku 4.5 | 0.4x | 0.4x | 相同 |
| Sonnet 5 / 4.6 / 4.5 | 1.2x | 1.3x | Factory 低约 7.7% |
| Opus 5 / 4.8 / 4.7 / 4.6 / 4.5 | 2x | 2.2x | Factory 低约 9.1% |
| Opus 5 Fast | 4x | 未单列 | Factory 为普通 Opus 5 的 2 倍 |

Factory 还列出了 Claude Fable 5（4x），但它不适合作为普通 Sonnet/Opus 额度比较基准。

Factory 的倍率表面上优于 Kiro，但两个平台的 credit 定义和基础额度不同：`Factory 1.2x` 不能直接与 `Kiro 1.3x` 按百分比换算实际月任务量。只有在两边的基准 credit 池和任务计量相同的假设下，Factory 的倍率优势才会转化为更多 Claude 请求，而官方没有提供这一前提。

## 同价位比较

| 月预算 | Cursor | Kiro | Factory.ai | 官方数据能支持的判断 |
|---:|---|---|---|---|
| $20 | Pro：$20 API-priced usage | Pro：1,000 credits | Pro：基准 Standard Usage，绝对额度未公开 | Cursor 最透明；Kiro 有固定 credit 数；Factory 的 Sonnet/Opus 倍率略低，但无法知道 credit 池大小。 |
| $40–60 | Pro+：$60、$70 API usage | Pro+：$40、2,000 credits | 无对应档位 | Kiro 更便宜但额度不可换算；Cursor 的美元池更透明。 |
| $100 | 无对应个人档 | Pro Max：5,000 credits | Plus：约 5x Pro usage | 两者都是线性扩容；Kiro 公布 5,000 credits，Factory 未公布绝对额度。 |
| $200 | Ultra：$400 API usage | Power：10,000 credits | Max：约 10x Pro usage | Cursor 有明确 $400 API usage，最便于估算重度 Claude 成本；Factory 和 Kiro 不能用 credit 数/倍率与其严格换算。 |

## 信息限制与页面不一致

- Kiro Pricing 页面当前可见方案卡片/结构化数据对 Free 可用模型存在版本文字不一致：有位置写 Claude Sonnet 4.5，FAQ 文本又写 Sonnet 4.6。付费方案说明还同时出现 Opus 4.8 与 FAQ 中较早的 Opus 4.5/4.6/4.7 列表。模型是否在用户所在地区和账号中可用，应以 Kiro 客户端/账户页为准。[Kiro Pricing][kiro-pricing]
- Cursor Pricing 的 3x 宣传口径与文档中的 Pro+ `$70 ÷ $20 = 3.5x` 不完全一致，因此精确成本比较采用官方文档的美元额度，营销倍率只作为等级描述。[Cursor Pricing][cursor-pricing] [Cursor Plans & Usage][cursor-plans]
- Factory 只公布 Plus/Max 相对 Pro 的约 5x/10x，没有公开 Pro 的 5 小时、7 天、30 天窗口绝对上限，因此无法计算每美元 Standard Credits 或固定 Claude 任务数。[Factory Individual Plans][factory-individual]
- 三个平台都可能更新模型列表、bonus usage、滚动限制或地区可用性。实际购买前应再次查看账户 Dashboard 显示的当期额度和模型价格。

## 最终建议

1. 经常手动指定 Opus、追求成本可预测：优先 Cursor Ultra。官方明确给出 $200 订阅包含 $400 API-priced usage；Factory 和 Kiro 都无法从公开 credit 数据换算实际 token 成本。
2. 主要用 Sonnet、月预算约 $20：Kiro Pro 和 Factory Pro 都值得试。Kiro 的优势是公开 1,000 credits；Factory 的优势是 Sonnet 倍率 1.2x、略低于 Kiro 的 1.3x，并在标准额度用尽后可免费切 Droid Core，但 Factory 不公开绝对额度。
3. 预算 $100：若重视额度可核算，选 Kiro Pro Max（5,000 credits）；若重视 Droid 工作流、后台代理和开放权重模型兜底，可选 Factory Plus，但不能仅凭“约 5x”判断比 Kiro 多。
4. 预算 $200：纯看官方可验证的 Claude 额度，Cursor Ultra 是最稳妥结论；Kiro Power 和 Factory Max 都是线性扩容，单位价格没有因升级明显改善。
5. Factory 与 Kiro 二选一时，建议先各用一个月的 $20 档，并记录相同仓库、相同 Claude 模型下完成任务数和触发限制的时间。由于 Factory 有三重滚动窗口，实测时应分别观察 5 小时、7 天和 30 天限制。

## 官方来源

- [Cursor Pricing][cursor-pricing]
- [Cursor Plans & Usage][cursor-plans]
- [Cursor Models][cursor-models]
- [Cursor 官方博客：June 2025 Pricing][cursor-june-pricing]
- [Cursor 官方博客：New Tier / Ultra][cursor-ultra]
- [Kiro Pricing][kiro-pricing]
- [Kiro Models][kiro-models]
- [Kiro Add-on Credits][kiro-addons]
- [Factory Individual Plans][factory-individual]
- [Factory Models][factory-models]

[cursor-pricing]: https://cursor.com/pricing
[cursor-plans]: https://cursor.com/docs/account/pricing
[cursor-models]: https://cursor.com/docs/models
[cursor-june-pricing]: https://cursor.com/blog/june-2025-pricing
[cursor-ultra]: https://cursor.com/blog/new-tier
[kiro-pricing]: https://kiro.dev/pricing/
[kiro-models]: https://kiro.dev/docs/models/
[kiro-addons]: https://kiro.dev/docs/billing/add-on-credits/
[factory-individual]: https://docs.factory.ai/pricing/individuals
[factory-models]: https://docs.factory.ai/models
