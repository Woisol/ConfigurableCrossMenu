import { CCMConfigBuilder, type CCMConfig, type MenuDirection, type MenuItem } from "./config";
import * as pug from "pug";

/**
 * 配置化十字菜单库
 *
 * 使用方式：
 * const ccm = new CCM({ ... });
 * ccm.render();
 */
export class CCM {
  private _config: CCMConfig;
  private items: MenuItem[] = [];
  // private crossMenu: CrossMenu | null = null;
  private initialized = false;
  private _containerEle: HTMLElement | null = null;

  get config(): CCMConfig {
    return this._config;
  }

  set config(config: Partial<CCMConfig>) {
    this._config = { ...this._config, ...config };
  }

  get container() {
    // 666 isSameNode
    if (!this._containerEle || !(document.querySelector(this.config.container) as HTMLElement)?.isSameNode(this._containerEle)) {
      this._containerEle = document.querySelector(this.config.container) as HTMLElement;
    }
    return this._containerEle;
  }

  constructor(
    config: Partial<CCMConfig>,
    useDefaultKeyBindings: boolean = true,
  ) {
    this._config = CCMConfigBuilder(config, useDefaultKeyBindings);
  }

  /**
   * 渲染菜单
   */
  render(items: MenuItem[] = [], container?: string): void {
    if (container) this.config.container = container;
    if (items) this.items = items;

    if (!this.initialized) {
      this.initialized = true;
      this.registerParallaxEffect();
      this.registerKeyboardEvents()
    }

    // 销毁旧的菜单
    this.destroy();
    // 渲染菜单项
    this.renderMenuItems();
    // 渲染中心元素
    this.renderCenter();
  }

  /**
   * 渲染中心元素
   */
  renderCenter(): void {
    throw new Error('Not implemented yet');
    // const centerHtml = pug.renderFile('/templates/center.pug', {title: this.config.style.center.title, subtitle: this.config.style.center.subtitle, style: this.config.style.center.style});
    // document.querySelector(this.config.container)?.insertAdjacentHTML('beforeend', centerHtml);
  }

  /**
   * 渲染菜单项
   */
  renderMenuItems(): void {
    throw new Error('Not implemented yet');
    const pugMenuFunc = pug.compileFile('/templates/menuItem.pug');
    this.items.forEach(item => {
      pugMenuFunc(item);
    })
  }

