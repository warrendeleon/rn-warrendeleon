import { loginSchema } from '../loginSchema';

describe('loginSchema', () => {
  const validData = {
    email: 'test@example.com',
    password: 'password123',
  };

  describe('valid data', () => {
    it('should validate correct login data', async () => {
      await expect(loginSchema.validate(validData)).resolves.toMatchObject({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should lowercase email', async () => {
      const data = { ...validData, email: 'TEST@EXAMPLE.COM' };
      const result = await loginSchema.validate(data);
      expect(result.email).toBe('test@example.com');
    });

    it('should trim whitespace from email', async () => {
      const data = { ...validData, email: '  test@example.com  ' };
      const result = await loginSchema.validate(data);
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('email validation', () => {
    it('should reject missing email', async () => {
      const data = { ...validData, email: '' };
      await expect(loginSchema.validate(data)).rejects.toThrow('Email is required');
    });

    it('should reject invalid email format', async () => {
      const data = { ...validData, email: 'not-an-email' };
      await expect(loginSchema.validate(data)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });

    it('should reject email without domain', async () => {
      const data = { ...validData, email: 'test@' };
      await expect(loginSchema.validate(data)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });

    it('should reject email without @', async () => {
      const data = { ...validData, email: 'testexample.com' };
      await expect(loginSchema.validate(data)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });

    it('should accept valid email', async () => {
      const data = { ...validData, email: 'valid@example.com' };
      await expect(loginSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('password validation', () => {
    it('should reject missing password', async () => {
      const data = { ...validData, password: '' };
      await expect(loginSchema.validate(data)).rejects.toThrow('Password is required');
    });

    it('should reject password shorter than 8 characters', async () => {
      const data = { ...validData, password: 'short' };
      await expect(loginSchema.validate(data)).rejects.toThrow(
        'Password must be at least 8 characters'
      );
    });

    it('should accept password with 8 or more characters', async () => {
      const data = { ...validData, password: '12345678' };
      await expect(loginSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept password with spaces', async () => {
      const data = { ...validData, password: 'password with spaces' };
      await expect(loginSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('emoji validation', () => {
    it('should reject email with emojis (email validation fails first)', async () => {
      const data = { ...validData, email: 'test😀@example.com' };
      await expect(loginSchema.validate(data)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });

    it('should reject password with emojis', async () => {
      const data = { ...validData, password: 'Password😀' };
      await expect(loginSchema.validate(data)).rejects.toThrow('Password cannot contain emojis');
    });
  });
});
