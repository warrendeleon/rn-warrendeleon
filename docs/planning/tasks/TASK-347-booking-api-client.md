# TASK-347: Booking API Client + Zod Schemas

**Status**: 📋 To Do
**Effort**: 3h
**Priority**: High
**Dependencies**: None
**Parent**: [US-063: Booking Flow UI](../user-stories/US-063-booking-flow-ui.md)

---

## Overview

Build the API client for the booking system with comprehensive Zod schemas for request/response validation. This client will handle all communication with the booking backend, including fetching available time slots, creating bookings, and managing booking state.

The API client follows the existing pattern established in the codebase (similar to authentication APIs) with full TypeScript support, error handling, and response validation.

---

## Acceptance Criteria

- ✅ BookingApiClient class implements all booking endpoints
- ✅ Zod schemas validate all requests and responses
- ✅ TypeScript types exported for use in Redux store
- ✅ Error handling with specific error types
- ✅ Axios interceptors configured
- ✅ RNTL tests achieve 100% coverage
- ✅ All validation passes (`yarn validate`)

---

## Implementation Details

### File Structure

```
src/features/Booking/
├── api/
│   ├── BookingApiClient.ts          # Main API client class
│   ├── schemas/
│   │   ├── index.ts                 # Export all schemas
│   │   ├── bookingRequest.schema.ts # Request schemas
│   │   └── bookingResponse.schema.ts# Response schemas
│   └── types.ts                     # Exported TypeScript types
├── __tests__/
│   └── BookingApiClient.test.ts     # RNTL tests
└── index.ts                         # Public exports
```

---

## API Endpoints

### 1. Get Available Dates

**Endpoint**: `GET /api/booking/available-dates`

**Query Params**:

- `duration` (number, required): Meeting duration in minutes (15, 30, 45, 60, 90)
- `month` (string, required): Month in YYYY-MM format (e.g., "2025-12")
- `timezone` (string, required): IANA timezone (e.g., "Europe/Madrid")

**Response**: Array of available dates

```json
{
  "availableDates": ["2025-12-15", "2025-12-16", "2025-12-18"]
}
```

---

### 2. Get Available Time Slots

**Endpoint**: `GET /api/booking/time-slots`

**Query Params**:

- `date` (string, required): Date in YYYY-MM-DD format
- `duration` (number, required): Meeting duration in minutes
- `timezone` (string, required): IANA timezone

**Response**: Array of time slots with UTC timestamps

```json
{
  "timeSlots": [
    {
      "startTime": "2025-12-15T09:00:00Z",
      "endTime": "2025-12-15T09:30:00Z",
      "available": true
    },
    {
      "startTime": "2025-12-15T09:30:00Z",
      "endTime": "2025-12-15T10:00:00Z",
      "available": true
    }
  ],
  "timezone": "Europe/Madrid"
}
```

---

### 3. Create Booking

**Endpoint**: `POST /api/booking/create`

**Request Body**:

```json
{
  "duration": 30,
  "date": "2025-12-15",
  "startTime": "2025-12-15T09:00:00Z",
  "endTime": "2025-12-15T09:30:00Z",
  "meetingType": "video",
  "title": "Discuss project requirements",
  "description": "Initial consultation about mobile app development",
  "timezone": "Europe/Madrid",
  "honeypot": ""
}
```

**Response**:

```json
{
  "bookingId": "bk_abc123xyz",
  "status": "confirmed",
  "confirmationUrl": "https://example.com/booking/confirm/bk_abc123xyz",
  "calendarEventId": "cal_xyz789"
}
```

---

## Zod Schemas

### Request Schemas

