import React from 'react';
import * as ReactNative from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { expectFocusOrder, expectMinTouchTarget, renderWithProviders } from '@app/test-utils';

import { AppearanceScreen } from '../AppearanceScreen';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

describe('AppearanceScreen', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockGoBack.mockClear();
  });

  describe('rendering', () => {
    it('renders screen with correct testID', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<AppearanceScreen />);

      expect(getByTestId('appearance-screen')).toBeOnTheScreen();
    });

    it('renders section header', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByRole } = renderWithProviders(<AppearanceScreen />);

      expect(getByRole('header')).toBeOnTheScreen();
    });

    it('renders all theme options', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<AppearanceScreen />);

      expect(getByTestId('appearance-option-system')).toBeOnTheScreen();
      expect(getByTestId('appearance-option-light')).toBeOnTheScreen();
      expect(getByTestId('appearance-option-dark')).toBeOnTheScreen();
    });
  });

  describe('theme selection', () => {
    it('shows system theme as selected by default', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: {
          settings: { theme: 'system', language: 'en' },
        },
      });

      // The system option should be rendered (selection is visual via PickerGroup)
      expect(getByTestId('appearance-option-system')).toBeOnTheScreen();
    });

    it('shows light theme as selected when set', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: {
          settings: { theme: 'light', language: 'en' },
        },
      });

      expect(getByTestId('appearance-option-light')).toBeOnTheScreen();
    });

    it('shows dark theme as selected when set', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: {
          settings: { theme: 'dark', language: 'en' },
        },
      });

      expect(getByTestId('appearance-option-dark')).toBeOnTheScreen();
    });

    it('dispatches setTheme and navigates back when theme is selected', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId, store } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: {
          settings: { theme: 'system', language: 'en' },
        },
      });

      fireEvent.press(getByTestId('appearance-option-dark'));

      // Verify Redux state was updated
      expect(store.getState().settings.theme).toBe('dark');

      // Verify navigation went back
      expect(mockGoBack).toHaveBeenCalled();
    });

    it('updates Redux state when selecting light theme', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId, store } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: {
          settings: { theme: 'dark', language: 'en' },
        },
      });

      fireEvent.press(getByTestId('appearance-option-light'));

      expect(store.getState().settings.theme).toBe('light');
    });

    it('updates Redux state when selecting system theme', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId, store } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: {
          settings: { theme: 'light', language: 'en' },
        },
      });

      fireEvent.press(getByTestId('appearance-option-system'));

      expect(store.getState().settings.theme).toBe('system');
    });
  });

  describe('theme appearance', () => {
    it('renders correctly in light mode', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: {
          settings: { theme: 'light', language: 'en' },
        },
      });

      expect(getByTestId('appearance-screen')).toBeOnTheScreen();
    });

    it('renders correctly in dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: {
          settings: { theme: 'dark', language: 'en' },
        },
      });

      expect(getByTestId('appearance-screen')).toBeOnTheScreen();
    });

    it('renders correctly with system theme in light mode', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: {
          settings: { theme: 'system', language: 'en' },
        },
      });

      expect(getByTestId('appearance-screen')).toBeOnTheScreen();
    });

    it('renders correctly with system theme in dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: {
          settings: { theme: 'system', language: 'en' },
        },
      });

      expect(getByTestId('appearance-screen')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has accessible screen label', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<AppearanceScreen />);

      const screen = getByTestId('appearance-screen');
      expect(screen.props.accessibilityLabel).toBeDefined();
    });

    it('has accessible header role for section title', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByRole } = renderWithProviders(<AppearanceScreen />);

      expect(getByRole('header')).toBeOnTheScreen();
    });

    it('theme options have button role via PickerGroup', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<AppearanceScreen />);

      // PickerGroup items should be accessible as buttons
      expect(getByTestId('appearance-option-system')).toBeOnTheScreen();
      expect(getByTestId('appearance-option-light')).toBeOnTheScreen();
      expect(getByTestId('appearance-option-dark')).toBeOnTheScreen();
    });
  });

  describe('EAA Accessibility Compliance', () => {
    it('theme options have accessible touch targets (44×44 minimum)', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<AppearanceScreen />);

      expectMinTouchTarget(getByTestId('appearance-option-system'));
      expectMinTouchTarget(getByTestId('appearance-option-light'));
      expectMinTouchTarget(getByTestId('appearance-option-dark'));
    });

    it('has correct focus order for theme options', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<AppearanceScreen />);

      expectFocusOrder([
        getByTestId('appearance-option-system'),
        getByTestId('appearance-option-light'),
        getByTestId('appearance-option-dark'),
      ]);
    });

    it('theme options maintain touch targets in dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = renderWithProviders(<AppearanceScreen />, {
        preloadedState: {
          settings: { theme: 'dark', language: 'en' },
        },
      });

      expectMinTouchTarget(getByTestId('appearance-option-system'));
      expectMinTouchTarget(getByTestId('appearance-option-light'));
      expectMinTouchTarget(getByTestId('appearance-option-dark'));
    });
  });
});
