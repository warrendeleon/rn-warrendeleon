# TASK-344: Get Availability Edge Function

**Task ID**: TASK-344
**Title**: Get Availability Edge Function
**User Story**: [US-062](../stories/US-062-booking-backend.md)
**Epic**: [EPIC-031](../epics/EPIC-031-book-a-call.md)
**Status**: 📋 To Do
**Priority**: High
**Effort**: 4h
**Owner**: Warren de Leon
**Created**: 2025-11-25
**Dependencies**: TASK-342 (Database Schema), TASK-343 (Admin OAuth)

---

## Context

Users need to see Warren's available time slots to book calls. This Edge Function fetches Warren's Google Calendar availability using the OAuth tokens from TASK-343, applies business rules (working hours, buffer times, booking duration), and returns a list of available slots.

**Key Requirements**:

- Query Google Calendar API (`freebusy.query`) for Warren's availability
- Apply working hours constraints (9am-5pm configurable)
- Apply buffer time between bookings (15 minutes default)
- Filter out past slots and slots beyond days_ahead_limit (30 days default)
- Generate slots matching exact booking duration (30 minutes default)
- Handle timezone conversions (store UTC, display user's local timezone)
- Automatic OAuth token refresh if expired

**Business Rules**:

- Slots must be within working hours (configurable per day)
- Minimum 15-minute buffer between consecutive bookings
- Slot intervals match booking duration exactly (no 15-minute intervals for 30-minute bookings)
- Maximum 30 days ahead (configurable)
- Only return future slots (no past availability)

**Google Calendar API**:

- Endpoint: `https://www.googleapis.com/calendar/v3/freeBusy`
- Scope required: `calendar.readonly`
- Returns busy periods, Edge Function generates available slots

---

## Objective

Implement an Edge Function that fetches Warren's calendar availability, applies business constraints, and returns a list of available time slots for users to book.

**Deliverable**: Fully functional Edge Function at `/get-availability` with timezone support, automatic token refresh, and comprehensive error handling.

---

## Technical Implementation

### Availability Generation Flow

```
User Request (GET /get-availability?date=2025-11-26&timezone=Europe/London)
    ↓
Validate JWT (authenticated users only)
    ↓
Fetch booking_config (working hours, buffer, duration, days_ahead_limit)
    ↓
Fetch admin_oauth (Google OAuth tokens)
    ↓
Check token expiration → If expired, refresh token (call admin-oauth/refresh)
    ↓
Query Google Calendar API (freebusy.query for requested date)
    ↓
Parse busy periods from Google response
    ↓
Generate time slots:
  - Start: working_hours_start (e.g., 09:00 local time)
  - End: working_hours_end (e.g., 17:00 local time)
  - Interval: duration_minutes (e.g., 30 min)
  - Skip busy periods
  - Apply buffer_minutes between bookings
    ↓
Filter slots:
  - Remove past slots (< current time)
  - Remove slots beyond days_ahead_limit
  - Remove slots during busy periods
    ↓
Convert slots to user's timezone (from UTC)
    ↓
Return available slots as JSON array
```

### Data Flow Diagram

```
┌──────────────┐
│ User Request │
│ GET /get-    │
│ availability │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────┐
│ Validate JWT & Extract User │
└──────────┬──────────────────┘
           │
           ▼
┌───────────────────────────────┐
│ Fetch booking_config          │
│ (working hours, buffer, etc.) │
└──────────┬────────────────────┘
           │
           ▼
┌───────────────────────────┐
│ Fetch admin_oauth tokens  │
└──────────┬────────────────┘
           │
           ▼
┌──────────────────────────┐
│ Check token expiration   │
│ If expired → Refresh     │
└──────────┬───────────────┘
           │
           ▼
┌────────────────────────────────┐
│ Query Google Calendar API      │
│ POST /calendar/v3/freeBusy     │
│ Request: timeMin, timeMax,     │
│          calendarId            │
└──────────┬─────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ Parse Google Response          │
│ Extract busy periods:          │
│ [{ start, end }, ...]          │
└──────────┬─────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ Generate Available Slots       │
│ Algorithm:                     │
│ 1. Start at working_hours_start│
│ 2. While < working_hours_end:  │
│    - Check if slot overlaps    │
│      busy period               │
│    - Check buffer from last    │
│      booking                   │
│    - If available, add slot    │
│    - Increment by duration     │
└──────────┬─────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ Filter Slots                   │
│ - Remove past slots            │
│ - Remove beyond days_ahead     │
│ - Apply timezone conversion    │
└──────────┬─────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ Return JSON Response           │
│ {                              │
│   slots: [                     │
│     {                          │
│       start: "2025-11-26T09:00"│
│       end: "2025-11-26T09:30"  │
│       startUTC: "..."          │
│       endUTC: "..."            │
│     }                          │
│   ],                           │
│   timezone: "Europe/London",   │
│   date: "2025-11-26"           │
│ }                              │
└────────────────────────────────┘
```

### File Structure

```
supabase/
└── functions/
    └── get-availability/
        ├── index.ts                    # Main handler
        ├── utils/
        │   ├── google-calendar.ts      # Google Calendar API client
        │   ├── slot-generator.ts       # Slot generation algorithm
        │   ├── token-manager.ts        # Token refresh logic
        │   └── timezone-utils.ts       # Timezone conversion helpers
        ├── types.ts                    # TypeScript types
        └── README.md                   # Usage documentation
```

### 1. Main Handler (index.ts)

```typescript
// supabase/functions/get-availability/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchCalendarAvailability } from './utils/google-calendar.ts';
import { generateAvailableSlots } from './utils/slot-generator.ts';
import { ensureValidToken } from './utils/token-manager.ts';
import { convertToTimezone, parseDate } from './utils/timezone-utils.ts';
import type { AvailabilityResponse, TimeSlot } from './types.ts';

/**
 * Get Availability Edge Function
 * Returns available time slots for booking based on Google Calendar availability
 *
 * Query Parameters:
 * - date: ISO date string (YYYY-MM-DD) - required
 * - timezone: IANA timezone (e.g., "Europe/London") - optional, defaults to UTC
 *
 * Response:
 * {
 *   slots: Array<{ start, end, startUTC, endUTC }>,
 *   timezone: string,
 *   date: string
 * }
 */

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialise Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const dateParam = url.searchParams.get('date');
    const timezoneParam = url.searchParams.get('timezone') || 'UTC';

    if (!dateParam) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: date (format: YYYY-MM-DD)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate date format
    const requestedDate = parseDate(dateParam);
    if (!requestedDate) {
      return new Response(JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch booking configuration
    const { data: config, error: configError } = await supabaseClient
      .from('booking_config')
      .select('*')
      .single();

    if (configError || !config) {
      return new Response(JSON.stringify({ error: 'Booking configuration not found' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if requested date is within allowed range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + config.days_ahead_limit);

    if (requestedDate < today || requestedDate > maxDate) {
      return new Response(
        JSON.stringify({
          error: `Date must be between today and ${config.days_ahead_limit} days ahead`,
          minDate: today.toISOString().split('T')[0],
          maxDate: maxDate.toISOString().split('T')[0],
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure we have a valid OAuth token (refresh if needed)
    const accessToken = await ensureValidToken(supabaseClient, config.admin_user_id);

    // Query Google Calendar for busy periods
    const busyPeriods = await fetchCalendarAvailability(
      accessToken,
      config.calendar_id,
      requestedDate,
      config.timezone
    );

    // Generate available slots
    const slots = generateAvailableSlots(requestedDate, busyPeriods, {
      workingHoursStart: config.working_hours_start,
      workingHoursEnd: config.working_hours_end,
      durationMinutes: config.duration_minutes,
      bufferMinutes: config.buffer_minutes,
      timezone: config.timezone,
      userTimezone: timezoneParam,
    });

    // Build response
    const response: AvailabilityResponse = {
      slots,
      timezone: timezoneParam,
      date: dateParam,
      config: {
        durationMinutes: config.duration_minutes,
        bufferMinutes: config.buffer_minutes,
        workingHours: {
          start: config.working_hours_start,
          end: config.working_hours_end,
        },
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get availability error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch availability', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### 2. Google Calendar Client (utils/google-calendar.ts)

```typescript
// supabase/functions/get-availability/utils/google-calendar.ts

import type { BusyPeriod } from '../types.ts';

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

interface FreeBusyRequest {
  timeMin: string;
  timeMax: string;
  items: Array<{ id: string }>;
}

interface FreeBusyResponse {
  calendars: {
    [calendarId: string]: {
      busy: Array<{
        start: string;
        end: string;
      }>;
    };
  };
}

/**
 * Fetch calendar availability using Google Calendar freebusy.query API
 *
 * @param accessToken - Valid OAuth access token
 * @param calendarId - Google Calendar ID (e.g., "warren@example.com")
 * @param date - Date to check availability for
 * @param timezone - Calendar timezone (e.g., "Europe/London")
 * @returns Array of busy periods
 */
export async function fetchCalendarAvailability(
  accessToken: string,
  calendarId: string,
  date: Date,
  timezone: string
): Promise<BusyPeriod[]> {
  // Calculate time range for the requested date (full day in calendar timezone)
  const timeMin = new Date(date);
  timeMin.setHours(0, 0, 0, 0);

  const timeMax = new Date(date);
  timeMax.setHours(23, 59, 59, 999);

  const requestBody: FreeBusyRequest = {
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    items: [{ id: calendarId }],
  };

  const response = await fetch(`${GOOGLE_CALENDAR_API}/freeBusy`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Calendar API error: ${response.status} - ${error}`);
  }

  const data: FreeBusyResponse = await response.json();

  // Extract busy periods for the requested calendar
  const calendarData = data.calendars[calendarId];
  if (!calendarData) {
    throw new Error(`Calendar not found: ${calendarId}`);
  }

  // Convert Google's busy periods to our format
  return calendarData.busy.map(period => ({
    start: new Date(period.start),
    end: new Date(period.end),
  }));
}
```

### 3. Slot Generator (utils/slot-generator.ts)

```typescript
// supabase/functions/get-availability/utils/slot-generator.ts

import type { BusyPeriod, TimeSlot, SlotGenerationOptions } from '../types.ts';
import { convertToTimezone } from './timezone-utils.ts';

/**
 * Generate available time slots based on busy periods and business rules
 *
 * Algorithm:
 * 1. Start at working_hours_start in calendar timezone
 * 2. Generate slots with duration = duration_minutes
 * 3. Skip slots that overlap with busy periods
 * 4. Apply buffer_minutes between consecutive bookings
 * 5. Stop at working_hours_end
 * 6. Filter out past slots
 * 7. Convert to user's timezone
 */
export function generateAvailableSlots(
  date: Date,
  busyPeriods: BusyPeriod[],
  options: SlotGenerationOptions
): TimeSlot[] {
  const {
    workingHoursStart,
    workingHoursEnd,
    durationMinutes,
    bufferMinutes,
    timezone,
    userTimezone,
  } = options;

  const slots: TimeSlot[] = [];
  const now = new Date();

  // Parse working hours (format: "HH:MM:SS")
  const [startHour, startMinute] = workingHoursStart.split(':').map(Number);
  const [endHour, endMinute] = workingHoursEnd.split(':').map(Number);

  // Create start and end times for the day in calendar timezone
  const dayStart = new Date(date);
  dayStart.setHours(startHour, startMinute, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(endHour, endMinute, 0, 0);

  // Current slot start time
  let currentStart = new Date(dayStart);

  while (currentStart < dayEnd) {
    const currentEnd = new Date(currentStart.getTime() + durationMinutes * 60 * 1000);

    // Check if slot extends beyond working hours
    if (currentEnd > dayEnd) {
      break;
    }

    // Check if slot is in the past
    if (currentEnd <= now) {
      currentStart = new Date(currentStart.getTime() + durationMinutes * 60 * 1000);
      continue;
    }

    // Check if slot overlaps with any busy period
    const overlaps = busyPeriods.some(busy =>
      isOverlapping(currentStart, currentEnd, busy.start, busy.end)
    );

    if (!overlaps) {
      // Check if there's sufficient buffer from previous busy period
      const hasBuffer = busyPeriods.every(busy => {
        // If busy period ends before our slot starts, check buffer
        if (busy.end <= currentStart) {
          const bufferMs = bufferMinutes * 60 * 1000;
          const requiredStart = new Date(busy.end.getTime() + bufferMs);
          return currentStart >= requiredStart;
        }
        return true;
      });

      if (hasBuffer) {
        // Slot is available!
        slots.push({
          start: convertToTimezone(currentStart, timezone, userTimezone),
          end: convertToTimezone(currentEnd, timezone, userTimezone),
          startUTC: currentStart.toISOString(),
          endUTC: currentEnd.toISOString(),
        });
      }
    }

    // Move to next slot (increment by duration, not arbitrary interval)
    currentStart = new Date(currentStart.getTime() + durationMinutes * 60 * 1000);
  }

  return slots;
}

/**
 * Check if two time ranges overlap
 */
function isOverlapping(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1 < end2 && end1 > start2;
}
```

### 4. Token Manager (utils/token-manager.ts)

```typescript
// supabase/functions/get-availability/utils/token-manager.ts

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { decryptToken, encryptToken } from '../../admin-oauth/utils/encryption.ts';
import { refreshAccessToken } from '../../admin-oauth/utils/google-oauth-client.ts';

/**
 * Ensure we have a valid OAuth access token
 * If token is expired, automatically refresh it
 *
 * @param supabase - Supabase client
 * @param adminUserId - Admin user ID
 * @returns Valid access token
 */
export async function ensureValidToken(
  supabase: SupabaseClient,
  adminUserId: string
): Promise<string> {
  // Fetch current OAuth record
  const { data: oauthData, error: fetchError } = await supabase
    .from('admin_oauth')
    .select('encrypted_access_token, encrypted_refresh_token, token_expires_at')
    .eq('admin_user_id', adminUserId)
    .eq('provider', 'google')
    .single();

  if (fetchError || !oauthData) {
    throw new Error('OAuth tokens not found. Admin must authorize the application first.');
  }

  const expiresAt = new Date(oauthData.token_expires_at);
  const now = new Date();

  // Add 5-minute buffer to avoid using token that's about to expire
  const bufferMs = 5 * 60 * 1000;

  // Token is still valid
  if (expiresAt.getTime() - now.getTime() > bufferMs) {
    return await decryptToken(oauthData.encrypted_access_token);
  }

  // Token is expired or about to expire - refresh it
  console.log('Access token expired or expiring soon, refreshing...');

  const refreshToken = await decryptToken(oauthData.encrypted_refresh_token);
  const tokens = await refreshAccessToken(refreshToken);

  if (!tokens.access_token) {
    throw new Error('Failed to refresh access token');
  }

  // Encrypt new access token
  const encryptedAccessToken = await encryptToken(tokens.access_token);
  const newExpiresAt = new Date(now.getTime() + (tokens.expires_in || 3600) * 1000).toISOString();

  // Update database
  const { error: updateError } = await supabase
    .from('admin_oauth')
    .update({
      encrypted_access_token: encryptedAccessToken,
      token_expires_at: newExpiresAt,
      updated_at: now.toISOString(),
    })
    .eq('admin_user_id', adminUserId)
    .eq('provider', 'google');

  if (updateError) {
    throw new Error(`Failed to update refreshed token: ${updateError.message}`);
  }

  console.log('Access token refreshed successfully');
  return tokens.access_token;
}
```

### 5. Timezone Utilities (utils/timezone-utils.ts)

```typescript
// supabase/functions/get-availability/utils/timezone-utils.ts

/**
 * Parse ISO date string (YYYY-MM-DD) to Date object
 */
export function parseDate(dateString: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  // Validate date is valid
  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/**
 * Convert Date to ISO string in specific timezone
 *
 * NOTE: For simplicity, we return ISO strings. In production, consider using
 * a library like date-fns-tz for proper timezone conversion.
 *
 * For MVP, we'll assume:
 * - All times stored in UTC
 * - Client handles timezone display using user's browser timezone
 */
export function convertToTimezone(date: Date, fromTimezone: string, toTimezone: string): string {
  // For MVP: Return ISO string (UTC)
  // Client will convert to local timezone for display
  return date.toISOString();
}

/**
 * Format time for display (HH:MM format)
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
```

### 6. TypeScript Types (types.ts)

```typescript
// supabase/functions/get-availability/types.ts

export interface BusyPeriod {
  start: Date;
  end: Date;
}

export interface TimeSlot {
  start: string; // ISO string in user's timezone
  end: string; // ISO string in user's timezone
  startUTC: string; // ISO string in UTC (for booking creation)
  endUTC: string; // ISO string in UTC (for booking creation)
}

export interface SlotGenerationOptions {
  workingHoursStart: string; // "HH:MM:SS" format
  workingHoursEnd: string; // "HH:MM:SS" format
  durationMinutes: number;
  bufferMinutes: number;
  timezone: string; // Calendar timezone (IANA)
  userTimezone: string; // User's timezone (IANA)
}

export interface AvailabilityResponse {
  slots: TimeSlot[];
  timezone: string;
  date: string; // YYYY-MM-DD
  config: {
    durationMinutes: number;
    bufferMinutes: number;
    workingHours: {
      start: string;
      end: string;
    };
  };
}
```

---

## Example API Usage

### Request

```bash
curl -H "Authorization: Bearer USER_JWT_TOKEN" \
  "https://your-project.supabase.co/functions/v1/get-availability?date=2025-11-26&timezone=Europe/London"
```

### Response

```json
{
  "slots": [
    {
      "start": "2025-11-26T09:00:00.000Z",
      "end": "2025-11-26T09:30:00.000Z",
      "startUTC": "2025-11-26T09:00:00.000Z",
      "endUTC": "2025-11-26T09:30:00.000Z"
    },
    {
      "start": "2025-11-26T10:00:00.000Z",
      "end": "2025-11-26T10:30:00.000Z",
      "startUTC": "2025-11-26T10:00:00.000Z",
      "endUTC": "2025-11-26T10:30:00.000Z"
    },
    {
      "start": "2025-11-26T14:00:00.000Z",
      "end": "2025-11-26T14:30:00.000Z",
      "startUTC": "2025-11-26T14:00:00.000Z",
      "endUTC": "2025-11-26T14:30:00.000Z"
    }
  ],
  "timezone": "Europe/London",
  "date": "2025-11-26",
  "config": {
    "durationMinutes": 30,
    "bufferMinutes": 15,
    "workingHours": {
      "start": "09:00:00",
      "end": "17:00:00"
    }
  }
}
```

---

## Acceptance Criteria

- [ ] Authenticated users can fetch availability for any date within allowed range
- [ ] Slots generated match booking duration exactly (no arbitrary intervals)
- [ ] Busy periods from Google Calendar correctly exclude slots
- [ ] Buffer time applied between consecutive bookings
- [ ] Working hours constraints enforced (no slots outside 9am-5pm)
- [ ] Past slots filtered out (only future availability returned)
- [ ] Days ahead limit enforced (max 30 days configurable)
- [ ] OAuth token automatically refreshed if expired
- [ ] Timezone conversion handled correctly (UTC storage, user timezone display)
- [ ] TypeScript strict mode compliance
- [ ] All edge cases handled with descriptive error messages
- [ ] Response includes config metadata for client validation

---

## Edge Cases & Error Handling

| Scenario                                  | Expected Behaviour                         |
| ----------------------------------------- | ------------------------------------------ |
| OAuth token expired                       | Automatically refresh token, retry request |
| OAuth token refresh fails                 | Return 401 with message to re-authorize    |
| Invalid date format                       | Return 400 with validation error           |
| Date in the past                          | Return 400 with error message              |
| Date beyond days_ahead_limit              | Return 400 with allowed date range         |
| Calendar ID not found                     | Return 500 with Google API error           |
| Google API rate limit exceeded            | Return 429 with retry-after header         |
| No booking_config found                   | Return 500 with configuration error        |
| Working hours misconfigured (end < start) | Return 500 with validation error           |
| All slots busy for requested date         | Return empty slots array (valid response)  |
| User timezone invalid                     | Fallback to UTC, log warning               |
| Missing Authorization header              | Return 401 Unauthorized                    |
| Invalid/expired JWT                       | Return 401 with error message              |

---

## Performance Considerations

1. **Caching**: Consider caching availability responses for 5-10 minutes (same date/timezone)
2. **Parallel Queries**: Fetch booking_config and admin_oauth in parallel
3. **Slot Generation**: Optimise algorithm for large busy period arrays (use binary search for overlap checks)
4. **Token Refresh**: Only refresh if needed (5-minute buffer before expiration)

---

## Testing Strategy

### Unit Tests

- `generateAvailableSlots()` - Test slot generation with various busy period configurations
- `isOverlapping()` - Test overlap detection edge cases
- `parseDate()` - Test date parsing validation
- `convertToTimezone()` - Test timezone conversion (if implementing full timezone support)

### Integration Tests

1. **Happy Path**: Request availability for tomorrow with no busy periods
2. **Busy Periods**: Request availability with multiple busy periods (should return gaps)
3. **Buffer Time**: Verify buffer applied between bookings
4. **Working Hours**: Verify no slots outside working hours
5. **Past Slots**: Verify past slots filtered out
6. **Token Refresh**: Mock expired token, verify automatic refresh

---

## Dependencies

- **Blocked by**:
  - TASK-342 (Database Schema - needs booking_config table)
  - TASK-343 (Admin OAuth - needs OAuth tokens)
- **Blocks**:
  - TASK-345 (Create Booking - needs availability data for validation)

---

**Estimated Time**: 4h
**Last Updated**: 2025-11-25
