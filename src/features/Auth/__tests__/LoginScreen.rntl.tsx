import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fireEvent, waitFor } from '@testing-library/react-native';

import type { RootStackParamList } from '@app/navigation';
import { renderWithProviders } from '@app/test-utils';

import { LoginScreen } from '../LoginScreen';

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

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
    key: 'Login',
    index: 0,
    routeNames: ['Login'],
    routes: [{ key: 'Login', name: 'Login', params: undefined }],
  })),
} as unknown as LoginNavigationProp;

const mockRoute = {
  key: 'Login',
  name: 'Login' as const,
  params: undefined,
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { UNSAFE_root } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders the login screen with testID', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('login-screen')).toBeTruthy();
    });

    it('renders email input field', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('email-input')).toBeTruthy();
    });

    it('renders password input field', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('password-input')).toBeTruthy();
    });

    it('renders login button', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('login-button')).toBeTruthy();
    });

    it('renders forgot password link', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('forgot-password-link')).toBeTruthy();
    });

    it('renders register link', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('register-link')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('disables login button when form is empty', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const loginButton = getByTestId('login-button');
      expect(loginButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('disables login button when email is invalid', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.changeText(passwordInput, 'SecurePass123!');

      await waitFor(() => {
        const loginButton = getByTestId('login-button');
        expect(loginButton.props.accessibilityState?.disabled).toBe(true);
      });
    });

    it('disables login button when password is too short', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      fireEvent.changeText(emailInput, 'user@example.com');
      fireEvent.changeText(passwordInput, 'short');

      await waitFor(() => {
        const loginButton = getByTestId('login-button');
        expect(loginButton.props.accessibilityState?.disabled).toBe(true);
      });
    });

    it('enables login button when form is valid', async () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      fireEvent.changeText(emailInput, 'user@example.com');
      fireEvent.changeText(passwordInput, 'SecurePass123!');

      await waitFor(() => {
        const loginButton = getByTestId('login-button');
        expect(loginButton.props.accessibilityState?.disabled).toBe(false);
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to ForgotPassword when forgot password link is pressed', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.press(getByTestId('forgot-password-link'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
    });

    it('navigates to Registration when register link is pressed', () => {
      const { getByTestId } = renderWithProviders(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.press(getByTestId('register-link'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Registration');
    });
  });

  describe('Error Display', () => {
    it('displays auth error message when present in Redux state', () => {
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

      expect(getByTestId('auth-error-message')).toBeTruthy();
    });

    it('does not display error message when no error in Redux state', () => {
      const { queryByTestId } = renderWithProviders(
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

      expect(queryByTestId('auth-error-message')).toBeNull();
    });
  });

  describe('Accessibility', () => {
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
});

describe('LoginScreen implementation', () => {
  it('exports LoginScreen as a React component', () => {
    expect(typeof LoginScreen).toBe('function');
    expect(LoginScreen.name).toBe('LoginScreen');
  });
});
