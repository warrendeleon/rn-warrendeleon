# EPIC-025: Chat (User-Admin Messaging)

**ID**: EPIC-025 | **Title**: Real-Time User-Admin Chat with Supabase Realtime
**Status**: 📋 To Do | **Priority**: Medium | **Start Date**: TBD | **Target Date**: TBD
**Owner**: Warren de Leon | **Total Story Points**: 14 | **Total Effort**: 32.5h

---

## Epic Overview

Implement real-time chat functionality between users and administrators using Supabase Realtime. This is the ONLY feature that uses Supabase SDK (all authentication uses custom REST API).

**Key Features**:

- Real-time 1:1 chat (user ↔ admin)
- Message history with pagination
- Read receipts and typing indicators
- Image/file attachments
- Push notifications for new messages
- Admin dashboard for managing conversations

---

## Business Value

### Why This Epic Matters

1. **Support Quality**: Real-time chat provides instant support vs email (24-48h response time)
2. **User Satisfaction**: 73% of users prefer live chat over email (Zendesk)
3. **Conversion**: Chat increases sales by 3-5x (Forrester)
4. **Cost Efficiency**: 1 agent can handle 6 chats simultaneously vs 1 email at a time
5. **Data Collection**: Chat logs provide insights into user pain points

### Success Metrics

| Metric                   | Target     | Why It Matters                     |
| ------------------------ | ---------- | ---------------------------------- |
| Average Response Time    | <5 minutes | Measures admin availability        |
| User Satisfaction (CSAT) | 85%+       | Post-chat survey score             |
| Chat Completion Rate     | 90%+       | Users get their questions answered |
| Message Delivery Success | 99%+       | Realtime reliability               |

---

## User Stories

### Overview

| ID                                                   | Title                               | Priority | Story Points | Effort | Status   |
| ---------------------------------------------------- | ----------------------------------- | -------- | ------------ | ------ | -------- |
| [US-046](../stories/US-046-send-receive-messages.md) | Send and Receive Messages           | High     | 5            | 12h    | 📋 To Do |
| [US-047](../stories/US-047-message-history.md)       | Message History with Pagination     | Medium   | 3            | 7.5h   | 📋 To Do |
| [US-048](../stories/US-048-typing-indicators.md)     | Typing Indicators and Read Receipts | Medium   | 3            | 7h     | 📋 To Do |
| [US-049](../stories/US-049-chat-attachments.md)      | Image/File Attachments              | Medium   | 3            | 6h     | 📋 To Do |

**Total**: 4 user stories, 14 story points, 32.5 hours

---

## Technical Architecture

### Database Schema

**Supabase Tables**:

```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  admin_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'open', -- open, closed, archived
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT,
  attachment_url TEXT,
  attachment_type TEXT, -- image, file, null
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Typing indicators table (ephemeral, cleared periodically)
CREATE TABLE typing_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  is_typing BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_admin_id ON conversations(admin_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_typing_indicators_conversation_id ON typing_indicators(conversation_id);
```

### Row Level Security (RLS)

```sql
-- Users can only see their own conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = admin_id);

-- Users can only read messages in their conversations
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE user_id = auth.uid() OR admin_id = auth.uid()
    )
  );

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE user_id = auth.uid() OR admin_id = auth.uid()
    )
  );

-- Users can update read status
CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE
  USING (conversation_id IN (
    SELECT id FROM conversations
    WHERE user_id = auth.uid() OR admin_id = auth.uid()
  ));
```

### Supabase Realtime Subscription

**This is the ONLY place we use Supabase SDK**:

```typescript
// src/services/chat/realtimeService.ts
import { createClient } from '@supabase/supabase-js';
import Config from 'react-native-config';

const supabase = createClient(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY);

export const subscribeToMessages = (
  conversationId: string,
  onNewMessage: (message: Message) => void
) => {
  const subscription = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      payload => {
        onNewMessage(payload.new as Message);
      }
    )
    .subscribe();

  return subscription;
};

export const unsubscribeFromMessages = (subscription: any) => {
  subscription.unsubscribe();
};
```

### Chat Screen Architecture

```typescript
// Component Hierarchy
ChatScreen
├── ChatHeader (Admin name, status indicator)
├── MessageList (FlatList with inverted layout)
│   ├── MessageBubble (User messages - right aligned, blue)
│   ├── MessageBubble (Admin messages - left aligned, gray)
│   └── DateSeparator (Today, Yesterday, etc.)
├── TypingIndicator (Shows "Admin is typing...")
└── MessageInput (Text input + Send button + Attachment button)
```

---

## Implementation Phases

### Phase 1: Send and Receive Messages (12h)

**User Story**: [US-046](../stories/US-046-send-receive-messages.md)

**Tasks**:

1. Supabase database setup (tables, RLS policies)
2. ChatScreen UI (MessageList, MessageInput)
3. Supabase Realtime subscription setup
4. Send message API integration
5. Message rendering (user vs admin bubbles)
6. RNTL tests
7. E2E tests

