# TASK-350: Calendar Picker Screen (+ RNTL + Storybook)

**Status**: 📋 To Do
**Effort**: 4h
**Priority**: High
**Dependencies**: TASK-349 (Duration Selection Screen)
**Parent**: [US-063: Booking Flow UI](../user-stories/US-063-booking-flow-ui.md)

---

## Overview

Build the calendar picker screen where users select a date for their meeting. The screen displays a monthly calendar view with available dates highlighted and unavailable dates greyed out. It fetches available dates from the API based on the selected duration.

The calendar follows iOS design patterns with proper EAA accessibility and full RNTL test coverage. This is the second screen in the booking flow.

---

## Acceptance Criteria

- ✅ Monthly calendar view with week headers (Mon-Sun)
- ✅ Available dates highlighted (blue), unavailable dates greyed out
- ✅ Today's date marked with special indicator
- ✅ Month navigation (previous/next arrows)
- ✅ Fetch available dates from API on mount
- ✅ Loading state while fetching dates
- ✅ Error state with retry button
- ✅ Redux integration (dispatch setDate action)
- ✅ Navigation to Time Slots screen on date selection
- ✅ EAA compliance (WCAG 2.1 Level AA)
- ✅ RNTL tests achieve 100% coverage
- ✅ Storybook stories (loading, success, error, empty, dark mode)
- ✅ All validation passes (`yarn validate`)

---

## Screen Mockup

```
┌─────────────────────────────────────────────┐
│  < Back         Select Date          [i]    │ ← Header
├─────────────────────────────────────────────┤
│                                             │
│  CHOOSE YOUR DATE                           │ ← Section header (uppercase)
│                                             │
│  30 minute meeting                          │ ← Selected duration reminder
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  ◀  December 2025  ▶                │   │ ← Month selector
│  ├─────────────────────────────────────┤   │
│  │ Mon Tue Wed Thu Fri Sat Sun         │   │ ← Week headers
│  ├─────────────────────────────────────┤   │
│  │      1   2   3   4   5   6   7      │   │
│  │  8   9  10  11  12  13  14          │   │
│  │ 15 [16] 17  18  19  20  21          │   │ ← [16] = today
│  │ 22  23  24  25  26  27  28          │   │
│  │ 29  30  31                          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Legend:                                    │
│  ● Available   ○ Unavailable   [] Today    │
│                                             │
└─────────────────────────────────────────────┘

States:
- Blue background = available (tappable)
- Grey background = unavailable (not tappable)
- Border = today's date
- Bold = selected date (navigates on tap)
```

---

## Calendar Component Selection

**Decision**: Use `react-native-calendars` library

**Reasoning**:

- Most popular calendar library for React Native (10k+ stars)
- Supports marking specific dates (available/unavailable)
- Highly customisable theming
- EAA accessible with proper props
- Used by Airbnb, Wix, and other production apps
- Active maintenance and good documentation

**Installation**:

```bash
yarn add react-native-calendars
```

**Alternative considered**: `react-native-calendar-picker`

- Less customisable theming
- Smaller community
- Fewer accessibility features

---

## Component Implementation

