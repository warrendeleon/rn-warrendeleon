# TASK-354: iCal Generation for "Add to Calendar"

**Epic**: EPIC-031: Book a Call
**User Story**: US-064: Booking Confirmation & Navigation
**Status**: 📋 To Do
**Effort**: 2h
**Priority**: P0 (Critical Path)
**Assigned To**: Warren
**Created**: 2025-11-26

---

## Overview

Implement iCalendar (ICS) file generation for the "Add to Calendar" feature on the Booking Confirmation screen. Generate RFC 5545-compliant ICS files with booking details, then trigger download/share mechanisms for both iOS and Android. Must handle timezones correctly and support both video and phone call event types.

---

## Requirements

### Functional Requirements

**ICS File Generation**:

- Generate RFC 5545-compliant iCalendar files
- Include all required fields (UID, DTSTAMP, DTSTART, DTEND, SUMMARY, DESCRIPTION, LOCATION)
- Include optional fields (ORGANIZER, ATTENDEE, STATUS, SEQUENCE)
- Support VIDEO call type (with Google Meet URL in LOCATION)
- Support PHONE call type (with phone number in DESCRIPTION)
- Correct timezone handling (IANA timezone database)
- Line folding (75 octets per line)
- Proper escaping of special characters (`,`, `;`, `\n`)

**Download/Share Mechanism**:

- **iOS**: Use `react-native-share` to share ICS file
- **Android**: Use `react-native-fs` + `react-native-share` to save and share ICS file
- Fallback: Clipboard copy if sharing fails
- Show success/error toast feedback

**Event Details**:

- **SUMMARY**: "Call with Warren - [Video/Phone]"
- **DESCRIPTION**: Meeting details, Google Meet link (video) or phone instructions (phone)
- **LOCATION**: Google Meet URL (video) or "Phone Call" (phone)
- **ORGANIZER**: Warren's email
- **ATTENDEE**: User's email (if available)
- **ALARM**: 15 minutes before event

### Non-Functional Requirements

**Performance**:

- ICS generation completes in <50ms
- File write completes in <100ms
- Share action triggers immediately

**Compatibility**:

- Works with Apple Calendar (iOS/macOS)
- Works with Google Calendar (all platforms)
- Works with Outlook (all platforms)
- Works with third-party calendar apps

**Error Handling**:

- Handle file system errors (Android)
- Handle share cancellation (user dismisses sheet)
- Handle permission errors (Android storage)
- Show user-friendly error messages

**Testing**:

- 100% unit test coverage for ICS generation
- E2E tests with mocked file system/share APIs
- Test ICS files in real calendar apps

---

## Technical Implementation

### File Structure

```
src/utils/ical/
├── generateICalFile.ts       # Main ICS generation function
├── generateICalFile.test.ts  # Unit tests
├── icalHelpers.ts            # Helper functions (escaping, folding, formatting)
├── icalHelpers.test.ts
└── types.ts                  # TypeScript types
```

### Dependencies

**Install Required Packages**:

```bash
yarn add react-native-share react-native-fs
yarn add -D @types/react-native-share
```

**iOS Setup** (native dependencies):

```bash
cd ios && pod install
```

**Android Setup** (`AndroidManifest.xml`):

```xml
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### RFC 5545 ICS Format Specification

**Required Fields**:

- `BEGIN:VCALENDAR` - Start of calendar object
- `VERSION:2.0` - iCalendar version
- `PRODID:-//Warren De Leon//Book a Call//EN` - Product identifier
- `BEGIN:VEVENT` - Start of event
- `UID:` - Unique identifier (booking ID + timestamp)
- `DTSTAMP:` - Timestamp when event created (UTC)
- `DTSTART:` - Event start time (with timezone)
- `DTEND:` - Event end time (with timezone)
- `SUMMARY:` - Event title
- `END:VEVENT` - End of event
- `END:VCALENDAR` - End of calendar object

**Optional Fields**:

- `DESCRIPTION:` - Event description (meeting details)
- `LOCATION:` - Event location (Google Meet URL or "Phone Call")
- `ORGANIZER:` - Organiser's email
- `ATTENDEE:` - Attendee's email
- `STATUS:CONFIRMED` - Event status
- `SEQUENCE:0` - Event version number
- `BEGIN:VALARM` - Alarm/reminder
- `TRIGGER:-PT15M` - 15 minutes before event

