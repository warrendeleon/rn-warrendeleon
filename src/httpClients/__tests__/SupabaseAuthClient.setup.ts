/**
 * Shared Test Setup for SupabaseAuthClient Tests
 *
 * Common mocks, fixtures, and helper functions used across
 * all SupabaseAuthClient test files.
 */

import { http, HttpResponse } from 'msw';

import { server } from '@app/test-utils/msw/server';

// Re-export server for convenience
export { server };
export { http, HttpResponse };

// Test URL constant
export const SUPABASE_URL = 'https://test.supabase.co';

// Mock user data for responses
export const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  aud: 'authenticated',
  email: 'test@example.com',
  email_confirmed_at: '2025-01-01T00:00:00Z',
  phone: null,
  confirmed_at: '2025-01-01T00:00:00Z',
  last_sign_in_at: '2025-01-01T00:00:00Z',
  created_at: '2025-01-01T00:00:00Z',
};

export const mockSignInResponse = {
  access_token: 'access_token_123',
  refresh_token: 'refresh_token_123',
  token_type: 'bearer',
  expires_in: 3600,
  user: mockUser,
};

/**
 * Sets up common mocks required for SupabaseAuthClient tests.
 * Call this in a beforeAll or at module level.
 */
export function setupCommonMocks(): void {
  jest.mock('react-native-config', () => ({
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
  }));

  jest.mock('@app/config/e2e', () => ({
    isE2EMockEnabled: jest.fn(() => false),
  }));

  jest.mock('@app/utils/storage/EncryptedStore', () => ({
    EncryptedStore: {
      set: jest.fn(),
      get: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
    EncryptedStoreKey: {
      USER_EMAIL: 'userEmail',
      USER_FIRST_NAME: 'userFirstName',
      USER_LAST_NAME: 'userLastName',
      USER_PHONE_NUMBER: 'userPhoneNumber',
    },
  }));

  jest.mock('@app/utils/storage/SecureStore', () => ({
    SecureStore: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
    SecureStoreKey: {
      ACCESS_TOKEN: 'accessToken',
      REFRESH_TOKEN: 'refreshToken',
      USER_ID: 'userId',
    },
  }));
}

/**
 * Common beforeEach setup for auth client tests.
 */
export function resetTestState(): void {
  jest.clearAllMocks();
  server.resetHandlers();
}

/**
 * Creates a standard success response handler for sign in.
 */
export function createSignInSuccessHandler() {
  return http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json(mockSignInResponse);
  });
}

/**
 * Creates a standard success response handler for sign up.
 */
export function createSignUpSuccessHandler() {
  return http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
    return HttpResponse.json({
      ...mockUser,
      email_confirmed_at: null,
    });
  });
}

/**
 * Creates an error response handler.
 */
export function createErrorHandler(
  endpoint: string,
  errorCode: string,
  message: string,
  status: number
) {
  return http.post(`${SUPABASE_URL}${endpoint}`, () => {
    return HttpResponse.json({ error_code: errorCode, msg: message }, { status });
  });
}
