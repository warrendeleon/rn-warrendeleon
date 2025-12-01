// Import common and auth steps to make them available
import '@app/test-utils/cucumber/step-definitions/common.steps';
import '@app/test-utils/cucumber/step-definitions/auth.steps';

import { Given } from '@cucumber/cucumber';
import { by, element, waitFor } from 'detox';

import { DetoxWorld } from '@app/test-utils/cucumber/support/world';

/**
 * Change Password specific step definitions for E2E tests
 * Extends auth.steps with Change Password screen navigation
 */

/**
 * Navigate to Change Password screen from Edit Account
 * Uses the existing "I am logged in and on the Edit Account screen" step
 * then navigates to Change Password
 */
Given(
  'I am logged in and on the Change Password screen',
  { timeout: 90000 },
  async function (this: DetoxWorld) {
    // Navigate to Settings
    await waitFor(element(by.id('home-settings-button')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('home-settings-button')).tap();

    // Wait for Settings screen
    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Tap sign-in button
    await waitFor(element(by.id('settings-sign-in-button')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('settings-sign-in-button')).tap();

    // Wait for Login screen
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Enter credentials
    await element(by.id('email-input')).replaceText('testuser@example.com');
    await element(by.id('password-input')).replaceText('SecurePass123');

    // Wait for form validation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Tap login button
    await element(by.id('login-button')).tap();

    // Wait for login to complete and return to Home
    await new Promise(resolve => setTimeout(resolve, 2000));
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Navigate to Settings
    await element(by.id('home-settings-button')).tap();
    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Tap user card to go to Edit Account
    await waitFor(element(by.id('settings-user-card')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('settings-user-card')).tap();

    // Wait for Edit Account screen
    await waitFor(element(by.id('edit-account-screen')))
      .toBeVisible()
      .withTimeout(5000);

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
