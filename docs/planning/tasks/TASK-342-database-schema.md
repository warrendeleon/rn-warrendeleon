# TASK-342: Database Schema Design and Migrations

**Task ID**: TASK-342
**Title**: Database Schema Design and Migrations
**User Story**: [US-062](../stories/US-062-booking-backend.md)
**Epic**: [EPIC-031](../epics/EPIC-031-book-a-call.md)
**Status**: 📋 To Do
**Priority**: High
**Effort**: 2h
**Owner**: Warren de Leon
**Created**: 2025-11-25
**Dependencies**: None (foundation task)

---

## Context

The booking system requires a robust database schema to support:

- Secure storage of OAuth credentials for Google Calendar integration
- Booking configuration (calendar ID, working hours, buffer times)
- User bookings with full audit trail
- Rate limiting to prevent abuse
- Audit logging for security and compliance

All timestamps must be stored in UTC for consistent timezone handling. Row Level Security (RLS) policies ensure data isolation and security. The schema follows Supabase best practices with proper foreign key constraints, indexes for query optimisation, and comprehensive audit fields.

**Constraints**:

- UTC storage for all timestamps (convert to user timezone in application layer)
- RLS policies for all tables (security-first approach)
- Proper indexes for read-heavy queries (availability checks, booking lookups)
- Audit trail for all booking operations
- Support for both video and phone call types

---

## Objective

Design and implement the complete database schema for the booking system with SQL migrations, RLS policies, and indexes optimised for query patterns.

**Deliverable**: Five database tables with complete migrations, RLS policies, indexes, and foreign key constraints.

---

## Technical Implementation

### Entity Relationship Diagram

```
┌─────────────────────────┐
│   admin_oauth           │
│─────────────────────────│
│ id (PK)                 │
│ admin_user_id (FK)      │──┐
│ provider                │  │
│ encrypted_access_token  │  │
│ encrypted_refresh_token │  │
│ token_expires_at        │  │
│ scopes                  │  │
│ created_at              │  │
│ updated_at              │  │
└─────────────────────────┘  │
                             │
┌─────────────────────────┐  │
│   booking_config        │  │
│─────────────────────────│  │
│ id (PK)                 │  │
│ admin_user_id (FK)      │──┤
│ calendar_id             │  │
│ timezone                │  │
│ working_hours_start     │  │
│ working_hours_end       │  │
│ buffer_minutes          │  │
│ duration_minutes        │  │
│ days_ahead_limit        │  │
│ created_at              │  │
│ updated_at              │  │
└─────────────────────────┘  │
                             │
┌─────────────────────────┐  │
│   bookings              │  │
│─────────────────────────│  │
│ id (PK)                 │  │
│ user_id (FK)            │──┤
│ admin_user_id (FK)      │──┘
│ start_time_utc          │
│ end_time_utc            │
│ call_type               │
│ user_phone              │
│ user_name               │
│ user_email              │
│ google_event_id         │
│ google_meet_link        │
│ status                  │
│ created_at              │
│ updated_at              │
└─────────────────────────┘
         │
         │
         ├─────────────────────────┐
         │                         │
         ▼                         ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│ booking_rate_limits     │ │   booking_audit_log     │
│─────────────────────────│ │─────────────────────────│
│ id (PK)                 │ │ id (PK)                 │
│ user_id (FK)            │ │ booking_id (FK)         │
│ booking_count           │ │ action                  │
│ last_booking_at         │ │ actor_id (FK)           │
│ ip_address              │ │ details (JSONB)         │
│ ip_booking_count        │ │ created_at              │
│ ip_last_booking_at      │ └─────────────────────────┘
│ created_at              │
│ updated_at              │
└─────────────────────────┘
```

### Database Tables

#### 1. admin_oauth Table

Stores encrypted OAuth tokens for Warren's Google Calendar access. Only one row should exist (singleton pattern enforced by RLS).

