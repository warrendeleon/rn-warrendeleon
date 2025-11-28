import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';

import { ForgotPasswordScreen } from './ForgotPasswordScreen';

// Mock navigation
const mockNavigation = {
  navigate: () => {},
  goBack: () => {},
  reset: () => {},
  setOptions: () => {},
  addListener: () => () => {},
  removeListener: () => {},
  dispatch: () => {},
  isFocused: () => true,
  canGoBack: () => true,
  getId: () => undefined,
  getParent: () => undefined,
  getState: () => ({
    key: 'ForgotPassword',
    index: 0,
    routeNames: ['ForgotPassword'],
    routes: [{ key: 'ForgotPassword', name: 'ForgotPassword', params: undefined }],
  }),
} as never;

const mockRoute = {
  key: 'ForgotPassword',
  name: 'ForgotPassword' as const,
  params: undefined,
};

const meta: Meta<typeof ForgotPasswordScreen> = {
  title: 'Screens/Auth/ForgotPasswordScreen',
  component: ForgotPasswordScreen,
  parameters: {
    notes: `
## ForgotPasswordScreen

Allows users to request a password reset email.

### Features
- Email input with validation
- Rate limiting (3 requests per hour)
- Success state with confirmation message
- Information box explaining the process
- Back to login navigation
- EAA compliant accessibility

### States
- **Default**: Email input form
- **Success**: Shows confirmation message after submission

### Rate Limiting
- Maximum 3 requests per hour per email address
- Clear error message when limit exceeded
- Shows time until rate limit resets
    `,
  },
};

export default meta;

type Story = StoryObj<typeof ForgotPasswordScreen>;

export const Default: Story = {
  render: () => <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />,
};

export const DarkMode: Story = {
  render: () => <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />,
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
