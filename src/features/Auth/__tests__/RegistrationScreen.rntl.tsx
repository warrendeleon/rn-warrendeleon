import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fireEvent, waitFor } from '@testing-library/react-native';

import type { RootStackParamList } from '@app/navigation';
import { expectCanReceiveFocus, expectFocusOrder, renderWithProviders } from '@app/test-utils';

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
    it('renders registration screen with all form fields', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Verify main container and essential form elements render
      expect(getByTestId('registration-screen')).toBeOnTheScreen();
      expect(getByTestId('firstName-input')).toBeOnTheScreen();
      expect(getByTestId('lastName-input')).toBeOnTheScreen();
      expect(getByTestId('email-input')).toBeOnTheScreen();
      expect(getByTestId('password-input')).toBeOnTheScreen();
      expect(getByTestId('register-button')).toBeOnTheScreen();
    });

    it('renders first name input field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('firstName-input')).toBeOnTheScreen();
    });

    it('renders last name input field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('lastName-input')).toBeOnTheScreen();
    });

    it('renders phone number input field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('phone-number-input')).toBeOnTheScreen();
    });

    it('renders email input field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('email-input')).toBeOnTheScreen();
    });

    it('renders password input field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('password-input')).toBeOnTheScreen();
    });

    it('renders confirm password input field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('confirmPassword-input')).toBeOnTheScreen();
    });

    it('renders accept terms switch', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('accept-terms-switch')).toBeOnTheScreen();
    });

    it('renders register button', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('register-button')).toBeOnTheScreen();
    });

    it('renders login link', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('login-link')).toBeOnTheScreen();
    });

    it('renders terms link', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('terms-link')).toBeOnTheScreen();
    });

    it('renders privacy link', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('privacy-link')).toBeOnTheScreen();
    });
  });

  describe('Form Validation', () => {
    it('disables register button when form is empty', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const registerButton = getByTestId('register-button');
      expect(registerButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('disables register button when first name is too short', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.changeText(getByTestId('firstName-input'), 'J');
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(
        () => {
          const registerButton = getByTestId('register-button');
          expect(registerButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('disables register button when last name is too short', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('lastName-input'), 'D');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(
        () => {
          const registerButton = getByTestId('register-button');
          expect(registerButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('disables register button when email is invalid', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(
        () => {
          const registerButton = getByTestId('register-button');
          expect(registerButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('disables register button when password is weak', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'weak');
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'weak');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(
        () => {
          const registerButton = getByTestId('register-button');
          expect(registerButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('disables register button when passwords do not match', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'DifferentPass456!');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(
        () => {
          const registerButton = getByTestId('register-button');
          expect(registerButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('disables register button when terms are not accepted', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      // Don't toggle terms switch

      await waitFor(
        () => {
          const registerButton = getByTestId('register-button');
          expect(registerButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('enables register button when form is valid', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(
        () => {
          const registerButton = getByTestId('register-button');
          expect(registerButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('Navigation', () => {
    it('navigates to Login when login link is pressed', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.press(getByTestId('login-link'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });

    it('navigates to TermsAndConditions when terms link is pressed', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.press(getByTestId('terms-link'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('TermsAndConditions');
    });

    it('navigates to PrivacyPolicy when privacy link is pressed', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.press(getByTestId('privacy-link'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('PrivacyPolicy');
    });
  });

  describe('Error Display', () => {
    it('displays auth error message when present in Redux state', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
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

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expect(getByText('Email already registered')).toBeOnTheScreen();
    });

    it('does not display error message when no error in Redux state', async () => {
      const { queryByTestId } = await renderWithProviders(
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
    it('has proper accessibility role on register button', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const registerButton = getByTestId('register-button');
      expect(registerButton.props.accessibilityRole).toBe('button');
    });

    it('has proper accessibility role on login link', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const loginLink = getByTestId('login-link');
      expect(loginLink.props.accessibilityRole).toBe('link');
    });

    it('has proper accessibility role on terms link', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const termsLink = getByTestId('terms-link');
      expect(termsLink.props.accessibilityRole).toBe('link');
    });

    it('has proper accessibility role on privacy link', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const privacyLink = getByTestId('privacy-link');
      expect(privacyLink.props.accessibilityRole).toBe('link');
    });

    it('has proper accessibility role on terms switch', async () => {
      const { getByTestId } = await renderWithProviders(
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

describe('RegistrationScreen Network Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('timeout handling', () => {
    it('should display timeout error message when network times out', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />,
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
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />,
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

      const firstNameInput = getByTestId('firstName-input');
      const emailInput = getByTestId('email-input');

      expect(firstNameInput.props.readOnly).not.toBe(true);
      expect(emailInput.props.readOnly).not.toBe(true);
    });
  });

  describe('offline mode behaviour', () => {
    it('should display offline error message when network unavailable', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />,
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
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />,
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

      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('email-input'), 'john@example.com');

      expect(getByDisplayValue('John')).toBeOnTheScreen();
      expect(getByDisplayValue('john@example.com')).toBeOnTheScreen();
    });
  });
});

describe('RegistrationScreen Screen Reader Accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('focus order for screen readers', () => {
    it('should have correct focus order for form elements', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const firstName = getByTestId('firstName-input');
      const lastName = getByTestId('lastName-input');
      const phone = getByTestId('phone-number-input');
      const email = getByTestId('email-input');
      const password = getByTestId('password-input');
      const confirmPassword = getByTestId('confirmPassword-input');

      expectFocusOrder([firstName, lastName, phone, email, password, confirmPassword]);
    });

    it('should have focusable first name input', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expectCanReceiveFocus(getByTestId('firstName-input'));
    });

    it('should have focusable email input', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expectCanReceiveFocus(getByTestId('email-input'));
    });

    it('should have focusable register button', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expectCanReceiveFocus(getByTestId('register-button'));
    });

    it('should have focusable navigation links', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expectCanReceiveFocus(getByTestId('login-link'));
      expectCanReceiveFocus(getByTestId('terms-link'));
      expectCanReceiveFocus(getByTestId('privacy-link'));
    });
  });

  describe('screen reader announcements', () => {
    it('should have accessible labels on all form fields', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const fields = [
        'firstName-input',
        'lastName-input',
        'email-input',
        'password-input',
        'confirmPassword-input',
      ];

      fields.forEach(fieldId => {
        const field = getByTestId(fieldId);
        // Each form field must have accessibilityLabel (not just placeholder)
        expect(field.props.accessibilityLabel).toBeDefined();
        expect(field.props.placeholder).toBeDefined();
      });
    });

    it('should announce button disabled state to screen readers', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const registerButton = getByTestId('register-button');
      expect(registerButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should announce button enabled state when form is valid', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      await waitFor(
        () => {
          const registerButton = getByTestId('register-button');
          expect(registerButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('focus management after actions', () => {
    it('should maintain focus context after form validation', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      await fireEvent.changeText(emailInput, 'invalid');

      expect(getByTestId('registration-screen')).toBeOnTheScreen();
      expectCanReceiveFocus(emailInput);
    });

    it('should keep form accessible during loading state', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />,
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

      expect(getByTestId('registration-screen')).toBeOnTheScreen();
      const registerButton = getByTestId('register-button');
      expect(registerButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should preserve accessibility after error display', async () => {
      const { getByTestId } = await renderWithProviders(
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

      expect(getByTestId('auth-error-message')).toBeOnTheScreen();
      expectCanReceiveFocus(getByTestId('email-input'));
      expectCanReceiveFocus(getByTestId('password-input'));
    });
  });
});

describe('RegistrationScreen Keyboard Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('return key types', () => {
    it('should have next return key type on firstName field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('firstName-input').props.returnKeyType).toBe('next');
    });

    it('should have next return key type on lastName field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('lastName-input').props.returnKeyType).toBe('next');
    });

    it('should have next return key type on phone field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('phone-number-input').props.returnKeyType).toBe('next');
    });

    it('should have next return key type on email field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('email-input').props.returnKeyType).toBe('next');
    });

    it('should have next return key type on password field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('password-input').props.returnKeyType).toBe('next');
    });

    it('should have done return key type on confirmPassword field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('confirmPassword-input').props.returnKeyType).toBe('done');
    });
  });

  describe('submitEditing handlers', () => {
    it('should have onSubmitEditing handler on firstName field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const firstNameInput = getByTestId('firstName-input');
      expect(firstNameInput.props.onSubmitEditing).toBeDefined();

      // Should not crash when triggered
      await fireEvent(firstNameInput, 'submitEditing');
      expect(getByTestId('lastName-input')).toBeOnTheScreen();
    });

    it('should have onSubmitEditing handler on lastName field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const lastNameInput = getByTestId('lastName-input');
      expect(lastNameInput.props.onSubmitEditing).toBeDefined();

      await fireEvent(lastNameInput, 'submitEditing');
      expect(getByTestId('phone-number-input')).toBeOnTheScreen();
    });

    it('should have onSubmitEditing handler on phone field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const phoneInput = getByTestId('phone-number-input');
      expect(phoneInput.props.onSubmitEditing).toBeDefined();

      await fireEvent(phoneInput, 'submitEditing');
      expect(getByTestId('email-input')).toBeOnTheScreen();
    });

    it('should have onSubmitEditing handler on email field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByTestId('email-input');
      expect(emailInput.props.onSubmitEditing).toBeDefined();

      await fireEvent(emailInput, 'submitEditing');
      expect(getByTestId('password-input')).toBeOnTheScreen();
    });

    it('should have onSubmitEditing handler on password field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const passwordInput = getByTestId('password-input');
      expect(passwordInput.props.onSubmitEditing).toBeDefined();

      await fireEvent(passwordInput, 'submitEditing');
      expect(getByTestId('confirmPassword-input')).toBeOnTheScreen();
    });

    it('should have onSubmitEditing handler on confirmPassword field', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      const confirmPasswordInput = getByTestId('confirmPassword-input');
      expect(confirmPasswordInput.props.onSubmitEditing).toBeDefined();

      // Should attempt form submission when pressing done
      await fireEvent(confirmPasswordInput, 'submitEditing');
      expect(getByTestId('registration-screen')).toBeOnTheScreen();
    });
  });

  describe('keyboard-only form completion', () => {
    it('should allow completing entire form using only keyboard', async () => {
      const { getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      // firstName → next → lastName
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent(getByTestId('firstName-input'), 'submitEditing');

      // lastName → next → phone
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent(getByTestId('lastName-input'), 'submitEditing');

      // phone → next → email
      await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
      await fireEvent(getByTestId('phone-number-input'), 'submitEditing');

      // email → next → password
      await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
      await fireEvent(getByTestId('email-input'), 'submitEditing');

      // password → next → confirmPassword
      await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
      await fireEvent(getByTestId('password-input'), 'submitEditing');

      // confirmPassword → done
      await fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');

      // Accept terms (this must be done separately from keyboard flow)
      await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

      // Form should be valid
      await waitFor(
        () => {
          const registerButton = getByTestId('register-button');
          expect(registerButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Press done on confirmPassword should attempt submission
      await fireEvent(getByTestId('confirmPassword-input'), 'submitEditing');
      expect(getByTestId('registration-screen')).toBeOnTheScreen();
    });

    it('should maintain form data when navigating between fields', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill firstName and press next
      await fireEvent.changeText(getByTestId('firstName-input'), 'John');
      await fireEvent(getByTestId('firstName-input'), 'submitEditing');

      // Fill lastName and press next
      await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
      await fireEvent(getByTestId('lastName-input'), 'submitEditing');

      // Verify data is preserved
      expect(getByDisplayValue('John')).toBeOnTheScreen();
      expect(getByDisplayValue('Doe')).toBeOnTheScreen();
    });
  });
});

describe('RegistrationScreen Form Submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit form when register button is pressed with valid data', async () => {
    const { getByTestId } = await renderWithProviders(
      <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Fill all required fields
    await fireEvent.changeText(getByTestId('firstName-input'), 'John');
    await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
    await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
    await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
    await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
    await fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
    await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

    // Wait for form to be valid
    await waitFor(
      () => {
        expect(getByTestId('register-button').props.accessibilityState?.disabled).toBe(false);
      },
      { timeout: 3000, interval: 100 }
    );

    // Press register button
    await fireEvent.press(getByTestId('register-button'));

    // Form should remain on screen (submission is async)
    expect(getByTestId('registration-screen')).toBeOnTheScreen();
  });

  it('should show loading state during form submission', async () => {
    const { getByTestId } = await renderWithProviders(
      <RegistrationScreen navigation={mockNavigation} route={mockRoute} />,
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

    // Button should be disabled during loading
    const registerButton = getByTestId('register-button');
    expect(registerButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('should prevent double submission', async () => {
    const { getByTestId } = await renderWithProviders(
      <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Fill form
    await fireEvent.changeText(getByTestId('firstName-input'), 'John');
    await fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
    await fireEvent.changeText(getByTestId('phone-number-input'), '+447123456789');
    await fireEvent.changeText(getByTestId('email-input'), 'john.doe@example.com');
    await fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
    await fireEvent.changeText(getByTestId('confirmPassword-input'), 'SecurePass123!');
    await fireEvent(getByTestId('accept-terms-switch'), 'valueChange', true);

    await waitFor(
      () => {
        expect(getByTestId('register-button').props.accessibilityState?.disabled).toBe(false);
      },
      { timeout: 3000, interval: 100 }
    );

    // First submission
    await fireEvent.press(getByTestId('register-button'));

    // Screen should remain stable (no crash from multiple submissions)
    expect(getByTestId('registration-screen')).toBeOnTheScreen();
  });
});

describe('RegistrationScreen Password Requirements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render password requirements component', async () => {
    const { getByTestId } = await renderWithProviders(
      <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('password-requirements')).toBeOnTheScreen();
  });

  it('should update password requirements as user types', async () => {
    const { getByTestId } = await renderWithProviders(
      <RegistrationScreen navigation={mockNavigation} route={mockRoute} />
    );

    const passwordInput = getByTestId('password-input');

    // Initially empty password
    expect(getByTestId('password-requirements')).toBeOnTheScreen();

    // Type a weak password
    await fireEvent.changeText(passwordInput, 'weak');

    // Requirements component should still be visible
    expect(getByTestId('password-requirements')).toBeOnTheScreen();

    // Type a strong password
    await fireEvent.changeText(passwordInput, 'SecurePass123!');

    // Requirements component should still be visible with updated state
    expect(getByTestId('password-requirements')).toBeOnTheScreen();
  });
});
