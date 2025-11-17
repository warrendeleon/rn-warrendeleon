/**
 * Production-safe logger utility
 *
 * Logs errors and warnings only in development mode (__DEV__).
 * In production, errors are silently ignored to prevent information leakage.
 *
 * For production error tracking, consider integrating Sentry or Firebase Crashlytics.
 */

/**
 * Log an error in development mode only
 * @param message - Error message
 * @param error - Optional error object
 * @param context - Optional context data
 */
export const logError = (
  message: string,
  error?: unknown,
  context?: Record<string, unknown>
): void => {
  if (__DEV__) {
    console.error(`[DEV] ${message}`, error, context);
  }
  // In production: error is silently ignored
  // TODO: Integrate Sentry/Crashlytics for production error tracking
};

/**
 * Log a warning in development mode only
 * @param message - Warning message
 * @param context - Optional context data
 */
export const logWarning = (message: string, context?: Record<string, unknown>): void => {
  if (__DEV__) {
    console.warn(`[DEV] ${message}`, context);
  }
  // In production: warning is silently ignored
};

/**
 * Log debug information in development mode only
 * @param message - Debug message
 * @param data - Optional data to log
 */
export const logDebug = (message: string, data?: unknown): void => {
  if (__DEV__) {
    console.log(`[DEV] ${message}`, data);
  }
  // In production: debug info is silently ignored
};
