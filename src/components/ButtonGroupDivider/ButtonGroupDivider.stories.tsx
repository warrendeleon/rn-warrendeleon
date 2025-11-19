import React from 'react';
import { Box } from '@gluestack-ui/themed';
import type { Meta, StoryObj } from '@storybook/react-native';

import { ButtonGroupDivider } from './ButtonGroupDivider';

const meta: Meta<typeof ButtonGroupDivider> = {
  title: 'Components/ButtonGroupDivider',
  component: ButtonGroupDivider,
  parameters: {
    notes: `
## ButtonGroupDivider Component

Thin horizontal divider line used between grouped buttons. Follows iOS Settings app style.

### Usage
Used internally by ButtonGroup, SettingsGroup, and PickerGroup components.
No props required - automatically adapts to light/dark mode.
    `,
  },
  decorators: [
    Story => (
      <Box p="$4" bg="$backgroundLight100">
        <Story />
      </Box>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ButtonGroupDivider>;

export const Default: Story = {};

export const InContext: Story = {
  render: () => (
    <Box bg="$white" borderRadius="$lg" overflow="hidden">
      <Box p="$4">
        <Box>Item 1</Box>
      </Box>
      <ButtonGroupDivider />
      <Box p="$4">
        <Box>Item 2</Box>
      </Box>
      <ButtonGroupDivider />
      <Box p="$4">
        <Box>Item 3</Box>
      </Box>
    </Box>
  ),
};
