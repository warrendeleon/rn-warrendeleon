// Import common steps to make them available
import '@app/test-utils/cucumber/step-definitions/common.steps';

import { After, Then } from '@cucumber/cucumber';
import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

/**
 * Education screen E2E step definitions
 *
 * Tests education screen navigation, display, and interactions.
 * Most steps use common step definitions from common.steps.tsx.
 * This file only contains Education-specific custom steps.
 *
 * EAA Compliance:
 * - All interactive elements have testID for automation
 * - DetailListGroup component provides accessibility props
 * - SVG logos rendered via react-native-svg (accessible by default)
 * - Touch targets meet 44x44 minimum (DetailListGroup minHeight: 60)
 */

Then('I should see education items loaded', async () => {
  // Wait for education screen to finish loading
  await waitFor(element(by.id('education-screen')))
    .toBeVisible()
    .withTimeout(5000);

  // Wait for activity indicator to disappear (data finished loading)
  await waitFor(element(by.id('activity-indicator')))
    .not.toBeVisible()
    .withTimeout(10000);

  // Verify the "No education data available" message is NOT shown
  // This confirms education items actually loaded
  await detoxExpect(element(by.text('No education data available'))).not.toExist();
});

/**
 * Cleanup hook: Reset app state after education tests
 * Ensures each test scenario starts fresh
 */
After({ tags: '@education' }, async () => {
  try {
    await device.reloadReactNative();
  } catch {
    // Ignore errors during cleanup
  }
});
