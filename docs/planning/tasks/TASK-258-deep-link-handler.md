# TASK-258: Deep Link Handler for Password Reset

**ID**: TASK-258 | **Epic**: [EPIC-024](../epics/EPIC-024-password-recovery.md) | **User Story**: [US-045](../stories/US-045-reset-password-with-token.md)
**Status**: ⏳ In Progress | **Effort**: 1.5h

---

## File Structure

```
src/utils/
└── navigation/
    ├── deepLink.ts
    └── __tests__/
        ├── deepLink.test.ts
        └── deepLink.integration.test.ts
```

**Note**: Deep link handling is a **correctly centralized** generic utility. While currently used for password reset, deep links are also used for email verification (TASK-200), magic links (TASK-218), and potentially other features. This cross-cutting navigation concern belongs in `/src/utils/navigation/`.

---

## Task Description

Implement deep link handling for password reset URLs. Parse reset token from email link, configure iOS/Android URL schemes, and navigate to ResetPasswordScreen with token parameter.

---

## Acceptance Criteria

- [ ] Deep link utility created in `src/utils/navigation/deepLink.ts`
- [ ] iOS URL scheme configured
- [ ] Android intent filter configured
- [ ] Parse password reset URLs
- [ ] Extract token from URL query parameters
- [ ] Navigate to ResetPasswordScreen with token
- [ ] Handle invalid/malformed URLs
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Deep Link Service

```typescript
// src/utils/navigation/deepLink.ts

import { Linking } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';

export interface DeepLinkConfig {
  scheme: string;
  hostname: string;
}

export interface ParsedDeepLink {
  screen: string;
  params: Record<string, any>;
}

// App deep link configuration
const DEEP_LINK_CONFIG: DeepLinkConfig = {
  scheme: 'warrendeleon', // Your app's URL scheme
  hostname: 'app',
};

/**
 * Parse deep link URL and extract screen + params
 *
 * Supported URLs:
 * - warrendeleon://app/reset-password?token=abc123
 * - https://warrendeleon.com/reset-password?token=abc123
 *
 * @param url - Deep link URL
 * @returns Parsed screen and params, or null if invalid
 */
export const parseDeepLink = (url: string): ParsedDeepLink | null => {
  try {
    const parsedUrl = new URL(url);

    // Check if URL is for our app
    const isAppScheme = parsedUrl.protocol === `${DEEP_LINK_CONFIG.scheme}:`;
    const isWebScheme = parsedUrl.protocol === 'https:';

    if (!isAppScheme && !isWebScheme) {
      console.warn('Unsupported URL scheme:', parsedUrl.protocol);
      return null;
    }

    // Extract pathname (e.g., "/reset-password")
    const pathname = parsedUrl.pathname.replace(/^\//, ''); // Remove leading slash

    // Extract query parameters
    const params: Record<string, string> = {};
    parsedUrl.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Map pathname to screen name
    const screenMap: Record<string, string> = {
      'reset-password': 'ResetPassword',
      'verify-email': 'VerifyEmail',
      'magic-link': 'MagicLink',
    };

    const screen = screenMap[pathname];

    if (!screen) {
      console.warn('Unknown deep link path:', pathname);
      return null;
    }

    return { screen, params };
  } catch (error) {
    console.error('Failed to parse deep link:', error);
    return null;
  }
};

/**
 * Handle deep link navigation
 *
 * @param url - Deep link URL
 * @param navigationRef - Navigation container ref
 */
export const handleDeepLink = (
  url: string,
  navigationRef: React.RefObject<NavigationContainerRef<any>>
): void => {
  const parsed = parseDeepLink(url);

  if (!parsed) {
    console.warn('Failed to parse deep link:', url);
    return;
  }

  const { screen, params } = parsed;

  // Navigate to screen with params
  if (navigationRef.current) {
    navigationRef.current.navigate(screen as never, params as never);
  } else {
    console.warn('Navigation ref not ready');
  }
};

/**
 * Initialize deep link listener
 *
 * @param navigationRef - Navigation container ref
 * @returns Cleanup function to remove listener
 */
export const initializeDeepLinkListener = (
  navigationRef: React.RefObject<NavigationContainerRef<any>>
): (() => void) => {
  // Handle initial URL (app opened from deep link)
  Linking.getInitialURL().then(url => {
    if (url) {
      console.log('Initial deep link URL:', url);
      handleDeepLink(url, navigationRef);
    }
  });

  // Handle URL events (app already open)
  const subscription = Linking.addEventListener('url', event => {
    console.log('Deep link URL event:', event.url);
    handleDeepLink(event.url, navigationRef);
  });

  // Return cleanup function
  return () => {
    subscription.remove();
  };
};

/**
 * Build password reset deep link URL
 * (For testing purposes)
 *
 * @param token - Reset token
 * @returns Deep link URL
 */
export const buildPasswordResetUrl = (token: string): string => {
  return `${DEEP_LINK_CONFIG.scheme}://${DEEP_LINK_CONFIG.hostname}/reset-password?token=${encodeURIComponent(token)}`;
};

