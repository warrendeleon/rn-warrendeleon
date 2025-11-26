# TASK-367: E2E Tests for Manage Bookings Flow (Detox + Mocks)

**Status**: 🆕 Not Started
**Effort**: 4 hours
**Priority**: High
**Parent**: [US-065: View & Manage Bookings](../user-stories/US-065-view-manage-bookings.md)

---

## Overview

Create comprehensive Detox E2E tests for the entire manage bookings flow using Cucumber/Gherkin syntax. Tests must use mocked API responses and **NEVER** hit the real Google Calendar API. Covers viewing bookings, swipe gestures, editing, cancelling, and deep link interactions.

---

## Requirements

### Functional Requirements

1. **Test Coverage**:
   - View bookings list
   - Swipe-to-reveal actions (Edit/Cancel)
   - Tap booking to view details
   - Edit booking flow
   - Cancel booking with confirmation
   - Deep link interactions (phone, maps, meet)
   - Empty state navigation
   - Pull-to-refresh
2. **Mocked Responses**:
   - User bookings API (GET)
   - Update booking API (PATCH)
   - Cancel booking API (POST)
   - **NO real Google Calendar API calls**
3. **Gesture Testing**:
   - Swipe right gesture
   - Tap interactions
   - Pull-to-refresh gesture
4. **Navigation Testing**:
   - Screen transitions
   - Header buttons
   - Back navigation

### Non-Functional Requirements

1. **Isolation**: Tests run independently (no shared state)
2. **Repeatability**: Tests produce same results every run
3. **Speed**: Tests complete in <2 minutes total
4. **Clarity**: Gherkin scenarios readable by non-technical stakeholders

---

## Test Scenarios (Cucumber/Gherkin)

### Feature File

