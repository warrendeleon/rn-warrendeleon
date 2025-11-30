/**
 * Environment Configuration Schema
 *
 * Validates environment variables loaded from .env files via react-native-config.
 * This schema ensures all required variables are present and have correct types.
 */

import { z } from 'zod';

/**
 * Valid application environment values
 */
export const APP_ENV_VALUES = ['development', 'production'] as const;

/**
 * Environment Configuration Schema
 *
 * Defines and validates all environment variables:
 * - APP_ENV: The current environment (development or production)
 */
export const EnvSchema = z.object({
  /**
   * Application environment
   * Must be either 'development' or 'production'
   */
  APP_ENV: z
    .enum(APP_ENV_VALUES, {
      message: `APP_ENV must be one of: ${APP_ENV_VALUES.join(', ')}`,
    })
    .describe('Application environment (development or production)'),
});

/**
 * TypeScript type inferred from the schema
 * This replaces the manual EnvConfig interface
 */
export type EnvConfig = z.infer<typeof EnvSchema>;

/**
 * App environment type (union of valid values)
 */
export type AppEnv = EnvConfig['APP_ENV'];
