# TASK-283: FCM Service Setup

**ID**: TASK-283 | **Epic**: [EPIC-026](../epics/EPIC-026-push-notifications.md) | **User Story**: [US-050](../stories/US-050-fcm-setup-permission-handling.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Set up Firebase Cloud Messaging (FCM) service for push notifications. Configure Firebase project, integrate React Native Firebase, handle FCM token generation and refresh, and implement notification channel configuration for Android.

---

## Acceptance Criteria

- [ ] Firebase project configured
- [ ] @react-native-firebase/app and @react-native-firebase/messaging integrated
- [ ] FCM service created in `src/services/notifications/fcmService.ts`
- [ ] Token generation and refresh handling
- [ ] Android notification channels configured
- [ ] iOS notification configuration
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### FCM Service

```typescript
// src/services/notifications/fcmService.ts

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export interface FCMToken {
  token: string;
  timestamp: number;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Initialize FCM service
 */
export const initializeFCM = async (): Promise<void> => {
  try {
    // Register background message handler
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background notification received:', remoteMessage);
      // Handle background notification
    });

    // iOS: Register for remote notifications
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }

    // Android: Create notification channels
    if (Platform.OS === 'android') {
      await createAndroidNotificationChannels();
    }
  } catch (error) {
    console.error('Failed to initialize FCM:', error);
    throw error;
  }
};

/**
 * Get FCM token
 */
export const getFCMToken = async (): Promise<string> => {
  try {
    const token = await messaging().getToken();

    if (!token) {
      throw new Error('Failed to get FCM token');
    }

    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    throw error;
  }
};

/**
 * Delete FCM token
 */
export const deleteFCMToken = async (): Promise<void> => {
  try {
    await messaging().deleteToken();
  } catch (error) {
    console.error('Failed to delete FCM token:', error);
    throw error;
  }
};

/**
 * Subscribe to topic
 */
export const subscribeToTopic = async (topic: string): Promise<void> => {
  try {
    await messaging().subscribeToTopic(topic);
  } catch (error) {
    console.error(`Failed to subscribe to topic ${topic}:`, error);
    throw error;
  }
};

/**
 * Unsubscribe from topic
 */
export const unsubscribeFromTopic = async (topic: string): Promise<void> => {
  try {
    await messaging().unsubscribeFromTopic(topic);
  } catch (error) {
    console.error(`Failed to unsubscribe from topic ${topic}:`, error);
    throw error;
  }
};

/**
 * Set up token refresh listener
 */
export const onTokenRefresh = (callback: (token: string) => void): (() => void) => {
  return messaging().onTokenRefresh(token => {
    callback(token);
  });
};

/**
 * Set up foreground notification listener
 */
export const onNotification = (
  callback: (message: FirebaseMessagingTypes.RemoteMessage) => void
): (() => void) => {
  return messaging().onMessage(remoteMessage => {
    callback(remoteMessage);
  });
};

/**
 * Set up notification opened app listener
 */
export const onNotificationOpenedApp = (
  callback: (message: FirebaseMessagingTypes.RemoteMessage) => void
): (() => void) => {
  return messaging().onNotificationOpenedApp(remoteMessage => {
    callback(remoteMessage);
  });
};

/**
 * Get initial notification (app opened from killed state)
 */
export const getInitialNotification =
  async (): Promise<FirebaseMessagingTypes.RemoteMessage | null> => {
    try {
      return await messaging().getInitialNotification();
    } catch (error) {
      console.error('Failed to get initial notification:', error);
      return null;
    }
  };

/**
 * Create Android notification channels
 */
const createAndroidNotificationChannels = async (): Promise<void> => {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    // Chat messages channel
    await messaging().createChannel({
      id: 'chat_messages',
      name: 'Chat Messages',
      description: 'Notifications for new chat messages',
      importance: messaging.Importance.HIGH,
      sound: 'default',
      vibration: true,
    });

    // Security alerts channel
    await messaging().createChannel({
      id: 'security_alerts',
      name: 'Security Alerts',
      description: 'Important security notifications',
      importance: messaging.Importance.MAX,
      sound: 'default',
      vibration: true,
    });

    // General notifications channel
    await messaging().createChannel({
      id: 'general',
      name: 'General Notifications',
      description: 'General app notifications',
      importance: messaging.Importance.DEFAULT,
      sound: 'default',
      vibration: true,
    });
  } catch (error) {
    console.error('Failed to create Android notification channels:', error);
    throw error;
  }
};

/**
 * Request notification permission badge update (iOS)
 */
export const setBadgeCount = async (count: number): Promise<void> => {
  if (Platform.OS !== 'ios') {
    return;
  }

  try {
    await messaging().setApplicationBadge(count);
  } catch (error) {
    console.error('Failed to set badge count:', error);
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (): Promise<void> => {
  try {
    await messaging().cancelAllNotifications();
  } catch (error) {
    console.error('Failed to clear all notifications:', error);
  }
};
```

---

### Usage Hook

```typescript
// src/hooks/notifications/useFCM.ts

import { useState, useEffect, useCallback } from 'react';
import {
  initializeFCM,
  getFCMToken,
  onTokenRefresh,
  onNotification,
  onNotificationOpenedApp,
  getInitialNotification,
} from '../../services/notifications/fcmService';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export interface UseFCMReturn {
  token: string | null;
  isInitialized: boolean;
  initializationError: string | null;
  handleTokenRefresh: (callback: (token: string) => void) => () => void;
  handleNotification: (
    callback: (message: FirebaseMessagingTypes.RemoteMessage) => void
  ) => () => void;
  handleNotificationOpenedApp: (
    callback: (message: FirebaseMessagingTypes.RemoteMessage) => void
  ) => () => void;
}

export const useFCM = (): UseFCMReturn => {
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  /**
   * Initialize FCM and get token
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeFCM();
        const fcmToken = await getFCMToken();
        setToken(fcmToken);
        setIsInitialized(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize FCM';
        setInitializationError(errorMessage);
        console.error('FCM initialization error:', error);
      }
    };

    initialize();
  }, []);

  /**
   * Handle token refresh
   */
  const handleTokenRefresh = useCallback((callback: (token: string) => void): (() => void) => {
    return onTokenRefresh(newToken => {
      setToken(newToken);
      callback(newToken);
    });
  }, []);

  /**
   * Handle foreground notifications
   */
  const handleNotification = useCallback(
    (callback: (message: FirebaseMessagingTypes.RemoteMessage) => void): (() => void) => {
      return onNotification(callback);
    },
    []
  );

  /**
   * Handle notification opened app
   */
  const handleNotificationOpenedApp = useCallback(
    (callback: (message: FirebaseMessagingTypes.RemoteMessage) => void): (() => void) => {
      return onNotificationOpenedApp(callback);
    },
    []
  );

  /**
   * Check for initial notification
   */
  useEffect(() => {
    const checkInitialNotification = async () => {
      const initialNotification = await getInitialNotification();

      if (initialNotification) {
        // Handle initial notification
        console.log('App opened from notification:', initialNotification);
      }
    };

    checkInitialNotification();
  }, []);

  return {
    token,
    isInitialized,
    initializationError,
    handleTokenRefresh,
    handleNotification,
    handleNotificationOpenedApp,
  };
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/services/notifications/__tests__/fcmService.test.ts

import messaging from '@react-native-firebase/messaging';
import {
  initializeFCM,
  getFCMToken,
  deleteFCMToken,
  subscribeToTopic,
  unsubscribeFromTopic,
  onTokenRefresh,
  onNotification,
} from '../fcmService';

jest.mock('@react-native-firebase/messaging');

const mockMessaging = messaging as jest.Mocked<typeof messaging>;

describe('fcmService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockMessaging.mockReturnValue({
      getToken: jest.fn().mockResolvedValue('mock-fcm-token'),
      deleteToken: jest.fn().mockResolvedValue(undefined),
      subscribeToTopic: jest.fn().mockResolvedValue(undefined),
      unsubscribeFromTopic: jest.fn().mockResolvedValue(undefined),
      onTokenRefresh: jest.fn(callback => {
        return () => {}; // Unsubscribe function
      }),
      onMessage: jest.fn(callback => {
        return () => {}; // Unsubscribe function
      }),
      setBackgroundMessageHandler: jest.fn(),
      registerDeviceForRemoteMessages: jest.fn().mockResolvedValue(undefined),
      createChannel: jest.fn().mockResolvedValue(undefined),
    } as any);
  });

  describe('initializeFCM', () => {
    it('should initialize FCM successfully', async () => {
      await expect(initializeFCM()).resolves.not.toThrow();

      expect(mockMessaging().setBackgroundMessageHandler).toHaveBeenCalled();
    });

    it('should throw error on initialization failure', async () => {
      mockMessaging().setBackgroundMessageHandler.mockImplementation(() => {
        throw new Error('Initialization failed');
      });

      await expect(initializeFCM()).rejects.toThrow();
    });
  });

  describe('getFCMToken', () => {
    it('should get FCM token successfully', async () => {
      const token = await getFCMToken();

      expect(token).toBe('mock-fcm-token');
      expect(mockMessaging().getToken).toHaveBeenCalled();
    });

    it('should throw error when token is null', async () => {
      mockMessaging().getToken.mockResolvedValue(null as any);

      await expect(getFCMToken()).rejects.toThrow('Failed to get FCM token');
    });

    it('should throw error on failure', async () => {
      mockMessaging().getToken.mockRejectedValue(new Error('Token error'));

      await expect(getFCMToken()).rejects.toThrow();
    });
  });

  describe('deleteFCMToken', () => {
    it('should delete FCM token successfully', async () => {
      await deleteFCMToken();

      expect(mockMessaging().deleteToken).toHaveBeenCalled();
    });

    it('should handle deletion errors', async () => {
      mockMessaging().deleteToken.mockRejectedValue(new Error('Deletion failed'));

      await expect(deleteFCMToken()).rejects.toThrow();
    });
  });

  describe('subscribeToTopic', () => {
    it('should subscribe to topic successfully', async () => {
      await subscribeToTopic('test-topic');

      expect(mockMessaging().subscribeToTopic).toHaveBeenCalledWith('test-topic');
    });

    it('should handle subscription errors', async () => {
      mockMessaging().subscribeToTopic.mockRejectedValue(new Error('Subscription failed'));

      await expect(subscribeToTopic('test-topic')).rejects.toThrow();
    });
  });

  describe('unsubscribeFromTopic', () => {
    it('should unsubscribe from topic successfully', async () => {
      await unsubscribeFromTopic('test-topic');

      expect(mockMessaging().unsubscribeFromTopic).toHaveBeenCalledWith('test-topic');
    });

    it('should handle unsubscription errors', async () => {
      mockMessaging().unsubscribeFromTopic.mockRejectedValue(new Error('Unsubscription failed'));

      await expect(unsubscribeFromTopic('test-topic')).rejects.toThrow();
    });
  });

  describe('onTokenRefresh', () => {
    it('should set up token refresh listener', () => {
      const callback = jest.fn();

      const unsubscribe = onTokenRefresh(callback);

      expect(mockMessaging().onTokenRefresh).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('onNotification', () => {
    it('should set up notification listener', () => {
      const callback = jest.fn();

      const unsubscribe = onNotification(callback);

      expect(mockMessaging().onMessage).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
```

---

## Dependencies

- @react-native-firebase/app
- @react-native-firebase/messaging
- React Native

---

## Definition of Done

- [ ] Firebase project configured
- [ ] Firebase packages integrated
- [ ] FCM service implemented
- [ ] Token generation working
- [ ] Token refresh working
- [ ] Android channels created
- [ ] iOS registration working
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-050](../stories/US-050-fcm-setup-permission-handling.md), [TASK-284](TASK-284-permission-handling.md)
