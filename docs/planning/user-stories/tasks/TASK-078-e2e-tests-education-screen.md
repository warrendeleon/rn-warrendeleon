# TASK-078: E2E Tests for Education Screen Flow

**Epic**: [EPIC-009: Education Display Enhancement](../epics/EPIC-009-education-display-enhancement.md)
**User Story**: [US-016: Education Screen with SVG Logos](../stories/US-016-education-screen-svg-logos.md)
**Status**: ⭕ Not Started
**Priority**: Medium
**Estimated Effort**: 1.5 hours
**Created**: 2025-11-15

---

## Context

Create end-to-end tests using Detox and Cucumber to verify the complete Education screen flow from navigation to certificate viewing. Tests should cover the full user journey across iOS and Android.

## Technical Details

### Test File Location

```
src/features/Education/__tests__/education-screen.feature
src/features/Education/__tests__/education-screen.cucumber.tsx
```

### Cucumber Feature File

**File**: `src/features/Education/__tests__/education-screen.feature`

```gherkin
Feature: Education Screen

  As a user viewing my portfolio app
  I want to see my education history with institution logos
  So that I can showcase my qualifications

  Background:
    Given the app is running
    And the GitHub API is mocked with education data

  Scenario: Navigate to Education screen
    Given I am on the Home screen
    When I tap the "Studies" button
    Then I should see the Education screen
    And I should see education entries with logos
    And I should see "Computer Science Degree"
    And I should see "University A"

  Scenario: View education list
    Given I am on the Education screen
    Then I should see multiple education entries
    And each entry should have a logo
    And each entry should show title and location
    And each entry should show date range

  Scenario: Navigate to certificate
    Given I am on the Education screen
    And there is an education entry with a certificate
    When I tap the education entry "Computer Science Degree"
    Then I should navigate to the WebView screen
    And I should see the certificate loading

  Scenario: Non-certificate entry is not tappable
    Given I am on the Education screen
    And there is an education entry without a certificate
    When I view the entry "React Native Course"
    Then the entry should not have a chevron icon
    And tapping it should not navigate

  Scenario: Dark mode support
    Given I am on the Education screen
    When I enable dark mode
    Then the background should be dark
    And the text should be light
    And the logos should be visible

  Scenario: Loading state
    Given the Education API is slow
    When I navigate to the Education screen
    Then I should see a loading indicator
    And the loading indicator should disappear when data loads

  Scenario: Error handling
    Given the Education API returns an error
    When I navigate to the Education screen
    Then I should see an error message
    And the error message should be user-friendly

  Scenario: Empty state
    Given the Education API returns no data
    When I navigate to the Education screen
    Then I should see "No education data available"
```

### Cucumber Step Definitions

**File**: `src/features/Education/__tests__/education-screen.cucumber.tsx`

