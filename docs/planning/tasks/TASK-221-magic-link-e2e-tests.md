# TASK-221: Magic Link E2E Tests

**ID**: TASK-221 | **Title**: Write Detox + Cucumber E2E Tests for Magic Link Flow
**User Story**: [US-037](../stories/US-037-magic-link-login.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: Medium | **Effort**: 2h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## Objective

Write E2E tests for complete magic link flow using Detox + Cucumber.

---

## Feature File

**File**: `src/features/Auth/__tests__/MagicLink.feature`

```gherkin
Feature: Magic Link Login

  Background:
    Given I am on the "Login" screen

  @smoke @magiclink @ios @android
  Scenario: Successful magic link login
    When I tap "Magic Link" tab
    And I enter email "testuser@example.com" in magic link form
    And I tap "Send Magic Link" button
    Then I should see success message "Check your email!"
    When I simulate magic link tap with valid tokens
    Then I should be navigated to "Home" screen within 3 seconds

  @magiclink @validation
  Scenario: Invalid email in magic link form
    When I tap "Magic Link" tab
    And I enter email "invalid-email" in magic link form
    And I tap outside the field
    Then I should see error "Please enter a valid email address"

  @magiclink @resend
  Scenario: Resend magic link after 60 seconds
    When I tap "Magic Link" tab
    And I enter email "testuser@example.com" in magic link form
    And I tap "Send Magic Link" button
    Then I should see success message
    And I should see resend countdown "Resend in 60s..."
    When I wait for 60 seconds
    Then I should see enabled "Resend" button

  @magiclink @error
  Scenario: Invalid magic link (malformed URL)
    When I tap "Magic Link" tab
    And I simulate magic link tap with invalid URL
    Then I should see error "Invalid login link"

  @magiclink @error
  Scenario: Network error during magic link send
    Given network is disconnected
    When I tap "Magic Link" tab
    And I enter email "testuser@example.com" in magic link form
    And I tap "Send Magic Link" button
    Then I should see error "Network error"
```

---

## Step Definitions

**File**: `src/features/Auth/__tests__/magicLink.cucumber.tsx`

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect, element, by, waitFor, device } from 'detox';

When('I tap {string} tab', async (tabName: string) => {
  const tabId = tabName.toLowerCase().replace(/\s+/g, '') + '-tab';
  await element(by.id(tabId)).tap();
});

When('I enter email {string} in magic link form', async (email: string) => {
  await element(by.id('magiclink-email-input')).typeText(email);
});

Then('I should see success message {string}', async (message: string) => {
  await waitFor(element(by.text(message)))
    .toBeVisible()
    .withTimeout(2000);
});

When('I simulate magic link tap with valid tokens', async () => {
  const deepLinkURL =
    'warrendeleon://login?access_token=mock_access&refresh_token=mock_refresh&type=magiclink';
  await device.openURL({ url: deepLinkURL });
});

When('I simulate magic link tap with invalid URL', async () => {
  const deepLinkURL = 'warrendeleon://login?invalid=params';
  await device.openURL({ url: deepLinkURL });
});

Then('I should see resend countdown {string}', async (text: string) => {
  await waitFor(element(by.text(text)))
    .toBeVisible()
    .withTimeout(1000);
});

When('I wait for {int} seconds', async (seconds: number) => {
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
});

Then('I should see enabled {string} button', async (buttonText: string) => {
  const buttonId = buttonText.toLowerCase().replace(/\s+/g, '-') + '-button';
  await expect(element(by.id(buttonId))).toBeVisible();
});
```

---

## Acceptance Criteria

- [ ] All scenarios pass on iOS simulator
- [ ] Deep link simulation working
- [ ] All error states tested
- [ ] Resend functionality tested

---

## Definition of Done

- [ ] Feature file created
- [ ] Step definitions implemented
- [ ] All scenarios passing
- [ ] Tests reliable (no flaky failures)

---

**Dependencies**:

- TASK-218, TASK-219, TASK-220 complete

**Next Task**: [TASK-222](TASK-222-token-refresh-interceptor.md) - Token Refresh Interceptor (US-038)

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 2 hours
