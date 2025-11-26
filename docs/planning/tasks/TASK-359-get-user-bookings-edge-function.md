# TASK-359: Get User Bookings Edge Function

**Status**: 🆕 Not Started
**Effort**: 2 hours
**Priority**: High
**Parent**: [US-065: View & Manage Bookings](../user-stories/US-065-view-manage-bookings.md)

---

## Overview

Create a Supabase Edge Function that retrieves all bookings for the authenticated user, filtered by status and ordered by start time. This endpoint will power the My Bookings screen and provide the data needed for viewing, editing, and cancelling appointments.

---

## Requirements

### Functional Requirements

1. **Authentication Required**: Endpoint must verify JWT token from Supabase Auth
2. **Query Parameters**:
   - `status` (optional): Filter by booking status (confirmed, cancelled, completed)
   - `upcoming_only` (optional): Boolean to filter only future bookings
3. **Response Data**: Return full booking details including user info, time slot, meeting type
4. **Ordering**: Always return bookings ordered by `start_time` ascending (soonest first)
5. **User Isolation**: Only return bookings for the authenticated user
6. **Join Data**: Include related meeting type details (name, duration, description)

### Non-Functional Requirements

1. **Performance**: Response time <500ms for typical user (10-50 bookings)
2. **Security**: Row-level security enforced via Supabase policies
3. **Error Handling**: Clear error messages for authentication/authorization failures
4. **Data Privacy**: Never return bookings from other users

---

## API Contract

### Endpoint

```
GET /functions/v1/get-user-bookings
```

### Headers

```
Authorization: Bearer {supabase_jwt_token}
Content-Type: application/json
```

### Query Parameters

```typescript
interface GetUserBookingsQueryParams {
  status?: 'confirmed' | 'cancelled' | 'completed';
  upcoming_only?: 'true' | 'false'; // String boolean
}
```

### Request Examples

```bash
# Get all bookings
curl -X GET 'https://{project-ref}.supabase.co/functions/v1/get-user-bookings' \
  -H 'Authorization: Bearer {token}'

# Get only confirmed upcoming bookings
curl -X GET 'https://{project-ref}.supabase.co/functions/v1/get-user-bookings?status=confirmed&upcoming_only=true' \
  -H 'Authorization: Bearer {token}'

# Get all cancelled bookings
curl -X GET 'https://{project-ref}.supabase.co/functions/v1/get-user-bookings?status=cancelled' \
  -H 'Authorization: Bearer {token}'
```

### Response Schema

```typescript
interface GetUserBookingsResponse {
  success: true;
  data: {
    bookings: Booking[];
    count: number;
  };
}

interface Booking {
  id: string; // UUID
  user_id: string; // UUID
  meeting_type_id: string; // UUID
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
  status: 'confirmed' | 'cancelled' | 'completed';
  description: string | null;
  phone_number: string;
  google_meet_link: string | null;
  google_calendar_event_id: string | null;
  location_address: string | null;
  location_coords: {
    latitude: number;
    longitude: number;
  } | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601

  // Joined meeting type data
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
    "bookings": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "meeting_type_id": "789e4567-e89b-12d3-a456-426614174000",
        "start_time": "2025-12-01T14:00:00.000Z",
        "end_time": "2025-12-01T15:00:00.000Z",
        "status": "confirmed",
        "description": "Discuss Q1 marketing strategy",
        "phone_number": "+447700900123",
        "google_meet_link": "https://meet.google.com/abc-defg-hij",
        "google_calendar_event_id": "eventid123",
        "location_address": null,
        "location_coords": null,
        "created_at": "2025-11-20T10:30:00.000Z",
        "updated_at": "2025-11-20T10:30:00.000Z",
        "meeting_type": {
          "name": "Strategy Session",
          "duration_minutes": 60,
          "description": "Deep dive into strategic planning",
          "meeting_type": "google_meet"
        }
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "meeting_type_id": "889e4567-e89b-12d3-a456-426614174001",
        "start_time": "2025-12-05T10:00:00.000Z",
        "end_time": "2025-12-05T10:30:00.000Z",
        "status": "confirmed",
        "description": null,
        "phone_number": "+447700900456",
        "google_meet_link": null,
        "google_calendar_event_id": "eventid456",
        "location_address": "123 High Street, London, UK",
        "location_coords": {
          "latitude": 51.5074,
          "longitude": -0.1278
        },
        "created_at": "2025-11-22T14:15:00.000Z",
        "updated_at": "2025-11-22T14:15:00.000Z",
        "meeting_type": {
          "name": "Quick Catchup",
          "duration_minutes": 30,
          "description": "Brief status update",
          "meeting_type": "in_person"
        }
      }
    ],
    "count": 2
  }
}
```

### Error Responses

**401 Unauthorized** - Missing or invalid JWT token:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required. Please provide a valid Bearer token."
  }
}
```

**400 Bad Request** - Invalid query parameters:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Invalid status value. Must be one of: confirmed, cancelled, completed."
  }
}
```