```typescript
// src/features/Booking/api/schemas/bookingRequest.schema.ts

import { z } from 'zod';

/**
 * Available meeting durations in minutes
 */
export const MEETING_DURATIONS = [15, 30, 45, 60, 90] as const;

/**
 * Meeting types
 */
export const MEETING_TYPES = ['phone', 'video'] as const;

/**
 * IANA timezone regex pattern
 * Examples: Europe/Madrid, America/New_York, Asia/Tokyo
 */
const TIMEZONE_REGEX = /^[A-Za-z]+\/[A-Za-z_]+$/;

/**
 * Date format: YYYY-MM-DD
 */
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Month format: YYYY-MM
 */
const MONTH_REGEX = /^\d{4}-\d{2}$/;

/**
 * Schema for fetching available dates
 */
export const getAvailableDatesRequestSchema = z.object({
  duration: z.number().refine(val => MEETING_DURATIONS.includes(val as any), {
    message: 'Duration must be 15, 30, 45, 60, or 90 minutes',
  }),
  month: z.string().regex(MONTH_REGEX, 'Month must be in YYYY-MM format'),
  timezone: z.string().regex(TIMEZONE_REGEX, 'Invalid timezone format'),
});

/**
 * Schema for fetching time slots
 */
export const getTimeSlotsRequestSchema = z.object({
  date: z.string().regex(DATE_REGEX, 'Date must be in YYYY-MM-DD format'),
  duration: z.number().refine(val => MEETING_DURATIONS.includes(val as any), {
    message: 'Duration must be 15, 30, 45, 60, or 90 minutes',
  }),
  timezone: z.string().regex(TIMEZONE_REGEX, 'Invalid timezone format'),
});

/**
 * Schema for creating a booking
 */
export const createBookingRequestSchema = z.object({
  duration: z.number().refine(val => MEETING_DURATIONS.includes(val as any), {
    message: 'Duration must be 15, 30, 45, 60, or 90 minutes',
  }),
  date: z.string().regex(DATE_REGEX, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().datetime({ message: 'Start time must be ISO 8601 format' }),
  endTime: z.string().datetime({ message: 'End time must be ISO 8601 format' }),
  meetingType: z.enum(MEETING_TYPES, {
    errorMap: () => ({ message: 'Meeting type must be phone or video' }),
  }),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional(),
  timezone: z.string().regex(TIMEZONE_REGEX, 'Invalid timezone format'),
  honeypot: z.string().max(0, 'Invalid form submission'), // Anti-spam field, must be empty
});

/**
 * TypeScript types inferred from schemas
 */
export type GetAvailableDatesRequest = z.infer<typeof getAvailableDatesRequestSchema>;
export type GetTimeSlotsRequest = z.infer<typeof getTimeSlotsRequestSchema>;
export type CreateBookingRequest = z.infer<typeof createBookingRequestSchema>;
export type MeetingDuration = (typeof MEETING_DURATIONS)[number];
export type MeetingType = (typeof MEETING_TYPES)[number];
```

---

### Response Schemas

```typescript
// src/features/Booking/api/schemas/bookingResponse.schema.ts

import { z } from 'zod';

/**
 * Schema for available dates response
 */
export const getAvailableDatesResponseSchema = z.object({
  availableDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')),
});

/**
 * Schema for a single time slot
 */
export const timeSlotSchema = z.object({
  startTime: z.string().datetime({ message: 'Start time must be ISO 8601 format' }),
  endTime: z.string().datetime({ message: 'End time must be ISO 8601 format' }),
  available: z.boolean(),
});

/**
 * Schema for time slots response
 */
export const getTimeSlotsResponseSchema = z.object({
  timeSlots: z.array(timeSlotSchema),
  timezone: z.string(),
});

/**
 * Booking status enum
 */
export const BOOKING_STATUSES = ['confirmed', 'pending', 'cancelled'] as const;

/**
 * Schema for create booking response
 */
export const createBookingResponseSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  status: z.enum(BOOKING_STATUSES),
  confirmationUrl: z.string().url('Invalid confirmation URL'),
  calendarEventId: z.string().min(1, 'Calendar event ID is required'),
});

/**
 * TypeScript types inferred from schemas
 */
export type GetAvailableDatesResponse = z.infer<typeof getAvailableDatesResponseSchema>;
export type TimeSlot = z.infer<typeof timeSlotSchema>;
export type GetTimeSlotsResponse = z.infer<typeof getTimeSlotsResponseSchema>;
export type CreateBookingResponse = z.infer<typeof createBookingResponseSchema>;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
```

---

### Schema Index

```typescript
// src/features/Booking/api/schemas/index.ts

export * from './bookingRequest.schema';
export * from './bookingResponse.schema';
```

---

## API Client Implementation

