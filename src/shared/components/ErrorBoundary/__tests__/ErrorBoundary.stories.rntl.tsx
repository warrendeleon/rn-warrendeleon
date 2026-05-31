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
  it('renders Normal story with children visible', async () => {
    const { getByTestId, getByText } = await renderWithProviders(
      <ErrorBoundary>
        <SuccessfulChild />
      </ErrorBoundary>
    );
    expect(getByTestId('successful-child')).toBeOnTheScreen();
    expect(getByText('Rendered successfully')).toBeOnTheScreen();
  });

  it('renders children when no error occurs', async () => {
    const { getByTestId, getByText } = await renderWithProviders(
      <ErrorBoundary>
        <SuccessfulChild />
      </ErrorBoundary>
    );
    expect(getByTestId('successful-child')).toBeOnTheScreen();
    expect(getByText('Rendered successfully')).toBeOnTheScreen();
  });

  it('renders nested content correctly', async () => {
    const { getByText } = await renderWithProviders(
      <ErrorBoundary>
        <Box>
          <Text>Parent</Text>
          <Box>
            <Text>Child</Text>
          </Box>
        </Box>
      </ErrorBoundary>
    );
    expect(getByText('Parent')).toBeOnTheScreen();
    expect(getByText('Child')).toBeOnTheScreen();
  });
});
