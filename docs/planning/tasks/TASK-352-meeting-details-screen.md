# TASK-352: Meeting Details Screen (+ RNTL + Storybook)

**Status**: 📋 To Do
**Effort**: 4h
**Priority**: High
**Dependencies**: TASK-351 (Time Slots Screen)
**Parent**: [US-063: Booking Flow UI](../user-stories/US-063-booking-flow-ui.md)

---

## Overview

Build the meeting details screen where users provide information about their meeting (type, title, description) and submit the booking. This is the final screen in the booking flow before confirmation.

The screen includes form validation, submit throttling (500ms debounce), honeypot spam prevention, and a summary of all selections. It follows iOS design patterns with proper EAA accessibility and full RNTL test coverage.

---

## Acceptance Criteria

- ✅ Meeting type selector (Phone/Video) with iOS-style buttons
- ✅ Title input field (required, 3-100 characters)
- ✅ Description textarea (optional, max 500 characters)
- ✅ Honeypot field (hidden from users, must be empty)
- ✅ Booking summary display (duration, date, time, timezone)
- ✅ Submit button with loading state
- ✅ Submit throttling (500ms debounce)
- ✅ Form validation with error messages
- ✅ Redux integration (dispatch createBooking action)
- ✅ Navigation to Confirmation screen on success
- ✅ Error handling with retry option
- ✅ EAA compliance (WCAG 2.1 Level AA)
- ✅ RNTL tests achieve 100% coverage
- ✅ Storybook stories (empty, partial, complete, submitting, error, dark mode)
- ✅ All validation passes (`yarn validate`)

---

## Screen Mockup

```
┌─────────────────────────────────────────────┐
│  < Back      Meeting Details        [i]     │ ← Header
├─────────────────────────────────────────────┤
│                                             │
│  MEETING SUMMARY                            │ ← Section header (uppercase)
│                                             │
│  30 minutes                                 │ ← Duration
│  Monday, 15 December 2025                   │ ← Date
│  09:00 - 09:30 (Europe/Madrid)              │ ← Time & timezone
│                                             │
│  ─────────────────────────────────────────  │ ← Divider
│                                             │
│  MEETING TYPE                               │ ← Section header
│                                             │
│  ┌──────────────────┬──────────────────┐   │
│  │  ●  Phone Call   │    Video Call    │   │ ← Type selector (PickerGroup)
│  └──────────────────┴──────────────────┘   │
│                                             │
│  MEETING DETAILS                            │ ← Section header
│                                             │
│  Title *                                    │ ← Label with required indicator
│  ┌─────────────────────────────────────┐   │
│  │ Project consultation                │   │ ← Text input
│  └─────────────────────────────────────┘   │
│                                             │
│  Description (Optional)                     │ ← Label
│  ┌─────────────────────────────────────┐   │
│  │ Discuss requirements for mobile app│   │ ← Textarea
│  │ development...                      │   │
│  └─────────────────────────────────────┘   │
│  0/500 characters                           │ ← Character count
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │        Submit Booking               │   │ ← Submit button (disabled until valid)
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘

States:
- Phone/Video toggle (PickerGroup)
- Title required (error if < 3 chars)
- Description optional (max 500 chars)
- Submit disabled until form valid
- Loading state on submit (spinner + "Submitting...")
- Error banner if submission fails
```

---

## Component Implementation

