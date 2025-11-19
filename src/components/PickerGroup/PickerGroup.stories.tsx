import type { Meta, StoryObj } from '@storybook/react-native';

import { PickerGroup } from './PickerGroup';

const meta: Meta<typeof PickerGroup> = {
  title: 'Components/PickerGroup',
  component: PickerGroup,
  parameters: {
    notes: `
## PickerGroup Component

Container for selectable options with iOS-style grouped appearance.

### Props
- \`items\`: PickerGroupItem[] - Array of picker items

### Features
- Automatically handles border radius for first/last items
- Adds dividers between items
- Shows check marks for selected items
    `,
  },
};

export default meta;

type Story = StoryObj<typeof PickerGroup>;

export const SingleOption: Story = {
  args: {
    items: [
      {
        label: 'English',
        onPress: () => {},
        isSelected: true,
      },
    ],
  },
};

export const TwoOptions: Story = {
  args: {
    items: [
      {
        label: 'Light',
        onPress: () => {},
        isSelected: true,
      },
      {
        label: 'Dark',
        onPress: () => {},
        isSelected: false,
      },
    ],
  },
};

export const ThreeOptions: Story = {
  args: {
    items: [
      {
        label: 'System',
        onPress: () => {},
        isSelected: true,
      },
      {
        label: 'Light',
        onPress: () => {},
        isSelected: false,
      },
      {
        label: 'Dark',
        onPress: () => {},
        isSelected: false,
      },
    ],
  },
};

export const LanguageSelection: Story = {
  args: {
    items: [
      {
        label: 'English',
        onPress: () => {},
        isSelected: true,
      },
      {
        label: 'Español',
        onPress: () => {},
        isSelected: false,
      },
      {
        label: 'Français',
        onPress: () => {},
        isSelected: false,
      },
      {
        label: 'Deutsch',
        onPress: () => {},
        isSelected: false,
      },
    ],
  },
};

export const NoneSelected: Story = {
  args: {
    items: [
      {
        label: 'Option A',
        onPress: () => {},
        isSelected: false,
      },
      {
        label: 'Option B',
        onPress: () => {},
        isSelected: false,
      },
    ],
  },
};
