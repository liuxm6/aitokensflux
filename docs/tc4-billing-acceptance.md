# P0 TC4：预扣费 / 结算 / 用量验收（Quinn）

本文档描述 **钱包计费** 路径下 relay 请求的验收步骤：预扣费（preconsume）→ 上游成功则结算（settle）并记用量；上游失败则退还预扣费（refund）。**不修改 relay 计费实现**，仅通过现有 HTTP API 观测余额与日志。

## 范围

| 项 | 说明 |
| --- | --- |
| 计费链路 | `PreConsumeBilling` → 成功时 `SettleBilling` + `RecordConsumeLog`；失败时 `BillingSession.Refund`（见 `controller/relay.go` defer） |
| 观测对象 | 用户钱包余额 `user.quota`、消费日志 `type=2`（`LogTypeConsume`） |
| 触发请求 | `POST /v1/chat/completions`（OpenAI 兼容，API Key / Bearer） |

## One Key（单密钥）测试配置

验收使用 **一个 API 令牌** 调用 relay，建议在控制台或管理 API 中按下表配置，避免模型白名单挡住用例：

| 字段 | 值 | 说明 |
| --- | --- | --- |
| `model_limits_enabled` | `false` | 关闭令牌级模型限制（对应 `Token.ModelLimitsEnabled`）；未开启时 middleware 不注入 `token_model_limit`（`middleware/auth.go`） |
| `group` | 覆盖全部待测模型的分组 | 令牌 `group` 须为 `ratio_setting` 中有效分组；用户所属分组须能通过 `GetUserUsableGroups` 使用该分组 |
| `unlimited_quota` | 建议 `true`（默认注册令牌） | 额度从 **用户钱包** `quota` 扣减；若为 `false` 则同时存在令牌 `remain_quota` 预扣，验收仍以 `/api/user/self` 的 `quota` 为主 |

创建/更新令牌：

- `POST /api/token`、`PUT /api/token`（需登录态，见下文「用户鉴权」）
- JSON 字段：`model_limits_enabled`、`group`、`unlimited_quota`、`name` 等（`controller/token.go`）

用户可用分组：

- `GET /api/user/groups`（匿名可读分组名列表）
- `GET /api/user/self/groups`（登录后可用分组及倍率说明）

## 鉴权与基址

将 `{ORIGIN}` 替换为部署根 URL（无尾斜杠）。

### 用户鉴权（查余额、用量日志）

路由：`router/api-router.go` → `middleware.UserAuth()`。

| 方式 | 用法 |
| --- | --- |
| 浏览器会话 | 控制台登录后的 Cookie（Customer / Default 前端） |
| Access Token | `Authorization: Bearer <access_token>`，且 **必须** 带 `New-Api-User: <用户数字 ID>`（`middleware/auth.go`） |

Access Token：`GET /api/user/token`（登录态）。

### Relay 鉴权（触发计费）

| 方式 | 用法 |
| --- | --- |
| API Key | `Authorization: Bearer sk-<token_key>`（`middleware.TokenAuth()`，`router/relay-router.go`） |

### OpenAI 兼容余额/累计用量（可选对照）

路由：`router/dashboard.go`，同样使用 **API Key**（`TokenAuth`），**不是** 控制台会话：

| 方法 | 路径 | 处理器 | 含义 |
| --- | --- | --- | --- |
| GET | `/dashboard/billing/subscription` | `GetSubscription` | 剩余额度等（受 `DisplayTokenStatEnabled` 影响，默认按用户钱包） |
| GET | `/v1/dashboard/billing/subscription` | 同上 | 别名 |
| GET | `/dashboard/billing/usage` | `GetUsage` | 累计已用额度（展示换算后） |
| GET | `/v1/dashboard/billing/usage` | 同上 | 别名 |

令牌维度快照（含钱包字段）：

| 方法 | 路径 | 处理器 |
| --- | --- | --- |
| GET | `/api/usage/token/` | `GetTokenUsage` → `data.wallet_quota`、`data.user_quota` 等 |

## 观测 API（验收必读）

以下路径均来自 `router/api-router.go` / `controller`，为 **用户自助** 查询入口。

### 余额

| 方法 | 路径 | 字段 |
| --- | --- | --- |
| GET | `/api/user/self` | `data.quota`（钱包剩余，内部额度单位）、`data.used_quota`（累计已用） |

实现：`controller.GetSelf`（`user.go`）。

### 用量明细（Usage 行）

| 方法 | 路径 | 查询参数 | 说明 |
| --- | --- | --- | --- |
| GET | `/api/log/self` | `p`、`page_size`（或 `ps`/`size`）、`type`、`start_timestamp`、`end_timestamp`、`model_name`、`token_name`、`group`、`request_id` | 分页消费记录；`type=2` 为消费（`LogTypeConsume`） |
| GET | `/api/log/self/stat` | 同上（常用 `type=2`） | 聚合：`data.quota`、`rpm`、`tpm` |

实现：`controller.GetUserLogs`、`GetLogsSelfStat`（`log.go`）。单条日志 JSON 含 `quota`、`model_name`、`token_name`、`request_id`、`created_at` 等（`model.Log`）。

Customer 前端默认拉消费统计时使用 `type=2`（`web/customer/src/services/customer-api.ts`）。

### 触发计费

| 方法 | 路径 |
| --- | --- |
| POST | `/v1/chat/completions` |

