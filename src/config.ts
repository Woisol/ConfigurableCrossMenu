type CSSSize = string | number;
type CSSColor = { light: string, dark?: string } | string; // 支持单一颜色字符串或根据主题自动切换的颜色对象
export type MenuDirection = 'up' | 'right' | 'down' | 'left';

interface CenterConfig {
  // 方式1：预设图标 + 文字
  // icon radius 默认为 center radius 的 80%，可以通过此处覆盖
  icon?: { url: string; size?: CSSSize, radius?: CSSSize };
  title?: { content: string; size?: CSSSize, color?: CSSColor };
  subtitle?: { content: string; size?: CSSSize, color?: CSSColor };
  style?: { direction?: 'column' | 'row', color: CSSColor, borderSize?: CSSSize, radius?: CSSSize }; // 图标和文字的排列方式，默认为 'column'（图标在上，文字在下），'row'（图标在左，文字在右）
}

interface CenterCustom {
  // 方式2：完全自定义
  render: () => HTMLElement;
}

// 用 discriminated union 替代 union of objects
export type CenterStyle =
  | (CenterConfig & { render?: never })
  | CenterCustom;

type MenuStyle = {}

export type MenuItem = {
  direction: MenuDirection,
  label: string,
  size?: CSSSize,
  bgColor?: CSSColor,
  offset?: CSSSize, // 菜单项相对于中心的偏移距离，默认偏移 50px，可能需要手动调整
  hoverOffset?: CSSSize, // 鼠标悬停时菜单项的额外偏移距离，默认为 15px，可能需要手动调整
} & ({
  url?: string
  action?: never
} | {
  action: () => void | Promise<void>
  url?: never
});

export interface CCMConfig {
  container: string,  // 菜单挂载的容器
  startingDirections: MenuDirection,
  style: {
    width: CSSSize,   // ？这是干啥的？弃用？
    // radius: CSSSize,
    background: {
      menuColor?: CSSColor,
      centerColor?: CSSColor,
      opacity?: number
      blur?: number,
    }
    center: CenterStyle,
    menu: {
      length: CSSSize,  // 菜单长度
      color?: CSSColor,
      radius?: CSSSize,
    }
    showAnimation: {
      center: {
        duration: number, // 设置 0 关闭
      }
      menu: {
        durationPerItem: number, // 设置 0 关闭
      }
    },
  }
  // items: MenuItem[],
  keyBindings: Partial<Record<MenuDirection, string>>
}



const defaultConfig = {
  container: "#ccm-con",
  startingDirections: 'up',
  style: {
    width: 200,
    radius: 50,
    background: {
      menuColor: { light: 'hsl(0, 0%, 93%)', dark: 'hsl(0, 0%, 30%)' },
      // ~~现在不需要注意了 | 注意，如果需要 blur 效果，必须在背景色中使用 alpha 通道（如 rgba 或 hsla），下方的 opacity 为整个元素的透明度与 blur 无关
      centerColor: { light: 'hsl(0, 0%, 100%)', dark: 'hsl(0, 0%, 50%)' },
      opacity: 0.5,
      blur: 3,
    },
    center: {
      title: { content: 'CCM', size: 16, color: { light: 'hsl(0, 0%, 20%)', dark: 'hsl(0, 0%, 90%)' }, radius: '5%' },
      subtitle: { content: 'Configurable Cross Menu', size: 12, color: { light: 'hsl(0, 0%, 50%)', dark: 'hsl(0, 0%, 80%)' } },
      //TODO color 没有实现
      style: { direction: 'column', color: { light: 'hsl(0, 0%, 20%)', dark: 'hsl(0, 0%, 90%)' }, radius: 20 }, // borderSize: 2, borderColor: 'hsl(0, 0%, 80%)',
    },
    menu: {
      length: 100,

      color: { light: 'hsl(0, 0%, 40%)', dark: 'hsl(0, 0%, 60%)' },
      radius: 8,
    },
    showAnimation: {
      center: {
        duration: 500,
      },
      menu: {
        durationPerItem: 100,
      }
    }
  },
  // items: [],
  keyBindings: {}
} as CCMConfig;

// export function mergeConfig(config: Partial<CCMConfig>): CCMConfig;
// export function mergeConfig(config: Partial<CCMConfig>, origin: CCMConfig): CCMConfig;
export function mergeConfig(config: Partial<CCMConfig>, origin: CCMConfig): CCMConfig {
  // let base: CCMConfig;
  // if (origin) {
  //   base = origin;
  // } else {
  //   // @ts-expect-error this
  //   if ('config' in this) {
  //     // @ts-expect-error this
  //     base = this.config;
  //   } else {
  //     throw new Error('No origin config provided and this.config is not available');
  //   }
  // }
  const base = origin;
  return {
    ...base,
    ...config,
    style: {
      ...base.style,
      ...config.style,
      background: { ...base.style.background, ...config.style?.background },
      menu: { ...base.style.menu, ...config.style?.menu },
      center: (() => {
        const dc = 'render' in base.style.center ? undefined : base.style.center;
        const uc = config.style?.center;
        if (!uc) return base.style.center;
        if ('render' in uc) return uc;
        return { ...uc, style: { ...dc?.style, ...uc.style } as NonNullable<typeof uc.style> };
      })(),
      showAnimation: {
        center: { ...base.style.showAnimation.center, ...config.style?.showAnimation?.center },
        menu: { ...base.style.showAnimation.menu, ...config.style?.showAnimation?.menu },
      },
    },
  }
}

export function CCMConfigBuilder(config: Partial<CCMConfig>): CCMConfig;
export function CCMConfigBuilder(config: Partial<CCMConfig>, useDefaultKeyBindings: boolean): CCMConfig;
export function CCMConfigBuilder(config: Partial<CCMConfig>, useDefaultKeyBindings?: boolean): CCMConfig {
  const merged: CCMConfig = mergeConfig(config, defaultConfig);
  if (useDefaultKeyBindings) merged.keyBindings = {
    up: 'w',
    right: 'd',
    down: 's',
    left: 'a',
  };
  return merged;
}

// export { CCMConfigBuilder };

const testItems: MenuItem[] = [
  { direction: 'up', label: 'Up Item', action: () => alert('Up') },
  { direction: 'right', label: 'Right Item', action: () => alert('Right') },
  { direction: 'down', label: 'Down Item1', action: () => alert('Down') },
  { direction: 'down', label: 'Down Item2', url: 'https://bilibili.com' },
  { direction: 'left', label: 'Left Item', action: () => alert('Left') },
]