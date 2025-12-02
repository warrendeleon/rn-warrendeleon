# US-046: Send and Receive Messages

**ID**: US-046 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **Title**: Real-Time Chat - Send and Receive Messages
**Status**: 📋 To Do | **Priority**: High | **Story Points**: 5 | **Effort**: 12h

---

## User Story

**As a** registered user
**I want to** send and receive messages in real-time with administrators
**So that** I can get instant support and communicate efficiently

---

## Acceptance Criteria

### Functional Requirements

1. **ChatScreen UI**
   - [ ] ChatScreen displays conversation with admin
   - [ ] Message list shows all messages (scrollable, inverted layout)
   - [ ] User messages: Right-aligned, blue background
   - [ ] Admin messages: Left-aligned, gray background
   - [ ] Each message shows timestamp (relative: "Just now", "5m ago", "Yesterday")
   - [ ] Date separators between different days ("Today", "Yesterday", "Jan 15")

2. **Send Message**
   - [ ] Text input at bottom of screen
   - [ ] Send button (paper plane icon) on right
   - [ ] Send button disabled when input is empty
   - [ ] On send:
     - Message inserted into Supabase `messages` table
     - Optimistic UI update (show message immediately)
     - Input field cleared
     - Scroll to bottom (show new message)
   - [ ] Loading indicator while sending

3. **Receive Message (Real-Time)**
   - [ ] Subscribe to Supabase Realtime for new messages
   - [ ] When new message received:
     - Add to message list
     - Scroll to bottom (if user is near bottom)
     - Play notification sound (optional)
     - Mark as read automatically

4. **Message Metadata**
   - [ ] Each message shows:
     - Sender name (User vs Admin)
     - Timestamp (relative)
     - Read status (checkmarks for user messages)

5. **Empty State**
   - [ ] If no messages: Show welcome message
     - "Start a conversation with our team"
     - "We typically respond within 5 minutes"

### Non-Functional Requirements

1. **Performance**
   - [ ] Message send latency: <500ms
   - [ ] Realtime message delivery: <1 second
   - [ ] Message list renders smoothly (FlatList with `getItemLayout`)

2. **Accessibility (EAA)**
   - [ ] Message input has `accessibilityLabel="Type your message"`
   - [ ] Send button has `accessibilityHint="Send message"`
   - [ ] Each message has `accessibilityLabel="Message from {sender}: {content}"`
   - [ ] Timestamp has `accessibilityLabel="Sent {time}"`

3. **Testing**
   - [ ] 100% RNTL coverage for ChatScreen
   - [ ] E2E test for send/receive flow
   - [ ] Manual testing on real devices

---

## Technical Implementation

### Component Structure

```typescript
// src/features/Chat/screens/ChatScreen.tsx

ChatScreen
├── Header (Admin name, online status)
├── MessageList (FlatList inverted)
│   ├── DateSeparator (Today, Yesterday, etc.)
│   ├── MessageBubble (User - right aligned, blue)
│   ├── MessageBubble (Admin - left aligned, gray)
│   └── EmptyState (if no messages)
├── TypingIndicator ("Admin is typing...")
└── MessageInput (Text input + Send button)
```

### Data Flow

```
User opens ChatScreen
  → Fetch initial messages (last 50)
  → Subscribe to Supabase Realtime (new messages)
  → Render message list
  → User types message
  → User taps Send button
  → Optimistic UI update (show message immediately with pending state)
  → Insert message into Supabase messages table
  → On success:
    → Update message state (pending → sent)
    → Realtime broadcast to admin
  → On failure:
    → Show error, allow retry
  → When new message received via Realtime:
    → Add to message list
    → Scroll to bottom
    → Mark as read
```

### Supabase Realtime Subscription

```typescript
// src/features/Chat/services/realtimeService.ts

import { createClient } from '@supabase/supabase-js';
import Config from 'react-native-config';

const supabase = createClient(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY);

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment_url: string | null;
  attachment_type: string | null;
  read_at: string | null;
  created_at: string;
}

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

### useChatMessages Hook

```typescript
// src/features/Chat/hooks/useChatMessages.ts

import { useState, useEffect } from 'react';
import { subscribeToMessages, unsubscribeFromMessages, Message } from '../services/realtimeService';
import { sendMessage as sendMessageAPI } from '../api/messages';
import Config from 'react-native-config';
import { getAccessToken } from '../services/storage/keychainService';

