import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * E2E and Test UI Configuration
 * Uses react-native-config to read from .env files
 * Values are baked in at native build time
 * Runtime overrides are persisted to AsyncStorage
 */

const E2E_MOCK_OVERRIDE_KEY = '@e2e_mock_override';

/** Base E2E mock setting from .env (baked at build time) */
const envE2EMockEnabled = Config.E2E_MOCK === 'true';

/** Runtime override for E2E mock (null = use env value) */
let runtimeMockOverride: boolean | null = null;

/** Whether we've loaded the persisted override */
let hasLoadedPersistedOverride = false;

/**
 * Load persisted mock override from AsyncStorage
 * Call this early in app startup
 */
export const loadPersistedMockOverride = async (): Promise<void> => {
  try {
    const value = await AsyncStorage.getItem(E2E_MOCK_OVERRIDE_KEY);
    if (value !== null) {
      runtimeMockOverride = value === 'true' ? true : value === 'false' ? false : null;
    }
    hasLoadedPersistedOverride = true;
  } catch {
    // Ignore errors - fall back to env value
    hasLoadedPersistedOverride = true;
  }
};

/**
 * E2E mocking enabled - returns fixture data instead of real API calls
 * Checks runtime override first, falls back to env value
 */
export const isE2EMockEnabled = (): boolean => {
  return runtimeMockOverride ?? envE2EMockEnabled;
};

/**
 * Set runtime override for E2E mock (for developer testing without rebuild)
 * Persists to AsyncStorage so it survives app reload
 * @param enabled - true to enable mocking, false to disable, null to use env value
 */
export const setE2EMockOverride = async (enabled: boolean | null): Promise<void> => {
  runtimeMockOverride = enabled;

  // Persist to AsyncStorage
  try {
    if (enabled === null) {
      await AsyncStorage.removeItem(E2E_MOCK_OVERRIDE_KEY);
    } else {
      await AsyncStorage.setItem(E2E_MOCK_OVERRIDE_KEY, String(enabled));
    }
  } catch {
    // Ignore storage errors - the in-memory value is still set
  }
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

/**
 * Check if persisted override has been loaded
 */
export const hasLoadedOverride = (): boolean => {
  return hasLoadedPersistedOverride;
};

/** Test UI enabled - shows MockStatus button and other test-only UI */
export const isTestUIEnabled = Config.ENABLE_TEST_UI === 'true';