```typescript
// src/features/Booking/MeetingDetailsScreen.tsx

import React, { useCallback, useState, useMemo, useRef } from 'react';
import { StyleSheet, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import {
  Box,
  Text,
  ScrollView,
  Pressable,
  Input,
  InputField,
  Textarea,
  TextareaInput,
} from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import {
  setMeetingType,
  setTitle,
  setDescription,
  createBooking,
  selectBookingForm,
  selectBookingSummary,
  selectIsFormComplete,
  selectBookingCreationLoading,
  selectBookingCreationError,
  selectBookingResult,
} from '@app/store/slices/bookingSlice';
import type { MeetingType } from '@app/features/Booking';
import { useAppColorScheme } from '@app/hooks/useAppColorScheme';
import type { BookingStackParamList } from '@app/navigation/types';
import { Icon } from '@app/components';

type MeetingDetailsScreenNavigationProp = NativeStackNavigationProp<
  BookingStackParamList,
  'MeetingDetails'
>;

const DESCRIPTION_MAX_LENGTH = 500;
const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 100;

/**
 * Format time to locale string
 */
const formatTime = (isoString: string, locale: string): string => {
  const date = new Date(isoString);
  const use24Hour = locale.startsWith('es') || locale.startsWith('pl');

  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24Hour,
  });
};

/**
 * Format date to locale string
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
 * Meeting Type Selector Props
 */
interface MeetingTypeSelectorProps {
  value: MeetingType | null;
  onChange: (type: MeetingType) => void;
  colorScheme: 'light' | 'dark';
}

/**
 * Meeting Type Selector Component
 *
 * iOS-style segmented control for selecting Phone or Video call
 */
const MeetingTypeSelector: React.FC<MeetingTypeSelectorProps> = React.memo(
  ({ value, onChange, colorScheme }) => {
    const { t } = useTranslation();

    return (
      <Box flexDirection="row" borderRadius="$lg" overflow="hidden" mb="$4">
        {/* Phone Option */}
        <Pressable
          flex={1}
          onPress={() => onChange('phone')}
          bg={value === 'phone' ? '$blue500' : colorScheme === 'dark' ? '$coolGray800' : '$white'}
          minHeight="$12"
          alignItems="center"
          justifyContent="center"
          borderWidth={1}
          borderColor={colorScheme === 'dark' ? '$coolGray700' : '$coolGray200'}
          borderRightWidth={0}
          accessibilityRole="button"
          accessibilityLabel={t('booking.meetingDetails.phoneCallLabel')}
          accessibilityHint={t('booking.meetingDetails.phoneCallHint')}
          accessibilityState={{ selected: value === 'phone' }}
          testID="meeting-type-phone"
          sx={{
            ':active': {
              opacity: 0.7,
            },
          }}
        >
          <Box flexDirection="row" alignItems="center">
            <Icon
              name="call"
              size={20}
              color={value === 'phone' ? 'white' : colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
              style={{ marginRight: 8 }}
            />
            <Text
              fontSize="$md"
              fontWeight={value === 'phone' ? '$semibold' : '$normal'}
              color={value === 'phone' ? '$white' : colorScheme === 'dark' ? '$white' : '$black'}
            >
              {t('booking.meetingDetails.phoneCall')}
            </Text>
          </Box>
        </Pressable>

        {/* Video Option */}
        <Pressable
          flex={1}
          onPress={() => onChange('video')}
          bg={value === 'video' ? '$blue500' : colorScheme === 'dark' ? '$coolGray800' : '$white'}
          minHeight="$12"
          alignItems="center"
          justifyContent="center"
          borderWidth={1}
          borderColor={colorScheme === 'dark' ? '$coolGray700' : '$coolGray200'}
          accessibilityRole="button"
          accessibilityLabel={t('booking.meetingDetails.videoCallLabel')}
          accessibilityHint={t('booking.meetingDetails.videoCallHint')}
          accessibilityState={{ selected: value === 'video' }}
          testID="meeting-type-video"
          sx={{
            ':active': {
              opacity: 0.7,
            },
          }}
        >
          <Box flexDirection="row" alignItems="center">
            <Icon
              name="videocam"
              size={20}
              color={value === 'video' ? 'white' : colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
              style={{ marginRight: 8 }}
            />
            <Text
              fontSize="$md"
              fontWeight={value === 'video' ? '$semibold' : '$normal'}
              color={value === 'video' ? '$white' : colorScheme === 'dark' ? '$white' : '$black'}
            >
              {t('booking.meetingDetails.videoCall')}
            </Text>
          </Box>
        </Pressable>
      </Box>
    );
  },
);

MeetingTypeSelector.displayName = 'MeetingTypeSelector';

/**
 * Meeting Details Screen
 *
 * Fourth and final screen in booking flow. Users provide meeting details
 * and submit the booking.
 *
 * Navigation flow:
 * - On successful submission → BookingConfirmationScreen
 * - On Back → TimeSlotsScreen
 *
 * State management:
 * - Form data stored in Redux
 * - Submission handled via createBooking async thunk
 * - Result stored in Redux for confirmation screen
 *
 * Form validation:
 * - Meeting type required
 * - Title required (3-100 characters)
 * - Description optional (max 500 characters)
 * - Honeypot field must be empty (spam prevention)
 *
 * EAA Requirements:
 * - All inputs have proper labels
 * - Error messages accessible to screen readers
 * - Submit button disabled state conveyed
 * - Form validation errors announced
 */
export const MeetingDetailsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<MeetingDetailsScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const colorScheme = useAppColorScheme();

  const form = useAppSelector(selectBookingForm);
  const summary = useAppSelector(selectBookingSummary);
  const isFormComplete = useAppSelector(selectIsFormComplete);
  const loading = useAppSelector(selectBookingCreationLoading);
  const error = useAppSelector(selectBookingCreationError);
  const result = useAppSelector(selectBookingResult);

  const locale = i18n.language;

  // Local state for form validation errors
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  // Honeypot field (hidden from users, catches bots)
  const [honeypot, setHoneypot] = useState('');

  // Submit throttling
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Format time range for summary
   */
  const formattedTimeRange = useMemo(() => {
    if (!summary) return '';
    const start = formatTime(summary.startTime, locale);
    const end = formatTime(summary.endTime, locale);
    return `${start} - ${end}`;
  }, [summary, locale]);

  /**
   * Format date for summary
   */
  const formattedDate = useMemo(() => {
    if (!summary) return '';
    return formatDate(summary.date, locale);
  }, [summary, locale]);

  /**
   * Navigate to confirmation screen after successful submission
   */
  React.useEffect(() => {
    if (result) {
      navigation.navigate('BookingConfirmation', {
        bookingId: result.bookingId,
      });
    }
  }, [result, navigation]);

  /**
   * Handle meeting type change
   */
  const handleMeetingTypeChange = useCallback(
    (type: MeetingType) => {
      dispatch(setMeetingType(type));
    },
    [dispatch],
  );

  /**
   * Handle title change with validation
   */
  const handleTitleChange = useCallback(
    (value: string) => {
      dispatch(setTitle(value));

      // Validate title
      if (value.trim().length === 0) {
        setTitleError(null); // Don't show error for empty (user hasn't typed yet)
      } else if (value.trim().length < TITLE_MIN_LENGTH) {
        setTitleError(
          t('booking.meetingDetails.titleTooShort', { min: TITLE_MIN_LENGTH }),
        );
      } else if (value.length > TITLE_MAX_LENGTH) {
        setTitleError(
          t('booking.meetingDetails.titleTooLong', { max: TITLE_MAX_LENGTH }),
        );
      } else {
        setTitleError(null);
      }
    },
    [dispatch, t],
  );

  /**
   * Handle description change with validation
   */
  const handleDescriptionChange = useCallback(
    (value: string) => {
      dispatch(setDescription(value));

      // Validate description length
      if (value.length > DESCRIPTION_MAX_LENGTH) {
        setDescriptionError(
          t('booking.meetingDetails.descriptionTooLong', { max: DESCRIPTION_MAX_LENGTH }),
        );
      } else {
        setDescriptionError(null);
      }
    },
    [dispatch, t],
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(() => {
    // Check honeypot (spam prevention)
    if (honeypot.trim().length > 0) {
      Alert.alert(
        t('booking.meetingDetails.spamDetectedTitle'),
        t('booking.meetingDetails.spamDetectedMessage'),
      );
      return;
    }

    // Validate form
    if (!isFormComplete) {
      Alert.alert(
        t('booking.meetingDetails.incompleteFormTitle'),
        t('booking.meetingDetails.incompleteFormMessage'),
      );
      return;
    }

    // Check for validation errors
    if (titleError || descriptionError) {
      Alert.alert(
        t('booking.meetingDetails.validationErrorTitle'),
        t('booking.meetingDetails.validationErrorMessage'),
      );
      return;
    }

    // Throttle submission (500ms)
    if (submitTimeoutRef.current) {
      return; // Already submitting
    }

    submitTimeoutRef.current = setTimeout(() => {
      submitTimeoutRef.current = null;
    }, 500);

    // Dispatch createBooking action
    dispatch(createBooking());
  }, [dispatch, isFormComplete, honeypot, titleError, descriptionError, t]);

  /**
   * Cleanup timeout on unmount
   */
  React.useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  if (!summary) {
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
        />
        <Text
          mt="$4"
          fontSize="$lg"
          fontWeight="$semibold"
          color={colorScheme === 'dark' ? '$white' : '$black'}
          textAlign="center"
        >
          {t('booking.meetingDetails.noSummaryTitle')}
        </Text>
        <Text mt="$2" fontSize="$md" color="$coolGray500" textAlign="center">
          {t('booking.meetingDetails.noSummaryMessage')}
        </Text>
      </Box>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Box flex={1} bg={colorScheme === 'dark' ? '$black' : '$coolGray50'}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          testID="meeting-details-scroll"
        >
          <Box px="$4" py="$6">
            {/* Error Banner */}
            {error && (
              <Box
                bg="$red100"
                borderRadius="$lg"
                p="$4"
                mb="$4"
                flexDirection="row"
                alignItems="center"
                testID="meeting-details-error-banner"
                accessibilityLiveRegion="assertive"
              >
                <Icon name="alert-circle" size={24} color="#DC2626" />
                <Text ml="$3" fontSize="$sm" color="$red700" flex={1}>
                  {error}
                </Text>
              </Box>
            )}

            {/* Meeting Summary Section */}
            <Text
              fontSize="$xs"
              fontWeight="$semibold"
              color="$coolGray500"
              textTransform="uppercase"
              letterSpacing="$sm"
              mb="$3"
              testID="summary-section-header"
            >
              {t('booking.meetingDetails.summarySectionHeader')}
            </Text>

            <Box
              bg={colorScheme === 'dark' ? '$coolGray800' : '$white'}
              borderRadius="$lg"
              p="$4"
              mb="$6"
              testID="booking-summary"
            >
              <Text
                fontSize="$md"
                color={colorScheme === 'dark' ? '$white' : '$black'}
                mb="$2"
                testID="summary-duration"
              >
                {t('booking.meetingDetails.summaryDuration', { duration: summary.duration })}
              </Text>
              <Text
                fontSize="$md"
                color={colorScheme === 'dark' ? '$white' : '$black'}
                mb="$2"
                testID="summary-date"
              >
                {formattedDate}
              </Text>
              <Text
                fontSize="$md"
                color={colorScheme === 'dark' ? '$white' : '$black'}
                testID="summary-time"
              >
                {formattedTimeRange} ({summary.timezone})
              </Text>
            </Box>

            {/* Meeting Type Section */}
            <Text
              fontSize="$xs"
              fontWeight="$semibold"
              color="$coolGray500"
              textTransform="uppercase"
              letterSpacing="$sm"
              mb="$3"
              testID="meeting-type-section-header"
            >
              {t('booking.meetingDetails.meetingTypeSectionHeader')}
            </Text>

            <MeetingTypeSelector
              value={form.meetingType}
              onChange={handleMeetingTypeChange}
              colorScheme={colorScheme}
            />

            {/* Meeting Details Section */}
            <Text
              fontSize="$xs"
              fontWeight="$semibold"
              color="$coolGray500"
              textTransform="uppercase"
              letterSpacing="$sm"
              mb="$3"
              mt="$2"
              testID="meeting-details-section-header"
            >
              {t('booking.meetingDetails.detailsSectionHeader')}
            </Text>

            {/* Title Input */}
            <Text
              fontSize="$sm"
              fontWeight="$medium"
              color={colorScheme === 'dark' ? '$white' : '$black'}
              mb="$2"
            >
              {t('booking.meetingDetails.titleLabel')}{' '}
              <Text color="$red500">*</Text>
            </Text>

            <Input
              variant="outline"
              size="lg"
              mb={titleError ? '$1' : '$4'}
              bg={colorScheme === 'dark' ? '$coolGray800' : '$white'}
              borderColor={titleError ? '$red500' : colorScheme === 'dark' ? '$coolGray700' : '$coolGray200'}
              testID="title-input"
            >
              <InputField
                placeholder={t('booking.meetingDetails.titlePlaceholder')}
                value={form.title}
                onChangeText={handleTitleChange}
                maxLength={TITLE_MAX_LENGTH}
                accessibilityLabel={t('booking.meetingDetails.titleAccessibilityLabel')}
                accessibilityHint={t('booking.meetingDetails.titleAccessibilityHint')}
              />
            </Input>

            {titleError && (
              <Text
                fontSize="$xs"
                color="$red500"
                mb="$4"
                testID="title-error"
                accessibilityLiveRegion="polite"
              >
                {titleError}
              </Text>
            )}

            {/* Description Textarea */}
            <Text
              fontSize="$sm"
              fontWeight="$medium"
              color={colorScheme === 'dark' ? '$white' : '$black'}
              mb="$2"
            >
              {t('booking.meetingDetails.descriptionLabel')}{' '}
              <Text color="$coolGray500" fontSize="$xs">
                ({t('common.optional')})
              </Text>
            </Text>

            <Textarea
              size="lg"
              mb="$1"
              bg={colorScheme === 'dark' ? '$coolGray800' : '$white'}
              borderColor={descriptionError ? '$red500' : colorScheme === 'dark' ? '$coolGray700' : '$coolGray200'}
              testID="description-textarea"
            >
              <TextareaInput
                placeholder={t('booking.meetingDetails.descriptionPlaceholder')}
                value={form.description}
                onChangeText={handleDescriptionChange}
                maxLength={DESCRIPTION_MAX_LENGTH}
                numberOfLines={4}
                accessibilityLabel={t('booking.meetingDetails.descriptionAccessibilityLabel')}
                accessibilityHint={t('booking.meetingDetails.descriptionAccessibilityHint')}
              />
            </Textarea>

            <Text
              fontSize="$xs"
              color={form.description.length > DESCRIPTION_MAX_LENGTH ? '$red500' : '$coolGray500'}
              mb="$4"
              textAlign="right"
              testID="description-character-count"
            >
              {form.description.length}/{DESCRIPTION_MAX_LENGTH} {t('booking.meetingDetails.characters')}
            </Text>

            {descriptionError && (
              <Text
                fontSize="$xs"
                color="$red500"
                mb="$4"
                testID="description-error"
                accessibilityLiveRegion="polite"
              >
                {descriptionError}
              </Text>
            )}

            {/* Honeypot Field (hidden from users) */}
            <Box position="absolute" left={-9999} testID="honeypot-container">
              <TextInput
                value={honeypot}
                onChangeText={setHoneypot}
                autoComplete="off"
                tabIndex={-1}
                aria-hidden={true}
                testID="honeypot-field"
              />
            </Box>

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              bg={isFormComplete && !loading ? '$blue500' : '$coolGray300'}
              borderRadius="$lg"
              minHeight="$12"
              px="$4"
              py="$3"
              mt="$6"
              alignItems="center"
              justifyContent="center"
              disabled={!isFormComplete || loading}
              accessibilityRole="button"
              accessibilityLabel={
                loading
                  ? t('booking.meetingDetails.submittingButton')
                  : t('booking.meetingDetails.submitButton')
              }
              accessibilityHint={t('booking.meetingDetails.submitHint')}
              accessibilityState={{ disabled: !isFormComplete || loading, busy: loading }}
              testID="submit-button"
              sx={{
                ':active': {
                  opacity: isFormComplete && !loading ? 0.7 : 1,
                },
              }}
            >
              {loading ? (
                <Box flexDirection="row" alignItems="center">
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text ml="$2" fontSize="$md" fontWeight="$semibold" color="$white">
                    {t('booking.meetingDetails.submittingButton')}
                  </Text>
                </Box>
              ) : (
                <Text
                  fontSize="$md"
                  fontWeight="$semibold"
                  color={isFormComplete ? '$white' : '$coolGray500'}
                >
                  {t('booking.meetingDetails.submitButton')}
                </Text>
              )}
            </Pressable>
          </Box>
        </ScrollView>
      </Box>
    </KeyboardAvoidingView>
  );
};
```

