# Google Antigravity 当前支持的 Claude 模型

> 调研日期：2026-08-11（Asia/Shanghai）  
> 范围：Google Antigravity 原生上游模型 ID；不把代理别名、其他 Claude 渠道模型或客户端兼容枚举算作当前可用模型。

## 结论

Google 官方 [Antigravity Models][official-models] 页面当前只列出两个 Claude 核心推理模型：

| 官方显示名称 | Antigravity 上游模型 ID | Free / Google AI Plus、Pro、Ultra | Enterprise | 上下文 / 最大输出 |
|---|---|---|---|---|
| Claude Sonnet 4.6 (Thinking) | `claude-sonnet-4-6` | 支持 | 当前不支持 | 200,000 / 64,000 |
| Claude Opus 4.6 (Thinking) | `claude-opus-4-6-thinking` | 支持 | 当前不支持 | 200,000 / 64,000 |

两者在 CLIProxyAPI 目录中均支持动态 Thinking，预算为 0 或 1,024–64,000。

本项目正式环境 2026-08-11 的 CLIProxy `/v1/models` 实测也只返回这两个 `owned_by=antigravity` 的 Claude 条目，与当前 CLIProxyAPI 模型目录一致。

简明回答：**Sonnet 4.6 和 Opus 4.6 Thinking**。调用时应使用上表中的精确模型 ID，尤其 Opus 必须带 `-thinking`。

## 证据与范围

Google 官方页面说明核心推理模型的可用性取决于方案；其模型表格和模型选择器都只列出 Claude Sonnet 4.6 (Thinking) 与 Claude Opus 4.6 (Thinking)。[Google Antigravity Models][official-models]

官方页面没有公开 API 使用的 raw model ID。CLIProxyAPI 当前 `main` 固定提交 `bd34ceca` 的 `antigravity` 模型目录首先列出上述两个 Claude 条目，紧接着便进入 Gemini 条目，没有第三个 Claude 模型，因此可用于对应官方显示名与上游调用 ID。[当前 Antigravity 模型目录][cliproxy-models]

CLIProxyAPI 的模型抓取工具显示，Antigravity 第一方模型发现请求发往 Google 域名：

```text
POST https://cloudcode-pa.googleapis.com/v1internal:fetchAvailableModels
POST https://daily-cloudcode-pa.googleapis.com/v1internal:fetchAvailableModels
```

请求需要 Antigravity OAuth Bearer Token，并可携带 `project`。工具会读取返回对象中的模型 ID、`displayName`、`maxTokens` 和 `maxOutputTokens`。[模型抓取实现][fetch-models]

需要注意：当前常驻服务注册模型时，目录来源仍是 `registry.GetAntigravityModels()`；在线 `fetchAvailableModels` 在这条路径中只用于补充 Web Search 能力提示。因此 CLIProxyAPI 源码是对 Google 第一方端点和客户端行为的适配证据，并不是 Google 对外发布的稳定模型矩阵。[运行时模型注册][service-models] [能力提示抓取][capability-fetch]

模型可用性可能受账号、地区、灰度发布和配额方案影响。判断某个账号“现在实际能用什么”，应以该账号认证后第一方 `fetchAvailableModels` 的结果，以及代理 `/v1/models` 中 `owned_by=antigravity` 的条目为准。

## 原生模型、别名和其他渠道的区别

- `claude-opus-4-6-thinking` 是当前 Antigravity 原生 ID；`claude-opus-4-6` 没有 `-thinking` 时，不应自动视为同一个原生模型。
- `claude-sonnet-4-6` 同时可能出现在其他 Claude 渠道。只看 ID 不足以确定后端，必须同时确认 provider/`owned_by` 是 `antigravity`。
- `claude-sonnet-4.6`、`claude-opus-4.6` 等点号写法不是这里记录的 Google 上游 ID，通常是网关自己的展示名或映射名。
- Claude 4.5、Haiku、Fable、Opus 4.7/4.8 等即使出现在其他 Claude provider、客户端旧枚举或第三方面板，也不能据此认定为 Antigravity 当前原生可用模型。

CLIProxyAPI 明确支持给 Antigravity OAuth 渠道配置任意客户端可见别名，并警告合并后的 `/v1/models` 可能因跨 provider 同名而产生歧义。`name` 才是上游 Antigravity 模型 ID，`alias` 只是客户端可见 ID。[别名配置说明][alias-config]

因此，第三方代理若展示更多 Claude 名称，应继续检查：

1. 返回模型的 `owned_by`/provider 是否确为 `antigravity`；
2. 是否配置了 `oauth-model-alias.antigravity`；
3. 请求日志中的最终上游模型 ID 是否仍落到上述两个原生 ID；
4. 是否实际上路由到了独立的 Anthropic、Claude OAuth、Vertex 或其他兼容渠道。

## 来源

- [Google 官方：Antigravity Models][official-models]
- [CLIProxyAPI：当前 Antigravity 模型目录][cliproxy-models]
- [CLIProxyAPI：Google Antigravity 模型抓取实现][fetch-models]
- [CLIProxyAPI：Antigravity 模型注册逻辑][service-models]
- [CLIProxyAPI：在线能力提示抓取][capability-fetch]
- [CLIProxyAPI：OAuth 模型别名配置说明][alias-config]
- [Google 第一方模型发现端点][google-model-endpoint]（需认证，不能匿名浏览）

[official-models]: https://antigravity.google/docs/models
[cliproxy-models]: https://github.com/router-for-me/CLIProxyAPI/blob/bd34ceca04209ef0460f4b05e3a1a047fb7fad2a/internal/registry/models/models.json#L2443-L2490
[fetch-models]: https://github.com/router-for-me/CLIProxyAPI/blob/bd34ceca04209ef0460f4b05e3a1a047fb7fad2a/cmd/fetch_antigravity_models/main.go#L40-L44
[service-models]: https://github.com/router-for-me/CLIProxyAPI/blob/bd34ceca04209ef0460f4b05e3a1a047fb7fad2a/sdk/cliproxy/service_models.go#L102-L106
[capability-fetch]: https://github.com/router-for-me/CLIProxyAPI/blob/bd34ceca04209ef0460f4b05e3a1a047fb7fad2a/sdk/cliproxy/antigravity_models.go#L15-L19
[alias-config]: https://github.com/router-for-me/CLIProxyAPI/blob/bd34ceca04209ef0460f4b05e3a1a047fb7fad2a/config.example.yaml#L541-L579
[google-model-endpoint]: https://cloudcode-pa.googleapis.com/v1internal:fetchAvailableModels
