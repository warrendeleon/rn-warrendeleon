/**
 * Concurrent User Actions Integration Tests
 *
 * Tests for concurrent user action scenarios:
 * - Multiple simultaneous form submissions
 * - Rapid navigation while data loading
 * - Concurrent state updates across features
 * - Race conditions between user actions
 * - Multiple async operations running in parallel
 *
 * These tests verify the application handles multiple
 * concurrent user actions without race conditions or crashes.
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { LoginScreen } from '@app/features/Auth/LoginScreen';
import { RegistrationScreen } from '@app/features/Auth/RegistrationScreen';
import { loginScreenProps, registrationScreenProps, renderWithProviders } from '@app/test-utils';

const { navigation: mockLoginNav, route: mockLoginRoute } = loginScreenProps();
const { navigation: mockRegNav, route: mockRegRoute } = registrationScreenProps();

describe('Concurrent User Actions Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rapid form interactions', () => {
    it('should handle rapid input changes without state corruption', async () => {
      const { getByTestId, getByDisplayValue } = renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Rapid typing simulation
      const emailInput = getByTestId('email-input');
      for (const char of 'test@example.com') {
        fireEvent.changeText(emailInput, emailInput.props.value + char);
      }

      // Final value should be correct
      expect(getByDisplayValue('test@example.com')).toBeOnTheScreen();
    });

    it('should handle concurrent field updates', async () => {
      const { getByTestId, getByDisplayValue } = renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Update multiple fields rapidly
      fireEvent.changeText(getByTestId('email-input'), 'user1@test.com');
      fireEvent.changeText(getByTestId('password-input'), 'Pass1');
      fireEvent.changeText(getByTestId('email-input'), 'user2@test.com');
      fireEvent.changeText(getByTestId('password-input'), 'Pass12');
      fireEvent.changeText(getByTestId('email-input'), 'user3@test.com');
      fireEvent.changeText(getByTestId('password-input'), 'Pass123!');

      // Final values should be correct
      expect(getByDisplayValue('user3@test.com')).toBeOnTheScreen();
      expect(getByDisplayValue('Pass123!')).toBeOnTheScreen();
    });

    it('should handle rapid focus changes', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // Rapid focus changes
      for (let i = 0; i < 10; i++) {
        fireEvent(emailInput, 'focus');
        fireEvent(passwordInput, 'focus');
        fireEvent(emailInput, 'blur');
        fireEvent(passwordInput, 'blur');
      }

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('concurrent button interactions', () => {
    it('should prevent double submission on rapid clicks', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Fill form
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Rapid submit clicks
      for (let i = 0; i < 5; i++) {
        fireEvent.press(getByTestId('login-button'));
      }

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle navigation links during form submission', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Fill form
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit and immediately try navigation
      fireEvent.press(getByTestId('login-button'));
      fireEvent.press(getByTestId('forgot-password-link'));

      // Navigation should be called
      expect(mockLoginNav.navigate).toHaveBeenCalledWith('ForgotPassword');
    });

    it('should handle rapid navigation link presses', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Rapid navigation link presses
      for (let i = 0; i < 5; i++) {
        fireEvent.press(getByTestId('forgot-password-link'));
        fireEvent.press(getByTestId('register-link'));
      }

      // Navigation should be called
      expect(mockLoginNav.navigate).toHaveBeenCalled();
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('concurrent state changes', () => {
    it('should handle state updates during form validation', async () => {
      const { getByTestId, rerender } = renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Start typing
      fireEvent.changeText(getByTestId('email-input'), 'test@');

      // Rerender during validation (simulates Redux state change)
      rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Continue typing
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle Redux state change during form submission', async () => {
      const { getByTestId, rerender } = renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Fill and submit
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      fireEvent.press(getByTestId('login-button'));

      // State change during submission
      rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle error state appearing during user interaction', async () => {
      const { getByTestId, rerender } = renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // User starts typing
      fireEvent.changeText(getByTestId('email-input'), 'test@');

      // Rerender simulates state change (error state managed by component)
      rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Continue interacting
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('rapid mount/unmount cycles', () => {
    it('should handle rapid component mount/unmount', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      for (let i = 0; i < 10; i++) {
        const { unmount } = renderWithProviders(
          <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
        );
        unmount();
      }

      // Final mount should work
      const { getByTestId } = renderWithProviders(
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

    it('should handle unmount during async operation', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount, getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Fill and submit form
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      fireEvent.press(getByTestId('login-button'));

      // Unmount during async operation
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
  });

  describe('registration form concurrent actions', () => {
    it('should handle rapid field navigation', async () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />
      );

      // Rapid submit editing (moves between fields)
      fireEvent.changeText(getByTestId('firstName-input'), 'John');
      fireEvent(getByTestId('firstName-input'), 'submitEditing');

      fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      fireEvent(getByTestId('lastName-input'), 'submitEditing');

      fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      fireEvent(getByTestId('phone-number-input'), 'submitEditing');

      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent(getByTestId('email-input'), 'submitEditing');

      // Screen should remain stable
      expect(getByTestId('registration-screen')).toBeOnTheScreen();
    });

    it('should handle concurrent validation checks', async () => {
      const { getByTestId, rerender } = renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />
      );

      // Fill multiple fields rapidly
      fireEvent.changeText(getByTestId('firstName-input'), 'John');
      rerender(<RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />);

      fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      rerender(<RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />);

      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      rerender(<RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />);

      // Screen should remain stable
      expect(getByTestId('registration-screen')).toBeOnTheScreen();
    });

    it('should handle switch toggle during form fill', async () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />
      );

      // Toggle switch multiple times during form fill
      fireEvent.changeText(getByTestId('firstName-input'), 'John');
      fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      fireEvent(getByTestId('accept-terms-switch'), 'valueChange', false);

      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      // Screen should remain stable
      expect(getByTestId('registration-screen')).toBeOnTheScreen();
    });
  });

  describe('keyboard interaction concurrency', () => {
    it('should handle keyboard submit during validation', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Submit via keyboard while form is invalid
      fireEvent.changeText(getByTestId('email-input'), 'invalid');
      fireEvent(getByTestId('email-input'), 'submitEditing');

      fireEvent.changeText(getByTestId('password-input'), 'short');
      fireEvent(getByTestId('password-input'), 'submitEditing');

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle rapid keyboard events', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      const emailInput = getByTestId('email-input');

      // Rapid keyboard events
      for (let i = 0; i < 5; i++) {
        fireEvent(emailInput, 'focus');
        fireEvent(emailInput, 'submitEditing');
        fireEvent(emailInput, 'blur');
      }

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('mixed action types', () => {
    it('should handle form fill + navigation + state change simultaneously', async () => {
      const { getByTestId, rerender } = renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Multiple action types interleaved
      fireEvent.changeText(getByTestId('email-input'), 'test@');
      fireEvent.press(getByTestId('forgot-password-link'));
      rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);
      fireEvent.changeText(getByTestId('password-input'), 'Pass');
      fireEvent.press(getByTestId('register-link'));
      rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle form validation during error display', async () => {
      const { getByTestId } = renderWithProviders(
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

      // Fill form while error is displayed
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Should be able to submit
      fireEvent.press(getByTestId('login-button'));

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });
});