---

## RNTL Tests

```typescript
// src/features/Booking/__tests__/MeetingDetailsScreen.rntl.tsx

import React from 'react';
import { renderWithProviders } from '@app/test-utils/renderWithProviders';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { MeetingDetailsScreen } from '../MeetingDetailsScreen';
import { bookingApiClient } from '@app/features/Booking';
import { Alert } from 'react-native';

// Mock API client
jest.mock('@app/features/Booking', () => ({
  ...jest.requireActual('@app/features/Booking'),
  bookingApiClient: {
    createBooking: jest.fn(),
  },
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('MeetingDetailsScreen', () => {
  const completeFormState = {
    booking: {
      form: {
        duration: 30,
        date: '2025-12-15',
        selectedSlot: {
          startTime: '2025-12-15T09:00:00Z',
          endTime: '2025-12-15T09:30:00Z',
          available: true,
        },
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
        ],
        loading: false,
        error: null,
        loadedDate: '2025-12-15',
      },
      creation: { loading: false, error: null, result: null },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders booking summary', () => {
    renderWithProviders(<MeetingDetailsScreen />, {
      preloadedState: completeFormState,
    });

    expect(screen.getByTestId('booking-summary')).toBeOnTheScreen();
    expect(screen.getByTestId('summary-duration')).toHaveTextContent('30');
    expect(screen.getByTestId('summary-date')).toHaveTextContent('December 2025');
    expect(screen.getByTestId('summary-time')).toHaveTextContent('Europe/Madrid');
  });

  it('renders meeting type selector', () => {
    renderWithProviders(<MeetingDetailsScreen />, {
      preloadedState: completeFormState,
    });

    expect(screen.getByTestId('meeting-type-phone')).toBeOnTheScreen();
    expect(screen.getByTestId('meeting-type-video')).toBeOnTheScreen();
  });

  it('renders title input', () => {
    renderWithProviders(<MeetingDetailsScreen />, {
      preloadedState: completeFormState,
    });

    expect(screen.getByTestId('title-input')).toBeOnTheScreen();
  });

  it('renders description textarea', () => {
    renderWithProviders(<MeetingDetailsScreen />, {
      preloadedState: completeFormState,
    });

    expect(screen.getByTestId('description-textarea')).toBeOnTheScreen();
  });

  it('renders submit button disabled initially', () => {
    renderWithProviders(<MeetingDetailsScreen />, {
      preloadedState: completeFormState,
    });

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();
  });

  it('updates Redux when meeting type selected', async () => {
    const { store } = renderWithProviders(<MeetingDetailsScreen />, {
      preloadedState: completeFormState,
    });

    fireEvent.press(screen.getByTestId('meeting-type-video'));

    await waitFor(() => {
      expect(store.getState().booking.form.meetingType).toBe('video');
    });
  });

  it('updates Redux when title changed', async () => {
    const { store } = renderWithProviders(<MeetingDetailsScreen />, {
      preloadedState: completeFormState,
    });

    const titleInput = screen.getByTestId('title-input');
    fireEvent.changeText(titleInput, 'Project consultation');

    await waitFor(() => {
      expect(store.getState().booking.form.title).toBe('Project consultation');
    });
  });

  it('updates Redux when description changed', async () => {
    const { store } = renderWithProviders(<MeetingDetailsScreen />, {
      preloadedState: completeFormState,
    });

    const descriptionTextarea = screen.getByTestId('description-textarea');
    fireEvent.changeText(descriptionTextarea, 'Discuss requirements');

    await waitFor(() => {
      expect(store.getState().booking.form.description).toBe('Discuss requirements');
    });
  });

  it('shows error when title too short', async () => {
    renderWithProviders(<MeetingDetailsScreen />, {
      preloadedState: completeFormState,
    });

    const titleInput = screen.getByTestId('title-input');
    fireEvent.changeText(titleInput, 'ab'); // Too short

    await waitFor(() => {
      expect(screen.getByTestId('title-error')).toBeOnTheScreen();
    });
  });

  it('shows character count for description', () => {
    renderWithProviders(<MeetingDetailsScreen />, {
      preloadedState: completeFormState,
    });

    expect(screen.getByTestId('description-character-count')).toHaveTextContent('0/500');
  });

  it('updates character count when description changes', async () => {
    renderWithProviders(<MeetingDetailsScreen />, {
      preloadedState: completeFormState,
    });

    const descriptionTextarea = screen.getByTestId('description-textarea');
    fireEvent.changeText(descriptionTextarea, 'Test description');

    await waitFor(() => {
      expect(screen.getByTestId('description-character-count')).toHaveTextContent(
        '16/500',
      );
    });
  });

  it('enables submit button when form complete', async () => {
    renderWithProviders(<MeetingDetailsScreen />, {
      preloadedState: completeFormState,
    });

    // Select meeting type
    fireEvent.press(screen.getByTestId('meeting-type-video'));

    // Enter title
    const titleInput = screen.getByTestId('title-input');
    fireEvent.changeText(titleInput, 'Project consultation');

    await waitFor(() => {
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeEnabled();
    });
  });

  it('submits booking when submit button pressed', async () => {
    (bookingApiClient.createBooking as jest.Mock).mockResolvedValue({
      bookingId: 'bk_123',
      status: 'confirmed',
      confirmationUrl: 'https://example.com/confirm/bk_123',
      calendarEventId: 'cal_123',
    });

    renderWithProviders(<MeetingDetailsScreen />, {
      preloadedState: {
        ...completeFormState,
        booking: {
          ...completeFormState.booking,
          form: {
            ...completeFormState.booking.form,
            meetingType: 'video',
            title: 'Project consultation',
          },
        },
      },
    });

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(bookingApiClient.createBooking).toHaveBeenCalled();
    });
  });

  it('shows loading state when submitting', async () => {
    (bookingApiClient.createBooking as jest.Mock).mockReturnValue(
      new Promise(() => {}), // Never resolves
    );

    renderWithProviders(<MeetingDetailsScreen />, {
      preloadedState: {
        ...completeFormState,
        booking: {
          ...completeFormState.booking,
          form: {
            ...completeFormState.booking.form,
            meetingType: 'video',
            title: 'Project consultation',
          },
          creation: { loading: true, error: null, result: null },
        },
      },
    });

    expect(screen.getByText(/Submitting/i)).toBeOnTheScreen();
  });

  it('displays error banner when submission fails', () => {
    renderWithProviders(<MeetingDetailsScreen />, {
      preloadedState: {
        ...completeFormState,
        booking: {
          ...completeFormState.booking,
          creation: {
            loading: false,
            error: 'Failed to create booking',
            result: null,
          },
        },
      },
    });

    expect(screen.getByTestId('meeting-details-error-banner')).toBeOnTheScreen();
  });

  it('navigates to confirmation after successful submission', async () => {
    const result = {
      bookingId: 'bk_123',
      status: 'confirmed' as const,
      confirmationUrl: 'https://example.com/confirm/bk_123',
      calendarEventId: 'cal_123',
    };

    renderWithProviders(<MeetingDetailsScreen />, {
      preloadedState: {
        ...completeFormState,
        booking: {
          ...completeFormState.booking,
          creation: { loading: false, error: null, result },
        },
      },
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('BookingConfirmation', {
        bookingId: 'bk_123',
      });
    });
  });

  it('prevents submission when honeypot filled', async () => {
    renderWithProviders(<MeetingDetailsScreen />, {
      preloadedState: {
        ...completeFormState,
        booking: {
          ...completeFormState.booking,
          form: {
            ...completeFormState.booking.form,
            meetingType: 'video',
            title: 'Project consultation',
          },
        },
      },
    });

    // Fill honeypot
    const honeypot = screen.getByTestId('honeypot-field');
    fireEvent.changeText(honeypot, 'spam');

    // Try to submit
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
      expect(bookingApiClient.createBooking).not.toHaveBeenCalled();
    });
  });

  describe('dark mode', () => {
    it('renders correctly in dark mode', () => {
      renderWithProviders(<MeetingDetailsScreen />, {
        preloadedState: completeFormState,
        colorScheme: 'dark',
      });

      expect(screen.getByTestId('booking-summary')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has accessible meeting type buttons', () => {
      renderWithProviders(<MeetingDetailsScreen />, {
        preloadedState: completeFormState,
      });

      const phoneButton = screen.getByTestId('meeting-type-phone');
      expect(phoneButton).toHaveAccessibilityRole('button');
      expect(phoneButton).toHaveAccessibilityState({ selected: false });
    });

    it('has accessible form inputs', () => {
      renderWithProviders(<MeetingDetailsScreen />, {
        preloadedState: completeFormState,
      });

      const titleInput = screen.getByTestId('title-input');
      expect(titleInput).toBeTruthy();
    });

    it('announces errors to screen readers', async () => {
      renderWithProviders(<MeetingDetailsScreen />, {
        preloadedState: completeFormState,
      });

      const titleInput = screen.getByTestId('title-input');
      fireEvent.changeText(titleInput, 'ab');

      await waitFor(() => {
        const error = screen.getByTestId('title-error');
        expect(error.props.accessibilityLiveRegion).toBe('polite');
      });
    });
  });
});
```

