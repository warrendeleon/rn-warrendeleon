import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Box, Text } from '@gluestack-ui/themed';
import type { Meta, StoryObj } from '@storybook/react-native';

import { PINInput } from './PINInput';

const meta: Meta<typeof PINInput> = {
  title: 'Auth/PINInput',
  component: PINInput,
  decorators: [
    Story => (
      <Box p="$4" alignItems="center">
        <Story />
      </Box>
    ),
  ],
  parameters: {
    notes: `
## PINInput Component

Complete PIN input with iOS 26 style dots and keypad.

### Features
- 6 PIN dots showing entry progress
- Circular numeric keypad with haptic feedback
- Auto-complete when all digits entered
- Error state visual feedback
- Full accessibility support

### Usage
\`\`\`tsx
<PINInput
  value={pin}
  onChange={setPin}
  onComplete={handlePinComplete}
  length={6}
  hasError={false}
  disabled={false}
/>
\`\`\`
    `,
  },
  argTypes: {
    length: {
      control: { type: 'number', min: 4, max: 8 },
      description: 'Number of PIN digits',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether input is disabled',
    },
    hasError: {
      control: 'boolean',
      description: 'Whether to show error state',
    },
  },
};

export default meta;

type Story = StoryObj<typeof PINInput>;

/**
 * Interactive PIN input with state management
 */
const InteractivePINInput = ({
  length = 6,
  hasError = false,
  disabled = false,
}: {
  length?: number;
  hasError?: boolean;
  disabled?: boolean;
}) => {
  const [pin, setPin] = useState('');

  const handleComplete = (completedPin: string) => {
    Alert.alert('PIN Complete', `You entered: ${completedPin}`);
  };

  return (
    <Box alignItems="center">
      <PINInput
        value={pin}
        onChange={setPin}
        onComplete={handleComplete}
        length={length}
        hasError={hasError}
        disabled={disabled}
      />
    </Box>
  );
};

/**
 * PIN input with visible current value
 */
const PINWithDisplay = () => {
  const [pin, setPin] = useState('');
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
    setTimeout(() => {
      setPin('');
      setCompleted(false);
    }, 2000);
  };

  return (
    <Box alignItems="center">
      <Box mb="$4" p="$3" bg="$backgroundLight200" borderRadius="$md" w={200}>
        <Text textAlign="center" fontSize="$lg" fontFamily="$mono">
          {pin.padEnd(6, '·')}
        </Text>
        {completed && (
          <Text textAlign="center" fontSize="$sm" color="$success600">
            PIN entered
          </Text>
        )}
      </Box>
      <PINInput value={pin} onChange={setPin} onComplete={handleComplete} length={6} />
    </Box>
  );
};

export const Default: Story = {
  render: () => <InteractivePINInput />,
};

export const WithDisplay: Story = {
  render: () => <PINWithDisplay />,
};

export const FourDigit: Story = {
  render: () => <InteractivePINInput length={4} />,
};

export const ErrorState: Story = {
  render: () => <InteractivePINInput hasError />,
};

export const Disabled: Story = {
  render: () => <InteractivePINInput disabled />,
};

export const PartiallyFilled: Story = {
  render: () => {
    const [pin] = useState('123');
    return <PINInput value={pin} onChange={() => {}} onComplete={() => {}} length={6} />;
  },
};

export const FullWithError: Story = {
  render: () => {
    const [pin] = useState('123456');
    return <PINInput value={pin} onChange={() => {}} onComplete={() => {}} length={6} hasError />;
  },
};
