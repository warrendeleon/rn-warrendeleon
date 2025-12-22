import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { SupabaseAuthClient } from '@app/httpClients';
import type { RootStackParamList } from '@app/navigation';
import { expectFocusOrder, expectMinTouchTarget, renderWithProviders } from '@app/test-utils';

import { ResetPasswordScreen } from '../ResetPasswordScreen';

// Mock the API client
jest.mock('@app/httpClients', () => ({
  SupabaseAuthClient: {
    resetPasswordWithToken: jest.fn(),
  },
}));

type ResetPasswordNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;

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
    key: 'ResetPassword',
    index: 0,
    routeNames: ['ResetPassword'],
    routes: [
      {
        key: 'ResetPassword',
        name: 'ResetPassword',
        params: { accessToken: 'test-token', fromEditAccount: false },
      },
    ],
  })),
} as unknown as ResetPasswordNavigationProp;

const mockRoute = {
  key: 'ResetPassword',
  name: 'ResetPassword' as const,
  params: {
    accessToken: 'test-access-token',
    fromEditAccount: false,
  },
};

const mockRouteFromEditAccount = {
  key: 'ResetPassword',
  name: 'ResetPassword' as const,
  params: {
    accessToken: 'test-access-token',
    fromEditAccount: true,
  },
};

