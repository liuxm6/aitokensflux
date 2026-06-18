# Production Release Runbook

这份文档是正式环境发布的标准流程。Claude Code、Codex 或人工发布时都应优先遵循这里的步骤。

## 目标

- 在本地完成前端构建、后端编译、Docker 镜像打包。
- 只发布已提交的目标 commit，避免把本地未提交改动带进生产。
- 将轻量运行时镜像上传到生产服务器，由服务器上的发布脚本替换 `new-api` 服务镜像。
- 发布后完成健康检查，并保留可回滚的 compose 备份。

## 生产环境形态

- Docker Compose 目录：`/opt/newapi`
- Compose 文件：`/opt/newapi/docker-compose.yml`
- 应用服务/container：`new-api`
- 数据服务/container：`new-api-redis`、`new-api-pg`
- 服务器发布工作区：`/root/tokenflux-release`
- 服务器脚本：
  - `/root/tokenflux-release/deploy.sh`
  - `/root/tokenflux-release/rollback.sh`
  - `/root/tokenflux-release/release.env`
  - `/root/tokenflux-release/release.log`
- 生产镜像 tag 格式：`aitokensflux/new-api:<git-short-sha>-<YYYYMMDDHHMMSS>`
- 运行时镜像：`scratch` + 本地编译的 `linux/amd64` 静态二进制。

不要把生产 SSH IP、用户名、密码、私钥路径或一次性运维备注写入仓库。需要连接生产服务器时，由操作者在会话中提供。

## 发布原则

1. 先确认要发布的 commit 已提交。
2. 发布构建必须从干净 worktree 执行，推荐使用 `/tmp/tokenflux-prod-worktree`。
3. 不在生产服务器编译代码。
4. 不使用仓库根目录的 `docker-compose.yml` 作为生产镜像来源；生产发布使用本 runbook 的本地打包镜像流程。
5. 生产只重建 `new-api` 服务：`docker compose up -d --no-deps new-api`。
6. 不在生产执行 `docker compose down`。
7. 不删除数据库/Redis volume。
8. 不执行 `docker system prune -a --volumes`。
9. 发布失败或健康检查失败时，使用服务器 `/root/tokenflux-release/rollback.sh` 回滚。

## 本地前置检查

在主工作区确认当前状态：

```bash
git status --short
git log --oneline -5
```

如果主工作区有未提交改动，不要直接在主工作区构建。创建干净 worktree：

```bash
rm -rf /tmp/tokenflux-prod-worktree
git worktree add --detach /tmp/tokenflux-prod-worktree HEAD
cd /tmp/tokenflux-prod-worktree
git status --short
git rev-parse --short HEAD
```

确认本机工具可用：

```bash
bun --version
go version
docker buildx version
docker info --format '{{.OSType}}/{{.Architecture}}'
test -f /etc/ssl/cert.pem
test -f /usr/share/zoneinfo/Asia/Shanghai
```

如果 `docker info` 显示本机不是 `linux/amd64`，后面仍然必须使用 `--platform linux/amd64`。

## 定义发布变量

从干净 worktree 根目录执行：

```bash
GIT_SHA="$(git rev-parse --short HEAD)"
RELEASE="${GIT_SHA}-$(date +%Y%m%d%H%M%S)"
TAG="aitokensflux/new-api:${RELEASE}"
OUTDIR="/tmp/tokenflux-release-${RELEASE}"

APP_VERSION="$(cat VERSION 2>/dev/null || true)"
if [ -z "$APP_VERSION" ]; then
  APP_VERSION="$RELEASE"
fi

mkdir -p "$OUTDIR"
printf 'RELEASE=%s\nTAG=%s\nOUTDIR=%s\nAPP_VERSION=%s\n' \
  "$RELEASE" "$TAG" "$OUTDIR" "$APP_VERSION" > /tmp/tokenflux-last-release.env

cat /tmp/tokenflux-last-release.env
```

`VERSION` 文件为空时，使用本次 release id 作为前端和后端版本号。

## 构建前端

```bash
cd /tmp/tokenflux-prod-worktree/web
. /tmp/tokenflux-last-release.env
bun install --frozen-lockfile

cd default
DISABLE_ESLINT_PLUGIN=true VITE_REACT_APP_VERSION="$APP_VERSION" bun run build

cd ../classic
VITE_REACT_APP_VERSION="$APP_VERSION" bun run build

cd ../customer
VITE_REACT_APP_VERSION="$APP_VERSION" bun run build

cd ../..
find web -maxdepth 3 -type d -name dist -print
```

预期至少看到：

