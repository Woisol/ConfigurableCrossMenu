type CSSSize = string | number;
export type MenuDirection = 'up' | 'right' | 'down' | 'left';

interface CenterConfig {
  // 方式1：预设图标 + 文字
  icon?: string;
  title?: string;
  titleSize?: CSSSize;
  color?: string;
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

type MenuItem = {
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
    width: CSSSize,
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
  items: MenuItem[],
  keyBindings: Partial<Record<MenuDirection, string>>
}


function CCMConfigBuilder(config: Partial<CCMConfig>, useDefaultKeyBindings: boolean, useTemplateItems: boolean): CCMConfig {
  const _config = {
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
        title: 'CCM',
        titleSize: 16,
        color: 'hsl(0, 0%, 20%)',
      },
      menu: {
        length: 100,
        color: 'hsl(0, 0%, 20%)',
      }
    },
    items: [],
    keyBindings: useDefaultKeyBindings ? {
      up: 'w',
      right: 'd',
      down: 's',
      left: 'a',
    } : {}
  } as CCMConfig;

  config = { ..._config, ...config };
  return config as CCMConfig;
}