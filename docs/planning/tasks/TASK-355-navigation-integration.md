# TASK-355: Navigation Integration & Stack Reset

**Epic**: EPIC-031: Book a Call
**User Story**: US-064: Booking Confirmation & Navigation
**Status**: 📋 To Do
**Effort**: 2h
**Priority**: P0 (Critical Path)
**Assigned To**: Warren
**Created**: 2025-11-26

---

## Overview

Implement navigation integration for the booking flow, including stack reset after confirmation and data clearing via `beforeRemove` listener. Ensures users cannot navigate back to booking screens after confirmation, and all booking form data is cleared from state when leaving the flow. Must handle all navigation edge cases and maintain a clean navigation history.

---

## Requirements

### Functional Requirements

**Post-Confirmation Stack Reset**:

- After booking confirmed, reset navigation stack to `[Home, BookingConfirmation]`
- User can only go back to Home from confirmation screen
- "Done" button resets stack to `[Home]` only
- No ability to navigate back to BookingDetailsScreen or CalendarScreen

**beforeRemove Listener for Data Clearing**:

- Clear booking form data when user navigates away from booking flow
- Trigger on: back button, swipe back gesture, "Done" button
- Clear Redux state: `bookingSlice` (selectedDate, selectedTime, formData)
- Prevent data clearing when navigating forward within booking flow

**Navigation Flow Transitions**:

```
Home
  └─> BookingSelectType
        └─> BookingSelectDuration
              └─> CalendarScreen
                    └─> BookingDetailsScreen
                          └─> [Confirm] → API call
                                └─> Success: Reset to [Home, BookingConfirmation]
                                └─> Error: Stay on BookingDetailsScreen
```

**Back Navigation Rules**:

- From BookingConfirmation → Home only
- Cannot back to BookingDetailsScreen after confirmation
- Cannot back to CalendarScreen after confirmation
- Standard back navigation within booking flow (before confirmation)

**RootStackParamList Updates**:

- Add `BookingConfirmation` route with booking params
- Add `BookingSelectType`, `BookingSelectDuration` routes (from previous tasks)
- Ensure type safety across all navigation calls

### Non-Functional Requirements

**Performance**:

- Stack reset completes in <50ms
- Data clearing completes in <10ms
- No UI jank during navigation transitions

**User Experience**:

