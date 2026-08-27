# OpenCode 中 Claude 的计费方式

> 调研日期：2026-07-29（Asia/Shanghai）

## 结论

OpenCode 本身是免费客户端，Claude 费用取决于所连接的 provider。官方支持的主要方式是 OpenCode Zen 按 token 预付费，或者配置 Anthropic API Key 由 Anthropic 直接按 API 用量扣费。OpenCode Zen 不是固定月费套餐，没有 Factory 式滚动额度窗口。

Claude Pro/Max 网页订阅不能作为 OpenCode 的官方计费来源。OpenCode 官方文档明确说明，允许在 OpenCode 中使用 Claude Pro/Max 的第三方插件被 Anthropic 明确禁止，OpenCode 自 1.3.0 起不再内置这些插件。

## OpenCode Zen

Zen 使用 pay-as-you-go 模式，按实际输入、输出、缓存读取和缓存写入 token 计费。价格单位为美元/百万 token。

| 模型 | 输入 | 输出 | Cache Read | Cache Write |
|---|---:|---:|---:|---:|
| Claude Fable 5 | $10 | $50 | $1 | $12.50 |
| Claude Opus 5 / 4.8 / 4.7 / 4.6 / 4.5 | $5 | $25 | $0.50 | $6.25 |
| Claude Sonnet 5 | $2 | $10 | $0.20 | $2.50 |
| Claude Sonnet 4.6 | $3 | $15 | $0.30 | $3.75 |
| Claude Sonnet 4.5，≤200K | $3 | $15 | $0.30 | $3.75 |
| Claude Sonnet 4.5，>200K | $6 | $22.50 | $0.60 | $7.50 |
| Claude Haiku 4.5 | $1 | $5 | $0.10 | $1.25 |

计算公式：

```text
费用 = 输入 token / 1,000,000 × 输入价
     + 输出 token / 1,000,000 × 输出价
     + cache read token / 1,000,000 × cache read 价
     + cache write token / 1,000,000 × cache write 价
```

例如不使用缓存时，10 万输入 token、1 万输出 token：

| 模型 | 费用 |
|---|---:|
| Sonnet 5 | $0.30 |
| Sonnet 4.6 | $0.45 |
| Opus 5/4.8 | $0.75 |
| Haiku 4.5 | $0.15 |

OpenCode 会使用 Haiku、Nano、Flash 等低价模型生成会话标题，因此使用记录中可能出现没有手动选择的低价模型小额消费。

## 充值和限额

- Zen 使用账户预付余额；
- 默认余额低于 $5 时自动充值 $20；
- 自动充值金额可以修改，也可以关闭；
- 可以为 workspace 和成员设置月度使用上限；
- 月度使用上限限制消费，但自动充值可能使当月信用卡实际扣款高于设置的上限，因为充值余额可以留待以后使用；
- OpenCode 表示模型按成本提供，不额外加价；信用卡处理费按成本收取，为充值金额的 4.4% 加 $0.30/笔。

## Anthropic API Key / BYOK

如果在 OpenCode 中直接配置 Anthropic API Key：

- 请求直接由 Anthropic API 计费；
- 不经过 Zen 余额；
- OpenCode 不另外收模型费用；
- 定价、余额、速率限制和账单都在 Anthropic API Console 管理；
- Claude Pro/Max 网页订阅费不包含 Anthropic API 额度。

Zen workspace 也允许配置自己的 Anthropic Key；使用该 Key 的 token 由 Anthropic 直接扣费，不从 Zen 余额扣除。

## 与 Factory/Kiro 的差异

| 平台 | 主要计费方式 | 是否固定订阅额度 |
|---|---|---|
| OpenCode Zen | 按 token 从预付余额扣费 | 否 |
| Anthropic BYOK | Anthropic API 按 token 扣费 | 否 |
| Factory | Standard Credits + 5小时/7天/30天窗口 | 隐藏的窗口额度 |
| Kiro | 月费包含固定 credits | 是 |

Zen 的优势是透明、随用随付，适合轻量或不连续使用；重度持续使用 Claude 时，应将实际月 token 成本与 Cursor、Kiro、Factory 的订阅包进行比较。

## 官方来源

- [OpenCode Zen](https://opencode.ai/docs/zen/)
- [OpenCode Providers](https://opencode.ai/docs/providers/)
- [OpenCode Zen 模型接口](https://opencode.ai/zen/v1/models)
