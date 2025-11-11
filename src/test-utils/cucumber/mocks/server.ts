import { setupServer } from 'msw/native';

import { handlers } from './handlers';

/**
 * MSW server for React Native
 * Use this to mock API requests in E2E tests
 */
export const server = setupServer(...handlers);

/**
 * Start the MSW server for E2E tests
 */
export const startMockServer = (): void => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
  console.log('MSW server started for E2E tests');
};

/**
 * Stop the MSW server after E2E tests
 */
export const stopMockServer = (): void => {
  server.close();
  console.log('MSW server stopped');
};

/**
 * Reset handlers between tests
 */
export const resetMockServer = (): void => {
  server.resetHandlers();
};
