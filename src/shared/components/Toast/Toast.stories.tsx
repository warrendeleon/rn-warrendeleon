import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';

import { Box } from '@app/components/ui/box';
import { Pressable } from '@app/components/ui/pressable';
import { Text } from '@app/components/ui/text';
import { VStack } from '@app/components/ui/vstack';
import { useAppColorScheme } from '@app/shared/hooks';

import { ToastProvider, useToast } from './ToastProvider';

const meta: Meta<typeof ToastProvider> = {
  title: 'Components/Toast',
  component: ToastProvider,
  parameters: {
    notes: `
## Toast Component

Global toast notification system for displaying temporary messages to users.

### Features
- Four types: success, error, info, warning
- Configurable duration (type-based defaults: 4-7 seconds)
- Position: top or bottom
- Optional title and action button
- Dismissible (can be disabled)
- EAA/WCAG 2.1 compliant with proper ARIA roles
- Dark/light mode support using GlueStack UI tokens

### Default Durations by Type
- Success: 4 seconds
- Info: 5 seconds
- Warning: 6 seconds
- Error: 7 seconds

### TestIDs Available
- toast-container (or custom via testID prop)
- toast-content
- toast-title
- toast-message
- toast-dismiss-button
- toast-action-button
- toast-icon-{type}

### Usage
\`\`\`tsx
const { showToast } = useToast();

showToast({
  message: 'Operation successful',
  type: 'success',
  title: 'Success', // optional
  duration: 3000, // optional, overrides default
  position: 'top', // 'top' or 'bottom'
  dismissible: true, // optional
  action: { label: 'Undo', onPress: () => {} }, // optional
  testID: 'my-toast', // optional
});
\`\`\`
    `,
  },
  decorators: [
    Story => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ToastProvider>;

// Button component for triggering toasts using GlueStack UI
const TriggerButton = ({ label, onPress }: { label: string; onPress: () => void }) => {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      onPress={onPress}
      className="min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-4 py-3"
      style={({ pressed }) => ({
        backgroundColor: isDark ? '#004282' : '#0077E6',
        opacity: pressed ? 0.8 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text className="text-sm font-semibold text-white">{label}</Text>
    </Pressable>
  );
};

// Demo component for basic toast types
const ToastTypesDemo = () => {
  const { showToast } = useToast();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Box className="flex-1 p-4">
      <Text
        className="mb-4 text-lg font-bold"
        style={{ color: isDark ? '#FFFFFF' : '#000000' }}
        testID="toast-demo-title"
      >
        Toast Types
      </Text>
      <VStack space="md">
        <TriggerButton
          label="Show Success Toast"
          onPress={() =>
            showToast({
              message: 'Your changes have been saved successfully.',
              type: 'success',
              testID: 'success-toast',
            })
          }
        />
        <TriggerButton
          label="Show Error Toast"
          onPress={() =>
            showToast({
              message: 'Failed to save changes. Please try again.',
              type: 'error',
              testID: 'error-toast',
            })
          }
        />
        <TriggerButton
          label="Show Info Toast"
          onPress={() =>
            showToast({
              message: 'Your session will expire in 5 minutes.',
              type: 'info',
              testID: 'info-toast',
            })
          }
        />
        <TriggerButton
          label="Show Warning Toast"
          onPress={() =>
            showToast({
              message: 'You have unsaved changes that will be lost.',
              type: 'warning',
              testID: 'warning-toast',
            })
          }
        />
      </VStack>
    </Box>
  );
};

// Demo component for toast with title
const ToastWithTitleDemo = () => {
  const { showToast } = useToast();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Box className="flex-1 p-4">
      <Text
        className="mb-4 text-lg font-bold"
        style={{ color: isDark ? '#FFFFFF' : '#000000' }}
        testID="toast-title-demo-title"
      >
        Toast with Title
      </Text>
      <VStack space="md">
        <TriggerButton
          label="Show Toast with Title"
          onPress={() =>
            showToast({
              title: 'Password Updated',
              message: 'Your password has been changed successfully.',
              type: 'success',
              testID: 'titled-toast',
            })
          }
        />
        <TriggerButton
          label="Show Error with Title"
          onPress={() =>
            showToast({
              title: 'Connection Error',
              message: 'Unable to connect to the server. Check your internet connection.',
              type: 'error',
              testID: 'titled-error-toast',
            })
          }
        />
      </VStack>
    </Box>
  );
};

// Demo component for toast with action
const ToastWithActionDemo = () => {
  const { showToast } = useToast();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Box className="flex-1 p-4">
      <Text
        className="mb-4 text-lg font-bold"
        style={{ color: isDark ? '#FFFFFF' : '#000000' }}
        testID="toast-action-demo-title"
      >
        Toast with Action Button
      </Text>
      <VStack space="md">
        <TriggerButton
          label="Show Toast with Undo Action"
          onPress={() =>
            showToast({
              message: 'Item deleted from your list.',
              type: 'info',
              action: {
                label: 'Undo',
                onPress: () => {
                  // In a real app, this would undo the action
                  showToast({
                    message: 'Action undone.',
                    type: 'success',
                    testID: 'undo-confirmation-toast',
                  });
                },
                testID: 'undo-action-button',
              },
              testID: 'toast-with-action',
            })
          }
        />
        <TriggerButton
          label="Show Error with Retry"
          onPress={() =>
            showToast({
              title: 'Upload Failed',
              message: 'Could not upload the file.',
              type: 'error',
              action: {
                label: 'Retry',
                onPress: () => {
                  showToast({
                    message: 'Retrying upload...',
                    type: 'info',
                    testID: 'retry-toast',
                  });
                },
                testID: 'retry-action-button',
              },
              testID: 'error-with-retry-toast',
            })
          }
        />
      </VStack>
    </Box>
  );
};

// Demo component for toast positions
const ToastPositionDemo = () => {
  const { showToast } = useToast();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Box className="flex-1 p-4">
      <Text
        className="mb-4 text-lg font-bold"
        style={{ color: isDark ? '#FFFFFF' : '#000000' }}
        testID="toast-position-demo-title"
      >
        Toast Positions
      </Text>
      <VStack space="md">
        <TriggerButton
          label="Show Toast at Top"
          onPress={() =>
            showToast({
              message: 'This toast appears at the top.',
              type: 'info',
              position: 'top',
              testID: 'top-position-toast',
            })
          }
        />
        <TriggerButton
          label="Show Toast at Bottom"
          onPress={() =>
            showToast({
              message: 'This toast appears at the bottom.',
              type: 'info',
              position: 'bottom',
              testID: 'bottom-position-toast',
            })
          }
        />
      </VStack>
    </Box>
  );
};

