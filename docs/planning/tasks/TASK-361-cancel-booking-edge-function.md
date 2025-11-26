# TASK-361: Cancel Booking Edge Function

**Status**: 🆕 Not Started
**Effort**: 2 hours
**Priority**: High
**Parent**: [US-065: View & Manage Bookings](../user-stories/US-065-view-manage-bookings.md)

---

## Overview

Create a Supabase Edge Function that allows users to cancel their bookings. This endpoint updates the booking status to 'cancelled', deletes or cancels the associated Google Calendar event, and creates an audit log entry for tracking cancellations.

---

## Requirements

### Functional Requirements

1. **Authentication Required**: Verify JWT token and ensure user owns the booking
2. **Status Update**: Set booking status to 'cancelled'
3. **Google Calendar Integration**:
   - Delete calendar event if exists
   - Handle cases where event already deleted
   - Graceful failure handling
4. **Cancellation Reason**: Optional field for user to provide reason
5. **Audit Trail**: Log cancellation with timestamp, user, and reason
6. **Validation**:
   - Cannot cancel already cancelled bookings
   - Cannot cancel completed bookings
   - Optionally prevent cancellations within X hours of start time
7. **No Deletion**: Bookings are soft-deleted (status changed, not removed from database)

### Non-Functional Requirements

1. **Idempotency**: Calling cancel on already-cancelled booking returns success
2. **Performance**: Response time <2s (includes Google Calendar API call)
3. **Security**: Users can only cancel their own bookings
4. **Error Handling**: Clear errors for validation failures, calendar sync issues

---

## API Contract

### Endpoint

```
POST /functions/v1/cancel-booking
```

### Headers

```
Authorization: Bearer {supabase_jwt_token}
Content-Type: application/json
```

### Request Schema

```typescript
interface CancelBookingRequest {
  booking_id: string; // UUID (required)
  reason?: string; // Optional cancellation reason
}
```

### Request Examples

**Basic cancellation**:

```json
{
  "booking_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Cancellation with reason**:

```json
{
  "booking_id": "550e8400-e29b-41d4-a716-446655440000",
  "reason": "Scheduling conflict - need to reschedule for next week"
}
```

### Response Schema

```typescript
interface CancelBookingResponse {
  success: true;
  data: {
    booking: {
      id: string;
      status: 'cancelled';
      cancelled_at: string; // ISO 8601
      cancellation_reason: string | null;
    };
    calendar_deleted: boolean; // Google Calendar event deletion status
  };
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "cancelled",
      "cancelled_at": "2025-11-26T14:30:00.000Z",
      "cancellation_reason": "Scheduling conflict - need to reschedule for next week"
    },
    "calendar_deleted": true
  }
}
```

### Error Responses

**401 Unauthorized** - Missing or invalid JWT:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required. Please provide a valid Bearer token."
  }
}
```

**403 Forbidden** - User does not own booking:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to cancel this booking."
  }
}
```

**404 Not Found** - Booking does not exist:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking not found."
  }
}
```

**409 Conflict** - Already cancelled (idempotent response):

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "cancelled",
      "cancelled_at": "2025-11-25T10:00:00.000Z",
      "cancellation_reason": "Original reason"
    },
    "calendar_deleted": false,
    "message": "Booking was already cancelled."
  }
}
```

**422 Unprocessable Entity** - Cannot cancel completed booking:

```json
{
  "success": false,
  "error": {
    "code": "CANNOT_CANCEL_COMPLETED",
    "message": "Cannot cancel a completed booking."
  }
}
```

**422 Unprocessable Entity** - Cancellation too late:

```json
{
  "success": false,
  "error": {
    "code": "CANCELLATION_TOO_LATE",
    "message": "Cannot cancel within 24 hours of the booking start time.",
    "details": {
      "start_time": "2025-11-27T10:00:00.000Z",
      "hours_until_start": 18
    }
  }
}
```

**502 Bad Gateway** - Google Calendar deletion failed:

```json
{
  "success": false,
  "error": {
    "code": "CALENDAR_DELETE_FAILED",
    "message": "Booking cancelled in database but Google Calendar event deletion failed. Please manually delete the event.",
    "details": {
      "booking_id": "550e8400-e29b-41d4-a716-446655440000",
      "calendar_event_id": "eventid123",
      "calendar_error": "Event not found"
    }
  }
}
```

---

## Implementation Details

### Edge Function Logic

```typescript
// supabase/functions/cancel-booking/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { google } from 'https://esm.sh/googleapis@118.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CancelBookingRequest {
  booking_id: string;
  reason?: string;
}

