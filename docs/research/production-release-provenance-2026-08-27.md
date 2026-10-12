# 正式环境最近一次 Docker 发布来源核查

调查基准：2026-08-27。证据范围包括当前仓库的一手记录，以及本机 Codex 发布会话中的命令输出和部署后的只读检查；会话文件位于仓库外，详见后文。

## 结论

结合仓库 Git 证据、本机发布会话记录和部署后的只读检查，可以确认最后一条可追溯的正式环境应用发布是 `36f961e7-20260807144501`，其镜像构建来源为 `main` 历史中的 commit `36f961e7ac9e637887eb8d9807189ceb2ef8a989`。本机会话记录显示构建、上传校验和生产部署脚本均成功，部署后生产容器运行同一镜像 tag。

仍需保留一个范围限制：无法证明 2026-08-27 之前是否存在完全不经过本机会话、仓库或当前可见发布记录的外部发布；在可见记录范围内，`36f961e7-20260807144501` 是最后一次成功发布。

关键事实：

1. 本地 Git 元数据中最后一条带有 `tokenflux-prod` 命名的生产构建准备记录，指向 commit `36f961e7ac9e637887eb8d9807189ceb2ef8a989`（2026-08-07 14:44:28 创建 detached worktree）。该 commit 当时已写入 `refs/heads/main` 并推送到 `refs/remotes/origin/main`，当前也可验证为 `main` 历史祖先。
2. 仓库保留的唯一镜像发布产物元数据指向 `923ef22e-20260806234045`，其短 SHA 对应的 commit `923ef22ec836d97f321073b450c271696cada110` 同样属于 `main` 历史。
3. 本机发布会话明确记录了该镜像的构建、上传和 `deploy.sh` 成功返回，部署后检查确认生产容器使用同一 tag。因此该候选不仅来自 `main`，而且是当前证据范围内最后一次实际完成的正式环境部署。

## 生产命名 worktree 证据

`.git/worktrees/*/logs/HEAD` 记录了 detached worktree 创建时检出的完整 commit；`git worktree list --porcelain` 将这些路径标记为 `tokenflux-prod-*`。按创建时间排列如下：

| worktree 创建时间（+0800） | commit | 提交主题 | 分支归属检查 |
| --- | --- | --- | --- |
| 2026-08-04 15:18:15 | `8eea07af87abedcd000e337ce279872ab645b5f9` | `fix(customer): correct homepage layout overflow` | `main`、`origin/main` |
| 2026-08-06 23:40:34 | `923ef22ec836d97f321073b450c271696cada110` | `feat(customer): polish complete customer experience` | `main`、`origin/main` |
| 2026-08-07 01:01:39 | `df12035e5ac22d5a9685cbb4960315f3fca4b13d` | `fix(customer): separate server and model status links` | `main`、`origin/main` |
| 2026-08-07 10:22:13 | `294e74528ec8320fede4cc107fa4e2b572f052b1` | `fix(customer): keep mobile model names visible` | `main`、`origin/main` |
| **2026-08-07 14:44:28** | **`36f961e7ac9e637887eb8d9807189ceb2ef8a989`** | **`fix(customer): reduce pricing heading size`** | **`main`、`origin/main`** |

关键原始记录（本地 Git reflog）：

```text
36f961e7 refs/heads/main@{2026-08-07 14:43:46 +0800}: commit: fix(customer): reduce pricing heading size
36f961e7 refs/remotes/origin/main@{2026-08-07 14:43:55 +0800}: update by push
36f961e7 worktrees/tokenflux-prod-worktree-36f961e7/HEAD@{2026-08-07 14:44:28 +0800}:
```

对最新候选执行的检查：

```text
git branch -a --contains 36f961e7ac9e637887eb8d9807189ceb2ef8a989
  * main
    remotes/origin/HEAD -> origin/main
    remotes/origin/main

git merge-base --is-ancestor 36f961e7ac9e637887eb8d9807189ceb2ef8a989 origin/main
退出码：0
```

来源：`.git/worktrees/tokenflux-prod-worktree-36f961e7/{HEAD,ORIG_HEAD,logs/HEAD,gitdir}`、`git worktree list --porcelain`、`git reflog --all --date=iso`，以及 commit `36f961e7` 的 Git 对象元数据。worktree 是 detached 状态，因此这些记录能证明检出的 commit 和时间，不能单独证明 Docker 命令或生产部署命令成功完成。

## 保留的镜像发布产物

当前仓库中唯一的 `.release-*` 产物在 commit `9757b54428be944df6185410986b89b07865d55f`（2026-08-27 19:30:14）中加入，但文件系统时间仍显示其生成于 2026-08-06：

- `.release-923ef22e-20260806234045.env`：
  - `RELEASE=923ef22e-20260806234045`
  - `IMAGE_TAG=aitokensflux/new-api:923ef22e-20260806234045`
  - `IMAGE_TAR=/root/tokenflux-release/releases/923ef22e-20260806234045/new-api-image.tar.gz`
  - `LOG_FILE=/root/tokenflux-release/release.log`
