/**
 * Onboarding Journey Integration Tests
 *
 * Tests for complete user onboarding flow:
 * - Registration → Email Verification → Login
 * - Form completion across multiple screens
 * - State persistence throughout journey
 * - Error handling during onboarding
 * - Journey abandonment and resumption
 *
 * These tests verify end-to-end user flows behave
 * correctly throughout the onboarding process.
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

// Mock the API client for ForgotPassword tests
jest.mock('@app/httpClients', () => ({
  SupabaseAuthClient: {
    requestPasswordRecovery: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock the rate limiter for ForgotPassword tests
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

describe('Onboarding Journey Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('registration journey', () => {
    it('should complete full registration form', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />
      );

      // Fill all required fields
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      // Form should be valid
      await waitFor(
        () => {
          expect(getByTestId('register-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 5000, interval: 100 }
      );

      // Submit registration
      await fireEvent.press(getByTestId('register-button'));

      expect(getByTestId('registration-screen')).toBeOnTheScreen();
    });

    it('should navigate to login from registration', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />
      );

      await fireEvent.press(getByTestId('login-link'));

      expect(mockRegNav.navigate).toHaveBeenCalledWith('Login');
    });

    it('should navigate to terms from registration', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />
      );

      await fireEvent.press(getByTestId('terms-link'));

      expect(mockRegNav.navigate).toHaveBeenCalledWith('TermsAndConditions');
    });

    it('should navigate to privacy from registration', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />
      );

      await fireEvent.press(getByTestId('privacy-link'));

      expect(mockRegNav.navigate).toHaveBeenCalledWith('PrivacyPolicy');
    });
  });

  describe('login journey', () => {
    it('should complete full login flow', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Fill credentials
      await fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Form should be valid
      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit login
      await fireEvent.press(getByTestId('login-button'));

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should navigate to registration from login', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      await fireEvent.press(getByTestId('register-link'));

      expect(mockLoginNav.navigate).toHaveBeenCalledWith('Registration');
    });

    it('should navigate to forgot password from login', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      await fireEvent.press(getByTestId('forgot-password-link'));

      expect(mockLoginNav.navigate).toHaveBeenCalledWith('ForgotPassword');
    });
  });

  describe('password recovery journey', () => {
    it('should complete forgot password request', async () => {
      const { getByTestId } = await renderWithProviders(
        <ForgotPasswordScreen navigation={mockForgotNav} route={mockForgotRoute} />
      );

      // Fill email
      await fireEvent.changeText(getByTestId('email-input'), 'john@example.com');

      // Form should be valid
      await waitFor(
        () => {
          expect(getByTestId('send-reset-email-button').props.accessibilityState?.disabled).toBe(
            false
          );
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit request
      await fireEvent.press(getByTestId('send-reset-email-button'));

      expect(getByTestId('forgot-password-screen')).toBeOnTheScreen();
    });

    it('should show back to login button after successful submission', async () => {
      const { getByTestId } = await renderWithProviders(
        <ForgotPasswordScreen navigation={mockForgotNav} route={mockForgotRoute} />
      );

      // Fill email and submit
      await fireEvent.changeText(getByTestId('email-input'), 'john@example.com');

      await waitFor(
        () => {
          expect(getByTestId('send-reset-email-button').props.accessibilityState?.disabled).toBe(
            false
          );
        },
        { timeout: 3000, interval: 100 }
      );

      await fireEvent.press(getByTestId('send-reset-email-button'));

      // Wait for success state
      await waitFor(
        () => {
          expect(getByTestId('back-to-login-button')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Navigate back to login
      await fireEvent.press(getByTestId('back-to-login-button'));

      expect(mockForgotNav.goBack).toHaveBeenCalled();
    });
  });

  describe('journey state transitions', () => {
    it('should handle loading state during login', async () => {
      const { getByTestId } = await renderWithProviders(
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

      // Button should be disabled during loading
      expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(true);
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle loading state during registration', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />,
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
      expect(getByTestId('register-button').props.accessibilityState?.disabled).toBe(true);
      expect(getByTestId('registration-screen')).toBeOnTheScreen();
    });

    it('should display error during login journey', async () => {
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

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Invalid credentials')).toBeOnTheScreen();
    });

    it('should display error during registration journey', async () => {
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

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Email already registered')).toBeOnTheScreen();
    });
  });

  describe('journey validation', () => {
    it('should validate email format in login', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Invalid email
      await fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Form should be invalid
      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should validate password match in registration', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />
      );

      // Fill form with mismatched passwords
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'DifferentPass456!');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      // Form should be invalid
      await waitFor(
        () => {
          expect(getByTestId('register-button').props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should validate terms acceptance in registration', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />
      );

      // Fill form without accepting terms
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      // Don't accept terms

      // Form should be invalid
      await waitFor(
        () => {
          expect(getByTestId('register-button').props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('journey interruption handling', () => {
    it('should handle unmount during login submission', async () => {
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

      // Unmount during loading
      await unmount();
      jest.runAllTimers();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('should handle unmount during registration submission', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount, getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />,
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

      expect(getByTestId('registration-screen')).toBeOnTheScreen();

      // Unmount during loading
      await unmount();
      jest.runAllTimers();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('keyboard navigation journey', () => {
    it('should complete login via keyboard navigation', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Fill email and press next
      await fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      await fireEvent(getByTestId('email-input'), 'submitEditing');

      // Fill password and press done
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit via keyboard
      await fireEvent(getByTestId('password-input'), 'submitEditing');

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should complete registration via keyboard navigation', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />
      );

      // Navigate through all fields via keyboard
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent(getByTestId('firstName-input'), 'submitEditing');

      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent(getByTestId('lastName-input'), 'submitEditing');

      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent(getByTestId('phone-number-input'), 'submitEditing');

      await fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      await fireEvent(getByTestId('email-input'), 'submitEditing');

      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      await fireEvent(getByTestId('password-input'), 'submitEditing');

      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(
        () => {
          expect(getByTestId('register-button').props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit via keyboard on last field
      await fireEvent(getByTestId('confirmPassword-input'), 'submitEditing');

      expect(getByTestId('registration-screen')).toBeOnTheScreen();
    });
  });
});
