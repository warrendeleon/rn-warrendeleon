import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@app/navigation';
import { renderWithProviders } from '@app/test-utils';

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
    it('renders without crashing', () => {
      const { UNSAFE_root } = renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders the terms and conditions screen with testID', () => {
      const { getByTestId } = renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('terms-and-conditions-screen')).toBeTruthy();
    });

    it('renders scroll view container', () => {
      const { getByTestId } = renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      const scrollView = getByTestId('terms-and-conditions-screen');
      expect(scrollView).toBeTruthy();
    });

    it('renders the last updated date', () => {
      const { getByText } = renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText(/25 November 2025/i)).toBeTruthy();
    });
  });

  describe('Content Sections', () => {
    it('renders introduction section', () => {
      const { getByText } = renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('1. Introduction')).toBeTruthy();
    });

    it('renders acceptance section', () => {
      const { getByText } = renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('2. Acceptance of Terms')).toBeTruthy();
    });

    it('renders user accounts section', () => {
      const { getByText } = renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('3. User Accounts')).toBeTruthy();
    });

    it('renders acceptable use section', () => {
      const { getByText } = renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('4. Acceptable Use')).toBeTruthy();
    });

    it('renders intellectual property section', () => {
      const { getByText } = renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('5. Intellectual Property')).toBeTruthy();
    });

    it('renders limitation of liability section', () => {
      const { getByText } = renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('6. Limitation of Liability')).toBeTruthy();
    });

    it('renders termination section', () => {
      const { getByText } = renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('7. Termination')).toBeTruthy();
    });

    it('renders governing law section', () => {
      const { getByText } = renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('8. Governing Law')).toBeTruthy();
    });

    it('renders changes to terms section', () => {
      const { getByText } = renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('9. Changes to Terms')).toBeTruthy();
    });

    it('renders contact section', () => {
      const { getByText } = renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('10. Contact Us')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility role on scroll view', () => {
      const { getByTestId } = renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      const scrollView = getByTestId('terms-and-conditions-screen');
      expect(scrollView.props.accessibilityRole).toBe('scrollbar');
    });

    it('has proper accessibility label on scroll view', () => {
      const { getByTestId } = renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      const scrollView = getByTestId('terms-and-conditions-screen');
      expect(scrollView.props.accessibilityLabel).toBe('Terms and Conditions');
    });
  });

  describe('Theme Support', () => {
    it('renders correctly in light mode', () => {
      const { getByTestId } = renderWithProviders(
        <TermsAndConditionsScreen navigation={mockNavigation} route={mockRoute} />
      );

      const scrollView = getByTestId('terms-and-conditions-screen');
      expect(scrollView).toBeTruthy();
    });

    it('renders correctly in dark mode', () => {
      const { getByTestId } = renderWithProviders(
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

      const scrollView = getByTestId('terms-and-conditions-screen');
      expect(scrollView).toBeTruthy();
    });
  });
});

describe('TermsAndConditionsScreen implementation', () => {
  it('exports TermsAndConditionsScreen as a React component', () => {
    expect(typeof TermsAndConditionsScreen).toBe('function');
    expect(TermsAndConditionsScreen.name).toBe('TermsAndConditionsScreen');
  });
});
