# EPIC-031: Book a Call

**Epic ID**: EPIC-031
**Title**: Book a Call - Calendly-like Scheduling System
**Status**: 📋 To Do
**Priority**: High
**Owner**: Warren de Leon
**Created**: 2025-11-25
**Target Release**: Q1 2026

---

## Overview

Build a Calendly-like booking system that allows authenticated users to book phone calls or video meetings with Warren (portfolio owner). The system integrates with Google Calendar for real-time availability checking and automatic event creation.

**Key Architecture Decision**: Supabase Edge Functions handle all Google Calendar integration, keeping API keys secure and enabling future features without app updates.

---

## Business Value

- **User Engagement**: Provides direct communication channel with portfolio owner
- **Professional Image**: Demonstrates full-stack capabilities with production-grade scheduling
- **Conversion Tool**: Enables potential clients/employers to easily schedule discussions
- **Portfolio Showcase**: Real-world feature that showcases React Native + Supabase + Google API integration

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Native App                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐│
│  │ Duration    │→│  Calendar   │→│ Time Slots  │→│ Meeting    ││
│  │ Screen      │ │  Screen     │ │ Screen      │ │ Details    ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘│
│                         │                                       │
│                         ▼                                       │
│                 ┌───────────────┐                               │
│                 │ BookingAPI    │                               │
│                 │ (Axios Client)│                               │
│                 └───────┬───────┘                               │
└─────────────────────────┼───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Backend                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Edge Functions (Deno)                    │ │
│  │  ┌─────────────────┐  ┌───────────────┐  ┌────────────────┐│ │
│  │  │ get-availability│  │ create-booking│  │ admin-oauth    ││ │
│  │  └────────┬────────┘  └───────┬───────┘  └────────────────┘│ │
│  └───────────┼───────────────────┼────────────────────────────┘ │
│              │                   │                               │
│  ┌───────────┼───────────────────┼────────────────────────────┐ │
│  │           ▼                   ▼              PostgreSQL    │ │
│  │  ┌─────────────┐      ┌─────────────┐     ┌──────────────┐│ │
│  │  │ admin_oauth │      │  bookings   │     │booking_config││ │
│  │  │ (tokens)    │      │ (records)   │     │(future)      ││ │
│  │  └─────────────┘      └─────────────┘     └──────────────┘│ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
               ┌────────────────────┐
               │ Google Calendar API│
               │  - freebusy.query  │
               │  - events.insert   │
               │  - Meet generation │
               └────────────────────┘
