import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@app/navigation';
import { renderWithProviders } from '@app/test-utils';

import { PrivacyPolicyScreen } from '../PrivacyPolicyScreen';

type PrivacyPolicyNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PrivacyPolicy'>;

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
    key: 'PrivacyPolicy',
    index: 0,
    routeNames: ['PrivacyPolicy'],
    routes: [{ key: 'PrivacyPolicy', name: 'PrivacyPolicy', params: undefined }],
  })),
} as unknown as PrivacyPolicyNavigationProp;

const mockRoute = {
  key: 'PrivacyPolicy',
  name: 'PrivacyPolicy' as const,
  params: undefined,
};

describe('PrivacyPolicyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { UNSAFE_root } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders the privacy policy screen with testID', () => {
      const { getByTestId } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('privacy-policy-screen')).toBeTruthy();
    });

    it('renders scroll view container', () => {
      const { getByTestId } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      const scrollView = getByTestId('privacy-policy-screen');
      expect(scrollView).toBeTruthy();
    });

    it('renders the last updated date', () => {
      const { getByText } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText(/25 November 2025/i)).toBeTruthy();
    });
  });

  describe('Content Sections', () => {
    it('renders introduction section', () => {
      const { getByText } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('1. Introduction')).toBeTruthy();
    });

    it('renders data collection section', () => {
      const { getByText } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('2. Information We Collect')).toBeTruthy();
    });

    it('renders data use section', () => {
      const { getByText } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('3. How We Use Your Information')).toBeTruthy();
    });

    it('renders legal basis (GDPR) section', () => {
      const { getByText } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('4. Legal Basis for Processing')).toBeTruthy();
    });

    it('renders data sharing section', () => {
      const { getByText } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText(/5\. /)).toBeTruthy();
    });

    it('renders data retention section', () => {
      const { getByText } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('6. Data Retention')).toBeTruthy();
    });

    it('renders your rights (GDPR) section', () => {
      const { getByText } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('7. Your Data Protection Rights')).toBeTruthy();
    });

    it('renders international transfers section', () => {
      const { getByText } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('8. International Data Transfers')).toBeTruthy();
    });

    it('renders security section', () => {
      const { getByText } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('9. Data Security')).toBeTruthy();
    });

    it("renders children's privacy section", () => {
      const { getByText } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText("10. Children's Privacy")).toBeTruthy();
    });

    it('renders changes to policy section', () => {
      const { getByText } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('11. Changes to This Policy')).toBeTruthy();
    });

    it('renders contact section', () => {
      const { getByText } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('12. Contact Us')).toBeTruthy();
    });
  });

  describe('GDPR Compliance', () => {
    it('renders GDPR-specific sections', () => {
      const { getByText } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('4. Legal Basis for Processing')).toBeTruthy();
      expect(getByText('7. Your Data Protection Rights')).toBeTruthy();
      expect(getByText('8. International Data Transfers')).toBeTruthy();
    });

    it('renders GDPR rights bullet points', () => {
      const { getByText } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText(/Right of Access:/)).toBeTruthy();
      expect(getByText(/Right to Rectification:/)).toBeTruthy();
      expect(getByText(/Right to Erasure:/)).toBeTruthy();
      expect(getByText(/Right to Restriction:/)).toBeTruthy();
      expect(getByText(/Right to Data Portability:/)).toBeTruthy();
      expect(getByText(/Right to Object:/)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility role on scroll view', () => {
      const { getByTestId } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      const scrollView = getByTestId('privacy-policy-screen');
      expect(scrollView.props.accessibilityRole).toBe('scrollbar');
    });

    it('has proper accessibility label on scroll view', () => {
      const { getByTestId } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      const scrollView = getByTestId('privacy-policy-screen');
      expect(scrollView.props.accessibilityLabel).toBe('Privacy Policy');
    });
  });

  describe('Theme Support', () => {
    it('renders correctly in light mode', () => {
      const { getByTestId } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />
      );

      const scrollView = getByTestId('privacy-policy-screen');
      expect(scrollView).toBeTruthy();
    });

    it('renders correctly in dark mode', () => {
      const { getByTestId } = renderWithProviders(
        <PrivacyPolicyScreen navigation={mockNavigation} route={mockRoute} />,
        {
          preloadedState: {
            settings: {
              theme: 'dark',
              language: 'en',
            },
          },
        }
      );

      const scrollView = getByTestId('privacy-policy-screen');
      expect(scrollView).toBeTruthy();
    });
  });
});

describe('PrivacyPolicyScreen implementation', () => {
  it('exports PrivacyPolicyScreen as a React component', () => {
    expect(typeof PrivacyPolicyScreen).toBe('function');
    expect(PrivacyPolicyScreen.name).toBe('PrivacyPolicyScreen');
  });
});
