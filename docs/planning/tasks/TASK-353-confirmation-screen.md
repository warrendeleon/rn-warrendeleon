# TASK-353: Booking Confirmation Screen

**Epic**: EPIC-031: Book a Call
**User Story**: US-064: Booking Confirmation & Navigation
**Status**: 📋 To Do
**Effort**: 3h
**Priority**: P0 (Critical Path)
**Assigned To**: Warren
**Created**: 2025-11-26

---

## Overview

Create the booking confirmation screen that displays after successful booking. The screen shows a success animation, booking summary, meeting details (Google Meet link for video calls, phone message for phone calls), and actions ("Add to Calendar", "Done"). Must follow iOS-native design patterns and support both video and phone call confirmations.

---

## Requirements

### Functional Requirements

**Success Animation**:

- iOS-style checkmark animation on mount (scale + fade in)
- Green circle with white checkmark icon
- 500ms animation duration
- Uses GlueStack `$green500` token

**Booking Summary Display**:

- Title: "Booking Confirmed!"
- Subtitle: Confirmation message based on call type
- Date/time display with timezone
- Duration display
- Call type badge (Video/Phone)

**Video Call Details** (when type = "video"):

- Google Meet link display
- Copyable link button (copies to clipboard)
- "Join Meeting" primary action button
- Toast feedback on copy

**Phone Call Details** (when type = "phone"):

- Message: "Warren will call you at [user's phone number]"
- Alternative: "Call Warren" button with tel:// link
- Phone number formatted with international code

**Actions**:

- "Add to Calendar" button (triggers iCal download)
- "Done" button (navigates to Home)

**EAA Compliance**:

- All interactive elements have `accessibilityRole`, `accessibilityLabel`, `accessibilityHint`
- Minimum touch targets: `minHeight="$12"` (48pt)
- Success state announced to screen readers
- High contrast for all text (4.5:1 minimum)

### Non-Functional Requirements

**Performance**:

- Screen renders in <100ms
- Animation runs at 60fps
- No layout shifts during animation

**Accessibility**:

- Screen reader announces confirmation immediately
- Focus management (focus "Done" button after animation)
- Keyboard navigation support

**Error Handling**:

- Handle missing booking data (redirect to Home)
- Clipboard API errors (show fallback message)
- Calendar export errors (show error toast)

**Testing**:

- 100% RNTL coverage
- Storybook stories for all variants
- Snapshot tests for both call types
- Interaction tests (copy link, navigation)

---

## Design Specifications

### iOS-Native Design

**Colours** (GlueStack tokens):

- Success green: `$green500`
- Primary blue: `$blue500`
- Background: `$backgroundLight0` (light mode), `$backgroundDark0` (dark mode)
- Text primary: `$textLight950`, `$textDark50`
- Text secondary: `$textLight700`, `$textDark400`

**Typography** (GlueStack tokens):

- Title: `$2xl` (24pt), `$bold`
- Subtitle: `$lg` (18pt), `$normal`
- Body text: `$md` (16pt), `$normal`
- Caption: `$sm` (14pt), `$normal`

**Spacing** (GlueStack tokens):

- Screen padding: `$6` (24pt)
- Section gaps: `$8` (32pt)
- Component gaps: `$4` (16pt)
- Button gaps: `$3` (12pt)

**Animation**:

- Success checkmark: scale 0 → 1, opacity 0 → 1, 500ms ease-out
- Stagger: icon animates first, then text fades in (200ms delay)

### ASCII Mockups

**Video Call Confirmation**:

