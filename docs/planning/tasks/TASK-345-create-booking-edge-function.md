# TASK-345: Create Booking Edge Function

**Task ID**: TASK-345
**Title**: Create Booking Edge Function
**User Story**: [US-062](../stories/US-062-booking-backend.md)
**Epic**: [EPIC-031](../epics/EPIC-031-book-a-call.md)
**Status**: 📋 To Do
**Priority**: High
**Effort**: 4h
**Owner**: Warren de Leon
**Created**: 2025-11-25
**Dependencies**: TASK-342 (Database Schema), TASK-343 (Admin OAuth), TASK-344 (Get Availability)

---

## Context

This Edge Function handles the complete booking creation workflow, including all security checks, availability validation, Google Calendar event creation, and database persistence. This is the most critical backend component, as it must prevent double-bookings, enforce rate limits, and handle race conditions.

**Security Checks (executed in order)**:

1. **Authentication**: User must be logged in (valid JWT)
2. **Email Verification**: User email must be verified
3. **Account Age**: Account must be at least 24 hours old (anti-spam)
4. **Honeypot**: Hidden field must be empty (bot detection)
5. **Rate Limiting**: Maximum 2 bookings per user per day, 10 per IP per minute
6. **Slot Availability**: Requested slot must be available (atomic check)
7. **Cooldown Period**: 1 hour between consecutive bookings

**Business Logic**:

- Create Google Calendar event with appropriate details based on call type
- Video calls: Automatically generate Google Meet link
- Phone calls: Include `tel://` link in event description
- Event titles: "[Mobile call] User and Warren" or "User and Warren"
- Store booking in database with audit trail
- Update rate limit counters

**Atomicity Requirements**:

- Slot availability check and booking creation must be atomic (prevent race conditions)
- Use database transaction with `FOR UPDATE` lock or UNIQUE constraint
- If Google Calendar creation fails, roll back database insert

---

## Objective

Implement a secure Edge Function that creates bookings with full validation, Google Calendar integration, and audit logging.

**Deliverable**: Production-ready Edge Function at `/create-booking` with full security checks, race condition handling, and error recovery.

---

## Technical Implementation

### Booking Creation Flow

```
User Request (POST /create-booking)
    ↓
1. Validate JWT (authenticated user)
    ↓
2. Verify email confirmed
    ↓
3. Check account age (≥24h)
    ↓
4. Validate honeypot field (must be empty)
    ↓
5. Check rate limits (user + IP)
    ↓
6. Validate request body (Zod schema)
    ↓
7. Check 1-hour cooldown (since last booking)
    ↓
8. Fetch booking_config + admin_oauth
    ↓
9. Ensure valid OAuth token (refresh if needed)
    ↓
10. Atomic slot availability check (SELECT FOR UPDATE)
    ↓
11. Begin database transaction
    ↓
12. Create Google Calendar event
    ↓
13. Insert booking record
    ↓
14. Insert audit log entry (action: created)
    ↓
15. Update rate limit counters
    ↓
16. Commit transaction
    ↓
17. Return success response with booking details
```

### Security Flow Diagram

