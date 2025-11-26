# TASK-358: E2E Booking Flow Tests with Detox & Mocks

**Epic**: EPIC-031: Book a Call
**User Story**: US-064: Booking Confirmation & Navigation
**Status**: 📋 To Do
**Effort**: 4h
**Priority**: P0 (Critical Path)
**Assigned To**: Warren
**Created**: 2025-11-26

---

## Overview

Implement end-to-end tests for the complete booking flow using Detox and Cucumber. Tests must use mocked Supabase Edge Function responses (availability, booking) to avoid hitting real APIs or Google Calendar. Includes happy path scenarios, error scenarios, navigation verification, and data clearing verification. Must achieve comprehensive E2E coverage without external dependencies.

---

## Requirements

### Functional Requirements

**Test Coverage**:

- Complete booking flow (SelectType → SelectDuration → Calendar → Details → Confirmation)
- Video call booking (happy path)
- Phone call booking (happy path)
- Error scenarios (API failures, network errors, validation errors)
- Navigation verification (stack reset, back navigation, data clearing)
- Calendar integration (Add to Calendar button)

**Mock Strategy**:

- Mock Supabase Edge Function responses (availability, booking)
- Mock Google Calendar API (never hit real API)
- Mock device calendar integration (ICS file generation)
- Mock network failures for error scenarios
- Deterministic mock data (reproducible tests)

**Test Framework**:

- Detox for E2E automation
- Cucumber for BDD scenarios (Gherkin syntax)
- Step definitions in TypeScript
- Shared step library for reusable steps

### Non-Functional Requirements

**Performance**:

- Full test suite completes in <5 minutes
- Individual scenarios complete in <30 seconds
- No flakiness (100% reliable)

**Maintainability**:

- Descriptive scenario names
- Reusable step definitions
- Page Object Model for screen interactions
- Clear mock data structure

**Reliability**:

- Tests run in isolation (no shared state)
- Deterministic (same results every run)
- No external dependencies (APIs, network)
- Screenshot on failure for debugging

---

## Test Scenarios

### Feature: Book a Call - Complete Flow

**Scenario 1: Book a 30-minute video call (Happy Path)**

```gherkin
Feature: Book a Call - Complete Flow

  Background:
    Given the app is launched
    And I am on the Home screen

  Scenario: Book a 30-minute video call successfully
    When I tap on "Book a Call" button
    Then I should see the "Select Call Type" screen

    When I tap on "Video Call" card
    And I tap on "Continue" button
    Then I should see the "Select Duration" screen

    When I tap on "30 minutes" option
    And I tap on "Continue" button
    Then I should see the "Choose Date & Time" screen

    When I select date "2024-11-27"
    And I select time "14:00"
    And I tap on "Continue" button
    Then I should see the "Your Details" screen

    When I enter name "John Doe"
    And I enter email "john@example.com"
    And I enter message "Discuss React Native project"
    And I tap on "Confirm Booking" button
    Then I should see a loading state
    And I should see the "Booking Confirmed!" screen within 3 seconds

    And I should see "Your video call is scheduled"
    And I should see Google Meet link
    And I should see "Add to Calendar" button
    And I should see "Done" button

    When I tap on "Done" button
    Then I should be on the Home screen
    And booking data should be cleared from Redux
```

**Scenario 2: Book a 60-minute phone call successfully**

```gherkin
  Scenario: Book a 60-minute phone call successfully
    When I tap on "Book a Call" button
    And I tap on "Phone Call" card
    And I tap on "Continue" button
    And I tap on "60 minutes" option
    And I tap on "Continue" button
    And I select date "2024-11-28"
    And I select time "10:00"
    And I tap on "Continue" button
    And I enter name "Jane Smith"
    And I enter email "jane@example.com"
    And I enter phone "+44 7700 900123"
    And I tap on "Confirm Booking" button
    Then I should see the "Booking Confirmed!" screen within 3 seconds

    And I should see "Your phone call is scheduled"
    And I should see "Warren will call you at: +44 7700 900123"
    And I should see "Call Warren" button
    And I should see "Add to Calendar" button

    When I tap on "Done" button
    Then I should be on the Home screen
```

