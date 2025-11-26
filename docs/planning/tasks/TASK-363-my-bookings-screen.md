# TASK-363: My Bookings Screen (List + Swipe Actions)

**Status**: 🆕 Not Started
**Effort**: 4 hours
**Priority**: High
**Parent**: [US-065: View & Manage Bookings](../user-stories/US-065-view-manage-bookings.md)

---

## Overview

Create the My Bookings screen that displays a list of the user's bookings with swipe-to-reveal actions for Edit and Cancel. The screen follows iOS-first design principles with grouped list styling, pull-to-refresh, empty state, and a "Book Another" button in the navigation header.

---

## Requirements

### Functional Requirements

1. **Booking List**:
   - Display all confirmed upcoming bookings
   - Order by `start_time` ascending (soonest first)
   - Swipe right reveals Edit/Cancel actions
   - Tap on booking navigates to detail screen
2. **Header Actions**:
   - "Book Another" button in top-right (navigates to booking flow)
3. **Pull-to-Refresh**: Reload bookings from API
4. **Empty State**: When no bookings exist, show CTA to book first appointment
5. **Loading State**: Skeleton loaders while fetching data
6. **Error State**: Retry button if API call fails
7. **Swipe Actions**:
   - Edit: Navigate to edit screen with booking data
   - Cancel: Show confirmation action sheet, then cancel booking

### Non-Functional Requirements

1. **iOS-First Design**: Grouped list styling (like iOS Settings)
2. **Performance**: FlatList with optimised rendering
3. **EAA Compliance**: WCAG 2.1 Level AA (touch targets, contrast, labels)
4. **Offline-Ready**: Show cached bookings if offline

---

## ASCII Mockups

### My Bookings Screen (With Bookings)

```
┌─────────────────────────────────────────────────┐
│  ← My Bookings               Book Another +     │ ← Navigation header
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Strategy Session                         │ │ ← Swipeable card
│  │  1 Dec 2025, 14:00 - 15:00                │ │
│  │  📹 Google Meet                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Quick Catchup                            │ │
│  │  5 Dec 2025, 10:00 - 10:30                │ │
│  │  📍 123 High Street, London               │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Team Sync                                │ │
│  │  10 Dec 2025, 15:00 - 16:00               │ │
│  │  📹 Google Meet                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Swipe Right on Booking

```
← Swipe
┌──────────┬───────────┬──────────────────────────┐
│  Edit    │  Cancel   │  Strategy Session        │
│  (blue)  │   (red)   │  1 Dec 2025, 14:00       │
│          │           │  📹 Google Meet          │
└──────────┴───────────┴──────────────────────────┘
```

### Empty State

```
┌─────────────────────────────────────────────────┐
│  ← My Bookings               Book Another +     │
├─────────────────────────────────────────────────┤
│                                                 │
│                                                 │
│                    📅                           │
│                                                 │
│            No Bookings Yet                      │
│                                                 │
│   You haven't booked any appointments yet.      │
│   Book your first call to get started.          │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │          Book Your First Call           │   │ ← Primary CTA
│  └─────────────────────────────────────────┘   │
│                                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Loading State (Skeleton)

```
┌─────────────────────────────────────────────────┐
│  ← My Bookings               Book Another +     │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                  │ │ ← Skeleton loader
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓                          │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                  │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓                          │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Implementation

### File Structure

```
src/features/Bookings/
├── MyBookingsScreen.tsx              # Main screen
├── MyBookingsScreen.test.tsx         # RNTL tests
├── MyBookingsScreen.stories.tsx      # Storybook stories
├── components/
│   ├── BookingListItem.tsx           # Individual booking card
│   ├── BookingListItem.test.tsx
│   ├── BookingListItem.stories.tsx
│   ├── EmptyBookingsState.tsx        # Empty state component
│   ├── EmptyBookingsState.test.tsx
│   └── EmptyBookingsState.stories.tsx
├── hooks/
│   └── useBookings.ts                # Custom hook for API calls
└── index.ts
```

### Main Screen Component

```typescript
// src/features/Bookings/MyBookingsScreen.tsx

