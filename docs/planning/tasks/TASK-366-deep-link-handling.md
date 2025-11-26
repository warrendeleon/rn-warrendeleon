# TASK-366: Deep Link Handling (tel://, maps://, meet)

**Status**: 🆕 Not Started
**Effort**: 2 hours
**Priority**: Medium
**Parent**: [US-065: View & Manage Bookings](../user-stories/US-065-view-manage-bookings.md)

---

## Overview

Implement robust deep link handling for phone calls (`tel://`), Google Maps navigation (`maps://` or web), and Google Meet app/web fallback. This utility module provides platform-specific handling with graceful fallbacks, error handling, and user feedback.

---

## Requirements

### Functional Requirements

1. **Phone Call Links** (`tel://`):
   - Format: `tel:+447700900123`
   - Opens native phone app (iOS/Android)
   - Handles international numbers (E.164 format)
   - Error if device doesn't support calls (e.g., iPad WiFi)
2. **Google Maps Links** (`maps://` or web):
   - iOS: Use `maps://app?daddr=lat,lng` or `maps://app?q=address`
   - Android: Use `https://maps.google.com/?q=lat,lng` or `?q=address`
   - Fallback to web version if app not installed
   - Support both coordinates and address search
3. **Google Meet Links** (`googlemeet://` or web):
   - Try app first: `googlemeet://meet.google.com/abc-defg-hij`
   - Fallback to web: `https://meet.google.com/abc-defg-hij`
   - Handle cases where app not installed
4. **Error Handling**:
   - Graceful alerts for unsupported URLs
   - Clear error messages for user
   - Console logging for debugging
5. **Platform-Specific Behaviour**:
   - iOS: Prefer native apps (Maps, Phone, Meet app)
   - Android: Use web fallbacks where native apps not guaranteed

### Non-Functional Requirements

1. **Type Safety**: Full TypeScript types
2. **Testability**: Unit tests for all functions
3. **Performance**: Check URL support before opening (avoid failures)
4. **User Experience**: Clear feedback on errors

---

## Implementation

### File Structure

```
src/utils/
├── deepLinks.ts              # Main deep link utilities
├── deepLinks.test.ts         # Unit tests
└── index.ts                  # Public exports
```

### Main Utility Module

```typescript
// src/utils/deepLinks.ts

import { Linking, Alert, Platform } from 'react-native';

/**
 * Opens the phone app with the provided phone number
 * @param phoneNumber - Phone number in E.164 format (e.g., +447700900123)
 * @throws Error if phone calls are not supported on the device
 */
export const openPhoneCall = async (phoneNumber: string): Promise<void> => {
  const url = `tel:${phoneNumber}`;

  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'Phone Calls Not Supported',
        'This device does not support phone calls. Please use another device or contact the person directly.',
        [{ text: 'OK' }]
      );
      console.warn(`Phone calls not supported on this device: ${url}`);
    }
  } catch (error) {
    console.error('Failed to open phone call:', error);
    Alert.alert(
      'Error',
      'Failed to open phone app. Please try again or dial the number manually.',
      [{ text: 'OK' }]
    );
  }
};

/**
 * Opens Google Meet in app (if installed) or web browser
 * @param meetLink - Full Google Meet link (https://meet.google.com/xxx-xxxx-xxx)
 */
export const openGoogleMeet = async (meetLink: string): Promise<void> => {
  // Extract meeting code from URL
  const meetingCode = meetLink.replace('https://meet.google.com/', '');

  // Try Google Meet app first
  const appUrl = `googlemeet://${meetingCode}`;

  try {
    const appSupported = await Linking.canOpenURL(appUrl);

    if (appSupported) {
      await Linking.openURL(appUrl);
      return;
    }

    // Fallback to web browser
    const webSupported = await Linking.canOpenURL(meetLink);

    if (webSupported) {
      await Linking.openURL(meetLink);
    } else {
      throw new Error('Cannot open Google Meet link');
    }
  } catch (error) {
    console.error('Failed to open Google Meet:', error);
    Alert.alert('Error', 'Failed to open Google Meet. Please try opening the link manually.', [
      { text: 'OK' },
    ]);
  }
};

