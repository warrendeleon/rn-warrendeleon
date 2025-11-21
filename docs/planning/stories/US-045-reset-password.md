# US-045: Reset Password with Token

**ID**: US-045 | **Epic**: [EPIC-024](../epics/EPIC-024-password-recovery.md) | **Title**: Reset Password Using Reset Token
**Status**: 📋 To Do | **Priority**: High | **Story Points**: 3 | **Effort**: 6.5h

---

## User Story

**As a** registered user who received a password reset email
**I want to** reset my password using the reset token from the email
**So that** I can regain access to my account with a new secure password

---

## Acceptance Criteria

### Functional Requirements

1. **Deep Link Handling**
   - [ ] App handles deep link: `warrendeleon://reset-password?token=TOKEN`
   - [ ] Deep link opens ResetPasswordScreen
   - [ ] Token extracted from URL query parameter
   - [ ] If no token: Show error "Invalid reset link. Please request a new one."

2. **ResetPasswordScreen**
   - [ ] Screen title: "Reset Password"
   - [ ] Two password input fields:
     - New Password (secured, show/hide toggle)
     - Confirm Password (secured, show/hide toggle)
   - [ ] Password strength indicator (real-time)
   - [ ] Submit button: "Reset Password"

3. **Password Validation**
   - [ ] Real-time validation as user types (debounced 500ms)
   - [ ] Minimum 8 characters
   - [ ] At least 1 uppercase letter
   - [ ] At least 1 lowercase letter
   - [ ] At least 1 number
   - [ ] At least 1 special character (@$!%\*?&#)
   - [ ] No common passwords (password, password123, etc.)
   - [ ] Passwords must match

4. **Password Reset**
   - [ ] On submit:
     - Validate new password strength
     - Call Supabase `/auth/v1/user` with token and new password
     - Show loading indicator during API call
     - On success: Navigate to LoginScreen with success message
     - On failure: Show error message
   - [ ] Success message: "Password reset successfully. Please log in with your new password."
   - [ ] Error handling:
     - Expired token: "Reset link expired. Please request a new one."
     - Invalid token: "Invalid reset link. Please request a new one."
     - Network error: "Network error. Please try again."

5. **Token Security**
   - [ ] Token expires after 1 hour
   - [ ] Token is one-time use (invalidated after successful reset)
   - [ ] Token never logged or stored
   - [ ] All communication over HTTPS

### Non-Functional Requirements

1. **Performance**
   - [ ] Password validation: <50ms
   - [ ] Token extraction: <100ms
   - [ ] API call: <2 seconds

2. **Accessibility (EAA)**
   - [ ] Password fields have `accessibilityLabel="New password"`
   - [ ] Show/hide toggles have `accessibilityHint="Toggle password visibility"`
   - [ ] Password strength indicator has `accessibilityLabel="Password strength: Strong"`
   - [ ] Success/error messages have `accessibilityRole="alert"`

3. **Testing**
   - [ ] 100% RNTL coverage for ResetPasswordScreen
   - [ ] E2E test for complete password reset flow
   - [ ] Security test: Verify token expiry works

---

## Technical Implementation

### Component Structure

```typescript
// src/screens/auth/ResetPasswordScreen.tsx

ResetPasswordScreen
├── Header ("Reset Password")
├── Instructions ("Enter your new password below")
├── Form (React Hook Form)
│   ├── NewPasswordInput (secured, show/hide toggle, validation)
│   ├── ConfirmPasswordInput (secured, show/hide toggle, must match)
│   ├── PasswordStrengthIndicator (real-time feedback)
│   └── ErrorMessage (validation errors)
├── SubmitButton ("Reset Password", disabled until valid)
└── LoadingIndicator (during API call)
```

### Data Flow

```
User receives password reset email
  → User taps reset link in email
  → Browser redirects to: warrendeleon://reset-password?token=TOKEN
  → App opens, deep link handler catches URL
  → Extract token from URL
  → Navigate to ResetPasswordScreen with token
  → User enters new password
  → Real-time validation (strength indicator)
  → User confirms password
  → User taps "Reset Password"
  → Validate password strength
  → Call Supabase /auth/v1/user with token and new password
  → On success:
    → Navigate to LoginScreen
    → Show success toast: "Password reset successfully"
  → On failure:
    → Show error message
    → If token expired: Link to "Request New Reset Link"
```

### Deep Link Handler

```typescript
// src/navigation/DeepLinkHandler.tsx

import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const DeepLinkHandler = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle initial URL (app was closed)
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle URL when app is running
    const subscription = Linking.addEventListener('url', event => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    try {
      const parsedUrl = new URL(url);

      // Reset password deep link
      if (parsedUrl.pathname === '/reset-password') {
        const token = parsedUrl.searchParams.get('token');

        if (!token) {
          throw new Error('No reset token found');
        }

        navigation.navigate('ResetPassword', { token });
      }
    } catch (error: any) {
      console.error('Failed to handle deep link:', error);
      // Show error toast
    }
  };
};
```

### Password Strength Validation

```typescript
// src/utils/passwordValidation.ts

import { z } from 'zod';

const COMMON_PASSWORDS = [
  'password',
  'password123',
  '12345678',
  'qwerty',
  'abc123',
  'monkey',
  'letmein',
  'trustno1',
];

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[@$!%*?&#]/, 'Password must contain at least one special character')
  .refine(
    password => !COMMON_PASSWORDS.includes(password.toLowerCase()),
    'This password is too common. Please choose a different one.'
  );

export const validatePasswordStrength = (password: string) => {
  const validation = passwordSchema.safeParse(password);

  if (!validation.success) {
    return {
      isValid: false,
      errors: validation.error.errors.map(e => e.message),
    };
  }

  return {
    isValid: true,
    errors: [],
  };
};

export const calculatePasswordStrength = (
  password: string
): 'weak' | 'fair' | 'good' | 'strong' => {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[@$!%*?&#]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'fair';
  if (score <= 5) return 'good';
  return 'strong';
};
```

### Supabase Password Reset API

```typescript
// src/api/auth/resetPassword.ts

import axios from 'axios';
import Config from 'react-native-config';
import { z } from 'zod';

const resetPasswordRequestSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

const resetPasswordResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
  }),
});

export const resetPasswordWithToken = async (token: string, newPassword: string): Promise<void> => {
  try {
    // Validate input
    const validatedData = resetPasswordRequestSchema.parse({
      token,
      password: newPassword,
    });

    // Call Supabase password update endpoint
    const response = await axios.put(
      `${Config.SUPABASE_URL}/auth/v1/user`,
      {
        password: validatedData.password,
      },
      {
        headers: {
          apikey: Config.SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validatedData.token}`,
        },
      }
    );

    // Validate response
    const validation = resetPasswordResponseSchema.safeParse(response.data);

    if (!validation.success) {
      throw new Error('Invalid response from server');
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 401) {
        throw new Error('Reset link expired or invalid. Please request a new one.');
      } else if (status === 422) {
        throw new Error('Password does not meet requirements');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to reset password');
      }
    }
    throw error;
  }
};
```

### useResetPassword Hook

```typescript
// src/hooks/useResetPassword.ts

