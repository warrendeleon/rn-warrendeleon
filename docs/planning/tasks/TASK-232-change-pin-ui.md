# TASK-232: ChangePINScreen UI Implementation

**ID**: TASK-232 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-040](../stories/US-040-change-pin.md)
**Status**: 📋 To Do | **Effort**: 2h | **Priority**: Critical

## File Structure

```
src/features/Auth/
├── screens/
│   ├── ChangePINScreen.tsx
│   └── __tests__/
│       └── ChangePINScreen.rntl.tsx
└── validation/
    └── changePinSchema.ts
```

**Note**: PIN management is Auth-specific functionality, co-located with Auth feature following feature-first architecture (established in TASK-196).

---

## Task Description

Create the ChangePINScreen component with three PIN input fields (current, new, confirm), comprehensive validation feedback, error handling, and submit functionality. Implement React Hook Form for state management with Yup validation, Redux integration for auth state, and full EAA compliance.

This screen is the primary interface for users to change their security PIN and must handle all error scenarios gracefully, including wrong current PIN, network failures, and rate limiting after 3 failed attempts.

---

## Acceptance Criteria

- [ ] ChangePINScreen component created in `src/features/Auth/screens/ChangePINScreen.tsx`
- [ ] Three secured PIN input fields rendered with dot masking
- [ ] Real-time validation feedback for each field
- [ ] Submit button disabled until all fields are valid
- [ ] Error messages display below invalid fields with proper accessibility
- [ ] Success message shown after PIN change with auto-navigation
- [ ] Loading indicator during PIN change operation
- [ ] Wrong current PIN error handled with retry count
- [ ] Rate limiting after 3 failed attempts (30-second lockout)
- [ ] Network error handling with retry option
- [ ] Back button navigates to SettingsScreen
- [ ] All EAA accessibility requirements met (WCAG 2.1 Level AA)
- [ ] Redux integration for auth state updates
- [ ] 100% unit test coverage (RNTL)
- [ ] E2E test coverage (Detox + Cucumber)

---

## Implementation Details

### Component Structure

