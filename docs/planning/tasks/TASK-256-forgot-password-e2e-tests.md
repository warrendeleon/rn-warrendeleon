# TASK-256: Forgot Password E2E Tests

**ID**: TASK-256 | **Epic**: [EPIC-024](../epics/EPIC-024-password-recovery.md) | **User Story**: [US-044](../stories/US-044-forgot-password-request.md)
**Status**: 📋 To Do | **Effort**: 0.5h

---

## Task Description

Write Detox + Cucumber end-to-end tests for the forgot password flow. Test complete user journey from navigation to success message, including form validation and error handling.

---

## Acceptance Criteria

- [ ] Cucumber feature file created
- [ ] Step definitions implemented
- [ ] Happy path tested (valid email submission)
- [ ] Email validation tested
- [ ] Rate limiting tested (requires mock)
- [ ] Navigation tested
- [ ] Tests passing on iOS simulator
- [ ] Tests passing on Android emulator

---

## Implementation Details

### Cucumber Feature File

```gherkin
# e2e/features/forgot-password.feature

Feature: Forgot Password

  As a user who has forgotten my password
  I want to request a password reset email
  So that I can regain access to my account

  Background:
    Given I am on the Login screen
    When I tap the "Forgot Password?" link
    Then I should see the Forgot Password screen

  Scenario: Request password reset successfully
    When I enter "user@example.com" in the email field
    And I tap the "Send Recovery Email" button
    Then I should see the success message "Email Sent!"
    And I should see "We've sent a password reset link to user@example.com"
    And the email field should be disabled
    And the "Send Recovery Email" button should be disabled

  Scenario: Validate email format
    When I enter "invalid-email" in the email field
    Then the "Send Recovery Email" button should be disabled
    When I blur the email field
    Then I should see the error "Please enter a valid email address"

  Scenario: Navigate back to login
    When I tap the "Back to Login" button
    Then I should see the Login screen

  Scenario: Show rate limit error
    Given I have already made 3 password reset requests
    When I enter "user@example.com" in the email field
    And I tap the "Send Recovery Email" button
    Then I should see the error "exceeded the maximum number of password reset requests"

  Scenario: Display information about the process
    Then I should see the information box with title "What happens next?"
    And I should see "You'll receive an email with a password reset link"
    And I should see "The link will expire in 1 hour"
    And I should see "Maximum 3 requests per hour"
```

---

### Step Definitions

```typescript
// e2e/steps/forgot-password.steps.ts

import { Given, When, Then } from '@cucumber/cucumber';
import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

Given('I am on the Login screen', async () => {
  await waitFor(element(by.id('login-screen')))
    .toBeVisible()
    .withTimeout(5000);
});

When('I tap the "Forgot Password?" link', async () => {
  await element(by.id('forgot-password-link')).tap();
});

Then('I should see the Forgot Password screen', async () => {
  await waitFor(element(by.id('forgot-password-screen')))
    .toBeVisible()
    .withTimeout(3000);
});

When('I enter {string} in the email field', async (email: string) => {
  await element(by.id('email-input')).typeText(email);
});

When('I tap the {string} button', async (buttonText: string) => {
  const buttonId =
    buttonText === 'Send Recovery Email' ? 'send-reset-email-button' : 'back-to-login-button';

  await element(by.id(buttonId)).tap();
});

Then('I should see the success message {string}', async (message: string) => {
  await waitFor(element(by.text(message)))
    .toBeVisible()
    .withTimeout(3000);
});

Then('I should see {string}', async (text: string) => {
  await waitFor(element(by.text(text).withAncestor(by.id('forgot-password-screen'))))
    .toBeVisible()
    .withTimeout(3000);
});

Then('the email field should be disabled', async () => {
  await detoxExpect(element(by.id('email-input'))).not.toBeEnabled();
});

Then('the {string} button should be disabled', async (buttonText: string) => {
  const buttonId = buttonText === 'Send Recovery Email' ? 'send-reset-email-button' : undefined;

  if (buttonId) {
    await detoxExpect(element(by.id(buttonId))).not.toBeEnabled();
  }
});

Then('the {string} button should be enabled', async (buttonText: string) => {
  const buttonId = buttonText === 'Send Recovery Email' ? 'send-reset-email-button' : undefined;

  if (buttonId) {
    await detoxExpect(element(by.id(buttonId))).toBeEnabled();
  }
});

When('I blur the email field', async () => {
  // Tap outside the input to blur
  await element(by.id('forgot-password-screen')).tap({ x: 10, y: 10 });
});

Then('I should see the error {string}', async (errorText: string) => {
  await waitFor(element(by.text(errorText)))
    .toBeVisible()
    .withTimeout(3000);
});

Then('I should see the Login screen', async () => {
  await waitFor(element(by.id('login-screen')))
    .toBeVisible()
    .withTimeout(3000);
});

Given('I have already made 3 password reset requests', async () => {
  // This would require mocking the rate limiter service
  // For E2E tests, we can either:
  // 1. Use a test API endpoint to set rate limit state
  // 2. Make 3 actual requests before this test
  // 3. Mock AsyncStorage state
  // For now, we'll document that this requires test infrastructure
  // to inject rate limit state before the test runs
});

Then('I should see the information box with title {string}', async (title: string) => {
  await waitFor(element(by.text(title)))
    .toBeVisible()
    .withTimeout(3000);
});
```

