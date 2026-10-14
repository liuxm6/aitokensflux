# 本地 Docker 基线（PostgreSQL）— P0 / TC5

本文档描述在开发机上用 **一条命令** 拉起 **Platform（new-api）+ Redis + PostgreSQL** 的最小栈，以及如何单独或通过 Nginx 反向代理提供 **Skin** 静态站（[`liuxm6/openrouter-theme`](https://github.com/liuxm6/openrouter-theme) **v6**），并配置 **`SKIN_ORIGINS`** 以支持跨源登录（TC0/TC5）。

> **与生产无关：** 正式环境发布走 [production-release.md](./production-release.md)（本地编译、`scratch` 镜像、服务器 `deploy.sh`）。**不要**把本目录下的 `docker-compose.yml` 当作生产镜像来源；此处仅用于本地 / P0 联调。

**Skin ↔ API 契约（Cookie、`New-API-User`、CORS）：** [skin-api-contract.md](./skin-api-contract.md)

---

## 前置条件

| 项 | 说明 |
| --- | --- |
| Docker | 已安装 Docker Engine（建议 24+） |
| Docker Compose | Compose V2（`docker compose`，随 Docker Desktop / 现代 Engine 自带） |
| 端口 | 本机 `3000` 未被占用；Skin 网关 `3080`；常见静态端口 `5173` / `8088` |

---

## 1. 启动 Platform 栈（PostgreSQL 为默认）

在 **本仓库根目录** 执行：

```bash
docker compose up -d
```

`docker-compose.yml` 默认使用 **`calciumion/new-api:latest`**（仅验证 `/api/status`、`:3000` UI 时足够）。

### 1.1 Skin 跨源登录（TC0/TC5）— 使用本仓库构建

`SKIN_ORIGINS` 由本仓库 Go 代码读取（`common/skin_origins.go` + `middleware/cors.go`）。**上游 `calciumion/new-api:latest` 可能尚未包含你当前 checkout 的能力**；要测 Skin 登录与 CORS 白名单，请叠加 **`docker-compose.tc5.yml`**（`Dockerfile.dev` 本地构建）：

```bash
docker compose -f docker-compose.yml -f docker-compose.tc5.yml up -d --build
```

该叠加文件已为本地常见 Skin 源写入：

```text
SKIN_ORIGINS=http://localhost:3080,http://localhost:5173,http://localhost:8088
```

若你使用其它端口，在 `docker-compose.tc5.yml` 中按 [skin-api-contract.md](./skin-api-contract.md) 规则修改（**仅绝对源，无 path**），然后 `--build` 重启 `new-api`。

栈内服务：

- **new-api**：端口 `3000`（TC5 叠加时为 `new-api-tc5:local` 镜像）
- **postgres**：`postgres:15`，库名 `new-api`
- **redis**：带密码 `requirepass`

数据目录：`./data`、`./logs`；PostgreSQL 数据卷 `pg_data`。

### 默认凭据（仅限本地）

| 组件 | 值 |
| --- | --- |
| PostgreSQL | 用户 `root`，密码 `123456`，库 `new-api` |
| Redis | 密码 `123456` |
| DSN（容器内） | `postgresql://root:123456@postgres:5432/new-api` |

**上线或共享网络前必须修改** compose 中的密码与 `SQL_DSN` / `REDIS_CONN_STRING`。文件内已有注释提醒。

---

## 2. CORS 与 `SKIN_ORIGINS`（#6 之后行为）

实现见 `middleware/cors.go`；环境变量解析见 `common/skin_origins.go`。

| `SKIN_ORIGINS` | CORS 行为 |
| --- | --- |
| **未设置或为空** | `AllowAllOrigins: true` + `AllowCredentials: true`（历史/兼容；不适合作为生产跨源 Skin 的最终形态） |
| **已设置** | `AllowAllOrigins: false`；仅允许列表中的源；反射匹配的 `Origin`；`Access-Control-Allow-Credentials: true`；暴露 `Auth-Version` |

跨源 Skin 调用 `http://localhost:3000` 的 `/api/*` 时，浏览器 `Origin` 必须与 `SKIN_ORIGINS` 中某项 **完全一致**（含 scheme 与端口），例如：

| Skin 访问方式 | 浏览器 `Origin` | 在 `new-api` 上设置 |
| --- | --- | --- |
| `npx serve -l 5173` | `http://localhost:5173` | `SKIN_ORIGINS=...,http://localhost:5173,...` |
| `python3 -m http.server 8088` | `http://localhost:8088` | `SKIN_ORIGINS=...,http://localhost:8088,...` |
| Nginx 网关（下文） | `http://localhost:3080` | `SKIN_ORIGINS=...,http://localhost:3080,...`（仅当页面仍把 API 配成 `:3000` 时需要） |

登录与会话细节（`credentials: "include"`、`New-API-User`、生产 HTTPS 下 `SESSION_COOKIE_SECURE` 等）见 **[skin-api-contract.md](./skin-api-contract.md)**。本地 `http://localhost` 不同端口联调时，请先按契约用 `fetch` + Cookie 验证 TC0；生产跨站再按契约表配置 Secure Cookie。

根目录 `docker-compose.yml` 中含 **注释示例** 的 `SKIN_ORIGINS`；可手工取消注释并配合 **本仓库镜像** 使用，等价于维护 `docker-compose.tc5.yml`。

---

## 3. 验证（TC5 — Quinn 检查清单）

按顺序确认：

1. **容器健康**

   ```bash
   docker compose ps
   ```

   `new-api` 应为 `healthy`（healthcheck 请求 `/api/status`）。

2. **API 状态为绿**

   ```bash
   curl -sS http://localhost:3000/api/status
   ```

   期望 JSON 中含 `"success":true`：

   ```bash
   curl -sS http://localhost:3000/api/status | grep -F '"success":true'
   ```

3. **Platform UI**

   浏览器打开：**http://localhost:3000**（镜像内置 UI）。

4. **Skin 能打开并完成 TC0（跨源时带 TC5 叠加）**

   - 跨源：先 `docker compose -f docker-compose.yml -f docker-compose.tc5.yml up -d --build`，再启 Skin 静态服务，API 基址指向 `http://localhost:3000`。
   - 同源网关：`docker compose -f docker-compose.yml -f docker-compose.tc5.yml -f docker-compose.skin.yml up -d --build`，打开 **http://localhost:3080**，API 使用相对路径 `/api/...`（推荐，可少依赖 CORS）。

**TC5 一句话：** `compose up`（含 TC5 叠加若测 Skin 登录）→ `/api/status` 绿 → Skin 页面能打开。

---

## 4. Skin（openrouter-theme v6）

Skin 静态资源 **不在本仓库**；需从 GitHub 检出 v6。

### 4.1 检出 v6

```bash
cd ..
git clone https://github.com/liuxm6/openrouter-theme.git openrouter-theme
cd openrouter-theme
git fetch --tags
git checkout v6    # 若标签名不同，改用该仓库 v6 对应 tag/branch
```

### 4.2 方式 A — 另一端口静态服务（跨源 → `:3000`）

```bash
# 示例：Vite/静态 dev 常用 5173
npx --yes serve -l 5173

# 或 Python
python3 -m http.server 8088
```

- 浏览器 **Origin** 为 `http://localhost:5173` 或 `http://localhost:8088`。
- Platform 必须使用 **TC5 叠加** 且 `SKIN_ORIGINS` 包含对应源。
- Skin 配置 API 基址为 **`http://localhost:3000`**（字段名以 openrouter-theme v6 为准，契约见 [skin-api-contract.md](./skin-api-contract.md)）。

### 4.3 方式 B — Nginx 同源网关（`:3080`）

```bash
docker compose -f docker-compose.yml -f docker-compose.tc5.yml -f docker-compose.skin.yml up -d --build
```

访问：**http://localhost:3080**。将 Skin 配成相对路径 **`/api/`、`/v1/`** 时与页面同源，**不必**依赖 CORS。

若 Skin 仍写死 API 为 `http://localhost:3000`，浏览器 Origin 为 `http://localhost:3080`，则须在 `SKIN_ORIGINS` 中包含 `http://localhost:3080`（`docker-compose.tc5.yml` 已包含）。

挂载路径：

```bash
export OPENROUTER_THEME_PATH=/absolute/path/to/openrouter-theme
docker compose -f docker-compose.yml -f docker-compose.tc5.yml -f docker-compose.skin.yml up -d --build
```

Nginx 配置：`docker/skin-gateway.conf`。

---

## 5. 常用运维命令

```bash
docker compose logs -f new-api

docker compose down

docker compose down -v   # 清空 PG 卷，慎用
```

仅开发 Go + 本机前端热更新时可用 `docker-compose.dev.yml`；**TC5 基线**以 `docker-compose.yml` + 可选 **`docker-compose.tc5.yml`** / **`docker-compose.skin.yml`** 为准。

---

## 6. Compose 文件对照

| 文件 | 用途 |
| --- | --- |
| `docker-compose.yml` | PG + Redis + 上游 `calciumion/new-api:latest` |
| `docker-compose.tc5.yml` | 本仓库 `Dockerfile.dev` 构建 + 默认 `SKIN_ORIGINS` |
| `docker-compose.skin.yml` | Nginx Skin 网关 `:3080` |
| `docker-compose.dev.yml` | 本地后端 dev 构建 + 本机 `bun run dev` 前端 |

---

## 7. 参考

- [production-release.md](./production-release.md) — 生产发布（非本栈）
- [skin-api-contract.md](./skin-api-contract.md) — Skin API / Cookie / CORS
- `middleware/cors.go`、`common/skin_origins.go`
