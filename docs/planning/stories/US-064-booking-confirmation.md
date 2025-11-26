# US-064: Booking Confirmation & Navigation

**User Story ID**: US-064
**Title**: Booking Confirmation & Navigation
**Epic**: [EPIC-031](../epics/EPIC-031-book-a-call.md)
**Status**: 📋 To Do
**Priority**: High
**Effort**: 15h
**Owner**: Warren de Leon
**Created**: 2025-11-25

---

## User Story

**As a** user,
**I want** confirmation of my booking and calendar integration,
**So that** I can track my scheduled meeting and add it to my personal calendar.

---

## Description

This user story covers the post-booking experience including the confirmation screen, calendar integration, navigation behaviour, Home screen entry points, internationalisation, and end-to-end testing.

After a user successfully books a meeting, they see a confirmation screen with:

- Success animation and booking summary
- Google Meet link (for video calls) or phone instructions (for phone calls)
- "Add to Calendar" button for iCal download
- "Done" button to return to Home

The navigation is designed to prevent users from accidentally re-booking by resetting the stack after confirmation.

---

## Scope

### In Scope

- Confirmation Screen with success animation
- iCal (.ics) file generation for "Add to Calendar"
- Navigation integration (stack reset, data clearing)
- Home Screen entry points ("Book a Call" and "My Bookings" buttons)
- i18n translations for all 5 languages
- E2E tests for the complete booking flow

### Out of Scope

- Booking list view (covered in US-065)
- Edit/cancel functionality (covered in US-065)
- Push notification reminders (future feature)

---

## Tasks

| Task ID                                                   | Title                                 | Effort | Status   | Dependencies             |
| --------------------------------------------------------- | ------------------------------------- | ------ | -------- | ------------------------ |
| [TASK-353](../tasks/TASK-353-confirmation-screen.md)      | Confirmation Screen                   | 3h     | 📋 To Do | US-063                   |
| [TASK-354](../tasks/TASK-354-ical-generation.md)          | iCal generation for "Add to Calendar" | 2h     | 📋 To Do | TASK-353                 |
| [TASK-355](../tasks/TASK-355-navigation-integration.md)   | Navigation integration (stack reset)  | 2h     | 📋 To Do | US-063                   |
| [TASK-356](../tasks/TASK-356-home-screen-entry-points.md) | Home Screen entry points              | 2h     | 📋 To Do | None                     |
| [TASK-357](../tasks/TASK-357-i18n-translations.md)        | i18n translations (5 languages)       | 2h     | 📋 To Do | US-063, TASK-353         |
| [TASK-358](../tasks/TASK-358-e2e-booking-flow-tests.md)   | E2E tests for booking flow            | 4h     | 📋 To Do | All US-063, US-064 tasks |

---

## Screen Mockups

### Confirmation Screen (Video Call)

```
┌─────────────────────────────────────────────┐
│                                             │
│                    ✓                        │
│             Booking Confirmed!              │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  📹 Video Call                              │
│  ─────────────────────                      │
│                                             │
│  📅 Wednesday, 15 January 2025              │
│  🕐 10:30 - 11:00 (Europe/Madrid)           │
│  📝 Project Discussion                      │
│                                             │
│  ─────────────────────                      │
│                                             │
│  🔗 Google Meet                             │
│  ┌─────────────────────────────────────┐    │
│  │ meet.google.com/abc-defg-hij    📋 │    │
│  └─────────────────────────────────────┘    │
│  Tap to copy link                           │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │       📅 Add to Calendar            │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │             Done                    │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### Confirmation Screen (Phone Call)

```
┌─────────────────────────────────────────────┐
│                                             │
│                    ✓                        │
│             Booking Confirmed!              │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  📞 Phone Call                              │
│  ─────────────────────                      │
│                                             │
│  📅 Wednesday, 15 January 2025              │
│  🕐 10:30 - 11:00 (Europe/Madrid)           │
│  📝 Quick Catch-up                          │
│                                             │
│  ─────────────────────                      │
│                                             │
│  📱 Call Warren at the scheduled time       │
│                                             │
│  Your phone number has been shared          │
│  with Warren for this meeting.              │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │       📅 Add to Calendar            │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │             Done                    │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### Home Screen Entry Points

```
┌─────────────────────────────────────────────┐
│                 Home Screen                  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │           Contact Warren               │  │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐  │  │
│  │  │  💬      │ │  📅      │ │  📋    │  │  │
│  │  │  Chat    │ │  Book    │ │ My     │  │  │
│  │  │          │ │  a Call  │ │Bookings│  │  │
│  │  │ green500 │ │ pink700  │ │blue500 │  │  │
│  │  └──────────┘ └──────────┘ └────────┘  │  │
│  └────────────────────────────────────────┘  │
│                                              │
└─────────────────────────────────────────────┘
```

---

## Navigation Behaviour

### Stack Reset After Confirmation

After booking is confirmed, the navigation stack is reset to prevent back navigation through the booking flow:

