import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';

import { Box } from '@app/components/ui/box';
import { Text } from '@app/components/ui/text';
import { useAppColorScheme } from '@app/shared/hooks';

import { ButtonGroup } from './ButtonGroup';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    notes: `
## ButtonGroup Component

Generic container that renders a vertical list of items with iOS-style grouped appearance.

### Props
- \`items\`: T[] - Array of items to render
- \`renderItem\`: (item, groupVariant, index) => ReactElement

### Features
- Automatically handles border radius (top/middle/bottom)
- Adds dividers between items
- Used as base for SettingsGroup and PickerGroup
    `,
  },
};

export default meta;

type Story = StoryObj<typeof ButtonGroup>;

// Simple custom item component for demonstration
const SimpleItem = ({
  label,
  groupVariant,
}: {
  label: string;
  groupVariant: string;
  onPress: () => void;
}) => {
  const scheme = useAppColorScheme();
  const isDark = scheme === 'dark';

  const isTop = groupVariant === 'single' || groupVariant === 'top';
  const isBottom = groupVariant === 'single' || groupVariant === 'bottom';
  const topRadius = isTop ? 'rounded-t-xl' : '';
  const bottomRadius = isBottom ? 'rounded-b-xl' : '';

  return (
    <Box
      className={`p-4 ${topRadius} ${bottomRadius}`}
      style={{ backgroundColor: isDark ? '#262626' : '#FFFFFF' }}
    >
      <Text style={{ color: isDark ? '#FFFFFF' : '#000000' }}>{label}</Text>
    </Box>
  );
};

export const SingleItem: Story = {
  args: {
    items: [{ label: 'Only Item', onPress: () => {} }],
    renderItem: (item, groupVariant) => (
      <SimpleItem
        label={item.label as string}
        groupVariant={groupVariant}
        onPress={item.onPress as () => void}
      />
    ),
  },
};

export const TwoItems: Story = {
  args: {
    items: [
      { label: 'First Item', onPress: () => {} },
      { label: 'Second Item', onPress: () => {} },
    ],
    renderItem: (item, groupVariant) => (
      <SimpleItem
        label={item.label as string}
        groupVariant={groupVariant}
        onPress={item.onPress as () => void}
      />
    ),
  },
};

export const ThreeItems: Story = {
  args: {
    items: [
      { label: 'Top Item', onPress: () => {} },
      { label: 'Middle Item', onPress: () => {} },
      { label: 'Bottom Item', onPress: () => {} },
    ],
    renderItem: (item, groupVariant) => (
      <SimpleItem
        label={item.label as string}
        groupVariant={groupVariant}
        onPress={item.onPress as () => void}
      />
    ),
  },
};

export const FiveItems: Story = {
  args: {
    items: [
      { label: 'Item 1', onPress: () => {} },
      { label: 'Item 2', onPress: () => {} },
      { label: 'Item 3', onPress: () => {} },
      { label: 'Item 4', onPress: () => {} },
      { label: 'Item 5', onPress: () => {} },
    ],
    renderItem: (item, groupVariant) => (
      <SimpleItem
        label={item.label as string}
        groupVariant={groupVariant}
        onPress={item.onPress as () => void}
      />
    ),
  },
};