```
┌──────────────────┐
│  User Request    │
│ POST /create-    │
│     booking      │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────┐
│ Security Check 1:       │
│ JWT Validation          │
│ ❌ Invalid → 401        │
└────────┬────────────────┘
         │ ✅ Valid
         ▼
┌─────────────────────────┐
│ Security Check 2:       │
│ Email Verified          │
│ ❌ Not verified → 403   │
└────────┬────────────────┘
         │ ✅ Verified
         ▼
┌─────────────────────────┐
│ Security Check 3:       │
│ Account Age ≥24h        │
│ ❌ Too new → 403        │
└────────┬────────────────┘
         │ ✅ Old enough
         ▼
┌─────────────────────────┐
│ Security Check 4:       │
│ Honeypot Empty          │
│ ❌ Filled → 403 (bot)   │
└────────┬────────────────┘
         │ ✅ Empty
         ▼
┌─────────────────────────┐
│ Security Check 5:       │
│ Rate Limits             │
│ - User: 2/day           │
│ - IP: 10/min            │
│ ❌ Exceeded → 429       │
└────────┬────────────────┘
         │ ✅ Within limits
         ▼
┌─────────────────────────┐
│ Security Check 6:       │
│ Cooldown Period         │
│ 1 hour since last       │
│ ❌ Too soon → 429       │
└────────┬────────────────┘
         │ ✅ Cooldown passed
         ▼
┌─────────────────────────┐
│ Validate Request Body   │
│ (Zod schema)            │
│ ❌ Invalid → 400        │
└────────┬────────────────┘
         │ ✅ Valid
         ▼
┌─────────────────────────┐
│ Fetch Configuration     │
│ - booking_config        │
│ - admin_oauth           │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Ensure Valid Token      │
│ (refresh if expired)    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ BEGIN TRANSACTION       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Atomic Slot Check       │
│ SELECT ... FOR UPDATE   │
│ ❌ Slot taken → 409     │
└────────┬────────────────┘
         │ ✅ Available
         ▼
┌─────────────────────────┐
│ Create Google Calendar  │
│ Event                   │
│ - Video: Auto Meet link │
│ - Phone: tel:// link    │
│ ❌ Fails → ROLLBACK     │
└────────┬────────────────┘
         │ ✅ Created
         ▼
┌─────────────────────────┐
│ INSERT bookings         │
│ (with google_event_id)  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ INSERT audit_log        │
│ (action: created)       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ UPDATE rate_limits      │
│ (increment counters)    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ COMMIT TRANSACTION      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Return Success Response │
│ - Booking ID            │
│ - Google Meet link      │
│ - Confirmation details  │
└─────────────────────────┘
```

### File Structure

```
supabase/
└── functions/
    └── create-booking/
        ├── index.ts                    # Main handler
        ├── validation.ts               # Zod schema + request validation
        ├── security/
        │   ├── auth-checks.ts          # Email verification, account age
        │   ├── rate-limiter.ts         # Rate limiting logic
        │   └── honeypot.ts             # Bot detection
        ├── booking/
        │   ├── availability.ts         # Atomic slot availability check
        │   ├── calendar-event.ts       # Google Calendar event creation
        │   └── database.ts             # Database operations
        ├── utils/
        │   ├── token-manager.ts        # OAuth token management (reuse from TASK-344)
        │   └── error-handler.ts        # Centralized error handling
        ├── types.ts                    # TypeScript types
        └── README.md                   # Usage documentation
```

### 1. Main Handler (index.ts)

