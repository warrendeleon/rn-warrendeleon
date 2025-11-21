# TASK-290: Deep Link Navigation

**ID**: TASK-290 | **Epic**: [EPIC-026](../epics/EPIC-026-push-notifications.md) | **User Story**: [US-051](../stories/US-051-chat-message-notifications.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Implement deep linking configuration for React Navigation to handle notification taps. Configure URL schemes (iOS/Android), set up linking configuration with path mapping, handle navigation to specific screens from notifications, and support both foreground and background navigation scenarios.

---

## Acceptance Criteria

- [ ] Deep linking configured in React Navigation
- [ ] URL schemes configured for iOS (Info.plist)
- [ ] URL schemes configured for Android (AndroidManifest.xml)
- [ ] Linking configuration with path mapping
- [ ] Navigate to ChatScreen with conversationId
- [ ] Navigate to SecuritySettingsScreen
- [ ] Navigate to HomeScreen
- [ ] Handle navigation from killed state
- [ ] Handle navigation when app is already running
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

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
```

---

### Android Configuration

```xml
<!-- android/app/src/main/AndroidManifest.xml -->

<activity
  android:name=".MainActivity"
  android:label="@string/app_name"
  android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode"
  android:launchMode="singleTask"
  android:windowSoftInputMode="adjustResize"
  android:exported="true">

  <intent-filter>
    <action android:name="android.intent.action.MAIN" />
    <category android:name="android.intent.category.LAUNCHER" />
  </intent-filter>

  <!-- Deep linking -->
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="warrendeleon" />
  </intent-filter>
</activity>
```

---

### Linking Configuration

```typescript
// src/navigation/linking.ts

import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['warrendeleon://', 'https://warrendeleon.com'],
  config: {
    screens: {
      // Auth screens
      SignIn: 'auth/sign-in',
      SignUp: 'auth/sign-up',
      ForgotPassword: 'auth/forgot-password',

      // Main app screens
      Home: 'home',

      // Chat
      ChatList: 'chat',
      Chat: {
        path: 'chat/:conversationId',
        parse: {
          conversationId: (conversationId: string) => conversationId,
        },
      },

      // Settings
      Settings: 'settings',
      SecuritySettings: 'settings/security',
      NotificationPreferences: 'settings/notifications',
      ChangePin: 'settings/change-pin',
      BiometricToggle: 'settings/biometric',
      UpdateProfilePicture: 'settings/profile-picture',

      // Portfolio
      Portfolio: 'portfolio',
      WorkExperience: 'portfolio/work-experience',
      WorkExperienceDetail: {
        path: 'portfolio/work-experience/:experienceId',
        parse: {
          experienceId: (experienceId: string) => experienceId,
        },
      },
      Education: 'portfolio/education',
      Projects: 'portfolio/projects',
      Certifications: 'portfolio/certifications',

      // Not found
      NotFound: '*',
    },
  },
};
```

---

### Navigation Container Setup

```typescript
// src/navigation/RootNavigator.tsx

