# TASK-349: Duration Selection Screen (+ RNTL + Storybook)

**Status**: 📋 To Do
**Effort**: 3h
**Priority**: High
**Dependencies**: TASK-348 (Booking Redux Store)
**Parent**: [US-063: Booking Flow UI](../user-stories/US-063-booking-flow-ui.md)

---

## Overview

Build the duration selection screen where users choose their meeting length (15, 30, 45, 60, or 90 minutes). This is the first screen in the booking flow and uses the iOS-style PickerGroup pattern with large, tappable buttons.

The screen follows the iOS design patterns established in the codebase (SettingsScreen.tsx, HomeScreen.tsx) with proper EAA accessibility and full RNTL test coverage.

---

## Acceptance Criteria

- ✅ Screen displays 5 duration options (15, 30, 45, 60, 90 min)
- ✅ PickerGroup/ButtonGroup component for selection
- ✅ Selected state visually distinct (blue background)
- ✅ "Continue" button disabled until selection made
- ✅ Redux integration (dispatch setDuration action)
- ✅ Navigation to Calendar Picker on Continue
- ✅ EAA compliance (WCAG 2.1 Level AA)
- ✅ RNTL tests achieve 100% coverage
- ✅ Storybook stories (default, selected, dark mode)
- ✅ All validation passes (`yarn validate`)

---

## Screen Mockup

```
┌─────────────────────────────────────────────┐
│  < Back          Duration           [i]     │ ← Header with title & info button
├─────────────────────────────────────────────┤
│                                             │
│  How long should the meeting be?            │ ← Section header (uppercase)
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │           15 minutes                │   │ ← Unselected button
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  ●       30 minutes                 │   │ ← Selected button (blue bg, checkmark)
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │           45 minutes                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │           60 minutes                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │           90 minutes                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │          Continue                   │   │ ← Primary button (disabled until selection)
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Component Implementation

```typescript
// src/features/Booking/DurationSelectionScreen.tsx

import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Box, Text, ScrollView, Pressable } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { setDuration, selectDuration } from '@app/store/slices/bookingSlice';
import { MEETING_DURATIONS, type MeetingDuration } from '@app/features/Booking';
import { useAppColorScheme } from '@app/hooks/useAppColorScheme';
import type { BookingStackParamList } from '@app/navigation/types';
import { Icon } from '@app/components';

type DurationSelectionScreenNavigationProp = NativeStackNavigationProp<
  BookingStackParamList,
  'DurationSelection'
>;

/**
 * Duration option button props
 */
interface DurationOptionProps {
  duration: MeetingDuration;
  selected: boolean;
  onSelect: (duration: MeetingDuration) => void;
  colorScheme: 'light' | 'dark';
}

/**
 * Individual duration option button
 *
 * EAA Requirements:
 * - Minimum touch target: 48×48 (minHeight="$12")
 * - accessibilityRole="button"
 * - accessibilityState includes selected state
 * - accessibilityLabel describes the option
 * - accessibilityHint explains what happens on tap
 */
const DurationOption: React.FC<DurationOptionProps> = React.memo(
  ({ duration, selected, onSelect, colorScheme }) => {
    const { t } = useTranslation();

    const handlePress = useCallback(() => {
      onSelect(duration);
    }, [duration, onSelect]);

    return (
      <Pressable
        onPress={handlePress}
        bg={selected ? '$blue500' : colorScheme === 'dark' ? '$coolGray800' : '$white'}
        borderRadius="$lg"
        minHeight="$12" // 48pt minimum for EAA compliance
        px="$4"
        py="$3"
        mb="$3"
        borderWidth={1}
        borderColor={
          selected
            ? '$blue500'
            : colorScheme === 'dark'
              ? '$coolGray700'
              : '$coolGray200'
        }
        accessibilityRole="button"
        accessibilityLabel={t('booking.duration.optionLabel', {
          duration,
        })}
        accessibilityHint={t('booking.duration.optionHint')}
        accessibilityState={{ selected }}
        testID={`duration-option-${duration}`}
        sx={{
          ':active': {
            opacity: 0.7,
          },
        }}
      >
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Text
            fontSize="$md"
            fontWeight={selected ? '$semibold' : '$normal'}
            color={selected ? '$white' : colorScheme === 'dark' ? '$white' : '$black'}
          >
            {t('booking.duration.minutes', { count: duration })}
          </Text>
          {selected && (
            <Icon
              name="checkmark-circle"
              size={24}
              color="white"
              testID={`duration-option-${duration}-checkmark`}
            />
          )}
        </Box>
      </Pressable>
    );
  },
);

