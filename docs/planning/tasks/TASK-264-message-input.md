# TASK-264: MessageInput Component

**ID**: TASK-264 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-046](../stories/US-046-send-receive-messages.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## File Structure

```
src/features/Chat/
└── components/
    ├── MessageInput.tsx
    └── __tests__/
        └── MessageInput.test.tsx
```

**Note**: MessageInput is a Chat-specific component, co-located with the Chat feature.

---

## Task Description

Create a MessageInput component with text input, send button, and attachment button (future). Auto-expand text input, disable send when empty, and handle keyboard submission.

---

## Acceptance Criteria

- [ ] MessageInput component created in `src/features/Chat/components/MessageInput.tsx`
- [ ] Multi-line text input with auto-expand
- [ ] Send button (disabled when empty)
- [ ] Keyboard submit support (Enter key)
- [ ] Character limit indicator (optional)
- [ ] Attachment button placeholder (future enhancement)
- [ ] All EAA accessibility requirements met
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### MessageInput Component

```typescript
// src/features/Chat/components/MessageInput.tsx

import React, { useState, useRef } from 'react';
import { TextInput, Platform } from 'react-native';
import {
  Box,
  HStack,
  Input,
  InputField,
  Button,
  ButtonIcon,
  SendIcon,
  PaperclipIcon,
} from '@gluestack-ui/themed';

export interface MessageInputProps {
  onSend: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  testID?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  placeholder = 'Type a message...',
  maxLength = 2000,
  disabled = false,
  testID = 'message-input',
}) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const trimmedText = text.trim();
  const canSend = trimmedText.length > 0 && !isSending && !disabled;

  const handleSend = async () => {
    if (!canSend) return;

    setIsSending(true);

    try {
      await onSend(trimmedText);
      setText(''); // Clear input after sending
      inputRef.current?.focus(); // Keep focus on input
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmitEditing = () => {
    if (Platform.OS === 'ios') {
      // On iOS, Enter key should submit
      handleSend();
    }
  };

  return (
    <Box
      backgroundColor="$white"
      borderTopWidth={1}
      borderTopColor="$gray200"
      paddingHorizontal="$4"
      paddingVertical="$2"
      testID={testID}
    >
      <HStack space="sm" alignItems="flex-end">
        {/* Attachment Button (Future Enhancement) */}
        <Button
          size="md"
          variant="ghost"
          isDisabled={disabled}
          testID="attachment-button"
          accessibilityRole="button"
          accessibilityLabel="Attach file"
          accessibilityHint="Add an image or file to your message"
          onPress={() => {
            // Future: Open attachment picker
            console.log('Attachment feature coming soon');
          }}
        >
          <ButtonIcon as={PaperclipIcon} color="$gray500" />
        </Button>

        {/* Text Input */}
        <Input
          flex={1}
          variant="outline"
          size="md"
          isDisabled={disabled}
          testID="message-text-input"
        >
          <InputField
            ref={inputRef}
            placeholder={placeholder}
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleSubmitEditing}
            multiline
            maxLength={maxLength}
            blurOnSubmit={false}
            returnKeyType={Platform.OS === 'ios' ? 'send' : 'default'}
            accessibilityLabel="Message input"
            accessibilityHint="Type your message here"
            style={{
              minHeight: 40,
              maxHeight: 120,
              paddingTop: Platform.OS === 'ios' ? 10 : 8,
              paddingBottom: Platform.OS === 'ios' ? 10 : 8,
            }}
          />
        </Input>

        {/* Send Button */}
        <Button
          size="md"
          backgroundColor="$blue600"
          isDisabled={!canSend}
          onPress={handleSend}
          testID="send-button"
          accessibilityRole="button"
          accessibilityLabel="Send message"
          accessibilityHint="Send the message you typed"
          accessibilityState={{ disabled: !canSend }}
          style={{
            minWidth: 44,
            minHeight: 44,
          }}
        >
          <ButtonIcon
            as={SendIcon}
            color="$white"
            testID="send-icon"
          />
        </Button>
      </HStack>

      {/* Character Counter (Optional) */}
      {text.length > maxLength * 0.9 && (
        <Box paddingTop="$1" alignItems="flex-end">
          <Text fontSize="$xs" color={text.length >= maxLength ? '$red600' : '$gray500'}>
            {text.length}/{maxLength}
          </Text>
        </Box>
      )}
    </Box>
  );
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/features/Chat/components/__tests__/MessageInput.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MessageInput } from '../MessageInput';

describe('MessageInput', () => {
  const mockOnSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all elements', () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      expect(getByTestId('message-input')).toBeTruthy();
      expect(getByTestId('message-text-input')).toBeTruthy();
      expect(getByTestId('send-button')).toBeTruthy();
      expect(getByTestId('attachment-button')).toBeTruthy();
    });

    it('should render with custom placeholder', () => {
      const { getByPlaceholderText } = render(
        <MessageInput onSend={mockOnSend} placeholder="Custom placeholder..." />
      );

      expect(getByPlaceholderText('Custom placeholder...')).toBeTruthy();
    });
  });

  describe('Send Button State', () => {
    it('should disable send button when input is empty', () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      expect(getByTestId('send-button')).toBeDisabled();
    });

    it('should enable send button when input has text', async () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      fireEvent.changeText(getByTestId('message-text-input'), 'Hello');

      await waitFor(() => {
        expect(getByTestId('send-button')).toBeEnabled();
      });
    });

    it('should disable send button for whitespace-only text', () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      fireEvent.changeText(getByTestId('message-text-input'), '   ');

      expect(getByTestId('send-button')).toBeDisabled();
    });

    it('should disable send button when disabled prop is true', () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} disabled={true} />);

      fireEvent.changeText(getByTestId('message-text-input'), 'Hello');

      expect(getByTestId('send-button')).toBeDisabled();
    });
  });

  describe('Sending Messages', () => {
    it('should call onSend with trimmed text', async () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      fireEvent.changeText(getByTestId('message-text-input'), '  Hello  ');
      fireEvent.press(getByTestId('send-button'));

      await waitFor(() => {
        expect(mockOnSend).toHaveBeenCalledWith('Hello');
      });
    });

    it('should clear input after sending', async () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      fireEvent.changeText(getByTestId('message-text-input'), 'Hello');
      fireEvent.press(getByTestId('send-button'));

      await waitFor(() => {
        const input = getByTestId('message-text-input');
        expect(input.props.value).toBe('');
      });
    });

    it('should not call onSend when text is empty', async () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      fireEvent.press(getByTestId('send-button'));

      await waitFor(() => {
        expect(mockOnSend).not.toHaveBeenCalled();
      });
    });

    it('should handle send errors gracefully', async () => {
      const mockError = new Error('Send failed');
      mockOnSend.mockRejectedValue(mockError);

      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      fireEvent.changeText(getByTestId('message-text-input'), 'Hello');
      fireEvent.press(getByTestId('send-button'));

      await waitFor(() => {
        // Should not throw error
        expect(mockOnSend).toHaveBeenCalled();
      });
    });

    it('should disable send button while sending', async () => {
      let resolveSend: () => void;
      const sendPromise = new Promise<void>((resolve) => {
        resolveSend = resolve;
      });

      mockOnSend.mockReturnValue(sendPromise);

      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      fireEvent.changeText(getByTestId('message-text-input'), 'Hello');
      fireEvent.press(getByTestId('send-button'));

      await waitFor(() => {
        expect(getByTestId('send-button')).toBeDisabled();
      });

      resolveSend!();
    });
  });

  describe('Keyboard Submit', () => {
    it('should send message on iOS when Enter is pressed', async () => {
      jest.mock('react-native/Libraries/Utilities/Platform', () => ({
        OS: 'ios',
        select: jest.fn(),
      }));

      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      fireEvent.changeText(getByTestId('message-text-input'), 'Hello');
      fireEvent(getByTestId('message-text-input'), 'submitEditing');

      await waitFor(() => {
        expect(mockOnSend).toHaveBeenCalledWith('Hello');
      });
    });
  });

  describe('Character Limit', () => {
    it('should respect maxLength prop', () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} maxLength={100} />);

      const longText = 'A'.repeat(150);
      fireEvent.changeText(getByTestId('message-text-input'), longText);

      const input = getByTestId('message-text-input');
      expect(input.props.maxLength).toBe(100);
    });

    it('should show character counter near limit', () => {
      const { getByTestId, getByText } = render(
        <MessageInput onSend={mockOnSend} maxLength={100} />
      );

      // Type 91 characters (90% of 100)
      fireEvent.changeText(getByTestId('message-text-input'), 'A'.repeat(91));

      expect(getByText('91/100')).toBeTruthy();
    });

    it('should not show character counter below threshold', () => {
      const { getByTestId, queryByText } = render(
        <MessageInput onSend={mockOnSend} maxLength={100} />
      );

      // Type 50 characters (50% of 100)
      fireEvent.changeText(getByTestId('message-text-input'), 'A'.repeat(50));

      expect(queryByText('50/100')).toBeNull();
    });

    it('should show red counter when at max length', () => {
      const { getByTestId, getByText } = render(
        <MessageInput onSend={mockOnSend} maxLength={100} />
      );

      fireEvent.changeText(getByTestId('message-text-input'), 'A'.repeat(100));

      const counter = getByText('100/100');
      expect(counter.props.color).toBe('$red600');
    });
  });

  describe('Attachment Button', () => {
    it('should render attachment button', () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      expect(getByTestId('attachment-button')).toBeTruthy();
    });

    it('should disable attachment button when disabled prop is true', () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} disabled={true} />);

      expect(getByTestId('attachment-button')).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility roles', () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      expect(getByTestId('send-button')).toHaveProp('accessibilityRole', 'button');
      expect(getByTestId('attachment-button')).toHaveProp('accessibilityRole', 'button');
    });

    it('should have correct accessibility labels', () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      expect(getByTestId('send-button')).toHaveProp('accessibilityLabel', 'Send message');
      expect(getByTestId('attachment-button')).toHaveProp('accessibilityLabel', 'Attach file');
    });

    it('should have correct accessibility hints', () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      expect(getByTestId('send-button')).toHaveProp(
        'accessibilityHint',
        'Send the message you typed'
      );
    });

    it('should update accessibility state when button disabled', () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      // Initially disabled (empty text)
      expect(getByTestId('send-button')).toHaveProp('accessibilityState', {
        disabled: true,
      });

      // Enabled after typing
      fireEvent.changeText(getByTestId('message-text-input'), 'Hello');

      expect(getByTestId('send-button')).toHaveProp('accessibilityState', {
        disabled: false,
      });
    });

    it('should have minimum touch target size', () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      const button = getByTestId('send-button');
      expect(button.props.style.minWidth).toBe(44);
      expect(button.props.style.minHeight).toBe(44);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid button presses', async () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      fireEvent.changeText(getByTestId('message-text-input'), 'Hello');

      // Press button multiple times rapidly
      fireEvent.press(getByTestId('send-button'));
      fireEvent.press(getByTestId('send-button'));
      fireEvent.press(getByTestId('send-button'));

      await waitFor(() => {
        // Should only call onSend once
        expect(mockOnSend).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle very long messages', () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} maxLength={2000} />);

      const longText = 'A'.repeat(2000);
      fireEvent.changeText(getByTestId('message-text-input'), longText);
      fireEvent.press(getByTestId('send-button'));

      expect(mockOnSend).toHaveBeenCalledWith(longText);
    });

    it('should handle newlines in text', () => {
      const { getByTestId } = render(<MessageInput onSend={mockOnSend} />);

      const textWithNewlines = 'Line 1\nLine 2\nLine 3';
      fireEvent.changeText(getByTestId('message-text-input'), textWithNewlines);
      fireEvent.press(getByTestId('send-button'));

      expect(mockOnSend).toHaveBeenCalledWith(textWithNewlines);
    });
  });
});
```

---

## Dependencies

- GlueStack UI
- React Native

---

## Definition of Done

- [ ] Component implemented and renders correctly
- [ ] Text input with auto-expand working
- [ ] Send button states working
- [ ] Keyboard submit working (iOS)
- [ ] Character limit indicator working
- [ ] All unit tests passing
- [ ] EAA compliance verified
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-046](../stories/US-046-send-receive-messages.md), [TASK-262](TASK-262-chatscreen-ui.md), [TASK-263](TASK-263-message-bubble.md)
