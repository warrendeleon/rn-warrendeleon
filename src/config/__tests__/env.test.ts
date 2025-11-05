// Use Jest's manual mock system for react-native-config
jest.mock('react-native-config');

import { APP_ENV, API_URL } from '../env';

describe('env.ts', () => {
  it('re-exports ENV and API_URL from react-native-config', () => {
    expect(APP_ENV).toBe('development');
    expect(API_URL).toBe('https://api-dev.example.com');
  });
});
