import React from 'react';
import { Box } from '@gluestack-ui/themed';
import { NavigationContainer } from '@react-navigation/native';
import type { Meta, StoryObj } from '@storybook/react-native';

import { HeaderBackButton } from './HeaderBackButton';

const meta: Meta<typeof HeaderBackButton> = {
  title: 'Components/HeaderBackButton',
  component: HeaderBackButton,
  decorators: [
    Story => (
      <NavigationContainer>
        <Box p="$4">
          <Story />
        </Box>
      </NavigationContainer>
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
      <NavigationContainer>
        <Box flexDirection="row" alignItems="center" p="$4" bg="$backgroundLight100">
          <Story />
          <Box flex={1} alignItems="center">
            <Box>Screen Title</Box>
          </Box>
          <Box w={32} /> {/* Spacer for balance */}
        </Box>
      </NavigationContainer>
    ),
  ],
};