```sql
-- Migration: 20250125000001_create_admin_oauth.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create admin_oauth table
CREATE TABLE admin_oauth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google')),
  encrypted_access_token TEXT NOT NULL, -- Encrypted using pg_crypto
  encrypted_refresh_token TEXT NOT NULL, -- Encrypted using pg_crypto
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}', -- Array of granted OAuth scopes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT admin_oauth_unique_admin_provider UNIQUE (admin_user_id, provider)
);

-- Indexes for efficient lookups
CREATE INDEX idx_admin_oauth_admin_user ON admin_oauth(admin_user_id);
CREATE INDEX idx_admin_oauth_expires ON admin_oauth(token_expires_at)
  WHERE token_expires_at > NOW(); -- Partial index for active tokens

-- Row Level Security
ALTER TABLE admin_oauth ENABLE ROW LEVEL SECURITY;

-- Policy: Only Warren (admin) can manage OAuth tokens
CREATE POLICY admin_oauth_admin_only ON admin_oauth
  FOR ALL
  USING (
    admin_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_oauth_updated_at
  BEFORE UPDATE ON admin_oauth
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE admin_oauth IS 'Stores encrypted OAuth tokens for admin Google Calendar access';
COMMENT ON COLUMN admin_oauth.encrypted_access_token IS 'Access token encrypted using pg_crypto';
COMMENT ON COLUMN admin_oauth.encrypted_refresh_token IS 'Refresh token encrypted using pg_crypto';
COMMENT ON COLUMN admin_oauth.scopes IS 'Array of granted OAuth scopes (e.g., calendar.readonly)';
```

#### 2. booking_config Table

Configuration for the booking system (working hours, calendar settings, buffer times).

```sql
-- Migration: 20250125000002_create_booking_config.sql

CREATE TABLE booking_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calendar_id TEXT NOT NULL, -- Google Calendar ID (e.g., "warren@example.com")
  timezone TEXT NOT NULL DEFAULT 'UTC', -- IANA timezone (e.g., "Europe/London")
  working_hours_start TIME NOT NULL DEFAULT '09:00:00', -- Local time in admin's timezone
  working_hours_end TIME NOT NULL DEFAULT '17:00:00', -- Local time in admin's timezone
  buffer_minutes INTEGER NOT NULL DEFAULT 15 CHECK (buffer_minutes >= 0),
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
  days_ahead_limit INTEGER NOT NULL DEFAULT 30 CHECK (days_ahead_limit > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT booking_config_unique_admin UNIQUE (admin_user_id),
  CONSTRAINT booking_config_valid_hours CHECK (working_hours_end > working_hours_start)
);

-- Indexes
CREATE INDEX idx_booking_config_admin_user ON booking_config(admin_user_id);

-- Row Level Security
ALTER TABLE booking_config ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can manage, authenticated users can read
CREATE POLICY booking_config_admin_write ON booking_config
  FOR ALL
  USING (
    admin_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY booking_config_read_all ON booking_config
  FOR SELECT
  USING (auth.uid() IS NOT NULL); -- Any authenticated user can read

-- Trigger for updated_at
CREATE TRIGGER booking_config_updated_at
  BEFORE UPDATE ON booking_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE booking_config IS 'Configuration for booking system (working hours, calendar, buffers)';
COMMENT ON COLUMN booking_config.timezone IS 'IANA timezone for working hours (e.g., Europe/London)';
COMMENT ON COLUMN booking_config.buffer_minutes IS 'Minutes between consecutive bookings';
COMMENT ON COLUMN booking_config.duration_minutes IS 'Default booking duration';
COMMENT ON COLUMN booking_config.days_ahead_limit IS 'Maximum days ahead users can book';
```

#### 3. bookings Table

Main table storing all booking records with user details and Google Calendar event information.

