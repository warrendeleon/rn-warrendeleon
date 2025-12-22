import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import { SettingsScreen } from '@app/features';
import { expectCanReceiveFocus, expectFocusOrder } from '@app/test-utils';
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
    it('renders the screen correctly', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />);

      expect(getByTestId('settings-screen')).toBeOnTheScreen();
    });

    it('renders screen with testID', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />);

      expect(getByTestId('settings-screen')).toBeOnTheScreen();
    });
  });

  describe('Account Section - Unauthenticated', () => {
    it('shows sign in button when user is not authenticated', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: unauthenticatedState,
      });

      expect(getByTestId('settings-sign-in-button')).toBeOnTheScreen();
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

      expect(getByTestId('settings-user-card')).toBeOnTheScreen();
    });

    it('shows profile picture when user has one', () => {
      const stateWithPicture = {
        auth: {
          ...authenticatedState.auth,
          user: {
            ...authenticatedState.auth.user,
            profilePicture: 'https://example.com/profile.jpg',
          },
        },
      };

      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: stateWithPicture,
      });

      expect(getByTestId('user-card-profile-picture')).toBeOnTheScreen();
    });

    it('shows initials when user has no profile picture', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('user-card-initials')).toBeOnTheScreen();
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

      expect(getByTestId('settings-appearance-button')).toBeOnTheScreen();
    });

    it('renders language button', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />);

      expect(getByTestId('settings-language-button')).toBeOnTheScreen();
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

describe('SettingsScreen Screen Reader Accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('focus order for screen readers', () => {
    it('should have correct focus order for settings items when authenticated', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: authenticatedState,
      });

      const userCard = getByTestId('settings-user-card');
      const appearanceButton = getByTestId('settings-appearance-button');
      const languageButton = getByTestId('settings-language-button');

      expectFocusOrder([userCard, appearanceButton, languageButton]);
    });

    it('should have correct focus order for settings items when unauthenticated', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: unauthenticatedState,
      });

      const signInButton = getByTestId('settings-sign-in-button');
      const appearanceButton = getByTestId('settings-appearance-button');
      const languageButton = getByTestId('settings-language-button');

      expectFocusOrder([signInButton, appearanceButton, languageButton]);
    });

    it('should have focusable sign in button when unauthenticated', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: unauthenticatedState,
      });

      expectCanReceiveFocus(getByTestId('settings-sign-in-button'));
    });

    it('should have focusable user card when authenticated', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: authenticatedState,
      });

      expectCanReceiveFocus(getByTestId('settings-user-card'));
    });

    it('should have focusable appearance button', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />);

      expectCanReceiveFocus(getByTestId('settings-appearance-button'));
    });

    it('should have focusable language button', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />);

      expectCanReceiveFocus(getByTestId('settings-language-button'));
    });
  });

  describe('accessibility roles', () => {
    it('should have button role on sign in button', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: unauthenticatedState,
      });

      const signInButton = getByTestId('settings-sign-in-button');
      expect(signInButton.props.accessibilityRole).toBe('button');
    });

    it('should have button role on appearance button', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />);

      const appearanceButton = getByTestId('settings-appearance-button');
      expect(appearanceButton.props.accessibilityRole).toBe('button');
    });

    it('should have button role on language button', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />);

      const languageButton = getByTestId('settings-language-button');
      expect(languageButton.props.accessibilityRole).toBe('button');
    });
  });
});