// Minimum hours before start time to allow cancellation
const CANCELLATION_CUTOFF_HOURS = 24;

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. Please provide a valid Bearer token.',
          },
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token.' },
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: CancelBookingRequest = await req.json();
    const { booking_id, reason } = body;

    if (!booking_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'booking_id is required.' },
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch existing booking
    const { data: existingBooking, error: fetchError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (fetchError || !existingBooking) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Booking not found.' },
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check ownership
    if (existingBooking.user_id !== user.id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to cancel this booking.',
          },
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Idempotency: If already cancelled, return success
    if (existingBooking.status === 'cancelled') {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            booking: {
              id: existingBooking.id,
              status: 'cancelled',
              cancelled_at: existingBooking.cancelled_at,
              cancellation_reason: existingBooking.cancellation_reason,
            },
            calendar_deleted: false,
            message: 'Booking was already cancelled.',
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cannot cancel completed bookings
    if (existingBooking.status === 'completed') {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'CANNOT_CANCEL_COMPLETED',
            message: 'Cannot cancel a completed booking.',
          },
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cancellation cutoff (optional - can be configured)
    const startTime = new Date(existingBooking.start_time);
    const now = new Date();
    const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilStart < CANCELLATION_CUTOFF_HOURS && hoursUntilStart > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'CANCELLATION_TOO_LATE',
            message: `Cannot cancel within ${CANCELLATION_CUTOFF_HOURS} hours of the booking start time.`,
            details: {
              start_time: existingBooking.start_time,
              hours_until_start: Math.round(hoursUntilStart),
            },
          },
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update booking status to cancelled
    const cancelledAt = new Date().toISOString();
    const { data: cancelledBooking, error: updateError } = await supabaseClient
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: cancelledAt,
        cancellation_reason: reason || null,
        updated_at: cancelledAt,
      })
      .eq('id', booking_id)
      .select()
      .single();

    if (updateError || !cancelledBooking) {
      console.error('Database update error:', updateError);
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to cancel booking. Please try again.',
          },
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete Google Calendar event
    let calendarDeleted = false;
    if (existingBooking.google_calendar_event_id) {
      try {
        const oauth2Client = new google.auth.OAuth2(
          Deno.env.get('GOOGLE_CLIENT_ID'),
          Deno.env.get('GOOGLE_CLIENT_SECRET')
        );

        oauth2Client.setCredentials({
          refresh_token: Deno.env.get('GOOGLE_REFRESH_TOKEN'),
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        await calendar.events.delete({
          calendarId: 'primary',
          eventId: existingBooking.google_calendar_event_id,
        });

        calendarDeleted = true;
      } catch (calendarError: any) {
        console.error('Google Calendar deletion error:', calendarError);

        // If event already deleted (404), consider it success
        if (calendarError.code === 404 || calendarError.status === 404) {
          calendarDeleted = true;
        } else {
          // Log error but don't fail the request
          // Consider implementing retry logic or background job
          console.warn(
            `Calendar event ${existingBooking.google_calendar_event_id} deletion failed:`,
            calendarError.message
          );
        }
      }
    }

    // Create audit log entry
    try {
      await supabaseClient.from('booking_audit_log').insert({
        booking_id: booking_id,
        user_id: user.id,
        action: 'cancelled',
        reason: reason || null,
        timestamp: cancelledAt,
        metadata: {
          calendar_deleted: calendarDeleted,
          original_start_time: existingBooking.start_time,
        },
      });
    } catch (auditError) {
      // Don't fail the request if audit log fails
      console.error('Audit log error:', auditError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          booking: {
            id: cancelledBooking.id,
            status: cancelledBooking.status,
            cancelled_at: cancelledBooking.cancelled_at,
            cancellation_reason: cancelledBooking.cancellation_reason,
          },
          calendar_deleted: calendarDeleted,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred. Please try again later.',
        },
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Database Schema Additions

Add `cancelled_at` and `cancellation_reason` columns to `bookings` table:

```sql
-- Migration: Add cancellation fields
ALTER TABLE bookings
ADD COLUMN cancelled_at TIMESTAMPTZ,
ADD COLUMN cancellation_reason TEXT;

-- Create audit log table
CREATE TABLE booking_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'created', 'updated', 'cancelled'
  reason TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  CONSTRAINT valid_action CHECK (action IN ('created', 'updated', 'cancelled'))
);

-- Index for efficient querying
CREATE INDEX idx_audit_log_booking_id ON booking_audit_log(booking_id);
CREATE INDEX idx_audit_log_timestamp ON booking_audit_log(timestamp DESC);

-- RLS policy
ALTER TABLE booking_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own audit logs"
  ON booking_audit_log
  FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Testing Strategy

### Unit Tests (Deno)

```typescript
Deno.test('POST /cancel-booking - successfully cancels booking', async () => {
  // Test implementation
});

Deno.test('POST /cancel-booking - deletes Google Calendar event', async () => {
  // Test implementation (with mocked Google API)
});

Deno.test('POST /cancel-booking - idempotent for already cancelled', async () => {
  // Test implementation
});

Deno.test('POST /cancel-booking - prevents cancelling completed booking', async () => {
  // Test implementation
});

Deno.test('POST /cancel-booking - enforces cancellation cutoff', async () => {
  // Test implementation
});

Deno.test('POST /cancel-booking - creates audit log entry', async () => {
  // Test implementation
});
```

### Integration Tests

```typescript
// src/services/api/__tests__/cancelBooking.test.ts

describe('cancelBooking', () => {
  it('should cancel booking successfully', async () => {
    const { data, error } = await cancelBooking({
      booking_id: 'test-id',
      reason: 'Test cancellation',
    });

    expect(error).toBeNull();
    expect(data.booking.status).toBe('cancelled');
    expect(data.booking.cancellation_reason).toBe('Test cancellation');
  });

  it('should be idempotent', async () => {
    const bookingId = 'already-cancelled-id';

    // First cancellation
    await cancelBooking({ booking_id: bookingId });

    // Second cancellation should succeed
    const { data, error } = await cancelBooking({ booking_id: bookingId });

    expect(error).toBeNull();
    expect(data.message).toContain('already cancelled');
  });

  it('should prevent cancelling completed booking', async () => {
    const { data, error } = await cancelBooking({
      booking_id: 'completed-booking-id',
    });

    expect(error).toBeDefined();
    expect(error.code).toBe('CANNOT_CANCEL_COMPLETED');
  });
});
```

---

## Acceptance Criteria

- [ ] Edge function deployed to Supabase
- [ ] Users can cancel their own bookings only
- [ ] Booking status updated to 'cancelled' in database
- [ ] Google Calendar event deleted successfully
- [ ] Handles already-deleted calendar events gracefully (404)
- [ ] Idempotent (calling cancel twice returns success)
- [ ] Cannot cancel completed bookings (422 error)
- [ ] Enforces cancellation cutoff (24 hours before start)
- [ ] Stores cancellation reason if provided
- [ ] Creates audit log entry for all cancellations
- [ ] Calendar deletion failures logged but don't fail request
- [ ] Unit tests pass (Deno)
- [ ] Integration tests pass (client-side)
- [ ] Performance <2s (including calendar deletion)

---

## Related Files

- **Edge Function**: `supabase/functions/cancel-booking/index.ts`
- **Types**: `src/types/booking.ts`
- **API Client**: `src/services/api/bookings.ts`
- **Migration**: `supabase/migrations/XXXXXX_add_cancellation_fields.sql`
- **Tests**: `supabase/functions/cancel-booking/index.test.ts`

---

## Notes

- Bookings are soft-deleted (status changed, not removed from database)
- Consider configurable cancellation cutoff (env variable)
- Future enhancement: Send email notification when booking cancelled
- Future enhancement: Implement cancellation fees or policies
- Audit log table enables compliance and user history tracking
- Calendar deletion is best-effort (logged if fails, doesn't block cancellation)
