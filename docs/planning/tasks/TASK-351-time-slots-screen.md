# TASK-351: Time Slots Screen (+ RNTL + Storybook)

**Status**: 📋 To Do
**Effort**: 4h
**Priority**: High
**Dependencies**: TASK-350 (Calendar Picker Screen)
**Parent**: [US-063: Booking Flow UI](../user-stories/US-063-booking-flow-ui.md)

---

## Overview

Build the time slots screen where users select an available time for their meeting. The screen fetches available time slots from the API based on the selected date and duration, and displays them in a scrollable list with loading, error, and empty states.

Time slots are displayed in the user's device locale format (24-hour for Spain, 12-hour for UK/US) with timezone information. This is the third screen in the booking flow.

---

## Acceptance Criteria

- ✅ Fetch time slots from API on mount
- ✅ Display slots in device locale format (12h/24h)
- ✅ Show timezone at top of screen
- ✅ Slot intervals match selected duration
- ✅ Loading state while fetching
- ✅ Error state with retry button
- ✅ Empty state (no slots available)
- ✅ Redux integration (dispatch setTimeSlot action)
- ✅ Navigation to Meeting Details on slot selection
- ✅ EAA compliance (WCAG 2.1 Level AA)
- ✅ RNTL tests achieve 100% coverage
- ✅ Storybook stories (loading, success, error, empty, dark mode)
- ✅ All validation passes (`yarn validate`)

---

## Screen Mockup

```
┌─────────────────────────────────────────────┐
│  < Back      Select Time            [i]     │ ← Header
├─────────────────────────────────────────────┤
│                                             │
│  AVAILABLE TIME SLOTS                       │ ← Section header (uppercase)
│                                             │
│  Monday, 15 December 2025                   │ ← Selected date (formatted)
│  Timezone: Europe/Madrid (CET)              │ ← Timezone info
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │        09:00 - 09:30                │   │ ← Available slot (tappable)
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │        09:30 - 10:00                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │        10:00 - 10:30                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │        14:00 - 14:30                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │        15:00 - 15:30                │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘

States:
- 24-hour format for Spanish locale: "14:00 - 14:30"
- 12-hour format for UK/US locale: "2:00 PM - 2:30 PM"
- Blue border on tap, navigates immediately
- Grey background for unavailable slots (not shown to user)
```

---

## Component Implementation