- `.release-923ef22e-20260806234045.sha256`：记录 `new-api-image.tar.gz` 的 SHA-256 为 `341adb743515a6c4c1edd88d70baa1805beb1e54f5deebb283ab6043727b2de1`。
- `.release-Dockerfile-923ef22e`：`FROM scratch`，复制 `rootfs/` 并以 `/new-api` 启动，符合生产发布文档描述的运行时镜像形态。

该 release ID 的短 SHA 是 `923ef22e`。对应 commit 的提交时间为 2026-08-06 23:39:46，且 reflog 显示 `tokenflux-prod-923ef22e` worktree 于 23:40:34 创建；`git merge-base --is-ancestor 923ef22e origin/main` 返回 0。因此这份可见镜像元数据与 `main` 提交在时间和 commit ID 上是一致的。

限制：仓库没有保存上述 `new-api-image.tar.gz` 本体、Docker manifest/OCI revision、上传校验日志或服务器端 `release.log`，所以只能确认“存在指向该 commit 的发布元数据”，不能确认镜像确实在生产运行。

## 本机发布会话中的实际部署证据（仓库外）

本机 Codex 会话文件
`/Users/ouyeel/.codex/sessions/2026/08/07/rollout-2026-08-07T09-53-17-019fd9ec-b9d0-7462-ba50-8ec50a42a45b.jsonl`
保留了这次发布的标准输出（第 1752 行），其中明确出现：

```text
deploy started: 36f961e7-20260807144501
target image: aitokensflux/new-api:36f961e7-20260807144501
previous image: aitokensflux/new-api:44ee6edc-20260807125828
deploy succeeded: 36f961e7-20260807144501
new-api image=aitokensflux/new-api:36f961e7-20260807144501
```

同一会话在构建前检查了干净 detached worktree：

```text
## HEAD (no branch)
36f961e7ac9e637887eb8d9807189ceb2ef8a989
```

会话还记录了镜像构建、导出 tar、上传到发布服务器并校验本地/远端 tar SHA-256 一致；部署脚本返回成功。随后 2026-08-12 的只读生产检查再次确认：`new-api` 容器运行
`aitokensflux/new-api:36f961e7-20260807144501`，容器状态为 running，重启次数为 0。

上述会话文件位于仓库外，仅作为本机操作审计证据，不包含在 Git 版本历史中；文档只记录镜像 tag、commit 和状态，不记录服务器凭据。

为确认没有更晚的可见发布，我对 `/Users/ouyeel/.codex/sessions/2026/**/*.jsonl` 中的部署输出按
`deploy succeeded: <commit>-<YYYYMMDDHHMMSS>` 进行扫描。最新成功记录是
`36f961e7-20260807144501`；该日期之后未发现新的正式 `new-api` 部署成功记录（2026-08-27 核查会话中的同名文本属于对历史记录的引用）。

## 历史流程和 CI 为什么不能单独证明分支

在最新生产候选 `36f961e7` 对应的历史版本中：

- `docs/production-release.md` 只要求从 detached worktree 的 `HEAD` 构建，并用 `git rev-parse --short HEAD` 生成 image tag；当时没有检查 `HEAD` 是否属于 `main`。
- `.github/workflows/docker-build.yml` 的 tag push 会响应任意非 `nightly` tag；手动运行接受任意 `tag`，并以 `${{ github.event.inputs.tag || github.ref }}` checkout（`git show 36f961e7:.github/workflows/docker-build.yml` 第 3–13、38–43 行）。
- `.github/workflows/docker-image-branch.yml` 的手动输入字段是任意 `branch`，历史版本直接 checkout `${{ inputs.branch }}`（`git show 36f961e7:.github/workflows/docker-image-branch.yml` 第 3–9、23–27 行）。

所以，当前工作区后来加入的“只允许 main”规则是面向后续发布的防护，不能倒推历史发布一定经过该检查；历史来源判断必须依赖上面的 commit/worktree/产物证据和实际部署日志。

## 仍可进一步加强的独立审计证据

当前结论已经由本机发布会话和部署后检查闭环；以下信息未纳入仓库或会话记录，若需要服务器侧独立审计可再读取：

- 正式环境当前镜像的 immutable digest、OCI `org.opencontainers.image.revision` 以及对应 release 目录。
- 未纳入本仓库或本机会话的 GitHub Actions 手动运行、服务器外部发布记录。

在不把主机凭据写入仓库的前提下，可从正式服务器保存以下脱敏只读结果：

```bash
# 服务器发布记录
ssh "$PROD_SSH" 'cat /root/tokenflux-release/release.env; tail -n 200 /root/tokenflux-release/release.log'

# 当前容器实际使用的镜像和镜像标签
ssh "$PROD_SSH" 'docker inspect new-api --format "{{.Config.Image}}"; docker image inspect "$(docker inspect new-api --format "{{.Config.Image}}")"'
```

如果需要将本机审计证据与服务器记录交叉验证，可检查 `release.env`、`release.log` 和镜像 OCI revision 是否与完整 commit `36f961e7ac9e637887eb8d9807189ceb2ef8a989` 对齐；这些信息不会改变当前已确认的发布来源结论。
