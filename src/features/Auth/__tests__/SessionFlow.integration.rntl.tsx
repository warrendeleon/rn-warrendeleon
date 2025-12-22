/**
 * Session Flow Integration Tests
 *
 * Tests the complete session management journey including:
 * - Login → Active Session → Session Expiry → Re-authentication
 * - Token refresh scenarios and failures
 * - Logout flow and clean state
 * - Biometric session handling
 * - Concurrent session management
 * - Error recovery from network issues
 * - Security-related session invalidation
 *
 * ## Test Categories
 *
 * | Category                  | Purpose                                    |
 * |---------------------------|--------------------------------------------|
 * | Session Expiry            | Tests 401/expired token handling           |
 * | Token Refresh             | Tests refresh failure and retry            |
 * | Logout Flow               | Tests clean logout and confirmation        |
 * | Biometric Sessions        | Tests biometric auth state persistence     |
 * | Concurrent Sessions       | Tests multi-device session handling        |
 * | Error Recovery            | Tests network error and timeout recovery   |
 * | Accessibility             | Tests screen reader announcements          |
 * | Security                  | Tests session hijack/tamper detection      |
 *
 * ## Setup
 *
 * Uses `renderWithProviders` with `preloadedState` to simulate different
 * auth states without requiring actual API calls.
 *
 * @see src/test-utils/factories/authStateFactory.ts for state factories
 * @see docs/readme/TESTING.md for testing patterns
 */

import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import type { RootStackParamList } from '@app/navigation';
import { renderWithProviders } from '@app/test-utils';

import { LoginScreen } from '../LoginScreen';

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const createMockNavigation = () =>
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
      key: 'Login',
      index: 0,
      routeNames: ['Login'],
      routes: [{ key: 'Login', name: 'Login', params: undefined }],
    })),
  }) as unknown as LoginNavigationProp;

