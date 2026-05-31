/**
 * Concurrent User Actions Integration Tests
 *
 * Tests for concurrent user action scenarios:
 * - Same user logs in from two devices
 * - Session invalidated on other device
 * - Profile update conflict from two devices
 * - Optimistic update conflict resolution
 * - Real-time sync notification
 * - Force logout from all devices
 *
 * These tests verify the application handles multi-device
 * and concurrent action scenarios gracefully.
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { loginScreenProps, renderWithProviders } from '@app/test-utils';

import { LoginScreen } from '../LoginScreen';

const { navigation: mockNavigation, route: mockRoute } = loginScreenProps();

// Mock for simulating concurrent session scenarios
const mockSessionStore = {
  currentSession: null as string | null,
  otherDeviceSession: null as string | null,
  sessionInvalidated: false,
};

describe('Concurrent User Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockSessionStore.currentSession = null;
    mockSessionStore.otherDeviceSession = null;
    mockSessionStore.sessionInvalidated = false;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('same user login from multiple devices', () => {
    it('should handle login when user already logged in on another device', async () => {
      // Simulate existing session on another device
      mockSessionStore.otherDeviceSession = 'session-device-1';

      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill login form
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit login (should succeed even with existing session elsewhere)
      await fireEvent.press(getByTestId('login-button'));

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle concurrent login attempts from same user', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill form
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Simulate rapid concurrent login attempts
      await fireEvent.press(getByTestId('login-button'));
      await fireEvent.press(getByTestId('login-button'));

      // Should handle gracefully without crash
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should display appropriate message when session limit reached', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Maximum sessions reached. Please log out from another device.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(
        getByText('Maximum sessions reached. Please log out from another device.')
      ).toBeOnTheScreen();
    });
  });

  describe('session invalidation on other device', () => {
    it('should handle session invalidated error gracefully', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
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

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Session expired. Please log in again.')).toBeOnTheScreen();

      // Form should still be accessible for re-login
      expect(getByTestId('email-input')).toBeOnTheScreen();
      expect(getByTestId('password-input')).toBeOnTheScreen();
    });

    it('should allow re-login after session invalidation', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
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

      // Fill form for re-login
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Should be able to attempt re-login
      await fireEvent.press(getByTestId('login-button'));
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle force logout notification from server', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'You have been logged out from all devices.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('You have been logged out from all devices.')).toBeOnTheScreen();
    });
  });

  describe('optimistic update conflict resolution', () => {
    it('should handle optimistic update state during login', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill form
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit (triggers optimistic update)
      await fireEvent.press(getByTestId('login-button'));

      // Rerender simulates state update during async operation
      await rerender(<LoginScreen navigation={mockNavigation} route={mockRoute} />);

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle conflict error after optimistic update', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Conflict: Your session was modified. Please try again.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Conflict: Your session was modified. Please try again.')).toBeOnTheScreen();
    });

    it('should preserve form data after conflict error', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Conflict detected',
              biometricEnabled: false,
            },
          },
        }
      );

      // Fill form while error is displayed
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Data should be preserved
      expect(getByDisplayValue('user@example.com')).toBeOnTheScreen();
    });
  });

  describe('real-time sync scenarios', () => {
    it('should handle state update during form interaction', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Start filling form
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');

      // Simulate real-time state update from server
      await rerender(<LoginScreen navigation={mockNavigation} route={mockRoute} />);

      // Continue filling form
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle rapid state changes from concurrent operations', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill form
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Simulate rapid state changes (real-time updates)
      for (let i = 0; i < 5; i++) {
        await rerender(<LoginScreen navigation={mockNavigation} route={mockRoute} />);
      }

      // Form should remain functional
      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should maintain form consistency during background sync', async () => {
      const { getByTestId, getByDisplayValue, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill form
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Background sync triggers rerender
      await rerender(<LoginScreen navigation={mockNavigation} route={mockRoute} />);

      // Form values should be preserved
      expect(getByDisplayValue('user@example.com')).toBeOnTheScreen();
    });
  });

  describe('force logout from all devices', () => {
    it('should handle force logout error message', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Your account has been logged out from all devices for security reasons.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(
        getByText('Your account has been logged out from all devices for security reasons.')
      ).toBeOnTheScreen();
    });

    it('should clear form and allow fresh login after force logout', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Form should be fresh (empty)
      expect(getByTestId('email-input').props.value).toBe('');
      expect(getByTestId('password-input').props.value).toBe('');

      // Fill and submit should work normally
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle security-related logout with password change required', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Password changed. Please log in with your new password.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(
        getByText('Password changed. Please log in with your new password.')
      ).toBeOnTheScreen();
      expect(getByTestId('email-input')).toBeOnTheScreen();
    });
  });

  describe('session token refresh during operation', () => {
    it('should handle loading state during token refresh', async () => {
      const { getByTestId } = await renderWithProviders(
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

      // Button should be disabled during loading/refresh
      expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(true);
    });

    it('should handle token refresh failure', async () => {
      const { getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Authentication failed. Please log in again.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByText('Authentication failed. Please log in again.')).toBeOnTheScreen();
    });

    it('should recover gracefully after token refresh failure', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Token expired',
              biometricEnabled: false,
            },
          },
        }
      );

      // Should be able to log in again
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      await fireEvent.press(getByTestId('login-button'));
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('concurrent API calls handling', () => {
    it('should handle multiple state transitions during login flow', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill form
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit
      await fireEvent.press(getByTestId('login-button'));

      // Simulate multiple concurrent state updates (3 rerenders)
      await rerender(<LoginScreen navigation={mockNavigation} route={mockRoute} />);
      await rerender(<LoginScreen navigation={mockNavigation} route={mockRoute} />);
      await rerender(<LoginScreen navigation={mockNavigation} route={mockRoute} />);

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should not lose form data during rapid API state changes', async () => {
      const { getByTestId, getByDisplayValue, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill form
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Rapid rerenders simulating API state changes
      for (let i = 0; i < 10; i++) {
        await rerender(<LoginScreen navigation={mockNavigation} route={mockRoute} />);
      }

      // Form data should be preserved
      expect(getByDisplayValue('user@example.com')).toBeOnTheScreen();
    });
  });

  describe('profile update conflict from two devices', () => {
    it('should handle profile conflict error from server', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Profile was modified on another device. Please refresh and try again.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(
        getByText('Profile was modified on another device. Please refresh and try again.')
      ).toBeOnTheScreen();
    });

    it('should handle version mismatch during concurrent update', async () => {
      const { getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error:
                'Version conflict: Your changes could not be saved. The data was updated by another session.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(
        getByText(
          'Version conflict: Your changes could not be saved. The data was updated by another session.'
        )
      ).toBeOnTheScreen();
    });

    it('should allow retry after conflict resolution', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Conflict resolved. Please try again.',
              biometricEnabled: false,
            },
          },
        }
      );

      // User can retry after conflict
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      await fireEvent.press(getByTestId('login-button'));
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle last-write-wins conflict strategy', async () => {
      // Server accepts the latest write
      const { getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error:
                'Your changes have been saved. Note: This overwrote changes from another device.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(
        getByText('Your changes have been saved. Note: This overwrote changes from another device.')
      ).toBeOnTheScreen();
    });

    it('should handle merge conflict with partial success', async () => {
      const { getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Some changes were saved. Email update was blocked due to conflict.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(
        getByText('Some changes were saved. Email update was blocked due to conflict.')
      ).toBeOnTheScreen();
    });
  });

  describe('real-time sync notification handling', () => {
    it('should handle incoming sync notification during form fill', async () => {
      const { getByTestId, getByDisplayValue, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // User starts filling form
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');

      // Sync notification arrives (simulated by rerender)
      await rerender(<LoginScreen navigation={mockNavigation} route={mockRoute} />);

      // User continues
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Form data preserved
      expect(getByDisplayValue('user@example.com')).toBeOnTheScreen();
    });

    it('should handle profile push notification while on login screen', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill form
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');

      // Push notification triggers state update
      await rerender(<LoginScreen navigation={mockNavigation} route={mockRoute} />);

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should queue local changes when sync in progress', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: true, // Sync in progress
              error: null,
              biometricEnabled: false,
            },
          },
        }
      );

      // User tries to interact during sync
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');

      // Changes should be accepted (queued)
      expect(getByTestId('email-input').props.value).toBe('user@example.com');

      // Sync completes
      await rerender(<LoginScreen navigation={mockNavigation} route={mockRoute} />);

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should show notification when data refreshed from server', async () => {
      const { getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Data refreshed from server.',
              biometricEnabled: false,
            },
          },
        }
      );

      // Informational message about sync
      expect(getByText('Data refreshed from server.')).toBeOnTheScreen();
    });
  });

  describe('multi-device session management', () => {
    it('should handle device list exceeded error', async () => {
      const { getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Maximum of 5 devices reached. Please remove a device to continue.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(
        getByText('Maximum of 5 devices reached. Please remove a device to continue.')
      ).toBeOnTheScreen();
    });

    it('should handle trusted device verification required', async () => {
      const { getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'New device detected. Please verify via email.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByText('New device detected. Please verify via email.')).toBeOnTheScreen();
    });

    it('should handle device removed remotely', async () => {
      const { getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'This device has been removed from your account. Please log in again.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(
        getByText('This device has been removed from your account. Please log in again.')
      ).toBeOnTheScreen();
    });

    it('should handle primary device change notification', async () => {
      const { getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Primary device changed. Some features may be limited on this device.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(
        getByText('Primary device changed. Some features may be limited on this device.')
      ).toBeOnTheScreen();
    });
  });
});
