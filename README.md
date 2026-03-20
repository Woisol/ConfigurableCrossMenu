# Configurable Cross Menu

一个高可配置、动画表现优雅、可以直接在 HTML 中引入并使用的十字菜单组件。

当前项目已经具备以下特点：

- 直接在浏览器中引入 UMD 产物即可使用
- 支持 TypeScript 配置
- 支持中心区域和四个方向菜单项的高自由度配置
- 自带较明显的动态动画与视差效果
- 支持链接型菜单项和动作型菜单项
- 支持基础键盘操作

如果你想快速了解项目状态、设计选择和后续优化建议，可以先看：

- 工程评审文档：[ENGINEERING_REVIEW.md](./ENGINEERING_REVIEW.md)
- 首次发布清单：[docs/publish-checklist.md](./docs/publish-checklist.md)
- 英文副文档：[README.en.md](./README.en.md)

## 安装

推荐的 npm 包名是：

```bash
pnpm add @woisol-g/configurable-cross-menu
```

如果你使用 npm：

```bash
npm install @woisol-g/configurable-cross-menu
```

## 快速开始

### 1. 在构建工具项目中使用

```ts
import { CCM } from '@woisol-g/configurable-cross-menu';
import '@woisol-g/configurable-cross-menu/styles.css';

const ccm = new CCM(
  {
    container: '#ccm-con',
    style: {
      center: {
        title: { content: 'C C M' },
        subtitle: { content: 'Configurable Cross Menu' },
        style: { direction: 'column' },
      },
    },
  },
  true,
);

ccm.render([
  { direction: 'up', label: 'Home', url: '#home' },
  { direction: 'right', label: 'About', url: '#about' },
  { direction: 'right', label: 'Profile', action: () => console.log('Profile') },
  { direction: 'down', label: 'Contact', url: '#contact' },
  { direction: 'left', label: 'Settings', action: () => console.log('Settings') },
]);
```

```html
<div id="ccm-con"></div>
```

### 2. 在浏览器中直接引入

发布后可以直接使用 jsDelivr：

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CCM Demo</title>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@woisol-g/configurable-cross-menu@latest/dist/configurable-cross-menu.css"
    />
  </head>
  <body>
    <div id="ccm-con"></div>

    <script src="https://cdn.jsdelivr.net/npm/@woisol-g/configurable-cross-menu@latest/dist/configurable-cross-menu.js"></script>
    <script>
      const { CCM } = globalThis.ConfigurableCrossMenu || {};

      if (!CCM) {
        throw new Error('ConfigurableCrossMenu failed to load.');
      }

      const ccm = new CCM(
        {
          container: '#ccm-con',
          style: {
            center: {
              title: { content: 'C C M' },
              subtitle: { content: 'Configurable Cross Menu' },
              style: { direction: 'column' },
            },
          },
        },
        true,
      );

      ccm.render([
        { direction: 'up', label: 'Home', url: '#home' },
        { direction: 'right', label: 'About', url: '#about' },
        { direction: 'down', label: 'Contact', url: '#contact' },
        { direction: 'left', label: 'Settings', action: () => console.log('Settings') },
      ]);
    </script>
  </body>
