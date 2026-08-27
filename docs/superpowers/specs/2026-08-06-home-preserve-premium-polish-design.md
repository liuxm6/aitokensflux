# Customer 首页保留式高端精修设计（2026-08-06）

## 背景

用户已否决三套结构性重设计原型（Editorial Calm / Commerce Split / Cinematic Continuum），
结论：现网版本本身更高端，问题不在结构，在精度。本方案是**保留式精修**：
不换布局、不换品牌资产、不改功能，只提升排版精度、节奏一致性、材质细节与微交互质感。

## 高端感来源诊断（必须原样保留的资产）

对照现网首屏（localhost:3000 截图核对），高端感来自六项资产：

1. **全屏 Hero + 极低密度**：`100svh` 高度、内容居中、大面积留白（`.home-hero`）。
2. **双层活体氛围**：底层 `hero-mesh` 四角青/绿/橙 radial 渐变；上层 `::before/::after`
   两团 blur(30px) 呼吸光斑，10.5s/11.5s 交错动画。背景是"活"的但不抢内容。
3. **Kinetic 双模型轮播**：clamp(42px, 5.5vw, 76px)、850 字重、官方品牌 logo 原色
   （Claude 花标橙红、OpenAI 黑、Grok 黑、Gemini 四色），12s 循环。这是页面签名。
4. **品牌绿只做点睛**：tagline、主 CTA、图标用 `#0fb477`；版面主体是黑白灰纸感。
5. **克制微交互**：按钮 0.16s hover 阴影 + `active` 位移缩放；福利卡阴影提升。
6. **唯一强反差**：黑底 CTA 板块是全页唯一深色块，节奏为 低-低-低-高-低。

三套原型被否的原因即为上述资产被减配：背景变平、字号变小、轮播变静态、
布局落入通用 SaaS 卡片阵列。

## 硬约束（不要动）

- 颜色体系：`tokens.css` 全部值、mesh 渐变色、品牌 logo 官方色、黑底 CTA。
- 结构：区块顺序（hero → 福利 → 能力 → 费率 → 套餐/按量 → CTA → 支持 → FAQ → footer）、
  DOM 顺序、路由、锚点、API、登录判断、充值/套餐流程。
- 资产：kinetic 轮播逻辑与模型顺序（Claude, Codex, Grok, Gemini）、OS 图标、
  双 CTA、Hero 内福利卡、四列轻量能力区（禁止卡片化）。
- 文案语义与 i18n key。

## 分区块精修方案

### 0. 全局（先做，其余区块受益）

- **垂直节奏统一**：`.section` 与 `.pricing-section`（48/60px）等各区块 padding
  按同一标尺校准（72px 桌面 / 48px 平板 / 40px 移动，允许 ±8px 区块个性），
  消除区块间"忽紧忽松"。
- **焦点环统一**：营销页统一为 accent 外环样式（`base.css` 的 outline 与
  `--customer-focus` 两套并存 → 营销侧只留一套），所有可点元素 `:focus-visible` 可见。
- **reduced-motion 全覆盖**：hero 呼吸光斑、模型轮播、按钮位移、FAQ 展开动画
  在 `prefers-reduced-motion: reduce` 下全部静止（轮播退化为静态第一组）。
- **数字排版**：费率、价格统一 `font-variant-numeric: tabular-nums`（已部分存在，补齐）。

### 1. Hero（只调精度）

- 标题区基线节奏：轮播行、tagline、OS 图标、CTA、福利卡之间的间距按
  22 / 12 / 28 / 20 标尺校准，视觉重心居中偏上 5% 以内。
- **轮播换字瑕疵**：两组 pair 宽度差异大（Claude/Codex vs Grok/Gemini），
  切换时重心跳动 → 保持 `min-height` 基础上，对各 logo 做光学尺寸对齐
  （视觉重量一致，允许 ±2px 尺寸差），分隔符 `/` 灰度统一。
- **CTA 双钮肩线**：「配置文档」「立即使用」两钮 min-width 对齐，图标-文字间距一致，
  hover 阴影色温一致（当前 ghost 是蓝灰阴影、主钮是绿阴影，保留色温差但统一强度）。
- 福利卡：`:focus-visible` 给与 hover 同款阴影反馈；整卡触控目标 ≥44px（已满足则不动）。
- 光斑性能：`will-change` 已有；仅在 reduced-motion 停动画，不改视觉。

### 2. 能力区（四列轻量，不卡片化）

- 图标(24px)-标题-正文纵向基线统一：图标底到标题基线 12px，标题到正文 6px。
- 正文行长 ≤ 20em，避免宽屏下单行拉太长。
- 列分隔线仅 ≥960px 显示；平板 2×2 时用行间留白替代竖线；移动单列加稀疏横线。
- 居中大标题 + 四列左对齐的编辑张力保留，只统一标题下方 42px 间距。

### 3. 模型费率

- 表格高度按行数自适应 + max-height 滚动（数据少不留大空白）。
- tab 切换高度变化加 0.2s ease height 过渡，防止下方内容跳动；reduced-motion 跳过。
- 加载失败/加载中态与全站 `AsyncState` 视觉层级对齐（本地实测失败态按钮偏小、
  与红色文案关系松散 → 统一 ErrorState 排版）。
- sticky 表头、hover 绿行、等宽数字、「检查真伪」链接保留不动。
- 681–900px 分层布局按现 spec 校准，防 tabs/状态区横向溢出。

### 4. 套餐与按量

- payg 卡 checkmark 列表 5 项的 2+2+1 孤行 → 网格对齐（两列均衡或 3+2），
  项间距统一 12px。
- 黑色「立即充值」按钮与卡片圆角体系对齐（按钮胶囊、卡 18px，保持现状仅校准内边距）。
- 无套餐空态压缩高度，按量卡上移为该区块主内容（沿用 7 月 spec 既定方向）。
- 有套餐时 price-card 网格不动。

### 5. 黑底 CTA

- 保留唯一强反差与黑块圆角。
- 前后区块过渡：黑块上下外边距加大一档（与前后浅色区块留白呼吸），不加渐变不改色。
- 块内标题-正文-按钮组间距 16/24 校准；移动端左右内边距 ≥24px，按钮组可换行。

### 6. 支持渠道 + FAQ

- 支持卡 hover 位移量与 Hero 福利卡统一（同为 0.16s、同阴影增量）。
- 复制群号/邮箱的成功反馈确认走全站 toast，位置与样式一致。
- FAQ `details` 展开加平滑高度过渡（CSS grid-template-rows 方案或
  `interpolate-size`，reduced-motion 跳过）；`+` 号旋转 45° 表示展开。
- 第一项默认展开的绿底与未展开项对比保留。

### 7. Footer

- 列间距与链接触控目标（≥44px 行高）校准；其余不动。

### 8. 清理

- 移除三套被否原型：`src/prototype/`（PrototypeSwitcher、home-polish/）及
  `Home/index.tsx` 中的挂载分支；原型代码按 prototype skill 惯例存档到
  throwaway 分支后从工作分支删除。

## 验证

- `bun test`、`bun run typecheck`、`bun run format:check`、`bun run build` 全绿。
- 逐区块截图对比：色值零变化（diff 仅允许间距/阴影/动画）、区块顺序零变化。
- 键盘走查：Tab 顺序、focus 可见、Esc/复制反馈。
- reduced-motion 走查：无残留动画。
- 375 / 768 / 900 / 1280 四档响应式截图。

## 交付

每个区块独立 commit，可单独回滚；先做第 0/8 节（全局 + 清理），
再按 1→7 顺序推进，每步保持可构建可测试。
