# TASK-252: ForgotPasswordScreen UI Implementation

**ID**: TASK-252 | **Epic**: [EPIC-024](../epics/EPIC-024-password-recovery.md) | **User Story**: [US-044](../stories/US-044-forgot-password-request.md)
**Status**: ⏳ In Progress | **Effort**: 1.5h

---

## File Structure

```
src/features/Auth/
├── screens/
│   ├── ForgotPasswordScreen.tsx
│   └── __tests__/
│       └── ForgotPasswordScreen.rntl.tsx
├── api/
│   └── passwordReset.ts             # TASK-254 (imported by this screen)
└── validation/
    └── forgotPasswordSchema.ts      # Email validation schema
```

**Note**: Password recovery is Auth-specific functionality, so screens and API are co-located with the Auth feature following feature-first architecture (established in TASK-196).

---

## Task Description

Create the ForgotPasswordScreen component with email input, rate limiting feedback, and success/error messaging. Integrate React Hook Form with Yup validation for email format validation.

---

## Acceptance Criteria

- [ ] ForgotPasswordScreen component created in `src/features/Auth/screens/ForgotPasswordScreen.tsx`
- [ ] Email input field with validation
- [ ] "Send Recovery Email" button
- [ ] Rate limiting feedback (3 requests per hour)
- [ ] Success message with instructions
- [ ] Error messaging (invalid email, rate limit exceeded)
- [ ] Loading indicator during request
- [ ] Back button navigates to LoginScreen
- [ ] All EAA accessibility requirements met
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### Component Structure

```typescript
// src/features/Auth/screens/ForgotPasswordScreen.tsx

import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import {
  Box,
  VStack,
  HStack,
  Button,
  ButtonText,
  Input,
  InputField,
  Text,
  Spinner,
  MailIcon,
} from '@gluestack-ui/themed';
import { ErrorMessage } from '@app/components/forms/ErrorMessage';
import { requestPasswordReset } from '@app/features/Auth/api/passwordReset';

const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase()
    .trim(),
});

type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await requestPasswordReset(data.email);

      setSuccessMessage(
        `We've sent a password reset link to ${data.email}. Please check your inbox and follow the instructions.`
      );

      // Navigate back after 5 seconds
      setTimeout(() => {
        navigation.goBack();
      }, 5000);
    } catch (error: any) {
      console.error('Password reset request failed:', error);

      if (error.message?.includes('rate limit')) {
        setErrorMessage(
          'You have exceeded the maximum number of password reset requests (3 per hour). Please try again later.'
        );
      } else if (error.message?.includes('not found')) {
        // Don't reveal if email exists for security
        setSuccessMessage(
          `If an account exists with ${data.email}, you will receive a password reset email shortly.`
        );
      } else {
        setErrorMessage(
          error.message || 'Failed to send password reset email. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      testID="forgot-password-screen"
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
              Forgot Password?
            </Text>
            <Text fontSize="$sm" color="$gray600">
              Enter your email address and we'll send you instructions to reset your password
            </Text>
          </VStack>

          {/* Form */}
          <VStack space="lg">
            {/* Email Input */}
            <VStack space="xs">
              <Text fontSize="$sm" fontWeight="$medium" color="$gray700">
                Email Address
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    variant="outline"
                    size="lg"
                    isDisabled={isLoading || !!successMessage}
                    testID="email-input"
                  >
                    <MailIcon size="md" color="$gray500" marginLeft="$3" />
                    <InputField
                      placeholder="your.email@example.com"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      accessibilityLabel="Email address"
                      accessibilityHint="Enter your email address to receive password reset instructions"
                    />
                  </Input>
                )}
              />
              <ErrorMessage
                error={errors.email?.message}
                fieldLabel="Email"
                testID="email-error"
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
                  <VStack flex={1}>
                    <Text fontSize="$md" fontWeight="$semibold" color="$green800">
                      Email Sent!
                    </Text>
                    <Text fontSize="$sm" color="$green700">
                      {successMessage}
                    </Text>
                  </VStack>
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
              testID="send-reset-email-button"
              accessibilityRole="button"
              accessibilityLabel="Send recovery email"
              accessibilityHint="Request a password reset email"
              accessibilityState={{ disabled: !isValid || isLoading || !!successMessage }}
            >
              {isLoading ? (
                <Spinner color="$white" testID="loading-spinner" />
              ) : (
                <ButtonText>Send Recovery Email</ButtonText>
              )}
            </Button>

            {/* Back to Login */}
            <Button
              onPress={() => navigation.goBack()}
              variant="outline"
              borderColor="$gray300"
              testID="back-to-login-button"
              accessibilityRole="button"
              accessibilityLabel="Back to login"
            >
              <ButtonText color="$gray700">Back to Login</ButtonText>
            </Button>
          </VStack>

          {/* Information */}
          <Box
            backgroundColor="$blue50"
            borderColor="$blue200"
            borderWidth={1}
            borderRadius="$md"
            padding="$4"
          >
            <VStack space="xs">
              <Text fontSize="$md" fontWeight="$semibold" color="$blue900">
                What happens next?
              </Text>
              <Text fontSize="$sm" color="$blue800">
                • You'll receive an email with a password reset link{'\n'}
                • The link will expire in 1 hour{'\n'}
                • You can request a new link if needed{'\n'}
                • Maximum 3 requests per hour
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
// src/features/Auth/screens/__tests__/ForgotPasswordScreen.rntl.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ForgotPasswordScreen } from '../ForgotPasswordScreen';
import * as passwordResetService from '../../api/passwordReset';

jest.mock('../../api/passwordReset');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
}));