/**
 * Build web password reset URL
 * (For email templates)
 *
 * @param token - Reset token
 * @returns Web URL that redirects to deep link
 */
export const buildPasswordResetWebUrl = (token: string): string => {
  return `https://warrendeleon.com/reset-password?token=${encodeURIComponent(token)}`;
};
```

---

### App Integration

```typescript
// App.tsx - Add deep link initialization

import React, { useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { initializeDeepLinkListener } from '@app/utils/navigation/deepLink';

export const App: React.FC = () => {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    // Initialize deep link listener
    const cleanup = initializeDeepLinkListener(navigationRef);

    // Cleanup on unmount
    return cleanup;
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      {/* Your navigation structure */}
    </NavigationContainer>
  );
};
```

---

### iOS Configuration

```xml
<!-- ios/warrendeleon/Info.plist -->

<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLName</key>
    <string>com.warrendeleon</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>warrendeleon</string>
    </array>
  </dict>
</array>

<!-- Universal Links (for https:// URLs) -->
<key>com.apple.developer.associated-domains</key>
<array>
  <string>applinks:warrendeleon.com</string>
</array>
```

---

### Android Configuration

```xml
<!-- android/app/src/main/AndroidManifest.xml -->

<activity
  android:name=".MainActivity"
  android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode"
  android:launchMode="singleTask"
  android:windowSoftInputMode="adjustResize">

  <intent-filter>
    <action android:name="android.intent.action.MAIN" />
    <category android:name="android.intent.category.LAUNCHER" />
  </intent-filter>

  <!-- Deep link intent filter -->
  <intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />

    <!-- Custom scheme -->
    <data android:scheme="warrendeleon" android:host="app" />

    <!-- Web URLs (App Links) -->
    <data
      android:scheme="https"
      android:host="warrendeleon.com"
      android:pathPrefix="/reset-password" />
  </intent-filter>
</activity>
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/utils/navigation/__tests__/deepLink.test.ts

import { parseDeepLink, buildPasswordResetUrl, buildPasswordResetWebUrl } from '../deepLink';

describe('deepLinkService', () => {
  describe('parseDeepLink', () => {
    it('should parse password reset deep link with custom scheme', () => {
      const url = 'warrendeleon://app/reset-password?token=abc123';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        screen: 'ResetPassword',
        params: { token: 'abc123' },
      });
    });

    it('should parse password reset deep link with https scheme', () => {
      const url = 'https://warrendeleon.com/reset-password?token=abc123';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        screen: 'ResetPassword',
        params: { token: 'abc123' },
      });
    });

    it('should parse URL with multiple query parameters', () => {
      const url = 'warrendeleon://app/reset-password?token=abc123&source=email&lang=en';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        screen: 'ResetPassword',
        params: {
          token: 'abc123',
          source: 'email',
          lang: 'en',
        },
      });
    });

    it('should handle URL-encoded tokens', () => {
      const encodedToken = encodeURIComponent('token+with/special=chars');
      const url = `warrendeleon://app/reset-password?token=${encodedToken}`;
      const result = parseDeepLink(url);

      expect(result?.params.token).toBe('token+with/special=chars');
    });

    it('should return null for unsupported scheme', () => {
      const url = 'ftp://example.com/reset-password?token=abc123';
      const result = parseDeepLink(url);

      expect(result).toBeNull();
    });

    it('should return null for unknown path', () => {
      const url = 'warrendeleon://app/unknown-path?token=abc123';
      const result = parseDeepLink(url);

      expect(result).toBeNull();
    });

    it('should return null for malformed URL', () => {
      const url = 'not-a-valid-url';
      const result = parseDeepLink(url);

      expect(result).toBeNull();
    });

    it('should handle URL without query parameters', () => {
      const url = 'warrendeleon://app/reset-password';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        screen: 'ResetPassword',
        params: {},
      });
    });

    it('should handle verify-email path', () => {
      const url = 'warrendeleon://app/verify-email?token=verification123';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        screen: 'VerifyEmail',
        params: { token: 'verification123' },
      });
    });

    it('should handle magic-link path', () => {
      const url = 'warrendeleon://app/magic-link?token=magic456';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        screen: 'MagicLink',
        params: { token: 'magic456' },
      });
    });
  });

  describe('buildPasswordResetUrl', () => {
    it('should build valid deep link URL', () => {
      const token = 'abc123';
      const url = buildPasswordResetUrl(token);

      expect(url).toBe('warrendeleon://app/reset-password?token=abc123');
    });

    it('should encode special characters in token', () => {
      const token = 'token+with/special=chars';
      const url = buildPasswordResetUrl(token);

      expect(url).toContain('token%2Bwith%2Fspecial%3Dchars');
    });
  });

  describe('buildPasswordResetWebUrl', () => {
    it('should build valid web URL', () => {
      const token = 'abc123';
      const url = buildPasswordResetWebUrl(token);

      expect(url).toBe('https://warrendeleon.com/reset-password?token=abc123');
    });

    it('should encode special characters in token', () => {
      const token = 'token+with/special=chars';
      const url = buildPasswordResetWebUrl(token);

      expect(url).toContain('token%2Bwith%2Fspecial%3Dchars');
    });
  });
});
```

---

### Integration Tests

```typescript
// src/utils/navigation/__tests__/deepLink.integration.test.ts

