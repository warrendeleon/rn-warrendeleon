// Import common steps to make them available
import '@app/test-utils/cucumber/step-definitions/common.steps';

import { After, Then } from '@cucumber/cucumber';
import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

/**
 * Work Experience flow step definitions
 *
 * Tests navigation and display of work experience data.
 * Most steps use common step definitions from common.steps.tsx.
 * This file only contains WorkExperience-specific custom steps.
 *
 * EAA Compliance:
 * - All interactive elements have testID for automation
 * - DetailListGroup component provides accessibility props
 * - Touch targets meet 44x44 minimum (DetailListGroup minHeight: 60)
 */

Then('work experience items should be visible', async () => {
  // Wait for work experience screen to finish loading
  await waitFor(element(by.id('work-experience-screen')))
    .toBeVisible()
    .withTimeout(5000);

  // Wait for activity indicator to disappear (data finished loading)
  await waitFor(element(by.id('activity-indicator')))
    .not.toBeVisible()
    .withTimeout(10000);

  // Verify the empty state is NOT shown (confirms items actually loaded)
  await detoxExpect(element(by.id('work-experience-empty-state'))).not.toExist();
});

/**
 * Cleanup hook: Reset app state after work experience tests
 * Ensures each test scenario starts fresh
 */
After({ tags: '@work-experience' }, async () => {
  try {
    await device.reloadReactNative();
  } catch {
    // Ignore errors during cleanup
  }
});
