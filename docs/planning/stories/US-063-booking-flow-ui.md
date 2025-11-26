# US-063: Booking Flow UI

**User Story ID**: US-063
**Title**: Booking Flow UI
**Epic**: [EPIC-031](../epics/EPIC-031-book-a-call.md)
**Status**: 📋 To Do
**Priority**: Critical
**Effort**: 21h
**Owner**: Warren de Leon
**Created**: 2025-11-25

---

## User Story

**As a** user,
**I want** to select a duration, date, and time slot,
**So that** I can book a call with Warren at a convenient time.

---

## Description

This user story covers the complete booking flow UI from duration selection through to meeting details entry. Users navigate through 4 screens to complete their booking:

1. **Duration Selection**: Choose meeting length (15, 30, 45, 60, or 90 minutes)
2. **Calendar Picker**: Select an available date
3. **Time Slots**: Choose from available time slots for the selected date
4. **Meeting Details**: Select meeting type (phone/video), enter title and description

All screens follow iOS-first design principles with GlueStack UI tokens and full EAA accessibility compliance.

---

## Scope

### In Scope

- Booking API client with Axios and Zod validation
- Redux store for booking state management
- Duration Selection Screen with 5 duration options
- Calendar Picker Screen with available/unavailable day styling
- Time Slots Screen with timezone display
- Meeting Details Screen with meeting type selector and form inputs
- RNTL tests for all components (100% coverage)
- Storybook stories for all screens

### Out of Scope

- Confirmation screen (covered in US-064)
- Navigation integration (covered in US-064)
- i18n translations (covered in US-064)

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      BOOKING FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐        ┌──────────────┐                       │
│  │   Duration   │───────▶│   Calendar   │                       │
│  │   Selection  │        │    Picker    │                       │
│  │              │        │              │                       │
│  │  ○ 15 min    │        │  [Calendar]  │                       │
│  │  ● 30 min    │        │              │                       │
│  │  ○ 45 min    │        │  ● Available │                       │
│  │  ○ 60 min    │        │  ○ Unavail.  │                       │
│  │  ○ 90 min    │        │              │                       │
│  └──────────────┘        └──────────────┘                       │
│         │                       │                                │
│         │ Select                │ Select                         │
│         ▼                       ▼                                │
│  ┌──────────────┐        ┌──────────────┐                       │
│  │  Time Slots  │◀───────│   Meeting    │                       │
│  │              │        │   Details    │                       │
│  │  ○ 09:00     │        │              │                       │
│  │  ● 09:30     │        │ Type: Video  │                       │
│  │  ○ 10:00     │        │ Title: ...   │                       │
│  │  ○ 10:30     │        │ Desc: ...    │                       │
│  │              │        │              │                       │
│  └──────────────┘        └──────────────┘                       │
│                                 │                                │
│                                 │ Book Meeting                   │
│                                 ▼                                │
│                          [Confirmation]                          │
│                          (US-064)                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tasks

| Task ID                                                    | Title                                     | Effort | Status   | Dependencies |
| ---------------------------------------------------------- | ----------------------------------------- | ------ | -------- | ------------ |
| [TASK-347](../tasks/TASK-347-booking-api-client.md)        | Booking API client + Zod schemas          | 3h     | 📋 To Do | US-062       |
| [TASK-348](../tasks/TASK-348-booking-redux-store.md)       | Redux store (reducer, actions, selectors) | 3h     | 📋 To Do | TASK-347     |
| [TASK-349](../tasks/TASK-349-duration-selection-screen.md) | Duration Selection Screen                 | 3h     | 📋 To Do | TASK-348     |
| [TASK-350](../tasks/TASK-350-calendar-picker-screen.md)    | Calendar Picker Screen                    | 4h     | 📋 To Do | TASK-348     |
| [TASK-351](../tasks/TASK-351-time-slots-screen.md)         | Time Slots Screen                         | 4h     | 📋 To Do | TASK-348     |
| [TASK-352](../tasks/TASK-352-meeting-details-screen.md)    | Meeting Details Screen                    | 4h     | 📋 To Do | TASK-348     |

---

## iOS-First Design Requirements

### Colour Tokens (GlueStack)

| Purpose            | Token          | Usage                           |
| ------------------ | -------------- | ------------------------------- |
| Primary            | `$blue500`     | Links, primary actions          |
| Success            | `$green500`    | Available dates, confirmations  |
| Destructive        | `$red500`      | Cancel actions, errors          |
| Secondary          | `$coolGray500` | Secondary text, disabled states |
| Background (light) | `$coolGray100` | Screen backgrounds              |
| Background (dark)  | `$black`       | Dark mode backgrounds           |

### Typography Tokens