- Smooth transitions (no flicker)
- Clear mental model (can't go back after confirming)
- No unexpected state retention

**Error Handling**:

- Handle navigation errors gracefully
- Handle Redux state clearing errors
- Verify beforeRemove listener cleanup on unmount

**Testing**:

- 100% RNTL coverage for navigation logic
- Test all navigation transitions
- Test beforeRemove listener triggers
- Test Redux state clearing

---

## Technical Implementation

### Navigation Stack Diagrams

**Before Confirmation** (normal flow):

```
┌─────────────────────────────────────┐
│  Home                               │  Index 0
├─────────────────────────────────────┤
│  BookingSelectType                  │  Index 1
├─────────────────────────────────────┤
│  BookingSelectDuration              │  Index 2
├─────────────────────────────────────┤
│  CalendarScreen                     │  Index 3
├─────────────────────────────────────┤
│  BookingDetailsScreen               │  Index 4 (current)
└─────────────────────────────────────┘

Actions: Can navigate back through entire stack
```

**After Confirmation Success** (stack reset):

```
┌─────────────────────────────────────┐
│  Home                               │  Index 0
├─────────────────────────────────────┤
│  BookingConfirmation                │  Index 1 (current)
└─────────────────────────────────────┘

Actions: Can only go back to Home
Previous screens (BookingSelectType, etc.) are removed from stack
```

**After "Done" Pressed** (final reset):

```
┌─────────────────────────────────────┐
│  Home                               │  Index 0 (current)
└─────────────────────────────────────┘

Actions: Back at Home, booking flow complete
```

### Code Example: BookingDetailsScreen Navigation

**Update BookingDetailsScreen.tsx**:

```typescript
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import type { RootStackParamList } from '@app/navigation/types';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import { clearBookingData } from '@app/store/slices/bookingSlice';

type BookingDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BookingDetailsScreen'
>;

export const BookingDetailsScreen: React.FC = () => {
  const navigation = useNavigation<BookingDetailsScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { selectedDate, selectedTime, duration, callType } = useAppSelector(
    (state) => state.booking
  );

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    try {
      // Call Supabase Edge Function to book call
      const response = await fetch(
        `${process.env.SUPABASE_URL}/functions/v1/book-call`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            date: selectedDate,
            startTime: selectedTime,
            duration,
            callType,
            // ... other booking details
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Booking failed');
      }

      const bookingData = await response.json();

      // SUCCESS: Reset navigation stack to [Home, BookingConfirmation]
      // This removes all booking screens from stack (SelectType, SelectDuration, Calendar, Details)
      navigation.dispatch(
        CommonActions.reset({
          index: 1,  // BookingConfirmation is at index 1
          routes: [
            { name: 'Home' },  // Index 0
            {
              name: 'BookingConfirmation',  // Index 1
              params: {
                booking: {
                  id: bookingData.id,
                  date: bookingData.date,
                  startTime: bookingData.startTime,
                  endTime: bookingData.endTime,
                  duration: bookingData.duration,
                  callType: bookingData.callType,
                  meetingUrl: bookingData.meetingUrl,
                  userPhone: bookingData.userPhone,
                  timezone: bookingData.timezone,
                },
              },
            },
          ],
        })
      );

      // Clear booking form data from Redux
      // (beforeRemove listener will also trigger, but this ensures immediate cleanup)
      dispatch(clearBookingData());

    } catch (error) {
      console.error('Booking error:', error);
      // Show error toast
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error">
            <ToastTitle>Booking failed. Please try again.</ToastTitle>
          </Toast>
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // ... screen UI
    <Button
      onPress={handleConfirmBooking}
      isDisabled={isSubmitting}
      testID="confirm-booking-button"
    >
      <ButtonText>{isSubmitting ? 'Confirming...' : 'Confirm Booking'}</ButtonText>
    </Button>
  );
};
```

### Code Example: BookingConfirmationScreen Navigation

**Update BookingConfirmationScreen.tsx**:

```typescript
import React, { useEffect } from 'react';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@app/navigation/types';
import { useAppDispatch } from '@app/store/hooks';
import { clearBookingData } from '@app/store/slices/bookingSlice';

type BookingConfirmationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BookingConfirmation'
>;

export const BookingConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<BookingConfirmationScreenNavigationProp>();
  const dispatch = useAppDispatch();

  // Ensure booking data is cleared (redundant safety check)
  useEffect(() => {
    dispatch(clearBookingData());
  }, [dispatch]);

  const handleDone = () => {
    // Reset navigation stack to [Home] only
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
  };

  return (
    // ... screen UI
    <Button onPress={handleDone} testID="done-button">
      <ButtonText>Done</ButtonText>
    </Button>
  );
};
```

### Code Example: beforeRemove Listener (All Booking Screens)

**Implement in BookingSelectTypeScreen.tsx, BookingSelectDurationScreen.tsx, CalendarScreen.tsx, BookingDetailsScreen.tsx**:

```typescript
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '@app/store/hooks';
import { clearBookingData } from '@app/store/slices/bookingSlice';

export const BookingSelectTypeScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  // Add beforeRemove listener to clear booking data when navigating away
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Only clear data if navigating backwards (not forwards to next booking screen)
      const { type } = e.data.action;

      // Detect navigation type
      const isGoingBack = type === 'POP' || type === 'GO_BACK';
      const isStackReset = type === 'RESET';

      if (isGoingBack) {
        // User is exiting booking flow (back button, swipe gesture)
        dispatch(clearBookingData());
      }

      // If stack reset (after confirmation), data is already cleared in BookingDetailsScreen
      // No action needed here
    });

    return unsubscribe;
  }, [navigation, dispatch]);

  return (
    // ... screen UI
  );
};
```

**Alternative: Simpler approach (clear on ANY navigation away)**:

```typescript
useEffect(() => {
  const unsubscribe = navigation.addListener('beforeRemove', e => {
    // Clear booking data whenever leaving this screen
    // Exception: Don't clear if we're moving forward to BookingConfirmation
    // (confirmation screen will clear data itself)
    const targetRoute = e.data.action.payload?.name;
    const isMovingToConfirmation = targetRoute === 'BookingConfirmation';

    if (!isMovingToConfirmation) {
      dispatch(clearBookingData());
    }
  });

  return unsubscribe;
}, [navigation, dispatch]);
```

### Code Example: RootStackParamList Updates

**Update src/navigation/types.ts**:

```typescript
export type RootStackParamList = {
  // ... existing routes
  Home: undefined;

  // Booking flow routes
  BookingSelectType: undefined;
  BookingSelectDuration: {
    callType: 'video' | 'phone';
  };
  CalendarScreen: {
    callType: 'video' | 'phone';
    duration: number; // minutes
  };
  BookingDetailsScreen: {
    callType: 'video' | 'phone';
    duration: number;
    selectedDate: string; // ISO 8601
    selectedTime: string; // ISO 8601
  };
  BookingConfirmation: {
    booking: {
      id: string;
      date: string; // ISO 8601
      startTime: string; // ISO 8601
      endTime: string; // ISO 8601
      duration: number; // minutes
      callType: 'video' | 'phone';
      meetingUrl?: string; // Google Meet link (video only)
      userPhone?: string; // User's phone number (phone only)
      timezone: string; // IANA timezone
    };
  };
};
```

### Code Example: Redux bookingSlice Updates

**Update src/store/slices/bookingSlice.ts**:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BookingState {
  callType: 'video' | 'phone' | null;
  duration: number | null; // minutes
  selectedDate: string | null; // ISO 8601
  selectedTime: string | null; // ISO 8601
  formData: {
    name: string;
    email: string;
    phone: string;
    message: string;
  };
}

const initialState: BookingState = {
  callType: null,
  duration: null,
  selectedDate: null,
  selectedTime: null,
  formData: {
    name: '',
    email: '',
    phone: '',
    message: '',
  },
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setCallType: (state, action: PayloadAction<'video' | 'phone'>) => {
      state.callType = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setSelectedTime: (state, action: PayloadAction<string>) => {
      state.selectedTime = action.payload;
    },
    setFormData: (state, action: PayloadAction<Partial<BookingState['formData']>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    clearBookingData: state => {
      // Reset to initial state
      return initialState;
    },
  },
});

export const {
  setCallType,
  setDuration,
  setSelectedDate,
  setSelectedTime,
  setFormData,
  clearBookingData,
} = bookingSlice.actions;

export default bookingSlice.reducer;
```

### Navigation Flow Test Scenarios

**Scenario 1: Successful Booking Flow**

```
Home
  → BookingSelectType
    → BookingSelectDuration
      → CalendarScreen
        → BookingDetailsScreen
          → [Confirm] → API success
            → Stack reset to [Home, BookingConfirmation]
              → [Done] → Stack reset to [Home]
```

**Scenario 2: User Backs Out During Booking**

```
Home
  → BookingSelectType
    → BookingSelectDuration
      → [Back] → beforeRemove triggered
        → Clear booking data
          → Return to BookingSelectType
            → [Back] → beforeRemove triggered
              → Return to Home
```

**Scenario 3: User Swipes Back**

```
Home
  → BookingSelectType
    → BookingSelectDuration
      → CalendarScreen
        → [Swipe back gesture] → beforeRemove triggered
          → Clear booking data
            → Return to BookingSelectDuration
```

**Scenario 4: Booking API Failure**

```
Home
  → BookingSelectType
    → BookingSelectDuration
      → CalendarScreen
        → BookingDetailsScreen
          → [Confirm] → API error
            → Stay on BookingDetailsScreen
            → Show error toast
            → User can retry or go back
```

---

## Testing Requirements

### RNTL Tests (100% Coverage Required)

**Test File**: `BookingDetailsScreen.navigation.test.tsx`

```typescript
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '@app/test-utils/renderWithProviders';
import { BookingDetailsScreen } from './BookingDetailsScreen';
import { CommonActions } from '@react-navigation/native';

// Mock fetch
global.fetch = jest.fn();

// Mock navigation
const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    dispatch: mockDispatch,
    navigate: mockNavigate,
  }),
  CommonActions: {
    reset: jest.fn((config) => ({ type: 'RESET', payload: config })),
  },
}));

