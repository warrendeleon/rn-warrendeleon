/**
 * MSW Request Handlers
 *
 * Mock Service Worker handlers for intercepting HTTP requests during tests.
 * Allows testing with real Redux stores and thunks without network calls.
 *
 * ## Handler Categories
 *
 * | Export                    | HTTP Status | Purpose                          |
 * |---------------------------|-------------|----------------------------------|
 * | `handlers`                | 200         | Default success responses        |
 * | `errorHandlers`           | 500         | Server error scenarios           |
 * | `unauthorizedHandlers`    | 401         | Expired/invalid token scenarios  |
 * | `forbiddenHandlers`       | 403         | Banned/suspended account         |
 * | `conflictHandlers`        | 409         | Duplicate registration           |
 * | `validationErrorHandlers` | 422         | Form validation errors           |
 * | `rateLimitHandlers`       | 429         | Rate limiting scenarios          |
 * | `emailNotConfirmedHandlers` | 400       | Email verification required      |
 * | `storageErrorHandlers`    | 413/404     | File upload/delete errors        |
 * | `timeoutHandlers`         | 408         | Network timeout simulation       |
 * | `offlineHandlers`         | Error       | Network failure simulation       |
 *
 * ## Usage
 *
 * ```typescript
 * import { server, handlers, errorHandlers } from '@app/test-utils';
 *
 * // Default handlers are registered automatically via jest.setup.ts
 *
 * // Override for specific test
 * it('handles server error', async () => {
 *   server.use(...errorHandlers);
 *   // Test error handling
 * });
 *
 * // Handlers reset automatically after each test
 * ```
 *
 * ## Supported APIs
 *
 * - **GitHub Raw Content**: Profile, education, work experience fixtures
 * - **Supabase Auth**: Sign up, sign in, verify, refresh, logout
 * - **Supabase Storage**: Upload, download, delete files
 *
 * @see docs/readme/MSW_TESTING_GUIDE.md for detailed usage
 * @see src/test-utils/msw/server.ts for server setup
 */

import { http, HttpResponse } from 'msw';

import {
  mockEducationCA,
  mockEducationEN,
  mockEducationES,
  mockEducationPL,
  mockEducationTL,
  mockProfileCA,
  mockProfileEN,
  mockProfileES,
  mockProfilePL,
  mockProfileTL,
  mockWorkXPCA,
  mockWorkXPEN,
  mockWorkXPES,
  mockWorkXPPL,
  mockWorkXPTL,
} from './mockData';

/**
 * GitHub Raw Content API Handlers
 *
 * Returns localised fixture data for profile, education, and work experience.
 * Supports: en, es, ca, pl, tl (defaults to en for unknown locales)
 */

const BASE_URL =
  'https://raw.githubusercontent.com/warrendeleon/rn-warrendeleon/main/src/test-utils/fixtures/api';

const languageFixtures = {
  en: {
    profile: mockProfileEN,
    education: mockEducationEN,
    workxp: mockWorkXPEN,
  },
  es: {
    profile: mockProfileES,
    education: mockEducationES,
    workxp: mockWorkXPES,
  },
  ca: {
    profile: mockProfileCA,
    education: mockEducationCA,
    workxp: mockWorkXPCA,
  },
  pl: {
    profile: mockProfilePL,
    education: mockEducationPL,
    workxp: mockWorkXPPL,
  },
  tl: {
    profile: mockProfileTL,
    education: mockEducationTL,
    workxp: mockWorkXPTL,
  },
};

const githubHandlers = [
  // Profile endpoints (all languages)
  http.get(`${BASE_URL}/:lang/profile.json`, ({ params }) => {
    const lang = params.lang as string;
    const fixtures = languageFixtures[lang as keyof typeof languageFixtures] || languageFixtures.en;
    return HttpResponse.json(fixtures.profile, { status: 200 });
  }),

  // Education endpoints (all languages)
  http.get(`${BASE_URL}/:lang/education.json`, ({ params }) => {
    const lang = params.lang as string;
    const fixtures = languageFixtures[lang as keyof typeof languageFixtures] || languageFixtures.en;
    return HttpResponse.json(fixtures.education, { status: 200 });
  }),

  // Work experience endpoints (all languages)
  http.get(`${BASE_URL}/:lang/workxp.json`, ({ params }) => {
    const lang = params.lang as string;
    const fixtures = languageFixtures[lang as keyof typeof languageFixtures] || languageFixtures.en;
    return HttpResponse.json(fixtures.workxp, { status: 200 });
  }),
];

/**
 * Supabase Auth API Handlers
 * For testing Supabase Auth REST API client
 */
const SUPABASE_URL = 'https://test.supabase.co';

/**
 * Mock user data used across handlers
 */
const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  aud: 'authenticated',
  email: 'test@example.com',
  email_confirmed_at: '2025-01-01T00:00:00Z',
  phone: null,
  confirmed_at: '2025-01-01T00:00:00Z',
  last_sign_in_at: '2025-01-01T00:00:00Z',
  created_at: '2025-01-01T00:00:00Z',
  user_metadata: {
    firstName: 'Test',
    lastName: 'User',
  },
};

