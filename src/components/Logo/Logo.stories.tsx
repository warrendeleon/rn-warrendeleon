import type { Meta, StoryObj } from '@storybook/react-native';

import { Logo } from './Logo';

const meta: Meta<typeof Logo> = {
  title: 'Components/Logo',
  component: Logo,
  argTypes: {
    darkMode: {
      control: 'boolean',
      description: 'Use dark mode variant (white logo)',
    },
  },
  parameters: {
    notes: `
## Logo Component

Animated logo using Lottie. Displays the app logo with automatic dark/light mode support.

### Props
- \`darkMode\`: boolean - When true, shows white logo for dark backgrounds

### Accessibility
- Decorative image, animation auto-plays and loops
    `,
  },
};

export default meta;

type Story = StoryObj<typeof Logo>;

export const Default: Story = {
  args: {
    darkMode: false,
    style: { width: 150, height: 75 },
  },
};

export const DarkMode: Story = {
  args: {
    darkMode: true,
    style: { width: 150, height: 75 },
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const CustomSize: Story = {
  args: {
    darkMode: false,
    style: { width: 200, height: 100 },
  },
};
