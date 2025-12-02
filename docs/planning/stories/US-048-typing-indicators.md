# US-048: Typing Indicators and Read Receipts

**ID**: US-048 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **Title**: Real-Time Typing Indicators and Read Receipts
**Status**: 📋 To Do | **Priority**: Medium | **Story Points**: 3 | **Effort**: 7h

---

## User Story

**As a** registered user
**I want to** see when the admin is typing and know when my messages are read
**So that** I have a better sense of real-time communication and message delivery status

---

## Acceptance Criteria

### Functional Requirements

1. **Typing Indicator (Admin → User)**
   - [ ] When admin starts typing: User sees "Admin is typing..." below message list
   - [ ] Indicator appears with animated dots (3 dots bouncing)
   - [ ] Indicator disappears when admin stops typing (after 3 seconds of inactivity)
   - [ ] Indicator updates in real-time via Supabase Realtime

2. **Typing Indicator (User → Admin)**
   - [ ] When user types: Send typing status to Supabase
   - [ ] Debounced updates (max once per second)
   - [ ] Automatically clear typing status after 3 seconds of inactivity
   - [ ] Stop sending typing status when message is sent

3. **Read Receipts**
   - [ ] User messages show read status with checkmarks:
     - Single gray checkmark: Sent
     - Double gray checkmarks: Delivered
     - Double blue checkmarks: Read by admin
   - [ ] Messages marked as read when admin opens conversation
   - [ ] Read status updates in real-time

4. **Performance**
   - [ ] Typing indicator updates smoothly (no lag)
   - [ ] Debounced typing events (max 1 update/second)
   - [ ] Minimal network overhead

### Non-Functional Requirements

1. **Performance**
   - [ ] Typing indicator animation: 60 FPS
   - [ ] Typing status update: <100ms
   - [ ] Read receipt update: <500ms

2. **Accessibility (EAA)**
   - [ ] Typing indicator has `accessibilityLabel="Admin is typing"`
   - [ ] Read receipts have `accessibilityLabel="Message read"`
   - [ ] Checkmarks visible with 3:1 contrast ratio

3. **Testing**
   - [ ] 100% RNTL coverage for typing indicator
   - [ ] E2E test for typing indicator flow
   - [ ] Manual testing for real-time updates

---

## Technical Implementation

### Component Structure

```typescript
// src/features/Chat/screens/ChatScreen.tsx (enhanced)

ChatScreen
├── Header
├── MessageList
│   └── MessageBubble (with read receipts)
├── TypingIndicator ("Admin is typing...")
└── MessageInput (triggers typing status)
```

### Data Flow

**Typing Indicator**:

```
User types in message input
  → Debounced typing status update (max 1/second)
  → Update Supabase typing_indicators table
  → Broadcast typing status via Supabase Realtime
  → Admin sees "User is typing..."
  → After 3 seconds of no input:
    → Clear typing status
    → Broadcast stop typing
```

**Read Receipts**:

```
User sends message
  → Message inserted with read_at = null
  → Admin opens conversation
  → Mark all unread messages as read (update read_at)
  → Broadcast read status via Supabase Realtime
  → User's messages update to double blue checkmarks
```

### Supabase Schema (Typing Indicators)

```sql
-- Typing indicators table (ephemeral, cleared periodically)
CREATE TABLE typing_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  is_typing BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_typing_indicators_conversation_id ON typing_indicators(conversation_id);

-- Auto-delete old typing indicators (cleanup job)
CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM typing_indicators
  WHERE updated_at < NOW() - INTERVAL '10 seconds';
END;
$$ LANGUAGE plpgsql;
```

### Typing Indicator Supabase Realtime

```typescript
// src/features/Chat/services/typingIndicatorService.ts

import { createClient } from '@supabase/supabase-js';
import Config from 'react-native-config';
import { debounce } from 'lodash';

const supabase = createClient(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY);

export const subscribeToTypingIndicator = (
  conversationId: string,
  currentUserId: string,
  onTypingChange: (isTyping: boolean) => void
) => {
  const subscription = supabase
    .channel(`typing:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'typing_indicators',
        filter: `conversation_id=eq.${conversationId}`,
      },
      payload => {
        const data = payload.new as any;

        // Ignore own typing status
        if (data.user_id === currentUserId) return;

        onTypingChange(data.is_typing || false);
      }
    )
    .subscribe();

  return subscription;
};