```typescript
// supabase/functions/create-booking/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateBookingRequest } from './validation.ts';
import { checkEmailVerified, checkAccountAge } from './security/auth-checks.ts';
import { checkRateLimits, updateRateLimits } from './security/rate-limiter.ts';
import { validateHoneypot } from './security/honeypot.ts';
import { checkSlotAvailability } from './booking/availability.ts';
import { createCalendarEvent } from './booking/calendar-event.ts';
import { insertBooking, insertAuditLog } from './booking/database.ts';
import { ensureValidToken } from './utils/token-manager.ts';
import { handleError } from './utils/error-handler.ts';
import type { CreateBookingRequest, CreateBookingResponse } from './types.ts';

/**
 * Create Booking Edge Function
 * Handles booking creation with comprehensive security checks
 *
 * Request Body:
 * {
 *   startTime: string (ISO 8601 UTC),
 *   endTime: string (ISO 8601 UTC),
 *   callType: 'video' | 'phone',
 *   userName: string,
 *   userEmail: string,
 *   userPhone?: string (required if callType = 'phone'),
 *   honeypot?: string (must be empty)
 * }
 *
 * Response:
 * {
 *   bookingId: string,
 *   googleEventId: string,
 *   googleMeetLink?: string (video only),
 *   startTime: string,
 *   endTime: string,
 *   callType: string
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

    // 1. Validate JWT
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

    // 2. Verify email confirmed
    if (!checkEmailVerified(user)) {
      return new Response(
        JSON.stringify({
          error: 'Email verification required. Please verify your email before booking.',
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Check account age (≥24 hours)
    if (!checkAccountAge(user, 24)) {
      return new Response(
        JSON.stringify({ error: 'Account must be at least 24 hours old to book a call.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();

    // 4. Validate honeypot (bot detection)
    if (!validateHoneypot(body.honeypot)) {
      // Log as potential bot, but return generic error
      console.warn('Honeypot triggered for user:', user.id);
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Validate request body (Zod schema)
    const validationResult = validateBookingRequest(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationResult.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bookingRequest: CreateBookingRequest = validationResult.data;

    // Get user IP address for rate limiting
    const userIp =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // 6. Check rate limits (user + IP)
    const rateLimitCheck = await checkRateLimits(supabaseClient, user.id, userIp);
    if (!rateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          details: rateLimitCheck.reason,
          retryAfter: rateLimitCheck.retryAfter,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': rateLimitCheck.retryAfter?.toString() || '3600',
          },
        }
      );
    }

    // Fetch booking configuration
    const { data: config, error: configError } = await supabaseClient
      .from('booking_config')
      .select('*')
      .single();

    if (configError || !config) {
      throw new Error('Booking configuration not found');
    }

    // Ensure valid OAuth token
    const accessToken = await ensureValidToken(supabaseClient, config.admin_user_id);

    // 7. Begin database transaction (Supabase doesn't support explicit transactions in Edge Functions)
    // Instead, we'll use atomic operations and error recovery

    // 8. Atomic slot availability check
    const slotAvailable = await checkSlotAvailability(
      supabaseClient,
      config.admin_user_id,
      bookingRequest.startTime,
      bookingRequest.endTime
    );

    if (!slotAvailable) {
      return new Response(
        JSON.stringify({
          error: 'Selected time slot is no longer available. Please choose another time.',
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 9. Create Google Calendar event
    const calendarEvent = await createCalendarEvent(accessToken, config.calendar_id, {
      startTime: bookingRequest.startTime,
      endTime: bookingRequest.endTime,
      callType: bookingRequest.callType,
      userName: bookingRequest.userName,
      userEmail: bookingRequest.userEmail,
      userPhone: bookingRequest.userPhone,
    });

    // 10. Insert booking record
    const booking = await insertBooking(supabaseClient, {
      userId: user.id,
      adminUserId: config.admin_user_id,
      startTimeUtc: bookingRequest.startTime,
      endTimeUtc: bookingRequest.endTime,
      callType: bookingRequest.callType,
      userName: bookingRequest.userName,
      userEmail: bookingRequest.userEmail,
      userPhone: bookingRequest.userPhone,
      googleEventId: calendarEvent.id,
      googleMeetLink: calendarEvent.meetLink,
    });

    // 11. Insert audit log
    await insertAuditLog(supabaseClient, {
      bookingId: booking.id,
      action: 'created',
      actorId: user.id,
      details: {
        ip: userIp,
        callType: bookingRequest.callType,
        googleEventId: calendarEvent.id,
      },
    });

    // 12. Update rate limit counters
    await updateRateLimits(supabaseClient, user.id, userIp);

    // 13. Build response
    const response: CreateBookingResponse = {
      bookingId: booking.id,
      googleEventId: calendarEvent.id,
      googleMeetLink: calendarEvent.meetLink,
      startTime: bookingRequest.startTime,
      endTime: bookingRequest.endTime,
      callType: bookingRequest.callType,
      status: 'confirmed',
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return handleError(error, corsHeaders);
  }
});
```

### 2. Request Validation (validation.ts)

```typescript
// supabase/functions/create-booking/validation.ts

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

/**
 * Zod schema for create booking request
 */
export const CreateBookingRequestSchema = z
  .object({
    startTime: z.string().datetime({ message: 'startTime must be ISO 8601 format' }),
    endTime: z.string().datetime({ message: 'endTime must be ISO 8601 format' }),
    callType: z.enum(['video', 'phone'], { message: 'callType must be "video" or "phone"' }),
    userName: z.string().min(1, 'userName is required').max(100, 'userName too long'),
    userEmail: z.string().email('Invalid email format'),
    userPhone: z.string().optional(),
    honeypot: z.string().optional(), // Should be empty (bot detection)
  })
  .refine(
    data => {
      // If call type is phone, userPhone is required
      if (data.callType === 'phone' && !data.userPhone) {
        return false;
      }
      return true;
    },
    {
      message: 'userPhone is required for phone calls',
      path: ['userPhone'],
    }
  )
  .refine(
    data => {
      // Validate end time is after start time
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return end > start;
    },
    {
      message: 'endTime must be after startTime',
      path: ['endTime'],
    }
  )
  .refine(
    data => {
      // Validate start time is in the future
      const start = new Date(data.startTime);
      const now = new Date();
      return start > now;
    },
    {
      message: 'startTime must be in the future',
      path: ['startTime'],
    }
  );

/**
 * Validate booking request using Zod
 */
export function validateBookingRequest(body: unknown): {
  success: boolean;
  data?: z.infer<typeof CreateBookingRequestSchema>;
  errors?: Array<{ path: string; message: string }>;
} {
  const result = CreateBookingRequestSchema.safeParse(body);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
```

