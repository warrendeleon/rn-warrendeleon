/**
 * E2E Configuration
 * Determines if E2E mocking is enabled based on environment variable
 * Injected at bundle time via babel-plugin-transform-inline-environment-variables
 */

export const isE2EMockEnabled = process.env.E2E_MOCK === 'true';
