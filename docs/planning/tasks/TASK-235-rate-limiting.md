# TASK-235: Rate Limiting Implementation

**ID**: TASK-235 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-040](../stories/US-040-change-pin.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Implement rate limiting for PIN change attempts to prevent brute force attacks. Track failed attempts in AsyncStorage, enforce lockout after 3 failed attempts within 15 minutes, and provide clear feedback to users about remaining attempts and lockout duration.

---

## Acceptance Criteria

- [ ] Failed attempt tracking in AsyncStorage
- [ ] 3 attempts allowed per 15-minute window
- [ ] Automatic lockout after exceeding attempts
- [ ] Clear error messages showing remaining attempts
- [ ] Lockout duration displayed (15 minutes)
- [ ] Automatic reset after lockout expires
- [ ] `checkRateLimit` function exported
- [ ] `recordFailedAttempt` function exported
- [ ] `resetRateLimit` function exported
- [ ] TypeScript strict mode compliant
- [ ] 100% unit test coverage

---

## Implementation Details

### Rate Limiting Service

```typescript
// src/services/security/rateLimitService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Rate limit configuration
 */
const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS: 3,
  WINDOW_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
  STORAGE_KEY: '@rate_limit_pin_change',
};

/**
 * Rate limit entry stored in AsyncStorage
 */
interface RateLimitEntry {
  attempts: number;
  firstAttemptTime: number;
  lockedUntil: number | null;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  lockedUntil: number | null;
  message?: string;
}

/**
 * Retrieves the current rate limit entry from storage
 *
 * @returns Promise resolving to RateLimitEntry or null if not found
 */
const getRateLimitEntry = async (): Promise<RateLimitEntry | null> => {
  try {
    const entry = await AsyncStorage.getItem(RATE_LIMIT_CONFIG.STORAGE_KEY);
    if (!entry) {
      return null;
    }
    return JSON.parse(entry);
  } catch (error) {
    console.error('Failed to retrieve rate limit entry:', error);
    return null;
  }
};

/**
 * Stores a rate limit entry in AsyncStorage
 *
 * @param entry - RateLimitEntry to store
 */
const storeRateLimitEntry = async (entry: RateLimitEntry): Promise<void> => {
  try {
    await AsyncStorage.setItem(RATE_LIMIT_CONFIG.STORAGE_KEY, JSON.stringify(entry));
  } catch (error) {
    console.error('Failed to store rate limit entry:', error);
  }
};

/**
 * Checks if the user is currently rate limited
 *
 * @returns Promise resolving to RateLimitResult
 *
 * @example
 * const result = await checkRateLimit();
 * if (!result.allowed) {
 *   console.error(result.message);
 * }
 */
export const checkRateLimit = async (): Promise<RateLimitResult> => {
  const entry = await getRateLimitEntry();

  // No entry means no attempts yet
  if (!entry) {
    return {
      allowed: true,
      remainingAttempts: RATE_LIMIT_CONFIG.MAX_ATTEMPTS,
      lockedUntil: null,
    };
  }

  const now = Date.now();

  // Check if currently locked out
  if (entry.lockedUntil && now < entry.lockedUntil) {
    const remainingLockoutMs = entry.lockedUntil - now;
    const remainingMinutes = Math.ceil(remainingLockoutMs / 60000);

    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: entry.lockedUntil,
      message: `Too many failed attempts. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
    };
  }

  // Check if window has expired
  const windowElapsed = now - entry.firstAttemptTime;
  if (windowElapsed > RATE_LIMIT_CONFIG.WINDOW_DURATION) {
    // Window expired, reset
    await resetRateLimit();
    return {
      allowed: true,
      remainingAttempts: RATE_LIMIT_CONFIG.MAX_ATTEMPTS,
      lockedUntil: null,
    };
  }

  // Check remaining attempts
  const remainingAttempts = RATE_LIMIT_CONFIG.MAX_ATTEMPTS - entry.attempts;

  if (remainingAttempts <= 0) {
    // Shouldn't happen, but handle gracefully
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: entry.lockedUntil,
      message: 'Too many failed attempts. Please try again later.',
    };
  }

  return {
    allowed: true,
    remainingAttempts,
    lockedUntil: null,
  };
};