```typescript
// src/features/Booking/api/BookingApiClient.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import Config from 'react-native-config';
import {
  getAvailableDatesRequestSchema,
  getTimeSlotsRequestSchema,
  createBookingRequestSchema,
  type GetAvailableDatesRequest,
  type GetTimeSlotsRequest,
  type CreateBookingRequest,
} from './schemas/bookingRequest.schema';
import {
  getAvailableDatesResponseSchema,
  getTimeSlotsResponseSchema,
  createBookingResponseSchema,
  type GetAvailableDatesResponse,
  type GetTimeSlotsResponse,
  type CreateBookingResponse,
} from './schemas/bookingResponse.schema';

/**
 * Custom error class for booking API errors
 */
export class BookingApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'BookingApiError';
  }
}

/**
 * Booking API client for managing booking operations
 *
 * Handles:
 * - Fetching available dates
 * - Fetching available time slots
 * - Creating bookings
 *
 * All requests/responses are validated with Zod schemas
 */
export class BookingApiClient {
  private client: AxiosInstance;

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: baseURL || Config.API_BASE_URL || 'https://api.example.com',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        const message =
          (error.response?.data as any)?.message || error.message || 'An unexpected error occurred';
        const statusCode = error.response?.status;

        throw new BookingApiError(message, statusCode, error);
      }
    );
  }

  /**
   * Fetch available dates for a given month and duration
   *
   * @param params - Request parameters
   * @returns Array of available dates in YYYY-MM-DD format
   * @throws {BookingApiError} If request fails or validation fails
   *
   * @example
   * const dates = await client.getAvailableDates({
   *   duration: 30,
   *   month: '2025-12',
   *   timezone: 'Europe/Madrid',
   * });
   * // ['2025-12-15', '2025-12-16', '2025-12-18']
   */
  async getAvailableDates(params: GetAvailableDatesRequest): Promise<GetAvailableDatesResponse> {
    try {
      // Validate request
      const validatedParams = getAvailableDatesRequestSchema.parse(params);

      // Make API request
      const response = await this.client.get('/api/booking/available-dates', {
        params: validatedParams,
      });

      // Validate response
      const validatedResponse = getAvailableDatesResponseSchema.parse(response.data);

      return validatedResponse;
    } catch (error) {
      if (error instanceof BookingApiError) {
        throw error;
      }
      throw new BookingApiError('Failed to fetch available dates', undefined, error);
    }
  }

  /**
   * Fetch available time slots for a specific date and duration
   *
   * @param params - Request parameters
   * @returns Time slots with availability status
   * @throws {BookingApiError} If request fails or validation fails
   *
   * @example
   * const slots = await client.getTimeSlots({
   *   date: '2025-12-15',
   *   duration: 30,
   *   timezone: 'Europe/Madrid',
   * });
   * // { timeSlots: [...], timezone: 'Europe/Madrid' }
   */
  async getTimeSlots(params: GetTimeSlotsRequest): Promise<GetTimeSlotsResponse> {
    try {
      // Validate request
      const validatedParams = getTimeSlotsRequestSchema.parse(params);

      // Make API request
      const response = await this.client.get('/api/booking/time-slots', {
        params: validatedParams,
      });

      // Validate response
      const validatedResponse = getTimeSlotsResponseSchema.parse(response.data);

      return validatedResponse;
    } catch (error) {
      if (error instanceof BookingApiError) {
        throw error;
      }
      throw new BookingApiError('Failed to fetch time slots', undefined, error);
    }
  }

  /**
   * Create a new booking
   *
   * @param data - Booking details
   * @returns Booking confirmation with ID and status
   * @throws {BookingApiError} If request fails or validation fails
   *
   * @example
   * const booking = await client.createBooking({
   *   duration: 30,
   *   date: '2025-12-15',
   *   startTime: '2025-12-15T09:00:00Z',
   *   endTime: '2025-12-15T09:30:00Z',
   *   meetingType: 'video',
   *   title: 'Project consultation',
   *   description: 'Discuss requirements',
   *   timezone: 'Europe/Madrid',
   *   honeypot: '',
   * });
   * // { bookingId: 'bk_abc123', status: 'confirmed', ... }
   */
  async createBooking(data: CreateBookingRequest): Promise<CreateBookingResponse> {
    try {
      // Validate request
      const validatedData = createBookingRequestSchema.parse(data);

      // Make API request
      const response = await this.client.post('/api/booking/create', validatedData);

      // Validate response
      const validatedResponse = createBookingResponseSchema.parse(response.data);

      return validatedResponse;
    } catch (error) {
      if (error instanceof BookingApiError) {
        throw error;
      }
      throw new BookingApiError('Failed to create booking', undefined, error);
    }
  }
}

/**
 * Singleton instance of BookingApiClient
 */
export const bookingApiClient = new BookingApiClient();
```

---

## Type Exports

```typescript
// src/features/Booking/api/types.ts

export type {
  GetAvailableDatesRequest,
  GetTimeSlotsRequest,
  CreateBookingRequest,
  MeetingDuration,
  MeetingType,
} from './schemas/bookingRequest.schema';

export type {
  GetAvailableDatesResponse,
  TimeSlot,
  GetTimeSlotsResponse,
  CreateBookingResponse,
  BookingStatus,
} from './schemas/bookingResponse.schema';

export { MEETING_DURATIONS, MEETING_TYPES } from './schemas/bookingRequest.schema';
export { BOOKING_STATUSES } from './schemas/bookingResponse.schema';
```

