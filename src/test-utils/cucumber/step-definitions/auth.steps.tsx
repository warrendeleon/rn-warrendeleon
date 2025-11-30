import { Given, Then, When } from '@cucumber/cucumber';
import { by, element, expect as detoxExpect, waitFor } from 'detox';

import { DetoxWorld } from '../support/world';

/**
 * Auth-specific step definitions for E2E tests
 * Navigation to Login/Registration screens and form interactions
 */

// Navigation steps

Given('I navigate to the Login screen', { timeout: 30000 }, async function (this: DetoxWorld) {
  // Navigate via protected route - tap Contact Me which requires auth
  await waitFor(element(by.id('home-contact-me-button')))
    .toBeVisible()
    .withTimeout(5000);
  await element(by.id('home-contact-me-button')).tap();

  // Wait for Login screen to appear (redirected by withAuth)
  await waitFor(element(by.id('login-screen')))
    .toBeVisible()
    .withTimeout(10000);
});

Given(
  'I navigate to the Registration screen',
  { timeout: 30000 },
  async function (this: DetoxWorld) {
    // First navigate to Login screen
    await waitFor(element(by.id('home-contact-me-button')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('home-contact-me-button')).tap();

    // Wait for Login screen
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Tap Register link to go to Registration
    await waitFor(element(by.id('register-link')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('register-link')).tap();

    // Wait for Registration screen
    await waitFor(element(by.id('registration-screen')))
      .toBeVisible()
      .withTimeout(10000);
  }
);

// Input steps for clearing text before typing

When(
  'I clear and type {string} into the input with testID {string}',
  async function (this: DetoxWorld, text: string, testID: string) {
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id(testID)).clearText();
    await element(by.id(testID)).typeText(text);
  }
);

// Toggle switch step

When('I toggle the switch with testID {string}', async function (this: DetoxWorld, testID: string) {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(5000);
  await element(by.id(testID)).tap();
});

// Verify input has value

Then(
  'the input with testID {string} should have value {string}',
  async function (this: DetoxWorld, testID: string, expectedValue: string) {
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(5000);
    // Use toHaveText for text input verification (Detox API)
    await detoxExpect(element(by.id(testID))).toHaveText(expectedValue);
  }
);

// Verify input is empty

Then(
  'the input with testID {string} should be empty',
  async function (this: DetoxWorld, testID: string) {
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(5000);
    await detoxExpect(element(by.id(testID))).toHaveText('');
  }
);

// Reusable login step - performs full login flow and navigates to Edit Account
// Reduces duplication in SettingsAccount scenarios

Given(
  'I am logged in and on the Edit Account screen',
  { timeout: 60000 },
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
  }
);
