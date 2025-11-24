# TASK-263: MessageBubble Component

**ID**: TASK-263 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-046](../stories/US-046-send-receive-messages.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## File Structure

```
src/features/Chat/
└── components/
    ├── MessageBubble.tsx
    └── __tests__/
        └── MessageBubble.test.tsx
```

**Note**: MessageBubble is a Chat-specific component, co-located with the Chat feature.

---

## Task Description

Create a MessageBubble component to display individual chat messages. Support sent/received styling, message status indicators (sending, sent, delivered, read, failed), timestamps, and accessibility features.

---

## Acceptance Criteria

- [ ] MessageBubble component created in `src/features/Chat/components/MessageBubble.tsx`
- [ ] Different styling for sent vs received messages
- [ ] Message status indicators (sending, sent, delivered, read, failed)
- [ ] Timestamp display
- [ ] Avatar for received messages
- [ ] Long press for message actions (copy, delete) - future enhancement
- [ ] All EAA accessibility requirements met
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### MessageBubble Component

```typescript
// src/features/Chat/components/MessageBubble.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import {
  Box,
  HStack,
  VStack,
  Text,
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from '@gluestack-ui/themed';
import { format } from 'date-fns';
import type { Message } from '@app/types/chat';

export interface MessageBubbleProps {
  message: Message;
  isOwnMessage?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage = false,
}) => {
  const { content, created_at, status, sender_avatar, sender_name } = message;

  const formattedTime = format(new Date(created_at), 'h:mm a');

  const getStatusIcon = () => {
    if (!isOwnMessage) return null;

    switch (status) {
      case 'sending':
        return '⏱'; // Clock icon
      case 'sent':
        return '✓'; // Single check
      case 'delivered':
        return '✓✓'; // Double check
      case 'read':
        return '✓✓'; // Double check (blue)
      case 'failed':
        return '⚠'; // Warning icon
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    if (status === 'read') return '#3B82F6'; // Blue for read
    if (status === 'failed') return '#DC2626'; // Red for failed
    return '#9CA3AF'; // Gray for other states
  };

  return (
    <HStack
      space="sm"
      alignItems="flex-end"
      justifyContent={isOwnMessage ? 'flex-end' : 'flex-start'}
      marginBottom="$3"
      testID={`message-bubble-${message.id}`}
      accessibilityRole="text"
      accessibilityLabel={`${isOwnMessage ? 'You' : sender_name}: ${content}. ${formattedTime}`}
    >
      {/* Avatar for received messages */}
      {!isOwnMessage && (
        <Avatar
          size="sm"
          backgroundColor="$blue500"
          testID="sender-avatar"
          accessibilityLabel={`${sender_name}'s avatar`}
        >
          {sender_avatar ? (
            <AvatarImage source={{ uri: sender_avatar }} />
          ) : (
            <AvatarFallbackText>{sender_name || 'User'}</AvatarFallbackText>
          )}
        </Avatar>
      )}

      {/* Message Bubble */}
      <Box
        maxWidth="75%"
        backgroundColor={isOwnMessage ? '$blue600' : '$white'}
        borderRadius="$lg"
        padding="$3"
        borderWidth={isOwnMessage ? 0 : 1}
        borderColor="$gray200"
        style={isOwnMessage ? styles.ownMessageShadow : styles.receivedMessageShadow}
      >
        <VStack space="xs">
          {/* Sender name for received messages */}
          {!isOwnMessage && (
            <Text
              fontSize="$xs"
              fontWeight="$semibold"
              color="$gray600"
              testID="sender-name"
            >
              {sender_name}
            </Text>
          )}

          {/* Message content */}
          <Text
            fontSize="$md"
            color={isOwnMessage ? '$white' : '$gray900'}
            testID="message-content"
            accessibilityRole="text"
          >
            {content}
          </Text>

          {/* Timestamp and status */}
          <HStack space="xs" alignItems="center" justifyContent="flex-end">
            <Text
              fontSize="$xs"
              color={isOwnMessage ? '$white' : '$gray500'}
              opacity={0.7}
              testID="message-timestamp"
            >
              {formattedTime}
            </Text>

            {/* Status indicator for own messages */}
            {isOwnMessage && (
              <Text
                fontSize="$xs"
                color={getStatusColor()}
                testID="message-status"
                accessibilityLabel={`Message status: ${status}`}
              >
                {getStatusIcon()}
              </Text>
            )}
          </HStack>
        </VStack>
      </Box>
    </HStack>
  );
};