**Scenario 3: Navigate back during booking flow (data clearing)**

```gherkin
  Scenario: User navigates back during booking, data is cleared
    When I tap on "Book a Call" button
    And I tap on "Video Call" card
    And I tap on "Continue" button
    And I tap on "30 minutes" option
    And I tap on "Continue" button
    And I select date "2024-11-27"
    And I select time "14:00"
    Then booking data should be in Redux

    When I tap the back button
    And I tap the back button
    And I tap the back button
    And I tap the back button
    Then I should be on the Home screen
    And booking data should be cleared from Redux
```

**Scenario 4: API error during booking (network failure)**

```gherkin
  Scenario: Booking fails due to network error
    Given the network is offline
    When I tap on "Book a Call" button
    And I complete the booking flow with valid details
    And I tap on "Confirm Booking" button
    Then I should see an error toast "Network error. Check your connection and try again."
    And I should still be on the "Your Details" screen
    And the booking data should still be in Redux
```

**Scenario 5: API error during booking (server error)**

```gherkin
  Scenario: Booking fails due to server error
    Given the Supabase Edge Function returns a 500 error
    When I tap on "Book a Call" button
    And I complete the booking flow with valid details
    And I tap on "Confirm Booking" button
    Then I should see an error toast "Server error. Please try again later."
    And I should still be on the "Your Details" screen
```

**Scenario 6: Validation errors on booking details form**

```gherkin
  Scenario: Validation errors prevent booking submission
    When I tap on "Book a Call" button
    And I complete the booking flow up to the details screen
    And I tap on "Confirm Booking" button without entering details
    Then I should see validation error "Name is required"
    And I should see validation error "Email is required"
    And the "Confirm Booking" button should be disabled
```

**Scenario 7: Add to Calendar button triggers ICS download**

```gherkin
  Scenario: Add to Calendar button works on confirmation screen
    When I complete a booking successfully
    And I am on the "Booking Confirmed!" screen
    And I tap on "Add to Calendar" button
    Then I should see a success toast "Added to calendar"
    And an ICS file should be generated
```

**Scenario 8: Copy Google Meet link to clipboard**

```gherkin
  Scenario: Copy Google Meet link to clipboard (video call)
    When I complete a video call booking successfully
    And I am on the "Booking Confirmed!" screen
    And I tap on "Copy" button for the Google Meet link
    Then I should see a success toast "Link copied to clipboard"
    And the clipboard should contain "https://meet.google.com/"
```

---

## Mock Data Structure

### Mock Availability Response

**File**: `e2e/mocks/availability.mock.ts`

```typescript
export const mockAvailabilityResponse = {
  availableDates: ['2024-11-27', '2024-11-28', '2024-11-29', '2024-12-02', '2024-12-03'],
  availableSlots: {
    '2024-11-27': [
      { time: '09:00', available: true },
      { time: '10:00', available: true },
      { time: '11:00', available: false },
      { time: '14:00', available: true },
      { time: '15:00', available: true },
      { time: '16:00', available: true },
    ],
    '2024-11-28': [
      { time: '09:00', available: true },
      { time: '10:00', available: true },
      { time: '11:00', available: true },
      { time: '13:00', available: true },
      { time: '14:00', available: false },
    ],
  },
  timezone: 'Europe/London',
};
```

### Mock Booking Response

**File**: `e2e/mocks/booking.mock.ts`

```typescript
export const mockVideoBookingResponse = {
  id: 'booking-123',
  date: '2024-11-27T00:00:00Z',
  startTime: '2024-11-27T14:00:00Z',
  endTime: '2024-11-27T14:30:00Z',
  duration: 30,
  callType: 'video',
  meetingUrl: 'https://meet.google.com/abc-defg-hij',
  timezone: 'Europe/London',
  status: 'confirmed',
};

export const mockPhoneBookingResponse = {
  id: 'booking-456',
  date: '2024-11-28T00:00:00Z',
  startTime: '2024-11-28T10:00:00Z',
  endTime: '2024-11-28T11:00:00Z',
  duration: 60,
  callType: 'phone',
  userPhone: '+44 7700 900123',
  timezone: 'Europe/London',
  status: 'confirmed',
};

export const mockBookingErrorResponse = {
  error: 'BOOKING_FAILED',
  message: 'Unable to create booking. Please try again.',
};

export const mockNetworkErrorResponse = {
  error: 'NETWORK_ERROR',
  message: 'Network request failed',
};

export const mockServerErrorResponse = {
  error: 'SERVER_ERROR',
  message: 'Internal server error',
};
```

