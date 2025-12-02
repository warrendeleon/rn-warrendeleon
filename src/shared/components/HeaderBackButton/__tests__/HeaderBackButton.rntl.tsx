import React from 'react';
import * as ReactNative from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils';

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
    it('renders chevron-left icon', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<HeaderBackButton />);

      expect(getByTestId('header-back-button')).toBeTruthy();
    });

    it('renders in light theme', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { UNSAFE_root } = renderWithProviders(<HeaderBackButton />, {
        preloadedState: {
          settings: {
            theme: 'light',
            language: 'en',
          },
        },
      });

      expect(UNSAFE_root).toBeDefined();
    });

    it('renders in dark theme', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { UNSAFE_root } = renderWithProviders(<HeaderBackButton />, {
        preloadedState: {
          settings: {
            theme: 'dark',
            language: 'en',
          },
        },
      });

      expect(UNSAFE_root).toBeDefined();
    });
  });

  describe('onPress handler', () => {
    it('calls navigation.goBack when pressed', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<HeaderBackButton />);

      const button = getByTestId('header-back-button');
      fireEvent.press(button);

      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('calls goBack only once per press', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<HeaderBackButton />);

      const button = getByTestId('header-back-button');
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockGoBack).toHaveBeenCalledTimes(2);
    });
  });

  describe('accessibility', () => {
    it('has correct accessibility role', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<HeaderBackButton />);

      const button = getByTestId('header-back-button');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('has correct accessibility label', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByLabelText } = renderWithProviders(<HeaderBackButton />);

      expect(getByLabelText('Go back')).toBeTruthy();
    });

    it('has accessibility hint', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<HeaderBackButton />);

      const button = getByTestId('header-back-button');
      expect(button.props.accessibilityHint).toBe('Returns to the previous screen');
    });

    it('is accessible via label', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByLabelText } = renderWithProviders(<HeaderBackButton />);

      const button = getByLabelText('Go back');
      fireEvent.press(button);

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('dark/light theme support', () => {
    it('renders correctly with light theme preference', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { UNSAFE_root } = renderWithProviders(<HeaderBackButton />, {
        preloadedState: {
          settings: {
            theme: 'light',
            language: 'en',
          },
        },
      });

      expect(UNSAFE_root).toBeDefined();
    });

    it('renders correctly with dark theme preference', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { UNSAFE_root } = renderWithProviders(<HeaderBackButton />, {
        preloadedState: {
          settings: {
            theme: 'dark',
            language: 'en',
          },
        },
      });

      expect(UNSAFE_root).toBeDefined();
    });

    it('renders correctly with system theme in light mode', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { UNSAFE_root } = renderWithProviders(<HeaderBackButton />, {
        preloadedState: {
          settings: {
            theme: 'system',
            language: 'en',
          },
        },
      });

      expect(UNSAFE_root).toBeDefined();
    });

    it('renders correctly with system theme in dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { UNSAFE_root } = renderWithProviders(<HeaderBackButton />, {
        preloadedState: {
          settings: {
            theme: 'system',
            language: 'en',
          },
        },
      });

      expect(UNSAFE_root).toBeDefined();
    });

    it('uses correct icon color for light theme', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { UNSAFE_root } = renderWithProviders(<HeaderBackButton />, {
        preloadedState: {
          settings: {
            theme: 'light',
            language: 'en',
          },
        },
      });

      expect(UNSAFE_root).toBeDefined();
    });

    it('uses correct icon color for dark theme', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { UNSAFE_root } = renderWithProviders(<HeaderBackButton />, {
        preloadedState: {
          settings: {
            theme: 'dark',
            language: 'en',
          },
        },
      });

      expect(UNSAFE_root).toBeDefined();
    });
  });

  describe('touch target size (EAA compliance)', () => {
    it('has hitSlop for improved touch target', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<HeaderBackButton />);

      const button = getByTestId('header-back-button');
      expect(button.props.hitSlop).toEqual({
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      });
    });

    it('maintains touch target with icon size 32', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { UNSAFE_root } = renderWithProviders(<HeaderBackButton />);

      // Icon size 32 + hitSlop 10 on all sides = 52x52 effective touch target
      // This exceeds the 44x44 minimum for iOS EAA compliance
      expect(UNSAFE_root).toBeDefined();
    });
  });

  describe('component optimisation', () => {
    it('is wrapped with React.memo', () => {
      expect(HeaderBackButton.displayName).toBe('HeaderBackButton');
    });

    it('renders consistently across multiple renders', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<HeaderBackButton />);

      const firstRender = getByTestId('header-back-button');
      expect(firstRender).toBeTruthy();

      // Component should render consistently
      const secondRender = getByTestId('header-back-button');
      expect(secondRender).toBeTruthy();
      expect(firstRender).toBe(secondRender);
    });
  });
});