import { useState } from 'react';
import { resetPasswordWithToken } from '../api/auth/resetPassword';
import { validatePasswordStrength } from '../utils/passwordValidation';

export const useResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate password strength
      const validation = validatePasswordStrength(newPassword);

      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }

      // Reset password
      await resetPasswordWithToken(token, newPassword);

      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    resetPassword,
    isLoading,
    error,
  };
};
```

### Password Show/Hide Toggle

```typescript
// src/components/forms/SecureTextInput.tsx

import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Input, InputField, InputSlot } from '@gluestack-ui/themed';

interface SecureTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  testID?: string;
}

export const SecureTextInput: React.FC<SecureTextInputProps> = ({
  value,
  onChangeText,
  placeholder,
  testID,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <Input testID={testID}>
      <InputField
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!isPasswordVisible}
        autoCapitalize="none"
      />
      <InputSlot>
        <Pressable
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          testID={`${testID}-toggle`}
          accessibilityRole="button"
          accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
          accessibilityHint="Toggle password visibility"
          style={{ padding: 8 }}
        >
          <Text style={{ fontSize: 20 }}>
            {isPasswordVisible ? '🙈' : '👁️'}
          </Text>
        </Pressable>
      </InputSlot>
    </Input>
  );
};
```

---

## Tasks Breakdown

| Task ID  | Description                 | Effort |
| -------- | --------------------------- | ------ |
| TASK-257 | ResetPasswordScreen UI      | 1.5h   |
| TASK-258 | Deep Link Handler           | 1.5h   |
| TASK-259 | Password Validation         | 1h     |
| TASK-260 | Supabase Password Reset API | 1.5h   |
| TASK-261 | Reset Password RNTL Tests   | 1h     |

**Total**: 5 tasks, 6.5 hours

---

## Testing Strategy

### Unit Tests (RNTL)

**File**: `src/screens/auth/__tests__/ResetPasswordScreen.test.tsx`

```typescript
describe('ResetPasswordScreen', () => {
  const mockToken = 'valid-reset-token-123';

  it('should render password input fields', () => {
    const { getByTestId } = render(<ResetPasswordScreen route={{ params: { token: mockToken } }} />);

    expect(getByTestId('new-password-input')).toBeTruthy();
    expect(getByTestId('confirm-password-input')).toBeTruthy();
  });

  it('should show password strength indicator', () => {
    const { getByTestId } = render(<ResetPasswordScreen route={{ params: { token: mockToken } }} />);

    fireEvent.changeText(getByTestId('new-password-input'), 'WeakPass1!');

    expect(getByTestId('password-strength-indicator')).toBeTruthy();
  });

  it('should disable submit button when passwords do not match', () => {
    const { getByTestId } = render(<ResetPasswordScreen route={{ params: { token: mockToken } }} />);

    fireEvent.changeText(getByTestId('new-password-input'), 'SecurePass123!');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'DifferentPass123!');

    expect(getByTestId('reset-password-button')).toBeDisabled();
  });

  it('should enable submit button when all validations pass', () => {
    const { getByTestId } = render(<ResetPasswordScreen route={{ params: { token: mockToken } }} />);

    fireEvent.changeText(getByTestId('new-password-input'), 'SecurePass123!');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'SecurePass123!');

    expect(getByTestId('reset-password-button')).toBeEnabled();
  });

  it('should call resetPasswordWithToken when form is submitted', async () => {
    mockResetPasswordAPI.resetPasswordWithToken.mockResolvedValue();

    const { getByTestId } = render(<ResetPasswordScreen route={{ params: { token: mockToken } }} />);

    fireEvent.changeText(getByTestId('new-password-input'), 'SecurePass123!');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'SecurePass123!');
    fireEvent.press(getByTestId('reset-password-button'));

    await waitFor(() => {
      expect(mockResetPasswordAPI.resetPasswordWithToken).toHaveBeenCalledWith(
        mockToken,
        'SecurePass123!'
      );
    });
  });

  it('should navigate to Login on success', async () => {
    mockResetPasswordAPI.resetPasswordWithToken.mockResolvedValue();

    const mockNavigation = { navigate: jest.fn() };
    const { getByTestId } = render(
      <ResetPasswordScreen
        route={{ params: { token: mockToken } }}
        navigation={mockNavigation}
      />
    );

    fireEvent.changeText(getByTestId('new-password-input'), 'SecurePass123!');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'SecurePass123!');
    fireEvent.press(getByTestId('reset-password-button'));

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });
  });

  it('should show error when token is expired', async () => {
    mockResetPasswordAPI.resetPasswordWithToken.mockRejectedValue(
      new Error('Reset link expired or invalid')
    );

    const { getByTestId } = render(<ResetPasswordScreen route={{ params: { token: mockToken } }} />);

    fireEvent.changeText(getByTestId('new-password-input'), 'SecurePass123!');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'SecurePass123!');
    fireEvent.press(getByTestId('reset-password-button'));

    await waitFor(() => {
      expect(getByTestId('error-message')).toHaveTextContent('Reset link expired or invalid');
    });
  });
});
```

### E2E Tests (Detox + Cucumber)

**File**: `e2e/features/reset-password.feature`

```gherkin
Feature: Reset Password

  Scenario: Reset password with valid token
    Given I have received a password reset email
    When I tap the reset link in the email
    Then the app should open the Reset Password screen
    When I enter new password "SecurePass123!"
    And I confirm password "SecurePass123!"
    And I tap "Reset Password"
    Then I should see "Password reset successfully"
    And I should be navigated to the Login screen

  Scenario: Expired reset token
    Given I have an expired reset token
    When I tap the reset link
    And I enter new password "SecurePass123!"
    And I tap "Reset Password"
    Then I should see "Reset link expired or invalid"
    And I should see "Request New Reset Link" button

  Scenario: Password too weak
    Given I am on the Reset Password screen
    When I enter new password "weak"
    Then the password strength indicator should show "Weak"
    And the submit button should be disabled

  Scenario: Passwords do not match
    Given I am on the Reset Password screen
    When I enter new password "SecurePass123!"
    And I confirm password "DifferentPass123!"
    Then I should see "Passwords must match"
    And the submit button should be disabled
