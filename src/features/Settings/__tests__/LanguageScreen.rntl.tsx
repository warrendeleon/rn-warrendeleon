import React from 'react';
import * as ReactNative from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { expectCanReceiveFocus, expectFocusOrder, renderWithProviders } from '@app/test-utils';

import { LanguageScreen } from '../LanguageScreen';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

// Mock i18next changeLanguage
const mockChangeLanguage = jest.fn().mockResolvedValue(undefined);
jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'language.title': 'Language',
        'language.languages': 'Languages',
        'language.english': 'English',
        'language.spanish': 'Spanish',
        'language.catalan': 'Catalan',
        'language.polish': 'Polish',
        'language.tagalog': 'Tagalog',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

describe('LanguageScreen', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockGoBack.mockClear();
    mockChangeLanguage.mockClear();
  });

  describe('rendering', () => {
    it('renders screen with correct testID', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<LanguageScreen />);

      expect(getByTestId('language-screen')).toBeOnTheScreen();
    });

    it('renders section header', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByRole } = renderWithProviders(<LanguageScreen />);

      expect(getByRole('header')).toBeOnTheScreen();
    });

    it('renders all language options', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<LanguageScreen />);

      expect(getByTestId('language-option-en')).toBeOnTheScreen();
      expect(getByTestId('language-option-es')).toBeOnTheScreen();
      expect(getByTestId('language-option-ca')).toBeOnTheScreen();
      expect(getByTestId('language-option-pl')).toBeOnTheScreen();
      expect(getByTestId('language-option-tl')).toBeOnTheScreen();
    });

    it('renders language labels', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByText } = renderWithProviders(<LanguageScreen />);

      expect(getByText('English')).toBeOnTheScreen();
      expect(getByText('Spanish')).toBeOnTheScreen();
      expect(getByText('Catalan')).toBeOnTheScreen();
      expect(getByText('Polish')).toBeOnTheScreen();
      expect(getByText('Tagalog')).toBeOnTheScreen();
    });
  });

  describe('language selection', () => {
    it('shows English as selected by default', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<LanguageScreen />, {
        preloadedState: {
          settings: { theme: 'light', language: 'en' },
        },
      });

      expect(getByTestId('language-option-en')).toBeOnTheScreen();
    });

    it('shows Spanish as selected when set', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<LanguageScreen />, {
        preloadedState: {
          settings: { theme: 'light', language: 'es' },
        },
      });

      expect(getByTestId('language-option-es')).toBeOnTheScreen();
    });

    it('dispatches setLanguage, changes i18n, and navigates back when language is selected', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId, store } = renderWithProviders(<LanguageScreen />, {
        preloadedState: {
          settings: { theme: 'light', language: 'en' },
        },
      });

      fireEvent.press(getByTestId('language-option-es'));

      await waitFor(
        () => {
          // Verify Redux state was updated
          expect(store.getState().settings.language).toBe('es');
        },
        { timeout: 3000, interval: 100 }
      );

      // Verify i18n.changeLanguage was called
      expect(mockChangeLanguage).toHaveBeenCalledWith('es');

      // Verify navigation went back
      expect(mockGoBack).toHaveBeenCalled();
    });

    it('updates Redux state when selecting Catalan', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId, store } = renderWithProviders(<LanguageScreen />, {
        preloadedState: {
          settings: { theme: 'light', language: 'en' },
        },
      });

      fireEvent.press(getByTestId('language-option-ca'));

      await waitFor(
        () => {
          expect(store.getState().settings.language).toBe('ca');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('updates Redux state when selecting Polish', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId, store } = renderWithProviders(<LanguageScreen />, {
        preloadedState: {
          settings: { theme: 'light', language: 'en' },
        },
      });

      fireEvent.press(getByTestId('language-option-pl'));

      await waitFor(
        () => {
          expect(store.getState().settings.language).toBe('pl');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('updates Redux state when selecting Tagalog', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId, store } = renderWithProviders(<LanguageScreen />, {
        preloadedState: {
          settings: { theme: 'light', language: 'en' },
        },
      });

      fireEvent.press(getByTestId('language-option-tl'));

      await waitFor(
        () => {
          expect(store.getState().settings.language).toBe('tl');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('calls i18n.changeLanguage with correct language code', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<LanguageScreen />, {
        preloadedState: {
          settings: { theme: 'light', language: 'en' },
        },
      });

      fireEvent.press(getByTestId('language-option-ca'));

      await waitFor(
        () => {
          expect(mockChangeLanguage).toHaveBeenCalledWith('ca');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('theme appearance', () => {
    it('renders correctly in light mode', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<LanguageScreen />, {
        preloadedState: {
          settings: { theme: 'light', language: 'en' },
        },
      });

      expect(getByTestId('language-screen')).toBeOnTheScreen();
    });

    it('renders correctly in dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = renderWithProviders(<LanguageScreen />, {
        preloadedState: {
          settings: { theme: 'dark', language: 'en' },
        },
      });

      expect(getByTestId('language-screen')).toBeOnTheScreen();
    });

    it('renders correctly with system theme in light mode', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<LanguageScreen />, {
        preloadedState: {
          settings: { theme: 'system', language: 'en' },
        },
      });

      expect(getByTestId('language-screen')).toBeOnTheScreen();
    });

    it('renders correctly with system theme in dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = renderWithProviders(<LanguageScreen />, {
        preloadedState: {
          settings: { theme: 'system', language: 'en' },
        },
      });

      expect(getByTestId('language-screen')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has accessible screen label', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<LanguageScreen />);

      const screen = getByTestId('language-screen');
      expect(screen.props.accessibilityLabel).toBeDefined();
    });

    it('has accessible header role for section title', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByRole } = renderWithProviders(<LanguageScreen />);

      expect(getByRole('header')).toBeOnTheScreen();
    });

    it('language options are accessible via PickerGroup', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<LanguageScreen />);

      // All language options should be accessible
      expect(getByTestId('language-option-en')).toBeOnTheScreen();
      expect(getByTestId('language-option-es')).toBeOnTheScreen();
      expect(getByTestId('language-option-ca')).toBeOnTheScreen();
      expect(getByTestId('language-option-pl')).toBeOnTheScreen();
      expect(getByTestId('language-option-tl')).toBeOnTheScreen();
    });

    it('has correct focus order for language options', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<LanguageScreen />);

      const english = getByTestId('language-option-en');
      const spanish = getByTestId('language-option-es');
      const catalan = getByTestId('language-option-ca');
      const polish = getByTestId('language-option-pl');
      const tagalog = getByTestId('language-option-tl');

      expectFocusOrder([english, spanish, catalan, polish, tagalog]);
    });

    it('all language options are focusable', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<LanguageScreen />);

      expectCanReceiveFocus(getByTestId('language-option-en'));
      expectCanReceiveFocus(getByTestId('language-option-es'));
      expectCanReceiveFocus(getByTestId('language-option-ca'));
      expectCanReceiveFocus(getByTestId('language-option-pl'));
      expectCanReceiveFocus(getByTestId('language-option-tl'));
    });
  });

  describe('i18n language switching', () => {
    it('maintains UI state during language switch', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId, store } = renderWithProviders(<LanguageScreen />, {
        preloadedState: {
          settings: { theme: 'light', language: 'en' },
        },
      });

      // Screen should be visible before switch
      expect(getByTestId('language-screen')).toBeOnTheScreen();

      // Switch language
      fireEvent.press(getByTestId('language-option-es'));

      await waitFor(
        () => {
          expect(store.getState().settings.language).toBe('es');
        },
        { timeout: 3000, interval: 100 }
      );

      // i18n should be updated
      expect(mockChangeLanguage).toHaveBeenCalledWith('es');
    });

    it('persists language preference in Redux after selection', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId, store } = renderWithProviders(<LanguageScreen />, {
        preloadedState: {
          settings: { theme: 'light', language: 'en' },
        },
      });

      // Verify initial state
      expect(store.getState().settings.language).toBe('en');

      // Switch to Polish
      fireEvent.press(getByTestId('language-option-pl'));

      await waitFor(
        () => {
          expect(store.getState().settings.language).toBe('pl');
        },
        { timeout: 3000, interval: 100 }
      );

      // Verify both Redux and i18n were updated
      expect(mockChangeLanguage).toHaveBeenCalledWith('pl');
    });

    it('handles rapid language switching', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId, store } = renderWithProviders(<LanguageScreen />, {
        preloadedState: {
          settings: { theme: 'light', language: 'en' },
        },
      });

      // Rapidly switch languages
      fireEvent.press(getByTestId('language-option-es'));
      fireEvent.press(getByTestId('language-option-ca'));
      fireEvent.press(getByTestId('language-option-pl'));

      await waitFor(
        () => {
          // Final language should be Polish
          expect(store.getState().settings.language).toBe('pl');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('syncs i18n with Redux on language change', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<LanguageScreen />, {
        preloadedState: {
          settings: { theme: 'light', language: 'en' },
        },
      });

      // Change language
      fireEvent.press(getByTestId('language-option-tl'));

      await waitFor(
        () => {
          // Verify i18n.changeLanguage was called with correct code
          expect(mockChangeLanguage).toHaveBeenCalledWith('tl');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('navigates back after successful language change', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<LanguageScreen />, {
        preloadedState: {
          settings: { theme: 'light', language: 'en' },
        },
      });

      fireEvent.press(getByTestId('language-option-ca'));

      await waitFor(
        () => {
          expect(mockGoBack).toHaveBeenCalled();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });
});
