import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Meta, StoryObj } from '@storybook/react-native';

import { FallbackUI } from './FallbackUI';

const Stack = createNativeStackNavigator();

// Wrapper to provide navigation context
const NavigationWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" options={{ headerShown: false }}>
        {() => <>{children}</>}
      </Stack.Screen>
    </Stack.Navigator>
  </NavigationContainer>
);

const meta: Meta<typeof FallbackUI> = {
  title: 'Components/FallbackUI',
  component: FallbackUI,
  decorators: [Story => <NavigationWrapper>{Story()}</NavigationWrapper>],
  parameters: {
    notes: `
## FallbackUI Component

Error fallback screen shown when ErrorBoundary catches an error.

### Props
- \`error\`: Error | null - The caught error
- \`onReset\`: () => void - Reset handler

### Features
- Shows error title and message
- In development: shows actual error message
- In production: shows generic error message
- "Try Again" button to retry
- "Go Home" button to navigate home
    `,
  },
};

export default meta;

type Story = StoryObj<typeof FallbackUI>;

export const Default: Story = {
  args: {
    error: new Error('Something went wrong'),
    onReset: () => {},
  },
};

export const NetworkError: Story = {
  args: {
    error: new Error('Network request failed: Unable to connect to server'),
    onReset: () => {},
  },
};

export const NullError: Story = {
  args: {
    error: null,
    onReset: () => {},
  },
};

export const LongErrorMessage: Story = {
  args: {
    error: new Error(
      'This is a very long error message that might occur in production. It contains detailed information about what went wrong and should be handled gracefully by the UI.'
    ),
    onReset: () => {},
  },
};
