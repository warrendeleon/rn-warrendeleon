import { APP_ENV_VALUES, EnvSchema } from '../env.schema';

describe('EnvSchema', () => {
  const validEnv = {
    APP_ENV: 'development',
    API_URL: 'https://raw.githubusercontent.com/warrendeleon/portfolio-data/main',
  };

  it('validates correct environment configuration', () => {
    const result = EnvSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
  });

  it('validates production environment', () => {
    const result = EnvSchema.safeParse({
      ...validEnv,
      APP_ENV: 'production',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid APP_ENV value', () => {
    const result = EnvSchema.safeParse({
      ...validEnv,
      APP_ENV: 'staging',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing APP_ENV', () => {
    const result = EnvSchema.safeParse({
      API_URL: validEnv.API_URL,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing API_URL', () => {
    const result = EnvSchema.safeParse({
      APP_ENV: validEnv.APP_ENV,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid API_URL (not a URL)', () => {
    const result = EnvSchema.safeParse({
      ...validEnv,
      API_URL: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('exports correct APP_ENV_VALUES', () => {
    expect(APP_ENV_VALUES).toEqual(['development', 'production']);
  });
});
