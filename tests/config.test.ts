import { describe, expect, it } from 'vitest';
import { CCMConfigBuilder, mergeConfig } from '../src/config';

describe('mergeConfig', () => {
  it('merges nested style values while preserving defaults', () => {
    const result = mergeConfig(
      {
        style: {
          background: {
            opacity: 0.9,
          },
          menu: {
            length: 140,
          },
          showAnimation: {
            center: {
              duration: 0,
            },
          },
        },
      },
      CCMConfigBuilder({}, true),
    );

    expect(result.style.background.opacity).toBe(0.9);
    expect(result.style.background.blur).toBe(3);
    expect(result.style.menu.length).toBe(140);
    expect(result.style.menu.radius).toBe(8);
    expect(result.style.showAnimation.center.duration).toBe(0);
    expect(result.style.showAnimation.menu.durationPerItem).toBe(100);
  });

  it('allows replacing center config with custom render mode', () => {
    const custom = document.createElement('div');
    const result = mergeConfig(
      {
        style: {
          center: {
            render: () => custom,
          },
        },
      },
      CCMConfigBuilder({}, true),
    );

    expect('render' in result.style.center).toBe(true);
    if ('render' in result.style.center) {
      expect(result.style.center.render()).toBe(custom);
    }
  });
});

describe('CCMConfigBuilder', () => {
  it('adds the default key bindings when explicitly enabled', () => {
    const config = CCMConfigBuilder({}, true);

    expect(config.keyBindings).toEqual({
      up: 'w',
      right: 'd',
      down: 's',
      left: 'a',
    });
  });

  it('keeps user-provided key bindings object when defaults are disabled', () => {
    const config = CCMConfigBuilder(
      {
        keyBindings: {
          up: 'i',
        },
      },
      false,
    );

    expect(config.keyBindings).toEqual({
      up: 'i',
    });
  });
});
