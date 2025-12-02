# TASK-305: Write Yup Schema Unit Tests

**ID**: TASK-305 | **Epic**: [EPIC-028](../epics/EPIC-028-form-validation.md) | **User Story**: [US-054](../stories/US-054-validation-schema-library.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Create full unit tests for all Yup validation schemas (common schemas, authentication schemas, profile schemas, and composite form schemas). Test all validation rules, edge cases, error messages, conditional validation, and schema composition. Ensure 100% code coverage.

---

## Acceptance Criteria

- [ ] Unit tests created in `src/validation/schemas/__tests__/`
- [ ] Test all common schemas (email, password, PIN, names, phone, dates, URL)
- [ ] Test all authentication schemas
- [ ] Test all profile schemas
- [ ] Test all composite form schemas
- [ ] Test conditional validation logic
- [ ] Test edge cases (empty strings, null, undefined, extreme values)
- [ ] Test error messages are correct and accessible
- [ ] Test schema composition and reusability
- [ ] 100% code coverage achieved
- [ ] All tests passing
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### Additional Unit Tests for Common Schemas

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
  requiredStringSchema,
  optionalStringSchema,
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

    it('should trim whitespace from email', async () => {
      await expect(emailSchema.validate('  test@example.com  ')).resolves.toBe('test@example.com');
    });

    it('should reject email exceeding max length', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      await expect(emailSchema.validate(longEmail)).rejects.toThrow(
        'Email must be less than 255 characters'
      );
    });

    it('should accept valid email with plus sign', async () => {
      await expect(emailSchema.validate('test+label@example.com')).resolves.toBe(
        'test+label@example.com'
      );
    });

    it('should accept valid email with subdomain', async () => {
      await expect(emailSchema.validate('test@mail.example.com')).resolves.toBe(
        'test@mail.example.com'
      );
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong password', async () => {
      await expect(passwordSchema.validate('Password123!')).resolves.toBe('Password123!');
    });

    it('should reject password without uppercase', async () => {
      await expect(passwordSchema.validate('password123!')).rejects.toThrow(
        'Password must contain at least one uppercase letter'
      );
    });

    it('should reject password without lowercase', async () => {
      await expect(passwordSchema.validate('PASSWORD123!')).rejects.toThrow(
        'Password must contain at least one uppercase letter'
      );
    });

    it('should reject password without number', async () => {
      await expect(passwordSchema.validate('Password!')).rejects.toThrow('Password must contain');
    });

    it('should reject password without special character', async () => {
      await expect(passwordSchema.validate('Password123')).rejects.toThrow('Password must contain');
    });

    it('should reject short password', async () => {
      await expect(passwordSchema.validate('Pass1!')).rejects.toThrow(
        'Password must be at least 8 characters'
      );
    });

    it('should reject password exceeding max length', async () => {
      const longPassword = 'A1!' + 'a'.repeat(130);
      await expect(passwordSchema.validate(longPassword)).rejects.toThrow(
        'Password must be less than 128 characters'
      );
    });

    it('should reject empty password', async () => {
      await expect(passwordSchema.validate('')).rejects.toThrow('Password is required');
    });

    it('should accept password with multiple special characters', async () => {
      await expect(passwordSchema.validate('P@ssw0rd!#$')).resolves.toBe('P@ssw0rd!#$');
    });
  });

  describe('pinSchema', () => {
    it('should validate correct PIN', async () => {
      await expect(pinSchema.validate('123789')).resolves.toBe('123789');
    });

    it('should reject non-numeric PIN', async () => {
      await expect(pinSchema.validate('12a456')).rejects.toThrow('PIN must be exactly 6 digits');
    });

    it('should reject PIN with less than 6 digits', async () => {
      await expect(pinSchema.validate('12345')).rejects.toThrow('PIN must be exactly 6 digits');
    });

    it('should reject PIN with more than 6 digits', async () => {
      await expect(pinSchema.validate('1234567')).rejects.toThrow('PIN must be exactly 6 digits');
    });

    it('should reject sequential ascending PIN', async () => {
      await expect(pinSchema.validate('123456')).rejects.toThrow('PIN cannot be sequential');
    });

    it('should reject sequential descending PIN', async () => {
      await expect(pinSchema.validate('654321')).rejects.toThrow('PIN cannot be sequential');
    });

    it('should reject repeated digit PIN', async () => {
      await expect(pinSchema.validate('111111')).rejects.toThrow(
        'PIN cannot be all the same digit'
      );
    });

    it('should reject repeated digit PIN (zeros)', async () => {
      await expect(pinSchema.validate('000000')).rejects.toThrow(
        'PIN cannot be all the same digit'
      );
    });

    it('should reject empty PIN', async () => {
      await expect(pinSchema.validate('')).rejects.toThrow('PIN is required');
    });

    it('should accept valid random PIN', async () => {
      await expect(pinSchema.validate('298473')).resolves.toBe('298473');
    });
  });

  describe('firstNameSchema', () => {
    it('should validate correct first name', async () => {
      await expect(firstNameSchema.validate('John')).resolves.toBe('John');
    });

    it('should trim whitespace', async () => {
      await expect(firstNameSchema.validate('  John  ')).resolves.toBe('John');
    });

    it('should accept hyphenated names', async () => {
      await expect(firstNameSchema.validate('Mary-Jane')).resolves.toBe('Mary-Jane');
    });

    it('should accept names with apostrophes', async () => {
      await expect(firstNameSchema.validate("O'Connor")).resolves.toBe("O'Connor");
    });

    it('should accept names with spaces', async () => {
      await expect(firstNameSchema.validate('Mary Jane')).resolves.toBe('Mary Jane');
    });

    it('should reject names with numbers', async () => {
      await expect(firstNameSchema.validate('John123')).rejects.toThrow(
        'First name can only contain letters'
      );
    });

    it('should reject names with special characters', async () => {
      await expect(firstNameSchema.validate('John@Doe')).rejects.toThrow(
        'First name can only contain letters'
      );
    });

    it('should reject empty first name', async () => {
      await expect(firstNameSchema.validate('')).rejects.toThrow('First name is required');
    });

    it('should reject first name exceeding max length', async () => {
      const longName = 'a'.repeat(51);
      await expect(firstNameSchema.validate(longName)).rejects.toThrow(
        'First name must be less than 50 characters'
      );
    });
  });

  describe('lastNameSchema', () => {
    it('should validate correct last name', async () => {
      await expect(lastNameSchema.validate('Doe')).resolves.toBe('Doe');
    });

    it('should trim whitespace', async () => {
      await expect(lastNameSchema.validate('  Doe  ')).resolves.toBe('Doe');
    });

    it('should accept hyphenated last names', async () => {
      await expect(lastNameSchema.validate('Smith-Jones')).resolves.toBe('Smith-Jones');
    });

    it('should accept last names with apostrophes', async () => {
      await expect(lastNameSchema.validate("O'Brien")).resolves.toBe("O'Brien");
    });

    it('should reject last names with numbers', async () => {
      await expect(lastNameSchema.validate('Doe123')).rejects.toThrow(
        'Last name can only contain letters'
      );
    });

    it('should reject empty last name', async () => {
      await expect(lastNameSchema.validate('')).rejects.toThrow('Last name is required');
    });
  });

  describe('phoneNumberSchema', () => {
    it('should validate international phone number', async () => {
      await expect(phoneNumberSchema.validate('+1234567890')).resolves.toBe('+1234567890');
    });

    it('should accept long international numbers', async () => {
      await expect(phoneNumberSchema.validate('+123456789012345')).resolves.toBe(
        '+123456789012345'
      );
    });

    it('should reject phone without plus', async () => {
      await expect(phoneNumberSchema.validate('1234567890')).rejects.toThrow(
        'Please enter a valid international phone number'
      );
    });

    it('should reject phone starting with +0', async () => {
      await expect(phoneNumberSchema.validate('+0123')).rejects.toThrow(
        'Please enter a valid international phone number'
      );
    });

    it('should reject phone with letters', async () => {
      await expect(phoneNumberSchema.validate('+123abc')).rejects.toThrow(
        'Please enter a valid international phone number'
      );
    });

    it('should reject empty phone number', async () => {
      await expect(phoneNumberSchema.validate('')).rejects.toThrow('Phone number is required');
    });
  });

  describe('dateOfBirthSchema', () => {
    it('should validate valid date of birth (over 18)', async () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 20);

      await expect(dateOfBirthSchema.validate(date)).resolves.toEqual(date);
    });

    it('should validate exactly 18 years old', async () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 18);

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

    it('should reject 17 years old', async () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 17);

      await expect(dateOfBirthSchema.validate(date)).rejects.toThrow(
        'You must be at least 18 years old'
      );
    });

    it('should reject undefined date', async () => {
      await expect(dateOfBirthSchema.validate(undefined)).rejects.toThrow(
        'Date of birth is required'
      );
    });
  });

  describe('urlSchema', () => {
    it('should validate valid HTTP URL', async () => {
      await expect(urlSchema.validate('http://example.com')).resolves.toBe('http://example.com');
    });

    it('should validate valid HTTPS URL', async () => {
      await expect(urlSchema.validate('https://example.com')).resolves.toBe('https://example.com');
    });

    it('should validate URL with path', async () => {
      await expect(urlSchema.validate('https://example.com/path/to/page')).resolves.toBe(
        'https://example.com/path/to/page'
      );
    });

    it('should validate URL with query params', async () => {
      await expect(urlSchema.validate('https://example.com?foo=bar&baz=qux')).resolves.toBe(
        'https://example.com?foo=bar&baz=qux'
      );
    });

    it('should reject invalid URL', async () => {
      await expect(urlSchema.validate('not-a-url')).rejects.toThrow('Please enter a valid URL');
    });

    it('should reject URL exceeding max length', async () => {
      const longUrl = 'https://' + 'a'.repeat(2050) + '.com';
      await expect(urlSchema.validate(longUrl)).rejects.toThrow(
        'URL must be less than 2048 characters'
      );
    });

    it('should accept null URL', async () => {
      await expect(urlSchema.validate(null)).resolves.toBe(null);
    });
  });

  describe('requiredStringSchema', () => {
    it('should validate non-empty string', async () => {
      const schema = requiredStringSchema('Field');
      await expect(schema.validate('Value')).resolves.toBe('Value');
    });

    it('should trim whitespace', async () => {
      const schema = requiredStringSchema('Field');
      await expect(schema.validate('  Value  ')).resolves.toBe('Value');
    });

    it('should reject empty string', async () => {
      const schema = requiredStringSchema('Field');
      await expect(schema.validate('')).rejects.toThrow('Field is required');
    });

    it('should reject whitespace-only string', async () => {
      const schema = requiredStringSchema('Field');
      await expect(schema.validate('   ')).rejects.toThrow('Field cannot be empty');
    });

    it('should use custom field name in error', async () => {
      const schema = requiredStringSchema('Custom Field');
      await expect(schema.validate('')).rejects.toThrow('Custom Field is required');
    });
  });

  describe('optionalStringSchema', () => {
    it('should validate non-empty string', async () => {
      const schema = optionalStringSchema(100);
      await expect(schema.validate('Value')).resolves.toBe('Value');
    });

    it('should transform empty string to null', async () => {
      const schema = optionalStringSchema(100);
      await expect(schema.validate('')).resolves.toBe(null);
    });

    it('should accept null', async () => {
      const schema = optionalStringSchema(100);
      await expect(schema.validate(null)).resolves.toBe(null);
    });

    it('should reject string exceeding max length', async () => {
      const schema = optionalStringSchema(10);
      await expect(schema.validate('a'.repeat(11))).rejects.toThrow(
        'Must be less than 10 characters'
      );
    });

    it('should use default max length of 255', async () => {
      const schema = optionalStringSchema();
      const longString = 'a'.repeat(256);
      await expect(schema.validate(longString)).rejects.toThrow('Must be less than 255 characters');
    });
  });
});
```

---

### Unit Tests for Authentication Schemas

```typescript
// src/validation/schemas/__tests__/authSchemas.test.ts

