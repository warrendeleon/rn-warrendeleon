import { APP_ENV_VALUES, EnvSchema } from '../env.schema';

describe('EnvSchema', () => {
  const validEnv = {
    APP_ENV: 'development',
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
    const result = EnvSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('exports correct APP_ENV_VALUES', () => {
    expect(APP_ENV_VALUES).toEqual(['development', 'production']);
  });
});
