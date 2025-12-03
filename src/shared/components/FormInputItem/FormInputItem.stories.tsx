import React, { useState } from 'react';
import { Box } from '@gluestack-ui/themed';
import type { Meta, StoryObj } from '@storybook/react-native';

import { FormInputItem } from './FormInputItem';

const meta: Meta<typeof FormInputItem> = {
  title: 'Components/FormInputItem',
  component: FormInputItem,
  decorators: [
    Story => (
      <Box p="$4" flex={1}>
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
    secureTextEntry: {
      control: 'boolean',
      description: 'Hide text for password fields',
    },
    showSecureToggle: {
      control: 'boolean',
      description: 'Show password visibility toggle',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    editable: {
      control: 'boolean',
      description: 'Whether input is editable',
    },
    keyboardType: {
      control: 'select',
      options: ['default', 'email-address', 'phone-pad', 'numeric'],
      description: 'Keyboard type for input',
    },
    autoCapitalize: {
      control: 'select',
      options: ['none', 'sentences', 'words', 'characters'],
      description: 'Auto-capitalisation behaviour',
    },
    autoCorrect: {
      control: 'boolean',
      description: 'Enable auto-correct',
    },
  },
  parameters: {
    notes: `
## FormInputItem Component

iOS SwiftUI-style form input item for use within grouped forms.

### Props
- \`placeholder\`: string - Placeholder text
- \`value\`: string - Current value
- \`onChangeText\`: (text: string) => void - Change handler
- \`onBlur\`: () => void - Blur handler
- \`groupVariant\`: 'single' | 'top' | 'middle' | 'bottom'
- \`secureTextEntry\`: boolean - Password mode
- \`showSecureToggle\`: boolean - Show eye icon toggle
- \`error\`: string - Error message
- \`leftContent\`: ReactNode - Content on the left (e.g., country selector)
- \`textContentType\`: iOS autofill type

### Accessibility
- EAA compliant with proper labels and hints
- Touch targets meet minimum size requirements
    `,
  },
};

export default meta;

type Story = StoryObj<typeof FormInputItem>;

// Interactive wrapper for controlled input
const InteractiveFormInput = (props: React.ComponentProps<typeof FormInputItem>) => {
  const [value, setValue] = useState(props.value || '');
  return <FormInputItem {...props} value={value} onChangeText={setValue} />;
};

export const Default: Story = {
  render: args => <InteractiveFormInput {...args} />,
  args: {
    placeholder: 'Enter text',
    value: '',
    groupVariant: 'single',
  },
};

export const WithValue: Story = {
  render: args => <InteractiveFormInput {...args} />,
  args: {
    placeholder: 'First Name',
    value: 'Warren',
    groupVariant: 'single',
  },
};

export const EmailInput: Story = {
  render: args => <InteractiveFormInput {...args} />,
  args: {
    placeholder: 'Email Address',
    value: '',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    textContentType: 'emailAddress',
    groupVariant: 'single',
  },
};

export const PasswordInput: Story = {
  render: args => {
    const [value, setValue] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    return (
      <FormInputItem
        {...args}
        value={value}
        onChangeText={setValue}
        isSecureVisible={isVisible}
        onToggleSecure={() => setIsVisible(!isVisible)}
      />
    );
  },
  args: {
    placeholder: 'Password',
    secureTextEntry: true,
    showSecureToggle: true,
    textContentType: 'newPassword',
    groupVariant: 'single',
  },
};

export const WithError: Story = {
  render: args => <InteractiveFormInput {...args} />,
  args: {
    placeholder: 'Email Address',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
    groupVariant: 'single',
  },
};

export const PhoneInput: Story = {
  render: args => <InteractiveFormInput {...args} />,
  args: {
    placeholder: 'Phone Number',
    value: '',
    keyboardType: 'phone-pad',
    textContentType: 'telephoneNumber',
    groupVariant: 'single',
  },
};

export const TopInGroup: Story = {
  render: args => <InteractiveFormInput {...args} />,
  args: {
    placeholder: 'First Name',
    value: '',
    groupVariant: 'top',
  },
};

export const MiddleInGroup: Story = {
  render: args => <InteractiveFormInput {...args} />,
  args: {
    placeholder: 'Middle Name',
    value: '',
    groupVariant: 'middle',
  },
};

export const BottomInGroup: Story = {
  render: args => <InteractiveFormInput {...args} />,
  args: {
    placeholder: 'Last Name',
    value: '',
    groupVariant: 'bottom',
  },
};

export const GroupedForm: Story = {
  render: () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    return (
      <Box>
        <FormInputItem
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          groupVariant="top"
          textContentType="givenName"
        />
        <Box h={1} bg="$coolGray200" />
        <FormInputItem
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          groupVariant="bottom"
          textContentType="familyName"
        />
      </Box>
    );
  },
};
