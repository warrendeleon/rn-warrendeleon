# US-052: Security Alert Notifications

**ID**: US-052 | **Epic**: [EPIC-026](../epics/EPIC-026-push-notifications.md) | **Title**: Push Notifications for Security Alerts
**Status**: 📋 To Do | **Priority**: Medium | **Story Points**: 2 | **Effort**: 4.5h

---

## User Story

**As a** registered user
**I want to** receive push notifications for security events
**So that** I can be immediately informed of suspicious activity on my account

---

## Acceptance Criteria

### Functional Requirements

1. **Security Alert Types**
   - [ ] New device login: "New login from {device name}"
   - [ ] PIN changed: "Your PIN was changed"
   - [ ] Biometric settings changed: "Biometric authentication {enabled/disabled}"
   - [ ] Password reset: "Your password was reset"

2. **Notification Content**
   - [ ] Title: "Security Alert"
   - [ ] Body: Specific security event description
   - [ ] Data payload: `type: 'security_alert'`, `alertType`

3. **Notification Tap**
   - [ ] Tap notification: Open app to SecuritySettings screen
   - [ ] Show recent security activity

### Non-Functional Requirements

1. **Performance**
   - [ ] Notification delivery: <3 seconds
   - [ ] Deep link navigation: <500ms

2. **Accessibility (EAA)**
   - [ ] Notification content accessible

3. **Testing**
   - [ ] 100% RNTL coverage
   - [ ] E2E test for security notification flow

---

## Technical Implementation

### Supabase Edge Function (Send Security Alert)

```typescript
// supabase/functions/send-security-alert/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async req => {
  try {
    const { userId, alertType, details } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get user's FCM tokens
    const { data: devices } = await supabase
      .from('user_devices')
      .select('device_token')
      .eq('user_id', userId);

    if (!devices || devices.length === 0) {
      return new Response(JSON.stringify({ error: 'No devices' }), { status: 404 });
    }

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
            title: 'Security Alert',
            body: details,
            sound: 'default',
          },
          data: {
            type: 'security_alert',
            alertType,
          },
          priority: 'high',
        }),
      });
    });

    await Promise.all(promises);

    return new Response(JSON.stringify({ success: true }));
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
```

---

## Tasks Breakdown

| Task ID  | Description                       | Effort |
| -------- | --------------------------------- | ------ |
| TASK-293 | Supabase Edge Function            | 1.5h   |
| TASK-294 | Notification Handler              | 1h     |
| TASK-295 | Deep Link Navigation              | 1h     |
| TASK-296 | Security Notifications RNTL Tests | 1h     |

**Total**: 4 tasks, 4.5 hours

---

## Definition of Done

**Functional**:

- [ ] All acceptance criteria met
- [ ] All 4 tasks complete

**Quality**:

- [ ] 100% RNTL coverage
- [ ] `yarn validate` passes

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-026](../epics/EPIC-026-push-notifications.md), [US-050](US-050-fcm-setup.md)
