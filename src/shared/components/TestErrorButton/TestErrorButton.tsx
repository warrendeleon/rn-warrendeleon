import React, { useState } from 'react';

import { Button, ButtonText } from '@app/components/ui/button';

/**
 * Test component for ErrorBoundary E2E testing
 * Only renders in DEV mode
 * Throws an error when pressed to trigger ErrorBoundary
 */
export const TestErrorButton: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (!__DEV__) {
    return null;
  }

  if (shouldThrow) {
    throw new Error('Test error triggered by TestErrorButton');
  }

  return (
    <Button
      onPress={() => setShouldThrow(true)}
      action="negative"
      testID="test-error-button"
      className="mt-4"
    >
      <ButtonText>[DEV] Trigger Error</ButtonText>
    </Button>
  );
};
