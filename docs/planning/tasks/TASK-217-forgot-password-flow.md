# TASK-217: Forgot Password Flow

**ID**: TASK-217 | **Title**: Implement Forgot Password Screen and Email Sending
**User Story**: [US-036](../stories/US-036-email-password-login.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: Medium | **Effort**: 2h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## Context & Background

### Why This Task Matters

Forgot Password flow is essential for user retention:

1. **User Recovery**: Users forget passwords frequently (industry avg: 30% of users/year)
2. **Security**: Password reset via email is secure and industry standard
3. **User Experience**: Self-service recovery reduces support burden
4. **Trust**: Shows app cares about user access

**User Flow**:

```
User taps "Forgot password?" on Login screen
  → Navigate to ForgotPasswordScreen
  → User enters email address
  → User taps "Send Reset Link"
  → API call to Supabase (POST /auth/v1/recover)
  → Supabase sends email with reset link
  → App shows success message
  → User checks email
  → User taps reset link in email
  → Browser opens (or app opens via deep link)
  → User enters new password
  → Password reset complete
  → Navigate back to Login screen
```

**Email Content** (sent by Supabase):

```
Subject: Reset your password

Hi,

Click the link below to reset your password:

https://PROJECT_ID.supabase.co/auth/v1/verify?token=TOKEN&type=recovery&redirect_to=warrendeleon://reset-password

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.
```

### API Endpoint

**Supabase Recovery API**: `POST https://PROJECT_ID.supabase.co/auth/v1/recover`

**Request**:

```json
{
  "email": "user@example.com"
}
```

**Response (Success - 200)**:

```json
{}
```

Note: Supabase intentionally returns empty response (even if email doesn't exist) to prevent email enumeration attacks.

---

## Objective

Build Forgot Password flow with:

1. ForgotPasswordScreen UI with email input
2. API integration with Supabase recovery endpoint
3. Success message display
4. "Resend" functionality with 60-second countdown
5. Error handling (network errors, rate limiting)
6. Full EAA compliance

---

## Detailed Implementation Guide

### Phase 1: Create ForgotPasswordScreen UI (30 minutes)

**File**: `src/screens/auth/ForgotPasswordScreen.tsx`

**Deliverables**:

- ForgotPasswordScreen component
- Email input field with validation
- "Send Reset Link" button
- Success message UI
- "Resend" button with countdown

**Code**:

```typescript
// src/screens/auth/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Input,
  InputField,
  Button,
  ButtonText,
  ButtonSpinner,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from '@gluestack-ui/themed';

const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setSuccessMessage(null);

    try {
      // TODO: Call Supabase recovery API
      console.log('Sending reset link to:', data.email);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success message
      setSuccessMessage(
        `We've sent a password reset link to ${data.email}. Please check your inbox and spam folder.`
      );

      // Start resend countdown
      startResendCountdown();
    } catch (error) {
      console.error('Error sending reset link:', error);
      // Error handling will be added in Phase 2
    } finally {
      setIsLoading(false);
    }
  };

  const startResendCountdown = () => {
    setCanResend(false);
    setResendCountdown(60);

    const interval = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = () => {
    const email = getValues('email');
    if (email) {
      onSubmit({ email });
    }
  };

  return (
    <SafeAreaView testID="forgot-password-screen" className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold mb-2" accessibilityRole="header">
            Forgot Password?
          </Text>
          <Text className="text-base text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </Text>
        </View>

        {/* Success Message */}
        {successMessage && (
          <View className="bg-success-100 p-4 rounded-lg mb-6" accessibilityLiveRegion="polite">
            <Text className="text-success-700 text-sm">{successMessage}</Text>
          </View>
        )}

        {/* Email Input */}
        <FormControl isInvalid={!!errors.email} className="mb-6">
          <FormControlLabel>
            <FormControlLabelText>Email</FormControlLabelText>
          </FormControlLabel>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input testID="email-input" accessibilityLabel="Email address">
                <InputField
                  placeholder="user@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              </Input>
            )}
          />
          {errors.email && (
            <FormControlError>
              <FormControlErrorText testID="email-error">
                {errors.email.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        {/* Send Reset Link Button */}
        <Button
          onPress={handleSubmit(onSubmit)}
          testID="send-reset-link-button"
          accessibilityRole="button"
          accessibilityLabel="Send reset link"
          accessibilityHint="Sends a password reset link to your email"
          isDisabled={isLoading || !canResend}
          size="lg"
          className="mb-4"
        >
          {isLoading && <ButtonSpinner />}
          <ButtonText>{isLoading ? 'Sending...' : 'Send Reset Link'}</ButtonText>
        </Button>

        {/* Resend Button */}
        {successMessage && (
          <View className="items-center mb-4">
            {canResend ? (
              <Pressable
                onPress={handleResend}
                testID="resend-button"
                accessibilityRole="button"
                accessibilityLabel="Resend reset link"
                style={{ minWidth: 44, minHeight: 44 }}
              >
                <Text className="text-primary-600 text-sm">Didn't receive it? Resend</Text>
              </Pressable>
            ) : (
              <Text className="text-gray-500 text-sm" testID="resend-countdown">
                Resend in {resendCountdown}s...
              </Text>
            )}
          </View>
        )}

        {/* Back to Login */}
        <View className="items-center mt-6">
          <Pressable
            onPress={() => navigation.goBack()}
            testID="back-to-login-button"
            accessibilityRole="button"
            accessibilityLabel="Back to login"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            <Text className="text-gray-600 text-sm">Back to Login</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};
```

---

### Phase 2: Create Forgot Password API Function (30 minutes)

**File**: `src/api/auth/forgotPassword.ts`

**Deliverables**:

- `sendPasswordResetEmail` function
- Error handling (network, rate limit)
- Zod validation

**Code**:

```typescript
// src/api/auth/forgotPassword.ts
import { apiClient } from '../client';
import { z } from 'zod';

const recoveryResponseSchema = z.object({}).optional();

export class ForgotPasswordError extends Error {
  constructor(
    public code: string,
    public description: string,
    public statusCode?: number
  ) {
    super(description);
    this.name = 'ForgotPasswordError';
  }
}

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  try {
    const response = await apiClient.post('/auth/v1/recover', { email });

    // Supabase returns empty object on success (intentional for security)
    console.log('[ForgotPassword] Reset email sent successfully');
  } catch (error: any) {
    if (error.response) {
      // Server responded with error
      const status = error.response.status;

      if (status === 429) {
        throw new ForgotPasswordError(
          'rate_limit_exceeded',
          'Too many requests. Please try again in 60 seconds.',
          429
        );
      } else {
        throw new ForgotPasswordError(
          'unknown_error',
          'An unexpected error occurred. Please try again.',
          status
        );
      }
    } else if (error.request) {
      // Network error
      throw new ForgotPasswordError(
        'network_error',
        'Network error. Please check your connection and try again.',
        0
      );
    } else {
      throw new ForgotPasswordError(
        'unknown_error',
        error.message || 'An unexpected error occurred',
        0
      );
    }
  }
};
```

**Test File**:

```typescript
// src/api/auth/__tests__/forgotPassword.test.ts
import { sendPasswordResetEmail, ForgotPasswordError } from '../forgotPassword';
import { apiClient } from '../../client';

jest.mock('../../client');

describe('sendPasswordResetEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send reset email successfully', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: {} });

    await expect(sendPasswordResetEmail('user@example.com')).resolves.not.toThrow();

    expect(apiClient.post).toHaveBeenCalledWith('/auth/v1/recover', {
      email: 'user@example.com',
    });
  });

  it('should throw ForgotPasswordError on rate limit (429)', async () => {
    const mockError = {
      response: {
        status: 429,
        data: { error: 'rate_limit_exceeded' },
      },
    };

    (apiClient.post as jest.Mock).mockRejectedValue(mockError);

    await expect(sendPasswordResetEmail('user@example.com')).rejects.toThrow(ForgotPasswordError);

    try {
      await sendPasswordResetEmail('user@example.com');
    } catch (error) {
      expect(error).toBeInstanceOf(ForgotPasswordError);
      expect((error as ForgotPasswordError).code).toBe('rate_limit_exceeded');
      expect((error as ForgotPasswordError).statusCode).toBe(429);
    }
  });

  it('should throw ForgotPasswordError on network error', async () => {
    const mockError = {
      request: {},
      message: 'Network Error',
    };

    (apiClient.post as jest.Mock).mockRejectedValue(mockError);

    await expect(sendPasswordResetEmail('user@example.com')).rejects.toThrow(ForgotPasswordError);

    try {
      await sendPasswordResetEmail('user@example.com');
    } catch (error) {
      expect(error).toBeInstanceOf(ForgotPasswordError);
      expect((error as ForgotPasswordError).code).toBe('network_error');
    }
  });
});
```

---

### Phase 3: Integrate API into ForgotPasswordScreen (20 minutes)

**File**: Update `src/screens/auth/ForgotPasswordScreen.tsx`

**Code**:

```typescript
// src/screens/auth/ForgotPasswordScreen.tsx (updated)
import { sendPasswordResetEmail, ForgotPasswordError } from '../../api/auth/forgotPassword';
import { Alert } from '@gluestack-ui/themed';

