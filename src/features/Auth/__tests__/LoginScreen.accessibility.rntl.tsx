/**
 * LoginScreen Accessibility Tests
 *
 * Tests for screen reader support, focus order, touch targets,
 * and EAA compliance requirements.
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';

import {
  expectCanReceiveFocus,
  expectFocusOrder,
  expectMinTouchTarget,
  loginScreenProps,
  renderWithProviders,
} from '@app/test-utils';

import { LoginScreen } from '../LoginScreen';

const { navigation: mockNavigation, route: mockRoute } = loginScreenProps();

describe('LoginScreen Screen Reader Accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('focus order for screen readers', () => {
    it('should have correct focus order for form elements', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');

      // Verify focus order: email -> password -> login button
      expectFocusOrder([emailInput, passwordInput, loginButton]);
    });

    it('should have focusable email input', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      expectCanReceiveFocus(emailInput);
    });

    it('should have focusable password input', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const passwordInput = getByTestId('password-input');
      expectCanReceiveFocus(passwordInput);
    });

    it('should have focusable login button', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const loginButton = getByTestId('login-button');
      expectCanReceiveFocus(loginButton);
    });

    it('should have focusable navigation links', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const forgotPasswordLink = getByTestId('forgot-password-link');
      const registerLink = getByTestId('register-link');

      expectCanReceiveFocus(forgotPasswordLink);
      expectCanReceiveFocus(registerLink);
    });
  });

  describe('screen reader announcements', () => {
    it('should have accessible labels on all interactive elements', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Email input must have accessibilityLabel (not just placeholder)
      const emailInput = getByTestId('email-input');
      expect(emailInput.props.accessibilityLabel).toBeDefined();
      expect(emailInput.props.placeholder).toBeDefined();

      // Password input must have accessibilityLabel (not just placeholder)
      const passwordInput = getByTestId('password-input');
      expect(passwordInput.props.accessibilityLabel).toBeDefined();
      expect(passwordInput.props.placeholder).toBeDefined();

      // Login button should have role and be identifiable
      const loginButton = getByTestId('login-button');
      expect(loginButton.props.accessibilityRole).toBe('button');
    });

    it('should have appropriate hints for form fields', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      // Inputs should have hints or be self-explanatory via labels
      expect(
        emailInput.props.accessibilityHint ?? emailInput.props.accessibilityLabel
      ).toBeDefined();
      expect(
        passwordInput.props.accessibilityHint ?? passwordInput.props.accessibilityLabel
      ).toBeDefined();
    });

    it('should announce button disabled state to screen readers', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const loginButton = getByTestId('login-button');
      // Disabled state should be in accessibilityState for screen reader
      expect(loginButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should announce button enabled state when form is valid', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      await waitFor(
        () => {
          const loginButton = getByTestId('login-button');
          expect(loginButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('focus management after actions', () => {
    it('should maintain focus context after form validation', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');

      // Type invalid email
      fireEvent.changeText(emailInput, 'invalid');

      // Screen should still be on screen (no unexpected navigation)
      expect(getByTestId('login-screen')).toBeOnTheScreen();

      // Form elements should still be accessible
      expectCanReceiveFocus(emailInput);
    });

    it('should keep form accessible during loading state', () => {
      const { getByTestId } = renderWithProviders(
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

      // Screen should remain accessible during loading
      expect(getByTestId('login-screen')).toBeOnTheScreen();

      // Button disabled state should be announced
      const loginButton = getByTestId('login-button');
      expect(loginButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should preserve accessibility after error display', () => {
      const { getByTestId } = renderWithProviders(
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

      // Error should be visible
      expect(getByTestId('auth-error-message')).toBeOnTheScreen();

      // Form elements should still be focusable
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      expectCanReceiveFocus(emailInput);
      expectCanReceiveFocus(passwordInput);
    });
  });
});

describe('LoginScreen Touch Targets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('verifies login button touch target', () => {
    const { getByTestId } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} route={mockRoute} />
    );

    expectMinTouchTarget(getByTestId('login-button'));
  });

  it('verifies forgot password link touch target', () => {
    const { getByTestId } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} route={mockRoute} />
    );

    expectMinTouchTarget(getByTestId('forgot-password-link'));
  });

  it('verifies register link touch target', () => {
    const { getByTestId } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} route={mockRoute} />
    );

    expectMinTouchTarget(getByTestId('register-link'));
  });
});

describe('LoginScreen Accessibility Roles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has proper accessibility role on login button', () => {
    const { getByTestId } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} route={mockRoute} />
    );

    const loginButton = getByTestId('login-button');
    expect(loginButton.props.accessibilityRole).toBe('button');
  });

  it('has proper accessibility role on forgot password link', () => {
    const { getByTestId } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} route={mockRoute} />
    );

    const forgotPasswordLink = getByTestId('forgot-password-link');
    expect(forgotPasswordLink.props.accessibilityRole).toBe('link');
  });

  it('has proper accessibility role on register link', () => {
    const { getByTestId } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} route={mockRoute} />
    );

    const registerLink = getByTestId('register-link');
    expect(registerLink.props.accessibilityRole).toBe('link');
  });
});

describe('Focus Management After Errors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should keep email field focusable after email validation error', async () => {
    const { getByTestId } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} route={mockRoute} />
    );

    const emailInput = getByTestId('email-input');

    // Trigger email validation error
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

    await waitFor(
      () => {
        // Email input should still be focusable
        expectCanReceiveFocus(emailInput);
        expect(getByTestId('login-screen')).toBeOnTheScreen();
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('should keep password field focusable after password validation error', async () => {
    const { getByTestId } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} route={mockRoute} />
    );

    const passwordInput = getByTestId('password-input');

    // Trigger password validation error (too short)
    fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
    fireEvent.changeText(passwordInput, 'short');

    await waitFor(
      () => {
        // Password input should still be focusable
        expectCanReceiveFocus(passwordInput);
        expect(getByTestId('login-screen')).toBeOnTheScreen();
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('should maintain focus order after multiple sequential errors', async () => {
    const { getByTestId } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} route={mockRoute} />
    );

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');

    // First error: invalid email
    fireEvent.changeText(emailInput, 'invalid');

    // Second error: short password
    fireEvent.changeText(passwordInput, 'abc');

    await waitFor(
      () => {
        // Focus order should be preserved after multiple errors
        expectFocusOrder([emailInput, passwordInput, loginButton]);
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('should announce auth error to screen readers via role="alert"', () => {
    const { getByTestId } = renderWithProviders(
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

    // Error should have alert role for screen reader announcement
    expect(errorMessage.props.accessibilityRole).toBe('alert');
  });

  it('should keep form fields accessible after network error', () => {
    const { getByTestId } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      {
        preloadedState: {
          auth: {
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Network request failed',
            biometricEnabled: false,
          },
        },
      }
    );

    // Error is visible
    expect(getByTestId('auth-error-message')).toBeOnTheScreen();

    // All form fields remain focusable for retry
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');

    expectCanReceiveFocus(emailInput);
    expectCanReceiveFocus(passwordInput);
    expectCanReceiveFocus(loginButton);
  });

  it('should handle rapid error-recovery cycles without losing focus context', async () => {
    const { getByTestId, rerender } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Simulate rapid state changes
    // First: trigger error
    rerender(<LoginScreen navigation={mockNavigation} route={mockRoute} />);

    // Screen remains accessible
    expect(getByTestId('login-screen')).toBeOnTheScreen();

    // Change email value multiple times rapidly
    const emailInput = getByTestId('email-input');
    fireEvent.changeText(emailInput, 'a');
    fireEvent.changeText(emailInput, 'ab');
    fireEvent.changeText(emailInput, 'abc');
    fireEvent.changeText(emailInput, 'abcd@example.com');

    await waitFor(
      () => {
        // Form should still function correctly after rapid changes
        expectCanReceiveFocus(emailInput);
        expect(getByTestId('login-screen')).toBeOnTheScreen();
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('should maintain accessibility during loading state', () => {
    const { getByTestId } = renderWithProviders(
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

    // Loading state - button should be disabled
    expect(getByTestId('login-button').props.accessibilityState?.disabled).toBe(true);

    // Form fields should still be focusable during loading
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');

    expectCanReceiveFocus(emailInput);
    expectCanReceiveFocus(passwordInput);
  });

  it('should maintain accessibility in error state', () => {
    const { getByTestId } = renderWithProviders(
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

    // Form should be accessible in error state
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');

    expectCanReceiveFocus(emailInput);
    expectCanReceiveFocus(passwordInput);

    // Error should be announced with alert role
    expect(getByTestId('auth-error-message').props.accessibilityRole).toBe('alert');
  });
});