---

## Technical Implementation

### File Structure

```
e2e/
├── features/
│   └── booking-flow.feature              # Gherkin scenarios
├── step-definitions/
│   ├── booking-flow.steps.ts             # Step definitions
│   ├── common.steps.ts                   # Shared steps (navigation, assertions)
│   └── setup.steps.ts                    # Before/After hooks
├── page-objects/
│   ├── HomeScreen.po.ts                  # Home screen page object
│   ├── BookingSelectTypeScreen.po.ts
│   ├── BookingSelectDurationScreen.po.ts
│   ├── CalendarScreen.po.ts
│   ├── BookingDetailsScreen.po.ts
│   └── BookingConfirmationScreen.po.ts
├── mocks/
│   ├── availability.mock.ts              # Mock availability data
│   ├── booking.mock.ts                   # Mock booking data
│   └── mockServer.ts                     # Mock server setup (intercept fetch)
└── support/
    ├── helpers.ts                        # Test helpers
    └── world.ts                          # Cucumber World (shared context)
```

### Mock Server Setup

**File**: `e2e/mocks/mockServer.ts`

```typescript
import { mockAvailabilityResponse } from './availability.mock';
import { mockVideoBookingResponse, mockPhoneBookingResponse } from './booking.mock';

/**
 * Mock server that intercepts fetch calls and returns mock responses
 * This prevents E2E tests from hitting real Supabase Edge Functions
 */
export class MockServer {
  private static instance: MockServer;
  private mockResponses: Map<string, any> = new Map();

  private constructor() {
    this.setupDefaultMocks();
  }

  static getInstance(): MockServer {
    if (!MockServer.instance) {
      MockServer.instance = new MockServer();
    }
    return MockServer.instance;
  }

  setupDefaultMocks() {
    // Mock availability endpoint
    this.mockResponses.set('GET:/functions/v1/get-availability', {
      status: 200,
      data: mockAvailabilityResponse,
    });

    // Mock booking endpoint (video)
    this.mockResponses.set('POST:/functions/v1/book-call:video', {
      status: 200,
      data: mockVideoBookingResponse,
    });

    // Mock booking endpoint (phone)
    this.mockResponses.set('POST:/functions/v1/book-call:phone', {
      status: 200,
      data: mockPhoneBookingResponse,
    });
  }

  setMockResponse(method: string, endpoint: string, response: any) {
    this.mockResponses.set(`${method}:${endpoint}`, response);
  }

  getMockResponse(method: string, endpoint: string): any {
    return this.mockResponses.get(`${method}:${endpoint}`);
  }

  simulateNetworkError() {
    this.mockResponses.set('POST:/functions/v1/book-call', {
      status: 0,
      error: 'Network request failed',
    });
  }

  simulateServerError() {
    this.mockResponses.set('POST:/functions/v1/book-call', {
      status: 500,
      error: 'Internal server error',
    });
  }

  reset() {
    this.mockResponses.clear();
    this.setupDefaultMocks();
  }
}

// Export singleton instance
export const mockServer = MockServer.getInstance();
```

**Note**: In practice, you'd intercept `fetch` calls in the app using a library like `msw` (Mock Service Worker) or by mocking the fetch function directly in your test setup.

### Page Object: BookingDetailsScreen

**File**: `e2e/page-objects/BookingDetailsScreen.po.ts`

