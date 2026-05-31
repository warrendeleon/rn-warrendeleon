import type { Meta, StoryObj } from '@storybook/react-native';
import { Globe, Moon, Sun } from 'lucide-react-native';

import { SettingsGroup } from './SettingsGroup';

const meta: Meta<typeof SettingsGroup> = {
  title: 'Components/SettingsGroup',
  component: SettingsGroup,
  parameters: {
    notes: `
## SettingsGroup Component

Container for grouping related settings items with iOS-style appearance.

### Props
- \`items\`: SettingsGroupItem[] - Array of settings items

### Features
- Automatically handles border radius for first/last items
- Adds dividers between items
- Supports icons, labels, and end labels
    `,
  },
};

export default meta;

type Story = StoryObj<typeof SettingsGroup>;

export const SingleItem: Story = {
  args: {
    items: [
      {
        label: 'Appearance',
        onPress: () => {},
        startIcon: Sun,
        startIconBgColor: '#f97316',
        endLabel: 'System',
      },
    ],
  },
};

export const TwoItems: Story = {
  args: {
    items: [
      {
        label: 'Appearance',
        onPress: () => {},
        startIcon: Sun,
        startIconBgColor: '#f97316',
        endLabel: 'System',
      },
      {
        label: 'Language',
        onPress: () => {},
        startIcon: Globe,
        startIconBgColor: '#3b82f6',
        endLabel: 'English',
      },
    ],
  },
};

export const ThreeItems: Story = {
  args: {
    items: [
      {
        label: 'Appearance',
        onPress: () => {},
        startIcon: Sun,
        startIconBgColor: '#f97316',
        endLabel: 'System',
      },
      {
        label: 'Language',
        onPress: () => {},
        startIcon: Globe,
        startIconBgColor: '#3b82f6',
        endLabel: 'English',
      },
      {
        label: 'Dark Mode',
        onPress: () => {},
        startIcon: Moon,
        startIconBgColor: '#a855f7',
        endLabel: 'Off',
      },
    ],
  },
};

export const WithoutIcons: Story = {
  args: {
    items: [
      {
        label: 'Privacy Policy',
        onPress: () => {},
      },
      {
        label: 'Terms of Service',
        onPress: () => {},
      },
      {
        label: 'About',
        onPress: () => {},
      },
    ],
  },
};

export const Mixed: Story = {
  args: {
    items: [
      {
        label: 'Profile',
        onPress: () => {},
        startIcon: Sun,
        startIconBgColor: '#22c55e',
      },
      {
        label: 'Version',
        startIcon: Globe,
        startIconBgColor: '#6b7280',
        endLabel: '1.0.0',
        showChevron: false,
        onPress: () => {},
      },
    ],
  },
};