```
┌─────────────────────────────────────┐
│  [X]                                │  Header with close button
├─────────────────────────────────────┤
│                                     │
│         ┌───────────┐               │
│         │    ✓      │               │  Success animation
│         │ (green)   │               │  Checkmark in circle
│         └───────────┘               │
│                                     │
│     Booking Confirmed! 🎉          │  Title ($2xl, $bold)
│                                     │
│  Your video call is scheduled       │  Subtitle ($lg)
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📅 Wed, 27 Nov 2024        │   │  Date/time card
│  │  🕐 14:00 - 14:30 GMT       │   │
│  │  ⏱️  30 minutes              │   │
│  │  📹 Video Call               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Join with Google Meet:             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ meet.google.com/abc-defg... │   │  Copyable link
│  │                     [Copy]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Join Meeting           │   │  Primary CTA ($blue500)
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    📥 Add to Calendar       │   │  Secondary action
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │          Done               │   │  Tertiary action
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Phone Call Confirmation**:

```
┌─────────────────────────────────────┐
│  [X]                                │  Header with close button
├─────────────────────────────────────┤
│                                     │
│         ┌───────────┐               │
│         │    ✓      │               │  Success animation
│         │ (green)   │               │  Checkmark in circle
│         └───────────┘               │
│                                     │
│     Booking Confirmed! 🎉          │  Title ($2xl, $bold)
│                                     │
│  Your phone call is scheduled       │  Subtitle ($lg)
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📅 Wed, 27 Nov 2024        │   │  Date/time card
│  │  🕐 14:00 - 14:30 GMT       │   │
│  │  ⏱️  30 minutes              │   │
│  │  📞 Phone Call               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Warren will call you at:           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      +44 7700 900123        │   │  User's phone number
│  └─────────────────────────────┘   │
│                                     │
│  Or call Warren directly:           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │       📞 Call Warren        │   │  tel:// link ($blue500)
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    📥 Add to Calendar       │   │  Secondary action
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │          Done               │   │  Tertiary action
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Technical Implementation

### Component Structure

```
BookingConfirmationScreen/
├── BookingConfirmationScreen.tsx       # Main screen component
├── BookingConfirmationScreen.test.tsx  # RNTL tests
├── BookingConfirmationScreen.stories.tsx # Storybook stories
├── components/
│   ├── SuccessAnimation.tsx            # Checkmark animation component
│   ├── SuccessAnimation.test.tsx
│   ├── BookingSummaryCard.tsx          # Date/time/duration card
│   ├── BookingSummaryCard.test.tsx
│   ├── VideoCallDetails.tsx            # Google Meet link + actions
│   ├── VideoCallDetails.test.tsx
│   ├── PhoneCallDetails.tsx            # Phone number + call action
│   └── PhoneCallDetails.test.tsx
├── hooks/
│   ├── useClipboard.ts                 # Clipboard API hook
│   └── useClipboard.test.ts
└── index.ts
```

### Route Parameters

```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  // ... existing routes
  BookingConfirmation: {
    booking: {
      id: string;
      date: string; // ISO 8601
      startTime: string; // ISO 8601
      endTime: string; // ISO 8601
      duration: number; // minutes
      callType: 'video' | 'phone';
      meetingUrl?: string; // Google Meet link (video only)
      userPhone?: string; // User's phone number (phone only)
      timezone: string; // IANA timezone
    };
  };
};
```

### Navigation Flow

```
BookingDetailsScreen
  │
  └─> [Confirm Booking] pressed
        │
        └─> API call to /book-call
              │
              ├─> Success
              │     └─> navigate('BookingConfirmation', { booking })
              │           │
              │           └─> BookingConfirmationScreen renders
              │                 │
              │                 ├─> [Add to Calendar] → downloads ICS
              │                 ├─> [Join Meeting] → opens Google Meet
              │                 ├─> [Call Warren] → opens tel:// link
              │                 └─> [Done] → CommonActions.reset to [Home]
              │
              └─> Error
                    └─> Show error toast, stay on BookingDetailsScreen
```

### Code Example: BookingConfirmationScreen.tsx

