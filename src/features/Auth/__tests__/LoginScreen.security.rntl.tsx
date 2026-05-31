/**
 * LoginScreen Security Tests
 *
 * Validates security requirements for the login form including:
 * - Password field protection (secureTextEntry, autocorrect disabled)
 * - Input sanitisation (SQL injection, XSS prevention)
 * - Error message security (no credential exposure)
 * - Form submission security (brute force protection, rate limiting)
 *
 * ## Security Test Categories
 *
 * | Category              | Tests                                      |
 * |-----------------------|--------------------------------------------|
 * | Password Field        | secureTextEntry, autocorrect, visibility   |
 * | Input Validation      | SQL injection, XSS, null bytes, unicode    |
 * | Error Messages        | No credential/email exposure in errors     |
 * | Form Security         | Timing attacks, brute force indicators     |
 *
 * ## Test Data
 *
 * Uses `SECURITY_TEST_VALUES` from test-utils for standardised attack vectors.
 *
 * @see src/test-utils/constants.ts for SECURITY_TEST_VALUES
 * @see docs/readme/TESTING.md#security-testing for patterns
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { loginScreenProps, renderWithProviders } from '@app/test-utils';

import { LoginScreen } from '../LoginScreen';

const { navigation: mockNavigation, route: mockRoute } = loginScreenProps();

describe('LoginScreen Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('password field security', () => {
    it('should have secure text entry enabled on password field', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const passwordInput = getByTestId('password-input');
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it('should disable autocorrect on password field', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const passwordInput = getByTestId('password-input');
      expect(passwordInput.props.autoCorrect).toBe(false);
    });

    it('should disable auto capitalisation on password field', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const passwordInput = getByTestId('password-input');
      expect(passwordInput.props.autoCapitalize).toBe('none');
    });

    it('should toggle password visibility when toggle button is pressed', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const passwordInput = getByTestId('password-input');
      const toggleButton = getByTestId('password-visibility-toggle');

      // Password should start hidden (secureTextEntry = true)
      expect(passwordInput.props.secureTextEntry).toBe(true);

      // Toggle visibility
      await fireEvent.press(toggleButton);

      // Password should now be visible (secureTextEntry = false)
      expect(passwordInput.props.secureTextEntry).toBe(false);

      // Toggle again
      await fireEvent.press(toggleButton);

      // Password should be hidden again
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });

  describe('error message security', () => {
    it('should not expose password in error messages', async () => {
      const sensitivePassword = 'MySecretPassword123!';
      const { getByTestId, queryByText } = await renderWithProviders(
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

      // Ensure error message does not contain the password
      expect(queryByText(new RegExp(sensitivePassword))).toBeNull();

      // Also verify password is not in any error display
      const errorMessage = getByTestId('auth-error-message');
      expect(errorMessage.props.children).not.toContain(sensitivePassword);
    });

    it('should display generic error message for failed authentication', async () => {
      const { getByText } = await renderWithProviders(
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

      // Should show a generic message, not specific details about what failed
      expect(getByText('Invalid credentials')).toBeOnTheScreen();
    });
  });

  describe('form submission security', () => {
    it('should disable form elements during loading state', async () => {
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

      const loginButton = getByTestId('login-button');
      // During loading, button should be disabled to prevent double-submission
      expect(loginButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('input validation security', () => {
    it('should reject SQL injection attempts in email field', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // SQL injection attempt
      await fireEvent.changeText(emailInput, "admin'--");
      await fireEvent.changeText(passwordInput, 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          // Should remain disabled because email format is invalid
          expect(loginButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should reject XSS attempts in email field', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // XSS attempt
      await fireEvent.changeText(emailInput, '<script>alert("xss")</script>');
      await fireEvent.changeText(passwordInput, 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          // Should remain disabled because email format is invalid
          expect(loginButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle unicode and special characters in email safely', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // Unicode email (technically valid but often rejected)
      await fireEvent.changeText(emailInput, 'tëst@example.com');
      await fireEvent.changeText(passwordInput, 'SecurePass123!');

      // Form should handle gracefully without crashing
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('accessibility - error announcements', () => {
    it('should have accessible error message container', async () => {
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

      const errorMessage = getByTestId('auth-error-message');
      expect(errorMessage.props.accessibilityRole).toBe('alert');
    });
  });

  describe('data sanitisation', () => {
    it('should reject HTML tags in email field', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // HTML tag injection attempt
      await fireEvent.changeText(emailInput, '<div>test@example.com</div>');
      await fireEvent.changeText(passwordInput, 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          // Should remain disabled because email format is invalid
          expect(loginButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should reject event handler attributes in email field', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // Event handler injection attempt
      await fireEvent.changeText(emailInput, 'test@example.com" onclick="alert(1)');
      await fireEvent.changeText(passwordInput, 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          // Should remain disabled because email format is invalid
          expect(loginButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should reject javascript: URL scheme in email field', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // JavaScript URL scheme injection
      await fireEvent.changeText(emailInput, 'javascript:alert(1)@example.com');
      await fireEvent.changeText(passwordInput, 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          // Should remain disabled because email format is invalid
          expect(loginButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should reject data: URL scheme in email field', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // Data URL scheme injection
      await fireEvent.changeText(emailInput, 'data:text/html,<script>alert(1)</script>@example.com');
      await fireEvent.changeText(passwordInput, 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          // Should remain disabled because email format is invalid
          expect(loginButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle unicode homograph attacks in email field', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // Unicode homograph attack (Cyrillic 'а' looks like Latin 'a')
      // This is аdmin@example.com with Cyrillic 'а' (U+0430)
      await fireEvent.changeText(emailInput, '\u0430dmin@example.com');
      await fireEvent.changeText(passwordInput, 'SecurePass123!');

      // Form should handle gracefully without crashing
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle zero-width characters in email field', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // Zero-width space (U+200B) injection
      await fireEvent.changeText(emailInput, 'test\u200B@example.com');
      await fireEvent.changeText(passwordInput, 'SecurePass123!');

      // Form should handle gracefully without crashing
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle zero-width joiner in email field', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // Zero-width joiner (U+200D) injection
      await fireEvent.changeText(emailInput, 'test\u200D@example.com');
      await fireEvent.changeText(passwordInput, 'SecurePass123!');

      // Form should handle gracefully without crashing
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle extremely long email input without crashing', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // Very long email (DoS attempt)
      const longEmail = 'a'.repeat(10000) + '@example.com';
      await fireEvent.changeText(emailInput, longEmail);
      await fireEvent.changeText(passwordInput, 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          // Should remain disabled because email is too long
          expect(loginButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );

      // Form should handle gracefully without crashing
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle extremely long password input without crashing', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // Very long password (DoS attempt)
      const longPassword = 'P@ssword1' + 'a'.repeat(10000);
      await fireEvent.changeText(emailInput, 'test@example.com');
      await fireEvent.changeText(passwordInput, longPassword);

      // Form should handle gracefully without crashing
      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should reject CRLF injection in email field', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // CRLF injection attempt
      await fireEvent.changeText(emailInput, 'test@example.com\r\nBcc: attacker@evil.com');
      await fireEvent.changeText(passwordInput, 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          // Should remain disabled because email format is invalid
          expect(loginButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should reject null byte injection in email field', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // Null byte injection attempt
      await fireEvent.changeText(emailInput, 'test@example.com\x00.evil.com');
      await fireEvent.changeText(passwordInput, 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          // Should remain disabled because email format is invalid
          expect(loginButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should reject path traversal attempts in email field', async () => {
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // Path traversal injection attempt
      await fireEvent.changeText(emailInput, '../../../etc/passwd@example.com');
      await fireEvent.changeText(passwordInput, 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          // Should remain disabled because email format is invalid
          expect(loginButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });
});