```typescript
// src/screens/settings/ChangePINScreen.tsx

import React, { useState, useCallback } from 'react';
import { SafeAreaView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import {
  Box,
  VStack,
  HStack,
  Button,
  ButtonText,
  Text,
  Spinner,
  Pressable,
} from '@gluestack-ui/themed';
import { PINInput } from '../../components/forms/PINInput';
import { ErrorMessage } from '../../components/forms/ErrorMessage';
import { validatePIN } from '../../utils/pinValidation';
import { changePIN } from '../../services/storage/keychainService';
import { updateSecuritySettings } from '../../store/auth/authSlice';
import { useRateLimiter } from '../../hooks/useRateLimiter';

const changePINSchema = yup.object({
  currentPIN: yup
    .string()
    .required('Current PIN is required')
    .matches(/^\d{6}$/, 'PIN must be 6 digits'),
  newPIN: yup
    .string()
    .required('New PIN is required')
    .matches(/^\d{6}$/, 'PIN must be 6 digits')
    .test('pin-strength', 'This PIN is too easy to guess', (value) => {
      if (!value) return false;
      const validation = validatePIN(value);
      return validation.isValid;
    })
    .test('pin-different', 'New PIN must be different from current PIN', function (value) {
      return value !== this.parent.currentPIN;
    }),
  confirmPIN: yup
    .string()
    .required('Please confirm your new PIN')
    .oneOf([yup.ref('newPIN')], 'PINs must match'),
});

type ChangePINFormData = yup.InferType<typeof changePINSchema>;

interface ChangePINError {
  type: 'wrong_pin' | 'network' | 'rate_limit' | 'unknown';
  message: string;
  retryCount?: number;
}

export const ChangePINScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<ChangePINError | null>(null);

  const { isLimited, remainingTime, incrementAttempts, reset: resetRateLimit } = useRateLimiter({
    maxAttempts: 3,
    windowMs: 30000, // 30 seconds
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setError: setFormError,
  } = useForm<ChangePINFormData>({
    resolver: yupResolver(changePINSchema),
    mode: 'onChange',
  });

  const onSubmit = useCallback(async (data: ChangePINFormData) => {
    try {
      // Check rate limiting
      if (isLimited) {
        setError({
          type: 'rate_limit',
          message: `Too many attempts. Please wait ${remainingTime} seconds.`,
        });
        return;
      }

      setIsLoading(true);
      setError(null);

      // Attempt to change PIN
      await changePIN(data.currentPIN, data.newPIN);

      // Update Redux state
      dispatch(
        updateSecuritySettings({
          pinLastChanged: new Date().toISOString(),
        })
      );

      // Reset rate limiter on success
      resetRateLimit();

      // Show success message
      setSuccessMessage('PIN changed successfully');
      reset();

      // Navigate back after 2 seconds
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error: any) {
      console.error('[ChangePIN] Failed to change PIN:', error);

      // Increment rate limit attempts
      incrementAttempts();

      // Handle specific error types
      if (error.code === 'WRONG_PIN') {
        const attemptsRemaining = 3 - (error.attemptCount || 1);
        setError({
          type: 'wrong_pin',
          message: `Current PIN is incorrect. ${attemptsRemaining} attempts remaining.`,
          retryCount: error.attemptCount,
        });
        setFormError('currentPIN', {
          type: 'manual',
          message: 'Incorrect PIN',
        });
      } else if (error.code === 'NETWORK_ERROR') {
        setError({
          type: 'network',
          message: 'Network error. Please check your connection and try again.',
        });
      } else {
        setError({
          type: 'unknown',
          message: error.message || 'An unexpected error occurred. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLimited, remainingTime, dispatch, incrementAttempts, resetRateLimit, navigation, reset, setFormError]);

  const handleRetry = useCallback(() => {
    setError(null);
    reset();
  }, [reset]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      testID="change-pin-screen"
      accessible={true}
      accessibilityLabel="Change PIN screen"
    >
      <Box flex={1} padding="$6">
        <VStack space="xl">
          {/* Header */}
          <VStack space="xs">
            <Text
              fontSize="$2xl"
              fontWeight="$bold"
              color="$gray900"
              accessibilityRole="header"
              accessibilityLabel="Change PIN"
            >
              Change PIN
            </Text>
            <Text fontSize="$sm" color="$gray600">
              Enter your current PIN and choose a new one. Your new PIN must be 6 digits and not easy to guess.
            </Text>
          </VStack>

          {/* Error Alert */}
          {error && (
            <Box
              backgroundColor={error.type === 'rate_limit' ? '$orange100' : '$red100'}
              borderColor={error.type === 'rate_limit' ? '$orange600' : '$red600'}
              borderWidth={1}
              borderRadius="$md"
              padding="$4"
              testID="error-alert"
              accessibilityRole="alert"
              accessibilityLabel={`Error: ${error.message}`}
              accessibilityLiveRegion="polite"
            >
              <HStack space="sm" alignItems="center">
                <Text fontSize="$lg" accessibilityHidden={true}>
                  {error.type === 'rate_limit' ? '⚠️' : '❌'}
                </Text>
                <VStack flex={1} space="xs">
                  <Text color="$gray900" fontWeight="$semibold">
                    {error.type === 'wrong_pin'
                      ? 'Incorrect PIN'
                      : error.type === 'rate_limit'
                      ? 'Too Many Attempts'
                      : error.type === 'network'
                      ? 'Network Error'
                      : 'Error'}
                  </Text>
                  <Text color="$gray700" fontSize="$sm">
                    {error.message}
                  </Text>
                  {error.type === 'network' && (
                    <Pressable
                      onPress={handleRetry}
                      marginTop="$2"
                      testID="retry-button"
                      accessibilityRole="button"
                      accessibilityLabel="Retry"
                      accessibilityHint="Try changing PIN again"
                    >
                      <Text color="$blue600" fontWeight="$semibold">
                        Retry
                      </Text>
                    </Pressable>
                  )}
                </VStack>
              </HStack>
            </Box>
          )}

          {/* Form */}
          <VStack space="lg">
            {/* Current PIN */}
            <VStack space="xs">
              <Text
                fontSize="$sm"
                fontWeight="$medium"
                color="$gray700"
                accessibilityLabel="Current PIN input"
              >
                Current PIN
              </Text>
              <Controller
                control={control}
                name="currentPIN"
                render={({ field: { onChange, value } }) => (
                  <PINInput
                    value={value}
                    onChangeText={onChange}
                    length={6}
                    testID="current-pin-input"
                    accessibilityLabel="Current PIN"
                    accessibilityHint="Enter your current 6-digit PIN"
                    editable={!isLoading && !isLimited}
                  />
                )}
              />
              <ErrorMessage
                error={errors.currentPIN?.message}
                fieldLabel="Current PIN"
                testID="current-pin-error"
              />
            </VStack>

            {/* New PIN */}
            <VStack space="xs">
              <Text
                fontSize="$sm"
                fontWeight="$medium"
                color="$gray700"
                accessibilityLabel="New PIN input"
              >
                New PIN
              </Text>
              <Controller
                control={control}
                name="newPIN"
                render={({ field: { onChange, value } }) => (
                  <PINInput
                    value={value}
                    onChangeText={onChange}
                    length={6}
                    testID="new-pin-input"
                    accessibilityLabel="New PIN"
                    accessibilityHint="Enter your new 6-digit PIN"
                    editable={!isLoading && !isLimited}
                  />
                )}
              />
              <ErrorMessage
                error={errors.newPIN?.message}
                fieldLabel="New PIN"
                testID="new-pin-error"
              />
              <Text fontSize="$xs" color="$gray500">
                Avoid simple patterns like 123456, 111111, or birthdates
              </Text>
            </VStack>

            {/* Confirm PIN */}
            <VStack space="xs">
              <Text
                fontSize="$sm"
                fontWeight="$medium"
                color="$gray700"
                accessibilityLabel="Confirm PIN input"
              >
                Confirm New PIN
              </Text>
              <Controller
                control={control}
                name="confirmPIN"
                render={({ field: { onChange, value } }) => (
                  <PINInput
                    value={value}
                    onChangeText={onChange}
                    length={6}
                    testID="confirm-new-pin-input"
                    accessibilityLabel="Confirm new PIN"
                    accessibilityHint="Re-enter your new PIN to confirm"
                    editable={!isLoading && !isLimited}
                  />
                )}
              />
              <ErrorMessage
                error={errors.confirmPIN?.message}
                fieldLabel="Confirm PIN"
                testID="confirm-pin-error"
              />
            </VStack>

            {/* Success Message */}
            {successMessage && (
              <Box
                backgroundColor="$green100"
                borderColor="$green600"
                borderWidth={1}
                borderRadius="$md"
                padding="$3"
                testID="success-message"
                accessibilityRole="alert"
                accessibilityLabel={successMessage}
                accessibilityLiveRegion="polite"
              >
                <HStack space="sm" alignItems="center">
                  <Text fontSize="$lg" accessibilityHidden={true}>
                    ✓
                  </Text>
                  <Text color="$green800">{successMessage}</Text>
                </HStack>
              </Box>
            )}

            {/* Submit Button */}
            <Button
              onPress={handleSubmit(onSubmit)}
              isDisabled={!isValid || isLoading || isLimited}
              backgroundColor="$blue600"
              minHeight={48}
              testID="change-pin-submit-button"
              accessibilityRole="button"
              accessibilityLabel="Change PIN"
              accessibilityHint="Submit your new PIN"
              accessibilityState={{
                disabled: !isValid || isLoading || isLimited,
                busy: isLoading,
              }}
            >
              {isLoading ? (
                <HStack space="sm" alignItems="center">
                  <Spinner color="$white" />
                  <ButtonText>Changing PIN...</ButtonText>
                </HStack>
              ) : (
                <ButtonText>Change PIN</ButtonText>
              )}
            </Button>

            {/* Cancel Button */}
            <Pressable
              onPress={() => navigation.goBack()}
              padding="$3"
              testID="cancel-button"
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              accessibilityHint="Go back without changing PIN"
            >
              <Text color="$blue600" textAlign="center" fontWeight="$medium">
                Cancel
              </Text>
            </Pressable>
          </VStack>
        </VStack>
      </Box>
    </SafeAreaView>
  );
};
```