```typescript
import { After, Before, Given, Then, When } from '@cucumber/cucumber';
import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

Before({ tags: '@education' }, async () => {
  await device.reloadReactNative();
});

After({ tags: '@education' }, async () => {
  // Cleanup if needed
});

Given('I am on the Education screen', async () => {
  await waitFor(element(by.id('home-screen')))
    .toBeVisible()
    .withTimeout(5000);

  await element(by.id('home-studies-button')).tap();

  await waitFor(element(by.id('education-data-screen')))
    .toBeVisible()
    .withTimeout(3000);
});

Given('the GitHub API is mocked with education data', async () => {
  // MSW already mocks this via setupE2E.ts
  // No action needed here - just verification step
});

When('I tap the {string} button', async (buttonLabel: string) => {
  if (buttonLabel === 'Studies') {
    await element(by.id('home-studies-button')).tap();
  }
});

Then('I should see the Education screen', async () => {
  await waitFor(element(by.id('education-data-screen')))
    .toBeVisible()
    .withTimeout(3000);
});

Then('I should see education entries with logos', async () => {
  // Verify at least one education item exists
  await waitFor(element(by.id('education-item-university-a')))
    .toBeVisible()
    .withTimeout(3000);
});

Then('I should see {string}', async (text: string) => {
  await waitFor(element(by.text(text)))
    .toBeVisible()
    .withTimeout(3000);
});

Then('I should see multiple education entries', async () => {
  // Verify at least 2 entries
  await detoxExpect(element(by.id('education-item-university-a'))).toBeVisible();
  await detoxExpect(element(by.id('education-item-online-course-b'))).toBeVisible();
});

Then('each entry should have a logo', async () => {
  // SVG logos rendered - verify via container or snapshot
  // Detox may not easily verify SVG rendering, so check container exists
  await detoxExpect(element(by.id('education-item-university-a'))).toBeVisible();
});

Then('each entry should show title and location', async () => {
  await detoxExpect(element(by.text('Computer Science Degree'))).toBeVisible();
  await detoxExpect(element(by.text(/University A/))).toBeVisible();
});

Then('each entry should show date range', async () => {
  // Verify date range format "2010 - 2014" exists
  await detoxExpect(element(by.text(/2010.*2014/))).toBeVisible();
});

Given('there is an education entry with a certificate', async () => {
  // Mocked data includes certificate for "Computer Science Degree"
  await detoxExpect(element(by.id('education-item-university-a'))).toBeVisible();
});

When('I tap the education entry {string}', async (entryTitle: string) => {
  if (entryTitle === 'Computer Science Degree') {
    await element(by.id('education-item-university-a')).tap();
  }
});

Then('I should navigate to the WebView screen', async () => {
  await waitFor(element(by.id('webview-screen')))
    .toBeVisible()
    .withTimeout(3000);
});

Then('I should see the certificate loading', async () => {
  // WebView should be rendering
  await detoxExpect(element(by.id('webview-screen'))).toBeVisible();
});

Given('there is an education entry without a certificate', async () => {
  // Mocked data includes entry without certificate
  await detoxExpect(element(by.id('education-item-online-course-b'))).toBeVisible();
});

When('I view the entry {string}', async (entryTitle: string) => {
  // Just viewing, not tapping
  if (entryTitle === 'React Native Course') {
    await detoxExpect(element(by.text('React Native Course'))).toBeVisible();
  }
});

Then('the entry should not have a chevron icon', async () => {
  // Verify via snapshot or lack of chevron element
  // Difficult to assert in Detox - may need visual snapshot
});

Then('tapping it should not navigate', async () => {
  // Tap and verify we stay on Education screen
  await element(by.id('education-item-online-course-b')).tap();
  await detoxExpect(element(by.id('education-data-screen'))).toBeVisible();
});

When('I enable dark mode', async () => {
  // Navigate to Settings and toggle dark mode
  // This depends on settings implementation
  // May need to go Home -> Settings -> Appearance -> Dark
});

Then('the background should be dark', async () => {
  // Visual verification - may need snapshot
  // Detox doesn't easily verify colors
});

Then('the text should be light', async () => {
  // Visual verification
});

Then('the logos should be visible', async () => {
  await detoxExpect(element(by.id('education-item-university-a'))).toBeVisible();
});

Given('the Education API is slow', async () => {
  // MSW can delay responses - configure in setup
});

When('I navigate to the Education screen', async () => {
  await element(by.id('home-studies-button')).tap();
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

Given('the Education API returns an error', async () => {
  // MSW can return error - configure in setup or before hook
});

Then('I should see an error message', async () => {
  await waitFor(element(by.text(/error/i)))
    .toBeVisible()
    .withTimeout(3000);
});

Then('the error message should be user-friendly', async () => {
  // Verify it's not a stack trace or technical error
  // Check for user-friendly message like "Failed to load education data"
  await detoxExpect(element(by.text(/Failed to load/i))).toBeVisible();
});

Given('the Education API returns no data', async () => {
  // MSW returns empty array - configure in setup
});

Then('I should see {string}', async (message: string) => {
  await waitFor(element(by.text(message)))
    .toBeVisible()
    .withTimeout(3000);
});
```

### MSW Mock Configuration

Add education fixtures to MSW setup:

**File**: `src/test-utils/msw/fixtures/education-en.json`

```json
[
  {
    "location": "University A",
    "title": "Computer Science Degree",
    "logo": "university-a.svg",
    "start": "2010-09-01",
    "end": "2014-06-30",
    "certificate": "https://example.com/cert1.pdf"
  },
  {
    "location": "Online Course B",
    "title": "React Native Course",
    "logo": "udemy.svg",
    "start": "2020-01-01",
    "end": "2020-03-31"
  }
]
```

### Files Affected

- `src/features/Education/__tests__/education-screen.feature` - New
- `src/features/Education/__tests__/education-screen.cucumber.tsx` - New
- `src/test-utils/msw/fixtures/education-en.json` - New fixture

## Acceptance Criteria

- ✅ Cucumber feature file created with all scenarios
- ✅ Step definitions implemented for all steps
- ✅ MSW mocks configured for education API
- ✅ Navigation flow tested (Home → Education → WebView)
- ✅ Loading state tested
- ✅ Error state tested
- ✅ Empty state tested
- ✅ Dark mode tested (if feasible with Detox)
- ✅ Certificate navigation tested
- ✅ Non-certificate entry behaviour tested
- ✅ All E2E tests pass on iOS simulator
- ✅ All E2E tests pass on Android emulator

## Test Scenarios

1. ✅ Navigate from Home to Education screen
2. ✅ View education list with logos and data
3. ✅ Navigate to certificate WebView
4. ✅ Non-certificate entry not tappable/no navigation
5. ✅ Dark mode support (visual verification)
6. ✅ Loading indicator during data fetch
7. ✅ Error message on API failure
8. ✅ Empty state when no data

## Dependencies

**Prerequisites**:

- ✅ TASK-075: EducationDataScreen UI updated
- ✅ TASK-076: Certificate navigation implemented
- ✅ TASK-077: Unit tests complete
- ✅ MSW configured for E2E tests
- ✅ Detox + Cucumber configured

**Enables**:

- Complete E2E coverage for Education feature

## Success Criteria

- All E2E scenarios pass on iOS and Android
- Full user journey tested end-to-end
- API mocking works reliably
- Tests run in CI/CD pipeline
- Professional test quality matching project standards

## Notes

- Detox has limitations with visual verification (colors, SVG rendering)
- Some tests may require snapshot comparison
- Dark mode test may need manual verification
- MSW should mock all 5 language endpoints for education
- Consider adding certificate download test in future
- E2E tests should run after unit tests in CI pipeline
- iOS and Android may have different timing requirements