```text
web/default/dist
web/classic/dist
web/customer/dist
```

## 编译后端并准备 rootfs

```bash
cd /tmp/tokenflux-prod-worktree
. /tmp/tokenflux-last-release.env

mkdir -p "$OUTDIR/rootfs/etc/ssl/certs" \
  "$OUTDIR/rootfs/usr/share/zoneinfo/Asia" \
  "$OUTDIR/rootfs/licenses"

cp /etc/ssl/cert.pem "$OUTDIR/rootfs/etc/ssl/certs/ca-certificates.crt"
cp /usr/share/zoneinfo/Asia/Shanghai "$OUTDIR/rootfs/usr/share/zoneinfo/Asia/Shanghai"
cp LICENSE NOTICE THIRD-PARTY-LICENSES.md "$OUTDIR/rootfs/licenses/"

GO111MODULE=on \
CGO_ENABLED=0 \
GOOS=linux \
GOARCH=amd64 \
GOEXPERIMENT=greenteagc \
go build -ldflags "-s -w -X 'github.com/QuantumNous/new-api/common.Version=${APP_VERSION}'" \
  -o "$OUTDIR/rootfs/new-api" .

ls -lh "$OUTDIR/rootfs/new-api"
```

## 打包 Docker 镜像

```bash
cd /tmp/tokenflux-prod-worktree
. /tmp/tokenflux-last-release.env

cat > "$OUTDIR/Dockerfile" <<'EOF'
FROM scratch
COPY rootfs/ /
ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
ENV TZ=Asia/Shanghai
EXPOSE 3000
WORKDIR /data
ENTRYPOINT ["/new-api"]
EOF

docker buildx build --platform linux/amd64 --load -t "$TAG" "$OUTDIR"
docker save "$TAG" | gzip -1 > "$OUTDIR/new-api-image.tar.gz"
shasum -a 256 "$OUTDIR/new-api-image.tar.gz" > "$OUTDIR/new-api-image.tar.gz.sha256"
ls -lh "$OUTDIR/new-api-image.tar.gz"
```

## 本地 smoke test

```bash
cd /tmp/tokenflux-prod-worktree
. /tmp/tokenflux-last-release.env

docker rm -f tokenflux-release-smoke 2>/dev/null || true
mkdir -p "$OUTDIR/smoke-data"

docker run -d --rm \
  --platform linux/amd64 \
  --name tokenflux-release-smoke \
  -p 127.0.0.1:13000:3000 \
  -v "$OUTDIR/smoke-data:/data" \
  -e TZ=Asia/Shanghai \
  "$TAG"

for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:13000/api/status | grep -q '"success":true'; then
    echo "local smoke test passed"
    break
  fi
  sleep 1
  if [ "$i" = 30 ]; then
    docker logs tokenflux-release-smoke || true
    docker rm -f tokenflux-release-smoke >/dev/null 2>&1 || true
    exit 1
  fi
done

docker rm -f tokenflux-release-smoke >/dev/null
```

## 准备上传文件

生成服务器需要的 `release.env`：

```bash
cd /tmp/tokenflux-prod-worktree
. /tmp/tokenflux-last-release.env

cat > "$OUTDIR/release.env" <<EOF
RELEASE=$RELEASE
IMAGE_TAG=$TAG
RELEASE_ROOT=/root/tokenflux-release
RELEASE_DIR=/root/tokenflux-release/releases/$RELEASE
IMAGE_TAR=/root/tokenflux-release/releases/$RELEASE/new-api-image.tar.gz
COMPOSE_DIR=/opt/newapi
COMPOSE_FILE=/opt/newapi/docker-compose.yml
SERVICE_NAME=new-api
CONTAINER_NAME=new-api
HEALTH_URL=http://127.0.0.1:3000/api/status
LOG_FILE=/root/tokenflux-release/release.log
BACKUP_DIR=/root/tokenflux-release/backups
EOF

cat "$OUTDIR/release.env"
```

设置生产 SSH 目标。不要把真实目标和密码提交到仓库：

```bash
PROD_SSH='<ssh-user>@<prod-host>'
```

上传前先检查服务器目录和磁盘：

```bash
ssh "$PROD_SSH" 'set -euo pipefail; hostname; df -h /; ls -la /root/tokenflux-release'
```

上传 release 文件：

