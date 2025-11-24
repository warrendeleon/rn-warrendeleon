import './customRules'; // Import custom Yup methods

import * as yup from 'yup';

/**
 * Profile Update Form Validation Schema
 *
 * Validates user profile update form data including:
 * - First name and last name (2-50 chars, letters only, optional)
 * - Email (valid format, lowercase, optional)
 * - Phone number (E.164 format with country code, optional)
 *
 * Note: All fields are optional since users may only want to update specific fields
 */
export const profileUpdateSchema = yup.object({
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name is too long')
    .matches(/^[a-zA-Z\s'-]+$/, 'First name cannot contain numbers or special characters')
    .noEmoji('First name cannot contain emojis')
    .trim(),

  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name is too long')
    .matches(/^[a-zA-Z\s'-]+$/, 'Last name cannot contain numbers or special characters')
    .noEmoji('Last name cannot contain emojis')
    .trim(),

  email: yup
    .string()
    .email('Please enter a valid email address')
    .noEmoji('Email cannot contain emojis')
    .noDisposableEmail('Disposable email addresses are not allowed')
    .lowercase()
    .trim(),

  phoneNumber: yup
    .string()
    .phoneNumber('Please enter a valid mobile number')
    .noEmoji('Phone number cannot contain emojis')
    .trim(),
});

export type ProfileUpdateFormData = yup.InferType<typeof profileUpdateSchema>;

/**
 * Change Password Form Validation Schema
 *
 * Validates password change form data including:
 * - Current password (required)
 * - New password (8+ chars, mixed case, number, special char)
 * - Password confirmation (must match new password)
 */
export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Current password is required')
    .max(128, 'Password must not exceed 128 characters')
    .noEmoji('Password cannot contain emojis'),

  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!-/:-@[-`{-~])/,
      'Password must include uppercase, lowercase, number, and special character'
    )
    .noEmoji('Password cannot contain emojis')
    .test('different', 'New password must be different from current password', function (value) {
      return value !== this.parent.currentPassword;
    }),

  confirmNewPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .noEmoji('Password cannot contain emojis'),
});

export type ChangePasswordFormData = yup.InferType<typeof changePasswordSchema>;
