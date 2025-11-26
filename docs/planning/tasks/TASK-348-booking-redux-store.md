# TASK-348: Booking Redux Store (Reducer, Actions, Selectors)

**Status**: 📋 To Do
**Effort**: 3h
**Priority**: High
**Dependencies**: TASK-347 (Booking API Client)
**Parent**: [US-063: Booking Flow UI](../user-stories/US-063-booking-flow-ui.md)

---

## Overview

Build the Redux store slice for managing booking state, including form data, API responses, loading states, and error handling. This slice follows the existing Redux Toolkit patterns in the codebase with async thunks for API calls and memoised selectors for performance.

The booking store maintains the entire booking flow state (duration, date, time slot, meeting details) and handles all API interactions through the BookingApiClient.

---

## Acceptance Criteria

- ✅ BookingState interface defined with all required fields
- ✅ Async thunks for all API operations (dates, slots, create booking)
- ✅ Reducer handles all actions with proper state updates
- ✅ Memoised selectors for computed values
- ✅ clearBookingForm action resets state
- ✅ Loading/error states for each async operation
- ✅ RNTL tests achieve 100% coverage
- ✅ All validation passes (`yarn validate`)

---

## Implementation Details

### File Structure

```
src/store/
├── slices/
│   └── bookingSlice.ts              # Booking reducer + actions + thunks
├── selectors/
│   └── bookingSelectors.ts          # Memoised selectors
└── __tests__/
    ├── bookingSlice.test.ts         # Reducer tests
    └── bookingSelectors.test.ts     # Selector tests
```

---

## State Interface

```typescript
// src/store/slices/bookingSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type {
  MeetingDuration,
  MeetingType,
  TimeSlot,
  CreateBookingResponse,
} from '@app/features/Booking';
import { bookingApiClient, BookingApiError } from '@app/features/Booking';

/**
 * Booking form state
 */
export interface BookingFormState {
  duration: MeetingDuration | null;
  date: string | null; // YYYY-MM-DD format
  selectedSlot: TimeSlot | null;
  meetingType: MeetingType | null;
  title: string;
  description: string;
  timezone: string; // IANA timezone from device
}

/**
 * Available dates state
 */
export interface AvailableDatesState {
  dates: string[]; // Array of YYYY-MM-DD strings
  loading: boolean;
  error: string | null;
  month: string | null; // Currently loaded month (YYYY-MM)
}

/**
 * Time slots state
 */
export interface TimeSlotsState {
  slots: TimeSlot[];
  loading: boolean;
  error: string | null;
  loadedDate: string | null; // Date these slots are for
}

/**
 * Booking creation state
 */
export interface BookingCreationState {
  loading: boolean;
  error: string | null;
  result: CreateBookingResponse | null;
}

/**
 * Complete booking state
 */
export interface BookingState {
  form: BookingFormState;
  availableDates: AvailableDatesState;
  timeSlots: TimeSlotsState;
  creation: BookingCreationState;
}

/**
 * Initial state
 */
const initialState: BookingState = {
  form: {
    duration: null,
    date: null,
    selectedSlot: null,
    meetingType: null,
    title: '',
    description: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Device timezone
  },
  availableDates: {
    dates: [],
    loading: false,
    error: null,
    month: null,
  },
  timeSlots: {
    slots: [],
    loading: false,
    error: null,
    loadedDate: null,
  },
  creation: {
    loading: false,
    error: null,
    result: null,
  },
};
```

---

## Async Thunks