describe('BookingDetailsScreen - Navigation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Booking', () => {
    it('resets navigation stack to [Home, BookingConfirmation] on success', async () => {
      const mockBookingResponse = {
        id: 'booking-123',
        date: '2024-11-27T00:00:00Z',
        startTime: '2024-11-27T14:00:00Z',
        endTime: '2024-11-27T14:30:00Z',
        duration: 30,
        callType: 'video',
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        timezone: 'GMT',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBookingResponse,
      });

      renderWithProviders(<BookingDetailsScreen />);

      const confirmButton = screen.getByTestId('confirm-booking-button');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'RESET',
            payload: {
              index: 1,
              routes: [
                { name: 'Home' },
                {
                  name: 'BookingConfirmation',
                  params: {
                    booking: mockBookingResponse,
                  },
                },
              ],
            },
          })
        );
      });
    });

    it('clears booking data from Redux on success', async () => {
      const mockBookingResponse = {
        id: 'booking-123',
        date: '2024-11-27T00:00:00Z',
        startTime: '2024-11-27T14:00:00Z',
        endTime: '2024-11-27T14:30:00Z',
        duration: 30,
        callType: 'video',
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        timezone: 'GMT',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBookingResponse,
      });

      const { store } = renderWithProviders(<BookingDetailsScreen />);

      const confirmButton = screen.getByTestId('confirm-booking-button');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(store.getState().booking).toEqual({
          callType: null,
          duration: null,
          selectedDate: null,
          selectedTime: null,
          formData: { name: '', email: '', phone: '', message: '' },
        });
      });
    });
  });

  describe('Booking Failure', () => {
    it('stays on BookingDetailsScreen on API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      renderWithProviders(<BookingDetailsScreen />);

      const confirmButton = screen.getByTestId('confirm-booking-button');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        // Should NOT reset navigation
        expect(mockDispatch).not.toHaveBeenCalled();
      });

      // Should show error toast
      expect(screen.getByText('Booking failed. Please try again.')).toBeTruthy();
    });

    it('does not clear booking data on API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { store } = renderWithProviders(<BookingDetailsScreen />, {
        preloadedState: {
          booking: {
            callType: 'video',
            duration: 30,
            selectedDate: '2024-11-27',
            selectedTime: '14:00',
            formData: { name: 'Test User', email: 'test@example.com', phone: '', message: '' },
          },
        },
      });

      const confirmButton = screen.getByTestId('confirm-booking-button');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        // Booking data should still be in Redux
        expect(store.getState().booking.callType).toBe('video');
        expect(store.getState().booking.duration).toBe(30);
      });
    });
  });
});
```

**Test File**: `BookingConfirmationScreen.navigation.test.tsx`

```typescript
import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@app/test-utils/renderWithProviders';
import { BookingConfirmationScreen } from './BookingConfirmationScreen';
import { CommonActions } from '@react-navigation/native';

