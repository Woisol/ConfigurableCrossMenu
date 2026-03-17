import { CCMConfigBuilder, type CCMConfig, type MenuItem } from "./config";
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
  private instanceEle: HTMLElement | null = null;

  get config(): CCMConfig {
    return this._config;
  }

  set config(config: Partial<CCMConfig>) {
    this._config = { ...this._config, ...config };
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

    // 销毁旧的菜单
    // if (this.crossMenu) {
    //   this.crossMenu.destroy();
    // }

    // // 创建新菜单
    // this.crossMenu = new CrossMenu(this._config);
  }

  /**
   * 渲染中心元素
   */
  renderCenter(): void {
    const centerHtml = pug.renderFile('/templates/center.pug', {})
    document.querySelector(this.config.container)?.insertAdjacentHTML('beforeend', centerHtml);
  }

  /**
   * 渲染菜单项
   */
  renderMenuItems(): void {
    const pugMenuFunc = pug.compileFile('/templates/menuItem.pug');
    this.items.forEach(item => {
      pugMenuFunc(item);
    })
  }

  /**
   * 销毁菜单
   */
  destroy(): void {
    // if (this.crossMenu) {
    //   this.crossMenu.destroy();
    //   this.crossMenu = null;
    // }
  }
}

export type { CCMConfig };
