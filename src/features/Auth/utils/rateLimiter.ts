import AsyncStorage from '@react-native-async-storage/async-storage';

const RATE_LIMIT_KEY_PREFIX = '@rate_limit:password_reset:';
const MAX_REQUESTS = 3;
const TIME_WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

export interface RateLimitResult {
  allowed: boolean;
  requestsRemaining: number;
  resetTime?: Date;
  error?: string;
}

interface RequestLog {
  timestamps: number[];
}

/**
 * Get rate limit key for a specific email address
 */
const getRateLimitKey = (email: string): string => {
  return `${RATE_LIMIT_KEY_PREFIX}${email.toLowerCase().trim()}`;
};

/**
 * Clean up expired timestamps that are outside the time window
 */
const cleanupExpiredTimestamps = (timestamps: number[], now: number): number[] => {
  return timestamps.filter(timestamp => now - timestamp < TIME_WINDOW_MS);
};

/**
 * Get request log for a specific email address
 */
const getRequestLog = async (email: string): Promise<RequestLog> => {
  try {
    const key = getRateLimitKey(email);
    const data = await AsyncStorage.getItem(key);

    if (!data) {
      return { timestamps: [] };
    }

    const log: RequestLog = JSON.parse(data);
    const now = Date.now();

    // Clean up expired timestamps
    log.timestamps = cleanupExpiredTimestamps(log.timestamps, now);

    return log;
  } catch {
    // On error, return empty log (fail open)
    return { timestamps: [] };
  }
};

/**
 * Save request log for a specific email address
 */
const saveRequestLog = async (email: string, log: RequestLog): Promise<void> => {
  const key = getRateLimitKey(email);
  await AsyncStorage.setItem(key, JSON.stringify(log));
};

/**
 * Calculate when the rate limit will reset (oldest timestamp + time window)
 */
const calculateResetTime = (timestamps: number[]): Date => {
  if (timestamps.length === 0) {
    return new Date();
  }

  const oldestTimestamp = Math.min(...timestamps);
  return new Date(oldestTimestamp + TIME_WINDOW_MS);
};

/**
 * Check if a password reset request is allowed for the given email
 * Returns rate limit information including allowed status, remaining requests, and reset time
 */
export const checkPasswordResetRateLimit = async (email: string): Promise<RateLimitResult> => {
  try {
    const log = await getRequestLog(email);
    const now = Date.now();

    // Clean up expired timestamps
    const activeTimestamps = cleanupExpiredTimestamps(log.timestamps, now);

    // Check if limit is exceeded
    if (activeTimestamps.length >= MAX_REQUESTS) {
      const resetTime = calculateResetTime(activeTimestamps);
      const minutesRemaining = Math.ceil((resetTime.getTime() - now) / (60 * 1000));

      return {
        allowed: false,
        requestsRemaining: 0,
        resetTime,
        error: `You've exceeded the maximum number of password reset requests. Please try again in ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}.`,
      };
    }

    // Request is allowed
    return {
      allowed: true,
      requestsRemaining: MAX_REQUESTS - activeTimestamps.length,
    };
  } catch {
    // On error, allow the request to proceed (fail open)
    return {
      allowed: true,
      requestsRemaining: MAX_REQUESTS,
    };
  }
};

/**
 * Record a password reset request for the given email
 * Should be called after successfully sending a password reset email
 */
export const recordPasswordResetRequest = async (email: string): Promise<void> => {
  try {
    const log = await getRequestLog(email);
    const now = Date.now();

    // Add new timestamp
    log.timestamps.push(now);

    // Clean up expired timestamps
    log.timestamps = cleanupExpiredTimestamps(log.timestamps, now);

    // Save updated log
    await saveRequestLog(email, log);
  } catch {
    // Don't throw error - rate limiting failure should not prevent password reset
  }
};

/**
 * Clear rate limit for a specific email (for testing purposes)
 */
export const clearPasswordResetRateLimit = async (email: string): Promise<void> => {
  try {
    const key = getRateLimitKey(email);
    await AsyncStorage.removeItem(key);
  } catch {
    // Silently fail - clearing rate limit is not critical
  }
};

/**
 * Clear all rate limit data (for testing purposes)
 */
export const clearAllRateLimits = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const rateLimitKeys = keys.filter(key => key.startsWith(RATE_LIMIT_KEY_PREFIX));
    await AsyncStorage.multiRemove(rateLimitKeys);
  } catch {
    // Silently fail - clearing rate limits is not critical
  }
};

/**
 * Get rate limit status for a specific email (for debugging)
 */
export const getRateLimitStatus = async (
  email: string
): Promise<{
  activeRequests: number;
  requestsRemaining: number;
  timestamps: Date[];
  resetTime: Date | null;
}> => {
  const log = await getRequestLog(email);
  const now = Date.now();
  const activeTimestamps = cleanupExpiredTimestamps(log.timestamps, now);

  return {
    activeRequests: activeTimestamps.length,
    requestsRemaining: Math.max(0, MAX_REQUESTS - activeTimestamps.length),
    timestamps: activeTimestamps.map(ts => new Date(ts)),
    resetTime: activeTimestamps.length > 0 ? calculateResetTime(activeTimestamps) : null,
  };
};
