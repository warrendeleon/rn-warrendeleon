# TASK-365: Edit Booking Screen

**Status**: 🆕 Not Started
**Effort**: 4 hours
**Priority**: High
**Parent**: [US-065: View & Manage Bookings](../user-stories/US-065-view-manage-bookings.md)

---

## Overview

Create the Edit Booking screen that allows users to modify an existing booking. The form is pre-populated with current booking data. Duration is fixed (cannot be changed), but users can update the date/time (with availability re-check), meeting type, phone number, and description. Follows iOS-first design with grouped form inputs.

---

## Requirements

### Functional Requirements

1. **Pre-populated Form**: Load existing booking data on mount
2. **Editable Fields**:
   - Date (date picker)
   - Time (time picker)
   - Meeting type (selector, changes duration display)
   - Phone number (with validation)
   - Description (optional text area)
3. **Non-Editable Fields**:
   - Duration (derived from meeting type, display-only)
   - Status (cannot change via edit screen)
4. **Validation**:
   - Date/time cannot be in the past
   - Phone number must be valid E.164 format
   - Re-check availability if date/time or meeting type changes
5. **Save Button**: Calls update booking API endpoint
6. **Cancel Button**: Discard changes and go back
7. **Loading States**: Show spinner while saving
8. **Error Handling**: Display validation errors, API errors

### Non-Functional Requirements

1. **iOS-First Design**: Grouped form inputs (like iOS Settings)
2. **Performance**: Debounced availability checks
3. **EAA Compliance**: WCAG 2.1 Level AA (touch targets, contrast, labels)
4. **Unsaved Changes Warning**: Prompt user if navigating away with unsaved changes

---

## ASCII Mockups

### Edit Booking Screen (Pre-populated)

```
┌─────────────────────────────────────────────────┐
│  ← Edit Booking                        Save     │ ← Navigation header
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Meeting Type                        →    │ │ ← Tappable (opens selector)
│  │  Strategy Session (60 mins)               │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Date                                →    │ │ ← Tappable (date picker)
│  │  1 Dec 2025                               │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Time                                →    │ │ ← Tappable (time picker)
│  │  14:00                                    │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Duration (fixed)                         │ │ ← Display only
│  │  60 minutes                               │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Phone Number                             │ │ ← Text input
│  │  +44 7700 900123                          │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Description (optional)                   │ │ ← Text area
│  │  Discuss Q1 marketing strategy            │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │           Save Changes                  │   │ ← Primary button
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │           Discard Changes               │   │ ← Secondary button
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Meeting Type Selector (Action Sheet)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              Select Meeting Type                │ ← Action sheet header
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Strategy Session (60 mins)        ✓    │   │ ← Currently selected
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Quick Catchup (30 mins)                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Team Sync (45 mins)                    │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │              Cancel                     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Validation Error State

```
┌─────────────────────────────────────────────────┐
│  ← Edit Booking                        Save     │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Date                                →    │ │
│  │  25 Nov 2025                              │ │
│  └───────────────────────────────────────────┘ │
│  ⚠️ Date cannot be in the past                 │ ← Error message
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Phone Number                             │ │
│  │  1234567890                               │ │
│  └───────────────────────────────────────────┘ │
│  ⚠️ Invalid phone number format                │ ← Error message
│                                                 │
└─────────────────────────────────────────────────┘
```

### Availability Conflict Error

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              Time Slot Unavailable              │
│                                                 │
│  The selected time slot is no longer            │
│  available. Please choose a different time.     │
│                                                 │
│  Next available: 5 Dec 2025, 15:00              │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │              OK                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Implementation

### File Structure

```
src/features/Bookings/
├── EditBookingScreen.tsx               # Main screen
├── EditBookingScreen.test.tsx          # RNTL tests
├── EditBookingScreen.stories.tsx       # Storybook stories
├── components/
│   ├── MeetingTypeSelector.tsx         # Action sheet selector
│   ├── MeetingTypeSelector.test.tsx
│   └── MeetingTypeSelector.stories.tsx
├── hooks/
│   └── useEditBooking.ts               # Custom hook for form logic
└── index.ts
```

### Main Screen Component

```typescript
// src/features/Bookings/EditBookingScreen.tsx

