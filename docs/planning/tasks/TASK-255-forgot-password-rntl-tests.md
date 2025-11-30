# TASK-255: Forgot Password RNTL Tests

**ID**: TASK-255 | **Epic**: [EPIC-024](../epics/EPIC-024-password-recovery.md) | **User Story**: [US-044](../stories/US-044-forgot-password-request.md)
**Status**: ✅ Done | **Effort**: 1.5h

---

## Task Description

Write comprehensive React Native Testing Library tests for ForgotPasswordScreen. Test email validation, rate limiting feedback, success/error states, loading indicators, and accessibility. Achieve 100% code coverage.

---

## Acceptance Criteria

- [x] Complete RNTL test suite for ForgotPasswordScreen
- [x] Email validation tested
- [x] Rate limiting feedback tested
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
// src/screens/auth/__tests__/ForgotPasswordScreen.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ForgotPasswordScreen } from '../ForgotPasswordScreen';
import * as passwordResetService from '../../../services/auth/passwordResetService';

jest.mock('../../../services/auth/passwordResetService');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
}));

const mockPasswordResetService = passwordResetService as jest.Mocked<
  typeof passwordResetService
>;

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render screen with all elements', () => {
      const { getByTestId, getByText } = render(<ForgotPasswordScreen />);

      expect(getByTestId('forgot-password-screen')).toBeTruthy();
      expect(getByText('Forgot Password?')).toBeTruthy();
      expect(getByText(/Enter your email address/)).toBeTruthy();
      expect(getByTestId('email-input')).toBeTruthy();
      expect(getByTestId('send-reset-email-button')).toBeTruthy();
      expect(getByTestId('back-to-login-button')).toBeTruthy();
    });

    it('should render information box', () => {
      const { getByText } = render(<ForgotPasswordScreen />);

      expect(getByText('What happens next?')).toBeTruthy();
      expect(getByText(/You'll receive an email/)).toBeTruthy();
      expect(getByText(/The link will expire in 1 hour/)).toBeTruthy();
      expect(getByText(/Maximum 3 requests per hour/)).toBeTruthy();
    });

    it('should have submit button disabled initially', () => {
      const { getByTestId } = render(<ForgotPasswordScreen />);

      expect(getByTestId('send-reset-email-button')).toBeDisabled();
    });
  });

  describe('Email Validation', () => {
    it('should show error for empty email', async () => {
      const { getByTestId, getByText } = render(<ForgotPasswordScreen />);

      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, '');
      fireEvent(emailInput, 'blur');

      await waitFor(() => {
        expect(getByText('Email is required')).toBeTruthy();
      });
    });

    it('should show error for invalid email format', async () => {
      const { getByTestId, getByText } = render(<ForgotPasswordScreen />);

      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent(emailInput, 'blur');

      await waitFor(() => {
        expect(getByText('Please enter a valid email address')).toBeTruthy();
      });
    });

    it('should accept valid email formats', async () => {
      const { getByTestId, queryByTestId } = render(<ForgotPasswordScreen />);

      const validEmails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@subdomain.example.com',
      ];

      for (const email of validEmails) {
        fireEvent.changeText(getByTestId('email-input'), email);
        fireEvent(getByTestId('email-input'), 'blur');

        await waitFor(() => {
          expect(queryByTestId('email-error')).toBeFalsy();
        });
      }
    });

    it('should normalize email to lowercase', async () => {
      mockPasswordResetService.requestPasswordReset.mockResolvedValue();

      const { getByTestId } = render(<ForgotPasswordScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'USER@EXAMPLE.COM');

      await waitFor(() => {
        expect(getByTestId('send-reset-email-button')).toBeEnabled();
      });

      fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(() => {
        expect(mockPasswordResetService.requestPasswordReset).toHaveBeenCalledWith(
          'user@example.com'
        );
      });
    });
  });

  describe('Button States', () => {
    it('should enable button when email is valid', async () => {
      const { getByTestId } = render(<ForgotPasswordScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');

      await waitFor(() => {
        expect(getByTestId('send-reset-email-button')).toBeEnabled();
      });
    });

    it('should disable button when email is invalid', async () => {
      const { getByTestId } = render(<ForgotPasswordScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'invalid');

      await waitFor(() => {
        expect(getByTestId('send-reset-email-button')).toBeDisabled();
      });
    });

    it('should disable button during loading', async () => {
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
        expect(getByTestId('send-reset-email-button')).toBeDisabled();
      });

      resolveRequest!();
    });

    it('should disable button after successful submission', async () => {
      mockPasswordResetService.requestPasswordReset.mockResolvedValue();

      const { getByTestId } = render(<ForgotPasswordScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');

      await waitFor(() => {
        expect(getByTestId('send-reset-email-button')).toBeEnabled();
      });

      fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(() => {
        expect(getByTestId('send-reset-email-button')).toBeDisabled();
      });
    });
  });

  describe('Success State', () => {
    it('should show success message after successful submission', async () => {
      mockPasswordResetService.requestPasswordReset.mockResolvedValue();

      const { getByTestId, getByText } = render(<ForgotPasswordScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(() => {
        expect(getByTestId('success-message')).toBeTruthy();
        expect(getByText('Email Sent!')).toBeTruthy();
        expect(getByText(/We've sent a password reset link to user@example.com/)).toBeTruthy();
      });
    });

    it('should disable email input after success', async () => {
      mockPasswordResetService.requestPasswordReset.mockResolvedValue();

      const { getByTestId } = render(<ForgotPasswordScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(() => {
        expect(getByTestId('email-input')).toBeDisabled();
      });
    });

    it('should navigate back after 5 seconds on success', async () => {
      jest.useFakeTimers();
      const mockGoBack = jest.fn();

      jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
        goBack: mockGoBack,
      });

      mockPasswordResetService.requestPasswordReset.mockResolvedValue();

      const { getByTestId } = render(<ForgotPasswordScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(() => {
        expect(getByTestId('success-message')).toBeTruthy();
      });

      jest.advanceTimersByTime(5000);

      expect(mockGoBack).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe('Error States', () => {
    it('should show rate limit error', async () => {
      mockPasswordResetService.requestPasswordReset.mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      const { getByTestId, getByText } = render(<ForgotPasswordScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
        expect(
          getByText(/exceeded the maximum number of password reset requests/)
        ).toBeTruthy();
      });
    });

    it('should show generic error for failed requests', async () => {
      mockPasswordResetService.requestPasswordReset.mockRejectedValue(
        new Error('Network error')
      );

      const { getByTestId, getByText } = render(<ForgotPasswordScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
        expect(getByText('Network error')).toBeTruthy();
      });
    });

    it('should show success message for email not found (security)', async () => {
      mockPasswordResetService.requestPasswordReset.mockRejectedValue(
        new Error('User not found')
      );

      const { getByTestId, getByText } = render(<ForgotPasswordScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'nonexistent@example.com');
      fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(() => {
        expect(getByTestId('success-message')).toBeTruthy();
        expect(
          getByText(/If an account exists with nonexistent@example.com/)
        ).toBeTruthy();
      });
    });

    it('should clear error message on retry', async () => {
      mockPasswordResetService.requestPasswordReset
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce();

      const { getByTestId, queryByTestId } = render(<ForgotPasswordScreen />);

      // First attempt - error
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
      });

      // Second attempt - success
      fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(() => {
        expect(queryByTestId('error-message')).toBeFalsy();
        expect(getByTestId('success-message')).toBeTruthy();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner during request', async () => {
      let resolveRequest: () => void;
      const requestPromise = new Promise<void>((resolve) => {
        resolveRequest = resolve;
      });

      mockPasswordResetService.requestPasswordReset.mockReturnValue(requestPromise);

      const { getByTestId } = render(<ForgotPasswordScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(() => {
        expect(getByTestId('loading-spinner')).toBeTruthy();
      });

      resolveRequest!();
    });

    it('should hide loading spinner after success', async () => {
      mockPasswordResetService.requestPasswordReset.mockResolvedValue();

      const { getByTestId, queryByTestId } = render(<ForgotPasswordScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(() => {
        expect(queryByTestId('loading-spinner')).toBeFalsy();
      });
    });

    it('should hide loading spinner after error', async () => {
      mockPasswordResetService.requestPasswordReset.mockRejectedValue(
        new Error('Network error')
      );

      const { getByTestId, queryByTestId } = render(<ForgotPasswordScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(() => {
        expect(queryByTestId('loading-spinner')).toBeFalsy();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button pressed', () => {
      const mockGoBack = jest.fn();

      jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
        goBack: mockGoBack,
      });

      const { getByTestId } = render(<ForgotPasswordScreen />);

      fireEvent.press(getByTestId('back-to-login-button'));

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility roles', () => {
      const { getByTestId } = render(<ForgotPasswordScreen />);

      expect(getByTestId('send-reset-email-button')).toHaveProp(
        'accessibilityRole',
        'button'
      );
      expect(getByTestId('back-to-login-button')).toHaveProp('accessibilityRole', 'button');
    });

    it('should have correct accessibility labels', () => {
      const { getByTestId } = render(<ForgotPasswordScreen />);

      expect(getByTestId('send-reset-email-button')).toHaveProp(
        'accessibilityLabel',
        'Send recovery email'
      );
      expect(getByTestId('back-to-login-button')).toHaveProp(
        'accessibilityLabel',
        'Back to login'
      );
    });

    it('should have correct accessibility hints', () => {
      const { getByTestId } = render(<ForgotPasswordScreen />);

      expect(getByTestId('send-reset-email-button')).toHaveProp(
        'accessibilityHint',
        'Request a password reset email'
      );
    });

    it('should update accessibility state when button disabled', async () => {
      const { getByTestId } = render(<ForgotPasswordScreen />);

      // Initially disabled
      expect(getByTestId('send-reset-email-button')).toHaveProp('accessibilityState', {
        disabled: true,
      });

      // Enabled after valid email
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');

      await waitFor(() => {
        expect(getByTestId('send-reset-email-button')).toHaveProp('accessibilityState', {
          disabled: false,
        });
      });
    });

    it('should announce success message with alert role', async () => {
      mockPasswordResetService.requestPasswordReset.mockResolvedValue();

      const { getByTestId } = render(<ForgotPasswordScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(() => {
        expect(getByTestId('success-message')).toHaveProp('accessibilityRole', 'alert');
      });
    });

    it('should announce error message with alert role', async () => {
      mockPasswordResetService.requestPasswordReset.mockRejectedValue(
        new Error('Network error')
      );

      const { getByTestId } = render(<ForgotPasswordScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(() => {
        expect(getByTestId('error-message')).toHaveProp('accessibilityRole', 'alert');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid button presses', async () => {
      mockPasswordResetService.requestPasswordReset.mockResolvedValue();

      const { getByTestId } = render(<ForgotPasswordScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');

      await waitFor(() => {
        expect(getByTestId('send-reset-email-button')).toBeEnabled();
      });

      // Press button multiple times rapidly
      fireEvent.press(getByTestId('send-reset-email-button'));
      fireEvent.press(getByTestId('send-reset-email-button'));
      fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(() => {
        // Should only call service once
        expect(mockPasswordResetService.requestPasswordReset).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle very long email addresses', async () => {
      mockPasswordResetService.requestPasswordReset.mockResolvedValue();

      const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';

      const { getByTestId } = render(<ForgotPasswordScreen />);

      fireEvent.changeText(getByTestId('email-input'), longEmail);

      await waitFor(() => {
        expect(getByTestId('send-reset-email-button')).toBeEnabled();
      });

      fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(() => {
        expect(mockPasswordResetService.requestPasswordReset).toHaveBeenCalledWith(longEmail);
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
- ForgotPasswordScreen component (TASK-252)
- Password reset service (TASK-254)

---

## Definition of Done

- [x] All test scenarios covered
- [x] Email validation tested
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

**Completed**: 2025-11-30
**Last Updated**: 2025-11-30
**Related**: [US-044](../stories/US-044-forgot-password-request.md), [TASK-252](TASK-252-forgot-password-ui.md), [TASK-254](TASK-254-supabase-recovery-api.md), [TASK-256](TASK-256-forgot-password-e2e-tests.md)