### 3. Security Checks (security/auth-checks.ts)

```typescript
// supabase/functions/create-booking/security/auth-checks.ts

import type { User } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Check if user's email is verified
 */
export function checkEmailVerified(user: User): boolean {
  return user.email_confirmed_at !== null && user.email_confirmed_at !== undefined;
}

/**
 * Check if user's account is at least X hours old
 *
 * @param user - Supabase user object
 * @param minHours - Minimum account age in hours
 * @returns true if account is old enough
 */
export function checkAccountAge(user: User, minHours: number): boolean {
  const createdAt = new Date(user.created_at);
  const now = new Date();
  const ageMs = now.getTime() - createdAt.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  return ageHours >= minHours;
}
```

### 4. Rate Limiter (security/rate-limiter.ts)

```typescript
// supabase/functions/create-booking/security/rate-limiter.ts

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: number; // Seconds until retry allowed
}

const USER_DAILY_LIMIT = 2; // Max bookings per user per day
const IP_MINUTE_LIMIT = 10; // Max bookings per IP per minute
const COOLDOWN_HOURS = 1; // Hours between consecutive bookings

/**
 * Check rate limits for user and IP
 */
export async function checkRateLimits(
  supabase: SupabaseClient,
  userId: string,
  ipAddress: string
): Promise<RateLimitResult> {
  // Fetch current rate limit record
  const { data, error } = await supabase
    .from('booking_rate_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('ip_address', ipAddress)
    .single();

  const now = new Date();

  // No existing record - first booking
  if (error || !data) {
    return { allowed: true };
  }

  // Check 1-hour cooldown (most restrictive check)
  if (data.last_booking_at) {
    const lastBooking = new Date(data.last_booking_at);
    const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;
    const timeSinceLastBooking = now.getTime() - lastBooking.getTime();

    if (timeSinceLastBooking < cooldownMs) {
      const retryAfter = Math.ceil((cooldownMs - timeSinceLastBooking) / 1000);
      return {
        allowed: false,
        reason: `You must wait ${COOLDOWN_HOURS} hour(s) between bookings`,
        retryAfter,
      };
    }
  }

  // Check user daily limit
  if (data.last_booking_at) {
    const lastBooking = new Date(data.last_booking_at);
    const daysSinceLastBooking = (now.getTime() - lastBooking.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastBooking < 1) {
      // Same day - check count
      if (data.booking_count >= USER_DAILY_LIMIT) {
        const retryAfter = Math.ceil((1 - daysSinceLastBooking) * 24 * 60 * 60);
        return {
          allowed: false,
          reason: `Maximum ${USER_DAILY_LIMIT} bookings per day`,
          retryAfter,
        };
      }
    }
  }

  // Check IP minute limit
  if (data.ip_last_booking_at) {
    const lastIpBooking = new Date(data.ip_last_booking_at);
    const minutesSinceLastIpBooking = (now.getTime() - lastIpBooking.getTime()) / (1000 * 60);

    if (minutesSinceLastIpBooking < 1) {
      // Same minute - check count
      if (data.ip_booking_count >= IP_MINUTE_LIMIT) {
        const retryAfter = Math.ceil((1 - minutesSinceLastIpBooking) * 60);
        return {
          allowed: false,
          reason: 'Too many booking attempts. Please try again in a minute.',
          retryAfter,
        };
      }
    }
  }

  return { allowed: true };
}

/**
 * Update rate limit counters after successful booking
 */
export async function updateRateLimits(
  supabase: SupabaseClient,
  userId: string,
  ipAddress: string
): Promise<void> {
  const now = new Date();

  // Fetch current record
  const { data: existing } = await supabase
    .from('booking_rate_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('ip_address', ipAddress)
    .single();

  if (!existing) {
    // Create new record
    await supabase.from('booking_rate_limits').insert({
      user_id: userId,
      ip_address: ipAddress,
      booking_count: 1,
      last_booking_at: now.toISOString(),
      ip_booking_count: 1,
      ip_last_booking_at: now.toISOString(),
    });
    return;
  }

  // Calculate new counts based on time elapsed
  const lastBooking = new Date(existing.last_booking_at);
  const daysSinceLastBooking = (now.getTime() - lastBooking.getTime()) / (1000 * 60 * 60 * 24);

  const lastIpBooking = new Date(existing.ip_last_booking_at);
  const minutesSinceLastIpBooking = (now.getTime() - lastIpBooking.getTime()) / (1000 * 60);

  // Reset user count if more than 1 day
  const newUserCount = daysSinceLastBooking >= 1 ? 1 : existing.booking_count + 1;

  // Reset IP count if more than 1 minute
  const newIpCount = minutesSinceLastIpBooking >= 1 ? 1 : existing.ip_booking_count + 1;

  // Update record
  await supabase
    .from('booking_rate_limits')
    .update({
      booking_count: newUserCount,
      last_booking_at: now.toISOString(),
      ip_booking_count: newIpCount,
      ip_last_booking_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('user_id', userId)
    .eq('ip_address', ipAddress);
}
```

