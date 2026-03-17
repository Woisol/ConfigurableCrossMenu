type CSSSize = string | number;
export type MenuDirection = 'up' | 'right' | 'down' | 'left';

interface CenterConfig {
  // 方式1：预设图标 + 文字
  icon?: { url: string; size?: CSSSize };
  title?: { content: string; size?: CSSSize, color?: string };
  subtitle?: { content: string; size?: CSSSize, color?: string };
  style?: { direction?: 'column' | 'row', borderSize?: CSSSize }; // 图标和文字的排列方式，默认为 'column'（图标在上，文字在下），'row'（图标在左，文字在右）
}

interface CenterCustom {
  // 方式2：完全自定义
  render: () => HTMLElement;
}

// 用 discriminated union 替代 union of objects
type CenterStyle =
  | (CenterConfig & { render?: never })
  | CenterCustom;

type MenuStyle = {}

export type MenuItem = {
  direction: MenuDirection,
  label: string,
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
    radius: CSSSize,
    background: {
      menuColor?: string,
      centerColor?: string,
      opacity?: number
      blur?: number,
    }
    center: CenterStyle,
    menu: {
      length: CSSSize,  // 菜单长度
      color?: string,
    }
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
      menuColor: 'hsl(0, 0%, 93%)',
      centerColor: 'hsl(0, 0%, 100%)',
      opacity: 0.8,
      blur: 10,
    },
    center: {
      title: { content: 'CCM', size: 16 },
      subtitle: { content: 'Configurable Cross Menu', size: 12, color: 'hsl(0, 0%, 50%)' },
      style: { direction: 'column', borderSize: 2, borderColor: 'hsl(0, 0%, 80%)' },
    },
    menu: {
      length: 100,
      color: 'hsl(0, 0%, 20%)',
    }
  },
  // items: [],
  keyBindings: {}
} as CCMConfig;

export function CCMConfigBuilder(config: Partial<CCMConfig>): CCMConfig;
export function CCMConfigBuilder(config: Partial<CCMConfig>, useDefaultKeyBindings: boolean): CCMConfig;
export function CCMConfigBuilder(config: Partial<CCMConfig>, useDefaultKeyBindings?: boolean): CCMConfig {
  config = { ...defaultConfig, ...config };
  if (useDefaultKeyBindings) config.keyBindings = {
    up: 'w',
    right: 'd',
    down: 's',
    left: 'a',
  }
  return config as CCMConfig;
}

// export { CCMConfigBuilder };