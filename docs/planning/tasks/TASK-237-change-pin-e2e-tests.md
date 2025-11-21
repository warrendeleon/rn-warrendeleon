# TASK-237: Change PIN E2E Tests (Detox + Cucumber)

**ID**: TASK-237 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-040](../stories/US-040-change-pin.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Write end-to-end tests for the Change PIN flow using Detox and Cucumber. Test the complete user journey from navigating to the Change PIN screen, entering PINs, validation, successful PIN change, and error scenarios.

---

## Acceptance Criteria

- [ ] Feature file created at `e2e/features/change-pin.feature`
- [ ] Step definitions created at `e2e/step-definitions/change-pin.steps.ts`
- [ ] Navigation to Change PIN screen tested
- [ ] PIN input interaction tested
- [ ] Form validation tested (mismatched PINs, weak PINs)
- [ ] Successful PIN change tested
- [ ] Error scenarios tested (incorrect current PIN)
- [ ] Rate limiting tested (lockout after 3 failures)
- [ ] Accessibility tested (VoiceOver support)
- [ ] All scenarios passing on iOS

---

## Implementation Details

### Feature File

```gherkin
# e2e/features/change-pin.feature

@change-pin
Feature: Change PIN

  As a user
  I want to change my PIN
  So that I can update my security credentials

  Background:
    Given I am logged in
    And I am on the Settings screen

  @smoke @ios @android
  Scenario: Successfully change PIN
    When I tap the "Change PIN" option
    Then I should see the Change PIN screen
    When I enter "111111" in the Current PIN field
    And I enter "654321" in the New PIN field
    And I enter "654321" in the Confirm PIN field
    And I tap the "Change PIN" button
    Then I should see a success message "PIN changed successfully"
    And I should be navigated back to the Settings screen after 2 seconds

  @validation @ios @android
  Scenario: Show error when PINs do not match
    When I tap the "Change PIN" option
    And I enter "111111" in the Current PIN field
    And I enter "654321" in the New PIN field
    And I enter "123456" in the Confirm PIN field
    Then I should see an error "PINs must match"
    And the "Change PIN" button should be disabled

  @validation @ios @android
  Scenario: Show error when PIN is too weak
    When I tap the "Change PIN" option
    And I enter "111111" in the Current PIN field
    And I enter "123456" in the New PIN field
    And I enter "123456" in the Confirm PIN field
    Then I should see an error "This PIN is too easy to guess"
    And the "Change PIN" button should be disabled

  @validation @ios @android
  Scenario: Show error when current PIN is incorrect
    When I tap the "Change PIN" option
    And I enter "999999" in the Current PIN field
    And I enter "654321" in the New PIN field
    And I enter "654321" in the Confirm PIN field
    And I tap the "Change PIN" button
    Then I should see an error "Current PIN is incorrect"
    And I should see "2 attempts remaining"

  @rate-limiting @ios @android
  Scenario: Lock out user after 3 failed attempts
    When I tap the "Change PIN" option
    # Attempt 1
    And I enter "999999" in the Current PIN field
    And I enter "654321" in the New PIN field
    And I enter "654321" in the Confirm PIN field
    And I tap the "Change PIN" button
    Then I should see "2 attempts remaining"
    # Attempt 2
    And I tap the "Change PIN" button
    Then I should see "1 attempt remaining"
    # Attempt 3 - lockout
    And I tap the "Change PIN" button
    Then I should see "Too many failed attempts"
    And I should see "Please try again in 15 minutes"
    And the "Change PIN" button should be disabled

  @accessibility @ios
  Scenario: VoiceOver support for Change PIN screen
    When I enable VoiceOver
    And I tap the "Change PIN" option
    And I focus on the Current PIN field
    Then I should hear "Current PIN. Text field."
    When I focus on the New PIN field
    Then I should hear "New PIN. Text field."
    When I focus on the Confirm PIN field
    Then I should hear "Confirm new PIN. Text field."
    When I focus on the "Change PIN" button
    Then I should hear "Change PIN. Button. Submit new PIN. Disabled."
```

### Step Definitions

```typescript
// e2e/step-definitions/change-pin.steps.ts

import { Given, When, Then } from '@cucumber/cucumber';
import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

Given('I am on the Settings screen', async () => {
  await waitFor(element(by.id('settings-screen')))
    .toBeVisible()
    .withTimeout(5000);
});

When('I tap the {string} option', async (option: string) => {
  const testID = option.toLowerCase().replace(/\s+/g, '-') + '-option';
  await element(by.id(testID)).tap();
});

Then('I should see the Change PIN screen', async () => {
  await waitFor(element(by.id('change-pin-screen')))
    .toBeVisible()
    .withTimeout(2000);
});

When('I enter {string} in the Current PIN field', async (pin: string) => {
  await element(by.id('current-pin-input')).typeText(pin);
});

When('I enter {string} in the New PIN field', async (pin: string) => {
  await element(by.id('new-pin-input')).typeText(pin);
});

When('I enter {string} in the Confirm PIN field', async (pin: string) => {
  await element(by.id('confirm-new-pin-input')).typeText(pin);
});

When('I tap the {string} button', async (buttonName: string) => {
  const testID = buttonName.toLowerCase().replace(/\s+/g, '-') + '-button';
  await element(by.id(testID)).tap();
});

Then('I should see a success message {string}', async (message: string) => {
  await waitFor(element(by.text(message)))
    .toBeVisible()
    .withTimeout(2000);
});

Then(
  'I should be navigated back to the Settings screen after {int} seconds',
  async (seconds: number) => {
    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout((seconds + 1) * 1000);
  }
);

Then('I should see an error {string}', async (errorMessage: string) => {
  await waitFor(element(by.text(errorMessage)))
    .toBeVisible()
    .withTimeout(2000);
});

Then('the {string} button should be disabled', async (buttonName: string) => {
  const testID = buttonName.toLowerCase().replace(/\s+/g, '-') + '-button';
  await detoxExpect(element(by.id(testID))).toHaveToggleValue(false); // Disabled state
});

Then('I should see {string}', async (text: string) => {
  await waitFor(element(by.text(text)))
    .toBeVisible()
    .withTimeout(2000);
});

// Accessibility steps
When('I enable VoiceOver', async () => {
  if (device.getPlatform() === 'ios') {
    await device.enableAccessibility();
  }
});

When('I focus on the Current PIN field', async () => {
  await element(by.id('current-pin-input')).tap();
});

When('I focus on the New PIN field', async () => {
  await element(by.id('new-pin-input')).tap();
});

When('I focus on the Confirm PIN field', async () => {
  await element(by.id('confirm-new-pin-input')).tap();
});

Then('I should hear {string}', async (accessibilityLabel: string) => {
  // Detox accessibility label assertion
  await detoxExpect(element(by.label(accessibilityLabel))).toExist();
});
```

### Page Object Model (Optional but Recommended)

```typescript
// e2e/page-objects/ChangePINScreen.ts

import { by, element, waitFor } from 'detox';

export class ChangePINScreen {
  // Selectors
  private screen = element(by.id('change-pin-screen'));
  private currentPINInput = element(by.id('current-pin-input'));
  private newPINInput = element(by.id('new-pin-input'));
  private confirmPINInput = element(by.id('confirm-new-pin-input'));
  private submitButton = element(by.id('change-pin-submit-button'));
  private successMessage = element(by.id('success-message'));
  private errorMessage = (message: string) => element(by.text(message));

  // Actions
  async waitForScreen() {
    await waitFor(this.screen).toBeVisible().withTimeout(2000);
  }

  async enterCurrentPIN(pin: string) {
    await this.currentPINInput.typeText(pin);
  }

  async enterNewPIN(pin: string) {
    await this.newPINInput.typeText(pin);
  }

  async enterConfirmPIN(pin: string) {
    await this.confirmPINInput.typeText(pin);
  }

  async tapSubmit() {
    await this.submitButton.tap();
  }

  async changePIN(currentPIN: string, newPIN: string) {
    await this.enterCurrentPIN(currentPIN);
    await this.enterNewPIN(newPIN);
    await this.enterConfirmPIN(newPIN);
    await this.tapSubmit();
  }

  // Assertions
  async expectSuccessMessage(message: string) {
    await waitFor(element(by.text(message)))
      .toBeVisible()
      .withTimeout(2000);
  }

  async expectErrorMessage(message: string) {
    await waitFor(this.errorMessage(message)).toBeVisible().withTimeout(2000);
  }

  async expectSubmitButtonDisabled() {
    await expect(this.submitButton).toHaveToggleValue(false);
  }
}
```

---

## Test Execution

### Run E2E Tests

```bash
# Build iOS app for Detox
yarn detox:ios:build

# Run Change PIN tests only
DETOX_CONFIGURATION=ios.sim.debug npx cucumber-js e2e/features/change-pin.feature

# Run with specific tag
DETOX_CONFIGURATION=ios.sim.debug npx cucumber-js --tags "@change-pin and @smoke"

# Run all Change PIN tests
yarn detox:ios:test --grep "Change PIN"
```

---

## Dependencies

- Detox
- Cucumber
- `@cucumber/cucumber`

---

## Definition of Done

- [ ] Feature file created with all scenarios
- [ ] Step definitions implemented
- [ ] Page object model created (optional)
- [ ] All scenarios passing on iOS
- [ ] Accessibility scenarios tested
- [ ] Rate limiting scenarios tested
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-040](../stories/US-040-change-pin.md), [TASK-232](TASK-232-change-pin-ui.md), [TASK-236](TASK-236-change-pin-rntl-tests.md)
