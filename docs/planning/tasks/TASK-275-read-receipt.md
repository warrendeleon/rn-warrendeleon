# TASK-275: ReadReceipt Component

**ID**: TASK-275 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-048](../stories/US-048-typing-indicators-read-receipts.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Create a ReadReceipt component to display message read status. Support different states (sending, sent, delivered, read) with appropriate icons and colours. Integrate with message status updates from Supabase.

---

## Acceptance Criteria

- [ ] ReadReceipt component created in `src/components/chat/ReadReceipt.tsx`
- [ ] Display status icons (sending, sent, delivered, read)
- [ ] Different colours for each status
- [ ] Support single and double check marks
- [ ] Animated transitions between states
- [ ] All EAA accessibility requirements met
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### ReadReceipt Component

```typescript
// src/components/chat/ReadReceipt.tsx

import React from 'react';
import { Box, CheckIcon, ClockIcon } from '@gluestack-ui/themed';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ReadReceiptProps {
  status: MessageStatus;
  testID?: string;
}

/**
 * Map status to display properties
 */
const getStatusProperties = (status: MessageStatus) => {
  switch (status) {
    case 'sending':
      return {
        icon: ClockIcon,
        color: '$gray400',
        accessibilityLabel: 'Message sending',
        showDouble: false,
      };

    case 'sent':
      return {
        icon: CheckIcon,
        color: '$gray400',
        accessibilityLabel: 'Message sent',
        showDouble: false,
      };

    case 'delivered':
      return {
        icon: CheckIcon,
        color: '$gray400',
        accessibilityLabel: 'Message delivered',
        showDouble: true,
      };

    case 'read':
      return {
        icon: CheckIcon,
        color: '$blue600',
        accessibilityLabel: 'Message read',
        showDouble: true,
      };

    case 'failed':
      return {
        icon: null,
        color: '$red600',
        accessibilityLabel: 'Message failed to send',
        showDouble: false,
      };

    default:
      return {
        icon: null,
        color: '$gray400',
        accessibilityLabel: 'Unknown status',
        showDouble: false,
      };
  }
};

export const ReadReceipt: React.FC<ReadReceiptProps> = ({
  status,
  testID = 'read-receipt',
}) => {
  const { icon: Icon, color, accessibilityLabel, showDouble } =
    getStatusProperties(status);

  // Failed status - show exclamation mark
  if (status === 'failed') {
    return (
      <Box
        testID={testID}
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel}
      >
        <Box
          width={16}
          height={16}
          borderRadius="$full"
          backgroundColor="$red600"
          justifyContent="center"
          alignItems="center"
          testID={`${testID}-failed-icon`}
        >
          <Box
            width={2}
            height={2}
            borderRadius="$full"
            backgroundColor="$white"
          />
        </Box>
      </Box>
    );
  }

  // No icon for unknown status
  if (!Icon) {
    return null;
  }

  return (
    <Box
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      flexDirection="row"
      alignItems="center"
    >
      {/* First check mark */}
      <Icon
        size="xs"
        color={color}
        testID={`${testID}-check-1`}
      />

      {/* Second check mark (for delivered/read) */}
      {showDouble && (
        <Box marginLeft={-6}>
          <Icon
            size="xs"
            color={color}
            testID={`${testID}-check-2`}
          />
        </Box>
      )}
    </Box>
  );
};
```

---

### Usage in MessageBubble

```typescript
// Example: Integrate ReadReceipt in MessageBubble

import { ReadReceipt, MessageStatus } from './ReadReceipt';

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
}) => {
  return (
    <Box>
      {/* Message content */}
      <Text>{message.content}</Text>

      {/* Timestamp and read receipt */}
      <HStack space="xs" justifyContent="flex-end" alignItems="center">
        <Text fontSize="$xs" color="$gray500">
          {formatMessageTime(message.created_at)}
        </Text>

        {/* Only show read receipt for own messages */}
        {isOwnMessage && (
          <ReadReceipt status={message.status as MessageStatus} />
        )}
      </HStack>
    </Box>
  );
};
```

---

### Animated ReadReceipt (Optional Enhancement)

```typescript
// src/components/chat/AnimatedReadReceipt.tsx

import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { ReadReceipt, ReadReceiptProps } from './ReadReceipt';

export const AnimatedReadReceipt: React.FC<ReadReceiptProps> = (props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [props.status]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <ReadReceipt {...props} />
    </Animated.View>
  );
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/components/chat/__tests__/ReadReceipt.test.tsx

import React from 'react';
import { render } from '@testing-library/react-native';
import { ReadReceipt, MessageStatus } from '../ReadReceipt';

describe('ReadReceipt', () => {
  describe('Rendering', () => {
    it('should render sending status with clock icon', () => {
      const { getByTestId } = render(<ReadReceipt status="sending" />);

      expect(getByTestId('read-receipt')).toBeTruthy();
      expect(getByTestId('read-receipt-check-1')).toBeTruthy();
    });

    it('should render sent status with single check', () => {
      const { getByTestId, queryByTestId } = render(
        <ReadReceipt status="sent" />
      );

      expect(getByTestId('read-receipt-check-1')).toBeTruthy();
      expect(queryByTestId('read-receipt-check-2')).toBeNull();
    });

    it('should render delivered status with double check', () => {
      const { getByTestId } = render(<ReadReceipt status="delivered" />);

      expect(getByTestId('read-receipt-check-1')).toBeTruthy();
      expect(getByTestId('read-receipt-check-2')).toBeTruthy();
    });

    it('should render read status with blue double check', () => {
      const { getByTestId } = render(<ReadReceipt status="read" />);

      const check1 = getByTestId('read-receipt-check-1');
      const check2 = getByTestId('read-receipt-check-2');

      expect(check1).toBeTruthy();
      expect(check2).toBeTruthy();
      expect(check1.props.color).toBe('$blue600');
      expect(check2.props.color).toBe('$blue600');
    });

    it('should render failed status with red icon', () => {
      const { getByTestId } = render(<ReadReceipt status="failed" />);

      expect(getByTestId('read-receipt-failed-icon')).toBeTruthy();
    });

    it('should not render for unknown status', () => {
      const { queryByTestId } = render(
        <ReadReceipt status={'unknown' as MessageStatus} />
      );

      expect(queryByTestId('read-receipt')).toBeNull();
    });
  });

  describe('Status Colors', () => {
    it('should use gray for sending status', () => {
      const { getByTestId } = render(<ReadReceipt status="sending" />);

      const check = getByTestId('read-receipt-check-1');
      expect(check.props.color).toBe('$gray400');
    });

    it('should use gray for sent status', () => {
      const { getByTestId } = render(<ReadReceipt status="sent" />);

      const check = getByTestId('read-receipt-check-1');
      expect(check.props.color).toBe('$gray400');
    });

    it('should use gray for delivered status', () => {
      const { getByTestId } = render(<ReadReceipt status="delivered" />);

      const check1 = getByTestId('read-receipt-check-1');
      expect(check1.props.color).toBe('$gray400');
    });

    it('should use blue for read status', () => {
      const { getByTestId } = render(<ReadReceipt status="read" />);

      const check1 = getByTestId('read-receipt-check-1');
      expect(check1.props.color).toBe('$blue600');
    });

    it('should use red for failed status', () => {
      const { getByTestId } = render(<ReadReceipt status="failed" />);

      const failedIcon = getByTestId('read-receipt-failed-icon');
      // Check backgroundColor property
      expect(failedIcon.props.style).toMatchObject({
        backgroundColor: '$red600',
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility label for sending', () => {
      const { getByTestId } = render(<ReadReceipt status="sending" />);

      const receipt = getByTestId('read-receipt');
      expect(receipt).toHaveProp('accessibilityRole', 'text');
      expect(receipt).toHaveProp('accessibilityLabel', 'Message sending');
    });

    it('should have accessibility label for sent', () => {
      const { getByTestId } = render(<ReadReceipt status="sent" />);

      const receipt = getByTestId('read-receipt');
      expect(receipt).toHaveProp('accessibilityLabel', 'Message sent');
    });

    it('should have accessibility label for delivered', () => {
      const { getByTestId } = render(<ReadReceipt status="delivered" />);

      const receipt = getByTestId('read-receipt');
      expect(receipt).toHaveProp('accessibilityLabel', 'Message delivered');
    });

    it('should have accessibility label for read', () => {
      const { getByTestId } = render(<ReadReceipt status="read" />);

      const receipt = getByTestId('read-receipt');
      expect(receipt).toHaveProp('accessibilityLabel', 'Message read');
    });

    it('should have accessibility label for failed', () => {
      const { getByTestId } = render(<ReadReceipt status="failed" />);

      const receipt = getByTestId('read-receipt');
      expect(receipt).toHaveProp(
        'accessibilityLabel',
        'Message failed to send'
      );
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
  });

  describe('Double Check Display', () => {
    it('should show single check for sending', () => {
      const { getByTestId, queryByTestId } = render(
        <ReadReceipt status="sending" />
      );

      expect(getByTestId('read-receipt-check-1')).toBeTruthy();
      expect(queryByTestId('read-receipt-check-2')).toBeNull();
    });

    it('should show single check for sent', () => {
      const { getByTestId, queryByTestId } = render(
        <ReadReceipt status="sent" />
      );

      expect(getByTestId('read-receipt-check-1')).toBeTruthy();
      expect(queryByTestId('read-receipt-check-2')).toBeNull();
    });

    it('should show double check for delivered', () => {
      const { getByTestId } = render(<ReadReceipt status="delivered" />);

      expect(getByTestId('read-receipt-check-1')).toBeTruthy();
      expect(getByTestId('read-receipt-check-2')).toBeTruthy();
    });

    it('should show double check for read', () => {
      const { getByTestId } = render(<ReadReceipt status="read" />);

      expect(getByTestId('read-receipt-check-1')).toBeTruthy();
      expect(getByTestId('read-receipt-check-2')).toBeTruthy();
    });
  });
});
```

---

## Dependencies

- GlueStack UI (CheckIcon, ClockIcon)
- React Native (optional: Animated for transitions)

---

## Definition of Done

- [ ] ReadReceipt component implemented
- [ ] Status icons working
- [ ] Colour coding working
- [ ] Single/double check marks working
- [ ] Failed status working
- [ ] All unit tests passing
- [ ] EAA compliance verified
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-048](../stories/US-048-typing-indicators-read-receipts.md), [TASK-263](TASK-263-message-bubble.md), [TASK-276](TASK-276-mark-messages-read-api.md)