import React, { useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { Box, Heading, Pressable, Text, Spinner } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/navigation/types';
import { SwipeToReveal } from '@app/components/SwipeToReveal';
import { BookingListItem } from './components/BookingListItem';
import { EmptyBookingsState } from './components/EmptyBookingsState';
import { useBookings } from './hooks/useBookings';
import { tokens } from '@gluestack-ui/themed';
import { showActionSheet } from '@app/utils/actionSheet';

type MyBookingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MyBookings'
>;

export const MyBookingsScreen: React.FC = () => {
  const navigation = useNavigation<MyBookingsScreenNavigationProp>();

  const {
    bookings,
    isLoading,
    isRefreshing,
    error,
    refetch,
    cancelBooking,
  } = useBookings({ upcomingOnly: true });

  // Set header button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('BookCall')}
          accessibilityRole="button"
          accessibilityLabel="Book another appointment"
          accessibilityHint="Opens the booking flow to schedule a new appointment"
          testID="book-another-button"
          px="$4"
          py="$2"
          minHeight="$11" // 44pt touch target
        >
          <Text color="$blue500" fontSize="$md" fontWeight="$semibold">
            Book Another +
          </Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleEdit = useCallback(
    (bookingId: string) => {
      navigation.navigate('EditBooking', { bookingId });
    },
    [navigation]
  );

  const handleCancel = useCallback(
    async (bookingId: string, bookingTitle: string) => {
      showActionSheet({
        title: 'Cancel Booking',
        message: `Are you sure you want to cancel "${bookingTitle}"? This action cannot be undone.`,
        options: [
          {
            label: 'Cancel Booking',
            style: 'destructive',
            onPress: async () => {
              try {
                await cancelBooking(bookingId);
                // Optionally show success toast
              } catch (error) {
                // Show error toast
                console.error('Failed to cancel booking:', error);
              }
            },
          },
          {
            label: 'Keep Booking',
            style: 'cancel',
          },
        ],
      });
    },
    [cancelBooking]
  );

  const handleBookingPress = useCallback(
    (bookingId: string) => {
      navigation.navigate('BookingDetail', { bookingId });
    },
    [navigation]
  );

  const renderBooking = useCallback(
    ({ item }: { item: Booking }) => (
      <SwipeToReveal
        testID={`booking-swipe-${item.id}`}
        actions={[
          {
            label: 'Edit',
            backgroundColor: tokens.colors.blue500,
            onPress: () => handleEdit(item.id),
            accessibilityLabel: `Edit ${item.meeting_type.name} booking`,
            accessibilityHint: 'Opens the edit booking screen',
            testID: `edit-booking-${item.id}`,
          },
          {
            label: 'Cancel',
            backgroundColor: tokens.colors.red500,
            onPress: () => handleCancel(item.id, item.meeting_type.name),
            accessibilityLabel: `Cancel ${item.meeting_type.name} booking`,
            accessibilityHint: 'Cancels this booking after confirmation',
            testID: `cancel-booking-${item.id}`,
          },
        ]}
        containerStyle={{ marginBottom: 12 }}
      >
        <BookingListItem
          booking={item}
          onPress={() => handleBookingPress(item.id)}
          testID={`booking-item-${item.id}`}
        />
      </SwipeToReveal>
    ),
    [handleEdit, handleCancel, handleBookingPress]
  );

  const keyExtractor = useCallback((item: Booking) => item.id, []);

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$coolGray50">
        <Spinner size="large" testID="loading-spinner" />
        <Text mt="$4" color="$coolGray600">
          Loading your bookings...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$coolGray50" px="$6">
        <Text fontSize="$lg" fontWeight="$semibold" mb="$2" textAlign="center">
          Failed to Load Bookings
        </Text>
        <Text color="$coolGray600" mb="$6" textAlign="center">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </Text>
        <Pressable
          onPress={refetch}
          bg="$blue500"
          px="$6"
          py="$3"
          borderRadius="$lg"
          minHeight="$11"
          accessibilityRole="button"
          accessibilityLabel="Retry loading bookings"
          testID="retry-button"
        >
          <Text color="$white" fontWeight="$semibold">
            Retry
          </Text>
        </Pressable>
      </Box>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Box flex={1} bg="$coolGray50">
        <EmptyBookingsState
          onBookNow={() => navigation.navigate('BookCall')}
          testID="empty-state"
        />
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$coolGray50">
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={tokens.colors.blue500}
            testID="refresh-control"
          />
        }
        testID="bookings-list"
      />
    </Box>
  );
};
```

### Booking List Item Component

```typescript
// src/features/Bookings/components/BookingListItem.tsx

import React from 'react';
import { Box, Text, Pressable } from '@gluestack-ui/themed';
import { format } from 'date-fns';
import { Booking } from '@app/types/booking';

interface BookingListItemProps {
  booking: Booking;
  onPress: () => void;
  testID?: string;
}