---

## Error Handling Scenarios

### 1. Wrong Current PIN

```typescript
// After 3 failed attempts, show rate limit error
if (attemptCount >= 3) {
  throw new Error({
    code: 'RATE_LIMIT',
    message: 'Too many failed attempts. Please wait 30 seconds.',
  });
}
```

**User Experience**:

- First failure: "Current PIN is incorrect. 2 attempts remaining."
- Second failure: "Current PIN is incorrect. 1 attempt remaining."
- Third failure: Rate limit triggered, 30-second lockout

### 2. Network Error

```typescript
// Retry with exponential backoff
const retryWithBackoff = async (fn: () => Promise<void>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await fn();
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};
```

**User Experience**:

- Show network error alert with "Retry" button
- Auto-retry with exponential backoff (1s, 2s, 4s)
- Allow manual retry after failure

### 3. Rate Limiting

```typescript
// Hook: useRateLimiter
export const useRateLimiter = ({ maxAttempts, windowMs }) => {
  const [attempts, setAttempts] = useState(0);
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null);

  const isLimited = lockoutEnd && Date.now() < lockoutEnd;
  const remainingTime = lockoutEnd ? Math.ceil((lockoutEnd - Date.now()) / 1000) : 0;

  const incrementAttempts = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= maxAttempts) {
      setLockoutEnd(Date.now() + windowMs);
    }
  };

  return { isLimited, remainingTime, incrementAttempts, reset: () => setAttempts(0) };
};
```

