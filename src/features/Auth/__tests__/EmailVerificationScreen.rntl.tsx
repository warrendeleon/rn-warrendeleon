import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { SupabaseAuthClient } from '@app/httpClients';
import type { RootStackParamList } from '@app/navigation';
import { expectMinTouchTarget, renderWithProviders } from '@app/test-utils';

import { EmailVerificationScreen } from '../EmailVerificationScreen';
import * as emailResendRateLimiter from '../utils/emailResendRateLimiter';

// Mock the API client
jest.mock('@app/httpClients', () => ({
  SupabaseAuthClient: {
    resendConfirmationEmail: jest.fn(),
  },
}));

// Mock the rate limiter
jest.mock('../utils/emailResendRateLimiter', () => ({
  checkEmailResendRateLimit: jest.fn(),
  recordEmailResendRequest: jest.fn(),
  clearEmailResendRateLimit: jest.fn(),
  getEmailResendRateLimitStatus: jest.fn(),
}));

type EmailVerificationNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EmailVerification'
>;

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  replace: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => () => {}),
  removeListener: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(() => ({
    key: 'EmailVerification',
    index: 0,
    routeNames: ['EmailVerification'],
    routes: [
      {
        key: 'EmailVerification',
        name: 'EmailVerification',
        params: { email: 'test@example.com' },
      },
    ],
  })),
} as unknown as EmailVerificationNavigationProp;

const mockRoute = {
  key: 'EmailVerification',
  name: 'EmailVerification' as const,
  params: { email: 'test@example.com' },
};