export const useChatMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time updates
    const subscription = subscribeToMessages(conversationId, newMessage => {
      setMessages(prev => [newMessage, ...prev]); // Inverted list (latest first)
    });

    return () => {
      unsubscribeFromMessages(subscription);
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);

      const accessToken = await getAccessToken();

      const response = await fetch(
        `${Config.SUPABASE_URL}/rest/v1/messages?conversation_id=eq.${conversationId}&order=created_at.desc&limit=50`,
        {
          headers: {
            apikey: Config.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
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
      setIsSending(true);

      // Optimistic UI update
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: 'current-user',
        content,
        attachment_url: null,
        attachment_type: null,
        read_at: null,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [tempMessage, ...prev]);

      // Send to server
      await sendMessageAPI({
        conversation_id: conversationId,
        content,
      });

      // Server will broadcast via Realtime, replace temp message
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    refreshMessages: fetchMessages,
  };
};
```

### Send Message API

```typescript
// src/features/Chat/api/messages.ts

import axios from 'axios';
import Config from 'react-native-config';
import { getAccessToken } from '@/services/storage/keychainService';
import { z } from 'zod';

const sendMessageRequestSchema = z.object({
  conversation_id: z.string().uuid(),
  content: z.string().min(1).max(5000),
});

const messageResponseSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  content: z.string(),
  created_at: z.string(),
});

export const sendMessage = async (data: {
  conversation_id: string;
  content: string;
}): Promise<void> => {
  try {
    // Validate input
    const validatedData = sendMessageRequestSchema.parse(data);

    const accessToken = await getAccessToken();

    // Insert message into Supabase
    const response = await axios.post(
      `${Config.SUPABASE_URL}/rest/v1/messages`,
      {
        conversation_id: validatedData.conversation_id,
        content: validatedData.content,
      },
      {
        headers: {
          apikey: Config.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
      }
    );

    // Validate response
    const validation = messageResponseSchema.safeParse(response.data[0]);

    if (!validation.success) {
      throw new Error('Invalid response from server');
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
    throw error;
  }
};
```

### MessageBubble Component

```typescript
// src/features/Chat/components/MessageBubble.tsx

import React from 'react';
import { View, Text } from 'react-native';
import { Box, HStack, VStack } from '@gluestack-ui/themed';
import { Message } from '../services/realtimeService';
import { formatRelativeTime } from '@/utils/timeUtils';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  testID?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  testID = 'message-bubble',
}) => {
  return (
    <Box
      flexDirection={isCurrentUser ? 'row-reverse' : 'row'}
      marginBottom="$3"
      paddingHorizontal="$4"
      testID={testID}
      accessibilityLabel={`Message from ${isCurrentUser ? 'You' : 'Admin'}: ${message.content}`}
    >
      <Box
        maxWidth="80%"
        backgroundColor={isCurrentUser ? '$blue600' : '$gray200'}
        borderRadius="$lg"
        padding="$3"
      >
        <VStack space="xs">
          {/* Message content */}
          <Text
            style={{
              fontSize: 16,
              color: isCurrentUser ? '#FFFFFF' : '#1F2937',
            }}
          >
            {message.content}
          </Text>

          {/* Timestamp */}
          <Text
            style={{
              fontSize: 12,
              color: isCurrentUser ? '#DBEAFE' : '#9CA3AF',
              textAlign: isCurrentUser ? 'right' : 'left',
            }}
            accessibilityLabel={`Sent ${formatRelativeTime(message.created_at)}`}
          >
            {formatRelativeTime(message.created_at)}
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};
```

### MessageInput Component

```typescript
// src/features/Chat/components/MessageInput.tsx

import React, { useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import { Box, HStack } from '@gluestack-ui/themed';

interface MessageInputProps {
  onSend: (message: string) => void;
  isSending: boolean;
  testID?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  isSending,
  testID = 'message-input',
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim().length === 0) return;

    onSend(message.trim());
    setMessage('');
  };

  return (
    <Box
      backgroundColor="$white"
      borderTopWidth={1}
      borderTopColor="$gray200"
      padding="$3"
      testID={testID}
    >
      <HStack space="sm" alignItems="center">
        {/* Text input */}
        <Box flex={1}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            multiline
            maxLength={5000}
            style={{
              fontSize: 16,
              padding: 12,
              backgroundColor: '#F3F4F6',
              borderRadius: 20,
              maxHeight: 100,
            }}
            testID={`${testID}-field`}
            accessibilityLabel="Type your message"
          />
        </Box>

        {/* Send button */}
        <Pressable
          onPress={handleSend}
          disabled={message.trim().length === 0 || isSending}
          testID={`${testID}-send-button`}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          accessibilityHint="Send your message to the admin"
          accessibilityState={{ disabled: message.trim().length === 0 || isSending }}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: message.trim().length > 0 ? '#3B82F6' : '#D1D5DB',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 20 }}>✈️</Text>
        </Pressable>
      </HStack>
    </Box>
  );
};
```

### Relative Time Formatting

```typescript
// src/utils/timeUtils.ts

