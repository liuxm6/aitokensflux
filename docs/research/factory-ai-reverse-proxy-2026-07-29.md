# Factory.ai 反向代理开源工具调研

> 调研日期：2026-07-29（Asia/Shanghai）

## 结论

Factory 官方目前没有提供 OpenAI/Anthropic Chat API 兼容的开源反向代理。官方支持的自动化接口是 `droid exec`、原始 JSON-RPC 和 Factory Public API。

社区存在两个相关项目，但都不适合未经验证直接用于正式、多用户服务：

1. [`ankush-kaura/factory-droid-proxy`](https://github.com/ankush-kaura/factory-droid-proxy)：最接近“把 Factory 订阅额度转成 OpenAI API”的工具。它在本机调用已认证的 Droid CLI，暴露 `/v1/chat/completions` 和 `/v1/models`。
2. [`imbuxiangnan-cyber/aiapi`](https://github.com/imbuxiangnan-cyber/aiapi)：支持把 Factory AI Droids 转为 OpenAI/Anthropic API，但仓库已归档，README 明确说明属于逆向工程代理、不受官方支持。

## factory-droid-proxy

- MIT License，Python 标准库实现。
- 需要本机安装并认证 Factory Droid CLI。
- 仅支持非流式 OpenAI Chat Completions；工具调用是通过提示模型输出 JSON 的 best-effort 实现，并非原生协议转换。
- 调研时仓库为新建项目，0 star、0 fork，维护和兼容性尚未得到验证。
- 源码实际调用为 `droid --model ... --output-format text`，而 Factory 官方文档将无头/脚本执行定义为 `droid exec ...`。因此当前实现可能需要加入 `exec` 子命令后才能与当前 CLI 稳定兼容。
- 源码会把上游错误包装为 HTTP 200，并伪造极高的 rate-limit 响应头。这会妨碍调用方正确识别限流和故障，不建议原样用于正式环境。
- 默认只监听 `127.0.0.1`，但 Docker 示例监听 `0.0.0.0` 且没有 API 认证。若部署到服务器，必须额外增加鉴权、TLS、并发限制和网络访问控制。

来源：

- [项目 README](https://github.com/ankush-kaura/factory-droid-proxy/blob/main/README.md)
- [server.py](https://github.com/ankush-kaura/factory-droid-proxy/blob/main/server.py)
- [Factory Droid Exec 官方文档](https://docs.factory.ai/droid-exec/overview)

## aiapi

- MIT License，支持 OpenAI Chat Completions 和 Anthropic Messages API。
- Droids 模式要求 Factory API Key（`fk-...`）。
- 支持流式、模型映射、多平台轮换等功能，功能比 `factory-droid-proxy` 完整。
- 仓库已经归档并停止维护。
- README 明确声明它是逆向工程代理、不受官方支持，可能随时失效；自动化或多账号轮换也可能触发平台滥用检测。

来源：

- [项目 README](https://github.com/imbuxiangnan-cyber/aiapi/blob/master/README.md)
- [GitHub 仓库](https://github.com/imbuxiangnan-cyber/aiapi)

## Factory 官方可用的替代接口

### Droid Exec / JSON-RPC

Factory 官方支持：

- `droid exec` 单次无头执行；
- JSON 输出，便于脚本解析；
- `stream-jsonrpc` 长进程模式，可以发送消息、接收增量文本和工具事件、维护会话；
- 使用任意 Factory 可用模型，并通过 Factory API Key 认证。

如果要做稳定的内部代理，更合理的实现是基于官方 `droid exec --input-format stream-jsonrpc --output-format stream-jsonrpc` 封装 OpenAI/Anthropic 协议，而不是依赖交互式 CLI 输出文本。

来源：[Factory Droid Exec](https://docs.factory.ai/droid-exec/overview)

### Factory Public API

Factory 官方 Public API 使用 `https://api.factory.ai` 和 Bearer API Key。Droid Sessions API 可以创建会话、发送消息、读取消息和更新模型，但官方注明 Sessions API 目前只对 selected organizations 开放，并不是通用的 OpenAI/Anthropic completion endpoint。

来源：

- [Factory Public API](https://docs.factory.ai/api-reference)
- [Droid Sessions API](https://docs.factory.ai/api-reference/sessions)

### BYOK 不是反代

Factory 的 Custom Models/BYOK 功能是让 Droid 调用用户自己的 Anthropic、OpenAI 或兼容供应商 API。流量方向是“Droid → 用户配置的上游”，不能把 Factory 订阅额度导出为通用 API。

来源：[Factory Custom Models (BYOK)](https://docs.factory.ai/model-independence/byok)

## 使用建议

- 个人本机试用：可以测试 `factory-droid-proxy`，但应先修正/验证 `droid exec` 调用，并只监听环回地址。
- 正式内部服务：基于官方 JSON-RPC 自行封装，补齐流式响应、原生工具调用、会话管理、鉴权、并发与限流透传。
- 公网、多用户或转售：不建议使用个人订阅做反代。除了技术稳定性问题，还应先向 Factory 确认服务条款和授权范围。
