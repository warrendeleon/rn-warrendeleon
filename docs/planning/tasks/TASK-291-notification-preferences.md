# TASK-291: Notification Preferences

**ID**: TASK-291 | **Epic**: [EPIC-026](../epics/EPIC-026-push-notifications.md) | **User Story**: [US-051](../stories/US-051-chat-message-notifications.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Create a notification preferences screen that allows users to control which types of notifications they receive. Implement preferences for chat messages, security alerts, and general notifications. Store preferences in Supabase database and respect them when sending push notifications.

---

## Acceptance Criteria

- [ ] NotificationPreferencesScreen created in `src/screens/settings/NotificationPreferencesScreen.tsx`
- [ ] Toggle switches for each notification type (chat, security, general)
- [ ] Save preferences to Supabase via custom REST API
- [ ] Load preferences on mount
- [ ] Update local state immediately on toggle
- [ ] Show loading states during API calls
- [ ] Show error states if API fails
- [ ] EAA compliant with proper accessibility
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Notification Preferences Screen

```typescript
// src/screens/settings/NotificationPreferencesScreen.tsx

import React, { useEffect, useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  Divider,
} from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  NotificationPreferences,
} from '../../services/notifications/notificationPreferencesService';

export const NotificationPreferencesScreen: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    chat_messages_enabled: true,
    security_alerts_enabled: true,
    general_notifications_enabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Load preferences on mount
   */
  useEffect(() => {
    loadPreferences();
  }, []);

  /**
   * Load notification preferences
   */
  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      Alert.alert(
        'Error',
        'Failed to load notification preferences. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle preference toggle
   */
  const handleToggle = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    try {
      // Optimistically update UI
      setPreferences((prev) => ({
        ...prev,
        [key]: value,
      }));

      setIsSaving(true);

      // Update in database
      await updateNotificationPreferences({
        [key]: value,
      });
    } catch (error) {
      console.error('Failed to update preference:', error);

      // Revert optimistic update
      setPreferences((prev) => ({
        ...prev,
        [key]: !value,
      }));

      Alert.alert(
        'Error',
        'Failed to update notification preferences. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} testID="notification-preferences-screen">
      <ScrollView>
        <Box padding="$4">
          <VStack space="lg">
            {/* Header */}
            <VStack space="xs">
              <Text fontSize="$2xl" fontWeight="$bold">
                Notification Preferences
              </Text>
              <Text fontSize="$sm" color="$coolGray600">
                Control which notifications you receive
              </Text>
            </VStack>

            <Divider />

            {/* Chat Messages */}
            <HStack
              justifyContent="space-between"
              alignItems="center"
              testID="chat-messages-preference"
            >
              <VStack flex={1} space="xs">
                <Text fontSize="$md" fontWeight="$semibold">
                  Chat Messages
                </Text>
                <Text fontSize="$sm" color="$coolGray600">
                  Receive notifications for new chat messages
                </Text>
              </VStack>
              <Switch
                value={preferences.chat_messages_enabled}
                onValueChange={(value) =>
                  handleToggle('chat_messages_enabled', value)
                }
                disabled={isSaving}
                accessibilityRole="switch"
                accessibilityLabel="Chat messages notifications"
                accessibilityHint={
                  preferences.chat_messages_enabled
                    ? 'Tap to disable chat message notifications'
                    : 'Tap to enable chat message notifications'
                }
                accessibilityState={{
                  checked: preferences.chat_messages_enabled,
                  disabled: isSaving,
                }}
                testID="chat-messages-switch"
              />
            </HStack>

            <Divider />

            {/* Security Alerts */}
            <HStack
              justifyContent="space-between"
              alignItems="center"
              testID="security-alerts-preference"
            >
              <VStack flex={1} space="xs">
                <Text fontSize="$md" fontWeight="$semibold">
                  Security Alerts
                </Text>
                <Text fontSize="$sm" color="$coolGray600">
                  Receive notifications for security-related events
                </Text>
              </VStack>
              <Switch
                value={preferences.security_alerts_enabled}
                onValueChange={(value) =>
                  handleToggle('security_alerts_enabled', value)
                }
                disabled={isSaving}
                accessibilityRole="switch"
                accessibilityLabel="Security alerts notifications"
                accessibilityHint={
                  preferences.security_alerts_enabled
                    ? 'Tap to disable security alert notifications'
                    : 'Tap to enable security alert notifications'
                }
                accessibilityState={{
                  checked: preferences.security_alerts_enabled,
                  disabled: isSaving,
                }}
                testID="security-alerts-switch"
              />
            </HStack>

            <Divider />

            {/* General Notifications */}
            <HStack
              justifyContent="space-between"
              alignItems="center"
              testID="general-notifications-preference"
            >
              <VStack flex={1} space="xs">
                <Text fontSize="$md" fontWeight="$semibold">
                  General Notifications
                </Text>
                <Text fontSize="$sm" color="$coolGray600">
                  Receive general app notifications
                </Text>
              </VStack>
              <Switch
                value={preferences.general_notifications_enabled}
                onValueChange={(value) =>
                  handleToggle('general_notifications_enabled', value)
                }
                disabled={isSaving}
                accessibilityRole="switch"
                accessibilityLabel="General notifications"
                accessibilityHint={
                  preferences.general_notifications_enabled
                    ? 'Tap to disable general notifications'
                    : 'Tap to enable general notifications'
                }
                accessibilityState={{
                  checked: preferences.general_notifications_enabled,
                  disabled: isSaving,
                }}
                testID="general-notifications-switch"
              />
            </HStack>

            <Divider />

            {/* Info text */}
            <Box
              backgroundColor="$blue50"
              padding="$3"
              borderRadius="$md"
              testID="info-banner"
            >
              <Text fontSize="$sm" color="$blue900">
                Note: You can change these preferences at any time. Security
                alerts are highly recommended to keep your account safe.
              </Text>
            </Box>
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
};
```

---

### Notification Preferences Service

```typescript
// src/services/notifications/notificationPreferencesService.ts

import axios from 'axios';
import { z } from 'zod';
import { SecureStore } from '@app/utils/storage/SecureStore';

const SUPABASE_URL = process.env.SUPABASE_URL!;

/**
 * Notification preferences schema
 */
export const NotificationPreferencesSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  chat_messages_enabled: z.boolean(),
  security_alerts_enabled: z.boolean(),
  general_notifications_enabled: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

export type NotificationPreferencesUpdate = Partial<
  Pick<
    NotificationPreferences,
    'chat_messages_enabled' | 'security_alerts_enabled' | 'general_notifications_enabled'
  >
>;

const NotificationPreferencesResponseSchema = z.array(NotificationPreferencesSchema);

/**
 * Get notification preferences for current user
 */
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  try {
    const accessToken = await SecureStore.get('accessToken');

    const response = await axios.get(`${SUPABASE_URL}/rest/v1/notification_preferences`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      params: {
        select: '*',
      },
    });

    const preferences = NotificationPreferencesResponseSchema.parse(response.data);

    // Return first (and only) preferences for user
    if (preferences.length > 0) {
      return preferences[0];
    }

    // If no preferences exist, create default ones
    return createDefaultPreferences();
  } catch (error) {
    console.error('Failed to get notification preferences:', error);
    throw error;
  }
};

/**
 * Create default notification preferences
 */
const createDefaultPreferences = async (): Promise<NotificationPreferences> => {
  try {
    const accessToken = await SecureStore.get('accessToken');

    const response = await axios.post(
      `${SUPABASE_URL}/rest/v1/notification_preferences`,
      {
        chat_messages_enabled: true,
        security_alerts_enabled: true,
        general_notifications_enabled: true,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
      }
    );

    return NotificationPreferencesResponseSchema.parse(response.data)[0];
  } catch (error) {
    console.error('Failed to create default preferences:', error);
    throw error;
  }
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (
  updates: NotificationPreferencesUpdate
): Promise<NotificationPreferences> => {
  try {
    const accessToken = await SecureStore.get('accessToken');

    const response = await axios.patch(
      `${SUPABASE_URL}/rest/v1/notification_preferences`,
      updates,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
      }
    );

    return NotificationPreferencesResponseSchema.parse(response.data)[0];
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    throw error;
  }
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/screens/settings/__tests__/NotificationPreferencesScreen.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { NotificationPreferencesScreen } from '../NotificationPreferencesScreen';
import * as notificationPreferencesService from '../../../services/notifications/notificationPreferencesService';

jest.mock('../../../services/notifications/notificationPreferencesService');

const mockPreferences = {
  id: 'pref-123',
  user_id: 'user-456',
  chat_messages_enabled: true,
  security_alerts_enabled: true,
  general_notifications_enabled: false,
  created_at: '2025-01-21T00:00:00Z',
  updated_at: '2025-01-21T00:00:00Z',
};

describe('NotificationPreferencesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (
      notificationPreferencesService.getNotificationPreferences as jest.Mock
    ).mockReturnValue(new Promise(() => {})); // Never resolves

    const { getByTestId } = render(<NotificationPreferencesScreen />);

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('should load and display preferences', async () => {
    (
      notificationPreferencesService.getNotificationPreferences as jest.Mock
    ).mockResolvedValue(mockPreferences);

    const { getByTestId, queryByTestId } = render(
      <NotificationPreferencesScreen />
    );

    await waitFor(() => {
      expect(queryByTestId('loading-spinner')).toBeNull();
    });

    expect(getByTestId('notification-preferences-screen')).toBeTruthy();
    expect(getByTestId('chat-messages-switch')).toHaveProp('value', true);
    expect(getByTestId('security-alerts-switch')).toHaveProp('value', true);
    expect(getByTestId('general-notifications-switch')).toHaveProp(
      'value',
      false
    );
  });

  it('should toggle chat messages preference', async () => {
    (
      notificationPreferencesService.getNotificationPreferences as jest.Mock
    ).mockResolvedValue(mockPreferences);
    (
      notificationPreferencesService.updateNotificationPreferences as jest.Mock
    ).mockResolvedValue({
      ...mockPreferences,
      chat_messages_enabled: false,
    });

    const { getByTestId } = render(<NotificationPreferencesScreen />);

    await waitFor(() => {
      expect(getByTestId('chat-messages-switch')).toBeTruthy();
    });

    fireEvent(getByTestId('chat-messages-switch'), 'valueChange', false);

    await waitFor(() => {
      expect(
        notificationPreferencesService.updateNotificationPreferences
      ).toHaveBeenCalledWith({
        chat_messages_enabled: false,
      });
    });
  });

  it('should handle update errors and revert optimistic update', async () => {
    (
      notificationPreferencesService.getNotificationPreferences as jest.Mock
    ).mockResolvedValue(mockPreferences);
    (
      notificationPreferencesService.updateNotificationPreferences as jest.Mock
    ).mockRejectedValue(new Error('Update failed'));

    const mockAlert = jest.spyOn(Alert, 'alert');

    const { getByTestId } = render(<NotificationPreferencesScreen />);

    await waitFor(() => {
      expect(getByTestId('security-alerts-switch')).toBeTruthy();
    });

    fireEvent(getByTestId('security-alerts-switch'), 'valueChange', false);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Error',
        'Failed to update notification preferences. Please try again.'
      );
    });

    // Should revert to original value
    expect(getByTestId('security-alerts-switch')).toHaveProp('value', true);
  });

  it('should have proper accessibility props', async () => {
    (
      notificationPreferencesService.getNotificationPreferences as jest.Mock
    ).mockResolvedValue(mockPreferences);

    const { getByTestId } = render(<NotificationPreferencesScreen />);

    await waitFor(() => {
      expect(getByTestId('chat-messages-switch')).toBeTruthy();
    });

    const chatSwitch = getByTestId('chat-messages-switch');
    expect(chatSwitch).toHaveProp('accessibilityRole', 'switch');
    expect(chatSwitch).toHaveProp(
      'accessibilityLabel',
      'Chat messages notifications'
    );
    expect(chatSwitch).toHaveProp('accessibilityState', {
      checked: true,
      disabled: false,
    });
  });
});
```

---

## Dependencies

- React Navigation
- @gluestack-ui/themed
- Axios
- Zod
- SecureStore utility (access token retrieval from TASK-196)

---

## Definition of Done

- [ ] NotificationPreferencesScreen implemented
- [ ] Toggle switches for all notification types
- [ ] Preferences saved to Supabase
- [ ] Preferences loaded on mount
- [ ] Optimistic updates working
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] EAA compliant with accessibility props
- [ ] Service layer implemented
- [ ] All unit tests passing
- [ ] 100% code coverage achieved
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-051](../stories/US-051-chat-message-notifications.md), [TASK-288](TASK-288-supabase-edge-function-chat.md)