```typescript
/**
 * Fetch available dates for a given month and duration
 */
export const fetchAvailableDates = createAsyncThunk(
  'booking/fetchAvailableDates',
  async (params: { duration: MeetingDuration; month: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { booking: BookingState };
      const timezone = state.booking.form.timezone;

      const response = await bookingApiClient.getAvailableDates({
        duration: params.duration,
        month: params.month,
        timezone,
      });

      return {
        dates: response.availableDates,
        month: params.month,
      };
    } catch (error) {
      if (error instanceof BookingApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch available dates');
    }
  }
);

/**
 * Fetch time slots for a specific date and duration
 */
export const fetchTimeSlots = createAsyncThunk(
  'booking/fetchTimeSlots',
  async (params: { date: string; duration: MeetingDuration }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { booking: BookingState };
      const timezone = state.booking.form.timezone;

      const response = await bookingApiClient.getTimeSlots({
        date: params.date,
        duration: params.duration,
        timezone,
      });

      return {
        slots: response.timeSlots,
        date: params.date,
      };
    } catch (error) {
      if (error instanceof BookingApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch time slots');
    }
  }
);

/**
 * Create a new booking
 */
export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { booking: BookingState };
      const { form } = state.booking;

      // Validate required fields
      if (
        !form.duration ||
        !form.date ||
        !form.selectedSlot ||
        !form.meetingType ||
        !form.title.trim()
      ) {
        return rejectWithValue('Please complete all required fields');
      }

      const response = await bookingApiClient.createBooking({
        duration: form.duration,
        date: form.date,
        startTime: form.selectedSlot.startTime,
        endTime: form.selectedSlot.endTime,
        meetingType: form.meetingType,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        timezone: form.timezone,
        honeypot: '', // Anti-spam field, always empty for legitimate submissions
      });

      return response;
    } catch (error) {
      if (error instanceof BookingApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to create booking');
    }
  }
);
```

---

## Reducer

```typescript
/**
 * Booking slice
 */
const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    /**
     * Set selected duration
     */
    setDuration: (state, action: PayloadAction<MeetingDuration>) => {
      state.form.duration = action.payload;
      // Clear dependent fields when duration changes
      state.form.date = null;
      state.form.selectedSlot = null;
      state.availableDates.dates = [];
      state.timeSlots.slots = [];
    },

    /**
     * Set selected date
     */
    setDate: (state, action: PayloadAction<string>) => {
      state.form.date = action.payload;
      // Clear time slot when date changes
      state.form.selectedSlot = null;
      state.timeSlots.slots = [];
    },

    /**
     * Set selected time slot
     */
    setTimeSlot: (state, action: PayloadAction<TimeSlot>) => {
      state.form.selectedSlot = action.payload;
    },

    /**
     * Set meeting type
     */
    setMeetingType: (state, action: PayloadAction<MeetingType>) => {
      state.form.meetingType = action.payload;
    },

    /**
     * Set meeting title
     */
    setTitle: (state, action: PayloadAction<string>) => {
      state.form.title = action.payload;
    },

    /**
     * Set meeting description
     */
    setDescription: (state, action: PayloadAction<string>) => {
      state.form.description = action.payload;
    },

    /**
     * Set timezone (used when timezone changes or for testing)
     */
    setTimezone: (state, action: PayloadAction<string>) => {
      state.form.timezone = action.payload;
    },

    /**
     * Clear entire booking form and reset to initial state
     */
    clearBookingForm: state => {
      // Preserve timezone, reset everything else
      const currentTimezone = state.form.timezone;
      state.form = { ...initialState.form, timezone: currentTimezone };
      state.availableDates = initialState.availableDates;
      state.timeSlots = initialState.timeSlots;
      state.creation = initialState.creation;
    },

    /**
     * Clear booking creation result (after viewing confirmation)
     */
    clearBookingResult: state => {
      state.creation.result = null;
      state.creation.error = null;
    },
  },
  extraReducers: builder => {
    // Fetch available dates
    builder
      .addCase(fetchAvailableDates.pending, state => {
        state.availableDates.loading = true;
        state.availableDates.error = null;
      })
      .addCase(fetchAvailableDates.fulfilled, (state, action) => {
        state.availableDates.loading = false;
        state.availableDates.dates = action.payload.dates;
        state.availableDates.month = action.payload.month;
      })
      .addCase(fetchAvailableDates.rejected, (state, action) => {
        state.availableDates.loading = false;
        state.availableDates.error = (action.payload as string) || 'Failed to fetch dates';
      });

    // Fetch time slots
    builder
      .addCase(fetchTimeSlots.pending, state => {
        state.timeSlots.loading = true;
        state.timeSlots.error = null;
      })
      .addCase(fetchTimeSlots.fulfilled, (state, action) => {
        state.timeSlots.loading = false;
        state.timeSlots.slots = action.payload.slots;
        state.timeSlots.loadedDate = action.payload.date;
      })
      .addCase(fetchTimeSlots.rejected, (state, action) => {
        state.timeSlots.loading = false;
        state.timeSlots.error = (action.payload as string) || 'Failed to fetch time slots';
      });

    // Create booking
    builder
      .addCase(createBooking.pending, state => {
        state.creation.loading = true;
        state.creation.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.creation.loading = false;
        state.creation.result = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.creation.loading = false;
        state.creation.error = (action.payload as string) || 'Failed to create booking';
      });
  },
});

export const {
  setDuration,
  setDate,
  setTimeSlot,
  setMeetingType,
  setTitle,
  setDescription,
  setTimezone,
  clearBookingForm,
  clearBookingResult,
} = bookingSlice.actions;

export default bookingSlice.reducer;
```

