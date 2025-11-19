import React from 'react';
import { Box, Text } from '@gluestack-ui/themed';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { ErrorBoundary } from '../ErrorBoundary';

// Test component that renders successfully
const SuccessfulChild = () => (
  <Box testID="successful-child">
    <Text>Rendered successfully</Text>
  </Box>
);

describe('ErrorBoundary Stories', () => {
  it('renders Normal story (children render successfully)', () => {
    const { toJSON } = renderWithProviders(
      <ErrorBoundary>
        <SuccessfulChild />
      </ErrorBoundary>
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders children when no error occurs', () => {
    const { getByTestId, getByText } = renderWithProviders(
      <ErrorBoundary>
        <SuccessfulChild />
      </ErrorBoundary>
    );
    expect(getByTestId('successful-child')).toBeTruthy();
    expect(getByText('Rendered successfully')).toBeTruthy();
  });

  it('renders nested content correctly', () => {
    const { getByText } = renderWithProviders(
      <ErrorBoundary>
        <Box>
          <Text>Parent</Text>
          <Box>
            <Text>Child</Text>
          </Box>
        </Box>
      </ErrorBoundary>
    );
    expect(getByText('Parent')).toBeTruthy();
    expect(getByText('Child')).toBeTruthy();
  });
});
