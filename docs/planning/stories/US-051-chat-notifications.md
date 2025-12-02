# US-051: Chat Message Notifications

**ID**: US-051 | **Epic**: [EPIC-026](../epics/EPIC-026-push-notifications.md) | **Title**: Push Notifications for New Chat Messages
**Status**: 📋 To Do | **Priority**: High | **Story Points**: 3 | **Effort**: 6.5h

---

## User Story

**As a** registered user
**I want to** receive push notifications when the admin sends me a message
**So that** I can respond quickly and stay engaged with support conversations

---

## Acceptance Criteria

### Functional Requirements

1. **Notification Trigger**
   - [ ] When admin sends message: Trigger push notification to user
   - [ ] Notification sent via Supabase Edge Function
   - [ ] Only send if user is not currently viewing the chat

2. **Notification Content**
   - [ ] Title: "New message from Admin"
   - [ ] Body: First 100 characters of message content
   - [ ] Data payload includes: `type: 'new_message'`, `conversationId`

3. **Notification Tap**
   - [ ] Tap notification: Open app to ChatScreen
   - [ ] Navigate to correct conversation (using `conversationId`)
   - [ ] Mark messages as read automatically

4. **Notification Settings**
   - [ ] User can disable chat notifications in Settings
   - [ ] Preference saved in Supabase `user_preferences` table

### Non-Functional Requirements

1. **Performance**
   - [ ] Notification delivery: <3 seconds
   - [ ] Deep link navigation: <500ms

2. **Accessibility (EAA)**
   - [ ] Notification content accessible
   - [ ] Deep link destination accessible

3. **Testing**
   - [ ] 100% RNTL coverage for notification handling
   - [ ] E2E test for notification flow
   - [ ] Manual testing on real devices

---

## Technical Implementation

### Supabase Edge Function (Send Notification)

```typescript
// supabase/functions/send-chat-notification/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async req => {
  try {
    const { conversationId, message } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Get conversation details
    const { data: conversation } = await supabase
      .from('conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      return new Response(JSON.stringify({ error: 'Conversation not found' }), { status: 404 });
    }

    // 2. Get user's FCM tokens
    const { data: devices } = await supabase
      .from('user_devices')
      .select('device_token, platform')
      .eq('user_id', conversation.user_id);

    if (!devices || devices.length === 0) {
      return new Response(JSON.stringify({ error: 'No devices found' }), { status: 404 });
    }

    // 3. Send FCM notifications
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY')!;

    const promises = devices.map(device => {
      return fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${fcmServerKey}`,
        },
        body: JSON.stringify({
          to: device.device_token,
          notification: {
            title: 'New message from Admin',
            body: message.content.substring(0, 100),
            sound: 'default',
          },
          data: {
            type: 'new_message',
            conversationId,
          },
          priority: 'high',
        }),
      });
    });

    await Promise.all(promises);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### Notification Handler (Deep Link)

```typescript
// src/features/Notifications/hooks/useNotificationHandler.ts

import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { onNotificationOpenedApp, getInitialNotification } from '../services/fcmService';

export const useNotificationHandler = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle notification tap when app is in background
    onNotificationOpenedApp(remoteMessage => {
      handleChatNotification(remoteMessage);
    });

    // Handle notification tap when app was closed
    getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        handleChatNotification(remoteMessage);
      }
    });
  }, []);

  const handleChatNotification = (remoteMessage: any) => {
    const { type, conversationId } = remoteMessage.data;

    if (type === 'new_message' && conversationId) {
      navigation.navigate('Chat', { conversationId });
    }
  };
};
```

### Notification Preferences

```typescript
// src/api/notifications/preferences.ts

import axios from 'axios';
import Config from 'react-native-config';
import { getAccessToken } from '../../services/storage/keychainService';

export const updateNotificationPreference = async (
  type: 'chat' | 'security',
  enabled: boolean
): Promise<void> => {
  try {
    const accessToken = await getAccessToken();

    await axios.patch(
      `${Config.SUPABASE_URL}/rest/v1/user_preferences`,
      {
        [`notifications_${type}_enabled`]: enabled,
      },
      {
        headers: {
          apikey: Config.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Failed to update notification preference:', error);
    throw error;
  }
};
```

---

## Tasks Breakdown

| Task ID  | Description                   | Effort |
| -------- | ----------------------------- | ------ |
| TASK-288 | Supabase Edge Function        | 2h     |
| TASK-289 | Notification Handler          | 1.5h   |
| TASK-290 | Deep Link Navigation          | 1.5h   |
| TASK-291 | Notification Preferences      | 1h     |
| TASK-292 | Chat Notifications RNTL Tests | 0.5h   |

**Total**: 5 tasks, 6.5 hours

---

## Testing Strategy

### Unit Tests (RNTL)

```typescript
describe('ChatNotificationHandler', () => {
  it('should navigate to ChatScreen when notification is tapped', () => {
    const mockNavigation = { navigate: jest.fn() };

    const remoteMessage = {
      data: {
        type: 'new_message',
        conversationId: 'conv-123',
      },
    };

    handleChatNotification(remoteMessage, mockNavigation);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Chat', {
      conversationId: 'conv-123',
    });
  });
});
```

### E2E Tests (Detox + Cucumber)

```gherkin
Feature: Chat Notifications

  Scenario: Receive chat notification
    Given I am logged in
    And I have granted notification permission
    When the admin sends me a message
    Then I should receive a push notification
    And the notification should say "New message from Admin"

  Scenario: Tap chat notification
    Given I have a chat notification
    When I tap the notification
    Then the app should open
    And I should see the ChatScreen
    And the conversation should be visible
```

---

## Dependencies

**Upstream**:

- US-050: FCM Setup (FCM token management)
- US-046: Chat (chat functionality)

**Downstream**:

- None

---

## Risks & Mitigation

| Risk                                   | Probability | Impact | Mitigation                                 |
| -------------------------------------- | ----------- | ------ | ------------------------------------------ |
| Notification not delivered             | Low         | High   | Retry logic, check FCM token validity      |
| User in chat doesn't need notification | Medium      | Low    | Check app state, skip if user viewing chat |
| Deep link fails                        | Low         | Medium | Graceful fallback, log errors              |

---

## Definition of Done

**Functional**:

- [ ] All acceptance criteria met
- [ ] All 5 tasks complete
- [ ] Notifications working on iOS + Android

**Quality**:

- [ ] 100% RNTL coverage
- [ ] All E2E tests passing
- [ ] `yarn validate` passes

**Security**:

- [ ] No sensitive data in notification body
- [ ] Tokens validated before sending

**Accessibility**:

- [ ] All EAA requirements met

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-026](../epics/EPIC-026-push-notifications.md), [US-050](US-050-fcm-setup.md)
