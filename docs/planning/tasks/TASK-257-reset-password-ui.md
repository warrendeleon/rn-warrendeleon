# TASK-257: ResetPasswordScreen UI Implementation

**ID**: TASK-257 | **Epic**: [EPIC-024](../epics/EPIC-024-password-recovery.md) | **User Story**: [US-045](../stories/US-045-reset-password-with-token.md)
**Status**: ⏳ In Progress | **Effort**: 1.5h

---

## File Structure

```
src/features/Auth/
├── screens/
│   ├── ResetPasswordScreen.tsx
│   └── __tests__/
│       └── ResetPasswordScreen.rntl.tsx
├── api/
│   └── passwordReset.ts             # TASK-254 (verifyPasswordResetToken, resetPasswordWithToken)
└── validation/
    └── resetPasswordSchema.ts       # Extends password validation
```

```
src/utils/
├── navigation/
│   └── deepLink.ts                  # TASK-258 (deep link handling)
└── validation/
    └── passwordValidation.ts        # TASK-259 (correctly centralized - generic utility)
```

**Note**: Reset password screen is Auth-specific, co-located with Auth feature. Password validation utility is correctly centralized in `/src/utils/validation/` as it's a generic validation utility used by multiple features (registration, change password, reset password).

---

## Task Description

Create the ResetPasswordScreen component that users access via deep link from password reset email. Includes new password input with validation, password confirmation, strength indicator, and token verification.

---

## Acceptance Criteria

- [ ] ResetPasswordScreen component created in `src/features/Auth/screens/ResetPasswordScreen.tsx`
- [ ] New password input with visibility toggle
- [ ] Confirm password input
- [ ] Password strength indicator
- [ ] Password validation (min 8 chars, uppercase, lowercase, number, special char)
- [ ] "Reset Password" button
- [ ] Token verification on mount
- [ ] Success message with auto-navigation
- [ ] Error messaging (invalid token, network error)
- [ ] Loading indicator during request
- [ ] All EAA accessibility requirements met
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### Component Structure