---

## Storybook Stories

```typescript
// src/features/Booking/MeetingDetailsScreen.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { MeetingDetailsScreen } from './MeetingDetailsScreen';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from '@app/store/slices/bookingSlice';

const meta: Meta<typeof MeetingDetailsScreen> = {
  title: 'Booking/MeetingDetailsScreen',
  component: MeetingDetailsScreen,
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

type Story = StoryObj<typeof MeetingDetailsScreen>;

const baseState = {
  booking: {
    form: {
      duration: 30,
      date: '2025-12-15',
      selectedSlot: {
        startTime: '2025-12-15T09:00:00Z',
        endTime: '2025-12-15T09:30:00Z',
        available: true,
      },
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
      ],
      loading: false,
      error: null,
      loadedDate: '2025-12-15',
    },
    creation: { loading: false, error: null, result: null },
  },
};

/**
 * Empty form
 */
export const Empty: Story = {
  parameters: {
    preloadedState: baseState,
  },
};

/**
 * Partial form (meeting type selected)
 */
export const PartialForm: Story = {
  parameters: {
    preloadedState: {
      booking: {
        ...baseState.booking,
        form: {
          ...baseState.booking.form,
          meetingType: 'video',
        },
      },
    },
  },
};

/**
 * Complete form
 */
export const CompleteForm: Story = {
  parameters: {
    preloadedState: {
      booking: {
        ...baseState.booking,
        form: {
          ...baseState.booking.form,
          meetingType: 'video',
          title: 'Project consultation',
          description: 'Discuss requirements for mobile app development',
        },
      },
    },
  },
};

/**
 * Submitting state
 */
export const Submitting: Story = {
  parameters: {
    preloadedState: {
      booking: {
        ...baseState.booking,
        form: {
          ...baseState.booking.form,
          meetingType: 'video',
          title: 'Project consultation',
        },
        creation: { loading: true, error: null, result: null },
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
        ...baseState.booking,
        form: {
          ...baseState.booking.form,
          meetingType: 'video',
          title: 'Project consultation',
        },
        creation: {
          loading: false,
          error: 'Failed to create booking. Please try again.',
          result: null,
        },
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
        ...baseState.booking,
        form: {
          ...baseState.booking.form,
          meetingType: 'phone',
          title: 'Quick call',
        },
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
    "meetingDetails": {
      "summarySectionHeader": "Meeting summary",
      "summaryDuration": "{{duration}} minutes",
      "meetingTypeSectionHeader": "Meeting type",
      "phoneCall": "Phone Call",
      "videoCall": "Video Call",
      "phoneCallLabel": "Phone call meeting type",
      "phoneCallHint": "Select phone call as meeting type",
      "videoCallLabel": "Video call meeting type",
      "videoCallHint": "Select video call as meeting type",
      "detailsSectionHeader": "Meeting details",
      "titleLabel": "Title",
      "titlePlaceholder": "e.g., Project consultation",
      "titleAccessibilityLabel": "Meeting title input",
      "titleAccessibilityHint": "Enter a title for your meeting",
      "descriptionLabel": "Description",
      "descriptionPlaceholder": "Add any additional details about the meeting...",
      "descriptionAccessibilityLabel": "Meeting description input",
      "descriptionAccessibilityHint": "Enter optional description for your meeting",
      "characters": "characters",
      "submitButton": "Submit Booking",
      "submittingButton": "Submitting...",
      "submitHint": "Submit your booking request",
      "titleTooShort": "Title must be at least {{min}} characters",
      "titleTooLong": "Title must be less than {{max}} characters",
      "descriptionTooLong": "Description must be less than {{max}} characters",
      "spamDetectedTitle": "Invalid Submission",
      "spamDetectedMessage": "Your submission could not be processed. Please try again.",
      "incompleteFormTitle": "Incomplete Form",
      "incompleteFormMessage": "Please complete all required fields before submitting.",
      "validationErrorTitle": "Validation Error",
      "validationErrorMessage": "Please fix the errors in the form before submitting.",
      "noSummaryTitle": "Missing Booking Information",
      "noSummaryMessage": "Please complete the previous steps before accessing this screen."
    }
  },
  "common": {
    "optional": "Optional"
  }
}
```