DurationOption.displayName = 'DurationOption';

/**
 * Duration Selection Screen
 *
 * First screen in booking flow. Users select meeting duration
 * from 5 predefined options (15, 30, 45, 60, 90 minutes).
 *
 * Navigation flow:
 * - On Continue → CalendarPickerScreen
 * - On Back → HomeScreen (or previous screen in stack)
 *
 * State management:
 * - Duration stored in Redux (bookingSlice)
 * - Selection persists during session (not persisted to AsyncStorage)
 *
 * EAA Requirements:
 * - All interactive elements have 48×48 minimum touch targets
 * - Screen reader accessible labels and hints
 * - Keyboard navigation support
 * - High contrast mode support (automatic via tokens)
 */
export const DurationSelectionScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<DurationSelectionScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const colorScheme = useAppColorScheme();
  const selectedDuration = useAppSelector(selectDuration);

  /**
   * Handle duration selection
   */
  const handleSelectDuration = useCallback(
    (duration: MeetingDuration) => {
      dispatch(setDuration(duration));
    },
    [dispatch],
  );

  /**
   * Handle Continue button press
   * Navigate to calendar picker with selected duration
   */
  const handleContinue = useCallback(() => {
    if (!selectedDuration) return;

    navigation.navigate('CalendarPicker', {
      duration: selectedDuration,
    });
  }, [navigation, selectedDuration]);

  /**
   * Check if Continue button should be enabled
   */
  const isContinueEnabled = useMemo(() => {
    return selectedDuration !== null;
  }, [selectedDuration]);

  return (
    <Box flex={1} bg={colorScheme === 'dark' ? '$black' : '$coolGray50'}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        testID="duration-selection-scroll"
      >
        <Box px="$4" py="$6">
          {/* Section Header */}
          <Text
            fontSize="$xs"
            fontWeight="$semibold"
            color="$coolGray500"
            textTransform="uppercase"
            letterSpacing="$sm"
            mb="$4"
            testID="duration-section-header"
          >
            {t('booking.duration.sectionHeader')}
          </Text>

          {/* Duration Options */}
          {MEETING_DURATIONS.map((duration) => (
            <DurationOption
              key={duration}
              duration={duration}
              selected={selectedDuration === duration}
              onSelect={handleSelectDuration}
              colorScheme={colorScheme}
            />
          ))}

          {/* Continue Button */}
          <Pressable
            onPress={handleContinue}
            bg={isContinueEnabled ? '$blue500' : '$coolGray300'}
            borderRadius="$lg"
            minHeight="$12" // 48pt minimum for EAA compliance
            px="$4"
            py="$3"
            mt="$6"
            alignItems="center"
            justifyContent="center"
            disabled={!isContinueEnabled}
            accessibilityRole="button"
            accessibilityLabel={t('booking.duration.continueButton')}
            accessibilityHint={t('booking.duration.continueHint')}
            accessibilityState={{ disabled: !isContinueEnabled }}
            testID="duration-continue-button"
            sx={{
              ':active': {
                opacity: isContinueEnabled ? 0.7 : 1,
              },
            }}
          >
            <Text
              fontSize="$md"
              fontWeight="$semibold"
              color={isContinueEnabled ? '$white' : '$coolGray500'}
            >
              {t('common.continue')}
            </Text>
          </Pressable>
        </Box>
      </ScrollView>
    </Box>
  );
};
```

---

## Navigation Configuration

```typescript
// src/navigation/BookingNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DurationSelectionScreen } from '@app/features/Booking/DurationSelectionScreen';
import { CalendarPickerScreen } from '@app/features/Booking/CalendarPickerScreen';
import { TimeSlotsScreen } from '@app/features/Booking/TimeSlotsScreen';
import { MeetingDetailsScreen } from '@app/features/Booking/MeetingDetailsScreen';

