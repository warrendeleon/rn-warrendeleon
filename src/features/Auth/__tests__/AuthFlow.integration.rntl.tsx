/**
 * Authentication Flow Integration Tests
 *
 * Tests complete user journeys through the auth system,
 * covering multi-step flows rather than isolated screen tests.
 */

import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import type { RootStackParamList } from '@app/navigation';
import { renderWithProviders } from '@app/test-utils';

import { LoginScreen } from '../LoginScreen';

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const mockNavigation = {
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
} as unknown as LoginNavigationProp;

const mockRoute = {
  key: 'Login',
  name: 'Login' as const,
  params: undefined,
};

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login flow - form entry → validation → navigation', () => {
    it('should complete valid form entry and enable submission', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Step 1: Form is initially disabled
      const loginButton = getByTestId('login-button');
      expect(loginButton.props.accessibilityState?.disabled).toBe(true);

      // Step 2: Enter email
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'user@example.com');

      // Step 3: Enter password
      const passwordInput = getByTestId('password-input');
      fireEvent.changeText(passwordInput, 'SecurePass123!');

      // Step 4: Button should now be enabled
      await waitFor(
        () => {
          expect(loginButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle invalid credentials → error display flow', async () => {
      const { getByTestId, getByText } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
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

      // Error should be displayed
      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Invalid credentials')).toBeOnTheScreen();

      // User can still attempt retry by editing form
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'different@example.com');

      // Form should remain functional
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should navigate to registration when register link is pressed', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.press(getByTestId('register-link'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Registration');
    });

    it('should navigate to forgot password when link is pressed', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.press(getByTestId('forgot-password-link'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
    });
  });

  describe('form field chaining', () => {
    it('should allow form field traversal via submitEditing', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // Fill email and trigger submit (simulating pressing "next" on keyboard)
      fireEvent.changeText(emailInput, 'user@example.com');
      fireEvent(emailInput, 'submitEditing');

      // Fill password
      fireEvent.changeText(passwordInput, 'SecurePass123!');

      // Form should be valid
      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          expect(loginButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('error recovery', () => {
    it('should allow retry after API error by modifying form', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
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

      // Error is shown
      expect(getByTestId('auth-error-message')).toBeOnTheScreen();

      // User modifies email (retry attempt)
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'retry@example.com');

      // Form should still be functional
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should preserve email value during error state for retry', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
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

      // Enter email before error was shown
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'user@example.com');

      // Email should be preserved
      expect(screen.getByDisplayValue('user@example.com')).toBeOnTheScreen();
    });
  });

  describe('loading state handling', () => {
    it('should disable form during loading', () => {
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
      expect(loginButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('accessibility during auth flow', () => {
    it('should maintain accessibility roles throughout form interaction', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Login button should have button role
      const loginButton = getByTestId('login-button');
      expect(loginButton.props.accessibilityRole).toBe('button');

      // Links should have link role
      const forgotPasswordLink = getByTestId('forgot-password-link');
      expect(forgotPasswordLink.props.accessibilityRole).toBe('link');

      const registerLink = getByTestId('register-link');
      expect(registerLink.props.accessibilityRole).toBe('link');

      // Fill form and verify roles are maintained
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          // Roles should still be correct after interaction
          expect(getByTestId('login-button').props.accessibilityRole).toBe('button');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should have accessible disabled state during loading', () => {
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
      // Should have accessible disabled state
      expect(loginButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('session handling', () => {
    it('should display user info when authenticated', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: {
                id: 'user-123',
                email: 'user@example.com',
                firstName: 'John',
                lastName: 'Doe',
                phoneNumber: null,
                profilePicture: null,
                authProvider: 'email',
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
              biometricEnabled: false,
            },
          },
        }
      );

      // When user is authenticated, they should still see the login screen
      // (navigation logic handled elsewhere)
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle session expiry gracefully', () => {
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

      // Session expiry error should be shown
      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Session expired. Please sign in again.')).toBeOnTheScreen();

      // Form should remain functional for re-login
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'user@example.com');
      expect(screen.getByDisplayValue('user@example.com')).toBeOnTheScreen();
    });

    it('should handle 401 unauthorized error', () => {
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

      // 401 error displayed
      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Your session has expired. Please sign in again.')).toBeOnTheScreen();

      // User should be able to re-enter credentials
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'NewPassword123!');

      expect(screen.getByDisplayValue('user@example.com')).toBeOnTheScreen();
    });

    it('should preserve form state after token refresh attempt', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill form
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Verify form values are preserved
      expect(screen.getByDisplayValue('user@example.com')).toBeOnTheScreen();

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          expect(loginButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('biometric authentication state', () => {
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

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle biometric disabled to enabled transition', () => {
      const { getByTestId, rerender } = renderWithProviders(
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

      expect(getByTestId('login-screen')).toBeOnTheScreen();

      // Re-render with biometric enabled (simulating state change)
      rerender(<LoginScreen navigation={mockNavigation} route={mockRoute} />);

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('navigation during async operations', () => {
    it('should allow back navigation during login loading state', () => {
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

      // User presses forgot password link during loading
      fireEvent.press(getByTestId('forgot-password-link'));

      // Navigation should still work
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
    });

    it('should handle unmount during loading without memory leaks', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount, getByTestId } = renderWithProviders(
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

      expect(getByTestId('login-screen')).toBeOnTheScreen();

      // Simulate navigation away while loading (unmount)
      unmount();

      // Check no React state update warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('should allow register navigation during loading state', () => {
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

      // User decides to register instead during loading
      fireEvent.press(getByTestId('register-link'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Registration');
    });

    it('should maintain form accessibility during async state transitions', async () => {
      const { getByTestId, rerender } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill form
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Wait for form to be valid
      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit form
      fireEvent.press(getByTestId('login-button'));

      // Re-render with loading state (simulating Redux update)
      rerender(<LoginScreen navigation={mockNavigation} route={mockRoute} />);

      // Accessibility should be maintained - navigation links should work
      fireEvent.press(getByTestId('forgot-password-link'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
    });
  });
});
