import { passwordRecoverySchema, passwordResetSchema } from '../passwordRecoverySchema';

describe('passwordRecoverySchema', () => {
  const validData = {
    email: 'test@example.com',
  };

  describe('valid data', () => {
    it('should validate correct password recovery data', async () => {
      await expect(passwordRecoverySchema.validate(validData)).resolves.toMatchObject({
        email: 'test@example.com',
      });
    });

    it('should lowercase email', async () => {
      const data = { email: 'TEST@EXAMPLE.COM' };
      const result = await passwordRecoverySchema.validate(data);
      expect(result.email).toBe('test@example.com');
    });

    it('should trim whitespace from email', async () => {
      const data = { email: '  test@example.com  ' };
      const result = await passwordRecoverySchema.validate(data);
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('email validation', () => {
    it('should reject missing email', async () => {
      const data = { email: '' };
      await expect(passwordRecoverySchema.validate(data)).rejects.toThrow('Email is required');
    });

    it('should reject invalid email format', async () => {
      const data = { email: 'not-an-email' };
      await expect(passwordRecoverySchema.validate(data)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });

    it('should reject email without domain', async () => {
      const data = { email: 'test@' };
      await expect(passwordRecoverySchema.validate(data)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });

    it('should reject email without @', async () => {
      const data = { email: 'testexample.com' };
      await expect(passwordRecoverySchema.validate(data)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });
  });

  describe('emoji validation', () => {
    it('should reject email with emojis (email validation fails first)', async () => {
      const data = { email: 'test😀@example.com' };
      await expect(passwordRecoverySchema.validate(data)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });
  });
});

describe('passwordResetSchema', () => {
  const validData = {
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!',
  };

  describe('valid data', () => {
    it('should validate correct password reset data', async () => {
      await expect(passwordResetSchema.validate(validData)).resolves.toMatchObject({
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });
    });
  });

  describe('password validation', () => {
    it('should reject missing password', async () => {
      const data = {};
      await expect(passwordResetSchema.validate(data)).rejects.toThrow();
    });

    it('should reject password shorter than 8 characters', async () => {
      const data = { password: 'Short1!', confirmPassword: 'Short1!' };
      await expect(passwordResetSchema.validate(data)).rejects.toThrow(
        'Password must be at least 8 characters'
      );
    });

    it('should reject password without uppercase', async () => {
      const data = { password: 'lowercase123!', confirmPassword: 'lowercase123!' };
      await expect(passwordResetSchema.validate(data)).rejects.toThrow(
        'Password must include uppercase, lowercase, number, and special character'
      );
    });

    it('should reject password without lowercase', async () => {
      const data = { password: 'UPPERCASE123!', confirmPassword: 'UPPERCASE123!' };
      await expect(passwordResetSchema.validate(data)).rejects.toThrow(
        'Password must include uppercase, lowercase, number, and special character'
      );
    });

    it('should reject password without number', async () => {
      const data = { password: 'NoNumber!', confirmPassword: 'NoNumber!' };
      await expect(passwordResetSchema.validate(data)).rejects.toThrow(
        'Password must include uppercase, lowercase, number, and special character'
      );
    });

    it('should reject password without special character', async () => {
      const data = { password: 'NoSpecial123', confirmPassword: 'NoSpecial123' };
      await expect(passwordResetSchema.validate(data)).rejects.toThrow(
        'Password must include uppercase, lowercase, number, and special character'
      );
    });

    it('should accept password with all requirements', async () => {
      const data = { password: 'ValidPass123!', confirmPassword: 'ValidPass123!' };
      await expect(passwordResetSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('confirmPassword validation', () => {
    it('should reject missing confirm password', async () => {
      const data = { ...validData };
      delete (data as Partial<typeof validData>).confirmPassword;
      await expect(passwordResetSchema.validate(data)).rejects.toThrow(
        'Please confirm your password'
      );
    });

    it('should reject mismatched passwords', async () => {
      const data = { password: 'SecurePass123!', confirmPassword: 'DifferentPass123!' };
      await expect(passwordResetSchema.validate(data)).rejects.toThrow('Passwords must match');
    });

    it('should accept matching passwords', async () => {
      const data = { password: 'MatchingPass123!', confirmPassword: 'MatchingPass123!' };
      await expect(passwordResetSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('emoji validation', () => {
    it('should reject password with emojis (noEmoji fails first)', async () => {
      const data = { password: 'SecurePass123!😀', confirmPassword: 'SecurePass123!😀' };
      await expect(passwordResetSchema.validate(data)).rejects.toThrow(
        'Password cannot contain emojis'
      );
    });

    it('should reject confirm password with emojis (oneOf fails first)', async () => {
      const data = { ...validData, confirmPassword: 'SecurePass123!😀' };
      await expect(passwordResetSchema.validate(data)).rejects.toThrow('Passwords must match');
    });
  });
});