---

## Public Exports

```typescript
// src/features/Booking/index.ts

export { BookingApiClient, bookingApiClient, BookingApiError } from './api/BookingApiClient';
export * from './api/types';
export * from './api/schemas';
```

---

## RNTL Tests

```typescript
// src/features/Booking/__tests__/BookingApiClient.test.ts

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { BookingApiClient, BookingApiError } from '../api/BookingApiClient';
import type {
  GetAvailableDatesRequest,
  GetTimeSlotsRequest,
  CreateBookingRequest,
} from '../api/types';

describe('BookingApiClient', () => {
  let client: BookingApiClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = new BookingApiClient('https://api.test.com');
    mock = new MockAdapter((client as any).client);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('getAvailableDates', () => {
    const validRequest: GetAvailableDatesRequest = {
      duration: 30,
      month: '2025-12',
      timezone: 'Europe/Madrid',
    };

    it('should fetch available dates successfully', async () => {
      const mockResponse = {
        availableDates: ['2025-12-15', '2025-12-16', '2025-12-18'],
      };

      mock.onGet('/api/booking/available-dates').reply(200, mockResponse);

      const result = await client.getAvailableDates(validRequest);

      expect(result).toEqual(mockResponse);
      expect(result.availableDates).toHaveLength(3);
    });

    it('should validate request parameters', async () => {
      const invalidRequest = {
        duration: 25, // Invalid duration
        month: '2025-12',
        timezone: 'Europe/Madrid',
      };

      await expect(client.getAvailableDates(invalidRequest as any)).rejects.toThrow();
    });

    it('should handle API errors', async () => {
      mock.onGet('/api/booking/available-dates').reply(500, {
        message: 'Internal server error',
      });

      await expect(client.getAvailableDates(validRequest)).rejects.toThrow(BookingApiError);
    });

    it('should validate month format', async () => {
      const invalidRequest = {
        ...validRequest,
        month: '12-2025', // Wrong format
      };

      await expect(client.getAvailableDates(invalidRequest as any)).rejects.toThrow();
    });

    it('should validate timezone format', async () => {
      const invalidRequest = {
        ...validRequest,
        timezone: 'InvalidTimezone',
      };

      await expect(client.getAvailableDates(invalidRequest as any)).rejects.toThrow();
    });
  });

  describe('getTimeSlots', () => {
    const validRequest: GetTimeSlotsRequest = {
      date: '2025-12-15',
      duration: 30,
      timezone: 'Europe/Madrid',
    };

    it('should fetch time slots successfully', async () => {
      const mockResponse = {
        timeSlots: [
          {
            startTime: '2025-12-15T09:00:00Z',
            endTime: '2025-12-15T09:30:00Z',
            available: true,
          },
          {
            startTime: '2025-12-15T09:30:00Z',
            endTime: '2025-12-15T10:00:00Z',
            available: false,
          },
        ],
        timezone: 'Europe/Madrid',
      };

      mock.onGet('/api/booking/time-slots').reply(200, mockResponse);

      const result = await client.getTimeSlots(validRequest);

      expect(result).toEqual(mockResponse);
      expect(result.timeSlots).toHaveLength(2);
      expect(result.timezone).toBe('Europe/Madrid');
    });

    it('should validate date format', async () => {
      const invalidRequest = {
        ...validRequest,
        date: '15-12-2025', // Wrong format
      };

      await expect(client.getTimeSlots(invalidRequest as any)).rejects.toThrow();
    });

    it('should handle empty time slots', async () => {
      const mockResponse = {
        timeSlots: [],
        timezone: 'Europe/Madrid',
      };

      mock.onGet('/api/booking/time-slots').reply(200, mockResponse);

      const result = await client.getTimeSlots(validRequest);

      expect(result.timeSlots).toHaveLength(0);
    });

    it('should validate response schema', async () => {
      const invalidResponse = {
        timeSlots: [
          {
            startTime: 'invalid-date',
            endTime: '2025-12-15T09:30:00Z',
            available: true,
          },
        ],
        timezone: 'Europe/Madrid',
      };

      mock.onGet('/api/booking/time-slots').reply(200, invalidResponse);

      await expect(client.getTimeSlots(validRequest)).rejects.toThrow(BookingApiError);
    });
  });

  describe('createBooking', () => {
    const validRequest: CreateBookingRequest = {
      duration: 30,
      date: '2025-12-15',
      startTime: '2025-12-15T09:00:00Z',
      endTime: '2025-12-15T09:30:00Z',
      meetingType: 'video',
      title: 'Project consultation',
      description: 'Discuss mobile app requirements',
      timezone: 'Europe/Madrid',
      honeypot: '',
    };

    it('should create booking successfully', async () => {
      const mockResponse = {
        bookingId: 'bk_abc123xyz',
        status: 'confirmed',
        confirmationUrl: 'https://example.com/booking/confirm/bk_abc123xyz',
        calendarEventId: 'cal_xyz789',
      };

      mock.onPost('/api/booking/create').reply(200, mockResponse);

      const result = await client.createBooking(validRequest);

      expect(result).toEqual(mockResponse);
      expect(result.bookingId).toBe('bk_abc123xyz');
      expect(result.status).toBe('confirmed');
    });

    it('should validate title length', async () => {
      const invalidRequest = {
        ...validRequest,
        title: 'ab', // Too short
      };

      await expect(client.createBooking(invalidRequest as any)).rejects.toThrow();
    });

    it('should validate meeting type', async () => {
      const invalidRequest = {
        ...validRequest,
        meetingType: 'in-person', // Invalid type
      };

      await expect(client.createBooking(invalidRequest as any)).rejects.toThrow();
    });

    it('should reject non-empty honeypot', async () => {
      const spamRequest = {
        ...validRequest,
        honeypot: 'spam content',
      };

      await expect(client.createBooking(spamRequest as any)).rejects.toThrow();
    });

    it('should handle description as optional', async () => {
      const requestWithoutDescription = {
        ...validRequest,
        description: undefined,
      };

      const mockResponse = {
        bookingId: 'bk_abc123xyz',
        status: 'confirmed',
        confirmationUrl: 'https://example.com/booking/confirm/bk_abc123xyz',
        calendarEventId: 'cal_xyz789',
      };

      mock.onPost('/api/booking/create').reply(200, mockResponse);

      const result = await client.createBooking(requestWithoutDescription);

      expect(result.bookingId).toBe('bk_abc123xyz');
    });

    it('should handle API errors with status codes', async () => {
      mock.onPost('/api/booking/create').reply(409, {
        message: 'Time slot no longer available',
      });

      await expect(client.createBooking(validRequest)).rejects.toThrow(BookingApiError);
    });

    it('should validate ISO 8601 datetime format', async () => {
      const invalidRequest = {
        ...validRequest,
        startTime: '2025-12-15 09:00:00', // Missing Z
      };

      await expect(client.createBooking(invalidRequest as any)).rejects.toThrow();
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      mock.onGet('/api/booking/available-dates').networkError();

      const request: GetAvailableDatesRequest = {
        duration: 30,
        month: '2025-12',
        timezone: 'Europe/Madrid',
      };

      await expect(client.getAvailableDates(request)).rejects.toThrow(BookingApiError);
    });

    it('should handle timeout errors', async () => {
      mock.onGet('/api/booking/available-dates').timeout();

      const request: GetAvailableDatesRequest = {
        duration: 30,
        month: '2025-12',
        timezone: 'Europe/Madrid',
      };

      await expect(client.getAvailableDates(request)).rejects.toThrow(BookingApiError);
    });
  });
});
```

