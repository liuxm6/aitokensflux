# Factory Droid SDK 的 API Key 鉴权方式

> 调研日期：2026-07-29（Asia/Shanghai）  
> 范围：仅 Factory 官方文档、官方 GitHub 仓库和官方 SDK 源码。

## 结论

**Factory 官方 TypeScript SDK 支持传入 Factory API Key，不要求机器预先执行交互式登录。**

不过需要准确区分：`@factory/droid-sdk` 本身不是直接向 Factory HTTP API 发请求的客户端。它会启动本机的 `droid exec` 子进程，并通过 stdin/stdout 上的 JSON-RPC 2.0 与 Droid 通信。SDK 的 `apiKey` 参数最终被转换为子进程环境变量 `FACTORY_API_KEY`，真正完成认证和调用 Factory 服务的是 Droid CLI。

因此两种方式都支持：

- 显式 API Key：给 `run()` 或 `createSession()` 传入 `apiKey`，适合服务器和 CI。
- 本机登录凭据：如果运行时没有有效的 `apiKey`，Droid CLI 会回退到本机保存的登录凭据。

这说明它**不只是依赖本机登录会话**，但也不是完全脱离 Droid CLI 的纯 HTTP SDK。

## TypeScript SDK

- 包名：`@factory/droid-sdk`
- 安装：`npm install @factory/droid-sdk`
- 运行要求：Node.js 18+，本机已安装并可执行 `droid` CLI。
- 官方 README 将 `apiKey` 放在 `run()`、`createSession()` 的正式用法中。
- 源码中的 `TransportCreationOptions` 声明了 `apiKey: string`；创建进程传输层时，SDK 将它注入 `FACTORY_API_KEY`，然后启动 `droid exec --input-format stream-jsonrpc --output-format stream-jsonrpc`。

最小用法：

```ts
import { run } from '@factory/droid-sdk'

const result = await run('分析当前项目', {
  apiKey: process.env.FACTORY_API_KEY!,
  cwd: process.cwd(),
})

console.log(result.text)
```

推荐在 CI 的 secret manager 中配置：

```bash
export FACTORY_API_KEY='fk-...'
```

不要把 Key 写入源码或提交到 Git。

## Python SDK

- 包名：`droid-sdk`
- 安装：`pip install droid-sdk`
- 同样通过 `ProcessTransport` 启动本机 `droid exec` 子进程。
- 当前官方 Python 高层 `query()` / `DroidQueryOptions` 没有像 TypeScript SDK 那样公开一等的 `api_key` 参数。
- `ProcessTransport` 会继承当前进程环境；也支持传入额外的 `env`。因此 Python 可通过预先设置 `FACTORY_API_KEY`，或直接构造 `ProcessTransport(env={...})`，让 Droid CLI 使用 API Key，而不依赖已保存的交互式登录凭据。

最简单的官方兼容方式是先设置环境变量，再使用 SDK：

```bash
export FACTORY_API_KEY='fk-...'
```

```python
import asyncio
from droid_sdk import query

async def main():
    async for message in query('分析当前项目', cwd='.'):
        print(message)

asyncio.run(main())
```

## 个人 Key、CI Key和服务账号 Key

- Factory CLI 官方认证文档要求从 Factory App 创建 API Key，并设置为 `FACTORY_API_KEY`；这是 SDK 启动的 Droid CLI 所遵循的认证方式。
- Factory 的官方 CI 文档同样要求将 Factory API Key 保存为 CI secret，并以 `FACTORY_API_KEY` 传入，因此显式 Key 是官方支持的无人值守运行方式。
- Factory Public API 也使用 Factory API Key 作为 Bearer Token，但这是 HTTP Public API 的认证形式；Droid SDK 不会把 SDK 的 `apiKey` 直接拼成 Public API 请求，而是交给 Droid CLI。
- Factory 提供 Service Accounts API，可创建、轮换和撤销服务账号 API Key。官方 Service Accounts API 页面没有明确说明所有服务账号 Key 都可直接作为 Droid SDK 的推理/会话额度凭据。因此，组织计划在 CI 中若要使用服务账号 Key，应先确认该服务账号已被授予运行 Droid 的权限和用量上限，不能仅凭“能调用 Public API”推断它一定能消费 Droid 模型额度。

## 官方来源

- [Factory TypeScript Droid SDK README](https://github.com/Factory-AI/droid-sdk-typescript/blob/main/README.md)
- [TypeScript SDK `helpers.ts`：`apiKey` 注入 `FACTORY_API_KEY`](https://github.com/Factory-AI/droid-sdk-typescript/blob/main/src/helpers.ts)
- [TypeScript SDK `transport.ts`：启动 `droid exec` 子进程](https://github.com/Factory-AI/droid-sdk-typescript/blob/main/src/transport.ts)
- [Factory Python Droid SDK README](https://github.com/Factory-AI/droid-sdk-python/blob/main/README.md)
- [Python SDK `transport.py`：继承/合并子进程环境变量](https://github.com/Factory-AI/droid-sdk-python/blob/main/src/droid_sdk/transport.py)
- [Factory Droid CLI Authentication](https://docs.factory.ai/droid-cli/cli-reference#authentication)
- [Factory Droid Exec](https://docs.factory.ai/droid-exec/overview)
- [Factory CI Code Review Authentication](https://docs.factory.ai/software-factory/code-review-ci#authentication)
- [Factory Public API Authentication](https://docs.factory.ai/api-reference#authentication)
- [Factory Service Accounts API](https://docs.factory.ai/api-reference/service-accounts)
