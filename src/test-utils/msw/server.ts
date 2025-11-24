import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/**
 * MSW Server for Node.js (Jest) tests
 * Intercepts HTTP requests during tests and returns mock responses
 *
 * Usage:
 * - Server is automatically started/stopped in jest.setup.ts
 * - Use server.use(...errorHandlers) to override default handlers per test
 * - Use server.resetHandlers() to reset to default handlers
 */

export const server = setupServer(...handlers);
