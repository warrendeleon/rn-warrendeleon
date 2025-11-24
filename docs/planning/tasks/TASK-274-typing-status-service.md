# TASK-274: Typing Status Service

**ID**: TASK-274 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-048](../stories/US-048-typing-indicators-read-receipts.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## File Structure

```
src/features/Chat/
├── api/
│   ├── typingStatus.ts
│   └── realtime.ts                 # TASK-265 (Supabase SDK)
└── hooks/
    └── useTypingStatus.ts
```

**Note**: Typing status service is Chat-specific, co-located within the Chat feature. Uses Supabase Realtime for broadcasting typing indicators.

---

## Task Description

Create a typing status service to broadcast and receive typing indicators via Supabase Realtime. Support debounced typing events, automatic status cleanup, and efficient channel management.

---

## Acceptance Criteria

- [ ] Typing status service created in `src/features/Chat/api/typingStatus.ts`
- [ ] Broadcast typing status to Supabase Realtime
- [ ] Subscribe to typing status updates
- [ ] Debounced typing events (500ms delay)
- [ ] Automatic stop typing after 3 seconds of inactivity
- [ ] Cleanup on component unmount
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Typing Status Service

```typescript
// src/features/Chat/api/typingStatus.ts

import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@app/config/supabase';

export interface TypingStatus {
  user_id: string;
  user_name: string;
  conversation_id: string;
  is_typing: boolean;
  timestamp: string;
}

export interface TypingStatusSubscriptionOptions {
  conversationId: string;
  currentUserId: string;
  onTypingStatusChange: (typingUsers: TypingStatus[]) => void;
}

const TYPING_DEBOUNCE_MS = 500;
const TYPING_TIMEOUT_MS = 3000;

// Store active typing timers
const typingTimers = new Map<string, NodeJS.Timeout>();

/**
 * Broadcast typing status to conversation
 */
export const broadcastTypingStatus = async (
  conversationId: string,
  userId: string,
  userName: string,
  isTyping: boolean
): Promise<void> => {
  try {
    const channel = supabase.channel(`conversation:${conversationId}`);

    const typingStatus: TypingStatus = {
      user_id: userId,
      user_name: userName,
      conversation_id: conversationId,
      is_typing: isTyping,
      timestamp: new Date().toISOString(),
    };

    await channel.send({
      type: 'broadcast',
      event: 'typing_status',
      payload: typingStatus,
    });
  } catch (error) {
    console.error('Failed to broadcast typing status:', error);
  }
};

/**
 * Debounced typing handler
 */
export class TypingStatusHandler {
  private conversationId: string;
  private userId: string;
  private userName: string;
  private typingTimer: NodeJS.Timeout | null = null;
  private stopTypingTimer: NodeJS.Timeout | null = null;
  private isCurrentlyTyping = false;

  constructor(conversationId: string, userId: string, userName: string) {
    this.conversationId = conversationId;
    this.userId = userId;
    this.userName = userName;
  }

  /**
   * Call this method whenever user types
   */
  public onUserTyping = (): void => {
    // Clear existing typing timer
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    // Debounce: Only send typing status after 500ms of continuous typing
    this.typingTimer = setTimeout(() => {
      this.startTyping();
    }, TYPING_DEBOUNCE_MS);

    // Reset stop typing timer
    this.resetStopTypingTimer();
  };

  /**
   * Start typing
   */
  private startTyping = async (): Promise<void> => {
    if (!this.isCurrentlyTyping) {
      this.isCurrentlyTyping = true;
      await broadcastTypingStatus(this.conversationId, this.userId, this.userName, true);
    }

    // Reset stop typing timer
    this.resetStopTypingTimer();
  };

  /**
   * Stop typing
   */
  public stopTyping = async (): Promise<void> => {
    if (this.isCurrentlyTyping) {
      this.isCurrentlyTyping = false;
      await broadcastTypingStatus(this.conversationId, this.userId, this.userName, false);
    }

    this.clearTimers();
  };

  /**
   * Reset stop typing timer (auto-stop after 3 seconds of inactivity)
   */
  private resetStopTypingTimer = (): void => {
    if (this.stopTypingTimer) {
      clearTimeout(this.stopTypingTimer);
    }

    this.stopTypingTimer = setTimeout(() => {
      this.stopTyping();
    }, TYPING_TIMEOUT_MS);
  };

  /**
   * Clear all timers
   */
  private clearTimers = (): void => {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }

    if (this.stopTypingTimer) {
      clearTimeout(this.stopTypingTimer);
      this.stopTypingTimer = null;
    }
  };

  /**
   * Cleanup (call on unmount)
   */
  public cleanup = async (): Promise<void> => {
    await this.stopTyping();
    this.clearTimers();
  };
}

/**
 * Subscribe to typing status updates
 */
export const subscribeToTypingStatus = (options: TypingStatusSubscriptionOptions): (() => void) => {
  const { conversationId, currentUserId, onTypingStatusChange } = options;

  // Track active typing users
  const activeTypingUsers = new Map<string, TypingStatus>();

  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on('broadcast', { event: 'typing_status' }, payload => {
      const typingStatus = payload.payload as TypingStatus;

      // Ignore own typing status
      if (typingStatus.user_id === currentUserId) {
        return;
      }

      // Update or remove typing user
      if (typingStatus.is_typing) {
        activeTypingUsers.set(typingStatus.user_id, typingStatus);

        // Auto-remove after timeout
        const existingTimer = typingTimers.get(typingStatus.user_id);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        const timer = setTimeout(() => {
          activeTypingUsers.delete(typingStatus.user_id);
          onTypingStatusChange(Array.from(activeTypingUsers.values()));
        }, TYPING_TIMEOUT_MS);

        typingTimers.set(typingStatus.user_id, timer);
      } else {
        activeTypingUsers.delete(typingStatus.user_id);

        // Clear timer
        const timer = typingTimers.get(typingStatus.user_id);
        if (timer) {
          clearTimeout(timer);
          typingTimers.delete(typingStatus.user_id);
        }
      }

      // Notify subscribers
      onTypingStatusChange(Array.from(activeTypingUsers.values()));
    })
    .subscribe();

  // Return cleanup function
  return () => {
    // Clear all timers
    typingTimers.forEach(timer => clearTimeout(timer));
    typingTimers.clear();

    // Unsubscribe from channel
    if (channel) {
      supabase.removeChannel(channel);
    }
  };
};
```

---

### Usage Hook

```typescript
// src/features/Chat/hooks/useTypingStatus.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { TypingStatusHandler, subscribeToTypingStatus, TypingStatus } from '../api/typingStatus';

export interface UseTypingStatusOptions {
  conversationId: string;
  currentUserId: string;
  currentUserName: string;
  enabled?: boolean;
}

export interface UseTypingStatusReturn {
  typingUsers: TypingStatus[];
  onUserTyping: () => void;
  stopTyping: () => Promise<void>;
}

export const useTypingStatus = (options: UseTypingStatusOptions): UseTypingStatusReturn => {
  const { conversationId, currentUserId, currentUserName, enabled = true } = options;

  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const typingHandlerRef = useRef<TypingStatusHandler | null>(null);

  /**
   * Initialize typing handler
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    typingHandlerRef.current = new TypingStatusHandler(
      conversationId,
      currentUserId,
      currentUserName
    );

    return () => {
      if (typingHandlerRef.current) {
        typingHandlerRef.current.cleanup();
      }
    };
  }, [conversationId, currentUserId, currentUserName, enabled]);

  /**
   * Subscribe to typing status updates
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const unsubscribe = subscribeToTypingStatus({
      conversationId,
      currentUserId,
      onTypingStatusChange: users => {
        setTypingUsers(users);
      },
    });

    return unsubscribe;
  }, [conversationId, currentUserId, enabled]);

  /**
   * Handle user typing
   */
  const onUserTyping = useCallback(() => {
    if (typingHandlerRef.current) {
      typingHandlerRef.current.onUserTyping();
    }
  }, []);

  /**
   * Stop typing
   */
  const stopTyping = useCallback(async () => {
    if (typingHandlerRef.current) {
      await typingHandlerRef.current.stopTyping();
    }
  }, []);

  return {
    typingUsers,
    onUserTyping,
    stopTyping,
  };
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/features/Chat/api/__tests__/typingStatus.test.ts

import {
  broadcastTypingStatus,
  TypingStatusHandler,
  subscribeToTypingStatus,
} from '../typingStatus';
import { supabase } from '@app/config/supabase';

jest.mock('@app/config/supabase', () => ({
  supabase: {
    channel: jest.fn(),
    removeChannel: jest.fn(),
  },
}));

jest.useFakeTimers();

describe('typingStatusService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('broadcastTypingStatus', () => {
    it('should broadcast typing status', async () => {
      const mockSend = jest.fn().mockResolvedValue(undefined);
      const mockChannel = { send: mockSend };

      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      await broadcastTypingStatus('conv-123', 'user-1', 'John Doe', true);

      expect(supabase.channel).toHaveBeenCalledWith('conversation:conv-123');
      expect(mockSend).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'typing_status',
        payload: expect.objectContaining({
          user_id: 'user-1',
          user_name: 'John Doe',
          conversation_id: 'conv-123',
          is_typing: true,
        }),
      });
    });

    it('should handle broadcast errors', async () => {
      const mockSend = jest.fn().mockRejectedValue(new Error('Network error'));
      const mockChannel = { send: mockSend };

      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await broadcastTypingStatus('conv-123', 'user-1', 'John Doe', true);

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('TypingStatusHandler', () => {
    it('should debounce typing events', async () => {
      const handler = new TypingStatusHandler('conv-123', 'user-1', 'John Doe');

      const mockSend = jest.fn().mockResolvedValue(undefined);
      const mockChannel = { send: mockSend };
      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      // Rapid typing
      handler.onUserTyping();
      handler.onUserTyping();
      handler.onUserTyping();

      // Should not broadcast yet
      expect(mockSend).not.toHaveBeenCalled();

      // Fast-forward debounce time
      jest.advanceTimersByTime(500);

      await Promise.resolve(); // Wait for async call

      // Should broadcast once
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should auto-stop typing after timeout', async () => {
      const handler = new TypingStatusHandler('conv-123', 'user-1', 'John Doe');

      const mockSend = jest.fn().mockResolvedValue(undefined);
      const mockChannel = { send: mockSend };
      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      handler.onUserTyping();

      // Advance debounce time
      jest.advanceTimersByTime(500);
      await Promise.resolve();

      // Should broadcast start typing
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({ is_typing: true }),
        })
      );

      // Clear mock
      mockSend.mockClear();

      // Advance stop typing timeout
      jest.advanceTimersByTime(3000);
      await Promise.resolve();

      // Should broadcast stop typing
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({ is_typing: false }),
        })
      );
    });

    it('should cleanup properly', async () => {
      const handler = new TypingStatusHandler('conv-123', 'user-1', 'John Doe');

      const mockSend = jest.fn().mockResolvedValue(undefined);
      const mockChannel = { send: mockSend };
      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      handler.onUserTyping();

      await handler.cleanup();

      // Should clear timers and stop typing
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({ is_typing: false }),
        })
      );
    });
  });

  describe('subscribeToTypingStatus', () => {
    it('should subscribe to typing status updates', () => {
      const mockOn = jest.fn().mockReturnThis();
      const mockSubscribe = jest.fn();
      const mockChannel = { on: mockOn, subscribe: mockSubscribe };

      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      const onTypingStatusChange = jest.fn();

      subscribeToTypingStatus({
        conversationId: 'conv-123',
        currentUserId: 'current-user',
        onTypingStatusChange,
      });

      expect(supabase.channel).toHaveBeenCalledWith('conversation:conv-123');
      expect(mockOn).toHaveBeenCalledWith(
        'broadcast',
        { event: 'typing_status' },
        expect.any(Function)
      );
      expect(mockSubscribe).toHaveBeenCalled();
    });

    it('should ignore own typing status', () => {
      const mockOn = jest.fn().mockReturnThis();
      const mockSubscribe = jest.fn();
      const mockChannel = { on: mockOn, subscribe: mockSubscribe };

      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      const onTypingStatusChange = jest.fn();

      subscribeToTypingStatus({
        conversationId: 'conv-123',
        currentUserId: 'current-user',
        onTypingStatusChange,
      });

      // Get the callback function
      const callback = mockOn.mock.calls[0][2];

      // Trigger with own user ID
      callback({
        payload: {
          user_id: 'current-user',
          is_typing: true,
        },
      });

      // Should not call onTypingStatusChange
      expect(onTypingStatusChange).not.toHaveBeenCalled();
    });

    it('should cleanup on unsubscribe', () => {
      const mockOn = jest.fn().mockReturnThis();
      const mockSubscribe = jest.fn();
      const mockChannel = { on: mockOn, subscribe: mockSubscribe };

      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      const unsubscribe = subscribeToTypingStatus({
        conversationId: 'conv-123',
        currentUserId: 'current-user',
        onTypingStatusChange: jest.fn(),
      });

      unsubscribe();

      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    });
  });
});
```

---

## Dependencies

- Supabase Realtime
- React (for hooks)

---

## Definition of Done

- [ ] Typing status service implemented
- [ ] Broadcast typing status working
- [ ] Subscribe to typing status working
- [ ] Debounced events working
- [ ] Auto-stop timeout working
- [ ] Cleanup working
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-048](../stories/US-048-typing-indicators-read-receipts.md), [TASK-273](TASK-273-typing-indicator.md), [TASK-275](TASK-275-read-receipt.md)