**Line Folding**:
RFC 5545 requires lines to be folded at 75 octets (bytes). Continuation lines start with a space.

Example:

```
DESCRIPTION:This is a very long description that exceeds 75 octets and mus
 t be folded to comply with RFC 5545 specification.
```

**Character Escaping**:

- Comma: `\,`
- Semicolon: `\;`
- Newline: `\n`
- Backslash: `\\`

### Code Example: generateICalFile.ts

```typescript
import { Platform } from 'react-native';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { foldLine, escapeText } from './icalHelpers';
import type { BookingDetails } from './types';

const ORGANIZER_EMAIL = 'warren@warrendeleon.com';
const ORGANIZER_NAME = 'Warren De Leon';
const PRODUCT_ID = '-//Warren De Leon//Book a Call//EN';

export const generateICalFile = async (booking: BookingDetails): Promise<void> => {
  const icsContent = generateICSContent(booking);

  if (Platform.OS === 'ios') {
    await shareICSFileiOS(icsContent);
  } else {
    await shareICSFileAndroid(icsContent);
  }
};

const generateICSContent = (booking: BookingDetails): string => {
  const {
    id,
    date,
    startTime,
    endTime,
    duration,
    callType,
    meetingUrl,
    userPhone,
    userEmail,
    timezone,
  } = booking;

  // Generate unique UID
  const uid = `${id}-${Date.now()}@warrendeleon.com`;

  // Format dates in UTC (iCalendar uses UTC by default)
  const dtStamp = formatICalDate(new Date());
  const dtStart = formatICalDateWithTimezone(new Date(startTime), timezone);
  const dtEnd = formatICalDateWithTimezone(new Date(endTime), timezone);

  // Generate summary
  const summary = `Call with Warren - ${callType === 'video' ? 'Video' : 'Phone'}`;

  // Generate description
  const description = generateDescription(booking);

  // Generate location
  const location = callType === 'video' ? meetingUrl! : 'Phone Call';

  // Build VEVENT
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODUCT_ID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;TZID=${timezone}:${dtStart}`,
    `DTEND;TZID=${timezone}:${dtEnd}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(location)}`,
    `ORGANIZER;CN=${ORGANIZER_NAME}:mailto:${ORGANIZER_EMAIL}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'TRANSP:OPAQUE',
  ];

  // Add attendee if email available
  if (userEmail) {
    lines.push(`ATTENDEE;CN=Guest;RSVP=TRUE:mailto:${userEmail}`);
  }

  // Add alarm (15 minutes before)
  lines.push(
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText('Reminder: Call with Warren in 15 minutes')}`,
    'END:VALARM'
  );

  // Close VEVENT and VCALENDAR
  lines.push('END:VEVENT', 'END:VCALENDAR');

  // Fold lines to 75 octets
  const foldedLines = lines.map(foldLine);

  return foldedLines.join('\r\n');
};

const generateDescription = (booking: BookingDetails): string => {
  const { callType, meetingUrl, userPhone, duration } = booking;

  if (callType === 'video') {
    return [
      `You have a ${duration}-minute video call with Warren.`,
      '',
      'Join via Google Meet:',
      meetingUrl!,
      '',
      'Looking forward to speaking with you!',
      '',
      '- Warren',
    ].join('\n');
  } else {
    return [
      `You have a ${duration}-minute phone call with Warren.`,
      '',
      `Warren will call you at: ${userPhone}`,
      '',
      'Alternatively, you can call Warren directly.',
      '',
      'Looking forward to speaking with you!',
      '',
      '- Warren',
    ].join('\n');
  }
};

const formatICalDate = (date: Date): string => {
  // Format: 20241127T140000Z (UTC)
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
};

const formatICalDateWithTimezone = (date: Date, timezone: string): string => {
  // Format: 20241127T140000 (local time in specified timezone)
  const zonedDate = toZonedTime(date, timezone);
  return format(zonedDate, "yyyyMMdd'T'HHmmss");
};

const shareICSFileiOS = async (icsContent: string): Promise<void> => {
  try {
    // Base64 encode ICS content
    const base64Content = Buffer.from(icsContent).toString('base64');

    await Share.open({
      url: `data:text/calendar;base64,${base64Content}`,
      type: 'text/calendar',
      filename: 'booking.ics',
      title: 'Add to Calendar',
      message: 'Add this event to your calendar',
    });
  } catch (error: any) {
    if (error?.message?.includes('User did not share')) {
      // User cancelled share sheet - not an error
      return;
    }
    throw new Error('Failed to share calendar event');
  }
};