请求体示例（非流式便于断言）：

```json
{
  "model": "<环境中已配置且分组可用的模型>",
  "messages": [{ "role": "user", "content": "TC4 ping" }],
  "max_tokens": 16,
  "stream": false
}
```

## TC4-1：成功请求 — 余额下降，Usage +1 且金额一致

**目的**：确认预扣费后结算，钱包减少量与新增消费日志 `quota` 一致。

1. **记录基线**（同一用户、短时间窗口内完成后续步骤）  
   - `B0 = GET /api/user/self` → `data.quota`  
   - `L0 = GET /api/log/self?type=2&p=1&page_size=20` → `total`（或记录最新一条 `id`）

2. **发起成功 relay**  
   - `POST {ORIGIN}/v1/chat/completions`，Header：`Authorization: Bearer sk-...`  
   - 期望 HTTP 200，响应含有效 completion。

3. **断言余额**  
   - `B1 = GET /api/user/self` → `data.quota`  
   - **通过**：`B1 < B0`（若非信任额度旁路且模型非免费；见文末说明）  
   - `Δ_balance = B0 - B1`

4. **断言 Usage**  
   - `L1 = GET /api/log/self?type=2&p=1&page_size=20`（可加 `start_timestamp` 为步骤 1 时刻）  
   - **通过**：相对 `L0` **新增恰好 1 条** `type=2` 记录，且该条 `model_name` 与请求一致。  
   - 记该条 `quota = Q_log`。  
   - **通过**：`Q_log` 与 `Δ_balance` 一致（结算差额为 0 时相等；若预扣与实际 token 不同，以 **结算后** 余额差与日志 `quota` 为准，二者仍应一致）。

5. **可选交叉验证**  
   - `GET /api/log/self/stat?type=2&start_timestamp=...` 窗口内 `data.quota` 增量 ≈ `Q_log`  
   - `GET /api/usage/token/` 中 `wallet_quota` 与 `B1` 一致。

## TC4-2：失败请求 — 预扣费退还，余额恢复

**目的**：下游失败时 `relayInfo.Billing.Refund` 执行，钱包回到调用前水平，且不产生（或不多产生）消费日志。

1. **记录基线**  
   - `B0 = GET /api/user/self` → `data.quota`  
   - `L0 = GET /api/log/self?type=2&...` → `total`

2. **发起必定失败的 relay**（任选一种，须走完整预扣路径）  
   - 使用 **不存在或未授权** 的 `model`（如 `tc4-invalid-model-do-not-exist`），或  
   - 使用会导致上游/渠道错误的参数（确保在预扣之后失败，而非鉴权阶段失败）。  
   - 期望 HTTP 4xx/5xx 或 OpenAI 风格 `error` 体。

3. **等待退款**（`BillingSession.Refund` 异步，`service/billing_session.go`）  
   - 间隔 1–3 秒轮询 `GET /api/user/self`，直至 `quota` 稳定。

4. **断言余额**  
   - `B1 = GET /api/user/self` → `data.quota`  
   - **通过**：`B1 == B0`（允许最后一次轮询前短暂低于 `B0` 的情况在稳定后恢复）。

5. **断言 Usage**  
   - `L1 = GET /api/log/self?type=2&...`  
   - **通过**：`total` 与 `L0` 相同（失败路径不应新增 `LogTypeConsume` 行）。

6. **日志侧证（可选）**  
   - 服务端日志可出现：`用户 <id> 请求失败, 返还预扣费`（`billing_session.go`）。

## 通过标准汇总

| 用例 | 余额 (`/api/user/self` `quota`) | 用量 (`/api/log/self` `type=2`) |
| --- | --- | --- |
| TC4-1 成功 | 减少；减少量 = 新日志 `quota` | 新增 1 条，字段与请求匹配 |
| TC4-2 失败 | 恢复至调用前 | 无新增消费行 |

## 附录：影响观测的已知行为

- **信任额度旁路**：额度充足时可能 `effectiveQuota=0` 预扣（`billing_session.preConsume`），此时 TC4-1 余额瞬时不变，仍以结算后日志 `quota` 与 `used_quota` 为准。验收应使用 **非免费、会真实计费** 的模型，且用户额度不要大到触发信任旁路（或改用较小测试账户）。  
- **免费模型**：`priceData.FreeModel` 时跳过预扣（`controller/relay.go`），不适用于 TC4。  
- **结算差额**：实际 token 与预扣不同时，`SettleBilling` 补扣或返还差额；余额变化与消费日志 `quota` 均为 **最终实际消耗**。  
- **展示型接口**：`/dashboard/billing/*` 经展示类型换算，验收以 `data.quota` 原始整数为准。

## 代码索引（便于复核）

|  Concern | 位置 |
| --- | --- |
| 路由：用户 self / 日志 | `router/api-router.go` |
| 路由：relay | `router/relay-router.go` |
| 路由：OpenAI billing | `router/dashboard.go` |
| 余额响应 | `controller/user.go` → `GetSelf` |
| 日志列表 | `controller/log.go` → `GetUserLogs` |
| 失败退款 | `controller/relay.go` defer → `Billing.Refund` |
| 预扣/结算 | `service/billing.go`、`service/billing_session.go` |
| 消费日志类型 | `model/log.go` → `LogTypeConsume = 2` |
