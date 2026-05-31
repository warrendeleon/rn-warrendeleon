import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';

import { Box } from '@app/components/ui/box';
import { ButtonGroupDivider } from '@app/shared/components/ButtonGroupDivider';

import { PasswordInput } from './PasswordInput';

const meta: Meta<typeof PasswordInput> = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  decorators: [
    Story => (
      <Box className="flex-1 p-4">
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    value: {
      control: 'text',
      description: 'Current input value',
    },
    groupVariant: {
      control: 'select',
      options: ['single', 'top', 'middle', 'bottom'],
      description: 'Position in group for border radius',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    isNewPassword: {
      control: 'boolean',
      description: 'Whether this is a new password (affects iOS autofill)',
    },
    editable: {
      control: 'boolean',
      description: 'Whether input is editable',
    },
    returnKeyType: {
      control: 'select',
      options: ['done', 'go', 'next', 'search', 'send'],
      description: 'Keyboard return key type',
    },
    accessibilityLabel: {
      control: 'text',
      description: 'Accessibility label for screen readers',
    },
    accessibilityHint: {
      control: 'text',
      description: 'Accessibility hint for screen readers',
    },
  },
  parameters: {
    notes: `
## PasswordInput Component

Specialised password input with built-in show/hide toggle.

### Features
- Secure text entry with eye icon toggle
- Auto-capitalisation disabled
- Auto-correct disabled
- iOS autofill support (password/newPassword textContentType)
- Self-managed or externally controlled visibility state

### Props
- \`placeholder\`: string - Placeholder text
- \`value\`: string - Current value
- \`onChangeText\`: (text: string) => void - Change handler
- \`onBlur\`: () => void - Blur handler
- \`groupVariant\`: 'single' | 'top' | 'middle' | 'bottom'
- \`error\`: string - Error message
- \`isNewPassword\`: boolean - Use newPassword autofill type
- \`isSecureVisible\`: boolean - External visibility control
- \`onToggleSecure\`: () => void - External toggle handler

### Accessibility
- EAA compliant with proper labels and hints
- Touch targets meet minimum size requirements (44x44)
- Toggle button has proper accessibility labels
    `,
  },
};

export default meta;

type Story = StoryObj<typeof PasswordInput>;

// Interactive wrapper for controlled input
const InteractivePasswordInput = (props: React.ComponentProps<typeof PasswordInput>) => {
  const [value, setValue] = useState(props.value || '');
  return <PasswordInput {...props} value={value} onChangeText={setValue} />;
};

export const Default: Story = {
  render: args => <InteractivePasswordInput {...args} />,
  args: {
    placeholder: 'Password',
    value: '',
    groupVariant: 'single',
  },
};

export const WithValue: Story = {
  render: args => <InteractivePasswordInput {...args} />,
  args: {
    placeholder: 'Password',
    value: 'mySecurePassword123',
    groupVariant: 'single',
  },
};

export const NewPassword: Story = {
  render: args => <InteractivePasswordInput {...args} />,
  args: {
    placeholder: 'Create Password',
    value: '',
    isNewPassword: true,
    groupVariant: 'single',
  },
};

export const WithError: Story = {
  render: args => <InteractivePasswordInput {...args} />,
  args: {
    placeholder: 'Password',
    value: '123',
    error: 'Password must be at least 8 characters',
    groupVariant: 'single',
  },
};

export const InGroupTop: Story = {
  render: args => <InteractivePasswordInput {...args} />,
  args: {
    placeholder: 'Password',
    value: '',
    groupVariant: 'top',
    isNewPassword: true,
  },
};

export const InGroupBottom: Story = {
  render: args => <InteractivePasswordInput {...args} />,
  args: {
    placeholder: 'Confirm Password',
    value: '',
    groupVariant: 'bottom',
    isNewPassword: true,
  },
};

// Password with Confirm Password group
export const PasswordGroup: Story = {
  render: () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => setShowPassword(prev => !prev);

    return (
      <Box>
        <PasswordInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          groupVariant="top"
          isNewPassword
          isSecureVisible={showPassword}
          onToggleSecure={toggleVisibility}
          testID="password-input"
        />
        <ButtonGroupDivider />
        <PasswordInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          groupVariant="bottom"
          isNewPassword
          isSecureVisible={showPassword}
          onToggleSecure={toggleVisibility}
          testID="confirm-password-input"
          error={
            confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined
          }
        />
      </Box>
    );
  },
};

export const Disabled: Story = {
  render: args => <InteractivePasswordInput {...args} />,
  args: {
    placeholder: 'Password',
    value: 'disabled-password',
    editable: false,
    groupVariant: 'single',
  },
};