export const updateTypingStatus = debounce(
  async (conversationId: string, userId: string, isTyping: boolean) => {
    try {
      await supabase.from('typing_indicators').upsert(
        {
          conversation_id: conversationId,
          user_id: userId,
          is_typing: isTyping,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'conversation_id,user_id',
        }
      );
    } catch (error) {
      console.error('Failed to update typing status:', error);
    }
  },
  1000 // Max 1 update per second
);

export const clearTypingStatus = async (conversationId: string, userId: string) => {
  await updateTypingStatus(conversationId, userId, false);
};
```

### TypingIndicator Component

```typescript
// src/features/Chat/components/TypingIndicator.tsx

import React, { useEffect, useRef } from 'react';
import { Animated, View, Text } from 'react-native';
import { Box, HStack } from '@gluestack-ui/themed';

interface TypingIndicatorProps {
  isTyping: boolean;
  senderName?: string;
  testID?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isTyping,
  senderName = 'Admin',
  testID = 'typing-indicator',
}) => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }, [isTyping]);

  const startAnimation = () => {
    const animate = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -10,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      animate(dot1Anim, 0),
      animate(dot2Anim, 200),
      animate(dot3Anim, 400),
    ]).start();
  };

  const stopAnimation = () => {
    dot1Anim.setValue(0);
    dot2Anim.setValue(0);
    dot3Anim.setValue(0);
  };

  if (!isTyping) return null;

  return (
    <Box
      paddingHorizontal="$4"
      paddingVertical="$2"
      testID={testID}
      accessibilityLabel={`${senderName} is typing`}
      accessibilityLiveRegion="polite"
    >
      <HStack space="xs" alignItems="center">
        <Text style={{ fontSize: 14, color: '#6B7280' }}>
          {senderName} is typing
        </Text>

        <HStack space="xs">
          <Animated.View style={{ transform: [{ translateY: dot1Anim }] }}>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#6B7280',
              }}
            />
          </Animated.View>

          <Animated.View style={{ transform: [{ translateY: dot2Anim }] }}>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#6B7280',
              }}
            />
          </Animated.View>

          <Animated.View style={{ transform: [{ translateY: dot3Anim }] }}>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#6B7280',
              }}
            />
          </Animated.View>
        </HStack>
      </HStack>
    </Box>
  );
};
```

### Read Receipt Component

```typescript
// src/features/Chat/components/ReadReceipt.tsx

import React from 'react';
import { Text } from 'react-native';

interface ReadReceiptProps {
  status: 'sent' | 'delivered' | 'read';
  testID?: string;
}

export const ReadReceipt: React.FC<ReadReceiptProps> = ({
  status,
  testID = 'read-receipt',
}) => {
  const getIcon = () => {
    if (status === 'sent') {
      return '✓'; // Single gray checkmark
    } else if (status === 'delivered') {
      return '✓✓'; // Double gray checkmarks
    } else {
      return '✓✓'; // Double blue checkmarks (color via style)
    }
  };

  const getColor = () => {
    if (status === 'read') {
      return '#3B82F6'; // Blue
    } else {
      return '#9CA3AF'; // Gray
    }
  };

  return (
    <Text
      style={{
        fontSize: 12,
        color: getColor(),
        marginLeft: 4,
      }}
      testID={testID}
      accessibilityLabel={`Message ${status}`}
    >
      {getIcon()}
    </Text>
  );
};
```

### Mark Messages as Read

```typescript
// src/features/Chat/api/readReceipts.ts

import axios from 'axios';
import Config from 'react-native-config';
import { getAccessToken } from '@/services/storage/keychainService';

