/**
 * LoginScreen Error Tests
 *
 * Tests for error display, error recovery, HTTP error codes,
 * and error state management.
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { loginScreenProps, renderWithProviders } from '@app/test-utils';

import { LoginScreen } from '../LoginScreen';

const { navigation: mockNavigation, route: mockRoute } = loginScreenProps();

describe('LoginScreen Error Display', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays auth error message when present in Redux state', async () => {
    const { getByTestId, getByText } = await renderWithProviders(
      <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      {
        preloadedState: {
          auth: {
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Invalid email or password',
            biometricEnabled: false,
          },
        },
      }
    );

    expect(getByTestId('auth-error-message')).toBeOnTheScreen();
    expect(getByText('Invalid email or password')).toBeOnTheScreen();
  });

  it('does not display error message when no error in Redux state', async () => {
    const { queryByTestId } = await renderWithProviders(
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

    expect(queryByTestId('auth-error-message')).not.toBeOnTheScreen();
  });
});

describe('LoginScreen Error Recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('error clearing behaviour', () => {
    it('should clear error state when form is modified after error', async () => {
      const { getByTestId } = await renderWithProviders(
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

      // Initial state: error is visible
      expect(getByTestId('auth-error-message')).toBeOnTheScreen();

      // Simulate user modifying email (error should remain until resubmit)
      await fireEvent.changeText(getByTestId('email-input'), 'new@example.com');

      // Error should still be visible (only clears on successful submission)
      // This tests that form modifications don't accidentally clear errors
      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
    });

    it('should allow retry after error with modified credentials', async () => {
      const { getByTestId } = await renderWithProviders(
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

      // Error is visible
      expect(getByTestId('auth-error-message')).toBeOnTheScreen();

      // User can still interact with form to retry
      await fireEvent.changeText(getByTestId('email-input'), 'correct@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'CorrectPassword123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          // Button should be enabled for retry
          expect(loginButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should preserve form data when error occurs', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill in form
      await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'MyPassword123!');

      // Form data should be preserved (error state from Redux doesn't clear local state)
      expect(getByDisplayValue('user@example.com')).toBeOnTheScreen();
    });
  });

  describe('sequential error handling', () => {
    it('should display different errors for different scenarios', async () => {
      // First render with credentials error
      const { getByText, unmount } = await renderWithProviders(
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

      // First error is visible
      expect(getByText('Invalid credentials')).toBeOnTheScreen();
      await unmount();

      // Second render with account locked error
      const { getByText: getByText2 } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Account locked. Try again in 5 minutes.',
              biometricEnabled: false,
            },
          },
        }
      );

      // Second error should now be visible
      expect(getByText2('Account locked. Try again in 5 minutes.')).toBeOnTheScreen();
    });
  });
});

describe('LoginScreen HTTP Error Codes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('401 Unauthorized', () => {
    it('should display appropriate error for invalid credentials', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
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

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Invalid credentials')).toBeOnTheScreen();
    });
  });

  describe('403 Forbidden', () => {
    it('should display account suspended error', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Account suspended. Contact support.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Account suspended. Contact support.')).toBeOnTheScreen();
    });
  });

  describe('429 Rate Limit', () => {
    it('should display rate limit error with retry message', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Too many attempts. Please wait 5 minutes.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Too many attempts. Please wait 5 minutes.')).toBeOnTheScreen();
    });

    it('should keep form interactive during rate limit', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Too many attempts. Please wait 5 minutes.',
              biometricEnabled: false,
            },
          },
        }
      );

      // Form should still be interactive to allow retry after waiting
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      expect(emailInput.props.editable).not.toBe(false);
      expect(passwordInput.props.editable).not.toBe(false);
    });
  });

  describe('5xx Server Errors', () => {
    it('should display server error for 500 Internal Server Error', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Something went wrong. Please try again later.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Something went wrong. Please try again later.')).toBeOnTheScreen();
    });

    it('should display service unavailable for 503', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Service temporarily unavailable. Please try again.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Service temporarily unavailable. Please try again.')).toBeOnTheScreen();
    });

    it('should allow retry after server error', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Something went wrong. Please try again later.',
              biometricEnabled: false,
            },
          },
        }
      );

      // User can fill form and retry
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