/**
 * Opens Google Maps with location (coordinates or address)
 * Prefers native Maps app on iOS, web on Android
 * @param latitude - Latitude coordinate (optional if address provided)
 * @param longitude - Longitude coordinate (optional if address provided)
 * @param address - Address string (optional if coordinates provided)
 */
export const openMapsLocation = async (
  latitude: number | null,
  longitude: number | null,
  address: string | null
): Promise<void> => {
  if (!latitude && !longitude && !address) {
    Alert.alert('Error', 'No location information available.');
    return;
  }

  let url: string;

  try {
    if (latitude && longitude) {
      // Use coordinates
      if (Platform.OS === 'ios') {
        // iOS: Native Maps app
        url = `maps://app?daddr=${latitude},${longitude}`;
      } else {
        // Android: Google Maps web
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
      Alert.alert('Error', 'Invalid location information.');
      return;
    }

    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      // Fallback to web version
      const fallbackUrl =
        latitude && longitude
          ? `https://maps.google.com/?q=${latitude},${longitude}`
          : `https://maps.google.com/?q=${encodeURIComponent(address!)}`;

      const fallbackSupported = await Linking.canOpenURL(fallbackUrl);

      if (fallbackSupported) {
        await Linking.openURL(fallbackUrl);
      } else {
        throw new Error('Cannot open maps');
      }
    }
  } catch (error) {
    console.error('Failed to open maps:', error);
    Alert.alert('Error', 'Failed to open maps. Please try searching for the location manually.', [
      { text: 'OK' },
    ]);
  }
};

/**
 * Opens any URL with generic error handling
 * Useful for custom deep links or external URLs
 * @param url - Full URL to open
 * @param errorMessage - Custom error message to display if opening fails
 */
export const openURL = async (
  url: string,
  errorMessage: string = 'Failed to open link'
): Promise<void> => {
  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', `Cannot open this link: ${url}`, [{ text: 'OK' }]);
      console.warn(`Unsupported URL: ${url}`);
    }
  } catch (error) {
    console.error('Failed to open URL:', error);
    Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
  }
};

/**
 * Checks if a URL can be opened on the current device
 * @param url - URL to check
 * @returns Promise resolving to true if URL can be opened
 */
export const canOpenURL = async (url: string): Promise<boolean> => {
  try {
    return await Linking.canOpenURL(url);
  } catch (error) {
    console.error('Error checking URL support:', error);
    return false;
  }
};
```

### Public Exports

```typescript
// src/utils/index.ts

export { openPhoneCall, openGoogleMeet, openMapsLocation, openURL, canOpenURL } from './deepLinks';
```

---

## Unit Tests

```typescript
// src/utils/deepLinks.test.ts