import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true }); // "5 minutes ago"
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  // Older than yesterday
  return format(date, 'MMM d'); // "Jan 15"
};
```

---

## Tasks Breakdown

| Task ID  | Description                    | Effort |
| -------- | ------------------------------ | ------ |
| TASK-262 | ChatScreen UI                  | 2.5h   |
| TASK-263 | MessageBubble Component        | 1.5h   |
| TASK-264 | MessageInput Component         | 1.5h   |
| TASK-265 | Supabase Realtime Subscription | 2.5h   |
| TASK-266 | Send Message API               | 2h     |
| TASK-267 | Chat RNTL Tests                | 2h     |

**Total**: 6 tasks, 12 hours

---

## Testing Strategy

### Unit Tests (RNTL)

**File**: `src/features/Chat/screens/__tests__/ChatScreen.rntl.tsx`

```typescript
describe('ChatScreen', () => {
  it('should render message list', () => {
    const mockMessages = [
      { id: '1', content: 'Hello', sender_id: 'user-1', created_at: new Date().toISOString() },
      { id: '2', content: 'Hi there', sender_id: 'admin-1', created_at: new Date().toISOString() },
    ];

    const { getByTestId } = render(<ChatScreen messages={mockMessages} />);

    expect(getByTestId('message-list')).toBeTruthy();
  });

  it('should send message when Send button is tapped', async () => {
    const mockSendMessage = jest.fn().mockResolvedValue();

    const { getByTestId } = render(<ChatScreen onSendMessage={mockSendMessage} />);

    fireEvent.changeText(getByTestId('message-input-field'), 'Hello admin');
    fireEvent.press(getByTestId('message-input-send-button'));

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Hello admin');
    });
  });

  it('should disable Send button when input is empty', () => {
    const { getByTestId } = render(<ChatScreen />);

    expect(getByTestId('message-input-send-button')).toBeDisabled();
  });

  it('should show optimistic UI update when sending message', async () => {
    const { getByTestId, getByText } = render(<ChatScreen />);

    fireEvent.changeText(getByTestId('message-input-field'), 'New message');
    fireEvent.press(getByTestId('message-input-send-button'));

    expect(getByText('New message')).toBeTruthy();
  });

  it('should subscribe to Realtime on mount', () => {
    const mockSubscribe = jest.fn();
    mockSupabaseRealtime.subscribeToMessages = mockSubscribe;

    render(<ChatScreen conversationId="conv-123" />);

    expect(mockSubscribe).toHaveBeenCalledWith('conv-123', expect.any(Function));
  });
});
```

### E2E Tests (Detox + Cucumber)

**File**: `src/features/Chat/__tests__/Chat.feature`

```gherkin
Feature: Chat - Send and Receive Messages

  Background:
    Given I am logged in
    And I am on the Chat screen

  Scenario: Send message
    When I type "Hello, I need help"
    And I tap the Send button
    Then I should see my message in the chat
    And the input field should be cleared

  Scenario: Receive message from admin
    Given I am on the Chat screen
    When the admin sends a message "How can I help you?"
    Then I should see the admin's message in the chat

  Scenario: Empty state
    Given I have no messages
    When I open the Chat screen
    Then I should see "Start a conversation with our team"
```

---

## Dependencies

**Upstream**:

- EPIC-021: Registration (user account exists)
- EPIC-022: Login (authentication working)
- Supabase Realtime configured

**Downstream**:

- US-047: Message History (pagination)
- US-048: Typing Indicators
- US-049: Chat Attachments

---

## Risks & Mitigation

| Risk                      | Probability | Impact | Mitigation                             |
| ------------------------- | ----------- | ------ | -------------------------------------- |
| Realtime connection drops | Medium      | Medium | Auto-reconnect, show connection status |
| Message delivery failure  | Low         | High   | Retry logic, offline queue             |
| Slow message rendering    | Low         | Medium | FlatList optimization, getItemLayout   |

---

## Definition of Done

**Functional**:

- [ ] All acceptance criteria met
- [ ] All 6 tasks complete
- [ ] Chat working on iOS + Android

**Quality**:

- [ ] 100% RNTL coverage
- [ ] All E2E tests passing
- [ ] `yarn validate` passes

**Security**:

- [ ] RLS policies enforced
- [ ] All API calls authenticated
- [ ] No messages cached locally

**Accessibility**:

- [ ] All EAA requirements met
- [ ] Screen reader tested

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-025](../epics/EPIC-025-chat.md), [US-047](US-047-message-history.md)
