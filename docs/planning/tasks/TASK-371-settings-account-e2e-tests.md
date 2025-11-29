# TASK-371: Settings Account E2E Tests

**ID**: TASK-371 | **Title**: Write Detox + Cucumber E2E Tests for Settings Account
**User Story**: [US-061](../stories/US-061-settings-account-section.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: Medium | **Effort**: 2h
**Created**: 2025-11-29 | **Assignee**: Warren de Leon

---

## Context & Background

End-to-end tests validate the complete Settings Account flow including viewing account information, editing profile details, and signing out. These tests run on actual simulators to catch integration issues that unit tests cannot detect.

---

## Objective

Write comprehensive E2E tests for:

1. Account section visibility (authenticated vs unauthenticated)
2. User card display (name, email, avatar)
3. Navigation to EditAccountScreen
4. Profile editing (first name, last name, phone number)
5. Save functionality
6. Sign out flow with confirmation

---

## Feature File

**File**: `e2e/features/auth/settings-account.feature`

```gherkin
Feature: Settings Account Section

  Background:
    Given I am logged in as a registered user
    And I navigate to "Settings" screen

  @smoke @settings @account @ios @android
  Scenario: View account section when authenticated
    Then I should see the account section
    And I should see my name displayed
    And I should see my email displayed
    And I should see the "Sign Out" button

  @settings @account @navigation
  Scenario: Navigate to Edit Account screen
    When I tap on the user card
    Then I should be navigated to "EditAccount" screen
    And I should see my first name in the input field
    And I should see my last name in the input field
    And I should see my email displayed (read-only)

  @settings @account @edit
  Scenario: Edit first name successfully
    When I tap on the user card
    And I clear the first name field
    And I enter "UpdatedFirst" in the first name field
    And I tap the "Save" button
    Then I should be navigated back to "Settings" screen
    And I should see "UpdatedFirst" in the user card

  @settings @account @edit
  Scenario: Edit last name successfully
    When I tap on the user card
    And I clear the last name field
    And I enter "UpdatedLast" in the last name field
    And I tap the "Save" button
    Then I should be navigated back to "Settings" screen

  @settings @account @edit @phone
  Scenario: Edit phone number with country selector
    When I tap on the user card
    And I tap on the country code selector
    Then I should see the country picker screen
    When I select "United States" from the country list
    Then I should see "+1" as the country code
    When I enter "5551234567" in the phone number field
    And I tap the "Save" button
    Then I should be navigated back to "Settings" screen

  @settings @account @validation
  Scenario: Save button disabled when no changes made
    When I tap on the user card
    Then the "Save" button should be disabled
    When I modify the first name field
    Then the "Save" button should be enabled

  @settings @logout @smoke
  Scenario: Sign out with confirmation
    When I tap the "Sign Out" button
    Then I should see a confirmation alert
    When I tap "Sign Out" on the alert
    Then I should be navigated to "Home" screen
    And I should not be logged in

  @settings @logout
  Scenario: Cancel sign out
    When I tap the "Sign Out" button
    Then I should see a confirmation alert
    When I tap "Cancel" on the alert
    Then I should still be on "Settings" screen
    And I should still see my account information

  @settings @account @unauthenticated
  Scenario: View account section when not authenticated
    Given I am not logged in
    When I navigate to "Settings" screen
    Then I should see "Sign In / Create Account" button
    And I should not see the user card
    When I tap "Sign In / Create Account"
    Then I should be navigated to "Login" screen
```

---

## Step Definitions

**File**: `e2e/step-definitions/settings-account.steps.ts`

### Key Steps to Implement

```typescript
// Navigation steps
Given('I navigate to {string} screen', async (screenName: string) => {
  // Navigate via tab bar or direct navigation
});

// Account section visibility
Then('I should see the account section', async () => {
  await expect(element(by.id('settings-account-section'))).toBeVisible();
});

Then('I should see my name displayed', async () => {
  await expect(element(by.id('user-card-name'))).toBeVisible();
});

// Edit account interactions
When('I tap on the user card', async () => {
  await element(by.id('settings-user-card')).tap();
});

When('I clear the first name field', async () => {
  await element(by.id('first-name-input')).clearText();
});

When('I enter {string} in the first name field', async (text: string) => {
  await element(by.id('first-name-input')).typeText(text);
});

// Country selector
When('I tap on the country code selector', async () => {
  await element(by.id('country-code-selector')).tap();
});

Then('I should see the country picker screen', async () => {
  await expect(element(by.id('country-picker-screen'))).toBeVisible();
});

// Sign out flow
When('I tap the {string} button', async (buttonText: string) => {
  await element(by.id(`${buttonText.toLowerCase().replace(' ', '-')}-button`)).tap();
});

Then('I should see a confirmation alert', async () => {
  await expect(element(by.text('Sign Out'))).toBeVisible();
});
```

---

## Test IDs Required

Ensure these test IDs exist in the components:

| Component                | Test ID                    |
| ------------------------ | -------------------------- |
| Settings Account Section | `settings-account-section` |
| User Card (Settings)     | `settings-user-card`       |
| User Card Name           | `user-card-name`           |
| User Card Email          | `user-card-email`          |
| Sign Out Button          | `logout-button`            |
| Sign In Button           | `sign-in-button`           |
| Edit Account Screen      | `edit-account-screen`      |
| First Name Input         | `first-name-input`         |
| Last Name Input          | `last-name-input`          |
| Phone Number Input       | `phone-number-input`       |
| Country Code Selector    | `country-code-selector`    |
| Save Button              | `save-button`              |
| Email Display            | `email-display`            |

---

## Dependencies

- TASK-340 (EditAccountScreen) - must be complete
- TASK-341 (RNTL Tests) - should be complete for test ID alignment
- Authenticated test user with valid credentials

---

## Acceptance Criteria

- [ ] Feature file created with all scenarios
- [ ] Step definitions implemented
- [ ] All test IDs present in components
- [ ] Tests pass on iOS simulator
- [ ] Tests pass on Android emulator
- [ ] Smoke tests tagged appropriately

---

## Definition of Done

- [ ] Feature file committed: `e2e/features/auth/settings-account.feature`
- [ ] Step definitions committed: `e2e/step-definitions/settings-account.steps.ts`
- [ ] All scenarios passing locally
- [ ] `yarn detox:ios:test` passes
- [ ] No flaky tests

---

**Last Updated**: 2025-11-29