---

### Additional Detox Test Helpers

```typescript
// e2e/helpers/forgot-password.helpers.ts

import { by, device, element, waitFor } from 'detox';

/**
 * Navigate to Forgot Password screen from Login
 */
export const navigateToForgotPassword = async () => {
  await waitFor(element(by.id('login-screen')))
    .toBeVisible()
    .withTimeout(5000);

  await element(by.id('forgot-password-link')).tap();

  await waitFor(element(by.id('forgot-password-screen')))
    .toBeVisible()
    .withTimeout(3000);
};

/**
 * Fill forgot password form
 */
export const fillForgotPasswordForm = async (email: string) => {
  await element(by.id('email-input')).typeText(email);
};

/**
 * Submit forgot password form
 */
export const submitForgotPasswordForm = async () => {
  await element(by.id('send-reset-email-button')).tap();
};

/**
 * Verify success message displayed
 */
export const verifySuccessMessage = async (email: string) => {
  await waitFor(element(by.id('success-message')))
    .toBeVisible()
    .withTimeout(3000);

  await waitFor(element(by.text(`We've sent a password reset link to ${email}`)))
    .toBeVisible()
    .withTimeout(3000);
};

/**
 * Verify error message displayed
 */
export const verifyErrorMessage = async (errorText: string) => {
  await waitFor(element(by.id('error-message')))
    .toBeVisible()
    .withTimeout(3000);

  await waitFor(element(by.text(errorText)))
    .toBeVisible()
    .withTimeout(3000);
};

/**
 * Clear rate limit for testing (requires test API endpoint)
 */
export const clearRateLimit = async (email: string) => {
  // This would call a test-only API endpoint to clear rate limit state
  // Implementation depends on backend test infrastructure
};

/**
 * Set rate limit to maximum (requires test API endpoint)
 */
export const setRateLimitToMax = async (email: string) => {
  // This would call a test-only API endpoint to set rate limit to maximum
  // Implementation depends on backend test infrastructure
};
```

---

### Test Configuration

```typescript
// e2e/config/forgot-password.config.ts

/**
 * Test configuration for forgot password E2E tests
 */
export const forgotPasswordTestConfig = {
  // Test emails
  validEmail: 'test.forgot.password@example.com',
  invalidEmail: 'invalid-email',
  nonExistentEmail: 'nonexistent@example.com',

  // Timeouts
  navigationTimeout: 3000,
  successMessageTimeout: 3000,
  errorMessageTimeout: 3000,

  // Rate limiting
  maxRequestsPerHour: 3,
  rateLimitTestEmail: 'rate.limit.test@example.com',
};
```

---

### Running E2E Tests

```bash
# Build iOS app for Detox
yarn detox:ios:build

# Run forgot password E2E tests on iOS
DETOX_CONFIGURATION=ios.sim.debug npx cucumber-js e2e/features/forgot-password.feature

# Run forgot password E2E tests on Android
DETOX_CONFIGURATION=android.emu.debug npx cucumber-js e2e/features/forgot-password.feature

# Run all E2E tests
yarn detox:ios:test
yarn detox:android:test
```

---

## Test Scenarios Covered

1. **Happy Path**: Valid email submission shows success message
2. **Email Validation**: Invalid email format shows error
3. **Navigation**: Back button returns to login screen
4. **Rate Limiting**: Shows error when rate limit exceeded (requires mock)
5. **Information Display**: Shows process information to user
6. **Button States**: Submit button disabled until valid email entered
7. **Form States**: Form disabled after successful submission

---

## Dependencies

- Detox (already in project)
- Cucumber (already in project)
- ForgotPasswordScreen component (TASK-252)
- Password reset service (TASK-254)
- Rate limiter service (TASK-253)

---

## Notes

**Rate Limiting Test**: The rate limiting scenario requires either:

1. Test API endpoint to inject rate limit state
2. Making 3 actual requests before the test (slow)
3. Mocking AsyncStorage state directly

For initial implementation, we can skip the rate limiting E2E test and rely on RNTL tests for that scenario.

---

## Definition of Done

- [ ] Cucumber feature file created
- [ ] Step definitions implemented
- [ ] Happy path test passing
- [ ] Email validation test passing
- [ ] Navigation test passing
- [ ] Information display test passing
- [ ] Tests passing on iOS simulator
- [ ] Tests passing on Android emulator
- [ ] Test helpers documented
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-044](../stories/US-044-forgot-password-request.md), [TASK-252](TASK-252-forgot-password-ui.md), [TASK-255](TASK-255-forgot-password-rntl-tests.md)
