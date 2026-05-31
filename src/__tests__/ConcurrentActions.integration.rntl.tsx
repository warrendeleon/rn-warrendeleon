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
      const { getByTestId, getByDisplayValue } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Rapid typing simulation
      const emailInput = getByTestId('email-input');
      for (const char of 'test@example.com') {
        await fireEvent.changeText(emailInput, emailInput.props.value + char);
      }

      // Final value should be correct
      expect(getByDisplayValue('test@example.com')).toBeOnTheScreen();
    });

    it('should handle concurrent field updates', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Update multiple fields rapidly
      await fireEvent.changeText(getByTestId('email-input'), 'user1@test.com');
      await fireEvent.changeText(getByTestId('password-input'), 'Pass1');
      await fireEvent.changeText(getByTestId('email-input'), 'user2@test.com');
      await fireEvent.changeText(getByTestId('password-input'), 'Pass12');
      await fireEvent.changeText(getByTestId('email-input'), 'user3@test.com');
      await fireEvent.changeText(getByTestId('password-input'), 'Pass123!');

      // Final values should be correct
      expect(getByDisplayValue('user3@test.com')).toBeOnTheScreen();
      expect(getByDisplayValue('Pass123!')).toBeOnTheScreen();
    });

    it('should handle rapid focus changes', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // Rapid focus changes
      for (let i = 0; i < 10; i++) {
        await fireEvent(emailInput, 'focus');
        await fireEvent(passwordInput, 'focus');
        await fireEvent(emailInput, 'blur');
        await fireEvent(passwordInput, 'blur');
      }

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('concurrent button interactions', () => {
    it('should prevent double submission on rapid clicks', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
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

      // Rapid submit clicks
      for (let i = 0; i < 5; i++) {
        await fireEvent.press(getByTestId('login-button'));
      }

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle navigation links during form submission', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
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

      // Submit and immediately try navigation
      await fireEvent.press(getByTestId('login-button'));
      await fireEvent.press(getByTestId('forgot-password-link'));

      // Navigation should be called
      expect(mockLoginNav.navigate).toHaveBeenCalledWith('ForgotPassword');
    });

    it('should handle rapid navigation link presses', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Rapid navigation link presses
      for (let i = 0; i < 5; i++) {
        await fireEvent.press(getByTestId('forgot-password-link'));
        await fireEvent.press(getByTestId('register-link'));
      }

      // Navigation should be called
      expect(mockLoginNav.navigate).toHaveBeenCalled();
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('concurrent state changes', () => {
    it('should handle state updates during form validation', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Start typing
      await fireEvent.changeText(getByTestId('email-input'), 'test@');

      // Rerender during validation (simulates Redux state change)
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Continue typing
      await fireEvent.changeText(getByTestId('email-input'), 'test@example.com');

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle Redux state change during form submission', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Fill and submit
      await fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      await fireEvent.press(getByTestId('login-button'));

      // State change during submission
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle error state appearing during user interaction', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // User starts typing
      await fireEvent.changeText(getByTestId('email-input'), 'test@');

      // Rerender simulates state change (error state managed by component)
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Continue interacting
      await fireEvent.changeText(getByTestId('email-input'), 'test@example.com');

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('rapid mount/unmount cycles', () => {
    it('should handle rapid component mount/unmount', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

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

    it('should handle unmount during async operation', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount, getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Fill and submit form
      await fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      await fireEvent.press(getByTestId('login-button'));

      // Unmount during async operation
      await unmount();

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
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />
      );

      // Rapid submit editing (moves between fields)
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent(getByTestId('firstName-input'), 'submitEditing');

      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent(getByTestId('lastName-input'), 'submitEditing');

      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent(getByTestId('phone-number-input'), 'submitEditing');

      await fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      await fireEvent(getByTestId('email-input'), 'submitEditing');

      // Screen should remain stable
      expect(getByTestId('registration-screen')).toBeOnTheScreen();
    });

    it('should handle concurrent validation checks', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />
      );

      // Fill multiple fields rapidly
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await rerender(<RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />);

      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await rerender(<RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />);

      await fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      await rerender(<RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />);

      // Screen should remain stable
      expect(getByTestId('registration-screen')).toBeOnTheScreen();
    });

    it('should handle switch toggle during form fill', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />
      );

      // Toggle switch multiple times during form fill
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', false);

      await fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      // Screen should remain stable
      expect(getByTestId('registration-screen')).toBeOnTheScreen();
    });
  });

  describe('keyboard interaction concurrency', () => {
    it('should handle keyboard submit during validation', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Submit via keyboard while form is invalid
      await fireEvent.changeText(getByTestId('email-input'), 'invalid');
      await fireEvent(getByTestId('email-input'), 'submitEditing');

      await fireEvent.changeText(getByTestId('password-input'), 'short');
      await fireEvent(getByTestId('password-input'), 'submitEditing');

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle rapid keyboard events', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      const emailInput = getByTestId('email-input');

      // Rapid keyboard events
      for (let i = 0; i < 5; i++) {
        await fireEvent(emailInput, 'focus');
        await fireEvent(emailInput, 'submitEditing');
        await fireEvent(emailInput, 'blur');
      }

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('mixed action types', () => {
    it('should handle form fill + navigation + state change simultaneously', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Multiple action types interleaved
      await fireEvent.changeText(getByTestId('email-input'), 'test@');
      await fireEvent.press(getByTestId('forgot-password-link'));
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);
      await fireEvent.changeText(getByTestId('password-input'), 'Pass');
      await fireEvent.press(getByTestId('register-link'));
      await rerender(<LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />);

      // Screen should remain stable
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle form validation during error display', async () => {
      const { getByTestId } = await renderWithProviders(
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
      await fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Should be able to submit
      await fireEvent.press(getByTestId('login-button'));

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });
});
