# TASK-303: Create Shared Validation Schemas

**ID**: TASK-303 | **Epic**: [EPIC-028](../epics/EPIC-028-form-validation.md) | **User Story**: [US-054](../stories/US-054-validation-schema-library.md)
**Status**: 📋 To Do | **Effort**: 3h

---

## Task Description

Create a comprehensive library of shared validation schemas using Yup. Define reusable validation rules for common form fields (email, password, PIN, name, phone, dates). Ensure consistency across all forms, centralize validation logic, and make schemas easily composable.

---

## Acceptance Criteria

- [ ] Shared validation schemas created in `src/validation/schemas/`
- [ ] Email validation schema with proper regex
- [ ] Password validation schema with strength requirements
- [ ] PIN validation schema (6 digits)
- [ ] Name validation schemas (first/last name)
- [ ] Phone number validation (international format)
- [ ] Date validation schemas
- [ ] URL validation schema
- [ ] All schemas support custom error messages
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Shared Validation Schemas

```typescript
// src/validation/schemas/commonSchemas.ts

import * as Yup from 'yup';

/**
 * Email validation schema
 */
export const emailSchema = Yup.string()
  .required('Email is required')
  .email('Please enter a valid email address')
  .lowercase()
  .trim()
  .max(255, 'Email must be less than 255 characters');

/**
 * Password validation schema
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = Yup.string()
  .required('Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

/**
 * PIN validation schema (6 digits)
 */
export const pinSchema = Yup.string()
  .required('PIN is required')
  .matches(/^\d{6}$/, 'PIN must be exactly 6 digits')
  .test('no-sequential', 'PIN cannot be sequential (e.g. 123456)', value => {
    if (!value) return true;
    return !isSequentialDigits(value);
  })
  .test('no-repeated', 'PIN cannot be all the same digit (e.g. 111111)', value => {
    if (!value) return true;
    return !/^(\d)\1{5}$/.test(value);
  });

/**
 * First name validation schema
 */
export const firstNameSchema = Yup.string()
  .required('First name is required')
  .min(1, 'First name is required')
  .max(50, 'First name must be less than 50 characters')
  .matches(
    /^[a-zA-Z\s'-]+$/,
    'First name can only contain letters, spaces, hyphens, and apostrophes'
  )
  .trim();

/**
 * Last name validation schema
 */
export const lastNameSchema = Yup.string()
  .required('Last name is required')
  .min(1, 'Last name is required')
  .max(50, 'Last name must be less than 50 characters')
  .matches(
    /^[a-zA-Z\s'-]+$/,
    'Last name can only contain letters, spaces, hyphens, and apostrophes'
  )
  .trim();

/**
 * Phone number validation schema (international format)
 */
export const phoneNumberSchema = Yup.string()
  .required('Phone number is required')
  .matches(
    /^\+[1-9]\d{1,14}$/,
    'Please enter a valid international phone number (e.g. +1234567890)'
  );

/**
 * Date of birth validation schema
 */
export const dateOfBirthSchema = Yup.date()
  .required('Date of birth is required')
  .max(new Date(), 'Date of birth cannot be in the future')
  .test('is-adult', 'You must be at least 18 years old', value => {
    if (!value) return true;
    const today = new Date();
    const birthDate = new Date(value);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const isOver18 = age > 18 || (age === 18 && monthDiff >= 0);
    return isOver18;
  });

/**
 * URL validation schema
 */
export const urlSchema = Yup.string()
  .url('Please enter a valid URL')
  .max(2048, 'URL must be less than 2048 characters')
  .nullable();

/**
 * Required string schema
 */
export const requiredStringSchema = (fieldName: string) =>
  Yup.string().required(`${fieldName} is required`).trim().min(1, `${fieldName} cannot be empty`);

/**
 * Optional string schema
 */
export const optionalStringSchema = (maxLength: number = 255) =>
  Yup.string()
    .max(maxLength, `Must be less than ${maxLength} characters`)
    .nullable()
    .transform(value => (value === '' ? null : value));

/**
 * Check if digits are sequential
 */
function isSequentialDigits(value: string): boolean {
  const digits = value.split('').map(Number);

  // Check ascending sequence
  let isAscending = true;
  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== digits[i - 1] + 1) {
      isAscending = false;
      break;
    }
  }

  // Check descending sequence
  let isDescending = true;
  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== digits[i - 1] - 1) {
      isDescending = false;
      break;
    }
  }

  return isAscending || isDescending;
}
```

---

### Authentication Schemas

```typescript
// src/validation/schemas/authSchemas.ts

import * as Yup from 'yup';
import {
  emailSchema,
  passwordSchema,
  pinSchema,
  firstNameSchema,
  lastNameSchema,
  phoneNumberSchema,
  dateOfBirthSchema,
} from './commonSchemas';

/**
 * Sign In schema
 */
export const signInSchema = Yup.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Sign Up schema
 */
export const signUpSchema = Yup.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
  dateOfBirth: dateOfBirthSchema,
  phoneNumber: phoneNumberSchema,
});

/**
 * Forgot Password schema
 */
export const forgotPasswordSchema = Yup.object({
  email: emailSchema,
});

/**
 * Reset Password schema
 */
export const resetPasswordSchema = Yup.object({
  password: passwordSchema,
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

/**
 * Setup PIN schema
 */
export const setupPinSchema = Yup.object({
  pin: pinSchema,
  confirmPin: Yup.string()
    .required('Please confirm your PIN')
    .oneOf([Yup.ref('pin')], 'PINs must match'),
});

/**
 * Verify PIN schema
 */
export const verifyPinSchema = Yup.object({
  pin: pinSchema,
});

/**
 * Change Password schema
 */
export const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: Yup.string()
    .required('Please confirm your new password')
    .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
});

/**
 * Change PIN schema
 */
export const changePinSchema = Yup.object({
  currentPin: pinSchema,
  newPin: pinSchema.test(
    'different-from-current',
    'New PIN must be different from current PIN',
    function (value) {
      return value !== this.parent.currentPin;
    }
  ),
  confirmNewPin: Yup.string()
    .required('Please confirm your new PIN')
    .oneOf([Yup.ref('newPin')], 'PINs must match'),
});
```