```typescript
import { by, element, expect as detoxExpect } from 'detox';

export class BookingDetailsScreenPO {
  // Selectors
  private nameInput = element(by.id('booking-details-name-input'));
  private emailInput = element(by.id('booking-details-email-input'));
  private phoneInput = element(by.id('booking-details-phone-input'));
  private messageInput = element(by.id('booking-details-message-input'));
  private confirmButton = element(by.id('confirm-booking-button'));
  private nameError = element(by.id('booking-details-name-error'));
  private emailError = element(by.id('booking-details-email-error'));
  private phoneError = element(by.id('booking-details-phone-error'));

  async waitForScreen() {
    await detoxExpect(element(by.id('booking-details-screen'))).toBeVisible();
  }

  async enterName(name: string) {
    await this.nameInput.typeText(name);
  }

  async enterEmail(email: string) {
    await this.emailInput.typeText(email);
  }

  async enterPhone(phone: string) {
    await this.phoneInput.typeText(phone);
  }

  async enterMessage(message: string) {
    await this.messageInput.typeText(message);
  }

  async tapConfirmButton() {
    await this.confirmButton.tap();
  }

  async verifyValidationError(field: 'name' | 'email' | 'phone', message: string) {
    const errorElement =
      field === 'name' ? this.nameError : field === 'email' ? this.emailError : this.phoneError;
    await detoxExpect(errorElement).toHaveText(message);
  }

  async verifyConfirmButtonDisabled() {
    await detoxExpect(this.confirmButton).toHaveToggleValue(false);
  }
}
```

### Page Object: BookingConfirmationScreen

**File**: `e2e/page-objects/BookingConfirmationScreen.po.ts`

```typescript
import { by, element, expect as detoxExpect } from 'detox';

export class BookingConfirmationScreenPO {
  // Selectors
  private confirmationTitle = element(by.id('confirmation-title'));
  private confirmationSubtitle = element(by.id('confirmation-subtitle'));
  private videoMeetingUrl = element(by.id('video-call-details-meeting-url'));
  private videoCopyButton = element(by.id('video-call-details-copy-button'));
  private videoJoinButton = element(by.id('video-call-details-join-button'));
  private phoneMessage = element(by.id('phone-call-details-message'));
  private phoneCallButton = element(by.id('phone-call-details-call-button'));
  private addToCalendarButton = element(by.id('add-to-calendar-button'));
  private doneButton = element(by.id('done-button'));

  async waitForScreen() {
    await detoxExpect(element(by.id('booking-confirmation-screen'))).toBeVisible();
  }

  async verifyTitle(title: string) {
    await detoxExpect(this.confirmationTitle).toHaveText(title);
  }

  async verifySubtitle(subtitle: string) {
    await detoxExpect(this.confirmationSubtitle).toHaveText(subtitle);
  }

  async verifyVideoCallDetails() {
    await detoxExpect(this.videoMeetingUrl).toBeVisible();
    await detoxExpect(this.videoCopyButton).toBeVisible();
    await detoxExpect(this.videoJoinButton).toBeVisible();
  }

  async verifyPhoneCallDetails(phoneNumber: string) {
    await detoxExpect(this.phoneMessage).toBeVisible();
    await detoxExpect(this.phoneMessage).toHaveText(`Warren will call you at: ${phoneNumber}`);
    await detoxExpect(this.phoneCallButton).toBeVisible();
  }

  async tapCopyButton() {
    await this.videoCopyButton.tap();
  }

  async tapAddToCalendarButton() {
    await this.addToCalendarButton.tap();
  }

  async tapDoneButton() {
    await this.doneButton.tap();
  }

  async verifyMeetingUrl(url: string) {
    await detoxExpect(this.videoMeetingUrl).toHaveText(url);
  }
}
```

### Step Definitions: Booking Flow

**File**: `e2e/step-definitions/booking-flow.steps.ts`

