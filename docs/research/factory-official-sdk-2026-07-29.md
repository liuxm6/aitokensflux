# Factory 官方 Droid SDK 调研

> 调研日期：2026-07-29（Asia/Shanghai）

## 结论

Factory 有官方、开源的 Droid SDK，定位与 Cursor Agent SDK 类似：让应用程序驱动完整的编程代理，而不是提供一个普通的 Claude/OpenAI 模型推理客户端。

- TypeScript：[`@factory/droid-sdk`](https://www.npmjs.com/package/@factory/droid-sdk)，源码仓库 [`Factory-AI/droid-sdk-typescript`](https://github.com/Factory-AI/droid-sdk-typescript)
- Python：[`droid-sdk`](https://pypi.org/project/droid-sdk/)，源码仓库 [`Factory-AI/droid-sdk-python`](https://github.com/Factory-AI/droid-sdk-python)

个人 Pro、Plus、Max 方案的官方说明明确包含 Factory App、Droid CLI 和 Droid SDK，并统一受 Standard Usage 与 5 小时、7 天、30 天滚动 Rate Limits 约束。因此，SDK 使用 Factory 托管模型时走当前账号/Factory API Key 的方案用量，而不是另送一套独立额度。

## 工作方式

Droid SDK 依赖本机已经安装并可认证的 `droid` CLI，通过子进程和 `stream-jsonrpc` 协议与 Droid 通信。它不是直接请求 Anthropic Messages API，也不是通用的 OpenAI SDK。

认证流程：

1. 安装 Droid CLI；
2. 从 Factory 设置创建 `fk-...` API Key；
3. 设置 `FACTORY_API_KEY`；
4. SDK 启动 Droid 进程并建立 JSON-RPC 会话。

## TypeScript SDK

- npm 包：`@factory/droid-sdk`
- Node.js 18+
- Apache-2.0
- 支持 `run()` 单次任务；
- 支持 `createSession()`、`resumeSession()` 多轮会话；
- 流式文本、思考、工具调用、工具结果和 token usage 事件；
- JSON Schema structured output；
- SDK 内 MCP 工具；
- 模型、reasoning effort、工具权限和 autonomy 配置；
- 会话中断、fork、compact、rewind 和本地会话发现。

示例：

```ts
import { run } from '@factory/droid-sdk'

const result = await run('检查当前项目的测试失败原因', {
  cwd: '/workspace/project',
  modelId: 'claude-sonnet-4-6'
})

console.log(result.text)
```

## Python SDK

Python 官方仓库为 `Factory-AI/droid-sdk-python`，包名为 `droid-sdk`，面向 asyncio 应用，支持流式事件、会话控制、通知、权限处理和类型化事件。

## 与普通模型 SDK/反代的区别

| 能力 | Droid SDK | OpenAI/Anthropic 模型 SDK |
|---|---|---|
| 调用对象 | 完整 Droid 编程代理 | 单次模型推理 API |
| 本地文件和命令工具 | 支持 | 默认不支持 |
| 多轮代理会话 | 原生支持 | 应用自行实现 |
| 流式输出 | 支持 | 支持 |
| OpenAI/Anthropic HTTP 兼容 | 不直接兼容 | 原生协议 |
| 订阅额度 | 使用 Factory 账号的 Standard Usage/窗口限制 | 按 API 账户计费 |

SDK 本身不会暴露 `/v1/chat/completions` 或 `/v1/messages`。如需接入现有 API 网关，需要在 SDK 外增加协议适配层，处理：

- OpenAI/Anthropic 请求与 Droid session 的映射；
- SSE 流式事件转换；
- 工具调用和工具结果转换；
- 会话生命周期；
- Factory 限流、错误和 token usage；
- 网关鉴权与并发控制。

## 官方来源

- [Factory Individual Plans](https://docs.factory.ai/pricing/individuals)
- [Factory Droid Exec / JSON-RPC](https://docs.factory.ai/droid-exec/overview)
- [TypeScript SDK](https://github.com/Factory-AI/droid-sdk-typescript)
- [Python SDK](https://github.com/Factory-AI/droid-sdk-python)
- [Factory Public API](https://docs.factory.ai/api-reference)
