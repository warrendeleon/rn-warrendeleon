# TASK-265: Supabase Realtime Subscription

**ID**: TASK-265 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-046](../stories/US-046-send-receive-messages.md)
**Status**: 📋 To Do | **Effort**: 2.5h

---

## File Structure

```
src/features/Chat/
├── api/
│   ├── realtime.ts
│   └── __tests__/
│       └── realtime.test.ts
└── hooks/
    ├── useRealtimeSubscription.ts
    └── __tests__/
        └── useRealtimeSubscription.test.ts
```

**Note**: Realtime subscription is Chat-specific, co-located with Chat feature API clients. This is the **ONLY place** where Supabase SDK is used (NO custom REST API for WebSocket/Realtime functionality).

---

## Task Description

Integrate Supabase Realtime for live message updates. Subscribe to conversation changes, handle new messages, update message status (delivered/read), and manage connection state. This is the ONLY place where Supabase SDK is allowed (NOT custom REST API).

---

## Acceptance Criteria

- [ ] Realtime service created in `src/features/Chat/api/realtime.ts`
- [ ] Subscribe to conversation messages using Supabase SDK
- [ ] Receive new messages in real-time
- [ ] Handle connection state (connected, disconnected, error)
- [ ] Auto-reconnect on connection loss
- [ ] Unsubscribe on component unmount
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Supabase Realtime Service

```typescript
// src/features/Chat/api/realtime.ts

import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import type { Message } from '../../types/chat';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client for Realtime (ONLY place SDK is used)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type RealtimeConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface RealtimeSubscriptionOptions {
  onMessage: (message: Message) => void;
  onStatusChange?: (status: RealtimeConnectionStatus) => void;
  onError?: (error: Error) => void;
}

/**
 * Subscribe to real-time messages for a specific conversation
 *
 * @param conversationId - Conversation ID to subscribe to
 * @param options - Subscription callbacks
 * @returns Unsubscribe function
 */
export const subscribeToConversation = (
  conversationId: string,
  options: RealtimeSubscriptionOptions
): (() => void) => {
  const { onMessage, onStatusChange, onError } = options;

  let channel: RealtimeChannel | null = null;

  try {
    // Create channel for specific conversation
    channel = supabase
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
          console.log('New message received:', payload);

          const message = payload.new as Message;
          onMessage(message);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        payload => {
          console.log('Message updated:', payload);

          const message = payload.new as Message;
          onMessage(message);
        }
      )
      .subscribe((status, error) => {
        console.log('Subscription status:', status);

        // Map Supabase status to our status
        let connectionStatus: RealtimeConnectionStatus;

        switch (status) {
          case 'SUBSCRIBED':
            connectionStatus = 'connected';
            break;
          case 'CLOSED':
            connectionStatus = 'disconnected';
            break;
          case 'CHANNEL_ERROR':
            connectionStatus = 'error';
            if (error && onError) {
              onError(new Error(error.message));
            }
            break;
          default:
            connectionStatus = 'connecting';
        }

        if (onStatusChange) {
          onStatusChange(connectionStatus);
        }
      });

    // Return unsubscribe function
    return () => {
      if (channel) {
        console.log('Unsubscribing from conversation:', conversationId);
        supabase.removeChannel(channel);
      }
    };
  } catch (error) {
    console.error('Failed to subscribe to conversation:', error);

    if (onError) {
      onError(error as Error);
    }

    // Return no-op unsubscribe function
    return () => {};
  }
};

/**
 * Subscribe to presence (online/offline status) for a conversation
 * (Future enhancement)
 *
 * @param conversationId - Conversation ID
 * @param userId - Current user ID
 * @param onPresenceChange - Callback when presence changes
 * @returns Unsubscribe function
 */
export const subscribeToPresence = (
  conversationId: string,
  userId: string,
  onPresenceChange: (presence: Record<string, any>) => void
): (() => void) => {
  const channel = supabase
    .channel(`presence:${conversationId}`)
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('Presence state:', state);
      onPresenceChange(state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    })
    .subscribe(async status => {
      if (status === 'SUBSCRIBED') {
        // Track current user presence
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
        });
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Get connection status for debugging
 */
export const getConnectionStatus = (): RealtimeConnectionStatus => {
  // Supabase doesn't expose global connection status directly
  // This is a simplified implementation
  return 'connected';
};
```

