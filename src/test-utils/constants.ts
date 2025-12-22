/**
 * Test Constants
 *
 * Shared constants for use across test files.
 * Centralises magic strings and test data values.
 */

// Valid test credentials
export const TEST_CREDENTIALS = {
  VALID_EMAIL: 'user@example.com',
  VALID_PASSWORD: 'SecurePass123!',
  VALID_FIRST_NAME: 'John',
  VALID_LAST_NAME: 'Doe',
} as const;

// Invalid test credentials
export const INVALID_CREDENTIALS = {
  INVALID_EMAIL: 'invalid-email',
  SHORT_PASSWORD: 'short',
  EMPTY_STRING: '',
  WHITESPACE_ONLY: '   ',
} as const;

// Security test values
export const SECURITY_TEST_VALUES = {
  SQL_INJECTION: "admin'--",
  XSS_ATTEMPT: '<script>alert("xss")</script>',
  NULL_BYTES: 'value\x00with\x00nulls',
  UNICODE_EMAIL: 'tëst@exämple.com',
} as const;

// Error messages for testing
export const TEST_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  NETWORK_ERROR: 'Network request failed',
  TIMEOUT_ERROR: 'Request timed out',
  RATE_LIMIT: 'Too many requests',
  SERVER_ERROR: 'Server error',
  SERVICE_UNAVAILABLE: 'Service unavailable',
  ACCOUNT_SUSPENDED: 'Account suspended',
  EMAIL_NOT_CONFIRMED: 'Email not confirmed',
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Minimum touch target dimensions (simple version - see accessibility.ts for full details)
export const TOUCH_TARGETS = {
  IOS_MIN: 44,
  ANDROID_MIN: 48,
} as const;

// Test timeouts
export const TEST_TIMEOUTS = {
  SHORT: 100,
  MEDIUM: 500,
  LONG: 1000,
  ASYNC_WAIT: 50,
} as const;

// Mock token values
export const MOCK_TOKENS = {
  ACCESS_TOKEN: 'mock_access_token_12345',
  REFRESH_TOKEN: 'mock_refresh_token_67890',
  EXPIRED_TOKEN: 'expired_token',
  MALFORMED_TOKEN: 'not.a.valid.jwt',
} as const;

// Test limits for validation testing
export const TEST_LIMITS = {
  MAX_EMAIL_LENGTH: 254,
  MAX_PASSWORD_LENGTH: 128,
  MAX_NAME_LENGTH: 100,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PHONE_LENGTH: 15,
  MAX_BIO_LENGTH: 500,
} as const;

// Debounce delays used in tests
export const TEST_DEBOUNCE = {
  INPUT: 300,
  SEARCH: 500,
  SCROLL: 100,
} as const;

// Token expiry times (in seconds)
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 3600, // 1 hour
  REFRESH_TOKEN: 604800, // 7 days
  OTP: 300, // 5 minutes
} as const;

// Mock UUIDs for consistent test data
export const MOCK_UUIDS = {
  USER_ID: '550e8400-e29b-41d4-a716-446655440000',
  SESSION_ID: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  PROFILE_ID: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
} as const;
