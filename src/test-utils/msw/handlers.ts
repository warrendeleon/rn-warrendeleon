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
 * MSW Request Handlers
 * Mock API responses for testing
 *
 * Intercepts HTTP requests to GitHub raw content API
 * and returns fixture data without network calls
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

const supabaseHandlers = [
  // Sign up - Returns user directly (email confirmation required case)
  http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
    return HttpResponse.json(
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        aud: 'authenticated',
        email: 'test@example.com',
        email_confirmed_at: null,
        phone: null,
        confirmed_at: null,
        last_sign_in_at: null,
        created_at: '2025-01-01T00:00:00Z',
      },
      { status: 200 }
    );
  }),

  // Sign in
  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json(
      {
        access_token: 'access_token_123',
        refresh_token: 'refresh_token_123',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          aud: 'authenticated',
          email: 'test@example.com',
          email_confirmed_at: '2025-01-01T00:00:00Z',
          phone: null,
          confirmed_at: '2025-01-01T00:00:00Z',
          last_sign_in_at: '2025-01-01T00:00:00Z',
          created_at: '2025-01-01T00:00:00Z',
        },
      },
      { status: 200 }
    );
  }),

  // Get current user
  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json(
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        aud: 'authenticated',
        email: 'test@example.com',
        email_confirmed_at: '2025-01-01T00:00:00Z',
        phone: null,
        confirmed_at: '2025-01-01T00:00:00Z',
        last_sign_in_at: '2025-01-01T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
      },
      { status: 200 }
    );
  }),

  // Logout
  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return HttpResponse.json({}, { status: 204 });
  }),
];

export const handlers = [...githubHandlers, ...supabaseHandlers];

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
