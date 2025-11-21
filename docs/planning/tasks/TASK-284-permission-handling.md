# TASK-284: Permission Handling

**ID**: TASK-284 | **Epic**: [EPIC-026](../epics/EPIC-026-push-notifications.md) | **User Story**: [US-050](../stories/US-050-fcm-setup-permission-handling.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Implement comprehensive notification permission handling for iOS and Android. Request permissions, handle different permission states (granted, denied, provisional), provide clear user messaging, and guide users to settings when needed.

---

## Acceptance Criteria

- [ ] Permission service created in `src/services/notifications/permissionService.ts`
- [ ] Request notification permissions
- [ ] Handle all permission states (granted, denied, provisional, not-determined)
- [ ] Provide user-friendly messaging
- [ ] Guide users to settings on denial
- [ ] Platform-specific handling (iOS/Android)
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Permission Service

```typescript
// src/services/notifications/permissionService.ts

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform, Alert, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, PermissionStatus } from 'react-native-permissions';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'not-determined' | 'provisional';

export interface PermissionResult {
  status: NotificationPermissionStatus;
  canRequest: boolean;
  shouldShowRationale: boolean;
}

/**
 * Check notification permission status
 */
export const checkNotificationPermission = async (): Promise<PermissionResult> => {
  try {
    const authStatus = await messaging().hasPermission();

    let status: NotificationPermissionStatus;
    let canRequest = false;
    let shouldShowRationale = false;

    switch (authStatus) {
      case messaging.AuthorizationStatus.AUTHORIZED:
      case messaging.AuthorizationStatus.PROVISIONAL:
        status =
          authStatus === messaging.AuthorizationStatus.PROVISIONAL ? 'provisional' : 'granted';
        break;

      case messaging.AuthorizationStatus.DENIED:
        status = 'denied';
        shouldShowRationale = true;
        break;

      case messaging.AuthorizationStatus.NOT_DETERMINED:
      default:
        status = 'not-determined';
        canRequest = true;
        break;
    }

    return {
      status,
      canRequest,
      shouldShowRationale,
    };
  } catch (error) {
    console.error('Failed to check notification permission:', error);
    throw error;
  }
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermissionStatus> => {
  try {
    const authStatus = await messaging().requestPermission({
      alert: true,
      badge: true,
      sound: true,
      announcement: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
    });

    switch (authStatus) {
      case messaging.AuthorizationStatus.AUTHORIZED:
        return 'granted';

      case messaging.AuthorizationStatus.PROVISIONAL:
        return 'provisional';

      case messaging.AuthorizationStatus.DENIED:
        return 'denied';

      case messaging.AuthorizationStatus.NOT_DETERMINED:
      default:
        return 'not-determined';
    }
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    throw error;
  }
};

/**
 * Show permission denial alert with settings navigation
 */
export const showPermissionDeniedAlert = (): void => {
  Alert.alert(
    'Notifications Disabled',
    'Please enable notifications in your device settings to receive important updates.',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => {
          Linking.openSettings();
        },
      },
    ]
  );
};

/**
 * Show permission rationale alert
 */
export const showPermissionRationaleAlert = (onAccept: () => void, onCancel?: () => void): void => {
  Alert.alert(
    'Enable Notifications',
    'Stay updated with new messages and important security alerts. You can change this later in settings.',
    [
      {
        text: 'Not Now',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Enable',
        onPress: onAccept,
      },
    ]
  );
};

/**
 * Request permission with user guidance
 */
export const requestPermissionWithGuidance = async (): Promise<NotificationPermissionStatus> => {
  try {
    // Check current permission status
    const permissionResult = await checkNotificationPermission();

    // If already granted, return immediately
    if (permissionResult.status === 'granted') {
      return 'granted';
    }

    // If denied, show settings alert
    if (permissionResult.status === 'denied') {
      showPermissionDeniedAlert();
      return 'denied';
    }

    // If can request, request permission
    if (permissionResult.canRequest) {
      const status = await requestNotificationPermission();
      return status;
    }

    return permissionResult.status;
  } catch (error) {
    console.error('Failed to request permission with guidance:', error);
    throw error;
  }
};

/**
 * Check if notifications are enabled (helper)
 */
export const areNotificationsEnabled = async (): Promise<boolean> => {
  try {
    const result = await checkNotificationPermission();
    return result.status === 'granted' || result.status === 'provisional';
  } catch (error) {
    console.error('Failed to check if notifications are enabled:', error);
    return false;
  }
};
```

---

### Usage Hook

```typescript
// src/hooks/notifications/useNotificationPermission.ts

import { useState, useEffect, useCallback } from 'react';
import {
  checkNotificationPermission,
  requestNotificationPermission,
  requestPermissionWithGuidance,
  showPermissionRationaleAlert,
  NotificationPermissionStatus,
  PermissionResult,
} from '../../services/notifications/permissionService';

export interface UseNotificationPermissionReturn {
  permissionStatus: NotificationPermissionStatus | null;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<NotificationPermissionStatus>;
  requestPermissionWithPrompt: () => Promise<NotificationPermissionStatus>;
  checkPermission: () => Promise<PermissionResult>;
}

export const useNotificationPermission = (): UseNotificationPermissionReturn => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check permission on mount
   */
  useEffect(() => {
    const checkInitialPermission = async () => {
      try {
        setIsLoading(true);
        const result = await checkNotificationPermission();
        setPermissionStatus(result.status);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to check notification permission';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    checkInitialPermission();
  }, []);

  /**
   * Request permission
   */
  const requestPermission = useCallback(async (): Promise<NotificationPermissionStatus> => {
    try {
      setIsLoading(true);
      setError(null);

      const status = await requestNotificationPermission();
      setPermissionStatus(status);

      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permission';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request permission with user prompt
   */
  const requestPermissionWithPrompt =
    useCallback(async (): Promise<NotificationPermissionStatus> => {
      try {
        setIsLoading(true);
        setError(null);

        const status = await requestPermissionWithGuidance();
        setPermissionStatus(status);

        return status;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to request permission';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []);

  /**
   * Check permission
   */
  const checkPermission = useCallback(async (): Promise<PermissionResult> => {
    try {
      setIsLoading(true);
      const result = await checkNotificationPermission();
      setPermissionStatus(result.status);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check permission';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    permissionStatus,
    isLoading,
    error,
    requestPermission,
    requestPermissionWithPrompt,
    checkPermission,
  };
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/services/notifications/__tests__/permissionService.test.ts

import messaging from '@react-native-firebase/messaging';
import { Alert, Linking } from 'react-native';
import {
  checkNotificationPermission,
  requestNotificationPermission,
  showPermissionDeniedAlert,
  showPermissionRationaleAlert,
  requestPermissionWithGuidance,
  areNotificationsEnabled,
} from '../permissionService';

jest.mock('@react-native-firebase/messaging');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

const mockMessaging = messaging as jest.Mocked<typeof messaging>;

describe('permissionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkNotificationPermission', () => {
    it('should return granted status', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.AUTHORIZED);

      const result = await checkNotificationPermission();

      expect(result.status).toBe('granted');
      expect(result.canRequest).toBe(false);
      expect(result.shouldShowRationale).toBe(false);
    });

    it('should return provisional status', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.PROVISIONAL);

      const result = await checkNotificationPermission();

      expect(result.status).toBe('provisional');
    });

    it('should return denied status', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.DENIED);

      const result = await checkNotificationPermission();

      expect(result.status).toBe('denied');
      expect(result.canRequest).toBe(false);
      expect(result.shouldShowRationale).toBe(true);
    });

    it('should return not-determined status', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.NOT_DETERMINED);

      const result = await checkNotificationPermission();

      expect(result.status).toBe('not-determined');
      expect(result.canRequest).toBe(true);
    });

    it('should throw error on failure', async () => {
      mockMessaging().hasPermission.mockRejectedValue(new Error('Check failed'));

      await expect(checkNotificationPermission()).rejects.toThrow();
    });
  });

  describe('requestNotificationPermission', () => {
    it('should request and return granted status', async () => {
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

    it('should return provisional status', async () => {
      mockMessaging().requestPermission.mockResolvedValue(
        messaging.AuthorizationStatus.PROVISIONAL
      );

      const status = await requestNotificationPermission();

      expect(status).toBe('provisional');
    });

    it('should return denied status', async () => {
      mockMessaging().requestPermission.mockResolvedValue(messaging.AuthorizationStatus.DENIED);

      const status = await requestNotificationPermission();

      expect(status).toBe('denied');
    });

    it('should throw error on failure', async () => {
      mockMessaging().requestPermission.mockRejectedValue(new Error('Request failed'));

      await expect(requestNotificationPermission()).rejects.toThrow();
    });
  });

  describe('showPermissionDeniedAlert', () => {
    it('should show alert with settings option', () => {
      const mockLinkingOpenSettings = jest.spyOn(Linking, 'openSettings');
      mockLinkingOpenSettings.mockImplementation(() => Promise.resolve());

      showPermissionDeniedAlert();

      expect(Alert.alert).toHaveBeenCalledWith(
        'Notifications Disabled',
        expect.any(String),
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel' }),
          expect.objectContaining({ text: 'Open Settings' }),
        ])
      );
    });
  });

  describe('showPermissionRationaleAlert', () => {
    it('should show rationale alert with callbacks', () => {
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
  });

  describe('requestPermissionWithGuidance', () => {
    it('should return granted if already granted', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.AUTHORIZED);

      const status = await requestPermissionWithGuidance();

      expect(status).toBe('granted');
      expect(mockMessaging().requestPermission).not.toHaveBeenCalled();
    });

    it('should show settings alert if denied', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.DENIED);

      const status = await requestPermissionWithGuidance();

      expect(status).toBe('denied');
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('should request permission if not-determined', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.NOT_DETERMINED);
      mockMessaging().requestPermission.mockResolvedValue(messaging.AuthorizationStatus.AUTHORIZED);

      const status = await requestPermissionWithGuidance();

      expect(status).toBe('granted');
      expect(mockMessaging().requestPermission).toHaveBeenCalled();
    });
  });

  describe('areNotificationsEnabled', () => {
    it('should return true when granted', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.AUTHORIZED);

      const result = await areNotificationsEnabled();

      expect(result).toBe(true);
    });

    it('should return true when provisional', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.PROVISIONAL);

      const result = await areNotificationsEnabled();

      expect(result).toBe(true);
    });

    it('should return false when denied', async () => {
      mockMessaging().hasPermission.mockResolvedValue(messaging.AuthorizationStatus.DENIED);

      const result = await areNotificationsEnabled();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockMessaging().hasPermission.mockRejectedValue(new Error('Check failed'));

      const result = await areNotificationsEnabled();

      expect(result).toBe(false);
    });
  });
});
```

---

## Dependencies

- @react-native-firebase/messaging
- react-native-permissions
- React Native (Alert, Linking)

---

## Definition of Done

- [ ] Permission service implemented
- [ ] Check permission working
- [ ] Request permission working
- [ ] Permission states handled
- [ ] User messaging implemented
- [ ] Settings navigation working
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-050](../stories/US-050-fcm-setup-permission-handling.md), [TASK-283](TASK-283-fcm-service-setup.md), [TASK-285](TASK-285-save-token-supabase.md)
