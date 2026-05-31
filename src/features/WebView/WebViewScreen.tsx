import React, { useEffect, useState } from 'react';
import RNWebView from 'react-native-webview';
import { type RouteProp, useRoute } from '@react-navigation/native';

import { Box } from '@app/components/ui/box';
import { Spinner } from '@app/components/ui/spinner';
import { Text } from '@app/components/ui/text';
import { ALLOWED_WEBVIEW_DOMAINS } from '@app/config/constants';
import type { RootStackParamList } from '@app/navigation';
import { useAppColorScheme } from '@app/shared/hooks';
import { isUrlAllowed } from '@app/utils/urlValidator';

type WebViewScreenRouteProp = RouteProp<RootStackParamList, 'WebView'>;

export const WebViewScreen = () => {
  const route = useRoute<WebViewScreenRouteProp>();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const [isValidUrl, setIsValidUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const url = route.params.uri;

  useEffect(() => {
    if (isUrlAllowed(url, ALLOWED_WEBVIEW_DOMAINS)) {
      setIsValidUrl(true);
    } else {
      setError('This URL is not allowed for security reasons');
    }
  }, [url]);

  // Inject BEFORE page loads to set dark mode
  const injectedJavaScriptBeforeContentLoaded = isDark
    ? `
    (function() {
      // Set data attributes on document element
      if (document.documentElement) {
        document.documentElement.setAttribute('data-color-mode', 'dark');
        document.documentElement.setAttribute('data-dark-theme', 'dark');
        document.documentElement.setAttribute('data-light-theme', 'light');
      }
    })();
    true;
  `
    : 'true;';

  // Inject AFTER page loads to apply CSS overrides
  const injectedJavaScript = isDark
    ? `
    (function() {
      // Ensure data attributes are set
      document.documentElement.setAttribute('data-color-mode', 'dark');
      document.documentElement.setAttribute('data-dark-theme', 'dark');

      // Inject CSS to force dark mode
      const style = document.createElement('style');
      style.id = 'webview-dark-mode';
      style.textContent = \`
        :root {
          color-scheme: dark !important;
        }
        body {
          background-color: #0d1117 !important;
          color: #c9d1d9 !important;
        }
        * {
          color-scheme: dark !important;
        }
      \`;

      // Remove if already exists
      const existing = document.getElementById('webview-dark-mode');
      if (existing) existing.remove();

      document.head.appendChild(style);
    })();
    true;
  `
    : 'true;';

  // Show loading state while validating
  if (!isValidUrl && !error) {
    return (
      <Box
        className="flex-1 items-center justify-center p-5"
        testID="webview-loading"
        accessibilityRole="progressbar"
        accessibilityLabel="Validating URL"
      >
        <Spinner size="large" color={isDark ? '#FFFFFF' : '#000000'} />
        <Text
          className="mt-4 text-center text-base"
          style={{ color: isDark ? '#FFFFFF' : '#000000' }}
        >
          Validating URL...
        </Text>
      </Box>
    );
  }

  // Show error state if URL is not allowed
  if (error) {
    return (
      <Box
        className="flex-1 items-center justify-center p-5"
        testID="webview-error"
        accessibilityRole="alert"
        accessibilityLabel={error}
      >
        <Text
          className="mb-3 text-center text-lg font-semibold"
          style={{ color: isDark ? '#f87171' : '#dc2626' }}
        >
          {error}
        </Text>
        <Text
          className="text-center text-sm italic"
          style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
        >
          {url}
        </Text>
      </Box>
    );
  }

  // Render WebView only if URL is valid
  return (
    <RNWebView
      source={{ uri: url }}
      forceDarkOn={isDark}
      injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
      injectedJavaScript={injectedJavaScript}
      style={{ backgroundColor: isDark ? '#000000' : '#FFFFFF' }}
      testID="webview-content"
      accessible={true}
      accessibilityLabel="Web content loaded"
    />
  );
};