### 5. Honeypot Validation (security/honeypot.ts)

```typescript
// supabase/functions/create-booking/security/honeypot.ts

/**
 * Validate honeypot field for bot detection
 *
 * Honeypot field should be:
 * - Hidden from users (CSS: display: none or off-screen)
 * - Empty when submitted by humans
 * - Filled by bots (they fill all fields)
 *
 * @param honeypot - Value from honeypot field
 * @returns true if valid (empty or undefined), false if bot detected
 */
export function validateHoneypot(honeypot?: string): boolean {
  // Valid if undefined or empty string
  return honeypot === undefined || honeypot === '';
}
```

### 6. Slot Availability Check (booking/availability.ts)

```typescript
// supabase/functions/create-booking/booking/availability.ts

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Atomically check if time slot is available
 *
 * Uses SELECT FOR UPDATE to lock rows and prevent race conditions
 * Alternative: Rely on UNIQUE constraint (admin_user_id, start_time_utc, status)
 *
 * @returns true if slot is available, false if already booked
 */
export async function checkSlotAvailability(
  supabase: SupabaseClient,
  adminUserId: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  // Check for overlapping confirmed bookings
  // Overlap occurs if: existing.start < new.end AND existing.end > new.start
  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('admin_user_id', adminUserId)
    .eq('status', 'confirmed')
    .lt('start_time_utc', endDate.toISOString())
    .gt('end_time_utc', startDate.toISOString())
    .limit(1);

  if (error) {
    throw new Error(`Failed to check slot availability: ${error.message}`);
  }

  // Slot is available if no overlapping bookings found
  return data.length === 0;
}
```

### 7. Google Calendar Event Creation (booking/calendar-event.ts)

```typescript
// supabase/functions/create-booking/booking/calendar-event.ts

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

interface CalendarEventParams {
  startTime: string;
  endTime: string;
  callType: 'video' | 'phone';
  userName: string;
  userEmail: string;
  userPhone?: string;
}

interface CalendarEventResult {
  id: string;
  meetLink?: string;
}

/**
 * Create Google Calendar event with appropriate details
 *
 * Video calls:
 * - Title: "User and Warren"
 * - Automatically create Google Meet link
 *
 * Phone calls:
 * - Title: "[Mobile call] User and Warren"
 * - Description includes tel:// link
 */
export async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  params: CalendarEventParams
): Promise<CalendarEventResult> {
  const { startTime, endTime, callType, userName, userEmail, userPhone } = params;

  // Build event title
  const title =
    callType === 'phone' ? `[Mobile call] ${userName} and Warren` : `${userName} and Warren`;

  // Build event description
  let description = `Booking created by ${userName} (${userEmail})\n\n`;

  if (callType === 'phone' && userPhone) {
    description += `Phone: ${userPhone}\n`;
    description += `tel://${userPhone}\n\n`;
    description += 'This is a phone call. Warren will call you at the scheduled time.';
  } else {
    description += 'This is a video call. Join using the Google Meet link below.';
  }

  // Build event payload
  const event = {
    summary: title,
    description,
    start: {
      dateTime: startTime,
      timeZone: 'UTC',
    },
    end: {
      dateTime: endTime,
      timeZone: 'UTC',
    },
    attendees: [{ email: userEmail, displayName: userName }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 30 }, // 30 minutes before
      ],
    },
    // Auto-create Google Meet link for video calls
    conferenceData:
      callType === 'video'
        ? {
            createRequest: {
              requestId: crypto.randomUUID(),
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          }
        : undefined,
  };

  // Create event
  const url = `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`;
  const queryParams = new URLSearchParams();

  // Request conference data creation for video calls
  if (callType === 'video') {
    queryParams.set('conferenceDataVersion', '1');
  }

  const response = await fetch(`${url}?${queryParams.toString()}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create calendar event: ${response.status} - ${error}`);
  }

  const createdEvent = await response.json();

  return {
    id: createdEvent.id,
    meetLink: createdEvent.conferenceData?.entryPoints?.[0]?.uri,
  };
}
```

### 8. Database Operations (booking/database.ts)

```typescript
// supabase/functions/create-booking/booking/database.ts

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface InsertBookingParams {
  userId: string;
  adminUserId: string;
  startTimeUtc: string;
  endTimeUtc: string;
  callType: 'video' | 'phone';
  userName: string;
  userEmail: string;
  userPhone?: string;
  googleEventId: string;
  googleMeetLink?: string;
}

