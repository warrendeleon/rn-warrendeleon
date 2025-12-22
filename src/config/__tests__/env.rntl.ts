// We use Jest's module mocking to control react-native-config per test case.

describe('env.ts', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const loadEnv = () => {
    // Use the path alias configured for this project
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

describe('env.ts security', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const loadEnv = () => {
    return require('@app/config/env');
  };

  it('should not expose API keys in error messages', () => {
    const secretKey = 'super_secret_api_key_12345';
    jest.doMock('react-native-config', () => ({
      APP_ENV: 'invalid',
      SUPABASE_ANON_KEY: secretKey,
    }));

    try {
      loadEnv();
    } catch (error) {
      // Error message should not contain the secret key
      expect((error as Error).message).not.toContain(secretKey);
    }
  });

  it('should validate environment at startup to prevent runtime errors', () => {
    jest.doMock('react-native-config', () => ({
      // Missing APP_ENV - should fail fast
    }));

    // Should throw immediately, not silently fail later
    expect(() => loadEnv()).toThrow();
  });

  it('should only accept known environment values', () => {
    jest.doMock('react-native-config', () => ({
      APP_ENV: 'debug', // Not a valid value
    }));

    expect(() => loadEnv()).toThrow('Environment validation failed');
  });

  it('should accept production environment', () => {
    jest.doMock('react-native-config', () => ({
      APP_ENV: 'production',
    }));

    const { APP_ENV } = loadEnv();

    expect(APP_ENV).toBe('production');
  });
});