---

## Redux Integration

### Auth Slice Update

```typescript
// src/store/auth/authSlice.ts

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateSecuritySettings: (state, action: PayloadAction<{ pinLastChanged: string }>) => {
      state.securitySettings = {
        ...state.securitySettings,
        ...action.payload,
      };
    },
  },
});
```

**Dispatch after successful PIN change**:

```typescript
dispatch(
  updateSecuritySettings({
    pinLastChanged: new Date().toISOString(),
  })
);
```

---

## EAA Accessibility Implementation

### Touch Targets

All interactive elements meet EAA requirements:

- **Button**: `minHeight={48}` (48×48 minimum)
- **PINInput**: Each digit box is 56×56 (exceeds minimum)
- **Pressable (Cancel)**: padding="$3" ensures 48×48 minimum

### Screen Reader Support

```typescript
// Proper accessibility labels
accessibilityLabel="Change PIN screen"
accessibilityRole="header"
accessibilityHint="Enter your current 6-digit PIN"
accessibilityLiveRegion="polite" // For error/success alerts
accessibilityState={{ disabled: !isValid, busy: isLoading }}
```

### Color Contrast

- Error text: #991B1B on #FEE2E2 (4.5:1 ratio ✓)
- Success text: #166534 on #DCFCE7 (4.8:1 ratio ✓)
- Primary text: #111827 on #FFFFFF (18.5:1 ratio ✓)
- Gray text: #4B5563 on #FFFFFF (9.4:1 ratio ✓)

### Focus Management

```typescript
// Auto-focus first PIN input on mount
useEffect(() => {
  const timer = setTimeout(() => {
    currentPINInputRef.current?.focus();
  }, 300);
  return () => clearTimeout(timer);
}, []);
```

---

## Testing Requirements

### Unit Tests (RNTL)

