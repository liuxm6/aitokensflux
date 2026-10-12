# OpenRouter V7 高度参考版设计

## 参考基线

本版根据 `https://openrouter.ai/` 当前官网的实际页面结构与视觉节奏重做：极简顶部导航、超大居中 Hero、紫色主 CTA、四项大数字指标、Provider Logo Cloud、三项能力模块、精选模型、精选 Agents、三步接入和最近文章。

## 本地实现

- 文件：`web/openrouter/v7.html`
- V6 保留：`web/openrouter/v6.html`
- 本次重做前的 V7 版本：`web/openrouter/v7-before-openrouter-20260905.html`

## 视觉策略

- 白色留白背景与浅灰分区。
- 紫色作为主要品牌动作色，绿色用于状态和趋势。
- 标题使用超大紧凑字阶，数据使用等宽字体。
- 卡片边框、圆角和阴影保持克制，页面重点放在内容而非装饰。

## 首页结构

1. 中央 Hero：统一接口价值主张、双 CTA。
2. 指标行：月度 Tokens、全球用户、Providers、Models。
3. Provider Logo Cloud：所有模型一个入口。
4. 三项能力：可用性、价格与性能、数据策略。
5. 精选模型：模型、Provider、Tokens、趋势。
6. 精选 Agents：工作流预览和入口。
7. 三步接入：选择模型、设置预算、获取 API Key。
8. 最近文章：路由、价格和性能主题。

## 保留能力

模型目录、模型详情、排行榜、价格、文档、控制台和 API Key 等既有 Hash 路由与本地 Mock 数据继续保留。
