import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { SupabaseAuthClient } from '@app/httpClients';
import type { RootStackParamList } from '@app/navigation';
import { expectCanReceiveFocus, expectFocusOrder, renderWithProviders } from '@app/test-utils';

import { ForgotPasswordScreen } from '../ForgotPasswordScreen';
import * as rateLimiter from '../utils/rateLimiter';

// Mock the API client
jest.mock('@app/httpClients', () => ({
  SupabaseAuthClient: {
    requestPasswordRecovery: jest.fn(),
  },
}));

// Mock the rate limiter
jest.mock('../utils/rateLimiter', () => ({
  checkPasswordResetRateLimit: jest.fn(),
  recordPasswordResetRequest: jest.fn(),
}));

type ForgotPasswordNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => () => {}),
  removeListener: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(() => ({
    key: 'ForgotPassword',
    index: 0,
    routeNames: ['ForgotPassword'],
    routes: [{ key: 'ForgotPassword', name: 'ForgotPassword', params: undefined }],
  })),
} as unknown as ForgotPasswordNavigationProp;

const mockRoute = {
  key: 'ForgotPassword',
  name: 'ForgotPassword' as const,
  params: undefined,
};

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (rateLimiter.checkPasswordResetRateLimit as jest.Mock).mockResolvedValue({
      allowed: true,
      requestsRemaining: 3,
    });
    (rateLimiter.recordPasswordResetRequest as jest.Mock).mockResolvedValue(undefined);
    (SupabaseAuthClient.requestPasswordRecovery as jest.Mock).mockResolvedValue(undefined);
  });

  it('renders the screen correctly', async () => {
    const { getByTestId } = await renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('forgot-password-screen')).toBeOnTheScreen();
  });

  it('renders the forgot password screen with testID', async () => {
    const { getByTestId } = await renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('forgot-password-screen')).toBeOnTheScreen();
  });

  it('renders email input field', async () => {
    const { getByTestId } = await renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('email-input')).toBeOnTheScreen();
  });

  it('renders send button', async () => {
    const { getByTestId } = await renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('send-reset-email-button')).toBeOnTheScreen();
  });

  it('renders back to login link', async () => {
    const { getByTestId } = await renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('back-to-login-link')).toBeOnTheScreen();
  });

  it('renders info box', async () => {
    const { getByTestId } = await renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('info-box')).toBeOnTheScreen();
  });

  it('disables send button when email is empty', async () => {
    const { getByTestId } = await renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    const sendButton = getByTestId('send-reset-email-button');
    expect(sendButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('navigates back when back to login link is pressed', async () => {
    const { getByTestId } = await renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    await fireEvent.press(getByTestId('back-to-login-link'));
    expect(mockNavigation.goBack as jest.Mock).toHaveBeenCalled();
  });

  it('shows success state after successful submission', async () => {
    const { getByTestId, queryByTestId } = await renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Enter valid email
    const emailInput = getByTestId('email-input');
    await fireEvent.changeText(emailInput, 'test@example.com');

    // Wait for form to be valid
    await waitFor(
      () => {
        const sendButton = getByTestId('send-reset-email-button');
        expect(sendButton.props.accessibilityState?.disabled).toBe(false);
      },
      { timeout: 3000, interval: 100 }
    );

    // Submit form
    await fireEvent.press(getByTestId('send-reset-email-button'));

    // Wait for success state
    await waitFor(
      () => {
        expect(queryByTestId('success-message')).toBeOnTheScreen();
      },
      { timeout: 5000, interval: 100 }
    );
  });

  it('shows error message when rate limit is exceeded', async () => {
    (rateLimiter.checkPasswordResetRateLimit as jest.Mock).mockResolvedValue({
      allowed: false,
      requestsRemaining: 0,
      error: 'Rate limit exceeded. Please try again later.',
    });

    const { getByTestId, queryByTestId } = await renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Enter valid email
    const emailInput = getByTestId('email-input');
    await fireEvent.changeText(emailInput, 'test@example.com');

    // Wait for form to be valid
    await waitFor(
      () => {
        const sendButton = getByTestId('send-reset-email-button');
        expect(sendButton.props.accessibilityState?.disabled).toBe(false);
      },
      { timeout: 3000, interval: 100 }
    );

    // Submit form
    await fireEvent.press(getByTestId('send-reset-email-button'));

    // Wait for error message
    await waitFor(
      () => {
        expect(queryByTestId('error-message')).toBeOnTheScreen();
      },
      { timeout: 5000, interval: 100 }
    );
  });

  it('calls rate limiter check before submission', async () => {
    const { getByTestId } = await renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Enter valid email
    const emailInput = getByTestId('email-input');
    await fireEvent.changeText(emailInput, 'test@example.com');

    // Wait for form to be valid
    await waitFor(
      () => {
        const sendButton = getByTestId('send-reset-email-button');
        expect(sendButton.props.accessibilityState?.disabled).toBe(false);
      },
      { timeout: 3000, interval: 100 }
    );

    // Submit form
    await fireEvent.press(getByTestId('send-reset-email-button'));

    await waitFor(
      () => {
        expect(rateLimiter.checkPasswordResetRateLimit).toHaveBeenCalledWith('test@example.com');
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('records request after successful submission', async () => {
    const { getByTestId, queryByTestId } = await renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Enter valid email
    const emailInput = getByTestId('email-input');
    await fireEvent.changeText(emailInput, 'test@example.com');

    // Wait for form to be valid
    await waitFor(
      () => {
        const sendButton = getByTestId('send-reset-email-button');
        expect(sendButton.props.accessibilityState?.disabled).toBe(false);
      },
      { timeout: 3000, interval: 100 }
    );

    // Submit form
    await fireEvent.press(getByTestId('send-reset-email-button'));

    // Wait for success state
    await waitFor(
      () => {
        expect(queryByTestId('success-message')).toBeOnTheScreen();
      },
      { timeout: 5000, interval: 100 }
    );

    expect(rateLimiter.recordPasswordResetRequest).toHaveBeenCalledWith('test@example.com');
  });

  it('calls Supabase API to request password recovery', async () => {
    const { getByTestId, queryByTestId } = await renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Enter valid email
    const emailInput = getByTestId('email-input');
    await fireEvent.changeText(emailInput, 'test@example.com');

    // Wait for form to be valid
    await waitFor(
      () => {
        const sendButton = getByTestId('send-reset-email-button');
        expect(sendButton.props.accessibilityState?.disabled).toBe(false);
      },
      { timeout: 3000, interval: 100 }
    );

    // Submit form
    await fireEvent.press(getByTestId('send-reset-email-button'));

    // Wait for success state
    await waitFor(
      () => {
        expect(queryByTestId('success-message')).toBeOnTheScreen();
      },
      { timeout: 5000, interval: 100 }
    );

    expect(SupabaseAuthClient.requestPasswordRecovery).toHaveBeenCalledWith('test@example.com');
  });

  it('shows success even when API fails to prevent email enumeration', async () => {
    (SupabaseAuthClient.requestPasswordRecovery as jest.Mock).mockRejectedValue(
      new Error('User not found')
    );

    const { getByTestId, queryByTestId } = await renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Enter valid email
    const emailInput = getByTestId('email-input');
    await fireEvent.changeText(emailInput, 'nonexistent@example.com');

    // Wait for form to be valid
    await waitFor(
      () => {
        const sendButton = getByTestId('send-reset-email-button');
        expect(sendButton.props.accessibilityState?.disabled).toBe(false);
      },
      { timeout: 3000, interval: 100 }
    );

    // Submit form
    await fireEvent.press(getByTestId('send-reset-email-button'));

    // Should still show success to prevent email enumeration
    await waitFor(
      () => {
        expect(queryByTestId('success-message')).toBeOnTheScreen();
      },
      { timeout: 5000, interval: 100 }
    );
  });

  it('success state shows back to login button', async () => {
    const { getByTestId, queryByTestId } = await renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Enter valid email and submit
    const emailInput = getByTestId('email-input');
    await fireEvent.changeText(emailInput, 'test@example.com');

    await waitFor(
      () => {
        const sendButton = getByTestId('send-reset-email-button');
        expect(sendButton.props.accessibilityState?.disabled).toBe(false);
      },
      { timeout: 3000, interval: 100 }
    );

    await fireEvent.press(getByTestId('send-reset-email-button'));

    // Wait for success state
    await waitFor(
      () => {
        expect(queryByTestId('success-message')).toBeOnTheScreen();
      },
      { timeout: 5000, interval: 100 }
    );

    // Back to login button should be visible
    expect(getByTestId('back-to-login-button')).toBeOnTheScreen();
  });

  it('navigates back when back to login button is pressed in success state', async () => {
    const { getByTestId, queryByTestId } = await renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Enter valid email and submit
    const emailInput = getByTestId('email-input');
    await fireEvent.changeText(emailInput, 'test@example.com');

    await waitFor(
      () => {
        const sendButton = getByTestId('send-reset-email-button');
        expect(sendButton.props.accessibilityState?.disabled).toBe(false);
      },
      { timeout: 3000, interval: 100 }
    );

    await fireEvent.press(getByTestId('send-reset-email-button'));

    // Wait for success state
    await waitFor(
      () => {
        expect(queryByTestId('success-message')).toBeOnTheScreen();
      },
      { timeout: 5000, interval: 100 }
    );

    // Press back to login button
    await fireEvent.press(getByTestId('back-to-login-button'));

    expect(mockNavigation.goBack as jest.Mock).toHaveBeenCalled();
  });
});

describe('ForgotPasswordScreen implementation', () => {
  it('exports ForgotPasswordScreen as a React component', () => {
    expect(typeof ForgotPasswordScreen).toBe('function');
    expect(ForgotPasswordScreen.name).toBe('ForgotPasswordScreen');
  });
});

describe('ForgotPasswordScreen Screen Reader Accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (rateLimiter.checkPasswordResetRateLimit as jest.Mock).mockResolvedValue({
      allowed: true,
      requestsRemaining: 3,
    });
  });

  describe('focus order for screen readers', () => {
    it('should have correct focus order for form elements', async () => {
      const { getByTestId } = await renderWithProviders(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const sendButton = getByTestId('send-reset-email-button');
      const backToLoginLink = getByTestId('back-to-login-link');

      expectFocusOrder([emailInput, sendButton, backToLoginLink]);
    });

    it('should have focusable email input', async () => {
      const { getByTestId } = await renderWithProviders(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expectCanReceiveFocus(getByTestId('email-input'));
    });

    it('should have focusable send button', async () => {
      const { getByTestId } = await renderWithProviders(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expectCanReceiveFocus(getByTestId('send-reset-email-button'));
    });

    it('should have focusable back to login link', async () => {
      const { getByTestId } = await renderWithProviders(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expectCanReceiveFocus(getByTestId('back-to-login-link'));
    });
  });

  describe('accessibility roles', () => {
    it('should have button role on send button', async () => {
      const { getByTestId } = await renderWithProviders(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const sendButton = getByTestId('send-reset-email-button');
      expect(sendButton.props.accessibilityRole).toBe('button');
    });

    it('should have link role on back to login link', async () => {
      const { getByTestId } = await renderWithProviders(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const backToLoginLink = getByTestId('back-to-login-link');
      expect(backToLoginLink.props.accessibilityRole).toBe('link');
    });

    it('should announce button disabled state to screen readers', async () => {
      const { getByTestId } = await renderWithProviders(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const sendButton = getByTestId('send-reset-email-button');
      expect(sendButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should announce button enabled state when form is valid', async () => {
      const { getByTestId } = await renderWithProviders(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.changeText(getByTestId('email-input'), 'test@example.com');

      await waitFor(
        () => {
          const sendButton = getByTestId('send-reset-email-button');
          expect(sendButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('focus management after actions', () => {
    it('should maintain focus context after form validation', async () => {
      const { getByTestId } = await renderWithProviders(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      await fireEvent.changeText(emailInput, 'invalid');

      expect(getByTestId('forgot-password-screen')).toBeOnTheScreen();
      expectCanReceiveFocus(emailInput);
    });

    it('should have focusable back to login button in success state', async () => {
      (SupabaseAuthClient.requestPasswordRecovery as jest.Mock).mockResolvedValue(undefined);

      const { getByTestId, queryByTestId } = await renderWithProviders(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.changeText(getByTestId('email-input'), 'test@example.com');

      await waitFor(
        () => {
          const sendButton = getByTestId('send-reset-email-button');
          expect(sendButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      await fireEvent.press(getByTestId('send-reset-email-button'));

      await waitFor(
        () => {
          expect(queryByTestId('success-message')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      expectCanReceiveFocus(getByTestId('back-to-login-button'));
    });
  });
});
