import React from 'react';
import { Box, Text } from '@gluestack-ui/themed';
import type { Meta, StoryObj } from '@storybook/react-native';

import { HeaderBackButton } from './HeaderBackButton';

// Helper component to avoid whitespace text node issues in React Native
const HeaderLayout = ({ children }: { children: React.ReactNode }) => (
  <Box flexDirection="row" alignItems="center" p="$4" bg="$backgroundLight100">
    {children}
    <Box flex={1} alignItems="center">
      <Text>Screen Title</Text>
    </Box>
    <Box w={32} />
  </Box>
);

const meta: Meta<typeof HeaderBackButton> = {
  title: 'Components/HeaderBackButton',
  component: HeaderBackButton,
  decorators: [
    Story => (
      <Box p="$4">
        <Story />
      </Box>
    ),
  ],
  parameters: {
    notes: `
## HeaderBackButton Component

Navigation back button with chevron icon for screen headers.

### Features
- Automatically adapts to light/dark mode
- Uses navigation.goBack()
- Includes hit slop for easier tapping

### Accessibility
- Role: button
- Label: "Go back"
- Hint: "Returns to the previous screen"
    `,
  },
};

export default meta;

type Story = StoryObj<typeof HeaderBackButton>;

export const Default: Story = {};

export const InHeader: Story = {
  decorators: [
    Story => (
      <HeaderLayout>
        <Story />
      </HeaderLayout>
    ),
  ],
};