```typescript
import React, { useEffect } from 'react';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Box,
  VStack,
  Text,
  Button,
  ButtonText,
  ScrollView,
  Pressable,
  Toast,
  ToastTitle,
  useToast,
} from '@gluestack-ui/themed';
import { Linking } from 'react-native';
import type { RootStackParamList } from '@app/navigation/types';
import { SuccessAnimation } from './components/SuccessAnimation';
import { BookingSummaryCard } from './components/BookingSummaryCard';
import { VideoCallDetails } from './components/VideoCallDetails';
import { PhoneCallDetails } from './components/PhoneCallDetails';
import { useClipboard } from './hooks/useClipboard';
import { generateICalFile } from '@app/utils/ical';

type BookingConfirmationScreenRouteProp = RouteProp<RootStackParamList, 'BookingConfirmation'>;
type BookingConfirmationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BookingConfirmation'
>;

export const BookingConfirmationScreen: React.FC = () => {
  const route = useRoute<BookingConfirmationScreenRouteProp>();
  const navigation = useNavigation<BookingConfirmationScreenNavigationProp>();
  const toast = useToast();
  const { copyToClipboard } = useClipboard();

  const { booking } = route.params;

  // Redirect to Home if no booking data
  useEffect(() => {
    if (!booking) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })
      );
    }
  }, [booking, navigation]);

  const handleDone = () => {
    // Reset navigation stack to [Home]
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
  };

  const handleAddToCalendar = async () => {
    try {
      const icsContent = generateICalFile(booking);
      // Trigger download/share (implementation in TASK-354)
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="success">
            <ToastTitle>Added to calendar</ToastTitle>
          </Toast>
        ),
      });
    } catch (error) {
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error">
            <ToastTitle>Failed to add to calendar</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  const handleCopyMeetingLink = async () => {
    if (!booking.meetingUrl) return;

    const success = await copyToClipboard(booking.meetingUrl);
    if (success) {
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="success">
            <ToastTitle>Link copied to clipboard</ToastTitle>
          </Toast>
        ),
      });
    } else {
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error">
            <ToastTitle>Failed to copy link</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  const handleJoinMeeting = async () => {
    if (!booking.meetingUrl) return;

    const supported = await Linking.canOpenURL(booking.meetingUrl);
    if (supported) {
      await Linking.openURL(booking.meetingUrl);
    } else {
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error">
            <ToastTitle>Cannot open meeting link</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  const handleCallWarren = async () => {
    const phoneNumber = 'tel:+447700900000'; // Warren's phone number
    const supported = await Linking.canOpenURL(phoneNumber);
    if (supported) {
      await Linking.openURL(phoneNumber);
    } else {
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error">
            <ToastTitle>Cannot open phone dialer</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  if (!booking) return null;

  return (
    <ScrollView
      bg="$backgroundLight0"
      _dark={{ bg: '$backgroundDark0' }}
      testID="booking-confirmation-screen"
      accessibilityLabel="Booking confirmation screen"
      accessibilityRole="main"
    >
      <VStack space="$8" p="$6">
        {/* Success Animation */}
        <SuccessAnimation testID="success-animation" />

        {/* Title */}
        <VStack space="$2" alignItems="center">
          <Text
            fontSize="$2xl"
            fontWeight="$bold"
            color="$textLight950"
            _dark={{ color: '$textDark50' }}
            textAlign="center"
            testID="confirmation-title"
            accessibilityRole="header"
            accessibilityLabel="Booking confirmed"
          >
            Booking Confirmed! 🎉
          </Text>
          <Text
            fontSize="$lg"
            color="$textLight700"
            _dark={{ color: '$textDark400' }}
            textAlign="center"
            testID="confirmation-subtitle"
          >
            {booking.callType === 'video'
              ? 'Your video call is scheduled'
              : 'Your phone call is scheduled'}
          </Text>
        </VStack>

        {/* Booking Summary Card */}
        <BookingSummaryCard booking={booking} testID="booking-summary-card" />

        {/* Call Type-Specific Details */}
        {booking.callType === 'video' ? (
          <VideoCallDetails
            meetingUrl={booking.meetingUrl!}
            onCopyLink={handleCopyMeetingLink}
            onJoinMeeting={handleJoinMeeting}
            testID="video-call-details"
          />
        ) : (
          <PhoneCallDetails
            userPhone={booking.userPhone!}
            onCallWarren={handleCallWarren}
            testID="phone-call-details"
          />
        )}

        {/* Actions */}
        <VStack space="$3">
          {/* Add to Calendar */}
          <Button
            action="secondary"
            onPress={handleAddToCalendar}
            minHeight="$12"
            testID="add-to-calendar-button"
            accessibilityRole="button"
            accessibilityLabel="Add booking to calendar"
            accessibilityHint="Downloads an iCalendar file to add this event to your calendar app"
          >
            <ButtonText>📥 Add to Calendar</ButtonText>
          </Button>

          {/* Done */}
          <Button
            action="primary"
            onPress={handleDone}
            minHeight="$12"
            testID="done-button"
            accessibilityRole="button"
            accessibilityLabel="Done"
            accessibilityHint="Returns to home screen"
          >
            <ButtonText>Done</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </ScrollView>
  );
};
```

### Code Example: SuccessAnimation.tsx

