import { CCMConfigBuilder, mergeConfig, type CCMConfig, type MenuDirection, type MenuItem } from "./config";
// import * as pug from "pug";
import centerTemplate from './templates/center.pug';
import menuItemTemplate from './templates/menuItem.pug';
import { retry } from "./utils/utils";

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
    // if (!this._containerEle || !(document.querySelector(this.config.container) as HTMLElement)?.isSameNode(this._containerEle)) {
    //   this._containerEle = document.querySelector(this.config.container) as HTMLElement;
    // }
    if (!this._containerEle || !document.querySelector(".ccm-con")) {
      //！ 一层 div 视差效果就不会导致 menu 悬浮抽搐了？？？
      this._containerEle = document.createElement('div');
      this._containerEle.classList.add('ccm-con');
      document.querySelector(this.config.container)?.appendChild(this._containerEle);
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
    const init = async () => {
      // 销毁旧的菜单
      try {
        this.destroy();
      } catch (err) {
        console.error('Error during previous CCM destroy:', err);
      }

      if (items) this.items = items;
      // 原本用的 call this，但是 ts 的重载误认为两个参数是重载 2 然后需要三个参数(？)还是直接传 this.config
      if (config) this._config = mergeConfig(config, this._config);
      if (container) this.config.container = container;

      if (!this.initialized) {
        this.initialized = true;
        this.updateCSS();
        if ('style' in this.config.style.center && this.config.style.center.style?.parallaxEffect)
          this.registerParallaxEffect();
        this.registerKeyboardEvents()
      }

      try {
        // 渲染中心元素
        this.renderCenter();
        setTimeout(() => {
          // 渲染菜单项
          this.renderMenuItems();
          // 好奇怪为什么设 0 了都好像还是慢点……
        }, Math.max(0, this.config.style.showAnimation.center.duration - 500));
      } catch (error) {
        console.error('Error rendering CCM:', error);
        this.destroy();
      }

    };
    // 哦哦是喔已经加载完了哈哈
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
  /**
   * 更新 CSS
   */
  updateCSS(): void {
    // throw new Error('Not implemented yet');
    // this.container.classList.add('ccm-con');

    document.querySelector(this.config.container)!.classList.add('ccm-full-page');

    const head = document.head;
    const style = this.config.style;
    const styleEle = document.createElement('style');
    // styleEle.type = 'text/css';  // type 弃用
    const cl = (c: typeof style.background.menuColor) => !c ? '' : typeof c === 'string' ? c : c.light;
    const cd = (c: typeof style.background.menuColor) => !c ? '' : typeof c === 'string' ? c : (c.dark ?? c.light);
    const numOrStr = (val: string | number | undefined) => val != null ? typeof val === 'number' ? `${val}px` : val : '';
    const center = 'render' in style.center ? null : style.center;
    const v = (prop: string, val: string | number | null | undefined) => val != null && val !== '' ? `  ${prop}: ${val};` : '';
    // 这部分非常适合 vibe……
    // 确实这种数组 + '' + filter(Boolean) 的方式不错的
    styleEle.innerHTML = [
      `:root {`,
      v('--ccm-width', numOrStr(style.width)),
      v('--ccm-bg-menu-color', cl(style.background.menuColor)),
      v('--ccm-bg-center-color', cl(style.background.centerColor)),
      v('--ccm-bg-opacity', style.background.opacity),
      style.background.blur != null ? `  --ccm-bg-blur: ${style.background.blur}px;` : '',
      center?.icon?.size != null ? `  --ccm-center-icon-size: ${numOrStr(center.icon.size)};` : '',
      center?.title?.size != null ? `  --ccm-center-title-size: ${numOrStr(center.title.size)};` : '',
      center?.title?.color ? v('--ccm-center-title-color', cl(center.title.color)) : '',
      center?.subtitle?.size != null ? `  --ccm-center-subtitle-size: ${numOrStr(center.subtitle.size)};` : '',
      center?.subtitle?.color ? v('--ccm-center-subtitle-color', cl(center.subtitle.color)) : '',
      center?.style?.borderSize != null ? `  --ccm-center-border-size: ${numOrStr(center.style.borderSize)};` : '',
      center?.style?.color ? v('--ccm-center-border-color', cl(center.style.color)) : '',
      center?.style?.radius != null ? `  --ccm-center-radius: ${numOrStr(center.style.radius)};` : '',
      v('--ccm-menu-length', numOrStr(style.menu.length)),
      v('--ccm-menu-color', cl(style.menu.color)),
      style.menu.radius != null ? `  --ccm-menu-radius: ${numOrStr(style.menu.radius)};` : '',
      `}`,
      ``,
      `.dark {`,
      v('--ccm-bg-menu-color', cd(style.background.menuColor)),
      v('--ccm-bg-center-color', cd(style.background.centerColor)),
      center?.title?.color ? v('--ccm-center-title-color', cd(center.title.color)) : '',
      center?.subtitle?.color ? v('--ccm-center-subtitle-color', cd(center.subtitle.color)) : '',
      center?.style?.color ? v('--ccm-center-border-color', cd(center.style.color)) : '',
      v('--ccm-menu-color', cd(style.menu.color)),
      center?.style?.color ? v('color', cd(center.style.color)) : '',
      `}`,
      style.showAnimation.menu.durationPerItem ? `--ccm-menu-show-duration: ${style.showAnimation.menu.durationPerItem}ms` : '',
      style.showAnimation.center.duration ? `--ccm-center-show-duration: ${style.showAnimation.center.duration}ms` : '',
    ].filter(Boolean).join('\n');
    head.appendChild(styleEle);

    // 引入打包 CSS？
  }
  // TODO 把 render 和 注册类 拆分出去……

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
      // console.log(`Dispatching function for hash: ${funcHash}`);
      const func = delegateFunctions[funcHash];
      if (func) {
        func();
      } else {
        console.warn(`No function found for hash: ${funcHash}`);
      }
    };


    (async () => {
      const _delay = this.config.style.showAnimation.menu.durationPerItem ?? 0;
      for (const group of groupedItems) {
        if (group.length === 0) continue;
        await new Promise<void>(r => setTimeout(r, _delay));
        if (group.length === 1) {
          this._createMenuItem(group[0]!);
        } else if (group.length === 2) {
          this._createMenuItem(group[0]!, -20, 6);
          await new Promise<void>(r => setTimeout(r, _delay));
          this._createMenuItem(group[1]!, 20, -6);
        }
      }
    })();

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
    if (this.config.style.center.render && typeof this.config.style.center.render === 'function') {
      const customCenterEle = this.config.style.center.render()
      if (customCenterEle instanceof HTMLElement) {
        this.container.appendChild(customCenterEle);
      } else {
        throw new Error('Custom center render function must return an HTMLElement');
      }
      return;
    }
    const centerHtml = centerTemplate({ title: this.config.style.center.title!.content, subtitle: this.config.style.center.subtitle?.content, icon: this.config.style.center.icon?.url });
    this.container.insertAdjacentHTML('beforeend', centerHtml);
  }

  /**
   * 视差效果注册
   */
  registerParallaxEffect(): void {
    const parallaxCon = document.querySelector(this.config.container) as HTMLElement;
    // const this.container = this.container;
    if (!parallaxCon || !this.container) {
      throw new Error('Parallax container or CCM container not found');
    };

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

      this.container.style.setProperty('--ccm-parallax-x', `${(nx * 80).toFixed(2)}px`);
      this.container.style.setProperty('--ccm-parallax-y', `${(ny * 80).toFixed(2)}px`);
      this.container.style.setProperty('--ccm-tilt-x', `${(nx * 25).toFixed(2)}deg`);
      this.container.style.setProperty('--ccm-tilt-y', `${(-ny * 20).toFixed(2)}deg`);
    };

    const reset = () => {
      this.container.style.setProperty('--ccm-parallax-x', '0px');
      this.container.style.setProperty('--ccm-parallax-y', '0px');
      this.container.style.setProperty('--ccm-tilt-x', '0deg');
      this.container.style.setProperty('--ccm-tilt-y', '0deg');
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
      // const keyMap: { [key: string]: MenuDirection } = {
      //   w: 'up',
      //   arrowup: 'up',
      //   d: 'right',
      //   arrowright: 'right',
      //   s: 'down',
      //   arrowdown: 'down',
      //   a: 'left',
      //   arrowleft: 'left'
      // };

      const direction = this.config.keyBindings[key];
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
      // ~~是的，有 hasChildNodes 的……
      // hasChildNodes 在有纯文本时也为 true……
      if (item.firstElementChild) {
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

    ((targetItem.firstElementChild ?? targetItem) as HTMLElement)?.click();
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
