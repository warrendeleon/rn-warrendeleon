import React, { useState } from 'react';
import { Box } from '@gluestack-ui/themed';
import type { Meta, StoryObj } from '@storybook/react-native';

import { EmailInput } from './EmailInput';

const meta: Meta<typeof EmailInput> = {
  title: 'Components/EmailInput',
  component: EmailInput,
  decorators: [
    Story => (
      <Box p="$4" bg="$coolGray100" flex={1}>
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
    editable: {
      control: 'boolean',
      description: 'Whether input is editable',
    },
  },
  parameters: {
    notes: `
## EmailInput Component

Specialised email input with pre-configured settings for email addresses.

### Features
- Email keyboard type
- Auto-capitalisation disabled
- Auto-correct disabled
- iOS autofill support (emailAddress textContentType)

### Props
- \`placeholder\`: string - Placeholder text
- \`value\`: string - Current value
- \`onChangeText\`: (text: string) => void - Change handler
- \`onBlur\`: () => void - Blur handler
- \`groupVariant\`: 'single' | 'top' | 'middle' | 'bottom'
- \`error\`: string - Error message
- \`returnKeyType\`: ReturnKeyTypeOptions - Keyboard return key
- \`onSubmitEditing\`: () => void - Return key handler

### Accessibility
- EAA compliant with proper labels and hints
- Touch targets meet minimum size requirements (44x44)
    `,
  },
};

export default meta;

type Story = StoryObj<typeof EmailInput>;

// Interactive wrapper for controlled input
const InteractiveEmailInput = (props: React.ComponentProps<typeof EmailInput>) => {
  const [value, setValue] = useState(props.value || '');
  return <EmailInput {...props} value={value} onChangeText={setValue} />;
};

export const Default: Story = {
  render: args => <InteractiveEmailInput {...args} />,
  args: {
    placeholder: 'Email Address',
    value: '',
    groupVariant: 'single',
  },
};

export const WithValue: Story = {
  render: args => <InteractiveEmailInput {...args} />,
  args: {
    placeholder: 'Email Address',
    value: 'warren@example.com',
    groupVariant: 'single',
  },
};

export const WithError: Story = {
  render: args => <InteractiveEmailInput {...args} />,
  args: {
    placeholder: 'Email Address',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
    groupVariant: 'single',
  },
};

export const InGroupTop: Story = {
  render: args => <InteractiveEmailInput {...args} />,
  args: {
    placeholder: 'Email Address',
    value: '',
    groupVariant: 'top',
  },
};

export const InGroupBottom: Story = {
  render: args => <InteractiveEmailInput {...args} />,
  args: {
    placeholder: 'Email Address',
    value: '',
    groupVariant: 'bottom',
  },
};

export const Disabled: Story = {
  render: args => <InteractiveEmailInput {...args} />,
  args: {
    placeholder: 'Email Address',
    value: 'disabled@example.com',
    editable: false,
    groupVariant: 'single',
  },
};
