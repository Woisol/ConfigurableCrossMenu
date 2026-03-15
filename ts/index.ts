import pug from 'pug'

import { CCMConfigBuilder, type CCMConfig } from './config';

export class CCM {
  private _config: CCMConfig;
  get config(): CCMConfig {
    return this._config;
  }
  set config(config: Partial<CCMConfig>) {
    this._config = { ...this._config, ...config };
  }

  constructor(config: Partial<CCMConfig>, useDefaultKeyBindings: boolean, useTemplateItems: boolean) {
    this._config = CCMConfigBuilder(config, useDefaultKeyBindings, useTemplateItems);
  }

  render(items?: CCMConfig['items'], container?: string) {
    if (container)
      this.config.container = container;

    if (items)
      this.config.items = items;



  }

  private _renderCenter() {
    pug.renderFile('ts/templates/center.pug', {
      title: this.config.style.center.title,
      titleSize: this.config.style.center.titleSize,
      color: this.config.style.center.color,
    })
  }

  private _renderItems() {

  }

}

export type { CCMConfig };