/**
 * Records a failed PIN change attempt
 *
 * @returns Promise resolving to updated RateLimitResult
 *
 * @example
 * const result = await recordFailedAttempt();
 * if (!result.allowed) {
 *   console.error('Account locked:', result.message);
 * }
 */
export const recordFailedAttempt = async (): Promise<RateLimitResult> => {
  const entry = await getRateLimitEntry();
  const now = Date.now();

  if (!entry) {
    // First failed attempt
    const newEntry: RateLimitEntry = {
      attempts: 1,
      firstAttemptTime: now,
      lockedUntil: null,
    };

    await storeRateLimitEntry(newEntry);

    return {
      allowed: true,
      remainingAttempts: RATE_LIMIT_CONFIG.MAX_ATTEMPTS - 1,
      lockedUntil: null,
      message: `Incorrect PIN. ${RATE_LIMIT_CONFIG.MAX_ATTEMPTS - 1} attempt${RATE_LIMIT_CONFIG.MAX_ATTEMPTS - 1 > 1 ? 's' : ''} remaining.`,
    };
  }

  // Check if window has expired
  const windowElapsed = now - entry.firstAttemptTime;
  if (windowElapsed > RATE_LIMIT_CONFIG.WINDOW_DURATION) {
    // Window expired, reset and record new attempt
    const newEntry: RateLimitEntry = {
      attempts: 1,
      firstAttemptTime: now,
      lockedUntil: null,
    };

    await storeRateLimitEntry(newEntry);

    return {
      allowed: true,
      remainingAttempts: RATE_LIMIT_CONFIG.MAX_ATTEMPTS - 1,
      lockedUntil: null,
      message: `Incorrect PIN. ${RATE_LIMIT_CONFIG.MAX_ATTEMPTS - 1} attempt${RATE_LIMIT_CONFIG.MAX_ATTEMPTS - 1 > 1 ? 's' : ''} remaining.`,
    };
  }

  // Increment attempts
  const newAttempts = entry.attempts + 1;

  // Check if user should be locked out
  if (newAttempts >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
    const lockedUntil = now + RATE_LIMIT_CONFIG.WINDOW_DURATION;
    const updatedEntry: RateLimitEntry = {
      ...entry,
      attempts: newAttempts,
      lockedUntil,
    };

    await storeRateLimitEntry(updatedEntry);

    const remainingMinutes = Math.ceil(RATE_LIMIT_CONFIG.WINDOW_DURATION / 60000);

    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil,
      message: `Too many failed attempts. Please try again in ${remainingMinutes} minutes.`,
    };
  }

  // Update entry with new attempt count
  const updatedEntry: RateLimitEntry = {
    ...entry,
    attempts: newAttempts,
  };

  await storeRateLimitEntry(updatedEntry);

  const remainingAttempts = RATE_LIMIT_CONFIG.MAX_ATTEMPTS - newAttempts;

  return {
    allowed: true,
    remainingAttempts,
    lockedUntil: null,
    message: `Incorrect PIN. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`,
  };
};

/**
 * Resets the rate limit (after successful PIN change)
 *
 * @example
 * await resetRateLimit();
 */
export const resetRateLimit = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(RATE_LIMIT_CONFIG.STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset rate limit:', error);
  }
};

/**
 * Gets the remaining lockout time in milliseconds
 *
 * @returns Promise resolving to remaining lockout time or null if not locked
 *
 * @example
 * const remainingMs = await getRemainingLockoutTime();
 * if (remainingMs) {
 *   console.log(`Locked for ${remainingMs}ms`);
 * }
 */
export const getRemainingLockoutTime = async (): Promise<number | null> => {
  const entry = await getRateLimitEntry();

  if (!entry || !entry.lockedUntil) {
    return null;
  }

  const now = Date.now();
  const remaining = entry.lockedUntil - now;

  if (remaining <= 0) {
    // Lockout expired, reset
    await resetRateLimit();
    return null;
  }

  return remaining;
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/services/security/__tests__/rateLimitService.test.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  getRemainingLockoutTime,
} from '../rateLimitService';