```bash
cd /tmp/tokenflux-prod-worktree
. /tmp/tokenflux-last-release.env

ssh "$PROD_SSH" "set -euo pipefail; \
  mkdir -p '/root/tokenflux-release/releases/$RELEASE' /root/tokenflux-release/backups; \
  if [ -f /root/tokenflux-release/release.env ]; then \
    cp /root/tokenflux-release/release.env '/root/tokenflux-release/releases/$RELEASE/release.env.before'; \
  fi"

scp "$OUTDIR/new-api-image.tar.gz" \
  "$PROD_SSH:/root/tokenflux-release/releases/$RELEASE/new-api-image.tar.gz"
scp "$OUTDIR/new-api-image.tar.gz.sha256" \
  "$PROD_SSH:/root/tokenflux-release/releases/$RELEASE/new-api-image.tar.gz.sha256"
scp "$OUTDIR/release.env" \
  "$PROD_SSH:/root/tokenflux-release/release.env"
scp "$OUTDIR/release.env" \
  "$PROD_SSH:/root/tokenflux-release/releases/$RELEASE/release.env"
```

服务器端校验：

```bash
ssh "$PROD_SSH" "set -euo pipefail; \
  ls -lh '/root/tokenflux-release/releases/$RELEASE'; \
  sha256sum '/root/tokenflux-release/releases/$RELEASE/new-api-image.tar.gz'"
cat "$OUTDIR/new-api-image.tar.gz.sha256"
```

确认两边 checksum 一致后再发布。

## 执行生产发布

优先使用服务器已有脚本：

```bash
ssh "$PROD_SSH" 'cd /root/tokenflux-release && bash ./deploy.sh'
```

如果服务器安装了 `tmux`，也可以后台运行：

```bash
ssh "$PROD_SSH" "tmux kill-session -t tokenflux-release 2>/dev/null || true; \
  tmux new-session -d -s tokenflux-release 'cd /root/tokenflux-release && bash ./deploy.sh'"
ssh "$PROD_SSH" 'tail -f /root/tokenflux-release/release.log'
```

不要因为没有 `tmux` 就中断发布；直接运行 `deploy.sh` 是可接受的，并且日志仍会写入 `/root/tokenflux-release/release.log`。

## 发布后验证

```bash
ssh "$PROD_SSH" 'set -euo pipefail; \
  echo __HEALTH__; \
  curl -fsS http://127.0.0.1:3000/api/status | grep -o "\"success\":true"; \
  echo __CONTAINERS__; \
  docker ps --filter name=new-api --format "name={{.Names}} image={{.Image}} status={{.Status}} ports={{.Ports}}"; \
  echo __IMAGE__; \
  docker images aitokensflux/new-api --format "repo={{.Repository}} tag={{.Tag}} id={{.ID}} size={{.Size}}" | head -n 8; \
  echo __DOCKER_DF__; \
  docker system df; \
  echo __DISK__; \
  df -h /'
```

成功标准：

- `/api/status` 返回 `"success":true`。
- `new-api` 容器 image 是本次 `$TAG`。
- `new-api-pg` 仍然 healthy。
- 根分区空间充足。

## 回滚

如果发布脚本失败，脚本会尝试自动回滚 compose 文件。需要人工回滚时：

```bash
ssh "$PROD_SSH" 'cd /root/tokenflux-release && bash ./rollback.sh'
```

回滚后再次验证：

```bash
ssh "$PROD_SSH" 'curl -fsS http://127.0.0.1:3000/api/status | grep -q "\"success\":true" && docker ps --filter name=new-api'
```

## 发布记录模板

发布完成后，在对话或运维记录中保留以下信息即可，不要记录密码：

```text
Commit:
Release:
Image:
Previous image:
Server release dir:
Local image tar:
Smoke test:
Production health:
Rollback file:
```

## 常见问题

### 主工作区有未提交改动怎么办

使用干净 worktree 发布：

```bash
rm -rf /tmp/tokenflux-prod-worktree
git worktree add --detach /tmp/tokenflux-prod-worktree HEAD
```

不要从脏的主工作区直接构建。

### 服务器没有 tmux 怎么办

直接执行：

```bash
ssh "$PROD_SSH" 'cd /root/tokenflux-release && bash ./deploy.sh'
```

### 本地 Docker 是 arm64 怎么办

构建和运行 smoke test 都显式指定：

```bash
--platform linux/amd64
```

### 发布后要不要清理旧镜像

确认新版本稳定后，可以人工清理旧的 `aitokensflux/new-api:*` 镜像，但保留当前镜像和至少一个可回滚镜像。不要删除 volumes。

### 如何确认发布脚本没有改坏

上传前可以只读取服务器脚本：

```bash
ssh "$PROD_SSH" 'sed -n "1,240p" /root/tokenflux-release/deploy.sh'
ssh "$PROD_SSH" 'sed -n "1,200p" /root/tokenflux-release/rollback.sh'
```
