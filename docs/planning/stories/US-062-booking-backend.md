# US-062: Booking Backend

**User Story ID**: US-062
**Title**: Booking Backend (Edge Functions)
**Epic**: [EPIC-031](../epics/EPIC-031-book-a-call.md)
**Status**: 📋 To Do
**Priority**: Critical
**Effort**: 15h
**Owner**: Warren de Leon
**Created**: 2025-11-25

---

## User Story

**As a** developer,
**I want** backend infrastructure for the booking system,
**So that** the booking features have reliable data storage and Google Calendar integration.

---

## Description

This user story covers all backend infrastructure required for the Book a Call feature. It includes database schema design, Supabase Edge Functions for Google Calendar integration, and the one-time OAuth setup for Warren's Google account.

The backend must handle:

- Secure storage of admin OAuth tokens (encrypted)
- Real-time availability checking via Google Calendar API
- Booking creation with automatic Google Calendar event creation
- Rate limiting and security measures to prevent abuse

---

## Scope

### In Scope

- Database schema with 5 tables (admin_oauth, booking_config, bookings, booking_rate_limits, booking_audit_log)
- Admin OAuth Edge Function for Google account authorization
- Get Availability Edge Function (fetches Warren's calendar availability)
- Create Booking Edge Function (creates booking + Google Calendar event)
- One-time Google Cloud Console setup for OAuth credentials

### Out of Scope

- User-facing UI (covered in US-063)
- Update/Cancel booking APIs (covered in US-065)
- Email notifications (future feature)

---

## Tasks

| Task ID                                                         | Title                          | Effort | Status   | Dependencies                 |
| --------------------------------------------------------------- | ------------------------------ | ------ | -------- | ---------------------------- |
| [TASK-342](../tasks/TASK-342-database-schema.md)                | Database schema + migrations   | 2h     | 📋 To Do | None                         |
| [TASK-343](../tasks/TASK-343-admin-oauth-edge-function.md)      | Admin OAuth Edge Function      | 4h     | 📋 To Do | TASK-342                     |
| [TASK-344](../tasks/TASK-344-get-availability-edge-function.md) | Get Availability Edge Function | 4h     | 📋 To Do | TASK-342, TASK-343           |
| [TASK-345](../tasks/TASK-345-create-booking-edge-function.md)   | Create Booking Edge Function   | 4h     | 📋 To Do | TASK-342, TASK-343, TASK-344 |
| [TASK-346](../tasks/TASK-346-admin-google-oauth-setup.md)       | Admin Google OAuth setup       | 1h     | 📋 To Do | TASK-343                     |

---

## Technical Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Backend                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Edge Functions (Deno)                    │ │
│  │  ┌─────────────────┐  ┌───────────────┐  ┌────────────────┐│ │
│  │  │ get-availability│  │ create-booking│  │ admin-oauth    ││ │
│  │  │   (TASK-344)    │  │   (TASK-345)  │  │   (TASK-343)   ││ │
│  │  └────────┬────────┘  └───────┬───────┘  └────────────────┘│ │
│  └───────────┼───────────────────┼────────────────────────────┘ │
│              │                   │                               │
│  ┌───────────┼───────────────────┼────────────────────────────┐ │
│  │           ▼                   ▼              PostgreSQL    │ │
│  │  ┌─────────────┐      ┌─────────────┐     ┌──────────────┐│ │
│  │  │ admin_oauth │      │  bookings   │     │booking_config││ │
│  │  │   (tokens)  │      │  (records)  │     │   (future)   ││ │
│  │  └─────────────┘      └─────────────┘     └──────────────┘│ │
│  │                                                            │ │
│  │  ┌───────────────────┐  ┌───────────────────────────────┐ │ │
│  │  │booking_rate_limits│  │     booking_audit_log         │ │ │
│  │  │    (security)     │  │        (audit trail)          │ │ │
│  │  └───────────────────┘  └───────────────────────────────┘ │ │
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

### Key Technical Decisions

| Decision                    | Rationale                                                        |
| --------------------------- | ---------------------------------------------------------------- |
| **Supabase Edge Functions** | Server-side Google API calls keep credentials secure             |
| **Token encryption**        | AES-256-GCM encryption for OAuth tokens at rest                  |
| **UTC storage**             | All times stored in UTC, converted to local timezone for display |
| **Deno runtime**            | Native TypeScript support, modern APIs                           |

### Security Requirements

- Authentication required on all endpoints
- Email verification required before booking
- Account must be 24h+ old
- Rate limiting: 2 bookings/user/day, 10 requests/IP/minute
- 1 hour cooldown between booking attempts
- Honeypot field validation
- Audit logging for all actions

---

## Acceptance Criteria

### Database (TASK-342)

- [ ] All 5 tables created with correct schemas
- [ ] RLS policies prevent unauthorised access
- [ ] Indexes optimised for read-heavy queries
- [ ] Foreign key constraints enforced
- [ ] Audit trail captures all booking actions

### Admin OAuth (TASK-343)

- [ ] OAuth 2.0 flow with PKCE implemented
- [ ] Tokens encrypted at rest with AES-256-GCM
- [ ] Automatic token refresh before expiry
- [ ] Admin-only access enforced

### Get Availability (TASK-344)

- [ ] Fetches availability from Google Calendar API
- [ ] Slot intervals match requested duration
- [ ] Timezone conversion handled correctly
- [ ] Returns slots in user's local timezone

### Create Booking (TASK-345)

- [ ] All security checks pass before booking
- [ ] Video calls auto-generate Google Meet links
- [ ] Phone calls include tel:// links in event
- [ ] Atomic slot availability check prevents double-booking
- [ ] Booking record created in database
- [ ] Google Calendar event created

### Admin Setup (TASK-346)

- [ ] Google Cloud Console project configured
- [ ] OAuth consent screen approved
- [ ] Credentials stored securely in Supabase secrets
- [ ] Initial OAuth flow completed successfully

---

## Dependencies

### Blocked By

| Dependency | Description                         | Status      |
| ---------- | ----------------------------------- | ----------- |
| Supabase   | Project with Edge Functions enabled | ✅ Complete |

### Blocks

| Item   | Description                             |
| ------ | --------------------------------------- |
| US-063 | Booking Flow UI (needs API client)      |
| US-064 | Booking Confirmation (needs create API) |
| US-065 | Manage Bookings (needs CRUD APIs)       |

---

## Notes

- Edge Functions use Deno runtime with TypeScript
- Google Calendar scopes: `calendar.readonly`, `calendar.events`
- Event title format: "User Name and Warren de Leon" (video) or "[Mobile call] User Name and Warren de Leon" (phone)
- Warren's phone number stored in admin_oauth table for phone call events

---

**Last Updated**: 2025-11-25