```typescript
// src/features/Booking/TimeSlotsScreen.tsx

import React, { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, ListRenderItem } from 'react-native';
import { Box, Text, Pressable } from '@gluestack-ui/themed';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import {
  setTimeSlot,
  fetchTimeSlots,
  selectTimezone,
  selectTimeSlotsArray,
  selectAvailableTimeSlots,
  selectTimeSlotsLoading,
  selectTimeSlotsError,
} from '@app/store/slices/bookingSlice';
import type { TimeSlot } from '@app/features/Booking';
import { useAppColorScheme } from '@app/hooks/useAppColorScheme';
import type { BookingStackParamList } from '@app/navigation/types';
import { Icon } from '@app/components';

type TimeSlotsScreenNavigationProp = NativeStackNavigationProp<
  BookingStackParamList,
  'TimeSlots'
>;

type TimeSlotsScreenRouteProp = RouteProp<BookingStackParamList, 'TimeSlots'>;

/**
 * Format time to locale string
 * @param isoString - ISO 8601 datetime string
 * @param locale - User locale (e.g., 'en-GB', 'es-ES')
 * @returns Formatted time string (e.g., "09:00" or "9:00 AM")
 */
const formatTime = (isoString: string, locale: string): string => {
  const date = new Date(isoString);
  const use24Hour = locale.startsWith('es') || locale.startsWith('pl'); // Spanish/Polish use 24h

  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24Hour,
  });
};

/**
 * Format date to locale string
 * @param dateString - Date in YYYY-MM-DD format
 * @param locale - User locale
 * @returns Formatted date (e.g., "Monday, 15 December 2025")
 */
const formatDate = (dateString: string, locale: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Get timezone abbreviation
 * @param timezone - IANA timezone (e.g., "Europe/Madrid")
 * @returns Timezone abbreviation (e.g., "CET")
 */
const getTimezoneAbbr = (timezone: string): string => {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short',
  });
  const parts = formatter.formatToParts(date);
  const timeZonePart = parts.find((part) => part.type === 'timeZoneName');
  return timeZonePart?.value || timezone;
};

/**
 * Time Slot Item Props
 */
interface TimeSlotItemProps {
  slot: TimeSlot;
  onPress: (slot: TimeSlot) => void;
  colorScheme: 'light' | 'dark';
  locale: string;
}

/**
 * Individual time slot button
 *
 * EAA Requirements:
 * - Minimum touch target: 48×48 (minHeight="$12")
 * - accessibilityRole="button"
 * - accessibilityLabel describes the time slot
 * - accessibilityHint explains what happens on tap
 */
const TimeSlotItem: React.FC<TimeSlotItemProps> = React.memo(
  ({ slot, onPress, colorScheme, locale }) => {
    const { t } = useTranslation();

    const handlePress = useCallback(() => {
      onPress(slot);
    }, [slot, onPress]);

    const startTime = formatTime(slot.startTime, locale);
    const endTime = formatTime(slot.endTime, locale);
    const timeRange = `${startTime} - ${endTime}`;

    return (
      <Pressable
        onPress={handlePress}
        bg={colorScheme === 'dark' ? '$coolGray800' : '$white'}
        borderRadius="$lg"
        minHeight="$12" // 48pt minimum for EAA compliance
        px="$4"
        py="$3"
        mb="$3"
        borderWidth={1}
        borderColor={colorScheme === 'dark' ? '$coolGray700' : '$coolGray200'}
        accessibilityRole="button"
        accessibilityLabel={t('booking.timeSlots.slotLabel', { time: timeRange })}
        accessibilityHint={t('booking.timeSlots.slotHint')}
        testID={`time-slot-${slot.startTime}`}
        sx={{
          ':active': {
            borderColor: '$blue500',
            opacity: 0.7,
          },
        }}
      >
        <Text
          fontSize="$md"
          fontWeight="$semibold"
          color={colorScheme === 'dark' ? '$white' : '$black'}
          textAlign="center"
        >
          {timeRange}
        </Text>
      </Pressable>
    );
  },
);

TimeSlotItem.displayName = 'TimeSlotItem';

/**
 * Time Slots Screen
 *
 * Third screen in booking flow. Users select a time slot from available options.
 *
 * Navigation flow:
 * - Receives duration and date from CalendarPickerScreen via route params
 * - On slot selection → MeetingDetailsScreen
 * - On Back → CalendarPickerScreen
 *
 * State management:
 * - Fetches time slots from API on mount
 * - Selected slot stored in Redux
 * - Only available slots shown to user
 *
 * Time formatting:
 * - 24-hour format for Spanish/Polish locales
 * - 12-hour format for English locales
 * - Timezone displayed at top
 *
 * EAA Requirements:
 * - All slots have 48×48 minimum touch targets
 * - Screen reader accessible labels
 * - Loading/error states announced
 * - Retry button accessible
 */
export const TimeSlotsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<TimeSlotsScreenNavigationProp>();
  const route = useRoute<TimeSlotsScreenRouteProp>();
  const dispatch = useAppDispatch();
  const colorScheme = useAppColorScheme();

  const duration = route.params?.duration;
  const date = route.params?.date;

  const timezone = useAppSelector(selectTimezone);
  const allSlots = useAppSelector(selectTimeSlotsArray);
  const availableSlots = useAppSelector(selectAvailableTimeSlots);
  const loading = useAppSelector(selectTimeSlotsLoading);
  const error = useAppSelector(selectTimeSlotsError);

  const locale = i18n.language;
  const timezoneAbbr = useMemo(() => getTimezoneAbbr(timezone), [timezone]);
  const formattedDate = useMemo(() => formatDate(date, locale), [date, locale]);

  /**
   * Fetch time slots on mount
   */
  useEffect(() => {
    if (duration && date) {
      dispatch(fetchTimeSlots({ duration, date }));
    }
  }, [dispatch, duration, date]);

  /**
   * Handle time slot selection
   */
  const handleSlotSelect = useCallback(
    (slot: TimeSlot) => {
      // Store in Redux
      dispatch(setTimeSlot(slot));

      // Navigate to meeting details
      navigation.navigate('MeetingDetails');
    },
    [dispatch, navigation],
  );

  /**
   * Handle retry
   */
  const handleRetry = useCallback(() => {
    if (duration && date) {
      dispatch(fetchTimeSlots({ duration, date }));
    }
  }, [dispatch, duration, date]);

  /**
   * Render time slot item
   */
  const renderSlot: ListRenderItem<TimeSlot> = useCallback(
    ({ item }) => (
      <TimeSlotItem
        slot={item}
        onPress={handleSlotSelect}
        colorScheme={colorScheme}
        locale={locale}
      />
    ),
    [handleSlotSelect, colorScheme, locale],
  );

  /**
   * Key extractor
   */
  const keyExtractor = useCallback((item: TimeSlot) => item.startTime, []);

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <Box
        flex={1}
        bg={colorScheme === 'dark' ? '$black' : '$coolGray50'}
        alignItems="center"
        justifyContent="center"
      >
        <ActivityIndicator size="large" color="#3B82F6" testID="time-slots-loading" />
        <Text
          mt="$4"
          fontSize="$md"
          color={colorScheme === 'dark' ? '$white' : '$black'}
          accessibilityLiveRegion="polite"
          testID="time-slots-loading-text"
        >
          {t('booking.timeSlots.loading')}
        </Text>
      </Box>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <Box
        flex={1}
        bg={colorScheme === 'dark' ? '$black' : '$coolGray50'}
        alignItems="center"
        justifyContent="center"
        px="$4"
      >
        <Icon
          name="alert-circle"
          size={48}
          color={colorScheme === 'dark' ? '#EF4444' : '#DC2626'}
          testID="time-slots-error-icon"
        />
        <Text
          mt="$4"
          fontSize="$lg"
          fontWeight="$semibold"
          color={colorScheme === 'dark' ? '$white' : '$black'}
          textAlign="center"
          testID="time-slots-error-title"
        >
          {t('booking.timeSlots.errorTitle')}
        </Text>
        <Text
          mt="$2"
          fontSize="$md"
          color="$coolGray500"
          textAlign="center"
          testID="time-slots-error-message"
        >
          {error}
        </Text>
        <Pressable
          onPress={handleRetry}
          bg="$blue500"
          borderRadius="$lg"
          minHeight="$12"
          px="$6"
          py="$3"
          mt="$6"
          accessibilityRole="button"
          accessibilityLabel={t('booking.timeSlots.retryButton')}
          accessibilityHint={t('booking.timeSlots.retryHint')}
          testID="time-slots-retry-button"
          sx={{
            ':active': {
              opacity: 0.7,
            },
          }}
        >
          <Text fontSize="$md" fontWeight="$semibold" color="$white">
            {t('common.retry')}
          </Text>
        </Pressable>
      </Box>
    );
  }

  /**
   * Render empty state (no available slots)
   */
  if (availableSlots.length === 0) {
    return (
      <Box
        flex={1}
        bg={colorScheme === 'dark' ? '$black' : '$coolGray50'}
        alignItems="center"
        justifyContent="center"
        px="$4"
      >
        <Icon
          name="time"
          size={48}
          color={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'}
          testID="time-slots-empty-icon"
        />
        <Text
          mt="$4"
          fontSize="$lg"
          fontWeight="$semibold"
          color={colorScheme === 'dark' ? '$white' : '$black'}
          textAlign="center"
          testID="time-slots-empty-title"
        >
          {t('booking.timeSlots.emptyTitle')}
        </Text>
        <Text
          mt="$2"
          fontSize="$md"
          color="$coolGray500"
          textAlign="center"
          testID="time-slots-empty-message"
        >
          {t('booking.timeSlots.emptyMessage')}
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          bg="$blue500"
          borderRadius="$lg"
          minHeight="$12"
          px="$6"
          py="$3"
          mt="$6"
          accessibilityRole="button"
          accessibilityLabel={t('booking.timeSlots.backButton')}
          accessibilityHint={t('booking.timeSlots.backHint')}
          testID="time-slots-back-button"
          sx={{
            ':active': {
              opacity: 0.7,
            },
          }}
        >
          <Text fontSize="$md" fontWeight="$semibold" color="$white">
            {t('booking.timeSlots.chooseAnotherDate')}
          </Text>
        </Pressable>
      </Box>
    );
  }

  return (
    <Box flex={1} bg={colorScheme === 'dark' ? '$black' : '$coolGray50'}>
      <Box px="$4" py="$6">
        {/* Section Header */}
        <Text
          fontSize="$xs"
          fontWeight="$semibold"
          color="$coolGray500"
          textTransform="uppercase"
          letterSpacing="$sm"
          mb="$2"
          testID="time-slots-section-header"
        >
          {t('booking.timeSlots.sectionHeader')}
        </Text>

        {/* Date Display */}
        <Text
          fontSize="$lg"
          fontWeight="$semibold"
          color={colorScheme === 'dark' ? '$white' : '$black'}
          mb="$1"
          testID="time-slots-date"
        >
          {formattedDate}
        </Text>

        {/* Timezone Display */}
        <Text
          fontSize="$sm"
          color="$coolGray500"
          mb="$4"
          testID="time-slots-timezone"
        >
          {t('booking.timeSlots.timezone', { timezone, abbr: timezoneAbbr })}
        </Text>

        {/* Time Slots List */}
        <FlatList
          data={availableSlots}
          renderItem={renderSlot}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          testID="time-slots-list"
          accessibilityLabel={t('booking.timeSlots.listAccessibilityLabel', {
            count: availableSlots.length,
          })}
        />
      </Box>
    </Box>
  );
};
```