import React, { useEffect, useRef } from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { linking } from './linking';
import { RootStackParamList } from './types';
import { checkInitialNotification } from '../services/notifications/notificationHandler';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  /**
   * Check for initial notification on mount
   */
  useEffect(() => {
    const navigate = (screen: string, params?: any) => {
      if (navigationRef.current) {
        navigationRef.current.navigate(screen as never, params as never);
      }
    };

    checkInitialNotification(navigate);
  }, []);

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator>
        {/* Auth screens */}
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />

        {/* Main screens */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ChatList" component={ChatListScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />

        {/* Settings */}
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="SecuritySettings"
          component={SecuritySettingsScreen}
        />
        <Stack.Screen
          name="NotificationPreferences"
          component={NotificationPreferencesScreen}
        />

        {/* Not found */}
        <Stack.Screen name="NotFound" component={NotFoundScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

---

### Navigation Types

```typescript
// src/navigation/types.ts

export type RootStackParamList = {
  // Auth
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;

  // Main
  Home: undefined;

  // Chat
  ChatList: undefined;
  Chat: {
    conversationId: string;
  };

  // Settings
  Settings: undefined;
  SecuritySettings: undefined;
  NotificationPreferences: undefined;
  ChangePin: undefined;
  BiometricToggle: undefined;
  UpdateProfilePicture: undefined;

  // Portfolio
  Portfolio: undefined;
  WorkExperience: undefined;
  WorkExperienceDetail: {
    experienceId: string;
  };
  Education: undefined;
  Projects: undefined;
  Certifications: undefined;

  // Not found
  NotFound: undefined;
};
```

---

### Deep Link Helper

```typescript
// src/utils/deepLinking.ts

import { Linking } from 'react-native';

/**
 * Open a deep link URL
 */
export const openDeepLink = async (url: string): Promise<boolean> => {
  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      console.warn(`Cannot open URL: ${url}`);
      return false;
    }
  } catch (error) {
    console.error('Error opening deep link:', error);
    return false;
  }
};

/**
 * Get initial URL (for deep link handling when app is killed)
 */
export const getInitialURL = async (): Promise<string | null> => {
  try {
    const initialURL = await Linking.getInitialURL();
    return initialURL;
  } catch (error) {
    console.error('Error getting initial URL:', error);
    return null;
  }
};

/**
 * Parse deep link URL to get screen and params
 */
export const parseDeepLink = (
  url: string
): { screen: string; params?: Record<string, string> } | null => {
  try {
    // Remove scheme prefix
    const cleanUrl = url.replace(/^warrendeleon:\/\//, '');

    // Split path and query
    const [path, query] = cleanUrl.split('?');

    // Parse path to screen name
    const pathParts = path.split('/');

    // Parse query params
    const params: Record<string, string> = {};
    if (query) {
      query.split('&').forEach(param => {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
      });
    }

    // Map path to screen
    if (path === 'home') {
      return { screen: 'Home' };
    }

    if (path.startsWith('chat/')) {
      const conversationId = pathParts[1];
      return {
        screen: 'Chat',
        params: { conversationId },
      };
    }

    if (path === 'settings/security') {
      return { screen: 'SecuritySettings' };
    }

    if (path === 'settings/notifications') {
      return { screen: 'NotificationPreferences' };
    }

    // Default
    return { screen: 'Home' };
  } catch (error) {
    console.error('Error parsing deep link:', error);
    return null;
  }
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/utils/__tests__/deepLinking.test.ts

import { Linking } from 'react-native';
import { openDeepLink, getInitialURL, parseDeepLink } from '../deepLinking';

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  canOpenURL: jest.fn(),
  openURL: jest.fn(),
  getInitialURL: jest.fn(),
}));

describe('deepLinking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('openDeepLink', () => {
    it('should open supported URL', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      (Linking.openURL as jest.Mock).mockResolvedValue(undefined);

      const result = await openDeepLink('warrendeleon://chat/conv-123');

      expect(Linking.canOpenURL).toHaveBeenCalledWith('warrendeleon://chat/conv-123');
      expect(Linking.openURL).toHaveBeenCalledWith('warrendeleon://chat/conv-123');
      expect(result).toBe(true);
    });

    it('should return false for unsupported URL', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      const result = await openDeepLink('invalid://url');

      expect(result).toBe(false);
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (Linking.canOpenURL as jest.Mock).mockRejectedValue(new Error('Failed to check URL'));

      const result = await openDeepLink('warrendeleon://chat/conv-123');

      expect(result).toBe(false);
    });
  });

  describe('getInitialURL', () => {
    it('should get initial URL successfully', async () => {
      (Linking.getInitialURL as jest.Mock).mockResolvedValue('warrendeleon://chat/conv-123');

      const url = await getInitialURL();

      expect(url).toBe('warrendeleon://chat/conv-123');
    });

    it('should return null when no initial URL', async () => {
      (Linking.getInitialURL as jest.Mock).mockResolvedValue(null);

      const url = await getInitialURL();

      expect(url).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      (Linking.getInitialURL as jest.Mock).mockRejectedValue(
        new Error('Failed to get initial URL')
      );

      const url = await getInitialURL();

      expect(url).toBeNull();
    });
  });

  describe('parseDeepLink', () => {
    it('should parse home screen deep link', () => {
      const result = parseDeepLink('warrendeleon://home');

      expect(result).toEqual({ screen: 'Home' });
    });

    it('should parse chat screen deep link with conversationId', () => {
      const result = parseDeepLink('warrendeleon://chat/conv-123');

      expect(result).toEqual({
        screen: 'Chat',
        params: { conversationId: 'conv-123' },
      });
    });

    it('should parse security settings deep link', () => {
      const result = parseDeepLink('warrendeleon://settings/security');

      expect(result).toEqual({ screen: 'SecuritySettings' });
    });

    it('should parse notification preferences deep link', () => {
      const result = parseDeepLink('warrendeleon://settings/notifications');

      expect(result).toEqual({ screen: 'NotificationPreferences' });
    });

    it('should parse deep link with query params', () => {
      const result = parseDeepLink('warrendeleon://chat/conv-123?messageId=msg-456');

      expect(result).toEqual({
        screen: 'Chat',
        params: {
          conversationId: 'conv-123',
          messageId: 'msg-456',
        },
      });
    });

    it('should default to Home for unknown paths', () => {
      const result = parseDeepLink('warrendeleon://unknown/path');

      expect(result).toEqual({ screen: 'Home' });
    });

    it('should handle malformed URLs gracefully', () => {
      const result = parseDeepLink('invalid-url');

      expect(result).toEqual({ screen: 'Home' });
    });

    it('should handle errors gracefully', () => {
      const result = parseDeepLink(null as any);

      expect(result).toBeNull();
    });
  });

  describe('Deep link integration', () => {
    it('should handle full navigation flow', async () => {
      const url = 'warrendeleon://chat/conv-123';

      // Parse deep link
      const parsed = parseDeepLink(url);
      expect(parsed).toEqual({
        screen: 'Chat',
        params: { conversationId: 'conv-123' },
      });

      // Open deep link
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      (Linking.openURL as jest.Mock).mockResolvedValue(undefined);

      const opened = await openDeepLink(url);
      expect(opened).toBe(true);
    });
  });
});
```

---

## Dependencies

- React Navigation
- @react-navigation/native
- @react-navigation/native-stack
- React Native Linking API

---

## Definition of Done

- [ ] Deep linking configured in React Navigation
- [ ] iOS URL scheme configured
- [ ] Android URL scheme configured
- [ ] Linking configuration with path mapping
- [ ] Navigation to ChatScreen working
- [ ] Navigation to SecuritySettings working
- [ ] Navigation to Home working
- [ ] Killed state navigation working
- [ ] Foreground navigation working
- [ ] Deep link helper utilities implemented
- [ ] All unit tests passing
- [ ] 100% code coverage achieved
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-051](../stories/US-051-chat-message-notifications.md), [TASK-289](TASK-289-notification-handler.md)
