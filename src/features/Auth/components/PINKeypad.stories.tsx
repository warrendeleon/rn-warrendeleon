import React, { useState } from 'react';
import { Box, Text } from '@gluestack-ui/themed';
import type { Meta, StoryObj } from '@storybook/react-native';

import { PINKeypad } from './PINKeypad';

const meta: Meta<typeof PINKeypad> = {
  title: 'Auth/PINKeypad',
  component: PINKeypad,
  decorators: [
    Story => (
      <Box p="$4" alignItems="center">
        <Story />
      </Box>
    ),
  ],
  parameters: {
    notes: `
## PINKeypad Component

iOS 26 style numeric keypad for PIN entry.

### Features
- Circular buttons with sublabels (ABC, DEF, etc.)
- Haptic feedback on press
- Delete button with backspace icon
- Adapts to light/dark mode

### Layout
\`\`\`
[1] [2] [3]
[4] [5] [6]
[7] [8] [9]
[ ] [0] [⌫]
\`\`\`

### Accessibility
- Each button has role: button
- Digit buttons: "Digit X" label, "Enters digit X" hint
- Delete button: "Delete" label, "Removes the last entered digit" hint
    `,
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Whether keypad is disabled',
    },
  },
};

export default meta;

type Story = StoryObj<typeof PINKeypad>;

/**
 * Interactive keypad with press feedback display
 */
const InteractiveKeypad = () => {
  const [lastPressed, setLastPressed] = useState<string>('');
  const [sequence, setSequence] = useState<string>('');

  return (
    <Box alignItems="center">
      <Box mb="$4" p="$2" bg="$backgroundLight200" borderRadius="$md" w={200}>
        <Text textAlign="center" fontSize="$lg">
          Pressed: {lastPressed || '-'}
        </Text>
        <Text textAlign="center" fontSize="$sm" color="$textLight500">
          Sequence: {sequence || 'none'}
        </Text>
      </Box>
      <PINKeypad
        onDigitPress={digit => {
          setLastPressed(digit);
          setSequence(prev => (prev + digit).slice(-6));
        }}
        onDeletePress={() => {
          setLastPressed('⌫');
          setSequence(prev => prev.slice(0, -1));
        }}
      />
    </Box>
  );
};

export const Default: Story = {
  args: {
    onDigitPress: () => {},
    onDeletePress: () => {},
    disabled: false,
  },
};

export const Interactive: Story = {
  render: () => <InteractiveKeypad />,
};

export const Disabled: Story = {
  args: {
    onDigitPress: () => {},
    onDeletePress: () => {},
    disabled: true,
  },
};