export const BookingListItem: React.FC<BookingListItemProps> = ({
  booking,
  onPress,
  testID,
}) => {
  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);

  const formattedDate = format(startTime, 'd MMM yyyy');
  const formattedTime = `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`;

  const meetingIcon = booking.meeting_type.meeting_type === 'google_meet' ? '📹' : '📍';

  return (
    <Pressable
      onPress={onPress}
      bg="$white"
      p="$4"
      borderRadius="$lg"
      shadowColor="$black"
      shadowOpacity={0.05}
      shadowRadius={4}
      shadowOffset={{ width: 0, height: 2 }}
      minHeight="$20" // 80pt (ensures adequate touch target)
      accessibilityRole="button"
      accessibilityLabel={`${booking.meeting_type.name} on ${formattedDate} at ${formattedTime}`}
      accessibilityHint="Tap to view booking details"
      testID={testID}
    >
      <Text fontSize="$lg" fontWeight="$semibold" color="$coolGray900" mb="$1">
        {booking.meeting_type.name}
      </Text>
      <Text fontSize="$sm" color="$coolGray600" mb="$1">
        {formattedDate}, {formattedTime}
      </Text>
      <Text fontSize="$sm" color="$coolGray500">
        {meetingIcon}{' '}
        {booking.meeting_type.meeting_type === 'google_meet'
          ? 'Google Meet'
          : booking.location_address || 'In-person meeting'}
      </Text>
    </Pressable>
  );
};
```

### Empty State Component

```typescript
// src/features/Bookings/components/EmptyBookingsState.tsx

import React from 'react';
import { Box, Text, Pressable } from '@gluestack-ui/themed';

interface EmptyBookingsStateProps {
  onBookNow: () => void;
  testID?: string;
}

export const EmptyBookingsState: React.FC<EmptyBookingsStateProps> = ({
  onBookNow,
  testID,
}) => {
  return (
    <Box
      flex={1}
      justifyContent="center"
      alignItems="center"
      px="$8"
      testID={testID}
    >
      <Text fontSize={64} mb="$4">
        📅
      </Text>
      <Text
        fontSize="$xl"
        fontWeight="$semibold"
        color="$coolGray900"
        mb="$2"
        textAlign="center"
      >
        No Bookings Yet
      </Text>
      <Text
        fontSize="$md"
        color="$coolGray600"
        mb="$8"
        textAlign="center"
        lineHeight="$lg"
      >
        You haven't booked any appointments yet.{'\n'}
        Book your first call to get started.
      </Text>
      <Pressable
        onPress={onBookNow}
        bg="$blue500"
        px="$8"
        py="$4"
        borderRadius="$lg"
        minHeight="$12" // 48pt for EAA compliance
        accessibilityRole="button"
        accessibilityLabel="Book your first call"
        accessibilityHint="Opens the booking flow to schedule your first appointment"
        testID="book-first-call-button"
      >
        <Text color="$white" fontSize="$md" fontWeight="$semibold">
          Book Your First Call
        </Text>
      </Pressable>
    </Box>
  );
};
```

### Custom Hook for API Calls

```typescript
// src/features/Bookings/hooks/useBookings.ts

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@app/lib/supabase';
import { Booking } from '@app/types/booking';

interface UseBookingsOptions {
  status?: 'confirmed' | 'cancelled' | 'completed';
  upcomingOnly?: boolean;
}

interface UseBookingsReturn {
  bookings: Booking[] | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<void>;
}

export const useBookings = (options: UseBookingsOptions = {}): UseBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBookings = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error('Not authenticated');
        }

        const queryParams = new URLSearchParams();
        if (options.status) {
          queryParams.append('status', options.status);
        }
        if (options.upcomingOnly) {
          queryParams.append('upcoming_only', 'true');
        }

        const response = await fetch(
          `${process.env.SUPABASE_URL}/functions/v1/get-user-bookings?${queryParams}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error.message);
        }

        setBookings(result.data.bookings);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [options.status, options.upcomingOnly]
  );

  const refetch = useCallback(async () => {
    await fetchBookings(true);
  }, [fetchBookings]);

  const cancelBooking = useCallback(
    async (bookingId: string, reason?: string) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/cancel-booking`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ booking_id: bookingId, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message);
      }

      // Refresh bookings after cancellation
      await fetchBookings();
    },
    [fetchBookings]
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    isLoading,
    isRefreshing,
    error,
    refetch,
    cancelBooking,
  };
};
```

---

## React Native Testing Library Tests

```typescript
// src/features/Bookings/MyBookingsScreen.test.tsx

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { MyBookingsScreen } from './MyBookingsScreen';
import { renderWithProviders } from '@app/test-utils';
import { useBookings } from './hooks/useBookings';

