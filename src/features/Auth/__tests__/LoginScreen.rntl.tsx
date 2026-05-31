/**
 * LoginScreen Core Tests
 *
 * Tests for basic rendering, form validation, and navigation.
 * Additional tests split across focused files:
 * - LoginScreen.security.rntl.tsx - Password security, injection prevention
 * - LoginScreen.accessibility.rntl.tsx - Screen reader, focus order, touch targets
 * - LoginScreen.errors.rntl.tsx - Error display, recovery, HTTP codes
 * - LoginScreen.network.rntl.tsx - Timeout, offline, biometric
 * - LoginScreen.integration.rntl.tsx - Form submission, keyboard nav, async
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { loginScreenProps, renderWithProviders } from '@app/test-utils';

import { LoginScreen } from '../LoginScreen';

const { navigation: mockNavigation, route: mockRoute } = loginScreenProps();

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders login screen with all form elements', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Verify main container and essential form elements render
      expect(getByTestId('login-screen')).toBeOnTheScreen();
      expect(getByTestId('email-input')).toBeOnTheScreen();
      expect(getByTestId('password-input')).toBeOnTheScreen();
      expect(getByTestId('login-button')).toBeOnTheScreen();
    });

    it('renders email input field', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('email-input')).toBeOnTheScreen();
    });

    it('renders password input field', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('password-input')).toBeOnTheScreen();
    });

    it('renders login button', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('login-button')).toBeOnTheScreen();
    });

    it('renders forgot password link', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('forgot-password-link')).toBeOnTheScreen();
    });

    it('renders register link', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('register-link')).toBeOnTheScreen();
    });
  });

  describe('Form Validation', () => {
    it('disables login button when form is empty', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const loginButton = getByTestId('login-button');
      expect(loginButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('disables login button when email is invalid', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      await fireEvent.changeText(emailInput, 'invalid-email');
      await fireEvent.changeText(passwordInput, 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          expect(loginButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('disables login button when password is too short', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      await fireEvent.changeText(emailInput, 'user@example.com');
      await fireEvent.changeText(passwordInput, 'short');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          expect(loginButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('enables login button when form is valid', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      await fireEvent.changeText(emailInput, 'user@example.com');
      await fireEvent.changeText(passwordInput, 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          expect(loginButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('Navigation', () => {
    it('navigates to ForgotPassword when forgot password link is pressed', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.press(getByTestId('forgot-password-link'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
    });

    it('navigates to Registration when register link is pressed', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.press(getByTestId('register-link'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Registration');
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility role on login button', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const loginButton = getByTestId('login-button');
      expect(loginButton.props.accessibilityRole).toBe('button');
    });

    it('has proper accessibility role on forgot password link', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const forgotPasswordLink = getByTestId('forgot-password-link');
      expect(forgotPasswordLink.props.accessibilityRole).toBe('link');
    });

    it('has proper accessibility role on register link', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const registerLink = getByTestId('register-link');
      expect(registerLink.props.accessibilityRole).toBe('link');
    });
  });
});
