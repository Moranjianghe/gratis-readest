# 分支与上游同步流程

本文记录 Gratis Readest 的分支职责，以及把 Readest 上游更新合并到本地功能分支的推荐流程。

## 分支职责

- `main`：尽量保持为 fork 的上游同步分支，不放 nightly、签名密钥和发布渠道等临时定制。
- `feature/*`：功能开发、上游同步后的冲突处理和测试分支。
- `gratis`：经过测试后用于 nightly 或正式发布的 Gratis 分支。
- `origin/main`：通过 GitHub Sync fork 更新的上游跟踪分支，不直接在此分支开发。

不要直接在 `gratis` 上合并 `origin/main`。先在同步分支或功能分支完成合并和测试，再合入 `gratis`。

## GitHub Sync fork

GitHub Sync fork 只更新 fork 的 `origin/main`，不会自动更新
`feature/*` 或 `gratis`。流程如下：

1. 在 GitHub fork 页面点击 **Sync fork**，更新远程 `main`。
2. 本地获取更新：

   ```bash
   git fetch origin main
   ```

3. 在功能分支上创建临时同步分支：

   ```bash
   git switch feature/gratis-foundation
   git status --short
   git switch -c sync/main-YYYYMMDD
   git merge --no-ff origin/main
   ```

## 合并前检查

开始合并前必须确认工作区干净：

```bash
git status --short
```

`.gradle`、`target`、`.next`、`node_modules` 和 Android 生成目录是构建产物，不应作为源码提交。检查生成目录时使用：

```bash
git status --ignored
git check-ignore -v path/to/generated-file
```

不要用 `git checkout .` 或 `git reset --hard` 清理不明变更。先确认目标路径，再只清理明确的生成目录。

## 冲突处理

查看冲突文件：

```bash
git status
git diff --name-only --diff-filter=U
```

处理原则：

- 普通业务代码和依赖更新优先采用上游版本。
- `appConfig.ts` 中的 Gratis 品牌、数据目录、更新地址和产品策略要保留。
- `nightly.yml`、`release.yml` 中的 Gratis 包名、签名、Artifact 或发布地址要逐项检查，不能盲目整文件覆盖。
- 不要把 `.gradle`、`target` 等生成物加入暂存区。

处理完成后检查：

```bash
git diff --check
git diff --cached --check
git add path/to/resolved-file
```

如果合并尚未提交且决定放弃：

```bash
git merge --abort
```

## 测试与合入

在同步分支完成测试后，把同步分支快进回功能分支：

```bash
source /home/moran/.nvm/nvm.sh
nvm use 22.23.1

pnpm --filter @readest/readest-app lint
pnpm --filter @readest/readest-app test --run

git switch feature/gratis-foundation
git merge --ff-only sync/main-YYYYMMDD
git push origin feature/gratis-foundation
```

功能在分支上验证通过后，再合入发布分支：

```bash
git fetch origin gratis
git switch gratis
git merge --no-ff feature/gratis-foundation
git push origin gratis
```

如果功能分支已经推送到 GitHub，优先通过 Pull Request 合入 `gratis`，这样可以保留 CI 检查和审查记录。

## 为什么会出现大量变更

合并几十个上游提交时，`git status` 可能显示数百个文件。这些通常是上游提交、子模块指针或生成目录的结果，不等同于需要手工修改的代码。

确认当前合并规模可以使用：

```bash
git rev-list --left-right --count HEAD...origin/main
git diff --stat HEAD...origin/main
```

如果大量文件来自一次尚未完成的合并，先检查是否存在 `MERGE_HEAD`：

```bash
git rev-parse -q --verify MERGE_HEAD
```

确认是误操作时，在得到确认后使用 `git merge --abort`，不要逐个删除上游文件。