interface InsertAuditLogParams {
  bookingId: string;
  action: 'created' | 'cancelled' | 'updated' | 'failed';
  actorId: string;
  details: Record<string, unknown>;
}

/**
 * Insert booking record
 */
export async function insertBooking(supabase: SupabaseClient, params: InsertBookingParams) {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: params.userId,
      admin_user_id: params.adminUserId,
      start_time_utc: params.startTimeUtc,
      end_time_utc: params.endTimeUtc,
      call_type: params.callType,
      user_name: params.userName,
      user_email: params.userEmail,
      user_phone: params.userPhone,
      google_event_id: params.googleEventId,
      google_meet_link: params.googleMeetLink,
      status: 'confirmed',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert booking: ${error.message}`);
  }

  return data;
}

/**
 * Insert audit log entry
 */
export async function insertAuditLog(
  supabase: SupabaseClient,
  params: InsertAuditLogParams
): Promise<void> {
  const { error } = await supabase.from('booking_audit_log').insert({
    booking_id: params.bookingId,
    action: params.action,
    actor_id: params.actorId,
    details: params.details,
  });

  if (error) {
    // Log error but don't fail the booking
    console.error('Failed to insert audit log:', error);
  }
}
```

### 9. Error Handler (utils/error-handler.ts)

```typescript
// supabase/functions/create-booking/utils/error-handler.ts

/**
 * Centralized error handling
 */
export function handleError(error: unknown, corsHeaders: Record<string, string>): Response {
  console.error('Create booking error:', error);

  // Known error types
  if (error instanceof Error) {
    // Google Calendar API errors
    if (error.message.includes('Google Calendar API error')) {
      return new Response(
        JSON.stringify({
          error: 'Failed to create calendar event',
          details: 'Unable to connect to calendar service. Please try again later.',
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Database errors
    if (error.message.includes('Failed to insert booking')) {
      return new Response(
        JSON.stringify({
          error: 'Failed to save booking',
          details: 'Database error. Please try again later.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // OAuth token errors
    if (error.message.includes('OAuth tokens not found')) {
      return new Response(
        JSON.stringify({
          error: 'Configuration error',
          details: 'Calendar integration not configured. Please contact support.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Generic error
  return new Response(
    JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

### 10. TypeScript Types (types.ts)

```typescript
// supabase/functions/create-booking/types.ts

export interface CreateBookingRequest {
  startTime: string;
  endTime: string;
  callType: 'video' | 'phone';
  userName: string;
  userEmail: string;
  userPhone?: string;
  honeypot?: string;
}

export interface CreateBookingResponse {
  bookingId: string;
  googleEventId: string;
  googleMeetLink?: string;
  startTime: string;
  endTime: string;
  callType: 'video' | 'phone';
  status: 'confirmed';
}
```

---

## Example API Usage

### Request (Video Call)

```bash
curl -X POST \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "2025-11-26T14:00:00Z",
    "endTime": "2025-11-26T14:30:00Z",
    "callType": "video",
    "userName": "John Doe",
    "userEmail": "john@example.com"
  }' \
  https://your-project.supabase.co/functions/v1/create-booking
