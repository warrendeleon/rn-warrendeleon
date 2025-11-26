# US-065: View & Manage Bookings

**User Story ID**: US-065
**Title**: View & Manage Bookings
**Epic**: [EPIC-031](../epics/EPIC-031-book-a-call.md)
**Status**: 📋 To Do
**Priority**: High
**Effort**: 28h
**Owner**: Warren de Leon
**Created**: 2025-11-25

---

## User Story

**As a** user,
**I want** to view, edit, and cancel my bookings,
**So that** I can manage my scheduled meetings with Warren.

---

## Description

This user story covers the complete booking management experience including viewing a list of bookings, viewing booking details, editing bookings, and cancelling bookings. It also includes the backend Edge Functions for these operations.

Key features:

- **My Bookings Screen**: List of user's bookings with iOS Mail-style swipe actions
- **Booking Detail Screen**: Full booking details with tappable links (Meet, phone, maps)
- **Edit Booking Screen**: Pre-populated form for modifying booking details
- **Deep Link Handling**: Open phone calls, Google Meet, and maps from booking details

All screens follow iOS-first design with swipe gestures that match iOS Mail app behaviour.

---

## Scope

### In Scope

- Get User Bookings Edge Function
- Update Booking Edge Function
- Cancel Booking Edge Function
- Swipe-to-reveal component (iOS Mail style)
- My Bookings Screen with booking list
- Booking Detail Screen with tappable links
- Edit Booking Screen with validation
- Deep link handling (tel://, maps://, meet)
- E2E tests for all manage booking flows

### Out of Scope

- Push notification reminders (future feature)
- Recurring bookings (future feature)
- In-person meeting locations (future feature)

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   MANAGE BOOKINGS FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐        ┌──────────────┐                       │
│  │     Home     │───────▶│  My Bookings │                       │
│  │    Screen    │        │    Screen    │                       │
│  └──────────────┘        └──────┬───────┘                       │
│                                 │                                │
│                    ┌────────────┼────────────┐                   │
│                    │            │            │                   │
│              Swipe Edit    Tap Item    Swipe Cancel              │
│                    │            │            │                   │
│                    ▼            ▼            ▼                   │
│  ┌──────────────┐  │  ┌──────────────┐  ┌──────────────┐        │
│  │    Edit      │◀─┘  │   Booking    │  │   Cancel     │        │
│  │   Booking    │◀────│    Detail    │  │  Confirm     │        │
│  │   Screen     │     │   Screen     │  │   Dialog     │        │
│  └──────────────┘     └──────┬───────┘  └──────────────┘        │
│         │                    │                                   │
│         │               Deep Links                               │
│         │            ┌───────┼───────┐                          │
│         │            │       │       │                          │
│         │            ▼       ▼       ▼                          │
│         │        📞 Phone  🔗 Meet  📍 Maps                     │
│         │                                                        │
│         └───────────▶ Save Changes                               │
│                            │                                     │
│                            ▼                                     │
│                   Updated Booking                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tasks

| Task ID                                                          | Title                           | Effort | Status   | Dependencies       |
| ---------------------------------------------------------------- | ------------------------------- | ------ | -------- | ------------------ |
| [TASK-359](../tasks/TASK-359-get-user-bookings-edge-function.md) | Get User Bookings Edge Function | 2h     | 📋 To Do | TASK-342           |
| [TASK-360](../tasks/TASK-360-update-booking-edge-function.md)    | Update Booking Edge Function    | 3h     | 📋 To Do | TASK-342, TASK-344 |
| [TASK-361](../tasks/TASK-361-cancel-booking-edge-function.md)    | Cancel Booking Edge Function    | 2h     | 📋 To Do | TASK-342           |
| [TASK-362](../tasks/TASK-362-swipe-to-reveal-component.md)       | Swipe-to-reveal component       | 3h     | 📋 To Do | None               |
| [TASK-363](../tasks/TASK-363-my-bookings-screen.md)              | My Bookings Screen              | 4h     | 📋 To Do | TASK-359, TASK-362 |
| [TASK-364](../tasks/TASK-364-booking-detail-screen.md)           | Booking Detail Screen           | 4h     | 📋 To Do | TASK-359, TASK-366 |
| [TASK-365](../tasks/TASK-365-edit-booking-screen.md)             | Edit Booking Screen             | 4h     | 📋 To Do | TASK-360           |
| [TASK-366](../tasks/TASK-366-deep-link-handling.md)              | Deep link handling              | 2h     | 📋 To Do | None               |
| [TASK-367](../tasks/TASK-367-e2e-manage-bookings-tests.md)       | E2E tests for manage bookings   | 4h     | 📋 To Do | All previous tasks |

---

## Screen Mockups

### My Bookings Screen

```
┌─────────────────────────────────────────────┐
│  My Bookings                    [+ Book]    │
├─────────────────────────────────────────────┤
│                                             │
│  UPCOMING                                   │
│  ┌─────────────────────────────────────┐    │
│  │ 📹 Video Call                       │    │
│  │ Wednesday, 15 Jan 2025 at 10:30     │    │
│  │ Project Discussion                   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 📞 Phone Call                       │    │
│  │ Friday, 18 Jan 2025 at 14:30        │    │
│  │ Quick Catch-up                       │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  PAST                                       │
│  ┌─────────────────────────────────────┐    │
│  │ 📹 Video Call                       │    │
│  │ Monday, 6 Jan 2025 at 09:00         │    │
│  │ Initial Discussion                   │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### Swipe Actions (iOS Mail Style)

```
← Swipe right to reveal actions

┌──────────────┬──────────────┬─────────────────────────────────┐
│              │              │                                 │
│    Edit      │    Cancel    │   📹 Video Call                 │
│   ($blue500) │   ($red500)  │   Wednesday, 15 Jan 2025...     │
│              │              │                                 │
└──────────────┴──────────────┴─────────────────────────────────┘
```

### Booking Detail Screen

```
┌─────────────────────────────────────────────┐
│  ← Back              Booking        Edit    │
├─────────────────────────────────────────────┤
│                                             │
│  📹 Video Call                              │
│  ─────────────────────                      │
│                                             │
│  DATE & TIME                                │
│  ┌─────────────────────────────────────┐    │
│  │ Wednesday, 15 January 2025          │    │
│  │ 10:30 - 11:00 (Europe/Madrid)       │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  DESCRIPTION                                │
│  ┌─────────────────────────────────────┐    │
│  │ Project Discussion                   │    │
│  │ Let's discuss the new feature...     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  MEETING LINK                               │
│  ┌─────────────────────────────────────┐    │
│  │ 🔗 meet.google.com/abc-defg-hij  →  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ─────────────────────                      │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │       📅 Add to Calendar            │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │       Cancel Booking                │    │
│  │           ($red500)                 │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### Edit Booking Screen

```
┌─────────────────────────────────────────────┐
│  ← Cancel          Edit Booking       Save  │
├─────────────────────────────────────────────┤
│                                             │
│  MEETING TYPE                               │
│  ┌─────────────────────────────────────┐    │
│  │  📹 Video Call                   →  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  DATE & TIME                                │
│  ┌─────────────────────────────────────┐    │
│  │  Wed, 15 Jan 2025 at 10:30       →  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  DESCRIPTION                                │
│  ┌─────────────────────────────────────┐    │
│  │ Project Discussion                   │    │
│  │                                      │    │
│  │ Let's discuss the new feature...     │    │
│  │                                      │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ⓘ Duration cannot be changed.              │
│    Create a new booking for a               │
│    different duration.                      │
│                                             │
└─────────────────────────────────────────────┘
```

---

## iOS-First Design Requirements

### Swipe Actions

| Action | Position      | Colour     | Icon   |
| ------ | ------------- | ---------- | ------ |
| Edit   | Left (first)  | `$blue500` | Pencil |
| Cancel | Left (second) | `$red500`  | Trash  |

### Tappable Links

| Link Type   | Deep Link Format                                    | Fallback       |
| ----------- | --------------------------------------------------- | -------------- |
| Phone       | `tel://+447XXXXXXXXX`                               | Open phone app |
| Google Meet | `https://meet.google.com/xxx`                       | Open browser   |
| Google Maps | `maps://?q=lat,lng` (iOS) / `geo:lat,lng` (Android) | Open browser   |

### Touch Targets

- All tappable items: `minHeight="$12"` (48pt)
- Swipe action buttons: `minWidth="$20"` (80pt)
- List items: Full width tappable area

---

## Acceptance Criteria

### Get User Bookings API (TASK-359)

- [ ] Returns user's bookings ordered by start_time
- [ ] Filters by status (confirmed, upcoming)
- [ ] RLS policy ensures users only see own bookings
- [ ] Pagination support for large lists
- [ ] Zod schema validation

### Update Booking API (TASK-360)

- [ ] Validates new date/time is available
- [ ] Updates Google Calendar event
- [ ] Prevents changing duration
- [ ] Audit log entry created
- [ ] Error handling for unavailable slots

### Cancel Booking API (TASK-361)

- [ ] Updates booking status to 'cancelled'
- [ ] Deletes Google Calendar event
- [ ] Audit log entry created
- [ ] Idempotent (safe to call multiple times)

### Swipe Component (TASK-362)

- [ ] Swipe right reveals Edit and Cancel actions
- [ ] iOS Mail-style animation
- [ ] Platform-specific spring physics
- [ ] Haptic feedback on iOS
- [ ] Accessible to screen readers
- [ ] RNTL tests with 100% coverage
- [ ] Storybook stories for all states

### My Bookings Screen (TASK-363)

- [ ] List of bookings with swipe actions
- [ ] "Book Another" button in header
- [ ] Empty state with CTA
- [ ] Pull-to-refresh
- [ ] Loading/error states
- [ ] Grouped by Upcoming/Past
- [ ] RNTL tests with 100% coverage
- [ ] Storybook stories for all states

### Booking Detail Screen (TASK-364)

- [ ] Full booking details displayed
- [ ] Edit button in header (top-right)
- [ ] Tappable Meet/phone/maps links
- [ ] "Add to Calendar" button
- [ ] "Cancel Booking" button (red)
- [ ] Confirmation dialog for cancel
- [ ] RNTL tests with 100% coverage
- [ ] Storybook stories for all states

### Edit Booking Screen (TASK-365)

- [ ] Pre-populated with existing booking data
- [ ] Duration shown but not editable
- [ ] Date/time picker validates availability
- [ ] Meeting type selector
- [ ] Description textarea
- [ ] "Save Changes" button
- [ ] Unsaved changes warning
- [ ] RNTL tests with 100% coverage
- [ ] Storybook stories for all states

### Deep Link Handling (TASK-366)

- [ ] Phone calls open phone app
- [ ] Google Meet opens app or browser
- [ ] Maps opens maps app or browser
- [ ] Platform-specific handling (iOS/Android)
- [ ] Graceful fallbacks for missing apps

### E2E Tests (TASK-367)

- [ ] View bookings scenario
- [ ] Cancel booking scenario
- [ ] Edit booking scenario
- [ ] Swipe gesture tests
- [ ] Deep link verification
- [ ] All APIs mocked (no real Google Calendar)

---

## Dependencies

### Blocked By

| Dependency | Description                         | Status   |
| ---------- | ----------------------------------- | -------- |
| US-062     | Backend APIs (database, auth)       | 📋 To Do |
| US-063     | Booking Flow UI (shared components) | 📋 To Do |
| US-064     | Confirmation (shared patterns)      | 📋 To Do |

### Blocks

| Item | Description                  |
| ---- | ---------------------------- |
| None | Final user story in EPIC-031 |

---

## Notes

- Edit flow is separate from create flow (user navigates from My Bookings, not booking flow)
- Duration cannot be changed when editing (constraint from Google Calendar)
- Cancel requires confirmation dialog before API call
- Swipe gestures use react-native-gesture-handler for smooth animations
- Deep links use React Native's Linking API

---

**Last Updated**: 2025-11-25
