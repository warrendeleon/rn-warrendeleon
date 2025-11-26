# TASK-364: Booking Detail Screen (Tappable Links)

**Status**: 🆕 Not Started
**Effort**: 4 hours
**Priority**: High
**Parent**: [US-065: View & Manage Bookings](../user-stories/US-065-view-manage-bookings.md)

---

## Overview

Create the Booking Detail screen that displays full details of a single booking with tappable deep links for Google Meet, phone calls, and maps. The screen includes an Edit button in the header, an "Add to Calendar" button, and a destructive "Cancel Booking" button. Follows iOS-first design with grouped detail list styling.

---

## Requirements

### Functional Requirements

1. **Display Full Booking Details**:
   - Meeting type name and description
   - Date and time (start/end)
   - Duration
   - Meeting format (Google Meet or In-person)
   - Phone number (tappable `tel://` link)
   - Google Meet link (tappable deep link to app/web)
   - Location address (tappable deep link to Google Maps)
   - Custom description (if provided)
   - Booking status badge
2. **Header Actions**:
   - Edit button (top-right) navigates to edit screen
3. **Action Buttons**:
   - **Add to Calendar**: Opens share sheet with `.ics` file
   - **Cancel Booking**: Red destructive button, shows confirmation
4. **Deep Links**:
   - Phone: `tel://+447700900123` (opens phone app)
   - Google Meet: `googlemeet://` or fallback to web
   - Maps: `https://maps.google.com/?q=lat,lng` or address search
5. **Loading/Error States**: Handle missing data gracefully

### Non-Functional Requirements

1. **iOS-First Design**: Grouped detail list (like iOS Settings detail view)
2. **Performance**: Instant navigation, optimised deep link handling
3. **EAA Compliance**: WCAG 2.1 Level AA (touch targets, contrast, labels)
4. **Platform-Specific**: Use `Linking.openURL` with error handling

---

## ASCII Mockups

### Booking Detail Screen

```
┌─────────────────────────────────────────────────┐
│  ← Booking Details                    Edit      │ ← Navigation header
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Strategy Session                  ✓      │ │ ← Status badge (confirmed)
│  │                                           │ │
│  │  Deep dive into strategic planning and    │ │
│  │  quarterly goal setting.                  │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Date & Time                              │ │
│  │  1 Dec 2025, 14:00 - 15:00                │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Duration                                 │ │
│  │  60 minutes                               │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Meeting Link                        →    │ │ ← Tappable (Google Meet)
│  │  meet.google.com/abc-defg-hij             │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Phone Number                        →    │ │ ← Tappable (tel://)
│  │  +44 7700 900123                          │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Description                              │ │
│  │  Discuss Q1 marketing strategy            │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │        Add to Calendar                  │   │ ← Primary button
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │        Cancel Booking (red)             │   │ ← Destructive button
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### In-Person Meeting Detail (with Maps Link)

```
┌─────────────────────────────────────────────────┐
│  ← Booking Details                    Edit      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Quick Catchup                     ✓      │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Date & Time                              │ │
│  │  5 Dec 2025, 10:00 - 10:30                │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Duration                                 │ │
│  │  30 minutes                               │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Location                            →    │ │ ← Tappable (Google Maps)
│  │  123 High Street, London, UK              │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Phone Number                        →    │ │
│  │  +44 7700 900456                          │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │        Add to Calendar                  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │        Cancel Booking (red)             │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Implementation

### File Structure

```
src/features/Bookings/
├── BookingDetailScreen.tsx             # Main screen
├── BookingDetailScreen.test.tsx        # RNTL tests
├── BookingDetailScreen.stories.tsx     # Storybook stories
├── components/
│   ├── DetailRow.tsx                   # Key-value row component
│   ├── DetailRow.test.tsx
│   ├── DetailRow.stories.tsx
│   ├── TappableDetailRow.tsx           # Tappable row with deep link
│   ├── TappableDetailRow.test.tsx
│   └── TappableDetailRow.stories.tsx
├── utils/
│   ├── deepLinks.ts                    # Deep link handling
│   └── calendarExport.ts               # .ics file generation
└── index.ts
```

### Main Screen Component