---

## Memoised Selectors

```typescript
// src/store/selectors/bookingSelectors.ts

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@app/store';
import type { TimeSlot } from '@app/features/Booking';

/**
 * Base selector for booking state
 */
export const selectBookingState = (state: RootState) => state.booking;

/**
 * Select booking form
 */
export const selectBookingForm = createSelector([selectBookingState], booking => booking.form);

/**
 * Select duration
 */
export const selectDuration = createSelector([selectBookingForm], form => form.duration);

/**
 * Select date
 */
export const selectDate = createSelector([selectBookingForm], form => form.date);

/**
 * Select time slot
 */
export const selectTimeSlot = createSelector([selectBookingForm], form => form.selectedSlot);

/**
 * Select meeting type
 */
export const selectMeetingType = createSelector([selectBookingForm], form => form.meetingType);

/**
 * Select title
 */
export const selectTitle = createSelector([selectBookingForm], form => form.title);

/**
 * Select description
 */
export const selectDescription = createSelector([selectBookingForm], form => form.description);

/**
 * Select timezone
 */
export const selectTimezone = createSelector([selectBookingForm], form => form.timezone);

/**
 * Select available dates state
 */
export const selectAvailableDates = createSelector(
  [selectBookingState],
  booking => booking.availableDates
);

/**
 * Select available dates array
 */
export const selectAvailableDatesArray = createSelector(
  [selectAvailableDates],
  availableDates => availableDates.dates
);

/**
 * Select available dates loading state
 */
export const selectAvailableDatesLoading = createSelector(
  [selectAvailableDates],
  availableDates => availableDates.loading
);

/**
 * Select available dates error
 */
export const selectAvailableDatesError = createSelector(
  [selectAvailableDates],
  availableDates => availableDates.error
);

/**
 * Select time slots state
 */
export const selectTimeSlots = createSelector([selectBookingState], booking => booking.timeSlots);

/**
 * Select time slots array
 */
export const selectTimeSlotsArray = createSelector([selectTimeSlots], timeSlots => timeSlots.slots);

/**
 * Select available time slots only
 */
export const selectAvailableTimeSlots = createSelector([selectTimeSlotsArray], slots =>
  slots.filter(slot => slot.available)
);

/**
 * Select time slots loading state
 */
export const selectTimeSlotsLoading = createSelector(
  [selectTimeSlots],
  timeSlots => timeSlots.loading
);

/**
 * Select time slots error
 */
export const selectTimeSlotsError = createSelector([selectTimeSlots], timeSlots => timeSlots.error);

/**
 * Select booking creation state
 */
export const selectBookingCreation = createSelector(
  [selectBookingState],
  booking => booking.creation
);

/**
 * Select booking creation loading state
 */
export const selectBookingCreationLoading = createSelector(
  [selectBookingCreation],
  creation => creation.loading
);

/**
 * Select booking creation error
 */
export const selectBookingCreationError = createSelector(
  [selectBookingCreation],
  creation => creation.error
);

/**
 * Select booking creation result
 */
export const selectBookingResult = createSelector(
  [selectBookingCreation],
  creation => creation.result
);

/**
 * Check if form is complete and ready to submit
 */
export const selectIsFormComplete = createSelector([selectBookingForm], form => {
  return Boolean(
    form.duration &&
      form.date &&
      form.selectedSlot &&
      form.meetingType &&
      form.title.trim().length >= 3
  );
});

/**
 * Select booking summary for confirmation screen
 */
export const selectBookingSummary = createSelector([selectBookingForm], form => {
  if (!form.duration || !form.date || !form.selectedSlot || !form.meetingType) {
    return null;
  }

  return {
    duration: form.duration,
    date: form.date,
    startTime: form.selectedSlot.startTime,
    endTime: form.selectedSlot.endTime,
    meetingType: form.meetingType,
    title: form.title,
    description: form.description,
    timezone: form.timezone,
  };
});

/**
 * Check if a specific date is available
 */
export const selectIsDateAvailable = createSelector(
  [selectAvailableDatesArray, (_state: RootState, date: string) => date],
  (dates, date) => dates.includes(date)
);

/**
 * Count available time slots
 */
export const selectAvailableTimeSlotsCount = createSelector(
  [selectAvailableTimeSlots],
  slots => slots.length
);
```

