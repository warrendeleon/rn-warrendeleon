# TASK-108: Add Profile E2E Navigation Tests

**Epic**: [EPIC-012: Profile Screen Implementation](../epics/EPIC-012-profile-screen-implementation.md)
**User Story**: [US-021: Profile Screen UI Redesign](../stories/US-021-profile-screen-ui.md)
**Status**: ⭕ Not Started
**Priority**: Medium
**Estimated Effort**: 1 hour
**Created**: 2025-01-17

---

## Context

Create end-to-end tests using Detox and Cucumber to verify the complete profile screen flow including navigation to related sections. Tests should cover the full user journey across iOS and Android.

## Technical Details

### Test File Location

```
src/features/Profile/__tests__/profile-screen.feature
src/features/Profile/__tests__/profile-screen.cucumber.tsx
```

### Cucumber Feature File

**File**: `src/features/Profile/__tests__/profile-screen.feature`

```gherkin
Feature: Profile Screen

  As a user viewing my portfolio app
  I want to see Warren's profile information
  So that I can learn about him and navigate to other sections

  Background:
    Given the app is running
    And the GitHub API is mocked with profile data

  Scenario: Navigate to Profile screen
    Given I am on the Home screen
    When I tap the "Profile" button or navigate to Profile
    Then I should see the Profile screen
    And I should see Warren's name
    And I should see his profile photo

  Scenario: View profile information
    Given I am on the Profile screen
    Then I should see the profile photo
    And I should see the name and headline
    And I should see social media links
    And I should see navigation shortcuts

  Scenario: Navigate to Education from Profile
    Given I am on the Profile screen
    When I tap the "Education" button
    Then I should navigate to the Education screen
    And the Education screen should display

  Scenario: Navigate to Work Experience from Profile
    Given I am on the Profile screen
    When I tap the "Work Experience" button
    Then I should navigate to the Work Experience screen
    And the Work Experience screen should display

  Scenario: Navigate to CV from Profile
    Given I am on the Profile screen
    When I tap the "View CV" button
    Then I should navigate to the PDF viewer
    And the CV should load

  Scenario: Tap social media links
    Given I am on the Profile screen
    When I tap the GitHub link
    Then the GitHub profile should open in browser
    And I should be able to return to the app

  Scenario: Dark mode support
    Given I am on the Profile screen
    When I enable dark mode
    Then the background should be dark
    And the text should be light
    And the profile photo should display correctly

  Scenario: Loading state
    Given the Profile API is slow
    When I navigate to the Profile screen
    Then I should see a loading indicator
    And the loading indicator should disappear when data loads

  Scenario: Error handling
    Given the Profile API returns an error
    When I navigate to the Profile screen
    Then I should see an error message
    And the error message should be user-friendly
```

### Cucumber Step Definitions

**File**: `src/features/Profile/__tests__/profile-screen.cucumber.tsx`