```gherkin
# e2e/features/manage-bookings.feature

Feature: Manage Bookings
  As a user with existing bookings
  I want to view, edit, and cancel my appointments
  So that I can manage my schedule effectively

  Background:
    Given I am logged in as a test user
    And the API returns my bookings list

  Scenario: View my bookings list
    Given I have 3 upcoming bookings
    When I navigate to "My Bookings" screen
    Then I should see 3 booking cards
    And each card should show the meeting name, date, and time
    And the "Book Another" button should be visible in the header

  Scenario: View empty bookings state
    Given I have 0 bookings
    When I navigate to "My Bookings" screen
    Then I should see the empty state message "No Bookings Yet"
    And I should see the "Book Your First Call" button
    When I tap "Book Your First Call"
    Then I should navigate to the "Book a Call" flow

  Scenario: Swipe to reveal Edit and Cancel actions
    Given I am on the "My Bookings" screen
    And I have at least 1 booking
    When I swipe right on the first booking card
    Then I should see the "Edit" button in blue
    And I should see the "Cancel" button in red

  Scenario: Edit booking via swipe action
    Given I am on the "My Bookings" screen
    And I have at least 1 booking
    When I swipe right on the first booking card
    And I tap the "Edit" button
    Then I should navigate to the "Edit Booking" screen
    And the form should be pre-populated with booking details

  Scenario: View booking details
    Given I am on the "My Bookings" screen
    And I have at least 1 booking
    When I tap on the first booking card
    Then I should navigate to the "Booking Detail" screen
    And I should see the meeting type name
    And I should see the date and time
    And I should see the phone number
    And I should see the "Edit" button in the header
    And I should see the "Add to Calendar" button
    And I should see the "Cancel Booking" button

  Scenario: Edit booking from detail screen
    Given I am viewing a booking detail screen
    When I tap the "Edit" button in the header
    Then I should navigate to the "Edit Booking" screen
    And the form should be pre-populated

  Scenario: Change booking date and time
    Given I am on the "Edit Booking" screen
    When I tap the "Date" field
    And I select "10 Dec 2025"
    And I tap the "Time" field
    And I select "15:00"
    And I tap "Save Changes"
    And the API confirms the update was successful
    Then I should navigate back to the "Booking Detail" screen
    And the booking should show the updated date and time

  Scenario: Change booking meeting type
    Given I am on the "Edit Booking" screen
    When I tap the "Meeting Type" field
    And I select "Quick Catchup (30 mins)"
    Then the duration should update to "30 minutes"
    When I tap "Save Changes"
    And the API confirms the update was successful
    Then I should navigate back to the "Booking Detail" screen

  Scenario: Validation error for past date
    Given I am on the "Edit Booking" screen
    When I tap the "Date" field
    And I select "25 Nov 2025" (past date)
    And I tap "Save Changes"
    Then I should see the error "Date cannot be in the past"
    And the save should not proceed

  Scenario: Validation error for invalid phone number
    Given I am on the "Edit Booking" screen
    When I clear the "Phone Number" field
    And I enter "1234567890"
    And I tap "Save Changes"
    Then I should see the error "Invalid phone number format"
    And the save should not proceed

  Scenario: Cancel booking via swipe action
    Given I am on the "My Bookings" screen
    And I have at least 1 booking
    When I swipe right on the first booking card
    And I tap the "Cancel" button
    Then I should see a confirmation dialog with "Cancel Booking"
    When I tap "Cancel Booking" in the dialog
    And the API confirms the cancellation
    Then the booking should be removed from the list

  Scenario: Cancel booking from detail screen
    Given I am viewing a booking detail screen
    When I tap the "Cancel Booking" button
    Then I should see a confirmation dialog
    When I tap "Cancel Booking" in the dialog
    And the API confirms the cancellation
    Then I should navigate back to "My Bookings"
    And the booking should be removed from the list

  Scenario: Keep booking when cancelling
    Given I am viewing a booking detail screen
    When I tap the "Cancel Booking" button
    And I tap "Keep Booking" in the dialog
    Then the dialog should close
    And the booking should remain unchanged

  Scenario: Pull to refresh bookings
    Given I am on the "My Bookings" screen
    When I pull down to refresh
    And the API returns updated bookings
    Then the bookings list should refresh
    And I should see the updated bookings

  Scenario: Open phone call from booking detail
    Given I am viewing a booking detail screen
    And the booking has phone number "+447700900123"
    When I tap the "Phone Number" link
    Then the phone app should open with the number

  Scenario: Open Google Meet from booking detail
    Given I am viewing a booking detail screen
    And the booking is a Google Meet meeting
    When I tap the "Meeting Link"
    Then the Google Meet app or web browser should open

  Scenario: Open Google Maps from booking detail
    Given I am viewing a booking detail screen
    And the booking is an in-person meeting
    When I tap the "Location" link
    Then the Maps app or web browser should open with the location

  Scenario: Unsaved changes warning
    Given I am on the "Edit Booking" screen
    When I change the "Phone Number" field
    And I tap the back button
    Then I should see a confirmation dialog "Discard Changes?"
    When I tap "Discard"
    Then I should navigate back without saving

  Scenario: Discard changes from button
    Given I am on the "Edit Booking" screen
    When I change the "Description" field
    And I tap "Discard Changes"
    Then I should see a confirmation dialog
    When I tap "Discard"
    Then I should navigate back without saving
```

---

## Step Definitions (TypeScript)

