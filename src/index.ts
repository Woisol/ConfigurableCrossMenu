import { CCMConfigBuilder, type CCMConfig, type MenuItem } from './config';
import './styles/index.scss'
/**
 * 配置化十字菜单库
 *
 * 使用方式：
 * const ccm = new CCM({ ... });
 * ccm.render();
 */

export { CCM } from './crossMenu';
export type { CCMConfig };

// export * as centerTemplate from './templates/center.pug';
// export * as menuItemTemplate from './templates/menuItem.pug';