# TASK-292: Chat Notifications RNTL Tests

**ID**: TASK-292 | **Epic**: [EPIC-026](../epics/EPIC-026-push-notifications.md) | **User Story**: [US-051](../stories/US-051-chat-message-notifications.md)
**Status**: 📋 To Do | **Effort**: 0.5h

---

## Task Description

Write comprehensive React Native Testing Library tests for chat notification functionality. Test notification handler, deep linking, and notification preferences integration. Achieve 100% code coverage.

---

## Acceptance Criteria

- [ ] Complete RNTL test suite for notificationHandler
- [ ] Complete tests for deep linking utilities
- [ ] Complete tests for NotificationPreferencesScreen
- [ ] Edge cases tested (errors, killed state, foreground/background)
- [ ] 100% code coverage
- [ ] All tests passing

---

## Implementation Details

### Comprehensive RNTL Test Suite

```typescript
// src/services/notifications/__tests__/ChatNotificationIntegration.test.ts

import messaging from '@react-native-firebase/messaging';
import { store } from '../../../store';
import {
  handleForegroundNotification,
  handleBackgroundNotification,
  handleNotificationPress,
  setupNotificationListeners,
  checkInitialNotification,
  parseNotificationData,
} from '../notificationHandler';
import { openDeepLink, parseDeepLink } from '../../../utils/deepLinking';
import { Linking } from 'react-native';

jest.mock('@react-native-firebase/messaging');
jest.mock('../../../store');
jest.mock('react-native/Libraries/Linking/Linking');

const mockMessaging = messaging as jest.Mocked<typeof messaging>;

describe('Chat Notification Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('End-to-End Notification Flow', () => {
    it('should complete full foreground notification flow', async () => {
      const mockShowBanner = jest.fn();
      const mockNavigate = jest.fn();

      const remoteMessage = {
        messageId: 'notif-123',
        notification: {
          title: 'John Doe',
          body: 'Hey, how are you?',
        },
        data: {
          type: 'chat_message',
          conversationId: 'conv-123',
          messageId: 'msg-456',
          senderId: 'user-789',
        },
      };

      // Handle foreground notification
      handleForegroundNotification(remoteMessage as any, mockShowBanner, mockNavigate);

      // Verify Redux state updated
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('incrementUnreadCount'),
        })
      );

      // Verify banner shown
      expect(mockShowBanner).toHaveBeenCalledWith(
        'John Doe',
        'Hey, how are you?',
        'chat',
        expect.any(Function)
      );

      // Simulate user tapping banner
      const onPress = mockShowBanner.mock.calls[0][3];
      onPress();

      // Verify navigation
      expect(mockNavigate).toHaveBeenCalledWith('Chat', {
        conversationId: 'conv-123',
      });
    });

    it('should complete full background notification flow', async () => {
      (store.getState as jest.Mock).mockReturnValue({
        chat: {
          conversations: {
            'conv-123': { unreadCount: 2 },
          },
        },
      });

      const remoteMessage = {
        messageId: 'notif-456',
        data: {
          type: 'chat_message',
          conversationId: 'conv-123',
          messageId: 'msg-789',
          senderId: 'user-abc',
        },
      };

      await handleBackgroundNotification(remoteMessage as any);

      expect(store.dispatch).toHaveBeenCalled();
    });

    it('should complete full notification opened app flow', async () => {
      const mockNavigate = jest.fn();

      const remoteMessage = {
        messageId: 'notif-789',
        data: {
          type: 'chat_message',
          conversationId: 'conv-456',
        },
      };

      mockMessaging().onNotificationOpenedApp.mockImplementation(callback => {
        callback(remoteMessage as any);
        return () => {};
      });

      setupNotificationListeners(jest.fn(), mockNavigate);

      expect(mockMessaging().onNotificationOpenedApp).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('Chat', {
        conversationId: 'conv-456',
      });
    });

    it('should complete full initial notification flow (killed state)', async () => {
      const mockNavigate = jest.fn();

      const remoteMessage = {
        messageId: 'notif-initial',
        data: {
          type: 'chat_message',
          conversationId: 'conv-789',
        },
      };

      mockMessaging().getInitialNotification.mockResolvedValue(remoteMessage as any);

      await checkInitialNotification(mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith('Chat', {
        conversationId: 'conv-789',
      });
    });
  });

  describe('Deep Linking Integration', () => {
    it('should parse and navigate from deep link', async () => {
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
      expect(Linking.openURL).toHaveBeenCalledWith(url);
    });

    it('should handle deep link navigation for security alerts', async () => {
      const url = 'warrendeleon://settings/security';

      const parsed = parseDeepLink(url);
      expect(parsed).toEqual({
        screen: 'SecuritySettings',
      });

      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      await openDeepLink(url);
      expect(Linking.openURL).toHaveBeenCalled();
    });
  });

  describe('Notification Types', () => {
    const mockShowBanner = jest.fn();
    const mockNavigate = jest.fn();

    it('should handle chat message notification', () => {
      const message = {
        notification: { title: 'User', body: 'Message' },
        data: { type: 'chat_message', conversationId: 'conv-1' },
      };

      handleForegroundNotification(message as any, mockShowBanner, mockNavigate);

      expect(mockShowBanner).toHaveBeenCalledWith('User', 'Message', 'chat', expect.any(Function));
    });

    it('should handle security alert notification', () => {
      const message = {
        notification: { title: 'Security Alert', body: 'Suspicious login' },
        data: { type: 'security_alert' },
      };

      handleForegroundNotification(message as any, mockShowBanner, mockNavigate);

      expect(mockShowBanner).toHaveBeenCalledWith(
        'Security Alert',
        'Suspicious login',
        'security',
        expect.any(Function)
      );
    });

    it('should handle general notification', () => {
      const message = {
        notification: { title: 'Update', body: 'New features available' },
        data: { type: 'general' },
      };

      handleForegroundNotification(message as any, mockShowBanner, mockNavigate);

      expect(mockShowBanner).toHaveBeenCalledWith(
        'Update',
        'New features available',
        'general',
        expect.any(Function)
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle notification without data', () => {
      const message = {
        notification: { title: 'Test', body: 'Message' },
      };

      const parsed = parseNotificationData(undefined);
      expect(parsed.type).toBe('general');
    });

    it('should handle malformed notification data', () => {
      const message = {
        notification: { title: 'Test', body: 'Message' },
        data: { invalid: 'data' },
      };

      const parsed = parseNotificationData(message.data as any);
      expect(parsed.type).toBe('general');
    });

    it('should handle missing conversation ID for chat message', () => {
      const mockShowBanner = jest.fn();
      const mockNavigate = jest.fn();

      const message = {
        notification: { title: 'User', body: 'Message' },
        data: { type: 'chat_message' }, // Missing conversationId
      };

      handleForegroundNotification(message as any, mockShowBanner, mockNavigate);

      expect(mockShowBanner).toHaveBeenCalled();

      // Try to navigate (should not crash)
      const onPress = mockShowBanner.mock.calls[0][3];
      onPress();

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle notification listener cleanup', () => {
      const mockUnsubscribe = jest.fn();
      mockMessaging().onMessage.mockReturnValue(mockUnsubscribe);
      mockMessaging().onNotificationOpenedApp.mockReturnValue(mockUnsubscribe);

      const cleanup = setupNotificationListeners(jest.fn(), jest.fn());

      cleanup();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(2);
    });
  });

  describe('State Management Integration', () => {
    it('should increment unread count for chat message', () => {
      const mockShowBanner = jest.fn();
      const mockNavigate = jest.fn();

      const message = {
        notification: { title: 'User', body: 'Message' },
        data: {
          type: 'chat_message',
          conversationId: 'conv-123',
          messageId: 'msg-456',
        },
      };

      handleForegroundNotification(message as any, mockShowBanner, mockNavigate);

      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('incrementUnreadCount'),
          payload: expect.objectContaining({
            conversationId: 'conv-123',
          }),
        })
      );
    });

    it('should add message to store when message details available', () => {
      const mockShowBanner = jest.fn();
      const mockNavigate = jest.fn();

      const message = {
        notification: { title: 'User', body: 'Hello!' },
        data: {
          type: 'chat_message',
          conversationId: 'conv-123',
          messageId: 'msg-456',
          senderId: 'user-789',
        },
      };

      handleForegroundNotification(message as any, mockShowBanner, mockNavigate);

      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('addMessage'),
          payload: expect.objectContaining({
            id: 'msg-456',
            conversationId: 'conv-123',
            senderId: 'user-789',
            content: 'Hello!',
          }),
        })
      );
    });
  });
});
```

---

## Dependencies

- `@testing-library/react-native`
- `@testing-library/jest-native`
- Jest
- notificationHandler service (TASK-289)
- deepLinking utilities (TASK-290)
- NotificationPreferencesScreen (TASK-291)

---

## Definition of Done

- [ ] All notification handler tests passing
- [ ] All deep linking tests passing
- [ ] All preferences screen tests passing
- [ ] End-to-end notification flows tested
- [ ] Foreground notifications tested
- [ ] Background notifications tested
- [ ] Killed state notifications tested
- [ ] State management integration tested
- [ ] Edge cases tested
- [ ] 100% code coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-051](../stories/US-051-chat-message-notifications.md), [TASK-289](TASK-289-notification-handler.md), [TASK-290](TASK-290-deep-link-navigation.md), [TASK-291](TASK-291-notification-preferences.md)