const shareICSFileAndroid = async (icsContent: string): Promise<void> => {
  try {
    // Write ICS file to temporary directory
    const filePath = `${RNFS.CachesDirectoryPath}/booking.ics`;
    await RNFS.writeFile(filePath, icsContent, 'utf8');

    // Share file
    await Share.open({
      url: `file://${filePath}`,
      type: 'text/calendar',
      filename: 'booking.ics',
      title: 'Add to Calendar',
      message: 'Add this event to your calendar',
    });

    // Clean up file after sharing
    await RNFS.unlink(filePath);
  } catch (error: any) {
    if (error?.message?.includes('User did not share')) {
      // User cancelled share sheet - not an error
      return;
    }
    throw new Error('Failed to share calendar event');
  }
};
```

### Code Example: icalHelpers.ts

```typescript
/**
 * Escape special characters per RFC 5545
 * - Backslash: \\
 * - Comma: \,
 * - Semicolon: \;
 * - Newline: \n
 */
export const escapeText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/,/g, '\\,') // Escape commas
    .replace(/;/g, '\\;') // Escape semicolons
    .replace(/\n/g, '\\n'); // Escape newlines
};

/**
 * Fold line to 75 octets per RFC 5545
 * Continuation lines start with a space
 */
export const foldLine = (line: string): string => {
  const maxLength = 75;
  if (line.length <= maxLength) {
    return line;
  }

  const folded: string[] = [];
  let remaining = line;

  // First line can be full 75 octets
  folded.push(remaining.slice(0, maxLength));
  remaining = remaining.slice(maxLength);

  // Continuation lines start with space (74 octets + space)
  while (remaining.length > 0) {
    folded.push(` ${remaining.slice(0, maxLength - 1)}`);
    remaining = remaining.slice(maxLength - 1);
  }

  return folded.join('\r\n');
};

