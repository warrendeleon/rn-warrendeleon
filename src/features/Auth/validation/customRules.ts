import { isValidPhoneNumber } from 'libphonenumber-js';
import * as yup from 'yup';

import { containsMixedScripts, normalizeAndValidate } from './utils/unicodeUtils';

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
 * Top 100 most commonly used passwords from SecLists
 * Source: https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10k-most-common.txt
 */
const COMMON_PASSWORDS = [
  'password',
  '123456',
  '12345678',
  '1234',
  'qwerty',
  '12345',
  'dragon',
  'pussy',
  'baseball',
  'football',
  'letmein',
  'monkey',
  '696969',
  'abc123',
  'mustang',
  'michael',
  'shadow',
  'master',
  'jennifer',
  '111111',
  '2000',
  'jordan',
  'superman',
  'harley',
  '1234567',
  'fuckme',
  'hunter',
  'fuckyou',
  'trustno1',
  'ranger',
  'buster',
  'thomas',
  'tigger',
  'robert',
  'soccer',
  'fuck',
  'batman',
  'test',
  'pass',
  'killer',
  'hockey',
  'george',
  'charlie',
  'andrew',
  'michelle',
  'love',
  'sunshine',
  'jessica',
  'asshole',
  '6969',
  'pepper',
  'daniel',
  'access',
  '123456789',
  '654321',
  'joshua',
  'maggie',
  'starwars',
  'silver',
  'william',
  'dallas',
  'yankees',
  '123123',
  'ashley',
  '666666',
  'hello',
  'amanda',
  'orange',
  'biteme',
  'freedom',
  'computer',
  'sexy',
  'thunder',
  'nicole',
  'ginger',
  'heather',
  'hammer',
  'summer',
  'corvette',
  'taylor',
  'fucker',
  'austin',
  '1111',
  'merlin',
  'matthew',
  '121212',
  'golfer',
  'cheese',
  'princess',
  'martin',
  'chelsea',
  'patrick',
  'richard',
  'diamond',
  'yellow',
  'bigdog',
  'secret',
  'asdfgh',
  'sparky',
];

yup.addMethod<yup.StringSchema>(
  yup.string,
  'notCommonPassword',
  function (message = 'This password is too common. Please choose a different one.') {
    return this.test('not-common-password', message, function (value) {
      const { path, createError } = this;

      if (!value) return true;

      const isCommon = COMMON_PASSWORDS.some(
        common => value.toLowerCase() === common.toLowerCase()
      );

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

// TypeScript module augmentation to add custom methods to Yup schema
declare module 'yup' {
  interface StringSchema {
    strongPassword(message?: string): this;
    notCommonPassword(message?: string): this;
    noEmoji(message?: string): this;
    noDisposableEmail(message?: string): this;
    phoneNumber(message?: string): this;
    noHomographs(message?: string): this;
  }
}
