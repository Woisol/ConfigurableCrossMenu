import { afterEach, beforeEach, vi } from 'vitest';

Object.defineProperty(document, 'readyState', {
  configurable: true,
  get: () => 'complete',
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  if (vi.isFakeTimers()) {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  }
  document.body.innerHTML = '';
  document.head.querySelectorAll('style').forEach((node) => node.remove());
});