**500 Internal Server Error** - Database or server error:

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later."
  }
}
```

---

## Implementation Details

### Database Query Logic

```typescript
// supabase/functions/get-user-bookings/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async req => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get JWT from Authorization header
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
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client with user context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token.',
          },
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const upcomingOnly = url.searchParams.get('upcoming_only') === 'true';

    // Validate status parameter
    if (status && !['confirmed', 'cancelled', 'completed'].includes(status)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: 'Invalid status value. Must be one of: confirmed, cancelled, completed.',
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Build query
    let query = supabaseClient
      .from('bookings')
      .select(
        `
        id,
        user_id,
        meeting_type_id,
        start_time,
        end_time,
        status,
        description,
        phone_number,
        google_meet_link,
        google_calendar_event_id,
        location_address,
        location_coords,
        created_at,
        updated_at,
        meeting_types (
          name,
          duration_minutes,
          description,
          meeting_type
        )
      `
      )
      .eq('user_id', user.id)
      .order('start_time', { ascending: true });

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply upcoming filter
    if (upcomingOnly) {
      const now = new Date().toISOString();
      query = query.gte('start_time', now);
    }

    const { data: bookings, error: queryError } = await query;

    if (queryError) {
      console.error('Database query error:', queryError);
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred. Please try again later.',
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Transform response to flatten meeting_type
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      user_id: booking.user_id,
      meeting_type_id: booking.meeting_type_id,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
      description: booking.description,
      phone_number: booking.phone_number,
      google_meet_link: booking.google_meet_link,
      google_calendar_event_id: booking.google_calendar_event_id,
      location_address: booking.location_address,
      location_coords: booking.location_coords,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      meeting_type: booking.meeting_types,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          bookings: transformedBookings,
          count: transformedBookings.length,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
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
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

### Row-Level Security Policies

Ensure the `bookings` table has RLS enabled with policy:

```sql
-- Policy: Users can only read their own bookings
CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Testing Strategy

### Unit Tests (Deno Test)

```typescript
// supabase/functions/get-user-bookings/index.test.ts

import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.test('GET /get-user-bookings - returns bookings for authenticated user', async () => {
  const client = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  // Sign in test user
  const { data: authData } = await client.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123',
  });

  const token = authData.session?.access_token;

  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/get-user-bookings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await response.json();
  assertEquals(response.status, 200);
  assertEquals(json.success, true);
  assertEquals(Array.isArray(json.data.bookings), true);
});

Deno.test('GET /get-user-bookings - returns 401 without token', async () => {
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/get-user-bookings`);

  const json = await response.json();
  assertEquals(response.status, 401);
  assertEquals(json.success, false);
  assertEquals(json.error.code, 'UNAUTHORIZED');
});

Deno.test('GET /get-user-bookings - filters by status', async () => {
  const client = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  const { data: authData } = await client.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123',
  });

  const token = authData.session?.access_token;

  const response = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/get-user-bookings?status=confirmed`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const json = await response.json();
  assertEquals(response.status, 200);
  assertEquals(json.success, true);

  // All bookings should have confirmed status
  json.data.bookings.forEach((booking: any) => {
    assertEquals(booking.status, 'confirmed');
  });
});
```

### Integration Tests (Client-Side)

Test from React Native app:

```typescript
// src/services/api/__tests__/bookings.test.ts

import { getUserBookings } from '../bookings';
import { supabase } from '@app/lib/supabase';

describe('getUserBookings', () => {
  it('should fetch bookings for authenticated user', async () => {
    const { data, error } = await getUserBookings();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.bookings).toBeInstanceOf(Array);
    expect(data.count).toBeGreaterThanOrEqual(0);
  });

  it('should filter by status', async () => {
    const { data, error } = await getUserBookings({ status: 'confirmed' });

    expect(error).toBeNull();
    expect(data.bookings.every(b => b.status === 'confirmed')).toBe(true);
  });

  it('should only return upcoming bookings when filtered', async () => {
    const { data, error } = await getUserBookings({ upcomingOnly: true });

    expect(error).toBeNull();
    const now = new Date();
    expect(data.bookings.every(b => new Date(b.start_time) >= now)).toBe(true);
  });
});
```

---

## Acceptance Criteria

- [ ] Edge function deployed to Supabase
- [ ] Returns bookings for authenticated user only
- [ ] Filters by status parameter work correctly
- [ ] `upcoming_only` parameter filters future bookings
- [ ] Results ordered by `start_time` ascending
- [ ] Includes joined meeting type data
- [ ] Returns 401 for unauthenticated requests
- [ ] Returns 400 for invalid query parameters
- [ ] Response matches API contract exactly
- [ ] Row-level security policies enforced
- [ ] Unit tests pass (Deno test)
- [ ] Integration tests pass (client-side)
- [ ] Performance <500ms for typical user

---

## Related Files

- **Edge Function**: `supabase/functions/get-user-bookings/index.ts`
- **Types**: `src/types/booking.ts`
- **API Client**: `src/services/api/bookings.ts`
- **RLS Policies**: `supabase/migrations/XXXXXX_bookings_rls.sql`

---

## Notes

- This endpoint is READ-ONLY (no mutations)
- RLS policies provide defence in depth (even if user_id check removed from query)
- Future enhancement: Add pagination for users with >100 bookings
- Future enhancement: Add search/filter by date range
- Consider caching strategy for frequently accessed upcoming bookings
