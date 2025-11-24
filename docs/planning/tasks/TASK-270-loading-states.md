# TASK-270: Loading States

**ID**: TASK-270 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-047](../stories/US-047-message-history-pagination.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## File Structure

```
src/features/Chat/
└── components/
    ├── LoadingIndicator.tsx
    ├── MessageLoadingPlaceholder.tsx
    ├── SendingMessageIndicator.tsx
    ├── ErrorBanner.tsx
    └── __tests__/
        └── LoadingStates.test.tsx
```

**Note**: All loading state components are Chat-specific UI components, co-located within the Chat feature.

---

## Task Description

Create comprehensive loading state components for chat functionality. Support initial load, pagination load, sending message, and error states. Provide visual feedback for all async operations with proper accessibility support.

---

## Acceptance Criteria

- [ ] LoadingIndicator component created in `src/features/Chat/components/LoadingIndicator.tsx`
- [ ] MessageLoadingPlaceholder component created (skeleton loader)
- [ ] SendingMessageIndicator component created
- [ ] ErrorBanner component created
- [ ] All loading states have proper animations
- [ ] All EAA accessibility requirements met
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### LoadingIndicator Component

```typescript
// src/features/Chat/components/LoadingIndicator.tsx

import React from 'react';
import { Box, Spinner, Text, VStack } from '@gluestack-ui/themed';

export interface LoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'large';
  testID?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Loading...',
  size = 'large',
  testID = 'loading-indicator',
}) => {
  return (
    <Box
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding="$6"
      testID={testID}
    >
      <VStack space="md" alignItems="center">
        <Spinner
          size={size}
          color="$blue600"
          testID={`${testID}-spinner`}
          accessibilityLabel="Loading"
        />
        <Text
          fontSize={size === 'large' ? '$md' : '$sm'}
          color="$gray600"
          textAlign="center"
          testID={`${testID}-message`}
          accessibilityRole="text"
          accessibilityLabel={message}
        >
          {message}
        </Text>
      </VStack>
    </Box>
  );
};
```

---

### MessageLoadingPlaceholder (Skeleton Loader)

```typescript
// src/features/Chat/components/MessageLoadingPlaceholder.tsx

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Box, HStack, VStack } from '@gluestack-ui/themed';

export interface MessageLoadingPlaceholderProps {
  count?: number;
  testID?: string;
}

const SkeletonBox: React.FC<{
  width: number | string;
  height: number;
  testID?: string;
}> = ({ width, height, testID }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          opacity,
        },
      ]}
      testID={testID}
      accessibilityElementsHidden={true}
      importantForAccessibility="no"
    />
  );
};

const MessagePlaceholder: React.FC<{
  isOwnMessage: boolean;
  testID?: string;
}> = ({ isOwnMessage, testID }) => {
  return (
    <Box
      marginBottom="$3"
      alignItems={isOwnMessage ? 'flex-end' : 'flex-start'}
      testID={testID}
    >
      <HStack
        space="sm"
        maxWidth="80%"
        flexDirection={isOwnMessage ? 'row-reverse' : 'row'}
      >
        {/* Avatar placeholder */}
        {!isOwnMessage && (
          <SkeletonBox
            width={40}
            height={40}
            testID={`${testID}-avatar`}
          />
        )}

        {/* Message bubble placeholder */}
        <VStack space="xs" flex={1}>
          {/* Sender name (only for received messages) */}
          {!isOwnMessage && (
            <SkeletonBox
              width={100}
              height={14}
              testID={`${testID}-sender-name`}
            />
          )}

          {/* Message content */}
          <Box
            backgroundColor={isOwnMessage ? '$blue100' : '$gray100'}
            borderRadius="$lg"
            padding="$3"
          >
            <VStack space="xs">
              <SkeletonBox
                width="100%"
                height={16}
                testID={`${testID}-content-line-1`}
              />
              <SkeletonBox
                width="70%"
                height={16}
                testID={`${testID}-content-line-2`}
              />
            </VStack>
          </Box>

          {/* Timestamp placeholder */}
          <SkeletonBox
            width={60}
            height={12}
            testID={`${testID}-timestamp`}
          />
        </VStack>
      </HStack>
    </Box>
  );
};

export const MessageLoadingPlaceholder: React.FC<MessageLoadingPlaceholderProps> =
  ({ count = 3, testID = 'message-loading-placeholder' }) => {
    return (
      <Box padding="$4" testID={testID}>
        <VStack space="md">
          {Array.from({ length: count }).map((_, index) => (
            <MessagePlaceholder
              key={index}
              isOwnMessage={index % 2 === 0}
              testID={`${testID}-item-${index}`}
            />
          ))}
        </VStack>
      </Box>
    );
  };

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
});
```

---

### SendingMessageIndicator

```typescript
// src/features/Chat/components/SendingMessageIndicator.tsx

import React from 'react';
import { Box, HStack, Spinner, Text } from '@gluestack-ui/themed';

export interface SendingMessageIndicatorProps {
  message?: string;
  testID?: string;
}

export const SendingMessageIndicator: React.FC<SendingMessageIndicatorProps> =
  ({ message = 'Sending...', testID = 'sending-message-indicator' }) => {
    return (
      <Box
        paddingHorizontal="$4"
        paddingVertical="$2"
        testID={testID}
        accessibilityRole="alert"
        accessibilityLabel={message}
        accessibilityLiveRegion="polite"
      >
        <HStack space="sm" alignItems="center">
          <Spinner
            size="small"
            color="$blue600"
            testID={`${testID}-spinner`}
          />
          <Text
            fontSize="$sm"
            color="$gray600"
            testID={`${testID}-message`}
          >
            {message}
          </Text>
        </HStack>
      </Box>
    );
  };
```

---

### ErrorBanner Component

```typescript
// src/features/Chat/components/ErrorBanner.tsx

import React from 'react';
import {
  Box,
  HStack,
  Text,
  Pressable,
  AlertCircleIcon,
  CloseIcon,
} from '@gluestack-ui/themed';

export interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  testID?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onDismiss,
  onRetry,
  testID = 'error-banner',
}) => {
  return (
    <Box
      backgroundColor="$red50"
      borderLeftWidth={4}
      borderLeftColor="$red600"
      padding="$3"
      marginBottom="$2"
      testID={testID}
      accessibilityRole="alert"
      accessibilityLabel={`Error: ${message}`}
      accessibilityLiveRegion="assertive"
    >
      <HStack space="sm" alignItems="center" justifyContent="space-between">
        {/* Icon + Message */}
        <HStack space="sm" alignItems="center" flex={1}>
          <AlertCircleIcon
            size="md"
            color="$red600"
            testID={`${testID}-icon`}
          />
          <Text
            fontSize="$sm"
            color="$red900"
            flex={1}
            testID={`${testID}-message`}
          >
            {message}
          </Text>
        </HStack>

        {/* Action Buttons */}
        <HStack space="xs">
          {onRetry && (
            <Pressable
              onPress={onRetry}
              padding="$1"
              testID={`${testID}-retry-button`}
              accessibilityRole="button"
              accessibilityLabel="Retry"
              accessibilityHint="Tap to retry the failed operation"
            >
              <Text fontSize="$sm" fontWeight="$semibold" color="$red700">
                Retry
              </Text>
            </Pressable>
          )}

          {onDismiss && (
            <Pressable
              onPress={onDismiss}
              padding="$1"
              testID={`${testID}-dismiss-button`}
              accessibilityRole="button"
              accessibilityLabel="Dismiss error"
              accessibilityHint="Tap to close this error message"
            >
              <CloseIcon size="sm" color="$red700" />
            </Pressable>
          )}
        </HStack>
      </HStack>
    </Box>
  );
};
```

---

### Usage Example in ChatScreen

```typescript
// Example integration in ChatScreen

import { LoadingIndicator } from './LoadingIndicator';
import { MessageLoadingPlaceholder } from './MessageLoadingPlaceholder';
import { SendingMessageIndicator } from './SendingMessageIndicator';
import { ErrorBanner } from './ErrorBanner';

export const ChatScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial loading state
  if (isLoading && messages.length === 0) {
    return <LoadingIndicator message="Loading messages..." />;
  }

  return (
    <Box flex={1}>
      {/* Error banner */}
      {error && (
        <ErrorBanner
          message={error}
          onDismiss={() => setError(null)}
          onRetry={handleRetry}
        />
      )}

      {/* Message list */}
      <MessageList
        messages={messages}
        isLoadingMore={isLoadingMore}
        ListHeaderComponent={
          isLoadingMore ? <MessageLoadingPlaceholder count={3} /> : null
        }
      />

      {/* Sending indicator */}
      {isSending && <SendingMessageIndicator />}

      {/* Message input */}
      <MessageInput onSend={handleSend} />
    </Box>
  );
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/features/Chat/components/__tests__/LoadingStates.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LoadingIndicator } from '../LoadingIndicator';
import { MessageLoadingPlaceholder } from '../MessageLoadingPlaceholder';
import { SendingMessageIndicator } from '../SendingMessageIndicator';
import { ErrorBanner } from '../ErrorBanner';

describe('LoadingIndicator', () => {
  it('should render with default message', () => {
    const { getByText, getByTestId } = render(<LoadingIndicator />);

    expect(getByTestId('loading-indicator')).toBeTruthy();
    expect(getByText('Loading...')).toBeTruthy();
    expect(getByTestId('loading-indicator-spinner')).toBeTruthy();
  });

  it('should render with custom message', () => {
    const { getByText } = render(
      <LoadingIndicator message="Loading messages..." />
    );

    expect(getByText('Loading messages...')).toBeTruthy();
  });

  it('should render small size', () => {
    const { getByTestId } = render(<LoadingIndicator size="small" />);

    const spinner = getByTestId('loading-indicator-spinner');
    expect(spinner.props.size).toBe('small');
  });

  it('should have correct accessibility', () => {
    const { getByLabelText } = render(
      <LoadingIndicator message="Loading messages..." />
    );

    expect(getByLabelText('Loading')).toBeTruthy();
    expect(getByLabelText('Loading messages...')).toBeTruthy();
  });
});

describe('MessageLoadingPlaceholder', () => {
  it('should render with default count', () => {
    const { getAllByTestId } = render(<MessageLoadingPlaceholder />);

    const items = getAllByTestId(/message-loading-placeholder-item-/);
    expect(items).toHaveLength(3);
  });

  it('should render with custom count', () => {
    const { getAllByTestId } = render(<MessageLoadingPlaceholder count={5} />);

    const items = getAllByTestId(/message-loading-placeholder-item-/);
    expect(items).toHaveLength(5);
  });

  it('should alternate message sides', () => {
    const { getByTestId } = render(<MessageLoadingPlaceholder count={2} />);

    expect(getByTestId('message-loading-placeholder-item-0')).toBeTruthy();
    expect(getByTestId('message-loading-placeholder-item-1')).toBeTruthy();
  });

  it('should hide from accessibility', () => {
    const { getByTestId } = render(<MessageLoadingPlaceholder count={1} />);

    const skeleton = getByTestId('message-loading-placeholder-item-0-avatar');
    expect(skeleton.props.accessibilityElementsHidden).toBe(true);
  });
});

describe('SendingMessageIndicator', () => {
  it('should render with default message', () => {
    const { getByText, getByTestId } = render(<SendingMessageIndicator />);

    expect(getByTestId('sending-message-indicator')).toBeTruthy();
    expect(getByText('Sending...')).toBeTruthy();
  });

  it('should render with custom message', () => {
    const { getByText } = render(
      <SendingMessageIndicator message="Uploading image..." />
    );

    expect(getByText('Uploading image...')).toBeTruthy();
  });

  it('should have correct accessibility', () => {
    const { getByTestId } = render(<SendingMessageIndicator />);

    const indicator = getByTestId('sending-message-indicator');
    expect(indicator).toHaveProp('accessibilityRole', 'alert');
    expect(indicator).toHaveProp('accessibilityLiveRegion', 'polite');
  });
});

describe('ErrorBanner', () => {
  it('should render with error message', () => {
    const { getByText, getByTestId } = render(
      <ErrorBanner message="Failed to send message" />
    );

    expect(getByTestId('error-banner')).toBeTruthy();
    expect(getByText('Failed to send message')).toBeTruthy();
  });

  it('should call onDismiss when dismiss button pressed', () => {
    const mockOnDismiss = jest.fn();

    const { getByTestId } = render(
      <ErrorBanner message="Error" onDismiss={mockOnDismiss} />
    );

    fireEvent.press(getByTestId('error-banner-dismiss-button'));

    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('should call onRetry when retry button pressed', () => {
    const mockOnRetry = jest.fn();

    const { getByTestId } = render(
      <ErrorBanner message="Error" onRetry={mockOnRetry} />
    );

    fireEvent.press(getByTestId('error-banner-retry-button'));

    expect(mockOnRetry).toHaveBeenCalled();
  });

  it('should show retry button when onRetry provided', () => {
    const { getByText } = render(
      <ErrorBanner message="Error" onRetry={jest.fn()} />
    );

    expect(getByText('Retry')).toBeTruthy();
  });

  it('should not show retry button when onRetry not provided', () => {
    const { queryByText } = render(<ErrorBanner message="Error" />);

    expect(queryByText('Retry')).toBeNull();
  });

  it('should have correct accessibility', () => {
    const { getByTestId } = render(<ErrorBanner message="Failed to send" />);

    const banner = getByTestId('error-banner');
    expect(banner).toHaveProp('accessibilityRole', 'alert');
    expect(banner).toHaveProp('accessibilityLiveRegion', 'assertive');
    expect(banner).toHaveProp('accessibilityLabel', 'Error: Failed to send');
  });

  it('should have accessible retry button', () => {
    const { getByTestId } = render(
      <ErrorBanner message="Error" onRetry={jest.fn()} />
    );

    const retryButton = getByTestId('error-banner-retry-button');
    expect(retryButton).toHaveProp('accessibilityRole', 'button');
    expect(retryButton).toHaveProp('accessibilityLabel', 'Retry');
  });

  it('should have accessible dismiss button', () => {
    const { getByTestId } = render(
      <ErrorBanner message="Error" onDismiss={jest.fn()} />
    );

    const dismissButton = getByTestId('error-banner-dismiss-button');
    expect(dismissButton).toHaveProp('accessibilityRole', 'button');
    expect(dismissButton).toHaveProp('accessibilityLabel', 'Dismiss error');
  });
});
```

---

## Dependencies

- GlueStack UI
- React Native (Animated API)

---

## Definition of Done

- [ ] LoadingIndicator component implemented
- [ ] MessageLoadingPlaceholder component implemented
- [ ] SendingMessageIndicator component implemented
- [ ] ErrorBanner component implemented
- [ ] All animations working
- [ ] All unit tests passing
- [ ] EAA compliance verified
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-047](../stories/US-047-message-history-pagination.md), [TASK-262](TASK-262-chatscreen-ui.md), [TASK-269](TASK-269-message-list.md)