```
BEFORE: [Home, Duration, Calendar, Slots, Details]
AFTER:  [Home, Confirmation]

Back button → Home (not Details)
```

### Data Clearing Rules

| User Action                    | Result                         |
| ------------------------------ | ------------------------------ |
| Complete booking               | Stack reset, form data cleared |
| Press "Done" on confirmation   | Navigate to Home               |
| Leave booking flow mid-way     | Form data cleared              |
| Android back from confirmation | Navigate to Home               |

### Navigation Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     NAVIGATION BEHAVIOUR                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BOOKING FLOW (data preserved on back):                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│  │ Duration │←──▶│ Calendar │←──▶│  Slots   │←──▶│ Details  │   │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘   │
│                                                        │         │
│                                              Book Meeting         │
│                                                        │         │
│                                                        ▼         │
│  POST-CONFIRMATION (stack reset):                                │
│  ┌──────────┐    ┌──────────┐                                    │
│  │   Home   │←───│  Confirm │  ← Back goes to Home               │
│  └──────────┘    └──────────┘                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## i18n Languages

Translations required for 5 languages:

| Code | Language     | Native Name |
| ---- | ------------ | ----------- |
| `en` | English (UK) | English     |
| `es` | Spanish      | Español     |
| `ca` | Catalan      | Català      |
| `pl` | Polish       | Polski      |
| `tl` | Tagalog      | Tagalog     |

### Key Categories

- `booking.title` - Main headings
- `booking.duration.*` - Duration selection
- `booking.calendar.*` - Calendar picker
- `booking.timeSlots.*` - Time slot selection
- `booking.details.*` - Meeting details form
- `booking.confirmation.*` - Confirmation screen
- `booking.myBookings.*` - Bookings list
- `booking.errors.*` - Error messages

---

## E2E Test Scenarios

### Happy Path

```gherkin
Feature: Book a Call

  Background:
    Given I am logged in as a verified user
    And the booking API is mocked

  Scenario: Successfully book a video call
    When I tap "Book a Call" on the Home screen
    And I select "30 minutes" duration
    And I select a date with available slots
    And I select the first available time slot
    And I select "Video Call" as meeting type
    And I enter "Project Discussion" as the title
    And I tap "Book Meeting"
    Then I should see "Booking Confirmed!"
    And I should see a Google Meet link
```

### Error Scenarios

```gherkin
  Scenario: Slot becomes unavailable during booking
    Given the selected slot will return unavailable on submit
    When I complete the booking form
    And I tap "Book Meeting"
    Then I should see "This slot is no longer available"
    And I should be on the time slots screen
```

---

## Acceptance Criteria

### Confirmation Screen (TASK-353)

- [ ] Success checkmark animation displayed
- [ ] Booking summary shows date, time, duration, type
- [ ] Video calls show copyable Google Meet link
- [ ] Phone calls show "Call Warren" message
- [ ] "Add to Calendar" button works
- [ ] "Done" button navigates to Home
- [ ] EAA accessibility compliance
- [ ] RNTL tests with 100% coverage
- [ ] Storybook stories for video and phone variants

### iCal Generation (TASK-354)

- [ ] Valid RFC 5545-compliant ICS file generated
- [ ] Event includes correct date, time, duration
- [ ] Event includes meeting link or phone number
- [ ] 15-minute reminder included
- [ ] Cross-platform download/share works (iOS/Android)

### Navigation Integration (TASK-355)

- [ ] Stack resets to [Home, Confirmation] after booking
- [ ] Back from Confirmation goes to Home
- [ ] Form data cleared after booking
- [ ] beforeRemove listener clears data on exit
- [ ] RootStackParamList updated with booking screens

### Home Screen Entry Points (TASK-356)

- [ ] "Book a Call" button with calendar icon (pink.700)
- [ ] "My Bookings" button with list icon (blue.500)
- [ ] Buttons navigate to correct screens
- [ ] i18n labels in all 5 languages

### i18n Translations (TASK-357)

- [ ] All booking.\* keys translated
- [ ] Natural, conversational tone in all languages
- [ ] British English spelling in en.json
- [ ] No AI attribution in translation comments

### E2E Tests (TASK-358)

- [ ] Happy path scenario passes
- [ ] Slot unavailable scenario passes
- [ ] Navigation scenarios pass
- [ ] All API calls use mocks (no real Google Calendar)
- [ ] Tests run in under 5 minutes

---

## Dependencies

### Blocked By

| Dependency | Description     | Status   |
| ---------- | --------------- | -------- |
| US-062     | Backend APIs    | 📋 To Do |
| US-063     | Booking Flow UI | 📋 To Do |

### Blocks

| Item   | Description                                           |
| ------ | ----------------------------------------------------- |
| US-065 | View & Manage Bookings (shares confirmation patterns) |

---

## Notes

- iCal uses `.ics` file extension with `text/calendar` MIME type
- iOS uses base64 data URI for download, Android writes to filesystem
- E2E tests use MSW (Mock Service Worker) to intercept API calls
- Never hit real Google Calendar API in tests

---

**Last Updated**: 2025-11-25