```typescript
import React, { useEffect } from 'react';
import { Box, Icon } from '@gluestack-ui/themed';
import { CheckCircle } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

interface SuccessAnimationProps {
  testID?: string;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ testID }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate in on mount
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    opacity.value = withDelay(200, withSpring(1));
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Box
      alignItems="center"
      justifyContent="center"
      testID={testID}
      accessibilityLabel="Success"
      accessibilityRole="image"
    >
      <Animated.View style={animatedStyle}>
        <Icon
          as={CheckCircle}
          size="xl"
          color="$green500"
          testID={`${testID}-icon`}
        />
      </Animated.View>
    </Box>
  );
};
```

### Code Example: BookingSummaryCard.tsx

```typescript
import React from 'react';
import { Box, VStack, HStack, Text, Badge, BadgeText } from '@gluestack-ui/themed';
import { format } from 'date-fns';

interface BookingSummaryCardProps {
  booking: {
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    callType: 'video' | 'phone';
    timezone: string;
  };
  testID?: string;
}

export const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({
  booking,
  testID,
}) => {
  const formattedDate = format(new Date(booking.date), 'EEE, dd MMM yyyy');
  const formattedStartTime = format(new Date(booking.startTime), 'HH:mm');
  const formattedEndTime = format(new Date(booking.endTime), 'HH:mm');

  return (
    <Box
      bg="$backgroundLight50"
      _dark={{ bg: '$backgroundDark900' }}
      p="$4"
      borderRadius="$lg"
      borderWidth="$1"
      borderColor="$borderLight300"
      _dark={{ borderColor: '$borderDark700' }}
      testID={testID}
      accessibilityRole="summary"
    >
      <VStack space="$3">
        {/* Date */}
        <HStack space="$2" alignItems="center">
          <Text fontSize="$md" color="$textLight700" _dark={{ color: '$textDark400' }}>
            📅
          </Text>
          <Text
            fontSize="$md"
            color="$textLight950"
            _dark={{ color: '$textDark50' }}
            testID={`${testID}-date`}
          >
            {formattedDate}
          </Text>
        </HStack>

        {/* Time */}
        <HStack space="$2" alignItems="center">
          <Text fontSize="$md" color="$textLight700" _dark={{ color: '$textDark400' }}>
            🕐
          </Text>
          <Text
            fontSize="$md"
            color="$textLight950"
            _dark={{ color: '$textDark50' }}
            testID={`${testID}-time`}
          >
            {formattedStartTime} - {formattedEndTime} {booking.timezone}
          </Text>
        </HStack>

        {/* Duration */}
        <HStack space="$2" alignItems="center">
          <Text fontSize="$md" color="$textLight700" _dark={{ color: '$textDark400' }}>
            ⏱️
          </Text>
          <Text
            fontSize="$md"
            color="$textLight950"
            _dark={{ color: '$textDark50' }}
            testID={`${testID}-duration`}
          >
            {booking.duration} minutes
          </Text>
        </HStack>

        {/* Call Type Badge */}
        <HStack space="$2" alignItems="center">
          <Text fontSize="$md" color="$textLight700" _dark={{ color: '$textDark400' }}>
            {booking.callType === 'video' ? '📹' : '📞'}
          </Text>
          <Badge
            action={booking.callType === 'video' ? 'info' : 'success'}
            testID={`${testID}-call-type-badge`}
          >
            <BadgeText>
              {booking.callType === 'video' ? 'Video Call' : 'Phone Call'}
            </BadgeText>
          </Badge>
        </HStack>
      </VStack>
    </Box>
  );
};
```

### Code Example: VideoCallDetails.tsx

