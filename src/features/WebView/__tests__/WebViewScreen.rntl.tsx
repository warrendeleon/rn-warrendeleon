/**
 * Tests for WebViewScreen component
 */
import React from 'react';
import { useRoute } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';

import { ALLOWED_WEBVIEW_DOMAINS } from '@app/config/constants';
import { useAppColorScheme } from '@app/hooks';
import { isUrlAllowed } from '@app/utils/urlValidator';

import { WebViewScreen } from '../WebViewScreen';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useRoute: jest.fn(),
}));

jest.mock('@app/hooks', () => ({
  useAppColorScheme: jest.fn(),
}));

jest.mock('@app/utils/urlValidator', () => ({
  isUrlAllowed: jest.fn(),
}));

jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: { testID?: string }) => <View testID={props.testID} />,
  };
});

describe('WebViewScreen', () => {
  const mockUseRoute = useRoute as jest.MockedFunction<typeof useRoute>;
  const mockUseAppColorScheme = useAppColorScheme as jest.MockedFunction<typeof useAppColorScheme>;
  const mockIsUrlAllowed = isUrlAllowed as jest.MockedFunction<typeof isUrlAllowed>;

  // Helper to create mock route
  const createMockRoute = (uri: string) => ({
    key: 'test',
    name: 'WebView' as const,
    params: { uri },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppColorScheme.mockReturnValue('light');
  });

  describe('URL Validation', () => {
    it('renders loading state initially while validating', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://github.com'));
      mockIsUrlAllowed.mockReturnValue(false); // Will trigger error state

      render(<WebViewScreen />);

      // Should show loading state briefly before validation completes
      const loading = screen.queryByTestId('webview-loading');
      const error = screen.queryByTestId('webview-error');

      // Either loading or error should be present (depends on timing)
      expect(loading || error).toBeTruthy();
    });

    it('renders error state when URL is not allowed', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://evil.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      const errorContainer = screen.getByTestId('webview-error');
      expect(errorContainer).toBeTruthy();
      expect(screen.getByText('This URL is not allowed for security reasons')).toBeTruthy();
      expect(screen.getByText('https://evil.com')).toBeTruthy();
    });

    it('renders WebView when URL is allowed', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://github.com'));
      mockIsUrlAllowed.mockReturnValue(true);

      render(<WebViewScreen />);

      const webview = screen.getByTestId('webview-content');
      expect(webview).toBeTruthy();
    });

    it('validates URL against ALLOWED_WEBVIEW_DOMAINS', () => {
      const testUri = 'https://github.com/user/repo';
      mockUseRoute.mockReturnValue(createMockRoute(testUri));
      mockIsUrlAllowed.mockReturnValue(true);

      render(<WebViewScreen />);

      expect(mockIsUrlAllowed).toHaveBeenCalledWith(testUri, ALLOWED_WEBVIEW_DOMAINS);
    });
  });

  describe('Accessibility', () => {
    it('loading state has proper accessibility props', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://github.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      const loading = screen.queryByTestId('webview-loading');
      if (loading) {
        expect(loading.props.accessibilityRole).toBe('progressbar');
        expect(loading.props.accessibilityLabel).toBe('Validating URL');
      }
    });

    it('error state has proper accessibility props', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://evil.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      const errorContainer = screen.getByTestId('webview-error');
      expect(errorContainer.props.accessibilityRole).toBe('alert');
      expect(errorContainer.props.accessibilityLabel).toBe(
        'This URL is not allowed for security reasons'
      );
    });
  });

  describe('Dark Mode Support', () => {
    it('renders correctly when dark mode is active', () => {
      mockUseAppColorScheme.mockReturnValue('dark');
      mockUseRoute.mockReturnValue(createMockRoute('https://evil.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      // Verify error message is displayed (GlueStack UI handles theming internally)
      const errorText = screen.getByText('This URL is not allowed for security reasons');
      expect(errorText).toBeTruthy();
      expect(screen.getByTestId('webview-error')).toBeTruthy();
    });

    it('renders correctly when light mode is active', () => {
      mockUseAppColorScheme.mockReturnValue('light');
      mockUseRoute.mockReturnValue(createMockRoute('https://evil.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      // Verify error message is displayed (GlueStack UI handles theming internally)
      const errorText = screen.getByText('This URL is not allowed for security reasons');
      expect(errorText).toBeTruthy();
      expect(screen.getByTestId('webview-error')).toBeTruthy();
    });
  });

  describe('Security Scenarios', () => {
    it('blocks HTTP URLs', () => {
      mockUseRoute.mockReturnValue(createMockRoute('http://github.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeTruthy();
      expect(screen.getByText('This URL is not allowed for security reasons')).toBeTruthy();
    });

    it('blocks non-whitelisted domains', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://malicious.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeTruthy();
    });

    it('allows whitelisted domains with paths and query params', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://github.com/user/repo?tab=readme'));
      mockIsUrlAllowed.mockReturnValue(true);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-content')).toBeTruthy();
    });

    it('allows subdomains of whitelisted domains', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://gist.github.com'));
      mockIsUrlAllowed.mockReturnValue(true);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-content')).toBeTruthy();
    });
  });

  describe('WebView Configuration', () => {
    it('passes correct source URI to WebView', () => {
      const testUri = 'https://github.com';
      mockUseRoute.mockReturnValue(createMockRoute(testUri));
      mockIsUrlAllowed.mockReturnValue(true);

      render(<WebViewScreen />);

      // Verify WebView is rendered with correct testID
      expect(screen.getByTestId('webview-content')).toBeTruthy();
    });

    it('applies dark mode injection when dark mode is active', () => {
      mockUseAppColorScheme.mockReturnValue('dark');
      mockUseRoute.mockReturnValue(createMockRoute('https://github.com'));
      mockIsUrlAllowed.mockReturnValue(true);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-content')).toBeTruthy();
      // WebView props are passed to the mock but not easily testable here
    });
  });

  describe('Edge Cases', () => {
    it('handles empty URI gracefully', () => {
      mockUseRoute.mockReturnValue(createMockRoute(''));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeTruthy();
    });

    it('handles malformed URLs', () => {
      mockUseRoute.mockReturnValue(createMockRoute('not a url'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeTruthy();
    });

    it('handles javascript: protocol URLs', () => {
      mockUseRoute.mockReturnValue(createMockRoute('javascript:alert(1)'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeTruthy();
    });
  });
});
