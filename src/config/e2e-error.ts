/**
 * E2E Error Configuration
 * Reads launch arguments to determine error simulation mode for E2E tests
 */

import { LaunchArguments } from 'react-native-launch-arguments';

import { isE2EMockEnabled } from './e2e';

/**
 * Supported error modes for E2E testing
 */
export type E2EErrorMode = 'none' | 'network' | 'server-500' | 'not-found-404' | 'timeout';

/**
 * Launch arguments interface for E2E error testing
 */
interface E2EErrorLaunchArgs {
  /** Error mode to simulate */
  errorMode?: E2EErrorMode;
  /** Specific endpoint to fail (optional, defaults to 'all') */
  errorEndpoint?: 'all' | 'profile' | 'education' | 'workExperience';
}

/**
 * Error configuration object
 */
export interface E2EErrorConfig {
  /** Whether error simulation is enabled */
  enabled: boolean;
  /** Type of error to simulate */
  errorMode: E2EErrorMode;
  /** Which endpoint should fail */
  errorEndpoint: 'all' | 'profile' | 'education' | 'workExperience';
}

/**
 * Track retry attempts to allow recovery in E2E tests
 */
let retryAttempts = 0;

/**
 * Increment retry attempt counter
 */
export const incrementRetryAttempts = (): void => {
  retryAttempts++;
};

/**
 * Reset retry attempt counter
 */
export const resetRetryAttempts = (): void => {
  retryAttempts = 0;
};

/**
 * Get current retry attempts count
 */
export const getRetryAttempts = (): number => {
  return retryAttempts;
};

/**
 * Get the current E2E error configuration from launch arguments
 *
 * @returns Error configuration object
 *
 * @example
 * // In Detox test:
 * await device.launchApp({
 *   launchArgs: { errorMode: 'network', errorEndpoint: 'all' }
 * });
 *
 * // In React Native code:
 * const errorConfig = getE2EErrorConfig();
 * if (errorConfig.enabled && errorConfig.errorMode === 'network') {
 *   throw new Error('Network error');
 * }
 */
export const getE2EErrorConfig = (): E2EErrorConfig => {
  // Only check launch arguments if E2E mocking is enabled
  if (!isE2EMockEnabled) {
    return {
      enabled: false,
      errorMode: 'none',
      errorEndpoint: 'all',
    };
  }

  try {
    const args = LaunchArguments.value<E2EErrorLaunchArgs>();

    const errorMode = args.errorMode || 'none';
    const errorEndpoint = args.errorEndpoint || 'all';

    return {
      enabled: errorMode !== 'none',
      errorMode,
      errorEndpoint,
    };
  } catch {
    // If launch arguments cannot be read, return default config
    return {
      enabled: false,
      errorMode: 'none',
      errorEndpoint: 'all',
    };
  }
};

/**
 * Check if a specific endpoint should fail
 *
 * @param endpoint - The endpoint to check
 * @returns Whether the endpoint should simulate an error
 */
export const shouldEndpointFail = (
  endpoint: 'profile' | 'education' | 'workExperience'
): boolean => {
  const config = getE2EErrorConfig();

  if (!config.enabled) {
    return false;
  }

  // After first retry, allow success
  if (retryAttempts > 0) {
    return false;
  }

  return config.errorEndpoint === 'all' || config.errorEndpoint === endpoint;
};

/**
 * Create an error based on the current error mode
 *
 * @returns An error object or null if no error should be thrown
 */
export const createE2EError = (): Error | null => {
  const config = getE2EErrorConfig();

  if (!config.enabled) {
    return null;
  }

  switch (config.errorMode) {
    case 'network':
      return new Error('Network request failed');
    case 'server-500':
      return new Error('Internal server error');
    case 'not-found-404':
      return new Error('Resource not found');
    case 'timeout':
      return new Error('Request timeout');
    default:
      return null;
  }
};
