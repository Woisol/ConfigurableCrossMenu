import { CCMConfigBuilder, type CCMConfig, type MenuDirection, type MenuItem } from "./config";
// import * as pug from "pug";
import { centerTemplate } from './templates/center.pug';
import { menuItemTemplate } from './templates/menuItem.pug';

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
   * container 参数有点多余了但显式放出来又有必要
   */
  render(items: MenuItem[] = [], container?: string, config?: Partial<CCMConfig>): void {
    if (items) this.items = items;
    if (config) this.config = { ...this.config, ...config };
    if (container) this.config.container = container;

    if (!this.initialized) {
      this.initialized = true;
      this.registerParallaxEffect();
      this.registerKeyboardEvents()
    }

    // 销毁旧的菜单
    try {
      this.destroy();
    } catch (err) {
      console.error('Error during previous CCM destroy:', err);
    }
    try {
      // 渲染菜单项
      this.renderMenuItems();
      // 渲染中心元素
      this.renderCenter();
    } catch (error) {
      console.error('Error rendering CCM:', error);
      this.destroy();
    }
  }

  /**
   * 渲染菜单项
   */
  renderMenuItems(): void {
    // throw new Error('Not implemented yet');
    const items = this.items;
    const groupedItems = [
      items.filter(item => item.direction === 'up'),
      items.filter(item => item.direction === 'right'),
      items.filter(item => item.direction === 'down'),
      items.filter(item => item.direction === 'left'),
    ];
    const delegateFunctions: Record<string, () => void | Promise<void>> = {}
    items.forEach(item => {
      if (typeof item.action === 'function') {
        const funcHash = Math.random().toString(36).substr(2, 9);
        delegateFunctions[funcHash] = item.action;
        // @ts-expect-error bad type
        item.action = `__ccm_dispatch_func('${funcHash}')`;
      }
    });
    // var __ccm_dispatch_func = function (funcHash:string) {
    //@ts-expect-error windows has no attr
    window.__ccm_dispatch_func = function (funcHash: string) {
      const func = delegateFunctions[funcHash];
      if (func) {
        func();
      } else {
        console.warn(`No function found for hash: ${funcHash}`);
      }
    }


    groupedItems.forEach(group => {
      if (group.length === 0) return;
      if (group.length === 1) {
        const item = group[0];
        this._createMenuItem(item!);
      } if (group.length === 2) {
        const [first, second] = group;
        this._createMenuItem(first!, -30, -6);
        this._createMenuItem(second!, 30, 6);
      }
    })

  }
  // menuItemTemplate = pug.compileFile('/templates/menuItem.pug')
  _createMenuItem(item: MenuItem, rotateOffset = 0, x = 0) {
    const degMap = {
      up: 0,
      right: 90,
      down: 0,
      left: 270,
    };
    // 此时确实是 string……
    const menuItemHTML = menuItemTemplate({ ...item, action: item.action as unknown as string, rotate: `${degMap[item.direction] + rotateOffset}deg`, x: `${x}px` });
    this.container.insertAdjacentHTML('beforeend', menuItemHTML);
  }

  /**
   * 渲染中心元素
   */
  renderCenter(): void {
    // throw new Error('Not implemented yet');
    const centerHtml = centerTemplate({ ...this.config.style.center });
    const container = document.querySelector(this.config.container);
    if (!container) {
      throw new Error(`Container element not found for selector: ${this.config.container}`);
    }
    // if (container.hasChildNodes()) {
    //   console.warn(`Container element for selector: ${this.config.container} is not empty. Existing content will be preserved.`);
    // }
    container.insertAdjacentHTML('beforeend', centerHtml);
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
  selectAwaitingDirection: MenuDirection | null = null;
  selectAwaitingTimer: ReturnType<typeof setTimeout> | null = null;
  selectAwaitDelayMS = 5000;
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
    this.selectAwaitingDirection = null;

    selectingItems.forEach(item => {
      item.classList.remove('selecting');
    })
  }
  private _ccmClearSelecting(delay: boolean | number = false) {
    if (this.selectAwaitingTimer) {
      clearTimeout(this.selectAwaitingTimer);
      this.selectAwaitingTimer = null;
    }
    if (delay) {
      this.selectAwaitingTimer = setTimeout(() => this._clear(), delay === true ? this.selectAwaitDelayMS : delay);
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
    if (this.selectAwaitingDirection !== null) {
      if (direction === this.selectAwaitingDirection) {
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
      this.selectAwaitingDirection = direction;
      this._ccmClearSelecting(true);
    } else if (menuItems.length === 1) {
      // 只有一个 up 菜单项，直接触发点击
      const item = menuItems[0]!;
      // 是的，有 hasChildNodes 的……
      if (item.hasChildNodes()) {
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

    const selectingItems = document.querySelectorAll(`.ccm-items.${this.selectAwaitingDirection}`);
    if (selectingItems.length === 0) {
      return false;
    }

    const awaitingIsVertical = this._ccmIsVertical(this.selectAwaitingDirection);
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

    targetItem.hasChildNodes() ? (targetItem.children[0] as HTMLElement)?.click() : (targetItem as HTMLElement)?.click();
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

    this.selectAwaitingDirection = null;

    if (this.selectAwaitingTimer) {
      clearTimeout(this.selectAwaitingTimer);
      this.selectAwaitingTimer = null;
    }

    this.items = [];

    // document.removeEventListener('keydown', this._ccmHandlePress as any);
    // 这里没有保存事件监听函数的引用，所以无法正确移除事件监听，暂时不处理了，反正页面刷新了就没了
    // if (this.crossMenu) {
    //   this.crossMenu.destroy();
    //   this.crossMenu = null;
    // }
  }
}

export type { CCMConfig };
