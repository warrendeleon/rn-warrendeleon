import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import { SettingsScreen } from '@app/features';
import { renderWithProviders } from '@app/test-utils/renderWithProviders';

// Mock react-navigation
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
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
        key: 'Settings',
        index: 0,
        routeNames: ['Settings'],
        routes: [{ key: 'Settings', name: 'Settings', params: undefined }],
      })),
    }),
  };
});

const authenticatedState = {
  auth: {
    user: {
      id: 'user-123',
      email: 'warren@example.com',
      firstName: 'Warren',
      lastName: 'de Leon',
      phoneNumber: null,
      profilePicture: null,
      authProvider: 'email' as const,
    },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    biometricEnabled: false,
  },
};

const unauthenticatedState = {
  auth: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    biometricEnabled: false,
  },
};

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const { UNSAFE_root } = renderWithProviders(<SettingsScreen />);

      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders complete component tree', () => {
      const component = renderWithProviders(<SettingsScreen />);

      expect(component.UNSAFE_root).toBeTruthy();
    });

    it('renders screen with testID', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />);

      expect(getByTestId('settings-screen')).toBeTruthy();
    });
  });

  describe('Account Section - Unauthenticated', () => {
    it('shows sign in button when user is not authenticated', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: unauthenticatedState,
      });

      expect(getByTestId('settings-sign-in-button')).toBeTruthy();
    });

    it('does not show user card when user is not authenticated', () => {
      const { queryByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: unauthenticatedState,
      });

      expect(queryByTestId('settings-user-card')).toBeNull();
    });

    it('navigates to Login when sign in button is pressed', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: unauthenticatedState,
      });

      fireEvent.press(getByTestId('settings-sign-in-button'));
      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });

  describe('Account Section - Authenticated', () => {
    it('shows user card when user is authenticated', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('settings-user-card')).toBeTruthy();
    });

    it('does not show sign in button when user is authenticated', () => {
      const { queryByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: authenticatedState,
      });

      expect(queryByTestId('settings-sign-in-button')).toBeNull();
    });

    it('navigates to EditAccount when user card is pressed', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: authenticatedState,
      });

      fireEvent.press(getByTestId('settings-user-card'));
      expect(mockNavigate).toHaveBeenCalledWith('EditAccount');
    });
  });

  describe('General Section', () => {
    it('renders appearance button', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />);

      expect(getByTestId('settings-appearance-button')).toBeTruthy();
    });

    it('renders language button', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />);

      expect(getByTestId('settings-language-button')).toBeTruthy();
    });

    it('navigates to Appearance when appearance button is pressed', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />);

      fireEvent.press(getByTestId('settings-appearance-button'));
      expect(mockNavigate).toHaveBeenCalledWith('Appearance');
    });

    it('navigates to Language when language button is pressed', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />);

      fireEvent.press(getByTestId('settings-language-button'));
      expect(mockNavigate).toHaveBeenCalledWith('Language');
    });
  });

  describe('Accessibility', () => {
    it('has accessibility label on settings screen', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />);

      expect(getByTestId('settings-screen').props.accessibilityLabel).toBe('Settings');
    });
  });
});

describe('SettingsScreen implementation', () => {
  it('exports SettingsScreen as a React component', () => {
    expect(typeof SettingsScreen).toBe('function');
    expect(SettingsScreen.name).toBe('SettingsScreen');
  });
});
