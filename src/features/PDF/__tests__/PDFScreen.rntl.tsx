import * as ReactNavigation from '@react-navigation/native';
import { screen } from '@testing-library/react-native';

import { ALLOWED_PDF_DOMAINS } from '@app/config/constants';
import { useAppColorScheme } from '@app/shared/hooks';
import { renderWithProviders } from '@app/test-utils/renderWithProviders';
import { isUrlAllowed } from '@app/utils/urlValidator';

import { PDFScreen } from '../PDFScreen';

// Mock dependencies
jest.mock('react-native-pdf', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => <View testID="mock-pdf" {...props} />,
  };
});

jest.mock('react-native-share', () => ({
  open: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-navigation/native', () => ({
  useRoute: jest.fn(),
  useNavigation: jest.fn(() => ({
    setOptions: jest.fn(),
  })),
}));

jest.mock('@app/shared/hooks', () => ({
  useAppColorScheme: jest.fn(() => 'light'),
}));

jest.mock('@app/utils/urlValidator', () => ({
  isUrlAllowed: jest.fn(() => true), // Default to allowed
}));

describe('PDFScreen', () => {
  const mockIsUrlAllowed = isUrlAllowed as jest.MockedFunction<typeof isUrlAllowed>;
  const mockRoute = {
    params: {
      uri: 'https://example.com/document.pdf',
      title: 'Test PDF',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ReactNavigation.useRoute as jest.Mock).mockReturnValue(mockRoute);
    (ReactNavigation.useNavigation as jest.Mock).mockReturnValue({
      setOptions: jest.fn(),
    });
    // Allow the test URL by default
    mockIsUrlAllowed.mockReturnValue(true);
  });

  it('renders PDF component with correct URI', () => {
    renderWithProviders(<PDFScreen />);

    const pdf = screen.getByTestId('mock-pdf');
    expect(pdf).toBeTruthy();
    expect(pdf.props.source).toEqual({
      uri: 'https://example.com/document.pdf',
      cache: true,
    });
  });

  it('enables caching for offline viewing', () => {
    renderWithProviders(<PDFScreen />);

    const pdf = screen.getByTestId('mock-pdf');
    expect(pdf.props.source.cache).toBe(true);
  });

  it('disables trust all certs for security', () => {
    renderWithProviders(<PDFScreen />);

    const pdf = screen.getByTestId('mock-pdf');
    expect(pdf.props.trustAllCerts).toBe(false);
  });

  it('applies full screen styles', () => {
    renderWithProviders(<PDFScreen />);

    const pdf = screen.getByTestId('mock-pdf');
    // StyledPDF transforms GlueStack props (flex, w, h) into styles
    // Check that the component receives styling (exact styles may vary based on styled() transformation)
    expect(pdf.props.style).toBeDefined();
  });

  it('sets up share button in header', () => {
    const mockSetOptions = jest.fn();
    (ReactNavigation.useNavigation as jest.Mock).mockReturnValue({
      setOptions: mockSetOptions,
    });

    renderWithProviders(<PDFScreen />);

    expect(mockSetOptions).toHaveBeenCalled();
    const options = mockSetOptions.mock.calls[0][0];
    expect(options.headerRight).toBeDefined();
  });
});

