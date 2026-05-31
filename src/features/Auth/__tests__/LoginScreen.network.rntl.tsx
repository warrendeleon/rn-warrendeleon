/**
 * LoginScreen Network Tests
 *
 * Tests for timeout handling, offline mode behaviour,
 * and biometric authentication states.
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { loginScreenProps, renderWithProviders } from '@app/test-utils';

import { LoginScreen } from '../LoginScreen';

const { navigation: mockNavigation, route: mockRoute } = loginScreenProps();

describe('LoginScreen Network Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('timeout handling', () => {
    it('should display timeout error message when network times out', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
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

    it('should keep form interactive after timeout error', async () => {
      const { getByTestId } = await renderWithProviders(
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

      // Form should still be interactive for retry
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      expect(emailInput.props.editable).not.toBe(false);
      expect(passwordInput.props.editable).not.toBe(false);
    });

    it('should allow form resubmission after timeout', async () => {
      const { getByTestId } = await renderWithProviders(
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

      // Fill form for retry
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          // Button should be enabled for retry
          expect(loginButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('offline mode behaviour', () => {
    it('should display offline error message when network unavailable', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'No internet connection. Please check your network.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('No internet connection. Please check your network.')).toBeOnTheScreen();
    });

    it('should preserve form data during offline state', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'No internet connection. Please check your network.',
              biometricEnabled: false,
            },
          },
        }
      );

      // Fill form while "offline"
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Data should be preserved
      expect(getByDisplayValue('user@example.com')).toBeOnTheScreen();
    });

    it('should allow retry when connection restored', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null, // Error cleared after connection restored
              biometricEnabled: false,
            },
          },
        }
      );

      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          expect(loginButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });
});

describe('LoginScreen Biometric Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('biometric state handling', () => {
    it('should recognise when biometric is enabled in state', async () => {
      const { getByTestId } = await renderWithProviders(
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

      // Screen should render normally with biometric enabled
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle biometric disabled state', async () => {
      const { getByTestId } = await renderWithProviders(
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

      // Screen should render with standard login form
      expect(getByTestId('login-screen')).toBeOnTheScreen();
      expect(getByTestId('email-input')).toBeOnTheScreen();
      expect(getByTestId('password-input')).toBeOnTheScreen();
    });

    it('should maintain form functionality regardless of biometric state', async () => {
      const { getByTestId } = await renderWithProviders(
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

      // Form should work normally even with biometric enabled
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          expect(loginButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });
});