```sql
-- Migration: 20250125000003_create_bookings.sql

CREATE TYPE call_type AS ENUM ('video', 'phone');
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled');

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Time information (UTC storage)
  start_time_utc TIMESTAMPTZ NOT NULL,
  end_time_utc TIMESTAMPTZ NOT NULL,

  -- Call details
  call_type call_type NOT NULL,
  user_phone TEXT, -- Required if call_type = 'phone', validated by CHECK constraint
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,

  -- Google Calendar integration
  google_event_id TEXT, -- Google Calendar event ID (populated after creation)
  google_meet_link TEXT, -- Google Meet link (only for video calls)

  -- Status and metadata
  status booking_status NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT bookings_valid_time CHECK (end_time_utc > start_time_utc),
  CONSTRAINT bookings_phone_required CHECK (
    (call_type = 'phone' AND user_phone IS NOT NULL)
    OR call_type = 'video'
  ),
  CONSTRAINT bookings_meet_link_video_only CHECK (
    (call_type = 'video') OR (google_meet_link IS NULL)
  ),
  CONSTRAINT bookings_unique_slot UNIQUE (admin_user_id, start_time_utc, status)
);

-- Indexes for efficient queries
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_admin ON bookings(admin_user_id);
CREATE INDEX idx_bookings_time_range ON bookings(admin_user_id, start_time_utc, end_time_utc)
  WHERE status = 'confirmed'; -- Partial index for active bookings
CREATE INDEX idx_bookings_google_event ON bookings(google_event_id)
  WHERE google_event_id IS NOT NULL;
CREATE INDEX idx_bookings_status ON bookings(status);

-- Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bookings
CREATE POLICY bookings_user_select ON bookings
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can insert their own bookings (validated by Edge Function)
CREATE POLICY bookings_user_insert ON bookings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Admin can view all bookings
CREATE POLICY bookings_admin_all ON bookings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE bookings IS 'User bookings with Google Calendar integration';
COMMENT ON COLUMN bookings.start_time_utc IS 'Booking start time in UTC (convert to user timezone in app)';
COMMENT ON COLUMN bookings.end_time_utc IS 'Booking end time in UTC (convert to user timezone in app)';
COMMENT ON COLUMN bookings.user_phone IS 'User phone number (required for phone calls, E.164 format)';
COMMENT ON COLUMN bookings.google_event_id IS 'Google Calendar event ID for synchronisation';
COMMENT ON COLUMN bookings.google_meet_link IS 'Google Meet link (video calls only)';
```

#### 4. booking_rate_limits Table

Tracks user and IP-based rate limiting to prevent abuse.

```sql
-- Migration: 20250125000004_create_booking_rate_limits.sql

CREATE TABLE booking_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- User-based rate limiting (2 bookings per day)
  booking_count INTEGER NOT NULL DEFAULT 0,
  last_booking_at TIMESTAMPTZ,

  -- IP-based rate limiting (10 bookings per minute)
  ip_address INET NOT NULL,
  ip_booking_count INTEGER NOT NULL DEFAULT 0,
  ip_last_booking_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT booking_rate_limits_unique_user_ip UNIQUE (user_id, ip_address)
);

-- Indexes for rate limit checks
CREATE INDEX idx_rate_limits_user ON booking_rate_limits(user_id, last_booking_at);
CREATE INDEX idx_rate_limits_ip ON booking_rate_limits(ip_address, ip_last_booking_at);

-- Row Level Security
ALTER TABLE booking_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own rate limits
CREATE POLICY rate_limits_user_select ON booking_rate_limits
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Service role can manage (Edge Functions only)
CREATE POLICY rate_limits_service_role ON booking_rate_limits
  FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER booking_rate_limits_updated_at
  BEFORE UPDATE ON booking_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE booking_rate_limits IS 'Rate limiting for booking creation (user and IP based)';
COMMENT ON COLUMN booking_rate_limits.booking_count IS 'User bookings in current day (resets daily)';
COMMENT ON COLUMN booking_rate_limits.ip_booking_count IS 'IP bookings in current minute (resets per minute)';
```

#### 5. booking_audit_log Table

Comprehensive audit trail for all booking operations (create, cancel, update).

```sql
-- Migration: 20250125000005_create_booking_audit_log.sql

CREATE TYPE audit_action AS ENUM ('created', 'cancelled', 'updated', 'failed');

CREATE TABLE booking_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL, -- NULL if booking deleted
  action audit_action NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Who performed action
  details JSONB NOT NULL DEFAULT '{}', -- Additional context (error messages, IP, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit queries
CREATE INDEX idx_audit_log_booking ON booking_audit_log(booking_id);
CREATE INDEX idx_audit_log_actor ON booking_audit_log(actor_id);
CREATE INDEX idx_audit_log_created_at ON booking_audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON booking_audit_log(action);

-- GIN index for JSONB queries
CREATE INDEX idx_audit_log_details ON booking_audit_log USING GIN (details);

-- Row Level Security
ALTER TABLE booking_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can view all logs
CREATE POLICY audit_log_admin_select ON booking_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Users can view logs for their own bookings
CREATE POLICY audit_log_user_select ON booking_audit_log
  FOR SELECT
  USING (
    actor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_audit_log.booking_id
      AND user_id = auth.uid()
    )
  );

-- Policy: Service role can insert (Edge Functions only)
CREATE POLICY audit_log_service_insert ON booking_audit_log
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR actor_id = auth.uid());

-- Comments
COMMENT ON TABLE booking_audit_log IS 'Audit trail for all booking operations';
COMMENT ON COLUMN booking_audit_log.details IS 'JSONB metadata (error messages, IP address, rate limit info, etc.)';
```

