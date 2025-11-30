import Config from 'react-native-config';

import { APP_ENV_VALUES, type AppEnv, type EnvConfig, EnvSchema } from '@app/schemas';

// Re-export types and constants for backward compatibility
export { APP_ENV_VALUES };
export type { AppEnv, EnvConfig };

/**
 * Validate environment configuration using Zod schema
 *
 * This function validates all environment variables at app startup.
 * If any variable is missing or invalid, it throws an error with
 * a detailed message explaining what's wrong.
 */
const validateEnv = (): EnvConfig => {
  // Parse and validate environment variables
  // This throws ZodError if validation fails
  const result = EnvSchema.safeParse(Config);

  if (!result.success) {
    // Format error messages for readability
    const errorMessages = result.error.issues
      .map(issue => `  - ${String(issue.path.join('.'))}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `Environment validation failed:\n${errorMessages}\n\n` +
        'Check your .env file has all required variables.'
    );
  }

  return result.data;
};

let cachedEnv: EnvConfig | null = null;

export const getEnv = (): EnvConfig => {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
};

// Single source of truth for the resolved env
export const env = getEnv();

// Convenient named exports
export const { APP_ENV } = env;

// Optional default export for flexibility
export default env;