const mockDispatch = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    dispatch: mockDispatch,
  }),
  useRoute: () => ({
    params: {
      booking: {
        id: 'booking-123',
        date: '2024-11-27T00:00:00Z',
        startTime: '2024-11-27T14:00:00Z',
        endTime: '2024-11-27T14:30:00Z',
        duration: 30,
        callType: 'video',
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        timezone: 'GMT',
      },
    },
  }),
  CommonActions: {
    reset: jest.fn((config) => ({ type: 'RESET', payload: config })),
  },
}));

describe('BookingConfirmationScreen - Navigation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resets navigation stack to [Home] when Done pressed', () => {
    renderWithProviders(<BookingConfirmationScreen />);

    const doneButton = screen.getByTestId('done-button');
    fireEvent.press(doneButton);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'RESET',
        payload: {
          index: 0,
          routes: [{ name: 'Home' }],
        },
      })
    );
  });

  it('clears booking data on mount', () => {
    const { store } = renderWithProviders(<BookingConfirmationScreen />, {
      preloadedState: {
        booking: {
          callType: 'video',
          duration: 30,
          selectedDate: '2024-11-27',
          selectedTime: '14:00',
          formData: { name: 'Test User', email: 'test@example.com', phone: '', message: '' },
        },
      },
    });

    // Should clear booking data on mount
    expect(store.getState().booking).toEqual({
      callType: null,
      duration: null,
      selectedDate: null,
      selectedTime: null,
      formData: { name: '', email: '', phone: '', message: '' },
    });
  });
});
```

**Test File**: `BookingSelectTypeScreen.beforeRemove.test.tsx`

```typescript
import React from 'react';
import { renderWithProviders } from '@app/test-utils/renderWithProviders';
import { BookingSelectTypeScreen } from './BookingSelectTypeScreen';

