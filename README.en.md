# Configurable Cross Menu

An animated and highly configurable cross menu component that can be used directly in plain HTML pages.

This repository currently focuses on four things:

- keeping the existing source behavior intact
- adding release-ready documentation
- adding Storybook and Vitest for visibility and verification
- preparing GitHub Actions for npm publishing and jsDelivr consumption

For the main Chinese documentation, see [README.md](./README.md).

## Install

```bash
pnpm add @woisol-g/configurable-cross-menu
```

## Bundler usage

```ts
import { CCM } from '@woisol-g/configurable-cross-menu';
import '@woisol-g/configurable-cross-menu/styles.css';

const ccm = new CCM(
  {
    container: '#ccm-con',
    style: {
      center: {
        title: { content: 'C C M' },
        subtitle: { content: 'Configurable Cross Menu' },
        style: { direction: 'column' },
      },
    },
  },
  true,
);

ccm.render([
  { direction: 'up', label: 'Home', url: '#home' },
  { direction: 'right', label: 'About', url: '#about' },
  { direction: 'down', label: 'Contact', url: '#contact' },
  { direction: 'left', label: 'Settings', action: () => console.log('Settings') },
]);
```

## Browser usage

After publishing, you can use the package directly from jsDelivr:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@woisol-g/configurable-cross-menu@latest/dist/configurable-cross-menu.css"
/>
<script src="https://cdn.jsdelivr.net/npm/@woisol-g/configurable-cross-menu@latest/dist/configurable-cross-menu.js"></script>
<script>
  const { CCM } = globalThis.ConfigurableCrossMenu || {};
</script>
```

## What is included

- `README.md`: primary Chinese documentation
- `README.en.md`: English companion document
- `ENGINEERING_REVIEW.md`: detailed improvement notes and learning-oriented review
- `docs/publish-checklist.md`: first-release checklist for npm publishing

## Development commands

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm test
pnpm storybook
pnpm build-storybook
```

## Notes

- The current package is centered around the existing UMD build.
- Source code in `src` was intentionally left unchanged in this round.
- Improvement ideas are documented instead of applied directly to the implementation.

For a deeper review of the current implementation, see [ENGINEERING_REVIEW.md](./ENGINEERING_REVIEW.md).
