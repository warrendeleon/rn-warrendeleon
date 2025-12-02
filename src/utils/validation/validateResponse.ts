import { z, ZodError } from 'zod';

import { logError, logWarning } from '../logger';

/**
 * Validate API response with Zod schema
 *
 * Provides runtime validation of API responses with detailed error logging.
 * Throws user-friendly errors when validation fails.
 *
 * @param schema - Zod schema to validate against
 * @param data - Response data to validate
 * @param context - Context for error messages (e.g., 'Supabase Auth signUp')
 * @returns Validated and typed data
 * @throws Error if validation fails
 *
 * @example
 * ```typescript
 * const validatedUser = validateResponse(
 *   UserSchema,
 *   apiResponse,
 *   'Supabase Auth getCurrentUser'
 * );
 * ```
 */
export function validateResponse<T>(schema: z.ZodSchema<T>, data: unknown, context: string): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      logError(`[${context}] Response validation failed`, error, { issues: error.issues });

      // Create user-friendly error message
      const firstError = error.issues[0];
      if (firstError) {
        const fieldPath = firstError.path.join('.');
        throw new Error(`Invalid response from server: ${fieldPath} ${firstError.message}`);
      }

      throw new Error('Invalid response from server');
    }

    throw error;
  }
}

/**
 * Validate response and return null on failure (non-critical validation)
 *
 * Use this for non-critical validations where you want to gracefully handle
 * validation failures without throwing errors.
 *
 * @param schema - Zod schema to validate against
 * @param data - Response data to validate
 * @param context - Context for error messages
 * @returns Validated data or null if validation fails
 *
 * @example
 * ```typescript
 * const optionalData = validateResponseSafe(
 *   MetadataSchema,
 *   apiResponse,
 *   'Optional metadata fetch'
 * );
 *
 * if (optionalData) {
 *   // Use validated data
 * }
 * ```
 */
export function validateResponseSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    logWarning(`[${context}] Response validation failed (non-critical)`, { error });
    return null;
  }
}