export const ForgotPasswordScreen: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setSuccessMessage(null);
    setError(null);

    try {
      await sendPasswordResetEmail(data.email);

      setSuccessMessage(
        `We've sent a password reset link to ${data.email}. Please check your inbox and spam folder.`
      );

      startResendCountdown();
    } catch (err) {
      if (err instanceof ForgotPasswordError) {
        switch (err.code) {
          case 'rate_limit_exceeded':
            setError('Too many requests. Please try again in 60 seconds.');
            break;
          case 'network_error':
            setError('Network error. Please check your connection.');
            break;
          default:
            setError('An unexpected error occurred. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('[ForgotPassword] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView testID="forgot-password-screen" className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* ... Header ... */}

        {/* Error Message */}
        {error && (
          <View className="bg-error-100 p-4 rounded-lg mb-6" accessibilityLiveRegion="assertive">
            <Text className="text-error-700 text-sm" testID="error-message">
              {error}
            </Text>
          </View>
        )}

        {/* Success Message */}
        {successMessage && (
          <View className="bg-success-100 p-4 rounded-lg mb-6" accessibilityLiveRegion="polite">
            <Text className="text-success-700 text-sm">{successMessage}</Text>
          </View>
        )}

        {/* ... Rest of UI ... */}
      </View>
    </SafeAreaView>
  );
};
```

---

### Phase 4: Add Navigation Route (10 minutes)

**File**: Update `src/navigation/UnauthenticatedStack.tsx` or similar

**Code**:

```typescript
// src/navigation/UnauthenticatedStack.tsx
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

export const UnauthenticatedStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: 'Forgot Password' }}
      />
    </Stack.Navigator>
  );
};
```

---

### Phase 5: RNTL Tests (20 minutes)

**File**: `src/screens/auth/__tests__/ForgotPasswordScreen.test.tsx`

```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ForgotPasswordScreen } from '../ForgotPasswordScreen';
import { sendPasswordResetEmail } from '../../../api/auth/forgotPassword';