---

## RNTL Tests

```typescript
// src/features/Booking/__tests__/TimeSlotsScreen.rntl.tsx

import React from 'react';
import { renderWithProviders } from '@app/test-utils/renderWithProviders';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { TimeSlotsScreen } from '../TimeSlotsScreen';
import { bookingApiClient } from '@app/features/Booking';
import type { TimeSlot } from '@app/features/Booking';

// Mock API client
jest.mock('@app/features/Booking', () => ({
  ...jest.requireActual('@app/features/Booking'),
  bookingApiClient: {
    getTimeSlots: jest.fn(),
  },
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: { duration: 30, date: '2025-12-15' },
  }),
}));

describe('TimeSlotsScreen', () => {
  const mockSlots: TimeSlot[] = [
    {
      startTime: '2025-12-15T09:00:00Z',
      endTime: '2025-12-15T09:30:00Z',
      available: true,
    },
    {
      startTime: '2025-12-15T09:30:00Z',
      endTime: '2025-12-15T10:00:00Z',
      available: true,
    },
    {
      startTime: '2025-12-15T10:00:00Z',
      endTime: '2025-12-15T10:30:00Z',
      available: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (bookingApiClient.getTimeSlots as jest.Mock).mockReturnValue(
      new Promise(() => {}), // Never resolves
    );

    renderWithProviders(<TimeSlotsScreen />);

    expect(screen.getByTestId('time-slots-loading')).toBeOnTheScreen();
    expect(screen.getByTestId('time-slots-loading-text')).toHaveTextContent(
      'Loading available time slots...',
    );
  });

  it('fetches time slots on mount', async () => {
    (bookingApiClient.getTimeSlots as jest.Mock).mockResolvedValue({
      timeSlots: mockSlots,
      timezone: 'Europe/Madrid',
    });

    renderWithProviders(<TimeSlotsScreen />);

    await waitFor(() => {
      expect(bookingApiClient.getTimeSlots).toHaveBeenCalledWith({
        duration: 30,
        date: '2025-12-15',
        timezone: expect.any(String),
      });
    });
  });

  it('displays time slots after loading', async () => {
    (bookingApiClient.getTimeSlots as jest.Mock).mockResolvedValue({
      timeSlots: mockSlots,
      timezone: 'Europe/Madrid',
    });

    renderWithProviders(<TimeSlotsScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('time-slots-list')).toBeOnTheScreen();
    });
  });

  it('displays only available time slots', async () => {
    (bookingApiClient.getTimeSlots as jest.Mock).mockResolvedValue({
      timeSlots: mockSlots,
      timezone: 'Europe/Madrid',
    });

    renderWithProviders(<TimeSlotsScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('time-slot-2025-12-15T09:00:00Z')).toBeOnTheScreen();
      expect(screen.getByTestId('time-slot-2025-12-15T09:30:00Z')).toBeOnTheScreen();
      expect(
        screen.queryByTestId('time-slot-2025-12-15T10:00:00Z'),
      ).not.toBeOnTheScreen();
    });
  });

  it('displays formatted date', async () => {
    (bookingApiClient.getTimeSlots as jest.Mock).mockResolvedValue({
      timeSlots: mockSlots,
      timezone: 'Europe/Madrid',
    });

    renderWithProviders(<TimeSlotsScreen />);

    await waitFor(() => {
      const dateElement = screen.getByTestId('time-slots-date');
      expect(dateElement).toHaveTextContent(/December 2025/);
    });
  });

  it('displays timezone information', async () => {
    (bookingApiClient.getTimeSlots as jest.Mock).mockResolvedValue({
      timeSlots: mockSlots,
      timezone: 'Europe/Madrid',
    });

    renderWithProviders(<TimeSlotsScreen />);

    await waitFor(() => {
      const timezoneElement = screen.getByTestId('time-slots-timezone');
      expect(timezoneElement).toHaveTextContent(/Europe\/Madrid/);
    });
  });

  it('formats time in 24-hour format for Spanish locale', async () => {
    (bookingApiClient.getTimeSlots as jest.Mock).mockResolvedValue({
      timeSlots: mockSlots,
      timezone: 'Europe/Madrid',
    });

    renderWithProviders(<TimeSlotsScreen />, { locale: 'es' });

    await waitFor(() => {
      const slot = screen.getByTestId('time-slot-2025-12-15T09:00:00Z');
      expect(slot).toHaveTextContent(/09:00/);
    });
  });

  it('formats time in 12-hour format for English locale', async () => {
    (bookingApiClient.getTimeSlots as jest.Mock).mockResolvedValue({
      timeSlots: mockSlots,
      timezone: 'Europe/Madrid',
    });

    renderWithProviders(<TimeSlotsScreen />, { locale: 'en-GB' });

    await waitFor(() => {
      const slot = screen.getByTestId('time-slot-2025-12-15T09:00:00Z');
      expect(slot).toHaveTextContent(/AM/);
    });
  });

  it('navigates to meeting details when slot selected', async () => {
    (bookingApiClient.getTimeSlots as jest.Mock).mockResolvedValue({
      timeSlots: mockSlots,
      timezone: 'Europe/Madrid',
    });

    renderWithProviders(<TimeSlotsScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('time-slot-2025-12-15T09:00:00Z')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('time-slot-2025-12-15T09:00:00Z'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('MeetingDetails');
    });
  });

  it('updates Redux when slot selected', async () => {
    (bookingApiClient.getTimeSlots as jest.Mock).mockResolvedValue({
      timeSlots: mockSlots,
      timezone: 'Europe/Madrid',
    });

    const { store } = renderWithProviders(<TimeSlotsScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('time-slot-2025-12-15T09:00:00Z')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('time-slot-2025-12-15T09:00:00Z'));

    await waitFor(() => {
      const state = store.getState();
      expect(state.booking.form.selectedSlot).toEqual(mockSlots[0]);
    });
  });

  describe('error state', () => {
    it('displays error message when fetch fails', async () => {
      (bookingApiClient.getTimeSlots as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );

      renderWithProviders(<TimeSlotsScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('time-slots-error-icon')).toBeOnTheScreen();
        expect(screen.getByTestId('time-slots-error-title')).toHaveTextContent(
          'Unable to Load Time Slots',
        );
        expect(screen.getByTestId('time-slots-error-message')).toBeOnTheScreen();
      });
    });

    it('shows retry button in error state', async () => {
      (bookingApiClient.getTimeSlots as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );

      renderWithProviders(<TimeSlotsScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('time-slots-retry-button')).toBeOnTheScreen();
      });
    });

    it('retries fetch when retry button pressed', async () => {
      (bookingApiClient.getTimeSlots as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ timeSlots: mockSlots, timezone: 'Europe/Madrid' });

      renderWithProviders(<TimeSlotsScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('time-slots-retry-button')).toBeOnTheScreen();
      });

      fireEvent.press(screen.getByTestId('time-slots-retry-button'));

      await waitFor(() => {
        expect(bookingApiClient.getTimeSlots).toHaveBeenCalledTimes(2);
        expect(screen.getByTestId('time-slots-list')).toBeOnTheScreen();
      });
    });
  });

  describe('empty state', () => {
    it('displays empty state when no slots available', async () => {
      (bookingApiClient.getTimeSlots as jest.Mock).mockResolvedValue({
        timeSlots: [],
        timezone: 'Europe/Madrid',
      });

      renderWithProviders(<TimeSlotsScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('time-slots-empty-icon')).toBeOnTheScreen();
        expect(screen.getByTestId('time-slots-empty-title')).toHaveTextContent(
          'No Available Time Slots',
        );
        expect(screen.getByTestId('time-slots-empty-message')).toBeOnTheScreen();
      });
    });

    it('shows back button in empty state', async () => {
      (bookingApiClient.getTimeSlots as jest.Mock).mockResolvedValue({
        timeSlots: [],
        timezone: 'Europe/Madrid',
      });

      renderWithProviders(<TimeSlotsScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('time-slots-back-button')).toBeOnTheScreen();
      });
    });

    it('navigates back when back button pressed', async () => {
      (bookingApiClient.getTimeSlots as jest.Mock).mockResolvedValue({
        timeSlots: [],
        timezone: 'Europe/Madrid',
      });

      renderWithProviders(<TimeSlotsScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('time-slots-back-button')).toBeOnTheScreen();
      });

      fireEvent.press(screen.getByTestId('time-slots-back-button'));

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('dark mode', () => {
    it('renders correctly in dark mode', async () => {
      (bookingApiClient.getTimeSlots as jest.Mock).mockResolvedValue({
        timeSlots: mockSlots,
        timezone: 'Europe/Madrid',
      });

      renderWithProviders(<TimeSlotsScreen />, { colorScheme: 'dark' });

      await waitFor(() => {
        expect(screen.getByTestId('time-slots-list')).toBeOnTheScreen();
      });
    });
  });

  describe('accessibility', () => {
    it('has accessible time slot buttons', async () => {
      (bookingApiClient.getTimeSlots as jest.Mock).mockResolvedValue({
        timeSlots: mockSlots,
        timezone: 'Europe/Madrid',
      });

      renderWithProviders(<TimeSlotsScreen />);

      await waitFor(() => {
        const slot = screen.getByTestId('time-slot-2025-12-15T09:00:00Z');
        expect(slot).toHaveAccessibilityRole('button');
      });
    });

    it('announces loading state to screen readers', () => {
      (bookingApiClient.getTimeSlots as jest.Mock).mockReturnValue(
        new Promise(() => {}),
      );

      renderWithProviders(<TimeSlotsScreen />);

      const loadingText = screen.getByTestId('time-slots-loading-text');
      expect(loadingText.props.accessibilityLiveRegion).toBe('polite');
    });
  });
});
```