```typescript
import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { by, element, expect as detoxExpect, device } from 'detox';
import { HomeScreenPO } from '../page-objects/HomeScreen.po';
import { BookingSelectTypeScreenPO } from '../page-objects/BookingSelectTypeScreen.po';
import { BookingSelectDurationScreenPO } from '../page-objects/BookingSelectDurationScreen.po';
import { CalendarScreenPO } from '../page-objects/CalendarScreen.po';
import { BookingDetailsScreenPO } from '../page-objects/BookingDetailsScreen.po';
import { BookingConfirmationScreenPO } from '../page-objects/BookingConfirmationScreen.po';
import { mockServer } from '../mocks/mockServer';

// Page Objects
let homeScreen: HomeScreenPO;
let selectTypeScreen: BookingSelectTypeScreenPO;
let selectDurationScreen: BookingSelectDurationScreenPO;
let calendarScreen: CalendarScreenPO;
let detailsScreen: BookingDetailsScreenPO;
let confirmationScreen: BookingConfirmationScreenPO;

Before(async () => {
  // Initialize page objects
  homeScreen = new HomeScreenPO();
  selectTypeScreen = new BookingSelectTypeScreenPO();
  selectDurationScreen = new BookingSelectDurationScreenPO();
  calendarScreen = new CalendarScreenPO();
  detailsScreen = new BookingDetailsScreenPO();
  confirmationScreen = new BookingConfirmationScreenPO();

  // Reset mock server
  mockServer.reset();

  // Launch app
  await device.launchApp({ newInstance: true });
});

After(async () => {
  // Reset app state
  await device.terminateApp();
});

// Background steps
Given('the app is launched', async () => {
  // App already launched in Before hook
  await homeScreen.waitForScreen();
});

Given('I am on the Home screen', async () => {
  await homeScreen.waitForScreen();
});

// Navigation steps
When('I tap on "Book a Call" button', async () => {
  await homeScreen.tapBookCallButton();
});

When('I tap on "Video Call" card', async () => {
  await selectTypeScreen.tapVideoCallCard();
});

When('I tap on "Phone Call" card', async () => {
  await selectTypeScreen.tapPhoneCallCard();
});

When('I tap on "Continue" button', async () => {
  // Generic continue button (works on multiple screens)
  await element(by.text('Continue')).tap();
});

When('I tap on "{string}" option', async (option: string) => {
  await selectDurationScreen.tapDurationOption(option);
});

When('I select date "{string}"', async (date: string) => {
  await calendarScreen.selectDate(date);
});

When('I select time "{string}"', async (time: string) => {
  await calendarScreen.selectTime(time);
});

When('I enter name "{string}"', async (name: string) => {
  await detailsScreen.enterName(name);
});

When('I enter email "{string}"', async (email: string) => {
  await detailsScreen.enterEmail(email);
});

When('I enter phone "{string}"', async (phone: string) => {
  await detailsScreen.enterPhone(phone);
});

When('I enter message "{string}"', async (message: string) => {
  await detailsScreen.enterMessage(message);
});

When('I tap on "Confirm Booking" button', async () => {
  await detailsScreen.tapConfirmButton();
});

When('I tap on "Done" button', async () => {
  await confirmationScreen.tapDoneButton();
});

When('I tap the back button', async () => {
  // iOS and Android have different back button implementations
  if (device.getPlatform() === 'ios') {
    await element(by.traits(['button']))
      .atIndex(0)
      .tap(); // Back button is usually first button
  } else {
    await device.pressBack();
  }
});

// Assertion steps
Then('I should see the "{string}" screen', async (screenName: string) => {
  const screenMap: Record<string, any> = {
    'Select Call Type': selectTypeScreen,
    'Select Duration': selectDurationScreen,
    'Choose Date & Time': calendarScreen,
    'Your Details': detailsScreen,
    'Booking Confirmed!': confirmationScreen,
  };
  await screenMap[screenName].waitForScreen();
});

Then('I should see a loading state', async () => {
  await detoxExpect(element(by.id('confirm-booking-button'))).toHaveText('Confirming...');
});

Then(
  'I should see the "{string}" screen within {int} seconds',
  async (screenName: string, seconds: number) => {
    const screenMap: Record<string, any> = {
      'Booking Confirmed!': confirmationScreen,
    };
    await screenMap[screenName].waitForScreen();
  },
  seconds * 1000
);

Then('I should see "{string}"', async (text: string) => {
  await detoxExpect(element(by.text(text))).toBeVisible();
});

Then('I should see Google Meet link', async () => {
  await confirmationScreen.verifyVideoCallDetails();
});

Then('I should see "Warren will call you at: {string}"', async (phoneNumber: string) => {
  await confirmationScreen.verifyPhoneCallDetails(phoneNumber);
});

Then('I should see "{string}" button', async (buttonText: string) => {
  await detoxExpect(element(by.text(buttonText))).toBeVisible();
});

Then('I should be on the Home screen', async () => {
  await homeScreen.waitForScreen();
});

// Mock/Error steps
Given('the network is offline', async () => {
  mockServer.simulateNetworkError();
});

Given('the Supabase Edge Function returns a {int} error', async (statusCode: number) => {
  if (statusCode === 500) {
    mockServer.simulateServerError();
  }
});

Then('I should see an error toast "{string}"', async (errorMessage: string) => {
  await detoxExpect(element(by.text(errorMessage))).toBeVisible();
});

Then('I should still be on the "{string}" screen', async (screenName: string) => {
  const screenMap: Record<string, any> = {
    'Your Details': detailsScreen,
  };
  await screenMap[screenName].waitForScreen();
});

// Redux state steps
Then('booking data should be in Redux', async () => {
  // This would require exposing Redux state via a test helper
  // For now, we can verify visually that form fields are populated
  // In a real implementation, you'd expose Redux state via a test utility
});

Then('booking data should be cleared from Redux', async () => {
  // This would require exposing Redux state via a test helper
  // For now, we can verify that re-entering the flow shows empty forms
});

// Helper steps
When('I complete the booking flow with valid details', async () => {
  await selectTypeScreen.tapVideoCallCard();
  await element(by.text('Continue')).tap();
  await selectDurationScreen.tapDurationOption('30 minutes');
  await element(by.text('Continue')).tap();
  await calendarScreen.selectDate('2024-11-27');
  await calendarScreen.selectTime('14:00');
  await element(by.text('Continue')).tap();
  await detailsScreen.enterName('John Doe');
  await detailsScreen.enterEmail('john@example.com');
});

When('I complete the booking flow up to the details screen', async () => {
  await selectTypeScreen.tapVideoCallCard();
  await element(by.text('Continue')).tap();
  await selectDurationScreen.tapDurationOption('30 minutes');
  await element(by.text('Continue')).tap();
  await calendarScreen.selectDate('2024-11-27');
  await calendarScreen.selectTime('14:00');
  await element(by.text('Continue')).tap();
});

When('I tap on "Confirm Booking" button without entering details', async () => {
  await detailsScreen.tapConfirmButton();
});

Then('I should see validation error "{string}"', async (errorMessage: string) => {
  await detoxExpect(element(by.text(errorMessage))).toBeVisible();
});

Then('the "Confirm Booking" button should be disabled', async () => {
  await detailsScreen.verifyConfirmButtonDisabled();
});

When('I complete a booking successfully', async () => {
  // Full happy path flow
  await homeScreen.tapBookCallButton();
  await selectTypeScreen.tapVideoCallCard();
  await element(by.text('Continue')).tap();
  await selectDurationScreen.tapDurationOption('30 minutes');
  await element(by.text('Continue')).tap();
  await calendarScreen.selectDate('2024-11-27');
  await calendarScreen.selectTime('14:00');
  await element(by.text('Continue')).tap();
  await detailsScreen.enterName('John Doe');
  await detailsScreen.enterEmail('john@example.com');
  await detailsScreen.tapConfirmButton();
  await confirmationScreen.waitForScreen();
});

When('I complete a video call booking successfully', async () => {
  await this.completeABookingSuccessfully();
});

When('I tap on "Copy" button for the Google Meet link', async () => {
  await confirmationScreen.tapCopyButton();
});

Then('I should see a success toast "{string}"', async (message: string) => {
  await detoxExpect(element(by.text(message))).toBeVisible();
});

Then('the clipboard should contain "{string}"', async (expectedText: string) => {
  // This would require accessing clipboard API
  // For Detox, you'd need to expose a test helper to read clipboard
  // Skipping actual verification in this example
});

When('I tap on "Add to Calendar" button', async () => {
  await confirmationScreen.tapAddToCalendarButton();
});

Then('an ICS file should be generated', async () => {
  // This would require verifying file system
  // For Detox, you'd need to expose a test helper to check files
  // Skipping actual verification in this example
});
```