</html>
```

## 公开 API

### `new CCM(config, useDefaultKeyBindings?)`

- `config`: `Partial<CCMConfig>`
- `useDefaultKeyBindings`: 是否启用默认键位映射，当前构造函数默认是 `true`

### `ccm.render(items?, container?, config?)`

- `items`: 菜单项数组
- `container`: 可选，新的容器选择器
- `config`: 可选，本次渲染要叠加的配置

### `ccm.destroy()`

- 清空当前容器中的菜单内容
- 清理当前实例维护的部分状态

## 配置概览

下面是当前版本最常用的配置字段说明。更完整的默认值可以参考 [`src/config.ts`](./src/config.ts)。

| 字段 | 说明 |
| --- | --- |
| `container` | 菜单挂载容器选择器，默认是 `#ccm-con` |
| `startingDirections` | 当前版本中已存在于配置类型中，但暂未形成完整对外行为 |
| `style.width` | 菜单整体宽度相关变量 |
| `style.background.menuColor` | 菜单背景色，支持字符串或 `{ light, dark }` |
| `style.background.centerColor` | 中心区域背景色 |
| `style.background.opacity` | 背景透明度 |
| `style.background.blur` | 背景模糊强度 |
| `style.center` | 中心区域配置，支持默认内容或自定义渲染 |
| `style.menu.length` | 菜单项伸展长度 |
| `style.menu.color` | 菜单项前景色 |
| `style.menu.radius` | 菜单项圆角 |
| `style.showAnimation.center.duration` | 中心区域展示动画时长 |
| `style.showAnimation.menu.durationPerItem` | 菜单项分批出现的间隔时长 |
| `keyBindings` | 类型中已预留，当前实现仍以内置键位逻辑为主 |

## 菜单项格式

当前菜单项支持两种模式：

### 链接型

```ts
{
  direction: 'up',
  label: 'Home',
  url: '#home',
}
```

### 动作型

```ts
{
  direction: 'left',
  label: 'Settings',
  action: () => {
    console.log('Open settings');
  },
}
```

### 菜单项字段说明

| 字段 | 说明 |
| --- | --- |
| `direction` | `up` / `right` / `down` / `left` |
| `label` | 菜单文本 |
| `size` | 字号或尺寸 |
| `bgColor` | 单项背景色 |
| `offset` | 相对中心的偏移距离 |
| `hoverOffset` | hover 时额外偏移 |
| `url` | 链接型菜单项使用 |
| `action` | 动作型菜单项使用 |

## 自定义中心区域

如果你不想用默认的标题/副标题/图标结构，可以使用 `render` 自定义：

```ts
const ccm = new CCM({
  container: '#ccm-con',
  style: {
    center: {
      render: () => {
        const el = document.createElement('div');
        el.className = 'custom-center';
        el.textContent = 'Custom Center';
        return el;
      },
    },
  },
});
```

## 键盘操作

当前版本内置了以下键位：

- `W` / `ArrowUp`
- `D` / `ArrowRight`
- `S` / `ArrowDown`
- `A` / `ArrowLeft`

已知情况：

- 类型系统中存在 `keyBindings` 配置
- 当前实际逻辑仍然使用内置硬编码键位
- 这部分已在工程评审文档中列为重点改进项

## 本地开发

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm test
pnpm storybook
pnpm build-storybook
```

## 测试与文档

本仓库当前采用两套互补方式：

- Storybook：用来展示典型场景、视觉效果和交互状态
- Vitest：用来验证配置合并、基础渲染和键盘选择等行为

## 发布

项目的推荐发布链路是：

1. 发布到 npm
2. 使用 jsDelivr 自动消费 npm 包

GitHub Actions 已按这条链路准备好：

- `CI`: 负责类型检查、构建、测试、Storybook 构建和 `npm pack --dry-run`
- `Publish`: 负责正式发布到 npm，并输出 jsDelivr 链接

第一次发布前，请先看：

- [docs/publish-checklist.md](./docs/publish-checklist.md)

## 已知限制

这个仓库已经能工作，但仍保留一些“个人项目进入公开包之前常见的原型期痕迹”，例如：

- 生命周期清理还不完整
- 某些配置项已经在类型里存在，但实现还没有完全跟上
- 目前仍以 UMD 构建为主，后续可以考虑补更现代的 ESM/CJS 双产物
- 某些 CSS 特性对兼容性要求较高

这些问题我没有在这轮直接改动源码，而是统一写进了工程评审文档，方便后续你按节奏逐项优化：

- [ENGINEERING_REVIEW.md](./ENGINEERING_REVIEW.md)
