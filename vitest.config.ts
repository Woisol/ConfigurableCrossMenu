import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      './templates/center.pug': path.resolve(__dirname, './tests/mocks/centerTemplateMock.ts'),
      './templates/menuItem.pug': path.resolve(__dirname, './tests/mocks/menuItemTemplateMock.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
    restoreMocks: true,
    clearMocks: true,
  },
});
