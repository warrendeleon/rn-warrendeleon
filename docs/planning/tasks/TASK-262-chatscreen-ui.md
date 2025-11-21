# TASK-262: ChatScreen UI Implementation

**ID**: TASK-262 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-046](../stories/US-046-send-receive-messages.md)
**Status**: 📋 To Do | **Effort**: 2.5h

---

## Task Description

Create the ChatScreen component with message list, input field, send button, and real-time message display. Integrate FlatList for efficient rendering, pull-to-refresh for loading older messages, and optimistic UI updates for sent messages.

---

## Acceptance Criteria

- [ ] ChatScreen component created in `src/screens/chat/ChatScreen.tsx`
- [ ] FlatList for message rendering (inverted for chat layout)
- [ ] MessageBubble component integration
- [ ] MessageInput component integration
- [ ] Pull-to-refresh for loading older messages
- [ ] Empty state for no messages
- [ ] Loading indicators
- [ ] Optimistic UI updates (show message immediately, update with server response)
- [ ] Auto-scroll to bottom on new message
- [ ] All EAA accessibility requirements met
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### ChatScreen Component

```typescript
// src/screens/chat/ChatScreen.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import {
  Box,
  VStack,
  Text,
  Spinner,
  HStack,
} from '@gluestack-ui/themed';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { MessageInput } from '../../components/chat/MessageInput';
import { EmptyState } from '../../components/chat/EmptyState';
import { useMessages } from '../../hooks/chat/useMessages';
import { useRealtimeSubscription } from '../../hooks/chat/useRealtimeSubscription';
import type { Message } from '../../types/chat';

type ChatRouteParams = {
  conversationId: string;
  recipientName: string;
  recipientAvatar?: string;
};

export const ChatScreen: React.FC = () => {
  const route = useRoute<RouteProp<{ params: ChatRouteParams }, 'params'>>();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);

  const { conversationId, recipientName, recipientAvatar } = route.params;

  const {
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    sendMessage,
    loadMoreMessages,
    updateMessageStatus,
  } = useMessages(conversationId);

  // Subscribe to realtime messages
  useRealtimeSubscription(conversationId, (newMessage: Message) => {
    // Scroll to bottom when new message arrives
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);
  });

  // Set header title
  useEffect(() => {
    navigation.setOptions({
      title: recipientName,
      headerBackTitle: 'Back',
    });
  }, [navigation, recipientName]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      try {
        await sendMessage(text);

        // Scroll to bottom after sending
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    },
    [sendMessage]
  );

  const handleLoadMore = useCallback(async () => {
    if (!isLoadingMore && hasMore) {
      await loadMoreMessages();
    }
  }, [isLoadingMore, hasMore, loadMoreMessages]);

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      return <MessageBubble message={item} />;
    },
    []
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) {
      return null;
    }

    return (
      <Box padding="$4" alignItems="center">
        <Spinner size="small" testID="loading-more-spinner" />
      </Box>
    );
  }, [isLoadingMore]);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  // Initial loading state
  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#F9FAFB' }}
        testID="chat-screen"
      >
        <Box flex={1} justifyContent="center" alignItems="center">
          <VStack space="md" alignItems="center">
            <Spinner size="large" testID="loading-spinner" />
            <Text fontSize="$md" color="$gray600">
              Loading messages...
            </Text>
          </VStack>
        </Box>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#F9FAFB' }}
        testID="chat-screen"
      >
        <Box flex={1} justifyContent="center" alignItems="center" padding="$6">
          <VStack space="md" alignItems="center">
            <Text fontSize="$lg" color="$red600" textAlign="center">
              Failed to load messages
            </Text>
            <Text fontSize="$sm" color="$gray600" textAlign="center">
              {error}
            </Text>
          </VStack>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#F9FAFB' }}
      edges={['bottom']}
      testID="chat-screen"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <VStack flex={1}>
          {/* Message List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            inverted // Chat messages are displayed bottom-to-top
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 16,
              flexGrow: messages.length === 0 ? 1 : undefined,
            }}
            ListEmptyComponent={
              <EmptyState
                title="No messages yet"
                description={`Start a conversation with ${recipientName}`}
                testID="empty-state"
              />
            }
            ListFooterComponent={renderFooter}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={isLoadingMore}
                onRefresh={handleLoadMore}
                tintColor="#3B82F6"
                testID="refresh-control"
              />
            }
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={Platform.OS === 'android'}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={21}
            testID="message-list"
            accessibilityRole="list"
            accessibilityLabel="Message list"
          />

          {/* Message Input */}
          <MessageInput
            onSend={handleSendMessage}
            placeholder={`Message ${recipientName}...`}
            testID="message-input"
          />
        </VStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
```

---

### Custom Hook: useMessages