```typescript
import React from 'react';
import { Box, VStack, HStack, Text, Button, ButtonText, Pressable } from '@gluestack-ui/themed';

interface VideoCallDetailsProps {
  meetingUrl: string;
  onCopyLink: () => void;
  onJoinMeeting: () => void;
  testID?: string;
}

export const VideoCallDetails: React.FC<VideoCallDetailsProps> = ({
  meetingUrl,
  onCopyLink,
  onJoinMeeting,
  testID,
}) => {
  // Extract short URL for display
  const shortUrl = meetingUrl.replace(/^https?:\/\//, '');

  return (
    <VStack space="$4" testID={testID}>
      {/* Section Header */}
      <Text
        fontSize="$md"
        fontWeight="$medium"
        color="$textLight950"
        _dark={{ color: '$textDark50' }}
        testID={`${testID}-header`}
      >
        Join with Google Meet:
      </Text>

      {/* Meeting Link Card */}
      <Box
        bg="$backgroundLight50"
        _dark={{ bg: '$backgroundDark900' }}
        p="$4"
        borderRadius="$lg"
        borderWidth="$1"
        borderColor="$borderLight300"
        _dark={{ borderColor: '$borderDark700' }}
        testID={`${testID}-link-card`}
      >
        <HStack justifyContent="space-between" alignItems="center">
          <Text
            fontSize="$sm"
            color="$blue500"
            flex={1}
            numberOfLines={1}
            testID={`${testID}-meeting-url`}
          >
            {shortUrl}
          </Text>
          <Pressable
            onPress={onCopyLink}
            ml="$2"
            minWidth="$16"
            minHeight="$10"
            testID={`${testID}-copy-button`}
            accessibilityRole="button"
            accessibilityLabel="Copy meeting link"
            accessibilityHint="Copies the Google Meet link to your clipboard"
          >
            <Text fontSize="$sm" color="$blue500" fontWeight="$medium">
              Copy
            </Text>
          </Pressable>
        </HStack>
      </Box>

      {/* Join Meeting Button */}
      <Button
        action="primary"
        bg="$blue500"
        onPress={onJoinMeeting}
        minHeight="$12"
        testID={`${testID}-join-button`}
        accessibilityRole="button"
        accessibilityLabel="Join meeting"
        accessibilityHint="Opens Google Meet in your browser or app"
      >
        <ButtonText>Join Meeting</ButtonText>
      </Button>
    </VStack>
  );
};
```

### Code Example: PhoneCallDetails.tsx

```typescript
import React from 'react';
import { Box, VStack, Text, Button, ButtonText } from '@gluestack-ui/themed';

interface PhoneCallDetailsProps {
  userPhone: string;
  onCallWarren: () => void;
  testID?: string;
}

export const PhoneCallDetails: React.FC<PhoneCallDetailsProps> = ({
  userPhone,
  onCallWarren,
  testID,
}) => {
  return (
    <VStack space="$4" testID={testID}>
      {/* Warren will call you */}
      <VStack space="$2">
        <Text
          fontSize="$md"
          color="$textLight950"
          _dark={{ color: '$textDark50' }}
          testID={`${testID}-message`}
        >
          Warren will call you at:
        </Text>
        <Box
          bg="$backgroundLight50"
          _dark={{ bg: '$backgroundDark900' }}
          p="$4"
          borderRadius="$lg"
          borderWidth="$1"
          borderColor="$borderLight300"
          _dark={{ borderColor: '$borderDark700' }}
        >
          <Text
            fontSize="$lg"
            fontWeight="$medium"
            color="$textLight950"
            _dark={{ color: '$textDark50' }}
            textAlign="center"
            testID={`${testID}-user-phone`}
          >
            {userPhone}
          </Text>
        </Box>
      </VStack>

      {/* Alternative: Call Warren */}
      <VStack space="$2">
        <Text
          fontSize="$md"
          color="$textLight700"
          _dark={{ color: '$textDark400' }}
          testID={`${testID}-alternative-message`}
        >
          Or call Warren directly:
        </Text>
        <Button
          action="primary"
          bg="$blue500"
          onPress={onCallWarren}
          minHeight="$12"
          testID={`${testID}-call-button`}
          accessibilityRole="button"
          accessibilityLabel="Call Warren"
          accessibilityHint="Opens your phone dialler to call Warren"
        >
          <ButtonText>📞 Call Warren</ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
};
```

### Code Example: useClipboard.ts

```typescript
import { useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';

export const useClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      Clipboard.setString(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  };

  return { copyToClipboard, isCopied };
};
```

---

## Testing Requirements

### RNTL Tests (100% Coverage Required)

**Test File**: `BookingConfirmationScreen.test.tsx`