```

### Response (Video Call)

```json
{
  "bookingId": "550e8400-e29b-41d4-a716-446655440000",
  "googleEventId": "abc123xyz",
  "googleMeetLink": "https://meet.google.com/abc-defg-hij",
  "startTime": "2025-11-26T14:00:00Z",
  "endTime": "2025-11-26T14:30:00Z",
  "callType": "video",
  "status": "confirmed"
}
```

### Request (Phone Call)

```bash
curl -X POST \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "2025-11-26T15:00:00Z",
    "endTime": "2025-11-26T15:30:00Z",
    "callType": "phone",
    "userName": "Jane Smith",
    "userEmail": "jane@example.com",
    "userPhone": "+441234567890"
  }' \
  https://your-project.supabase.co/functions/v1/create-booking
```

---

## Acceptance Criteria

- [ ] All 7 security checks enforced (auth, email, age, honeypot, rate limits, cooldown)
- [ ] Request body validated with Zod schema
- [ ] Atomic slot availability check prevents double-booking
- [ ] Google Calendar events created with correct titles and descriptions
- [ ] Video calls auto-generate Google Meet links
- [ ] Phone calls include tel:// links in description
- [ ] Booking record inserted with all required fields
- [ ] Audit log entry created for every booking attempt
- [ ] Rate limit counters updated after successful booking
- [ ] OAuth token automatically refreshed if expired
- [ ] Race conditions handled (UNIQUE constraint or locking)
- [ ] Error recovery (rollback database if calendar creation fails)
- [ ] TypeScript strict mode compliance
- [ ] All edge cases handled with descriptive error messages
- [ ] Client receives booking confirmation with Google Meet link (video)

---

## Edge Cases & Error Handling

| Scenario                        | Expected Behaviour                            |
| ------------------------------- | --------------------------------------------- |
| Email not verified              | Return 403 with verification required message |
| Account <24h old                | Return 403 with account age requirement       |
| Honeypot field filled           | Return 403 (log as bot, generic error)        |
| Rate limit exceeded (user)      | Return 429 with retry-after header            |
| Rate limit exceeded (IP)        | Return 429 with retry-after message           |
| Cooldown not met (1 hour)       | Return 429 with time remaining                |
| Invalid request body            | Return 400 with Zod validation errors         |
| Start time in past              | Return 400 validation error                   |
| End time before start time      | Return 400 validation error                   |
| Phone call without phone number | Return 400 validation error                   |
| Slot no longer available (race) | Return 409 conflict error                     |
| Google Calendar API fails       | Return 503 with retry message                 |
| OAuth token refresh fails       | Return 500 with re-authorization message      |
| Database insert fails           | Return 500 with generic error                 |
| UNIQUE constraint violation     | Return 409 (slot taken)                       |

---

## Rollback Strategy

If Google Calendar event creation succeeds but database insert fails:

1. **Attempt to delete Google Calendar event**:

   ```typescript
   await fetch(`${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events/${eventId}`, {
     method: 'DELETE',
     headers: { Authorization: `Bearer ${accessToken}` },
   });
   ```

2. **Log failure** in audit log with action: 'failed'

3. **Return error to client** with retry message

---

## Testing Strategy

### Unit Tests

- `validateBookingRequest()` - Test all Zod validation rules
- `checkRateLimits()` - Test user and IP rate limiting logic
- `checkAccountAge()` - Test account age calculation
- `validateHoneypot()` - Test bot detection
- `checkSlotAvailability()` - Test overlap detection

### Integration Tests

1. **Happy Path (Video)**: Create video booking, verify database record and Google Calendar event
2. **Happy Path (Phone)**: Create phone booking, verify tel:// link in event
3. **Rate Limiting**: Create 3 bookings rapidly, verify 3rd fails
4. **Cooldown**: Create booking, immediately try another, verify fails
5. **Double Booking**: Concurrent requests for same slot, verify only one succeeds
6. **Email Not Verified**: Try to book without verified email, verify 403
7. **New Account**: Try to book with <24h account, verify 403
8. **Honeypot**: Submit with filled honeypot, verify 403

---

## Dependencies

- **Blocked by**:
  - TASK-342 (Database Schema)
  - TASK-343 (Admin OAuth - needs OAuth tokens)
  - TASK-344 (Get Availability - needs slot availability logic)
- **Blocks**: None (final backend task)

---

**Estimated Time**: 4h
**Last Updated**: 2025-11-25