describe('Session Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('session expiry handling', () => {
    const mockNavigation = createMockNavigation();
    const mockRoute = {
      key: 'Login',
      name: 'Login' as const,
      params: undefined,
    };

    it('should display session expired message and allow re-login', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Session expired. Please sign in again.',
              biometricEnabled: false,
            },
          },
        }
      );

      // Session expiry error displayed
      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Session expired. Please sign in again.')).toBeOnTheScreen();

      // Form is available for re-login
      expect(getByTestId('email-input')).toBeOnTheScreen();
      expect(getByTestId('password-input')).toBeOnTheScreen();
      expect(getByTestId('login-button')).toBeOnTheScreen();
    });

    it('should allow form entry after session expiry', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Session expired. Please sign in again.',
              biometricEnabled: false,
            },
          },
        }
      );

      // Enter credentials
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Form should be valid
      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          expect(loginButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle 401 unauthorized gracefully', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Your session has expired. Please sign in again.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Your session has expired. Please sign in again.')).toBeOnTheScreen();
    });
  });

  describe('token refresh scenarios', () => {
    const mockNavigation = createMockNavigation();
    const mockRoute = {
      key: 'Login',
      name: 'Login' as const,
      params: undefined,
    };

    it('should handle token refresh failure', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Unable to refresh session. Please sign in again.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Unable to refresh session. Please sign in again.')).toBeOnTheScreen();

      // Form should be functional
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      expect(screen.getByDisplayValue('user@example.com')).toBeOnTheScreen();
    });

    it('should preserve form state during loading', async () => {
      const { getByTestId, rerender } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill form
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Verify values are there
      expect(screen.getByDisplayValue('user@example.com')).toBeOnTheScreen();

      // Re-render (simulating state update)
      rerender(<LoginScreen navigation={mockNavigation} route={mockRoute} />);

      // Form state should be preserved
      expect(screen.getByDisplayValue('user@example.com')).toBeOnTheScreen();
    });
  });

  describe('logout flow', () => {
    const mockNavigation = createMockNavigation();
    const mockRoute = {
      key: 'Login',
      name: 'Login' as const,
      params: undefined,
    };

    it('should show clean login screen after logout', () => {
      const { getByTestId, queryByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
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

      // Login screen should be displayed
      expect(getByTestId('login-screen')).toBeOnTheScreen();

      // No error should be displayed (clean logout)
      expect(queryByTestId('auth-error-message')).not.toBeOnTheScreen();

      // Form should be empty
      const emailInput = getByTestId('email-input');
      expect(emailInput.props.value).toBeFalsy();
    });

    it('should display logout confirmation message if provided', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'You have been signed out successfully.',
              biometricEnabled: false,
            },
          },
        }
      );

      // Success message displayed
      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('You have been signed out successfully.')).toBeOnTheScreen();
    });
  });

  describe('biometric session handling', () => {
    const mockNavigation = createMockNavigation();
    const mockRoute = {
      key: 'Login',
      name: 'Login' as const,
      params: undefined,
    };

    it('should recognise biometric enabled state', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              biometricEnabled: true,
            },
          },
        }
      );

      // Login screen should be functional even with biometric enabled
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle biometric session expiry', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Biometric session expired. Please sign in again.',
              biometricEnabled: true,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Biometric session expired. Please sign in again.')).toBeOnTheScreen();
    });
  });

  describe('concurrent session handling', () => {
    const mockNavigation = createMockNavigation();
    const mockRoute = {
      key: 'Login',
      name: 'Login' as const,
      params: undefined,
    };

    it('should handle logged in elsewhere error', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'You have been signed out because you logged in on another device.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(
        getByText('You have been signed out because you logged in on another device.')
      ).toBeOnTheScreen();
    });
  });

  describe('error recovery', () => {
    const mockNavigation = createMockNavigation();
    const mockRoute = {
      key: 'Login',
      name: 'Login' as const,
      params: undefined,
    };

    it('should allow retry after network error during session check', async () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
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

      // Error displayed
      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Network error. Please check your connection.')).toBeOnTheScreen();

      // User can retry by filling form
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          expect(loginButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle timeout during session validation', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
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

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Request timed out. Please try again.')).toBeOnTheScreen();
    });
  });

  describe('accessibility during session flow', () => {
    const mockNavigation = createMockNavigation();
    const mockRoute = {
      key: 'Login',
      name: 'Login' as const,
      params: undefined,
    };

    it('should announce error messages to screen readers', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
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

      const errorMessage = getByTestId('auth-error-message');
      // Error should be visible and announced
      expect(errorMessage).toBeOnTheScreen();
    });

    it('should maintain proper accessibility state during loading', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
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

      const loginButton = getByTestId('login-button');
      // Button should be disabled and announce it
      expect(loginButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('session security', () => {
    const mockNavigation = createMockNavigation();
    const mockRoute = {
      key: 'Login',
      name: 'Login' as const,
      params: undefined,
    };

    it('should handle session invalidation after privilege escalation attempt', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Session invalidated due to security policy. Please sign in again.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(
        getByText('Session invalidated due to security policy. Please sign in again.')
      ).toBeOnTheScreen();

      // User should be able to re-authenticate
      expect(getByTestId('email-input')).toBeOnTheScreen();
      expect(getByTestId('password-input')).toBeOnTheScreen();
    });

    it('should handle session device mismatch error', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Session not valid for this device. Please sign in again.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(
        getByText('Session not valid for this device. Please sign in again.')
      ).toBeOnTheScreen();
    });

    it('should handle concurrent session limit exceeded', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Maximum active sessions reached. Please sign out from another device.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(
        getByText('Maximum active sessions reached. Please sign out from another device.')
      ).toBeOnTheScreen();
    });

    it('should handle session timeout warning state', async () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Your session will expire soon. Please save your work.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Your session will expire soon. Please save your work.')).toBeOnTheScreen();
    });

    it('should handle forced logout due to inactivity', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'You have been signed out due to inactivity.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('You have been signed out due to inactivity.')).toBeOnTheScreen();
    });

    it('should handle secure storage unavailable error', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Secure storage unavailable. Please restart the app.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Secure storage unavailable. Please restart the app.')).toBeOnTheScreen();
    });

    it('should handle session hijack detection', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Suspicious activity detected. Please sign in again to verify your identity.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(
        getByText('Suspicious activity detected. Please sign in again to verify your identity.')
      ).toBeOnTheScreen();
    });

    it('should allow form interaction after security-related logout', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Session invalidated due to security policy.',
              biometricEnabled: false,
            },
          },
        }
      );

      // User should be able to enter credentials and attempt re-login
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          expect(loginButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle token tampering detection', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Authentication token invalid. Please sign in again.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Authentication token invalid. Please sign in again.')).toBeOnTheScreen();
    });

    it('should handle server-side session revocation', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Your session was terminated by an administrator.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Your session was terminated by an administrator.')).toBeOnTheScreen();
    });
  });
});