```typescript
// src/hooks/chat/useMessages.ts

import { useState, useEffect, useCallback } from 'react';
import { fetchMessages, sendMessageToConversation } from '../../services/chat/chatService';
import type { Message } from '../../types/chat';

const PAGE_SIZE = 20;

export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedMessages = await fetchMessages(conversationId, 0, PAGE_SIZE);

      setMessages(fetchedMessages);
      setHasMore(fetchedMessages.length === PAGE_SIZE);
      setPage(0);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore) {
      return;
    }

    try {
      setIsLoadingMore(true);

      const nextPage = page + 1;
      const olderMessages = await fetchMessages(conversationId, nextPage, PAGE_SIZE);

      setMessages(prev => [...prev, ...olderMessages]);
      setHasMore(olderMessages.length === PAGE_SIZE);
      setPage(nextPage);
    } catch (err: any) {
      console.error('Failed to load more messages:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const sendMessage = async (text: string) => {
    // Optimistic update - add message immediately with pending status
    const optimisticMessage: Message = {
      id: `temp_${Date.now()}`,
      conversation_id: conversationId,
      sender_id: 'current_user', // Replace with actual user ID
      content: text,
      created_at: new Date().toISOString(),
      status: 'sending',
    };

    setMessages(prev => [optimisticMessage, ...prev]);

    try {
      // Send to server
      const sentMessage = await sendMessageToConversation(conversationId, text);

      // Replace optimistic message with server response
      setMessages(prev => prev.map(msg => (msg.id === optimisticMessage.id ? sentMessage : msg)));
    } catch (err: any) {
      console.error('Failed to send message:', err);

      // Mark message as failed
      setMessages(prev =>
        prev.map(msg => (msg.id === optimisticMessage.id ? { ...msg, status: 'failed' } : msg))
      );

      throw err;
    }
  };

  const updateMessageStatus = useCallback((messageId: string, status: Message['status']) => {
    setMessages(prev => prev.map(msg => (msg.id === messageId ? { ...msg, status } : msg)));
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      // Avoid duplicates
      if (prev.some(msg => msg.id === message.id)) {
        return prev;
      }
      return [message, ...prev];
    });
  }, []);

  return {
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    sendMessage,
    loadMoreMessages,
    updateMessageStatus,
    addMessage,
  };
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/screens/chat/__tests__/ChatScreen.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ChatScreen } from '../ChatScreen';
import * as chatService from '../../../services/chat/chatService';

jest.mock('../../../services/chat/chatService');
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({
    params: {
      conversationId: 'conv-123',
      recipientName: 'John Doe',
    },
  }),
  useNavigation: () => ({
    setOptions: jest.fn(),
  }),
}));

const mockChatService = chatService as jest.Mocked<typeof chatService>;

describe('ChatScreen', () => {
  const mockMessages = [
    {
      id: 'msg-1',
      conversation_id: 'conv-123',
      sender_id: 'user-1',
      content: 'Hello!',
      created_at: '2025-01-21T10:00:00Z',
      status: 'sent',
    },
    {
      id: 'msg-2',
      conversation_id: 'conv-123',
      sender_id: 'user-2',
      content: 'Hi there!',
      created_at: '2025-01-21T10:01:00Z',
      status: 'delivered',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockChatService.fetchMessages.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { getByTestId, getByText } = render(<ChatScreen />);

    expect(getByTestId('loading-spinner')).toBeTruthy();
    expect(getByText('Loading messages...')).toBeTruthy();
  });

  it('should render messages after loading', async () => {
    mockChatService.fetchMessages.mockResolvedValue(mockMessages);

    const { getByTestId, getByText } = render(<ChatScreen />);

    await waitFor(() => {
      expect(getByTestId('message-list')).toBeTruthy();
      expect(getByText('Hello!')).toBeTruthy();
      expect(getByText('Hi there!')).toBeTruthy();
    });
  });

  it('should render empty state when no messages', async () => {
    mockChatService.fetchMessages.mockResolvedValue([]);

    const { getByTestId, getByText } = render(<ChatScreen />);

    await waitFor(() => {
      expect(getByTestId('empty-state')).toBeTruthy();
      expect(getByText('No messages yet')).toBeTruthy();
    });
  });

  // Additional tests in TASK-267
});
```

---

## Dependencies

- React Navigation
- GlueStack UI
- MessageBubble component (TASK-263)
- MessageInput component (TASK-264)
- EmptyState component (TASK-271)
- Chat service (TASK-266)
- Realtime subscription hook (TASK-265)

---

## Definition of Done

- [ ] Component implemented and renders correctly
- [ ] FlatList optimized for performance
- [ ] Pull-to-refresh working
- [ ] Empty state working
- [ ] Message input integrated
- [ ] Optimistic updates working
- [ ] Auto-scroll to bottom working
- [ ] All unit tests passing
- [ ] EAA compliance verified
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-046](../stories/US-046-send-receive-messages.md), [TASK-263](TASK-263-message-bubble.md), [TASK-264](TASK-264-message-input.md), [TASK-265](TASK-265-supabase-realtime.md)
