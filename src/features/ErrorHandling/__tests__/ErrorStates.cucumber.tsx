// Import common steps to make them available
import '@app/test-utils/cucumber/step-definitions/common.steps';

import { After } from '@cucumber/cucumber';
import { device } from 'detox';

/**
 * Error states and recovery step definitions
 *
 * Tests basic error handling and app stability.
 * All steps use common step definitions from common.steps.tsx.
 *
 * NOTE: This is a simplified error test suite. Complex error scenarios
 * (MSW error mocking, specific API failures, ErrorBoundary testing)
 * are tested in unit tests and will be added to E2E later.
 */

/**
 * Cleanup hook: Reset app state after error tests
 */
After({ tags: '@error' }, async () => {
  try {
    await device.reloadReactNative();
  } catch {
    // Ignore errors during cleanup
  }
});