---

### Profile Schemas

```typescript
// src/validation/schemas/profileSchemas.ts

import * as Yup from 'yup';
import {
  firstNameSchema,
  lastNameSchema,
  phoneNumberSchema,
  dateOfBirthSchema,
} from './commonSchemas';

/**
 * Update Profile schema
 */
export const updateProfileSchema = Yup.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  phoneNumber: phoneNumberSchema,
  dateOfBirth: dateOfBirthSchema,
});

/**
 * Update Profile Picture schema
 */
export const updateProfilePictureSchema = Yup.object({
  imageUri: Yup.string().required('Image is required'),
  mimeType: Yup.string()
    .required('MIME type is required')
    .oneOf(['image/jpeg', 'image/png'], 'Only JPEG and PNG images are allowed'),
  fileSize: Yup.number()
    .required('File size is required')
    .max(10485760, 'Image size must be less than 10MB'), // 10MB
});
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/validation/schemas/__tests__/commonSchemas.test.ts

import {
  emailSchema,
  passwordSchema,
  pinSchema,
  firstNameSchema,
  lastNameSchema,
  phoneNumberSchema,
  dateOfBirthSchema,
  urlSchema,
} from '../commonSchemas';

describe('Common Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should validate correct email', async () => {
      await expect(emailSchema.validate('test@example.com')).resolves.toBe('test@example.com');
    });

    it('should reject invalid email', async () => {
      await expect(emailSchema.validate('invalid-email')).rejects.toThrow(
        'Please enter a valid email address'
      );
    });

    it('should reject empty email', async () => {
      await expect(emailSchema.validate('')).rejects.toThrow('Email is required');
    });

    it('should lowercase email', async () => {
      await expect(emailSchema.validate('TEST@EXAMPLE.COM')).resolves.toBe('test@example.com');
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong password', async () => {
      await expect(passwordSchema.validate('Password123!')).resolves.toBe('Password123!');
    });

    it('should reject password without uppercase', async () => {
      await expect(passwordSchema.validate('password123!')).rejects.toThrow();
    });

    it('should reject password without lowercase', async () => {
      await expect(passwordSchema.validate('PASSWORD123!')).rejects.toThrow();
    });

    it('should reject password without number', async () => {
      await expect(passwordSchema.validate('Password!')).rejects.toThrow();
    });

    it('should reject password without special character', async () => {
      await expect(passwordSchema.validate('Password123')).rejects.toThrow();
    });

    it('should reject short password', async () => {
      await expect(passwordSchema.validate('Pass1!')).rejects.toThrow(
        'Password must be at least 8 characters'
      );
    });
  });

  describe('pinSchema', () => {
    it('should validate correct PIN', async () => {
      await expect(pinSchema.validate('123789')).resolves.toBe('123789');
    });

    it('should reject non-numeric PIN', async () => {
      await expect(pinSchema.validate('12a456')).rejects.toThrow();
    });

    it('should reject sequential PIN', async () => {
      await expect(pinSchema.validate('123456')).rejects.toThrow('PIN cannot be sequential');
    });

    it('should reject repeated PIN', async () => {
      await expect(pinSchema.validate('111111')).rejects.toThrow(
        'PIN cannot be all the same digit'
      );
    });

    it('should reject PIN with wrong length', async () => {
      await expect(pinSchema.validate('12345')).rejects.toThrow();
    });
  });

  describe('phoneNumberSchema', () => {
    it('should validate international phone number', async () => {
      await expect(phoneNumberSchema.validate('+1234567890')).resolves.toBe('+1234567890');
    });

    it('should reject phone without plus', async () => {
      await expect(phoneNumberSchema.validate('1234567890')).rejects.toThrow();
    });

    it('should reject invalid international format', async () => {
      await expect(phoneNumberSchema.validate('+0123')).rejects.toThrow();
    });
  });

  describe('dateOfBirthSchema', () => {
    it('should validate valid date of birth (over 18)', async () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 20);

      await expect(dateOfBirthSchema.validate(date)).resolves.toEqual(date);
    });

    it('should reject future date', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      await expect(dateOfBirthSchema.validate(futureDate)).rejects.toThrow(
        'Date of birth cannot be in the future'
      );
    });

    it('should reject under 18', async () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 10);

      await expect(dateOfBirthSchema.validate(date)).rejects.toThrow(
        'You must be at least 18 years old'
      );
    });
  });
});
```

---

## Dependencies

- Yup (validation library)
- TypeScript

---

## Definition of Done

- [ ] All shared validation schemas implemented
- [ ] Email validation working
- [ ] Password validation working
- [ ] PIN validation working
- [ ] Name validation working
- [ ] Phone validation working
- [ ] Date validation working
- [ ] URL validation working
- [ ] Authentication schemas created
- [ ] Profile schemas created
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-054](../stories/US-054-validation-schema-library.md), [EPIC-028](../epics/EPIC-028-form-validation.md)
