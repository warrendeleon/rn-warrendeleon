// We use Jest's module mocking to control react-native-config per test case.

describe('env.ts', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const loadEnv = () => {
    // Use the path alias configured for this project
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@app/config/env');
  };

  it('re-exports APP_ENV and API_URL from react-native-config (happy path)', () => {
    jest.doMock('react-native-config', () => ({
      APP_ENV: 'development',
      API_URL: 'https://api-dev.example.com',
    }));

    const { APP_ENV, API_URL } = loadEnv();

    expect(APP_ENV).toBe('development');
    expect(API_URL).toBe('https://api-dev.example.com');
  });

  it('throws if APP_ENV is missing', () => {
    jest.doMock('react-native-config', () => ({
      APP_ENV: undefined,
      API_URL: 'https://api-dev.example.com',
    }));

    expect(() => loadEnv()).toThrow('APP_ENV is not defined');
  });

  it('throws if APP_ENV has an invalid value', () => {
    jest.doMock('react-native-config', () => ({
      APP_ENV: 'staging',
      API_URL: 'https://api-dev.example.com',
    }));

    expect(() => loadEnv()).toThrow(
      'APP_ENV must be one of development, production but received "staging"'
    );
  });

  it('throws if API_URL is missing', () => {
    jest.doMock('react-native-config', () => ({
      APP_ENV: 'development',
      API_URL: undefined,
    }));

    expect(() => loadEnv()).toThrow('API_URL is not defined');
  });

  it('reuses cached env on subsequent getEnv() calls', () => {
    jest.doMock('react-native-config', () => ({
      APP_ENV: 'development',
      API_URL: 'https://api-dev.example.com',
    }));

    const { getEnv } = loadEnv();

    const first = getEnv();
    const second = getEnv();

    expect(second).toBe(first);
  });
});