const supabaseAuthHandlers = [
  // Sign up - Returns user directly (email confirmation required case)
  http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
    return HttpResponse.json(
      {
        ...mockUser,
        email_confirmed_at: null,
        confirmed_at: null,
        last_sign_in_at: null,
      },
      { status: 200 }
    );
  }),

  // Sign in with password
  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json(
      {
        access_token: 'access_token_123',
        refresh_token: 'refresh_token_123',
        token_type: 'bearer',
        expires_in: 3600,
        user: mockUser,
      },
      { status: 200 }
    );
  }),

  // Get current user
  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json(mockUser, { status: 200 });
  }),

  // Update user profile
  http.put(`${SUPABASE_URL}/auth/v1/user`, async ({ request }) => {
    const body = (await request.json()) as { data?: Record<string, unknown> };
    return HttpResponse.json(
      {
        ...mockUser,
        user_metadata: {
          ...mockUser.user_metadata,
          ...(body.data || {}),
        },
      },
      { status: 200 }
    );
  }),

  // Logout
  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return HttpResponse.json({}, { status: 204 });
  }),

  // Password recovery request
  http.post(`${SUPABASE_URL}/auth/v1/recover`, () => {
    return HttpResponse.json({}, { status: 200 });
  }),

  // Email verification (OTP verify)
  http.post(`${SUPABASE_URL}/auth/v1/verify`, () => {
    return HttpResponse.json(
      {
        access_token: 'verified_access_token_123',
        refresh_token: 'verified_refresh_token_123',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          ...mockUser,
          email_confirmed_at: new Date().toISOString(),
          confirmed_at: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  }),

  // Resend email verification
  http.post(`${SUPABASE_URL}/auth/v1/resend`, () => {
    return HttpResponse.json({}, { status: 200 });
  }),

  // Refresh token - match path and check query param inside handler
  http.post(`${SUPABASE_URL}/auth/v1/token`, ({ request }) => {
    const url = new URL(request.url);
    const grantType = url.searchParams.get('grant_type');

    // Only handle refresh_token grant type here
    if (grantType === 'refresh_token') {
      return HttpResponse.json(
        {
          access_token: 'refreshed_access_token_123',
          refresh_token: 'refreshed_refresh_token_123',
          token_type: 'bearer',
          expires_in: 3600,
          user: mockUser,
        },
        { status: 200 }
      );
    }

    // For password grant type, return sign-in response (handled by other tests)
    return HttpResponse.json(
      {
        access_token: 'access_token_123',
        refresh_token: 'refresh_token_123',
        token_type: 'bearer',
        expires_in: 3600,
        user: mockUser,
      },
      { status: 200 }
    );
  }),

  // Password update (while logged in)
  http.put(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json(mockUser, { status: 200 });
  }),
];

/**
 * Supabase Storage API Handlers
 */
const supabaseStorageHandlers = [
  // Upload file to bucket
  http.post(`${SUPABASE_URL}/storage/v1/object/:bucket/*`, async ({ params }) => {
    // Uploads are slower
    const bucket = params.bucket as string;
    const path = Array.isArray(params['0']) ? params['0'].join('/') : params['0'];
    return HttpResponse.json(
      {
        Key: `${bucket}/${path}`,
        Id: 'file-uuid-123',
      },
      { status: 200 }
    );
  }),

  // Get file (download)
  http.get(`${SUPABASE_URL}/storage/v1/object/:bucket/*`, () => {
    // Return a simple blob for testing
    return new HttpResponse(new Blob(['test-file-content']), {
      status: 200,
      headers: { 'Content-Type': 'application/octet-stream' },
    });
  }),

  // Delete file from bucket
  http.delete(`${SUPABASE_URL}/storage/v1/object/:bucket/*`, () => {
    return HttpResponse.json({ message: 'Deleted' }, { status: 200 });
  }),

  // Get public URL
  http.get(`${SUPABASE_URL}/storage/v1/object/public/:bucket/*`, () => {
    return HttpResponse.json(
      {
        publicUrl: 'https://test.supabase.co/storage/v1/object/public/avatars/test.jpg',
      },
      { status: 200 }
    );
  }),

  // List files in bucket
  http.post(`${SUPABASE_URL}/storage/v1/object/list/:bucket`, () => {
    return HttpResponse.json(
      [
        {
          name: 'profile.jpg',
          id: 'file-1',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          metadata: { size: 12345 },
        },
      ],
      { status: 200 }
    );
  }),
];

export const handlers = [...githubHandlers, ...supabaseAuthHandlers, ...supabaseStorageHandlers];

/**
 * Error handlers for testing failure scenarios
 * Use these handlers to override default success responses
 * Example: server.use(...errorHandlers)
 */