const mockPasswordResetService = passwordResetService as jest.Mocked<typeof passwordResetService>;

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render screen with email input', () => {
    const { getByTestId, getByText } = render(<ForgotPasswordScreen />);

    expect(getByText('Forgot Password?')).toBeTruthy();
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('send-reset-email-button')).toBeTruthy();
  });

  it('should validate email format', async () => {
    const { getByTestId, getByText } = render(<ForgotPasswordScreen />);

    const emailInput = getByTestId('email-input');
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent(emailInput, 'blur');

    await waitFor(() => {
      expect(getByText('Please enter a valid email address')).toBeTruthy();
    });
  });

  it('should enable button when email is valid', async () => {
    const { getByTestId } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'user@example.com');

    await waitFor(() => {
      expect(getByTestId('send-reset-email-button')).toBeEnabled();
    });
  });

  it('should send password reset request successfully', async () => {
    mockPasswordResetService.requestPasswordReset.mockResolvedValue();

    const { getByTestId, getByText } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'user@example.com');

    await waitFor(() => {
      expect(getByTestId('send-reset-email-button')).toBeEnabled();
    });

    fireEvent.press(getByTestId('send-reset-email-button'));

    await waitFor(() => {
      expect(mockPasswordResetService.requestPasswordReset).toHaveBeenCalledWith('user@example.com');
      expect(getByText(/Email Sent!/)).toBeTruthy();
    });
  });

  it('should show rate limit error', async () => {
    mockPasswordResetService.requestPasswordReset.mockRejectedValue(
      new Error('Rate limit exceeded')
    );

    const { getByTestId, getByText } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'user@example.com');

    await waitFor(() => {
      expect(getByTestId('send-reset-email-button')).toBeEnabled();
    });

    fireEvent.press(getByTestId('send-reset-email-button'));

    await waitFor(() => {
      expect(getByText(/exceeded the maximum number of password reset requests/)).toBeTruthy();
    });
  });

  it('should show loading spinner during request', async () => {
    let resolveRequest: () => void;
    const requestPromise = new Promise<void>((resolve) => {
      resolveRequest = resolve;
    });

    mockPasswordResetService.requestPasswordReset.mockReturnValue(requestPromise);

    const { getByTestId } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'user@example.com');

    await waitFor(() => {
      expect(getByTestId('send-reset-email-button')).toBeEnabled();
    });

    fireEvent.press(getByTestId('send-reset-email-button'));

    await waitFor(() => {
      expect(getByTestId('loading-spinner')).toBeTruthy();
    });

    resolveRequest!();
  });

  it('should have correct accessibility properties', () => {
    const { getByTestId } = render(<ForgotPasswordScreen />);

    expect(getByTestId('send-reset-email-button')).toHaveProp('accessibilityRole', 'button');
    expect(getByTestId('send-reset-email-button')).toHaveProp('accessibilityLabel', 'Send recovery email');
  });
});
```

---

## Dependencies

- React Hook Form
- Yup
- GlueStack UI
- Password reset service (TASK-254)

---

## Definition of Done

- [ ] Component implemented and renders correctly
- [ ] Email validation working
- [ ] Submit button state correct
- [ ] Success/error messaging working
- [ ] All unit tests passing
- [ ] EAA compliance verified
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-044](../stories/US-044-forgot-password-request.md), [TASK-253](TASK-253-rate-limiter-implementation.md), [TASK-254](TASK-254-supabase-recovery-api.md)
