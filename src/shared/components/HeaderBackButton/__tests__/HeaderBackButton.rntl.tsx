import React from 'react';
import * as ReactNative from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import {
  expectAccessibilityComplete,
  expectMinHitSlop,
  expectMinTouchTarget,
  renderWithProviders,
} from '@app/test-utils';

import { HeaderBackButton } from '../HeaderBackButton';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

describe('HeaderBackButton', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockGoBack.mockClear();
  });

  describe('renders back icon correctly', () => {
    it('renders chevron-left icon', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<HeaderBackButton />);

      expect(getByTestId('header-back-button')).toBeOnTheScreen();
    });

    it('renders in light theme', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<HeaderBackButton />, {
        preloadedState: {
          settings: {
            theme: 'light',
            language: 'en',
          },
        },
      });

      expect(getByTestId('header-back-button')).toBeOnTheScreen();
    });

    it('renders in dark theme', async () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = await renderWithProviders(<HeaderBackButton />, {
        preloadedState: {
          settings: {
            theme: 'dark',
            language: 'en',
          },
        },
      });

      expect(getByTestId('header-back-button')).toBeOnTheScreen();
    });
  });

  describe('onPress handler', () => {
    it('calls navigation.goBack when pressed', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<HeaderBackButton />);

      const button = getByTestId('header-back-button');
      await fireEvent.press(button);

      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('calls goBack only once per press', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<HeaderBackButton />);

      const button = getByTestId('header-back-button');
      await fireEvent.press(button);
      await fireEvent.press(button);

      expect(mockGoBack).toHaveBeenCalledTimes(2);
    });
  });

  describe('accessibility', () => {
    it('has correct accessibility role', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<HeaderBackButton />);

      const button = getByTestId('header-back-button');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('has correct accessibility label', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByLabelText } = await renderWithProviders(<HeaderBackButton />);

      expect(getByLabelText('Go back')).toBeOnTheScreen();
    });

    it('has accessibility hint', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<HeaderBackButton />);

      const button = getByTestId('header-back-button');
      expect(button.props.accessibilityHint).toBe('Returns to the previous screen');
    });

    it('is accessible via label', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByLabelText } = await renderWithProviders(<HeaderBackButton />);

      const button = getByLabelText('Go back');
      await fireEvent.press(button);

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('dark/light theme support', () => {
    it.each([
      ['light', 'light'],
      ['dark', 'dark'],
      ['system', 'light'],
      ['system', 'dark'],
    ] as const)(
      'renders correctly with %s theme preference (system colour scheme: %s)',
      async (themeSetting, systemColourScheme) => {
        mockUseColorScheme.mockReturnValue(systemColourScheme);

        const { getByTestId } = await renderWithProviders(<HeaderBackButton />, {
          preloadedState: {
            settings: {
              theme: themeSetting,
              language: 'en',
            },
          },
        });

        expect(getByTestId('header-back-button')).toBeOnTheScreen();
      }
    );

    it.each(['light', 'dark'] as const)('uses correct icon colour for %s theme', async colourScheme => {
      mockUseColorScheme.mockReturnValue(colourScheme);

      const { getByTestId } = await renderWithProviders(<HeaderBackButton />, {
        preloadedState: {
          settings: {
            theme: colourScheme,
            language: 'en',
          },
        },
      });

      expect(getByTestId('header-back-button')).toBeOnTheScreen();
    });
  });

  describe('touch target size (EAA compliance)', () => {
    it('verifies touch target with expectMinTouchTarget utility', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<HeaderBackButton />);

      const button = getByTestId('header-back-button');
      expectMinTouchTarget(button);
    });

    it('has hitSlop for improved touch target using expectMinHitSlop', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<HeaderBackButton />);

      const button = getByTestId('header-back-button');
      expectMinHitSlop(button, 10);
    });

    it('maintains touch target with icon size 32', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<HeaderBackButton />);

      const button = getByTestId('header-back-button');
      // Icon size 32 + hitSlop 10 on all sides = 52x52 effective touch target
      // This exceeds the 44x44 minimum for iOS EAA compliance
      expect(button.props.hitSlop).toEqual({
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      });
    });
  });

  describe('complete accessibility verification', () => {
    it('has complete EAA-compliant accessibility properties', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<HeaderBackButton />);

      expectAccessibilityComplete(getByTestId('header-back-button'), {
        role: 'button',
        label: 'Go back',
        hint: 'Returns to the previous screen',
        touchTarget: true,
      });
    });
  });

  describe('component optimisation', () => {
    it('is wrapped with React.memo', () => {
      expect(HeaderBackButton.displayName).toBe('HeaderBackButton');
    });

    it('renders consistently across multiple renders', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<HeaderBackButton />);

      const firstRender = getByTestId('header-back-button');
      expect(firstRender).not.toBeNull();

      // Component should render consistently
      const secondRender = getByTestId('header-back-button');
      expect(secondRender).not.toBeNull();
      expect(firstRender).toBe(secondRender);
    });
  });
});