---

## Storybook Stories

```typescript
// src/features/Booking/TimeSlotsScreen.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { TimeSlotsScreen } from './TimeSlotsScreen';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from '@app/store/slices/bookingSlice';

const meta: Meta<typeof TimeSlotsScreen> = {
  title: 'Booking/TimeSlotsScreen',
  component: TimeSlotsScreen,
  decorators: [
    (Story, context) => {
      const store = configureStore({
        reducer: {
          booking: bookingReducer,
        },
        preloadedState: context.parameters.preloadedState,
      });

      return (
        <Provider store={store}>
          <NavigationContainer>
            <Story />
          </NavigationContainer>
        </Provider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof TimeSlotsScreen>;

/**
 * Loading state
 */
export const Loading: Story = {
  parameters: {
    preloadedState: {
      booking: {
        form: {
          duration: 30,
          date: '2025-12-15',
          selectedSlot: null,
          meetingType: null,
          title: '',
          description: '',
          timezone: 'Europe/Madrid',
        },
        availableDates: {
          dates: ['2025-12-15'],
          loading: false,
          error: null,
          month: '2025-12',
        },
        timeSlots: { slots: [], loading: true, error: null, loadedDate: null },
        creation: { loading: false, error: null, result: null },
      },
    },
  },
};

/**
 * Success state with available slots
 */
export const WithAvailableSlots: Story = {
  parameters: {
    preloadedState: {
      booking: {
        form: {
          duration: 30,
          date: '2025-12-15',
          selectedSlot: null,
          meetingType: null,
          title: '',
          description: '',
          timezone: 'Europe/Madrid',
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
            {
              startTime: '2025-12-15T09:30:00Z',
              endTime: '2025-12-15T10:00:00Z',
              available: true,
            },
            {
              startTime: '2025-12-15T10:00:00Z',
              endTime: '2025-12-15T10:30:00Z',
              available: true,
            },
            {
              startTime: '2025-12-15T14:00:00Z',
              endTime: '2025-12-15T14:30:00Z',
              available: true,
            },
            {
              startTime: '2025-12-15T15:00:00Z',
              endTime: '2025-12-15T15:30:00Z',
              available: true,
            },
          ],
          loading: false,
          error: null,
          loadedDate: '2025-12-15',
        },
        creation: { loading: false, error: null, result: null },
      },
    },
  },
};

/**
 * Error state
 */
export const Error: Story = {
  parameters: {
    preloadedState: {
      booking: {
        form: {
          duration: 30,
          date: '2025-12-15',
          selectedSlot: null,
          meetingType: null,
          title: '',
          description: '',
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
          error: 'Failed to fetch time slots. Please try again.',
          loadedDate: null,
        },
        creation: { loading: false, error: null, result: null },
      },
    },
  },
};

/**
 * Empty state (no available slots)
 */
export const Empty: Story = {
  parameters: {
    preloadedState: {
      booking: {
        form: {
          duration: 30,
          date: '2025-12-15',
          selectedSlot: null,
          meetingType: null,
          title: '',
          description: '',
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
        creation: { loading: false, error: null, result: null },
      },
    },
  },
};

/**
 * Dark mode
 */
export const DarkMode: Story = {
  parameters: {
    preloadedState: {
      booking: {
        form: {
          duration: 45,
          date: '2025-12-15',
          selectedSlot: null,
          meetingType: null,
          title: '',
          description: '',
          timezone: 'Europe/Madrid',
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
              endTime: '2025-12-15T09:45:00Z',
              available: true,
            },
            {
              startTime: '2025-12-15T10:00:00Z',
              endTime: '2025-12-15T10:45:00Z',
              available: true,
            },
          ],
          loading: false,
          error: null,
          loadedDate: '2025-12-15',
        },
        creation: { loading: false, error: null, result: null },
      },
    },
    backgrounds: { default: 'dark' },
  },
};
```

