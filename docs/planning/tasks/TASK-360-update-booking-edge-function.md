# TASK-360: Update Booking Edge Function

**Status**: 🆕 Not Started
**Effort**: 3 hours
**Priority**: High
**Parent**: [US-065: View & Manage Bookings](../user-stories/US-065-view-manage-bookings.md)

---

## Overview

Create a Supabase Edge Function that allows users to update their existing bookings. This endpoint must re-check availability for date/time changes, update the booking in the database, and synchronise changes with Google Calendar. Duration cannot be changed (fixed by meeting type).

---

## Requirements

### Functional Requirements

1. **Authentication Required**: Verify JWT token and ensure user owns the booking
2. **Updateable Fields**:
   - `start_time` (must re-check availability)
   - `meeting_type_id` (can change meeting type)
   - `description` (optional text)
   - `phone_number` (validation required)
3. **Non-Updateable Fields**:
   - `duration_minutes` (fixed by meeting type, cannot change)
   - `status` (use cancel endpoint for cancellations)
   - `user_id` (cannot transfer booking)
4. **Availability Re-Check**: If `start_time` or `meeting_type_id` changes, verify new slot is available
5. **Google Calendar Sync**: Update existing calendar event with new details
6. **Validation**:
   - Cannot update cancelled bookings
   - Cannot change to past date/time
   - Must respect business hours
   - Phone number must be valid E.164 format
7. **Audit Trail**: Log all booking updates with timestamp and changed fields

### Non-Functional Requirements

1. **Atomicity**: Database + Google Calendar updates must be transactional (rollback on failure)
2. **Performance**: Response time <2s (includes Google Calendar API call)
3. **Security**: Users can only update their own bookings
4. **Error Handling**: Clear errors for conflicts, validation failures, calendar sync issues

---

## API Contract

### Endpoint

```
PATCH /functions/v1/update-booking
```

### Headers

```
Authorization: Bearer {supabase_jwt_token}
Content-Type: application/json
```

### Request Schema

```typescript
interface UpdateBookingRequest {
  booking_id: string; // UUID (required)
  start_time?: string; // ISO 8601 (optional)
  meeting_type_id?: string; // UUID (optional)
  description?: string | null; // Optional text
  phone_number?: string; // E.164 format (optional)
}
```

### Request Examples

**Update start time only**:

```json
{
  "booking_id": "550e8400-e29b-41d4-a716-446655440000",
  "start_time": "2025-12-05T15:00:00.000Z"
}
```

**Update meeting type and description**:

```json
{
  "booking_id": "550e8400-e29b-41d4-a716-446655440000",
  "meeting_type_id": "789e4567-e89b-12d3-a456-426614174999",
  "description": "Updated: Discuss Q2 strategy instead"
}
```

**Update multiple fields**:

```json
{
  "booking_id": "550e8400-e29b-41d4-a716-446655440000",
  "start_time": "2025-12-06T10:00:00.000Z",
  "phone_number": "+447700900999",
  "description": "Changed time and contact number"
}
```

### Response Schema

```typescript
interface UpdateBookingResponse {
  success: true;
  data: {
    booking: Booking; // Updated booking object
    calendar_updated: boolean; // Google Calendar sync status
    availability_checked: boolean; // Was availability re-verified?
  };
}

interface Booking {
  id: string;
  user_id: string;
  meeting_type_id: string;
  start_time: string;
  end_time: string;
  status: 'confirmed';
  description: string | null;
  phone_number: string;
  google_meet_link: string | null;
  google_calendar_event_id: string | null;
  location_address: string | null;
  location_coords: { latitude: number; longitude: number } | null;
  created_at: string;
  updated_at: string;
  meeting_type: {
    name: string;
    duration_minutes: number;
    description: string | null;
    meeting_type: 'in_person' | 'google_meet';
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
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "meeting_type_id": "789e4567-e89b-12d3-a456-426614174000",
      "start_time": "2025-12-05T15:00:00.000Z",
      "end_time": "2025-12-05T16:00:00.000Z",
      "status": "confirmed",
      "description": "Updated: Discuss Q2 strategy instead",
      "phone_number": "+447700900123",
      "google_meet_link": "https://meet.google.com/abc-defg-hij",
      "google_calendar_event_id": "eventid123",
      "location_address": null,
      "location_coords": null,
      "created_at": "2025-11-20T10:30:00.000Z",
      "updated_at": "2025-11-26T14:22:00.000Z",
      "meeting_type": {
        "name": "Strategy Session",
        "duration_minutes": 60,
        "description": "Deep dive into strategic planning",
        "meeting_type": "google_meet"
      }
    },
    "calendar_updated": true,
    "availability_checked": true
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
    "message": "You do not have permission to update this booking."
  }
}
```

