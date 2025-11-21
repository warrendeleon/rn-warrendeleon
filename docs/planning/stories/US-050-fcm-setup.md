# US-050: FCM Setup and Permission Handling

**ID**: US-050 | **Epic**: [EPIC-026](../epics/EPIC-026-push-notifications.md) | **Title**: Firebase Cloud Messaging Setup and Permissions
**Status**: 📋 To Do | **Priority**: High | **Story Points**: 3 | **Effort**: 7h

---

## User Story

**As a** registered user
**I want to** grant permission for push notifications
**So that** I can receive important alerts from the app

---

## Acceptance Criteria

### Functional Requirements

1. **Permission Request (iOS)**
   - [ ] App requests notification permission on first launch
   - [ ] Permission dialog shows: "Allow {AppName} to send you notifications?"
   - [ ] If granted: Save preference, get FCM token
   - [ ] If denied: Save preference, show fallback message

2. **Permission Grant (Android)**
   - [ ] Android auto-grants notification permission (no explicit request needed pre-Android 13)
   - [ ] Android 13+: Request notification permission
   - [ ] Get FCM token automatically

3. **FCM Token Management**
   - [ ] Get FCM device token on app launch
   - [ ] Send token to Supabase `user_devices` table
   - [ ] Store platform info (iOS/Android), app version
   - [ ] Refresh token on app launch (in case it changed)
   - [ ] Delete token on logout

4. **Foreground Notifications**
   - [ ] Listen for notifications while app is open
   - [ ] Show in-app banner with notification content
   - [ ] Banner auto-dismisses after 5 seconds
   - [ ] Tap banner: Navigate to relevant screen

5. **Background Notifications**
   - [ ] Handle notification tap when app is in background
   - [ ] Open app and navigate to relevant screen
   - [ ] Handle notification tap when app is closed

### Non-Functional Requirements

1. **Performance**
   - [ ] Permission request: <500ms
   - [ ] Token retrieval: <2 seconds
   - [ ] Token save to Supabase: <1 second

2. **Accessibility (EAA)**
   - [ ] In-app notification banner has `accessibilityRole="alert"`
   - [ ] Banner has `accessibilityLabel` with notification content

3. **Testing**
   - [ ] 100% RNTL coverage for FCM service
   - [ ] E2E test for permission flow
   - [ ] Manual testing on real devices

---

## Technical Implementation

### Component Structure

```typescript
// src/App.tsx (FCM integration at root)

App
├── NavigationContainer
├── FCMService (auto-initializes)
└── NotificationBanner (in-app foreground notifications)
```

### Data Flow

```
App launches
  → Check notification permission status
  → If not determined:
    → Request permission (iOS)
  → If granted:
    → Get FCM token
    → Send token to Supabase user_devices table
  → Listen for foreground notifications
  → Listen for background/notification tap events
  → On notification received:
    - Foreground: Show in-app banner
    - Background: Open app, navigate to screen
```

### FCM Service

```typescript
// src/services/notifications/fcmService.ts

import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    return enabled;
  } else {
    // Android auto-grants permission (pre-Android 13)
    return true;
  }
};

export const getFCMToken = async (): Promise<string> => {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    throw error;
  }
};

export const onMessageReceived = (callback: (message: any) => void): (() => void) => {
  const unsubscribe = messaging().onMessage(callback);
  return unsubscribe;
};

export const onNotificationOpenedApp = (callback: (message: any) => void): void => {
  messaging().onNotificationOpenedApp(callback);
};

export const getInitialNotification = async (): Promise<any | null> => {
  const message = await messaging().getInitialNotification();
  return message;
};
```

### Save FCM Token to Supabase

```typescript
// src/api/notifications/devices.ts

import axios from 'axios';
import Config from 'react-native-config';
import { Platform } from 'react-native';
import { getAccessToken } from '../../services/storage/keychainService';
import { z } from 'zod';

const deviceRequestSchema = z.object({
  device_token: z.string(),
  platform: z.enum(['ios', 'android']),
  app_version: z.string(),
});

export const saveFCMToken = async (token: string): Promise<void> => {
  try {
    const validatedData = deviceRequestSchema.parse({
      device_token: token,
      platform: Platform.OS,
      app_version: Config.APP_VERSION || '1.0.0',
    });

    const accessToken = await getAccessToken();

    await axios.post(`${Config.SUPABASE_URL}/rest/v1/user_devices`, validatedData, {
      headers: {
        apikey: Config.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Failed to save FCM token:', error);
    throw error;
  }
};

export const deleteFCMToken = async (token: string): Promise<void> => {
  try {
    const accessToken = await getAccessToken();

    await axios.delete(`${Config.SUPABASE_URL}/rest/v1/user_devices?device_token=eq.${token}`, {
      headers: {
        apikey: Config.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error: any) {
    console.error('Failed to delete FCM token:', error);
  }
};
```

### useNotifications Hook