/**
 * Format duration in ISO 8601 duration format
 * Example: PT30M (30 minutes), PT1H (1 hour)
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `PT${minutes}M`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `PT${hours}H`;
  }
  return `PT${hours}H${remainingMinutes}M`;
};
```

### Code Example: types.ts

```typescript
export interface BookingDetails {
  id: string;
  date: string; // ISO 8601 date
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  duration: number; // minutes
  callType: 'video' | 'phone';
  meetingUrl?: string; // Google Meet link (video only)
  userPhone?: string; // User's phone number (phone only)
  userEmail?: string; // User's email (optional)
  timezone: string; // IANA timezone (e.g., 'Europe/London')
}
```

### Example ICS File Output

**Video Call**:

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Warren De Leon//Book a Call//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:booking-123-1732723200000@warrendeleon.com
DTSTAMP:20241127T120000Z
DTSTART;TZID=Europe/London:20241127T140000
DTEND;TZID=Europe/London:20241127T143000
SUMMARY:Call with Warren - Video
DESCRIPTION:You have a 30-minute video call with Warren.\n\nJoin via Googl
 e Meet:\nhttps://meet.google.com/abc-defg-hij\n\nLooking forward to speak
 ing with you!\n\n- Warren
LOCATION:https://meet.google.com/abc-defg-hij
ORGANIZER;CN=Warren De Leon:mailto:warren@warrendeleon.com
ATTENDEE;CN=Guest;RSVP=TRUE:mailto:user@example.com
STATUS:CONFIRMED
SEQUENCE:0
TRANSP:OPAQUE
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder: Call with Warren in 15 minutes
END:VALARM
END:VEVENT
END:VCALENDAR
```

**Phone Call**:

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Warren De Leon//Book a Call//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:booking-456-1732723200000@warrendeleon.com
DTSTAMP:20241127T120000Z
DTSTART;TZID=Europe/London:20241127T140000
DTEND;TZID=Europe/London:20241127T143000
SUMMARY:Call with Warren - Phone
DESCRIPTION:You have a 30-minute phone call with Warren.\n\nWarren will ca
 ll you at: +44 7700 900123\n\nAlternatively\, you can call Warren directl
 y.\n\nLooking forward to speaking with you!\n\n- Warren
LOCATION:Phone Call
ORGANIZER;CN=Warren De Leon:mailto:warren@warrendeleon.com
STATUS:CONFIRMED
SEQUENCE:0
TRANSP:OPAQUE
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder: Call with Warren in 15 minutes
END:VALARM
END:VEVENT
END:VCALENDAR
```

---

## Testing Requirements

### Unit Tests (100% Coverage Required)

**Test File**: `generateICalFile.test.ts`

```typescript
import { generateICalFile } from './generateICalFile';
import { escapeText, foldLine, formatDuration } from './icalHelpers';
import type { BookingDetails } from './types';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

jest.mock('react-native-share');
jest.mock('react-native-fs');

describe('generateICalFile', () => {
  const mockVideoBooking: BookingDetails = {
    id: 'booking-123',
    date: '2024-11-27T00:00:00Z',
    startTime: '2024-11-27T14:00:00Z',
    endTime: '2024-11-27T14:30:00Z',
    duration: 30,
    callType: 'video',
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    userEmail: 'user@example.com',
    timezone: 'Europe/London',
  };

  const mockPhoneBooking: BookingDetails = {
    id: 'booking-456',
    date: '2024-11-27T00:00:00Z',
    startTime: '2024-11-27T14:00:00Z',
    endTime: '2024-11-27T14:30:00Z',
    duration: 30,
    callType: 'phone',
    userPhone: '+44 7700 900123',
    timezone: 'Europe/London',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Video Call ICS Generation', () => {
    it('generates valid ICS content for video call', async () => {
      const icsContent = generateICSContent(mockVideoBooking);

      expect(icsContent).toContain('BEGIN:VCALENDAR');
      expect(icsContent).toContain('VERSION:2.0');
      expect(icsContent).toContain('BEGIN:VEVENT');
      expect(icsContent).toContain('SUMMARY:Call with Warren - Video');
      expect(icsContent).toContain('LOCATION:https://meet.google.com/abc-defg-hij');
      expect(icsContent).toContain('END:VEVENT');
      expect(icsContent).toContain('END:VCALENDAR');
    });

    it('includes organiser details', async () => {
      const icsContent = generateICSContent(mockVideoBooking);

      expect(icsContent).toContain('ORGANIZER;CN=Warren De Leon:mailto:warren@warrendeleon.com');
    });

    it('includes attendee if email provided', async () => {
      const icsContent = generateICSContent(mockVideoBooking);

      expect(icsContent).toContain('ATTENDEE;CN=Guest;RSVP=TRUE:mailto:user@example.com');
    });

    it('includes 15-minute alarm', async () => {
      const icsContent = generateICSContent(mockVideoBooking);

      expect(icsContent).toContain('BEGIN:VALARM');
      expect(icsContent).toContain('TRIGGER:-PT15M');
      expect(icsContent).toContain('END:VALARM');
    });

    it('includes Google Meet URL in description', async () => {
      const icsContent = generateICSContent(mockVideoBooking);

      expect(icsContent).toContain('https://meet.google.com/abc-defg-hij');
    });
  });

  describe('Phone Call ICS Generation', () => {
    it('generates valid ICS content for phone call', async () => {
      const icsContent = generateICSContent(mockPhoneBooking);

      expect(icsContent).toContain('SUMMARY:Call with Warren - Phone');
      expect(icsContent).toContain('LOCATION:Phone Call');
    });

    it('includes phone number in description', async () => {
      const icsContent = generateICSContent(mockPhoneBooking);

      expect(icsContent).toContain('+44 7700 900123');
    });

    it('does not include attendee if email not provided', async () => {
      const icsContent = generateICSContent(mockPhoneBooking);

      expect(icsContent).not.toContain('ATTENDEE');
    });
  });

  describe('iOS Sharing', () => {
    beforeEach(() => {
      jest.spyOn(Platform, 'OS', 'get').mockReturnValue('ios');
    });

    it('shares ICS file via Share API on iOS', async () => {
      await generateICalFile(mockVideoBooking);

      expect(Share.open).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'text/calendar',
          filename: 'booking.ics',
          title: 'Add to Calendar',
        })
      );
    });

    it('base64 encodes ICS content for iOS', async () => {
      await generateICalFile(mockVideoBooking);

      const callArgs = (Share.open as jest.Mock).mock.calls[0][0];
      expect(callArgs.url).toMatch(/^data:text\/calendar;base64,/);
    });

    it('handles user cancellation gracefully', async () => {
      (Share.open as jest.Mock).mockRejectedValue(new Error('User did not share'));

      await expect(generateICalFile(mockVideoBooking)).resolves.not.toThrow();
    });

    it('throws error for other share failures', async () => {
      (Share.open as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(generateICalFile(mockVideoBooking)).rejects.toThrow(
        'Failed to share calendar event'
      );
    });
  });

  describe('Android Sharing', () => {
    beforeEach(() => {
      jest.spyOn(Platform, 'OS', 'get').mockReturnValue('android');
      (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);
      (RNFS.unlink as jest.Mock).mockResolvedValue(undefined);
    });

    it('writes ICS file to cache directory on Android', async () => {
      await generateICalFile(mockVideoBooking);

      expect(RNFS.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('booking.ics'),
        expect.any(String),
        'utf8'
      );
    });

    it('shares ICS file via Share API on Android', async () => {
      await generateICalFile(mockVideoBooking);

      expect(Share.open).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('file://'),
          type: 'text/calendar',
          filename: 'booking.ics',
        })
      );
    });

    it('cleans up temporary file after sharing', async () => {
      await generateICalFile(mockVideoBooking);

      expect(RNFS.unlink).toHaveBeenCalledWith(expect.stringContaining('booking.ics'));
    });

    it('handles user cancellation gracefully', async () => {
      (Share.open as jest.Mock).mockRejectedValue(new Error('User did not share'));

      await expect(generateICalFile(mockVideoBooking)).resolves.not.toThrow();
    });

    it('throws error for write failures', async () => {
      (RNFS.writeFile as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      await expect(generateICalFile(mockVideoBooking)).rejects.toThrow(
        'Failed to share calendar event'
      );
    });
  });
});

describe('icalHelpers', () => {
  describe('escapeText', () => {
    it('escapes backslashes', () => {
      expect(escapeText('C:\\Users\\Warren')).toBe('C:\\\\Users\\\\Warren');
    });

    it('escapes commas', () => {
      expect(escapeText('Warren, Developer')).toBe('Warren\\, Developer');
    });

    it('escapes semicolons', () => {
      expect(escapeText('Key: Value;')).toBe('Key: Value\\;');
    });

    it('escapes newlines', () => {
      expect(escapeText('Line 1\nLine 2')).toBe('Line 1\\nLine 2');
    });

    it('escapes multiple special characters', () => {
      expect(escapeText('A, B; C\nD\\E')).toBe('A\\, B\\; C\\nD\\\\E');
    });
  });

  describe('foldLine', () => {
    it('does not fold lines under 75 characters', () => {
      const short = 'SUMMARY:Call with Warren';
      expect(foldLine(short)).toBe(short);
    });

    it('folds lines over 75 characters', () => {
      const long =
        'DESCRIPTION:This is a very long description that exceeds 75 octets and must be folded to comply with RFC 5545';
      const folded = foldLine(long);

      expect(folded).toContain('\r\n ');
      expect(folded.split('\r\n')[0].length).toBe(75);
    });

    it('folds continuation lines at 74 characters (+ space)', () => {
      const long = 'A'.repeat(150);
      const folded = foldLine(long);
      const lines = folded.split('\r\n');

      expect(lines[1][0]).toBe(' ');
      expect(lines[1].length).toBeLessThanOrEqual(75);
    });
  });

  describe('formatDuration', () => {
    it('formats minutes only', () => {
      expect(formatDuration(30)).toBe('PT30M');
    });

    it('formats hours only', () => {
      expect(formatDuration(60)).toBe('PT1H');
    });

    it('formats hours and minutes', () => {
      expect(formatDuration(90)).toBe('PT1H30M');
    });

    it('formats multiple hours', () => {
      expect(formatDuration(120)).toBe('PT2H');
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

## Integration with BookingConfirmationScreen

**Update BookingConfirmationScreen.tsx**:

```typescript
import { generateICalFile } from '@app/utils/ical';

const handleAddToCalendar = async () => {
  try {
    await generateICalFile(booking);
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
```

---

## Acceptance Criteria

**ICS Generation**:

- [ ] Generates RFC 5545-compliant ICS files
- [ ] Includes all required fields (UID, DTSTAMP, DTSTART, DTEND, SUMMARY)
- [ ] Includes optional fields (DESCRIPTION, LOCATION, ORGANIZER, ATTENDEE, ALARM)
- [ ] Correctly handles video call events (Google Meet URL in LOCATION and DESCRIPTION)
- [ ] Correctly handles phone call events (phone instructions in DESCRIPTION)
- [ ] Correctly formats dates with timezone (DTSTART;TZID=Europe/London)
- [ ] Folds lines to 75 octets per RFC 5545
- [ ] Escapes special characters (`,`, `;`, `\n`, `\\`)

**iOS Sharing**:

- [ ] Shares ICS file via Share sheet on iOS
- [ ] Base64 encodes ICS content for data URL
- [ ] Handles user cancellation gracefully (no error)
- [ ] Shows error toast for share failures

**Android Sharing**:

- [ ] Writes ICS file to cache directory
- [ ] Shares ICS file via Share sheet on Android
- [ ] Cleans up temporary file after sharing
- [ ] Handles user cancellation gracefully (no error)
- [ ] Shows error toast for write/share failures

**Calendar Compatibility**:

- [ ] ICS file imports correctly in Apple Calendar (iOS/macOS)
- [ ] ICS file imports correctly in Google Calendar
- [ ] ICS file imports correctly in Outlook
- [ ] Reminder/alarm appears 15 minutes before event

**Testing**:

- [ ] 100% unit test coverage achieved
- [ ] All edge cases covered (escaping, folding, timezones)
- [ ] Manual testing in real calendar apps

---

## Dependencies

**Blocked By**:

- None (can start immediately)

**Depends On**:

- None

**Blocks**:

- TASK-353 (Confirmation screen) - partial dependency

---

## Implementation Checklist

**Setup**:

- [ ] Install `react-native-share` and `react-native-fs`
- [ ] Run `pod install` for iOS
- [ ] Update `AndroidManifest.xml` with storage permissions
- [ ] Create `src/utils/ical/` directory structure

**Implementation**:

- [ ] Implement `generateICalFile.ts` (main function)
- [ ] Implement `icalHelpers.ts` (escaping, folding, formatting)
- [ ] Implement `types.ts` (TypeScript types)
- [ ] Implement iOS sharing logic
- [ ] Implement Android sharing logic (write + share + cleanup)
- [ ] Add error handling for all failure scenarios

**Testing**:

- [ ] Write unit tests for ICS generation (100% coverage)
- [ ] Write unit tests for helper functions
- [ ] Test iOS sharing flow (mocked)
- [ ] Test Android sharing flow (mocked)
- [ ] Test user cancellation handling
- [ ] Test error scenarios (write failures, share failures)

**Manual Testing**:

- [ ] Generate ICS file and verify format manually
- [ ] Import ICS file into Apple Calendar (iOS/macOS)
- [ ] Import ICS file into Google Calendar
- [ ] Import ICS file into Outlook
- [ ] Verify event details (date, time, location, description, alarm)
- [ ] Test on both iOS and Android devices

**Validation**:

- [ ] Run `yarn validate` (0 errors)
- [ ] Verify 100% test coverage
- [ ] Verify RFC 5545 compliance (line folding, escaping)

---

## Notes

**RFC 5545 Compliance**:

- Must fold lines at 75 octets (bytes, not characters)
- Must escape special characters (`,`, `;`, `\n`, `\\`)
- Must use CRLF (`\r\n`) as line separator
- Must use UTC times for DTSTAMP
- Must use timezone identifier for DTSTART/DTEND (TZID parameter)

**Platform Differences**:

- **iOS**: Uses base64-encoded data URL (no file system access needed)
- **Android**: Writes file to cache directory, then shares, then cleans up

**Calendar App Compatibility**:

- Apple Calendar: Native support, no issues
- Google Calendar: Supports all fields, renders alarms correctly
- Outlook: Supports all fields, may show organiser/attendee differently

**Error Handling**:

- User cancellation (dismissing share sheet) is NOT an error - handle silently
- File system errors (Android) should show user-friendly error toast
- Share API errors should show user-friendly error toast

**Future Enhancements**:

- Add timezone information to ICS file (VTIMEZONE component)
- Support recurring events (RRULE)
- Support multiple attendees
- Add custom alarm times (configurable)
- Add conference data extension for Google Calendar
