/**
 * Validation Schema Edge Case Tests
 *
 * Tests for edge cases, boundary conditions, and uncommon scenarios
 * in validation schemas that may not be covered by standard tests.
 */

import { loginSchema } from '../loginSchema';
import { changePasswordSchema, profileUpdateSchema } from '../profileUpdateSchema';
import { registrationSchema } from '../registrationSchema';

describe('Login Schema Edge Cases', () => {
  describe('email edge cases', () => {
    it('should accept email with multiple dots in local part', async () => {
      const data = { email: 'user.name.test@example.com', password: 'Password123!' };
      await expect(loginSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept email with plus addressing', async () => {
      const data = { email: 'user+tag@example.com', password: 'Password123!' };
      await expect(loginSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept email with numeric local part', async () => {
      const data = { email: '12345@example.com', password: 'Password123!' };
      await expect(loginSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept email with consecutive dots (Yup email validator accepts this)', async () => {
      // Note: Yup's built-in email validator is lenient - documents current behaviour
      const data = { email: 'user..name@example.com', password: 'Password123!' };
      await expect(loginSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept email with subdomain', async () => {
      const data = { email: 'user@mail.example.com', password: 'Password123!' };
      await expect(loginSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept email with multiple subdomains', async () => {
      const data = { email: 'user@dept.mail.example.com', password: 'Password123!' };
      await expect(loginSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept email starting with dot (Yup email validator is lenient)', async () => {
      // Note: Yup's built-in email validator is lenient - documents current behaviour
      const data = { email: '.user@example.com', password: 'Password123!' };
      await expect(loginSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept email ending with dot before @ (Yup email validator is lenient)', async () => {
      // Note: Yup's built-in email validator is lenient - documents current behaviour
      const data = { email: 'user.@example.com', password: 'Password123!' };
      await expect(loginSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept email with hyphen in domain', async () => {
      const data = { email: 'user@ex-ample.com', password: 'Password123!' };
      await expect(loginSchema.validate(data)).resolves.toBeDefined();
    });

    it('should reject disposable email mailinator.com', async () => {
      const data = { email: 'test@mailinator.com', password: 'Password123!' };
      await expect(loginSchema.validate(data)).rejects.toThrow(
        'Disposable email addresses are not allowed'
      );
    });

    it('should reject disposable email guerrillamail.com', async () => {
      const data = { email: 'test@guerrillamail.com', password: 'Password123!' };
      await expect(loginSchema.validate(data)).rejects.toThrow(
        'Disposable email addresses are not allowed'
      );
    });

    it('should reject disposable email 10minutemail.com', async () => {
      const data = { email: 'test@10minutemail.com', password: 'Password123!' };
      await expect(loginSchema.validate(data)).rejects.toThrow(
        'Disposable email addresses are not allowed'
      );
    });

    it('should reject email with emoji in local part', async () => {
      const data = { email: 'user😀@example.com', password: 'Password123!' };
      await expect(loginSchema.validate(data)).rejects.toThrow();
    });
  });

  describe('password edge cases', () => {
    it('should accept password with exactly 8 characters', async () => {
      const data = { email: 'test@example.com', password: 'Aa1!xxxx' };
      await expect(loginSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept password with exactly 128 characters', async () => {
      const data = { email: 'test@example.com', password: 'Aa1!' + 'x'.repeat(124) };
      await expect(loginSchema.validate(data)).resolves.toBeDefined();
    });

    it('should reject password with 7 characters', async () => {
      const data = { email: 'test@example.com', password: 'Aa1!xxx' };
      await expect(loginSchema.validate(data)).rejects.toThrow(
        'Password must be at least 8 characters'
      );
    });

    it('should reject password with 129 characters', async () => {
      const data = { email: 'test@example.com', password: 'Aa1!' + 'x'.repeat(125) };
      await expect(loginSchema.validate(data)).rejects.toThrow(
        'Password must not exceed 128 characters'
      );
    });

    it('should reject password with emoji', async () => {
      const data = { email: 'test@example.com', password: 'Password123!😀' };
      await expect(loginSchema.validate(data)).rejects.toThrow('Password cannot contain emojis');
    });

    it('should accept password with all allowed special characters', async () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      for (const char of specialChars) {
        const data = { email: 'test@example.com', password: `Password1${char}` };
        await expect(loginSchema.validate(data)).resolves.toBeDefined();
      }
    });
  });

  describe('trim and transform', () => {
    it('should trim whitespace from email', async () => {
      const data = { email: '  test@example.com  ', password: 'Password123!' };
      const result = await loginSchema.validate(data);
      expect(result.email).toBe('test@example.com');
    });

    it('should lowercase email', async () => {
      const data = { email: 'TEST@EXAMPLE.COM', password: 'Password123!' };
      const result = await loginSchema.validate(data);
      expect(result.email).toBe('test@example.com');
    });

    it('should not trim password', async () => {
      const data = { email: 'test@example.com', password: ' Password123! ' };
      const result = await loginSchema.validate(data);
      expect(result.password).toBe(' Password123! ');
    });
  });
});

describe('Registration Schema Edge Cases', () => {
  const validBase = {
    firstName: 'Warren',
    lastName: 'de Leon',
    email: 'test@example.com',
    phoneNumber: '+447911123456',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!',
    acceptTerms: true,
  };

  describe('name handling edge cases', () => {
    it('should accept name at exact minimum length (2 chars)', async () => {
      const data = { ...validBase, firstName: 'Ab', lastName: 'Cd' };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept name at exact maximum length (50 chars)', async () => {
      const data = { ...validBase, firstName: 'A'.repeat(50), lastName: 'B'.repeat(50) };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should reject name with only spaces after trim', async () => {
      const data = { ...validBase, firstName: '   ' };
      await expect(registrationSchema.validate(data)).rejects.toThrow('First name is required');
    });

    it('should accept double-barrelled names', async () => {
      const data = { ...validBase, firstName: 'Mary-Jane', lastName: 'Smith-Jones' };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept names with apostrophes', async () => {
      const data = { ...validBase, firstName: "O'Brien", lastName: "D'Angelo" };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept names with spaces', async () => {
      const data = { ...validBase, firstName: 'Mary Jane', lastName: 'Van Der Berg' };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should reject names with numbers', async () => {
      const data = { ...validBase, firstName: 'Warren123' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name contains invalid characters'
      );
    });

    it('should reject names with special characters (not hyphen or apostrophe)', async () => {
      const data = { ...validBase, firstName: 'Warren@Test' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name contains invalid characters'
      );
    });
  });

  describe('phone number edge cases', () => {
    it('should accept valid UK mobile', async () => {
      const data = { ...validBase, phoneNumber: '+447911123456' };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept valid US mobile', async () => {
      const data = { ...validBase, phoneNumber: '+12025551234' };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept valid German mobile', async () => {
      const data = { ...validBase, phoneNumber: '+4915123456789' };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept valid French mobile', async () => {
      const data = { ...validBase, phoneNumber: '+33612345678' };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should reject phone without plus prefix', async () => {
      const data = { ...validBase, phoneNumber: '447911123456' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Please enter a valid mobile number'
      );
    });

    it('should reject phone starting with +0', async () => {
      const data = { ...validBase, phoneNumber: '+07911123456' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Please enter a valid mobile number'
      );
    });

    it('should reject phone with letters', async () => {
      const data = { ...validBase, phoneNumber: '+44abc123456' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Please enter a valid mobile number'
      );
    });

    it('should reject phone too short', async () => {
      const data = { ...validBase, phoneNumber: '+44123' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Please enter a valid mobile number'
      );
    });
  });

  describe('password complexity edge cases', () => {
    it('should reject password without uppercase', async () => {
      const data = { ...validBase, password: 'lowercase123!', confirmPassword: 'lowercase123!' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Password must include uppercase, lowercase, number, and special character'
      );
    });

    it('should reject password without lowercase', async () => {
      const data = { ...validBase, password: 'UPPERCASE123!', confirmPassword: 'UPPERCASE123!' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Password must include uppercase, lowercase, number, and special character'
      );
    });

    it('should reject password without number', async () => {
      const data = { ...validBase, password: 'NoNumbersHere!', confirmPassword: 'NoNumbersHere!' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Password must include uppercase, lowercase, number, and special character'
      );
    });

    it('should reject password without special character', async () => {
      const data = { ...validBase, password: 'NoSpecial123', confirmPassword: 'NoSpecial123' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Password must include uppercase, lowercase, number, and special character'
      );
    });

    it('should reject password containing first name (case insensitive)', async () => {
      const data = {
        ...validBase,
        firstName: 'Warren',
        password: 'MyWARRENpass123!',
        confirmPassword: 'MyWARRENpass123!',
      };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Password cannot contain your name or email'
      );
    });

    it('should reject password containing last name', async () => {
      const data = {
        ...validBase,
        lastName: 'Thompson',
        password: 'ThompsonPass123!',
        confirmPassword: 'ThompsonPass123!',
      };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Password cannot contain your name or email'
      );
    });

    it('should reject password containing email local part', async () => {
      const data = {
        ...validBase,
        email: 'johndoe@example.com',
        password: 'JohnDoe123!pass',
        confirmPassword: 'JohnDoe123!pass',
      };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Password cannot contain your name or email'
      );
    });

    it('should allow password with short name parts (< 3 chars)', async () => {
      const data = {
        ...validBase,
        firstName: 'Li',
        lastName: 'Wu',
        password: 'LiWuPass123!',
        confirmPassword: 'LiWuPass123!',
      };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('confirmPassword edge cases', () => {
    it('should reject mismatched passwords', async () => {
      const data = { ...validBase, password: 'Password123!', confirmPassword: 'Different456!' };
      await expect(registrationSchema.validate(data)).rejects.toThrow('Passwords must match');
    });

    it('should reject case-sensitive mismatch', async () => {
      const data = { ...validBase, password: 'Password123!', confirmPassword: 'PASSWORD123!' };
      await expect(registrationSchema.validate(data)).rejects.toThrow('Passwords must match');
    });
  });

  describe('XSS prevention edge cases', () => {
    it('should reject HTML tags in firstName', async () => {
      const data = { ...validBase, firstName: '<script>alert(1)</script>' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name contains invalid characters'
      );
    });

    it('should reject HTML tags in lastName', async () => {
      const data = { ...validBase, lastName: '<img src=x onerror=alert(1)>' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Last name contains invalid characters'
      );
    });

    it('should reject SQL injection attempts', async () => {
      const data = { ...validBase, firstName: "'; DROP TABLE users; --" };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name contains invalid characters'
      );
    });

    it('should reject null byte injection', async () => {
      const data = { ...validBase, firstName: 'Warren\x00Admin' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name contains invalid characters'
      );
    });
  });
});

describe('Profile Update Schema Edge Cases', () => {
  describe('partial update handling', () => {
    it('should accept empty object (no fields)', async () => {
      await expect(profileUpdateSchema.validate({})).resolves.toEqual({});
    });

    it('should accept single field update', async () => {
      const data = { firstName: 'John' };
      const result = await profileUpdateSchema.validate(data);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBeUndefined();
    });

    it('should accept all fields update', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '+447911123456',
      };
      await expect(profileUpdateSchema.validate(data)).resolves.toBeDefined();
    });

    it('should reject null firstName explicitly', async () => {
      const data = { firstName: null as unknown as string };
      await expect(profileUpdateSchema.validate(data)).rejects.toThrow('firstName cannot be null');
    });
  });
});

describe('Change Password Schema Edge Cases', () => {
  const validBase = {
    currentPassword: 'OldPassword123!',
    newPassword: 'NewPassword456!',
    confirmNewPassword: 'NewPassword456!',
  };

  describe('password matching rules', () => {
    it('should reject when new password equals current password', async () => {
      const data = {
        currentPassword: 'SamePassword123!',
        newPassword: 'SamePassword123!',
        confirmNewPassword: 'SamePassword123!',
      };
      await expect(changePasswordSchema.validate(data)).rejects.toThrow(
        'New password must be different from current password'
      );
    });

    it('should reject when confirm does not match new', async () => {
      const data = {
        ...validBase,
        confirmNewPassword: 'DifferentPassword789!',
      };
      await expect(changePasswordSchema.validate(data)).rejects.toThrow('Passwords must match');
    });
  });

  describe('emoji validation', () => {
    it('should reject emoji in current password', async () => {
      const data = { ...validBase, currentPassword: 'Password😀123!' };
      await expect(changePasswordSchema.validate(data)).rejects.toThrow(
        'Password cannot contain emojis'
      );
    });

    it('should reject emoji in new password', async () => {
      const data = {
        ...validBase,
        newPassword: 'NewPass😀123!',
        confirmNewPassword: 'NewPass😀123!',
      };
      await expect(changePasswordSchema.validate(data)).rejects.toThrow(
        'Password cannot contain emojis'
      );
    });
  });
});