import { Linking } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';
import { handleDeepLink, initializeDeepLinkListener } from '../deepLink';

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  getInitialURL: jest.fn(),
  addEventListener: jest.fn(),
}));

const mockLinking = Linking as jest.Mocked<typeof Linking>;

describe('deepLinkService Integration', () => {
  let mockNavigationRef: React.RefObject<NavigationContainerRef<any>>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockNavigationRef = {
      current: {
        navigate: jest.fn(),
      } as any,
    };
  });

  describe('handleDeepLink', () => {
    it('should navigate to ResetPassword screen with token', () => {
      const url = 'warrendeleon://app/reset-password?token=abc123';

      handleDeepLink(url, mockNavigationRef);

      expect(mockNavigationRef.current?.navigate).toHaveBeenCalledWith('ResetPassword', {
        token: 'abc123',
      });
    });

    it('should not navigate if URL is invalid', () => {
      const url = 'invalid-url';

      handleDeepLink(url, mockNavigationRef);

      expect(mockNavigationRef.current?.navigate).not.toHaveBeenCalled();
    });

    it('should not crash if navigation ref is null', () => {
      const url = 'warrendeleon://app/reset-password?token=abc123';
      const nullRef = { current: null };

      expect(() => {
        handleDeepLink(url, nullRef);
      }).not.toThrow();
    });
  });

  describe('initializeDeepLinkListener', () => {
    it('should handle initial URL', async () => {
      const initialUrl = 'warrendeleon://app/reset-password?token=initial123';
      mockLinking.getInitialURL.mockResolvedValue(initialUrl);

      initializeDeepLinkListener(mockNavigationRef);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockNavigationRef.current?.navigate).toHaveBeenCalledWith('ResetPassword', {
        token: 'initial123',
      });
    });

    it('should handle URL events', () => {
      const mockSubscription = { remove: jest.fn() };
      let urlHandler: ((event: { url: string }) => void) | undefined;

      mockLinking.addEventListener.mockImplementation((event, handler) => {
        urlHandler = handler as (event: { url: string }) => void;
        return mockSubscription;
      });

      initializeDeepLinkListener(mockNavigationRef);

      // Simulate URL event
      const eventUrl = 'warrendeleon://app/reset-password?token=event123';
      urlHandler?.({ url: eventUrl });

      expect(mockNavigationRef.current?.navigate).toHaveBeenCalledWith('ResetPassword', {
        token: 'event123',
      });
    });

    it('should return cleanup function that removes listener', () => {
      const mockSubscription = { remove: jest.fn() };
      mockLinking.addEventListener.mockReturnValue(mockSubscription);

      const cleanup = initializeDeepLinkListener(mockNavigationRef);
      cleanup();

      expect(mockSubscription.remove).toHaveBeenCalled();
    });
  });
});
```

---

## Dependencies

- `@react-navigation/native` (already in project)
- React Native Linking API

---

## Testing Deep Links

### iOS Simulator

```bash
# Test password reset deep link
xcrun simctl openurl booted "warrendeleon://app/reset-password?token=test123"

# Test web URL (requires Universal Links setup)
xcrun simctl openurl booted "https://warrendeleon.com/reset-password?token=test123"
```

### Android Emulator

```bash
# Test password reset deep link
adb shell am start -W -a android.intent.action.VIEW -d "warrendeleon://app/reset-password?token=test123"

# Test web URL (requires App Links setup)
adb shell am start -W -a android.intent.action.VIEW -d "https://warrendeleon.com/reset-password?token=test123"
```

---

## Definition of Done

- [ ] Deep link service implemented
- [ ] iOS URL scheme configured
- [ ] Android intent filter configured
- [ ] Password reset URLs parsed correctly
- [ ] Navigation working with token parameter
- [ ] Invalid URLs handled gracefully
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] 100% code coverage
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-045](../stories/US-045-reset-password-with-token.md), [TASK-254](TASK-254-supabase-recovery-api.md), [TASK-257](TASK-257-reset-password-ui.md)