```typescript
// src/features/Booking/CalendarPickerScreen.tsx

import React, { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { Box, Text, ScrollView, Pressable } from '@gluestack-ui/themed';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import {
  setDate,
  fetchAvailableDates,
  selectDuration,
  selectDate,
  selectAvailableDatesArray,
  selectAvailableDatesLoading,
  selectAvailableDatesError,
} from '@app/store/slices/bookingSlice';
import { useAppColorScheme } from '@app/hooks/useAppColorScheme';
import type { BookingStackParamList } from '@app/navigation/types';
import { Icon } from '@app/components';

type CalendarPickerScreenNavigationProp = NativeStackNavigationProp<
  BookingStackParamList,
  'CalendarPicker'
>;

type CalendarPickerScreenRouteProp = RouteProp<BookingStackParamList, 'CalendarPicker'>;

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format month to YYYY-MM
 */
const formatMonth = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Calendar Picker Screen
 *
 * Second screen in booking flow. Users select a date from available options.
 *
 * Navigation flow:
 * - Receives duration from DurationSelectionScreen via route params
 * - On date selection → TimeSlotsScreen
 * - On Back → DurationSelectionScreen
 *
 * State management:
 * - Fetches available dates from API on mount
 * - Selected date stored in Redux
 * - Available dates cached in Redux (per month)
 *
 * EAA Requirements:
 * - Calendar dates have accessible labels
 * - Loading/error states announced to screen readers
 * - Retry button has proper accessibility
 * - Month navigation buttons accessible
 */
export const CalendarPickerScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<CalendarPickerScreenNavigationProp>();
  const route = useRoute<CalendarPickerScreenRouteProp>();
  const dispatch = useAppDispatch();
  const colorScheme = useAppColorScheme();

  // Get duration from route params or Redux
  const durationFromParams = route.params?.duration;
  const durationFromRedux = useAppSelector(selectDuration);
  const duration = durationFromParams || durationFromRedux;

  const selectedDate = useAppSelector(selectDate);
  const availableDates = useAppSelector(selectAvailableDatesArray);
  const loading = useAppSelector(selectAvailableDatesLoading);
  const error = useAppSelector(selectAvailableDatesError);

  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const today = useMemo(() => formatDate(new Date()), []);

  /**
   * Fetch available dates for current month
   */
  const fetchDatesForMonth = useCallback(
    (month: Date) => {
      if (!duration) return;

      dispatch(
        fetchAvailableDates({
          duration,
          month: formatMonth(month),
        }),
      );
    },
    [dispatch, duration],
  );

  /**
   * Load available dates on mount and when month changes
   */
  useEffect(() => {
    fetchDatesForMonth(currentMonth);
  }, [fetchDatesForMonth, currentMonth]);

  /**
   * Handle date selection
   */
  const handleDateSelect = useCallback(
    (day: DateData) => {
      const dateString = day.dateString;

      // Check if date is available
      if (!availableDates.includes(dateString)) {
        return; // Ignore taps on unavailable dates
      }

      // Store selected date in Redux
      dispatch(setDate(dateString));

      // Navigate to time slots screen
      navigation.navigate('TimeSlots', {
        duration: duration!,
        date: dateString,
      });
    },
    [dispatch, navigation, duration, availableDates],
  );

  /**
   * Handle month change
   */
  const handleMonthChange = useCallback((month: DateData) => {
    const newMonth = new Date(month.year, month.month - 1, 1);
    setCurrentMonth(newMonth);
  }, []);

  /**
   * Build marked dates object for react-native-calendars
   */
  const markedDates = useMemo(() => {
    const marked: Record<string, any> = {};

    // Mark available dates
    availableDates.forEach((date) => {
      marked[date] = {
        selected: false,
        marked: true,
        dotColor: colorScheme === 'dark' ? '#3B82F6' : '#2563EB', // $blue500
        customStyles: {
          container: {
            backgroundColor: colorScheme === 'dark' ? '#1E3A8A' : '#DBEAFE',
            borderRadius: 8,
          },
          text: {
            color: colorScheme === 'dark' ? '#FFFFFF' : '#1E40AF',
            fontWeight: '600',
          },
        },
      };
    });

    // Mark today
    if (marked[today]) {
      marked[today].customStyles.container.borderWidth = 2;
      marked[today].customStyles.container.borderColor =
        colorScheme === 'dark' ? '#60A5FA' : '#3B82F6';
    } else {
      marked[today] = {
        selected: false,
        marked: false,
        customStyles: {
          container: {
            borderWidth: 2,
            borderColor: colorScheme === 'dark' ? '#6B7280' : '#9CA3AF',
            borderRadius: 8,
          },
          text: {
            color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
          },
        },
      };
    }

    return marked;
  }, [availableDates, today, colorScheme]);

  /**
   * Calendar theme
   */
  const calendarTheme = useMemo(
    () => ({
      backgroundColor: colorScheme === 'dark' ? '#000000' : '#F9FAFB',
      calendarBackground: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
      textSectionTitleColor: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280',
      selectedDayBackgroundColor: '#3B82F6',
      selectedDayTextColor: '#FFFFFF',
      todayTextColor: '#3B82F6',
      dayTextColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
      textDisabledColor: colorScheme === 'dark' ? '#4B5563' : '#D1D5DB',
      dotColor: '#3B82F6',
      selectedDotColor: '#FFFFFF',
      arrowColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
      monthTextColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
      textDayFontWeight: '400',
      textMonthFontWeight: '600',
      textDayHeaderFontWeight: '600',
      textDayFontSize: 16,
      textMonthFontSize: 18,
      textDayHeaderFontSize: 14,
    }),
    [colorScheme],
  );

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
        <ActivityIndicator size="large" color="#3B82F6" testID="calendar-loading" />
        <Text
          mt="$4"
          fontSize="$md"
          color={colorScheme === 'dark' ? '$white' : '$black'}
          accessibilityLiveRegion="polite"
          testID="calendar-loading-text"
        >
          {t('booking.calendar.loading')}
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
          testID="calendar-error-icon"
        />
        <Text
          mt="$4"
          fontSize="$lg"
          fontWeight="$semibold"
          color={colorScheme === 'dark' ? '$white' : '$black'}
          textAlign="center"
          testID="calendar-error-title"
        >
          {t('booking.calendar.errorTitle')}
        </Text>
        <Text
          mt="$2"
          fontSize="$md"
          color="$coolGray500"
          textAlign="center"
          testID="calendar-error-message"
        >
          {error}
        </Text>
        <Pressable
          onPress={() => fetchDatesForMonth(currentMonth)}
          bg="$blue500"
          borderRadius="$lg"
          minHeight="$12"
          px="$6"
          py="$3"
          mt="$6"
          accessibilityRole="button"
          accessibilityLabel={t('booking.calendar.retryButton')}
          accessibilityHint={t('booking.calendar.retryHint')}
          testID="calendar-retry-button"
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
   * Render empty state (no available dates)
   */
  if (availableDates.length === 0) {
    return (
      <Box
        flex={1}
        bg={colorScheme === 'dark' ? '$black' : '$coolGray50'}
        alignItems="center"
        justifyContent="center"
        px="$4"
      >
        <Icon
          name="calendar"
          size={48}
          color={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'}
          testID="calendar-empty-icon"
        />
        <Text
          mt="$4"
          fontSize="$lg"
          fontWeight="$semibold"
          color={colorScheme === 'dark' ? '$white' : '$black'}
          textAlign="center"
          testID="calendar-empty-title"
        >
          {t('booking.calendar.emptyTitle')}
        </Text>
        <Text
          mt="$2"
          fontSize="$md"
          color="$coolGray500"
          textAlign="center"
          testID="calendar-empty-message"
        >
          {t('booking.calendar.emptyMessage')}
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg={colorScheme === 'dark' ? '$black' : '$coolGray50'}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        testID="calendar-picker-scroll"
      >
        <Box px="$4" py="$6">
          {/* Section Header */}
          <Text
            fontSize="$xs"
            fontWeight="$semibold"
            color="$coolGray500"
            textTransform="uppercase"
            letterSpacing="$sm"
            mb="$2"
            testID="calendar-section-header"
          >
            {t('booking.calendar.sectionHeader')}
          </Text>

          {/* Duration Reminder */}
          <Text
            fontSize="$md"
            color={colorScheme === 'dark' ? '$white' : '$black'}
            mb="$4"
            testID="calendar-duration-reminder"
          >
            {t('booking.calendar.durationReminder', { duration })}
          </Text>

          {/* Calendar */}
          <Box
            bg={colorScheme === 'dark' ? '$coolGray800' : '$white'}
            borderRadius="$lg"
            p="$4"
            testID="calendar-container"
          >
            <Calendar
              current={formatDate(currentMonth)}
              markedDates={markedDates}
              onDayPress={handleDateSelect}
              onMonthChange={handleMonthChange}
              theme={calendarTheme}
              markingType="custom"
              enableSwipeMonths
              accessibilityLabel={t('booking.calendar.accessibilityLabel')}
              testID="calendar-component"
            />
          </Box>

          {/* Legend */}
          <Box mt="$6" testID="calendar-legend">
            <Text
              fontSize="$xs"
              fontWeight="$semibold"
              color="$coolGray500"
              textTransform="uppercase"
              letterSpacing="$sm"
              mb="$3"
            >
              {t('booking.calendar.legend')}
            </Text>
            <Box flexDirection="row" alignItems="center" mb="$2">
              <Box
                width={24}
                height={24}
                bg={colorScheme === 'dark' ? '$blue900' : '$blue100'}
                borderRadius="$sm"
                mr="$2"
              />
              <Text
                fontSize="$sm"
                color={colorScheme === 'dark' ? '$white' : '$black'}
              >
                {t('booking.calendar.legendAvailable')}
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center" mb="$2">
              <Box
                width={24}
                height={24}
                bg={colorScheme === 'dark' ? '$coolGray700' : '$coolGray200'}
                borderRadius="$sm"
                mr="$2"
              />
              <Text
                fontSize="$sm"
                color={colorScheme === 'dark' ? '$white' : '$black'}
              >
                {t('booking.calendar.legendUnavailable')}
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center">
              <Box
                width={24}
                height={24}
                borderWidth={2}
                borderColor={colorScheme === 'dark' ? '$coolGray600' : '$coolGray400'}
                borderRadius="$sm"
                mr="$2"
              />
              <Text
                fontSize="$sm"
                color={colorScheme === 'dark' ? '$white' : '$black'}
              >
                {t('booking.calendar.legendToday')}
              </Text>
            </Box>
          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
};
```

