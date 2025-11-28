import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fireEvent, waitFor } from '@testing-library/react-native';

import type { RootStackParamList } from '@app/navigation';
import { renderWithProviders } from '@app/test-utils';

import { RegistrationScreen } from '../RegistrationScreen';

type RegistrationNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Registration'>;

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
    key: 'Registration',
    index: 0,
    routeNames: ['Registration'],
    routes: [{ key: 'Registration', name: 'Registration', params: undefined }],
  })),
} as unknown as RegistrationNavigationProp;

const mockRoute = {
  key: 'Registration',
  name: 'Registration' as const,
  params: undefined,
};

describe('RegistrationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { UNSAFE_root } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders the registration screen with testID', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('registration-screen')).toBeTruthy();
    });

    it('renders first name input field', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('firstName-input')).toBeTruthy();
    });

    it('renders last name input field', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('lastName-input')).toBeTruthy();
    });

    it('renders phone number input field', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('phone-number-input')).toBeTruthy();
    });

    it('renders email input field', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('email-input')).toBeTruthy();
    });

    it('renders password input field', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('password-input')).toBeTruthy();
    });

    it('renders confirm password input field', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('confirmPassword-input')).toBeTruthy();
    });

    it('renders accept terms switch', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('accept-terms-switch')).toBeTruthy();
    });

    it('renders register button', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('register-button')).toBeTruthy();
    });

    it('renders login link', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('login-link')).toBeTruthy();
    });

    it('renders terms link', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('terms-link')).toBeTruthy();
    });

    it('renders privacy link', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('privacy-link')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('disables register button when form is empty', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const registerButton = getByTestId('register-button');
      expect(registerButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('disables register button when first name is too short', async () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByTestId('firstName-input'), 'J');
      fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(() => {
        const registerButton = getByTestId('register-button');
        expect(registerButton.props.accessibilityState?.disabled).toBe(true);
      });
    });

    it('disables register button when last name is too short', async () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByTestId('firstName-input'), 'John');
      fireEvent.changeText(getByTestId('lastName-input'), 'D');
      fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(() => {
        const registerButton = getByTestId('register-button');
        expect(registerButton.props.accessibilityState?.disabled).toBe(true);
      });
    });

    it('disables register button when email is invalid', async () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByTestId('firstName-input'), 'John');
      fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(() => {
        const registerButton = getByTestId('register-button');
        expect(registerButton.props.accessibilityState?.disabled).toBe(true);
      });
    });

    it('disables register button when password is weak', async () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByTestId('firstName-input'), 'John');
      fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'weak');
      fireEvent.changeText(getByTestId('confirmPassword-input'), 'weak');
      fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(() => {
        const registerButton = getByTestId('register-button');
        expect(registerButton.props.accessibilityState?.disabled).toBe(true);
      });
    });

    it('disables register button when passwords do not match', async () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByTestId('firstName-input'), 'John');
      fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      fireEvent.changeText(getByTestId('confirmPassword-input'), 'DifferentPass456!');
      fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(() => {
        const registerButton = getByTestId('register-button');
        expect(registerButton.props.accessibilityState?.disabled).toBe(true);
      });
    });

    it('disables register button when terms are not accepted', async () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByTestId('firstName-input'), 'John');
      fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      // Don't toggle terms switch

      await waitFor(() => {
        const registerButton = getByTestId('register-button');
        expect(registerButton.props.accessibilityState?.disabled).toBe(true);
      });
    });

    it('enables register button when form is valid', async () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByTestId('firstName-input'), 'John');
      fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(() => {
        const registerButton = getByTestId('register-button');
        expect(registerButton.props.accessibilityState?.disabled).toBe(false);
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to Login when login link is pressed', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.press(getByTestId('login-link'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });

    it('navigates to TermsAndConditions when terms link is pressed', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.press(getByTestId('terms-link'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('TermsAndConditions');
    });

    it('navigates to PrivacyPolicy when privacy link is pressed', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.press(getByTestId('privacy-link'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('PrivacyPolicy');
    });
  });

  describe('Error Display', () => {
    it('displays auth error message when present in Redux state', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Email already registered',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('auth-error-message')).toBeTruthy();
    });

    it('does not display error message when no error in Redux state', () => {
      const { queryByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />,
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
    it('has proper accessibility role on register button', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const registerButton = getByTestId('register-button');
      expect(registerButton.props.accessibilityRole).toBe('button');
    });

    it('has proper accessibility role on login link', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const loginLink = getByTestId('login-link');
      expect(loginLink.props.accessibilityRole).toBe('link');
    });

    it('has proper accessibility role on terms link', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const termsLink = getByTestId('terms-link');
      expect(termsLink.props.accessibilityRole).toBe('link');
    });

    it('has proper accessibility role on privacy link', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const privacyLink = getByTestId('privacy-link');
      expect(privacyLink.props.accessibilityRole).toBe('link');
    });

    it('has proper accessibility role on terms switch', () => {
      const { getByTestId } = renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const termsSwitch = getByTestId('accept-terms-switch');
      expect(termsSwitch.props.accessibilityRole).toBe('switch');
    });
  });
});

describe('RegistrationScreen implementation', () => {
  it('exports RegistrationScreen as a React component', () => {
    expect(typeof RegistrationScreen).toBe('function');
    expect(RegistrationScreen.name).toBe('RegistrationScreen');
  });
});