describe('EmailVerificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (emailResendRateLimiter.checkEmailResendRateLimit as jest.Mock).mockResolvedValue({
      allowed: true,
      secondsRemaining: 0,
    });
    (emailResendRateLimiter.recordEmailResendRequest as jest.Mock).mockResolvedValue(undefined);
    (SupabaseAuthClient.resendConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
  });

  it('renders the screen correctly', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('email-verification-screen')).toBeOnTheScreen();
  });

  it('renders the email verification screen with testID', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('email-verification-screen')).toBeOnTheScreen();
  });

  it('renders email icon container', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('email-icon-container')).toBeOnTheScreen();
  });

  it('renders verification title', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('verification-title')).toBeOnTheScreen();
  });

  it('renders verification message', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('verification-message')).toBeOnTheScreen();
  });

  it('renders email display with the email address', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('email-display')).toBeOnTheScreen();
    expect(getByTestId('email-address')).toBeOnTheScreen();
  });

  it('displays the correct email address from route params', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    const emailAddress = getByTestId('email-address');
    expect(emailAddress.props.children).toBe('test@example.com');
  });

  it('renders resend email button', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('resend-email-button')).toBeOnTheScreen();
  });

  it('renders back to login button', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('back-to-login-button')).toBeOnTheScreen();
  });

  it('renders back to login link', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('back-to-login-link')).toBeOnTheScreen();
  });

  it('renders info box', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('info-box')).toBeOnTheScreen();
  });

  it('navigates to Login when back to login button is pressed', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.press(getByTestId('back-to-login-button'));
    expect(mockNavigation.replace as jest.Mock).toHaveBeenCalledWith('Login');
  });

  it('navigates to Login when back to login link is pressed', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.press(getByTestId('back-to-login-link'));
    expect(mockNavigation.replace as jest.Mock).toHaveBeenCalledWith('Login');
  });

  it('shows success message after successful resend', async () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Press resend button
    fireEvent.press(getByTestId('resend-email-button'));

    // Wait for success message
    await waitFor(
      () => {
        expect(queryByTestId('resend-success-message')).toBeOnTheScreen();
      },
      { timeout: 5000, interval: 100 }
    );
  });

  it('shows error message when rate limit is exceeded', async () => {
    (emailResendRateLimiter.checkEmailResendRateLimit as jest.Mock).mockResolvedValue({
      allowed: false,
      secondsRemaining: 45,
      error: 'Rate limit exceeded. Please wait before trying again.',
    });

    const { getByTestId, queryByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Press resend button
    fireEvent.press(getByTestId('resend-email-button'));

    // Wait for error message
    await waitFor(
      () => {
        expect(queryByTestId('error-message')).toBeOnTheScreen();
      },
      { timeout: 5000, interval: 100 }
    );
  });

  it('calls rate limiter check before resending email', async () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Press resend button
    fireEvent.press(getByTestId('resend-email-button'));

    await waitFor(
      () => {
        expect(emailResendRateLimiter.checkEmailResendRateLimit).toHaveBeenCalledWith(
          'test@example.com'
        );
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('records request after successful resend', async () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Press resend button
    fireEvent.press(getByTestId('resend-email-button'));

    // Wait for success message
    await waitFor(
      () => {
        expect(queryByTestId('resend-success-message')).toBeOnTheScreen();
      },
      { timeout: 5000, interval: 100 }
    );

    expect(emailResendRateLimiter.recordEmailResendRequest).toHaveBeenCalledWith(
      'test@example.com'
    );
  });

  it('calls Supabase API to resend confirmation email', async () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Press resend button
    fireEvent.press(getByTestId('resend-email-button'));

    // Wait for success message
    await waitFor(
      () => {
        expect(queryByTestId('resend-success-message')).toBeOnTheScreen();
      },
      { timeout: 5000, interval: 100 }
    );

    expect(SupabaseAuthClient.resendConfirmationEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('shows error message when API call fails', async () => {
    (SupabaseAuthClient.resendConfirmationEmail as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { getByTestId, queryByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Press resend button
    fireEvent.press(getByTestId('resend-email-button'));

    // Wait for error message
    await waitFor(
      () => {
        expect(queryByTestId('error-message')).toBeOnTheScreen();
      },
      { timeout: 5000, interval: 100 }
    );
  });

  it('disables resend button during cooldown period', async () => {
    (emailResendRateLimiter.checkEmailResendRateLimit as jest.Mock).mockResolvedValue({
      allowed: false,
      secondsRemaining: 30,
    });

    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Wait for initial rate limit check
    await waitFor(
      () => {
        const resendButton = getByTestId('resend-email-button');
        expect(resendButton.props.accessibilityState?.disabled).toBe(true);
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('enables resend button when no cooldown', async () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Wait for initial rate limit check to complete
    await waitFor(
      () => {
        const resendButton = getByTestId('resend-email-button');
        expect(resendButton.props.accessibilityState?.disabled).toBe(false);
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('has proper accessibility label on resend button', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    const resendButton = getByTestId('resend-email-button');
    expect(resendButton.props.accessibilityRole).toBe('button');
  });

  it('has proper accessibility label on back to login button', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    const backButton = getByTestId('back-to-login-button');
    expect(backButton.props.accessibilityRole).toBe('button');
  });

  it('has proper accessibility role on back to login link', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    const backLink = getByTestId('back-to-login-link');
    expect(backLink.props.accessibilityRole).toBe('link');
  });

  it('displays different email address when provided in route params', () => {
    const customRoute = {
      key: 'EmailVerification',
      name: 'EmailVerification' as const,
      params: { email: 'different@example.com' },
    };

    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={customRoute} />
    );

    const emailAddress = getByTestId('email-address');
    expect(emailAddress.props.children).toBe('different@example.com');
  });
});

describe('EmailVerificationScreen implementation', () => {
  it('exports EmailVerificationScreen as a React component', () => {
    expect(typeof EmailVerificationScreen).toBe('function');
    expect(EmailVerificationScreen.name).toBe('EmailVerificationScreen');
  });
});

describe('EmailVerificationScreen EAA Accessibility Compliance', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    replace: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(() => () => {}),
    removeListener: jest.fn(),
    dispatch: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
    getId: jest.fn(),
    getParent: jest.fn(),
    getState: jest.fn(() => ({
      key: 'EmailVerification',
      index: 0,
      routeNames: ['EmailVerification'],
      routes: [
        {
          key: 'EmailVerification',
          name: 'EmailVerification',
          params: { email: 'test@example.com' },
        },
      ],
    })),
  } as unknown as NativeStackNavigationProp<RootStackParamList, 'EmailVerification'>;

  const mockRoute = {
    key: 'EmailVerification',
    name: 'EmailVerification' as const,
    params: { email: 'test@example.com' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (emailResendRateLimiter.checkEmailResendRateLimit as jest.Mock).mockResolvedValue({
      allowed: true,
    });
    (SupabaseAuthClient.resendConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
  });

  it('resend email button has accessible touch target', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    expectMinTouchTarget(getByTestId('resend-email-button'));
  });

  it('back to login button has accessible touch target', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    expectMinTouchTarget(getByTestId('back-to-login-button'));
  });

  it('back to login link has accessible touch target', () => {
    const { getByTestId } = renderWithProviders(
      <EmailVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    expectMinTouchTarget(getByTestId('back-to-login-link'));
  });
});
