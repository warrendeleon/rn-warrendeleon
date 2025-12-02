/**
 * Production-safe logger utility
 *
 * Logs errors and warnings only in development mode (__DEV__).
 * In production, errors are silently ignored to prevent information leakage.
 *
 * All logged data is automatically sanitised to mask sensitive information:
 * - JWT tokens, Bearer tokens
 * - Email addresses
 * - Passwords and secrets
 * - PII (phone numbers, addresses)
 *
 * For production error tracking, consider integrating Sentry or Firebase Crashlytics.
 */

import { maskSensitiveData } from './logging/maskSensitiveData';

/**
 * Log an error in development mode only
 * @param message - Error message
 * @param error - Optional error object
 * @param context - Optional context data (will be masked)
 */
export const logError = (
  message: string,
  error?: unknown,
  context?: Record<string, unknown>
): void => {
  if (__DEV__) {
    const maskedContext = context ? maskSensitiveData(context) : undefined;
    const maskedError = error ? maskSensitiveData(error) : undefined;
    console.error(`[DEV] ${message}`, maskedError, maskedContext);
  }
  // In production: error is silently ignored
  // TODO: Integrate Sentry/Crashlytics for production error tracking
};

/**
 * Log a warning in development mode only
 * @param message - Warning message
 * @param context - Optional context data (will be masked)
 */
export const logWarning = (message: string, context?: Record<string, unknown>): void => {
  if (__DEV__) {
    const maskedContext = context ? maskSensitiveData(context) : undefined;
    console.warn(`[DEV] ${message}`, maskedContext);
  }
  // In production: warning is silently ignored
};

/**
 * Log debug information in development mode only
 * @param message - Debug message
 * @param data - Optional data to log (will be masked)
 */
export const logDebug = (message: string, data?: unknown): void => {
  if (__DEV__) {
    const maskedData = data !== undefined ? maskSensitiveData(data) : undefined;
    console.log(`[DEV] ${message}`, maskedData);
  }
  // In production: debug info is silently ignored
};
