# 本地 Docker 基线（PostgreSQL）— P0 / TC5

本文档描述在开发机上用 **一条命令** 拉起 **Platform（new-api）+ Redis + PostgreSQL** 的最小栈，以及如何单独或通过 Nginx 反向代理提供 **Skin** 静态站（[`liuxm6/openrouter-theme`](https://github.com/liuxm6/openrouter-theme) **v6**）。

> **与生产无关：** 正式环境发布走 [production-release.md](./production-release.md)（本地编译、`scratch` 镜像、服务器 `deploy.sh`）。**不要**把本目录下的 `docker-compose.yml` 当作生产镜像来源；此处仅用于本地 / P0 联调。

---

## 前置条件

| 项 | 说明 |
| --- | --- |
| Docker | 已安装 Docker Engine（建议 24+） |
| Docker Compose | Compose V2（`docker compose`，随 Docker Desktop / 现代 Engine 自带） |
| 端口 | 本机 `3000` 未被占用；若启用 Skin 网关，还需 `3080` |

---

## 1. 启动 Platform 栈（PostgreSQL 为默认）

在 **本仓库根目录** 执行：

```bash
docker compose up -d
```

等价于历史写法 `docker-compose up -d`（V1 独立二进制）。

`docker-compose.yml` 已默认：

- **new-api**：`calciumion/new-api:latest`，端口 `3000`
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

## 2. 验证（TC5 — Quinn 检查清单）

按顺序确认：

1. **容器健康**

   ```bash
   docker compose ps
   ```

   `new-api` 应为 `healthy`（compose 内 healthcheck 会请求 `/api/status`）。

2. **API 状态为绿**

   ```bash
   curl -sS http://localhost:3000/api/status
   ```

   期望 JSON 中含 `"success":true`（可与 healthcheck 一致）：

   ```bash
   curl -sS http://localhost:3000/api/status | grep -F '"success":true'
   ```

3. **Platform UI**

   浏览器打开：**http://localhost:3000**（镜像内置管理/前台 UI）。

4. **（可选）Skin 能打开** — 见下文「Skin」一节。

**TC5 一句话：** `docker compose up -d` → `/api/status` 绿 → Skin 页面能打开（直连或 `3080` 网关）。

---

## 3. Skin（openrouter-theme v6）

Skin 静态资源 **不在本仓库**；需从 GitHub 检出 v6，再任选一种方式提供。

### 3.1 检出 v6

与本仓库 **同级目录** 克隆（与 `docker-compose.skin.yml` 默认挂载路径一致）：

```bash
cd ..
git clone https://github.com/liuxm6/openrouter-theme.git openrouter-theme
cd openrouter-theme
git fetch --tags
git checkout v6    # 若远程标签名不同，改用该仓库 v6 对应的 tag/branch，确保根目录有 index.html
```

### 3.2 方式 A — 另一端口单独静态服务（跨源）

在 `openrouter-theme` 目录启动静态服务器，例如：

```bash
# Python 3
python3 -m http.server 8088

# 或（需本机已装 Node）
npx --yes serve -l 8088
```

浏览器访问：**http://localhost:8088**（以 `index.html` 为入口）。

此时浏览器页面源为 `http://localhost:8088`，API 在 `http://localhost:3000`，属于 **跨源**。当前 **main 分支** 后端在 `middleware/cors.go` 中对 API / Dashboard / Relay 路由使用 `AllowAllOrigins: true`，本地 Skin 调 Platform API 通常可直接工作。

若后续合并 **按环境变量收紧 CORS** 的改动，请以该 PR / 发布说明为准配置允许的来源；**在合入前不要臆造未文档化的环境变量名**。临时方案可继续用下文 **方式 B（同源 Nginx）** 避免跨源。

### 3.3 方式 B — 可选 Nginx 同源网关（推荐联调）

仓库提供叠加文件 `docker-compose.skin.yml`，在 Platform 已定义的网络里增加轻量 Nginx：

- 根路径：挂载的 Skin 静态文件（默认 `../openrouter-theme`）
- `/api/`、`/v1/`：反向代理到 `new-api:3000`

```bash
# 在 new-api 仓库根目录
docker compose -f docker-compose.yml -f docker-compose.skin.yml up -d
```

自定义 Skin 路径：

```bash
export OPENROUTER_THEME_PATH=/absolute/path/to/openrouter-theme
docker compose -f docker-compose.yml -f docker-compose.skin.yml up -d
```

访问：**http://localhost:3080** — Skin 与 API 同源，无需额外 CORS 配置。

Nginx 配置：`docker/skin-gateway.conf`。

### 3.4 Skin 指向 API 的说明

- **方式 B**：Skin 应使用相对路径访问 `/api/...`、`/v1/...`（与网关同源）。
- **方式 A**：若主题内有「API 基址 / 后端 URL」配置项，填 `http://localhost:3000`；具体字段以 openrouter-theme v6 文档或 `index.html` / 配置脚本为准。

---

## 4. 常用运维命令

```bash
# 查看日志
docker compose logs -f new-api

# 停止（保留数据卷）
docker compose down

# 停止并删除 PostgreSQL 卷（清空库，慎用）
docker compose down -v
```

仅开发 Go + 自带前端热更新时，可使用 `docker-compose.dev.yml`（本地构建后端）；**TC5 基线以根目录 `docker-compose.yml` + 官方镜像为准**。

---

## 5. 与 `docker-compose.dev.yml` 的区别

| 文件 | 用途 |
| --- | --- |
| `docker-compose.yml` | P0/TC5：官方镜像 + PG + Redis，最少步骤 |
| `docker-compose.dev.yml` | 本地 `Dockerfile.dev` 编译后端 + 本机 `bun run dev` 前端 |
| `docker-compose.skin.yml` | 叠加：Nginx 提供 Skin + 代理 API |

---

## 6. 参考

- 生产发布：[production-release.md](./production-release.md)
- 根目录 Compose：`docker-compose.yml`
- CORS 实现（当前行为）：`middleware/cors.go`
