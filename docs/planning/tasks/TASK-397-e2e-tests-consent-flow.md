# TASK-397: E2E Tests for Consent Flow

**Task ID**: TASK-397
**Title**: E2E Tests for Consent Flow
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**User Story**: [US-073: Privacy Settings & Re-consent Flow](../stories/US-073-privacy-settings-reconsent.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-09
**Assigned To**: Warren de Leon
**Category**: Testing

---

## Overview

Create Detox + Cucumber E2E tests for the complete consent flow, including first launch, consent acceptance, settings toggle, and re-consent scenarios.

---

## Technical Details

### Feature File

**`e2e/features/consent.feature`**:

```gherkin
Feature: Consent Management
  As a user
  I want to control my privacy preferences
  So that I can decide what data the app collects

  Background:
    Given the app is launched

  @consent @first-launch
  Scenario: First launch shows consent screen
    Given the app is freshly installed
    When the app launches
    Then I should see the consent screen
    And the analytics toggle should be OFF
    And the continue button should be disabled

  @consent @accept-terms
  Scenario: User accepts terms without analytics
    Given I am on the consent screen
    When I check the terms acceptance checkbox
    Then the continue button should be enabled
    When I tap the continue button
    Then I should see the home screen

  @consent @accept-with-analytics
  Scenario: User accepts terms with analytics enabled
    Given I am on the consent screen
    When I toggle analytics ON
    And I check the terms acceptance checkbox
    And I tap the continue button
    Then I should see the home screen
    And analytics should be enabled

  @consent @legal-documents
  Scenario: User can view legal documents from consent screen
    Given I am on the consent screen
    When I tap "Terms & Conditions"
    Then I should see the terms and conditions screen
    When I go back
    Then I should see the consent screen
    When I tap "Privacy Policy"
    Then I should see the privacy policy screen

  @consent @settings
  Scenario: User can toggle analytics in settings
    Given I have accepted terms
    And I am on the home screen
    When I navigate to Settings
    And I scroll to the Privacy section
    Then I should see the analytics toggle
    When I toggle analytics OFF
    Then analytics should be disabled

  @consent @re-consent
  Scenario: User sees consent screen when terms updated
    Given I have previously accepted terms version "2025.1"
    And the current terms version is "2025.2"
    When the app launches
    Then I should see the consent screen
    And I should see "We've Updated Our Policies" message
```

### Step Definitions

**`e2e/steps/consent.cucumber.tsx`**:

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { by, device, element, expect } from 'detox';

Given('the app is freshly installed', async () => {
  await device.uninstallApp();
  await device.installApp();
  await device.launchApp({ newInstance: true });
});

Given('I am on the consent screen', async () => {
  await expect(element(by.id('consent-screen'))).toBeVisible();
});

Given('I have accepted terms', async () => {
  // Check terms checkbox and continue
  await element(by.id('terms-checkbox')).tap();
  await element(by.id('continue-button')).tap();
  await expect(element(by.id('home-screen'))).toBeVisible();
});

When('I check the terms acceptance checkbox', async () => {
  await element(by.id('terms-checkbox')).tap();
});

When('I toggle analytics ON', async () => {
  await element(by.id('analytics-toggle')).tap();
});

When('I toggle analytics OFF', async () => {
  await element(by.id('settings-analytics-toggle')).tap();
});

When('I tap the continue button', async () => {
  await element(by.id('continue-button')).tap();
});

When('I tap {string}', async (linkText: string) => {
  if (linkText === 'Terms & Conditions') {
    await element(by.id('terms-link')).tap();
  } else if (linkText === 'Privacy Policy') {
    await element(by.id('privacy-link')).tap();
  }
});

When('I scroll to the Privacy section', async () => {
  await element(by.id('settings-scroll')).scroll(200, 'down');
});

Then('I should see the consent screen', async () => {
  await expect(element(by.id('consent-screen'))).toBeVisible();
});

Then('the analytics toggle should be OFF', async () => {
  const toggle = element(by.id('analytics-toggle'));
  await expect(toggle).toHaveValue('off'); // Or check accessibility state
});

Then('the continue button should be disabled', async () => {
  await expect(element(by.id('continue-button'))).toHaveAccessibilityState({ disabled: true });
});

Then('the continue button should be enabled', async () => {
  await expect(element(by.id('continue-button'))).toHaveAccessibilityState({ disabled: false });
});

Then('I should see the home screen', async () => {
  await expect(element(by.id('home-screen'))).toBeVisible();
});

Then('I should see the terms and conditions screen', async () => {
  await expect(element(by.id('terms-screen'))).toBeVisible();
});

Then('I should see the privacy policy screen', async () => {
  await expect(element(by.id('privacy-screen'))).toBeVisible();
});

Then('analytics should be enabled', async () => {
  // Verify via app state or mock verification
});

Then('analytics should be disabled', async () => {
  // Verify via app state or mock verification
});

Then('I should see {string} message', async (message: string) => {
  await expect(element(by.text(message))).toBeVisible();
});
```

---

## Files to Create

| File                             | Purpose           |
| -------------------------------- | ----------------- |
| `e2e/features/consent.feature`   | Gherkin scenarios |
| `e2e/steps/consent.cucumber.tsx` | Step definitions  |

---

## Acceptance Criteria

- [ ] E2E test for first launch consent screen
- [ ] E2E test for accepting terms without analytics
- [ ] E2E test for accepting terms with analytics
- [ ] E2E test for viewing legal documents
- [ ] E2E test for settings analytics toggle
- [ ] E2E test for re-consent when terms updated
- [ ] All tests pass on iOS simulator
- [ ] All tests pass on Android emulator (if applicable)
- [ ] `yarn detox:ios:test -f "consent"` passes
- [ ] Tests added to CI pipeline

---

## Test Scenarios

| Scenario                 | Complexity | Est. Time |
| ------------------------ | ---------- | --------- |
| First launch             | Low        | 30s       |
| Accept without analytics | Low        | 30s       |
| Accept with analytics    | Medium     | 45s       |
| View legal documents     | Medium     | 45s       |
| Settings toggle          | Medium     | 45s       |
| Re-consent flow          | High       | 60s       |

**Total Suite Time**: ~4-5 minutes

---

## Dependencies

**Blocked By**: TASK-393, TASK-394, TASK-395

**Blocks**: None

---

## Notes

**Fresh Install Testing**:
The `uninstallApp()` and `installApp()` approach ensures a truly fresh state for testing first-launch scenarios.

**Re-consent Testing**:
Testing the re-consent flow requires either:

1. Modifying app state/storage to simulate old version
2. Using a test build with overridden version constants

**Analytics Verification**:
Since we can't directly verify PostHog/Sentry calls in E2E, we can:

1. Verify toggle state changes
2. Use mock verification if available
3. Check that no errors occur when toggling

---

**Last Updated**: 2025-12-09
