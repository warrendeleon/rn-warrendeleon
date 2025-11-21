# US-047: Message History with Pagination

**ID**: US-047 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **Title**: Load Message History with Infinite Scroll
**Status**: 📋 To Do | **Priority**: Medium | **Story Points**: 3 | **Effort**: 7.5h

---

## User Story

**As a** registered user
**I want to** scroll up to load older messages in my conversation
**So that** I can review past conversations and context

---

## Acceptance Criteria

### Functional Requirements

1. **Initial Load**
   - [ ] ChatScreen loads last 50 messages on mount
   - [ ] Messages displayed in chronological order (newest at bottom)
   - [ ] Scroll position starts at bottom (latest message visible)

2. **Load More (Infinite Scroll)**
   - [ ] When user scrolls to top of message list: Load next 50 older messages
   - [ ] Loading indicator shown at top while fetching
   - [ ] New messages inserted at top of list
   - [ ] Scroll position maintained (user stays at same message after load)

3. **End of History**
   - [ ] When all messages loaded: Show "Beginning of conversation"
   - [ ] No more pagination attempts after reaching end

4. **Performance Optimization**
   - [ ] Messages loaded in batches of 50
   - [ ] FlatList uses `getItemLayout` for smooth scrolling
   - [ ] Pagination triggered only once per scroll-to-top

### Non-Functional Requirements

1. **Performance**
   - [ ] Pagination load: <1 second
   - [ ] Smooth scrolling (60 FPS)
   - [ ] Memory efficient (recycle off-screen items)

2. **Accessibility (EAA)**
   - [ ] Loading indicator has `accessibilityLabel="Loading older messages"`
   - [ ] "Beginning of conversation" has `accessibilityRole="header"`

3. **Testing**
   - [ ] 100% RNTL coverage for pagination logic
   - [ ] E2E test for scroll-to-load flow

---

## Technical Implementation

### Component Structure

```typescript
// src/screens/chat/ChatScreen.tsx (with pagination)

ChatScreen
├── Header
├── MessageList (FlatList inverted with pagination)
│   ├── LoadingIndicator (at top, when loading more)
│   ├── EndOfHistory ("Beginning of conversation")
│   └── MessageBubble[]
└── MessageInput
```

### Data Flow

```
User scrolls to top of message list
  → onEndReached triggered (inverted FlatList)
  → Check if already loading or at end of history
  → If loading or at end: Return early
  → Set loadingMore = true
  → Fetch next 50 messages (offset by current count)
  → On success:
    → Prepend new messages to list
    → Maintain scroll position (FlatList handles automatically)
    → Set loadingMore = false
  → If no more messages:
    → Set hasMore = false
    → Show "Beginning of conversation"
```

### useChatMessages Hook (with Pagination)

```typescript
// src/hooks/useChatMessages.ts (enhanced)

import { useState, useEffect } from 'react';
import {
  subscribeToMessages,
  unsubscribeFromMessages,
  Message,
} from '../services/chat/realtimeService';
import { sendMessage as sendMessageAPI } from '../api/chat/messages';
import Config from 'react-native-config';
import { getAccessToken } from '../services/storage/keychainService';

const MESSAGES_PER_PAGE = 50;

export const useChatMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time updates
    const subscription = subscribeToMessages(conversationId, newMessage => {
      setMessages(prev => [newMessage, ...prev]); // Inverted list
    });

    return () => {
      unsubscribeFromMessages(subscription);
    };
  }, [conversationId]);

  const fetchMessages = async (offset: number = 0) => {
    try {
      if (offset === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const accessToken = await getAccessToken();

      const response = await fetch(
        `${Config.SUPABASE_URL}/rest/v1/messages?conversation_id=eq.${conversationId}&order=created_at.desc&limit=${MESSAGES_PER_PAGE}&offset=${offset}`,
        {
          headers: {
            apikey: Config.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data: Message[] = await response.json();

      if (offset === 0) {
        setMessages(data);
      } else {
        setMessages(prev => [...prev, ...data]); // Append older messages
      }

      // Check if there are more messages
      if (data.length < MESSAGES_PER_PAGE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (isLoadingMore || !hasMore) return;

    fetchMessages(messages.length);
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
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    isSending,
    sendMessage,
    loadMore,
    refreshMessages: () => fetchMessages(0),
  };
};
```

### MessageList Component

```typescript
// src/components/chat/MessageList.tsx

import React from 'react';
import { FlatList, ActivityIndicator, View, Text } from 'react-native';
import { MessageBubble } from './MessageBubble';
import { Message } from '../../services/chat/realtimeService';
import { Box } from '@gluestack-ui/themed';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  testID?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isLoadingMore,
  hasMore,
  onLoadMore,
  testID = 'message-list',
}) => {
  const renderItem = ({ item }: { item: Message }) => (
    <MessageBubble
      message={item}
      isCurrentUser={item.sender_id === currentUserId}
      testID={`message-${item.id}`}
    />
  );

  const renderFooter = () => {
    if (!hasMore) {
      return (
        <Box
          padding="$4"
          alignItems="center"
          testID="end-of-history"
          accessibilityRole="header"
        >
          <Text style={{ fontSize: 14, color: '#9CA3AF' }}>
            Beginning of conversation
          </Text>
        </Box>
      );
    }

    if (isLoadingMore) {
      return (
        <Box
          padding="$4"
          alignItems="center"
          testID="loading-more-indicator"
          accessibilityLabel="Loading older messages"
        >
          <ActivityIndicator size="small" color="#3B82F6" />
        </Box>
      );
    }

    return null;
  };

  const getItemLayout = (data: any, index: number) => ({
    length: 80, // Approximate message height
    offset: 80 * index,
    index,
  });

  return (
    <FlatList
      data={messages}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      inverted // Latest messages at bottom
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      getItemLayout={getItemLayout}
      testID={testID}
      contentContainerStyle={{ flexGrow: 1 }}
    />
  );
};
```

