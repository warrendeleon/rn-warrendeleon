import './customRules'; // Import custom Yup methods

import * as yup from 'yup';

/**
 * Login Form Validation Schema
 *
 * Validates user login form data including:
 * - Email (valid format, lowercase)
 * - Password (non-empty)
 * - Remember me (optional boolean)
 */
export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .noEmoji('Email cannot contain emojis')
    .noDisposableEmail('Disposable email addresses are not allowed')
    .lowercase()
    .trim(),

  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .noEmoji('Password cannot contain emojis'),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
