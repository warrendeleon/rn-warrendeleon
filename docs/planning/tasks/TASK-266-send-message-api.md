# TASK-266: Send Message API Integration

**ID**: TASK-266 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-046](../stories/US-046-send-receive-messages.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## File Structure

```
src/features/Chat/
└── api/
    ├── chat.ts
    └── __tests__/
        └── chat.test.ts
```

**Note**: Chat API service is Chat-specific, co-located with Chat feature. Uses custom REST API (NO Supabase SDK).

---

## Task Description

Integrate Supabase REST API for sending messages and fetching message history with pagination. Use custom REST API (NO Supabase SDK) for all database operations. Handle message status updates and error cases.

---

## Acceptance Criteria

- [ ] Chat service created in `src/features/Chat/api/chat.ts`
- [ ] Send message via custom REST API
- [ ] Fetch messages with pagination
- [ ] Update message status (delivered, read)
- [ ] Handle network errors
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Chat Service

```typescript
// src/features/Chat/api/chat.ts

import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { getAccessToken } from '@app/utils/storage/SecureStore';
import type { Message } from '@app/types/chat';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Zod schema for message response
const MessageSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  sender_name: z.string().optional(),
  sender_avatar: z.string().url().optional().nullable(),
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  status: z.enum(['sending', 'sent', 'delivered', 'read', 'failed']),
});

const MessagesResponseSchema = z.array(MessageSchema);

/**
 * Fetch messages for a conversation with pagination
 *
 * @param conversationId - Conversation ID
 * @param page - Page number (0-indexed)
 * @param limit - Number of messages per page
 * @returns Array of messages
 */
export const fetchMessages = async (
  conversationId: string,
  page: number = 0,
  limit: number = 20
): Promise<Message[]> => {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const offset = page * limit;

    // Fetch messages using custom REST API
    const response = await axios.get(`${SUPABASE_URL}/rest/v1/messages`, {
      params: {
        conversation_id: `eq.${conversationId}`,
        select: '*',
        order: 'created_at.desc',
        limit,
        offset,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Validate response
    const messages = MessagesResponseSchema.parse(response.data);

    console.log(`Fetched ${messages.length} messages for conversation ${conversationId}`);

    return messages;
  } catch (error) {
    console.error('Failed to fetch messages:', error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (!axiosError.response) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }

      if (axiosError.response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }

      if (axiosError.response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
    }

    throw new Error('Failed to fetch messages. Please try again.');
  }
};

/**
 * Send a message to a conversation
 *
 * @param conversationId - Conversation ID
 * @param content - Message content
 * @returns Sent message
 */
export const sendMessageToConversation = async (
  conversationId: string,
  content: string
): Promise<Message> => {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    // Send message using custom REST API
    const response = await axios.post(
      `${SUPABASE_URL}/rest/v1/messages`,
      {
        conversation_id: conversationId,
        content: content.trim(),
        status: 'sent',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=representation', // Return the inserted row
        },
        timeout: 10000,
      }
    );

    // Validate response
    const messages = MessagesResponseSchema.parse(response.data);

    if (messages.length === 0) {
      throw new Error('Failed to send message: No response from server');
    }

    const message = messages[0];

    console.log('Message sent successfully:', message.id);

    return message;
  } catch (error) {
    console.error('Failed to send message:', error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (!axiosError.response) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }

      if (axiosError.response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }

      if (axiosError.response.status === 403) {
        throw new Error('You do not have permission to send messages in this conversation.');
      }

      if (axiosError.response.status === 422) {
        throw new Error('Invalid message content. Please try again.');
      }

      if (axiosError.response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
    }

    throw new Error('Failed to send message. Please try again.');
  }
};

/**
 * Update message status (delivered, read)
 *
 * @param messageId - Message ID
 * @param status - New status
 */
export const updateMessageStatus = async (
  messageId: string,
  status: 'delivered' | 'read'
): Promise<void> => {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    await axios.patch(
      `${SUPABASE_URL}/rest/v1/messages`,
      {
        status,
        updated_at: new Date().toISOString(),
      },
      {
        params: {
          id: `eq.${messageId}`,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );

    console.log(`Message ${messageId} status updated to ${status}`);
  } catch (error) {
    console.error('Failed to update message status:', error);
    // Don't throw - status update failures shouldn't break the UI
  }
};

/**
 * Mark all messages in a conversation as read
 *
 * @param conversationId - Conversation ID
 */
export const markConversationAsRead = async (conversationId: string): Promise<void> => {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    await axios.patch(
      `${SUPABASE_URL}/rest/v1/messages`,
      {
        status: 'read',
        updated_at: new Date().toISOString(),
      },
      {
        params: {
          conversation_id: `eq.${conversationId}`,
          status: `neq.read`, // Only update unread messages
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );

    console.log(`All messages in conversation ${conversationId} marked as read`);
  } catch (error) {
    console.error('Failed to mark conversation as read:', error);
    // Don't throw - status update failures shouldn't break the UI
  }
};

/**
 * Delete a message (soft delete)
 *
 * @param messageId - Message ID
 */
export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    await axios.delete(`${SUPABASE_URL}/rest/v1/messages`, {
      params: {
        id: `eq.${messageId}`,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
      timeout: 10000,
    });

    console.log(`Message ${messageId} deleted`);
  } catch (error) {
    console.error('Failed to delete message:', error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 403) {
        throw new Error('You can only delete your own messages.');
      }
    }

    throw new Error('Failed to delete message. Please try again.');
  }
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/features/Chat/api/__tests__/chat.test.ts

import axios, { AxiosError } from 'axios';
import {
  fetchMessages,
  sendMessageToConversation,
  updateMessageStatus,
  markConversationAsRead,
  deleteMessage,
} from '../chat';
import * as SecureStore from '@app/utils/storage/SecureStore';

jest.mock('axios');
jest.mock('@app/utils/storage/SecureStore');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('chatService', () => {
  const mockAccessToken = 'access_token_123';
  const mockConversationId = 'conv-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockSecureStore.getAccessToken.mockResolvedValue(mockAccessToken);
  });

  describe('fetchMessages', () => {
    const mockMessages = [
      {
        id: 'msg-1',
        conversation_id: mockConversationId,
        sender_id: 'user-1',
        content: 'Hello!',
        created_at: '2025-01-21T10:00:00Z',
        status: 'sent',
      },
      {
        id: 'msg-2',
        conversation_id: mockConversationId,
        sender_id: 'user-2',
        content: 'Hi!',
        created_at: '2025-01-21T10:01:00Z',
        status: 'delivered',
      },
    ];

    it('should fetch messages successfully', async () => {
      mockAxios.get.mockResolvedValue({ data: mockMessages });

      const messages = await fetchMessages(mockConversationId, 0, 20);

      expect(messages).toEqual(mockMessages);
      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/rest/v1/messages'),
        expect.objectContaining({
          params: expect.objectContaining({
            conversation_id: `eq.${mockConversationId}`,
            limit: 20,
            offset: 0,
          }),
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockAccessToken}`,
          }),
        })
      );
    });

    it('should handle pagination', async () => {
      mockAxios.get.mockResolvedValue({ data: mockMessages });

      await fetchMessages(mockConversationId, 2, 20);

      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            offset: 40, // page 2 * limit 20
          }),
        })
      );
    });

    it('should throw error when not authenticated', async () => {
      mockSecureStore.getAccessToken.mockResolvedValue(null);

      await expect(fetchMessages(mockConversationId)).rejects.toThrow('Not authenticated');
    });

    it('should handle network errors', async () => {
      mockAxios.get.mockRejectedValue({
        isAxiosError: true,
        message: 'Network Error',
      } as AxiosError);

      await expect(fetchMessages(mockConversationId)).rejects.toThrow(
        'Unable to connect to server'
      );
    });

    it('should handle 401 errors', async () => {
      mockAxios.get.mockRejectedValue({
        isAxiosError: true,
        response: { status: 401 },
      } as AxiosError);

      await expect(fetchMessages(mockConversationId)).rejects.toThrow('Authentication failed');
    });
  });

  describe('sendMessageToConversation', () => {
    const mockSentMessage = {
      id: 'msg-new',
      conversation_id: mockConversationId,
      sender_id: 'user-1',
      content: 'Hello!',
      created_at: '2025-01-21T10:00:00Z',
      status: 'sent',
    };

    it('should send message successfully', async () => {
      mockAxios.post.mockResolvedValue({ data: [mockSentMessage] });

      const message = await sendMessageToConversation(mockConversationId, 'Hello!');

      expect(message).toEqual(mockSentMessage);
      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/rest/v1/messages'),
        expect.objectContaining({
          conversation_id: mockConversationId,
          content: 'Hello!',
          status: 'sent',
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockAccessToken}`,
            Prefer: 'return=representation',
          }),
        })
      );
    });

    it('should trim message content', async () => {
      mockAxios.post.mockResolvedValue({ data: [mockSentMessage] });

      await sendMessageToConversation(mockConversationId, '  Hello!  ');

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          content: 'Hello!',
        }),
        expect.any(Object)
      );
    });

    it('should throw error for empty content', async () => {
      await expect(sendMessageToConversation(mockConversationId, '')).rejects.toThrow(
        'Message content cannot be empty'
      );
    });

    it('should throw error for whitespace-only content', async () => {
      await expect(sendMessageToConversation(mockConversationId, '   ')).rejects.toThrow(
        'Message content cannot be empty'
      );
    });

    it('should handle 403 errors', async () => {
      mockAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: { status: 403 },
      } as AxiosError);

      await expect(sendMessageToConversation(mockConversationId, 'Hello')).rejects.toThrow(
        'You do not have permission'
      );
    });
  });

  describe('updateMessageStatus', () => {
    it('should update message status successfully', async () => {
      mockAxios.patch.mockResolvedValue({ data: {} });

      await updateMessageStatus('msg-1', 'read');

      expect(mockAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/rest/v1/messages'),
        expect.objectContaining({
          status: 'read',
        }),
        expect.objectContaining({
          params: { id: 'eq.msg-1' },
        })
      );
    });

    it('should not throw on error', async () => {
      mockAxios.patch.mockRejectedValue(new Error('Network error'));

      await expect(updateMessageStatus('msg-1', 'read')).resolves.toBeUndefined();
    });
  });

  describe('markConversationAsRead', () => {
    it('should mark all messages as read', async () => {
      mockAxios.patch.mockResolvedValue({ data: {} });

      await markConversationAsRead(mockConversationId);

      expect(mockAxios.patch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          status: 'read',
        }),
        expect.objectContaining({
          params: expect.objectContaining({
            conversation_id: `eq.${mockConversationId}`,
            status: 'neq.read',
          }),
        })
      );
    });
  });

  describe('deleteMessage', () => {
    it('should delete message successfully', async () => {
      mockAxios.delete.mockResolvedValue({ data: {} });

      await deleteMessage('msg-1');

      expect(mockAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/rest/v1/messages'),
        expect.objectContaining({
          params: { id: 'eq.msg-1' },
        })
      );
    });

    it('should throw error for 403', async () => {
      mockAxios.delete.mockRejectedValue({
        isAxiosError: true,
        response: { status: 403 },
      } as AxiosError);

      await expect(deleteMessage('msg-1')).rejects.toThrow('You can only delete your own messages');
    });
  });
});
```

---

## Dependencies

- axios (already in project)
- zod (runtime validation)
- SecureStore utility (existing from TASK-196)
- Environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`

---

## Definition of Done

- [ ] Chat service implemented
- [ ] Fetch messages working
- [ ] Send message working
- [ ] Message status updates working
- [ ] All error cases handled
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-046](../stories/US-046-send-receive-messages.md), [TASK-262](TASK-262-chatscreen-ui.md), [TASK-265](TASK-265-supabase-realtime.md), [TASK-267](TASK-267-chat-rntl-tests.md)