### Empty State Component

```typescript
// src/components/chat/EmptyState.tsx

import React from 'react';
import { View, Text } from 'react-native';
import { Box, VStack } from '@gluestack-ui/themed';

export const EmptyState: React.FC = () => {
  return (
    <Box
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding="$6"
      testID="chat-empty-state"
    >
      <VStack space="md" alignItems="center">
        <Text style={{ fontSize: 48 }}>💬</Text>

        <VStack space="xs" alignItems="center">
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#1F2937',
              textAlign: 'center',
            }}
          >
            Start a conversation
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: '#6B7280',
              textAlign: 'center',
            }}
          >
            Send your first message to our team.{'\n'}
            We typically respond within 5 minutes.
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};
```

---

## Tasks Breakdown

| Task ID  | Description           | Effort |
| -------- | --------------------- | ------ |
| TASK-268 | Pagination Logic      | 2h     |
| TASK-269 | MessageList Component | 2h     |
| TASK-270 | Loading States        | 1.5h   |
| TASK-271 | EmptyState Component  | 1h     |
| TASK-272 | Pagination RNTL Tests | 1h     |

**Total**: 5 tasks, 7.5 hours

---

## Testing Strategy

### Unit Tests (RNTL)

**File**: `src/components/chat/__tests__/MessageList.test.tsx`

```typescript
describe('MessageList', () => {
  const mockMessages = [
    { id: '1', content: 'Message 1', sender_id: 'user-1', created_at: '2025-01-01T10:00:00Z' },
    { id: '2', content: 'Message 2', sender_id: 'admin-1', created_at: '2025-01-01T10:05:00Z' },
  ];

  it('should render all messages', () => {
    const { getByTestId } = render(
      <MessageList
        messages={mockMessages}
        currentUserId="user-1"
        isLoadingMore={false}
        hasMore={true}
        onLoadMore={jest.fn()}
      />
    );

    expect(getByTestId('message-1')).toBeTruthy();
    expect(getByTestId('message-2')).toBeTruthy();
  });

  it('should show loading indicator when loading more', () => {
    const { getByTestId } = render(
      <MessageList
        messages={mockMessages}
        currentUserId="user-1"
        isLoadingMore={true}
        hasMore={true}
        onLoadMore={jest.fn()}
      />
    );

    expect(getByTestId('loading-more-indicator')).toBeTruthy();
  });

  it('should show "Beginning of conversation" when no more messages', () => {
    const { getByTestId } = render(
      <MessageList
        messages={mockMessages}
        currentUserId="user-1"
        isLoadingMore={false}
        hasMore={false}
        onLoadMore={jest.fn()}
      />
    );

    expect(getByTestId('end-of-history')).toHaveTextContent('Beginning of conversation');
  });

  it('should call onLoadMore when scrolling to top', () => {
    const mockLoadMore = jest.fn();

    const { getByTestId } = render(
      <MessageList
        messages={mockMessages}
        currentUserId="user-1"
        isLoadingMore={false}
        hasMore={true}
        onLoadMore={mockLoadMore}
      />
    );

    // Simulate scroll to end (which is top in inverted list)
    fireEvent(getByTestId('message-list'), 'onEndReached');

    expect(mockLoadMore).toHaveBeenCalled();
  });
});
```

### E2E Tests (Detox + Cucumber)

**File**: `e2e/features/message-history.feature`

```gherkin
Feature: Message History with Pagination

  Background:
    Given I am logged in
    And I have 150 messages in my conversation
    And I am on the Chat screen

  Scenario: Load initial messages
    Then I should see the last 50 messages
    And the scroll position should be at the bottom

  Scenario: Load older messages
    When I scroll to the top of the message list
    Then I should see a loading indicator
    And 50 older messages should be loaded
    And my scroll position should be maintained

  Scenario: Reach beginning of conversation
    When I scroll to the top repeatedly until all messages are loaded
    Then I should see "Beginning of conversation"
    And no more loading should occur

  Scenario: Empty conversation
    Given I have no messages
    When I open the Chat screen
    Then I should see "Start a conversation"
```

---

## Dependencies

**Upstream**:

- US-046: Send and Receive Messages (chat functionality exists)

**Downstream**:

- None (Pagination is enhancement)

---

## Risks & Mitigation

| Risk                             | Probability | Impact | Mitigation                                         |
| -------------------------------- | ----------- | ------ | -------------------------------------------------- |
| Slow pagination on large history | Low         | Medium | Optimize query with indexes, limit to 50 per page  |
| Scroll position jumps after load | Low         | Medium | Use `getItemLayout`, FlatList maintains position   |
| Memory issues with many messages | Low         | Low    | FlatList recycles views, only render visible items |

---

## Definition of Done

**Functional**:

- [ ] All acceptance criteria met
- [ ] All 5 tasks complete
- [ ] Pagination working on iOS + Android

**Quality**:

- [ ] 100% RNTL coverage
- [ ] All E2E tests passing
- [ ] `yarn validate` passes

**Performance**:

- [ ] Smooth scrolling (60 FPS)
- [ ] Pagination load <1 second
- [ ] Memory efficient

**Accessibility**:

- [ ] All EAA requirements met
- [ ] Screen reader tested

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-025](../epics/EPIC-025-chat.md), [US-046](US-046-send-receive-messages.md)
