# TASK-268: Pagination Logic Implementation

**ID**: TASK-268 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-047](../stories/US-047-message-history-pagination.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Implement pagination logic for chat message history. Support cursor-based pagination for efficient loading of older messages, calculate page boundaries, handle edge cases (first/last page), and optimize for performance.

---

## Acceptance Criteria

- [ ] Pagination utility created in `src/utils/chat/paginationUtils.ts`
- [ ] Cursor-based pagination implementation
- [ ] Calculate offset/limit for API calls
- [ ] Handle first page (no previous messages)
- [ ] Handle last page (no more messages)
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Pagination Utility

```typescript
// src/utils/chat/paginationUtils.ts

export interface PaginationConfig {
  pageSize: number;
  initialPage: number;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
  totalLoaded: number;
  oldestMessageId: string | null;
  newestMessageId: string | null;
}

export const DEFAULT_PAGE_SIZE = 20;

/**
 * Create initial pagination state
 */
export const createInitialPaginationState = (
  pageSize: number = DEFAULT_PAGE_SIZE
): PaginationState => {
  return {
    currentPage: 0,
    pageSize,
    hasMore: true,
    totalLoaded: 0,
    oldestMessageId: null,
    newestMessageId: null,
  };
};

/**
 * Calculate offset for page-based pagination
 */
export const calculateOffset = (page: number, pageSize: number): number => {
  return page * pageSize;
};

/**
 * Update pagination state after loading messages
 */
export const updatePaginationState = (
  currentState: PaginationState,
  loadedMessages: Array<{ id: string; created_at: string }>,
  requestedPageSize: number
): PaginationState => {
  const messagesCount = loadedMessages.length;

  // Determine if there are more messages
  const hasMore = messagesCount === requestedPageSize;

  // Find oldest and newest messages
  let oldestMessageId = currentState.oldestMessageId;
  let newestMessageId = currentState.newestMessageId;

  if (messagesCount > 0) {
    // Messages are sorted newest first
    const sortedMessages = [...loadedMessages].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    newestMessageId = sortedMessages[0].id;
    oldestMessageId = sortedMessages[sortedMessages.length - 1].id;
  }

  return {
    ...currentState,
    currentPage: currentState.currentPage + 1,
    hasMore,
    totalLoaded: currentState.totalLoaded + messagesCount,
    oldestMessageId,
    newestMessageId,
  };
};

/**
 * Reset pagination state (for conversation change)
 */
export const resetPaginationState = (pageSize: number = DEFAULT_PAGE_SIZE): PaginationState => {
  return createInitialPaginationState(pageSize);
};

/**
 * Check if should load more messages
 */
export const shouldLoadMore = (state: PaginationState, isLoading: boolean): boolean => {
  return state.hasMore && !isLoading;
};

/**
 * Get pagination parameters for API call
 */
export const getPaginationParams = (state: PaginationState) => {
  return {
    page: state.currentPage,
    limit: state.pageSize,
    offset: calculateOffset(state.currentPage, state.pageSize),
  };
};

/**
 * Merge new messages with existing messages (avoiding duplicates)
 */
export const mergeMessages = <T extends { id: string; created_at: string }>(
  existingMessages: T[],
  newMessages: T[]
): T[] => {
  // Create a Set of existing message IDs for fast lookup
  const existingIds = new Set(existingMessages.map(msg => msg.id));

  // Filter out duplicates from new messages
  const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));

  // Combine and sort by created_at (newest first)
  const combined = [...existingMessages, ...uniqueNewMessages];

  return combined.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

/**
 * Calculate remaining messages estimate
 */
export const estimateRemainingMessages = (
  state: PaginationState,
  totalMessages?: number
): number | null => {
  if (totalMessages === undefined) {
    return null;
  }

  return Math.max(0, totalMessages - state.totalLoaded);
};

/**
 * Check if at beginning of conversation
 */
export const isAtBeginning = (state: PaginationState): boolean => {
  return !state.hasMore;
};

/**
 * Check if at end of conversation
 */
export const isAtEnd = (state: PaginationState): boolean => {
  return state.currentPage === 0;
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/utils/chat/__tests__/paginationUtils.test.ts

import {
  createInitialPaginationState,
  calculateOffset,
  updatePaginationState,
  resetPaginationState,
  shouldLoadMore,
  getPaginationParams,
  mergeMessages,
  estimateRemainingMessages,
  isAtBeginning,
  isAtEnd,
  DEFAULT_PAGE_SIZE,
} from '../paginationUtils';

describe('paginationUtils', () => {
  describe('createInitialPaginationState', () => {
    it('should create initial state with default page size', () => {
      const state = createInitialPaginationState();

      expect(state).toEqual({
        currentPage: 0,
        pageSize: DEFAULT_PAGE_SIZE,
        hasMore: true,
        totalLoaded: 0,
        oldestMessageId: null,
        newestMessageId: null,
      });
    });

    it('should create initial state with custom page size', () => {
      const state = createInitialPaginationState(50);

      expect(state.pageSize).toBe(50);
    });
  });

  describe('calculateOffset', () => {
    it('should calculate offset for first page', () => {
      expect(calculateOffset(0, 20)).toBe(0);
    });

    it('should calculate offset for second page', () => {
      expect(calculateOffset(1, 20)).toBe(20);
    });

    it('should calculate offset for third page', () => {
      expect(calculateOffset(2, 20)).toBe(40);
    });

    it('should handle custom page sizes', () => {
      expect(calculateOffset(3, 50)).toBe(150);
    });
  });

  describe('updatePaginationState', () => {
    const mockMessages = [
      { id: 'msg-1', created_at: '2025-01-21T10:00:00Z' },
      { id: 'msg-2', created_at: '2025-01-21T10:01:00Z' },
      { id: 'msg-3', created_at: '2025-01-21T10:02:00Z' },
    ];

    it('should update state after loading full page', () => {
      const initialState = createInitialPaginationState(3);

      const updatedState = updatePaginationState(initialState, mockMessages, 3);

      expect(updatedState).toEqual({
        currentPage: 1,
        pageSize: 3,
        hasMore: true, // Full page indicates more messages
        totalLoaded: 3,
        oldestMessageId: 'msg-1',
        newestMessageId: 'msg-3',
      });
    });

    it('should update state after loading partial page (no more messages)', () => {
      const initialState = createInitialPaginationState(5);
      const partialMessages = mockMessages.slice(0, 2);

      const updatedState = updatePaginationState(initialState, partialMessages, 5);

      expect(updatedState.hasMore).toBe(false);
      expect(updatedState.totalLoaded).toBe(2);
    });

    it('should handle empty messages array', () => {
      const initialState = createInitialPaginationState();

      const updatedState = updatePaginationState(initialState, [], 20);

      expect(updatedState.hasMore).toBe(false);
      expect(updatedState.totalLoaded).toBe(0);
      expect(updatedState.oldestMessageId).toBeNull();
      expect(updatedState.newestMessageId).toBeNull();
    });

    it('should accumulate total loaded count', () => {
      let state = createInitialPaginationState(2);

      state = updatePaginationState(state, mockMessages.slice(0, 2), 2);
      expect(state.totalLoaded).toBe(2);

      state = updatePaginationState(state, mockMessages.slice(2, 3), 2);
      expect(state.totalLoaded).toBe(3);
    });
  });

  describe('resetPaginationState', () => {
    it('should reset to initial state', () => {
      const state = resetPaginationState();

      expect(state).toEqual(createInitialPaginationState());
    });

    it('should reset with custom page size', () => {
      const state = resetPaginationState(50);

      expect(state.pageSize).toBe(50);
    });
  });

  describe('shouldLoadMore', () => {
    it('should return true when has more and not loading', () => {
      const state = createInitialPaginationState();

      expect(shouldLoadMore(state, false)).toBe(true);
    });

    it('should return false when no more messages', () => {
      const state = { ...createInitialPaginationState(), hasMore: false };

      expect(shouldLoadMore(state, false)).toBe(false);
    });

    it('should return false when already loading', () => {
      const state = createInitialPaginationState();

      expect(shouldLoadMore(state, true)).toBe(false);
    });
  });

  describe('getPaginationParams', () => {
    it('should return correct params for first page', () => {
      const state = createInitialPaginationState();

      const params = getPaginationParams(state);

      expect(params).toEqual({
        page: 0,
        limit: DEFAULT_PAGE_SIZE,
        offset: 0,
      });
    });

    it('should return correct params for subsequent page', () => {
      const state = { ...createInitialPaginationState(), currentPage: 2 };

      const params = getPaginationParams(state);

      expect(params).toEqual({
        page: 2,
        limit: DEFAULT_PAGE_SIZE,
        offset: 40,
      });
    });
  });

  describe('mergeMessages', () => {
    const existingMessages = [
      { id: 'msg-1', created_at: '2025-01-21T10:00:00Z' },
      { id: 'msg-2', created_at: '2025-01-21T10:01:00Z' },
    ];

    const newMessages = [
      { id: 'msg-3', created_at: '2025-01-21T10:02:00Z' },
      { id: 'msg-4', created_at: '2025-01-21T10:03:00Z' },
    ];

    it('should merge messages without duplicates', () => {
      const merged = mergeMessages(existingMessages, newMessages);

      expect(merged).toHaveLength(4);
      expect(merged.map(m => m.id)).toEqual(['msg-4', 'msg-3', 'msg-2', 'msg-1']);
    });

    it('should remove duplicates', () => {
      const duplicateMessages = [
        ...newMessages,
        { id: 'msg-1', created_at: '2025-01-21T10:00:00Z' }, // Duplicate
      ];

      const merged = mergeMessages(existingMessages, duplicateMessages);

      expect(merged).toHaveLength(4); // No duplicates
    });

    it('should sort by created_at (newest first)', () => {
      const unorderedNew = [
        { id: 'msg-5', created_at: '2025-01-21T09:00:00Z' },
        { id: 'msg-6', created_at: '2025-01-21T11:00:00Z' },
      ];

      const merged = mergeMessages(existingMessages, unorderedNew);

      expect(merged[0].id).toBe('msg-6'); // Newest
      expect(merged[merged.length - 1].id).toBe('msg-5'); // Oldest
    });

    it('should handle empty existing messages', () => {
      const merged = mergeMessages([], newMessages);

      expect(merged).toHaveLength(2);
    });

    it('should handle empty new messages', () => {
      const merged = mergeMessages(existingMessages, []);

      expect(merged).toHaveLength(2);
    });
  });

  describe('estimateRemainingMessages', () => {
    it('should calculate remaining messages', () => {
      const state = { ...createInitialPaginationState(), totalLoaded: 30 };

      const remaining = estimateRemainingMessages(state, 100);

      expect(remaining).toBe(70);
    });

    it('should return 0 when all messages loaded', () => {
      const state = { ...createInitialPaginationState(), totalLoaded: 100 };

      const remaining = estimateRemainingMessages(state, 100);

      expect(remaining).toBe(0);
    });

    it('should return null when total is unknown', () => {
      const state = createInitialPaginationState();

      const remaining = estimateRemainingMessages(state);

      expect(remaining).toBeNull();
    });
  });

  describe('isAtBeginning', () => {
    it('should return true when no more messages', () => {
      const state = { ...createInitialPaginationState(), hasMore: false };

      expect(isAtBeginning(state)).toBe(true);
    });

    it('should return false when has more messages', () => {
      const state = createInitialPaginationState();

      expect(isAtBeginning(state)).toBe(false);
    });
  });

  describe('isAtEnd', () => {
    it('should return true on first page', () => {
      const state = createInitialPaginationState();

      expect(isAtEnd(state)).toBe(true);
    });

    it('should return false on subsequent pages', () => {
      const state = { ...createInitialPaginationState(), currentPage: 2 };

      expect(isAtEnd(state)).toBe(false);
    });
  });
});
```

---

## Dependencies

- None (utility functions)

---

## Definition of Done

- [ ] Pagination utility implemented
- [ ] Cursor-based pagination working
- [ ] Offset/limit calculation correct
- [ ] Edge cases handled
- [ ] Message merging working
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-047](../stories/US-047-message-history-pagination.md), [TASK-262](TASK-262-chatscreen-ui.md), [TASK-269](TASK-269-message-list.md)
