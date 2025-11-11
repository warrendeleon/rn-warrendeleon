/**
 * MSW request handlers for E2E tests
 * Add your API mocks here
 *
 * Example:
 * import { http, HttpResponse } from 'msw';
 *
 * export const handlers = [
 *   http.get('https://api.example.com/user', () => {
 *     return HttpResponse.json({ id: 1, name: 'Test User' });
 *   }),
 * ];
 */

export const handlers = [
  // Add your mock API handlers here
  // Example:
  // http.get('/api/settings', () => {
  //   return HttpResponse.json({
  //     theme: 'system',
  //     language: 'en',
  //   });
  // }),
];

// Export individual handler groups if needed
export const authHandlers = [
  // Authentication-related handlers
];

export const settingsHandlers = [
  // Settings-related handlers
];

export const homeHandlers = [
  // Home screen-related handlers
];
