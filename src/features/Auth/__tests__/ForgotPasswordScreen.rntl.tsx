import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { SupabaseAuthClient } from '@app/httpClients';
import type { RootStackParamList } from '@app/navigation';
import { renderWithProviders } from '@app/test-utils';

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

  it('renders without crashing', () => {
    const { UNSAFE_root } = renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders the forgot password screen with testID', () => {
    const { getByTestId } = renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('forgot-password-screen')).toBeTruthy();
  });

  it('renders email input field', () => {
    const { getByTestId } = renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('email-input')).toBeTruthy();
  });

  it('renders send button', () => {
    const { getByTestId } = renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('send-reset-email-button')).toBeTruthy();
  });

  it('renders back to login link', () => {
    const { getByTestId } = renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('back-to-login-link')).toBeTruthy();
  });

  it('renders info box', () => {
    const { getByTestId } = renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('info-box')).toBeTruthy();
  });

  it('disables send button when email is empty', () => {
    const { getByTestId } = renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    const sendButton = getByTestId('send-reset-email-button');
    expect(sendButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('navigates back when back to login link is pressed', () => {
    const { getByTestId } = renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.press(getByTestId('back-to-login-link'));
    expect(mockNavigation.goBack as jest.Mock).toHaveBeenCalled();
  });

  it('shows success state after successful submission', async () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Enter valid email
    const emailInput = getByTestId('email-input');
    fireEvent.changeText(emailInput, 'test@example.com');

    // Wait for form to be valid
    await waitFor(() => {
      const sendButton = getByTestId('send-reset-email-button');
      expect(sendButton.props.accessibilityState?.disabled).toBe(false);
    });

    // Submit form
    fireEvent.press(getByTestId('send-reset-email-button'));

    // Wait for success state
    await waitFor(() => {
      expect(queryByTestId('success-message')).toBeTruthy();
    });
  });

  it('shows error message when rate limit is exceeded', async () => {
    (rateLimiter.checkPasswordResetRateLimit as jest.Mock).mockResolvedValue({
      allowed: false,
      requestsRemaining: 0,
      error: 'Rate limit exceeded. Please try again later.',
    });

    const { getByTestId, queryByTestId } = renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Enter valid email
    const emailInput = getByTestId('email-input');
    fireEvent.changeText(emailInput, 'test@example.com');

    // Wait for form to be valid
    await waitFor(() => {
      const sendButton = getByTestId('send-reset-email-button');
      expect(sendButton.props.accessibilityState?.disabled).toBe(false);
    });

    // Submit form
    fireEvent.press(getByTestId('send-reset-email-button'));

    // Wait for error message
    await waitFor(() => {
      expect(queryByTestId('error-message')).toBeTruthy();
    });
  });

  it('calls rate limiter check before submission', async () => {
    const { getByTestId } = renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Enter valid email
    const emailInput = getByTestId('email-input');
    fireEvent.changeText(emailInput, 'test@example.com');

    // Wait for form to be valid
    await waitFor(() => {
      const sendButton = getByTestId('send-reset-email-button');
      expect(sendButton.props.accessibilityState?.disabled).toBe(false);
    });

    // Submit form
    fireEvent.press(getByTestId('send-reset-email-button'));

    await waitFor(() => {
      expect(rateLimiter.checkPasswordResetRateLimit).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('records request after successful submission', async () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Enter valid email
    const emailInput = getByTestId('email-input');
    fireEvent.changeText(emailInput, 'test@example.com');

    // Wait for form to be valid
    await waitFor(() => {
      const sendButton = getByTestId('send-reset-email-button');
      expect(sendButton.props.accessibilityState?.disabled).toBe(false);
    });

    // Submit form
    fireEvent.press(getByTestId('send-reset-email-button'));

    // Wait for success state
    await waitFor(() => {
      expect(queryByTestId('success-message')).toBeTruthy();
    });

    expect(rateLimiter.recordPasswordResetRequest).toHaveBeenCalledWith('test@example.com');
  });

  it('calls Supabase API to request password recovery', async () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Enter valid email
    const emailInput = getByTestId('email-input');
    fireEvent.changeText(emailInput, 'test@example.com');

    // Wait for form to be valid
    await waitFor(() => {
      const sendButton = getByTestId('send-reset-email-button');
      expect(sendButton.props.accessibilityState?.disabled).toBe(false);
    });

    // Submit form
    fireEvent.press(getByTestId('send-reset-email-button'));

    // Wait for success state
    await waitFor(() => {
      expect(queryByTestId('success-message')).toBeTruthy();
    });

    expect(SupabaseAuthClient.requestPasswordRecovery).toHaveBeenCalledWith('test@example.com');
  });

  it('shows success even when API fails to prevent email enumeration', async () => {
    (SupabaseAuthClient.requestPasswordRecovery as jest.Mock).mockRejectedValue(
      new Error('User not found')
    );

    const { getByTestId, queryByTestId } = renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Enter valid email
    const emailInput = getByTestId('email-input');
    fireEvent.changeText(emailInput, 'nonexistent@example.com');

    // Wait for form to be valid
    await waitFor(() => {
      const sendButton = getByTestId('send-reset-email-button');
      expect(sendButton.props.accessibilityState?.disabled).toBe(false);
    });

    // Submit form
    fireEvent.press(getByTestId('send-reset-email-button'));

    // Should still show success to prevent email enumeration
    await waitFor(() => {
      expect(queryByTestId('success-message')).toBeTruthy();
    });
  });

  it('success state shows back to login button', async () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Enter valid email and submit
    const emailInput = getByTestId('email-input');
    fireEvent.changeText(emailInput, 'test@example.com');

    await waitFor(() => {
      const sendButton = getByTestId('send-reset-email-button');
      expect(sendButton.props.accessibilityState?.disabled).toBe(false);
    });

    fireEvent.press(getByTestId('send-reset-email-button'));

    // Wait for success state
    await waitFor(() => {
      expect(queryByTestId('success-message')).toBeTruthy();
    });

    // Back to login button should be visible
    expect(getByTestId('back-to-login-button')).toBeTruthy();
  });

  it('navigates back when back to login button is pressed in success state', async () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Enter valid email and submit
    const emailInput = getByTestId('email-input');
    fireEvent.changeText(emailInput, 'test@example.com');

    await waitFor(() => {
      const sendButton = getByTestId('send-reset-email-button');
      expect(sendButton.props.accessibilityState?.disabled).toBe(false);
    });

    fireEvent.press(getByTestId('send-reset-email-button'));

    // Wait for success state
    await waitFor(() => {
      expect(queryByTestId('success-message')).toBeTruthy();
    });

    // Press back to login button
    fireEvent.press(getByTestId('back-to-login-button'));

    expect(mockNavigation.goBack as jest.Mock).toHaveBeenCalled();
  });
});

describe('ForgotPasswordScreen implementation', () => {
  it('exports ForgotPasswordScreen as a React component', () => {
    expect(typeof ForgotPasswordScreen).toBe('function');
    expect(ForgotPasswordScreen.name).toBe('ForgotPasswordScreen');
  });
});