// Demo component for non-dismissible toast
const NonDismissibleDemo = () => {
  const { showToast } = useToast();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Box className="flex-1 p-4">
      <Text
        className="mb-4 text-lg font-bold"
        style={{ color: isDark ? '#FFFFFF' : '#000000' }}
        testID="non-dismissible-demo-title"
      >
        Non-Dismissible Toast
      </Text>
      <VStack space="md">
        <TriggerButton
          label="Show Non-Dismissible Toast"
          onPress={() =>
            showToast({
              message: 'This toast cannot be manually dismissed.',
              type: 'warning',
              dismissible: false,
              duration: 3000,
              testID: 'non-dismissible-toast',
            })
          }
        />
      </VStack>
      <Text className="mt-4 text-sm" style={{ color: isDark ? '#A3A3A3' : '#8C8C8C' }}>
        Note: This toast will auto-dismiss after 3 seconds but has no X button.
      </Text>
    </Box>
  );
};

// Demo component for custom durations
const CustomDurationDemo = () => {
  const { showToast } = useToast();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Box className="flex-1 p-4">
      <Text
        className="mb-4 text-lg font-bold"
        style={{ color: isDark ? '#FFFFFF' : '#000000' }}
        testID="duration-demo-title"
      >
        Custom Durations
      </Text>
      <VStack space="md">
        <TriggerButton
          label="Quick Toast (2s)"
          onPress={() =>
            showToast({
              message: 'This disappears quickly!',
              type: 'success',
              duration: 2000,
              testID: 'quick-toast',
            })
          }
        />
        <TriggerButton
          label="Long Toast (10s)"
          onPress={() =>
            showToast({
              message: 'This stays for a while. Important information here.',
              type: 'warning',
              duration: 10000,
              testID: 'long-toast',
            })
          }
        />
      </VStack>
      <Text className="mt-4 text-sm" style={{ color: isDark ? '#A3A3A3' : '#8C8C8C' }}>
        Default durations: Success (4s), Info (5s), Warning (6s), Error (7s)
      </Text>
    </Box>
  );
};

// Stories
export const Types: Story = {
  render: () => <ToastTypesDemo />,
};

export const WithTitle: Story = {
  render: () => <ToastWithTitleDemo />,
};

export const WithAction: Story = {
  render: () => <ToastWithActionDemo />,
};

export const Positions: Story = {
  render: () => <ToastPositionDemo />,
};

export const NonDismissible: Story = {
  render: () => <NonDismissibleDemo />,
};

export const CustomDurations: Story = {
  render: () => <CustomDurationDemo />,
};