export const errorHandlers = [
  http.get(`${BASE_URL}/:lang/profile.json`, () => {
    return HttpResponse.json({ message: 'Network error' }, { status: 500 });
  }),

  http.get(`${BASE_URL}/:lang/education.json`, () => {
    return HttpResponse.json({ message: 'Network error' }, { status: 500 });
  }),

  http.get(`${BASE_URL}/:lang/workxp.json`, () => {
    return HttpResponse.json({ message: 'Network error' }, { status: 500 });
  }),
];

/**
 * 401 Unauthorized handlers
 * Use when testing expired/invalid token scenarios
 */
export const unauthorizedHandlers = [
  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json(
      { error: 'invalid_token', error_description: 'Token has expired' },
      { status: 401 }
    );
  }),

  http.put(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json(
      { error: 'invalid_token', error_description: 'Token has expired' },
      { status: 401 }
    );
  }),

  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json(
      { error: 'invalid_grant', error_description: 'Invalid login credentials' },
      { status: 401 }
    );
  }),
];

/**
 * 403 Forbidden handlers
 * Use when testing banned/suspended account scenarios
 */
export const forbiddenHandlers = [
  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json(
      { error: 'user_banned', error_description: 'User account has been suspended' },
      { status: 403 }
    );
  }),

  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json(
      { error: 'access_denied', error_description: 'Access denied' },
      { status: 403 }
    );
  }),
];

/**
 * 409 Conflict handlers
 * Use when testing duplicate registration scenarios
 */
export const conflictHandlers = [
  http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
    return HttpResponse.json(
      { error: 'user_already_exists', error_description: 'User already registered' },
      { status: 409 }
    );
  }),
];

/**
 * 422 Validation error handlers
 * Use when testing form validation scenarios
 */
export const validationErrorHandlers = [
  http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
    return HttpResponse.json(
      {
        error: 'validation_failed',
        error_description: 'Password must be at least 8 characters',
        details: { field: 'password', code: 'too_short' },
      },
      { status: 422 }
    );
  }),

  http.put(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json(
      {
        error: 'validation_failed',
        error_description: 'Invalid email format',
        details: { field: 'email', code: 'invalid_format' },
      },
      { status: 422 }
    );
  }),
];

/**
 * 429 Rate limit handlers
 * Use when testing rate limiting scenarios
 */
export const rateLimitHandlers = [
  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json(
      {
        error: 'too_many_requests',
        error_description: 'Too many requests. Try again in 60 seconds.',
      },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }),

  http.post(`${SUPABASE_URL}/auth/v1/recover`, () => {
    return HttpResponse.json(
      { error: 'too_many_requests', error_description: 'Too many password reset requests.' },
      { status: 429, headers: { 'Retry-After': '300' } }
    );
  }),

  http.post(`${SUPABASE_URL}/auth/v1/resend`, () => {
    return HttpResponse.json(
      { error: 'too_many_requests', error_description: 'Email rate limit exceeded.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }),
];

/**
 * Email not confirmed handler
 * Use when testing email verification required scenarios
 */
export const emailNotConfirmedHandlers = [
  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json(
      { error: 'email_not_confirmed', error_description: 'Email not confirmed' },
      { status: 400 }
    );
  }),
];

/**
 * Storage error handlers
 */
export const storageErrorHandlers = [
  http.post(`${SUPABASE_URL}/storage/v1/object/:bucket/*`, () => {
    return HttpResponse.json(
      { error: 'storage_error', message: 'File too large' },
      { status: 413 }
    );
  }),

  http.delete(`${SUPABASE_URL}/storage/v1/object/:bucket/*`, () => {
    return HttpResponse.json({ error: 'not_found', message: 'Object not found' }, { status: 404 });
  }),
];

/**
 * Timeout handlers for testing network timeout scenarios
 * Simulates slow network by delaying response indefinitely
 * Example: server.use(...timeoutHandlers)
 */
export const timeoutHandlers = [
  http.post(`${SUPABASE_URL}/auth/v1/token`, async () => {
    // Simulate timeout by never resolving (will be caught by request timeout)
    await new Promise(resolve => setTimeout(resolve, 60000));
    return HttpResponse.json({}, { status: 408 });
  }),

  http.post(`${SUPABASE_URL}/auth/v1/signup`, async () => {
    await new Promise(resolve => setTimeout(resolve, 60000));
    return HttpResponse.json({}, { status: 408 });
  }),

  http.get(`${BASE_URL}/:lang/profile.json`, async () => {
    await new Promise(resolve => setTimeout(resolve, 60000));
    return HttpResponse.json({}, { status: 408 });
  }),
];

/**
 * Offline handlers for testing offline/no network scenarios
 * Returns network error responses
 * Example: server.use(...offlineHandlers)
 */
export const offlineHandlers = [
  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.error();
  }),

  http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
    return HttpResponse.error();
  }),

  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.error();
  }),

  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return HttpResponse.error();
  }),

  http.get(`${BASE_URL}/:lang/profile.json`, () => {
    return HttpResponse.error();
  }),

  http.get(`${BASE_URL}/:lang/education.json`, () => {
    return HttpResponse.error();
  }),

  http.get(`${BASE_URL}/:lang/workxp.json`, () => {
    return HttpResponse.error();
  }),
];
