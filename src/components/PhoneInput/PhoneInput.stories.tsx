import React, { useState } from 'react';
import { Box, Text } from '@gluestack-ui/themed';
import type { Meta, StoryObj } from '@storybook/react-native';

import { PhoneInput } from './PhoneInput';

const meta: Meta<typeof PhoneInput> = {
  title: 'Components/PhoneInput',
  component: PhoneInput,
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
      description: 'Current input value (full international format)',
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
    isCountrySelectorDisabled: {
      control: 'boolean',
      description: 'Whether country selector is disabled',
    },
  },
  parameters: {
    notes: `
## PhoneInput Component

Phone number input with integrated country code selector.

### Features
- Country code selector with flag and dial code
- Automatic country code prepending
- Phone keyboard type
- iOS autofill support (telephoneNumber textContentType)
- Displays national number while storing international format

### Props
- \`placeholder\`: string - Placeholder text
- \`value\`: string - Full international number (e.g., '+447510084239')
- \`onChangeText\`: (text: string) => void - Returns full international number
- \`groupVariant\`: 'single' | 'top' | 'middle' | 'bottom'
- \`error\`: string - Error message
- \`initialCountry\`: CountryData - Initial country selection
- \`isCountrySelectorDisabled\`: boolean - Disable country selector

### Accessibility
- EAA compliant with proper labels and hints
- Touch targets meet minimum size requirements (44x44)
- Country selector has descriptive accessibility labels
    `,
  },
};

export default meta;

type Story = StoryObj<typeof PhoneInput>;

// Interactive wrapper that shows both display and stored value
const InteractivePhoneInput = (props: React.ComponentProps<typeof PhoneInput>) => {
  const [value, setValue] = useState(props.value || '');
  return (
    <Box>
      <PhoneInput {...props} value={value} onChangeText={setValue} />
      <Box mt="$4" p="$3" bg="$white" borderRadius="$lg">
        <Text fontSize="$xs" color="$coolGray500" mb="$1">
          Stored value (international format):
        </Text>
        <Text fontSize="$sm" fontFamily="$mono">
          {value || '(empty)'}
        </Text>
      </Box>
    </Box>
  );
};

export const Default: Story = {
  render: args => <InteractivePhoneInput {...args} />,
  args: {
    placeholder: 'Phone Number',
    value: '',
    groupVariant: 'single',
  },
};

export const WithValue: Story = {
  render: args => <InteractivePhoneInput {...args} />,
  args: {
    placeholder: 'Phone Number',
    value: '+447510084239',
    groupVariant: 'single',
  },
};

export const WithError: Story = {
  render: args => <InteractivePhoneInput {...args} />,
  args: {
    placeholder: 'Phone Number',
    value: '+4475',
    error: 'Please enter a valid phone number',
    groupVariant: 'single',
  },
};

export const InGroupTop: Story = {
  render: args => <InteractivePhoneInput {...args} />,
  args: {
    placeholder: 'Phone Number',
    value: '',
    groupVariant: 'top',
  },
};

export const InGroupBottom: Story = {
  render: args => <InteractivePhoneInput {...args} />,
  args: {
    placeholder: 'Phone Number',
    value: '',
    groupVariant: 'bottom',
  },
};

export const CountrySelectorDisabled: Story = {
  render: args => <InteractivePhoneInput {...args} />,
  args: {
    placeholder: 'Phone Number',
    value: '+447510084239',
    isCountrySelectorDisabled: true,
    groupVariant: 'single',
  },
};

export const Disabled: Story = {
  render: args => <InteractivePhoneInput {...args} />,
  args: {
    placeholder: 'Phone Number',
    value: '+447510084239',
    editable: false,
    groupVariant: 'single',
  },
};