---

## RNTL Tests

```typescript
// src/features/Booking/__tests__/CalendarPickerScreen.rntl.tsx

import React from 'react';
import { renderWithProviders } from '@app/test-utils/renderWithProviders';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { CalendarPickerScreen } from '../CalendarPickerScreen';
import { bookingApiClient } from '@app/features/Booking';

// Mock API client
jest.mock('@app/features/Booking', () => ({
  ...jest.requireActual('@app/features/Booking'),
  bookingApiClient: {
    getAvailableDates: jest.fn(),
  },
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    params: { duration: 30 },
  }),
}));

describe('CalendarPickerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (bookingApiClient.getAvailableDates as jest.Mock).mockReturnValue(
      new Promise(() => {}), // Never resolves
    );

    renderWithProviders(<CalendarPickerScreen />);

    expect(screen.getByTestId('calendar-loading')).toBeOnTheScreen();
    expect(screen.getByTestId('calendar-loading-text')).toHaveTextContent(
      'Loading available dates...',
    );
  });

  it('fetches available dates on mount', async () => {
    (bookingApiClient.getAvailableDates as jest.Mock).mockResolvedValue({
      availableDates: ['2025-12-15', '2025-12-16'],
    });

    renderWithProviders(<CalendarPickerScreen />);

    await waitFor(() => {
      expect(bookingApiClient.getAvailableDates).toHaveBeenCalledWith({
        duration: 30,
        month: expect.stringMatching(/^\d{4}-\d{2}$/),
        timezone: expect.any(String),
      });
    });
  });

  it('displays calendar after loading', async () => {
    (bookingApiClient.getAvailableDates as jest.Mock).mockResolvedValue({
      availableDates: ['2025-12-15', '2025-12-16'],
    });

    renderWithProviders(<CalendarPickerScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('calendar-component')).toBeOnTheScreen();
    });
  });

  it('displays duration reminder', async () => {
    (bookingApiClient.getAvailableDates as jest.Mock).mockResolvedValue({
      availableDates: ['2025-12-15'],
    });

    renderWithProviders(<CalendarPickerScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('calendar-duration-reminder')).toHaveTextContent(
        '30 minute meeting',
      );
    });
  });

  it('displays legend', async () => {
    (bookingApiClient.getAvailableDates as jest.Mock).mockResolvedValue({
      availableDates: ['2025-12-15'],
    });

    renderWithProviders(<CalendarPickerScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('calendar-legend')).toBeOnTheScreen();
    });
  });

  it('navigates to time slots when available date selected', async () => {
    (bookingApiClient.getAvailableDates as jest.Mock).mockResolvedValue({
      availableDates: ['2025-12-15', '2025-12-16'],
    });

    renderWithProviders(<CalendarPickerScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('calendar-component')).toBeOnTheScreen();
    });

    // Simulate date selection
    const calendar = screen.getByTestId('calendar-component');
    fireEvent(calendar, 'onDayPress', { dateString: '2025-12-15' });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('TimeSlots', {
        duration: 30,
        date: '2025-12-15',
      });
    });
  });

  it('does not navigate when unavailable date selected', async () => {
    (bookingApiClient.getAvailableDates as jest.Mock).mockResolvedValue({
      availableDates: ['2025-12-15'],
    });

    renderWithProviders(<CalendarPickerScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('calendar-component')).toBeOnTheScreen();
    });

    // Try to select unavailable date
    const calendar = screen.getByTestId('calendar-component');
    fireEvent(calendar, 'onDayPress', { dateString: '2025-12-20' });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('updates Redux when date selected', async () => {
    (bookingApiClient.getAvailableDates as jest.Mock).mockResolvedValue({
      availableDates: ['2025-12-15'],
    });

    const { store } = renderWithProviders(<CalendarPickerScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('calendar-component')).toBeOnTheScreen();
    });

    const calendar = screen.getByTestId('calendar-component');
    fireEvent(calendar, 'onDayPress', { dateString: '2025-12-15' });

    await waitFor(() => {
      expect(store.getState().booking.form.date).toBe('2025-12-15');
    });
  });

  it('fetches new dates when month changes', async () => {
    (bookingApiClient.getAvailableDates as jest.Mock).mockResolvedValue({
      availableDates: ['2025-12-15'],
    });

    renderWithProviders(<CalendarPickerScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('calendar-component')).toBeOnTheScreen();
    });

    // Change month
    const calendar = screen.getByTestId('calendar-component');
    fireEvent(calendar, 'onMonthChange', { year: 2026, month: 1 });

    await waitFor(() => {
      expect(bookingApiClient.getAvailableDates).toHaveBeenCalledWith({
        duration: 30,
        month: '2026-01',
        timezone: expect.any(String),
      });
    });
  });

  describe('error state', () => {
    it('displays error message when fetch fails', async () => {
      (bookingApiClient.getAvailableDates as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );

      renderWithProviders(<CalendarPickerScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('calendar-error-icon')).toBeOnTheScreen();
        expect(screen.getByTestId('calendar-error-title')).toHaveTextContent(
          'Unable to Load Dates',
        );
        expect(screen.getByTestId('calendar-error-message')).toBeOnTheScreen();
      });
    });

    it('shows retry button in error state', async () => {
      (bookingApiClient.getAvailableDates as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );

      renderWithProviders(<CalendarPickerScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('calendar-retry-button')).toBeOnTheScreen();
      });
    });

    it('retries fetch when retry button pressed', async () => {
      (bookingApiClient.getAvailableDates as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ availableDates: ['2025-12-15'] });

      renderWithProviders(<CalendarPickerScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('calendar-retry-button')).toBeOnTheScreen();
      });

      fireEvent.press(screen.getByTestId('calendar-retry-button'));

      await waitFor(() => {
        expect(bookingApiClient.getAvailableDates).toHaveBeenCalledTimes(2);
        expect(screen.getByTestId('calendar-component')).toBeOnTheScreen();
      });
    });
  });

  describe('empty state', () => {
    it('displays empty state when no dates available', async () => {
      (bookingApiClient.getAvailableDates as jest.Mock).mockResolvedValue({
        availableDates: [],
      });

      renderWithProviders(<CalendarPickerScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('calendar-empty-icon')).toBeOnTheScreen();
        expect(screen.getByTestId('calendar-empty-title')).toHaveTextContent(
          'No Available Dates',
        );
        expect(screen.getByTestId('calendar-empty-message')).toBeOnTheScreen();
      });
    });
  });

  describe('dark mode', () => {
    it('renders correctly in dark mode', async () => {
      (bookingApiClient.getAvailableDates as jest.Mock).mockResolvedValue({
        availableDates: ['2025-12-15'],
      });

      renderWithProviders(<CalendarPickerScreen />, { colorScheme: 'dark' });

      await waitFor(() => {
        expect(screen.getByTestId('calendar-component')).toBeOnTheScreen();
      });
    });
  });

  describe('accessibility', () => {
    it('has accessible retry button', async () => {
      (bookingApiClient.getAvailableDates as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );

      renderWithProviders(<CalendarPickerScreen />);

      await waitFor(() => {
        const retryButton = screen.getByTestId('calendar-retry-button');
        expect(retryButton).toHaveAccessibilityRole('button');
      });
    });

    it('announces loading state to screen readers', () => {
      (bookingApiClient.getAvailableDates as jest.Mock).mockReturnValue(
        new Promise(() => {}),
      );

      renderWithProviders(<CalendarPickerScreen />);

      const loadingText = screen.getByTestId('calendar-loading-text');
      expect(loadingText.props.accessibilityLiveRegion).toBe('polite');
    });
  });
});
```

