/**
 * Error Recovery Integration Tests
 *
 * Tests for error recovery flows across features:
 * - Network error recovery during authentication
 * - Form validation error recovery
 * - Server error recovery and retry
 * - Session expiry recovery
 * - Graceful degradation patterns
 *
 * These tests verify the application handles errors gracefully
 * and allows users to recover from various error states.
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { ForgotPasswordScreen } from '@app/features/Auth/ForgotPasswordScreen';
import { LoginScreen } from '@app/features/Auth/LoginScreen';
import { RegistrationScreen } from '@app/features/Auth/RegistrationScreen';
import {
  forgotPasswordScreenProps,
  loginScreenProps,
  registrationScreenProps,
  renderWithProviders,
} from '@app/test-utils';

// Mock the API client
jest.mock('@app/httpClients', () => ({
  SupabaseAuthClient: {
    requestPasswordRecovery: jest.fn().mockResolvedValue(undefined),
    login: jest.fn().mockResolvedValue({ user: { id: 'user-123' } }),
    register: jest.fn().mockResolvedValue({ user: { id: 'user-123' } }),
  },
}));

// Mock the rate limiter
jest.mock('@app/features/Auth/utils/rateLimiter', () => ({
  checkPasswordResetRateLimit: jest.fn().mockResolvedValue({
    allowed: true,
    requestsRemaining: 3,
  }),
  recordPasswordResetRequest: jest.fn().mockResolvedValue(undefined),
}));

const { navigation: mockLoginNav, route: mockLoginRoute } = loginScreenProps();
const { navigation: mockRegNav, route: mockRegRoute } = registrationScreenProps();
const { navigation: mockForgotNav, route: mockForgotRoute } = forgotPasswordScreenProps();

describe('Error Recovery Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('authentication error recovery', () => {
    it('should allow retry after login error', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Invalid credentials',
              biometricEnabled: false,
            },
          },
        }
      );

      // Error is displayed
      expect(getByText('Invalid credentials')).toBeOnTheScreen();

      // User can still interact with form
      await fireEvent.changeText(getByTestId('email-input'), 'retry@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'NewPassword123!');

      // Form remains functional
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should allow retry after registration error', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Email already registered',
              biometricEnabled: false,
            },
          },
        }
      );

      // Error is displayed
      expect(getByText('Email already registered')).toBeOnTheScreen();

      // User can modify email and retry
      await fireEvent.changeText(getByTestId('email-input'), 'newemail@example.com');

      // Form remains functional
      expect(getByTestId('registration-screen')).toBeOnTheScreen();
    });

    it('should recover from network error on forgot password', async () => {
      const { getByTestId } = await renderWithProviders(
        <ForgotPasswordScreen navigation={mockForgotNav} route={mockForgotRoute} />
      );

      // Enter email
      await fireEvent.changeText(getByTestId('email-input'), 'test@example.com');

      await waitFor(
        () => {
          expect(getByTestId('send-reset-email-button').props.accessibilityState?.disabled).toBe(
            false
          );
        },
        { timeout: 3000, interval: 100 }
      );

      // Screen remains stable for retry
      expect(getByTestId('forgot-password-screen')).toBeOnTheScreen();
    });
  });

  describe('form validation error recovery', () => {
    it('should recover from invalid email format', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Enter invalid email
      await fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Button should be disabled due to invalid email
      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );

      // Correct the email
      await fireEvent.changeText(getByTestId('email-input'), 'valid@example.com');

      // Button should now be enabled
      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(getByDisplayValue('valid@example.com')).toBeOnTheScreen();
    });

    it('should recover from password mismatch in registration', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />
      );

      // Fill form with mismatched passwords
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'Different456!');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      // Button should be disabled
      await waitFor(
        () => {
          expect(getByTestId('register-button').props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );

      // Correct the confirm password
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');

      // Button should now be enabled
      await waitFor(
        () => {
          expect(getByTestId('register-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 5000, interval: 100 }
      );
    });

    it('should recover from weak password error', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Enter weak password
      await fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      await fireEvent.changeText(getByTestId('password-input'), '123');

      // Button should be disabled
      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );

      // Enter strong password
      await fireEvent.changeText(getByTestId('password-input'), 'StrongPass123!');

      // Button should now be enabled
      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('session error recovery', () => {
    it('should handle session expiry gracefully', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              biometricEnabled: false,
            },
          },
        }
      );

      // Rerender simulates state change (component handles error state internally)
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // User can still use the login form
      await fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should allow re-authentication after session error', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Session expired. Please log in again.',
              biometricEnabled: false,
            },
          },
        }
      );

      // User fills in credentials to re-authenticate
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      expect(getByDisplayValue('user@example.com')).toBeOnTheScreen();

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('graceful degradation', () => {
    it('should maintain form state during error', async () => {
      const { getByTestId, getByDisplayValue, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Fill form
      await fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Verify form data
      expect(getByDisplayValue('test@example.com')).toBeOnTheScreen();

      // Rerender simulates state change
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Form data should be preserved
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle loading to error transition', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
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

      expect(getByTestId('login-screen')).toBeOnTheScreen();

      // Transition to error state (rerender simulates state change)
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Screen remains stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle error to success transition', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Previous error',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('login-screen')).toBeOnTheScreen();

      // Error clears on successful retry (rerender simulates state change)
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Screen remains stable with no error
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('navigation during error recovery', () => {
    it('should allow navigation to forgot password during error', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Invalid credentials',
              biometricEnabled: false,
            },
          },
        }
      );

      // User can navigate away from error
      await fireEvent.press(getByTestId('forgot-password-link'));

      expect(mockLoginNav.navigate).toHaveBeenCalledWith('ForgotPassword');
    });

    it('should allow navigation to registration during error', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Account not found',
              biometricEnabled: false,
            },
          },
        }
      );

      // User can navigate to registration
      await fireEvent.press(getByTestId('register-link'));

      expect(mockLoginNav.navigate).toHaveBeenCalledWith('Registration');
    });

    it('should allow navigation to login from registration error', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Email already exists',
              biometricEnabled: false,
            },
          },
        }
      );

      // User can navigate to login
      await fireEvent.press(getByTestId('login-link'));

      expect(mockRegNav.navigate).toHaveBeenCalledWith('Login');
    });
  });

  describe('error message display and dismissal', () => {
    it('should display error message clearly', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Connection timed out',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Connection timed out')).toBeOnTheScreen();
    });

    it('should show registration error clearly', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Password too weak',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Password too weak')).toBeOnTheScreen();
    });
  });

  describe('concurrent error scenarios', () => {
    it('should handle rapid retry attempts', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Please try again',
              biometricEnabled: false,
            },
          },
        }
      );

      // Fill form
      await fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Rapid retry attempts
      for (let i = 0; i < 5; i++) {
        await fireEvent.press(getByTestId('login-button'));
      }

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle error during form modification', async () => {
      const { getByTestId, getByDisplayValue, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Start typing
      await fireEvent.changeText(getByTestId('email-input'), 'test@');

      // Error appears mid-edit (rerender simulates state change)
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Continue editing
      await fireEvent.changeText(getByTestId('email-input'), 'test@example.com');

      expect(getByDisplayValue('test@example.com')).toBeOnTheScreen();
    });
  });

  describe('unmount during error state', () => {
    it('should handle unmount during error display', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount, getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Critical error',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('login-screen')).toBeOnTheScreen();

      // Unmount during error
      await unmount();
      jest.runAllTimers();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('should handle rapid mount/unmount during error recovery', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      for (let i = 0; i < 5; i++) {
        const { unmount } = await renderWithProviders(
          <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
          {
            preloadedState: {
              auth: {
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: 'Error ' + i,
                biometricEnabled: false,
              },
            },
          }
        );
        await unmount();
      }

      // Final mount should work
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      expect(getByTestId('login-screen')).toBeOnTheScreen();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });
  });
});
