/**
 * Registration Flow Integration Tests
 *
 * Tests the complete user registration journey:
 * Register → Form Validation → Submit → Navigate to verification
 */

import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import type { RootStackParamList } from '@app/navigation';
import { expectCanReceiveFocus, expectFocusOrder, renderWithProviders } from '@app/test-utils';

import { RegistrationScreen } from '../RegistrationScreen';

type RegistrationNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Registration'>;

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
    key: 'Registration',
    index: 0,
    routeNames: ['Registration'],
    routes: [{ key: 'Registration', name: 'Registration', params: undefined }],
  })),
} as unknown as RegistrationNavigationProp;

const mockRoute = {
  key: 'Registration',
  name: 'Registration' as const,
  params: undefined,
};

describe('Registration Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('complete registration flow - form entry → validation → submission', () => {
    it('should complete full valid form entry enabling submission', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Step 1: Form is initially disabled
      const registerButton = getByTestId('register-button');
      expect(registerButton.props.accessibilityState?.disabled).toBe(true);

      // Step 2: Fill all required fields
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');

      // Step 3: Accept terms
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      // Step 4: Button should now be enabled
      await waitFor(
        () => {
          expect(registerButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should validate each field progressively', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const registerButton = getByTestId('register-button');

      // Only firstName - still disabled
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      expect(registerButton.props.accessibilityState?.disabled).toBe(true);

      // Add lastName - still disabled
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      expect(registerButton.props.accessibilityState?.disabled).toBe(true);

      // Add phone - still disabled
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      expect(registerButton.props.accessibilityState?.disabled).toBe(true);

      // Add email - still disabled
      await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      expect(registerButton.props.accessibilityState?.disabled).toBe(true);

      // Add password - still disabled
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      expect(registerButton.props.accessibilityState?.disabled).toBe(true);

      // Add confirm password - still disabled (terms not accepted)
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      expect(registerButton.props.accessibilityState?.disabled).toBe(true);

      // Accept terms - NOW enabled
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);
      await waitFor(
        () => {
          expect(registerButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('field validation errors', () => {
    it('should reject weak passwords', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill all fields but with weak password
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'weak');
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'weak');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      // Button should remain disabled due to weak password
      await waitFor(
        () => {
          const registerButton = getByTestId('register-button');
          expect(registerButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should reject mismatched passwords', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill all fields but passwords don't match
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'DifferentPass456!');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(
        () => {
          const registerButton = getByTestId('register-button');
          expect(registerButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should reject invalid email formats', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill all fields but with invalid email
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'not-an-email');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(
        () => {
          const registerButton = getByTestId('register-button');
          expect(registerButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should reject short names', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill all fields but names are too short
      await fireEvent.changeText(getByTestId('firstName-input'), 'J');
      await fireEvent.changeText(getByTestId('lastName-input'), 'D');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(
        () => {
          const registerButton = getByTestId('register-button');
          expect(registerButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('navigation flows', () => {
    it('should navigate to login when login link is pressed', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.press(getByTestId('login-link'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });

    it('should navigate to terms and conditions', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.press(getByTestId('terms-link'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('TermsAndConditions');
    });

    it('should navigate to privacy policy', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.press(getByTestId('privacy-link'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('PrivacyPolicy');
    });
  });

  describe('error state handling', () => {
    it('should display API error and keep form interactive', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />,
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

      // Error should be displayed
      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Email already registered')).toBeOnTheScreen();

      // Form should still be interactive
      const emailInput = getByTestId('email-input');
      await fireEvent.changeText(emailInput, 'different@example.com');
      expect(screen.getByDisplayValue('different@example.com')).toBeOnTheScreen();
    });

    it('should handle network timeout error', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />,
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

    it('should preserve form data during error state', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />,
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

      // Fill form while error is displayed
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('email-input'), 'john@example.com');

      // Data should be preserved
      expect(screen.getByDisplayValue('John')).toBeOnTheScreen();
      expect(screen.getByDisplayValue('john@example.com')).toBeOnTheScreen();
    });
  });

  describe('loading state', () => {
    it('should disable form during registration submission', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />,
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

      const registerButton = getByTestId('register-button');
      expect(registerButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('accessibility during registration flow', () => {
    it('should maintain correct focus order for form fields', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const firstName = getByTestId('firstName-input');
      const lastName = getByTestId('lastName-input');
      const phone = getByTestId('phone-number-input');
      const email = getByTestId('email-input');
      const password = getByTestId('password-input');
      const confirmPassword = getByTestId('confirmPassword-input');

      expectFocusOrder([firstName, lastName, phone, email, password, confirmPassword]);
    });

    it('should allow focus on all interactive elements', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expectCanReceiveFocus(getByTestId('firstName-input'));
      expectCanReceiveFocus(getByTestId('email-input'));
      expectCanReceiveFocus(getByTestId('register-button'));
      expectCanReceiveFocus(getByTestId('login-link'));
    });

    it('should have proper accessibility roles', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('register-button').props.accessibilityRole).toBe('button');
      expect(getByTestId('login-link').props.accessibilityRole).toBe('link');
      expect(getByTestId('terms-link').props.accessibilityRole).toBe('link');
      expect(getByTestId('accept-terms-switch').props.accessibilityRole).toBe('switch');
    });

    it('should announce disabled state to screen readers', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const registerButton = getByTestId('register-button');
      expect(registerButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('form field chaining', () => {
    it('should support keyboard navigation through form', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill fields using submitEditing (keyboard next)
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

      // Accept terms
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      // Form should be valid
      await waitFor(
        () => {
          const registerButton = getByTestId('register-button');
          expect(registerButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });
});
