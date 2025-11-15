import React from 'react';
import RNWebView from 'react-native-webview';
import { type RouteProp, useRoute } from '@react-navigation/native';

import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';

type WebViewScreenRouteProp = RouteProp<RootStackParamList, 'WebView'>;

export const WebViewScreen = () => {
  const route = useRoute<WebViewScreenRouteProp>();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

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

  return (
    <RNWebView
      source={{ uri: route.params.uri }}
      forceDarkOn={isDark}
      injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
      injectedJavaScript={injectedJavaScript}
      style={{ backgroundColor: isDark ? '#000000' : '#FFFFFF' }}
    />
  );
};
