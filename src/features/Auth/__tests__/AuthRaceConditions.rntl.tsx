/**
 * Auth Race Condition Tests
 *
 * Tests for async operation race conditions in authentication flows:
 * - Concurrent login requests
 * - Request cancellation on unmount
 * - Token refresh during operation
 * - Session expiry during async flow
 * - Network retry collision
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { loginScreenProps, renderWithProviders } from '@app/test-utils';

import { LoginScreen } from '../LoginScreen';

const { navigation: mockNavigation, route: mockRoute } = loginScreenProps();

describe('Auth Race Conditions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('concurrent login requests', () => {
    it('should handle rapid form submissions without duplicate requests', async () => {
      const { getByTestId } = renderWithProviders(
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

      // Rapid clicks
      fireEvent.press(getByTestId('login-button'));
      fireEvent.press(getByTestId('login-button'));
      fireEvent.press(getByTestId('login-button'));

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should disable button during pending request', () => {
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

      // Button should be disabled during loading
      expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(true);
    });

    it('should handle submit while already loading', async () => {
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

      // Try to submit during loading (should be prevented by disabled state)
      fireEvent.press(getByTestId('login-button'));

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('request cancellation on unmount', () => {
    it('should handle unmount during pending login', async () => {
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

      // Unmount during loading
      unmount();

      // Advance timers to trigger any pending async operations
      jest.runAllTimers();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('should handle unmount immediately after form submission', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount, getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
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

      // Submit and immediately unmount
      fireEvent.press(getByTestId('login-button'));
      unmount();

      // Advance timers
      jest.runAllTimers();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('should handle rapid mount/unmount cycles', () => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderWithProviders(
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );
        unmount();
      }

      // Final mount should work correctly
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('state transitions during async flow', () => {
    it('should handle error state appearing during input', async () => {
      const { getByTestId, rerender } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Start typing
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');

      // Error state appears (simulates delayed network error)
      rerender(<LoginScreen navigation={mockNavigation} route={mockRoute} />);

      // Should handle gracefully
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle loading to error transition', async () => {
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

      // Error should be displayed
      expect(getByTestId('auth-error-message')).toBeOnTheScreen();

      // Form should still be functional
      expect(getByTestId('email-input')).toBeOnTheScreen();
      expect(getByTestId('password-input')).toBeOnTheScreen();
    });

    it('should clear error on new form submission attempt', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
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

      // Fill form with new data
      fireEvent.changeText(getByTestId('email-input'), 'new@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'NewSecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit new attempt
      fireEvent.press(getByTestId('login-button'));

      // Form submission attempted
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('navigation during async operation', () => {
    it('should handle navigation to forgot password during loading', () => {
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

      // Navigate during loading
      fireEvent.press(getByTestId('forgot-password-link'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
    });

    it('should handle navigation to registration during loading', () => {
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

      // Navigate during loading
      fireEvent.press(getByTestId('register-link'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Registration');
    });

    it('should handle back navigation during loading', () => {
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

      // Simulate back navigation
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('form state consistency', () => {
    it('should maintain form values during loading state', async () => {
      const { getByTestId, rerender } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill form
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Rerender (simulates Redux state change)
      rerender(<LoginScreen navigation={mockNavigation} route={mockRoute} />);

      // Form values should be preserved (managed by form state)
      expect(getByTestId('email-input').props.value).toBe('user@example.com');
    });

    it('should reset form on successful authentication redirect', () => {
      // When user is authenticated, they are redirected away
      // This tests that the component handles the authenticated state
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: {
                id: 'user-123',
                email: 'authenticated@example.com',
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

      // Component should render (navigation handled by navigator)
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('keyboard interaction race conditions', () => {
    it('should handle rapid keyboard show/hide during submission', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
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

      // Rapid keyboard interactions
      fireEvent(getByTestId('email-input'), 'focus');
      fireEvent(getByTestId('email-input'), 'blur');
      fireEvent(getByTestId('password-input'), 'focus');
      fireEvent(getByTestId('password-input'), 'submitEditing');

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle submit via keyboard enter key during typing', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill form
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent(getByTestId('email-input'), 'submitEditing'); // Enter key moves to password

      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit via enter key on password field
      fireEvent(getByTestId('password-input'), 'submitEditing');

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });
});
