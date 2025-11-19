import type { Meta, StoryObj } from '@storybook/react-native';

import { PickerItem } from './PickerItem';

const meta: Meta<typeof PickerItem> = {
  title: 'Components/PickerItem',
  component: PickerItem,
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text',
    },
    isSelected: {
      control: 'boolean',
      description: 'Show check mark when selected',
    },
    groupVariant: {
      control: 'select',
      options: ['single', 'top', 'middle', 'bottom'],
      description: 'Position in group for border radius',
    },
  },
  parameters: {
    notes: `
## PickerItem Component

Selectable list item with optional check mark indicator.

### Props
- \`label\`: string - Display text
- \`onPress\`: () => void - Press handler
- \`isSelected\`: boolean - Shows check mark when true
- \`groupVariant\`: 'single' | 'top' | 'middle' | 'bottom'

### Accessibility
- Includes selection state in accessibility label
- Uses accessibilityState.selected
    `,
  },
};

export default meta;

type Story = StoryObj<typeof PickerItem>;

export const Default: Story = {
  args: {
    label: 'Option 1',
    onPress: () => {},
    isSelected: false,
    groupVariant: 'single',
  },
};

export const Selected: Story = {
  args: {
    label: 'English',
    onPress: () => {},
    isSelected: true,
    groupVariant: 'single',
  },
};

export const TopInGroup: Story = {
  args: {
    label: 'First Option',
    onPress: () => {},
    isSelected: false,
    groupVariant: 'top',
  },
};

export const MiddleInGroup: Story = {
  args: {
    label: 'Middle Option',
    onPress: () => {},
    isSelected: true,
    groupVariant: 'middle',
  },
};

export const BottomInGroup: Story = {
  args: {
    label: 'Last Option',
    onPress: () => {},
    isSelected: false,
    groupVariant: 'bottom',
  },
};
