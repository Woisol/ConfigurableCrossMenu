import { describe, expect, it, vi } from 'vitest';
import { CCM } from '../src/crossMenu';
import type { MenuItem } from '../src/config';

describe('CCM', () => {
  it('renders, rerenders, and tracks keyboard selection with the current implementation', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="ccm-con"></div>';

    const ccm = new CCM(
      {
        container: '#ccm-con',
        keyBindings: {
          j: 'down',
          h: 'left',
        },
        style: {
          center: {
            title: { content: 'C C M' },
            subtitle: { content: 'Configurable Cross Menu' },
            style: { direction: 'column' },
          },
          showAnimation: {
            center: { duration: 0 },
            menu: { durationPerItem: 0 },
          },
        },
      },
      false,
    );

    const firstItems: MenuItem[] = [
      { direction: 'up', label: 'Home', url: '#home' },
      { direction: 'right', label: 'About', url: '#about' },
      { direction: 'left', label: 'Settings', action: () => undefined },
    ];

    ccm.render(firstItems);
    await vi.runAllTimersAsync();

    const container = document.querySelector('#ccm-con');
    expect(container?.querySelector('.ccm-center')).not.toBeNull();
    expect(container?.querySelectorAll('.ccm-items')).toHaveLength(3);

    ccm.render(
      [],
      undefined,
      {
        style: {
          center: {
            render: () => {
              const custom = document.createElement('div');
              custom.className = 'custom-center';
              custom.textContent = 'Custom Center';
              return custom;
            },
          },
          showAnimation: {
            center: { duration: 0 },
            menu: { durationPerItem: 0 },
          },
        },
      },
    );
    await vi.runAllTimersAsync();

    expect(container?.querySelector('.custom-center')?.textContent).toBe('Custom Center');

    const keyboardItems: MenuItem[] = [
      { direction: 'down', label: 'Contact', url: '#contact' },
      { direction: 'down', label: 'Help', action: () => undefined },
      { direction: 'up', label: 'Home', url: '#home' },
    ];

    ccm.render(
      keyboardItems,
      undefined,
      {
        style: {
          center: {
            title: { content: 'Keyboard' },
            subtitle: { content: 'Selection state test' },
            style: { direction: 'column' },
          },
          showAnimation: {
            center: { duration: 0 },
            menu: { durationPerItem: 0 },
          },
        },
      },
    );
    await vi.runAllTimersAsync();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' }));
    expect(ccm.selectAwaitingDirection).toBe('down');
    expect(container?.querySelectorAll('.ccm-items.selecting')).toHaveLength(2);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }));
    await vi.advanceTimersByTimeAsync(1000);
    expect(ccm.selectAwaitingDirection).toBeNull();
    expect(container?.querySelectorAll('.ccm-items.selecting')).toHaveLength(0);

    ccm.destroy();
    expect(container?.innerHTML).toBe('');
  });
});