jest.mock('@react-native-async-storage/async-storage');

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('rateLimitService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
  });

  describe('checkRateLimit', () => {
    it('should allow requests when no attempts have been made', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await checkRateLimit();

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(3);
      expect(result.lockedUntil).toBeNull();
    });

    it('should allow requests when attempts are within limit', async () => {
      const entry = {
        attempts: 2,
        firstAttemptTime: Date.now(),
        lockedUntil: null,
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(entry));

      const result = await checkRateLimit();

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(1);
    });

    it('should deny requests when locked out', async () => {
      const lockedUntil = Date.now() + 10 * 60 * 1000; // 10 minutes from now
      const entry = {
        attempts: 3,
        firstAttemptTime: Date.now() - 5 * 60 * 1000,
        lockedUntil,
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(entry));

      const result = await checkRateLimit();

      expect(result.allowed).toBe(false);
      expect(result.remainingAttempts).toBe(0);
      expect(result.lockedUntil).toBe(lockedUntil);
      expect(result.message).toContain('Please try again in');
    });

    it('should reset when window has expired', async () => {
      const entry = {
        attempts: 2,
        firstAttemptTime: Date.now() - 20 * 60 * 1000, // 20 minutes ago
        lockedUntil: null,
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(entry));
      mockAsyncStorage.removeItem.mockResolvedValue();

      const result = await checkRateLimit();

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(3);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('recordFailedAttempt', () => {
    it('should record first failed attempt', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue();

      const result = await recordFailedAttempt();

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(2);
      expect(result.message).toContain('2 attempts remaining');
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should increment attempt count', async () => {
      const entry = {
        attempts: 1,
        firstAttemptTime: Date.now(),
        lockedUntil: null,
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(entry));
      mockAsyncStorage.setItem.mockResolvedValue();

      const result = await recordFailedAttempt();

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(1);
      expect(result.message).toContain('1 attempt remaining');
    });

    it('should lock out after max attempts', async () => {
      const entry = {
        attempts: 2,
        firstAttemptTime: Date.now(),
        lockedUntil: null,
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(entry));
      mockAsyncStorage.setItem.mockResolvedValue();

      const result = await recordFailedAttempt();

      expect(result.allowed).toBe(false);
      expect(result.remainingAttempts).toBe(0);
      expect(result.lockedUntil).toBeGreaterThan(Date.now());
      expect(result.message).toContain('Too many failed attempts');
    });
  });

  describe('resetRateLimit', () => {
    it('should remove rate limit entry from storage', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue();

      await resetRateLimit();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@rate_limit_pin_change');
    });
  });

  describe('getRemainingLockoutTime', () => {
    it('should return null when not locked out', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const remaining = await getRemainingLockoutTime();

      expect(remaining).toBeNull();
    });

    it('should return remaining time when locked out', async () => {
      const lockedUntil = Date.now() + 10 * 60 * 1000;
      const entry = {
        attempts: 3,
        firstAttemptTime: Date.now() - 5 * 60 * 1000,
        lockedUntil,
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(entry));

      const remaining = await getRemainingLockoutTime();

      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(10 * 60 * 1000);
    });

    it('should reset if lockout has expired', async () => {
      const lockedUntil = Date.now() - 1000; // 1 second ago
      const entry = {
        attempts: 3,
        firstAttemptTime: Date.now() - 20 * 60 * 1000,
        lockedUntil,
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(entry));
      mockAsyncStorage.removeItem.mockResolvedValue();

      const remaining = await getRemainingLockoutTime();

      expect(remaining).toBeNull();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalled();
    });
  });
});
```

---

## Dependencies

- `@react-native-async-storage/async-storage` - Storage for rate limit tracking

---

## Definition of Done

- [ ] Rate limiting service implemented
- [ ] All functions exported and documented
- [ ] AsyncStorage integration complete
- [ ] Error handling implemented
- [ ] TypeScript types defined
- [ ] 100% unit test coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-040](../stories/US-040-change-pin.md), [TASK-234](TASK-234-bcrypt-integration.md), [TASK-232](TASK-232-change-pin-ui.md)