```typescript
// src/features/Bookings/BookingDetailScreen.tsx

import React, { useEffect, useState } from 'react';
import { ScrollView, Linking, Alert, Platform } from 'react-native';
import { Box, Text, Pressable, Spinner, Badge } from '@gluestack-ui/themed';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/navigation/types';
import { DetailRow } from './components/DetailRow';
import { TappableDetailRow } from './components/TappableDetailRow';
import { format } from 'date-fns';
import { Booking } from '@app/types/booking';
import { supabase } from '@app/lib/supabase';
import { openPhoneCall, openGoogleMeet, openMapsLocation } from './utils/deepLinks';
import { exportToCalendar } from './utils/calendarExport';
import { showActionSheet } from '@app/utils/actionSheet';

type BookingDetailScreenRouteProp = RouteProp<RootStackParamList, 'BookingDetail'>;
type BookingDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BookingDetail'
>;

export const BookingDetailScreen: React.FC = () => {
  const navigation = useNavigation<BookingDetailScreenNavigationProp>();
  const route = useRoute<BookingDetailScreenRouteProp>();
  const { bookingId } = route.params;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Set header button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('EditBooking', { bookingId })}
          accessibilityRole="button"
          accessibilityLabel="Edit booking"
          accessibilityHint="Opens the edit booking screen"
          testID="edit-booking-header-button"
          px="$4"
          py="$2"
          minHeight="$11"
        >
          <Text color="$blue500" fontSize="$md" fontWeight="$semibold">
            Edit
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*, meeting_types(*)')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;

      setBooking(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load booking'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneCall = () => {
    if (booking?.phone_number) {
      openPhoneCall(booking.phone_number);
    }
  };

  const handleOpenMeet = () => {
    if (booking?.google_meet_link) {
      openGoogleMeet(booking.google_meet_link);
    }
  };

  const handleOpenMaps = () => {
    if (booking?.location_coords) {
      openMapsLocation(
        booking.location_coords.latitude,
        booking.location_coords.longitude,
        booking.location_address
      );
    } else if (booking?.location_address) {
      openMapsLocation(null, null, booking.location_address);
    }
  };

  const handleAddToCalendar = async () => {
    if (!booking) return;

    try {
      await exportToCalendar(booking);
    } catch (error) {
      Alert.alert('Error', 'Failed to add to calendar. Please try again.');
    }
  };

  const handleCancelBooking = () => {
    if (!booking) return;

    showActionSheet({
      title: 'Cancel Booking',
      message: `Are you sure you want to cancel "${booking.meeting_type.name}"? This action cannot be undone.`,
      options: [
        {
          label: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { session } } = await supabase.auth.getSession();

              const response = await fetch(
                `${process.env.SUPABASE_URL}/functions/v1/cancel-booking`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ booking_id: bookingId }),
                }
              );

              if (!response.ok) throw new Error('Failed to cancel');

              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            }
          },
        },
        {
          label: 'Keep Booking',
          style: 'cancel',
        },
      ],
    });
  };

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$coolGray50">
        <Spinner size="large" testID="loading-spinner" />
      </Box>
    );
  }

  if (error || !booking) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$coolGray50" px="$6">
        <Text fontSize="$lg" fontWeight="$semibold" mb="$4">
          Failed to Load Booking
        </Text>
        <Pressable
          onPress={fetchBooking}
          bg="$blue500"
          px="$6"
          py="$3"
          borderRadius="$lg"
          minHeight="$11"
          testID="retry-button"
        >
          <Text color="$white" fontWeight="$semibold">
            Retry
          </Text>
        </Pressable>
      </Box>
    );
  }

  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);
  const formattedDate = format(startTime, 'd MMM yyyy');
  const formattedTime = `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`;

  const isGoogleMeet = booking.meeting_type.meeting_type === 'google_meet';

  return (
    <Box flex={1} bg="$coolGray50">
      <ScrollView contentContainerStyle={{ padding: 16 }} testID="booking-detail-scroll">
        {/* Meeting Type & Status */}
        <Box
          bg="$white"
          p="$4"
          borderRadius="$lg"
          mb="$3"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box flex={1}>
            <Text fontSize="$xl" fontWeight="$semibold" color="$coolGray900">
              {booking.meeting_type.name}
            </Text>
            {booking.meeting_type.description && (
              <Text fontSize="$sm" color="$coolGray600" mt="$2" lineHeight="$lg">
                {booking.meeting_type.description}
              </Text>
            )}
          </Box>
          <Badge
            bg={booking.status === 'confirmed' ? '$green100' : '$coolGray100'}
            borderRadius="$full"
            px="$3"
            py="$1"
          >
            <Text
              fontSize="$xs"
              fontWeight="$semibold"
              color={booking.status === 'confirmed' ? '$green700' : '$coolGray700'}
            >
              {booking.status === 'confirmed' ? '✓ Confirmed' : booking.status}
            </Text>
          </Badge>
        </Box>

        {/* Details Group */}
        <Box bg="$white" borderRadius="$lg" overflow="hidden" mb="$3">
          <DetailRow label="Date & Time" value={`${formattedDate}, ${formattedTime}`} />
          <DetailRow
            label="Duration"
            value={`${booking.meeting_type.duration_minutes} minutes`}
            showDivider
          />
        </Box>

        {/* Meeting Links Group */}
        <Box bg="$white" borderRadius="$lg" overflow="hidden" mb="$3">
          {isGoogleMeet && booking.google_meet_link && (
            <TappableDetailRow
              label="Meeting Link"
              value={booking.google_meet_link.replace('https://', '')}
              onPress={handleOpenMeet}
              testID="google-meet-link"
            />
          )}

          {!isGoogleMeet && booking.location_address && (
            <TappableDetailRow
              label="Location"
              value={booking.location_address}
              onPress={handleOpenMaps}
              showDivider={isGoogleMeet}
              testID="location-link"
            />
          )}

          <TappableDetailRow
            label="Phone Number"
            value={booking.phone_number}
            onPress={handlePhoneCall}
            showDivider={!isGoogleMeet}
            testID="phone-number-link"
          />
        </Box>

        {/* Description (if exists) */}
        {booking.description && (
          <Box bg="$white" p="$4" borderRadius="$lg" mb="$3">
            <Text fontSize="$sm" color="$coolGray600" mb="$1">
              Description
            </Text>
            <Text fontSize="$md" color="$coolGray900" lineHeight="$lg">
              {booking.description}
            </Text>
          </Box>
        )}

        {/* Add to Calendar Button */}
        <Pressable
          onPress={handleAddToCalendar}
          bg="$blue500"
          py="$4"
          borderRadius="$lg"
          mb="$3"
          minHeight="$12"
          accessibilityRole="button"
          accessibilityLabel="Add to calendar"
          accessibilityHint="Opens share sheet to add this booking to your calendar"
          testID="add-to-calendar-button"
        >
          <Text
            color="$white"
            fontSize="$md"
            fontWeight="$semibold"
            textAlign="center"
          >
            Add to Calendar
          </Text>
        </Pressable>

        {/* Cancel Booking Button */}
        {booking.status === 'confirmed' && (
          <Pressable
            onPress={handleCancelBooking}
            bg="$white"
            borderWidth={1}
            borderColor="$red500"
            py="$4"
            borderRadius="$lg"
            mb="$6"
            minHeight="$12"
            accessibilityRole="button"
            accessibilityLabel="Cancel booking"
            accessibilityHint="Cancels this booking after confirmation"
            testID="cancel-booking-button"
          >
            <Text
              color="$red500"
              fontSize="$md"
              fontWeight="$semibold"
              textAlign="center"
            >
              Cancel Booking
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </Box>
  );
};
```

