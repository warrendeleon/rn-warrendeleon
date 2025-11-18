/**
 * E2E Configuration
 * Determines if E2E mocking is enabled based on react-native-config
 */

import { E2E_MOCK } from './env';

export const isE2EMockEnabled = E2E_MOCK === 'true';
