# EPIC-026: Push Notifications

**ID**: EPIC-026 | **Title**: FCM Push Notifications Integration
**Status**: 📋 To Do | **Priority**: Medium | **Start Date**: TBD | **Target Date**: TBD
**Owner**: Warren de Leon | **Total Story Points**: 8 | **Total Effort**: 18h

---

## Epic Overview

Implement Firebase Cloud Messaging (FCM) push notifications for critical app events. Uses minimal FCM SDK integration while maintaining security standards.

**Key Features**:

- New chat message notifications
- Security alerts (login from new device)
- System notifications (account updates)
- Notification permissions handling
- Deep link navigation from notifications
- iOS + Android support

---

## Business Value

### Why This Epic Matters

1. **User Engagement**: Push notifications increase app opens by 88% (Localytics)
2. **Retention**: Users with notifications enabled are 3x more likely to return
3. **Timely Communication**: Instant alerts for critical events
4. **Support Quality**: Users respond faster to chat messages
5. **Security**: Immediate alerts for suspicious activity

### Success Metrics

| Metric                   | Target     | Why It Matters         |
| ------------------------ | ---------- | ---------------------- |
| Notification Opt-in Rate | 60%+       | Users grant permission |
| Notification Open Rate   | 25%+       | Industry benchmark     |
| Time to Open (Chat)      | <5 minutes | Users respond quickly  |
| Delivery Success Rate    | 98%+       | Reliability            |

---

## User Stories

### Overview

| ID                                                    | Title                             | Priority | Story Points | Effort | Status   |
| ----------------------------------------------------- | --------------------------------- | -------- | ------------ | ------ | -------- |
| [US-050](../stories/US-050-fcm-setup.md)              | FCM Setup and Permission Handling | High     | 3            | 7h     | 📋 To Do |
| [US-051](../stories/US-051-chat-notifications.md)     | Chat Message Notifications        | High     | 3            | 6.5h   | 📋 To Do |
| [US-052](../stories/US-052-security-notifications.md) | Security Alert Notifications      | Medium   | 2            | 4.5h   | 📋 To Do |

**Total**: 3 user stories, 8 story points, 18 hours

---

## Technical Architecture

### FCM Integration Architecture

```
App Launch
  → Request notification permission (iOS prompts, Android auto-granted)
  → Get FCM device token
  → Send token to Supabase (store in user_devices table)
  → Listen for notifications (foreground + background)
  → Handle notification tap → Deep link to relevant screen
```

### Supabase Integration

**Database Schema**:

```sql
-- Store device tokens for push notifications
CREATE TABLE user_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL, -- ios, android
  app_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_token ON user_devices(device_token);
```

**Supabase Edge Function** (Send Notification):

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async req => {
  const { userId, title, body, data } = await req.json();

  // Get user's device tokens
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: devices } = await supabase
    .from('user_devices')
    .select('device_token, platform')
    .eq('user_id', userId);

  if (!devices || devices.length === 0) {
    return new Response(JSON.stringify({ error: 'No devices found' }), {
      status: 404,
    });
  }

  // Send FCM notifications
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
          title,
          body,
          sound: 'default',
        },
        data,
        priority: 'high',
      }),
    });
  });

  await Promise.all(promises);

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### React Native FCM Integration

**Libraries**:

- `@react-native-firebase/app`: Core Firebase SDK
- `@react-native-firebase/messaging`: FCM messaging

**Installation**:

```bash
yarn add @react-native-firebase/app @react-native-firebase/messaging
```

**iOS Configuration** (`ios/Podfile`):

```ruby
pod 'Firebase/Messaging'
```

**Android Configuration** (`android/app/src/main/AndroidManifest.xml`):

```xml
<service android:name="io.invertase.firebase.messaging.RNFirebaseMessagingService">
  <intent-filter>
    <action android:name="com.google.firebase.MESSAGING_EVENT" />
  </intent-filter>
</service>
```

---

## Implementation Phases

### Phase 1: FCM Setup and Permission Handling (7h)

**User Story**: [US-050](../stories/US-050-fcm-setup.md)

**Tasks**:

1. Install and configure Firebase SDK
2. Request notification permissions
3. Get FCM device token
4. Send token to Supabase
5. Listen for foreground notifications
6. Handle background notifications
7. RNTL tests
8. E2E tests

**Deliverables**:

- FCM service module
- useNotifications hook
- Permission handling
- Complete test coverage

**Code Example**:

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
    // Android auto-grants permission
    return true;
  }
};