---

## Storybook Stories

```typescript
// src/features/Booking/CalendarPickerScreen.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { CalendarPickerScreen } from './CalendarPickerScreen';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from '@app/store/slices/bookingSlice';

const meta: Meta<typeof CalendarPickerScreen> = {
  title: 'Booking/CalendarPickerScreen',
  component: CalendarPickerScreen,
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

type Story = StoryObj<typeof CalendarPickerScreen>;

/**
 * Loading state
 */
export const Loading: Story = {
  parameters: {
    preloadedState: {
      booking: {
        form: {
          duration: 30,
          date: null,
          selectedSlot: null,
          meetingType: null,
          title: '',
          description: '',
          timezone: 'Europe/Madrid',
        },
        availableDates: { dates: [], loading: true, error: null, month: null },
        timeSlots: { slots: [], loading: false, error: null, loadedDate: null },
        creation: { loading: false, error: null, result: null },
      },
    },
  },
};

/**
 * Success state with available dates
 */
export const WithAvailableDates: Story = {
  parameters: {
    preloadedState: {
      booking: {
        form: {
          duration: 30,
          date: null,
          selectedSlot: null,
          meetingType: null,
          title: '',
          description: '',
          timezone: 'Europe/Madrid',
        },
        availableDates: {
          dates: ['2025-12-15', '2025-12-16', '2025-12-18', '2025-12-22', '2025-12-23'],
          loading: false,
          error: null,
          month: '2025-12',
        },
        timeSlots: { slots: [], loading: false, error: null, loadedDate: null },
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
          error: 'Failed to fetch available dates. Please try again.',
          month: null,
        },
        timeSlots: { slots: [], loading: false, error: null, loadedDate: null },
        creation: { loading: false, error: null, result: null },
      },
    },
  },
};

/**
 * Empty state (no available dates)
 */
export const Empty: Story = {
  parameters: {
    preloadedState: {
      booking: {
        form: {
          duration: 30,
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
          month: '2025-12',
        },
        timeSlots: { slots: [], loading: false, error: null, loadedDate: null },
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
          date: null,
          selectedSlot: null,
          meetingType: null,
          title: '',
          description: '',
          timezone: 'Europe/Madrid',
        },
        availableDates: {
          dates: ['2025-12-15', '2025-12-16', '2025-12-18'],
          loading: false,
          error: null,
          month: '2025-12',
        },
        timeSlots: { slots: [], loading: false, error: null, loadedDate: null },
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
    "calendar": {
      "sectionHeader": "Choose your date",
      "durationReminder": "{{duration}} minute meeting",
      "loading": "Loading available dates...",
      "errorTitle": "Unable to Load Dates",
      "emptyTitle": "No Available Dates",
      "emptyMessage": "There are no available dates for this duration in the selected month. Please try a different month.",
      "retryButton": "Retry",
      "retryHint": "Try loading available dates again",
      "legend": "Legend",
      "legendAvailable": "Available",
      "legendUnavailable": "Unavailable",
      "legendToday": "Today",
      "accessibilityLabel": "Calendar for selecting meeting date"
    }
  },
  "common": {
    "retry": "Retry"
  }
}
```

---

## Testing Checklist

- [ ] Loading state displays spinner and message
- [ ] API called on mount with correct params
- [ ] Calendar displays after loading
- [ ] Duration reminder shows selected duration
- [ ] Legend displays correctly
- [ ] Available dates highlighted correctly
- [ ] Navigation occurs when available date selected
- [ ] Navigation blocked for unavailable dates
- [ ] Redux updated when date selected
- [ ] New dates fetched when month changes
- [ ] Error state displays message and retry button
- [ ] Retry button refetches dates
- [ ] Empty state displays when no dates available
- [ ] Dark mode renders correctly
- [ ] Accessibility props correct
- [ ] RNTL tests achieve 100% coverage
- [ ] Storybook stories render in all states
- [ ] `yarn validate` passes

---

## Notes

- Uses `react-native-calendars` library for calendar UI
- Available dates fetched from API based on duration
- Today's date marked with border, available dates highlighted
- Month navigation triggers new API call
- Redux caches available dates per month
- Unavailable dates not tappable (no visual feedback)
- Calendar theme adapts to dark mode
- Custom marking for today and available dates