```typescript
// e2e/step-definitions/manage-bookings.steps.ts

import { Given, When, Then } from '@cucumber/cucumber';
import { by, element, expect as detoxExpect, device, waitFor } from 'detox';

// Mock data
const mockBookings = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    meeting_type: {
      name: 'Strategy Session',
      duration_minutes: 60,
      meeting_type: 'google_meet',
    },
    start_time: '2025-12-01T14:00:00.000Z',
    end_time: '2025-12-01T15:00:00.000Z',
    status: 'confirmed',
    phone_number: '+447700900123',
    google_meet_link: 'https://meet.google.com/abc-defg-hij',
    description: 'Discuss Q1 marketing strategy',
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    meeting_type: {
      name: 'Quick Catchup',
      duration_minutes: 30,
      meeting_type: 'in_person',
    },
    start_time: '2025-12-05T10:00:00.000Z',
    end_time: '2025-12-05T10:30:00.000Z',
    status: 'confirmed',
    phone_number: '+447700900456',
    location_address: '123 High Street, London, UK',
  },
];

// Background
Given('I am logged in as a test user', async () => {
  // Mock authentication state
  await device.setURLBlacklist(['https://accounts.google.com/*']);
  // Set mock user session
});

Given('the API returns my bookings list', async () => {
  // Mock API response for get-user-bookings
  await device.sendToHome();
  await device.launchApp({
    newInstance: true,
    launchArgs: {
      mockApiResponses: JSON.stringify({
        'get-user-bookings': {
          success: true,
          data: { bookings: mockBookings, count: mockBookings.length },
        },
      }),
    },
  });
});

// Scenario: View my bookings list
Given('I have {int} upcoming bookings', async (count: number) => {
  // Already mocked in background
});

When('I navigate to "My Bookings" screen', async () => {
  await element(by.text('My Bookings')).tap();
});

Then('I should see {int} booking cards', async (count: number) => {
  await waitFor(element(by.id('bookings-list')))
    .toBeVisible()
    .withTimeout(2000);

  // Verify count (implementation-specific)
});

Then('each card should show the meeting name, date, and time', async () => {
  await detoxExpect(element(by.text('Strategy Session'))).toBeVisible();
  await detoxExpect(element(by.text('1 Dec 2025, 14:00 - 15:00'))).toBeVisible();
});

Then('the "Book Another" button should be visible in the header', async () => {
  await detoxExpect(element(by.id('book-another-button'))).toBeVisible();
});

// Scenario: View empty bookings state
Given('I have {int} bookings', async (count: number) => {
  await device.launchApp({
    newInstance: true,
    launchArgs: {
      mockApiResponses: JSON.stringify({
        'get-user-bookings': {
          success: true,
          data: { bookings: [], count: 0 },
        },
      }),
    },
  });
});

Then('I should see the empty state message {string}', async (message: string) => {
  await detoxExpect(element(by.text(message))).toBeVisible();
});

Then('I should see the {string} button', async (buttonText: string) => {
  await detoxExpect(element(by.text(buttonText))).toBeVisible();
});

When('I tap {string}', async (buttonText: string) => {
  await element(by.text(buttonText)).tap();
});

Then('I should navigate to the {string} flow', async (flowName: string) => {
  // Verify navigation (implementation-specific)
});

// Scenario: Swipe to reveal Edit and Cancel actions
Given('I am on the "My Bookings" screen', async () => {
  await waitFor(element(by.id('bookings-list')))
    .toBeVisible()
    .withTimeout(2000);
});

Given('I have at least {int} booking', async (count: number) => {
  // Already verified by viewing list
});

When('I swipe right on the first booking card', async () => {
  await element(by.id('booking-swipe-550e8400-e29b-41d4-a716-446655440000')).swipe(
    'right',
    'fast',
    0.5
  );
});

Then('I should see the {string} button in blue', async (buttonText: string) => {
  await detoxExpect(
    element(by.id(`edit-booking-550e8400-e29b-41d4-a716-446655440000`))
  ).toBeVisible();
});

Then('I should see the {string} button in red', async (buttonText: string) => {
  await detoxExpect(
    element(by.id(`cancel-booking-550e8400-e29b-41d4-a716-446655440000`))
  ).toBeVisible();
});

// Scenario: Edit booking via swipe action
When('I tap the {string} button', async (buttonText: string) => {
  await element(by.id(`edit-booking-550e8400-e29b-41d4-a716-446655440000`)).tap();
});

Then('I should navigate to the {string} screen', async (screenName: string) => {
  // Verify screen header or unique element
  await waitFor(element(by.text(screenName)))
    .toBeVisible()
    .withTimeout(2000);
});

Then('the form should be pre-populated with booking details', async () => {
  await detoxExpect(element(by.text('Strategy Session'))).toBeVisible();
  await detoxExpect(element(by.id('phone-number-input'))).toHaveText('+447700900123');
});

// Scenario: View booking details
When('I tap on the first booking card', async () => {
  await element(by.id('booking-item-550e8400-e29b-41d4-a716-446655440000')).tap();
});

Then('I should see the meeting type name', async () => {
  await detoxExpect(element(by.text('Strategy Session'))).toBeVisible();
});

Then('I should see the date and time', async () => {
  await detoxExpect(element(by.text('1 Dec 2025, 14:00 - 15:00'))).toBeVisible();
});

Then('I should see the phone number', async () => {
  await detoxExpect(element(by.text('+447700900123'))).toBeVisible();
});

Then('I should see the {string} button in the header', async (buttonText: string) => {
  await detoxExpect(element(by.id('edit-booking-header-button'))).toBeVisible();
});

// Scenario: Edit booking from detail screen
Given('I am viewing a booking detail screen', async () => {
  await element(by.id('booking-item-550e8400-e29b-41d4-a716-446655440000')).tap();
  await waitFor(element(by.id('booking-detail-scroll')))
    .toBeVisible()
    .withTimeout(2000);
});

// Scenario: Change booking date and time
Given('I am on the {string} screen', async (screenName: string) => {
  // Already navigated
});

When('I tap the {string} field', async (fieldName: string) => {
  await element(by.id(`${fieldName.toLowerCase().replace(' ', '-')}-picker-button`)).tap();
});

When('I select {string}', async (value: string) => {
  // Platform-specific date/time picker interaction
  // iOS: Use picker wheels
  // Android: Use calendar UI
});

When('I tap {string}', async (buttonText: string) => {
  await element(by.text(buttonText)).tap();
});

When('the API confirms the update was successful', async () => {
  // Mock API response handled by launch args
});

Then('I should navigate back to the {string} screen', async (screenName: string) => {
  await waitFor(element(by.id('booking-detail-scroll')))
    .toBeVisible()
    .withTimeout(2000);
});

Then('the booking should show the updated date and time', async () => {
  await detoxExpect(element(by.text('10 Dec 2025, 15:00'))).toBeVisible();
});

// Scenario: Validation error for past date
Then('I should see the error {string}', async (errorMessage: string) => {
  await detoxExpect(element(by.text(errorMessage))).toBeVisible();
});

Then('the save should not proceed', async () => {
  // Verify still on edit screen
  await detoxExpect(element(by.id('save-changes-button'))).toBeVisible();
});

// Scenario: Cancel booking
Then('I should see a confirmation dialog with {string}', async (dialogTitle: string) => {
  await waitFor(element(by.text(dialogTitle)))
    .toBeVisible()
    .withTimeout(2000);
});

When('I tap {string} in the dialog', async (buttonText: string) => {
  await element(by.text(buttonText)).tap();
});

When('the API confirms the cancellation', async () => {
  // Mock handled by launch args
});

Then('the booking should be removed from the list', async () => {
  await waitFor(element(by.id('booking-item-550e8400-e29b-41d4-a716-446655440000')))
    .not.toBeVisible()
    .withTimeout(2000);
});

// Scenario: Pull to refresh
When('I pull down to refresh', async () => {
  await element(by.id('bookings-list')).swipe('down', 'slow', 0.9, 0.1);
});

When('the API returns updated bookings', async () => {
  // Mock API will return updated data
});

Then('the bookings list should refresh', async () => {
  // Verify refresh control disappeared
  await waitFor(element(by.id('refresh-control')))
    .not.toBeVisible()
    .withTimeout(3000);
});

// Scenario: Deep links
Then('the phone app should open with the number', async () => {
  // Verify Linking.openURL was called (requires mocking)
});

Then('the Google Meet app or web browser should open', async () => {
  // Verify Linking.openURL was called
});

Then('the Maps app or web browser should open with the location', async () => {
  // Verify Linking.openURL was called
});

// Scenario: Unsaved changes warning
Then('I should see a confirmation dialog {string}', async (dialogTitle: string) => {
  await waitFor(element(by.text(dialogTitle)))
    .toBeVisible()
    .withTimeout(2000);
});

Then('I should navigate back without saving', async () => {
  await waitFor(element(by.id('bookings-list')))
    .toBeVisible()
    .withTimeout(2000);
});
```