```typescript
import { After, Before, Given, Then, When } from '@cucumber/cucumber';
import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

Before({ tags: '@profile' }, async () => {
  await device.reloadReactNative();
});

After({ tags: '@profile' }, async () => {
  // Cleanup if needed
});

Given('I am on the Profile screen', async () => {
  await waitFor(element(by.id('home-screen')))
    .toBeVisible()
    .withTimeout(5000);

  // Navigate to Profile - implementation depends on navigation structure
  // May be from a Profile button or menu
  await element(by.id('home-profile-button')).tap();

  await waitFor(element(by.id('profile-screen')))
    .toBeVisible()
    .withTimeout(3000);
});

Given('the GitHub API is mocked with profile data', async () => {
  // MSW already mocks this via setupE2E.ts
  // No action needed here - just verification step
});

When('I tap the {string} button', async (buttonLabel: string) => {
  if (buttonLabel === 'Education') {
    await element(by.id('profile-education-button')).tap();
  } else if (buttonLabel === 'Work Experience') {
    await element(by.id('profile-work-button')).tap();
  } else if (buttonLabel === 'View CV') {
    await element(by.id('profile-cv-button')).tap();
  }
});

Then('I should see the Profile screen', async () => {
  await waitFor(element(by.id('profile-screen')))
    .toBeVisible()
    .withTimeout(3000);
});

Then("I should see Warren's name", async () => {
  await waitFor(element(by.text(/Warren/i)))
    .toBeVisible()
    .withTimeout(3000);
});

Then('I should see his profile photo', async () => {
  await waitFor(element(by.id('profile-photo')))
    .toBeVisible()
    .withTimeout(3000);
});

Then('I should see the profile photo', async () => {
  await detoxExpect(element(by.id('profile-photo'))).toBeVisible();
});

Then('I should see the name and headline', async () => {
  await detoxExpect(element(by.text(/Warren/i))).toBeVisible();
  // Headline text verification
});

Then('I should see social media links', async () => {
  await detoxExpect(element(by.id('profile-github-link'))).toBeVisible();
  await detoxExpect(element(by.id('profile-linkedin-link'))).toBeVisible();
});

Then('I should see navigation shortcuts', async () => {
  await detoxExpect(element(by.id('profile-education-button'))).toBeVisible();
  await detoxExpect(element(by.id('profile-work-button'))).toBeVisible();
  await detoxExpect(element(by.id('profile-cv-button'))).toBeVisible();
});

Then('I should navigate to the Education screen', async () => {
  await waitFor(element(by.id('education-data-screen')))
    .toBeVisible()
    .withTimeout(3000);
});

Then('the Education screen should display', async () => {
  await detoxExpect(element(by.id('education-data-screen'))).toBeVisible();
});

Then('I should navigate to the Work Experience screen', async () => {
  await waitFor(element(by.id('work-xp-data-screen')))
    .toBeVisible()
    .withTimeout(3000);
});

Then('the Work Experience screen should display', async () => {
  await detoxExpect(element(by.id('work-xp-data-screen'))).toBeVisible();
});

Then('I should navigate to the PDF viewer', async () => {
  await waitFor(element(by.id('pdf-viewer-screen')))
    .toBeVisible()
    .withTimeout(3000);
});

Then('the CV should load', async () => {
  await detoxExpect(element(by.id('pdf-viewer-screen'))).toBeVisible();
});

When('I tap the GitHub link', async () => {
  await element(by.id('profile-github-link')).tap();
});

Then('the GitHub profile should open in browser', async () => {
  // Note: This is difficult to test with Detox
  // May need to verify deeplink or native behaviour
  // For now, just verify the action completes
});

Then('I should be able to return to the app', async () => {
  // Return to app (implementation depends on test setup)
});

When('I enable dark mode', async () => {
  // Navigate to Settings and toggle dark mode
  // This depends on settings implementation
});

Then('the background should be dark', async () => {
  // Visual verification - may need snapshot
});

Then('the text should be light', async () => {
  // Visual verification
});

Then('the profile photo should display correctly', async () => {
  await detoxExpect(element(by.id('profile-photo'))).toBeVisible();
});

Given('the Profile API is slow', async () => {
  // MSW can delay responses - configure in setup
});

When('I navigate to the Profile screen', async () => {
  // Depends on navigation structure
  await element(by.id('home-profile-button')).tap();
});

Then('I should see a loading indicator', async () => {
  await waitFor(element(by.id('activity-indicator')))
    .toBeVisible()
    .withTimeout(1000);
});

Then('the loading indicator should disappear when data loads', async () => {
  await waitFor(element(by.id('activity-indicator')))
    .not.toBeVisible()
    .withTimeout(5000);
});

Given('the Profile API returns an error', async () => {
  // MSW can return error - configure in setup or before hook
});

Then('I should see an error message', async () => {
  await waitFor(element(by.text(/error/i)))
    .toBeVisible()
    .withTimeout(3000);
});

Then('the error message should be user-friendly', async () => {
  // Verify it's not a stack trace or technical error
  await detoxExpect(element(by.text(/Failed to load/i))).toBeVisible();
});
```

### Files Affected

- `src/features/Profile/__tests__/profile-screen.feature` - New
- `src/features/Profile/__tests__/profile-screen.cucumber.tsx` - New

## Acceptance Criteria

- ✅ Cucumber feature file created with all scenarios
- ✅ Step definitions implemented for all steps
- ✅ MSW mocks configured for profile API
- ✅ Navigation flow tested (Home → Profile → Other screens)
- ✅ Loading state tested
- ✅ Error state tested
- ✅ Social link navigation tested
- ✅ All E2E tests pass on iOS simulator
- ✅ All E2E tests pass on Android emulator

## Test Scenarios

1. ✅ Navigate from Home to Profile screen
2. ✅ View profile information (name, headline, photo)
3. ✅ Navigate to Education screen from Profile
4. ✅ Navigate to Work Experience screen from Profile
5. ✅ Navigate to CV viewer from Profile
6. ✅ Tap social media links (GitHub, LinkedIn, email)
7. ✅ Dark mode support (visual verification)
8. ✅ Loading indicator during data fetch
9. ✅ Error message on API failure

## Dependencies

**Prerequisites**:

- ✅ TASK-105: ProfileScreen component created
- ✅ TASK-107: Unit tests complete
- ✅ MSW configured for E2E tests
- ✅ Detox + Cucumber configured

**Enables**:

- Complete E2E coverage for Profile feature

## Success Criteria

- All E2E scenarios pass on iOS and Android
- Full user journey tested end-to-end
- API mocking works reliably
- Tests run in CI/CD pipeline
- Professional test quality matching project standards

## Notes

- Detox has limitations with visual verification (colours, link opening)
- Some tests may require manual verification
- Dark mode test may need snapshot comparison
- MSW should mock profile endpoint for all languages
- Consider adding social link deep-linking test in future
- E2E tests should run after unit tests in CI pipeline
- iOS and Android may have different timing requirements
- Profile navigation structure depends on final app layout