jest.mock('../../../api/auth/forgotPassword');

const mockNavigation = {
  goBack: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render correctly', () => {
    const { getByTestId, getByText } = render(<ForgotPasswordScreen />);

    expect(getByTestId('forgot-password-screen')).toBeTruthy();
    expect(getByText('Forgot Password?')).toBeTruthy();
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('send-reset-link-button')).toBeTruthy();
  });

  it('should send reset email successfully', async () => {
    (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

    const { getByTestId, getByText } = render(<ForgotPasswordScreen />);

    const emailInput = getByTestId('email-input');
    const sendButton = getByTestId('send-reset-link-button');

    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalledWith('user@example.com');
      expect(getByText(/We've sent a password reset link/)).toBeTruthy();
    });
  });

  it('should show resend countdown after successful send', async () => {
    (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

    const { getByTestId, getByText } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
    fireEvent.press(getByTestId('send-reset-link-button'));

    await waitFor(() => {
      expect(getByTestId('resend-countdown')).toBeTruthy();
      expect(getByText('Resend in 60s...')).toBeTruthy();
    });
  });

  it('should enable resend button after 60 seconds', async () => {
    (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

    const { getByTestId } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
    fireEvent.press(getByTestId('send-reset-link-button'));

    await waitFor(() => {
      expect(getByTestId('resend-countdown')).toBeTruthy();
    });

    // Fast-forward 60 seconds
    jest.advanceTimersByTime(60000);

    await waitFor(() => {
      expect(getByTestId('resend-button')).toBeTruthy();
    });
  });

  it('should navigate back to login on "Back to Login" press', () => {
    const { getByTestId } = render(<ForgotPasswordScreen />);

    fireEvent.press(getByTestId('back-to-login-button'));

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
```

---

## Acceptance Criteria

**Functional**:

- [ ] ForgotPasswordScreen renders correctly
- [ ] Email input validates on blur
- [ ] "Send Reset Link" button calls API
- [ ] Success message displays after sending
- [ ] "Resend" button disabled for 60 seconds
- [ ] Countdown timer works correctly
- [ ] "Back to Login" navigates back
- [ ] All error scenarios handled

**Non-Functional**:

- [ ] API call completes <2 seconds
- [ ] All EAA requirements met
- [ ] 100% RNTL coverage
- [ ] All testIDs present for E2E tests

---

## Definition of Done

- [ ] ForgotPasswordScreen component complete
- [ ] API integration working
- [ ] Success/error messages displaying
- [ ] Resend functionality working
- [ ] RNTL tests passing (100% coverage)
- [ ] `yarn validate` passes
- [ ] Manual testing complete

---

**Dependencies**:

- TASK-213 (Login UI Form) complete (for navigation)
- Supabase Auth configured with email recovery enabled

**Next Task**: [TASK-218](TASK-218-magic-link-ui.md) - Magic Link UI Tab (US-037)

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 2 hours