```typescript
// src/features/Auth/screens/ResetPasswordScreen.tsx

import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  Box,
  VStack,
  HStack,
  Button,
  ButtonText,
  Input,
  InputField,
  InputSlot,
  InputIcon,
  Text,
  Spinner,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
} from '@gluestack-ui/themed';
import { ErrorMessage } from '@app/components/forms/ErrorMessage';
import { PasswordStrengthIndicator } from '@app/components/forms/PasswordStrengthIndicator';
import {
  verifyPasswordResetToken,
  resetPasswordWithToken,
} from '@app/features/Auth/api/passwordReset';
import { passwordValidationSchema } from '@app/utils/validation/passwordValidation';

const resetPasswordSchema = yup.object({
  password: passwordValidationSchema,
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

type ResetPasswordRouteParams = {
  token: string;
};

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: ResetPasswordRouteParams }, 'params'>>();

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const token = route.params?.token;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const passwordValue = watch('password');

  // Verify token on mount
  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    if (!token) {
      setErrorMessage('Invalid or missing reset token. Please request a new password reset.');
      setTokenValid(false);
      setIsVerifyingToken(false);
      return;
    }

    try {
      const isValid = await verifyPasswordResetToken(token);
      setTokenValid(isValid);

      if (!isValid) {
        setErrorMessage(
          'This password reset link has expired or is invalid. Please request a new password reset.'
        );
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      setTokenValid(false);
      setErrorMessage('Failed to verify reset token. Please try again.');
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setErrorMessage('Invalid reset token');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await resetPasswordWithToken(token, data.password);

      setSuccessMessage(
        'Your password has been reset successfully! Redirecting to login...'
      );

      // Navigate to login after 3 seconds
      setTimeout(() => {
        navigation.navigate('Login' as never);
      }, 3000);
    } catch (error: any) {
      console.error('Password reset failed:', error);
      setErrorMessage(
        error.message || 'Failed to reset password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Token verification loading state
  if (isVerifyingToken) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        testID="reset-password-screen"
      >
        <Box flex={1} padding="$6" justifyContent="center" alignItems="center">
          <VStack space="md" alignItems="center">
            <Spinner size="large" testID="token-verification-spinner" />
            <Text fontSize="$md" color="$gray600">
              Verifying reset link...
            </Text>
          </VStack>
        </Box>
      </SafeAreaView>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        testID="reset-password-screen"
      >
        <Box flex={1} padding="$6" justifyContent="center">
          <VStack space="lg" alignItems="center">
            <Box
              backgroundColor="$red100"
              borderColor="$red600"
              borderWidth={1}
              borderRadius="$md"
              padding="$4"
              testID="invalid-token-message"
            >
              <Text fontSize="$md" color="$red800" textAlign="center">
                {errorMessage || 'This password reset link is invalid or has expired.'}
              </Text>
            </Box>

            <Button
              onPress={() => navigation.navigate('ForgotPassword' as never)}
              backgroundColor="$blue600"
              testID="request-new-reset-button"
            >
              <ButtonText>Request New Password Reset</ButtonText>
            </Button>

            <Button
              onPress={() => navigation.navigate('Login' as never)}
              variant="outline"
              borderColor="$gray300"
              testID="back-to-login-button"
            >
              <ButtonText color="$gray700">Back to Login</ButtonText>
            </Button>
          </VStack>
        </Box>
      </SafeAreaView>
    );
  }

  // Valid token - show reset form
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      testID="reset-password-screen"
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
            >
              Reset Password
            </Text>
            <Text fontSize="$sm" color="$gray600">
              Choose a strong password to secure your account
            </Text>
          </VStack>

          {/* Form */}
          <VStack space="lg">
            {/* New Password Input */}
            <VStack space="xs">
              <Text fontSize="$sm" fontWeight="$medium" color="$gray700">
                New Password
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    variant="outline"
                    size="lg"
                    isDisabled={isLoading || !!successMessage}
                    testID="password-input"
                  >
                    <LockIcon size="md" color="$gray500" marginLeft="$3" />
                    <InputField
                      placeholder="Enter new password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      accessibilityLabel="New password"
                      accessibilityHint="Enter your new password with at least 8 characters"
                    />
                    <InputSlot marginRight="$3" onPress={() => setShowPassword(!showPassword)}>
                      <InputIcon as={showPassword ? EyeOffIcon : EyeIcon} />
                    </InputSlot>
                  </Input>
                )}
              />
              <ErrorMessage
                error={errors.password?.message}
                fieldLabel="Password"
                testID="password-error"
              />
              {passwordValue && (
                <PasswordStrengthIndicator password={passwordValue} />
              )}
            </VStack>

            {/* Confirm Password Input */}
            <VStack space="xs">
              <Text fontSize="$sm" fontWeight="$medium" color="$gray700">
                Confirm Password
              </Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    variant="outline"
                    size="lg"
                    isDisabled={isLoading || !!successMessage}
                    testID="confirm-password-input"
                  >
                    <LockIcon size="md" color="$gray500" marginLeft="$3" />
                    <InputField
                      placeholder="Re-enter new password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      accessibilityLabel="Confirm password"
                      accessibilityHint="Re-enter your new password to confirm"
                    />
                    <InputSlot
                      marginRight="$3"
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <InputIcon as={showConfirmPassword ? EyeOffIcon : EyeIcon} />
                    </InputSlot>
                  </Input>
                )}
              />
              <ErrorMessage
                error={errors.confirmPassword?.message}
                fieldLabel="Confirm Password"
                testID="confirm-password-error"
              />
            </VStack>

            {/* Success Message */}
            {successMessage && (
              <Box
                backgroundColor="$green100"
                borderColor="$green600"
                borderWidth={1}
                borderRadius="$md"
                padding="$4"
                testID="success-message"
                accessibilityRole="alert"
              >
                <HStack space="sm" alignItems="flex-start">
                  <Text fontSize="$lg">✓</Text>
                  <Text flex={1} fontSize="$sm" color="$green800">
                    {successMessage}
                  </Text>
                </HStack>
              </Box>
            )}

            {/* Error Message */}
            {errorMessage && (
              <Box
                backgroundColor="$red100"
                borderColor="$red600"
                borderWidth={1}
                borderRadius="$md"
                padding="$4"
                testID="error-message"
                accessibilityRole="alert"
              >
                <HStack space="sm" alignItems="flex-start">
                  <Text fontSize="$lg">✕</Text>
                  <Text flex={1} fontSize="$sm" color="$red800">
                    {errorMessage}
                  </Text>
                </HStack>
              </Box>
            )}

            {/* Submit Button */}
            <Button
              onPress={handleSubmit(onSubmit)}
              isDisabled={!isValid || isLoading || !!successMessage}
              backgroundColor="$blue600"
              testID="reset-password-button"
              accessibilityRole="button"
              accessibilityLabel="Reset password"
              accessibilityHint="Set your new password"
              accessibilityState={{ disabled: !isValid || isLoading || !!successMessage }}
            >
              {isLoading ? (
                <Spinner color="$white" testID="loading-spinner" />
              ) : (
                <ButtonText>Reset Password</ButtonText>
              )}
            </Button>
          </VStack>

          {/* Password Requirements */}
          <Box
            backgroundColor="$blue50"
            borderColor="$blue200"
            borderWidth={1}
            borderRadius="$md"
            padding="$4"
          >
            <VStack space="xs">
              <Text fontSize="$md" fontWeight="$semibold" color="$blue900">
                Password Requirements:
              </Text>
              <Text fontSize="$sm" color="$blue800">
                • At least 8 characters long{'\n'}
                • At least one uppercase letter{'\n'}
                • At least one lowercase letter{'\n'}
                • At least one number{'\n'}
                • At least one special character (@$!%*?&)
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </SafeAreaView>
  );
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/features/Auth/screens/__tests__/ResetPasswordScreen.rntl.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ResetPasswordScreen } from '../ResetPasswordScreen';
import * as passwordResetService from '../../api/passwordReset';

jest.mock('../../api/passwordReset');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useRoute: () => ({ params: { token: 'valid_token_123' } }),
}));

const mockPasswordResetService = passwordResetService as jest.Mocked<typeof passwordResetService>;

describe('ResetPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show token verification loading state', () => {
    mockPasswordResetService.verifyPasswordResetToken.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { getByTestId, getByText } = render(<ResetPasswordScreen />);

    expect(getByTestId('token-verification-spinner')).toBeTruthy();
    expect(getByText('Verifying reset link...')).toBeTruthy();
  });

  it('should show invalid token message', async () => {
    mockPasswordResetService.verifyPasswordResetToken.mockResolvedValue(false);

    const { getByTestId, getByText } = render(<ResetPasswordScreen />);

    await waitFor(() => {
      expect(getByTestId('invalid-token-message')).toBeTruthy();
      expect(getByText(/This password reset link is invalid or has expired/)).toBeTruthy();
    });
  });

  it('should show reset form for valid token', async () => {
    mockPasswordResetService.verifyPasswordResetToken.mockResolvedValue(true);

    const { getByTestId, getByText } = render(<ResetPasswordScreen />);

    await waitFor(() => {
      expect(getByText('Reset Password')).toBeTruthy();
      expect(getByTestId('password-input')).toBeTruthy();
      expect(getByTestId('confirm-password-input')).toBeTruthy();
      expect(getByTestId('reset-password-button')).toBeTruthy();
    });
  });

  // Additional tests in TASK-261
});
```

---

## Dependencies

- React Hook Form
- Yup
- GlueStack UI
- Password reset service (TASK-254)
- Deep link handler (TASK-258)
- Password validation utility (TASK-259)
- PasswordStrengthIndicator component (TASK-308)

---

## Definition of Done

- [ ] Component implemented and renders correctly
- [ ] Token verification working
- [ ] Password validation working
- [ ] Password confirmation working
- [ ] Strength indicator working
- [ ] Submit button state correct
- [ ] Success/error messaging working
- [ ] All unit tests passing
- [ ] EAA compliance verified
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-30
**Related**: [US-045](../stories/US-045-reset-password-with-token.md), [TASK-254](TASK-254-supabase-recovery-api.md), [TASK-258](TASK-258-deep-link-handler.md), [TASK-259](TASK-259-password-validation.md)