---

## Store Configuration

```typescript
// src/store/index.ts (update existing file)

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bookingReducer from './slices/bookingSlice';

// Booking persist config - do NOT persist booking state
// (bookings are session-based, should reset on app restart)
const rootReducer = {
  // ... other reducers
  booking: bookingReducer, // Not persisted
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## RNTL Tests - Reducer

```typescript
// src/store/__tests__/bookingSlice.test.ts

import bookingReducer, {
  setDuration,
  setDate,
  setTimeSlot,
  setMeetingType,
  setTitle,
  setDescription,
  setTimezone,
  clearBookingForm,
  clearBookingResult,
  fetchAvailableDates,
  fetchTimeSlots,
  createBooking,
  type BookingState,
} from '../slices/bookingSlice';
import type { TimeSlot } from '@app/features/Booking';

describe('bookingSlice', () => {
  const initialState: BookingState = {
    form: {
      duration: null,
      date: null,
      selectedSlot: null,
      meetingType: null,
      title: '',
      description: '',
      timezone: 'Europe/Madrid',
    },
    availableDates: {
      dates: [],
      loading: false,
      error: null,
      month: null,
    },
    timeSlots: {
      slots: [],
      loading: false,
      error: null,
      loadedDate: null,
    },
    creation: {
      loading: false,
      error: null,
      result: null,
    },
  };

  describe('synchronous actions', () => {
    it('should set duration', () => {
      const state = bookingReducer(initialState, setDuration(30));
      expect(state.form.duration).toBe(30);
    });

    it('should clear dependent fields when duration changes', () => {
      const stateWithData: BookingState = {
        ...initialState,
        form: {
          ...initialState.form,
          duration: 30,
          date: '2025-12-15',
          selectedSlot: {
            startTime: '2025-12-15T09:00:00Z',
            endTime: '2025-12-15T09:30:00Z',
            available: true,
          },
        },
        availableDates: {
          dates: ['2025-12-15'],
          loading: false,
          error: null,
          month: '2025-12',
        },
        timeSlots: {
          slots: [
            {
              startTime: '2025-12-15T09:00:00Z',
              endTime: '2025-12-15T09:30:00Z',
              available: true,
            },
          ],
          loading: false,
          error: null,
          loadedDate: '2025-12-15',
        },
      };

      const state = bookingReducer(stateWithData, setDuration(60));

      expect(state.form.duration).toBe(60);
      expect(state.form.date).toBeNull();
      expect(state.form.selectedSlot).toBeNull();
      expect(state.availableDates.dates).toEqual([]);
      expect(state.timeSlots.slots).toEqual([]);
    });

    it('should set date', () => {
      const state = bookingReducer(initialState, setDate('2025-12-15'));
      expect(state.form.date).toBe('2025-12-15');
    });

    it('should clear time slot when date changes', () => {
      const stateWithSlot: BookingState = {
        ...initialState,
        form: {
          ...initialState.form,
          date: '2025-12-15',
          selectedSlot: {
            startTime: '2025-12-15T09:00:00Z',
            endTime: '2025-12-15T09:30:00Z',
            available: true,
          },
        },
      };

      const state = bookingReducer(stateWithSlot, setDate('2025-12-16'));

      expect(state.form.date).toBe('2025-12-16');
      expect(state.form.selectedSlot).toBeNull();
    });

    it('should set time slot', () => {
      const slot: TimeSlot = {
        startTime: '2025-12-15T09:00:00Z',
        endTime: '2025-12-15T09:30:00Z',
        available: true,
      };

      const state = bookingReducer(initialState, setTimeSlot(slot));
      expect(state.form.selectedSlot).toEqual(slot);
    });

    it('should set meeting type', () => {
      const state = bookingReducer(initialState, setMeetingType('video'));
      expect(state.form.meetingType).toBe('video');
    });

    it('should set title', () => {
      const state = bookingReducer(initialState, setTitle('Project consultation'));
      expect(state.form.title).toBe('Project consultation');
    });

    it('should set description', () => {
      const state = bookingReducer(initialState, setDescription('Discuss requirements'));
      expect(state.form.description).toBe('Discuss requirements');
    });

    it('should set timezone', () => {
      const state = bookingReducer(initialState, setTimezone('America/New_York'));
      expect(state.form.timezone).toBe('America/New_York');
    });

    it('should clear booking form', () => {
      const stateWithData: BookingState = {
        form: {
          duration: 30,
          date: '2025-12-15',
          selectedSlot: {
            startTime: '2025-12-15T09:00:00Z',
            endTime: '2025-12-15T09:30:00Z',
            available: true,
          },
          meetingType: 'video',
          title: 'Test meeting',
          description: 'Test description',
          timezone: 'Europe/Madrid',
        },
        availableDates: {
          dates: ['2025-12-15'],
          loading: false,
          error: null,
          month: '2025-12',
        },
        timeSlots: {
          slots: [],
          loading: false,
          error: null,
          loadedDate: '2025-12-15',
        },
        creation: {
          loading: false,
          error: null,
          result: {
            bookingId: 'bk_123',
            status: 'confirmed',
            confirmationUrl: 'https://example.com/confirm',
            calendarEventId: 'cal_123',
          },
        },
      };

      const state = bookingReducer(stateWithData, clearBookingForm());

      expect(state.form.duration).toBeNull();
      expect(state.form.date).toBeNull();
      expect(state.form.selectedSlot).toBeNull();
      expect(state.form.meetingType).toBeNull();
      expect(state.form.title).toBe('');
      expect(state.form.description).toBe('');
      expect(state.form.timezone).toBe('Europe/Madrid'); // Preserved
      expect(state.availableDates.dates).toEqual([]);
      expect(state.timeSlots.slots).toEqual([]);
      expect(state.creation.result).toBeNull();
    });

    it('should clear booking result', () => {
      const stateWithResult: BookingState = {
        ...initialState,
        creation: {
          loading: false,
          error: 'Some error',
          result: {
            bookingId: 'bk_123',
            status: 'confirmed',
            confirmationUrl: 'https://example.com/confirm',
            calendarEventId: 'cal_123',
          },
        },
      };

      const state = bookingReducer(stateWithResult, clearBookingResult());

      expect(state.creation.result).toBeNull();
      expect(state.creation.error).toBeNull();
    });
  });

  describe('async thunks - fetchAvailableDates', () => {
    it('should handle pending state', () => {
      const action = { type: fetchAvailableDates.pending.type };
      const state = bookingReducer(initialState, action);

      expect(state.availableDates.loading).toBe(true);
      expect(state.availableDates.error).toBeNull();
    });

    it('should handle fulfilled state', () => {
      const action = {
        type: fetchAvailableDates.fulfilled.type,
        payload: {
          dates: ['2025-12-15', '2025-12-16'],
          month: '2025-12',
        },
      };

      const state = bookingReducer(initialState, action);

      expect(state.availableDates.loading).toBe(false);
      expect(state.availableDates.dates).toEqual(['2025-12-15', '2025-12-16']);
      expect(state.availableDates.month).toBe('2025-12');
    });

    it('should handle rejected state', () => {
      const action = {
        type: fetchAvailableDates.rejected.type,
        payload: 'Network error',
      };

      const state = bookingReducer(initialState, action);

      expect(state.availableDates.loading).toBe(false);
      expect(state.availableDates.error).toBe('Network error');
    });
  });

  describe('async thunks - fetchTimeSlots', () => {
    it('should handle pending state', () => {
      const action = { type: fetchTimeSlots.pending.type };
      const state = bookingReducer(initialState, action);

      expect(state.timeSlots.loading).toBe(true);
      expect(state.timeSlots.error).toBeNull();
    });

    it('should handle fulfilled state', () => {
      const slots: TimeSlot[] = [
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
      ];

      const action = {
        type: fetchTimeSlots.fulfilled.type,
        payload: {
          slots,
          date: '2025-12-15',
        },
      };

      const state = bookingReducer(initialState, action);

      expect(state.timeSlots.loading).toBe(false);
      expect(state.timeSlots.slots).toEqual(slots);
      expect(state.timeSlots.loadedDate).toBe('2025-12-15');
    });

    it('should handle rejected state', () => {
      const action = {
        type: fetchTimeSlots.rejected.type,
        payload: 'Failed to fetch slots',
      };

      const state = bookingReducer(initialState, action);

      expect(state.timeSlots.loading).toBe(false);
      expect(state.timeSlots.error).toBe('Failed to fetch slots');
    });
  });

  describe('async thunks - createBooking', () => {
    it('should handle pending state', () => {
      const action = { type: createBooking.pending.type };
      const state = bookingReducer(initialState, action);

      expect(state.creation.loading).toBe(true);
      expect(state.creation.error).toBeNull();
    });

    it('should handle fulfilled state', () => {
      const result = {
        bookingId: 'bk_abc123',
        status: 'confirmed' as const,
        confirmationUrl: 'https://example.com/confirm/bk_abc123',
        calendarEventId: 'cal_xyz789',
      };

      const action = {
        type: createBooking.fulfilled.type,
        payload: result,
      };

      const state = bookingReducer(initialState, action);

      expect(state.creation.loading).toBe(false);
      expect(state.creation.result).toEqual(result);
    });

    it('should handle rejected state', () => {
      const action = {
        type: createBooking.rejected.type,
        payload: 'Time slot no longer available',
      };

      const state = bookingReducer(initialState, action);

      expect(state.creation.loading).toBe(false);
      expect(state.creation.error).toBe('Time slot no longer available');
    });
  });
});
```

---

## RNTL Tests - Selectors

```typescript
// src/store/__tests__/bookingSelectors.test.ts

