// 顶层有 import 就变成模块文件了
// import type { MenuItem } from "./config";
// import type { CenterStyle } from './config';


// declare module '*.pug' {
//   const content: string;
//   export default content;
// }
// 环境模块声明无法指定相对模块名。ts(2436)
// ~~也并不需要相对 需要否则匹配到 *.pug
// 最正确做法 */xxx……
declare module '*/center.pug' {
  // import type { CenterStyle } from './config';
  // 但是为什么保留一个就正常
  // ？所以 attr? 和 atrr: xx | undefined 不同的……
  const centerTemplate: (centerStyle: { title?: string | undefined, subtitle?: string | undefined, icon?: string | undefined, render?: never }) => string;
  export default centerTemplate;
}
declare module '*/menuItem.pug' {
  // 环境模块声明中的导入或导出声明不能通过相对模块名引用模块。ts(2439)
  // import type { MenuItem } from './config';
  // const menuItemTemplate: (itemData: MenuItem) => string;
  const menuItemTemplate: (itemData: Omit<import('./config').MenuItem, 'action'> & { action?: string, rotate?: string, x?: string }) => string;
  export default menuItemTemplate;
}

declare module '*.scss' {
  const content: string;
  export default content;
}