---

## Detox Configuration

**Update `.detoxrc.js`**:

```javascript
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/warrendeleon.app',
      build:
        'xcodebuild -workspace ios/warrendeleon.xcworkspace -scheme warrendeleon -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081],
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_7_API_34',
      },
    },
  },
  configurations: {
    'ios.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
};
```

---

## Acceptance Criteria

**Test Coverage**:

- [ ] Happy path: Video call booking (30 minutes)
- [ ] Happy path: Phone call booking (60 minutes)
- [ ] Error scenario: Network failure during booking
- [ ] Error scenario: Server error during booking
- [ ] Error scenario: Validation errors on form
- [ ] Navigation: Back button clears data
- [ ] Navigation: Stack reset after confirmation
- [ ] Actions: Add to Calendar button
- [ ] Actions: Copy Google Meet link button

**Mock Strategy**:

- [ ] All API calls mocked (no real Supabase calls)
- [ ] Google Calendar API mocked (no real calendar integration)
- [ ] Mock data is deterministic (same results every run)
- [ ] Mock server resets between tests

**Test Reliability**:

- [ ] All scenarios pass consistently (0% flakiness)
- [ ] Tests run in isolation (no shared state)
- [ ] Full suite completes in <5 minutes
- [ ] Screenshots captured on failure