```typescript
// src/screens/settings/__tests__/ChangePINScreen.test.tsx

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ChangePINScreen } from '../ChangePINScreen';
import * as keychainService from '../../../services/storage/keychainService';

jest.mock('../../../services/storage/keychainService');
const mockKeychainService = keychainService as jest.Mocked<typeof keychainService>;

describe('ChangePINScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all three PIN input fields', () => {
      const { getByTestId } = render(<ChangePINScreen />);

      expect(getByTestId('current-pin-input')).toBeTruthy();
      expect(getByTestId('new-pin-input')).toBeTruthy();
      expect(getByTestId('confirm-new-pin-input')).toBeTruthy();
    });

    it('should render header with correct text', () => {
      const { getByText } = render(<ChangePINScreen />);

      expect(getByText('Change PIN')).toBeTruthy();
      expect(getByText(/Enter your current PIN/)).toBeTruthy();
    });

    it('should render submit and cancel buttons', () => {
      const { getByTestId } = render(<ChangePINScreen />);

      expect(getByTestId('change-pin-submit-button')).toBeTruthy();
      expect(getByTestId('cancel-button')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when fields are empty', () => {
      const { getByTestId } = render(<ChangePINScreen />);

      expect(getByTestId('change-pin-submit-button')).toBeDisabled();
    });

    it('should enable submit button when all fields are valid', async () => {
      const { getByTestId } = render(<ChangePINScreen />);

      fireEvent.changeText(getByTestId('current-pin-input'), '123456');
      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');

      await waitFor(() => {
        expect(getByTestId('change-pin-submit-button')).toBeEnabled();
      });
    });

    it('should show error when current PIN is less than 6 digits', async () => {
      const { getByTestId } = render(<ChangePINScreen />);

      fireEvent.changeText(getByTestId('current-pin-input'), '12345');

      await waitFor(() => {
        expect(getByTestId('current-pin-error')).toHaveTextContent('PIN must be 6 digits');
      });
    });

    it('should show error when new PIN matches current PIN', async () => {
      const { getByTestId } = render(<ChangePINScreen />);

      fireEvent.changeText(getByTestId('current-pin-input'), '123456');
      fireEvent.changeText(getByTestId('new-pin-input'), '123456');

      await waitFor(() => {
        expect(getByTestId('new-pin-error')).toHaveTextContent('New PIN must be different');
      });
    });

    it('should show error when PINs do not match', async () => {
      const { getByTestId } = render(<ChangePINScreen />);

      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '123456');

      await waitFor(() => {
        expect(getByTestId('confirm-pin-error')).toHaveTextContent('PINs must match');
      });
    });

    it('should show error for weak PIN (sequential)', async () => {
      const { getByTestId } = render(<ChangePINScreen />);

      fireEvent.changeText(getByTestId('new-pin-input'), '123456');

      await waitFor(() => {
        expect(getByTestId('new-pin-error')).toHaveTextContent('too easy to guess');
      });
    });

    it('should show error for weak PIN (repeated)', async () => {
      const { getByTestId } = render(<ChangePINScreen />);

      fireEvent.changeText(getByTestId('new-pin-input'), '111111');

      await waitFor(() => {
        expect(getByTestId('new-pin-error')).toHaveTextContent('too easy to guess');
      });
    });
  });

  describe('PIN Change Success', () => {
    it('should show success message after PIN change', async () => {
      mockKeychainService.changePIN.mockResolvedValue();

      const { getByTestId } = render(<ChangePINScreen />);

      fireEvent.changeText(getByTestId('current-pin-input'), '123456');
      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');
      fireEvent.press(getByTestId('change-pin-submit-button'));

      await waitFor(() => {
        expect(getByTestId('success-message')).toHaveTextContent('PIN changed successfully');
      });
    });

    it('should call changePIN service with correct arguments', async () => {
      mockKeychainService.changePIN.mockResolvedValue();

      const { getByTestId } = render(<ChangePINScreen />);

      fireEvent.changeText(getByTestId('current-pin-input'), '123456');
      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');
      fireEvent.press(getByTestId('change-pin-submit-button'));

      await waitFor(() => {
        expect(mockKeychainService.changePIN).toHaveBeenCalledWith('123456', '654321');
      });
    });

    it('should navigate back after 2 seconds', async () => {
      jest.useFakeTimers();
      mockKeychainService.changePIN.mockResolvedValue();
      const mockGoBack = jest.fn();
      const mockNavigation = { goBack: mockGoBack };

      const { getByTestId } = render(<ChangePINScreen navigation={mockNavigation} />);

      fireEvent.changeText(getByTestId('current-pin-input'), '123456');
      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');
      fireEvent.press(getByTestId('change-pin-submit-button'));

      await waitFor(() => {
        expect(getByTestId('success-message')).toBeTruthy();
      });

      jest.advanceTimersByTime(2000);

      expect(mockGoBack).toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should show error for wrong current PIN', async () => {
      mockKeychainService.changePIN.mockRejectedValue({
        code: 'WRONG_PIN',
        attemptCount: 1,
      });

      const { getByTestId } = render(<ChangePINScreen />);

      fireEvent.changeText(getByTestId('current-pin-input'), '123456');
      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');
      fireEvent.press(getByTestId('change-pin-submit-button'));

      await waitFor(() => {
        expect(getByTestId('error-alert')).toHaveTextContent('2 attempts remaining');
      });
    });

    it('should show network error with retry button', async () => {
      mockKeychainService.changePIN.mockRejectedValue({
        code: 'NETWORK_ERROR',
      });

      const { getByTestId } = render(<ChangePINScreen />);

      fireEvent.changeText(getByTestId('current-pin-input'), '123456');
      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');
      fireEvent.press(getByTestId('change-pin-submit-button'));

      await waitFor(() => {
        expect(getByTestId('error-alert')).toHaveTextContent('Network error');
        expect(getByTestId('retry-button')).toBeTruthy();
      });
    });

    it('should trigger rate limit after 3 failed attempts', async () => {
      mockKeychainService.changePIN.mockRejectedValue({
        code: 'WRONG_PIN',
      });

      const { getByTestId } = render(<ChangePINScreen />);

      fireEvent.changeText(getByTestId('current-pin-input'), '123456');
      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');

      // Attempt 1
      fireEvent.press(getByTestId('change-pin-submit-button'));
      await waitFor(() => expect(getByTestId('error-alert')).toBeTruthy());

      // Attempt 2
      fireEvent.press(getByTestId('change-pin-submit-button'));
      await waitFor(() => expect(getByTestId('error-alert')).toBeTruthy());

      // Attempt 3
      fireEvent.press(getByTestId('change-pin-submit-button'));
      await waitFor(() => {
        expect(getByTestId('error-alert')).toHaveTextContent('Too many attempts');
        expect(getByTestId('change-pin-submit-button')).toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility labels', () => {
      const { getByTestId } = render(<ChangePINScreen />);

      expect(getByTestId('current-pin-input')).toHaveProp('accessibilityLabel', 'Current PIN');
      expect(getByTestId('new-pin-input')).toHaveProp('accessibilityLabel', 'New PIN');
      expect(getByTestId('confirm-new-pin-input')).toHaveProp('accessibilityLabel', 'Confirm new PIN');
    });

    it('should have correct accessibility roles', () => {
      const { getByTestId } = render(<ChangePINScreen />);

      expect(getByTestId('change-pin-submit-button')).toHaveProp('accessibilityRole', 'button');
      expect(getByTestId('cancel-button')).toHaveProp('accessibilityRole', 'button');
    });

    it('should announce error with live region', async () => {
      mockKeychainService.changePIN.mockRejectedValue({
        code: 'NETWORK_ERROR',
      });

      const { getByTestId } = render(<ChangePINScreen />);

      fireEvent.changeText(getByTestId('current-pin-input'), '123456');
      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');
      fireEvent.press(getByTestId('change-pin-submit-button'));

      await waitFor(() => {
        expect(getByTestId('error-alert')).toHaveProp('accessibilityLiveRegion', 'polite');
      });
    });
  });
});
```

