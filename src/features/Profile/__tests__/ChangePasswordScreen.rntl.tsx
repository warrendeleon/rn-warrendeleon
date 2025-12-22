import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { SupabaseAuthClient } from '@app/httpClients';
import type { RootStackParamList } from '@app/navigation';
import { expectFocusOrder, expectMinTouchTarget, renderWithProviders } from '@app/test-utils';

import { ChangePasswordScreen } from '../ChangePasswordScreen';

// Mock the API client
jest.mock('@app/httpClients', () => ({
  SupabaseAuthClient: {
    changePassword: jest.fn(),
  },
}));

type ChangePasswordNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChangePassword'>;

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
    key: 'ChangePassword',
    index: 0,
    routeNames: ['ChangePassword'],
    routes: [
      {
        key: 'ChangePassword',
        name: 'ChangePassword',
        params: undefined,
      },
    ],
  })),
} as unknown as ChangePasswordNavigationProp;

const mockRoute = {
  key: 'ChangePassword',
  name: 'ChangePassword' as const,
  params: undefined,
};

describe('ChangePasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SupabaseAuthClient.changePassword as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('renders the screen correctly', () => {
      const { getByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('change-password-screen')).toBeOnTheScreen();
    });

    it('renders the change password screen with testID', () => {
      const { getByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('change-password-screen')).toBeOnTheScreen();
    });

    it('renders current password input field', () => {
      const { getByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('current-password-input')).toBeOnTheScreen();
    });

    it('renders new password input field', () => {
      const { getByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('new-password-input')).toBeOnTheScreen();
    });

    it('renders confirm password input field', () => {
      const { getByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('confirm-password-input')).toBeOnTheScreen();
    });

    it('renders change password button', () => {
      const { getByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('change-password-button')).toBeOnTheScreen();
    });

    it('renders password requirements section', () => {
      const { getByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('password-requirements')).toBeOnTheScreen();
    });
  });

  describe('Button states', () => {
    it('disables change password button when passwords are empty', () => {
      const { getByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const changeButton = getByTestId('change-password-button');
      expect(changeButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('disables change password button when new password is too short', async () => {
      const { getByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const currentPasswordInput = getByTestId('current-password-input');
      fireEvent.changeText(currentPasswordInput, 'OldPass123!');

      const newPasswordInput = getByTestId('new-password-input');
      fireEvent.changeText(newPasswordInput, 'Short1!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'Short1!');

      await waitFor(
        () => {
          const changeButton = getByTestId('change-password-button');
          expect(changeButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('disables change password button when passwords do not match', async () => {
      const { getByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const currentPasswordInput = getByTestId('current-password-input');
      fireEvent.changeText(currentPasswordInput, 'OldPass123!');

      const newPasswordInput = getByTestId('new-password-input');
      fireEvent.changeText(newPasswordInput, 'StrongPass123!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'DifferentPass123!');

      await waitFor(
        () => {
          const changeButton = getByTestId('change-password-button');
          expect(changeButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('disables change password button when new password equals current password', async () => {
      const { getByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const currentPasswordInput = getByTestId('current-password-input');
      fireEvent.changeText(currentPasswordInput, 'StrongPass123!');

      const newPasswordInput = getByTestId('new-password-input');
      fireEvent.changeText(newPasswordInput, 'StrongPass123!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'StrongPass123!');

      await waitFor(
        () => {
          const changeButton = getByTestId('change-password-button');
          expect(changeButton.props.accessibilityState?.disabled).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('enables change password button when all fields are valid and different', async () => {
      const { getByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const currentPasswordInput = getByTestId('current-password-input');
      fireEvent.changeText(currentPasswordInput, 'OldPass123!');

      const newPasswordInput = getByTestId('new-password-input');
      fireEvent.changeText(newPasswordInput, 'NewStrongPass123!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'NewStrongPass123!');

      await waitFor(
        () => {
          const changeButton = getByTestId('change-password-button');
          expect(changeButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('Form submission', () => {
    it('calls changePassword API with correct arguments on successful submit', async () => {
      const { getByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter valid passwords
      const currentPasswordInput = getByTestId('current-password-input');
      fireEvent.changeText(currentPasswordInput, 'OldPass123!');

      const newPasswordInput = getByTestId('new-password-input');
      fireEvent.changeText(newPasswordInput, 'NewStrongPass123!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'NewStrongPass123!');

      // Wait for form to be valid
      await waitFor(
        () => {
          const changeButton = getByTestId('change-password-button');
          expect(changeButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit form
      fireEvent.press(getByTestId('change-password-button'));

      // Verify API called with correct arguments
      await waitFor(
        () => {
          expect(SupabaseAuthClient.changePassword).toHaveBeenCalledWith(
            'OldPass123!',
            'NewStrongPass123!'
          );
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('navigates to EditAccount with passwordUpdated param after successful password change', async () => {
      const { getByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter valid passwords
      const currentPasswordInput = getByTestId('current-password-input');
      fireEvent.changeText(currentPasswordInput, 'OldPass123!');

      const newPasswordInput = getByTestId('new-password-input');
      fireEvent.changeText(newPasswordInput, 'NewStrongPass123!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'NewStrongPass123!');

      // Wait for form to be valid
      await waitFor(
        () => {
          const changeButton = getByTestId('change-password-button');
          expect(changeButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit form
      fireEvent.press(getByTestId('change-password-button'));

      // Verify navigation to EditAccount
      await waitFor(
        () => {
          expect(mockNavigation.navigate).toHaveBeenCalledWith('EditAccount', {
            passwordUpdated: true,
          });
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('shows error message when current password is incorrect', async () => {
      (SupabaseAuthClient.changePassword as jest.Mock).mockRejectedValue(
        new Error('Current password is incorrect')
      );

      const { getByTestId, queryByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter passwords
      const currentPasswordInput = getByTestId('current-password-input');
      fireEvent.changeText(currentPasswordInput, 'WrongPassword123!');

      const newPasswordInput = getByTestId('new-password-input');
      fireEvent.changeText(newPasswordInput, 'NewStrongPass123!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'NewStrongPass123!');

      // Wait for form to be valid
      await waitFor(
        () => {
          const changeButton = getByTestId('change-password-button');
          expect(changeButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit form
      fireEvent.press(getByTestId('change-password-button'));

      // Wait for error message
      await waitFor(
        () => {
          expect(queryByTestId('error-message')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('shows generic error message when API call fails with unknown error', async () => {
      (SupabaseAuthClient.changePassword as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { getByTestId, queryByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter passwords
      const currentPasswordInput = getByTestId('current-password-input');
      fireEvent.changeText(currentPasswordInput, 'OldPass123!');

      const newPasswordInput = getByTestId('new-password-input');
      fireEvent.changeText(newPasswordInput, 'NewStrongPass123!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'NewStrongPass123!');

      // Wait for form to be valid
      await waitFor(
        () => {
          const changeButton = getByTestId('change-password-button');
          expect(changeButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Submit form
      fireEvent.press(getByTestId('change-password-button'));

      // Wait for error message
      await waitFor(
        () => {
          expect(queryByTestId('error-message')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('Accessibility', () => {
    it('has accessible button with proper accessibility state', () => {
      const { getByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const changeButton = getByTestId('change-password-button');
      expect(changeButton.props.accessibilityRole).toBe('button');
      expect(changeButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('has accessible error message with alert role', async () => {
      (SupabaseAuthClient.changePassword as jest.Mock).mockRejectedValue(new Error('Test error'));

      const { getByTestId, queryByTestId } = renderWithProviders(
        <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter passwords and trigger error
      const currentPasswordInput = getByTestId('current-password-input');
      fireEvent.changeText(currentPasswordInput, 'OldPass123!');

      const newPasswordInput = getByTestId('new-password-input');
      fireEvent.changeText(newPasswordInput, 'NewStrongPass123!');

      const confirmInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmInput, 'NewStrongPass123!');

      await waitFor(
        () => {
          const changeButton = getByTestId('change-password-button');
          expect(changeButton.props.accessibilityState?.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      fireEvent.press(getByTestId('change-password-button'));

      await waitFor(
        () => {
          const errorMessage = queryByTestId('error-message');
          expect(errorMessage).toBeOnTheScreen();
          expect(errorMessage?.props.accessibilityRole).toBe('alert');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });
});

describe('ChangePasswordScreen implementation', () => {
  it('exports ChangePasswordScreen as a React component', () => {
    expect(typeof ChangePasswordScreen).toBe('function');
    expect(ChangePasswordScreen.name).toBe('ChangePasswordScreen');
  });
});

describe('ChangePasswordScreen EAA Accessibility Compliance', () => {
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
      key: 'ChangePassword',
      index: 0,
      routeNames: ['ChangePassword'],
      routes: [{ key: 'ChangePassword', name: 'ChangePassword', params: undefined }],
    })),
  } as unknown as NativeStackNavigationProp<RootStackParamList, 'ChangePassword'>;

  const mockRoute = {
    key: 'ChangePassword',
    name: 'ChangePassword' as const,
    params: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('form inputs are accessible', () => {
    const { getByTestId } = renderWithProviders(
      <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Inputs exist within touch-target-compliant containers (FormInputItem)
    expect(getByTestId('current-password-input')).toBeOnTheScreen();
    expect(getByTestId('new-password-input')).toBeOnTheScreen();
    expect(getByTestId('confirm-password-input')).toBeOnTheScreen();
  });

  it('change password button has accessible touch target', () => {
    const { getByTestId } = renderWithProviders(
      <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expectMinTouchTarget(getByTestId('change-password-button'));
  });

  it('has correct focus order for form elements', () => {
    const { getByTestId } = renderWithProviders(
      <ChangePasswordScreen navigation={mockNavigation} route={mockRoute} />
    );

    expectFocusOrder([
      getByTestId('current-password-input'),
      getByTestId('new-password-input'),
      getByTestId('confirm-password-input'),
      getByTestId('change-password-button'),
    ]);
  });
});
