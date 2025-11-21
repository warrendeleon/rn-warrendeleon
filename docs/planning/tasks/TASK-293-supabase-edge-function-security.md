# TASK-293: Supabase Edge Function for Security Alerts

**ID**: TASK-293 | **Epic**: [EPIC-026](../epics/EPIC-026-push-notifications.md) | **User Story**: [US-052](../stories/US-052-security-alert-notifications.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Create a Supabase Edge Function (Deno) that sends push notifications via FCM for security-related events. Trigger on security events (failed login attempts, password changes, suspicious activity), fetch user FCM tokens, construct security alert payload with high priority, and send via FCM Admin SDK.

---

## Acceptance Criteria

- [ ] Edge Function created in `supabase/functions/send-security-alert/index.ts`
- [ ] Handle multiple security event types (failed_login, password_change, suspicious_activity)
- [ ] Fetch user FCM tokens from database
- [ ] Construct high-priority notification payload
- [ ] Send notification via FCM Admin SDK
- [ ] Error handling and logging
- [ ] Always send regardless of notification preferences (security critical)
- [ ] TypeScript types defined
- [ ] Environment variables for FCM credentials
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Edge Function Implementation

```typescript
// supabase/functions/send-security-alert/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { initializeApp, cert, ServiceAccount } from 'https://esm.sh/firebase-admin@11.11.0/app';
import { getMessaging } from 'https://esm.sh/firebase-admin@11.11.0/messaging';

/**
 * Security event types
 */
export type SecurityEventType =
  | 'failed_login'
  | 'password_change'
  | 'suspicious_activity'
  | 'account_locked'
  | 'new_device_login'
  | 'pin_change';

/**
 * Security alert payload from trigger
 */
interface SecurityAlertPayload {
  id: string;
  user_id: string;
  event_type: SecurityEventType;
  event_data: Record<string, any>;
  created_at: string;
}

/**
 * FCM token from database
 */
interface FCMToken {
  id: string;
  user_id: string;
  fcm_token: string;
  device_platform: 'ios' | 'android';
  is_active: boolean;
}

// Initialize Firebase Admin SDK
const serviceAccount: ServiceAccount = {
  projectId: Deno.env.get('FIREBASE_PROJECT_ID')!,
  clientEmail: Deno.env.get('FIREBASE_CLIENT_EMAIL')!,
  privateKey: Deno.env.get('FIREBASE_PRIVATE_KEY')!.replace(/\\n/g, '\n'),
};

const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
});

const messaging = getMessaging(firebaseApp);

/**
 * Main handler
 */
serve(async req => {
  try {
    // Parse request body
    const { record } = await req.json();
    const securityEvent: SecurityAlertPayload = record;

    console.log('Processing security alert:', securityEvent.id);

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Get user FCM tokens
    const { data: fcmTokens, error: tokensError } = await supabaseClient
      .from('fcm_tokens')
      .select('*')
      .eq('user_id', securityEvent.user_id)
      .eq('is_active', true);

    if (tokensError) {
      console.error('Failed to fetch FCM tokens:', tokensError);
      return new Response(JSON.stringify({ error: 'Failed to fetch tokens' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!fcmTokens || fcmTokens.length === 0) {
      console.log('No FCM tokens found for user');
      return new Response(JSON.stringify({ message: 'No tokens to send to' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Construct notification based on event type
    const { title, body } = getNotificationContent(
      securityEvent.event_type,
      securityEvent.event_data
    );

    // 3. Send notifications to all user's devices
    // NOTE: Security alerts ALWAYS sent regardless of notification preferences
    const sendResults = await Promise.allSettled(
      fcmTokens.map((token: FCMToken) =>
        sendSecurityAlert(token.fcm_token, title, body, securityEvent, token.device_platform)
      )
    );

    // 4. Process results and deactivate invalid tokens
    const invalidTokens: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    sendResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          successCount++;
        } else if (result.value.invalidToken) {
          invalidTokens.push(fcmTokens[index].fcm_token);
          failureCount++;
        } else {
          failureCount++;
        }
      } else {
        failureCount++;
        console.error('Send failed:', result.reason);
      }
    });

    // 5. Deactivate invalid tokens
    if (invalidTokens.length > 0) {
      const { error: deactivateError } = await supabaseClient
        .from('fcm_tokens')
        .update({ is_active: false })
        .in('fcm_token', invalidTokens);

      if (deactivateError) {
        console.error('Failed to deactivate invalid tokens:', deactivateError);
      } else {
        console.log(`Deactivated ${invalidTokens.length} invalid tokens`);
      }
    }

    // 6. Log security alert send
    await supabaseClient.from('security_alert_logs').insert({
      security_event_id: securityEvent.id,
      user_id: securityEvent.user_id,
      tokens_sent: fcmTokens.length,
      success_count: successCount,
      failure_count: failureCount,
    });

    console.log(`Security alert sent: ${successCount} success, ${failureCount} failures`);

    return new Response(
      JSON.stringify({
        message: 'Security alert processed',
        success: successCount,
        failures: failureCount,
        invalidTokens: invalidTokens.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing security alert:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Get notification content based on event type
 */
function getNotificationContent(
  eventType: SecurityEventType,
  eventData: Record<string, any>
): { title: string; body: string } {
  switch (eventType) {
    case 'failed_login':
      return {
        title: 'Failed Login Attempt',
        body: `Someone attempted to log in to your account from ${
          eventData.location || 'an unknown location'
        }. If this wasn't you, please secure your account immediately.`,
      };

    case 'password_change':
      return {
        title: 'Password Changed',
        body: "Your password was recently changed. If you didn't make this change, please contact support immediately.",
      };

    case 'suspicious_activity':
      return {
        title: 'Suspicious Activity Detected',
        body: 'We detected unusual activity on your account. Please review your recent activity and secure your account if needed.',
      };

    case 'account_locked':
      return {
        title: 'Account Locked',
        body: 'Your account has been temporarily locked due to multiple failed login attempts. Please reset your password to unlock it.',
      };

    case 'new_device_login':
      return {
        title: 'New Device Login',
        body: `A new device (${
          eventData.device || 'unknown device'
        }) logged into your account. If this wasn't you, please secure your account.`,
      };

    case 'pin_change':
      return {
        title: 'PIN Changed',
        body: "Your security PIN was recently changed. If you didn't make this change, please contact support immediately.",
      };

    default:
      return {
        title: 'Security Alert',
        body: 'Important security information about your account.',
      };
  }
}

