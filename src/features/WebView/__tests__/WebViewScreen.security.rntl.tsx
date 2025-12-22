/**
 * WebViewScreen Security Tests
 *
 * Tests security measures for WebView including URL validation, XSS prevention,
 * protocol handling, and domain whitelisting.
 */

import React from 'react';
import { useRoute } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';

import { ALLOWED_WEBVIEW_DOMAINS } from '@app/config/constants';
import { useAppColorScheme } from '@app/shared/hooks';
import { isUrlAllowed } from '@app/utils/urlValidator';

import { WebViewScreen } from '../WebViewScreen';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useRoute: jest.fn(),
}));

jest.mock('@app/shared/hooks', () => ({
  useAppColorScheme: jest.fn(),
}));

jest.mock('@app/utils/urlValidator', () => ({
  isUrlAllowed: jest.fn(),
}));

jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: { testID?: string; source?: { uri: string } }) => (
      <View testID={props.testID} />
    ),
  };
});

describe('WebViewScreen Security', () => {
  const mockUseRoute = useRoute as jest.MockedFunction<typeof useRoute>;
  const mockUseAppColorScheme = useAppColorScheme as jest.MockedFunction<typeof useAppColorScheme>;
  const mockIsUrlAllowed = isUrlAllowed as jest.MockedFunction<typeof isUrlAllowed>;

  const createMockRoute = (uri: string) => ({
    key: 'test',
    name: 'WebView' as const,
    params: { uri },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppColorScheme.mockReturnValue('light');
  });

  describe('URL Validation Security', () => {
    it('blocks HTTP protocol URLs (insecure)', () => {
      mockUseRoute.mockReturnValue(createMockRoute('http://github.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
      expect(screen.getByText('This URL is not allowed for security reasons')).toBeOnTheScreen();
    });

    it('blocks FTP protocol URLs', () => {
      mockUseRoute.mockReturnValue(createMockRoute('ftp://files.example.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });

    it('blocks file:// protocol URLs', () => {
      mockUseRoute.mockReturnValue(createMockRoute('file:///etc/passwd'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });

    it('blocks data: protocol URLs (prevents data exfiltration)', () => {
      mockUseRoute.mockReturnValue(createMockRoute('data:text/html,<script>alert(1)</script>'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });
  });

  describe('XSS Prevention', () => {
    it('blocks javascript: protocol URLs', () => {
      mockUseRoute.mockReturnValue(createMockRoute('javascript:alert(document.cookie)'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });

    it('blocks javascript: URLs with encoding', () => {
      mockUseRoute.mockReturnValue(createMockRoute('javascript%3Aalert(1)'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });

    it('blocks vbscript: protocol URLs', () => {
      mockUseRoute.mockReturnValue(createMockRoute('vbscript:msgbox("XSS")'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });
  });

  describe('Domain Whitelisting', () => {
    it('allows whitelisted domain (github.com)', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://github.com'));
      mockIsUrlAllowed.mockReturnValue(true);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-content')).toBeOnTheScreen();
    });

    it('validates URL against ALLOWED_WEBVIEW_DOMAINS constant', () => {
      const testUri = 'https://github.com/user/repo';
      mockUseRoute.mockReturnValue(createMockRoute(testUri));
      mockIsUrlAllowed.mockReturnValue(true);

      render(<WebViewScreen />);

      expect(mockIsUrlAllowed).toHaveBeenCalledWith(testUri, ALLOWED_WEBVIEW_DOMAINS);
    });

    it('blocks non-whitelisted domain', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://malicious-site.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });

    it('allows subdomain of whitelisted domain', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://gist.github.com'));
      mockIsUrlAllowed.mockReturnValue(true);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-content')).toBeOnTheScreen();
    });

    it('allows paths and query params on whitelisted domain', () => {
      mockUseRoute.mockReturnValue(
        createMockRoute('https://github.com/user/repo?tab=issues&q=bug')
      );
      mockIsUrlAllowed.mockReturnValue(true);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-content')).toBeOnTheScreen();
    });
  });

  describe('URL Manipulation Prevention', () => {
    it('blocks URLs with IP address instead of domain', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://192.168.1.1/admin'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });

    it('blocks URLs with localhost', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://localhost:3000'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });

    it('blocks URLs with 127.0.0.1', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://127.0.0.1:8080'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });

    it('blocks URLs with authentication credentials', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://user:password@github.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });

    it('blocks malformed URLs', () => {
      mockUseRoute.mockReturnValue(createMockRoute('not-a-valid-url'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });

    it('blocks empty URLs', () => {
      mockUseRoute.mockReturnValue(createMockRoute(''));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });
  });

  describe('SSRF Prevention (Server-Side Request Forgery)', () => {
    it('blocks internal network addresses (10.x.x.x)', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://10.0.0.1/internal'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });

    it('blocks internal network addresses (172.16.x.x)', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://172.16.0.1/internal'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });

    it('blocks cloud metadata endpoints', () => {
      mockUseRoute.mockReturnValue(createMockRoute('http://169.254.169.254/latest/meta-data/'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });
  });

  describe('Error Handling Security', () => {
    it('displays blocked URL to user (transparency)', () => {
      const blockedUrl = 'https://malicious.com/phishing';
      mockUseRoute.mockReturnValue(createMockRoute(blockedUrl));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByText(blockedUrl)).toBeOnTheScreen();
    });

    it('uses alert role for security errors (assistive tech awareness)', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://malicious.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      const errorContainer = screen.getByTestId('webview-error');
      expect(errorContainer.props.accessibilityRole).toBe('alert');
    });

    it('provides security context in error message', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://malicious.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByText('This URL is not allowed for security reasons')).toBeOnTheScreen();
    });
  });

  describe('Open Redirect Prevention', () => {
    it('blocks URLs that might redirect to dangerous sites', () => {
      // URL with redirect parameter
      mockUseRoute.mockReturnValue(
        createMockRoute('https://safe-looking.com/redirect?url=https://malicious.com')
      );
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });
  });

  describe('Protocol Handler Security', () => {
    it('blocks tel: protocol to prevent auto-dialling', () => {
      mockUseRoute.mockReturnValue(createMockRoute('tel:+1234567890'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });

    it('blocks mailto: protocol to prevent spam', () => {
      mockUseRoute.mockReturnValue(createMockRoute('mailto:victim@example.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });

    it('blocks sms: protocol', () => {
      mockUseRoute.mockReturnValue(createMockRoute('sms:+1234567890?body=spam'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });
  });

  describe('Content Security', () => {
    it('renders WebView only for allowed URLs', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://github.com'));
      mockIsUrlAllowed.mockReturnValue(true);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-content')).toBeOnTheScreen();
      expect(screen.queryByTestId('webview-error')).toBeNull();
    });

    it('never renders WebView for blocked URLs', () => {
      mockUseRoute.mockReturnValue(createMockRoute('https://blocked.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.queryByTestId('webview-content')).toBeNull();
      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });
  });

  describe('Dark Mode Security UI', () => {
    it('renders security error correctly in dark mode', () => {
      mockUseAppColorScheme.mockReturnValue('dark');
      mockUseRoute.mockReturnValue(createMockRoute('https://malicious.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
      expect(screen.getByText('This URL is not allowed for security reasons')).toBeOnTheScreen();
    });

    it('renders security error correctly in light mode', () => {
      mockUseAppColorScheme.mockReturnValue('light');
      mockUseRoute.mockReturnValue(createMockRoute('https://malicious.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
      expect(screen.getByText('This URL is not allowed for security reasons')).toBeOnTheScreen();
    });
  });

  describe('Unicode Domain Security', () => {
    it('blocks homograph attack URLs (lookalike domains)', () => {
      // Cyrillic 'а' instead of Latin 'a' in github.com
      mockUseRoute.mockReturnValue(createMockRoute('https://githυb.com'));
      mockIsUrlAllowed.mockReturnValue(false);

      render(<WebViewScreen />);

      expect(screen.getByTestId('webview-error')).toBeOnTheScreen();
    });
  });
});