import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  setupPinSchema,
  verifyPinSchema,
  changePasswordSchema,
  changePinSchema,
} from '../authSchemas';

describe('Authentication Validation Schemas', () => {
  describe('signInSchema', () => {
    it('should validate correct sign-in data', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      await expect(signInSchema.validate(validData)).resolves.toEqual({
        email: 'test@example.com',
        password: 'Password123!',
      });
    });

    it('should reject invalid email', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123!',
      };

      await expect(signInSchema.validate(invalidData)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });

    it('should reject weak password', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
      };

      await expect(signInSchema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('signUpSchema', () => {
    it('should validate complete sign-up data', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+1234567890',
      };

      await expect(signUpSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should reject when passwords do not match', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+1234567890',
      };

      await expect(signUpSchema.validate(invalidData)).rejects.toThrow('Passwords must match');
    });

    it('should reject user under 18', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        dateOfBirth: new Date('2010-01-01'),
        phoneNumber: '+1234567890',
      };

      await expect(signUpSchema.validate(invalidData)).rejects.toThrow(
        'You must be at least 18 years old'
      );
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate email', async () => {
      const validData = {
        email: 'test@example.com',
      };

      await expect(forgotPasswordSchema.validate(validData)).resolves.toEqual({
        email: 'test@example.com',
      });
    });

    it('should reject invalid email', async () => {
      const invalidData = {
        email: 'invalid-email',
      };

      await expect(forgotPasswordSchema.validate(invalidData)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate password reset', async () => {
      const validData = {
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      await expect(resetPasswordSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should reject when passwords do not match', async () => {
      const invalidData = {
        password: 'NewPassword123!',
        confirmPassword: 'DifferentPassword123!',
      };

      await expect(resetPasswordSchema.validate(invalidData)).rejects.toThrow(
        'Passwords must match'
      );
    });
  });

  describe('setupPinSchema', () => {
    it('should validate PIN setup', async () => {
      const validData = {
        pin: '123789',
        confirmPin: '123789',
      };

      await expect(setupPinSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should reject when PINs do not match', async () => {
      const invalidData = {
        pin: '123789',
        confirmPin: '987321',
      };

      await expect(setupPinSchema.validate(invalidData)).rejects.toThrow('PINs must match');
    });

    it('should reject sequential PIN', async () => {
      const invalidData = {
        pin: '123456',
        confirmPin: '123456',
      };

      await expect(setupPinSchema.validate(invalidData)).rejects.toThrow(
        'PIN cannot be sequential'
      );
    });
  });

  describe('verifyPinSchema', () => {
    it('should validate PIN', async () => {
      const validData = {
        pin: '123789',
      };

      await expect(verifyPinSchema.validate(validData)).resolves.toEqual({
        pin: '123789',
      });
    });

    it('should reject invalid PIN', async () => {
      const invalidData = {
        pin: '12345',
      };

      await expect(verifyPinSchema.validate(invalidData)).rejects.toThrow(
        'PIN must be exactly 6 digits'
      );
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate password change', async () => {
      const validData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmNewPassword: 'NewPassword123!',
      };

      await expect(changePasswordSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should reject when new passwords do not match', async () => {
      const invalidData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmNewPassword: 'DifferentPassword123!',
      };

      await expect(changePasswordSchema.validate(invalidData)).rejects.toThrow(
        'Passwords must match'
      );
    });

    it('should reject when new password same as current', async () => {
      const invalidData = {
        currentPassword: 'SamePassword123!',
        newPassword: 'SamePassword123!',
        confirmNewPassword: 'SamePassword123!',
      };

      await expect(changePasswordSchema.validate(invalidData)).rejects.toThrow(
        'New password must be different from current password'
      );
    });
  });

  describe('changePinSchema', () => {
    it('should validate PIN change', async () => {
      const validData = {
        currentPin: '123789',
        newPin: '987321',
        confirmNewPin: '987321',
      };

      await expect(changePinSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should reject when new PINs do not match', async () => {
      const invalidData = {
        currentPin: '123789',
        newPin: '987321',
        confirmNewPin: '456789',
      };

      await expect(changePinSchema.validate(invalidData)).rejects.toThrow('PINs must match');
    });

    it('should reject when new PIN same as current', async () => {
      const invalidData = {
        currentPin: '123789',
        newPin: '123789',
        confirmNewPin: '123789',
      };

      await expect(changePinSchema.validate(invalidData)).rejects.toThrow(
        'New PIN must be different from current PIN'
      );
    });
  });
});
```

---

### Unit Tests for Profile Schemas

```typescript
// src/validation/schemas/__tests__/profileSchemas.test.ts

import { updateProfileSchema, updateProfilePictureSchema } from '../profileSchemas';

describe('Profile Validation Schemas', () => {
  describe('updateProfileSchema', () => {
    it('should validate complete profile update', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        dateOfBirth: new Date('1990-01-01'),
      };

      await expect(updateProfileSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should reject invalid phone number', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890', // Missing +
        dateOfBirth: new Date('1990-01-01'),
      };

      await expect(updateProfileSchema.validate(invalidData)).rejects.toThrow(
        'Please enter a valid international phone number'
      );
    });
  });

  describe('updateProfilePictureSchema', () => {
    it('should validate profile picture update', async () => {
      const validData = {
        imageUri: 'file:///path/to/image.jpg',
        mimeType: 'image/jpeg',
        fileSize: 5000000, // 5MB
      };

      await expect(updateProfilePictureSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should accept PNG images', async () => {
      const validData = {
        imageUri: 'file:///path/to/image.png',
        mimeType: 'image/png',
        fileSize: 3000000,
      };

      await expect(updateProfilePictureSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should reject invalid MIME type', async () => {
      const invalidData = {
        imageUri: 'file:///path/to/image.gif',
        mimeType: 'image/gif',
        fileSize: 5000000,
      };

      await expect(updateProfilePictureSchema.validate(invalidData)).rejects.toThrow(
        'Only JPEG and PNG images are allowed'
      );
    });

    it('should reject file exceeding size limit', async () => {
      const invalidData = {
        imageUri: 'file:///path/to/image.jpg',
        mimeType: 'image/jpeg',
        fileSize: 15000000, // 15MB (exceeds 10MB limit)
      };

      await expect(updateProfilePictureSchema.validate(invalidData)).rejects.toThrow(
        'Image size must be less than 10MB'
      );
    });
  });
});
```

---

## Testing Requirements

### Coverage Requirements

- [ ] 100% line coverage
- [ ] 100% branch coverage
- [ ] 100% function coverage
- [ ] 100% statement coverage

### Test Categories

**Happy Path Tests**:

- [ ] Valid data passes validation
- [ ] Correct transformations applied (lowercase, trim, etc.)
- [ ] Default values set correctly

**Validation Rule Tests**:

- [ ] Required field validation
- [ ] Min/max length validation
- [ ] Format validation (regex)
- [ ] Custom validation rules

**Edge Case Tests**:

- [ ] Empty strings
- [ ] Null values
- [ ] Undefined values
- [ ] Extreme values (very long, very short)
- [ ] Special characters
- [ ] Whitespace handling

**Error Message Tests**:

- [ ] Correct error messages returned
- [ ] Field names included in errors
- [ ] Accessible error messages

**Conditional Validation Tests**:

- [ ] When/then conditions work correctly
- [ ] Schema dependencies respected
- [ ] Optional vs required fields

---

## Dependencies

- Jest
- Yup
- TypeScript
- All validation schemas

---

## Definition of Done

- [ ] All common schema tests implemented
- [ ] All authentication schema tests implemented
- [ ] All profile schema tests implemented
- [ ] All composite form schema tests implemented
- [ ] All edge cases covered
- [ ] All error messages tested
- [ ] All conditional validation tested
- [ ] 100% code coverage achieved
- [ ] All tests passing
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-054](../stories/US-054-validation-schema-library.md), [EPIC-028](../epics/EPIC-028-form-validation.md), [TASK-303](TASK-303-shared-validation-schemas.md), [TASK-304](TASK-304-composite-form-schemas.md)