export type BookingStackParamList = {
  DurationSelection: undefined;
  CalendarPicker: { duration: number };
  TimeSlots: { duration: number; date: string };
  MeetingDetails: undefined;
};

const Stack = createNativeStackNavigator<BookingStackParamList>();

export const BookingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerLargeTitle: false,
      }}
    >
      <Stack.Screen
        name="DurationSelection"
        component={DurationSelectionScreen}
        options={{
          title: 'Duration',
        }}
      />
      <Stack.Screen
        name="CalendarPicker"
        component={CalendarPickerScreen}
        options={{
          title: 'Select Date',
        }}
      />
      <Stack.Screen
        name="TimeSlots"
        component={TimeSlotsScreen}
        options={{
          title: 'Select Time',
        }}
      />
      <Stack.Screen
        name="MeetingDetails"
        component={MeetingDetailsScreen}
        options={{
          title: 'Meeting Details',
        }}
      />
    </Stack.Navigator>
  );
};
```

---

## RNTL Tests

```typescript
// src/features/Booking/__tests__/DurationSelectionScreen.rntl.tsx

import React from 'react';
import { renderWithProviders } from '@app/test-utils/renderWithProviders';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { DurationSelectionScreen } from '../DurationSelectionScreen';
import { MEETING_DURATIONS } from '@app/features/Booking';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('DurationSelectionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    renderWithProviders(<DurationSelectionScreen />);

    expect(screen.getByTestId('duration-section-header')).toBeOnTheScreen();
    expect(screen.getByTestId('duration-continue-button')).toBeOnTheScreen();
  });

  it('displays all duration options', () => {
    renderWithProviders(<DurationSelectionScreen />);

    MEETING_DURATIONS.forEach((duration) => {
      expect(screen.getByTestId(`duration-option-${duration}`)).toBeOnTheScreen();
    });
  });

  it('disables Continue button initially', () => {
    renderWithProviders(<DurationSelectionScreen />);

    const continueButton = screen.getByTestId('duration-continue-button');
    expect(continueButton).toBeDisabled();
  });

  it('enables Continue button when duration selected', async () => {
    renderWithProviders(<DurationSelectionScreen />);

    const option30 = screen.getByTestId('duration-option-30');
    fireEvent.press(option30);

    await waitFor(() => {
      const continueButton = screen.getByTestId('duration-continue-button');
      expect(continueButton).toBeEnabled();
    });
  });

  it('dispatches setDuration action when option pressed', async () => {
    const { store } = renderWithProviders(<DurationSelectionScreen />);

    const option45 = screen.getByTestId('duration-option-45');
    fireEvent.press(option45);

    await waitFor(() => {
      const state = store.getState();
      expect(state.booking.form.duration).toBe(45);
    });
  });

  it('shows checkmark on selected option', async () => {
    renderWithProviders(<DurationSelectionScreen />);

    const option60 = screen.getByTestId('duration-option-60');
    fireEvent.press(option60);

    await waitFor(() => {
      expect(screen.getByTestId('duration-option-60-checkmark')).toBeOnTheScreen();
    });
  });

  it('allows changing selection', async () => {
    const { store } = renderWithProviders(<DurationSelectionScreen />);

    // Select 30 minutes
    fireEvent.press(screen.getByTestId('duration-option-30'));

    await waitFor(() => {
      expect(store.getState().booking.form.duration).toBe(30);
    });

    // Change to 60 minutes
    fireEvent.press(screen.getByTestId('duration-option-60'));

    await waitFor(() => {
      expect(store.getState().booking.form.duration).toBe(60);
    });
  });

  it('navigates to CalendarPicker when Continue pressed', async () => {
    renderWithProviders(<DurationSelectionScreen />);

    // Select duration
    fireEvent.press(screen.getByTestId('duration-option-30'));

    await waitFor(() => {
      expect(screen.getByTestId('duration-continue-button')).toBeEnabled();
    });

    // Press Continue
    fireEvent.press(screen.getByTestId('duration-continue-button'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('CalendarPicker', { duration: 30 });
    });
  });

  it('does not navigate when Continue pressed without selection', () => {
    renderWithProviders(<DurationSelectionScreen />);

    const continueButton = screen.getByTestId('duration-continue-button');
    fireEvent.press(continueButton);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('has correct accessibility props on duration options', () => {
    renderWithProviders(<DurationSelectionScreen />);

    const option30 = screen.getByTestId('duration-option-30');
    expect(option30).toHaveAccessibilityRole('button');
    expect(option30).toHaveAccessibilityState({ selected: false });
  });

  it('updates accessibility state when option selected', async () => {
    renderWithProviders(<DurationSelectionScreen />);

    const option30 = screen.getByTestId('duration-option-30');
    fireEvent.press(option30);

    await waitFor(() => {
      expect(option30).toHaveAccessibilityState({ selected: true });
    });
  });

  it('has correct accessibility props on Continue button', () => {
    renderWithProviders(<DurationSelectionScreen />);

    const continueButton = screen.getByTestId('duration-continue-button');
    expect(continueButton).toHaveAccessibilityRole('button');
    expect(continueButton).toHaveAccessibilityState({ disabled: true });
  });

  it('restores previous selection from Redux', () => {
    const preloadedState = {
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
        availableDates: { dates: [], loading: false, error: null, month: null },
        timeSlots: { slots: [], loading: false, error: null, loadedDate: null },
        creation: { loading: false, error: null, result: null },
      },
    };

    renderWithProviders(<DurationSelectionScreen />, { preloadedState });

    expect(screen.getByTestId('duration-option-45-checkmark')).toBeOnTheScreen();
    expect(screen.getByTestId('duration-continue-button')).toBeEnabled();
  });

  describe('dark mode', () => {
    it('renders correctly in dark mode', () => {
      renderWithProviders(<DurationSelectionScreen />, { colorScheme: 'dark' });

      expect(screen.getByTestId('duration-section-header')).toBeOnTheScreen();
      expect(screen.getByTestId('duration-continue-button')).toBeOnTheScreen();
    });
  });

  describe('i18n', () => {
    it('displays translated section header', () => {
      renderWithProviders(<DurationSelectionScreen />);

      const header = screen.getByTestId('duration-section-header');
      expect(header).toHaveTextContent('How long should the meeting be?');
    });

    it('displays duration in Spanish locale', () => {
      renderWithProviders(<DurationSelectionScreen />, { locale: 'es' });

      const option30 = screen.getByTestId('duration-option-30');
      expect(option30).toHaveTextContent('30 minutos');
    });
  });
});
```

---

## Storybook Stories

```typescript
// src/features/Booking/DurationSelectionScreen.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { DurationSelectionScreen } from './DurationSelectionScreen';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from '@app/store/slices/bookingSlice';

