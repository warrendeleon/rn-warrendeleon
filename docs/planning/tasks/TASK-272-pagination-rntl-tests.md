# TASK-272: Pagination RNTL Tests

**ID**: TASK-272 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-047](../stories/US-047-message-history-pagination.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Write comprehensive React Native Testing Library tests for pagination functionality. Test pagination utility functions, MessageList pagination behaviour, loading states, empty states, and edge cases. Achieve 100% code coverage.

---

## Acceptance Criteria

- [ ] Complete RNTL test suite for pagination utilities
- [ ] Pagination state management tested
- [ ] Message merging tested
- [ ] Load more functionality tested
- [ ] Edge cases tested
- [ ] 100% code coverage
- [ ] All tests passing

---

## Implementation Details

### Comprehensive RNTL Test Suite

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
      expect(state.currentPage).toBe(0);
      expect(state.hasMore).toBe(true);
    });

    it('should create state with zero page size', () => {
      const state = createInitialPaginationState(0);

      expect(state.pageSize).toBe(0);
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
      expect(calculateOffset(5, 10)).toBe(50);
    });

    it('should handle zero page size', () => {
      expect(calculateOffset(5, 0)).toBe(0);
    });

    it('should handle negative page numbers', () => {
      expect(calculateOffset(-1, 20)).toBe(-20);
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
      expect(updatedState.oldestMessageId).toBe('msg-1');
      expect(updatedState.newestMessageId).toBe('msg-2');
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

    it('should update oldest and newest message IDs correctly', () => {
      const state = createInitialPaginationState();
      const unorderedMessages = [
        { id: 'msg-3', created_at: '2025-01-21T10:02:00Z' },
        { id: 'msg-1', created_at: '2025-01-21T10:00:00Z' },
        { id: 'msg-2', created_at: '2025-01-21T10:01:00Z' },
      ];

      const updatedState = updatePaginationState(state, unorderedMessages, 20);

      expect(updatedState.newestMessageId).toBe('msg-3');
      expect(updatedState.oldestMessageId).toBe('msg-1');
    });

    it('should increment current page', () => {
      let state = createInitialPaginationState();

      state = updatePaginationState(state, mockMessages, 20);
      expect(state.currentPage).toBe(1);

      state = updatePaginationState(state, mockMessages, 20);
      expect(state.currentPage).toBe(2);
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
      expect(state.currentPage).toBe(0);
      expect(state.hasMore).toBe(true);
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

    it('should return false when both no more messages and loading', () => {
      const state = { ...createInitialPaginationState(), hasMore: false };

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

    it('should handle custom page size', () => {
      const state = {
        ...createInitialPaginationState(50),
        currentPage: 3,
      };

      const params = getPaginationParams(state);

      expect(params).toEqual({
        page: 3,
        limit: 50,
        offset: 150,
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
      expect(merged.filter(m => m.id === 'msg-1')).toHaveLength(1);
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
      expect(merged[0].id).toBe('msg-4');
    });

    it('should handle empty new messages', () => {
      const merged = mergeMessages(existingMessages, []);

      expect(merged).toHaveLength(2);
      expect(merged).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'msg-2' }),
          expect.objectContaining({ id: 'msg-1' }),
        ])
      );
    });

    it('should handle both empty arrays', () => {
      const merged = mergeMessages([], []);

      expect(merged).toHaveLength(0);
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

    it('should return 0 when more loaded than total', () => {
      const state = { ...createInitialPaginationState(), totalLoaded: 150 };

      const remaining = estimateRemainingMessages(state, 100);

      expect(remaining).toBe(0);
    });

    it('should return null when total is unknown', () => {
      const state = createInitialPaginationState();

      const remaining = estimateRemainingMessages(state);

      expect(remaining).toBeNull();
    });

    it('should return null when total is undefined', () => {
      const state = createInitialPaginationState();

      const remaining = estimateRemainingMessages(state, undefined);

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

    it('should return false on page 1', () => {
      const state = { ...createInitialPaginationState(), currentPage: 1 };

      expect(isAtEnd(state)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large page numbers', () => {
      const offset = calculateOffset(10000, 20);

      expect(offset).toBe(200000);
    });

    it('should handle very large page sizes', () => {
      const state = createInitialPaginationState(10000);
      const params = getPaginationParams(state);

      expect(params.limit).toBe(10000);
    });

    it('should handle single message', () => {
      const state = createInitialPaginationState();
      const singleMessage = [{ id: 'msg-1', created_at: '2025-01-21T10:00:00Z' }];

      const updatedState = updatePaginationState(state, singleMessage, 20);

      expect(updatedState.totalLoaded).toBe(1);
      expect(updatedState.oldestMessageId).toBe('msg-1');
      expect(updatedState.newestMessageId).toBe('msg-1');
    });

    it('should handle messages with same timestamp', () => {
      const messages = [
        { id: 'msg-1', created_at: '2025-01-21T10:00:00Z' },
        { id: 'msg-2', created_at: '2025-01-21T10:00:00Z' },
        { id: 'msg-3', created_at: '2025-01-21T10:00:00Z' },
      ];

      const merged = mergeMessages([], messages);

      expect(merged).toHaveLength(3);
    });
  });
});
```

---

## Dependencies

- `@testing-library/react-native`
- `@testing-library/jest-native`
- Jest
- Pagination utility functions (TASK-268)

---

## Definition of Done

- [ ] All pagination utility functions tested
- [ ] State management tested
- [ ] Message merging tested
- [ ] Edge cases tested
- [ ] 100% code coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-047](../stories/US-047-message-history-pagination.md), [TASK-268](TASK-268-pagination-logic.md), [TASK-269](TASK-269-message-list.md)