---

### React Hook: useRealtimeSubscription

```typescript
// src/features/Chat/hooks/useRealtimeSubscription.ts

import { useEffect, useState } from 'react';
import { subscribeToConversation, RealtimeConnectionStatus } from '../api/realtime';
import type { Message } from '@app/types/chat';

export const useRealtimeSubscription = (
  conversationId: string,
  onMessage: (message: Message) => void
) => {
  const [connectionStatus, setConnectionStatus] = useState<RealtimeConnectionStatus>('connecting');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('Setting up realtime subscription for:', conversationId);

    const unsubscribe = subscribeToConversation(conversationId, {
      onMessage,
      onStatusChange: status => {
        console.log('Connection status changed:', status);
        setConnectionStatus(status);
      },
      onError: err => {
        console.error('Realtime error:', err);
        setError(err);
      },
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up realtime subscription');
      unsubscribe();
    };
  }, [conversationId, onMessage]);

  return { connectionStatus, error };
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/features/Chat/api/__tests__/realtime.test.ts

import { createClient } from '@supabase/supabase-js';
import { subscribeToConversation } from '../realtime';
import type { Message } from '@app/types/chat';

jest.mock('@supabase/supabase-js');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('realtimeService', () => {
  let mockChannel: any;
  let mockOn: jest.Mock;
  let mockSubscribe: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockOn = jest.fn().mockReturnThis();
    mockSubscribe = jest.fn();

    mockChannel = {
      on: mockOn,
      subscribe: mockSubscribe,
    };

    const mockSupabase = {
      channel: jest.fn().mockReturnValue(mockChannel),
      removeChannel: jest.fn(),
    };

    mockCreateClient.mockReturnValue(mockSupabase as any);
  });

  describe('subscribeToConversation', () => {
    const mockMessage: Message = {
      id: 'msg-1',
      conversation_id: 'conv-1',
      sender_id: 'user-1',
      content: 'Hello!',
      created_at: '2025-01-21T10:00:00Z',
      status: 'sent',
    };

    it('should subscribe to conversation messages', () => {
      const onMessage = jest.fn();
      const onStatusChange = jest.fn();

      subscribeToConversation('conv-1', {
        onMessage,
        onStatusChange,
      });

      // Verify channel was created with correct name
      expect(mockCreateClient().channel).toHaveBeenCalledWith('conversation:conv-1');

      // Verify INSERT event handler was registered
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'INSERT',
          table: 'messages',
          filter: 'conversation_id=eq.conv-1',
        }),
        expect.any(Function)
      );

      // Verify UPDATE event handler was registered
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'UPDATE',
          table: 'messages',
          filter: 'conversation_id=eq.conv-1',
        }),
        expect.any(Function)
      );

      // Verify subscribe was called
      expect(mockSubscribe).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should call onMessage when new message received', () => {
      const onMessage = jest.fn();

      subscribeToConversation('conv-1', { onMessage });

      // Get the INSERT handler
      const insertHandler = mockOn.mock.calls.find(call => call[1].event === 'INSERT')?.[2];

      // Simulate new message
      insertHandler?.({ new: mockMessage });

      expect(onMessage).toHaveBeenCalledWith(mockMessage);
    });

    it('should call onMessage when message updated', () => {
      const onMessage = jest.fn();

      subscribeToConversation('conv-1', { onMessage });

      // Get the UPDATE handler
      const updateHandler = mockOn.mock.calls.find(call => call[1].event === 'UPDATE')?.[2];

      // Simulate message update
      const updatedMessage = { ...mockMessage, status: 'read' as const };
      updateHandler?.({ new: updatedMessage });

      expect(onMessage).toHaveBeenCalledWith(updatedMessage);
    });

    it('should call onStatusChange when connection status changes', () => {
      const onStatusChange = jest.fn();

      subscribeToConversation('conv-1', {
        onMessage: jest.fn(),
        onStatusChange,
      });

      // Get the subscribe callback
      const subscribeCallback = mockSubscribe.mock.calls[0][0];

      // Simulate connection status changes
      subscribeCallback('SUBSCRIBED', null);
      expect(onStatusChange).toHaveBeenCalledWith('connected');

      subscribeCallback('CLOSED', null);
      expect(onStatusChange).toHaveBeenCalledWith('disconnected');
    });

    it('should call onError when channel error occurs', () => {
      const onError = jest.fn();

      subscribeToConversation('conv-1', {
        onMessage: jest.fn(),
        onError,
      });

      // Get the subscribe callback
      const subscribeCallback = mockSubscribe.mock.calls[0][0];

      // Simulate channel error
      subscribeCallback('CHANNEL_ERROR', { message: 'Connection failed' });

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should return unsubscribe function', () => {
      const unsubscribe = subscribeToConversation('conv-1', {
        onMessage: jest.fn(),
      });

      expect(typeof unsubscribe).toBe('function');

      // Call unsubscribe
      unsubscribe();

      // Verify channel was removed
      expect(mockCreateClient().removeChannel).toHaveBeenCalledWith(mockChannel);
    });

    it('should handle subscription errors gracefully', () => {
      mockCreateClient().channel.mockImplementation(() => {
        throw new Error('Subscription failed');
      });

      const onError = jest.fn();

      const unsubscribe = subscribeToConversation('conv-1', {
        onMessage: jest.fn(),
        onError,
      });

      expect(onError).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');

      // Unsubscribe should not throw
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('subscribeToPresence', () => {
    it('should subscribe to presence channel', () => {
      const { subscribeToPresence } = require('../realtimeService');

      const onPresenceChange = jest.fn();

      const unsubscribe = subscribeToPresence('conv-1', 'user-1', onPresenceChange);

      expect(mockCreateClient().channel).toHaveBeenCalledWith('presence:conv-1');
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
```

