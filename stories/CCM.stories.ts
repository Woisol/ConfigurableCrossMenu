import type { Meta, StoryObj } from '@storybook/html';
import { CCM } from '../src/crossMenu';
import type { CCMConfig, MenuItem } from '../src/config';
import '../src/styles/index.scss';

type StoryArgs = {
  darkMode: boolean;
  useDefaultKeyBindings: boolean;
  items: MenuItem[];
  config: Partial<CCMConfig>;
};

const baseItems: MenuItem[] = [
  { direction: 'up', label: 'Home', url: '#home' },
  { direction: 'right', label: 'About', url: '#about' },
  { direction: 'down', label: 'Contact', url: '#contact' },
  { direction: 'left', label: 'Settings', action: () => console.log('Settings clicked') },
];

const createStage = ({ darkMode, useDefaultKeyBindings, items, config }: StoryArgs) => {
  const wrapper = document.createElement('div');
  wrapper.className = darkMode ? 'story-shell dark' : 'story-shell';
  wrapper.style.minHeight = '100vh';
  wrapper.style.display = 'grid';
  wrapper.style.placeItems = 'center';
  wrapper.style.padding = '48px 24px';
  wrapper.style.background = darkMode
    ? 'linear-gradient(180deg, hsl(224 17% 16%), hsl(220 22% 10%))'
    : 'linear-gradient(180deg, hsl(210 30% 97%), hsl(205 40% 92%))';

  const id = `ccm-story-${Math.random().toString(36).slice(2, 8)}`;
  const container = document.createElement('div');
  container.id = id;
  wrapper.appendChild(container);

  const note = document.createElement('div');
  note.style.position = 'fixed';
  note.style.left = '24px';
  note.style.bottom = '24px';
  note.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif';
  note.style.fontSize = '14px';
  note.style.lineHeight = '1.6';
  note.style.opacity = '0.8';
  note.style.color = darkMode ? 'hsl(0 0% 88%)' : 'hsl(220 20% 18%)';
  note.innerHTML = [
    '<strong>Storybook showcase</strong>',
    'W / A / S / D and arrow keys can still drive the current implementation.',
  ].join('<br>');
  wrapper.appendChild(note);

  const ccm = new CCM(
    {
      container: `#${id}`,
      ...config,
    },
    useDefaultKeyBindings,
  );
  ccm.render(items);

  return wrapper;
};

const meta = {
  title: 'CCM/Showcase',
  tags: ['autodocs'],
  render: createStage,
  args: {
    darkMode: false,
    useDefaultKeyBindings: true,
    items: baseItems,
    config: {
      style: {
        center: {
          title: { content: 'C C M' },
          subtitle: { content: 'Configurable Cross Menu' },
          style: { direction: 'column' },
        },
      },
    },
  },
  argTypes: {
    config: { control: false },
    items: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'This Storybook set focuses on visual verification and usage examples without changing the current source implementation.',
      },
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;

type Story = StoryObj<StoryArgs>;

export const Default: Story = {};

export const DarkMode: Story = {
  args: {
    darkMode: true,
  },
};

export const DualItemsPerDirection: Story = {
  args: {
    items: [
      { direction: 'up', label: 'Home', url: '#home' },
      { direction: 'up', label: 'Top', action: () => console.log('Top clicked') },
      { direction: 'right', label: 'About', url: '#about' },
      { direction: 'right', label: 'Profile', action: () => console.log('Profile clicked') },
      { direction: 'down', label: 'Contact', url: '#contact' },
      { direction: 'down', label: 'Help', action: () => console.log('Help clicked') },
      { direction: 'left', label: 'Settings', url: '#settings' },
      { direction: 'left', label: 'Config', action: () => console.log('Config clicked') },
    ],
  },
};

export const CustomCenter: Story = {
  args: {
    config: {
      style: {
        center: {
          render: () => {
            const center = document.createElement('div');
            center.className = 'ccm-center';
            center.textContent = 'Custom Center';
            center.style.minWidth = '160px';
            center.style.minHeight = '160px';
            center.style.display = 'grid';
            center.style.placeItems = 'center';
            center.style.fontSize = '28px';
            center.style.fontWeight = '700';
            center.style.letterSpacing = '0.08em';
            return center;
          },
        },
      },
    },
  },
};

export const ReducedAnimation: Story = {
  args: {
    config: {
      style: {
        center: {
          title: { content: 'Static Mode' },
          subtitle: { content: 'Animation duration is set to 0' },
          style: { direction: 'column' },
        },
        showAnimation: {
          center: { duration: 0 },
          menu: { durationPerItem: 0 },
        },
      },
    },
  },
};
