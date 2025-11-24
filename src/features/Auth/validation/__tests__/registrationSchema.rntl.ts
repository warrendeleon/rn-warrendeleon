import { registrationSchema } from '../registrationSchema';

describe('registrationSchema', () => {
  const validData = {
    firstName: 'Warren',
    lastName: 'de Leon',
    email: 'test@example.com',
    phoneNumber: '+447911123456',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!',
    acceptTerms: true,
  };

  describe('valid data', () => {
    it('should validate correct registration data', async () => {
      await expect(registrationSchema.validate(validData)).resolves.toMatchObject({
        firstName: 'Warren',
        lastName: 'de Leon',
        email: 'test@example.com',
        phoneNumber: '+447911123456',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: true,
      });
    });

    it('should lowercase email', async () => {
      const data = { ...validData, email: 'TEST@EXAMPLE.COM' };
      const result = await registrationSchema.validate(data);
      expect(result.email).toBe('test@example.com');
    });

    it('should trim whitespace from names', async () => {
      const data = {
        ...validData,
        firstName: '  Warren  ',
        lastName: '  de Leon  ',
      };
      const result = await registrationSchema.validate(data);
      expect(result.firstName).toBe('Warren');
      expect(result.lastName).toBe('de Leon');
    });
  });

  describe('firstName validation', () => {
    it('should reject missing first name', async () => {
      const data = { ...validData, firstName: '' };
      await expect(registrationSchema.validate(data)).rejects.toThrow('First name is required');
    });

    it('should reject first name shorter than 2 characters', async () => {
      const data = { ...validData, firstName: 'W' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name must be at least 2 characters'
      );
    });

    it('should reject first name longer than 50 characters', async () => {
      const data = { ...validData, firstName: 'W'.repeat(51) };
      await expect(registrationSchema.validate(data)).rejects.toThrow('First name is too long');
    });

    it('should reject first name with numbers', async () => {
      const data = { ...validData, firstName: 'Warren123' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name cannot contain numbers or special characters'
      );
    });

    it('should reject first name with special characters (except hyphens, apostrophes, spaces)', async () => {
      const data = { ...validData, firstName: 'Warren@' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name cannot contain numbers or special characters'
      );
    });

    it('should accept first name with hyphens', async () => {
      const data = { ...validData, firstName: 'Mary-Jane' };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept first name with apostrophes', async () => {
      const data = { ...validData, firstName: "O'Brien" };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept first name with spaces', async () => {
      const data = { ...validData, firstName: 'Mary Jane' };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('lastName validation', () => {
    it('should reject missing last name', async () => {
      const data = { ...validData, lastName: '' };
      await expect(registrationSchema.validate(data)).rejects.toThrow('Last name is required');
    });

    it('should reject last name shorter than 2 characters', async () => {
      const data = { ...validData, lastName: 'L' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Last name must be at least 2 characters'
      );
    });

    it('should reject last name longer than 50 characters', async () => {
      const data = { ...validData, lastName: 'L'.repeat(51) };
      await expect(registrationSchema.validate(data)).rejects.toThrow('Last name is too long');
    });

    it('should reject last name with numbers', async () => {
      const data = { ...validData, lastName: 'Leon123' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Last name cannot contain numbers or special characters'
      );
    });
  });

  describe('email validation', () => {
    it('should reject missing email', async () => {
      const data = { ...validData, email: '' };
      await expect(registrationSchema.validate(data)).rejects.toThrow('Email is required');
    });

    it('should reject invalid email format', async () => {
      const data = { ...validData, email: 'not-an-email' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });

    it('should reject email without domain', async () => {
      const data = { ...validData, email: 'test@' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });

    it('should reject email without @', async () => {
      const data = { ...validData, email: 'testexample.com' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });

    it('should reject disposable email addresses', async () => {
      const data = { ...validData, email: 'test@tempmail.com' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Disposable email addresses are not allowed'
      );
    });

    it('should accept legitimate email addresses', async () => {
      const data = { ...validData, email: 'user@company.com' };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('phoneNumber validation', () => {
    it('should reject missing phone number', async () => {
      const data = { ...validData, phoneNumber: '' };
      await expect(registrationSchema.validate(data)).rejects.toThrow('Mobile number is required');
    });

    it('should reject phone number without country code', async () => {
      const data = { ...validData, phoneNumber: '07700900000' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Please enter a valid mobile number'
      );
    });

    it('should reject phone number starting with +0', async () => {
      const data = { ...validData, phoneNumber: '+07700900000' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Please enter a valid mobile number'
      );
    });

    it('should accept valid UK phone number', async () => {
      const data = { ...validData, phoneNumber: '+447911123456' };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept valid US phone number', async () => {
      const data = { ...validData, phoneNumber: '+12025550123' };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept valid international mobile numbers', async () => {
      const numbers = [
        '+33612345678', // France
        '+491234567890', // Germany
        '+34612345678', // Spain
      ];

      for (const phoneNumber of numbers) {
        const data = { ...validData, phoneNumber };
        await expect(registrationSchema.validate(data)).resolves.toBeDefined();
      }
    });

    it('should reject phone number too short', async () => {
      const data = { ...validData, phoneNumber: '+44' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Please enter a valid mobile number'
      );
    });

    it('should reject phone number with invalid format', async () => {
      const data = { ...validData, phoneNumber: '+44abc123' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Please enter a valid mobile number'
      );
    });
  });

  describe('password validation', () => {
    it('should reject missing password', async () => {
      const data = {
        firstName: 'Warren',
        lastName: 'de Leon',
        email: 'test@example.com',
        phoneNumber: '+447700900000',
        acceptTerms: true,
      };
      await expect(registrationSchema.validate(data)).rejects.toThrow();
    });

    it('should reject password shorter than 8 characters', async () => {
      const data = { ...validData, password: 'Short1!', confirmPassword: 'Short1!' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Password must be at least 8 characters'
      );
    });

    it('should reject password longer than 128 characters', async () => {
      const longPassword = 'A1!' + 'a'.repeat(126);
      const data = { ...validData, password: longPassword, confirmPassword: longPassword };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Password must not exceed 128 characters'
      );
    });

    it('should reject password without uppercase', async () => {
      const data = { ...validData, password: 'lowercase123!', confirmPassword: 'lowercase123!' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Password must include uppercase, lowercase, number, and special character'
      );
    });

    it('should reject password without lowercase', async () => {
      const data = { ...validData, password: 'UPPERCASE123!', confirmPassword: 'UPPERCASE123!' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Password must include uppercase, lowercase, number, and special character'
      );
    });

    it('should reject password without number', async () => {
      const data = { ...validData, password: 'NoNumber!', confirmPassword: 'NoNumber!' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Password must include uppercase, lowercase, number, and special character'
      );
    });

    it('should reject password without special character', async () => {
      const data = { ...validData, password: 'NoSpecial123', confirmPassword: 'NoSpecial123' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Password must include uppercase, lowercase, number, and special character'
      );
    });

    it('should accept password with all requirements', async () => {
      const data = { ...validData, password: 'ValidPass123!', confirmPassword: 'ValidPass123!' };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept password with various special characters', async () => {
      const passwords = [
        'Password1#',
        'Password1$',
        'Password1%',
        'Password1^',
        'Password1&',
        'Password1*',
        'Password1(',
        'Password1)',
        'Password1-',
        'Password1_',
        'Password1=',
        'Password1+',
        'Password1[',
        'Password1]',
        'Password1{',
        'Password1}',
        'Password1|',
        'Password1\\',
        'Password1:',
        'Password1;',
        'Password1<',
        'Password1>',
        'Password1,',
        'Password1.',
        'Password1/',
        'Password1?',
        'Password1~',
        'Password1`',
      ];

      for (const password of passwords) {
        const data = { ...validData, password, confirmPassword: password };
        await expect(registrationSchema.validate(data)).resolves.toBeDefined();
      }
    });

    it('should reject password containing email local part', async () => {
      const data = {
        ...validData,
        email: 'john.doe@example.com',
        password: 'JohnDoe123!',
        confirmPassword: 'JohnDoe123!',
      };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Password cannot contain your name or email'
      );
    });

    it('should reject password containing first name', async () => {
      const data = {
        ...validData,
        firstName: 'Alexander',
        password: 'Alexander123!',
        confirmPassword: 'Alexander123!',
      };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Password cannot contain your name or email'
      );
    });

    it('should reject password containing last name', async () => {
      const data = {
        ...validData,
        lastName: 'Thompson',
        password: 'Thompson123!',
        confirmPassword: 'Thompson123!',
      };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Password cannot contain your name or email'
      );
    });

    it('should accept password with short name parts (< 3 chars)', async () => {
      const data = {
        ...validData,
        firstName: 'Li',
        lastName: 'Wu',
        password: 'LiWu123!',
        confirmPassword: 'LiWu123!',
      };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('confirmPassword validation', () => {
    it('should reject missing confirm password', async () => {
      const data = { ...validData };
      delete (data as Partial<typeof validData>).confirmPassword;
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Please confirm your password'
      );
    });

    it('should reject mismatched passwords', async () => {
      const data = {
        ...validData,
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
      };
      await expect(registrationSchema.validate(data)).rejects.toThrow('Passwords must match');
    });

    it('should accept matching passwords', async () => {
      const data = {
        ...validData,
        password: 'MatchingPass123!',
        confirmPassword: 'MatchingPass123!',
      };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('acceptTerms validation', () => {
    it('should reject if terms not accepted', async () => {
      const data = { ...validData, acceptTerms: false };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'You must accept the terms and conditions'
      );
    });

    it('should accept if terms accepted', async () => {
      const data = { ...validData, acceptTerms: true };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('emoji validation', () => {
    it('should reject first name with emojis (regex fails first)', async () => {
      const data = { ...validData, firstName: 'Warren😀' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name cannot contain numbers or special characters'
      );
    });

    it('should reject last name with emojis (regex fails first)', async () => {
      const data = { ...validData, lastName: 'Leon😀' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Last name cannot contain numbers or special characters'
      );
    });

    it('should reject email with emojis (email validation fails first)', async () => {
      const data = { ...validData, email: 'test😀@example.com' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });

    it('should reject phone number with emojis (regex fails first)', async () => {
      const data = { ...validData, phoneNumber: '+44770090😀' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Please enter a valid mobile number'
      );
    });

    it('should reject password with emojis (noEmoji fails first)', async () => {
      const data = {
        ...validData,
        password: 'SecurePass123!😀',
        confirmPassword: 'SecurePass123!😀',
      };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Password cannot contain emojis'
      );
    });

    it('should reject confirm password with emojis (oneOf fails first)', async () => {
      const data = { ...validData, confirmPassword: 'SecurePass123!😀' };
      await expect(registrationSchema.validate(data)).rejects.toThrow('Passwords must match');
    });
  });
});
