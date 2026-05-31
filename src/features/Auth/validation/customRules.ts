import { isValidPhoneNumber } from 'libphonenumber-js';
import * as yup from 'yup';

import commonPasswords from './data/common-passwords-10000.json';
import { containsMixedScripts, normalizeAndValidate } from './utils/unicodeUtils';

/**
 * Custom Yup Validation Rules for Authentication Forms
 *
 * Common Password List:
 * - Source: SecLists by Daniel Miessler
 *   https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10k-most-common.txt
 * - Version: Top 10,000 passwords (covers ~91% of all passwords globally)
 * - Last Updated: 2025-12-03
 */

// Convert array to Set for O(1) lookup performance
const COMMON_PASSWORDS_SET = new Set(commonPasswords);

/**
 * Custom validation method for strong passwords
 *
 * Validates that a password meets strength requirements:
 * - At least 8 characters
 * - Contains uppercase letter
 * - Contains lowercase letter
 * - Contains number
 * - Contains special character
 */
yup.addMethod<yup.StringSchema>(
  yup.string,
  'strongPassword',
  function (
    message = 'Password must be stronger (use uppercase, lowercase, numbers, and symbols)'
  ) {
    return this.test('strong-password', message, function (value) {
      const { path, createError } = this;

      if (!value) return true; // Let required() handle empty values

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecialChar = /[@$!%*?&]/.test(value);
      const isLongEnough = value.length >= 8;

      const strength = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar, isLongEnough].filter(
        Boolean
      ).length;

      if (strength < 5) {
        return createError({
          path,
          message,
        });
      }

      return true;
    });
  }
);

/**
 * Custom validation for preventing common passwords
 *
 * Uses top 10,000 most commonly used passwords from SecLists
 * Set provides O(1) lookup vs O(n) array search
 */
yup.addMethod<yup.StringSchema>(
  yup.string,
  'notCommonPassword',
  function (message = 'This password is too common. Please choose a different one.') {
    return this.test('not-common-password', message, function (value) {
      const { path, createError } = this;

      if (!value) return true;

      const isCommon = COMMON_PASSWORDS_SET.has(value.toLowerCase());

      if (isCommon) {
        return createError({ path, message });
      }

      return true;
    });
  }
);

/**
 * Custom validation method to reject emojis
 *
 * Validates that a string does not contain any emoji characters
 */
yup.addMethod<yup.StringSchema>(
  yup.string,
  'noEmoji',
  function (message = 'Emojis are not allowed') {
    return this.test('no-emoji', message, function (value) {
      const { path, createError } = this;

      if (!value) return true; // Let required() handle empty values

      // Full emoji regex covering most emoji ranges
      const emojiRegex =
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

      if (emojiRegex.test(value)) {
        return createError({
          path,
          message,
        });
      }

      return true;
    });
  }
);

/**
 * List of known disposable email domains
 *
 * Common temporary/disposable email services that should be blocked
 * Source: Based on common disposable email provider lists
 */
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  '10minutemail.com',
  'mailinator.com',
  'throwaway.email',
  'fakeinbox.com',
  'trashmail.com',
  'getnada.com',
  'yopmail.com',
  'maildrop.cc',
  'mailnesia.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'discard.email',
  'discardmail.com',
  'mintemail.com',
];

/**
 * Custom validation method to reject disposable email addresses
 *
 * Prevents registration with temporary/disposable email services
 */
yup.addMethod<yup.StringSchema>(
  yup.string,
  'noDisposableEmail',
  function (message = 'Disposable email addresses are not allowed') {
    return this.test('no-disposable-email', message, function (value) {
      const { path, createError } = this;

      if (!value) return true; // Let required() handle empty values

      const domain = value.split('@')[1]?.toLowerCase();

      if (domain && DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
        return createError({
          path,
          message,
        });
      }

      return true;
    });
  }
);

/**
 * Custom validation for international phone numbers
 *
 * Uses libphonenumber-js for proper validation of phone numbers
 * Validates E.164 format and country-specific rules
 */
yup.addMethod<yup.StringSchema>(
  yup.string,
  'phoneNumber',
  function (message = 'Please enter a valid phone number with country code (e.g., +447700900000)') {
    return this.test('phone-number', message, function (value) {
      const { path, createError } = this;

      if (!value) return true; // Let required() handle empty values

      try {
        // Check if it's a valid phone number in E.164 format
        if (!isValidPhoneNumber(value)) {
          return createError({
            path,
            message,
          });
        }

        return true;
      } catch {
        return createError({
          path,
          message,
        });
      }
    });
  }
);

/**
 * Custom validation to prevent homograph attacks in names
 *
 * Prevents Unicode lookalike characters (e.g., Cyrillic 'а' vs Latin 'a')
 * from being used to impersonate legitimate users.
 */
yup.addMethod<yup.StringSchema>(
  yup.string,
  'noHomographs',
  function (message = 'Name contains invalid characters') {
    return this.test('no-homographs', message, function (value) {
      const { path, createError } = this;

      if (!value) return true; // Let required() handle empty values

      // Check for mixed scripts (e.g., Latin + Cyrillic)
      if (containsMixedScripts(value)) {
        return createError({
          path,
          message: 'Name cannot contain mixed character sets',
        });
      }

      // Normalize and validate (only Latin letters allowed)
      const { isValid } = normalizeAndValidate(value);

      if (!isValid) {
        return createError({
          path,
          message,
        });
      }

      return true;
    });
  }
);

/**
 * Custom validation method to reject path-traversal characters
 *
 * Rejects strings containing forward/back slashes or parent-directory
 * sequences. Used on the email field to block path-traversal style input
 * that Yup's permissive email matcher would otherwise accept.
 */
yup.addMethod<yup.StringSchema>(
  yup.string,
  'noPathTraversal',
  function (message = 'Invalid characters in input') {
    return this.test('no-path-traversal', message, function (value) {
      const { path, createError } = this;

      if (!value) return true; // Let required() handle empty values

      if (/[/\\]/.test(value)) {
        return createError({ path, message });
      }

      return true;
    });
  }
);

// TypeScript module augmentation to add custom methods to Yup schema
declare module 'yup' {
  interface StringSchema {
    noPathTraversal(message?: string): this;
    strongPassword(message?: string): this;
    notCommonPassword(message?: string): this;
    noEmoji(message?: string): this;
    noDisposableEmail(message?: string): this;
    phoneNumber(message?: string): this;
    noHomographs(message?: string): this;
  }
}
