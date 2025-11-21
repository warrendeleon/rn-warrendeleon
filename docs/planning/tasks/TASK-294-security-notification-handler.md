# TASK-294: Security Alert Notification Handler

**ID**: TASK-294 | **Epic**: [EPIC-026](../epics/EPIC-026-push-notifications.md) | **User Story**: [US-052](../stories/US-052-security-alert-notifications.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Extend the notification handler service to process security alert notifications. Parse security event data, show high-priority in-app banners with distinctive styling, update app state if needed, and handle navigation to security settings.

---

## Acceptance Criteria

- [ ] Security alert handling added to notification handler
- [ ] Parse security event data from notification
- [ ] Show high-priority banner with red/warning styling
- [ ] Navigate to SecuritySettings on tap
- [ ] Handle all security event types
- [ ] Update app state for security events
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Security Alert Handler Extension

```typescript
// src/services/notifications/securityAlertHandler.ts

import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

export type SecurityEventType =
  | 'failed_login'
  | 'password_change'
  | 'suspicious_activity'
  | 'account_locked'
  | 'new_device_login'
  | 'pin_change';

export interface ParsedSecurityAlertData {
  type: 'security_alert';
  eventType: SecurityEventType;
  eventId: string;
  eventData: Record<string, any>;
}

/**
 * Parse security alert notification data
 */
export const parseSecurityAlertData = (data?: {
  [key: string]: string;
}): ParsedSecurityAlertData | null => {
  if (!data || data.type !== 'security_alert') {
    return null;
  }

  try {
    return {
      type: 'security_alert',
      eventType: data.eventType as SecurityEventType,
      eventId: data.eventId,
      eventData: data.eventData ? JSON.parse(data.eventData) : {},
    };
  } catch (error) {
    console.error('Failed to parse security alert data:', error);
    return null;
  }
};

/**
 * Handle security alert notification in foreground
 */
export const handleSecurityAlert = (
  message: FirebaseMessagingTypes.RemoteMessage,
  showBanner: (
    title: string,
    body: string,
    type: 'chat' | 'security' | 'general',
    onPress?: () => void
  ) => void,
  navigate: (screen: string, params?: any) => void
): void => {
  const parsedData = parseSecurityAlertData(message.data);

  if (!parsedData) {
    console.warn('Invalid security alert data');
    return;
  }

  console.log('Security alert received:', parsedData.eventType);

  const title = message.notification?.title || 'Security Alert';
  const body = message.notification?.body || '';

  // Show high-priority banner
  showBanner(title, body, 'security', () => {
    handleSecurityAlertPress(parsedData.eventType, navigate);
  });

  // Show system alert for critical events
  if (isCriticalEvent(parsedData.eventType)) {
    setTimeout(() => {
      Alert.alert(title, `${body}\n\nPlease review your security settings immediately.`, [
        {
          text: 'Review Now',
          onPress: () => handleSecurityAlertPress(parsedData.eventType, navigate),
        },
        {
          text: 'Later',
          style: 'cancel',
        },
      ]);
    }, 500); // Delay to avoid conflict with banner
  }
};

/**
 * Handle security alert press
 */
export const handleSecurityAlertPress = (
  eventType: SecurityEventType,
  navigate: (screen: string, params?: any) => void
): void => {
  switch (eventType) {
    case 'failed_login':
    case 'suspicious_activity':
    case 'account_locked':
    case 'new_device_login':
      navigate('SecuritySettings');
      break;

    case 'password_change':
      // Navigate to change password screen
      navigate('ChangePassword');
      break;

    case 'pin_change':
      navigate('ChangePIN');
      break;

    default:
      navigate('SecuritySettings');
      break;
  }
};

/**
 * Check if event is critical and requires immediate attention
 */
const isCriticalEvent = (eventType: SecurityEventType): boolean => {
  return ['failed_login', 'suspicious_activity', 'account_locked', 'new_device_login'].includes(
    eventType
  );
};

/**
 * Get icon for security event type
 */
export const getSecurityEventIcon = (eventType: SecurityEventType): string => {
  switch (eventType) {
    case 'failed_login':
      return 'alert-circle';
    case 'password_change':
      return 'key';
    case 'suspicious_activity':
      return 'alert-triangle';
    case 'account_locked':
      return 'lock';
    case 'new_device_login':
      return 'smartphone';
    case 'pin_change':
      return 'shield';
    default:
      return 'alert-triangle';
  }
};
```

---

### Updated Notification Handler

```typescript
// src/services/notifications/notificationHandler.ts (updated)

import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { handleSecurityAlert, parseSecurityAlertData } from './securityAlertHandler';

/**
 * Handle foreground notification (updated)
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

  // Handle security alerts
  if (parsedData.type === 'security_alert') {
    handleSecurityAlert(message, showBanner, navigate);
    return;
  }

  // Handle chat messages
  if (parsedData.type === 'chat_message' && parsedData.conversationId) {
    store.dispatch(
      incrementUnreadCount({
        conversationId: parsedData.conversationId,
      })
    );

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
 * Handle notification press (updated)
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
      // Parse security data and handle navigation
      const securityData = parseSecurityAlertData(parsedData as any);
      if (securityData) {
        handleSecurityAlertPress(securityData.eventType, navigate);
      } else {
        navigate('SecuritySettings');
      }
      break;

    case 'general':
    default:
      navigate('Home');
      break;
  }
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/services/notifications/__tests__/securityAlertHandler.test.ts

import {
  parseSecurityAlertData,
  handleSecurityAlert,
  handleSecurityAlertPress,
  getSecurityEventIcon,
} from '../securityAlertHandler';
import { Alert } from 'react-native';

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('securityAlertHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseSecurityAlertData', () => {
    it('should parse failed_login event', () => {
      const data = {
        type: 'security_alert',
        eventType: 'failed_login',
        eventId: 'event-123',
        eventData: JSON.stringify({ location: 'New York' }),
      };

      const parsed = parseSecurityAlertData(data);

      expect(parsed).toEqual({
        type: 'security_alert',
        eventType: 'failed_login',
        eventId: 'event-123',
        eventData: { location: 'New York' },
      });
    });

    it('should parse password_change event', () => {
      const data = {
        type: 'security_alert',
        eventType: 'password_change',
        eventId: 'event-456',
        eventData: '{}',
      };

      const parsed = parseSecurityAlertData(data);

      expect(parsed?.eventType).toBe('password_change');
    });

    it('should return null for non-security alert', () => {
      const data = {
        type: 'chat_message',
        conversationId: 'conv-123',
      };

      const parsed = parseSecurityAlertData(data);

      expect(parsed).toBeNull();
    });

    it('should return null for invalid data', () => {
      const parsed = parseSecurityAlertData(undefined);

      expect(parsed).toBeNull();
    });

    it('should handle malformed eventData gracefully', () => {
      const data = {
        type: 'security_alert',
        eventType: 'failed_login',
        eventId: 'event-123',
        eventData: 'invalid json',
      };

      const parsed = parseSecurityAlertData(data);

      expect(parsed).toBeNull();
    });
  });

  describe('handleSecurityAlert', () => {
    it('should show banner for security alert', () => {
      const mockShowBanner = jest.fn();
      const mockNavigate = jest.fn();

      const message = {
        notification: {
          title: 'Failed Login Attempt',
          body: 'Someone attempted to log in to your account.',
        },
        data: {
          type: 'security_alert',
          eventType: 'failed_login',
          eventId: 'event-123',
          eventData: JSON.stringify({}),
        },
      };

      handleSecurityAlert(message as any, mockShowBanner, mockNavigate);

      expect(mockShowBanner).toHaveBeenCalledWith(
        'Failed Login Attempt',
        'Someone attempted to log in to your account.',
        'security',
        expect.any(Function)
      );
    });

    it('should show system alert for critical events', done => {
      const mockShowBanner = jest.fn();
      const mockNavigate = jest.fn();

      const message = {
        notification: {
          title: 'Suspicious Activity',
          body: 'We detected unusual activity.',
        },
        data: {
          type: 'security_alert',
          eventType: 'suspicious_activity',
          eventId: 'event-456',
          eventData: '{}',
        },
      };

      handleSecurityAlert(message as any, mockShowBanner, mockNavigate);

      setTimeout(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Suspicious Activity',
          expect.stringContaining('We detected unusual activity'),
          expect.arrayContaining([
            expect.objectContaining({ text: 'Review Now' }),
            expect.objectContaining({ text: 'Later' }),
          ])
        );
        done();
      }, 600);
    });

    it('should not show system alert for non-critical events', done => {
      const mockShowBanner = jest.fn();
      const mockNavigate = jest.fn();

      const message = {
        notification: {
          title: 'Password Changed',
          body: 'Your password was changed.',
        },
        data: {
          type: 'security_alert',
          eventType: 'password_change',
          eventId: 'event-789',
          eventData: '{}',
        },
      };

      handleSecurityAlert(message as any, mockShowBanner, mockNavigate);

      setTimeout(() => {
        expect(Alert.alert).not.toHaveBeenCalled();
        done();
      }, 600);
    });
  });

  describe('handleSecurityAlertPress', () => {
    it('should navigate to SecuritySettings for failed_login', () => {
      const mockNavigate = jest.fn();

      handleSecurityAlertPress('failed_login', mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith('SecuritySettings');
    });

    it('should navigate to ChangePassword for password_change', () => {
      const mockNavigate = jest.fn();

      handleSecurityAlertPress('password_change', mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith('ChangePassword');
    });

    it('should navigate to ChangePIN for pin_change', () => {
      const mockNavigate = jest.fn();

      handleSecurityAlertPress('pin_change', mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith('ChangePIN');
    });

    it('should navigate to SecuritySettings for new_device_login', () => {
      const mockNavigate = jest.fn();

      handleSecurityAlertPress('new_device_login', mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith('SecuritySettings');
    });
  });

  describe('getSecurityEventIcon', () => {
    it('should return correct icon for each event type', () => {
      expect(getSecurityEventIcon('failed_login')).toBe('alert-circle');
      expect(getSecurityEventIcon('password_change')).toBe('key');
      expect(getSecurityEventIcon('suspicious_activity')).toBe('alert-triangle');
      expect(getSecurityEventIcon('account_locked')).toBe('lock');
      expect(getSecurityEventIcon('new_device_login')).toBe('smartphone');
      expect(getSecurityEventIcon('pin_change')).toBe('shield');
    });

    it('should return default icon for unknown event type', () => {
      expect(getSecurityEventIcon('unknown' as any)).toBe('alert-triangle');
    });
  });
});
```

---

## Dependencies

- @react-native-firebase/messaging
- React Navigation
- NotificationBanner component (TASK-286)
- notificationHandler service (TASK-289)

---

## Definition of Done

- [ ] Security alert handler implemented
- [ ] Parse security event data working
- [ ] High-priority banner shown
- [ ] System alerts shown for critical events
- [ ] Navigation working for all event types
- [ ] All security event types handled
- [ ] Updated notification handler integration
- [ ] All unit tests passing
- [ ] 100% code coverage achieved
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-052](../stories/US-052-security-alert-notifications.md), [TASK-289](TASK-289-notification-handler.md), [TASK-293](TASK-293-supabase-edge-function-security.md)
