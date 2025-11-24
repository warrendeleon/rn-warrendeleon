import * as yup from 'yup';

/**
 * Rate Limit Error Response Schema
 *
 * Validates rate limit error responses from authentication endpoints
 * Used for:
 * - Login attempts
 * - Registration attempts
 * - Password reset requests
 * - Any endpoint with rate limiting
 */
export const rateLimitErrorSchema = yup.object({
  message: yup.string().required('Rate limit error message is required'),
  retryAfter: yup
    .number()
    .required('Retry after time is required')
    .positive('Retry after must be positive')
    .integer('Retry after must be an integer'),
  attemptsRemaining: yup.number().min(0, 'Attempts remaining cannot be negative').integer(),
  endpoint: yup.string(),
});

export type RateLimitError = yup.InferType<typeof rateLimitErrorSchema>;

/**
 * Rate Limit Status Schema
 *
 * Validates rate limit status responses
 * Used to check current rate limit status before making requests
 */
export const rateLimitStatusSchema = yup.object({
  isLimited: yup.boolean().required(),
  attemptsRemaining: yup
    .number()
    .required('Attempts remaining is required')
    .min(0, 'Attempts remaining cannot be negative')
    .integer(),
  resetAt: yup
    .date()
    .required('Reset time is required')
    .min(new Date(), 'Reset time must be in the future'),
  windowSeconds: yup
    .number()
    .required('Window duration is required')
    .positive('Window duration must be positive')
    .integer(),
});

export type RateLimitStatus = yup.InferType<typeof rateLimitStatusSchema>;
