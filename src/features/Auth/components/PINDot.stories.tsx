import React from 'react';
import { Box, HStack } from '@gluestack-ui/themed';
import type { Meta, StoryObj } from '@storybook/react-native';

import { PINDot } from './PINDot';

const meta: Meta<typeof PINDot> = {
  title: 'Auth/PINDot',
  component: PINDot,
  decorators: [
    Story => (
      <Box p="$8" alignItems="center">
        <Story />
      </Box>
    ),
  ],
  parameters: {
    notes: `
## PINDot Component

Single PIN dot indicator for iOS 26 style PIN entry.

### States
- Empty: Hollow circle with border
- Filled: Solid circle with scale animation
- Error: Red circle

### Accessibility
- Role: none (decorative)
- Label: "PIN digit X of Y, entered/empty"
    `,
  },
  argTypes: {
    isFilled: {
      control: 'boolean',
      description: 'Whether this dot is filled (digit entered)',
    },
    hasError: {
      control: 'boolean',
      description: 'Whether this dot is in error state',
    },
    index: {
      control: { type: 'number', min: 0, max: 5 },
      description: 'Index of this dot (0-5)',
    },
    total: {
      control: { type: 'number', min: 4, max: 8 },
      description: 'Total number of dots',
    },
  },
};

export default meta;

type Story = StoryObj<typeof PINDot>;

export const Empty: Story = {
  args: {
    isFilled: false,
    hasError: false,
    index: 0,
    total: 6,
  },
};

export const Filled: Story = {
  args: {
    isFilled: true,
    hasError: false,
    index: 0,
    total: 6,
  },
};

export const Error: Story = {
  args: {
    isFilled: true,
    hasError: true,
    index: 0,
    total: 6,
  },
};

export const AllStates: Story = {
  render: () => (
    <HStack space="lg">
      <PINDot index={0} total={3} isFilled={false} hasError={false} testID="dot" />
      <PINDot index={1} total={3} isFilled={true} hasError={false} testID="dot" />
      <PINDot index={2} total={3} isFilled={true} hasError={true} testID="dot" />
    </HStack>
  ),
};

export const PartialEntry: Story = {
  render: () => (
    <HStack space="lg">
      <PINDot index={0} total={6} isFilled={true} hasError={false} testID="dot" />
      <PINDot index={1} total={6} isFilled={true} hasError={false} testID="dot" />
      <PINDot index={2} total={6} isFilled={true} hasError={false} testID="dot" />
      <PINDot index={3} total={6} isFilled={false} hasError={false} testID="dot" />
      <PINDot index={4} total={6} isFilled={false} hasError={false} testID="dot" />
      <PINDot index={5} total={6} isFilled={false} hasError={false} testID="dot" />
    </HStack>
  ),
};

export const FullError: Story = {
  render: () => (
    <HStack space="lg">
      {[0, 1, 2, 3, 4, 5].map(index => (
        <PINDot key={index} index={index} total={6} isFilled={true} hasError={true} testID="dot" />
      ))}
    </HStack>
  ),
};