import type { RootState } from '@app/store';
import type { BookingState } from '../slices/bookingSlice';
import {
  selectBookingForm,
  selectDuration,
  selectDate,
  selectTimeSlot,
  selectMeetingType,
  selectTitle,
  selectDescription,
  selectTimezone,
  selectAvailableDatesArray,
  selectAvailableDatesLoading,
  selectAvailableDatesError,
  selectTimeSlotsArray,
  selectAvailableTimeSlots,
  selectTimeSlotsLoading,
  selectTimeSlotsError,
  selectBookingCreationLoading,
  selectBookingCreationError,
  selectBookingResult,
  selectIsFormComplete,
  selectBookingSummary,
  selectIsDateAvailable,
  selectAvailableTimeSlotsCount,
} from '../selectors/bookingSelectors';

describe('bookingSelectors', () => {
  const createMockState = (bookingState: Partial<BookingState> = {}): RootState => {
    const defaultBookingState: BookingState = {
      form: {
        duration: null,
        date: null,
        selectedSlot: null,
        meetingType: null,
        title: '',
        description: '',
        timezone: 'Europe/Madrid',
      },
      availableDates: {
        dates: [],
        loading: false,
        error: null,
        month: null,
      },
      timeSlots: {
        slots: [],
        loading: false,
        error: null,
        loadedDate: null,
      },
      creation: {
        loading: false,
        error: null,
        result: null,
      },
      ...bookingState,
    };

    return {
      booking: defaultBookingState,
    } as RootState;
  };

  describe('form selectors', () => {
    it('should select booking form', () => {
      const state = createMockState();
      const form = selectBookingForm(state);
      expect(form).toEqual(state.booking.form);
    });

    it('should select duration', () => {
      const state = createMockState({
        form: { ...createMockState().booking.form, duration: 30 },
      });
      expect(selectDuration(state)).toBe(30);
    });

    it('should select date', () => {
      const state = createMockState({
        form: { ...createMockState().booking.form, date: '2025-12-15' },
      });
      expect(selectDate(state)).toBe('2025-12-15');
    });

    it('should select time slot', () => {
      const slot = {
        startTime: '2025-12-15T09:00:00Z',
        endTime: '2025-12-15T09:30:00Z',
        available: true,
      };
      const state = createMockState({
        form: { ...createMockState().booking.form, selectedSlot: slot },
      });
      expect(selectTimeSlot(state)).toEqual(slot);
    });

    it('should select meeting type', () => {
      const state = createMockState({
        form: { ...createMockState().booking.form, meetingType: 'video' },
      });
      expect(selectMeetingType(state)).toBe('video');
    });

    it('should select title', () => {
      const state = createMockState({
        form: { ...createMockState().booking.form, title: 'Test meeting' },
      });
      expect(selectTitle(state)).toBe('Test meeting');
    });

    it('should select description', () => {
      const state = createMockState({
        form: { ...createMockState().booking.form, description: 'Test description' },
      });
      expect(selectDescription(state)).toBe('Test description');
    });

    it('should select timezone', () => {
      const state = createMockState({
        form: { ...createMockState().booking.form, timezone: 'America/New_York' },
      });
      expect(selectTimezone(state)).toBe('America/New_York');
    });
  });

  describe('available dates selectors', () => {
    it('should select available dates array', () => {
      const dates = ['2025-12-15', '2025-12-16'];
      const state = createMockState({
        availableDates: { dates, loading: false, error: null, month: '2025-12' },
      });
      expect(selectAvailableDatesArray(state)).toEqual(dates);
    });

    it('should select loading state', () => {
      const state = createMockState({
        availableDates: { dates: [], loading: true, error: null, month: null },
      });
      expect(selectAvailableDatesLoading(state)).toBe(true);
    });

    it('should select error state', () => {
      const state = createMockState({
        availableDates: {
          dates: [],
          loading: false,
          error: 'Network error',
          month: null,
        },
      });
      expect(selectAvailableDatesError(state)).toBe('Network error');
    });
  });

  describe('time slots selectors', () => {
    const mockSlots = [
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
      {
        startTime: '2025-12-15T10:00:00Z',
        endTime: '2025-12-15T10:30:00Z',
        available: true,
      },
    ];

    it('should select time slots array', () => {
      const state = createMockState({
        timeSlots: {
          slots: mockSlots,
          loading: false,
          error: null,
          loadedDate: '2025-12-15',
        },
      });
      expect(selectTimeSlotsArray(state)).toEqual(mockSlots);
    });

    it('should select only available time slots', () => {
      const state = createMockState({
        timeSlots: {
          slots: mockSlots,
          loading: false,
          error: null,
          loadedDate: '2025-12-15',
        },
      });
      const availableSlots = selectAvailableTimeSlots(state);
      expect(availableSlots).toHaveLength(2);
      expect(availableSlots.every(slot => slot.available)).toBe(true);
    });

    it('should count available time slots', () => {
      const state = createMockState({
        timeSlots: {
          slots: mockSlots,
          loading: false,
          error: null,
          loadedDate: '2025-12-15',
        },
      });
      expect(selectAvailableTimeSlotsCount(state)).toBe(2);
    });

    it('should select loading state', () => {
      const state = createMockState({
        timeSlots: { slots: [], loading: true, error: null, loadedDate: null },
      });
      expect(selectTimeSlotsLoading(state)).toBe(true);
    });

    it('should select error state', () => {
      const state = createMockState({
        timeSlots: {
          slots: [],
          loading: false,
          error: 'Failed to fetch',
          loadedDate: null,
        },
      });
      expect(selectTimeSlotsError(state)).toBe('Failed to fetch');
    });
  });

  describe('booking creation selectors', () => {
    it('should select loading state', () => {
      const state = createMockState({
        creation: { loading: true, error: null, result: null },
      });
      expect(selectBookingCreationLoading(state)).toBe(true);
    });

    it('should select error state', () => {
      const state = createMockState({
        creation: { loading: false, error: 'Creation failed', result: null },
      });
      expect(selectBookingCreationError(state)).toBe('Creation failed');
    });

    it('should select booking result', () => {
      const result = {
        bookingId: 'bk_123',
        status: 'confirmed' as const,
        confirmationUrl: 'https://example.com/confirm',
        calendarEventId: 'cal_123',
      };
      const state = createMockState({
        creation: { loading: false, error: null, result },
      });
      expect(selectBookingResult(state)).toEqual(result);
    });
  });

  describe('computed selectors', () => {
    it('should identify incomplete form', () => {
      const state = createMockState();
      expect(selectIsFormComplete(state)).toBe(false);
    });

    it('should identify complete form', () => {
      const state = createMockState({
        form: {
          duration: 30,
          date: '2025-12-15',
          selectedSlot: {
            startTime: '2025-12-15T09:00:00Z',
            endTime: '2025-12-15T09:30:00Z',
            available: true,
          },
          meetingType: 'video',
          title: 'Test meeting',
          description: '',
          timezone: 'Europe/Madrid',
        },
      });
      expect(selectIsFormComplete(state)).toBe(true);
    });

    it('should reject form with short title', () => {
      const state = createMockState({
        form: {
          duration: 30,
          date: '2025-12-15',
          selectedSlot: {
            startTime: '2025-12-15T09:00:00Z',
            endTime: '2025-12-15T09:30:00Z',
            available: true,
          },
          meetingType: 'video',
          title: 'ab', // Too short
          description: '',
          timezone: 'Europe/Madrid',
        },
      });
      expect(selectIsFormComplete(state)).toBe(false);
    });

    it('should return null summary for incomplete form', () => {
      const state = createMockState();
      expect(selectBookingSummary(state)).toBeNull();
    });

    it('should return summary for complete form', () => {
      const state = createMockState({
        form: {
          duration: 30,
          date: '2025-12-15',
          selectedSlot: {
            startTime: '2025-12-15T09:00:00Z',
            endTime: '2025-12-15T09:30:00Z',
            available: true,
          },
          meetingType: 'video',
          title: 'Test meeting',
          description: 'Test description',
          timezone: 'Europe/Madrid',
        },
      });

      const summary = selectBookingSummary(state);
      expect(summary).toEqual({
        duration: 30,
        date: '2025-12-15',
        startTime: '2025-12-15T09:00:00Z',
        endTime: '2025-12-15T09:30:00Z',
        meetingType: 'video',
        title: 'Test meeting',
        description: 'Test description',
        timezone: 'Europe/Madrid',
      });
    });

    it('should check if date is available', () => {
      const state = createMockState({
        availableDates: {
          dates: ['2025-12-15', '2025-12-16'],
          loading: false,
          error: null,
          month: '2025-12',
        },
      });

      expect(selectIsDateAvailable(state, '2025-12-15')).toBe(true);
      expect(selectIsDateAvailable(state, '2025-12-17')).toBe(false);
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
    "form": {
      "incomplete": "Please complete all required fields before submitting"
    }
  }
}
```

---

## Testing Checklist

- [ ] All synchronous actions update state correctly
- [ ] Dependent fields clear when parent changes (duration → date → slot)
- [ ] clearBookingForm resets all state except timezone
- [ ] All async thunks handle pending/fulfilled/rejected states
- [ ] Selectors return correct values
- [ ] Memoised selectors use createSelector
- [ ] selectIsFormComplete validates all required fields
- [ ] selectBookingSummary returns null for incomplete forms
- [ ] selectAvailableTimeSlots filters correctly
- [ ] RNTL tests achieve 100% coverage
- [ ] `yarn validate` passes (typecheck + lint + test)

---

## Notes

- Booking state is NOT persisted (session-based)
- Timezone automatically detected from device on init
- Dependent fields cascade clear (duration changes → clear date & slots)
- Form validation happens in selector (selectIsFormComplete)
- Honeypot field always empty for legitimate submissions
- All selectors memoised for performance