import React, { useEffect, useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Box, Text, Pressable, Spinner, Input, TextArea } from '@gluestack-ui/themed';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/navigation/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { parsePhoneNumber } from 'libphonenumber-js';
import { MeetingTypeSelector } from './components/MeetingTypeSelector';
import { useEditBooking } from './hooks/useEditBooking';
import { showActionSheet } from '@app/utils/actionSheet';

type EditBookingScreenRouteProp = RouteProp<RootStackParamList, 'EditBooking'>;
type EditBookingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditBooking'
>;

export const EditBookingScreen: React.FC = () => {
  const navigation = useNavigation<EditBookingScreenNavigationProp>();
  const route = useRoute<EditBookingScreenRouteProp>();
  const { bookingId } = route.params;

  const {
    booking,
    meetingTypes,
    isLoading,
    isSaving,
    error,
    formData,
    validationErrors,
    setFormData,
    validateAndSave,
  } = useEditBooking(bookingId);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Warn on unsaved changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  // Set header Save button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          accessibilityRole="button"
          accessibilityLabel="Save changes"
          accessibilityHint="Saves the updated booking details"
          testID="save-button"
          px="$4"
          py="$2"
          minHeight="$11"
        >
          {isSaving ? (
            <Spinner size="small" />
          ) : (
            <Text
              color={isSaving ? '$coolGray400' : '$blue500'}
              fontSize="$md"
              fontWeight="$semibold"
            >
              Save
            </Text>
          )}
        </Pressable>
      ),
    });
  }, [navigation, isSaving]);

  const handleSave = async () => {
    const success = await validateAndSave();

    if (success) {
      setHasUnsavedChanges(false);
      navigation.goBack();
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Changes?',
      'Are you sure you want to discard all changes?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            setHasUnsavedChanges(false);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleMeetingTypeSelect = () => {
    if (!meetingTypes) return;

    const options = meetingTypes.map((mt) => ({
      label: `${mt.name} (${mt.duration_minutes} mins)`,
      onPress: () => {
        setFormData({ ...formData, meetingTypeId: mt.id });
        setHasUnsavedChanges(true);
      },
      selected: formData.meetingTypeId === mt.id,
    }));

    showActionSheet({
      title: 'Select Meeting Type',
      options: [
        ...options,
        {
          label: 'Cancel',
          style: 'cancel',
        },
      ],
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (selectedDate) {
      setFormData({ ...formData, date: selectedDate });
      setHasUnsavedChanges(true);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);

    if (selectedTime) {
      // Combine selected time with current date
      const newDateTime = new Date(formData.date);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());

      setFormData({ ...formData, date: newDateTime });
      setHasUnsavedChanges(true);
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    setFormData({ ...formData, phoneNumber: value });
    setHasUnsavedChanges(true);
  };

  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, description: value });
    setHasUnsavedChanges(true);
  };

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$coolGray50">
        <Spinner size="large" testID="loading-spinner" />
      </Box>
    );
  }

  if (error || !booking) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$coolGray50" px="$6">
        <Text fontSize="$lg" fontWeight="$semibold" mb="$4">
          Failed to Load Booking
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          bg="$blue500"
          px="$6"
          py="$3"
          borderRadius="$lg"
          minHeight="$11"
          testID="go-back-button"
        >
          <Text color="$white" fontWeight="$semibold">
            Go Back
          </Text>
        </Pressable>
      </Box>
    );
  }

  const selectedMeetingType = meetingTypes?.find((mt) => mt.id === formData.meetingTypeId);

  return (
    <Box flex={1} bg="$coolGray50">
      <ScrollView contentContainerStyle={{ padding: 16 }} testID="edit-booking-scroll">
        {/* Meeting Type Selector */}
        <Box bg="$white" borderRadius="$lg" overflow="hidden" mb="$3">
          <Pressable
            onPress={handleMeetingTypeSelect}
            px="$4"
            py="$3"
            minHeight="$16"
            accessibilityRole="button"
            accessibilityLabel="Select meeting type"
            accessibilityHint="Opens meeting type selector"
            testID="meeting-type-selector"
          >
            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
              <Box flex={1}>
                <Text fontSize="$sm" color="$coolGray600" mb="$1">
                  Meeting Type
                </Text>
                <Text fontSize="$md" color="$coolGray900">
                  {selectedMeetingType?.name} ({selectedMeetingType?.duration_minutes} mins)
                </Text>
              </Box>
              <Text fontSize="$lg" color="$coolGray400">
                →
              </Text>
            </Box>
          </Pressable>
        </Box>

        {/* Date Picker */}
        <Box bg="$white" borderRadius="$lg" overflow="hidden" mb="$3">
          <Pressable
            onPress={() => setShowDatePicker(true)}
            px="$4"
            py="$3"
            minHeight="$16"
            accessibilityRole="button"
            accessibilityLabel="Select date"
            accessibilityHint="Opens date picker"
            testID="date-picker-button"
          >
            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
              <Box flex={1}>
                <Text fontSize="$sm" color="$coolGray600" mb="$1">
                  Date
                </Text>
                <Text fontSize="$md" color="$coolGray900">
                  {format(formData.date, 'd MMM yyyy')}
                </Text>
              </Box>
              <Text fontSize="$lg" color="$coolGray400">
                →
              </Text>
            </Box>
          </Pressable>
        </Box>

        {validationErrors.date && (
          <Text color="$red500" fontSize="$sm" mb="$2" px="$2">
            ⚠️ {validationErrors.date}
          </Text>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={formData.date}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            minimumDate={new Date()}
            testID="date-picker"
          />
        )}

        {/* Time Picker */}
        <Box bg="$white" borderRadius="$lg" overflow="hidden" mb="$3">
          <Pressable
            onPress={() => setShowTimePicker(true)}
            px="$4"
            py="$3"
            minHeight="$16"
            accessibilityRole="button"
            accessibilityLabel="Select time"
            accessibilityHint="Opens time picker"
            testID="time-picker-button"
          >
            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
              <Box flex={1}>
                <Text fontSize="$sm" color="$coolGray600" mb="$1">
                  Time
                </Text>
                <Text fontSize="$md" color="$coolGray900">
                  {format(formData.date, 'HH:mm')}
                </Text>
              </Box>
              <Text fontSize="$lg" color="$coolGray400">
                →
              </Text>
            </Box>
          </Pressable>
        </Box>

        {showTimePicker && (
          <DateTimePicker
            value={formData.date}
            mode="time"
            display="spinner"
            onChange={handleTimeChange}
            testID="time-picker"
          />
        )}

        {/* Duration (Display Only) */}
        <Box bg="$white" px="$4" py="$3" borderRadius="$lg" mb="$3">
          <Text fontSize="$sm" color="$coolGray600" mb="$1">
            Duration (fixed)
          </Text>
          <Text fontSize="$md" color="$coolGray500">
            {selectedMeetingType?.duration_minutes} minutes
          </Text>
        </Box>

        {/* Phone Number */}
        <Box bg="$white" borderRadius="$lg" overflow="hidden" mb="$3">
          <Box px="$4" py="$3">
            <Text fontSize="$sm" color="$coolGray600" mb="$2">
              Phone Number
            </Text>
            <Input
              value={formData.phoneNumber}
              onChangeText={handlePhoneNumberChange}
              placeholder="+44 7700 900123"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              accessibilityLabel="Phone number"
              testID="phone-number-input"
              borderWidth={0}
              bg="$coolGray50"
            />
          </Box>
        </Box>

        {validationErrors.phoneNumber && (
          <Text color="$red500" fontSize="$sm" mb="$2" px="$2">
            ⚠️ {validationErrors.phoneNumber}
          </Text>
        )}

        {/* Description */}
        <Box bg="$white" borderRadius="$lg" overflow="hidden" mb="$3">
          <Box px="$4" py="$3">
            <Text fontSize="$sm" color="$coolGray600" mb="$2">
              Description (optional)
            </Text>
            <TextArea
              value={formData.description || ''}
              onChangeText={handleDescriptionChange}
              placeholder="Add notes about this meeting..."
              minHeight="$24"
              accessibilityLabel="Meeting description"
              testID="description-input"
              borderWidth={0}
              bg="$coolGray50"
            />
          </Box>
        </Box>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          bg="$blue500"
          py="$4"
          borderRadius="$lg"
          mb="$3"
          minHeight="$12"
          disabled={isSaving}
          accessibilityRole="button"
          accessibilityLabel="Save changes"
          accessibilityState={{ disabled: isSaving }}
          testID="save-changes-button"
        >
          {isSaving ? (
            <Spinner color="$white" />
          ) : (
            <Text color="$white" fontSize="$md" fontWeight="$semibold" textAlign="center">
              Save Changes
            </Text>
          )}
        </Pressable>

        {/* Discard Button */}
        <Pressable
          onPress={handleDiscard}
          bg="$white"
          borderWidth={1}
          borderColor="$coolGray300"
          py="$4"
          borderRadius="$lg"
          mb="$6"
          minHeight="$12"
          accessibilityRole="button"
          accessibilityLabel="Discard changes"
          testID="discard-changes-button"
        >
          <Text color="$coolGray700" fontSize="$md" fontWeight="$semibold" textAlign="center">
            Discard Changes
          </Text>
        </Pressable>
      </ScrollView>
    </Box>
  );
};
```

### Custom Hook for Form Logic

```typescript
// src/features/Bookings/hooks/useEditBooking.ts

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@app/lib/supabase';
import { parsePhoneNumber } from 'libphonenumber-js';
import { Booking, MeetingType } from '@app/types/booking';