```

---

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BOOKING FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │   Home   │───▶│ Duration │───▶│ Calendar │───▶│  Slots   │  │
│  │  Screen  │    │  Screen  │    │  Screen  │    │  Screen  │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                        │         │
│                                                        ▼         │
│  ┌──────────┐    ┌──────────┐                  ┌──────────┐     │
│  │   Home   │◀───│  Confirm │◀─────────────────│ Details  │     │
│  │  Screen  │    │  Screen  │                  │  Screen  │     │
│  └──────────┘    └──────────┘                  └──────────┘     │
│       │                                                          │
│       ▼                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │    My    │───▶│ Booking  │───▶│   Edit   │                   │
│  │ Bookings │    │  Detail  │    │ Booking  │                   │
│  └──────────┘    └──────────┘    └──────────┘                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## iOS-First Design Mandate

**All designs MUST look like native Apple iOS apps**, even on Android devices.

### Design Requirements

| Requirement       | Implementation                                                             |
| ----------------- | -------------------------------------------------------------------------- |
| **Colours**       | GlueStack tokens only (`$blue500`, `$green500`, `$red500`, `$coolGray500`) |
| **Typography**    | GlueStack tokens (`fontSize="$md"`, `fontSize="$xs"`)                      |
| **Spacing**       | GlueStack tokens (`p="$4"`, `mt="$6"`) - NEVER pixels                      |
| **Touch Targets** | Minimum `minHeight="$12"` (48pt for EAA compliance)                        |
| **UI Patterns**   | iOS-style grouped lists, segmented controls, action sheets                 |
| **Swipe Actions** | iOS Mail-style swipe-to-reveal (Edit blue, Cancel red)                     |

### DO NOT Use

- Material Design patterns
- FABs (Floating Action Buttons)
- Android-specific components
- Hex colours or pixel values
- Hard-coded numbers

---

## User Stories

| ID                                                  | Title                             | Priority | Effort | Status   |
| --------------------------------------------------- | --------------------------------- | -------- | ------ | -------- |
| [US-062](../stories/US-062-booking-backend.md)      | Booking Backend (Edge Functions)  | Critical | 15h    | 📋 To Do |
| [US-063](../stories/US-063-booking-flow-ui.md)      | Booking Flow UI                   | Critical | 21h    | 📋 To Do |
| [US-064](../stories/US-064-booking-confirmation.md) | Booking Confirmation & Navigation | High     | 15h    | 📋 To Do |
| [US-065](../stories/US-065-manage-bookings.md)      | View & Manage Bookings            | High     | 28h    | 📋 To Do |

---

## Tasks Summary

### US-062: Booking Backend (15h)

| Task ID                                                         | Title                          | Effort | Status   |
| --------------------------------------------------------------- | ------------------------------ | ------ | -------- |
| [TASK-342](../tasks/TASK-342-database-schema.md)                | Database schema + migrations   | 2h     | 📋 To Do |
| [TASK-343](../tasks/TASK-343-admin-oauth-edge-function.md)      | Admin OAuth Edge Function      | 4h     | 📋 To Do |
| [TASK-344](../tasks/TASK-344-get-availability-edge-function.md) | Get Availability Edge Function | 4h     | 📋 To Do |
| [TASK-345](../tasks/TASK-345-create-booking-edge-function.md)   | Create Booking Edge Function   | 4h     | 📋 To Do |
| [TASK-346](../tasks/TASK-346-admin-google-oauth-setup.md)       | Admin Google OAuth setup       | 1h     | 📋 To Do |

### US-063: Booking Flow UI (21h)

| Task ID                                                    | Title                                     | Effort | Status   |
| ---------------------------------------------------------- | ----------------------------------------- | ------ | -------- |
| [TASK-347](../tasks/TASK-347-booking-api-client.md)        | Booking API client + Zod schemas          | 3h     | 📋 To Do |
| [TASK-348](../tasks/TASK-348-booking-redux-store.md)       | Redux store (reducer, actions, selectors) | 3h     | 📋 To Do |
| [TASK-349](../tasks/TASK-349-duration-selection-screen.md) | Duration Selection Screen                 | 3h     | 📋 To Do |
| [TASK-350](../tasks/TASK-350-calendar-picker-screen.md)    | Calendar Picker Screen                    | 4h     | 📋 To Do |
| [TASK-351](../tasks/TASK-351-time-slots-screen.md)         | Time Slots Screen                         | 4h     | 📋 To Do |
| [TASK-352](../tasks/TASK-352-meeting-details-screen.md)    | Meeting Details Screen                    | 4h     | 📋 To Do |

### US-064: Booking Confirmation & Navigation (15h)

| Task ID                                                   | Title                                 | Effort | Status   |
| --------------------------------------------------------- | ------------------------------------- | ------ | -------- |
| [TASK-353](../tasks/TASK-353-confirmation-screen.md)      | Confirmation Screen                   | 3h     | 📋 To Do |
| [TASK-354](../tasks/TASK-354-ical-generation.md)          | iCal generation for "Add to Calendar" | 2h     | 📋 To Do |
| [TASK-355](../tasks/TASK-355-navigation-integration.md)   | Navigation integration (stack reset)  | 2h     | 📋 To Do |
| [TASK-356](../tasks/TASK-356-home-screen-entry-points.md) | Home Screen entry points              | 2h     | 📋 To Do |
| [TASK-357](../tasks/TASK-357-i18n-translations.md)        | i18n translations (5 languages)       | 2h     | 📋 To Do |
| [TASK-358](../tasks/TASK-358-e2e-booking-flow-tests.md)   | E2E tests for booking flow            | 4h     | 📋 To Do |

### US-065: View & Manage Bookings (28h)

| Task ID                                                          | Title                                      | Effort | Status   |
| ---------------------------------------------------------------- | ------------------------------------------ | ------ | -------- |
| [TASK-359](../tasks/TASK-359-get-user-bookings-edge-function.md) | Get User Bookings Edge Function            | 2h     | 📋 To Do |
| [TASK-360](../tasks/TASK-360-update-booking-edge-function.md)    | Update Booking Edge Function               | 3h     | 📋 To Do |
| [TASK-361](../tasks/TASK-361-cancel-booking-edge-function.md)    | Cancel Booking Edge Function               | 2h     | 📋 To Do |
| [TASK-362](../tasks/TASK-362-swipe-to-reveal-component.md)       | Swipe-to-reveal component (iOS Mail style) | 3h     | 📋 To Do |
| [TASK-363](../tasks/TASK-363-my-bookings-screen.md)              | My Bookings Screen                         | 4h     | 📋 To Do |
| [TASK-364](../tasks/TASK-364-booking-detail-screen.md)           | Booking Detail Screen                      | 4h     | 📋 To Do |
| [TASK-365](../tasks/TASK-365-edit-booking-screen.md)             | Edit Booking Screen                        | 4h     | 📋 To Do |
| [TASK-366](../tasks/TASK-366-deep-link-handling.md)              | Deep link handling (tel://, maps://, meet) | 2h     | 📋 To Do |
| [TASK-367](../tasks/TASK-367-e2e-manage-bookings-tests.md)       | E2E tests for manage bookings flow         | 4h     | 📋 To Do |

---

## Dependencies

### Blocked By

| Dependency | Description                                | Status         |
| ---------- | ------------------------------------------ | -------------- |
| EPIC-022   | Auth system (login, registration, session) | ⏳ In Progress |
| Supabase   | Project setup with Edge Functions enabled  | ✅ Complete    |

### Blocks

| Epic/Feature | Description                            |
| ------------ | -------------------------------------- |
| EPIC-026     | Push Notifications (booking reminders) |

---

## Out of Scope (Future Features)

| Feature                  | Priority | Notes                                           |
| ------------------------ | -------- | ----------------------------------------------- |
| In-person meetings       | Medium   | Google Places autocomplete, min 60 min duration |
| Recurring bookings       | Low      | Weekly/monthly recurring meetings               |
| Business hours config    | High     | Admin UI for Mon-Fri 9-5, etc.                  |
| Booking limits per day   | High     | Max 5 meetings/day                              |
| Minimum notice           | High     | Can't book within 24h                           |
| Padding before/after     | Medium   | 5-15 min gaps between meetings                  |
| Blocked days/holidays    | Medium   | Bank holidays, vacation                         |
| Custom booking questions | Low      | Additional form fields                          |
| Reminder notifications   | Medium   | Push notification 24h/1h before                 |

---

## Security Requirements

| Requirement          | Implementation                                  |
| -------------------- | ----------------------------------------------- |
| Authentication       | All endpoints require valid Supabase auth token |
| Email verification   | User must have verified email before booking    |
| Account age          | Account must be 24h+ old to book                |
| Rate limiting (user) | Max 2 bookings per user per day                 |
| Rate limiting (IP)   | Max 10 requests per IP per minute               |
| Cooldown             | 1 hour between booking attempts                 |
| Honeypot             | Hidden form field to catch bots                 |
| Audit logging        | All booking actions logged with metadata        |

---

## Acceptance Criteria

### Functional

- [ ] User can select meeting duration (15, 30, 45, 60, 90 minutes)
- [ ] User can view available dates on calendar
- [ ] User can select available time slots
- [ ] User can choose meeting type (phone or video)
- [ ] User can enter meeting title and description
- [ ] Video calls auto-generate Google Meet links
- [ ] Phone calls include tel:// links in calendar events
- [ ] User receives confirmation with booking details
- [ ] User can add booking to their calendar (iCal)
- [ ] User can view their bookings
- [ ] User can edit existing bookings
- [ ] User can cancel bookings
- [ ] Cancelled bookings are removed from Google Calendar

### Technical

- [ ] All screens follow iOS-first design with GlueStack tokens
- [ ] EAA compliance (WCAG 2.1 Level AA) on all screens
- [ ] 100% RNTL test coverage on all components
- [ ] Storybook stories for all UI components
- [ ] E2E tests with mocked API (never hit real Google Calendar)
- [ ] i18n translations for all 5 languages (en, es, ca, pl, tl)
- [ ] TypeScript strict mode compliance
- [ ] All Edge Functions use Zod validation
- [ ] Timezone handling: store UTC, display local

### Security

- [ ] All security requirements implemented and tested
- [ ] Rate limiting verified via E2E tests
- [ ] Honeypot field tested
- [ ] Audit logging verified

---

## Total Estimated Effort

| User Story                                | Effort  |
| ----------------------------------------- | ------- |
| US-062: Booking Backend                   | 15h     |
| US-063: Booking Flow UI                   | 21h     |
| US-064: Booking Confirmation & Navigation | 15h     |
| US-065: View & Manage Bookings            | 28h     |
| **Total**                                 | **79h** |

---

## Implementation Order

1. **Database & Auth** (TASK-342, TASK-343, TASK-346)
2. **Backend APIs** (TASK-344, TASK-345, TASK-359, TASK-360, TASK-361)
3. **Frontend Foundation** (TASK-347, TASK-348)
4. **Booking Flow UI** (TASK-349, TASK-350, TASK-351, TASK-352)
5. **Confirmation & Navigation** (TASK-353, TASK-354, TASK-355, TASK-356)
6. **Manage Bookings UI** (TASK-362, TASK-363, TASK-364, TASK-365, TASK-366)
7. **i18n & Testing** (TASK-357, TASK-358, TASK-367)

---

**Last Updated**: 2025-11-25