describe('ResetPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SupabaseAuthClient.resetPasswordWithToken as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('renders reset password screen with form fields', () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Verify main container and essential form elements render
      expect(getByTestId('reset-password-screen')).toBeOnTheScreen();
      expect(getByTestId('new-password-input')).toBeOnTheScreen();
      expect(getByTestId('confirm-password-input')).toBeOnTheScreen();
      expect(getByTestId('reset-password-button')).toBeOnTheScreen();
    });

    it('renders new password input field', () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('new-password-input')).toBeOnTheScreen();
    });

    it('renders confirm password input field', () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('confirm-password-input')).toBeOnTheScreen();
    });

    it('renders reset button', () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('reset-password-button')).toBeOnTheScreen();
    });

    it('renders back to login link', () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('back-to-login-link')).toBeOnTheScreen();
    });

    it('renders password requirements section', () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('password-requirements')).toBeOnTheScreen();
    });
  });

  describe('Button states', () => {
    it('disables reset button when passwords are empty', () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const resetButton = getByTestId('reset-password-button');
      expect(resetButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('disables reset button when password is too short', async () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const passwordInput = getByTestId('new-password-input');
      fireEvent.changeText(passwordInput, 'Short1!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'Short1!');

      await waitFor(
        () => {
          const resetButton = getByTestId('reset-password-button');
          expect(resetButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('disables reset button when passwords do not match', async () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const passwordInput = getByTestId('new-password-input');
      fireEvent.changeText(passwordInput, 'StrongPass123!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'DifferentPass123!');

      await waitFor(
        () => {
          const resetButton = getByTestId('reset-password-button');
          expect(resetButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('enables reset button when password is valid and matches', async () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const passwordInput = getByTestId('new-password-input');
      fireEvent.changeText(passwordInput, 'StrongPass123!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'StrongPass123!');

      await waitFor(
        () => {
          const resetButton = getByTestId('reset-password-button');
          expect(resetButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('Navigation', () => {
    it('resets to login when back to login link is pressed (deep link flow)', () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.press(getByTestId('back-to-login-link'));
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Home' }, { name: 'Login' }],
      });
    });

    it('does not show back to login link when fromEditAccount is true', () => {
      const { queryByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRouteFromEditAccount} />
      );

      // Back to login link is hidden when coming from EditAccount
      expect(queryByTestId('back-to-login-link')).toBeNull();
    });
  });

  describe('Form submission', () => {
    it('shows success message and navigates after button press', async () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter valid password
      const passwordInput = getByTestId('new-password-input');
      fireEvent.changeText(passwordInput, 'StrongPass123!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'StrongPass123!');

      // Wait for form to be valid
      await waitFor(
        () => {
          const resetButton = getByTestId('reset-password-button');
          expect(resetButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit form
      fireEvent.press(getByTestId('reset-password-button'));

      // Wait for success message to appear
      await waitFor(
        () => {
          expect(getByTestId('success-message')).toBeOnTheScreen();
        },
        { timeout: 5000, interval: 100 }
      );

      // Tap the back to login button
      fireEvent.press(getByTestId('back-to-login-button'));

      // Verify navigation happened
      expect(mockNavigation.reset).toHaveBeenCalled();
    });

    it('calls Supabase API to reset password with correct arguments', async () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter valid password
      const passwordInput = getByTestId('new-password-input');
      fireEvent.changeText(passwordInput, 'StrongPass123!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'StrongPass123!');

      // Wait for form to be valid
      await waitFor(
        () => {
          const resetButton = getByTestId('reset-password-button');
          expect(resetButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit form
      fireEvent.press(getByTestId('reset-password-button'));

      // Wait for API call and navigation
      await waitFor(
        () => {
          expect(SupabaseAuthClient.resetPasswordWithToken).toHaveBeenCalledWith(
            'test-access-token',
            'StrongPass123!'
          );
        },
        { timeout: 5000, interval: 100 }
      );
    });

    it('shows error message when API call fails', async () => {
      (SupabaseAuthClient.resetPasswordWithToken as jest.Mock).mockRejectedValue(
        new Error('Token expired')
      );

      const { getByTestId, queryByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter valid password
      const passwordInput = getByTestId('new-password-input');
      fireEvent.changeText(passwordInput, 'StrongPass123!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'StrongPass123!');

      // Wait for form to be valid
      await waitFor(
        () => {
          const resetButton = getByTestId('reset-password-button');
          expect(resetButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit form
      fireEvent.press(getByTestId('reset-password-button'));

      // Wait for error message
      await waitFor(
        () => {
          expect(queryByTestId('error-message')).toBeOnTheScreen();
        },
        { timeout: 5000, interval: 100 }
      );
    });

    it('shows invalid token error for expired tokens', async () => {
      (SupabaseAuthClient.resetPasswordWithToken as jest.Mock).mockRejectedValue(
        new Error('Token expired or invalid')
      );

      const { getByTestId, queryByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter valid password
      const passwordInput = getByTestId('new-password-input');
      fireEvent.changeText(passwordInput, 'StrongPass123!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'StrongPass123!');

      // Wait for form to be valid
      await waitFor(
        () => {
          const resetButton = getByTestId('reset-password-button');
          expect(resetButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit form
      fireEvent.press(getByTestId('reset-password-button'));

      // Wait for error message
      await waitFor(
        () => {
          expect(queryByTestId('error-message')).toBeOnTheScreen();
        },
        { timeout: 5000, interval: 100 }
      );
    });
  });

  describe('Success navigation', () => {
    it('navigates to Login with passwordUpdated param after tapping button on success screen', async () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter valid password and submit
      const passwordInput = getByTestId('new-password-input');
      fireEvent.changeText(passwordInput, 'StrongPass123!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'StrongPass123!');

      await waitFor(
        () => {
          const resetButton = getByTestId('reset-password-button');
          expect(resetButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      fireEvent.press(getByTestId('reset-password-button'));

      // Wait for success state to show
      await waitFor(
        () => {
          expect(getByTestId('success-message')).toBeOnTheScreen();
        },
        { timeout: 5000, interval: 100 }
      );

      // Tap the back to login button
      fireEvent.press(getByTestId('back-to-login-button'));

      // Verify navigation to Login with passwordUpdated param
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 1,
        routes: [{ name: 'Home' }, { name: 'Login', params: { passwordUpdated: true } }],
      });
    });

    it('navigates to EditAccount with passwordUpdated param when fromEditAccount is true', async () => {
      const mockRouteFromEditAccount = {
        ...mockRoute,
        params: {
          ...mockRoute.params,
          fromEditAccount: true,
        },
      };

      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRouteFromEditAccount} />
      );

      // Enter valid password and submit
      const passwordInput = getByTestId('new-password-input');
      fireEvent.changeText(passwordInput, 'StrongPass123!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'StrongPass123!');

      await waitFor(
        () => {
          const resetButton = getByTestId('reset-password-button');
          expect(resetButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      fireEvent.press(getByTestId('reset-password-button'));

      // Wait for success state to show
      await waitFor(
        () => {
          expect(getByTestId('success-message')).toBeOnTheScreen();
        },
        { timeout: 5000, interval: 100 }
      );

      // Tap the back to account button
      fireEvent.press(getByTestId('back-to-login-button'));

      // Verify navigation to EditAccount with passwordUpdated param
      expect(mockNavigation.navigate).toHaveBeenCalledWith('EditAccount', {
        passwordUpdated: true,
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible button with proper accessibility state', () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const resetButton = getByTestId('reset-password-button');
      expect(resetButton.props.accessibilityRole).toBe('button');
      expect(resetButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('has accessible link for back to login', () => {
      const { getByTestId } = renderWithProviders(
        <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const backLink = getByTestId('back-to-login-link');
      expect(backLink.props.accessibilityRole).toBe('link');
    });
  });
});

describe('ResetPasswordScreen implementation', () => {
  it('exports ResetPasswordScreen as a React component', () => {
    expect(typeof ResetPasswordScreen).toBe('function');
    expect(ResetPasswordScreen.name).toBe('ResetPasswordScreen');
  });
});

describe('ResetPasswordScreen EAA Accessibility Compliance', () => {
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
      key: 'ResetPassword',
      index: 0,
      routeNames: ['ResetPassword'],
      routes: [
        {
          key: 'ResetPassword',
          name: 'ResetPassword',
          params: { accessToken: 'test-token', fromEditAccount: false },
        },
      ],
    })),
  } as unknown as NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;

  const mockRoute = {
    key: 'ResetPassword',
    name: 'ResetPassword' as const,
    params: {
      accessToken: 'test-access-token',
      fromEditAccount: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('form inputs are accessible', () => {
    const { getByTestId } = renderWithProviders(
      <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('new-password-input')).toBeOnTheScreen();
    expect(getByTestId('confirm-password-input')).toBeOnTheScreen();
  });

  it('reset password button has accessible touch target', () => {
    const { getByTestId } = renderWithProviders(
      <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expectMinTouchTarget(getByTestId('reset-password-button'));
  });

  it('back to login link has accessible touch target', () => {
    const { getByTestId } = renderWithProviders(
      <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expectMinTouchTarget(getByTestId('back-to-login-link'));
  });

  it('has correct focus order for form elements', () => {
    const { getByTestId } = renderWithProviders(
      <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expectFocusOrder([
      getByTestId('new-password-input'),
      getByTestId('confirm-password-input'),
      getByTestId('reset-password-button'),
    ]);
  });
});