interface FormData {
  meetingTypeId: string;
  date: Date;
  phoneNumber: string;
  description: string | null;
}

interface ValidationErrors {
  date?: string;
  phoneNumber?: string;
}

interface UseEditBookingReturn {
  booking: Booking | null;
  meetingTypes: MeetingType[] | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  formData: FormData;
  validationErrors: ValidationErrors;
  setFormData: (data: FormData) => void;
  validateAndSave: () => Promise<boolean>;
}

export const useEditBooking = (bookingId: string): UseEditBookingReturn => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [formData, setFormData] = useState<FormData>({
    meetingTypeId: '',
    date: new Date(),
    phoneNumber: '',
    description: null,
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    fetchData();
  }, [bookingId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*, meeting_types(*)')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      setBooking(bookingData);

      // Pre-populate form
      setFormData({
        meetingTypeId: bookingData.meeting_type_id,
        date: new Date(bookingData.start_time),
        phoneNumber: bookingData.phone_number,
        description: bookingData.description,
      });

      // Fetch meeting types
      const { data: typesData, error: typesError } = await supabase
        .from('meeting_types')
        .select('*');

      if (typesError) throw typesError;

      setMeetingTypes(typesData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load booking'));
    } finally {
      setIsLoading(false);
    }
  };

  const validateAndSave = useCallback(async (): Promise<boolean> => {
    const errors: ValidationErrors = {};

    // Validate date (not in past)
    if (formData.date < new Date()) {
      errors.date = 'Date cannot be in the past';
    }

    // Validate phone number
    try {
      const parsed = parsePhoneNumber(formData.phoneNumber);
      if (!parsed || !parsed.isValid()) {
        errors.phoneNumber = 'Invalid phone number format';
      }
    } catch {
      errors.phoneNumber = 'Invalid phone number format';
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return false;
    }

    // Save changes
    try {
      setIsSaving(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/update-booking`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
          meeting_type_id: formData.meetingTypeId,
          start_time: formData.date.toISOString(),
          phone_number: formData.phoneNumber,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error.message);
      }

      return true;
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save changes');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [formData, bookingId]);

  return {
    booking,
    meetingTypes,
    isLoading,
    isSaving,
    error,
    formData,
    validationErrors,
    setFormData,
    validateAndSave,
  };
};
```

---

## React Native Testing Library Tests

```typescript
// src/features/Bookings/EditBookingScreen.test.tsx

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { EditBookingScreen } from './EditBookingScreen';
import { renderWithProviders } from '@app/test-utils';

describe('EditBookingScreen', () => {
  it('should render pre-populated form', async () => {
    const { getByText } = renderWithProviders(<EditBookingScreen />, {
      route: { params: { bookingId: 'test-id' } },
    });

    await waitFor(() => {
      expect(getByText('Strategy Session')).toBeTruthy();
    });
  });

  it('should show validation error for past date', async () => {
    const { getByTestId, getByText } = renderWithProviders(<EditBookingScreen />, {
      route: { params: { bookingId: 'test-id' } },
    });

    // Select past date
    // Trigger validation

    await waitFor(() => {
      expect(getByText('Date cannot be in the past')).toBeTruthy();
    });
  });

  it('should show validation error for invalid phone number', async () => {
    const { getByTestId, getByText } = renderWithProviders(<EditBookingScreen />, {
      route: { params: { bookingId: 'test-id' } },
    });

    const phoneInput = getByTestId('phone-number-input');
    fireEvent.changeText(phoneInput, '1234');

    fireEvent.press(getByTestId('save-changes-button'));

    await waitFor(() => {
      expect(getByText('Invalid phone number format')).toBeTruthy();
    });
  });

  it('should warn on unsaved changes when navigating back', () => {
    const { getByTestId } = renderWithProviders(<EditBookingScreen />, {
      route: { params: { bookingId: 'test-id' } },
    });

    // Make changes
    fireEvent.changeText(getByTestId('phone-number-input'), '+447700900999');

    // Try to navigate back
    // Should trigger alert
  });
});
```

**Test Coverage Target**: 100%

---

## Storybook Stories

```typescript
// src/features/Bookings/EditBookingScreen.stories.tsx

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { EditBookingScreen } from './EditBookingScreen';

const meta: Meta<typeof EditBookingScreen> = {
  title: 'Features/Bookings/EditBookingScreen',
  component: EditBookingScreen,
};

export default meta;

type Story = StoryObj<typeof EditBookingScreen>;

export const Default: Story = {
  args: {},
};

export const WithValidationErrors: Story = {
  args: {},
};
```

---

## Acceptance Criteria

- [ ] Form pre-populated with existing booking data
- [ ] Meeting type selector opens action sheet
- [ ] Date picker allows selecting future dates only
- [ ] Time picker updates time portion of date
- [ ] Duration display updates when meeting type changes (read-only)
- [ ] Phone number input validates E.164 format
- [ ] Description text area allows multi-line input
- [ ] Save button calls update API endpoint
- [ ] Validation errors displayed inline
- [ ] Unsaved changes warning when navigating away
- [ ] Discard button shows confirmation dialog
- [ ] Loading spinner shown while saving
- [ ] Success navigation back to detail screen
- [ ] All buttons have correct accessibility props
- [ ] RNTL tests achieve 100% coverage
- [ ] Storybook stories for default and error states

---

## Related Files

- **Screen**: `src/features/Bookings/EditBookingScreen.tsx`
- **Hook**: `src/features/Bookings/hooks/useEditBooking.ts`
- **Tests**: `src/features/Bookings/EditBookingScreen.test.tsx`
- **Stories**: `src/features/Bookings/EditBookingScreen.stories.tsx`

---

## Dependencies

```json
{
  "@react-native-community/datetimepicker": "^8.0.0",
  "libphonenumber-js": "^1.10.51"
}
```

**All dependencies already installed in project.**

---

## Notes

- Duration is derived from meeting type (cannot be edited directly)
- Availability check happens server-side in update endpoint
- Consider debouncing availability checks for better UX
- Action sheet uses iOS-style bottom sheet for consistency
