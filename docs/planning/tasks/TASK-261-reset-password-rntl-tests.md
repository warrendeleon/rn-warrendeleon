# TASK-261: Reset Password RNTL Tests

**ID**: TASK-261 | **Epic**: [EPIC-024](../epics/EPIC-024-password-recovery.md) | **User Story**: [US-045](../stories/US-045-reset-password-with-token.md)
**Status**: ✅ Done | **Effort**: 1h

---

## Task Description

Write comprehensive React Native Testing Library tests for ResetPasswordScreen. Test token verification, password validation, password confirmation, strength indicator, success/error states, and accessibility. Achieve 100% code coverage.

---

## Acceptance Criteria

- [x] Complete RNTL test suite for ResetPasswordScreen
- [x] Token verification tested (via route params)
- [x] Password validation tested
- [x] Password confirmation tested
- [x] Password strength indicator tested
- [x] Password visibility toggle tested
- [x] Success message tested
- [x] Error messages tested
- [x] Loading states tested
- [x] Button states tested (enabled/disabled)
- [x] Navigation tested
- [x] Accessibility tested
- [x] 100% code coverage
- [x] All tests passing

---

## Implementation Details

### Comprehensive RNTL Test Suite

```typescript
// src/screens/auth/__tests__/ResetPasswordScreen.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ResetPasswordScreen } from '../ResetPasswordScreen';
import * as passwordResetService from '../../../services/auth/passwordResetService';

jest.mock('../../../services/auth/passwordResetService');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  useRoute: () => ({
    params: { token: 'valid_token_123' },
  }),
}));

const mockPasswordResetService = passwordResetService as jest.Mocked<
  typeof passwordResetService
>;

describe('ResetPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Verification', () => {
    it('should show loading state during token verification', () => {
      mockPasswordResetService.verifyPasswordResetToken.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { getByTestId, getByText } = render(<ResetPasswordScreen />);

      expect(getByTestId('token-verification-spinner')).toBeTruthy();
      expect(getByText('Verifying reset link...')).toBeTruthy();
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

    it('should show error for invalid token', async () => {
      mockPasswordResetService.verifyPasswordResetToken.mockResolvedValue(false);

      const { getByTestId, getByText } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('invalid-token-message')).toBeTruthy();
        expect(getByText(/This password reset link is invalid or has expired/)).toBeTruthy();
        expect(getByTestId('request-new-reset-button')).toBeTruthy();
      });
    });

    it('should show error when token verification fails', async () => {
      mockPasswordResetService.verifyPasswordResetToken.mockRejectedValue(
        new Error('Network error')
      );

      const { getByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('invalid-token-message')).toBeTruthy();
      });
    });

    it('should handle missing token parameter', async () => {
      jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
        params: {},
      });

      mockPasswordResetService.verifyPasswordResetToken.mockResolvedValue(false);

      const { getByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('invalid-token-message')).toBeTruthy();
      });
    });
  });

  describe('Password Validation', () => {
    beforeEach(async () => {
      mockPasswordResetService.verifyPasswordResetToken.mockResolvedValue(true);
    });

    it('should show error for password without uppercase', async () => {
      const { getByTestId, getByText } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'password123!');
      fireEvent(getByTestId('password-input'), 'blur');

      await waitFor(() => {
        expect(getByText(/uppercase letter/)).toBeTruthy();
      });
    });

    it('should show error for password without lowercase', async () => {
      const { getByTestId, getByText } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'PASSWORD123!');
      fireEvent(getByTestId('password-input'), 'blur');

      await waitFor(() => {
        expect(getByText(/lowercase letter/)).toBeTruthy();
      });
    });

    it('should show error for password without number', async () => {
      const { getByTestId, getByText } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'Password!');
      fireEvent(getByTestId('password-input'), 'blur');

      await waitFor(() => {
        expect(getByText(/number/)).toBeTruthy();
      });
    });

    it('should show error for password without special character', async () => {
      const { getByTestId, getByText } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'Password123');
      fireEvent(getByTestId('password-input'), 'blur');

      await waitFor(() => {
        expect(getByText(/special character/)).toBeTruthy();
      });
    });

    it('should show error for short password', async () => {
      const { getByTestId, getByText } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'Pass1!');
      fireEvent(getByTestId('password-input'), 'blur');

      await waitFor(() => {
        expect(getByText(/8 characters/)).toBeTruthy();
      });
    });

    it('should accept valid password', async () => {
      const { getByTestId, queryByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');

      await waitFor(() => {
        expect(queryByTestId('password-error')).toBeFalsy();
      });
    });
  });

  describe('Password Confirmation', () => {
    beforeEach(async () => {
      mockPasswordResetService.verifyPasswordResetToken.mockResolvedValue(true);
    });

    it('should show error when passwords do not match', async () => {
      const { getByTestId, getByText } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'DifferentPass123!');
      fireEvent(getByTestId('confirm-password-input'), 'blur');

      await waitFor(() => {
        expect(getByText('Passwords must match')).toBeTruthy();
      });
    });

    it('should not show error when passwords match', async () => {
      const { getByTestId, queryByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'ValidPass123!');

      await waitFor(() => {
        expect(queryByTestId('confirm-password-error')).toBeFalsy();
      });
    });
  });

  describe('Password Strength Indicator', () => {
    beforeEach(async () => {
      mockPasswordResetService.verifyPasswordResetToken.mockResolvedValue(true);
    });

    it('should show strength indicator when typing password', async () => {
      const { getByTestId, queryByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      // No indicator initially
      expect(queryByTestId('password-strength-indicator')).toBeFalsy();

      // Show indicator after typing
      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');

      await waitFor(() => {
        expect(queryByTestId('password-strength-indicator')).toBeTruthy();
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    beforeEach(async () => {
      mockPasswordResetService.verifyPasswordResetToken.mockResolvedValue(true);
    });

    it('should toggle password visibility', async () => {
      const { getByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      const passwordInput = getByTestId('password-input');

      // Initially hidden
      expect(passwordInput.props.secureTextEntry).toBe(true);

      // Toggle to show
      fireEvent.press(getByTestId('password-visibility-toggle'));
      expect(passwordInput.props.secureTextEntry).toBe(false);

      // Toggle to hide
      fireEvent.press(getByTestId('password-visibility-toggle'));
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it('should toggle confirm password visibility', async () => {
      const { getByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('confirm-password-input')).toBeTruthy();
      });

      const confirmPasswordInput = getByTestId('confirm-password-input');

      // Initially hidden
      expect(confirmPasswordInput.props.secureTextEntry).toBe(true);

      // Toggle to show
      fireEvent.press(getByTestId('confirm-password-visibility-toggle'));
      expect(confirmPasswordInput.props.secureTextEntry).toBe(false);

      // Toggle to hide
      fireEvent.press(getByTestId('confirm-password-visibility-toggle'));
      expect(confirmPasswordInput.props.secureTextEntry).toBe(true);
    });
  });

  describe('Button States', () => {
    beforeEach(async () => {
      mockPasswordResetService.verifyPasswordResetToken.mockResolvedValue(true);
    });

    it('should disable button initially', async () => {
      const { getByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('reset-password-button')).toBeDisabled();
      });
    });

    it('should enable button when form is valid', async () => {
      const { getByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'ValidPass123!');

      await waitFor(() => {
        expect(getByTestId('reset-password-button')).toBeEnabled();
      });
    });

    it('should disable button during loading', async () => {
      let resolveRequest: () => void;
      const requestPromise = new Promise<void>((resolve) => {
        resolveRequest = resolve;
      });

      mockPasswordResetService.resetPasswordWithToken.mockReturnValue(requestPromise);

      const { getByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'ValidPass123!');

      await waitFor(() => {
        expect(getByTestId('reset-password-button')).toBeEnabled();
      });

      fireEvent.press(getByTestId('reset-password-button'));

      await waitFor(() => {
        expect(getByTestId('reset-password-button')).toBeDisabled();
      });

      resolveRequest!();
    });

    it('should disable button after success', async () => {
      mockPasswordResetService.resetPasswordWithToken.mockResolvedValue();

      const { getByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'ValidPass123!');
      fireEvent.press(getByTestId('reset-password-button'));

      await waitFor(() => {
        expect(getByTestId('reset-password-button')).toBeDisabled();
      });
    });
  });

  describe('Success State', () => {
    beforeEach(async () => {
      mockPasswordResetService.verifyPasswordResetToken.mockResolvedValue(true);
    });

    it('should show success message after successful reset', async () => {
      mockPasswordResetService.resetPasswordWithToken.mockResolvedValue();

      const { getByTestId, getByText } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'ValidPass123!');
      fireEvent.press(getByTestId('reset-password-button'));

      await waitFor(() => {
        expect(getByTestId('success-message')).toBeTruthy();
        expect(getByText(/password has been reset successfully/)).toBeTruthy();
      });
    });

    it('should navigate to login after success', async () => {
      jest.useFakeTimers();
      const mockNavigate = jest.fn();

      jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
        navigate: mockNavigate,
      });

      mockPasswordResetService.resetPasswordWithToken.mockResolvedValue();

      const { getByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'ValidPass123!');
      fireEvent.press(getByTestId('reset-password-button'));

      await waitFor(() => {
        expect(getByTestId('success-message')).toBeTruthy();
      });

      jest.advanceTimersByTime(3000);

      expect(mockNavigate).toHaveBeenCalledWith('Login');

      jest.useRealTimers();
    });

    it('should disable inputs after success', async () => {
      mockPasswordResetService.resetPasswordWithToken.mockResolvedValue();

      const { getByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'ValidPass123!');
      fireEvent.press(getByTestId('reset-password-button'));

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeDisabled();
        expect(getByTestId('confirm-password-input')).toBeDisabled();
      });
    });
  });

  describe('Error States', () => {
    beforeEach(async () => {
      mockPasswordResetService.verifyPasswordResetToken.mockResolvedValue(true);
    });

    it('should show error for invalid token during reset', async () => {
      mockPasswordResetService.resetPasswordWithToken.mockRejectedValue(
        new Error('Invalid or expired reset token')
      );

      const { getByTestId, getByText } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'ValidPass123!');
      fireEvent.press(getByTestId('reset-password-button'));

      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
        expect(getByText(/Invalid or expired reset token/)).toBeTruthy();
      });
    });

    it('should show error for weak password', async () => {
      mockPasswordResetService.resetPasswordWithToken.mockRejectedValue(
        new Error('Password does not meet security requirements')
      );

      const { getByTestId, getByText } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'ValidPass123!');
      fireEvent.press(getByTestId('reset-password-button'));

      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
        expect(getByText(/does not meet security requirements/)).toBeTruthy();
      });
    });

    it('should show error for network failure', async () => {
      mockPasswordResetService.resetPasswordWithToken.mockRejectedValue(
        new Error('Unable to connect to server')
      );

      const { getByTestId, getByText } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'ValidPass123!');
      fireEvent.press(getByTestId('reset-password-button'));

      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
        expect(getByText(/Unable to connect to server/)).toBeTruthy();
      });
    });

    it('should clear error on retry', async () => {
      mockPasswordResetService.resetPasswordWithToken
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce();

      const { getByTestId, queryByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'ValidPass123!');

      // First attempt - error
      fireEvent.press(getByTestId('reset-password-button'));

      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
      });

      // Second attempt - success
      fireEvent.press(getByTestId('reset-password-button'));

      await waitFor(() => {
        expect(queryByTestId('error-message')).toBeFalsy();
        expect(getByTestId('success-message')).toBeTruthy();
      });
    });
  });

  describe('Loading State', () => {
    beforeEach(async () => {
      mockPasswordResetService.verifyPasswordResetToken.mockResolvedValue(true);
    });

    it('should show loading spinner during reset', async () => {
      let resolveRequest: () => void;
      const requestPromise = new Promise<void>((resolve) => {
        resolveRequest = resolve;
      });

      mockPasswordResetService.resetPasswordWithToken.mockReturnValue(requestPromise);

      const { getByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'ValidPass123!');
      fireEvent.press(getByTestId('reset-password-button'));

      await waitFor(() => {
        expect(getByTestId('loading-spinner')).toBeTruthy();
      });

      resolveRequest!();
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      mockPasswordResetService.verifyPasswordResetToken.mockResolvedValue(true);
    });

    it('should have correct accessibility roles', async () => {
      const { getByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('reset-password-button')).toHaveProp('accessibilityRole', 'button');
      });
    });

    it('should have correct accessibility labels', async () => {
      const { getByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('reset-password-button')).toHaveProp(
          'accessibilityLabel',
          'Reset password'
        );
      });
    });

    it('should update accessibility state when button disabled', async () => {
      const { getByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        // Initially disabled
        expect(getByTestId('reset-password-button')).toHaveProp('accessibilityState', {
          disabled: true,
        });
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'ValidPass123!');

      await waitFor(() => {
        // Enabled after valid form
        expect(getByTestId('reset-password-button')).toHaveProp('accessibilityState', {
          disabled: false,
        });
      });
    });

    it('should announce success message with alert role', async () => {
      mockPasswordResetService.resetPasswordWithToken.mockResolvedValue();

      const { getByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'ValidPass123!');
      fireEvent.press(getByTestId('reset-password-button'));

      await waitFor(() => {
        expect(getByTestId('success-message')).toHaveProp('accessibilityRole', 'alert');
      });
    });

    it('should announce error message with alert role', async () => {
      mockPasswordResetService.resetPasswordWithToken.mockRejectedValue(
        new Error('Network error')
      );

      const { getByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'ValidPass123!');
      fireEvent.press(getByTestId('reset-password-button'));

      await waitFor(() => {
        expect(getByTestId('error-message')).toHaveProp('accessibilityRole', 'alert');
      });
    });
  });

  describe('Edge Cases', () => {
    beforeEach(async () => {
      mockPasswordResetService.verifyPasswordResetToken.mockResolvedValue(true);
    });

    it('should handle rapid button presses', async () => {
      mockPasswordResetService.resetPasswordWithToken.mockResolvedValue();

      const { getByTestId } = render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(getByTestId('password-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'ValidPass123!');

      await waitFor(() => {
        expect(getByTestId('reset-password-button')).toBeEnabled();
      });

      // Press button multiple times rapidly
      fireEvent.press(getByTestId('reset-password-button'));
      fireEvent.press(getByTestId('reset-password-button'));
      fireEvent.press(getByTestId('reset-password-button'));

      await waitFor(() => {
        // Should only call service once
        expect(mockPasswordResetService.resetPasswordWithToken).toHaveBeenCalledTimes(1);
      });
    });
  });
});
```

---

## Dependencies

- `@testing-library/react-native`
- `@testing-library/jest-native`
- Jest
- ResetPasswordScreen component (TASK-257)
- Password reset service (TASK-254, TASK-260)
- Password validation utility (TASK-259)

---

## Definition of Done

- [x] All test scenarios covered
- [x] Token verification tested
- [x] Password validation tested
- [x] Password confirmation tested
- [x] Strength indicator tested
- [x] Visibility toggle tested
- [x] Button states tested
- [x] Success/error states tested
- [x] Loading states tested
- [x] Navigation tested
- [x] Accessibility tested
- [x] Edge cases tested
- [x] 100% code coverage achieved
- [x] All tests passing
- [x] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-045](../stories/US-045-reset-password-with-token.md), [TASK-257](TASK-257-reset-password-ui.md), [TASK-260](TASK-260-supabase-password-reset-api.md)
