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
