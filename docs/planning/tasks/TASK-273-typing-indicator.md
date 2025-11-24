# TASK-273: TypingIndicator Component

**ID**: TASK-273 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-048](../stories/US-048-typing-indicators-read-receipts.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## File Structure

```
src/features/Chat/
└── components/
    ├── TypingIndicator.tsx
    └── __tests__/
        └── TypingIndicator.test.tsx
```

**Note**: TypingIndicator is a Chat-specific component, co-located within the Chat feature for displaying real-time typing status.

---

## Task Description

Create a TypingIndicator component to display when other users are typing. Support animated dots, multiple users typing, and proper accessibility. Integrate with Supabase Realtime for live typing status updates.

---

## Acceptance Criteria

- [ ] TypingIndicator component created in `src/features/Chat/components/TypingIndicator.tsx`
- [ ] Animated typing dots (3 dots bouncing animation)
- [ ] Display user name(s) typing
- [ ] Support multiple users typing ("John and 2 others are typing...")
- [ ] Auto-hide after timeout
- [ ] All EAA accessibility requirements met
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### TypingIndicator Component

```typescript
// src/features/Chat/components/TypingIndicator.tsx

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Box, HStack, Text } from '@gluestack-ui/themed';

export interface TypingUser {
  id: string;
  name: string;
}

export interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  testID?: string;
}

/**
 * Animated dot component
 */
const AnimatedDot: React.FC<{
  delay: number;
  testID?: string;
}> = ({ delay, testID }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue, delay]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          transform: [{ translateY }],
        },
      ]}
      testID={testID}
      accessibilityElementsHidden={true}
      importantForAccessibility="no"
    />
  );
};

/**
 * Format typing users text
 */
const formatTypingUsersText = (typingUsers: TypingUser[]): string => {
  const count = typingUsers.length;

  if (count === 0) {
    return '';
  }

  if (count === 1) {
    return `${typingUsers[0].name} is typing...`;
  }

  if (count === 2) {
    return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
  }

  // 3 or more users
  const othersCount = count - 1;
  return `${typingUsers[0].name} and ${othersCount} other${othersCount > 1 ? 's' : ''} are typing...`;
};

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  testID = 'typing-indicator',
}) => {
  // Don't render if no users are typing
  if (typingUsers.length === 0) {
    return null;
  }

  const typingText = formatTypingUsersText(typingUsers);

  return (
    <Box
      paddingHorizontal="$4"
      paddingVertical="$2"
      testID={testID}
      accessibilityRole="status"
      accessibilityLabel={typingText}
      accessibilityLiveRegion="polite"
    >
      <HStack space="sm" alignItems="center">
        {/* Animated dots */}
        <Box
          backgroundColor="$gray200"
          borderRadius="$full"
          paddingHorizontal="$3"
          paddingVertical="$2"
          testID={`${testID}-dots-container`}
        >
          <HStack space="xs" alignItems="center" height={20}>
            <AnimatedDot delay={0} testID={`${testID}-dot-1`} />
            <AnimatedDot delay={150} testID={`${testID}-dot-2`} />
            <AnimatedDot delay={300} testID={`${testID}-dot-3`} />
          </HStack>
        </Box>

        {/* Typing text */}
        <Text
          fontSize="$sm"
          color="$gray600"
          fontStyle="italic"
          testID={`${testID}-text`}
        >
          {typingText}
        </Text>
      </HStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF', // gray-400
  },
});
```

---

### Usage Example with Timeout

```typescript
// Example: TypingIndicatorContainer with auto-hide timeout

import React, { useState, useEffect } from 'react';
import { TypingIndicator, TypingUser } from './TypingIndicator';

const TYPING_TIMEOUT = 3000; // 3 seconds

export const TypingIndicatorContainer: React.FC<{
  conversationId: string;
}> = ({ conversationId }) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [typingTimers, setTypingTimers] = useState<
    Map<string, NodeJS.Timeout>
  >(new Map());

  /**
   * Add typing user with auto-hide timeout
   */
  const addTypingUser = (user: TypingUser) => {
    // Clear existing timer for this user
    const existingTimer = typingTimers.get(user.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Add user to typing list if not already there
    setTypingUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      if (exists) {
        return prev;
      }
      return [...prev, user];
    });

    // Set timeout to remove user
    const timer = setTimeout(() => {
      removeTypingUser(user.id);
    }, TYPING_TIMEOUT);

    setTypingTimers((prev) => new Map(prev).set(user.id, timer));
  };

  /**
   * Remove typing user
   */
  const removeTypingUser = (userId: string) => {
    setTypingUsers((prev) => prev.filter((u) => u.id !== userId));

    const timer = typingTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      setTypingTimers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    }
  };

  /**
   * Cleanup all timers on unmount
   */
  useEffect(() => {
    return () => {
      typingTimers.forEach((timer) => clearTimeout(timer));
    };
  }, [typingTimers]);

  return <TypingIndicator typingUsers={typingUsers} />;
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/features/Chat/components/__tests__/TypingIndicator.test.tsx

import React from 'react';
import { render } from '@testing-library/react-native';
import { TypingIndicator, TypingUser } from '../TypingIndicator';

describe('TypingIndicator', () => {
  const mockUsers: TypingUser[] = [
    { id: 'user-1', name: 'John Doe' },
    { id: 'user-2', name: 'Jane Smith' },
    { id: 'user-3', name: 'Bob Johnson' },
  ];

  describe('Rendering', () => {
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

    it('should render with four users typing', () => {
      const fourUsers = [
        ...mockUsers,
        { id: 'user-4', name: 'Alice Williams' },
      ];

      const { getByText } = render(<TypingIndicator typingUsers={fourUsers} />);

      expect(getByText('John Doe and 3 others are typing...')).toBeTruthy();
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
      expect(dot1.props.accessibilityElementsHidden).toBe(true);
      expect(dot1.props.importantForAccessibility).toBe('no');
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility role', () => {
      const { getByTestId } = render(
        <TypingIndicator typingUsers={[mockUsers[0]]} />
      );

      const indicator = getByTestId('typing-indicator');
      expect(indicator).toHaveProp('accessibilityRole', 'status');
      expect(indicator).toHaveProp('accessibilityLiveRegion', 'polite');
    });

    it('should have correct accessibility label for one user', () => {
      const { getByTestId } = render(
        <TypingIndicator typingUsers={[mockUsers[0]]} />
      );

      const indicator = getByTestId('typing-indicator');
      expect(indicator).toHaveProp(
        'accessibilityLabel',
        'John Doe is typing...'
      );
    });

    it('should have correct accessibility label for multiple users', () => {
      const { getByTestId } = render(<TypingIndicator typingUsers={mockUsers} />);

      const indicator = getByTestId('typing-indicator');
      expect(indicator).toHaveProp(
        'accessibilityLabel',
        'John Doe and 2 others are typing...'
      );
    });
  });

  describe('Custom testID', () => {
    it('should use custom testID', () => {
      const { getByTestId } = render(
        <TypingIndicator
          typingUsers={[mockUsers[0]]}
          testID="custom-typing-indicator"
        />
      );

      expect(getByTestId('custom-typing-indicator')).toBeTruthy();
      expect(getByTestId('custom-typing-indicator-text')).toBeTruthy();
      expect(getByTestId('custom-typing-indicator-dots-container')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with very long name', () => {
      const longNameUser: TypingUser = {
        id: 'user-1',
        name: 'John Doe With A Very Long Name That Might Overflow',
      };

      const { getByText } = render(
        <TypingIndicator typingUsers={[longNameUser]} />
      );

      expect(
        getByText(
          'John Doe With A Very Long Name That Might Overflow is typing...'
        )
      ).toBeTruthy();
    });

    it('should handle empty user name', () => {
      const emptyNameUser: TypingUser = {
        id: 'user-1',
        name: '',
      };

      const { getByText } = render(
        <TypingIndicator typingUsers={[emptyNameUser]} />
      );

      expect(getByText(' is typing...')).toBeTruthy();
    });

    it('should handle large number of typing users', () => {
      const manyUsers: TypingUser[] = Array.from({ length: 10 }, (_, i) => ({
        id: `user-${i}`,
        name: `User ${i}`,
      }));

      const { getByText } = render(<TypingIndicator typingUsers={manyUsers} />);

      expect(getByText('User 0 and 9 others are typing...')).toBeTruthy();
    });
  });
});
```

---

## Dependencies

- React Native (Animated API)
- GlueStack UI
- Supabase Realtime (for receiving typing status updates)

---

## Definition of Done

- [ ] TypingIndicator component implemented
- [ ] Animated dots working
- [ ] Single user display working
- [ ] Multiple users display working
- [ ] Auto-hide timeout working
- [ ] All unit tests passing
- [ ] EAA compliance verified
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-048](../stories/US-048-typing-indicators-read-receipts.md), [TASK-274](TASK-274-typing-status-service.md)