| Style          | Token                        | Usage           |
| -------------- | ---------------------------- | --------------- |
| Large Title    | `fontSize="$3xl"`            | Screen titles   |
| Body           | `fontSize="$md"`             | Main content    |
| Footnote       | `fontSize="$xs"`             | Captions, hints |
| Section Header | `fontSize="$xs"` + uppercase | Group headers   |

### Spacing Tokens

| Size   | Token | Usage                   |
| ------ | ----- | ----------------------- |
| Small  | `$2`  | 8px - tight spacing     |
| Medium | `$4`  | 16px - standard padding |
| Large  | `$6`  | 24px - section spacing  |

### Touch Targets

- Minimum `minHeight="$12"` (48pt for EAA compliance)
- All interactive elements must be easily tappable

---

## Screen Mockups

### Duration Selection Screen

```
┌─────────────────────────────────────────────┐
│  ← Back              Select Duration        │
├─────────────────────────────────────────────┤
│                                             │
│  How long would you like to meet?           │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  ○  15 minutes                      │    │
│  ├─────────────────────────────────────┤    │
│  │  ●  30 minutes                      │    │
│  ├─────────────────────────────────────┤    │
│  │  ○  45 minutes                      │    │
│  ├─────────────────────────────────────┤    │
│  │  ○  1 hour                          │    │
│  ├─────────────────────────────────────┤    │
│  │  ○  1 hour 30 minutes               │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │           Continue                  │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### Time Slots Screen

```
┌─────────────────────────────────────────────┐
│  ← Back              Select Time            │
├─────────────────────────────────────────────┤
│                                             │
│  Wednesday, 15 January 2025                 │
│  Times shown in Europe/Madrid (GMT+1)       │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  ○  10:00                           │    │
│  ├─────────────────────────────────────┤    │
│  │  ●  10:30                           │    │
│  ├─────────────────────────────────────┤    │
│  │  ○  11:00                           │    │
│  ├─────────────────────────────────────┤    │
│  │  ○  11:30                           │    │
│  ├─────────────────────────────────────┤    │
│  │  ○  14:00                           │    │
│  ├─────────────────────────────────────┤    │
│  │  ○  14:30                           │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │           Continue                  │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Acceptance Criteria

### API Client (TASK-347)

- [ ] BookingApiClient class with Axios instance
- [ ] Zod schemas for all API requests/responses
- [ ] Type exports for all booking types
- [ ] Error handling with custom BookingApiError

### Redux Store (TASK-348)

- [ ] BookingState interface with form data and API states
- [ ] Async thunks for fetchAvailableDates, fetchTimeSlots, createBooking
- [ ] Synchronous actions for form field updates
- [ ] clearBookingForm action for state reset
- [ ] Memoised selectors for derived state

### Duration Selection (TASK-349)

- [ ] 5 duration options displayed (15, 30, 45, 60, 90 min)
- [ ] Selection persisted to Redux store
- [ ] Continue button enabled when duration selected
- [ ] EAA accessibility compliance
- [ ] RNTL tests with 100% coverage
- [ ] Storybook stories for all states

### Calendar Picker (TASK-350)

- [ ] Monthly calendar view with navigation
- [ ] Available dates styled distinctly from unavailable
- [ ] Today highlighted
- [ ] Date selection updates Redux store
- [ ] Loading/error/empty states handled
- [ ] EAA accessibility compliance
- [ ] RNTL tests with 100% coverage
- [ ] Storybook stories for all states

### Time Slots (TASK-351)

- [ ] Slots fetched from API for selected date
- [ ] Timezone displayed with abbreviation
- [ ] Time format based on device locale (12h/24h)
- [ ] Slot intervals match selected duration
- [ ] Loading/error/empty states handled
- [ ] EAA accessibility compliance
- [ ] RNTL tests with 100% coverage
- [ ] Storybook stories for all states

### Meeting Details (TASK-352)

- [ ] Meeting type selector (Phone/Video)
- [ ] Title input (required, validated)
- [ ] Description textarea (optional)
- [ ] Honeypot field (hidden, for spam prevention)
- [ ] Submit throttling (500ms debounce)
- [ ] Booking summary displayed
- [ ] Loading state during submission
- [ ] EAA accessibility compliance
- [ ] RNTL tests with 100% coverage
- [ ] Storybook stories for all states

---

## Dependencies

### Blocked By

| Dependency | Description                                     | Status   |
| ---------- | ----------------------------------------------- | -------- |
| US-062     | Backend APIs (get-availability, create-booking) | 📋 To Do |

### Blocks

| Item   | Description                       |
| ------ | --------------------------------- |
| US-064 | Booking Confirmation & Navigation |

---

## Notes

- Back navigation preserves form data (user can go back and change selections)
- Time format is locale-aware (24h for Spain, 12h for UK)
- Slot intervals match the selected duration (30 min = 30 min intervals)
- All screens use GlueStack UI components with NativeWind tokens
- testID props on all interactive elements for RNTL/Detox testing

---

**Last Updated**: 2025-11-25