/**
 * Send FCM security alert
 */
async function sendSecurityAlert(
  fcmToken: string,
  title: string,
  body: string,
  securityEvent: SecurityAlertPayload,
  platform: 'ios' | 'android'
): Promise<{ success: boolean; invalidToken?: boolean }> {
  try {
    const payload = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        type: 'security_alert',
        eventType: securityEvent.event_type,
        eventId: securityEvent.id,
        eventData: JSON.stringify(securityEvent.event_data),
      },
      android: {
        channelId: 'security_alerts',
        priority: 'max' as const, // Critical priority
        notification: {
          sound: 'default',
          priority: 'max' as const,
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
            'content-available': 1,
            priority: 10, // High priority
          },
        },
      },
    };

    await messaging.send(payload);

    return { success: true };
  } catch (error: any) {
    console.error('FCM send error:', error);

    // Check if token is invalid
    if (
      error.code === 'messaging/invalid-registration-token' ||
      error.code === 'messaging/registration-token-not-registered'
    ) {
      return { success: false, invalidToken: true };
    }

    return { success: false };
  }
}
```

---

### Database Trigger

```sql
-- supabase/migrations/20250121000002_security_alert_trigger.sql

-- Create function to call Edge Function on security event
CREATE OR REPLACE FUNCTION trigger_security_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Edge Function asynchronously
  PERFORM
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/send-security-alert',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW)
      )
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on security_events table
DROP TRIGGER IF EXISTS on_security_event_created ON security_events;

CREATE TRIGGER on_security_event_created
  AFTER INSERT ON security_events
  FOR EACH ROW
  EXECUTE FUNCTION trigger_security_alert();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION trigger_security_alert() TO authenticated;

-- Create security_alert_logs table if not exists
CREATE TABLE IF NOT EXISTS security_alert_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  security_event_id UUID NOT NULL REFERENCES security_events(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  tokens_sent INTEGER NOT NULL,
  success_count INTEGER NOT NULL,
  failure_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for queries
CREATE INDEX IF NOT EXISTS idx_security_alert_logs_user_id ON security_alert_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alert_logs_event_id ON security_alert_logs(security_event_id);
```

---

### Deployment

```bash
# Deploy Edge Function
supabase functions deploy send-security-alert

# Set environment variables (same as chat notification function)
supabase secrets set FIREBASE_PROJECT_ID=your-project-id
supabase secrets set FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com
supabase secrets set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## Testing Requirements

### Unit Tests

```typescript
// supabase/functions/send-security-alert/index.test.ts

import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';

Deno.test('getNotificationContent - failed_login', () => {
  const { title, body } = getNotificationContent('failed_login', {
    location: 'New York, USA',
  });

  assertEquals(title, 'Failed Login Attempt');
  assertEquals(
    body,
    "Someone attempted to log in to your account from New York, USA. If this wasn't you, please secure your account immediately."
  );
});

Deno.test('getNotificationContent - password_change', () => {
  const { title, body } = getNotificationContent('password_change', {});

  assertEquals(title, 'Password Changed');
  assertEquals(
    body,
    "Your password was recently changed. If you didn't make this change, please contact support immediately."
  );
});

Deno.test('getNotificationContent - suspicious_activity', () => {
  const { title, body } = getNotificationContent('suspicious_activity', {});

  assertEquals(title, 'Suspicious Activity Detected');
  assertEquals(
    body,
    'We detected unusual activity on your account. Please review your recent activity and secure your account if needed.'
  );
});

Deno.test('getNotificationContent - new_device_login', () => {
  const { title, body } = getNotificationContent('new_device_login', {
    device: 'iPhone 15 Pro',
  });

  assertEquals(title, 'New Device Login');
  assertEquals(
    body,
    "A new device (iPhone 15 Pro) logged into your account. If this wasn't you, please secure your account."
  );
});
```

---

## Dependencies

- Deno runtime
- @supabase/supabase-js
- firebase-admin
- Supabase Edge Functions
- PostgreSQL database with `security_events`, `fcm_tokens` tables

---

## Definition of Done

- [ ] Edge Function implemented
- [ ] Database trigger configured
- [ ] All security event types handled
- [ ] FCM tokens fetched correctly
- [ ] High-priority notification payload constructed
- [ ] FCM Admin SDK integration working
- [ ] Error handling implemented
- [ ] Invalid token handling working
- [ ] Security alert logging implemented
- [ ] Always sends regardless of preferences
- [ ] Environment variables configured
- [ ] Edge Function deployed to Supabase
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-052](../stories/US-052-security-alert-notifications.md), [TASK-288](TASK-288-supabase-edge-function-chat.md)