**400 Bad Request** - Validation errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cannot update booking to a past date/time.",
    "details": {
      "field": "start_time",
      "value": "2025-11-01T10:00:00.000Z",
      "reason": "Date is in the past"
    }
  }
}
```

**409 Conflict** - Time slot not available:

```json
{
  "success": false,
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "The requested time slot is no longer available.",
    "details": {
      "requested_time": "2025-12-05T15:00:00.000Z",
      "next_available": "2025-12-05T16:00:00.000Z"
    }
  }
}
```

**422 Unprocessable Entity** - Cannot update cancelled booking:

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_CANCELLED",
    "message": "Cannot update a cancelled booking. Please create a new booking instead."
  }
}
```

**502 Bad Gateway** - Google Calendar sync failed:

```json
{
  "success": false,
  "error": {
    "code": "CALENDAR_SYNC_FAILED",
    "message": "Booking updated in database but Google Calendar sync failed. Please try again.",
    "details": {
      "booking_id": "550e8400-e29b-41d4-a716-446655440000",
      "calendar_error": "Invalid credentials"
    }
  }
}
```

---

## Implementation Details

### Edge Function Logic

```typescript
// supabase/functions/update-booking/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { google } from 'https://esm.sh/googleapis@118.0.0';
import { parsePhoneNumber } from 'https://esm.sh/libphonenumber-js@1.10.51';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateBookingRequest {
  booking_id: string;
  start_time?: string;
  meeting_type_id?: string;
  description?: string | null;
  phone_number?: string;
}

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
    const body: UpdateBookingRequest = await req.json();
    const { booking_id, start_time, meeting_type_id, description, phone_number } = body;

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
      .select('*, meeting_types(*)')
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
            message: 'You do not have permission to update this booking.',
          },
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cannot update cancelled bookings
    if (existingBooking.status === 'cancelled') {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'BOOKING_CANCELLED',
            message: 'Cannot update a cancelled booking. Please create a new booking instead.',
          },
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone number if provided
    if (phone_number) {
      try {
        const parsed = parsePhoneNumber(phone_number);
        if (!parsed || !parsed.isValid()) {
          return new Response(
            JSON.stringify({
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid phone number format. Must be E.164 format (e.g., +447700900123).',
                details: { field: 'phone_number', value: phone_number },
              },
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid phone number format.',
              details: { field: 'phone_number', value: phone_number },
            },
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Determine new meeting type (if changed)
    let newMeetingType = existingBooking.meeting_types;
    if (meeting_type_id && meeting_type_id !== existingBooking.meeting_type_id) {
      const { data: meetingType, error: mtError } = await supabaseClient
        .from('meeting_types')
        .select('*')
        .eq('id', meeting_type_id)
        .single();

      if (mtError || !meetingType) {
        return new Response(
          JSON.stringify({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Meeting type not found.' },
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      newMeetingType = meetingType;
    }

    // Calculate new end_time
    const newStartTime = start_time ? new Date(start_time) : new Date(existingBooking.start_time);
    const duration = newMeetingType.duration_minutes;
    const newEndTime = new Date(newStartTime.getTime() + duration * 60000);

    // Validate not in past
    if (newStartTime < new Date()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Cannot update booking to a past date/time.',
            details: {
              field: 'start_time',
              value: newStartTime.toISOString(),
              reason: 'Date is in the past',
            },
          },
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check availability if time or meeting type changed
    let availabilityChecked = false;
    if (start_time || meeting_type_id) {
      const { data: conflictingBookings } = await supabaseClient
        .from('bookings')
        .select('id')
        .neq('id', booking_id) // Exclude current booking
        .eq('status', 'confirmed')
        .or(
          `and(start_time.lt.${newEndTime.toISOString()},end_time.gt.${newStartTime.toISOString()})`
        );

      if (conflictingBookings && conflictingBookings.length > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'SLOT_UNAVAILABLE',
              message: 'The requested time slot is no longer available.',
              details: {
                requested_time: newStartTime.toISOString(),
              },
            },
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      availabilityChecked = true;
    }

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (start_time) {
      updates.start_time = newStartTime.toISOString();
      updates.end_time = newEndTime.toISOString();
    }

    if (meeting_type_id) {
      updates.meeting_type_id = meeting_type_id;
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (phone_number) {
      updates.phone_number = phone_number;
    }

    // Update booking in database
    const { data: updatedBooking, error: updateError } = await supabaseClient
      .from('bookings')
      .update(updates)
      .eq('id', booking_id)
      .select('*, meeting_types(*)')
      .single();

    if (updateError || !updatedBooking) {
      console.error('Database update error:', updateError);
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update booking. Please try again.',
          },
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update Google Calendar event
    let calendarUpdated = false;
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

        const eventUpdate: any = {
          summary: `${newMeetingType.name} - ${user.email}`,
          start: {
            dateTime: updatedBooking.start_time,
            timeZone: 'UTC',
          },
          end: {
            dateTime: updatedBooking.end_time,
            timeZone: 'UTC',
          },
        };

        if (description) {
          eventUpdate.description = description;
        }

        await calendar.events.update({
          calendarId: 'primary',
          eventId: existingBooking.google_calendar_event_id,
          requestBody: eventUpdate,
        });

        calendarUpdated = true;
      } catch (calendarError) {
        console.error('Google Calendar update error:', calendarError);
        // Don't fail the request, but log the error
        // Consider implementing retry logic or background job
      }
    }

    // Transform response
    const response = {
      id: updatedBooking.id,
      user_id: updatedBooking.user_id,
      meeting_type_id: updatedBooking.meeting_type_id,
      start_time: updatedBooking.start_time,
      end_time: updatedBooking.end_time,
      status: updatedBooking.status,
      description: updatedBooking.description,
      phone_number: updatedBooking.phone_number,
      google_meet_link: updatedBooking.google_meet_link,
      google_calendar_event_id: updatedBooking.google_calendar_event_id,
      location_address: updatedBooking.location_address,
      location_coords: updatedBooking.location_coords,
      created_at: updatedBooking.created_at,
      updated_at: updatedBooking.updated_at,
      meeting_type: updatedBooking.meeting_types,
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          booking: response,
          calendar_updated: calendarUpdated,
          availability_checked: availabilityChecked,
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

---

## Testing Strategy

### Unit Tests (Deno)

```typescript
Deno.test('PATCH /update-booking - successfully updates start time', async () => {
  // Test implementation
});

