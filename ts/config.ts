type CSSSize = string | number;
export type MenuDirection = 'up' | 'right' | 'down' | 'left';

interface CenterConfig {
  // 方式1：预设图标 + 文字
  icon?: string;
  title?: string;
  size?: CSSSize;
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

export interface ConfigableCrossMenuConfig {
  container: HTMLElement,  // 菜单挂载的容器
  directions: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,  // 1-8.
  style: {
    width: CSSSize,
    radius: CSSSize,
    background: {
      color?: string,   // will be override by center or menu
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
  keyBindings?: Partial<Record<MenuDirection, string>>
}