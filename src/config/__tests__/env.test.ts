// Use Jest's manual mock system for react-native-config
jest.mock('react-native-config');

import { ENV, API_URL } from '../env';

describe('env.ts', () => {
  it('re-exports ENV and API_URL from react-native-config', () => {
    expect(ENV).toBe('development');
    expect(API_URL).toBe('https://api-dev.example.com');
  });
});