  /**
   * 视差效果注册
   */
  registerParallaxEffect(): void {
    // 不对，为什么要用 IIFE 包裹？直接放在外面不行吗？因为要等 DOM 加载完成，或者说等元素存在了再绑定事件，不然 document.getElementById('ccm-con') 就拿不到元素了。
    // woc，加 defer 无法解决
    // (() => {
    document.addEventListener('DOMContentLoaded', () => {
      const parallaxCon = document.body;
      const ccm = document.getElementById('ccm-con');
      if (!parallaxCon || !ccm) return;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (reduceMotion || !canHover) return;

      let latestPointerEvent: PointerEvent | null = null;
      let ticking = false;

      const update = () => {
        if (!latestPointerEvent) return;

        const rect = parallaxCon.getBoundingClientRect();
        const nx = ((latestPointerEvent.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((latestPointerEvent.clientY - rect.top) / rect.height - 0.5) * 2;

        ccm.style.setProperty('--ccm-parallax-x', `${(nx * 80).toFixed(2)}px`);
        ccm.style.setProperty('--ccm-parallax-y', `${(ny * 80).toFixed(2)}px`);
        ccm.style.setProperty('--ccm-tilt-x', `${(nx * 25).toFixed(2)}deg`);
        ccm.style.setProperty('--ccm-tilt-y', `${(-ny * 20).toFixed(2)}deg`);
      };

      const reset = () => {
        ccm.style.setProperty('--ccm-parallax-x', '0px');
        ccm.style.setProperty('--ccm-parallax-y', '0px');
        ccm.style.setProperty('--ccm-tilt-x', '0deg');
        ccm.style.setProperty('--ccm-tilt-y', '0deg');
      };

      const onPointerMove = (event: PointerEvent) => {
        latestPointerEvent = event;
        if (ticking) return;

        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      };

      const onPointerLeave = () => {
        latestPointerEvent = null;
        requestAnimationFrame(reset);
      };

      // 据说如果只是简单变量读写浏览器已经做了优化可以不加 requestAnimationFrame
      // 还是得加，不加动画抽搐
      parallaxCon.addEventListener('pointermove', onPointerMove, { passive: true });
      parallaxCon.addEventListener('pointerleave', onPointerLeave, { passive: true });
    });
    // })();
  }

  /**
   * 注册键盘事件
   */
  ccmSelectAwaitingDirection: MenuDirection | null = null;
  ccmSelectAwaitingTimer: ReturnType<typeof setTimeout> | null = null;
  ccmSelectAwaitDelayMS = 5000;
  registerKeyboardEvents(): void {
    document.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      const keyMap: { [key: string]: MenuDirection } = {
        w: 'up',
        arrowup: 'up',
        d: 'right',
        arrowright: 'right',
        s: 'down',
        arrowdown: 'down',
        a: 'left',
        arrowleft: 'left'
      };

      const direction = keyMap[key];
      if (direction) {
        event.preventDefault();
        this._ccmHandlePress(direction);
      }

    });

  }
  /**
   * 通用清理选择状态工具函数
  */
  private _clear() {
    const selectingItems = document.querySelectorAll(`.ccm-items.selecting`);
    this.ccmSelectAwaitingDirection = null;

    selectingItems.forEach(item => {
      item.classList.remove('selecting');
    })
  }
  private _ccmClearSelecting(delay: boolean | number = false) {
    if (this.ccmSelectAwaitingTimer) {
      clearTimeout(this.ccmSelectAwaitingTimer);
      this.ccmSelectAwaitingTimer = null;
    }
    if (delay) {
      this.ccmSelectAwaitingTimer = setTimeout(() => this._clear(), delay === true ? this.ccmSelectAwaitDelayMS : delay);
    } else {
      this._clear();
    }
  }
  /**
   * 按下事件通用处理
   */
  private _ccmHandlePress(direction: MenuDirection) {
    if (!direction) throw new Error('direction is required');

    // 重复点击重置选择 timer
    if (this.ccmSelectAwaitingDirection !== null) {
      if (direction === this.ccmSelectAwaitingDirection) {
        this._ccmClearSelecting(true);
        return;
      }


      if (this._ccmTriggerAwaitingSelection(direction)) {
        return;
      }

      this._ccmClearSelecting();
    }


    const menuItems = document.querySelectorAll(`.ccm-items.${direction}`);
    if (!menuItems) {
      return
    }
    menuItems.forEach(item => {
      item.classList.add('selecting');
    });
    // 如果有多个 up 菜单项，进入选择状态，等待用户再次点击确认选择哪个菜单项
    if (menuItems.length > 1) {
      this.ccmSelectAwaitingDirection = direction;
      this._ccmClearSelecting(true);
    } else if (menuItems.length === 1) {
      // 只有一个 up 菜单项，直接触发点击
      const item = menuItems[0]!;
      if (item.children.length > 0) {
        (item.children[0] as HTMLElement).click();
      } else {
        (item as HTMLElement).click();
      }

      this._ccmClearSelecting(500);
    }
  }
  private _ccmIsVertical(direction: MenuDirection | null) {
    if (!direction) return false;
    return ['up', 'down'].includes(direction);
  }
  private _ccmIsHorizontal(direction: MenuDirection | null) {
    if (!direction) return false;
    return ['left', 'right'].includes(direction);
  }

  private _ccmTriggerAwaitingSelection(direction: MenuDirection) {
    // if (!ccmSelectAwaitingDirection) {
    //   return false;
    // }

    const selectingItems = document.querySelectorAll(`.ccm-items.${this.ccmSelectAwaitingDirection}`);
    if (selectingItems.length === 0) {
      return false;
    }

    const awaitingIsVertical = this._ccmIsVertical(this.ccmSelectAwaitingDirection);
    const canResolveByCrossAxis = awaitingIsVertical
      ? this._ccmIsHorizontal(direction)
      : this._ccmIsVertical(direction);

    // 点击了选择方向的对向，清除选择
    if (!canResolveByCrossAxis) {
      this._ccmClearSelecting();
      return true;
    }

    // 对不起不能直接借用……
    // const orderedItems = [].sort.call(selectingItems, (leftItem, rightItem) => {
    const orderedItems = Array.from(selectingItems).sort((leftItem, rightItem) => {
      const leftRect = leftItem.getBoundingClientRect();
      const rightRect = rightItem.getBoundingClientRect();

      return awaitingIsVertical
        ? leftRect.left - rightRect.left
        : leftRect.top - rightRect.top;
    });

    const targetItem = awaitingIsVertical
      ? (direction === 'left' ? orderedItems[0] : orderedItems[orderedItems.length - 1])
      : (direction === 'up' ? orderedItems[0] : orderedItems[orderedItems.length - 1]);

    if (!targetItem) {
      return false;
    }

    targetItem.children.length > 0 ? (targetItem.children[0] as HTMLElement)?.click() : (targetItem as HTMLElement)?.click();
    this._ccmClearSelecting(1000);
    return true;
  }

  /**
   * 销毁菜单
   */
  destroy(): void {
    const container = document.querySelector(this.config.container);
    if (!container) return;
    container.innerHTML = '';
    // document.removeEventListener('keydown', this._ccmHandlePress as any);
    // 这里没有保存事件监听函数的引用，所以无法正确移除事件监听，暂时不处理了，反正页面刷新了就没了
    // if (this.crossMenu) {
    //   this.crossMenu.destroy();
    //   this.crossMenu = null;
    // }
  }
}

export type { CCMConfig };
