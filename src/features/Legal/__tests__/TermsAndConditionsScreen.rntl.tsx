import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@app/navigation';
import { expectRendersSuccessfully, renderWithProviders } from '@app/test-utils';

import { TermsAndConditionsScreen } from '../TermsAndConditionsScreen';

type TermsAndConditionsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TermsAndConditions'
>;

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
  setParams: jest.fn(),
  addListener: jest.fn(() => () => {}),
  removeListener: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(() => ({
    key: 'TermsAndConditions',
    index: 0,
    routeNames: ['TermsAndConditions'],
    routes: [{ key: 'TermsAndConditions', name: 'TermsAndConditions', params: undefined }],
  })),
} as unknown as TermsAndConditionsNavigationProp;

const mockRoute = {
  key: 'TermsAndConditions',
  name: 'TermsAndConditions' as const,
  params: undefined,
};

describe('TermsAndConditionsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without throwing errors', async () => {
      const result = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );
      expectRendersSuccessfully(result);
    });

    it('renders screen container with testID', async () => {
      const { getByTestId } = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('terms-and-conditions-screen')).toBeOnTheScreen();
    });

    it('renders scroll view container', async () => {
      const { getByTestId } = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('terms-and-conditions-screen')).toBeOnTheScreen();
    });

    it('displays the last updated date', async () => {
      const { getByText } = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText(/25 November 2025/i)).toBeOnTheScreen();
    });
  });

  describe('Content Sections', () => {
    it('displays introduction section heading', async () => {
      const { getByText } = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('1. Introduction')).toBeOnTheScreen();
    });

    it('displays acceptance section heading', async () => {
      const { getByText } = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('2. Acceptance of Terms')).toBeOnTheScreen();
    });

    it('displays user accounts section heading', async () => {
      const { getByText } = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('3. User Accounts')).toBeOnTheScreen();
    });

    it('displays acceptable use section heading', async () => {
      const { getByText } = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('4. Acceptable Use')).toBeOnTheScreen();
    });

    it('displays intellectual property section heading', async () => {
      const { getByText } = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('5. Intellectual Property')).toBeOnTheScreen();
    });

    it('displays limitation of liability section heading', async () => {
      const { getByText } = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('6. Limitation of Liability')).toBeOnTheScreen();
    });

    it('displays termination section heading', async () => {
      const { getByText } = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('7. Termination')).toBeOnTheScreen();
    });

    it('displays governing law section heading', async () => {
      const { getByText } = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('8. Governing Law')).toBeOnTheScreen();
    });

    it('displays changes to terms section heading', async () => {
      const { getByText } = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('9. Changes to Terms')).toBeOnTheScreen();
    });

    it('displays contact section heading', async () => {
      const { getByText } = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('10. Contact Us')).toBeOnTheScreen();
    });
  });

  describe('Accessibility', () => {
    it('has scrollbar accessibility role on container', async () => {
      const { getByTestId } = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      const scrollView = getByTestId('terms-and-conditions-screen');
      expect(scrollView.props.accessibilityRole).toBe('scrollbar');
    });

    it('has descriptive accessibility label on container', async () => {
      const { getByTestId } = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      const scrollView = getByTestId('terms-and-conditions-screen');
      expect(scrollView.props.accessibilityLabel).toBe('Terms and Conditions');
    });
  });

  describe('Theme Support', () => {
    it('renders in light mode', async () => {
      const { getByTestId } = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('terms-and-conditions-screen')).toBeOnTheScreen();
    });

    it('renders in dark mode with dark theme setting', async () => {
      const { getByTestId } = await renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            settings: {
              theme: 'dark',
              language: 'en',
            },
          },
        }
      );

      expect(getByTestId('terms-and-conditions-screen')).toBeOnTheScreen();
    });
  });
});

describe('TermsAndConditionsScreen implementation', () => {
  it('exports TermsAndConditionsScreen as a React component', () => {
    expect(typeof TermsAndConditionsScreen).toBe('function');
    expect(TermsAndConditionsScreen.name).toBe('TermsAndConditionsScreen');
  });
});
