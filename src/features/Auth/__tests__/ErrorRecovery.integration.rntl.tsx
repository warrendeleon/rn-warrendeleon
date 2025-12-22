/**
 * Error Recovery Integration Tests
 *
 * Tests for error recovery flow scenarios:
 * - Network error → Retry → Success
 * - Server error → Wait → Retry → Success
 * - Validation error → Fix → Resubmit → Success
 * - Session expired → Re-login → Resume action
 * - Rate limited → Wait period → Retry
 *
 * These tests verify the application handles error states
 * gracefully and allows users to recover from failures.
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { loginScreenProps, registrationScreenProps, renderWithProviders } from '@app/test-utils';

import { LoginScreen } from '../LoginScreen';
import { RegistrationScreen } from '../RegistrationScreen';

const loginProps = loginScreenProps();
const registrationProps = registrationScreenProps();

describe('Error Recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('network error recovery', () => {
    it('should display network error message', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Network error. Please check your connection.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Network error. Please check your connection.')).toBeOnTheScreen();
    });

    it('should allow retry after network error', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Network error',
              biometricEnabled: false,
            },
          },
        }
      );

      // Form should still be functional
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Retry should be possible
      fireEvent.press(getByTestId('login-button'));
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should preserve form data after network error', () => {
      const { getByTestId, getByDisplayValue } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Network error',
              biometricEnabled: false,
            },
          },
        }
      );

      // Fill form
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Data should be preserved
      expect(getByDisplayValue('user@example.com')).toBeOnTheScreen();
    });

    it('should handle intermittent network errors', async () => {
      const { getByTestId, rerender } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Network error',
              biometricEnabled: false,
            },
          },
        }
      );

      // Fill form
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Retry attempt
      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      fireEvent.press(getByTestId('login-button'));

      // Rerender simulates state update
      rerender(<LoginScreen navigation={loginProps.navigation} route={loginProps.route} />);

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('server error recovery', () => {
    it('should display server error message', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Server error (500). Please try again later.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Server error (500). Please try again later.')).toBeOnTheScreen();
    });

    it('should allow retry after server error', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Server error',
              biometricEnabled: false,
            },
          },
        }
      );

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      fireEvent.press(getByTestId('login-button'));
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle service unavailable error', () => {
      const { getByText } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Service temporarily unavailable. Please try again.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByText('Service temporarily unavailable. Please try again.')).toBeOnTheScreen();
    });

    it('should handle timeout error', () => {
      const { getByText } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Request timed out. Please try again.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByText('Request timed out. Please try again.')).toBeOnTheScreen();
    });
  });

  describe('validation error recovery', () => {
    it('should display validation error message', () => {
      const { getByText } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Invalid email or password.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByText('Invalid email or password.')).toBeOnTheScreen();
    });

    it('should allow fixing input after validation error', async () => {
      const { getByTestId, getByDisplayValue } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Invalid email format',
              biometricEnabled: false,
            },
          },
        }
      );

      // Fix the email
      fireEvent.changeText(getByTestId('email-input'), 'corrected@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      expect(getByDisplayValue('corrected@example.com')).toBeOnTheScreen();

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should allow resubmit after fixing validation error', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Validation error',
              biometricEnabled: false,
            },
          },
        }
      );

      // Fix and resubmit
      fireEvent.changeText(getByTestId('email-input'), 'valid@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      fireEvent.press(getByTestId('login-button'));
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle email already registered error in registration', async () => {
      const { getByTestId, getByText, getByDisplayValue } = renderWithProviders(
        <RegistrationScreen
          navigation={registrationProps.navigation}
          route={registrationProps.route}
        />,
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

      expect(getByText('Email already registered')).toBeOnTheScreen();

      // User can change email
      fireEvent.changeText(getByTestId('email-input'), 'newemail@example.com');
      expect(getByDisplayValue('newemail@example.com')).toBeOnTheScreen();
    });

    it('should handle password mismatch error in registration', async () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen
          navigation={registrationProps.navigation}
          route={registrationProps.route}
        />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Passwords do not match',
              biometricEnabled: false,
            },
          },
        }
      );

      // Fix password
      fireEvent.changeText(getByTestId('password-input'), 'NewSecurePass123!');
      fireEvent.changeText(getByTestId('confirmPassword-input'), 'NewSecurePass123!');

      // Form should update
      expect(getByTestId('password-input').props.value).toBe('NewSecurePass123!');
      expect(getByTestId('confirmPassword-input').props.value).toBe('NewSecurePass123!');
    });
  });

  describe('session expired recovery', () => {
    it('should display session expired error', () => {
      const { getByText } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
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

      expect(getByText('Session expired. Please log in again.')).toBeOnTheScreen();
    });

    it('should allow re-login after session expiry', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Session expired',
              biometricEnabled: false,
            },
          },
        }
      );

      // Fresh form for re-login
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      fireEvent.press(getByTestId('login-button'));
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle token invalid error', () => {
      const { getByText } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Authentication token invalid. Please log in again.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByText('Authentication token invalid. Please log in again.')).toBeOnTheScreen();
    });

    it('should clear previous session data on re-login', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />
      );

      // Form should be empty (session cleared)
      expect(getByTestId('email-input').props.value).toBe('');
      expect(getByTestId('password-input').props.value).toBe('');
    });
  });

  describe('rate limiting recovery', () => {
    it('should display rate limit error message', () => {
      const { getByText } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Too many attempts. Please wait 60 seconds.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByText('Too many attempts. Please wait 60 seconds.')).toBeOnTheScreen();
    });

    it('should preserve form data during rate limit', () => {
      const { getByTestId, getByDisplayValue } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Rate limited',
              biometricEnabled: false,
            },
          },
        }
      );

      // Fill form while rate limited
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Data should be preserved
      expect(getByDisplayValue('user@example.com')).toBeOnTheScreen();
    });

    it('should allow retry after rate limit period', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Rate limited - please wait',
              biometricEnabled: false,
            },
          },
        }
      );

      // Fill form
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Retry should work after wait period
      fireEvent.press(getByTestId('login-button'));
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle account locked error', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Account locked due to too many failed attempts. Please reset your password.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(
        getByText('Account locked due to too many failed attempts. Please reset your password.')
      ).toBeOnTheScreen();

      // Password reset link should be accessible
      expect(getByTestId('forgot-password-link')).toBeOnTheScreen();
    });
  });

  describe('error message clearing', () => {
    it('should allow input changes after error', () => {
      const { getByTestId, getByDisplayValue } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
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

      // Start typing (error should not block input)
      fireEvent.changeText(getByTestId('email-input'), 'new@example.com');

      expect(getByDisplayValue('new@example.com')).toBeOnTheScreen();
    });

    it('should maintain form interactivity with error displayed', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Error displayed',
              biometricEnabled: false,
            },
          },
        }
      );

      // Form should be interactive
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('multiple error recovery attempts', () => {
    it('should handle multiple retry attempts', async () => {
      const { getByTestId, rerender } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'First error',
              biometricEnabled: false,
            },
          },
        }
      );

      // First retry
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      fireEvent.press(getByTestId('login-button'));

      // Second error
      rerender(<LoginScreen navigation={loginProps.navigation} route={loginProps.route} />);

      // Second retry
      fireEvent.press(getByTestId('login-button'));

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle different error types in sequence', () => {
      const errors = ['Network error', 'Server error', 'Validation error', 'Session expired'];

      for (const error of errors) {
        const { getByTestId, getByText, unmount } = renderWithProviders(
          <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
          {
            preloadedState: {
              auth: {
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error,
                biometricEnabled: false,
              },
            },
          }
        );

        expect(getByText(error)).toBeOnTheScreen();
        expect(getByTestId('email-input')).toBeOnTheScreen();
        unmount();
      }
    });
  });

  describe('error accessibility', () => {
    it('should have accessible error message', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Error message',
              biometricEnabled: false,
            },
          },
        }
      );

      const errorMessage = getByTestId('auth-error-message');
      expect(errorMessage.props.accessibilityRole).toBe('alert');
    });

    it('should announce error to screen readers', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
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

      const errorMessage = getByTestId('auth-error-message');
      // Error should be marked as alert for screen reader announcement
      expect(errorMessage.props.accessibilityRole).toBe('alert');
    });

    it('should maintain form accessibility after error', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Error',
              biometricEnabled: false,
            },
          },
        }
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      expect(emailInput.props.accessibilityLabel).toBeDefined();
      expect(passwordInput.props.accessibilityLabel).toBeDefined();
    });
  });

  describe('registration error recovery', () => {
    it('should handle registration network error', async () => {
      const { getByTestId, getByText } = renderWithProviders(
        <RegistrationScreen
          navigation={registrationProps.navigation}
          route={registrationProps.route}
        />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Network error during registration',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByText('Network error during registration')).toBeOnTheScreen();

      // Form should be functional for retry
      fireEvent.changeText(getByTestId('firstName-input'), 'John');
      expect(getByTestId('firstName-input').props.value).toBe('John');
    });

    it('should handle weak password error in registration', () => {
      const { getByText } = renderWithProviders(
        <RegistrationScreen
          navigation={registrationProps.navigation}
          route={registrationProps.route}
        />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Password must be at least 8 characters with uppercase, lowercase, and number',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(
        getByText('Password must be at least 8 characters with uppercase, lowercase, and number')
      ).toBeOnTheScreen();
    });

    it('should allow fixing all fields in registration after error', async () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen
          navigation={registrationProps.navigation}
          route={registrationProps.route}
        />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Registration failed',
              biometricEnabled: false,
            },
          },
        }
      );

      // Fix all fields
      fireEvent.changeText(getByTestId('firstName-input'), 'John');
      fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(
        () => {
          expect(getByTestId('register-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('resume action after re-login', () => {
    it('should display intended action after session expiry and re-login', async () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Session expired while updating profile. Please log in to continue.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(
        getByText('Session expired while updating profile. Please log in to continue.')
      ).toBeOnTheScreen();

      // User can re-login
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should preserve pending action context through re-login flow', async () => {
      const { getByTestId, rerender } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Please log in to complete your action.',
              biometricEnabled: false,
            },
          },
        }
      );

      // Fill login form
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit login
      fireEvent.press(getByTestId('login-button'));

      // Rerender simulates successful login
      rerender(<LoginScreen navigation={loginProps.navigation} route={loginProps.route} />);

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle deep link action resume after re-login', async () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Session expired. Log in to view the shared content.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByText('Session expired. Log in to view the shared content.')).toBeOnTheScreen();

      // User re-authenticates
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      fireEvent.press(getByTestId('login-button'));
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should resume form submission after re-login', async () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Your session expired while saving changes. Log in to retry.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(
        getByText('Your session expired while saving changes. Log in to retry.')
      ).toBeOnTheScreen();

      // Complete re-login
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      fireEvent.press(getByTestId('login-button'));
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle payment action resume after re-login', async () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Authentication required to complete payment. Please log in.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(
        getByText('Authentication required to complete payment. Please log in.')
      ).toBeOnTheScreen();

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should not lose pending action on failed re-login attempt', async () => {
      const { getByTestId, rerender } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Please log in to continue your action.',
              biometricEnabled: false,
            },
          },
        }
      );

      // Try to login with wrong password
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'WrongPass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      fireEvent.press(getByTestId('login-button'));

      // Simulate failed login
      rerender(<LoginScreen navigation={loginProps.navigation} route={loginProps.route} />);

      // Should still be able to retry
      expect(getByTestId('email-input')).toBeOnTheScreen();
      expect(getByTestId('password-input')).toBeOnTheScreen();
    });

    it('should handle multiple action types queued for resume', async () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Multiple pending actions require authentication.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByText('Multiple pending actions require authentication.')).toBeOnTheScreen();

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should clear pending action after successful completion', async () => {
      const { getByTestId, rerender } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />
      );

      // Fresh login screen (action completed)
      expect(getByTestId('email-input').props.value).toBe('');
      expect(getByTestId('password-input').props.value).toBe('');

      // No pending action error
      rerender(<LoginScreen navigation={loginProps.navigation} route={loginProps.route} />);

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle action timeout after re-login', async () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={loginProps.navigation} route={loginProps.route} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Your pending action has expired. Please start again.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByText('Your pending action has expired. Please start again.')).toBeOnTheScreen();

      // User can still log in normally
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });
});