---

### Integration Tests

```typescript
// src/features/Chat/hooks/__tests__/useRealtimeSubscription.test.ts

import { renderHook } from '@testing-library/react-hooks';
import { useRealtimeSubscription } from '../useRealtimeSubscription';
import * as realtimeService from '../../api/realtime';

jest.mock('../../api/realtime');

const mockRealtimeService = realtimeService as jest.Mocked<typeof realtimeService>;

describe('useRealtimeSubscription', () => {
  let mockUnsubscribe: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUnsubscribe = jest.fn();
    mockRealtimeService.subscribeToConversation.mockReturnValue(mockUnsubscribe);
  });

  it('should subscribe on mount', () => {
    const onMessage = jest.fn();

    renderHook(() => useRealtimeSubscription('conv-1', onMessage));

    expect(mockRealtimeService.subscribeToConversation).toHaveBeenCalledWith(
      'conv-1',
      expect.objectContaining({
        onMessage,
        onStatusChange: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() => useRealtimeSubscription('conv-1', jest.fn()));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should resubscribe when conversationId changes', () => {
    const { rerender } = renderHook(({ id }) => useRealtimeSubscription(id, jest.fn()), {
      initialProps: { id: 'conv-1' },
    });

    // Change conversation ID
    rerender({ id: 'conv-2' });

    // Should unsubscribe from old conversation
    expect(mockUnsubscribe).toHaveBeenCalled();

    // Should subscribe to new conversation
    expect(mockRealtimeService.subscribeToConversation).toHaveBeenCalledWith(
      'conv-2',
      expect.any(Object)
    );
  });

  it('should track connection status', () => {
    const { result } = renderHook(() => useRealtimeSubscription('conv-1', jest.fn()));

    expect(result.current.connectionStatus).toBe('connecting');
  });
});
```

---

## Dependencies

- `@supabase/supabase-js` (Supabase SDK - ONLY for Realtime)
- Environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`

---

## Notes

**IMPORTANT**: This is the ONLY place in the codebase where the Supabase SDK is used. All other authentication and database operations use custom REST API. The SDK is ONLY allowed here for Realtime/WebSocket functionality.

---

## Definition of Done

- [ ] Realtime service implemented
- [ ] Subscription to conversation messages working
- [ ] Connection status tracking working
- [ ] Auto-reconnect working
- [ ] Unsubscribe on unmount working
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-046](../stories/US-046-send-receive-messages.md), [TASK-262](TASK-262-chatscreen-ui.md), [TASK-266](TASK-266-send-message-api.md)
