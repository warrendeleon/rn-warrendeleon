import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';

import { Box } from '@app/components/ui/box';
import { Text } from '@app/components/ui/text';

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
      <Box className="p-4">
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
    <Box className="overflow-hidden rounded-lg bg-white">
      <Box className="p-4">
        <Text>Item 1</Text>
      </Box>
      <ButtonGroupDivider />
      <Box className="p-4">
        <Text>Item 2</Text>
      </Box>
      <ButtonGroupDivider />
      <Box className="p-4">
        <Text>Item 3</Text>
      </Box>
    </Box>
  ),
};
