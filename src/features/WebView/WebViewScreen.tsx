import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import RNWebView from 'react-native-webview';
import { Box, Spinner, Text } from '@gluestack-ui/themed';
import { type RouteProp, useRoute } from '@react-navigation/native';

import { ALLOWED_WEBVIEW_DOMAINS } from '@app/config/constants';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';
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
        style={styles.centerContainer}
        testID="webview-loading"
        accessibilityRole="progressbar"
        accessibilityLabel="Validating URL"
      >
        <Spinner size="large" color={isDark ? '$white' : '$black'} />
        <Text style={[styles.messageText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Validating URL...
        </Text>
      </Box>
    );
  }

  // Show error state if URL is not allowed
  if (error) {
    return (
      <Box
        style={styles.centerContainer}
        testID="webview-error"
        accessibilityRole="alert"
        accessibilityLabel={error}
      >
        <Text style={[styles.errorText, { color: isDark ? '#FF6B6B' : '#D32F2F' }]}>{error}</Text>
        <Text style={[styles.urlText, { color: isDark ? '#C9D1D9' : '#555555' }]}>{url}</Text>
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
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  urlText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
