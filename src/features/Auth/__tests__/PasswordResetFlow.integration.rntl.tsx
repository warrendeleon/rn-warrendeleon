/**
 * Password Reset Flow Integration Tests
 *
 * Tests the complete password reset journey:
 * Forgot Password → Enter Email → Submit → Email Sent → Reset Password
 */

import React from 'react';
import * as ReactNative from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import type { RootStackParamList } from '@app/navigation';
import { expectFocusOrder, renderWithProviders } from '@app/test-utils';

import { ForgotPasswordScreen } from '../ForgotPasswordScreen';
import { ResetPasswordScreen } from '../ResetPasswordScreen';
import * as rateLimiter from '../utils/rateLimiter';

// Mock the rate limiter
jest.mock('../utils/rateLimiter', () => ({
  checkPasswordResetRateLimit: jest.fn(),
  recordPasswordResetRequest: jest.fn(),
}));

type ForgotPasswordNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
type ResetPasswordNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;

const createMockForgotPasswordNavigation = () =>
  ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
    setParams: jest.fn(),
    addListener: jest.fn(() => () => {}),
    removeListener: jest.fn(),
    dispatch: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
    getId: jest.fn(),
    getParent: jest.fn(),
    getState: jest.fn(() => ({
      key: 'ForgotPassword',
      index: 0,
      routeNames: ['ForgotPassword'],
      routes: [{ key: 'ForgotPassword', name: 'ForgotPassword', params: undefined }],
    })),
  }) as unknown as ForgotPasswordNavigationProp;

const createMockResetPasswordNavigation = () =>
  ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
    setParams: jest.fn(),
    addListener: jest.fn(() => () => {}),
    removeListener: jest.fn(),
    dispatch: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
    getId: jest.fn(),
    getParent: jest.fn(),
    getState: jest.fn(() => ({
      key: 'ResetPassword',
      index: 0,
      routeNames: ['ResetPassword'],
      routes: [
        { key: 'ResetPassword', name: 'ResetPassword', params: { accessToken: 'valid-token' } },
      ],
    })),
  }) as unknown as ResetPasswordNavigationProp;

const forgotPasswordRoute = {
  key: 'ForgotPassword',
  name: 'ForgotPassword' as const,
  params: undefined,
};

const resetPasswordRoute = {
  key: 'ResetPassword',
  name: 'ResetPassword' as const,
  params: { accessToken: 'valid-reset-token' },
};

