import { loginSchema } from '../loginSchema';

describe('loginSchema', () => {
  const validData = {
    email: 'test@example.com',
    password: 'password123',
    rememberMe: false,
  };

  describe('valid data', () => {
    it('should validate correct login data', async () => {
      await expect(loginSchema.validate(validData)).resolves.toMatchObject({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
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

    it('should default rememberMe to false if not provided', async () => {
      const data = { email: 'test@example.com', password: 'password123' };
      const result = await loginSchema.validate(data);
      expect(result.rememberMe).toBe(false);
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

    it('should accept any non-empty password', async () => {
      // Login form should accept any password (validation happened during registration)
      const data = { ...validData, password: 'a' };
      await expect(loginSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept password with spaces', async () => {
      const data = { ...validData, password: 'password with spaces' };
      await expect(loginSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept weak password (validation was at registration)', async () => {
      const data = { ...validData, password: 'weak' };
      await expect(loginSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('rememberMe validation', () => {
    it('should accept true', async () => {
      const data = { ...validData, rememberMe: true };
      await expect(loginSchema.validate(data)).resolves.toMatchObject({ rememberMe: true });
    });

    it('should accept false', async () => {
      const data = { ...validData, rememberMe: false };
      await expect(loginSchema.validate(data)).resolves.toMatchObject({ rememberMe: false });
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
      const data = { ...validData, password: 'Pass😀' };
      await expect(loginSchema.validate(data)).rejects.toThrow('Password cannot contain emojis');
    });
  });
});