---

## i18n Keys

Add to `src/i18n/locales/en.json`:

```json
{
  "booking": {
    "errors": {
      "fetchDatesFailed": "Failed to fetch available dates. Please try again.",
      "fetchSlotsFailed": "Failed to fetch time slots. Please try again.",
      "createBookingFailed": "Failed to create booking. Please try again.",
      "invalidDuration": "Please select a valid meeting duration",
      "invalidDate": "Please select a valid date",
      "invalidTimeSlot": "Please select a valid time slot",
      "networkError": "Network error. Check your connection and try again.",
      "serverError": "Server error. Please try again later.",
      "slotUnavailable": "This time slot is no longer available. Please select another."
    }
  }
}
```

---

## Testing Checklist

- [ ] All request schemas validate correctly
- [ ] All response schemas validate correctly
- [ ] API client handles successful responses
- [ ] API client handles error responses
- [ ] Error handling includes status codes
- [ ] Network errors are caught and wrapped
- [ ] Timeout errors are caught and wrapped
- [ ] RNTL tests achieve 100% coverage
- [ ] TypeScript types are exported correctly
- [ ] `yarn validate` passes (typecheck + lint + test)

---

## Notes

- Uses Axios with interceptors for consistent error handling
- All dates/times use ISO 8601 format for consistency
- Timezone validation uses IANA timezone database format
- Honeypot field prevents automated spam submissions
- Response validation catches malformed API responses early
- Custom error class provides structured error information
- Singleton instance exported for convenience