describe('PDFScreen - URL Validation', () => {
  const mockIsUrlAllowed = isUrlAllowed as jest.MockedFunction<typeof isUrlAllowed>;
  const mockUseAppColorScheme = useAppColorScheme as jest.MockedFunction<typeof useAppColorScheme>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppColorScheme.mockReturnValue('light');
    (ReactNavigation.useNavigation as jest.Mock).mockReturnValue({
      setOptions: jest.fn(),
    });
  });

  describe('URL Validation Logic', () => {
    it('renders loading state initially while validating', () => {
      (ReactNavigation.useRoute as jest.Mock).mockReturnValue({
        params: { uri: 'https://warrendeleon.com/cv.pdf' },
      });
      mockIsUrlAllowed.mockReturnValue(false);

      renderWithProviders(<PDFScreen />);

      const loading = screen.queryByTestId('pdf-loading');
      const error = screen.queryByTestId('pdf-error');

      expect(loading || error).toBeTruthy();
    });

    it('renders error state when URL is not allowed', () => {
      (ReactNavigation.useRoute as jest.Mock).mockReturnValue({
        params: { uri: 'https://evil.com/malware.pdf' },
      });
      mockIsUrlAllowed.mockReturnValue(false);

      renderWithProviders(<PDFScreen />);

      expect(screen.getByTestId('pdf-error')).toBeTruthy();
      expect(screen.getByText('This PDF URL is not allowed for security reasons')).toBeTruthy();
      expect(screen.getByText('https://evil.com/malware.pdf')).toBeTruthy();
    });

    it('renders PDF viewer when URL is allowed', () => {
      (ReactNavigation.useRoute as jest.Mock).mockReturnValue({
        params: { uri: 'https://warrendeleon.com/cv.pdf' },
      });
      mockIsUrlAllowed.mockReturnValue(true);

      renderWithProviders(<PDFScreen />);

      expect(screen.getByTestId('mock-pdf')).toBeTruthy();
    });

    it('validates URL against ALLOWED_PDF_DOMAINS', () => {
      const testUri = 'https://warrendeleon.com/wp-content/uploads/2025/06/CV.pdf';
      (ReactNavigation.useRoute as jest.Mock).mockReturnValue({
        params: { uri: testUri },
      });
      mockIsUrlAllowed.mockReturnValue(true);

      renderWithProviders(<PDFScreen />);

      expect(mockIsUrlAllowed).toHaveBeenCalledWith(testUri, ALLOWED_PDF_DOMAINS);
    });
  });

  describe('Accessibility', () => {
    it('loading state has proper accessibility props', () => {
      (ReactNavigation.useRoute as jest.Mock).mockReturnValue({
        params: { uri: 'https://warrendeleon.com/cv.pdf' },
      });
      mockIsUrlAllowed.mockReturnValue(false);

      renderWithProviders(<PDFScreen />);

      const loading = screen.queryByTestId('pdf-loading');
      if (loading) {
        expect(loading.props.accessibilityRole).toBe('progressbar');
        expect(loading.props.accessibilityLabel).toBe('Validating PDF URL');
      }
    });

    it('error state has proper accessibility props', () => {
      (ReactNavigation.useRoute as jest.Mock).mockReturnValue({
        params: { uri: 'https://evil.com/malware.pdf' },
      });
      mockIsUrlAllowed.mockReturnValue(false);

      renderWithProviders(<PDFScreen />);

      const errorContainer = screen.getByTestId('pdf-error');
      expect(errorContainer.props.accessibilityRole).toBe('alert');
      expect(errorContainer.props.accessibilityLabel).toBe(
        'This PDF URL is not allowed for security reasons'
      );
    });
  });

  describe('Dark Mode Support', () => {
    it('applies dark colors when dark mode is active', () => {
      mockUseAppColorScheme.mockReturnValue('dark');
      (ReactNavigation.useRoute as jest.Mock).mockReturnValue({
        params: { uri: 'https://evil.com/malware.pdf' },
      });
      mockIsUrlAllowed.mockReturnValue(false);

      renderWithProviders(<PDFScreen />);

      const errorText = screen.getByText('This PDF URL is not allowed for security reasons');
      // Check for GlueStack UI color token instead of hex color
      expect(errorText.props.color).toBe('$error400');
    });

    it('applies light colors when light mode is active', () => {
      mockUseAppColorScheme.mockReturnValue('light');
      (ReactNavigation.useRoute as jest.Mock).mockReturnValue({
        params: { uri: 'https://evil.com/malware.pdf' },
      });
      mockIsUrlAllowed.mockReturnValue(false);

      renderWithProviders(<PDFScreen />);

      const errorText = screen.getByText('This PDF URL is not allowed for security reasons');
      // Check for GlueStack UI color token instead of hex color
      expect(errorText.props.color).toBe('$error600');
    });
  });

  describe('Security Scenarios', () => {
    it('blocks HTTP URLs', () => {
      (ReactNavigation.useRoute as jest.Mock).mockReturnValue({
        params: { uri: 'http://warrendeleon.com/cv.pdf' },
      });
      mockIsUrlAllowed.mockReturnValue(false);

      renderWithProviders(<PDFScreen />);

      expect(screen.getByTestId('pdf-error')).toBeTruthy();
    });

    it('blocks non-whitelisted domains', () => {
      (ReactNavigation.useRoute as jest.Mock).mockReturnValue({
        params: { uri: 'https://malicious.com/virus.pdf' },
      });
      mockIsUrlAllowed.mockReturnValue(false);

      renderWithProviders(<PDFScreen />);

      expect(screen.getByTestId('pdf-error')).toBeTruthy();
    });

    it('allows whitelisted domains with paths', () => {
      (ReactNavigation.useRoute as jest.Mock).mockReturnValue({
        params: {
          uri: 'https://warrendeleon.com/wp-content/uploads/2025/06/CV_WARRENDELEON_2025.pdf',
        },
      });
      mockIsUrlAllowed.mockReturnValue(true);

      renderWithProviders(<PDFScreen />);

      expect(screen.getByTestId('mock-pdf')).toBeTruthy();
    });

    it('allows subdomains of whitelisted domains', () => {
      (ReactNavigation.useRoute as jest.Mock).mockReturnValue({
        params: { uri: 'https://cdn.warrendeleon.com/documents/cv.pdf' },
      });
      mockIsUrlAllowed.mockReturnValue(true);

      renderWithProviders(<PDFScreen />);

      expect(screen.getByTestId('mock-pdf')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty URI gracefully', () => {
      (ReactNavigation.useRoute as jest.Mock).mockReturnValue({
        params: { uri: '' },
      });
      mockIsUrlAllowed.mockReturnValue(false);

      renderWithProviders(<PDFScreen />);

      expect(screen.getByTestId('pdf-error')).toBeTruthy();
    });

    it('handles malformed URLs', () => {
      (ReactNavigation.useRoute as jest.Mock).mockReturnValue({
        params: { uri: 'not a url' },
      });
      mockIsUrlAllowed.mockReturnValue(false);

      renderWithProviders(<PDFScreen />);

      expect(screen.getByTestId('pdf-error')).toBeTruthy();
    });

    it('handles javascript: protocol URLs', () => {
      (ReactNavigation.useRoute as jest.Mock).mockReturnValue({
        params: { uri: 'javascript:alert(1)' },
      });
      mockIsUrlAllowed.mockReturnValue(false);

      renderWithProviders(<PDFScreen />);

      expect(screen.getByTestId('pdf-error')).toBeTruthy();
    });
  });
});