export const markMessagesAsRead = async (conversationId: string): Promise<void> => {
  try {
    const accessToken = await getAccessToken();

    await axios.patch(
      `${Config.SUPABASE_URL}/rest/v1/messages?conversation_id=eq.${conversationId}&read_at=is.null`,
      {
        read_at: new Date().toISOString(),
      },
      {
        headers: {
          apikey: Config.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
  }
};
```

---

## Tasks Breakdown

| Task ID  | Description                 | Effort |
| -------- | --------------------------- | ------ |
| TASK-273 | TypingIndicator Component   | 2h     |
| TASK-274 | Typing Status Service       | 1.5h   |
| TASK-275 | ReadReceipt Component       | 1h     |
| TASK-276 | Mark Messages as Read API   | 1h     |
| TASK-277 | Typing Indicator RNTL Tests | 1.5h   |

**Total**: 5 tasks, 7 hours

---

## Testing Strategy

### Unit Tests (RNTL)

**File**: `src/features/Chat/components/__tests__/TypingIndicator.rntl.tsx`

```typescript
describe('TypingIndicator', () => {
  it('should render when isTyping is true', () => {
    const { getByTestID } = render(<TypingIndicator isTyping={true} senderName="Admin" />);

    expect(getByTestId('typing-indicator')).toHaveTextContent('Admin is typing');
  });

  it('should not render when isTyping is false', () => {
    const { queryByTestId } = render(<TypingIndicator isTyping={false} />);

    expect(queryByTestId('typing-indicator')).toBeNull();
  });

  it('should animate dots when typing', () => {
    const { getByTestId } = render(<TypingIndicator isTyping={true} />);

    // Verify animated dots are rendered (implementation detail)
    expect(getByTestId('typing-indicator')).toBeTruthy();
  });
});

describe('ReadReceipt', () => {
  it('should show single checkmark for sent', () => {
    const { getByTestId } = render(<ReadReceipt status="sent" />);

    expect(getByTestId('read-receipt')).toHaveTextContent('✓');
  });

  it('should show double checkmarks for delivered', () => {
    const { getByTestId } = render(<ReadReceipt status="delivered" />);

    expect(getByTestId('read-receipt')).toHaveTextContent('✓✓');
  });

  it('should show blue checkmarks for read', () => {
    const { getByTestId } = render(<ReadReceipt status="read" />);

    expect(getByTestId('read-receipt')).toHaveStyle({ color: '#3B82F6' });
  });
});
```

### E2E Tests (Detox + Cucumber)

**File**: `src/features/Chat/__tests__/TypingIndicators.feature`

```gherkin
Feature: Typing Indicators and Read Receipts

  Background:
    Given I am logged in
    And I am on the Chat screen

  Scenario: See admin typing
    When the admin starts typing
    Then I should see "Admin is typing..."
    And the typing indicator should have animated dots

  Scenario: Typing indicator disappears
    Given the admin is typing
    When the admin stops typing for 3 seconds
    Then the typing indicator should disappear

  Scenario: Read receipts
    When I send a message
    Then the message should show a single checkmark (sent)
    When the message is delivered to the server
    Then the message should show double gray checkmarks (delivered)
    When the admin reads the message
    Then the message should show double blue checkmarks (read)
```

---

## Dependencies

**Upstream**:

- US-046: Send and Receive Messages (chat functionality exists)

**Downstream**:

- None (Typing indicators are enhancement)

---

## Risks & Mitigation

| Risk                       | Probability | Impact | Mitigation                                     |
| -------------------------- | ----------- | ------ | ---------------------------------------------- |
| Typing indicator lag       | Low         | Low    | Debounce updates (1/second), optimize Realtime |
| Read receipt confusion     | Low         | Medium | Clear visual design, match WhatsApp pattern    |
| Realtime connection issues | Medium      | Low    | Graceful degradation, show last known status   |

---

## Definition of Done

**Functional**:

- [ ] All acceptance criteria met
- [ ] All 5 tasks complete
- [ ] Typing indicators working on iOS + Android

**Quality**:

- [ ] 100% RNTL coverage
- [ ] All E2E tests passing
- [ ] `yarn validate` passes

**Performance**:

- [ ] Typing indicator smooth (60 FPS)
- [ ] Minimal network overhead

**Accessibility**:

- [ ] All EAA requirements met
- [ ] Screen reader tested

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-025](../epics/EPIC-025-chat.md), [US-046](US-046-send-receive-messages.md)
