# TASK-314: Accessible Error Announcements

**ID**: TASK-314 | **Epic**: [EPIC-028](../epics/EPIC-028-form-validation.md) | **User Story**: [US-056](../stories/US-056-accessible-error-messages.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Implement custom hook and utilities for accessible error announcements to screen readers. Use ARIA live regions, announcer queue management, and prioritization to ensure errors are announced without overwhelming users. Support batch announcements and debouncing.

---

## Acceptance Criteria

- [ ] Hook created in `src/hooks/useErrorAnnouncer.ts`
- [ ] ARIA live region management
- [ ] Announcement queue with priority support
- [ ] Debouncing to prevent announcement spam
- [ ] Batch error announcements
- [ ] Clear previous announcements
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### useErrorAnnouncer Hook

````typescript
// src/hooks/useErrorAnnouncer.ts

import { useRef, useCallback, useEffect } from 'react';

/**
 * Announcement priority
 */
export type AnnouncementPriority = 'polite' | 'assertive';

/**
 * Announcement item
 */
interface Announcement {
  message: string;
  priority: AnnouncementPriority;
  timestamp: number;
}

/**
 * Hook configuration
 */
export interface UseErrorAnnouncerConfig {
  debounceMs?: number;
  maxQueueSize?: number;
}

/**
 * Custom hook for accessible error announcements
 * Manages ARIA live regions for screen reader announcements
 *
 * @example
 * ```typescript
 * const { announce, announceError, announceSuccess } = useErrorAnnouncer();
 *
 * // Announce error
 * announceError('Please enter a valid email address');
 *
 * // Announce success
 * announceSuccess('Form submitted successfully');
 * ```
 */
export function useErrorAnnouncer(config: UseErrorAnnouncerConfig = {}): {
  announce: (message: string, priority?: AnnouncementPriority) => void;
  announceError: (message: string) => void;
  announceSuccess: (message: string) => void;
  announceInfo: (message: string) => void;
  clearAnnouncements: () => void;
} {
  const { debounceMs = 100, maxQueueSize = 5 } = config;

  const queueRef = useRef<Announcement[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  /**
   * Process announcement queue
   */
  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0) return;

    // Sort by priority (assertive first) and timestamp
    const sortedQueue = [...queueRef.current].sort((a, b) => {
      if (a.priority === b.priority) {
        return a.timestamp - b.timestamp;
      }
      return a.priority === 'assertive' ? -1 : 1;
    });

    // Take first announcement
    const announcement = sortedQueue[0];

    // Update live region
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', announcement.priority);
      liveRegionRef.current.textContent = announcement.message;
    }

    // Remove announced message from queue
    queueRef.current = queueRef.current.filter(a => a.timestamp !== announcement.timestamp);

    // Schedule next announcement
    if (queueRef.current.length > 0) {
      timerRef.current = setTimeout(processQueue, debounceMs);
    }
  }, [debounceMs]);

  /**
   * Announce message
   */
  const announce = useCallback(
    (message: string, priority: AnnouncementPriority = 'polite') => {
      // Add to queue
      const announcement: Announcement = {
        message,
        priority,
        timestamp: Date.now(),
      };

      queueRef.current.push(announcement);

      // Limit queue size
      if (queueRef.current.length > maxQueueSize) {
        queueRef.current.shift();
      }

      // Clear existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Schedule processing
      timerRef.current = setTimeout(processQueue, debounceMs);
    },
    [debounceMs, maxQueueSize, processQueue]
  );

  /**
   * Announce error (assertive)
   */
  const announceError = useCallback(
    (message: string) => {
      announce(message, 'assertive');
    },
    [announce]
  );

  /**
   * Announce success (polite)
   */
  const announceSuccess = useCallback(
    (message: string) => {
      announce(message, 'polite');
    },
    [announce]
  );

  /**
   * Announce info (polite)
   */
  const announceInfo = useCallback(
    (message: string) => {
      announce(message, 'polite');
    },
    [announce]
  );

  /**
   * Clear all announcements
   */
  const clearAnnouncements = useCallback(() => {
    queueRef.current = [];
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = '';
    }
  }, []);

  /**
   * Setup live region on mount
   */
  useEffect(() => {
    // Create hidden live region
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';

    document.body.appendChild(liveRegion);
    liveRegionRef.current = liveRegion;

    return () => {
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    announce,
    announceError,
    announceSuccess,
    announceInfo,
    clearAnnouncements,
  };
}
````

---

### React Native Live Region Component

````typescript
// src/components/accessibility/LiveRegion.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, AccessibilityInfo } from 'react-native';

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  children?: React.ReactNode;
}

/**
 * Live region component for screen reader announcements
 * React Native equivalent of ARIA live regions
 *
 * @example
 * ```tsx
 * <LiveRegion message="Form submitted successfully" priority="polite" />
 * ```
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  priority = 'polite',
  children,
}) => {
  const previousMessage = useRef<string>('');

  useEffect(() => {
    // Only announce if message changed
    if (message && message !== previousMessage.current) {
      // Use AccessibilityInfo.announceForAccessibility for React Native
      AccessibilityInfo.announceForAccessibility(message);
      previousMessage.current = message;
    }
  }, [message]);

  return (
    <View
      accessibilityLiveRegion={priority}
      accessibilityRole="alert"
      accessible={false}
      style={{
        position: 'absolute',
        left: -10000,
        width: 1,
        height: 1,
      }}
    >
      {children}
    </View>
  );
};
````

---

### Form Error Announcer Component

````typescript
// src/components/validation/FormErrorAnnouncer.tsx

import React, { useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';
import { FieldErrors } from 'react-hook-form';

interface FormErrorAnnouncerProps {
  errors: FieldErrors;
  debounceMs?: number;
}

/**
 * Announces form errors to screen readers
 * Automatically announces when errors change
 *
 * @example
 * ```tsx
 * const { formState: { errors } } = useForm();
 *
 * <FormErrorAnnouncer errors={errors} />
 * ```
 */
