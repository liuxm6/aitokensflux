# Factory Droid SDK 对 Claude Thinking Signature 的暴露情况

> 调研日期：2026-07-29（Asia/Shanghai）  
> 核对版本：`@factory/droid-sdk` 0.6.0  
> 来源范围：Factory 官方 TypeScript SDK 仓库。

## 结论

**支持，但要通过完整消息的 content block 读取，不能从 `thinking_text_delta` 事件读取。**

Factory 官方 TypeScript SDK 明确定义并导出了以下内容块：

- `thinking`：包含必填的 `signature: string`、`thinking: string`，以及可选的 `signatureProvider`。
- `redacted_thinking`：包含 `data: string`。

`signatureProvider` 的协议枚举包含 `anthropic`，因此 SDK 可以表达 Claude/Anthropic extended thinking 的签名，并保留 `redacted_thinking` 数据。完整 assistant 消息通过 `DroidAssistantMessage.message.content` 暴露这些块；`run()` 返回结果中的 `messages` 也会保留完整 assistant 消息。

但 SDK **没有公开 Anthropic 原始 HTTP 响应对象**。它暴露的是 Droid CLI 经 JSON-RPC 发出的 Factory 标准化消息和通知，而不是上游 Anthropic Messages API 的完整原始 payload。

## 与 thinking 文本流的区别

高层流式事件：

- `thinking_text_delta` 只有 `messageId`、`blockIndex` 和 `text`。
- `thinking_text_complete` 只有 `messageId`、`blockIndex` 和可选的 `durationMs`。

这两个事件都没有：

- `signature`
- `signatureProvider`
- `redacted_thinking.data`

因此，不能把“可以流式读取 thinking 文本”理解为“每个 thinking delta 都带 Anthropic signature”。签名和脱敏思考数据位于随后产生的完整 `create_message` / assistant message content blocks 中。

## 最小读取示例

```ts
import { createSession, DroidMessageType } from '@factory/droid-sdk'

const session = await createSession({
  apiKey: process.env.FACTORY_API_KEY!,
  cwd: process.cwd(),
})

try {
  for await (const event of session.stream('分析这个项目')) {
    if (event.type !== DroidMessageType.Assistant) continue

    for (const block of event.message.content) {
      if (block.type === 'thinking') {
        console.log(block.thinking)
        console.log(block.signature)
        console.log(block.signatureProvider)
      }

      if (block.type === 'redacted_thinking') {
        console.log(block.data)
      }
    }
  }
} finally {
  await session.close()
}
```

运行时是否实际出现这些块，取决于所选模型、Droid CLI 和上游提供商是否返回相应内容；SDK 的类型支持不等于所有 Claude 请求都会生成 signature 或 redacted block。

## Raw notifications 的边界

`session.onNotification()` 可以订阅 SDK 收到的原始 JSON-RPC envelope。`create_message` 通知中的 `message.content` 使用同一套 `ContentBlock` schema，因此也能包含 `thinking.signature` 和 `redacted_thinking.data`。

这里的“raw”仅表示 SDK 尚未转换成 `DroidMessage` 的 Droid JSON-RPC 通知，不代表 Anthropic 的原始网络响应。官方 SDK 中没有发现通用的 `rawResponse`、`providerResponse` 或 Anthropic response payload 字段/API。

## 官方来源

- [SDK README：流式消息类型和 raw notification](https://github.com/Factory-AI/droid-sdk-typescript/blob/main/README.md)
- [`src/schemas/messages.ts`：ThinkingBlock、RedactedThinkingBlock 和 ContentBlock](https://github.com/Factory-AI/droid-sdk-typescript/blob/main/src/schemas/messages.ts)
- [`src/protocol/messages.ts`：协议级 signature、signatureProvider 和 redacted_thinking](https://github.com/Factory-AI/droid-sdk-typescript/blob/main/src/protocol/messages.ts)
- [`src/protocol/enums.ts`：ModelProvider.ANTHROPIC](https://github.com/Factory-AI/droid-sdk-typescript/blob/main/src/protocol/enums.ts)
- [`src/schemas/server.ts`：create_message 与 thinking 文本通知 schema](https://github.com/Factory-AI/droid-sdk-typescript/blob/main/src/schemas/server.ts)
- [`src/stream.ts`：完整 assistant message 保留与 thinking delta 转换](https://github.com/Factory-AI/droid-sdk-typescript/blob/main/src/stream.ts)
- [SDK Usage Guide：Raw Notification Subscription](https://github.com/Factory-AI/droid-sdk-typescript/blob/main/docs/sdk-usage-guide.md#raw-notification-subscription)
