import { InfoIcon, MoonIcon, SunIcon } from '@gluestack-ui/themed';
import type { Meta, StoryObj } from '@storybook/react-native';

import { SettingsItem } from './SettingsItem';

const meta: Meta<typeof SettingsItem> = {
  title: 'Components/SettingsItem',
  component: SettingsItem,
  argTypes: {
    label: {
      control: 'text',
      description: 'Main label text',
    },
    endLabel: {
      control: 'text',
      description: 'Secondary label on the right',
    },
    startIconBgColor: {
      control: 'color',
      description: 'Background color for start icon',
    },
    groupVariant: {
      control: 'select',
      options: ['single', 'top', 'middle', 'bottom'],
      description: 'Position in group for border radius',
    },
    showChevron: {
      control: 'boolean',
      description: 'Show chevron icon on the right',
    },
  },
  parameters: {
    notes: `
## SettingsItem Component

Settings list item with optional icon, label, and navigation chevron.

### Props
- \`label\`: string - Main text
- \`onPress\`: () => void - Press handler
- \`startIcon\`: React.ElementType - Icon component
- \`startIconBgColor\`: string - Icon background color
- \`endLabel\`: string - Secondary text on right
- \`groupVariant\`: 'single' | 'top' | 'middle' | 'bottom'
- \`showChevron\`: boolean - Show navigation chevron

### Accessibility
- Combines label and endLabel for accessibility label
- Optional accessibility hint
    `,
  },
};

export default meta;

type Story = StoryObj<typeof SettingsItem>;

export const Default: Story = {
  args: {
    label: 'Settings',
    onPress: () => {},
    groupVariant: 'single',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Appearance',
    onPress: () => {},
    startIcon: SunIcon,
    startIconBgColor: '$orange500',
    groupVariant: 'single',
  },
};

export const WithEndLabel: Story = {
  args: {
    label: 'Theme',
    onPress: () => {},
    startIcon: MoonIcon,
    startIconBgColor: '$purple500',
    endLabel: 'System',
    groupVariant: 'single',
  },
};

export const WithoutChevron: Story = {
  args: {
    label: 'Version',
    startIcon: InfoIcon,
    startIconBgColor: '$blue500',
    endLabel: '1.0.0',
    showChevron: false,
    groupVariant: 'single',
  },
};

export const TopInGroup: Story = {
  args: {
    label: 'First Setting',
    onPress: () => {},
    groupVariant: 'top',
  },
};

export const MiddleInGroup: Story = {
  args: {
    label: 'Middle Setting',
    onPress: () => {},
    groupVariant: 'middle',
  },
};

export const BottomInGroup: Story = {
  args: {
    label: 'Last Setting',
    onPress: () => {},
    groupVariant: 'bottom',
  },
};
