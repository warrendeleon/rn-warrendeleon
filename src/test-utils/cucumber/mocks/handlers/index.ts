/**
 * MSW request handlers for E2E tests
 * Mocks GitHub API to return local fixtures instead of making real network calls
 */

import { http, HttpResponse } from 'msw';

import educationCA from '@app/test-utils/fixtures/api/ca/education.json';
import profileCA from '@app/test-utils/fixtures/api/ca/profile.json';
import workxpCA from '@app/test-utils/fixtures/api/ca/workxp.json';
import educationEN from '@app/test-utils/fixtures/api/en/education.json';
// Import all language fixtures
import profileEN from '@app/test-utils/fixtures/api/en/profile.json';
import workxpEN from '@app/test-utils/fixtures/api/en/workxp.json';
import educationES from '@app/test-utils/fixtures/api/es/education.json';
import profileES from '@app/test-utils/fixtures/api/es/profile.json';
import workxpES from '@app/test-utils/fixtures/api/es/workxp.json';
import educationPL from '@app/test-utils/fixtures/api/pl/education.json';
import profilePL from '@app/test-utils/fixtures/api/pl/profile.json';
import workxpPL from '@app/test-utils/fixtures/api/pl/workxp.json';
import educationTL from '@app/test-utils/fixtures/api/tl/education.json';
import profileTL from '@app/test-utils/fixtures/api/tl/profile.json';
import workxpTL from '@app/test-utils/fixtures/api/tl/workxp.json';

const BASE_URL =
  'https://raw.githubusercontent.com/warrendeleon/rn-warrendeleon/main/src/test-utils/fixtures/api';

/**
 * GitHub API mock handlers
 * Intercepts requests to GitHub and returns local fixtures
 */
export const githubHandlers = [
  // English (en)
  http.get(`${BASE_URL}/en/profile.json`, () => {
    return HttpResponse.json(profileEN);
  }),
  http.get(`${BASE_URL}/en/education.json`, () => {
    return HttpResponse.json(educationEN);
  }),
  http.get(`${BASE_URL}/en/workxp.json`, () => {
    return HttpResponse.json(workxpEN);
  }),

  // Spanish (es)
  http.get(`${BASE_URL}/es/profile.json`, () => {
    return HttpResponse.json(profileES);
  }),
  http.get(`${BASE_URL}/es/education.json`, () => {
    return HttpResponse.json(educationES);
  }),
  http.get(`${BASE_URL}/es/workxp.json`, () => {
    return HttpResponse.json(workxpES);
  }),

  // Catalan (ca)
  http.get(`${BASE_URL}/ca/profile.json`, () => {
    return HttpResponse.json(profileCA);
  }),
  http.get(`${BASE_URL}/ca/education.json`, () => {
    return HttpResponse.json(educationCA);
  }),
  http.get(`${BASE_URL}/ca/workxp.json`, () => {
    return HttpResponse.json(workxpCA);
  }),

  // Polish (pl)
  http.get(`${BASE_URL}/pl/profile.json`, () => {
    return HttpResponse.json(profilePL);
  }),
  http.get(`${BASE_URL}/pl/education.json`, () => {
    return HttpResponse.json(educationPL);
  }),
  http.get(`${BASE_URL}/pl/workxp.json`, () => {
    return HttpResponse.json(workxpPL);
  }),

  // Tagalog (tl)
  http.get(`${BASE_URL}/tl/profile.json`, () => {
    return HttpResponse.json(profileTL);
  }),
  http.get(`${BASE_URL}/tl/education.json`, () => {
    return HttpResponse.json(educationTL);
  }),
  http.get(`${BASE_URL}/tl/workxp.json`, () => {
    return HttpResponse.json(workxpTL);
  }),
];

/**
 * All MSW handlers for E2E tests
 */
export const handlers = [...githubHandlers];
