/**
 * E2E Configuration
 * Determines if E2E mocking is enabled based on build-time environment variable
 * process.env.E2E_MOCK is transformed at build time by babel-plugin-transform-inline-environment-variables
 */

export const isE2EMockEnabled = process.env.E2E_MOCK === 'true';
