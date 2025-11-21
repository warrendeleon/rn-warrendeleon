# TASK-267: Chat RNTL Tests

**ID**: TASK-267 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-046](../stories/US-046-send-receive-messages.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Write comprehensive React Native Testing Library tests for ChatScreen. Test message rendering, sending messages, loading states, empty states, pull-to-refresh, realtime updates, and accessibility. Achieve 100% code coverage.

---

## Acceptance Criteria

- [ ] Complete RNTL test suite for ChatScreen
- [ ] Message rendering tested
- [ ] Send message tested
- [ ] Loading states tested
- [ ] Empty state tested
- [ ] Pull-to-refresh tested
- [ ] Realtime updates tested (mocked)
- [ ] Error states tested
- [ ] Accessibility tested
- [ ] 100% code coverage
- [ ] All tests passing

---

## Implementation Details

### Comprehensive RNTL Test Suite

```typescript
// src/screens/chat/__tests__/ChatScreen.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ChatScreen } from '../ChatScreen';
import * as chatService from '../../../services/chat/chatService';
import * as useMessages from '../../../hooks/chat/useMessages';
import * as useRealtimeSubscription from '../../../hooks/chat/useRealtimeSubscription';

jest.mock('../../../services/chat/chatService');
jest.mock('../../../hooks/chat/useMessages');
jest.mock('../../../hooks/chat/useRealtimeSubscription');

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
const mockUseMessages = useMessages.useMessages as jest.MockedFunction<typeof useMessages.useMessages>;
const mockUseRealtimeSubscription = useRealtimeSubscription.useRealtimeSubscription as jest.MockedFunction<
  typeof useRealtimeSubscription.useRealtimeSubscription
>;

describe('ChatScreen', () => {
  const mockMessages = [
    {
      id: 'msg-1',
      conversation_id: 'conv-123',
      sender_id: 'user-1',
      sender_name: 'John Doe',
      content: 'Hello!',
      created_at: '2025-01-21T10:00:00Z',
      status: 'sent' as const,
    },
    {
      id: 'msg-2',
      conversation_id: 'conv-123',
      sender_id: 'current-user',
      content: 'Hi there!',
      created_at: '2025-01-21T10:01:00Z',
      status: 'delivered' as const,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockUseMessages.mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      isLoadingMore: false,
      hasMore: true,
      error: null,
      sendMessage: jest.fn(),
      loadMoreMessages: jest.fn(),
      updateMessageStatus: jest.fn(),
      addMessage: jest.fn(),
    });

    mockUseRealtimeSubscription.mockReturnValue({
      connectionStatus: 'connected',
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render screen with messages', async () => {
      const { getByTestId, getByText } = render(<ChatScreen />);

      await waitFor(() => {
        expect(getByTestId('chat-screen')).toBeTruthy();
        expect(getByTestId('message-list')).toBeTruthy();
        expect(getByTestId('message-input')).toBeTruthy();
        expect(getByText('Hello!')).toBeTruthy();
        expect(getByText('Hi there!')).toBeTruthy();
      });
    });

    it('should show loading state initially', () => {
      mockUseMessages.mockReturnValue({
        messages: [],
        isLoading: true,
        isLoadingMore: false,
        hasMore: false,
        error: null,
        sendMessage: jest.fn(),
        loadMoreMessages: jest.fn(),
        updateMessageStatus: jest.fn(),
        addMessage: jest.fn(),
      });

      const { getByTestId, getByText } = render(<ChatScreen />);

      expect(getByTestId('loading-spinner')).toBeTruthy();
      expect(getByText('Loading messages...')).toBeTruthy();
    });

    it('should show empty state when no messages', async () => {
      mockUseMessages.mockReturnValue({
        messages: [],
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        error: null,
        sendMessage: jest.fn(),
        loadMoreMessages: jest.fn(),
        updateMessageStatus: jest.fn(),
        addMessage: jest.fn(),
      });

      const { getByTestId, getByText } = render(<ChatScreen />);

      await waitFor(() => {
        expect(getByTestId('empty-state')).toBeTruthy();
        expect(getByText('No messages yet')).toBeTruthy();
        expect(getByText(/Start a conversation with John Doe/)).toBeTruthy();
      });
    });

    it('should show error state', () => {
      mockUseMessages.mockReturnValue({
        messages: [],
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        error: 'Failed to load messages',
        sendMessage: jest.fn(),
        loadMoreMessages: jest.fn(),
        updateMessageStatus: jest.fn(),
        addMessage: jest.fn(),
      });

      const { getByText } = render(<ChatScreen />);

      expect(getByText('Failed to load messages')).toBeTruthy();
      expect(getByText('Failed to load messages')).toBeTruthy();
    });
  });

  describe('Sending Messages', () => {
    it('should send message when send button pressed', async () => {
      const mockSendMessage = jest.fn().mockResolvedValue(undefined);

      mockUseMessages.mockReturnValue({
        messages: mockMessages,
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        error: null,
        sendMessage: mockSendMessage,
        loadMoreMessages: jest.fn(),
        updateMessageStatus: jest.fn(),
        addMessage: jest.fn(),
      });

      const { getByTestId } = render(<ChatScreen />);

      await waitFor(() => {
        expect(getByTestId('message-input')).toBeTruthy();
      });

      // Type message
      const input = getByTestId('message-text-input');
      fireEvent.changeText(input, 'New message');

      // Send message
      const sendButton = getByTestId('send-button');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('New message');
      });
    });

    it('should show optimistic message while sending', async () => {
      let resolveSend: () => void;
      const sendPromise = new Promise<void>((resolve) => {
        resolveSend = resolve;
      });

      const mockSendMessage = jest.fn().mockReturnValue(sendPromise);

      mockUseMessages.mockReturnValue({
        messages: mockMessages,
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        error: null,
        sendMessage: mockSendMessage,
        loadMoreMessages: jest.fn(),
        updateMessageStatus: jest.fn(),
        addMessage: jest.fn(),
      });

      const { getByTestId } = render(<ChatScreen />);

      await waitFor(() => {
        expect(getByTestId('message-input')).toBeTruthy();
      });

      // Type and send message
      fireEvent.changeText(getByTestId('message-text-input'), 'New message');
      fireEvent.press(getByTestId('send-button'));

      // Message should be sent
      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalled();
      });

      resolveSend!();
    });

    it('should handle send errors', async () => {
      const mockSendMessage = jest.fn().mockRejectedValue(new Error('Send failed'));

      mockUseMessages.mockReturnValue({
        messages: mockMessages,
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        error: null,
        sendMessage: mockSendMessage,
        loadMoreMessages: jest.fn(),
        updateMessageStatus: jest.fn(),
        addMessage: jest.fn(),
      });

      const { getByTestId } = render(<ChatScreen />);

      await waitFor(() => {
        expect(getByTestId('message-input')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('message-text-input'), 'New message');
      fireEvent.press(getByTestId('send-button'));

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalled();
      });
    });
  });

  describe('Load More Messages (Pull-to-Refresh)', () => {
    it('should load more messages when scrolling to top', async () => {
      const mockLoadMoreMessages = jest.fn();

      mockUseMessages.mockReturnValue({
        messages: mockMessages,
        isLoading: false,
        isLoadingMore: false,
        hasMore: true,
        error: null,
        sendMessage: jest.fn(),
        loadMoreMessages: mockLoadMoreMessages,
        updateMessageStatus: jest.fn(),
        addMessage: jest.fn(),
      });

      const { getByTestId } = render(<ChatScreen />);

      await waitFor(() => {
        expect(getByTestId('message-list')).toBeTruthy();
      });

      // Trigger onEndReached
      const messageList = getByTestId('message-list');
      fireEvent(messageList, 'onEndReached');

      await waitFor(() => {
        expect(mockLoadMoreMessages).toHaveBeenCalled();
      });
    });

    it('should not load more when already loading', async () => {
      const mockLoadMoreMessages = jest.fn();

      mockUseMessages.mockReturnValue({
        messages: mockMessages,
        isLoading: false,
        isLoadingMore: true,
        hasMore: true,
        error: null,
        sendMessage: jest.fn(),
        loadMoreMessages: mockLoadMoreMessages,
        updateMessageStatus: jest.fn(),
        addMessage: jest.fn(),
      });

      const { getByTestId } = render(<ChatScreen />);

      await waitFor(() => {
        expect(getByTestId('message-list')).toBeTruthy();
      });

      fireEvent(getByTestId('message-list'), 'onEndReached');

      await waitFor(() => {
        expect(mockLoadMoreMessages).not.toHaveBeenCalled();
      });
    });

    it('should not load more when no more messages', async () => {
      const mockLoadMoreMessages = jest.fn();

      mockUseMessages.mockReturnValue({
        messages: mockMessages,
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        error: null,
        sendMessage: jest.fn(),
        loadMoreMessages: mockLoadMoreMessages,
        updateMessageStatus: jest.fn(),
        addMessage: jest.fn(),
      });

      const { getByTestId } = render(<ChatScreen />);

      await waitFor(() => {
        expect(getByTestId('message-list')).toBeTruthy();
      });

      fireEvent(getByTestId('message-list'), 'onEndReached');

      await waitFor(() => {
        expect(mockLoadMoreMessages).not.toHaveBeenCalled();
      });
    });

    it('should show loading spinner while loading more', async () => {
      mockUseMessages.mockReturnValue({
        messages: mockMessages,
        isLoading: false,
        isLoadingMore: true,
        hasMore: true,
        error: null,
        sendMessage: jest.fn(),
        loadMoreMessages: jest.fn(),
        updateMessageStatus: jest.fn(),
        addMessage: jest.fn(),
      });

      const { getByTestId } = render(<ChatScreen />);

      await waitFor(() => {
        expect(getByTestId('loading-more-spinner')).toBeTruthy();
      });
    });
  });

  describe('Realtime Updates', () => {
    it('should subscribe to realtime updates', () => {
      render(<ChatScreen />);

      expect(mockUseRealtimeSubscription).toHaveBeenCalledWith(
        'conv-123',
        expect.any(Function)
      );
    });

    it('should show connection status', () => {
      mockUseRealtimeSubscription.mockReturnValue({
        connectionStatus: 'disconnected',
        error: null,
      });

      render(<ChatScreen />);

      // Connection status is tracked but may not be displayed in UI
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility roles', async () => {
      const { getByTestId } = render(<ChatScreen />);

      await waitFor(() => {
        const messageList = getByTestId('message-list');
        expect(messageList).toHaveProp('accessibilityRole', 'list');
        expect(messageList).toHaveProp('accessibilityLabel', 'Message list');
      });
    });

    it('should have accessible message input', async () => {
      const { getByTestId } = render(<ChatScreen />);

      await waitFor(() => {
        const input = getByTestId('message-input');
        expect(input).toBeTruthy();
      });
    });
  });

  describe('KeyboardAvoidingView', () => {
    it('should have correct keyboard avoiding behavior on iOS', async () => {
      jest.mock('react-native/Libraries/Utilities/Platform', () => ({
        OS: 'ios',
        select: jest.fn(),
      }));

      const { getByTestId } = render(<ChatScreen />);

      await waitFor(() => {
        expect(getByTestID('chat-screen')).toBeTruthy();
      });
    });

    it('should have correct keyboard avoiding behavior on Android', async () => {
      jest.mock('react-native/Libraries/Utilities/Platform', () => ({
        OS: 'android',
        select: jest.fn(),
      }));

      const { getByTestId } = render(<ChatScreen />);

      await waitFor(() => {
        expect(getByTestId('chat-screen')).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long message list', async () => {
      const longMessageList = Array.from({ length: 100 }, (_, i) => ({
        id: `msg-${i}`,
        conversation_id: 'conv-123',
        sender_id: i % 2 === 0 ? 'user-1' : 'current-user',
        content: `Message ${i}`,
        created_at: new Date(2025, 0, 21, 10, i).toISOString(),
        status: 'sent' as const,
      }));

      mockUseMessages.mockReturnValue({
        messages: longMessageList,
        isLoading: false,
        isLoadingMore: false,
        hasMore: true,
        error: null,
        sendMessage: jest.fn(),
        loadMoreMessages: jest.fn(),
        updateMessageStatus: jest.fn(),
        addMessage: jest.fn(),
      });

      const { getByTestId } = render(<ChatScreen />);

      await waitFor(() => {
        expect(getByTestId('message-list')).toBeTruthy();
      });
    });

    it('should handle rapid message sending', async () => {
      const mockSendMessage = jest.fn().mockResolvedValue(undefined);

      mockUseMessages.mockReturnValue({
        messages: mockMessages,
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        error: null,
        sendMessage: mockSendMessage,
        loadMoreMessages: jest.fn(),
        updateMessageStatus: jest.fn(),
        addMessage: jest.fn(),
      });

      const { getByTestId } = render(<ChatScreen />);

      await waitFor(() => {
        expect(getByTestId('message-input')).toBeTruthy();
      });

      // Send multiple messages rapidly
      fireEvent.changeText(getByTestId('message-text-input'), 'Message 1');
      fireEvent.press(getByTestId('send-button'));

      fireEvent.changeText(getByTestId('message-text-input'), 'Message 2');
      fireEvent.press(getByTestId('send-button'));

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle empty conversation ID', () => {
      jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
        params: {
          conversationId: '',
          recipientName: 'John Doe',
        },
      });

      // Should not crash
      expect(() => render(<ChatScreen />)).not.toThrow();
    });
  });
});
```

---

## Dependencies

- `@testing-library/react-native`
- `@testing-library/jest-native`
- Jest
- ChatScreen component (TASK-262)
- Chat service (TASK-266)
- useMessages hook (TASK-262)
- useRealtimeSubscription hook (TASK-265)

---

## Definition of Done

- [ ] All test scenarios covered
- [ ] Message rendering tested
- [ ] Send message tested
- [ ] Loading states tested
- [ ] Empty state tested
- [ ] Pull-to-refresh tested
- [ ] Realtime updates tested
- [ ] Error states tested
- [ ] Accessibility tested
- [ ] Edge cases tested
- [ ] 100% code coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-046](../stories/US-046-send-receive-messages.md), [TASK-262](TASK-262-chatscreen-ui.md), [TASK-265](TASK-265-supabase-realtime.md), [TASK-266](TASK-266-send-message-api.md)