jest.mock('./hooks/useBookings');

const mockBookings = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    meeting_type: {
      name: 'Strategy Session',
      meeting_type: 'google_meet',
    },
    start_time: '2025-12-01T14:00:00.000Z',
    end_time: '2025-12-01T15:00:00.000Z',
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    meeting_type: {
      name: 'Quick Catchup',
      meeting_type: 'in_person',
    },
    start_time: '2025-12-05T10:00:00.000Z',
    end_time: '2025-12-05T10:30:00.000Z',
    location_address: '123 High Street, London',
  },
];

describe('MyBookingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (useBookings as jest.Mock).mockReturnValue({
      bookings: null,
      isLoading: true,
      isRefreshing: false,
      error: null,
      refetch: jest.fn(),
      cancelBooking: jest.fn(),
    });

    const { getByTestId } = renderWithProviders(<MyBookingsScreen />);

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('should render bookings list', async () => {
    (useBookings as jest.Mock).mockReturnValue({
      bookings: mockBookings,
      isLoading: false,
      isRefreshing: false,
      error: null,
      refetch: jest.fn(),
      cancelBooking: jest.fn(),
    });

    const { getByText, getByTestId } = renderWithProviders(<MyBookingsScreen />);

    await waitFor(() => {
      expect(getByText('Strategy Session')).toBeTruthy();
      expect(getByText('Quick Catchup')).toBeTruthy();
    });

    expect(getByTestId('bookings-list')).toBeTruthy();
  });

  it('should render empty state when no bookings', () => {
    (useBookings as jest.Mock).mockReturnValue({
      bookings: [],
      isLoading: false,
      isRefreshing: false,
      error: null,
      refetch: jest.fn(),
      cancelBooking: jest.fn(),
    });

    const { getByTestId, getByText } = renderWithProviders(<MyBookingsScreen />);

    expect(getByTestId('empty-state')).toBeTruthy();
    expect(getByText('No Bookings Yet')).toBeTruthy();
  });

  it('should render error state', () => {
    (useBookings as jest.Mock).mockReturnValue({
      bookings: null,
      isLoading: false,
      isRefreshing: false,
      error: new Error('Network error'),
      refetch: jest.fn(),
      cancelBooking: jest.fn(),
    });

    const { getByText, getByTestId } = renderWithProviders(<MyBookingsScreen />);

    expect(getByText('Failed to Load Bookings')).toBeTruthy();
    expect(getByTestId('retry-button')).toBeTruthy();
  });

  it('should navigate to booking detail when item pressed', async () => {
    const mockNavigate = jest.fn();
    (useBookings as jest.Mock).mockReturnValue({
      bookings: mockBookings,
      isLoading: false,
      isRefreshing: false,
      error: null,
      refetch: jest.fn(),
      cancelBooking: jest.fn(),
    });

    const { getByTestId } = renderWithProviders(<MyBookingsScreen />, {
      navigationMock: { navigate: mockNavigate },
    });

    await waitFor(() => {
      fireEvent.press(getByTestId('booking-item-550e8400-e29b-41d4-a716-446655440000'));
    });

    expect(mockNavigate).toHaveBeenCalledWith('BookingDetail', {
      bookingId: '550e8400-e29b-41d4-a716-446655440000',
    });
  });

  it('should show "Book Another" button in header', () => {
    (useBookings as jest.Mock).mockReturnValue({
      bookings: mockBookings,
      isLoading: false,
      isRefreshing: false,
      error: null,
      refetch: jest.fn(),
      cancelBooking: jest.fn(),
    });

    const { getByTestId } = renderWithProviders(<MyBookingsScreen />);

    expect(getByTestId('book-another-button')).toBeTruthy();
  });

  it('should have correct accessibility props on "Book Another" button', () => {
    (useBookings as jest.Mock).mockReturnValue({
      bookings: mockBookings,
      isLoading: false,
      isRefreshing: false,
      error: null,
      refetch: jest.fn(),
      cancelBooking: jest.fn(),
    });

    const { getByTestId } = renderWithProviders(<MyBookingsScreen />);

    const button = getByTestId('book-another-button');
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityLabel).toBe('Book another appointment');
  });
});
```

**Test Coverage Target**: 100%

---

## Storybook Stories

```typescript
// src/features/Bookings/MyBookingsScreen.stories.tsx

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MyBookingsScreen } from './MyBookingsScreen';
import { useBookings } from './hooks/useBookings';

