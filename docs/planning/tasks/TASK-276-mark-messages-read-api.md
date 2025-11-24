# TASK-276: Mark Messages as Read API

**ID**: TASK-276 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-048](../stories/US-048-typing-indicators-read-receipts.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## File Structure

```
src/features/Chat/
├── api/
│   ├── readReceipt.ts
│   └── chat.ts                     # TASK-266
└── hooks/
    └── useMarkAsRead.ts
```

**Note**: Read receipt API is Chat-specific, co-located within the Chat feature. Uses custom REST API (NO Supabase SDK).

---

## Task Description

Create API integration to mark messages as read using custom Supabase REST API. Support marking single messages, batch marking, and automatic marking when messages are visible. Update message status in local state and sync with backend.

---

## Acceptance Criteria

- [ ] Mark messages as read API created in `src/features/Chat/api/readReceipt.ts`
- [ ] Support marking single message as read
- [ ] Support batch marking multiple messages
- [ ] Custom REST API integration (no SDK)
- [ ] Automatic retry on failure
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Read Receipt Service

```typescript
// src/features/Chat/api/readReceipt.ts

import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { SecureStore } from '@app/utils/storage/SecureStore';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

/**
 * Message schema
 */
const MessageSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  sender_id: z.string(),
  content: z.string(),
  created_at: z.string(),
  status: z.enum(['sending', 'sent', 'delivered', 'read', 'failed']),
  read_at: z.string().nullable(),
  read_by: z.array(z.string()).nullable(),
});

type Message = z.infer<typeof MessageSchema>;

const MessagesResponseSchema = z.array(MessageSchema);

/**
 * Mark a single message as read
 */
export const markMessageAsRead = async (messageId: string): Promise<Message> => {
  try {
    const accessToken = await SecureStore.get('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await axios.patch(
      `${SUPABASE_URL}/rest/v1/messages`,
      {
        status: 'read',
        read_at: new Date().toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        params: {
          id: `eq.${messageId}`,
        },
        timeout: 10000,
      }
    );

    const messages = MessagesResponseSchema.parse(response.data);
    return messages[0];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string; message: string }>;

      if (axiosError.response?.status === 401) {
        throw new Error('Authentication required');
      }

      if (axiosError.response?.status === 404) {
        throw new Error('Message not found');
      }

      throw new Error(axiosError.response?.data?.message || 'Failed to mark message as read');
    }

    throw error;
  }
};

/**
 * Mark multiple messages as read (batch operation)
 */
export const markMessagesAsRead = async (messageIds: string[]): Promise<Message[]> => {
  try {
    const accessToken = await SecureStore.get('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    // Batch update using "in" operator
    const response = await axios.patch(
      `${SUPABASE_URL}/rest/v1/messages`,
      {
        status: 'read',
        read_at: new Date().toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        params: {
          id: `in.(${messageIds.join(',')})`,
        },
        timeout: 10000,
      }
    );

    const messages = MessagesResponseSchema.parse(response.data);
    return messages;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string; message: string }>;

      if (axiosError.response?.status === 401) {
        throw new Error('Authentication required');
      }

      throw new Error(axiosError.response?.data?.message || 'Failed to mark messages as read');
    }

    throw error;
  }
};

/**
 * Mark all messages in conversation as read
 */
export const markConversationMessagesAsRead = async (
  conversationId: string,
  currentUserId: string
): Promise<Message[]> => {
  try {
    const accessToken = await SecureStore.get('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    // Update all messages in conversation not sent by current user
    const response = await axios.patch(
      `${SUPABASE_URL}/rest/v1/messages`,
      {
        status: 'read',
        read_at: new Date().toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        params: {
          conversation_id: `eq.${conversationId}`,
          sender_id: `neq.${currentUserId}`,
          status: `neq.read`,
        },
        timeout: 10000,
      }
    );

    const messages = MessagesResponseSchema.parse(response.data);
    return messages;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string; message: string }>;

      if (axiosError.response?.status === 401) {
        throw new Error('Authentication required');
      }

      throw new Error(
        axiosError.response?.data?.message || 'Failed to mark conversation messages as read'
      );
    }

    throw error;
  }
};

/**
 * Retry logic wrapper
 */
export const markMessageAsReadWithRetry = async (
  messageId: string,
  maxRetries: number = 3
): Promise<Message> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await markMessageAsRead(messageId);
    } catch (error) {
      lastError = error as Error;

      // Don't retry on authentication errors
      if (
        lastError.message === 'Authentication required' ||
        lastError.message === 'Not authenticated'
      ) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError || new Error('Failed to mark message as read');
};
```

---

### Usage Hook

```typescript
// src/features/Chat/hooks/useMarkAsRead.ts

import { useCallback } from 'react';
import {
  markMessageAsRead,
  markMessagesAsRead,
  markConversationMessagesAsRead,
} from '../api/readReceipt';

export interface UseMarkAsReadReturn {
  markAsRead: (messageId: string) => Promise<void>;
  markMultipleAsRead: (messageIds: string[]) => Promise<void>;
  markAllAsRead: (conversationId: string, currentUserId: string) => Promise<void>;
}

export const useMarkAsRead = (): UseMarkAsReadReturn => {
  /**
   * Mark single message as read
   */
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await markMessageAsRead(messageId);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  }, []);

  /**
   * Mark multiple messages as read
   */
  const markMultipleAsRead = useCallback(async (messageIds: string[]) => {
    try {
      await markMessagesAsRead(messageIds);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, []);

  /**
   * Mark all messages in conversation as read
   */
  const markAllAsRead = useCallback(async (conversationId: string, currentUserId: string) => {
    try {
      await markConversationMessagesAsRead(conversationId, currentUserId);
    } catch (error) {
      console.error('Failed to mark conversation messages as read:', error);
    }
  }, []);

  return {
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
  };
};
```

---

### Auto-mark Visible Messages as Read

```typescript
// Example: Auto-mark messages when they become visible

import { useEffect, useRef } from 'react';
import { ViewabilityConfig, ViewToken } from 'react-native';
import { useMarkAsRead } from '../hooks/useMarkAsRead';

export const useAutoMarkAsRead = (messages: Message[], currentUserId: string) => {
  const { markMultipleAsRead } = useMarkAsRead();
  const visibleMessagesRef = useRef<Set<string>>(new Set());

  const viewabilityConfig: ViewabilityConfig = {
    itemVisiblePercentThreshold: 50, // 50% of message visible
    minimumViewTime: 1000, // Visible for 1 second
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const newVisibleIds = new Set<string>();

      viewableItems.forEach(item => {
        const message = item.item as Message;

        // Only mark messages from other users
        if (message.sender_id !== currentUserId && message.status !== 'read') {
          newVisibleIds.add(message.id);
        }
      });

      // Find newly visible messages
      const toMarkAsRead = Array.from(newVisibleIds).filter(
        id => !visibleMessagesRef.current.has(id)
      );

      if (toMarkAsRead.length > 0) {
        markMultipleAsRead(toMarkAsRead);
      }

      visibleMessagesRef.current = newVisibleIds;
    },
    [currentUserId, markMultipleAsRead]
  );

  return {
    viewabilityConfig,
    onViewableItemsChanged,
  };
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/features/Chat/api/__tests__/readReceipt.test.ts

import axios from 'axios';
import {
  markMessageAsRead,
  markMessagesAsRead,
  markConversationMessagesAsRead,
  markMessageAsReadWithRetry,
} from '../readReceipt';
import { SecureStore } from '@app/utils/storage/SecureStore';

jest.mock('axios');
jest.mock('@app/utils/storage/SecureStore');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('readReceiptService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecureStore.get.mockResolvedValue('mock-access-token');
  });

  describe('markMessageAsRead', () => {
    it('should mark message as read', async () => {
      const mockMessage = {
        id: 'msg-1',
        conversation_id: 'conv-123',
        sender_id: 'user-1',
        content: 'Hello',
        created_at: '2025-01-21T10:00:00Z',
        status: 'read',
        read_at: '2025-01-21T10:05:00Z',
        read_by: ['current-user'],
      };

      mockAxios.patch.mockResolvedValue({ data: [mockMessage] });

      const result = await markMessageAsRead('msg-1');

      expect(mockAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/rest/v1/messages'),
        {
          status: 'read',
          read_at: expect.any(String),
        },
        expect.objectContaining({
          params: { id: 'eq.msg-1' },
        })
      );

      expect(result).toEqual(mockMessage);
    });

    it('should throw error when not authenticated', async () => {
      mockSecureStore.get.mockResolvedValue(null);

      await expect(markMessageAsRead('msg-1')).rejects.toThrow('Not authenticated');
    });

    it('should throw error on 401', async () => {
      mockAxios.patch.mockRejectedValue({
        isAxiosError: true,
        response: { status: 401 },
      });

      await expect(markMessageAsRead('msg-1')).rejects.toThrow('Authentication required');
    });

    it('should throw error on 404', async () => {
      mockAxios.patch.mockRejectedValue({
        isAxiosError: true,
        response: { status: 404 },
      });

      await expect(markMessageAsRead('msg-1')).rejects.toThrow('Message not found');
    });
  });

  describe('markMessagesAsRead', () => {
    it('should mark multiple messages as read', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          conversation_id: 'conv-123',
          sender_id: 'user-1',
          content: 'Hello',
          created_at: '2025-01-21T10:00:00Z',
          status: 'read',
          read_at: '2025-01-21T10:05:00Z',
          read_by: ['current-user'],
        },
        {
          id: 'msg-2',
          conversation_id: 'conv-123',
          sender_id: 'user-1',
          content: 'Hi',
          created_at: '2025-01-21T10:01:00Z',
          status: 'read',
          read_at: '2025-01-21T10:05:00Z',
          read_by: ['current-user'],
        },
      ];

      mockAxios.patch.mockResolvedValue({ data: mockMessages });

      const result = await markMessagesAsRead(['msg-1', 'msg-2']);

      expect(mockAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/rest/v1/messages'),
        {
          status: 'read',
          read_at: expect.any(String),
        },
        expect.objectContaining({
          params: { id: 'in.(msg-1,msg-2)' },
        })
      );

      expect(result).toEqual(mockMessages);
    });

    it('should handle empty array', async () => {
      mockAxios.patch.mockResolvedValue({ data: [] });

      const result = await markMessagesAsRead([]);

      expect(mockAxios.patch).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          params: { id: 'in.()' },
        })
      );

      expect(result).toEqual([]);
    });
  });

  describe('markConversationMessagesAsRead', () => {
    it('should mark all conversation messages as read', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          conversation_id: 'conv-123',
          sender_id: 'user-1',
          content: 'Hello',
          created_at: '2025-01-21T10:00:00Z',
          status: 'read',
          read_at: '2025-01-21T10:05:00Z',
          read_by: ['current-user'],
        },
      ];

      mockAxios.patch.mockResolvedValue({ data: mockMessages });

      const result = await markConversationMessagesAsRead('conv-123', 'current-user');

      expect(mockAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/rest/v1/messages'),
        {
          status: 'read',
          read_at: expect.any(String),
        },
        expect.objectContaining({
          params: {
            conversation_id: 'eq.conv-123',
            sender_id: 'neq.current-user',
            status: 'neq.read',
          },
        })
      );

      expect(result).toEqual(mockMessages);
    });
  });

  describe('markMessageAsReadWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockMessage = {
        id: 'msg-1',
        conversation_id: 'conv-123',
        sender_id: 'user-1',
        content: 'Hello',
        created_at: '2025-01-21T10:00:00Z',
        status: 'read',
        read_at: '2025-01-21T10:05:00Z',
        read_by: ['current-user'],
      };

      mockAxios.patch.mockResolvedValue({ data: [mockMessage] });

      const result = await markMessageAsReadWithRetry('msg-1');

      expect(mockAxios.patch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockMessage);
    });

    it('should retry on failure', async () => {
      const mockMessage = {
        id: 'msg-1',
        conversation_id: 'conv-123',
        sender_id: 'user-1',
        content: 'Hello',
        created_at: '2025-01-21T10:00:00Z',
        status: 'read',
        read_at: '2025-01-21T10:05:00Z',
        read_by: ['current-user'],
      };

      // Fail first two attempts, succeed on third
      mockAxios.patch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: [mockMessage] });

      const result = await markMessageAsReadWithRetry('msg-1', 3);

      expect(mockAxios.patch).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockMessage);
    });

    it('should not retry on authentication error', async () => {
      mockSecureStore.get.mockResolvedValue(null);

      await expect(markMessageAsReadWithRetry('msg-1')).rejects.toThrow('Not authenticated');

      expect(mockAxios.patch).not.toHaveBeenCalled();
    });
  });
});
```

---

## Dependencies

- Axios (HTTP client)
- Zod (runtime validation)
- SecureStore utility (access token retrieval from TASK-196)

---

## Definition of Done

- [ ] Read receipt service implemented
- [ ] Single message marking working
- [ ] Batch marking working
- [ ] Conversation marking working
- [ ] Retry logic working
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-048](../stories/US-048-typing-indicators-read-receipts.md), [TASK-275](TASK-275-read-receipt.md), [TASK-266](TASK-266-send-message-api.md)
