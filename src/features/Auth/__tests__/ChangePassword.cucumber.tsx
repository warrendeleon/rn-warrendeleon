// Import common and auth steps to make them available
import '@app/test-utils/cucumber/step-definitions/common.steps';
import '@app/test-utils/cucumber/step-definitions/auth.steps';

import { Given } from '@cucumber/cucumber';
import { by, element, waitFor } from 'detox';

import { loginAndNavigateToEditAccount } from '@app/test-utils/cucumber/step-definitions/auth.steps';
import { DetoxWorld } from '@app/test-utils/cucumber/support/world';

/**
 * Change Password specific step definitions for E2E tests
 * Extends auth.steps with Change Password screen navigation
 */

/**
 * Navigate to Change Password screen from Edit Account
 * Reuses the loginAndNavigateToEditAccount helper and adds navigation to Change Password
 */
Given(
  'I am logged in and on the Change Password screen',
  { timeout: 90000 },
  async function (this: DetoxWorld) {
    // Reuse helper to login and navigate to Edit Account
    await loginAndNavigateToEditAccount();

    // Tap Change Password button to navigate to Change Password screen
    await waitFor(element(by.id('change-password-button')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('change-password-button')).tap();

    // Wait for Change Password screen
    await waitFor(element(by.id('change-password-screen')))
      .toBeVisible()
      .withTimeout(5000);
  }
);