```

---

## Dependencies

**Upstream**:

- US-044: Request Password Reset (user receives reset token via email)
- Deep link configuration (iOS Associated Domains, Android Intent Filters)

**Downstream**:

- None (User logs in after reset)

---

## Risks & Mitigation

| Risk                             | Probability | Impact | Mitigation                                         |
| -------------------------------- | ----------- | ------ | -------------------------------------------------- |
| Deep link not opening app        | Low         | High   | Test on real devices, verify URL scheme configured |
| Token expired before user clicks | Medium      | Medium | 1-hour expiry is industry standard, educate users  |
| Password requirements too strict | Low         | Medium | Show requirements upfront, real-time validation    |

---

## Definition of Done

**Functional**:

- [ ] All acceptance criteria met
- [ ] All 5 tasks complete
- [ ] Flow working on iOS + Android

**Quality**:

- [ ] 100% RNTL coverage
- [ ] All E2E tests passing
- [ ] `yarn validate` passes

**Security**:

- [ ] Token expires after 1 hour
- [ ] One-time use tokens
- [ ] Password strength enforced
- [ ] HTTPS-only communication

**Accessibility**:

- [ ] All EAA requirements met
- [ ] Screen reader tested

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-024](../epics/EPIC-024-password-recovery.md), [US-044](US-044-forgot-password-request.md)