export const FormErrorAnnouncer: React.FC<FormErrorAnnouncerProps> = ({
  errors,
  debounceMs = 300,
}) => {
  const previousErrorsRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Get error messages
    const errorMessages = Object.entries(errors)
      .map(([field, error]) => {
        if (error && typeof error.message === 'string') {
          return `${field}: ${error.message}`;
        }
        return null;
      })
      .filter(Boolean)
      .join('. ');

    // Only announce if errors changed
    if (errorMessages && errorMessages !== previousErrorsRef.current) {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Debounce announcement
      timeoutRef.current = setTimeout(() => {
        const announcement = `Form has ${
          Object.keys(errors).length
        } error${Object.keys(errors).length === 1 ? '' : 's'}. ${errorMessages}`;

        AccessibilityInfo.announceForAccessibility(announcement);
        previousErrorsRef.current = errorMessages;
      }, debounceMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [errors, debounceMs]);

  return null;
};
````

---

### Usage Examples

```typescript
// Example 1: Sign-in form with error announcements
import { useForm } from 'react-hook-form';
import { FormErrorAnnouncer } from '@/components/validation/FormErrorAnnouncer';

function SignInForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <View>
      {/* Form fields */}

      {/* Auto-announce errors */}
      <FormErrorAnnouncer errors={errors} />
    </View>
  );
}

// Example 2: Custom announcements
import { useErrorAnnouncer } from '@/hooks/useErrorAnnouncer';

function CustomForm() {
  const { announceError, announceSuccess } = useErrorAnnouncer();

  const handleSubmit = async () => {
    try {
      await submitForm();
      announceSuccess('Form submitted successfully');
    } catch (error) {
      announceError('Form submission failed. Please try again.');
    }
  };

  return <View>{/* Form */}</View>;
}

// Example 3: Live region for dynamic updates
import { LiveRegion } from '@/components/accessibility/LiveRegion';

function DynamicContent() {
  const [status, setStatus] = useState('');

  return (
    <View>
      <LiveRegion message={status} priority="polite" />
      {/* Dynamic content */}
    </View>
  );
}
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/hooks/__tests__/useErrorAnnouncer.test.ts

import { renderHook, act } from '@testing-library/react-native';
import { useErrorAnnouncer } from '../useErrorAnnouncer';
import { AccessibilityInfo } from 'react-native';

jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo', () => ({
  announceForAccessibility: jest.fn(),
}));

describe('useErrorAnnouncer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should announce error message', () => {
    const { result } = renderHook(() => useErrorAnnouncer());

    act(() => {
      result.current.announceError('Email is required');
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Email is required');
  });

  it('should announce success message', () => {
    const { result } = renderHook(() => useErrorAnnouncer());

    act(() => {
      result.current.announceSuccess('Form submitted');
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Form submitted');
  });

  it('should debounce rapid announcements', () => {
    const { result } = renderHook(() => useErrorAnnouncer({ debounceMs: 300 }));

    act(() => {
      result.current.announceError('Error 1');
      result.current.announceError('Error 2');
      result.current.announceError('Error 3');
    });

    // Should not announce yet
    expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should announce only the last one first
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledTimes(1);
  });

  it('should prioritize assertive announcements', () => {
    const { result } = renderHook(() => useErrorAnnouncer());

    act(() => {
      result.current.announce('Polite message', 'polite');
      result.current.announce('Assertive message', 'assertive');
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Assertive should be announced first
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Assertive message');
  });

  it('should clear announcements', () => {
    const { result } = renderHook(() => useErrorAnnouncer());

    act(() => {
      result.current.announceError('Error');
      result.current.clearAnnouncements();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();
  });

  it('should limit queue size', () => {
    const { result } = renderHook(() => useErrorAnnouncer({ maxQueueSize: 3 }));

    act(() => {
      result.current.announceError('Error 1');
      result.current.announceError('Error 2');
      result.current.announceError('Error 3');
      result.current.announceError('Error 4');
      result.current.announceError('Error 5');
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should only keep last 3
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledTimes(1);
  });
});
```

---

## Dependencies

- React
- React Native
- AccessibilityInfo (React Native)

---

## Definition of Done

- [ ] useErrorAnnouncer hook implemented
- [ ] ARIA live region management working
- [ ] Announcement queue with priority working
- [ ] Debouncing implemented
- [ ] Batch announcements supported
- [ ] Clear announcements working
- [ ] LiveRegion component created
- [ ] FormErrorAnnouncer component created
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-056](../stories/US-056-accessible-error-messages.md), [EPIC-028](../epics/EPIC-028-form-validation.md), [TASK-313](TASK-313-error-message-component.md)