```typescript
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '@app/test-utils/renderWithProviders';
import { BookingConfirmationScreen } from './BookingConfirmationScreen';
import { CommonActions } from '@react-navigation/native';
import { Linking } from 'react-native';
import * as Clipboard from '@react-native-clipboard/clipboard';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {
      booking: {
        id: 'booking-123',
        date: '2024-11-27T00:00:00Z',
        startTime: '2024-11-27T14:00:00Z',
        endTime: '2024-11-27T14:30:00Z',
        duration: 30,
        callType: 'video',
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        timezone: 'GMT',
      },
    },
  }),
  CommonActions: {
    reset: jest.fn((config) => ({ type: 'RESET', payload: config })),
  },
}));

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  openURL: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
}));

describe('BookingConfirmationScreen', () => {
  describe('Video Call Confirmation', () => {
    it('renders success animation', () => {
      renderWithProviders(<BookingConfirmationScreen />);

      expect(screen.getByTestId('success-animation')).toBeTruthy();
    });

    it('displays confirmation title and subtitle', () => {
      renderWithProviders(<BookingConfirmationScreen />);

      expect(screen.getByTestId('confirmation-title')).toHaveTextContent('Booking Confirmed! 🎉');
      expect(screen.getByTestId('confirmation-subtitle')).toHaveTextContent(
        'Your video call is scheduled'
      );
    });

    it('displays booking summary card with correct details', () => {
      renderWithProviders(<BookingConfirmationScreen />);

      expect(screen.getByTestId('booking-summary-card-date')).toHaveTextContent('Wed, 27 Nov 2024');
      expect(screen.getByTestId('booking-summary-card-time')).toHaveTextContent('14:00 - 14:30 GMT');
      expect(screen.getByTestId('booking-summary-card-duration')).toHaveTextContent('30 minutes');
      expect(screen.getByTestId('booking-summary-card-call-type-badge')).toHaveTextContent('Video Call');
    });

    it('displays video call details with meeting URL', () => {
      renderWithProviders(<BookingConfirmationScreen />);

      expect(screen.getByTestId('video-call-details')).toBeTruthy();
      expect(screen.getByTestId('video-call-details-meeting-url')).toHaveTextContent(
        'meet.google.com/abc-defg-hij'
      );
    });

    it('copies meeting link to clipboard when copy button pressed', async () => {
      renderWithProviders(<BookingConfirmationScreen />);

      const copyButton = screen.getByTestId('video-call-details-copy-button');
      fireEvent.press(copyButton);

      await waitFor(() => {
        expect(Clipboard.setString).toHaveBeenCalledWith('https://meet.google.com/abc-defg-hij');
      });

      // Verify toast shown
      expect(screen.getByText('Link copied to clipboard')).toBeTruthy();
    });

    it('opens meeting URL when join meeting button pressed', async () => {
      renderWithProviders(<BookingConfirmationScreen />);

      const joinButton = screen.getByTestId('video-call-details-join-button');
      fireEvent.press(joinButton);

      await waitFor(() => {
        expect(Linking.canOpenURL).toHaveBeenCalledWith('https://meet.google.com/abc-defg-hij');
        expect(Linking.openURL).toHaveBeenCalledWith('https://meet.google.com/abc-defg-hij');
      });
    });
  });

  describe('Phone Call Confirmation', () => {
    beforeEach(() => {
      (useRoute as jest.Mock).mockReturnValue({
        params: {
          booking: {
            id: 'booking-456',
            date: '2024-11-27T00:00:00Z',
            startTime: '2024-11-27T14:00:00Z',
            endTime: '2024-11-27T14:30:00Z',
            duration: 30,
            callType: 'phone',
            userPhone: '+44 7700 900123',
            timezone: 'GMT',
          },
        },
      });
    });

    it('displays phone call subtitle', () => {
      renderWithProviders(<BookingConfirmationScreen />);

      expect(screen.getByTestId('confirmation-subtitle')).toHaveTextContent(
        'Your phone call is scheduled'
      );
    });

    it('displays phone call details with user phone number', () => {
      renderWithProviders(<BookingConfirmationScreen />);

      expect(screen.getByTestId('phone-call-details')).toBeTruthy();
      expect(screen.getByTestId('phone-call-details-user-phone')).toHaveTextContent(
        '+44 7700 900123'
      );
    });

    it('opens phone dialler when call warren button pressed', async () => {
      renderWithProviders(<BookingConfirmationScreen />);

      const callButton = screen.getByTestId('phone-call-details-call-button');
      fireEvent.press(callButton);

      await waitFor(() => {
        expect(Linking.canOpenURL).toHaveBeenCalledWith('tel:+447700900000');
        expect(Linking.openURL).toHaveBeenCalledWith('tel:+447700900000');
      });
    });
  });

  describe('Actions', () => {
    it('renders add to calendar button', () => {
      renderWithProviders(<BookingConfirmationScreen />);

      expect(screen.getByTestId('add-to-calendar-button')).toBeTruthy();
    });

    it('renders done button', () => {
      renderWithProviders(<BookingConfirmationScreen />);

      expect(screen.getByTestId('done-button')).toBeTruthy();
    });

    it('navigates to Home when done button pressed', () => {
      const mockDispatch = jest.fn();
      (useNavigation as jest.Mock).mockReturnValue({ dispatch: mockDispatch });

      renderWithProviders(<BookingConfirmationScreen />);

      const doneButton = screen.getByTestId('done-button');
      fireEvent.press(doneButton);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'RESET',
          payload: {
            index: 0,
            routes: [{ name: 'Home' }],
          },
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility labels for all interactive elements', () => {
      renderWithProviders(<BookingConfirmationScreen />);

      expect(screen.getByLabelText('Copy meeting link')).toBeTruthy();
      expect(screen.getByLabelText('Join meeting')).toBeTruthy();
      expect(screen.getByLabelText('Add booking to calendar')).toBeTruthy();
      expect(screen.getByLabelText('Done')).toBeTruthy();
    });

    it('has correct accessibility hints for all interactive elements', () => {
      renderWithProviders(<BookingConfirmationScreen />);

      const copyButton = screen.getByTestId('video-call-details-copy-button');
      expect(copyButton.props.accessibilityHint).toBe('Copies the Google Meet link to your clipboard');

      const joinButton = screen.getByTestId('video-call-details-join-button');
      expect(joinButton.props.accessibilityHint).toBe('Opens Google Meet in your browser or app');

      const addToCalendarButton = screen.getByTestId('add-to-calendar-button');
      expect(addToCalendarButton.props.accessibilityHint).toBe(
        'Downloads an iCalendar file to add this event to your calendar app'
      );

      const doneButton = screen.getByTestId('done-button');
      expect(doneButton.props.accessibilityHint).toBe('Returns to home screen');
    });
  });

  describe('Error Handling', () => {
    it('redirects to Home if booking data missing', () => {
      const mockDispatch = jest.fn();
      (useNavigation as jest.Mock).mockReturnValue({ dispatch: mockDispatch });
      (useRoute as jest.Mock).mockReturnValue({ params: {} });

      renderWithProviders(<BookingConfirmationScreen />);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'RESET',
          payload: {
            index: 0,
            routes: [{ name: 'Home' }],
          },
        })
      );
    });

    it('shows error toast if linking cannot open URL', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      renderWithProviders(<BookingConfirmationScreen />);

      const joinButton = screen.getByTestId('video-call-details-join-button');
      fireEvent.press(joinButton);

      await waitFor(() => {
        expect(screen.getByText('Cannot open meeting link')).toBeTruthy();
      });
    });
  });
});
```