### E2E Tests (Detox + Cucumber)

```gherkin
# e2e/features/ChangePIN.feature

Feature: Change PIN

  Scenario: Successfully change PIN
    Given I am on the Settings screen
    When I tap on "Change PIN"
    And I enter "123456" in the current PIN field
    And I enter "654321" in the new PIN field
    And I enter "654321" in the confirm PIN field
    And I tap "Change PIN" button
    Then I should see "PIN changed successfully"
    And I should be navigated back to Settings after 2 seconds

  Scenario: Show error when PINs do not match
    Given I am on the Change PIN screen
    When I enter "123456" in the current PIN field
    And I enter "654321" in the new PIN field
    And I enter "123456" in the confirm PIN field
    Then I should see "PINs must match" error
    And the submit button should be disabled

  Scenario: Handle wrong current PIN with retry count
    Given I am on the Change PIN screen
    When I enter "wrong-pin" in the current PIN field
    And I enter "654321" in the new PIN field
    And I enter "654321" in the confirm PIN field
    And I tap "Change PIN" button
    Then I should see "Current PIN is incorrect. 2 attempts remaining"

  Scenario: Trigger rate limit after 3 failed attempts
    Given I am on the Change PIN screen
    When I attempt to change PIN with wrong current PIN 3 times
    Then I should see "Too many attempts. Please wait 30 seconds"
    And the submit button should be disabled
```

---

## Dependencies

- **React Hook Form** (v7.52+): Form state management
- **Yup** (v1.4+): Schema validation
- **GlueStack UI** (v1.1.73): UI components
- **PINInput component** (TASK-233): Custom PIN input with masking
- **ErrorMessage component** (TASK-313): Accessible error messages
- **validatePIN utility** (TASK-233): PIN strength validation
- **changePIN service** (TASK-234): Keychain service for PIN updates
- **useRateLimiter hook**: Custom hook for rate limiting
- **Redux authSlice**: State management for security settings

---

## Definition of Done

- [ ] Component implemented with all three PIN inputs
- [ ] React Hook Form integration with Yup validation
- [ ] Real-time validation feedback working
- [ ] Error handling for all scenarios (wrong PIN, network, rate limit)
- [ ] Success message with auto-navigation
- [ ] Loading states during submission
- [ ] Rate limiting after 3 failed attempts (30s lockout)
- [ ] Redux integration for security settings
- [ ] 100% unit test coverage (RNTL) - 20 test cases passing
- [ ] E2E test coverage (Detox + Cucumber) - 4 scenarios passing
- [ ] EAA compliance verified (touch targets, contrast, labels, live regions)
- [ ] Screen reader tested with VoiceOver/TalkBack
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Merged to main branch

---

**Last Updated**: 2025-11-21
**Related**: [US-040](../stories/US-040-change-pin.md), [TASK-233](TASK-233-pin-validation-logic.md), [TASK-234](TASK-234-bcrypt-integration.md), [TASK-235](TASK-235-rate-limiting.md)
