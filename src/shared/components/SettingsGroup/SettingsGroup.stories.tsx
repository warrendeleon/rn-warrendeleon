import { GlobeIcon, MoonIcon, SunIcon } from '@gluestack-ui/themed';
import type { Meta, StoryObj } from '@storybook/react-native';

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
        startIcon: SunIcon,
        startIconBgColor: '$orange500',
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
        startIcon: SunIcon,
        startIconBgColor: '$orange500',
        endLabel: 'System',
      },
      {
        label: 'Language',
        onPress: () => {},
        startIcon: GlobeIcon,
        startIconBgColor: '$blue500',
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
        startIcon: SunIcon,
        startIconBgColor: '$orange500',
        endLabel: 'System',
      },
      {
        label: 'Language',
        onPress: () => {},
        startIcon: GlobeIcon,
        startIconBgColor: '$blue500',
        endLabel: 'English',
      },
      {
        label: 'Dark Mode',
        onPress: () => {},
        startIcon: MoonIcon,
        startIconBgColor: '$purple500',
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
        startIcon: SunIcon,
        startIconBgColor: '$green500',
      },
      {
        label: 'Version',
        startIcon: GlobeIcon,
        startIconBgColor: '$gray500',
        endLabel: '1.0.0',
        showChevron: false,
        onPress: () => {},
      },
    ],
  },
};