---

## i18n Keys

Add to `src/i18n/locales/en.json`:

```json
{
  "booking": {
    "timeSlots": {
      "sectionHeader": "Available time slots",
      "timezone": "Timezone: {{timezone}} ({{abbr}})",
      "loading": "Loading available time slots...",
      "errorTitle": "Unable to Load Time Slots",
      "emptyTitle": "No Available Time Slots",
      "emptyMessage": "There are no available time slots for this date. Please choose another date.",
      "retryButton": "Retry",
      "retryHint": "Try loading time slots again",
      "backButton": "Choose another date",
      "backHint": "Return to calendar to select a different date",
      "chooseAnotherDate": "Choose Another Date",
      "slotLabel": "Time slot {{time}}",
      "slotHint": "Select this time slot for your meeting",
      "listAccessibilityLabel": "{{count}} available time slots"
    }
  }
}
```

---

## Testing Checklist

- [ ] Loading state displays spinner and message
- [ ] API called on mount with correct params
- [ ] Time slots list displays after loading
- [ ] Only available slots displayed
- [ ] Formatted date displayed correctly
- [ ] Timezone information displayed
- [ ] Time formatted correctly for locale (24h vs 12h)
- [ ] Navigation occurs when slot selected
- [ ] Redux updated when slot selected
- [ ] Error state displays message and retry button
- [ ] Retry button refetches slots
- [ ] Empty state displays when no slots available
- [ ] Back button navigates back in empty state
- [ ] Dark mode renders correctly
- [ ] Accessibility props correct
- [ ] RNTL tests achieve 100% coverage
- [ ] Storybook stories render in all states
- [ ] `yarn validate` passes

---

## Notes

- Time format based on device locale (24h for es/pl, 12h for en)
- Only available slots shown (filtered in Redux selector)
- Timezone displayed with abbreviation (CET, GMT, etc.)
- Slot intervals match selected duration
- Empty state includes back button to choose another date
- Date formatted using Intl.DateTimeFormat for locale support