import { Linking, Alert, Platform } from 'react-native';
import { openPhoneCall, openGoogleMeet, openMapsLocation, openURL, canOpenURL } from './deepLinks';

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  canOpenURL: jest.fn(),
  openURL: jest.fn(),
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('deepLinks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('openPhoneCall', () => {
    it('should open phone app with tel: URL', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);

      await openPhoneCall('+447700900123');

      expect(Linking.canOpenURL).toHaveBeenCalledWith('tel:+447700900123');
      expect(Linking.openURL).toHaveBeenCalledWith('tel:+447700900123');
    });

    it('should show alert if phone calls not supported', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      await openPhoneCall('+447700900123');

      expect(Alert.alert).toHaveBeenCalledWith(
        'Phone Calls Not Supported',
        expect.any(String),
        expect.any(Array)
      );
    });

    it('should handle errors gracefully', async () => {
      (Linking.canOpenURL as jest.Mock).mockRejectedValue(new Error('Test error'));

      await openPhoneCall('+447700900123');

      expect(Alert.alert).toHaveBeenCalledWith('Error', expect.any(String), expect.any(Array));
    });
  });

  describe('openGoogleMeet', () => {
    it('should try app URL first', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValueOnce(true); // App supported

      await openGoogleMeet('https://meet.google.com/abc-defg-hij');

      expect(Linking.canOpenURL).toHaveBeenCalledWith('googlemeet://abc-defg-hij');
      expect(Linking.openURL).toHaveBeenCalledWith('googlemeet://abc-defg-hij');
    });

    it('should fallback to web if app not available', async () => {
      (Linking.canOpenURL as jest.Mock)
        .mockResolvedValueOnce(false) // App not supported
        .mockResolvedValueOnce(true); // Web supported

      await openGoogleMeet('https://meet.google.com/abc-defg-hij');

      expect(Linking.openURL).toHaveBeenCalledWith('https://meet.google.com/abc-defg-hij');
    });

    it('should show error if both app and web fail', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      await openGoogleMeet('https://meet.google.com/abc-defg-hij');

      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  describe('openMapsLocation', () => {
    it('should use iOS Maps app with coordinates on iOS', async () => {
      Platform.OS = 'ios';
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);

      await openMapsLocation(51.5074, -0.1278, null);

      expect(Linking.openURL).toHaveBeenCalledWith('maps://app?daddr=51.5074,-0.1278');
    });

    it('should use Google Maps web with coordinates on Android', async () => {
      Platform.OS = 'android';
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);

      await openMapsLocation(51.5074, -0.1278, null);

      expect(Linking.openURL).toHaveBeenCalledWith('https://maps.google.com/?q=51.5074,-0.1278');
    });

    it('should use address search if coordinates not available', async () => {
      Platform.OS = 'ios';
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);

      await openMapsLocation(null, null, '123 High Street, London');

      expect(Linking.openURL).toHaveBeenCalledWith('maps://app?q=123%20High%20Street%2C%20London');
    });

    it('should fallback to web version if native app fails', async () => {
      Platform.OS = 'ios';
      (Linking.canOpenURL as jest.Mock)
        .mockResolvedValueOnce(false) // Native app not supported
        .mockResolvedValueOnce(true); // Web version supported

      await openMapsLocation(51.5074, -0.1278, null);

      expect(Linking.openURL).toHaveBeenCalledWith('https://maps.google.com/?q=51.5074,-0.1278');
    });

    it('should show alert if no location data provided', async () => {
      await openMapsLocation(null, null, null);

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'No location information available.');
    });
  });

  describe('openURL', () => {
    it('should open supported URLs', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);

      await openURL('https://example.com');

      expect(Linking.openURL).toHaveBeenCalledWith('https://example.com');
    });

    it('should show alert if URL not supported', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      await openURL('unsupported://url');

      expect(Alert.alert).toHaveBeenCalled();
    });

    it('should use custom error message', async () => {
      (Linking.canOpenURL as jest.Mock).mockRejectedValue(new Error('Test error'));

      await openURL('https://example.com', 'Custom error message');

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Custom error message', expect.any(Array));
    });
  });

  describe('canOpenURL', () => {
    it('should return true for supported URLs', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);

      const result = await canOpenURL('tel:+447700900123');

      expect(result).toBe(true);
    });

    it('should return false for unsupported URLs', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      const result = await canOpenURL('unsupported://url');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (Linking.canOpenURL as jest.Mock).mockRejectedValue(new Error('Test error'));

      const result = await canOpenURL('https://example.com');

      expect(result).toBe(false);
    });
  });
});
```

**Test Coverage Target**: 100%

---

## Usage Examples

### Phone Call from Booking Detail

```typescript
import { openPhoneCall } from '@app/utils/deepLinks';

const handlePhoneCall = () => {
  openPhoneCall(booking.phone_number); // e.g., '+447700900123'
};
```

### Google Meet from Booking Detail

```typescript
import { openGoogleMeet } from '@app/utils/deepLinks';