const styles = StyleSheet.create({
  ownMessageShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  receivedMessageShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
});
```

---

### Message Type Definition

```typescript
// src/types/chat.ts (Shared type definition)

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name?: string;
  sender_avatar?: string;
  content: string;
  created_at: string;
  updated_at?: string;
  status: MessageStatus;
  attachments?: MessageAttachment[];
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  filename?: string;
  size?: number;
}
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/features/Chat/components/__tests__/MessageBubble.test.tsx

import React from 'react';
import { render } from '@testing-library/react-native';
import { MessageBubble } from '../MessageBubble';
import type { Message } from '@app/types/chat';

describe('MessageBubble', () => {
  const baseMock Message: Message = {
    id: 'msg-1',
    conversation_id: 'conv-1',
    sender_id: 'user-1',
    sender_name: 'John Doe',
    content: 'Hello, how are you?',
    created_at: '2025-01-21T10:00:00Z',
    status: 'sent',
  };

  describe('Own Messages', () => {
    it('should render own message with blue background', () => {
      const { getByTestId } = render(
        <MessageBubble message={mockMessage} isOwnMessage={true} />
      );

      const bubble = getByTestId(`message-bubble-${mockMessage.id}`);
      expect(bubble).toBeTruthy();

      // Should not show avatar for own messages
      expect(() => getByTestId('sender-avatar')).toThrow();

      // Should not show sender name for own messages
      expect(() => getByTestId('sender-name')).toThrow();
    });

    it('should show "sending" status', () => {
      const message = { ...mockMessage, status: 'sending' as const };
      const { getByTestId } = render(
        <MessageBubble message={message} isOwnMessage={true} />
      );

      const status = getByTestId('message-status');
      expect(status.props.children).toBe('⏱');
    });

    it('should show "sent" status', () => {
      const message = { ...mockMessage, status: 'sent' as const };
      const { getByTestId } = render(
        <MessageBubble message={message} isOwnMessage={true} />
      );

      const status = getByTestId('message-status');
      expect(status.props.children).toBe('✓');
    });

    it('should show "delivered" status', () => {
      const message = { ...mockMessage, status: 'delivered' as const };
      const { getByTestId } = render(
        <MessageBubble message={message} isOwnMessage={true} />
      );

      const status = getByTestId('message-status');
      expect(status.props.children).toBe('✓✓');
    });

    it('should show "read" status with blue color', () => {
      const message = { ...mockMessage, status: 'read' as const };
      const { getByTestId } = render(
        <MessageBubble message={message} isOwnMessage={true} />
      );

      const status = getByTestId('message-status');
      expect(status.props.children).toBe('✓✓');
      expect(status.props.color).toBe('#3B82F6');
    });

    it('should show "failed" status with red color', () => {
      const message = { ...mockMessage, status: 'failed' as const };
      const { getByTestId } = render(
        <MessageBubble message={message} isOwnMessage={true} />
      );

      const status = getByTestId('message-status');
      expect(status.props.children).toBe('⚠');
      expect(status.props.color).toBe('#DC2626');
    });
  });

  describe('Received Messages', () => {
    it('should render received message with white background', () => {
      const { getByTestId } = render(
        <MessageBubble message={mockMessage} isOwnMessage={false} />
      );

      const bubble = getByTestId(`message-bubble-${mockMessage.id}`);
      expect(bubble).toBeTruthy();
    });

    it('should show avatar for received messages', () => {
      const { getByTestId } = render(
        <MessageBubble message={mockMessage} isOwnMessage={false} />
      );

      expect(getByTestId('sender-avatar')).toBeTruthy();
    });

    it('should show sender name for received messages', () => {
      const { getByTestId, getByText } = render(
        <MessageBubble message={mockMessage} isOwnMessage={false} />
      );

      expect(getByTestId('sender-name')).toBeTruthy();
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should not show status for received messages', () => {
      const { queryByTestId } = render(
        <MessageBubble message={mockMessage} isOwnMessage={false} />
      );

      expect(queryByTestId('message-status')).toBeNull();
    });
  });

  describe('Content Display', () => {
    it('should render message content', () => {
      const { getByTestId, getByText } = render(
        <MessageBubble message={mockMessage} isOwnMessage={true} />
      );

      expect(getByTestId('message-content')).toBeTruthy();
      expect(getByText('Hello, how are you?')).toBeTruthy();
    });

    it('should render timestamp', () => {
      const { getByTestId } = render(
        <MessageBubble message={mockMessage} isOwnMessage={true} />
      );

      expect(getByTestId('message-timestamp')).toBeTruthy();
    });

    it('should handle long message content', () => {
      const longMessage = {
        ...mockMessage,
        content: 'A'.repeat(500),
      };

      const { getByTestId } = render(
        <MessageBubble message={longMessage} isOwnMessage={true} />
      );

      expect(getByTestId('message-content')).toBeTruthy();
    });

    it('should handle empty sender name', () => {
      const message = { ...mockMessage, sender_name: undefined };

      const { getByTestId } = render(
        <MessageBubble message={message} isOwnMessage={false} />
      );

      expect(getByTestId('sender-avatar')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility role', () => {
      const { getByTestId } = render(
        <MessageBubble message={mockMessage} isOwnMessage={true} />
      );

      const bubble = getByTestId(`message-bubble-${mockMessage.id}`);
      expect(bubble).toHaveProp('accessibilityRole', 'text');
    });

    it('should have descriptive accessibility label for own message', () => {
      const { getByTestId } = render(
        <MessageBubble message={mockMessage} isOwnMessage={true} />
      );

      const bubble = getByTestId(`message-bubble-${mockMessage.id}`);
      expect(bubble.props.accessibilityLabel).toContain('You');
      expect(bubble.props.accessibilityLabel).toContain('Hello, how are you?');
    });

    it('should have descriptive accessibility label for received message', () => {
      const { getByTestId } = render(
        <MessageBubble message={mockMessage} isOwnMessage={false} />
      );

      const bubble = getByTestId(`message-bubble-${mockMessage.id}`);
      expect(bubble.props.accessibilityLabel).toContain('John Doe');
      expect(bubble.props.accessibilityLabel).toContain('Hello, how are you?');
    });

    it('should have accessibility label for status', () => {
      const { getByTestId } = render(
        <MessageBubble message={mockMessage} isOwnMessage={true} />
      );

      const status = getByTestId('message-status');
      expect(status).toHaveProp('accessibilityLabel', 'Message status: sent');
    });

    it('should have accessibility label for avatar', () => {
      const { getByTestId } = render(
        <MessageBubble message={mockMessage} isOwnMessage={false} />
      );

      const avatar = getByTestId('sender-avatar');
      expect(avatar).toHaveProp('accessibilityLabel', "John Doe's avatar");
    });
  });

  describe('Edge Cases', () => {
    it('should handle message with avatar URL', () => {
      const message = {
        ...mockMessage,
        sender_avatar: 'https://example.com/avatar.jpg',
      };

      const { getByTestId } = render(
        <MessageBubble message={message} isOwnMessage={false} />
      );

      expect(getByTestId('sender-avatar')).toBeTruthy();
    });

    it('should handle message without avatar URL', () => {
      const message = { ...mockMessage, sender_avatar: undefined };

      const { getByTestId } = render(
        <MessageBubble message={message} isOwnMessage={false} />
      );

      expect(getByTestId('sender-avatar')).toBeTruthy();
    });
  });
});
```

---

## Dependencies

- GlueStack UI
- date-fns (already in project)
- Message type definition

---

## Definition of Done

- [ ] Component implemented and renders correctly
- [ ] Sent/received styling working
- [ ] Status indicators working
- [ ] Timestamp display working
- [ ] Avatar display working
- [ ] All unit tests passing
- [ ] EAA compliance verified
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-046](../stories/US-046-send-receive-messages.md), [TASK-262](TASK-262-chatscreen-ui.md), [TASK-264](TASK-264-message-input.md)
