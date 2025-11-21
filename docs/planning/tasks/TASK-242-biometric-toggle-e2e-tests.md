# TASK-242: Biometric Toggle E2E Tests (Detox + Cucumber)

**ID**: TASK-242 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-041](../stories/US-041-toggle-biometric-auth.md)
**Status**: 📋 To Do | **Effort**: 0.5h

---

## Task Description

Write end-to-end tests for the Biometric Toggle feature using Detox and Cucumber. Test navigation, toggle interaction, biometric capability detection, and accessibility on real devices.

---

## Acceptance Criteria

- [ ] Feature file created at `e2e/features/biometric-toggle.feature`
- [ ] Step definitions created at `e2e/step-definitions/biometric-toggle.steps.ts`
- [ ] Navigation to Biometric Settings tested
- [ ] Toggle switch interaction tested
- [ ] Success message tested
- [ ] Accessibility tested (VoiceOver/TalkBack)
- [ ] All scenarios passing on iOS

**Note**: Real biometric authentication testing (Face ID/Touch ID prompts) cannot be automated with Detox and must be tested manually on physical devices.

---

## Implementation Details

### Feature File

```gherkin
# e2e/features/biometric-toggle.feature

@biometric-toggle
Feature: Biometric Authentication Toggle

  As a user
  I want to enable or disable biometric authentication
  So that I can control how I unlock the app

  Background:
    Given I am logged in
    And I am on the Settings screen

  @smoke @ios
  Scenario: View biometric toggle screen with FaceID available
    When I tap the "Biometric Authentication" option
    Then I should see the Biometric Toggle screen
    And I should see "Biometric Authentication" as the header
    And I should see "Available" status
    And I should see the biometric toggle switch

  @mock @ios @android
  Scenario: Toggle biometric on (mocked)
    Given biometric authentication is mocked as available
    When I tap the "Biometric Authentication" option
    And I tap the biometric toggle switch
    Then I should see "Face ID enabled successfully"

  @mock @ios @android
  Scenario: Toggle biometric off (mocked)
    Given biometric authentication is mocked as available
    And biometric authentication is currently enabled
    When I tap the "Biometric Authentication" option
    And I tap the biometric toggle switch
    Then I should see "Face ID disabled successfully"

  @accessibility @ios
  Scenario: VoiceOver support for biometric toggle
    When I enable VoiceOver
    And I tap the "Biometric Authentication" option
    And I focus on the biometric toggle switch
    Then I should hear "Face ID toggle. Switch."
    When I focus on the header
    Then I should hear "Biometric Authentication. Header."
```

### Step Definitions

```typescript
// e2e/step-definitions/biometric-toggle.steps.ts

import { Given, When, Then } from '@cucumber/cucumber';
import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

When('I tap the {string} option', async (option: string) => {
  const testID = option.toLowerCase().replace(/\s+/g, '-') + '-option';
  await element(by.id(testID)).tap();
});

Then('I should see the Biometric Toggle screen', async () => {
  await waitFor(element(by.id('biometric-toggle-screen')))
    .toBeVisible()
    .withTimeout(2000);
});

Then('I should see {string} as the header', async (headerText: string) => {
  await waitFor(element(by.text(headerText)))
    .toBeVisible()
    .withTimeout(2000);
});

Then('I should see {string} status', async (status: string) => {
  await waitFor(element(by.text(status)))
    .toBeVisible()
    .withTimeout(2000);
});

Then('I should see the biometric toggle switch', async () => {
  await waitFor(element(by.id('biometric-toggle-switch')))
    .toBeVisible()
    .withTimeout(2000);
});

Given('biometric authentication is mocked as available', async () => {
  // This requires mocking in the app code
  // For now, we assume the app is running with E2E_MOCK=true
});

Given('biometric authentication is currently enabled', async () => {
  // Pre-condition: biometric should be enabled before this scenario
  // This may require setting up state or using app-specific commands
});

When('I tap the biometric toggle switch', async () => {
  await element(by.id('biometric-toggle-switch')).tap();
});

Then('I should see {string}', async (message: string) => {
  await waitFor(element(by.text(message)))
    .toBeVisible()
    .withTimeout(2000);
});

// Accessibility steps
When('I enable VoiceOver', async () => {
  if (device.getPlatform() === 'ios') {
    await device.enableAccessibility();
  }
});

When('I focus on the biometric toggle switch', async () => {
  await element(by.id('biometric-toggle-switch')).tap();
});

When('I focus on the header', async () => {
  await element(by.text('Biometric Authentication')).tap();
});

Then('I should hear {string}', async (accessibilityLabel: string) => {
  // Detox accessibility label assertion
  await detoxExpect(element(by.label(accessibilityLabel))).toExist();
});
```

---

## Manual Testing Requirements

Since Detox cannot trigger real biometric prompts (Face ID/Touch ID), the following scenarios **must be tested manually** on physical devices:

### Manual Test: Enable Biometric with Real Authentication

**Steps**:

1. Navigate to Settings > Biometric Authentication
2. Toggle biometric switch ON
3. Authenticate with Face ID/Touch ID when prompted
4. Verify success message appears
5. Verify toggle remains ON

**Expected**:

- Biometric prompt appears (Face ID animation or Touch ID sensor prompt)
- After successful authentication, "Face ID enabled successfully" message appears
- Toggle switch remains in ON position

### Manual Test: Biometric Authentication on Login

**Steps**:

1. Enable biometric authentication (as above)
2. Log out of the app
3. Reopen the app
4. Verify biometric prompt appears automatically

**Expected**:

- Face ID/Touch ID prompt appears without needing to enter PIN
- After successful authentication, user is logged in

### Manual Test: Disable Biometric

**Steps**:

1. Navigate to Settings > Biometric Authentication
2. Toggle biometric switch OFF
3. Verify success message appears

**Expected**:

- "Face ID disabled successfully" message appears
- Toggle switch moves to OFF position
- No biometric prompt appears on next login

---

## Test Execution

### Run E2E Tests

```bash
# Build iOS app for Detox
yarn detox:ios:build

# Run biometric toggle tests
DETOX_CONFIGURATION=ios.sim.debug npx cucumber-js e2e/features/biometric-toggle.feature

# Run with mock biometric
E2E_MOCK=true yarn detox:ios:test --grep "biometric-toggle"
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
- [ ] All automated scenarios passing on iOS
- [ ] Manual testing procedures documented
- [ ] Accessibility scenarios tested
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-041](../stories/US-041-toggle-biometric-auth.md), [TASK-238](TASK-238-biometric-toggle-ui.md), [TASK-241](TASK-241-biometric-toggle-rntl-tests.md)