**Test Coverage Targets**:

- Statements: 100%
- Branches: 100%
- Functions: 100%
- Lines: 100%

---

## Storybook Stories

**Test File**: `BookingConfirmationScreen.stories.tsx`

```typescript
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BookingConfirmationScreen } from './BookingConfirmationScreen';
import { NavigationDecorator } from '@app/.storybook/decorators/NavigationDecorator';

const meta: Meta<typeof BookingConfirmationScreen> = {
  title: 'Features/BookACall/BookingConfirmationScreen',
  component: BookingConfirmationScreen,
  decorators: [NavigationDecorator],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof BookingConfirmationScreen>;

export const VideoCall: Story = {
  parameters: {
    navigation: {
      route: 'BookingConfirmation',
      params: {
        booking: {
          id: 'booking-123',
          date: '2024-11-27T00:00:00Z',
          startTime: '2024-11-27T14:00:00Z',
          endTime: '2024-11-27T14:30:00Z',
          duration: 30,
          callType: 'video',
          meetingUrl: 'https://meet.google.com/abc-defg-hij',
          timezone: 'GMT',
        },
      },
    },
  },
};

export const PhoneCall: Story = {
  parameters: {
    navigation: {
      route: 'BookingConfirmation',
      params: {
        booking: {
          id: 'booking-456',
          date: '2024-11-27T00:00:00Z',
          startTime: '2024-11-27T14:00:00Z',
          endTime: '2024-11-27T14:30:00Z',
          duration: 30,
          callType: 'phone',
          userPhone: '+44 7700 900123',
          timezone: 'GMT',
        },
      },
    },
  },
};

export const VideoCall60Minutes: Story = {
  parameters: {
    navigation: {
      route: 'BookingConfirmation',
      params: {
        booking: {
          id: 'booking-789',
          date: '2024-11-28T00:00:00Z',
          startTime: '2024-11-28T10:00:00Z',
          endTime: '2024-11-28T11:00:00Z',
          duration: 60,
          callType: 'video',
          meetingUrl: 'https://meet.google.com/xyz-uvwx-yzw',
          timezone: 'GMT',
        },
      },
    },
  },
};
```