export const getFCMToken = async (): Promise<string> => {
  const token = await messaging().getToken();
  return token;
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

**Hook**:

```typescript
// src/hooks/useNotifications.ts
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  requestNotificationPermission,
  getFCMToken,
  onMessageReceived,
  onNotificationOpenedApp,
  getInitialNotification,
} from '../services/notifications/fcmService';
import { saveFCMToken } from '../api/notifications/devices';

export const useNotifications = () => {
  const navigation = useNavigation();

  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    // Request permission
    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
      console.log('Notification permission denied');
      return;
    }

    // Get FCM token
    const token = await getFCMToken();
    console.log('FCM Token:', token);

    // Save token to Supabase
    await saveFCMToken(token);

    // Listen for foreground notifications
    const unsubscribe = onMessageReceived(message => {
      console.log('Foreground notification:', message);
      // Show in-app notification banner
    });

    // Handle notification tap (app in background)
    onNotificationOpenedApp(message => {
      handleNotificationNavigation(message);
    });

    // Handle notification tap (app closed)
    const initialNotification = await getInitialNotification();
    if (initialNotification) {
      handleNotificationNavigation(initialNotification);
    }

    return () => unsubscribe();
  };

  const handleNotificationNavigation = (message: any) => {
    const { type, conversationId, userId } = message.data;

    if (type === 'new_message') {
      navigation.navigate('Chat', { conversationId });
    } else if (type === 'security_alert') {
      navigation.navigate('SecuritySettings');
    }
  };
};
```

---

### Phase 2: Chat Message Notifications (6.5h)

**User Story**: [US-051](../stories/US-051-chat-notifications.md)

**Tasks**:

1. Trigger notification on new message (Supabase function)
2. Handle chat notification tap
3. Deep link to ChatScreen
4. Mark messages as read on notification tap
5. RNTL tests
6. E2E tests

**Deliverables**:

- Chat notification trigger
- Deep link handling
- Complete test coverage

---

### Phase 3: Security Alert Notifications (4.5h)

**User Story**: [US-052](../stories/US-052-security-notifications.md)

**Tasks**:

1. Trigger security alerts (new device login, PIN change, etc.)
2. Handle security notification tap
3. Deep link to SecuritySettings
4. RNTL tests
5. E2E tests

**Deliverables**:

- Security notification triggers
- Deep link handling
- Complete test coverage

---

## Notification Types

### 1. Chat Notifications

**Trigger**: New message received in conversation

**Payload**:

```json
{
  "title": "New message from Admin",
  "body": "How can I help you today?",
  "data": {
    "type": "new_message",
    "conversationId": "uuid-here"
  }
}
```

**Action**: Navigate to ChatScreen with conversationId

---

### 2. Security Alerts

**Trigger**: Suspicious activity detected

**Payload**:

```json
{
  "title": "Security Alert",
  "body": "New login from iPhone 15 Pro",
  "data": {
    "type": "security_alert",
    "alertType": "new_device_login"
  }
}
```

**Action**: Navigate to SecuritySettings

---

### 3. System Notifications

**Trigger**: Account updates, app updates

**Payload**:

```json
{
  "title": "Profile Updated",
  "body": "Your profile information has been updated",
  "data": {
    "type": "system",
    "action": "profile_updated"
  }
}
```

**Action**: Navigate to ProfileSettings

---

## Security Considerations

### Token Management

- FCM tokens stored in Supabase (encrypted at rest)
- Tokens refreshed on app launch
- Old tokens removed on logout
- Tokens never logged or exposed

### Notification Content

- No sensitive data in notification body (generic messages only)
- Sensitive details only visible after opening app (authenticated)
- Example: "New message" instead of showing message content

### Rate Limiting

- Max 10 notifications/minute per user (prevent spam)
- Mute notifications during active app usage
- User can disable notification types in settings

---

## Non-Functional Requirements

### Performance

- Token registration: <2 seconds
- Notification delivery: <3 seconds
- Deep link navigation: <500ms

### Reliability

- Notification delivery success rate: 98%+
- Token refresh on expiry
- Retry logic for failed deliveries

### Accessibility (EAA Compliance)

- Notification content accessible
- Deep link destinations accessible

### Testing

- 100% RNTL coverage for notification handling
- E2E tests for notification flows
- Manual testing on real devices (iOS + Android)

---

## Dependencies

### Upstream Dependencies

- EPIC-021: Registration complete (user accounts exist)
- EPIC-022: Login complete (authentication working)
- EPIC-025: Chat complete (chat notifications depend on chat)

### Downstream Dependencies

- None (notifications are standalone feature)

---

## Definition of Done

**Functional**:

- [ ] All 3 user stories complete
- [ ] FCM setup working (iOS + Android)
- [ ] Permission handling working
- [ ] Chat notifications delivered
- [ ] Security notifications delivered
- [ ] Deep links working

**Quality**:

- [ ] 100% RNTL coverage
- [ ] All E2E tests passing (iOS + Android)
- [ ] `yarn validate` passes
- [ ] Manual testing on real devices

**Security**:

- [ ] Tokens stored securely
- [ ] No sensitive data in notifications
- [ ] Rate limiting enforced

**Accessibility**:

- [ ] All EAA requirements met

---

**Last Updated**: 2025-11-21
**Status**: Ready for implementation
**Next Review**: Before Phase 1 kickoff
