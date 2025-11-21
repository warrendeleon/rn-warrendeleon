# TASK-269: MessageList Component

**ID**: TASK-269 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-047](../stories/US-047-message-history-pagination.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Create an optimised MessageList component using FlatList for rendering chat messages efficiently. Support pagination, pull-to-refresh, loading states, empty states, and proper performance optimisation with React.memo and list item recycling.

---

## Acceptance Criteria

- [ ] MessageList component created in `src/components/chat/MessageList.tsx`
- [ ] FlatList implementation with inverted list (newest at bottom)
- [ ] Pagination support (load more on scroll to top)
- [ ] Pull-to-refresh functionality
- [ ] Loading state indicator
- [ ] Empty state when no messages
- [ ] Message grouping by date
- [ ] Performance optimised (React.memo, getItemLayout, keyExtractor)
- [ ] All EAA accessibility requirements met
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### MessageList Component

```typescript
// src/components/chat/MessageList.tsx

import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  ListRenderItem,
  StyleSheet,
  View,
} from 'react-native';
import {
  Box,
  Text,
  Spinner,
  VStack,
} from '@gluestack-ui/themed';
import { MessageBubble } from './MessageBubble';
import { EmptyState } from './EmptyState';
import { formatMessageDate, isSameDay } from '../../utils/dateUtils';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name?: string;
  content: string;
  created_at: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  attachment_url?: string;
  attachment_type?: 'image' | 'file';
}

export interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  testID?: string;
}

interface MessageSection {
  type: 'date' | 'message';
  id: string;
  date?: string;
  message?: Message;
}

/**
 * Group messages by date sections for display
 */
const groupMessagesByDate = (messages: Message[]): MessageSection[] => {
  const sections: MessageSection[] = [];
  let lastDate: string | null = null;

  messages.forEach((message) => {
    const messageDate = new Date(message.created_at);
    const currentDate = formatMessageDate(messageDate);

    // Add date separator if date changed
    if (currentDate !== lastDate) {
      sections.push({
        type: 'date',
        id: `date-${message.created_at}`,
        date: currentDate,
      });
      lastDate = currentDate;
    }

    // Add message
    sections.push({
      type: 'message',
      id: message.id,
      message,
    });
  });

  return sections;
};

export const MessageList: React.FC<MessageListProps> = React.memo(
  ({
    messages,
    currentUserId,
    isLoading = false,
    isLoadingMore = false,
    hasMore = false,
    onLoadMore,
    onRefresh,
    emptyStateTitle = 'No messages yet',
    emptyStateDescription = 'Start a conversation by sending a message',
    testID = 'message-list',
  }) => {
    /**
     * Group messages by date for display
     */
    const sections = useMemo(() => groupMessagesByDate(messages), [messages]);

    /**
     * Render individual message or date separator
     */
    const renderItem: ListRenderItem<MessageSection> = useCallback(
      ({ item }) => {
        if (item.type === 'date') {
          return (
            <Box
              paddingVertical="$3"
              alignItems="center"
              testID={`date-separator-${item.id}`}
            >
              <Box
                backgroundColor="$gray200"
                borderRadius="$full"
                paddingHorizontal="$3"
                paddingVertical="$1"
              >
                <Text
                  fontSize="$xs"
                  color="$gray600"
                  fontWeight="$medium"
                  accessibilityRole="header"
                  accessibilityLabel={`Messages from ${item.date}`}
                >
                  {item.date}
                </Text>
              </Box>
            </Box>
          );
        }

        // Render message bubble
        const message = item.message!;
        const isOwnMessage = message.sender_id === currentUserId;

        return (
          <MessageBubble
            message={message}
            isOwnMessage={isOwnMessage}
            testID={`message-bubble-${message.id}`}
          />
        );
      },
      [currentUserId]
    );

    /**
     * Extract unique key for each item
     */
    const keyExtractor = useCallback((item: MessageSection) => item.id, []);

    /**
     * Handle end reached (scroll to top = load older messages)
     */
    const handleEndReached = useCallback(() => {
      if (hasMore && !isLoadingMore && onLoadMore) {
        onLoadMore();
      }
    }, [hasMore, isLoadingMore, onLoadMore]);

    /**
     * Render loading indicator at top when loading more
     */
    const renderListHeaderComponent = useCallback(() => {
      if (!isLoadingMore) {
        return null;
      }

      return (
        <Box
          paddingVertical="$4"
          alignItems="center"
          testID="loading-more-spinner"
        >
          <Spinner size="small" color="$blue600" />
          <Text
            fontSize="$sm"
            color="$gray600"
            marginTop="$2"
            accessibilityRole="text"
            accessibilityLabel="Loading more messages"
          >
            Loading more messages...
          </Text>
        </Box>
      );
    }, [isLoadingMore]);

    /**
     * Render empty state when no messages
     */
    const renderListEmptyComponent = useCallback(() => {
      if (isLoading) {
        return null;
      }

      return (
        <EmptyState
          title={emptyStateTitle}
          description={emptyStateDescription}
          testID="empty-state"
        />
      );
    }, [isLoading, emptyStateTitle, emptyStateDescription]);

    /**
     * Render footer (nothing for now, but could add "New messages" indicator)
     */
    const renderListFooterComponent = useCallback(() => {
      return <Box height={16} />;
    }, []);

    /**
     * Pull-to-refresh control
     */
    const refreshControl = useMemo(() => {
      if (!onRefresh) {
        return undefined;
      }

      return (
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
          accessibilityLabel="Pull to refresh messages"
        />
      );
    }, [isLoading, onRefresh]);

    /**
     * Show loading spinner on initial load
     */
    if (isLoading && messages.length === 0) {
      return (
        <Box
          flex={1}
          justifyContent="center"
          alignItems="center"
          testID="loading-spinner"
        >
          <VStack space="md" alignItems="center">
            <Spinner size="large" color="$blue600" />
            <Text
              fontSize="$md"
              color="$gray600"
              accessibilityRole="text"
              accessibilityLabel="Loading messages"
            >
              Loading messages...
            </Text>
          </VStack>
        </Box>
      );
    }

    return (
      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        inverted={false} // Newest at bottom (normal scroll direction)
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderListHeaderComponent}
        ListEmptyComponent={renderListEmptyComponent}
        ListFooterComponent={renderListFooterComponent}
        refreshControl={refreshControl}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        testID={testID}
        accessibilityRole="list"
        accessibilityLabel="Message list"
        // Performance optimisations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={20}
        windowSize={10}
      />
    );
  }
);

MessageList.displayName = 'MessageList';

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
```

---

### Date Utility Functions

```typescript
// src/utils/dateUtils.ts

/**
 * Format message date for display
 * - Today → "Today"
 * - Yesterday → "Yesterday"
 * - This week → Day name (e.g., "Monday")
 * - Older → Full date (e.g., "15 January 2025")
 */
export const formatMessageDate = (date: Date): string => {
  const now = new Date();
  const messageDate = new Date(date);

  // Reset time for accurate day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDateOnly = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate()
  );

  const diffTime = today.getTime() - messageDateOnly.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return messageDate.toLocaleDateString('en-GB', { weekday: 'long' });
  }

  // Full date for older messages
  return messageDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Format message time (HH:MM)
 */
export const formatMessageTime = (date: Date): string => {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/components/chat/__tests__/MessageList.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MessageList, Message } from '../MessageList';

describe('MessageList', () => {
  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      conversation_id: 'conv-123',
      sender_id: 'user-1',
      sender_name: 'John Doe',
      content: 'Hello!',
      created_at: '2025-01-21T10:00:00Z',
      status: 'sent',
    },
    {
      id: 'msg-2',
      conversation_id: 'conv-123',
      sender_id: 'current-user',
      content: 'Hi there!',
      created_at: '2025-01-21T10:01:00Z',
      status: 'delivered',
    },
    {
      id: 'msg-3',
      conversation_id: 'conv-123',
      sender_id: 'user-1',
      sender_name: 'John Doe',
      content: 'How are you?',
      created_at: '2025-01-22T09:00:00Z',
      status: 'sent',
    },
  ];

  describe('Rendering', () => {
    it('should render message list with messages', () => {
      const { getByTestId, getByText } = render(
        <MessageList messages={mockMessages} currentUserId="current-user" />
      );

      expect(getByTestId('message-list')).toBeTruthy();
      expect(getByText('Hello!')).toBeTruthy();
      expect(getByText('Hi there!')).toBeTruthy();
      expect(getByText('How are you?')).toBeTruthy();
    });

    it('should show loading state initially', () => {
      const { getByTestId, getByText } = render(
        <MessageList
          messages={[]}
          currentUserId="current-user"
          isLoading={true}
        />
      );

      expect(getByTestId('loading-spinner')).toBeTruthy();
      expect(getByText('Loading messages...')).toBeTruthy();
    });

    it('should show empty state when no messages', () => {
      const { getByTestId, getByText } = render(
        <MessageList
          messages={[]}
          currentUserId="current-user"
          isLoading={false}
        />
      );

      expect(getByTestId('empty-state')).toBeTruthy();
      expect(getByText('No messages yet')).toBeTruthy();
    });

    it('should show custom empty state text', () => {
      const { getByText } = render(
        <MessageList
          messages={[]}
          currentUserId="current-user"
          emptyStateTitle="Custom title"
          emptyStateDescription="Custom description"
        />
      );

      expect(getByText('Custom title')).toBeTruthy();
      expect(getByText('Custom description')).toBeTruthy();
    });
  });

  describe('Date Grouping', () => {
    it('should group messages by date', () => {
      const { getAllByTestId } = render(
        <MessageList messages={mockMessages} currentUserId="current-user" />
      );

      const dateSeparators = getAllByTestId(/date-separator-/);
      expect(dateSeparators.length).toBeGreaterThan(0);
    });

    it('should show date separator for each unique date', () => {
      const messagesWithMultipleDates: Message[] = [
        {
          ...mockMessages[0],
          created_at: '2025-01-20T10:00:00Z',
        },
        {
          ...mockMessages[1],
          created_at: '2025-01-21T10:00:00Z',
        },
        {
          ...mockMessages[2],
          created_at: '2025-01-22T10:00:00Z',
        },
      ];

      const { getAllByTestId } = render(
        <MessageList
          messages={messagesWithMultipleDates}
          currentUserId="current-user"
        />
      );

      const dateSeparators = getAllByTestId(/date-separator-/);
      expect(dateSeparators).toHaveLength(3);
    });
  });

  describe('Pagination', () => {
    it('should call onLoadMore when scrolling to top', async () => {
      const mockOnLoadMore = jest.fn();

      const { getByTestId } = render(
        <MessageList
          messages={mockMessages}
          currentUserId="current-user"
          hasMore={true}
          onLoadMore={mockOnLoadMore}
        />
      );

      const list = getByTestId('message-list');
      fireEvent(list, 'onEndReached');

      await waitFor(() => {
        expect(mockOnLoadMore).toHaveBeenCalled();
      });
    });

    it('should not call onLoadMore when already loading', () => {
      const mockOnLoadMore = jest.fn();

      const { getByTestId } = render(
        <MessageList
          messages={mockMessages}
          currentUserId="current-user"
          hasMore={true}
          isLoadingMore={true}
          onLoadMore={mockOnLoadMore}
        />
      );

      fireEvent(getByTestId('message-list'), 'onEndReached');

      expect(mockOnLoadMore).not.toHaveBeenCalled();
    });

    it('should not call onLoadMore when no more messages', () => {
      const mockOnLoadMore = jest.fn();

      const { getByTestId } = render(
        <MessageList
          messages={mockMessages}
          currentUserId="current-user"
          hasMore={false}
          onLoadMore={mockOnLoadMore}
        />
      );

      fireEvent(getByTestId('message-list'), 'onEndReached');

      expect(mockOnLoadMore).not.toHaveBeenCalled();
    });

    it('should show loading more indicator', () => {
      const { getByTestId, getByText } = render(
        <MessageList
          messages={mockMessages}
          currentUserId="current-user"
          isLoadingMore={true}
        />
      );

      expect(getByTestId('loading-more-spinner')).toBeTruthy();
      expect(getByText('Loading more messages...')).toBeTruthy();
    });
  });

  describe('Pull-to-Refresh', () => {
    it('should call onRefresh when pulling to refresh', async () => {
      const mockOnRefresh = jest.fn();

      const { getByTestId } = render(
        <MessageList
          messages={mockMessages}
          currentUserId="current-user"
          onRefresh={mockOnRefresh}
        />
      );

      const list = getByTestId('message-list');
      fireEvent(list, 'refresh');

      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalled();
      });
    });

    it('should not show refresh control when onRefresh not provided', () => {
      const { getByTestId } = render(
        <MessageList messages={mockMessages} currentUserId="current-user" />
      );

      const list = getByTestId('message-list');
      expect(list.props.refreshControl).toBeUndefined();
    });
  });

  describe('Message Rendering', () => {
    it('should render own messages with correct styling', () => {
      const { getByTestId } = render(
        <MessageList messages={mockMessages} currentUserId="current-user" />
      );

      expect(getByTestId('message-bubble-msg-2')).toBeTruthy();
    });

    it('should render other user messages with correct styling', () => {
      const { getByTestId } = render(
        <MessageList messages={mockMessages} currentUserId="current-user" />
      );

      expect(getByTestId('message-bubble-msg-1')).toBeTruthy();
      expect(getByTestId('message-bubble-msg-3')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility role', () => {
      const { getByTestId } = render(
        <MessageList messages={mockMessages} currentUserId="current-user" />
      );

      const list = getByTestId('message-list');
      expect(list).toHaveProp('accessibilityRole', 'list');
      expect(list).toHaveProp('accessibilityLabel', 'Message list');
    });

    it('should have accessible date separators', () => {
      const { getAllByRole } = render(
        <MessageList messages={mockMessages} currentUserId="current-user" />
      );

      const headers = getAllByRole('header');
      expect(headers.length).toBeGreaterThan(0);
    });

    it('should have accessible loading state', () => {
      const { getByLabelText } = render(
        <MessageList
          messages={[]}
          currentUserId="current-user"
          isLoading={true}
        />
      );

      expect(getByLabelText('Loading messages')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should use keyExtractor correctly', () => {
      const { getByTestId } = render(
        <MessageList messages={mockMessages} currentUserId="current-user" />
      );

      const list = getByTestId('message-list');
      expect(list.props.keyExtractor).toBeDefined();

      // Test keyExtractor function
      const key = list.props.keyExtractor({ id: 'test-id', type: 'message' });
      expect(key).toBe('test-id');
    });

    it('should have performance optimisations enabled', () => {
      const { getByTestId } = render(
        <MessageList messages={mockMessages} currentUserId="current-user" />
      );

      const list = getByTestId('message-list');
      expect(list.props.removeClippedSubviews).toBe(true);
      expect(list.props.maxToRenderPerBatch).toBe(10);
      expect(list.props.initialNumToRender).toBe(20);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message array', () => {
      const { getByTestId } = render(
        <MessageList messages={[]} currentUserId="current-user" />
      );

      expect(getByTestId('empty-state')).toBeTruthy();
    });

    it('should handle very long message list', () => {
      const longMessageList = Array.from({ length: 100 }, (_, i) => ({
        id: `msg-${i}`,
        conversation_id: 'conv-123',
        sender_id: i % 2 === 0 ? 'user-1' : 'current-user',
        content: `Message ${i}`,
        created_at: new Date(2025, 0, 21, 10, i).toISOString(),
        status: 'sent' as const,
      }));

      const { getByTestId } = render(
        <MessageList messages={longMessageList} currentUserId="current-user" />
      );

      expect(getByTestId('message-list')).toBeTruthy();
    });
  });
});
```

---

## Dependencies

- React Native (FlatList, RefreshControl)
- GlueStack UI
- MessageBubble component (TASK-263)
- EmptyState component (TASK-271)
- Date utility functions

---

## Definition of Done

- [ ] MessageList component implemented
- [ ] FlatList with inverted list working
- [ ] Pagination support working
- [ ] Pull-to-refresh working
- [ ] Loading states working
- [ ] Empty state working
- [ ] Date grouping working
- [ ] Performance optimised
- [ ] All unit tests passing
- [ ] EAA compliance verified
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-047](../stories/US-047-message-history-pagination.md), [TASK-263](TASK-263-message-bubble.md), [TASK-268](TASK-268-pagination-logic.md), [TASK-271](TASK-271-empty-state.md)