describe('Password Reset Flow Integration', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;
  let mockForgotPasswordNavigation: ForgotPasswordNavigationProp;
  let mockResetPasswordNavigation: ResetPasswordNavigationProp;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseColorScheme.mockReturnValue('light');
    mockForgotPasswordNavigation = createMockForgotPasswordNavigation();
    mockResetPasswordNavigation = createMockResetPasswordNavigation();
    (rateLimiter.checkPasswordResetRateLimit as jest.Mock).mockResolvedValue({
      allowed: true,
      requestsRemaining: 3,
    });
    (rateLimiter.recordPasswordResetRequest as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Forgot Password Screen - email entry flow', () => {
    it('should render forgot password screen', () => {
      const { getByTestId } = renderWithProviders(
        <ForgotPasswordScreen
          navigation={mockForgotPasswordNavigation}
          route={forgotPasswordRoute}
        />
      );

      expect(getByTestId('forgot-password-screen')).toBeOnTheScreen();
    });

    it('should complete email entry and enable submission', async () => {
      const { getByTestId } = renderWithProviders(
        <ForgotPasswordScreen
          navigation={mockForgotPasswordNavigation}
          route={forgotPasswordRoute}
        />
      );

      // Step 1: Button initially disabled
      const submitButton = getByTestId('send-reset-email-button');
      expect(submitButton.props.accessibilityState?.disabled).toBe(true);

      // Step 2: Enter valid email
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');

      // Step 3: Button should now be enabled
      await waitFor(
        () => {
          expect(submitButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should keep button disabled for invalid email', async () => {
      const { getByTestId } = renderWithProviders(
        <ForgotPasswordScreen
          navigation={mockForgotPasswordNavigation}
          route={forgotPasswordRoute}
        />
      );

      // Enter invalid email
      fireEvent.changeText(getByTestId('email-input'), 'invalid-email');

      // Button should remain disabled
      await waitFor(
        () => {
          const submitButton = getByTestId('send-reset-email-button');
          expect(submitButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should navigate back to login', () => {
      const { getByTestId } = renderWithProviders(
        <ForgotPasswordScreen
          navigation={mockForgotPasswordNavigation}
          route={forgotPasswordRoute}
        />
      );

      fireEvent.press(getByTestId('back-to-login-link'));

      expect(mockForgotPasswordNavigation.goBack).toHaveBeenCalled();
    });

    it('should disable form during loading', () => {
      const { getByTestId } = renderWithProviders(
        <ForgotPasswordScreen
          navigation={mockForgotPasswordNavigation}
          route={forgotPasswordRoute}
        />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: true,
              error: null,
              biometricEnabled: false,
            },
          },
        }
      );

      const submitButton = getByTestId('send-reset-email-button');
      expect(submitButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('Reset Password Screen - new password flow', () => {
    it('should render reset password screen', () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockResetPasswordNavigation} route={resetPasswordRoute} />
      );

      expect(getByTestId('reset-password-screen')).toBeOnTheScreen();
    });

    it('should validate new password requirements', async () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockResetPasswordNavigation} route={resetPasswordRoute} />
      );

      const submitButton = getByTestId('reset-password-button');

      // Initially disabled
      expect(submitButton.props.accessibilityState?.disabled).toBe(true);

      // Enter matching strong passwords
      fireEvent.changeText(getByTestId('new-password-input'), 'NewSecurePass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'NewSecurePass123!');

      // Button should be enabled
      await waitFor(
        () => {
          expect(submitButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should reject mismatched passwords', async () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockResetPasswordNavigation} route={resetPasswordRoute} />
      );

      fireEvent.changeText(getByTestId('new-password-input'), 'NewSecurePass123!');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'DifferentPass456!');

      await waitFor(
        () => {
          const submitButton = getByTestId('reset-password-button');
          expect(submitButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should reject weak passwords', async () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockResetPasswordNavigation} route={resetPasswordRoute} />
      );

      fireEvent.changeText(getByTestId('new-password-input'), 'weak');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'weak');

      await waitFor(
        () => {
          const submitButton = getByTestId('reset-password-button');
          expect(submitButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should disable form during loading', () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockResetPasswordNavigation} route={resetPasswordRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: true,
              error: null,
              biometricEnabled: false,
            },
          },
        }
      );

      const submitButton = getByTestId('reset-password-button');
      expect(submitButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('accessibility throughout reset flow', () => {
    it('should have correct focus order on forgot password screen', () => {
      const { getByTestId } = renderWithProviders(
        <ForgotPasswordScreen
          navigation={mockForgotPasswordNavigation}
          route={forgotPasswordRoute}
        />
      );

      const emailInput = getByTestId('email-input');
      const submitButton = getByTestId('send-reset-email-button');
      const backLink = getByTestId('back-to-login-link');

      expectFocusOrder([emailInput, submitButton, backLink]);
    });

    it('should have proper accessibility roles on forgot password screen', () => {
      const { getByTestId } = renderWithProviders(
        <ForgotPasswordScreen
          navigation={mockForgotPasswordNavigation}
          route={forgotPasswordRoute}
        />
      );

      expect(getByTestId('send-reset-email-button').props.accessibilityRole).toBe('button');
      expect(getByTestId('back-to-login-link').props.accessibilityRole).toBe('link');
    });
  });

  describe('form field chaining', () => {
    it('should support keyboard flow on reset password screen', async () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockResetPasswordNavigation} route={resetPasswordRoute} />
      );

      // Fill password and use submitEditing to move to confirm
      fireEvent.changeText(getByTestId('new-password-input'), 'NewSecurePass123!');
      fireEvent(getByTestId('new-password-input'), 'submitEditing');

      // Fill confirm password
      fireEvent.changeText(getByTestId('confirm-password-input'), 'NewSecurePass123!');

      // Form should be valid
      await waitFor(
        () => {
          const submitButton = getByTestId('reset-password-button');
          expect(submitButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('error recovery', () => {
    it('should allow form editing after entering email', async () => {
      const { getByTestId } = renderWithProviders(
        <ForgotPasswordScreen
          navigation={mockForgotPasswordNavigation}
          route={forgotPasswordRoute}
        />
      );

      // User enters email
      fireEvent.changeText(getByTestId('email-input'), 'retry@example.com');

      // Form should still work
      expect(screen.getByDisplayValue('retry@example.com')).toBeOnTheScreen();
    });
  });
});
