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

export const handlers = [
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
