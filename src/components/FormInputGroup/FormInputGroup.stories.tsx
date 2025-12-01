import React, { useState } from 'react';
import { Box, ScrollView } from '@gluestack-ui/themed';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Meta, StoryObj } from '@storybook/react-native';

import { ButtonGroupDivider } from '@app/components/ButtonGroupDivider';
import { EmailInput } from '@app/components/EmailInput';
import { FormInputItem } from '@app/components/FormInputItem';
import { PasswordInput } from '@app/components/PasswordInput';
import { PhoneInput } from '@app/components/PhoneInput';

import { FormInputGroup } from './FormInputGroup';

// Stack navigator wrapper for components using useNavigation (NavigationContainer provided globally)
const Stack = createNativeStackNavigator();

const StackWrapper = ({ children }: { children: React.ReactNode }) => (
  <Stack.Navigator>
    <Stack.Screen name="FormInputGroupStory" options={{ headerShown: false }}>
      {() => <>{children}</>}
    </Stack.Screen>
  </Stack.Navigator>
);

const meta: Meta<typeof FormInputGroup> = {
  title: 'Components/FormInputGroup',
  component: FormInputGroup,
  decorators: [
    Story => (
      <StackWrapper>
        <ScrollView flex={1} p="$0">
          <Story />
          <Box h="$20" />
        </ScrollView>
      </StackWrapper>
    ),
  ],
  argTypes: {
    title: {
      control: 'text',
      description: 'Group title displayed above inputs',
    },
    mx: {
      control: 'text',
      description: 'Horizontal margin',
    },
    mt: {
      control: 'text',
      description: 'Top margin',
    },
  },
  parameters: {
    notes: `
## FormInputGroup Component

Container for grouping form inputs with iOS-style sections.

### Features
- Optional uppercase title/header
- Consistent spacing and margins
- Dark mode support
- Works with all form input components

### Props
- \`title\`: string - Section header (optional)
- \`children\`: ReactNode - Form inputs
- \`mx\`: string - Horizontal margin (default: '$4')
- \`mt\`: string - Top margin (default: '$6')
- \`testID\`: string - Test identifier

### Usage Pattern
Combine with ButtonGroupDivider between inputs:
\`\`\`tsx
<FormInputGroup title="Login">
  <EmailInput ... groupVariant="top" />
  <ButtonGroupDivider />
  <PasswordInput ... groupVariant="bottom" />
</FormInputGroup>
\`\`\`

### Accessibility
- Title has header role for screen readers
- EAA compliant
    `,
  },
};

export default meta;

type Story = StoryObj<typeof FormInputGroup>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <FormInputGroup title="Section Title">
        <FormInputItem
          placeholder="Enter text"
          value={value}
          onChangeText={setValue}
          groupVariant="single"
        />
      </FormInputGroup>
    );
  },
};

export const WithoutTitle: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <FormInputGroup>
        <FormInputItem
          placeholder="No title above"
          value={value}
          onChangeText={setValue}
          groupVariant="single"
        />
      </FormInputGroup>
    );
  },
};

export const LoginForm: Story = {
  render: () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    return (
      <FormInputGroup title="Login">
        <EmailInput
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          groupVariant="top"
          testID="email-input"
        />
        <ButtonGroupDivider />
        <PasswordInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          groupVariant="bottom"
          testID="password-input"
        />
      </FormInputGroup>
    );
  },
};

export const NameSection: Story = {
  render: () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    return (
      <FormInputGroup title="Name">
        <FormInputItem
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          groupVariant="top"
          autoCapitalize="words"
          textContentType="givenName"
        />
        <ButtonGroupDivider />
        <FormInputItem
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          groupVariant="bottom"
          autoCapitalize="words"
          textContentType="familyName"
        />
      </FormInputGroup>
    );
  },
};

export const ContactSection: Story = {
  render: () => {
    const [phone, setPhone] = useState('');
    return (
      <FormInputGroup title="Contact">
        <PhoneInput
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          groupVariant="single"
          testID="phone-input"
          isCountrySelectorDisabled // Country selector requires full app navigation
        />
      </FormInputGroup>
    );
  },
};

export const PasswordSection: Story = {
  render: () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => setShowPassword(prev => !prev);

    return (
      <FormInputGroup title="Create Password">
        <PasswordInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          groupVariant="top"
          isNewPassword
          isSecureVisible={showPassword}
          onToggleSecure={toggleVisibility}
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
          error={
            confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined
          }
        />
      </FormInputGroup>
    );
  },
};

export const CompleteRegistrationForm: Story = {
  render: () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => setShowPassword(prev => !prev);

    return (
      <Box>
        {/* Name Section */}
        <FormInputGroup title="Name">
          <FormInputItem
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            groupVariant="top"
            autoCapitalize="words"
            textContentType="givenName"
          />
          <ButtonGroupDivider />
          <FormInputItem
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            groupVariant="bottom"
            autoCapitalize="words"
            textContentType="familyName"
          />
        </FormInputGroup>

        {/* Phone Section */}
        <FormInputGroup title="Phone">
          <PhoneInput
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            groupVariant="single"
            isCountrySelectorDisabled // Country selector requires full app navigation
          />
        </FormInputGroup>

        {/* Email Section */}
        <FormInputGroup title="Email">
          <EmailInput
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            groupVariant="single"
          />
        </FormInputGroup>

        {/* Password Section */}
        <FormInputGroup title="Password">
          <PasswordInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            groupVariant="top"
            isNewPassword
            isSecureVisible={showPassword}
            onToggleSecure={toggleVisibility}
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
            error={
              confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined
            }
          />
        </FormInputGroup>
      </Box>
    );
  },
};
