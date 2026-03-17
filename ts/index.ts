import { CCMConfigBuilder, type CCMConfig, type MenuItem } from './config';
import './styles/ccm.scss'

/**
 * 配置化十字菜单库
 *
 * 使用方式：
 * const ccm = new CCM({ ... });
 * ccm.render();
 */
export class CCM {
  private _config: CCMConfig;
  // private crossMenu: CrossMenu | null = null;

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
  render(items?: MenuItem[], container?: string): void {
  }

  /**
   * 销毁菜单
   */
  destroy(): void {
  }
}

export type { CCMConfig };

