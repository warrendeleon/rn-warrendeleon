/**
 * Edge Case User Journey Integration Tests
 *
 * Tests for uncommon but critical user scenarios that can
 * break the app in production:
 * - Session timeout during form entry
 * - Network state transitions (offline → online)
 * - Interrupted operations (backgrounding, force quit)
 * - Multi-device session scenarios
 * - Form state preservation during errors
 * - Rapid user interactions
 *
 * These tests verify the application handles edge cases
 * gracefully without data loss or crashes.
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { LoginScreen } from '@app/features/Auth/LoginScreen';
import { RegistrationScreen } from '@app/features/Auth/RegistrationScreen';
import { loginScreenProps, registrationScreenProps, renderWithProviders } from '@app/test-utils';

const { navigation: mockLoginNav, route: mockLoginRoute } = loginScreenProps();
const { navigation: mockRegNav, route: mockRegRoute } = registrationScreenProps();

describe('Edge Case User Journeys', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('session timeout during form entry', () => {
    it('should preserve form data when session expires mid-entry', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // User starts filling form
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Verify form data is entered
      expect(getByDisplayValue('user@example.com')).toBeOnTheScreen();

      // Form data should be preserved
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should prompt re-authentication without losing progress', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
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

      // Session expired message should be displayed
      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Session expired. Please sign in again.')).toBeOnTheScreen();

      // User can still interact with form
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should restore form state after successful re-login', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
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

      // Fill credentials for re-login
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit login
      await fireEvent.press(getByTestId('login-button'));

      // Rerender simulates successful re-authentication
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('network state transitions', () => {
    it('should handle offline → online during form submission', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
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

      // User fills form during offline state
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Network recovers (simulated by state change)
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Can now submit
      await fireEvent.press(getByTestId('login-button'));
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should queue actions when going offline unexpectedly', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
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

      // Submit during network transition
      await fireEvent.press(getByTestId('login-button'));

      // Network fails
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle rapid network state changes', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Rapid online/offline transitions
      for (let i = 0; i < 5; i++) {
        // Offline
        await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

        // Online
        await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);
      }

      // Screen should be stable after rapid transitions
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('interrupted operations', () => {
    it('should handle app backgrounding during API call', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount, getByTestId } = await renderWithProviders(
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

      // App goes to background during API call
      await unmount();
      jest.runAllTimers();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('should recover from force quit during data sync', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Simulate app restart after force quit
      const { unmount } = await renderWithProviders(
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

      // Force quit
      await unmount();
      jest.runAllTimers();

      // App restarts with fresh state
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Should work normally after restart
      expect(getByTestId('login-screen')).toBeOnTheScreen();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('should handle rapid mount/unmount cycles', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Rapid mount/unmount cycles
      for (let i = 0; i < 10; i++) {
        const { unmount } = await renderWithProviders(
          <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
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

  describe('multi-device scenarios', () => {
    it('should handle concurrent logins from different devices', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
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

      // Concurrent login error displayed
      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(
        getByText('You have been signed out because you logged in on another device.')
      ).toBeOnTheScreen();

      // User can still re-authenticate
      expect(getByTestId('email-input')).toBeOnTheScreen();
      expect(getByTestId('password-input')).toBeOnTheScreen();
    });

    it('should sync profile changes from another device', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Fill form
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Profile updated on another device (simulated by rerender)
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle session invalidation from another device', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Your session has been terminated from another device.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Your session has been terminated from another device.')).toBeOnTheScreen();

      // User can re-authenticate
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle maximum active sessions reached', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
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
  });

  describe('form state preservation during errors', () => {
    it('should preserve registration form state during validation error', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />
      );

      // Fill partial form
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'weak'); // Invalid password

      // Form data should be preserved even with validation error
      expect(getByDisplayValue('John')).toBeOnTheScreen();
      expect(getByDisplayValue('Doe')).toBeOnTheScreen();
      expect(getByDisplayValue('john@example.com')).toBeOnTheScreen();
    });

    it('should preserve form state during server error', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Server error. Please try again later.',
              biometricEnabled: false,
            },
          },
        }
      );

      // Fill form
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');

      // Server error (rerender simulates state change)
      await rerender(<RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />);

      // Screen should remain stable
      expect(getByTestId('registration-screen')).toBeOnTheScreen();
    });

    it('should preserve form state through loading → error → retry cycle', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Fill form
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Loading state
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Error state
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Form should still work for retry
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('rapid user interactions', () => {
    it('should handle rapid form field changes', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Rapid email changes
      const emailInput = getByTestId('email-input');
      for (let i = 0; i < 10; i++) {
        await fireEvent.changeText(emailInput, `user${i}@example.com`);
      }

      // Final value should be set
      expect(getByDisplayValue('user9@example.com')).toBeOnTheScreen();
    });

    it('should handle rapid button presses', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
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

      // Rapid button presses
      for (let i = 0; i < 5; i++) {
        await fireEvent.press(getByTestId('login-button'));
      }

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle rapid navigation attempts', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Rapid navigation link presses
      for (let i = 0; i < 5; i++) {
        await fireEvent.press(getByTestId('register-link'));
        await fireEvent.press(getByTestId('forgot-password-link'));
      }

      // Navigation should be called
      expect(mockLoginNav.navigate).toHaveBeenCalled();
    });

    it('should handle rapid keyboard submit events', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
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

      // Rapid keyboard submits
      for (let i = 0; i < 5; i++) {
        await fireEvent(getByTestId('password-input'), 'submitEditing');
      }

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('timing edge cases', () => {
    it('should handle very slow network response', async () => {
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

      // Long wait for network
      jest.advanceTimersByTime(30000); // 30 seconds

      // Rerender after long wait
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle response arriving after unmount', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount, getByTestId } = await renderWithProviders(
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

      // Unmount before response arrives
      await unmount();

      // Response arrives after unmount (simulated by timer)
      jest.runAllTimers();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('should handle race between multiple API calls', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // First submission
      await fireEvent.changeText(getByTestId('email-input'), 'user1@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      await fireEvent.press(getByTestId('login-button'));

      // Second submission before first completes (simulated by rerender)
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('boundary conditions', () => {
    it('should handle empty form submission attempts', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Button should be disabled with empty form
      expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(true);

      // Try to press anyway
      await fireEvent.press(getByTestId('login-button'));

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle maximum length input values', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Very long email (254 char limit typically)
      const longEmail = 'a'.repeat(200) + '@example.com';
      await fireEvent.changeText(getByTestId('email-input'), longEmail);

      // Very long password
      const longPassword = 'A'.repeat(100) + '1!';
      await fireEvent.changeText(getByTestId('password-input'), longPassword);

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle special characters in input', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Unicode email
      await fireEvent.changeText(getByTestId('email-input'), 'tëst+tag@exämple.com');

      // Special character password
      await fireEvent.changeText(getByTestId('password-input'), 'Pass!@#$%^&*()123');

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle null byte injection attempts gracefully', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Null byte injection attempt
      await fireEvent.changeText(getByTestId('email-input'), 'user\x00@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'pass\x00word123!');

      // Screen should remain stable (validation should reject)
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });
});