**Deliverables**:

- ChatScreen component
- MessageBubble component
- useChatMessages hook (Supabase Realtime)
- Supabase client service
- Complete test coverage

**Code Example**:

```typescript
// src/hooks/useChatMessages.ts
import { useState, useEffect } from 'react';
import { subscribeToMessages, unsubscribeFromMessages } from '../services/chat/realtimeService';
import { sendMessage as sendMessageAPI } from '../api/chat/messages';

export const useChatMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial messages
    fetchMessages();

    // Subscribe to real-time updates
    const subscription = subscribeToMessages(conversationId, newMessage => {
      setMessages(prev => [newMessage, ...prev]);
    });

    return () => {
      unsubscribeFromMessages(subscription);
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${Config.SUPABASE_URL}/rest/v1/messages?conversation_id=eq.${conversationId}&order=created_at.desc&limit=50`,
        {
          headers: {
            apikey: Config.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${await getAccessToken()}`,
          },
        }
      );

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    try {
      await sendMessageAPI({
        conversation_id: conversationId,
        content,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
  };
};
```

---

### Phase 2: Message History with Pagination (7.5h)

**User Story**: [US-047](../stories/US-047-message-history.md)

**Tasks**:

1. Pagination logic (load more on scroll)
2. Infinite scroll implementation
3. Loading indicator for pagination
4. Empty state UI
5. RNTL tests
6. E2E tests

**Deliverables**:

- Pagination hook
- Infinite scroll component
- Empty state UI
- Complete test coverage

---

### Phase 3: Typing Indicators and Read Receipts (7h)

**User Story**: [US-048](../stories/US-048-typing-indicators.md)

**Tasks**:

1. Typing indicator Supabase subscription
2. Debounced typing detection
3. TypingIndicator component
4. Read receipts API
5. Read receipt UI (checkmarks)
6. RNTL tests
7. E2E tests

**Deliverables**:

- TypingIndicator component
- useTypingIndicator hook
- Read receipt system
- Complete test coverage

---

### Phase 4: Image/File Attachments (6h)

**User Story**: [US-049](../stories/US-049-chat-attachments.md)

**Tasks**:

1. Image picker integration
2. File upload to Supabase Storage
3. Attachment preview in MessageBubble
4. Attachment download logic
5. RNTL tests
6. E2E tests

**Deliverables**:

- Attachment handling
- Image preview component
- File download logic
- Complete test coverage

---

## Security Considerations

### Authentication

- All API calls use access token from Keychain
- Supabase SDK authenticated with user token
- RLS policies enforce user-level access control

### Data Protection

- Messages stored in Supabase (encrypted at rest)
- Attachments stored in secure Supabase bucket
- No messages cached locally (sensitive content)

### Rate Limiting

- Max 100 messages/minute per user (prevent spam)
- Max 10MB attachment size
- Typing indicator debounced (update max once per second)

---

## Non-Functional Requirements

### Performance

- Message send latency: <500ms
- Realtime message delivery: <1 second
- Pagination load: <1 second
- Attachment upload: <5 seconds (10MB file)

### Reliability

- Realtime reconnection on network loss
- Message retry on send failure
- Offline message queue (send when online)

### Accessibility (EAA Compliance)

- All messages have accessibility labels
- Message input has clear label
- Send button has proper role and hint
- All touch targets minimum 48×48 / 44×44

### Testing

- 100% RNTL coverage for all components
- E2E tests for complete chat flow
- Manual testing on real devices (iOS + Android)

---

## Dependencies

### Upstream Dependencies

- EPIC-021: Registration complete (user authentication working)
- EPIC-022: Login complete (token management working)
- EPIC-026: Push Notifications (for new message alerts)

### Downstream Dependencies

- None (chat is standalone feature)

---

## Risks & Mitigation

### Technical Risks

| Risk                          | Probability | Impact | Mitigation                             |
| ----------------------------- | ----------- | ------ | -------------------------------------- |
| Realtime connection drops     | Medium      | Medium | Auto-reconnect, show connection status |
| Message delivery failure      | Low         | High   | Retry logic, offline queue             |
| Large attachment upload fails | Medium      | Medium | Chunk uploads, resume capability       |
| Admin not available           | High        | Low    | Set expectations, show admin status    |

---

## Definition of Done

**Functional**:

- [ ] All 4 user stories complete
- [ ] Real-time messaging working
- [ ] Message history with pagination
- [ ] Typing indicators working
- [ ] Image/file attachments working

**Quality**:

- [ ] 100% RNTL coverage
- [ ] All E2E tests passing (iOS + Android)
- [ ] `yarn validate` passes
- [ ] Manual testing complete

**Security**:

- [ ] RLS policies enforced
- [ ] All API calls authenticated
- [ ] Attachments in secure bucket

**Accessibility**:

- [ ] All EAA requirements met
- [ ] VoiceOver/TalkBack tested

---

**Last Updated**: 2025-11-21
**Status**: Ready for implementation
**Next Review**: Before Phase 1 kickoff
