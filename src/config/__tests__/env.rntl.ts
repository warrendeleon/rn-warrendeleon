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

  it('re-exports APP_ENV from react-native-config (happy path)', () => {
    jest.doMock('react-native-config', () => ({
      APP_ENV: 'development',
    }));

    const { APP_ENV } = loadEnv();

    expect(APP_ENV).toBe('development');
  });

  it('throws if APP_ENV is missing', () => {
    jest.doMock('react-native-config', () => ({
      APP_ENV: undefined,
    }));

    expect(() => loadEnv()).toThrow('Environment validation failed');
    expect(() => loadEnv()).toThrow('APP_ENV');
  });

  it('throws if APP_ENV has an invalid value', () => {
    jest.doMock('react-native-config', () => ({
      APP_ENV: 'staging',
    }));

    expect(() => loadEnv()).toThrow('Environment validation failed');
    expect(() => loadEnv()).toThrow('APP_ENV must be one of: development, production');
  });

  it('reuses cached env on subsequent getEnv() calls', () => {
    jest.doMock('react-native-config', () => ({
      APP_ENV: 'development',
    }));

    const { getEnv } = loadEnv();

    const first = getEnv();
    const second = getEnv();

    expect(second).toBe(first);
  });
});