const meta: Meta<typeof DurationSelectionScreen> = {
  title: 'Booking/DurationSelectionScreen',
  component: DurationSelectionScreen,
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

type Story = StoryObj<typeof DurationSelectionScreen>;

/**
 * Default state - no duration selected
 */
export const Default: Story = {
  parameters: {
    preloadedState: {
      booking: {
        form: {
          duration: null,
          date: null,
          selectedSlot: null,
          meetingType: null,
          title: '',
          description: '',
          timezone: 'Europe/Madrid',
        },
        availableDates: { dates: [], loading: false, error: null, month: null },
        timeSlots: { slots: [], loading: false, error: null, loadedDate: null },
        creation: { loading: false, error: null, result: null },
      },
    },
  },
};

/**
 * With 30 minutes selected
 */
export const WithSelection: Story = {
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
        availableDates: { dates: [], loading: false, error: null, month: null },
        timeSlots: { slots: [], loading: false, error: null, loadedDate: null },
        creation: { loading: false, error: null, result: null },
      },
    },
  },
};

/**
 * With 90 minutes selected
 */
export const LongMeeting: Story = {
  parameters: {
    preloadedState: {
      booking: {
        form: {
          duration: 90,
          date: null,
          selectedSlot: null,
          meetingType: null,
          title: '',
          description: '',
          timezone: 'Europe/Madrid',
        },
        availableDates: { dates: [], loading: false, error: null, month: null },
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
        availableDates: { dates: [], loading: false, error: null, month: null },
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
    "duration": {
      "sectionHeader": "How long should the meeting be?",
      "minutes": "{{count}} minutes",
      "optionLabel": "{{duration}} minutes meeting duration",
      "optionHint": "Select this meeting duration",
      "continueButton": "Continue to date selection",
      "continueHint": "Proceed to select a date for your meeting"
    }
  },
  "common": {
    "continue": "Continue"
  }
}
```

Add to `src/i18n/locales/es.json`:

```json
{
  "booking": {
    "duration": {
      "sectionHeader": "¿Cuánto debe durar la reunión?",
      "minutes": "{{count}} minutos",
      "optionLabel": "Duración de reunión de {{duration}} minutos",
      "optionHint": "Seleccionar esta duración de reunión",
      "continueButton": "Continuar a selección de fecha",
      "continueHint": "Continuar para seleccionar una fecha para tu reunión"
    }
  },
  "common": {
    "continue": "Continuar"
  }
}
```

---

## EAA Compliance Checklist

- [ ] All buttons have `minHeight="$12"` (48pt minimum)
- [ ] All interactive elements have `accessibilityRole`
- [ ] All interactive elements have `accessibilityLabel`
- [ ] All interactive elements have `accessibilityHint`
- [ ] Selected state conveyed via `accessibilityState`
- [ ] Disabled state conveyed via `accessibilityState`
- [ ] Colour contrast meets WCAG 2.1 Level AA (4.5:1 for text)
- [ ] Touch targets meet minimum size (48×48 on Android, 44×44 on iOS)
- [ ] Screen reader announces selected option correctly
- [ ] Keyboard navigation supported (via RN default behaviour)

---

## Testing Checklist

- [ ] Screen renders all duration options
- [ ] Continue button disabled initially
- [ ] Continue button enabled when duration selected
- [ ] Redux action dispatched on selection
- [ ] Checkmark appears on selected option
- [ ] Selection can be changed
- [ ] Navigation occurs when Continue pressed
- [ ] Navigation blocked when Continue pressed without selection
- [ ] Previous selection restored from Redux
- [ ] Accessibility props correct on all elements
- [ ] Dark mode renders correctly
- [ ] i18n translations display correctly
- [ ] RNTL tests achieve 100% coverage
- [ ] Storybook stories render in all states
- [ ] `yarn validate` passes (typecheck + lint + test)

---

## Notes

- Uses GlueStack tokens exclusively (no hex colours or pixel values)
- Follows iOS design patterns (grouped lists, large buttons)
- Redux state not persisted (session-based booking)
- Duration options are constants (MEETING_DURATIONS array)
- Memoised components for performance (React.memo, useCallback, useMemo)
- Changing duration clears dependent fields (date, time slot) in Redux reducer