jest.mock('./hooks/useBookings');

const meta: Meta<typeof MyBookingsScreen> = {
  title: 'Features/Bookings/MyBookingsScreen',
  component: MyBookingsScreen,
};

export default meta;

type Story = StoryObj<typeof MyBookingsScreen>;

export const WithBookings: Story = {
  decorators: [
    (Story) => {
      (useBookings as jest.Mock).mockReturnValue({
        bookings: [
          {
            id: '1',
            meeting_type: { name: 'Strategy Session', meeting_type: 'google_meet' },
            start_time: '2025-12-01T14:00:00.000Z',
            end_time: '2025-12-01T15:00:00.000Z',
          },
        ],
        isLoading: false,
        isRefreshing: false,
        error: null,
        refetch: () => {},
        cancelBooking: async () => {},
      });
      return <Story />;
    },
  ],
};

export const Loading: Story = {
  decorators: [
    (Story) => {
      (useBookings as jest.Mock).mockReturnValue({
        bookings: null,
        isLoading: true,
        isRefreshing: false,
        error: null,
        refetch: () => {},
        cancelBooking: async () => {},
      });
      return <Story />;
    },
  ],
};

export const Empty: Story = {
  decorators: [
    (Story) => {
      (useBookings as jest.Mock).mockReturnValue({
        bookings: [],
        isLoading: false,
        isRefreshing: false,
        error: null,
        refetch: () => {},
        cancelBooking: async () => {},
      });
      return <Story />;
    },
  ],
};

export const Error: Story = {
  decorators: [
    (Story) => {
      (useBookings as jest.Mock).mockReturnValue({
        bookings: null,
        isLoading: false,
        isRefreshing: false,
        error: new Error('Network error'),
        refetch: () => {},
        cancelBooking: async () => {},
      });
      return <Story />;
    },
  ],
};
```

---

## Accessibility Requirements (EAA Compliance)

### WCAG 2.1 Level AA Checklist

- [x] **Touch Targets**: All buttons minimum 44×44pt via `minHeight="$11"` or `minHeight="$12"`
- [x] **Colour Contrast**: Text meets 4.5:1 ratio (coolGray900 on white, blue500 links)
- [x] **Accessible Labels**: All interactive elements have `accessibilityLabel` and `accessibilityHint`
- [x] **Semantic Roles**: `accessibilityRole="button"` on all pressable elements
- [x] **Screen Reader**: VoiceOver/TalkBack announces booking details correctly

---

## Acceptance Criteria

- [ ] Screen renders loading state with spinner
- [ ] Displays list of upcoming bookings ordered by start time
- [ ] Each booking shows: title, date/time, meeting type icon
- [ ] "Book Another" button visible in navigation header
- [ ] Tapping booking navigates to detail screen
- [ ] Swipe right reveals Edit/Cancel actions
- [ ] Edit action navigates to edit screen
- [ ] Cancel action shows confirmation, then cancels booking
- [ ] Pull-to-refresh reloads bookings
- [ ] Empty state shown when no bookings
- [ ] Empty state CTA navigates to booking flow
- [ ] Error state shows retry button
- [ ] All buttons have correct accessibility props
- [ ] RNTL tests achieve 100% coverage
- [ ] Storybook stories for all states (with bookings, loading, empty, error)

---

## Related Files

- **Screen**: `src/features/Bookings/MyBookingsScreen.tsx`
- **Components**: `src/features/Bookings/components/BookingListItem.tsx`
- **Empty State**: `src/features/Bookings/components/EmptyBookingsState.tsx`
- **Hook**: `src/features/Bookings/hooks/useBookings.ts`
- **Tests**: `src/features/Bookings/MyBookingsScreen.test.tsx`
- **Stories**: `src/features/Bookings/MyBookingsScreen.stories.tsx`
- **Navigation**: `src/navigation/RootNavigator/RootNavigator.tsx`
- **Types**: `src/types/booking.ts`

---

## Notes

- FlatList provides optimal performance for long lists
- Pull-to-refresh uses platform-specific indicators
- Consider implementing optimistic UI updates for better UX
- Skeleton loaders improve perceived performance
- Action sheet uses iOS-style bottom sheet (react-native-action-sheet)
