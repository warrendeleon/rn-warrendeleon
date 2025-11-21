# TASK-288: Supabase Edge Function for Chat Notifications

**ID**: TASK-288 | **Epic**: [EPIC-026](../epics/EPIC-026-push-notifications.md) | **User Story**: [US-051](../stories/US-051-chat-message-notifications.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Create a Supabase Edge Function (Deno) that sends push notifications via FCM when new chat messages are created. Trigger on database insert to `messages` table, fetch recipient FCM tokens, construct notification payload, and send via FCM Admin SDK. Handle errors and implement retry logic.

---

## Acceptance Criteria

- [ ] Edge Function created in `supabase/functions/send-chat-notification/index.ts`
- [ ] Database trigger configured on `messages` table insert
- [ ] Fetch recipient FCM tokens from database
- [ ] Construct notification payload with message data
- [ ] Send notification via FCM Admin SDK
- [ ] Error handling and logging
- [ ] Retry logic for failed sends
- [ ] TypeScript types defined
- [ ] Environment variables for FCM credentials
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Edge Function Implementation

```typescript
// supabase/functions/send-chat-notification/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { initializeApp, cert, ServiceAccount } from 'https://esm.sh/firebase-admin@11.11.0/app';
import { getMessaging } from 'https://esm.sh/firebase-admin@11.11.0/messaging';

/**
 * Message payload from database trigger
 */
interface MessagePayload {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type: 'text' | 'image' | 'file';
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

/**
 * Conversation participant
 */
interface ConversationParticipant {
  user_id: string;
  user_profile: {
    first_name: string;
    last_name: string;
  };
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
    const message: MessagePayload = record;

    console.log('Processing message:', message.id);

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Get sender information
    const { data: sender, error: senderError } = await supabaseClient
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', message.sender_id)
      .single();

    if (senderError) {
      console.error('Failed to fetch sender:', senderError);
      return new Response(JSON.stringify({ error: 'Failed to fetch sender' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Get conversation participants (excluding sender)
    const { data: participants, error: participantsError } = await supabaseClient
      .from('conversation_participants')
      .select(
        `
        user_id,
        user_profile:user_profiles(first_name, last_name)
      `
      )
      .eq('conversation_id', message.conversation_id)
      .neq('user_id', message.sender_id);

    if (participantsError) {
      console.error('Failed to fetch participants:', participantsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch participants' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Get FCM tokens for all participants
    const participantIds = participants.map((p: ConversationParticipant) => p.user_id);

    const { data: fcmTokens, error: tokensError } = await supabaseClient
      .from('fcm_tokens')
      .select('*')
      .in('user_id', participantIds)
      .eq('is_active', true);

    if (tokensError) {
      console.error('Failed to fetch FCM tokens:', tokensError);
      return new Response(JSON.stringify({ error: 'Failed to fetch tokens' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!fcmTokens || fcmTokens.length === 0) {
      console.log('No FCM tokens found for recipients');
      return new Response(JSON.stringify({ message: 'No recipients to notify' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Check notification preferences for each recipient
    const { data: preferences, error: preferencesError } = await supabaseClient
      .from('notification_preferences')
      .select('*')
      .in('user_id', participantIds);

    if (preferencesError) {
      console.error('Failed to fetch preferences:', preferencesError);
      // Continue anyway with default preferences
    }

    // Filter tokens based on preferences
    const eligibleTokens = fcmTokens.filter((token: FCMToken) => {
      const userPrefs = preferences?.find((p: any) => p.user_id === token.user_id);

      // Default to enabled if no preferences found
      if (!userPrefs) {
        return true;
      }

      // Check if chat notifications are enabled
      return userPrefs.chat_messages_enabled !== false;
    });

    if (eligibleTokens.length === 0) {
      console.log('No eligible recipients (all disabled notifications)');
      return new Response(JSON.stringify({ message: 'No eligible recipients' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 5. Construct notification payload
    const senderName = `${sender.first_name} ${sender.last_name}`;
    const notificationBody = getNotificationBody(message);

    // 6. Send notifications to all eligible tokens
    const sendResults = await Promise.allSettled(
      eligibleTokens.map((token: FCMToken) =>
        sendNotification(
          token.fcm_token,
          senderName,
          notificationBody,
          message,
          token.device_platform
        )
      )
    );

    // 7. Process results and deactivate invalid tokens
    const invalidTokens: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    sendResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          successCount++;
        } else if (result.value.invalidToken) {
          invalidTokens.push(eligibleTokens[index].fcm_token);
          failureCount++;
        } else {
          failureCount++;
        }
      } else {
        failureCount++;
        console.error('Send failed:', result.reason);
      }
    });

    // 8. Deactivate invalid tokens
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

    console.log(`Notification sent: ${successCount} success, ${failureCount} failures`);

    return new Response(
      JSON.stringify({
        message: 'Notifications processed',
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
    console.error('Error processing notification:', error);
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
 * Get notification body based on message type
 */
function getNotificationBody(message: MessagePayload): string {
  switch (message.message_type) {
    case 'text':
      return message.content;
    case 'image':
      return '📷 Sent an image';
    case 'file':
      return '📎 Sent a file';
    default:
      return 'Sent a message';
  }
}

/**
 * Send FCM notification
 */
async function sendNotification(
  fcmToken: string,
  senderName: string,
  body: string,
  message: MessagePayload,
  platform: 'ios' | 'android'
): Promise<{ success: boolean; invalidToken?: boolean }> {
  try {
    const payload = {
      token: fcmToken,
      notification: {
        title: senderName,
        body: body,
      },
      data: {
        type: 'chat_message',
        conversationId: message.conversation_id,
        messageId: message.id,
        senderId: message.sender_id,
      },
      android: {
        channelId: 'chat_messages',
        priority: 'high' as const,
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
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
-- supabase/migrations/20250121000001_chat_notification_trigger.sql

-- Create function to call Edge Function on message insert
CREATE OR REPLACE FUNCTION trigger_chat_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Edge Function asynchronously
  PERFORM
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/send-chat-notification',
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

-- Create trigger on messages table
DROP TRIGGER IF EXISTS on_message_created ON messages;

CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_chat_notification();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION trigger_chat_notification() TO authenticated;
```

---

### Environment Variables

```bash
# .env.local (for local development)

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

### Deployment

```bash
# Deploy Edge Function
supabase functions deploy send-chat-notification

# Set environment variables
supabase secrets set FIREBASE_PROJECT_ID=your-project-id
supabase secrets set FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com
supabase secrets set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## Testing Requirements

### Unit Tests

```typescript
// supabase/functions/send-chat-notification/index.test.ts

import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';

Deno.test('getNotificationBody - text message', () => {
  const message = {
    id: '123',
    conversation_id: 'conv-1',
    sender_id: 'user-1',
    content: 'Hello world',
    created_at: new Date().toISOString(),
    message_type: 'text' as const,
  };

  const body = getNotificationBody(message);
  assertEquals(body, 'Hello world');
});

Deno.test('getNotificationBody - image message', () => {
  const message = {
    id: '123',
    conversation_id: 'conv-1',
    sender_id: 'user-1',
    content: '',
    created_at: new Date().toISOString(),
    message_type: 'image' as const,
  };

  const body = getNotificationBody(message);
  assertEquals(body, '📷 Sent an image');
});

Deno.test('getNotificationBody - file message', () => {
  const message = {
    id: '123',
    conversation_id: 'conv-1',
    sender_id: 'user-1',
    content: '',
    created_at: new Date().toISOString(),
    message_type: 'file' as const,
  };

  const body = getNotificationBody(message);
  assertEquals(body, '📎 Sent a file');
});
```

---

## Dependencies

- Deno runtime
- @supabase/supabase-js
- firebase-admin
- Supabase Edge Functions
- PostgreSQL database with `messages`, `fcm_tokens`, `notification_preferences` tables

---

## Definition of Done

- [ ] Edge Function implemented
- [ ] Database trigger configured
- [ ] FCM tokens fetched correctly
- [ ] Notification payload constructed
- [ ] FCM Admin SDK integration working
- [ ] Error handling implemented
- [ ] Invalid token handling working
- [ ] Notification preferences respected
- [ ] Environment variables configured
- [ ] Edge Function deployed to Supabase
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-051](../stories/US-051-chat-message-notifications.md), [TASK-283](TASK-283-fcm-service-setup.md), [TASK-285](TASK-285-save-token-supabase.md)