---

## Acceptance Criteria

**Screen Rendering**:

- [ ] Success animation plays on mount (500ms, scale + fade)
- [ ] Title "Booking Confirmed! 🎉" displays
- [ ] Subtitle shows call type ("video call" / "phone call")
- [ ] Booking summary card displays date, time, duration, call type badge

**Video Call Variant**:

- [ ] Google Meet link displays (shortened URL)
- [ ] Copy button copies link to clipboard
- [ ] Toast shows "Link copied to clipboard" on success
- [ ] "Join Meeting" button opens Google Meet URL
- [ ] Error toast shows if URL cannot be opened

**Phone Call Variant**:

- [ ] Message "Warren will call you at [phone]" displays
- [ ] User's phone number displays (formatted)
- [ ] "Call Warren" button opens phone dialler
- [ ] Error toast shows if dialler cannot be opened

**Actions**:

- [ ] "Add to Calendar" button triggers iCal download/share
- [ ] "Done" button resets navigation stack to [Home]

**EAA Compliance**:

- [ ] All buttons have `minHeight="$12"` (48pt)
- [ ] All interactive elements have accessibility props
- [ ] Success state announced to screen readers
- [ ] High contrast text (4.5:1 minimum)

**Testing**:

- [ ] 100% RNTL coverage achieved
- [ ] All Storybook stories render correctly
- [ ] Snapshot tests pass for both variants

---

## Dependencies

**Blocked By**:

- None (can start immediately)

**Depends On**:

- TASK-354 (iCal generation) - partial dependency (screen can be implemented without full calendar functionality)

**Blocks**:

- TASK-355 (Navigation integration)
- TASK-358 (E2E booking flow tests)

---

## Implementation Checklist

**Setup**:

- [ ] Create component files in `src/features/BookACall/BookingConfirmationScreen/`
- [ ] Create sub-components (SuccessAnimation, BookingSummaryCard, etc.)
- [ ] Create hooks (useClipboard)
- [ ] Update `RootStackParamList` with `BookingConfirmation` route

**Implementation**:

- [ ] Implement BookingConfirmationScreen component
- [ ] Implement SuccessAnimation with Reanimated
- [ ] Implement BookingSummaryCard
- [ ] Implement VideoCallDetails
- [ ] Implement PhoneCallDetails
- [ ] Implement useClipboard hook
- [ ] Add navigation logic (Done button)
- [ ] Add Linking logic (Join Meeting, Call Warren)
- [ ] Add Toast notifications

**EAA Compliance**:

- [ ] Add accessibility props to all interactive elements
- [ ] Verify touch targets (`minHeight="$12"`)
- [ ] Test with screen reader (VoiceOver/TalkBack)
- [ ] Verify colour contrast (4.5:1 text, 3:1 UI)

**Testing**:

- [ ] Write RNTL tests (100% coverage)
- [ ] Write Storybook stories (2+ variants)
- [ ] Verify snapshots
- [ ] Run `yarn test:coverage` and verify 100%

**Validation**:

- [ ] Run `yarn validate` (0 errors)
- [ ] Manual test on iOS simulator
- [ ] Manual test on Android emulator
- [ ] Test both video and phone call variants
- [ ] Test all actions (copy, join, call, calendar, done)

---

## Notes

**iOS-Native Design**:

- Success animation mimics iOS system animations
- Green checkmark in circle is iOS standard for success states
- Action sheet-style button layout (primary → secondary → tertiary)

**Performance**:

- Animation runs at 60fps using Reanimated
- No layout shifts during animation
- Clipboard operations are async and don't block UI

**Accessibility**:

- Success state is immediately announced to screen readers
- Focus moves to "Done" button after animation completes
- All actions have clear labels and hints

**Error Handling**:

- Redirects to Home if booking data missing
- Shows error toast if Linking APIs fail
- Clipboard failures show user-friendly message

**Future Enhancements**:

- Add "Share" button to share booking details
- Add "Reschedule" button to modify booking
- Add "Cancel Booking" action
- Support multiple calendar apps (Google Calendar, Apple Calendar, Outlook)