---

## File Structure

```
supabase/
├── migrations/
│   ├── 20250125000001_create_admin_oauth.sql
│   ├── 20250125000002_create_booking_config.sql
│   ├── 20250125000003_create_bookings.sql
│   ├── 20250125000004_create_booking_rate_limits.sql
│   └── 20250125000005_create_booking_audit_log.sql
└── seed.sql (optional - for development data)
```

---

## Data Flow

```
User Request → Edge Function
                    ↓
            Check auth.users (JWT validation)
                    ↓
            Check booking_rate_limits (user + IP)
                    ↓
            Query booking_config (working hours, calendar ID)
                    ↓
            Check admin_oauth (token validity, refresh if needed)
                    ↓
            Query Google Calendar API (freebusy.query)
                    ↓
            Insert bookings (with UNIQUE constraint check)
                    ↓
            Insert booking_audit_log (success/failure)
                    ↓
            Update booking_rate_limits (increment counters)
                    ↓
            Return response to client
```

---

## Acceptance Criteria

- [ ] All 5 tables created with proper constraints and indexes
- [ ] RLS policies enforce security (admin-only for OAuth, user isolation for bookings)
- [ ] Foreign key constraints maintain referential integrity
- [ ] Indexes optimised for read-heavy queries (availability checks, booking lookups)
- [ ] Audit trail captures all booking operations with JSONB metadata
- [ ] UTC storage for all timestamps (timezone conversion in application layer)
- [ ] Unique constraints prevent double-booking same slot
- [ ] CHECK constraints validate data integrity (phone required for phone calls, etc.)
- [ ] Triggers maintain updated_at columns automatically
- [ ] Comments document all tables and complex columns
- [ ] TypeScript strict mode compliance (no migrations, but schema export)

---

## Edge Cases & Error Handling

| Scenario                                    | Expected Behaviour                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| Duplicate OAuth token for same provider     | UNIQUE constraint violation (admin_oauth_unique_admin_provider)                    |
| Booking slot already taken (race condition) | UNIQUE constraint violation (bookings_unique_slot)                                 |
| Phone call without user_phone               | CHECK constraint violation (bookings_phone_required)                               |
| Video call with user_phone                  | Allowed (phone optional for video)                                                 |
| Working hours end before start              | CHECK constraint violation (booking_config_valid_hours)                            |
| Negative buffer_minutes                     | CHECK constraint violation (buffer_minutes >= 0)                                   |
| Token expires_at in past                    | Partial index excludes (query won't find it)                                       |
| Booking cancelled (status change)           | Audit log entry created, slot becomes available                                    |
| User deleted (CASCADE)                      | All bookings, rate limits, and audit logs preserved (ON DELETE SET NULL for audit) |
| Admin deleted (CASCADE)                     | All OAuth tokens, config, and bookings deleted                                     |

---

## Security Considerations

1. **Encryption**: OAuth tokens encrypted using pg_crypto (Supabase standard)
2. **RLS Policies**: All tables enforce row-level security
3. **Admin Isolation**: Only users with role='admin' can manage OAuth and config
4. **User Isolation**: Users can only view/create their own bookings
5. **Service Role**: Rate limits and audit logs managed by Edge Functions (service_role)
6. **Audit Trail**: All actions logged with actor_id and JSONB details (IP, errors, etc.)

---

## Testing Strategy

1. **RLS Policy Testing**: Verify users cannot access other users' bookings
2. **Constraint Testing**: Test all CHECK constraints (phone required, valid hours, etc.)
3. **Index Performance**: Explain query plans for common queries (availability, booking lookup)
4. **Race Condition Testing**: Concurrent bookings for same slot (should fail with UNIQUE violation)
5. **Cascade Testing**: Delete user/admin and verify CASCADE behaviour

---

## Dependencies

- **Blocked by**: None (foundation task)
- **Blocks**:
  - TASK-343 (Admin OAuth Edge Function - needs admin_oauth table)
  - TASK-344 (Get Availability Edge Function - needs booking_config, bookings tables)
  - TASK-345 (Create Booking Edge Function - needs all tables)

---

**Estimated Time**: 2h
**Last Updated**: 2025-11-25