### Detail Row Component

```typescript
// src/features/Bookings/components/DetailRow.tsx

import React from 'react';
import { Box, Text } from '@gluestack-ui/themed';

interface DetailRowProps {
  label: string;
  value: string;
  showDivider?: boolean;
  testID?: string;
}

export const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  showDivider = false,
  testID,
}) => {
  return (
    <Box testID={testID}>
      <Box px="$4" py="$3">
        <Text fontSize="$sm" color="$coolGray600" mb="$1">
          {label}
        </Text>
        <Text fontSize="$md" color="$coolGray900">
          {value}
        </Text>
      </Box>
      {showDivider && <Box h={1} bg="$coolGray200" mx="$4" />}
    </Box>
  );
};
```

### Tappable Detail Row Component

```typescript
// src/features/Bookings/components/TappableDetailRow.tsx

import React from 'react';
import { Box, Text, Pressable } from '@gluestack-ui/themed';

interface TappableDetailRowProps {
  label: string;
  value: string;
  onPress: () => void;
  showDivider?: boolean;
  testID?: string;
}

export const TappableDetailRow: React.FC<TappableDetailRowProps> = ({
  label,
  value,
  onPress,
  showDivider = false,
  testID,
}) => {
  return (
    <Box testID={testID}>
      <Pressable
        onPress={onPress}
        px="$4"
        py="$3"
        minHeight="$16" // 64pt for comfortable touch target
        accessibilityRole="link"
        accessibilityLabel={`${label}: ${value}`}
        accessibilityHint={`Opens ${label.toLowerCase()}`}
      >
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Box flex={1}>
            <Text fontSize="$sm" color="$coolGray600" mb="$1">
              {label}
            </Text>
            <Text fontSize="$md" color="$blue500" numberOfLines={2}>
              {value}
            </Text>
          </Box>
          <Text fontSize="$lg" color="$coolGray400" ml="$2">
            →
          </Text>
        </Box>
      </Pressable>
      {showDivider && <Box h={1} bg="$coolGray200" mx="$4" />}
    </Box>
  );
};
```

