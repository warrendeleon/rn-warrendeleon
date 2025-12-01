import AsyncStorage from '@react-native-async-storage/async-storage';

const RATE_LIMIT_KEY_PREFIX = '@rate_limit:email_resend:';
const COOLDOWN_MS = 60 * 1000; // 1 minute in milliseconds

export interface EmailResendRateLimitResult {
  allowed: boolean;
  secondsRemaining: number;
  error?: string;
}

interface ResendLog {
  lastRequestTimestamp: number | null;
}

/**
 * Get rate limit key for a specific email address
 */
const getRateLimitKey = (email: string): string => {
  return `${RATE_LIMIT_KEY_PREFIX}${email.toLowerCase().trim()}`;
};

/**
 * Get request log for a specific email address
 */
const getResendLog = async (email: string): Promise<ResendLog> => {
  try {
    const key = getRateLimitKey(email);
    const data = await AsyncStorage.getItem(key);

    if (!data) {
      return { lastRequestTimestamp: null };
    }

    return JSON.parse(data) as ResendLog;
  } catch {
    // On error, return empty log (fail open)
    return { lastRequestTimestamp: null };
  }
};

/**
 * Save request log for a specific email address
 */
const saveResendLog = async (email: string, log: ResendLog): Promise<void> => {
  const key = getRateLimitKey(email);
  await AsyncStorage.setItem(key, JSON.stringify(log));
};

/**
 * Check if an email resend request is allowed for the given email
 * Returns rate limit information including allowed status and seconds remaining
 */
export const checkEmailResendRateLimit = async (
  email: string
): Promise<EmailResendRateLimitResult> => {
  try {
    const log = await getResendLog(email);
    const now = Date.now();

    // No previous request, allow immediately
    if (log.lastRequestTimestamp === null) {
      return {
        allowed: true,
        secondsRemaining: 0,
      };
    }

    // Check if cooldown has passed
    const timeSinceLastRequest = now - log.lastRequestTimestamp;

    if (timeSinceLastRequest < COOLDOWN_MS) {
      const secondsRemaining = Math.ceil((COOLDOWN_MS - timeSinceLastRequest) / 1000);

      return {
        allowed: false,
        secondsRemaining,
        error: `Please wait ${secondsRemaining} second${secondsRemaining > 1 ? 's' : ''} before requesting another email.`,
      };
    }

    // Cooldown has passed, allow the request
    return {
      allowed: true,
      secondsRemaining: 0,
    };
  } catch {
    // On error, allow the request to proceed (fail open)
    return {
      allowed: true,
      secondsRemaining: 0,
    };
  }
};

/**
 * Record an email resend request for the given email
 * Should be called after successfully sending the email
 */
export const recordEmailResendRequest = async (email: string): Promise<void> => {
  try {
    const log: ResendLog = {
      lastRequestTimestamp: Date.now(),
    };

    await saveResendLog(email, log);
  } catch {
    // Don't throw error - rate limiting failure should not prevent email resend
  }
};

/**
 * Clear email resend rate limit for a specific email (for testing purposes)
 */
export const clearEmailResendRateLimit = async (email: string): Promise<void> => {
  try {
    const key = getRateLimitKey(email);
    await AsyncStorage.removeItem(key);
  } catch {
    // Silently fail - clearing rate limit is not critical
  }
};

/**
 * Get rate limit status for a specific email (for debugging/UI display)
 */
export const getEmailResendRateLimitStatus = async (
  email: string
): Promise<{
  lastRequestTime: Date | null;
  secondsRemaining: number;
  canResend: boolean;
}> => {
  const log = await getResendLog(email);
  const now = Date.now();

  if (log.lastRequestTimestamp === null) {
    return {
      lastRequestTime: null,
      secondsRemaining: 0,
      canResend: true,
    };
  }

  const timeSinceLastRequest = now - log.lastRequestTimestamp;
  const secondsRemaining = Math.max(0, Math.ceil((COOLDOWN_MS - timeSinceLastRequest) / 1000));

  return {
    lastRequestTime: new Date(log.lastRequestTimestamp),
    secondsRemaining,
    canResend: secondsRemaining === 0,
  };
};