---

## Mock API Setup

### Launch Args Configuration

```typescript
// e2e/config.ts

export const mockApiResponses = {
  'get-user-bookings': {
    success: true,
    data: {
      bookings: [
        // ... mock bookings
      ],
      count: 2,
    },
  },
  'update-booking': {
    success: true,
    data: {
      booking: {
        // ... updated booking
      },
      calendar_updated: true,
      availability_checked: true,
    },
  },
  'cancel-booking': {
    success: true,
    data: {
      booking: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        status: 'cancelled',
        cancelled_at: '2025-11-26T15:00:00.000Z',
      },
      calendar_deleted: true,
    },
  },
};
```

### App-Side Mock Interceptor

```typescript
// src/services/api/mockInterceptor.ts

import { mockApiResponses } from '@app/config/e2e-mocks';

export const interceptApiCall = async (endpoint: string, options: RequestInit) => {
  // Check if running E2E tests
  if (__DEV__ && global.mockApiResponses) {
    const mockResponse = global.mockApiResponses[endpoint];

    if (mockResponse) {
      return {
        ok: true,
        json: async () => mockResponse,
      };
    }
  }

  // Normal fetch
  return fetch(endpoint, options);
};
```

---

## Detox Configuration

```json
// .detoxrc.js additions

{
  "apps": {
    "ios.debug": {
      "type": "ios.app",
      "binaryPath": "ios/build/Build/Products/Debug-iphonesimulator/warrendeleon.app",
      "build": "xcodebuild -workspace ios/warrendeleon.xcworkspace -scheme warrendeleon -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
      "launchArgs": {
        "mockApiResponses": "$(cat e2e/mocks/api-responses.json)"
      }
    }
  }
}
```