---

## EAA Compliance Checklist

- [ ] All buttons have `minHeight="$12"` (48pt minimum)
- [ ] Meeting type buttons have `accessibilityRole="button"`
- [ ] Meeting type buttons convey selected state
- [ ] Form inputs have accessible labels
- [ ] Form validation errors announced to screen readers
- [ ] Submit button disabled state conveyed
- [ ] Loading state announced (accessibilityState busy)
- [ ] Error banner has `accessibilityLiveRegion="assertive"`
- [ ] Character count visible and accessible
- [ ] Honeypot field hidden from screen readers

---

## Testing Checklist

- [ ] Booking summary displays correctly
- [ ] Meeting type selector updates Redux
- [ ] Title input updates Redux
- [ ] Description textarea updates Redux
- [ ] Title validation (min 3, max 100 chars)
- [ ] Description validation (max 500 chars)
- [ ] Character count updates correctly
- [ ] Submit button disabled when form incomplete
- [ ] Submit button enabled when form complete
- [ ] Loading state shows when submitting
- [ ] Error banner displays on failure
- [ ] Navigation to confirmation on success
- [ ] Honeypot prevents spam submissions
- [ ] Submit throttling (500ms)
- [ ] Dark mode renders correctly
- [ ] Accessibility props correct
- [ ] RNTL tests achieve 100% coverage
- [ ] Storybook stories render in all states
- [ ] `yarn validate` passes

---

## Notes

- Uses iOS-style segmented control for meeting type
- Honeypot field hidden (position absolute, left -9999)
- Submit throttled to 500ms to prevent double submissions
- Form validation happens on change, not on submit
- Character counts displayed for user guidance
- KeyboardAvoidingView for iOS keyboard handling
- Error banner uses assertive live region for immediate announcement
- Navigation to confirmation screen handled via useEffect watching result