const mockAddListener = jest.fn();
const mockRemoveListener = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    addListener: mockAddListener,
    removeListener: mockRemoveListener,
  }),
}));

describe('BookingSelectTypeScreen - beforeRemove Listener', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers beforeRemove listener on mount', () => {
    renderWithProviders(<BookingSelectTypeScreen />);

    expect(mockAddListener).toHaveBeenCalledWith('beforeRemove', expect.any(Function));
  });

  it('clears booking data when navigating back', () => {
    const { store } = renderWithProviders(<BookingSelectTypeScreen />, {
      preloadedState: {
        booking: {
          callType: 'video',
          duration: 30,
          selectedDate: '2024-11-27',
          selectedTime: '14:00',
          formData: { name: 'Test User', email: 'test@example.com', phone: '', message: '' },
        },
      },
    });

    // Simulate beforeRemove event (back navigation)
    const listener = mockAddListener.mock.calls[0][1];
    listener({
      data: {
        action: { type: 'POP' },
      },
    });

    // Should clear booking data
    expect(store.getState().booking).toEqual({
      callType: null,
      duration: null,
      selectedDate: null,
      selectedTime: null,
      formData: { name: '', email: '', phone: '', message: '' },
    });
  });

  it('does not clear booking data when navigating forward', () => {
    const { store } = renderWithProviders(<BookingSelectTypeScreen />, {
      preloadedState: {
        booking: {
          callType: 'video',
          duration: null,
          selectedDate: null,
          selectedTime: null,
          formData: { name: '', email: '', phone: '', message: '' },
        },
      },
    });

    // Simulate beforeRemove event (forward navigation to BookingSelectDuration)
    const listener = mockAddListener.mock.calls[0][1];
    listener({
      data: {
        action: { type: 'NAVIGATE', payload: { name: 'BookingSelectDuration' } },
      },
    });

    // Should NOT clear booking data (forward navigation within booking flow)
    expect(store.getState().booking.callType).toBe('video');
  });

  it('unsubscribes listener on unmount', () => {
    const mockUnsubscribe = jest.fn();
    mockAddListener.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderWithProviders(<BookingSelectTypeScreen />);

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
```

**Test Coverage Targets**:

- Statements: 100%
- Branches: 100%
- Functions: 100%
- Lines: 100%

---

## Acceptance Criteria

**Post-Confirmation Stack Reset**:

- [ ] After booking success, stack resets to `[Home, BookingConfirmation]`
- [ ] User cannot navigate back to BookingDetailsScreen after confirmation
- [ ] User cannot navigate back to CalendarScreen after confirmation
- [ ] "Done" button resets stack to `[Home]` only

**beforeRemove Listener**:

- [ ] beforeRemove listener registered on all booking screens
- [ ] Booking data cleared when navigating back (POP, GO_BACK)
- [ ] Booking data NOT cleared when navigating forward (within booking flow)
- [ ] Listener unsubscribed on unmount (no memory leaks)

**Redux State Clearing**:

- [ ] `clearBookingData` action clears all booking state
- [ ] Redux state cleared immediately after booking success
- [ ] Redux state cleared on BookingConfirmation mount (redundant safety)

**Navigation Type Safety**:

- [ ] All routes in `RootStackParamList` have correct param types
- [ ] No TypeScript errors in navigation calls
- [ ] `navigate()` and `CommonActions.reset()` calls are type-safe

**Testing**:

- [ ] 100% RNTL coverage for navigation logic
- [ ] All navigation transitions tested
- [ ] All beforeRemove scenarios tested
- [ ] Redux state clearing tested

---

## Dependencies

**Blocked By**:

- TASK-353 (Confirmation screen) - must exist before navigation can reset to it

**Depends On**:

- None

**Blocks**:

- TASK-358 (E2E booking flow tests)

---

## Implementation Checklist

**RootStackParamList Updates**:

- [ ] Add `BookingConfirmation` route with booking params
- [ ] Add `BookingSelectType`, `BookingSelectDuration` routes
- [ ] Verify all param types are correct
- [ ] Run `yarn typecheck` to verify type safety

**BookingDetailsScreen Navigation**:

- [ ] Implement API call to `/book-call` edge function
- [ ] Implement stack reset on success: `CommonActions.reset([Home, BookingConfirmation])`
- [ ] Dispatch `clearBookingData()` on success
- [ ] Handle errors gracefully (stay on screen, show toast)

**BookingConfirmationScreen Navigation**:

- [ ] Implement "Done" button: `CommonActions.reset([Home])`
- [ ] Dispatch `clearBookingData()` on mount (redundant safety)
- [ ] Redirect to Home if booking data missing

**beforeRemove Listeners**:

- [ ] Implement in BookingSelectTypeScreen
- [ ] Implement in BookingSelectDurationScreen
- [ ] Implement in CalendarScreen
- [ ] Implement in BookingDetailsScreen
- [ ] Ensure listeners clear data only on back navigation (POP, GO_BACK)
- [ ] Ensure listeners unsubscribe on unmount

**Redux bookingSlice**:

- [ ] Implement `clearBookingData` action
- [ ] Verify action resets to `initialState`

**Testing**:

- [ ] Write navigation tests for BookingDetailsScreen
- [ ] Write navigation tests for BookingConfirmationScreen
- [ ] Write beforeRemove tests for all booking screens
- [ ] Test Redux state clearing
- [ ] Verify 100% coverage

**Validation**:

- [ ] Run `yarn validate` (0 errors)
- [ ] Manual test: Complete booking flow, verify stack reset
- [ ] Manual test: Back out during booking, verify data cleared
- [ ] Manual test: Swipe back gesture, verify data cleared

---

## Notes

**Why Stack Reset?**

- Prevents user from navigating back to booking screens after confirmation
- Provides clear mental model: "booking is done, can't go back"
- Matches iOS system behaviour (e.g., after completing a purchase)

**Why beforeRemove Listener?**

- Ensures booking data is cleared when user exits flow prematurely
- Prevents stale data from appearing if user re-enters booking flow
- Triggers on back button, swipe gesture, and programmatic navigation

**Navigation Edge Cases**:

- If user presses back on BookingConfirmation, goes to Home (stack is [Home, Confirmation])
- If user presses "Done", stack resets to [Home] only
- If API fails, user stays on BookingDetailsScreen and can retry or go back

**Redux State Clearing Timing**:

1. **After booking success**: Immediately after `CommonActions.reset()` in BookingDetailsScreen
2. **On confirmation mount**: Redundant safety check in BookingConfirmationScreen.useEffect
3. **On back navigation**: beforeRemove listener in all booking screens

This triple-clearing approach ensures data is always cleaned up, even if one mechanism fails.

**Future Enhancements**:

- Add "Go Back to Booking" button on confirmation screen (re-enter flow with saved data)
- Add "Reschedule" button (navigate to CalendarScreen with booking ID)
- Add deep linking support (open confirmation screen from push notification)
