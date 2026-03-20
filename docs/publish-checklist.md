# 首次发布 npm 包清单

这份清单是给第一次发布 npm 包时用的，目标是让你知道：

- 哪些事情必须提前准备
- 哪些操作是你需要亲手完成的
- 哪些事情已经被 GitHub Actions 自动化

## 0. 先确认包名和 scope

当前仓库配置里使用的是：

```text
@woisol-g/configurable-cross-menu
```

这件事一定要先确认，因为 npm 上的 scope 必须属于你自己。

你要检查的是：

1. `woisol-g` 是否就是你的 npm 用户名
2. 如果不是，它是否是你拥有权限的 npm organization
3. 如果两者都不是，请先修改 `package.json` 里的 `name`

如果 scope 不属于你，GitHub Action 再完整也发不出去。

## 1. 本地先做一次完整检查

在仓库根目录运行：

```bash
pnpm install
pnpm ci
```

这一步应该完成：

- TypeScript 类型检查
- webpack 构建
- Vitest 测试
- Storybook 构建
- `npm pack --dry-run`

如果这里不过，先不要急着发包。

## 2. 确认 npm 账号状态

你需要：

1. 注册或登录 npm
2. 确认自己有发布 public scoped package 的权限
3. 确认 2FA 策略是否会影响 token 发布

可以用下面命令确认当前本地登录用户：

```bash
npm whoami
```

如果这里报错，先处理账号问题。

## 3. 创建 `NPM_TOKEN`

在 npm 网站中创建一个 access token，给 GitHub Actions 使用。

建议：

- 使用专门给 CI 的 token
- 权限遵循最小够用原则
- 妥善保存，不要提交到仓库

## 4. 在 GitHub 仓库里配置 Secret

在仓库 `Settings -> Secrets and variables -> Actions` 中新增：

```text
NPM_TOKEN
```

值就是你在 npm 上生成的 token。

## 5. 确认 GitHub Actions 可用

仓库已经准备了两条工作流：

- `CI`
- `Publish`

你可以先推送到 `main`，确认 `CI` 通过。

## 6. 第一次发布的推荐方式

推荐先用手动触发 `Publish` workflow，而不是直接依赖 release 事件。

理由：

- 第一次更容易观察日志
- 出错时更容易回滚思路
- 你能先确认 npm 权限和包名是否正确

建议顺序：

1. 打开 GitHub 仓库的 `Actions`
2. 找到 `Publish`
3. 选择 `Run workflow`
4. 观察日志直到完成

## 7. 发布成功后检查什么

至少检查以下四件事：

### npm 页面

确认包页面可访问：

```text
https://www.npmjs.com/package/@woisol-g/configurable-cross-menu
```

### jsDelivr 的 JS 链接

```text
https://cdn.jsdelivr.net/npm/@woisol-g/configurable-cross-menu@latest/dist/configurable-cross-menu.js
```

### jsDelivr 的 CSS 链接

```text
https://cdn.jsdelivr.net/npm/@woisol-g/configurable-cross-menu@latest/dist/configurable-cross-menu.css
```

### GitHub Action Summary

发布 workflow 会在 summary 中输出最终链接，确认它们和你预期一致。

## 8. 如果发布失败，最常见的原因

### 包名或 scope 没权限

症状：

- npm 返回权限错误
- 说你不是该 scope 的 owner

处理：

- 检查 `package.json.name`
- 换成你自己的 npm 用户名 scope 或组织 scope

### `NPM_TOKEN` 权限不足

症状：

- GitHub Action 中认证失败

处理：

- 重新生成 token
- 确认 Secret 名称就是 `NPM_TOKEN`

### 版本号已存在

症状：

- npm 提示同版本不能重复发布

处理：

- 更新 `package.json.version`
- 重新走发布流程

### 本地可以构建，但 workflow 失败

症状：

- CI 环境中 `pnpm install`、`build` 或 `test` 失败

处理：

- 先看失败步骤
- 通常是 lockfile、依赖版本或环境差异问题

## 9. 第一次发布后建议立刻做的事情

1. 在 README 顶部补 npm badge
2. 用 jsDelivr 链接手动做一次纯 HTML 测试
3. 新开一个空目录，按“从 npm 安装”的方式验证一次
4. 记录第一次发布遇到的问题，作为后续项目模板
