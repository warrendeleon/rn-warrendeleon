import { Given, Then, When } from '@cucumber/cucumber';
import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

import { DetoxWorld } from '../support/world';

/**
 * Auth-specific step definitions for E2E tests
 * Navigation to Login/Registration screens and form interactions
 */

// Password reset deep link URL with mock token (Supabase auth callback format)
// In E2E mode, any token will succeed as the API is mocked
const PASSWORD_RESET_DEEP_LINK =
  'warrendeleonapp://auth/callback#access_token=mock-e2e-test-token-12345&type=recovery';

// Email confirmation deep link URL (after registration)
// Includes both access_token and refresh_token for auto-login
const EMAIL_CONFIRMATION_DEEP_LINK =
  'warrendeleonapp://auth/callback#access_token=mock-e2e-signup-token-12345&refresh_token=mock-e2e-refresh-token-12345&type=signup';

// ============================================================================
// DEEP LINK STEP DEFINITIONS
// ============================================================================

/**
 * Cold start: Launch app directly via deep link
 * Simulates user tapping recovery link when app is not running
 */
Given(
  'the app is launched via password reset deep link',
  { timeout: 60000 },
  async function (this: DetoxWorld) {
    // Clear iOS Keychain to reset auth tokens
    await device.clearKeychain();
    // Launch app with deep link URL (cold start)
    await device.launchApp({
      newInstance: true,
      delete: true,
      url: PASSWORD_RESET_DEEP_LINK,
    });
    // Wait for the Reset Password screen to appear
    await waitFor(element(by.id('reset-password-screen')))
      .toBeVisible()
      .withTimeout(10000);
  }
);

/**
 * Send app to background (for warm start testing)
 */
When('I send the app to background', async function (this: DetoxWorld) {
  await device.sendToHome();
  // Brief wait for app to actually go to background
  await new Promise(resolve => setTimeout(resolve, 1000));
});

/**
 * Warm start: Open deep link when app is in background
 * Uses launchApp with newInstance: false to bring app to foreground with URL
 */
When(
  'I open the password reset deep link from background',
  { timeout: 30000 },
  async function (this: DetoxWorld) {
    // For warm start, use launchApp with newInstance: false
    // This simulates tapping a deep link while app is in background
    await device.launchApp({
      newInstance: false,
      url: PASSWORD_RESET_DEEP_LINK,
    });
    // Wait for the Reset Password screen to appear
    await waitFor(element(by.id('reset-password-screen')))
      .toBeVisible()
      .withTimeout(10000);
  }
);

/**
 * Foreground: Open deep link when app is active in foreground
 * Uses openURL which triggers the Linking event listener
 */
When('I open the password reset deep link', { timeout: 30000 }, async function (this: DetoxWorld) {
  await device.openURL({ url: PASSWORD_RESET_DEEP_LINK });
  // Wait for the Reset Password screen to appear
  await waitFor(element(by.id('reset-password-screen')))
    .toBeVisible()
    .withTimeout(10000);
});

// ============================================================================
// EMAIL CONFIRMATION DEEP LINK STEP DEFINITIONS
// ============================================================================

/**
 * Cold start: Launch app directly via email confirmation deep link
 * Simulates user tapping confirmation link in email when app is not running
 * Auto-login: The access token from the deep link is stored, logging the user in automatically
 */
Given(
  'the app is launched via email confirmation deep link',
  { timeout: 60000 },
  async function (this: DetoxWorld) {
    // Clear iOS Keychain to reset auth tokens
    await device.clearKeychain();
    // Launch app with deep link URL (cold start)
    // The app will store the access_token and auto-login the user
    await device.launchApp({
      newInstance: true,
      delete: true,
      url: EMAIL_CONFIRMATION_DEEP_LINK,
    });
    // Wait for the Home screen to appear (user is auto-logged in)
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);
  }
);

/**
 * Warm start: Open email confirmation deep link when app is in background
 * Auto-login: The access token from the deep link is stored, logging the user in automatically
 */
When(
  'I open the email confirmation deep link from background',
  { timeout: 30000 },
  async function (this: DetoxWorld) {
    await device.launchApp({
      newInstance: false,
      url: EMAIL_CONFIRMATION_DEEP_LINK,
    });
    // Wait for the Home screen to appear (user is auto-logged in)
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);
  }
);

/**
 * Foreground: Open email confirmation deep link when app is active
 * Auto-login: The access token from the deep link is stored, logging the user in automatically
 */
When(
  'I open the email confirmation deep link',
  { timeout: 30000 },
  async function (this: DetoxWorld) {
    await device.openURL({ url: EMAIL_CONFIRMATION_DEEP_LINK });
    // Wait for the Home screen to appear (user is auto-logged in)
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);
  }
);

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

// ============================================================================
// REUSABLE LOGIN HELPER
// ============================================================================

/**
 * Performs full login flow and navigates to Edit Account screen.
 * Reusable helper to reduce duplication in auth-related step definitions.
 */
export async function loginAndNavigateToEditAccount(): Promise<void> {
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

// Reusable login step - performs full login flow and navigates to Edit Account
// Uses the helper function above

Given(
  'I am logged in and on the Edit Account screen',
  { timeout: 60000 },
  async function (this: DetoxWorld) {
    await loginAndNavigateToEditAccount();
  }
);
