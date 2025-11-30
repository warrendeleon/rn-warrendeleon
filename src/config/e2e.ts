import Config from 'react-native-config';

/**
 * E2E and Test UI Configuration
 * Uses react-native-config to read from .env files
 * Values are baked in at native build time
 */

/** Base E2E mock setting from .env (baked at build time) */
const envE2EMockEnabled = Config.E2E_MOCK === 'true';

/** Runtime override for E2E mock (null = use env value) */
let runtimeMockOverride: boolean | null = null;

/**
 * E2E mocking enabled - returns fixture data instead of real API calls
 * Checks runtime override first, falls back to env value
 */
export const isE2EMockEnabled = (): boolean => {
  return runtimeMockOverride ?? envE2EMockEnabled;
};

/**
 * Set runtime override for E2E mock (for developer testing without rebuild)
 * @param enabled - true to enable mocking, false to disable, null to use env value
 */
export const setE2EMockOverride = (enabled: boolean | null): void => {
  runtimeMockOverride = enabled;
};

/**
 * Get current runtime override value
 * @returns true/false if overridden, null if using env value
 */
export const getE2EMockOverride = (): boolean | null => {
  return runtimeMockOverride;
};

/**
 * Get the base env value (for display purposes)
 */
export const getEnvE2EMockValue = (): boolean => {
  return envE2EMockEnabled;
};

/** Test UI enabled - shows MockStatus button and other test-only UI */
export const isTestUIEnabled = Config.ENABLE_TEST_UI === 'true';
