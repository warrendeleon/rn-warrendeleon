# TASK-289: Notification Handler

**ID**: TASK-289 | **Epic**: [EPIC-026](../epics/EPIC-026-push-notifications.md) | **User Story**: [US-051](../stories/US-051-chat-message-notifications.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Create a notification handler service that processes incoming FCM notifications in all app states (foreground, background, killed). Parse notification data, update app state (Redux), show in-app banner for foreground notifications, and handle notification tap events with navigation.

---

## Acceptance Criteria

- [ ] Notification handler service created in `src/services/notifications/notificationHandler.ts`
- [ ] Handle foreground notifications (show banner)
- [ ] Handle background notifications (update badge)
- [ ] Handle notifications when app is killed (initial notification)
- [ ] Parse notification data and extract metadata
- [ ] Update Redux state (unread counts, messages)
- [ ] Integration with useNotificationBanner hook
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Notification Handler Service

```typescript
// src/services/notifications/notificationHandler.ts

import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { store } from '../../store';
import { incrementUnreadCount, addMessage } from '../../store/slices/chatSlice';
import { setBadgeCount } from './fcmService';

export type NotificationHandler = (message: FirebaseMessagingTypes.RemoteMessage) => void;

export interface ParsedNotificationData {
  type: 'chat_message' | 'security_alert' | 'general';
  conversationId?: string;
  messageId?: string;
  senderId?: string;
}

/**
 * Parse notification data
 */
export const parseNotificationData = (data?: { [key: string]: string }): ParsedNotificationData => {
  if (!data) {
    return { type: 'general' };
  }

  const type = (data.type as ParsedNotificationData['type']) || 'general';

  return {
    type,
    conversationId: data.conversationId,
    messageId: data.messageId,
    senderId: data.senderId,
  };
};

/**
 * Handle foreground notification
 * Shows in-app banner and updates state
 */
export const handleForegroundNotification = (
  message: FirebaseMessagingTypes.RemoteMessage,
  showBanner: (
    title: string,
    body: string,
    type: 'chat' | 'security' | 'general',
    onPress?: () => void
  ) => void,
  navigate: (screen: string, params?: any) => void
): void => {
  const parsedData = parseNotificationData(message.data);

  console.log('Foreground notification received:', parsedData);

  // Update Redux state based on notification type
  if (parsedData.type === 'chat_message' && parsedData.conversationId) {
    store.dispatch(
      incrementUnreadCount({
        conversationId: parsedData.conversationId,
      })
    );

    // If message details are available, add to store
    if (parsedData.messageId && message.notification?.body) {
      store.dispatch(
        addMessage({
          id: parsedData.messageId,
          conversationId: parsedData.conversationId,
          senderId: parsedData.senderId || '',
          content: message.notification.body,
          createdAt: new Date().toISOString(),
          status: 'delivered',
        })
      );
    }
  }

  // Show in-app banner
  const title = message.notification?.title || 'New Notification';
  const body = message.notification?.body || '';
  const bannerType = getBannerType(parsedData.type);

  showBanner(title, body, bannerType, () => {
    handleNotificationPress(parsedData, navigate);
  });
};

/**
 * Handle background notification
 * Updates badge count and state
 */
export const handleBackgroundNotification = async (
  message: FirebaseMessagingTypes.RemoteMessage
): Promise<void> => {
  const parsedData = parseNotificationData(message.data);

  console.log('Background notification received:', parsedData);

  // Update Redux state
  if (parsedData.type === 'chat_message' && parsedData.conversationId) {
    store.dispatch(
      incrementUnreadCount({
        conversationId: parsedData.conversationId,
      })
    );

    // Update badge count (iOS)
    if (Platform.OS === 'ios') {
      const state = store.getState();
      const totalUnreadCount = Object.values(state.chat.conversations).reduce(
        (sum: number, conv: any) => sum + (conv.unreadCount || 0),
        0
      );

      await setBadgeCount(totalUnreadCount);
    }
  }
};

/**
 * Handle notification press
 * Navigates to appropriate screen based on notification type
 */
export const handleNotificationPress = (
  parsedData: ParsedNotificationData,
  navigate: (screen: string, params?: any) => void
): void => {
  switch (parsedData.type) {
    case 'chat_message':
      if (parsedData.conversationId) {
        navigate('Chat', {
          conversationId: parsedData.conversationId,
        });
      }
      break;

    case 'security_alert':
      navigate('SecuritySettings');
      break;

    case 'general':
    default:
      navigate('Home');
      break;
  }
};

/**
 * Get banner type from notification type
 */
const getBannerType = (type: ParsedNotificationData['type']): 'chat' | 'security' | 'general' => {
  switch (type) {
    case 'chat_message':
      return 'chat';
    case 'security_alert':
      return 'security';
    case 'general':
    default:
      return 'general';
  }
};

/**
 * Set up notification listeners
 */
export const setupNotificationListeners = (
  showBanner: (
    title: string,
    body: string,
    type: 'chat' | 'security' | 'general',
    onPress?: () => void
  ) => void,
  navigate: (screen: string, params?: any) => void
): (() => void) => {
  // Foreground notification listener
  const unsubscribeForeground = messaging().onMessage(message => {
    handleForegroundNotification(message, showBanner, navigate);
  });

  // Background notification opened app listener
  const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(message => {
    const parsedData = parseNotificationData(message.data);
    handleNotificationPress(parsedData, navigate);
  });

  // Cleanup function
  return () => {
    unsubscribeForeground();
    unsubscribeOpenedApp();
  };
};

/**
 * Check for initial notification (app opened from killed state)
 */
export const checkInitialNotification = async (
  navigate: (screen: string, params?: any) => void
): Promise<void> => {
  const initialNotification = await messaging().getInitialNotification();

  if (initialNotification) {
    console.log('App opened from notification:', initialNotification);

    const parsedData = parseNotificationData(initialNotification.data);
    handleNotificationPress(parsedData, navigate);
  }
};
```

---

### Background Message Handler

```typescript
// index.js (root of project)

import messaging from '@react-native-firebase/messaging';
import { handleBackgroundNotification } from './src/services/notifications/notificationHandler';

// Set background message handler (must be at root level)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  await handleBackgroundNotification(remoteMessage);
});
```

---

### Integration Example

```typescript
// src/App.tsx

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NotificationBanner } from './components/notifications/NotificationBanner';
import { useNotificationBanner } from './hooks/notifications/useNotificationBanner';
import {
  setupNotificationListeners,
  checkInitialNotification,
} from './services/notifications/notificationHandler';

export const App: React.FC = () => {
  const { bannerState, showBanner, hideBanner } = useNotificationBanner();
  const navigation = useNavigation();

  /**
   * Set up notification listeners on mount
   */
  useEffect(() => {
    const navigate = (screen: string, params?: any) => {
      navigation.navigate(screen as never, params as never);
    };

    // Set up listeners
    const unsubscribe = setupNotificationListeners(showBanner, navigate);

    // Check for initial notification
    checkInitialNotification(navigate);

    return () => {
      unsubscribe();
    };
  }, [showBanner, navigation]);

  return (
    <>
      <NavigationContainer>
        {/* App routes */}
      </NavigationContainer>

      {/* Notification banner overlay */}
      <NotificationBanner
        visible={bannerState.visible}
        title={bannerState.title}
        body={bannerState.body}
        type={bannerState.type}
        onPress={bannerState.onPress}
        onDismiss={hideBanner}
      />
    </>
  );
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/services/notifications/__tests__/notificationHandler.test.ts

import {
  parseNotificationData,
  handleForegroundNotification,
  handleBackgroundNotification,
  handleNotificationPress,
  setupNotificationListeners,
  checkInitialNotification,
} from '../notificationHandler';
import { store } from '../../../store';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import messaging from '@react-native-firebase/messaging';

jest.mock('@react-native-firebase/messaging');
jest.mock('../../../store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(),
  },
}));

const mockMessaging = messaging as jest.Mocked<typeof messaging>;

describe('notificationHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseNotificationData', () => {
    it('should parse chat message data', () => {
      const data = {
        type: 'chat_message',
        conversationId: 'conv-123',
        messageId: 'msg-456',
        senderId: 'user-789',
      };

      const parsed = parseNotificationData(data);

      expect(parsed).toEqual({
        type: 'chat_message',
        conversationId: 'conv-123',
        messageId: 'msg-456',
        senderId: 'user-789',
      });
    });

    it('should parse security alert data', () => {
      const data = {
        type: 'security_alert',
      };

      const parsed = parseNotificationData(data);

      expect(parsed.type).toBe('security_alert');
    });

    it('should default to general when no data', () => {
      const parsed = parseNotificationData(undefined);

      expect(parsed.type).toBe('general');
    });

    it('should default to general when type is unknown', () => {
      const data = {
        type: 'unknown_type',
      };

      const parsed = parseNotificationData(data);

      expect(parsed.type).toBe('general');
    });
  });

  describe('handleForegroundNotification', () => {
    it('should show banner and update state for chat message', () => {
      const mockShowBanner = jest.fn();
      const mockNavigate = jest.fn();

      const message: FirebaseMessagingTypes.RemoteMessage = {
        messageId: '123',
        notification: {
          title: 'John Doe',
          body: 'Hello!',
        },
        data: {
          type: 'chat_message',
          conversationId: 'conv-123',
          messageId: 'msg-456',
          senderId: 'user-789',
        },
      } as any;

      handleForegroundNotification(message, mockShowBanner, mockNavigate);

      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('incrementUnreadCount'),
        })
      );

      expect(mockShowBanner).toHaveBeenCalledWith(
        'John Doe',
        'Hello!',
        'chat',
        expect.any(Function)
      );
    });

    it('should show banner for security alert', () => {
      const mockShowBanner = jest.fn();
      const mockNavigate = jest.fn();

      const message: FirebaseMessagingTypes.RemoteMessage = {
        messageId: '123',
        notification: {
          title: 'Security Alert',
          body: 'Suspicious login detected',
        },
        data: {
          type: 'security_alert',
        },
      } as any;

      handleForegroundNotification(message, mockShowBanner, mockNavigate);

      expect(mockShowBanner).toHaveBeenCalledWith(
        'Security Alert',
        'Suspicious login detected',
        'security',
        expect.any(Function)
      );
    });
  });

  describe('handleBackgroundNotification', () => {
    it('should update state and badge count for chat message', async () => {
      (store.getState as jest.Mock).mockReturnValue({
        chat: {
          conversations: {
            'conv-123': { unreadCount: 2 },
            'conv-456': { unreadCount: 3 },
          },
        },
      });

      const message: FirebaseMessagingTypes.RemoteMessage = {
        messageId: '123',
        data: {
          type: 'chat_message',
          conversationId: 'conv-123',
        },
      } as any;

      await handleBackgroundNotification(message);

      expect(store.dispatch).toHaveBeenCalled();
    });
  });

  describe('handleNotificationPress', () => {
    it('should navigate to chat screen for chat message', () => {
      const mockNavigate = jest.fn();

      const parsedData = {
        type: 'chat_message' as const,
        conversationId: 'conv-123',
      };

      handleNotificationPress(parsedData, mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith('Chat', {
        conversationId: 'conv-123',
      });
    });

    it('should navigate to security settings for security alert', () => {
      const mockNavigate = jest.fn();

      const parsedData = {
        type: 'security_alert' as const,
      };

      handleNotificationPress(parsedData, mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith('SecuritySettings');
    });

    it('should navigate to home for general notification', () => {
      const mockNavigate = jest.fn();

      const parsedData = {
        type: 'general' as const,
      };

      handleNotificationPress(parsedData, mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith('Home');
    });
  });

  describe('setupNotificationListeners', () => {
    it('should set up foreground and background listeners', () => {
      const mockShowBanner = jest.fn();
      const mockNavigate = jest.fn();
      const mockUnsubscribe = jest.fn();

      mockMessaging().onMessage.mockReturnValue(mockUnsubscribe);
      mockMessaging().onNotificationOpenedApp.mockReturnValue(mockUnsubscribe);

      const unsubscribe = setupNotificationListeners(mockShowBanner, mockNavigate);

      expect(mockMessaging().onMessage).toHaveBeenCalled();
      expect(mockMessaging().onNotificationOpenedApp).toHaveBeenCalled();

      unsubscribe();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(2);
    });
  });

  describe('checkInitialNotification', () => {
    it('should navigate if initial notification exists', async () => {
      const mockNavigate = jest.fn();

      const mockInitialNotification: FirebaseMessagingTypes.RemoteMessage = {
        messageId: '123',
        data: {
          type: 'chat_message',
          conversationId: 'conv-123',
        },
      } as any;

      mockMessaging().getInitialNotification.mockResolvedValue(mockInitialNotification);

      await checkInitialNotification(mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith('Chat', {
        conversationId: 'conv-123',
      });
    });

    it('should not navigate if no initial notification', async () => {
      const mockNavigate = jest.fn();

      mockMessaging().getInitialNotification.mockResolvedValue(null);

      await checkInitialNotification(mockNavigate);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
```

---

## Dependencies

- @react-native-firebase/messaging
- React Navigation
- Redux Toolkit
- NotificationBanner component (TASK-286)
- useNotificationBanner hook (TASK-286)
- fcmService (TASK-283)

---

## Definition of Done

- [ ] Notification handler service implemented
- [ ] Foreground notification handling working
- [ ] Background notification handling working
- [ ] Initial notification (killed state) working
- [ ] Notification data parsing correct
- [ ] Redux state updates working
- [ ] Banner integration working
- [ ] Navigation working for all notification types
- [ ] Background message handler registered
- [ ] All unit tests passing
- [ ] 100% code coverage achieved
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-051](../stories/US-051-chat-message-notifications.md), [TASK-286](TASK-286-notification-banner.md), [TASK-283](TASK-283-fcm-service-setup.md)