Deno.test('PATCH /update-booking - re-checks availability for time change', async () => {
  // Test implementation
});

Deno.test('PATCH /update-booking - prevents update to cancelled booking', async () => {
  // Test implementation
});

Deno.test('PATCH /update-booking - validates phone number format', async () => {
  // Test implementation
});

Deno.test('PATCH /update-booking - updates Google Calendar event', async () => {
  // Test implementation (with mocked Google API)
});
```

### Integration Tests

```typescript
// src/services/api/__tests__/updateBooking.test.ts

describe('updateBooking', () => {
  it('should update booking successfully', async () => {
    const { data, error } = await updateBooking({
      booking_id: 'test-id',
      description: 'Updated description',
    });

    expect(error).toBeNull();
    expect(data.booking.description).toBe('Updated description');
  });

  it('should reject update to past date', async () => {
    const pastDate = new Date('2020-01-01').toISOString();
    const { data, error } = await updateBooking({
      booking_id: 'test-id',
      start_time: pastDate,
    });

    expect(error).toBeDefined();
    expect(error.code).toBe('VALIDATION_ERROR');
  });
});
```

---

## Acceptance Criteria

- [ ] Edge function deployed to Supabase
- [ ] Users can update their own bookings only
- [ ] Cannot update cancelled bookings (422 error)
- [ ] Re-checks availability for time/meeting type changes
- [ ] Validates phone numbers (E.164 format)
- [ ] Prevents updates to past dates
- [ ] Updates Google Calendar event successfully
- [ ] Handles Google Calendar sync failures gracefully
- [ ] Returns detailed error messages for conflicts
- [ ] Database + calendar updates are atomic (rollback on failure)
- [ ] Unit tests pass (Deno)
- [ ] Integration tests pass (client-side)
- [ ] Performance <2s (including calendar sync)

---

## Related Files

- **Edge Function**: `supabase/functions/update-booking/index.ts`
- **Types**: `src/types/booking.ts`
- **API Client**: `src/services/api/bookings.ts`
- **Tests**: `supabase/functions/update-booking/index.test.ts`

---

## Notes

- Duration is fixed by meeting type (cannot be changed directly)
- Consider implementing optimistic locking (version field) to prevent race conditions
- Google Calendar sync failures should not fail the entire request
- Future enhancement: Implement background job queue for calendar sync retries
- Consider sending email notification to user when booking is updated