const handleOpenMeet = () => {
  openGoogleMeet(booking.google_meet_link); // 'https://meet.google.com/abc-defg-hij'
};
```

### Maps Navigation from Booking Detail

```typescript
import { openMapsLocation } from '@app/utils/deepLinks';

// With coordinates
const handleOpenMaps = () => {
  openMapsLocation(
    booking.location_coords.latitude,
    booking.location_coords.longitude,
    booking.location_address
  );
};

// With address only
const handleOpenMapsAddress = () => {
  openMapsLocation(null, null, '123 High Street, London, UK');
};
```

### Generic URL Opening

```typescript
import { openURL } from '@app/utils/deepLinks';

const handleOpenCustomLink = () => {
  openURL('https://example.com/booking/123', 'Failed to open booking link');
};
```

### Check URL Support Before Showing UI

```typescript
import { canOpenURL } from '@app/utils/deepLinks';

const [canCall, setCanCall] = useState(false);

useEffect(() => {
  canOpenURL('tel:+447700900123').then(setCanCall);
}, []);

// Conditionally render phone button
{canCall && (
  <Pressable onPress={handlePhoneCall}>
    <Text>Call</Text>
  </Pressable>
)}
```

---

## Platform-Specific Behaviour Summary

| Deep Link Type | iOS                            | Android                          | Fallback                |
| -------------- | ------------------------------ | -------------------------------- | ----------------------- |
| Phone Call     | `tel:+447700900123`            | `tel:+447700900123`              | Alert (unsupported)     |
| Google Meet    | `googlemeet://abc-defg-hij`    | `googlemeet://abc-defg-hij`      | Web (`https://meet...`) |
| Maps (coords)  | `maps://app?daddr=lat,lng`     | `https://maps.google.com/?q=...` | Web (both platforms)    |
| Maps (address) | `maps://app?q=encoded_address` | `https://maps.google.com/?q=...` | Web (both platforms)    |

---

## Error Handling Strategy

1. **Pre-Check with `canOpenURL`**: Always check if URL can be opened before calling `openURL`
2. **Graceful Fallbacks**: Try app → web → show error
3. **User-Friendly Alerts**: Clear messages explaining what went wrong
4. **Console Logging**: Detailed errors logged for debugging (not shown to user)
5. **No Silent Failures**: Always provide feedback (success or error)

---

## Acceptance Criteria

- [ ] `openPhoneCall` opens phone app with correct number
- [ ] `openPhoneCall` shows alert if device doesn't support calls
- [ ] `openGoogleMeet` tries app first, falls back to web
- [ ] `openMapsLocation` uses platform-specific URLs (iOS vs Android)
- [ ] `openMapsLocation` handles both coordinates and address search
- [ ] `openMapsLocation` falls back to web if native app fails
- [ ] `openURL` provides generic deep link handling
- [ ] `canOpenURL` checks URL support without opening
- [ ] All functions handle errors gracefully with user feedback
- [ ] All functions log errors to console for debugging
- [ ] Unit tests achieve 100% coverage
- [ ] TypeScript types exported correctly

---

## Related Files

- **Utility**: `src/utils/deepLinks.ts`
- **Tests**: `src/utils/deepLinks.test.ts`
- **Exports**: `src/utils/index.ts`
- **Usage**: `src/features/Bookings/BookingDetailScreen.tsx`

---

## Dependencies

**No additional dependencies required** - uses React Native's built-in `Linking` API.

---

## Notes

- `Linking.canOpenURL` may return false positives on Android (always returns true for http/https)
- iOS requires URL schemes to be declared in `Info.plist` for `canOpenURL` to work (LSApplicationQueriesSchemes)
- Google Meet app scheme (`googlemeet://`) is undocumented but widely used
- Consider adding analytics tracking for deep link opens (success/failure rates)
- Future enhancement: Add support for WhatsApp, Zoom, Teams deep links
