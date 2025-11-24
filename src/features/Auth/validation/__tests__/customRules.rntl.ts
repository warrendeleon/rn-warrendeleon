import '../customRules'; // Import to register custom methods

import * as yup from 'yup';

describe('customRules', () => {
  describe('strongPassword', () => {
    const schema = yup.object({
      password: yup.string().strongPassword(),
    });

    it('should accept strong password with all requirements', async () => {
      const data = { password: 'StrongPass123!' };
      await expect(schema.validate(data)).resolves.toMatchObject(data);
    });

    it('should accept password with uppercase, lowercase, number, and special char', async () => {
      const data = { password: 'ValidP@ss1' };
      await expect(schema.validate(data)).resolves.toMatchObject(data);
    });

    it('should reject password without uppercase', async () => {
      const data = { password: 'weakpass123!' };
      await expect(schema.validate(data)).rejects.toThrow(
        'Password must be stronger (use uppercase, lowercase, numbers, and symbols)'
      );
    });

    it('should reject password without lowercase', async () => {
      const data = { password: 'WEAKPASS123!' };
      await expect(schema.validate(data)).rejects.toThrow(
        'Password must be stronger (use uppercase, lowercase, numbers, and symbols)'
      );
    });

    it('should reject password without number', async () => {
      const data = { password: 'WeakPass!' };
      await expect(schema.validate(data)).rejects.toThrow(
        'Password must be stronger (use uppercase, lowercase, numbers, and symbols)'
      );
    });

    it('should reject password without special character', async () => {
      const data = { password: 'WeakPass123' };
      await expect(schema.validate(data)).rejects.toThrow(
        'Password must be stronger (use uppercase, lowercase, numbers, and symbols)'
      );
    });

    it('should reject password too short', async () => {
      const data = { password: 'Weak1!' };
      await expect(schema.validate(data)).rejects.toThrow(
        'Password must be stronger (use uppercase, lowercase, numbers, and symbols)'
      );
    });

    it('should accept empty value when not required', async () => {
      const data = { password: '' };
      await expect(schema.validate(data)).resolves.toMatchObject(data);
    });

    it('should accept custom message', async () => {
      const customSchema = yup.object({
        password: yup.string().strongPassword('Custom error message'),
      });
      const data = { password: 'weak' };
      await expect(customSchema.validate(data)).rejects.toThrow('Custom error message');
    });
  });

  describe('notCommonPassword', () => {
    const schema = yup.object({
      password: yup.string().notCommonPassword(),
    });

    it('should accept non-common password', async () => {
      const data = { password: 'UniquePassword123!' };
      await expect(schema.validate(data)).resolves.toMatchObject(data);
    });

    it('should reject "password"', async () => {
      const data = { password: 'password' };
      await expect(schema.validate(data)).rejects.toThrow(
        'This password is too common. Please choose a different one.'
      );
    });

    it('should reject "PASSWORD" (case insensitive)', async () => {
      const data = { password: 'PASSWORD' };
      await expect(schema.validate(data)).rejects.toThrow(
        'This password is too common. Please choose a different one.'
      );
    });

    it('should reject "12345678"', async () => {
      const data = { password: '12345678' };
      await expect(schema.validate(data)).rejects.toThrow(
        'This password is too common. Please choose a different one.'
      );
    });

    it('should reject "qwerty"', async () => {
      const data = { password: 'qwerty' };
      await expect(schema.validate(data)).rejects.toThrow(
        'This password is too common. Please choose a different one.'
      );
    });

    it('should reject "abc123"', async () => {
      const data = { password: 'abc123' };
      await expect(schema.validate(data)).rejects.toThrow(
        'This password is too common. Please choose a different one.'
      );
    });

    it('should reject "dragon"', async () => {
      const data = { password: 'dragon' };
      await expect(schema.validate(data)).rejects.toThrow(
        'This password is too common. Please choose a different one.'
      );
    });

    it('should reject "DRAGON" (case insensitive)', async () => {
      const data = { password: 'DRAGON' };
      await expect(schema.validate(data)).rejects.toThrow(
        'This password is too common. Please choose a different one.'
      );
    });

    it('should accept empty value when not required', async () => {
      const data = { password: '' };
      await expect(schema.validate(data)).resolves.toMatchObject(data);
    });

    it('should accept custom message', async () => {
      const customSchema = yup.object({
        password: yup.string().notCommonPassword('Custom error message'),
      });
      const data = { password: 'password' };
      await expect(customSchema.validate(data)).rejects.toThrow('Custom error message');
    });
  });

  describe('noEmoji', () => {
    const schema = yup.object({
      field: yup.string().noEmoji(),
    });

    it('should accept text without emojis', async () => {
      const data = { field: 'Normal text 123' };
      await expect(schema.validate(data)).resolves.toMatchObject(data);
    });

    it('should accept special characters that are not emojis', async () => {
      const data = { field: 'Text with @#$%^&*()' };
      await expect(schema.validate(data)).resolves.toMatchObject(data);
    });

    it('should reject text with smiley emoji', async () => {
      const data = { field: 'Hello 😀' };
      await expect(schema.validate(data)).rejects.toThrow('Emojis are not allowed');
    });

    it('should reject text with celebration emoji', async () => {
      const data = { field: 'Party 🎉' };
      await expect(schema.validate(data)).rejects.toThrow('Emojis are not allowed');
    });

    it('should reject text with heart emoji', async () => {
      const data = { field: 'Love ❤️' };
      await expect(schema.validate(data)).rejects.toThrow('Emojis are not allowed');
    });

    it('should reject text with flag emoji', async () => {
      const data = { field: 'UK 🇬🇧' };
      await expect(schema.validate(data)).rejects.toThrow('Emojis are not allowed');
    });

    it('should reject text with fire emoji', async () => {
      const data = { field: 'Hot 🔥' };
      await expect(schema.validate(data)).rejects.toThrow('Emojis are not allowed');
    });

    it('should reject text with lightning emoji', async () => {
      const data = { field: 'Fast ⚡' };
      await expect(schema.validate(data)).rejects.toThrow('Emojis are not allowed');
    });

    it('should reject text with multiple emojis', async () => {
      const data = { field: '🎉🎊🎈' };
      await expect(schema.validate(data)).rejects.toThrow('Emojis are not allowed');
    });

    it('should accept empty value when not required', async () => {
      const data = { field: '' };
      await expect(schema.validate(data)).resolves.toMatchObject(data);
    });

    it('should accept custom message', async () => {
      const customSchema = yup.object({
        field: yup.string().noEmoji('Custom emoji error'),
      });
      const data = { field: 'Test 😀' };
      await expect(customSchema.validate(data)).rejects.toThrow('Custom emoji error');
    });
  });

  describe('noDisposableEmail', () => {
    const schema = yup.object({
      email: yup.string().noDisposableEmail(),
    });

    it('should accept normal email addresses', async () => {
      const data = { email: 'user@example.com' };
      await expect(schema.validate(data)).resolves.toMatchObject(data);
    });

    it('should accept corporate email addresses', async () => {
      const data = { email: 'john.doe@company.co.uk' };
      await expect(schema.validate(data)).resolves.toMatchObject(data);
    });

    it('should reject tempmail.com', async () => {
      const data = { email: 'user@tempmail.com' };
      await expect(schema.validate(data)).rejects.toThrow(
        'Disposable email addresses are not allowed'
      );
    });

    it('should reject guerrillamail.com', async () => {
      const data = { email: 'test@guerrillamail.com' };
      await expect(schema.validate(data)).rejects.toThrow(
        'Disposable email addresses are not allowed'
      );
    });

    it('should reject 10minutemail.com', async () => {
      const data = { email: 'temp@10minutemail.com' };
      await expect(schema.validate(data)).rejects.toThrow(
        'Disposable email addresses are not allowed'
      );
    });

    it('should reject mailinator.com', async () => {
      const data = { email: 'fake@mailinator.com' };
      await expect(schema.validate(data)).rejects.toThrow(
        'Disposable email addresses are not allowed'
      );
    });

    it('should be case insensitive', async () => {
      const data = { email: 'USER@TEMPMAIL.COM' };
      await expect(schema.validate(data)).rejects.toThrow(
        'Disposable email addresses are not allowed'
      );
    });

    it('should accept empty value when not required', async () => {
      const data = { email: '' };
      await expect(schema.validate(data)).resolves.toMatchObject(data);
    });

    it('should accept custom message', async () => {
      const customSchema = yup.object({
        email: yup.string().noDisposableEmail('Custom disposable email error'),
      });
      const data = { email: 'test@tempmail.com' };
      await expect(customSchema.validate(data)).rejects.toThrow('Custom disposable email error');
    });
  });

  describe('phoneNumber', () => {
    const schema = yup.object({
      phoneNumber: yup.string().phoneNumber(),
    });

    it('should accept valid UK mobile number', async () => {
      const data = { phoneNumber: '+447911123456' };
      await expect(schema.validate(data)).resolves.toMatchObject(data);
    });

    it('should accept valid US mobile number', async () => {
      const data = { phoneNumber: '+12025550123' };
      await expect(schema.validate(data)).resolves.toMatchObject(data);
    });

    it('should accept valid international mobile numbers', async () => {
      const numbers = [
        '+33612345678', // France
        '+491234567890', // Germany
        '+34612345678', // Spain
        '+61412345678', // Australia
        '+81901234567', // Japan
      ];

      for (const phoneNumber of numbers) {
        const data = { phoneNumber };
        await expect(schema.validate(data)).resolves.toMatchObject(data);
      }
    });

    it('should reject number without country code', async () => {
      const data = { phoneNumber: '07700900000' };
      await expect(schema.validate(data)).rejects.toThrow(
        'Please enter a valid phone number with country code'
      );
    });

    it('should reject invalid format', async () => {
      const data = { phoneNumber: '+44abc' };
      await expect(schema.validate(data)).rejects.toThrow(
        'Please enter a valid phone number with country code'
      );
    });

    it('should reject number too short', async () => {
      const data = { phoneNumber: '+44' };
      await expect(schema.validate(data)).rejects.toThrow(
        'Please enter a valid phone number with country code'
      );
    });

    it('should accept empty value when not required', async () => {
      const data = { phoneNumber: '' };
      await expect(schema.validate(data)).resolves.toMatchObject(data);
    });

    it('should accept custom message', async () => {
      const customSchema = yup.object({
        phoneNumber: yup.string().phoneNumber('Custom phone error'),
      });
      const data = { phoneNumber: '1234' };
      await expect(customSchema.validate(data)).rejects.toThrow('Custom phone error');
    });
  });

  describe('combining custom methods', () => {
    const schema = yup.object({
      password: yup.string().required().strongPassword().notCommonPassword(),
    });

    it('should accept strong and non-common password', async () => {
      const data = { password: 'UniqueStrongPass123!' };
      await expect(schema.validate(data)).resolves.toMatchObject(data);
    });

    it('should reject weak but common password', async () => {
      // "monkey" is in the top 100 list and is weak (no uppercase, no special char)
      const data = { password: 'monkey' };
      await expect(schema.validate(data)).rejects.toThrow(
        'Password must be stronger (use uppercase, lowercase, numbers, and symbols)'
      );
    });

    it('should reject weak password even if uncommon', async () => {
      const data = { password: 'uncommon' };
      await expect(schema.validate(data)).rejects.toThrow(
        'Password must be stronger (use uppercase, lowercase, numbers, and symbols)'
      );
    });

    it('should reject empty password', async () => {
      const data = { password: '' };
      await expect(schema.validate(data)).rejects.toThrow();
    });
  });
});
