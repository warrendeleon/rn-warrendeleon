# TASK-271: EmptyState Component

**ID**: TASK-271 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-047](../stories/US-047-message-history-pagination.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Create a reusable EmptyState component for displaying empty conversations and other empty states throughout the app. Support custom icon, title, description, and optional action button.

---

## Acceptance Criteria

- [ ] EmptyState component created in `src/components/chat/EmptyState.tsx`
- [ ] Display custom icon
- [ ] Display title and description
- [ ] Optional action button
- [ ] Responsive layout
- [ ] All EAA accessibility requirements met
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### EmptyState Component

```typescript
// src/components/chat/EmptyState.tsx

import React from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  ButtonText,
  MessageCircleIcon,
} from '@gluestack-ui/themed';

export interface EmptyStateProps {
  icon?: React.ComponentType<any>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = MessageCircleIcon,
  title,
  description,
  actionLabel,
  onAction,
  testID = 'empty-state',
}) => {
  return (
    <Box
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding="$6"
      testID={testID}
    >
      <VStack space="lg" alignItems="center" maxWidth={300}>
        {/* Icon */}
        <Box
          backgroundColor="$gray100"
          borderRadius="$full"
          width={80}
          height={80}
          justifyContent="center"
          alignItems="center"
          testID={`${testID}-icon`}
        >
          <Icon size="xl" color="$gray400" />
        </Box>

        {/* Title */}
        <Text
          fontSize="$xl"
          fontWeight="$semibold"
          color="$gray900"
          textAlign="center"
          testID={`${testID}-title`}
          accessibilityRole="header"
        >
          {title}
        </Text>

        {/* Description */}
        {description && (
          <Text
            fontSize="$md"
            color="$gray600"
            textAlign="center"
            testID={`${testID}-description`}
          >
            {description}
          </Text>
        )}

        {/* Action Button */}
        {actionLabel && onAction && (
          <Button
            onPress={onAction}
            backgroundColor="$blue600"
            marginTop="$4"
            testID={`${testID}-action-button`}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <ButtonText>{actionLabel}</ButtonText>
          </Button>
        )}
      </VStack>
    </Box>
  );
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/components/chat/__tests__/EmptyState.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';
import { SendIcon } from '@gluestack-ui/themed';

describe('EmptyState', () => {
  describe('Rendering', () => {
    it('should render with title', () => {
      const { getByTestId, getByText } = render(
        <EmptyState title="No messages yet" />
      );

      expect(getByTestId('empty-state')).toBeTruthy();
      expect(getByText('No messages yet')).toBeTruthy();
    });

    it('should render with description', () => {
      const { getByText } = render(
        <EmptyState
          title="No messages yet"
          description="Start a conversation to see messages here"
        />
      );

      expect(getByText('Start a conversation to see messages here')).toBeTruthy();
    });

    it('should render with custom icon', () => {
      const { getByTestId } = render(
        <EmptyState title="No messages yet" icon={SendIcon} />
      );

      expect(getByTestId('empty-state-icon')).toBeTruthy();
    });

    it('should render action button when provided', () => {
      const { getByText } = render(
        <EmptyState
          title="No messages yet"
          actionLabel="Start Conversation"
          onAction={jest.fn()}
        />
      );

      expect(getByText('Start Conversation')).toBeTruthy();
    });

    it('should not render action button when not provided', () => {
      const { queryByTestId } = render(<EmptyState title="No messages yet" />);

      expect(queryByTestId('empty-state-action-button')).toBeNull();
    });
  });

  describe('Action Button', () => {
    it('should call onAction when button pressed', () => {
      const mockOnAction = jest.fn();

      const { getByTestId } = render(
        <EmptyState
          title="No messages yet"
          actionLabel="Start Conversation"
          onAction={mockOnAction}
        />
      );

      fireEvent.press(getByTestId('empty-state-action-button'));

      expect(mockOnAction).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility role for title', () => {
      const { getByTestId } = render(<EmptyState title="No messages yet" />);

      const title = getByTestId('empty-state-title');
      expect(title).toHaveProp('accessibilityRole', 'header');
    });

    it('should have correct accessibility label for action button', () => {
      const { getByTestId } = render(
        <EmptyState
          title="No messages yet"
          actionLabel="Start Conversation"
          onAction={jest.fn()}
        />
      );

      const button = getByTestId('empty-state-action-button');
      expect(button).toHaveProp('accessibilityRole', 'button');
      expect(button).toHaveProp('accessibilityLabel', 'Start Conversation');
    });
  });

  describe('Custom testID', () => {
    it('should use custom testID', () => {
      const { getByTestId } = render(
        <EmptyState title="No messages yet" testID="custom-empty-state" />
      );

      expect(getByTestId('custom-empty-state')).toBeTruthy();
      expect(getByTestID('custom-empty-state-icon')).toBeTruthy();
      expect(getByTestID('custom-empty-state-title')).toBeTruthy();
    });
  });
});
```

---

## Dependencies

- GlueStack UI

---

## Definition of Done

- [ ] Component implemented and renders correctly
- [ ] Custom icon support working
- [ ] Title and description display working
- [ ] Action button working
- [ ] All unit tests passing
- [ ] EAA compliance verified
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-047](../stories/US-047-message-history-pagination.md), [TASK-262](TASK-262-chatscreen-ui.md)
