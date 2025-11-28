import Config from 'react-native-config';

/**
 * E2E and Test UI Configuration
 * Uses react-native-config to read from .env files
 * Values are baked in at native build time
 */

/** E2E mocking enabled - returns fixture data instead of real API calls */
export const isE2EMockEnabled = Config.E2E_MOCK === 'true';

/** Test UI enabled - shows MockStatus button and other test-only UI */
export const isTestUIEnabled = Config.ENABLE_TEST_UI === 'true';