### Deep Link Utilities

```typescript
// src/features/Bookings/utils/deepLinks.ts

import { Linking, Alert, Platform } from 'react-native';

export const openPhoneCall = async (phoneNumber: string): Promise<void> => {
  const url = `tel:${phoneNumber}`;

  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Phone calls are not supported on this device.');
    }
  } catch (error) {
    console.error('Failed to open phone call:', error);
    Alert.alert('Error', 'Failed to open phone app. Please try again.');
  }
};

export const openGoogleMeet = async (meetLink: string): Promise<void> => {
  // Try Google Meet app first (iOS/Android)
  const meetAppUrl = meetLink.replace('https://meet.google.com/', 'googlemeet://');

  try {
    const appSupported = await Linking.canOpenURL(meetAppUrl);

    if (appSupported) {
      await Linking.openURL(meetAppUrl);
    } else {
      // Fallback to web browser
      await Linking.openURL(meetLink);
    }
  } catch (error) {
    console.error('Failed to open Google Meet:', error);
    Alert.alert('Error', 'Failed to open Google Meet. Please try again.');
  }
};

export const openMapsLocation = async (
  latitude: number | null,
  longitude: number | null,
  address: string | null
): Promise<void> => {
  let url: string;

  if (latitude && longitude) {
    // Use coordinates
    if (Platform.OS === 'ios') {
      url = `maps://app?daddr=${latitude},${longitude}`;
    } else {
      url = `https://maps.google.com/?q=${latitude},${longitude}`;
    }
  } else if (address) {
    // Use address search
    const encodedAddress = encodeURIComponent(address);
    if (Platform.OS === 'ios') {
      url = `maps://app?q=${encodedAddress}`;
    } else {
      url = `https://maps.google.com/?q=${encodedAddress}`;
    }
  } else {
    Alert.alert('Error', 'No location information available.');
    return;
  }

  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      // Fallback to web version
      const webUrl = address
        ? `https://maps.google.com/?q=${encodeURIComponent(address)}`
        : `https://maps.google.com/?q=${latitude},${longitude}`;
      await Linking.openURL(webUrl);
    }
  } catch (error) {
    console.error('Failed to open maps:', error);
    Alert.alert('Error', 'Failed to open maps. Please try again.');
  }
};
```

### Calendar Export Utility

```typescript
// src/features/Bookings/utils/calendarExport.ts

import { Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Booking } from '@app/types/booking';
import { format } from 'date-fns';

export const exportToCalendar = async (booking: Booking): Promise<void> => {
  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);

  const icsContent = generateICS({
    title: booking.meeting_type.name,
    description: booking.description || booking.meeting_type.description || '',
    location:
      booking.meeting_type.meeting_type === 'google_meet'
        ? booking.google_meet_link || ''
        : booking.location_address || '',
    startTime,
    endTime,
  });

  if (Platform.OS === 'ios') {
    // iOS: Use Share API
    await Share.share({
      message: icsContent,
      title: 'Add to Calendar',
    });
  } else {
    // Android: Write file and share
    const fileUri = `${FileSystem.documentDirectory}booking.ics`;
    await FileSystem.writeAsStringAsync(fileUri, icsContent);
    await Sharing.shareAsync(fileUri);
  }
};

interface ICSParams {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
}

const generateICS = ({ title, description, location, startTime, endTime }: ICSParams): string => {
  const formatDateTime = (date: Date): string => {
    return format(date, "yyyyMMdd'T'HHmmss'Z'");
  };

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your App//NONSGML Event//EN
BEGIN:VEVENT
UID:${Date.now()}@yourapp.com
DTSTAMP:${formatDateTime(new Date())}
DTSTART:${formatDateTime(startTime)}
DTEND:${formatDateTime(endTime)}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;
};
```

---

## React Native Testing Library Tests

```typescript
// src/features/Bookings/BookingDetailScreen.test.tsx

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { BookingDetailScreen } from './BookingDetailScreen';
import { renderWithProviders } from '@app/test-utils';
import { Linking } from 'react-native';

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
}));

const mockBooking = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  meeting_type: {
    name: 'Strategy Session',
    description: 'Deep dive into strategic planning',
    duration_minutes: 60,
    meeting_type: 'google_meet',
  },
  start_time: '2025-12-01T14:00:00.000Z',
  end_time: '2025-12-01T15:00:00.000Z',
  status: 'confirmed',
  phone_number: '+447700900123',
  google_meet_link: 'https://meet.google.com/abc-defg-hij',
  description: 'Discuss Q1 marketing strategy',
};