**Code Quality**:

- [ ] Page Object Model implemented for all screens
- [ ] Reusable step definitions
- [ ] Descriptive scenario names
- [ ] Clear assertions

---

## Dependencies

**Blocked By**:

- TASK-353 (Confirmation screen)
- TASK-354 (iCal generation)
- TASK-355 (Navigation integration)

**Depends On**:

- All booking flow screens must be implemented

**Blocks**:

- None

---

## Implementation Checklist

**Setup**:

- [ ] Create `e2e/features/booking-flow.feature` file
- [ ] Create page objects for all booking screens
- [ ] Create `e2e/mocks/` directory with mock data
- [ ] Set up mock server (intercept fetch calls)

**Scenarios**:

- [ ] Write Gherkin scenarios (8 scenarios minimum)
- [ ] Write step definitions for all steps
- [ ] Implement page object methods
- [ ] Implement mock responses

**Mocking**:

- [ ] Mock Supabase availability endpoint
- [ ] Mock Supabase booking endpoint
- [ ] Mock network errors
- [ ] Mock server errors
- [ ] Mock clipboard API
- [ ] Mock file system (ICS generation)

**Testing**:

- [ ] Run scenarios on iOS simulator
- [ ] Run scenarios on Android emulator
- [ ] Verify all scenarios pass
- [ ] Verify no flakiness (run 5 times)

**Validation**:

- [ ] Full test suite completes in <5 minutes
- [ ] All assertions pass
- [ ] Screenshots captured on failure
- [ ] No external API calls made

---

## Notes

**Why Mock Everything?**

- E2E tests must be deterministic (same results every run)
- Avoid dependency on external APIs (Supabase, Google Calendar)
- Faster test execution (no network latency)
- No risk of hitting API rate limits
- No risk of creating real bookings in production

**Mock Strategy**:

- Intercept `fetch` calls at the app level (not Detox level)
- Return predefined mock responses based on request URL/method
- Simulate network/server errors by changing mock responses
- Reset mocks between tests to avoid state pollution

**Page Object Model Benefits**:

- Encapsulates screen interactions (tap, type, verify)
- Reusable across multiple scenarios
- Single source of truth for selectors (testID)
- Easier to maintain when UI changes

**Cucumber/Gherkin Benefits**:

- Human-readable test scenarios
- Business stakeholders can understand tests
- Reusable step definitions
- Clear separation of "what" (scenario) vs "how" (step implementation)

**Future Enhancements**:

- Add visual regression testing (screenshot comparison)
- Add performance testing (measure screen transition times)
- Add accessibility testing (VoiceOver/TalkBack navigation)
- Add multi-language testing (run scenarios in all 5 languages)