```typescript
// src/hooks/useNotifications.ts

import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  requestNotificationPermission,
  getFCMToken,
  onMessageReceived,
  onNotificationOpenedApp,
  getInitialNotification,
} from '../services/notifications/fcmService';
import { saveFCMToken, deleteFCMToken } from '../api/notifications/devices';

export const useNotifications = () => {
  const navigation = useNavigation();
  const [foregroundNotification, setForegroundNotification] = useState<any>(null);

  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      // 1. Request permission
      const hasPermission = await requestNotificationPermission();

      if (!hasPermission) {
        console.log('Notification permission denied');
        return;
      }

      // 2. Get FCM token
      const token = await getFCMToken();
      console.log('FCM Token:', token);

      // 3. Save token to Supabase
      await saveFCMToken(token);

      // 4. Listen for foreground notifications
      const unsubscribe = onMessageReceived(message => {
        console.log('Foreground notification:', message);
        setForegroundNotification(message);

        // Auto-dismiss after 5 seconds
        setTimeout(() => setForegroundNotification(null), 5000);
      });

      // 5. Handle notification tap (app in background)
      onNotificationOpenedApp(message => {
        handleNotificationNavigation(message);
      });

      // 6. Handle notification tap (app closed)
      const initialNotification = await getInitialNotification();
      if (initialNotification) {
        handleNotificationNavigation(initialNotification);
      }

      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to setup notifications:', error);
    }
  };

  const handleNotificationNavigation = (message: any) => {
    const { type, conversationId, userId } = message.data;

    if (type === 'new_message') {
      navigation.navigate('Chat', { conversationId });
    } else if (type === 'security_alert') {
      navigation.navigate('SecuritySettings');
    }
  };

  return {
    foregroundNotification,
    dismissNotification: () => setForegroundNotification(null),
  };
};
```

### In-App Notification Banner

```typescript
// src/components/notifications/NotificationBanner.tsx

import React from 'react';
import { Pressable, Text, Animated } from 'react-native';
import { Box, HStack } from '@gluestack-ui/themed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NotificationBannerProps {
  notification: any;
  onDismiss: () => void;
  onPress: () => void;
  testID?: string;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onDismiss,
  onPress,
  testID = 'notification-banner',
}) => {
  const insets = useSafeAreaInsets();
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (notification) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onDismiss());
      }, 5000);
    }
  }, [notification]);

  if (!notification) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: insets.top + 10,
        left: 16,
        right: 16,
        opacity: fadeAnim,
        zIndex: 1000,
      }}
    >
      <Pressable
        onPress={onPress}
        testID={testID}
        accessibilityRole="alert"
        accessibilityLabel={`Notification: ${notification.notification.title}`}
      >
        <Box
          backgroundColor="$white"
          borderRadius="$lg"
          padding="$4"
          shadowColor="$black"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.2}
          shadowRadius={4}
        >
          <HStack space="sm" alignItems="center">
            <Text style={{ fontSize: 20 }}>🔔</Text>

            <Box flex={1}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
                {notification.notification.title}
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>
                {notification.notification.body}
              </Text>
            </Box>

            <Pressable
              onPress={onDismiss}
              testID={`${testID}-dismiss`}
              accessibilityRole="button"
              accessibilityLabel="Dismiss notification"
            >
              <Text style={{ fontSize: 20 }}>✕</Text>
            </Pressable>
          </HStack>
        </Box>
      </Pressable>
    </Animated.View>
  );
};
```

---

## Tasks Breakdown

| Task ID  | Description                  | Effort |
| -------- | ---------------------------- | ------ |
| TASK-283 | FCM Service Setup            | 2h     |
| TASK-284 | Permission Handling          | 1.5h   |
| TASK-285 | Save Token to Supabase       | 1.5h   |
| TASK-286 | NotificationBanner Component | 1h     |
| TASK-287 | FCM Setup RNTL Tests         | 1h     |

**Total**: 5 tasks, 7 hours

---

## Testing Strategy

### Unit Tests (RNTL)

**File**: `src/services/notifications/__tests__/fcmService.test.ts`

```typescript
describe('FCMService', () => {
  it('should request notification permission on iOS', async () => {
    Platform.OS = 'ios';
    mockMessaging.requestPermission.mockResolvedValue(messaging.AuthorizationStatus.AUTHORIZED);

    const hasPermission = await requestNotificationPermission();

    expect(hasPermission).toBe(true);
  });

  it('should auto-grant permission on Android', async () => {
    Platform.OS = 'android';

    const hasPermission = await requestNotificationPermission();

    expect(hasPermission).toBe(true);
  });

  it('should get FCM token', async () => {
    mockMessaging.getToken.mockResolvedValue('fcm-token-123');

    const token = await getFCMToken();

    expect(token).toBe('fcm-token-123');
  });
});
```

### E2E Tests (Detox + Cucumber)

```gherkin
Feature: FCM Setup

  Scenario: Grant notification permission (iOS)
    Given I am on iOS
    When I launch the app for the first time
    Then I should see the notification permission dialog
    When I tap "Allow"
    Then the permission should be granted
    And my FCM token should be saved to Supabase

  Scenario: Receive foreground notification
    Given notification permission is granted
    When I receive a notification while the app is open
    Then I should see an in-app notification banner
    And the banner should auto-dismiss after 5 seconds
```

---

## Dependencies

**Upstream**:

- EPIC-021: Registration (user accounts exist)
- Firebase project configured
- Supabase `user_devices` table created

**Downstream**:

- US-051: Chat Notifications
- US-052: Security Notifications

---

## Risks & Mitigation

| Risk                        | Probability | Impact | Mitigation                                       |
| --------------------------- | ----------- | ------ | ------------------------------------------------ |
| Permission denied by user   | Medium      | High   | Explain benefits clearly, allow re-request later |
| FCM token retrieval fails   | Low         | High   | Retry logic, fallback to in-app notifications    |
| Token refresh on app update | Medium      | Medium | Re-fetch token on app launch                     |

---

## Definition of Done

**Functional**:

- [ ] All acceptance criteria met
- [ ] All 5 tasks complete
- [ ] FCM working on iOS + Android

**Quality**:

- [ ] 100% RNTL coverage
- [ ] All E2E tests passing
- [ ] `yarn validate` passes

**Security**:

- [ ] Tokens stored securely in Supabase
- [ ] Tokens deleted on logout

**Accessibility**:

- [ ] All EAA requirements met
- [ ] Screen reader tested

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-026](../epics/EPIC-026-push-notifications.md), [US-051](US-051-chat-notifications.md)