describe('BookingDetailScreen', () => {
  it('should render booking details', async () => {
    const { getByText } = renderWithProviders(<BookingDetailScreen />, {
      route: { params: { bookingId: mockBooking.id } },
    });

    await waitFor(() => {
      expect(getByText('Strategy Session')).toBeTruthy();
      expect(getByText('Deep dive into strategic planning')).toBeTruthy();
    });
  });

  it('should open phone app when phone number tapped', async () => {
    const { getByTestId } = renderWithProviders(<BookingDetailScreen />, {
      route: { params: { bookingId: mockBooking.id } },
    });

    await waitFor(() => {
      fireEvent.press(getByTestId('phone-number-link'));
    });

    expect(Linking.openURL).toHaveBeenCalledWith('tel:+447700900123');
  });

  it('should open Google Meet when meet link tapped', async () => {
    const { getByTestId } = renderWithProviders(<BookingDetailScreen />, {
      route: { params: { bookingId: mockBooking.id } },
    });

    await waitFor(() => {
      fireEvent.press(getByTestId('google-meet-link'));
    });

    expect(Linking.canOpenURL).toHaveBeenCalled();
  });

  it('should show "Add to Calendar" button', async () => {
    const { getByTestId } = renderWithProviders(<BookingDetailScreen />, {
      route: { params: { bookingId: mockBooking.id } },
    });

    await waitFor(() => {
      expect(getByTestId('add-to-calendar-button')).toBeTruthy();
    });
  });

  it('should show "Cancel Booking" button for confirmed bookings', async () => {
    const { getByTestId } = renderWithProviders(<BookingDetailScreen />, {
      route: { params: { bookingId: mockBooking.id } },
    });

    await waitFor(() => {
      expect(getByTestId('cancel-booking-button')).toBeTruthy();
    });
  });

  it('should have Edit button in header', () => {
    const { getByTestId } = renderWithProviders(<BookingDetailScreen />, {
      route: { params: { bookingId: mockBooking.id } },
    });

    expect(getByTestId('edit-booking-header-button')).toBeTruthy();
  });
});
```

**Test Coverage Target**: 100%

---

## Storybook Stories

```typescript
// src/features/Bookings/BookingDetailScreen.stories.tsx

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BookingDetailScreen } from './BookingDetailScreen';

const meta: Meta<typeof BookingDetailScreen> = {
  title: 'Features/Bookings/BookingDetailScreen',
  component: BookingDetailScreen,
};

export default meta;

type Story = StoryObj<typeof BookingDetailScreen>;

export const GoogleMeetBooking: Story = {
  args: {},
};

export const InPersonBooking: Story = {
  args: {},
};
```

---

## Acceptance Criteria

- [ ] Displays all booking details (meeting type, date/time, duration, etc.)
- [ ] Status badge shows "Confirmed" in green
- [ ] Edit button visible in navigation header
- [ ] Phone number link opens phone app (`tel://`)
- [ ] Google Meet link opens Meet app or web fallback
- [ ] Location address opens Google Maps (app or web)
- [ ] "Add to Calendar" generates and shares `.ics` file
- [ ] "Cancel Booking" shows confirmation, then cancels
- [ ] Cancel button is red (destructive style)
- [ ] All tappable links have chevron (→) indicator
- [ ] All buttons have correct accessibility props
- [ ] Minimum touch targets 44×44pt (iOS) / 48×48dp (Android)
- [ ] RNTL tests achieve 100% coverage
- [ ] Storybook stories for Google Meet and in-person bookings

---

## Related Files

- **Screen**: `src/features/Bookings/BookingDetailScreen.tsx`
- **Components**: `src/features/Bookings/components/DetailRow.tsx`, `TappableDetailRow.tsx`
- **Utils**: `src/features/Bookings/utils/deepLinks.ts`, `calendarExport.ts`
- **Tests**: `src/features/Bookings/BookingDetailScreen.test.tsx`
- **Stories**: `src/features/Bookings/BookingDetailScreen.stories.tsx`

---

## Dependencies

```json
{
  "expo-file-system": "^17.0.0",
  "expo-sharing": "^12.0.0"
}
```

**All dependencies already installed in project.**

---

## Notes

- Deep links use `Linking.canOpenURL` for capability detection
- iOS prefers native Maps/Phone apps, Android uses web fallbacks
- `.ics` file format is industry standard (compatible with all calendar apps)
- Consider adding "Share Booking" button for sharing details with others
