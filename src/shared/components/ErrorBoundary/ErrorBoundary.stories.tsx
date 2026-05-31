import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';

import { Box } from '@app/components/ui/box';
import { Text } from '@app/components/ui/text';

import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error for testing
const ErrorThrower = ({ shouldError }: { shouldError: boolean }) => {
  if (shouldError) {
    throw new Error('Test error from ErrorThrower component');
  }
  return (
    <Box className="rounded-lg bg-green-100 p-4">
      <Text>Content rendered successfully</Text>
    </Box>
  );
};

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    notes: `
## ErrorBoundary Component

React error boundary that catches JavaScript errors in child components.

### Features
- Catches errors in child component tree
- Shows FallbackUI when error occurs
- Provides reset functionality

### Usage
Wrap components that may throw errors:
\`\`\`tsx
<ErrorBoundary>
  <ComponentThatMayThrow />
</ErrorBoundary>
\`\`\`

Note: In Storybook, the error state shows a simplified fallback since navigation is not available.
    `,
  },
};

export default meta;

type Story = StoryObj<typeof ErrorBoundary>;

export const Normal: Story = {
  render: () => (
    <ErrorBoundary>
      <ErrorThrower shouldError={false} />
    </ErrorBoundary>
  ),
};

export const WithError: Story = {
  render: () => (
    <ErrorBoundary>
      <ErrorThrower shouldError={true} />
    </ErrorBoundary>
  ),
};

export const NestedContent: Story = {
  render: () => (
    <ErrorBoundary>
      <Box className="rounded-lg bg-blue-100 p-4">
        <Text className="mb-2 font-bold">Parent Content</Text>
        <Box className="rounded-md bg-white p-3">
          <Text>Nested child content</Text>
        </Box>
      </Box>
    </ErrorBoundary>
  ),
};
