/**
 * PIN Lockout Service
 *
 * Apple-style incremental lockout for brute-force protection.
 *
 * Lockout schedule:
 * - 1-3 failed attempts: No lockout
 * - 4-5 failed attempts: 1 minute lockout
 * - 6 failed attempts: 5 minutes lockout
 * - 7 failed attempts: 15 minutes lockout
 * - 8 failed attempts: 1 hour lockout
 * - 9+ failed attempts: 24 hours lockout
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCKOUT_KEY = '@pin_lockout';

/**
 * Lockout duration in milliseconds for each attempt threshold
 */
const LOCKOUT_SCHEDULE: Record<number, number> = {
  4: 1 * 60 * 1000, // 1 minute
  5: 1 * 60 * 1000, // 1 minute
  6: 5 * 60 * 1000, // 5 minutes
  7: 15 * 60 * 1000, // 15 minutes
  8: 60 * 60 * 1000, // 1 hour
  9: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Get lockout duration for a given attempt count
 */
const getLockoutDuration = (attempts: number): number => {
  if (attempts <= 3) {
    return 0;
  }

  if (attempts >= 9) {
    return LOCKOUT_SCHEDULE[9] ?? 0;
  }

  return LOCKOUT_SCHEDULE[attempts] ?? 0;
};

/**
 * Stored lockout state
 */
interface LockoutState {
  failedAttempts: number;
  lockedUntil: number | null;
  lastAttemptTime: number;
}

/**
 * Lockout check result
 */
export interface LockoutResult {
  isLocked: boolean;
  remainingAttempts: number;
  lockoutEndTime: number | null;
  lockoutDurationMs: number;
  message?: string;
}

/**
 * Get current lockout state from storage
 */
const getLockoutState = async (): Promise<LockoutState> => {
  try {
    const data = await AsyncStorage.getItem(LOCKOUT_KEY);

    if (!data) {
      return {
        failedAttempts: 0,
        lockedUntil: null,
        lastAttemptTime: 0,
      };
    }

    return JSON.parse(data);
  } catch {
    return {
      failedAttempts: 0,
      lockedUntil: null,
      lastAttemptTime: 0,
    };
  }
};

/**
 * Save lockout state to storage
 */
const saveLockoutState = async (state: LockoutState): Promise<void> => {
  try {
    await AsyncStorage.setItem(LOCKOUT_KEY, JSON.stringify(state));
  } catch {
    // Silently fail - lockout state is best effort
  }
};

/**
 * Format remaining time for display
 */
const formatRemainingTime = (ms: number): string => {
  const totalSeconds = Math.ceil(ms / 1000);
  const totalMinutes = Math.floor(ms / 60000);
  const totalHours = Math.floor(ms / 3600000);

  if (totalHours >= 24) {
    return `${totalHours} hours`;
  }

  if (totalHours >= 2) {
    return `${totalHours} hours`;
  }

  if (totalHours === 1) {
    return '1 hour';
  }

  if (totalMinutes >= 2) {
    return `${totalMinutes} minutes`;
  }

  if (totalMinutes === 1) {
    return '1 minute';
  }

  return `${totalSeconds} seconds`;
};

/**
 * Check if PIN entry is currently locked
 *
 * @returns LockoutResult with lock status and remaining time
 *
 * @example
 * const result = await checkPINLockout();
 * if (result.isLocked) {
 *   console.log(result.message);
 * }
 */
export const checkPINLockout = async (): Promise<LockoutResult> => {
  const state = await getLockoutState();
  const now = Date.now();

  // Check if currently locked
  if (state.lockedUntil && now < state.lockedUntil) {
    const remainingMs = state.lockedUntil - now;

    return {
      isLocked: true,
      remainingAttempts: 0,
      lockoutEndTime: state.lockedUntil,
      lockoutDurationMs: remainingMs,
      message: `Too many failed attempts. Try again in ${formatRemainingTime(remainingMs)}.`,
    };
  }

  // Lockout expired or never locked - calculate remaining attempts
  const remainingAttempts = Math.max(0, 3 - state.failedAttempts);

  return {
    isLocked: false,
    remainingAttempts,
    lockoutEndTime: null,
    lockoutDurationMs: 0,
  };
};

/**
 * Record a failed PIN attempt
 *
 * @returns Updated LockoutResult after recording the failure
 */
export const recordFailedPINAttempt = async (): Promise<LockoutResult> => {
  const state = await getLockoutState();
  const now = Date.now();

  // If lockout expired, reset attempts
  if (state.lockedUntil && now >= state.lockedUntil) {
    state.failedAttempts = 0;
    state.lockedUntil = null;
  }

  // Increment failed attempts
  state.failedAttempts += 1;
  state.lastAttemptTime = now;

  // Calculate lockout if needed
  const lockoutDuration = getLockoutDuration(state.failedAttempts);

  if (lockoutDuration > 0) {
    state.lockedUntil = now + lockoutDuration;
  }

  await saveLockoutState(state);

  // Return updated status
  if (state.lockedUntil) {
    return {
      isLocked: true,
      remainingAttempts: 0,
      lockoutEndTime: state.lockedUntil,
      lockoutDurationMs: lockoutDuration,
      message: `Too many failed attempts. Try again in ${formatRemainingTime(lockoutDuration)}.`,
    };
  }

  const remainingAttempts = Math.max(0, 3 - state.failedAttempts);
  const attemptText = remainingAttempts === 1 ? 'attempt' : 'attempts';

  return {
    isLocked: false,
    remainingAttempts,
    lockoutEndTime: null,
    lockoutDurationMs: 0,
    message:
      remainingAttempts > 0
        ? `Incorrect PIN. ${remainingAttempts} ${attemptText} remaining.`
        : undefined,
  };
};

/**
 * Reset lockout state after successful PIN entry
 *
 * Should be called after successful PIN verification.
 */
export const resetPINLockout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LOCKOUT_KEY);
  } catch {
    // Silently fail - reset is best effort
  }
};

/**
 * Get current failed attempt count
 *
 * Useful for displaying attempt counter to user.
 */
export const getFailedAttemptCount = async (): Promise<number> => {
  const state = await getLockoutState();
  const now = Date.now();

  // If lockout expired, attempts are reset
  if (state.lockedUntil && now >= state.lockedUntil) {
    return 0;
  }

  return state.failedAttempts;
};

/**
 * Force clear all lockout data (for testing/development)
 */
export const clearAllLockoutData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LOCKOUT_KEY);
  } catch {
    // Silently fail
  }
};
