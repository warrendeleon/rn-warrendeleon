import './customRules'; // Import custom Yup methods

import * as yup from 'yup';

/**
 * Registration Form Validation Schema
 *
 * Validates user registration form data including:
 * - First name and last name (2-50 chars, letters only)
 * - Email (valid format, lowercase)
 * - Phone number (E.164 format with country code)
 * - Password (8+ chars, mixed case, number, special char)
 * - Password confirmation (must match)
 * - Terms acceptance (must be true)
 */
export const registrationSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name is too long')
    .matches(/^[a-zA-Z\s'-]+$/, 'First name cannot contain numbers or special characters')
    .noEmoji('First name cannot contain emojis')
    .trim(),

  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name is too long')
    .matches(/^[a-zA-Z\s'-]+$/, 'Last name cannot contain numbers or special characters')
    .noEmoji('Last name cannot contain emojis')
    .trim(),

  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .noEmoji('Email cannot contain emojis')
    .noDisposableEmail('Disposable email addresses are not allowed')
    .lowercase()
    .trim(),

  phoneNumber: yup
    .string()
    .required('Mobile number is required')
    .phoneNumber('Please enter a valid mobile number')
    .noEmoji('Phone number cannot contain emojis')
    .trim(),

  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!-/:-@[-`{-~])/,
      'Password must include uppercase, lowercase, number, and special character'
    )
    .noEmoji('Password cannot contain emojis')
    .test('no-personal-info', 'Password cannot contain your name or email', function (value) {
      const { email, firstName, lastName } = this.parent;
      if (!value) return true;

      const lowerValue = value.toLowerCase();
      const emailLocal = email
        ?.split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      // Check if password contains email local part (before @)
      if (emailLocal && emailLocal.length >= 3 && lowerValue.includes(emailLocal)) {
        return false;
      }

      // Check if password contains first name
      if (firstName && firstName.length >= 3 && lowerValue.includes(firstName.toLowerCase())) {
        return false;
      }

      // Check if password contains last name
      if (lastName && lastName.length >= 3 && lowerValue.includes(lastName.toLowerCase())) {
        return false;
      }

      return true;
    }),

  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match')
    .noEmoji('Password cannot contain emojis'),

  acceptTerms: yup
    .boolean()
    .required('You must accept the terms and conditions')
    .oneOf([true], 'You must accept the terms and conditions'),
});

export type RegistrationFormData = yup.InferType<typeof registrationSchema>;
