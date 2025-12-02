# TASK-287: FCM Setup RNTL Tests

**ID**: TASK-287 | **Epic**: [EPIC-026](../epics/EPIC-026-push-notifications.md) | **User Story**: [US-050](../stories/US-050-fcm-setup-permission-handling.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Write full React Native Testing Library tests for FCM setup and permission handling. Test FCM service initialization, token management, permission service, and NotificationBanner component integration. Achieve 100% code coverage.

---

## Acceptance Criteria

- [ ] Complete RNTL test suite for fcmService
- [ ] Complete tests for permissionService
- [ ] Complete tests for tokenService
- [ ] Complete tests for NotificationBanner integration
- [ ] Edge cases tested (permission denial, token refresh, errors)
- [ ] 100% code coverage
- [ ] All tests passing

---

## Implementation Details

### Full RNTL Test Suite

```typescript
// src/services/notifications/__tests__/FCMIntegration.test.ts

import messaging from '@react-native-firebase/messaging';
import { Alert, Linking } from 'react-native';
import {
  initializeFCM,
  getFCMToken,
  deleteFCMToken,
  subscribeToTopic,
  unsubscribeFromTopic,
  onTokenRefresh,
  onNotification,
  onNotificationOpenedApp,
  getInitialNotification,
  setBadgeCount,
  clearAllNotifications,
} from '../fcmService';
import {
  checkNotificationPermission,
  requestNotificationPermission,
  requestPermissionWithGuidance,
  showPermissionDeniedAlert,
  showPermissionRationaleAlert,
  areNotificationsEnabled,
} from '../permissionService';
import {
  saveTokenToSupabase,
  refreshToken,
  deleteTokenFromSupabase,
  getAllUserTokens,
} from '../tokenService';

jest.mock('@react-native-firebase/messaging');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openSettings: jest.fn(),
}));

const mockMessaging = messaging as jest.Mocked<typeof messaging>;

describe('FCM Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockMessaging.mockReturnValue({
      getToken: jest.fn().mockResolvedValue('mock-fcm-token'),
      deleteToken: jest.fn().mockResolvedValue(undefined),
      subscribeToTopic: jest.fn().mockResolvedValue(undefined),
      unsubscribeFromTopic: jest.fn().mockResolvedValue(undefined),
      hasPermission: jest.fn().mockResolvedValue(messaging.AuthorizationStatus.AUTHORIZED),
      requestPermission: jest.fn().mockResolvedValue(messaging.AuthorizationStatus.AUTHORIZED),
      onTokenRefresh: jest.fn(callback => () => {}),
      onMessage: jest.fn(callback => () => {}),
      onNotificationOpenedApp: jest.fn(callback => () => {}),
      getInitialNotification: jest.fn().mockResolvedValue(null),
      setBackgroundMessageHandler: jest.fn(),
      registerDeviceForRemoteMessages: jest.fn().mockResolvedValue(undefined),
      createChannel: jest.fn().mockResolvedValue(undefined),
      setApplicationBadge: jest.fn().mockResolvedValue(undefined),
      cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
    } as any);
  });

  describe('FCM Service Initialization Flow', () => {
    it('should complete full initialization on iOS', async () => {
      jest.mock('react-native/Libraries/Utilities/Platform', () => ({
        OS: 'ios',
      }));

      await initializeFCM();

      expect(mockMessaging().setBackgroundMessageHandler).toHaveBeenCalled();
      expect(mockMessaging().registerDeviceForRemoteMessages).toHaveBeenCalled();
      expect(mockMessaging().createChannel).not.toHaveBeenCalled();
    });

    it('should complete full initialization on Android', async () => {
      jest.mock('react-native/Libraries/Utilities/Platform', () => ({
        OS: 'android',
      }));

      await initializeFCM();

      expect(mockMessaging().setBackgroundMessageHandler).toHaveBeenCalled();
      expect(mockMessaging().registerDeviceForRemoteMessages).not.toHaveBeenCalled();
      expect(mockMessaging().createChannel).toHaveBeenCalledTimes(3); // chat, security, general channels
    });

    it('should create all Android notification channels', async () => {
      jest.mock('react-native/Libraries/Utilities/Platform', () => ({
        OS: 'android',
      }));

      await initializeFCM();

      expect(mockMessaging().createChannel).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'chat_messages',
          name: 'Chat Messages',
          importance: messaging.Importance.HIGH,
        })
      );

      expect(mockMessaging().createChannel).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'security_alerts',
          name: 'Security Alerts',
          importance: messaging.Importance.MAX,
        })
      );

      expect(mockMessaging().createChannel).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'general',
          name: 'General Notifications',
          importance: messaging.Importance.DEFAULT,
        })
      );
    });

    it('should handle initialization errors gracefully', async () => {
      mockMessaging().setBackgroundMessageHandler.mockImplementation(() => {
        throw new Error('Initialization failed');
      });

      await expect(initializeFCM()).rejects.toThrow('Initialization failed');
    });
  });

  describe('Token Management Flow', () => {
    it('should get FCM token successfully', async () => {
      const token = await getFCMToken();

      expect(token).toBe('mock-fcm-token');
      expect(mockMessaging().getToken).toHaveBeenCalled();
    });

    it('should throw error when token is null', async () => {
      mockMessaging().getToken.mockResolvedValue(null as any);

      await expect(getFCMToken()).rejects.toThrow('Failed to get FCM token');
    });

    it('should delete FCM token successfully', async () => {
      await deleteFCMToken();

      expect(mockMessaging().deleteToken).toHaveBeenCalled();
    });

    it('should handle token refresh with callback', () => {
      const callback = jest.fn();
      const mockToken = 'refreshed-token';

      mockMessaging().onTokenRefresh.mockImplementation(cb => {
        cb(mockToken);
        return () => {};
      });

      const unsubscribe = onTokenRefresh(callback);

      expect(callback).toHaveBeenCalledWith(mockToken);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should subscribe to topic successfully', async () => {
      await subscribeToTopic('test-topic');

      expect(mockMessaging().subscribeToTopic).toHaveBeenCalledWith('test-topic');
    });

    it('should unsubscribe from topic successfully', async () => {
      await unsubscribeFromTopic('test-topic');

      expect(mockMessaging().unsubscribeFromTopic).toHaveBeenCalledWith('test-topic');
    });
  });

  describe('Permission Management Flow', () => {
    it('should check permission status - granted', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.AUTHORIZED);

      const result = await checkNotificationPermission();

      expect(result.status).toBe('granted');
      expect(result.canRequest).toBe(false);
      expect(result.shouldShowRationale).toBe(false);
    });

    it('should check permission status - denied', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.DENIED);

      const result = await checkNotificationPermission();

      expect(result.status).toBe('denied');
      expect(result.canRequest).toBe(false);
      expect(result.shouldShowRationale).toBe(true);
    });

    it('should check permission status - not-determined', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.NOT_DETERMINED);

      const result = await checkNotificationPermission();

      expect(result.status).toBe('not-determined');
      expect(result.canRequest).toBe(true);
      expect(result.shouldShowRationale).toBe(false);
    });

    it('should check permission status - provisional', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.PROVISIONAL);

      const result = await checkNotificationPermission();

      expect(result.status).toBe('provisional');
    });

    it('should request permission successfully', async () => {
      mockMessaging().requestPermission.mockResolvedValue(messaging.AuthorizationStatus.AUTHORIZED);

      const status = await requestNotificationPermission();

      expect(status).toBe('granted');
      expect(mockMessaging().requestPermission).toHaveBeenCalledWith({
        alert: true,
        badge: true,
        sound: true,
        announcement: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
      });
    });

    it('should request permission and receive denial', async () => {
      mockMessaging().requestPermission.mockResolvedValue(messaging.AuthorizationStatus.DENIED);

      const status = await requestNotificationPermission();

      expect(status).toBe('denied');
    });

    it('should handle permission request errors', async () => {
      mockMessaging().requestPermission.mockRejectedValue(new Error('Permission request failed'));

      await expect(requestNotificationPermission()).rejects.toThrow();
    });
  });

  describe('Permission Guidance Flow', () => {
    it('should return granted immediately if already granted', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.AUTHORIZED);

      const status = await requestPermissionWithGuidance();

      expect(status).toBe('granted');
      expect(mockMessaging().requestPermission).not.toHaveBeenCalled();
    });

    it('should show settings alert if denied', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.DENIED);

      const status = await requestPermissionWithGuidance();

      expect(status).toBe('denied');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Notifications Disabled',
        expect.any(String),
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel' }),
          expect.objectContaining({ text: 'Open Settings' }),
        ])
      );
    });

    it('should request permission if not-determined', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.NOT_DETERMINED);
      mockMessaging().requestPermission.mockResolvedValue(messaging.AuthorizationStatus.AUTHORIZED);

      const status = await requestPermissionWithGuidance();

      expect(status).toBe('granted');
      expect(mockMessaging().requestPermission).toHaveBeenCalled();
    });

    it('should open settings when user taps Open Settings', () => {
      showPermissionDeniedAlert();

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const openSettingsButton = alertCall[2].find(
        (button: any) => button.text === 'Open Settings'
      );

      openSettingsButton.onPress();

      expect(Linking.openSettings).toHaveBeenCalled();
    });

    it('should show permission rationale with callbacks', () => {
      const onAccept = jest.fn();
      const onCancel = jest.fn();

      showPermissionRationaleAlert(onAccept, onCancel);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Enable Notifications',
        expect.any(String),
        expect.arrayContaining([
          expect.objectContaining({ text: 'Not Now' }),
          expect.objectContaining({ text: 'Enable' }),
        ])
      );
    });

    it('should check if notifications are enabled - granted', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.AUTHORIZED);

      const enabled = await areNotificationsEnabled();

      expect(enabled).toBe(true);
    });

    it('should check if notifications are enabled - provisional', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.PROVISIONAL);

      const enabled = await areNotificationsEnabled();

      expect(enabled).toBe(true);
    });

    it('should check if notifications are enabled - denied', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.DENIED);

      const enabled = await areNotificationsEnabled();

      expect(enabled).toBe(false);
    });

    it('should return false on error when checking if enabled', async () => {
      mockMessaging().hasPermission.mockRejectedValue(new Error('Permission check failed'));

      const enabled = await areNotificationsEnabled();

      expect(enabled).toBe(false);
    });
  });

  describe('Notification Listeners', () => {
    it('should set up foreground notification listener', () => {
      const callback = jest.fn();
      const mockMessage = {
        messageId: '123',
        notification: {
          title: 'Test',
          body: 'Message',
        },
      };

      mockMessaging().onMessage.mockImplementation(cb => {
        cb(mockMessage as any);
        return () => {};
      });

      const unsubscribe = onNotification(callback);

      expect(callback).toHaveBeenCalledWith(mockMessage);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should set up notification opened app listener', () => {
      const callback = jest.fn();
      const mockMessage = {
        messageId: '456',
        notification: {
          title: 'Opened',
          body: 'App',
        },
      };

      mockMessaging().onNotificationOpenedApp.mockImplementation(cb => {
        cb(mockMessage as any);
        return () => {};
      });

      const unsubscribe = onNotificationOpenedApp(callback);

      expect(callback).toHaveBeenCalledWith(mockMessage);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should get initial notification when app opened from killed state', async () => {
      const mockMessage = {
        messageId: '789',
        notification: {
          title: 'Initial',
          body: 'Notification',
        },
      };

      mockMessaging().getInitialNotification.mockResolvedValue(mockMessage as any);

      const initialNotification = await getInitialNotification();

      expect(initialNotification).toEqual(mockMessage);
    });

    it('should return null when no initial notification', async () => {
      mockMessaging().getInitialNotification.mockResolvedValue(null);

      const initialNotification = await getInitialNotification();

      expect(initialNotification).toBeNull();
    });

    it('should handle initial notification errors gracefully', async () => {
      mockMessaging().getInitialNotification.mockRejectedValue(
        new Error('Failed to get initial notification')
      );

      const initialNotification = await getInitialNotification();

      expect(initialNotification).toBeNull();
    });
  });

  describe('Badge and Notification Management', () => {
    it('should set badge count on iOS', async () => {
      jest.mock('react-native/Libraries/Utilities/Platform', () => ({
        OS: 'ios',
      }));

      await setBadgeCount(5);

      expect(mockMessaging().setApplicationBadge).toHaveBeenCalledWith(5);
    });

    it('should not set badge count on Android', async () => {
      jest.mock('react-native/Libraries/Utilities/Platform', () => ({
        OS: 'android',
      }));

      await setBadgeCount(5);

      expect(mockMessaging().setApplicationBadge).not.toHaveBeenCalled();
    });

    it('should clear all notifications', async () => {
      await clearAllNotifications();

      expect(mockMessaging().cancelAllNotifications).toHaveBeenCalled();
    });

    it('should handle clear notifications errors gracefully', async () => {
      mockMessaging().cancelAllNotifications.mockRejectedValue(new Error('Failed to clear'));

      await expect(clearAllNotifications()).resolves.not.toThrow();
    });
  });

  describe('Complete User Journey', () => {
    it('should complete full onboarding flow with permission grant', async () => {
      // 1. Initialize FCM
      await initializeFCM();
      expect(mockMessaging().setBackgroundMessageHandler).toHaveBeenCalled();

      // 2. Check permission (not-determined)
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.NOT_DETERMINED);
      const permissionResult = await checkNotificationPermission();
      expect(permissionResult.status).toBe('not-determined');
      expect(permissionResult.canRequest).toBe(true);

      // 3. Request permission (granted)
      mockMessaging().requestPermission.mockResolvedValue(messaging.AuthorizationStatus.AUTHORIZED);
      const status = await requestNotificationPermission();
      expect(status).toBe('granted');

      // 4. Get FCM token
      const token = await getFCMToken();
      expect(token).toBe('mock-fcm-token');

      // 5. Subscribe to topics
      await subscribeToTopic('user-notifications');
      expect(mockMessaging().subscribeToTopic).toHaveBeenCalledWith('user-notifications');
    });

    it('should complete full flow with permission denial and settings navigation', async () => {
      // 1. Initialize FCM
      await initializeFCM();

      // 2. Check permission (denied)
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.DENIED);
      const permissionResult = await checkNotificationPermission();
      expect(permissionResult.status).toBe('denied');
      expect(permissionResult.shouldShowRationale).toBe(true);

      // 3. Request with guidance (shows settings alert)
      const status = await requestPermissionWithGuidance();
      expect(status).toBe('denied');
      expect(Alert.alert).toHaveBeenCalled();

      // 4. User opens settings
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const openSettingsButton = alertCall[2].find(
        (button: any) => button.text === 'Open Settings'
      );
      openSettingsButton.onPress();
      expect(Linking.openSettings).toHaveBeenCalled();
    });

    it('should complete logout flow with token deletion', async () => {
      // 1. Get current token
      const token = await getFCMToken();
      expect(token).toBe('mock-fcm-token');

      // 2. Unsubscribe from topics
      await unsubscribeFromTopic('user-notifications');
      expect(mockMessaging().unsubscribeFromTopic).toHaveBeenCalledWith('user-notifications');

      // 3. Delete FCM token
      await deleteFCMToken();
      expect(mockMessaging().deleteToken).toHaveBeenCalled();
    });
  });
});
```

---

## Dependencies

- `@testing-library/react-native`
- `@testing-library/jest-native`
- Jest
- fcmService (TASK-283)
- permissionService (TASK-284)
- tokenService (TASK-285)

---

## Definition of Done

- [ ] All FCM service tests passing
- [ ] All permission service tests passing
- [ ] All token service tests passing
- [ ] Notification listeners tested
- [ ] Permission flows tested
- [ ] Token management tested
- [ ] User journey tests passing
- [ ] Error handling tested
- [ ] Edge cases tested
- [ ] 100% code coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-050](../stories/US-050-fcm-setup-permission-handling.md), [TASK-283](TASK-283-fcm-service-setup.md), [TASK-284](TASK-284-permission-handling.md), [TASK-285](TASK-285-save-token-supabase.md)
