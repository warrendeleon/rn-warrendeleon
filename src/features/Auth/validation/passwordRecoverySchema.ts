import './customRules'; // Import custom Yup methods

import * as yup from 'yup';

/**
 * Password Recovery Form Validation Schema
 *
 * Validates password recovery request form data including:
 * - Email (valid format, lowercase)
 */
export const passwordRecoverySchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .noEmoji('Email cannot contain emojis')
    .noDisposableEmail('Disposable email addresses are not allowed')
    .lowercase()
    .trim(),
});

export type PasswordRecoveryFormData = yup.InferType<typeof passwordRecoverySchema>;

/**
 * Password Reset Form Validation Schema
 *
 * Validates password reset form data (when user receives reset link):
 * - New password (8+ chars, mixed case, number, special char)
 * - Password confirmation (must match)
 */
export const passwordResetSchema = yup.object({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!-/:-@[-`{-~])/,
      'Password must include uppercase, lowercase, number, and special character'
    )
    .noEmoji('Password cannot contain emojis'),

  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match')
    .noEmoji('Password cannot contain emojis'),
});

export type PasswordResetFormData = yup.InferType<typeof passwordResetSchema>;
