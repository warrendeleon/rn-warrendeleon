/**
 * Settings Flow Integration Tests
 *
 * Tests the complete settings management journey:
 * Settings → Change Preference → Persist → Verify Persistence
 */

import React from 'react';
import * as ReactNative from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { expectFocusOrder, renderWithProviders } from '@app/test-utils';

import { AppearanceScreen } from '../AppearanceScreen';
import { LanguageScreen } from '../LanguageScreen';
import { SettingsScreen } from '../SettingsScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
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
}));

const authenticatedState = {
  auth: {
    user: {
      id: 'user-123',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: null,
      profilePicture: null,
      authProvider: 'email' as const,
    },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    biometricEnabled: false,
  },
  settings: {
    theme: 'system' as const,
    language: 'en' as const,
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
  settings: {
    theme: 'system' as const,
    language: 'en' as const,
  },
};

describe('Settings Flow Integration', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseColorScheme.mockReturnValue('light');
  });

  describe('Settings Screen - navigation hub', () => {
    it('should display settings options when authenticated', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('settings-screen')).toBeOnTheScreen();
      expect(getByTestId('settings-appearance-button')).toBeOnTheScreen();
      expect(getByTestId('settings-language-button')).toBeOnTheScreen();
    });

    it('should display user card when authenticated', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('settings-user-card')).toBeOnTheScreen();
    });

    it('should display sign in button when not authenticated', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: unauthenticatedState,
      });

      expect(getByTestId('settings-sign-in-button')).toBeOnTheScreen();
    });

    it('should navigate to appearance settings', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: authenticatedState,
      });

      fireEvent.press(getByTestId('settings-appearance-button'));

      expect(mockNavigate).toHaveBeenCalledWith('Appearance');
    });

    it('should navigate to language settings', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: authenticatedState,
      });

      fireEvent.press(getByTestId('settings-language-button'));

      expect(mockNavigate).toHaveBeenCalledWith('Language');
    });

    it('should navigate to edit account when user card pressed', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: authenticatedState,
      });

      fireEvent.press(getByTestId('settings-user-card'));

      expect(mockNavigate).toHaveBeenCalledWith('EditAccount');
    });

    it('should navigate to login when sign in pressed', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: unauthenticatedState,
      });

      fireEvent.press(getByTestId('settings-sign-in-button'));

      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });

  describe('Appearance Screen - theme selection', () => {
    it('should display all theme options', () => {
      const { getByTestId } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('appearance-screen')).toBeOnTheScreen();
      expect(getByTestId('appearance-option-system')).toBeOnTheScreen();
      expect(getByTestId('appearance-option-light')).toBeOnTheScreen();
      expect(getByTestId('appearance-option-dark')).toBeOnTheScreen();
    });

    it('should show current theme as selected', () => {
      const { getByTestId } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: authenticatedState,
      });

      const systemOption = getByTestId('appearance-option-system');
      expect(systemOption.props.accessibilityState?.selected).toBe(true);
    });

    it('should dispatch theme change and navigate back on selection', async () => {
      const { getByTestId, store } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: authenticatedState,
      });

      fireEvent.press(getByTestId('appearance-option-light'));

      await waitFor(
        () => {
          expect(mockGoBack).toHaveBeenCalled();
        },
        { timeout: 3000, interval: 100 }
      );

      expect(store.getState().settings.theme).toBe('light');
    });

    it('should dispatch dark theme change correctly', async () => {
      const { getByTestId, store } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: authenticatedState,
      });

      fireEvent.press(getByTestId('appearance-option-dark'));

      await waitFor(
        () => {
          expect(mockGoBack).toHaveBeenCalled();
        },
        { timeout: 3000, interval: 100 }
      );

      expect(store.getState().settings.theme).toBe('dark');
    });
  });

  describe('Language Screen - language selection', () => {
    it('should display available languages', () => {
      const { getByTestId } = renderWithProviders(<LanguageScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('language-screen')).toBeOnTheScreen();
      expect(getByTestId('language-option-en')).toBeOnTheScreen();
      expect(getByTestId('language-option-es')).toBeOnTheScreen();
      expect(getByTestId('language-option-ca')).toBeOnTheScreen();
      expect(getByTestId('language-option-pl')).toBeOnTheScreen();
      expect(getByTestId('language-option-tl')).toBeOnTheScreen();
    });

    it('should show current language as selected', () => {
      const { getByTestId } = renderWithProviders(<LanguageScreen />, {
        preloadedState: authenticatedState,
      });

      const englishOption = getByTestId('language-option-en');
      expect(englishOption.props.accessibilityState?.selected).toBe(true);
    });

    it('should dispatch language change on selection', async () => {
      const { getByTestId, store } = renderWithProviders(<LanguageScreen />, {
        preloadedState: authenticatedState,
      });

      fireEvent.press(getByTestId('language-option-es'));

      await waitFor(
        () => {
          expect(mockGoBack).toHaveBeenCalled();
        },
        { timeout: 3000, interval: 100 }
      );

      expect(store.getState().settings.language).toBe('es');
    });
  });

  describe('accessibility throughout settings flow', () => {
    it('should have correct focus order on settings screen', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: authenticatedState,
      });

      const appearanceSetting = getByTestId('settings-appearance-button');
      const languageSetting = getByTestId('settings-language-button');

      expectFocusOrder([appearanceSetting, languageSetting]);
    });

    it('should have proper accessibility roles on settings screen', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: authenticatedState,
      });

      const appearanceSetting = getByTestId('settings-appearance-button');
      expect(appearanceSetting.props.accessibilityRole).toBeDefined();
    });

    it('should have selected state announced on appearance options', () => {
      const { getByTestId } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: authenticatedState,
      });

      const systemOption = getByTestId('appearance-option-system');
      expect(systemOption.props.accessibilityState?.selected).toBeDefined();
    });

    it('should have selected state announced on language options', () => {
      const { getByTestId } = renderWithProviders(<LanguageScreen />, {
        preloadedState: authenticatedState,
      });

      const englishOption = getByTestId('language-option-en');
      expect(englishOption.props.accessibilityState?.selected).toBeDefined();
    });
  });

  describe('state persistence', () => {
    it('should reflect theme state from Redux', () => {
      const lightThemeState = {
        ...authenticatedState,
        settings: {
          ...authenticatedState.settings,
          theme: 'light' as const,
        },
      };

      const { getByTestId } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: lightThemeState,
      });

      const lightOption = getByTestId('appearance-option-light');
      expect(lightOption.props.accessibilityState?.selected).toBe(true);
    });

    it('should reflect dark theme state from Redux', () => {
      const darkThemeState = {
        ...authenticatedState,
        settings: {
          ...authenticatedState.settings,
          theme: 'dark' as const,
        },
      };

      const { getByTestId } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: darkThemeState,
      });

      const darkOption = getByTestId('appearance-option-dark');
      expect(darkOption.props.accessibilityState?.selected).toBe(true);
    });

    it('should reflect Spanish language state from Redux', () => {
      const spanishState = {
        ...authenticatedState,
        settings: {
          ...authenticatedState.settings,
          language: 'es' as const,
        },
      };

      const { getByTestId } = renderWithProviders(<LanguageScreen />, {
        preloadedState: spanishState,
      });

      const spanishOption = getByTestId('language-option-es');
      expect(spanishOption.props.accessibilityState?.selected).toBe(true);
    });
  });

  describe('theme display in settings', () => {
    it('should display theme setting with current value', () => {
      const lightThemeState = {
        ...authenticatedState,
        settings: {
          ...authenticatedState.settings,
          theme: 'light' as const,
        },
      };

      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: lightThemeState,
      });

      // Theme setting should be visible
      expect(getByTestId('settings-appearance-button')).toBeOnTheScreen();
    });

    it('should display language setting', () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />, {
        preloadedState: authenticatedState,
      });

      // Language setting should be visible
      expect(getByTestId('settings-language-button')).toBeOnTheScreen();
    });
  });
});
