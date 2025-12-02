# TASK-231: Biometric Re-Auth E2E Tests

**ID**: TASK-231 | **Title**: Write Detox + Cucumber E2E Tests for Biometric Re-Authentication
**User Story**: [US-039](../stories/US-039-biometric-reauth.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: Medium | **Effort**: 0.5h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## Objective

Write E2E tests for biometric re-authentication flow using Detox + Cucumber.

---

## Feature File

**File**: `src/features/Auth/__tests__/BiometricReauth.feature`

```gherkin
Feature: Biometric Re-Authentication After App Background

  Background:
    Given I am logged in
    And biometric authentication is enabled

  @smoke @biometric @ios
  Scenario: Successful Face ID re-authentication after 30 minutes
    Given the app is in the foreground
    When I background the app
    And I wait for 31 minutes (simulated)
    And I foreground the app
    Then I should see the "BiometricPrompt" screen
    When I approve the Face ID prompt
    Then I should be navigated to "Home" screen

  @biometric @failure
  Scenario: Failed biometric authentication (3 attempts)
    When I background the app
    And I wait for 31 minutes (simulated)
    And I foreground the app
    When I reject the Face ID prompt
    Then I should see error "Authentication failed. 2 attempts remaining"
    When I tap "Try Again"
    And I reject the Face ID prompt again
    Then I should see error "Authentication failed. 1 attempts remaining"
    When I tap "Try Again"
    And I reject the Face ID prompt again
    Then I should see error "Too many failed attempts"
    And I should be navigated to "Login" screen after 2 seconds

  @pin @fallback
  Scenario: PIN re-authentication (biometrics unavailable)
    Given biometrics are NOT available on the device
    When I background the app
    And I wait for 31 minutes (simulated)
    And I foreground the app
    Then I should see the "PINPrompt" screen
    When I enter PIN "123456"
    Then I should be navigated to "Home" screen
```

---

## Step Definitions

**File**: `src/features/Auth/__tests__/biometricReauth.cucumber.tsx`

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect, element, by, waitFor, device } from 'detox';

When('I background the app', async () => {
  await device.sendToHome();
});

When('I wait for {int} minutes \\(simulated\\)', async (minutes: number) => {
  // In E2E, we can't actually wait 31 minutes
  // Instead, mock the background timestamp
  console.log(`Simulating ${minutes} minutes in background`);
});

When('I foreground the app', async () => {
  await device.launchApp({ newInstance: false });
});

When('I approve the Face ID prompt', async () => {
  await device.biometrics.setBiometricEnrollment(true);
  await device.biometrics.matchFace();
});

When('I reject the Face ID prompt', async () => {
  await device.biometrics.unmatchFace();
});
```

---

## Acceptance Criteria

- [ ] All scenarios pass on iOS simulator
- [ ] Background time simulation working
- [ ] Biometric prompt simulation working
- [ ] All error states tested

---

## Definition of Done

- [ ] Feature file created
- [ ] Step definitions implemented
- [ ] All scenarios passing
- [ ] Tests reliable

---

**Dependencies**: TASK-227, TASK-228, TASK-229

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 0.5 hours
