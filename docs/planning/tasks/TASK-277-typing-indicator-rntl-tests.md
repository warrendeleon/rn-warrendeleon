# TASK-277: Typing Indicator RNTL Tests

**ID**: TASK-277 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-048](../stories/US-048-typing-indicators-read-receipts.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Write full React Native Testing Library tests for typing indicators and read receipts. Test TypingIndicator component, typing status service, ReadReceipt component, and mark as read functionality. Achieve 100% code coverage.

---

## Acceptance Criteria

- [ ] Complete RNTL test suite for TypingIndicator component
- [ ] Complete RNTL test suite for ReadReceipt component
- [ ] Typing status service tested
- [ ] Read receipt service tested
- [ ] Edge cases tested
- [ ] 100% code coverage
- [ ] All tests passing

---

## Implementation Details

### Full RNTL Test Suite

```typescript
// src/components/chat/__tests__/TypingIndicatorReadReceipts.test.tsx

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { TypingIndicator, TypingUser } from '../TypingIndicator';
import { ReadReceipt, MessageStatus } from '../ReadReceipt';

describe('TypingIndicator Component', () => {
  const mockUsers: TypingUser[] = [
    { id: 'user-1', name: 'John Doe' },
    { id: 'user-2', name: 'Jane Smith' },
    { id: 'user-3', name: 'Bob Johnson' },
  ];

  describe('Rendering States', () => {
    it('should not render when no users typing', () => {
      const { queryByTestId } = render(<TypingIndicator typingUsers={[]} />);

      expect(queryByTestId('typing-indicator')).toBeNull();
    });

    it('should render when one user typing', () => {
      const { getByTestId, getByText } = render(
        <TypingIndicator typingUsers={[mockUsers[0]]} />
      );

      expect(getByTestId('typing-indicator')).toBeTruthy();
      expect(getByText('John Doe is typing...')).toBeTruthy();
    });

    it('should render when two users typing', () => {
      const { getByText } = render(
        <TypingIndicator typingUsers={mockUsers.slice(0, 2)} />
      );

      expect(getByText('John Doe and Jane Smith are typing...')).toBeTruthy();
    });

    it('should render when three or more users typing', () => {
      const { getByText } = render(<TypingIndicator typingUsers={mockUsers} />);

      expect(getByText('John Doe and 2 others are typing...')).toBeTruthy();
    });

    it('should update when users change', () => {
      const { getByText, rerender } = render(
        <TypingIndicator typingUsers={[mockUsers[0]]} />
      );

      expect(getByText('John Doe is typing...')).toBeTruthy();

      rerender(<TypingIndicator typingUsers={mockUsers.slice(0, 2)} />);

      expect(getByText('John Doe and Jane Smith are typing...')).toBeTruthy();
    });

    it('should unmount when all users stop typing', () => {
      const { getByTestId, rerender, queryByTestId } = render(
        <TypingIndicator typingUsers={[mockUsers[0]]} />
      );

      expect(getByTestId('typing-indicator')).toBeTruthy();

      rerender(<TypingIndicator typingUsers={[]} />);

      expect(queryByTestId('typing-indicator')).toBeNull();
    });
  });

  describe('Animated Dots', () => {
    it('should render three animated dots', () => {
      const { getByTestId } = render(
        <TypingIndicator typingUsers={[mockUsers[0]]} />
      );

      expect(getByTestId('typing-indicator-dots-container')).toBeTruthy();
      expect(getByTestId('typing-indicator-dot-1')).toBeTruthy();
      expect(getByTestId('typing-indicator-dot-2')).toBeTruthy();
      expect(getByTestId('typing-indicator-dot-3')).toBeTruthy();
    });

    it('should hide dots from accessibility', () => {
      const { getByTestId } = render(
        <TypingIndicator typingUsers={[mockUsers[0]]} />
      );

      const dot1 = getByTestId('typing-indicator-dot-1');
      const dot2 = getByTestId('typing-indicator-dot-2');
      const dot3 = getByTestId('typing-indicator-dot-3');

      expect(dot1.props.accessibilityElementsHidden).toBe(true);
      expect(dot2.props.accessibilityElementsHidden).toBe(true);
      expect(dot3.props.accessibilityElementsHidden).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility role and label', () => {
      const { getByTestId } = render(
        <TypingIndicator typingUsers={[mockUsers[0]]} />
      );

      const indicator = getByTestId('typing-indicator');
      expect(indicator).toHaveProp('accessibilityRole', 'status');
      expect(indicator).toHaveProp('accessibilityLiveRegion', 'polite');
      expect(indicator).toHaveProp(
        'accessibilityLabel',
        'John Doe is typing...'
      );
    });

    it('should update accessibility label when users change', () => {
      const { getByTestId, rerender } = render(
        <TypingIndicator typingUsers={[mockUsers[0]]} />
      );

      expect(getByTestId('typing-indicator')).toHaveProp(
        'accessibilityLabel',
        'John Doe is typing...'
      );

      rerender(<TypingIndicator typingUsers={mockUsers} />);

      expect(getByTestId('typing-indicator')).toHaveProp(
        'accessibilityLabel',
        'John Doe and 2 others are typing...'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with empty name', () => {
      const emptyNameUser: TypingUser = { id: 'user-1', name: '' };

      const { getByText } = render(
        <TypingIndicator typingUsers={[emptyNameUser]} />
      );

      expect(getByText(' is typing...')).toBeTruthy();
    });

    it('should handle very long user names', () => {
      const longNameUser: TypingUser = {
        id: 'user-1',
        name: 'John Doe With A Very Long Name That Might Overflow The Container',
      };

      const { getByText } = render(
        <TypingIndicator typingUsers={[longNameUser]} />
      );

      expect(
        getByText(
          'John Doe With A Very Long Name That Might Overflow The Container is typing...'
        )
      ).toBeTruthy();
    });

    it('should handle many users typing', () => {
      const manyUsers: TypingUser[] = Array.from({ length: 10 }, (_, i) => ({
        id: `user-${i}`,
        name: `User ${i}`,
      }));

      const { getByText } = render(<TypingIndicator typingUsers={manyUsers} />);

      expect(getByText('User 0 and 9 others are typing...')).toBeTruthy();
    });

    it('should handle duplicate user IDs', () => {
      const duplicateUsers: TypingUser[] = [
        { id: 'user-1', name: 'John' },
        { id: 'user-1', name: 'John' },
      ];

      const { getByText } = render(
        <TypingIndicator typingUsers={duplicateUsers} />
      );

      // Should display both (deduplication is not component responsibility)
      expect(getByText('John and John are typing...')).toBeTruthy();
    });
  });
});

describe('ReadReceipt Component', () => {
  const statuses: MessageStatus[] = [
    'sending',
    'sent',
    'delivered',
    'read',
    'failed',
  ];

  describe('Status Display', () => {
    it('should render sending status correctly', () => {
      const { getByTestId, queryByTestId } = render(
        <ReadReceipt status="sending" />
      );

      expect(getByTestId('read-receipt')).toBeTruthy();
      expect(getByTestId('read-receipt-check-1')).toBeTruthy();
      expect(queryByTestId('read-receipt-check-2')).toBeNull();
    });

    it('should render sent status with single check', () => {
      const { getByTestId, queryByTestId } = render(
        <ReadReceipt status="sent" />
      );

      expect(getByTestId('read-receipt-check-1')).toBeTruthy();
      expect(queryByTestId('read-receipt-check-2')).toBeNull();
    });

    it('should render delivered status with double gray check', () => {
      const { getByTestId } = render(<ReadReceipt status="delivered" />);

      const check1 = getByTestId('read-receipt-check-1');
      const check2 = getByTestId('read-receipt-check-2');

      expect(check1).toBeTruthy();
      expect(check2).toBeTruthy();
      expect(check1.props.color).toBe('$gray400');
      expect(check2.props.color).toBe('$gray400');
    });

    it('should render read status with double blue check', () => {
      const { getByTestId } = render(<ReadReceipt status="read" />);

      const check1 = getByTestId('read-receipt-check-1');
      const check2 = getByTestId('read-receipt-check-2');

      expect(check1).toBeTruthy();
      expect(check2).toBeTruthy();
      expect(check1.props.color).toBe('$blue600');
      expect(check2.props.color).toBe('$blue600');
    });

    it('should render failed status with red icon', () => {
      const { getByTestId, queryByTestId } = render(
        <ReadReceipt status="failed" />
      );

      expect(getByTestId('read-receipt-failed-icon')).toBeTruthy();
      expect(queryByTestId('read-receipt-check-1')).toBeNull();
      expect(queryByTestId('read-receipt-check-2')).toBeNull();
    });
  });

  describe('Status Transitions', () => {
    it('should update when status changes from sending to sent', () => {
      const { getByTestId, queryByTestId, rerender } = render(
        <ReadReceipt status="sending" />
      );

      expect(getByTestId('read-receipt-check-1')).toBeTruthy();
      expect(queryByTestId('read-receipt-check-2')).toBeNull();

      rerender(<ReadReceipt status="sent" />);

      expect(getByTestId('read-receipt-check-1')).toBeTruthy();
      expect(queryByTestId('read-receipt-check-2')).toBeNull();
    });

    it('should update when status changes from sent to delivered', () => {
      const { getByTestId, queryByTestId, rerender } = render(
        <ReadReceipt status="sent" />
      );

      expect(queryByTestId('read-receipt-check-2')).toBeNull();

      rerender(<ReadReceipt status="delivered" />);

      expect(getByTestId('read-receipt-check-1')).toBeTruthy();
      expect(getByTestId('read-receipt-check-2')).toBeTruthy();
    });

    it('should update when status changes from delivered to read', () => {
      const { getByTestId, rerender } = render(
        <ReadReceipt status="delivered" />
      );

      const check1Before = getByTestId('read-receipt-check-1');
      expect(check1Before.props.color).toBe('$gray400');

      rerender(<ReadReceipt status="read" />);

      const check1After = getByTestId('read-receipt-check-1');
      expect(check1After.props.color).toBe('$blue600');
    });

    it('should update when status changes to failed', () => {
      const { getByTestId, queryByTestId, rerender } = render(
        <ReadReceipt status="sending" />
      );

      expect(getByTestId('read-receipt-check-1')).toBeTruthy();

      rerender(<ReadReceipt status="failed" />);

      expect(getByTestId('read-receipt-failed-icon')).toBeTruthy();
      expect(queryByTestId('read-receipt-check-1')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it.each(statuses)('should have correct accessibility for %s status', (status) => {
      const { getByTestId } = render(<ReadReceipt status={status} />);

      const receipt = getByTestId('read-receipt');
      expect(receipt).toHaveProp('accessibilityRole', 'text');
      expect(receipt.props.accessibilityLabel).toBeTruthy();
    });

    it('should have unique accessibility labels for each status', () => {
      const labels = statuses.map((status) => {
        const { getByTestId } = render(<ReadReceipt status={status} />);
        const receipt = getByTestId('read-receipt');
        return receipt.props.accessibilityLabel;
      });

      // All labels should be unique
      const uniqueLabels = new Set(labels);
      expect(uniqueLabels.size).toBe(statuses.length);
    });
  });

  describe('Visual Consistency', () => {
    it('should use consistent icon sizes', () => {
      const { getByTestId: getByTestIdSent } = render(
        <ReadReceipt status="sent" />
      );
      const { getByTestId: getByTestIdDelivered } = render(
        <ReadReceipt status="delivered" />
      );

      const sentCheck = getByTestIdSent('read-receipt-check-1');
      const deliveredCheck1 = getByTestIdDelivered('read-receipt-check-1');
      const deliveredCheck2 = getByTestIdDelivered('read-receipt-check-2');

      expect(sentCheck.props.size).toBe('xs');
      expect(deliveredCheck1.props.size).toBe('xs');
      expect(deliveredCheck2.props.size).toBe('xs');
    });

    it('should use consistent colors for gray status', () => {
      const grayStatuses: MessageStatus[] = ['sending', 'sent', 'delivered'];

      grayStatuses.forEach((status) => {
        const { getByTestId } = render(<ReadReceipt status={status} />);
        const check1 = getByTestId('read-receipt-check-1');
        expect(check1.props.color).toBe('$gray400');
      });
    });

    it('should use blue color only for read status', () => {
      const { getByTestId } = render(<ReadReceipt status="read" />);

      const check1 = getByTestId('read-receipt-check-1');
      const check2 = getByTestId('read-receipt-check-2');

      expect(check1.props.color).toBe('$blue600');
      expect(check2.props.color).toBe('$blue600');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid status changes', () => {
      const { rerender, getByTestId } = render(
        <ReadReceipt status="sending" />
      );

      rerender(<ReadReceipt status="sent" />);
      rerender(<ReadReceipt status="delivered" />);
      rerender(<ReadReceipt status="read" />);

      const check1 = getByTestId('read-receipt-check-1');
      const check2 = getByTestId('read-receipt-check-2');

      expect(check1.props.color).toBe('$blue600');
      expect(check2.props.color).toBe('$blue600');
    });

    it('should handle unknown status gracefully', () => {
      const { queryByTestId } = render(
        <ReadReceipt status={'unknown' as MessageStatus} />
      );

      expect(queryByTestId('read-receipt')).toBeNull();
    });

    it('should handle null status', () => {
      const { queryByTestId } = render(
        <ReadReceipt status={null as any} />
      );

      expect(queryByTestId('read-receipt')).toBeNull();
    });

    it('should handle undefined status', () => {
      const { queryByTestId } = render(
        <ReadReceipt status={undefined as any} />
      );

      expect(queryByTestId('read-receipt')).toBeNull();
    });
  });

  describe('Custom testID', () => {
    it('should use custom testID', () => {
      const { getByTestId } = render(
        <ReadReceipt status="delivered" testID="custom-read-receipt" />
      );

      expect(getByTestId('custom-read-receipt')).toBeTruthy();
      expect(getByTestId('custom-read-receipt-check-1')).toBeTruthy();
      expect(getByTestId('custom-read-receipt-check-2')).toBeTruthy();
    });

    it('should use custom testID for failed status', () => {
      const { getByTestId } = render(
        <ReadReceipt status="failed" testID="custom-read-receipt" />
      );

      expect(getByTestId('custom-read-receipt')).toBeTruthy();
      expect(getByTestId('custom-read-receipt-failed-icon')).toBeTruthy();
    });
  });
});

describe('Integration Tests', () => {
  describe('TypingIndicator + ReadReceipt in Chat', () => {
    it('should render both components together', () => {
      const { getByTestId } = render(
        <>
          <TypingIndicator typingUsers={[{ id: 'user-1', name: 'John' }]} />
          <ReadReceipt status="read" />
        </>
      );

      expect(getByTestId('typing-indicator')).toBeTruthy();
      expect(getByTestId('read-receipt')).toBeTruthy();
    });

    it('should handle rapid switching between components', () => {
      const { getByTestId, queryByTestId, rerender } = render(
        <>
          <TypingIndicator typingUsers={[{ id: 'user-1', name: 'John' }]} />
          <ReadReceipt status="sending" />
        </>
      );

      expect(getByTestId('typing-indicator')).toBeTruthy();

      rerender(
        <>
          <TypingIndicator typingUsers={[]} />
          <ReadReceipt status="read" />
        </>
      );

      expect(queryByTestId('typing-indicator')).toBeNull();
      expect(getByTestId('read-receipt')).toBeTruthy();
    });
  });
});
```

---

## Dependencies

- `@testing-library/react-native`
- `@testing-library/jest-native`
- Jest
- TypingIndicator component (TASK-273)
- ReadReceipt component (TASK-275)

---

## Definition of Done

- [ ] All TypingIndicator tests passing
- [ ] All ReadReceipt tests passing
- [ ] Status transitions tested
- [ ] Accessibility tested
- [ ] Edge cases tested
- [ ] Integration tests passing
- [ ] 100% code coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-048](../stories/US-048-typing-indicators-read-receipts.md), [TASK-273](TASK-273-typing-indicator.md), [TASK-275](TASK-275-read-receipt.md)