---

## Test Execution

### Run All Manage Bookings Tests

```bash
# iOS
yarn detox test e2e/features/manage-bookings.feature --configuration ios.debug

# Android
yarn detox test e2e/features/manage-bookings.feature --configuration android.debug
```

### Run Specific Scenario

```bash
yarn detox test e2e/features/manage-bookings.feature:42 --configuration ios.debug
# Line 42 = "Scenario: Edit booking via swipe action"
```

---

## Acceptance Criteria

- [ ] All Gherkin scenarios pass on iOS simulator
- [ ] All Gherkin scenarios pass on Android emulator
- [ ] Tests use mocked API responses (NEVER hit real API)
- [ ] Swipe gesture tests work reliably
- [ ] Deep link tests verify Linking.openURL calls (mocked)
- [ ] Tests run in <2 minutes total
- [ ] Tests are idempotent (can run multiple times)
- [ ] Clear error messages when tests fail
- [ ] Step definitions are reusable across scenarios
- [ ] Mock data matches real API contract

---

## Related Files

- **Feature**: `e2e/features/manage-bookings.feature`
- **Steps**: `e2e/step-definitions/manage-bookings.steps.ts`
- **Mocks**: `e2e/mocks/api-responses.json`
- **Config**: `.detoxrc.js`
- **Interceptor**: `src/services/api/mockInterceptor.ts`

---

## Notes

- Use `device.setURLBlacklist` to prevent accidental Google Calendar API calls
- Swipe gestures may need platform-specific adjustments (speed, distance)
- Date/time pickers require platform-specific interactions (iOS wheels vs Android calendar)
- Deep link testing requires mocking `Linking.openURL` (use `jest.mock` in Detox context)
- Consider adding visual regression tests with screenshot comparison
- Future enhancement: Add performance metrics (screen load times, gesture response)
