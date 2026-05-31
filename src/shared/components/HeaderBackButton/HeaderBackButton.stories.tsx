import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';

import { Box } from '@app/components/ui/box';
import { Text } from '@app/components/ui/text';

import { HeaderBackButton } from './HeaderBackButton';

// Helper component to avoid whitespace text node issues in React Native
const HeaderLayout = ({ children }: { children: React.ReactNode }) => (
  <Box className="flex-row items-center p-4">
    {children}
    <Box className="flex-1 items-center">
      <Text>Screen Title</Text>
    </Box>
    <Box className="w-[32px]" />
  </Box>
);

const meta: Meta<typeof HeaderBackButton> = {
  title: 'Components/HeaderBackButton',
  component: HeaderBackButton,
  decorators: [
    Story => (
      <Box className="p-4">
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
