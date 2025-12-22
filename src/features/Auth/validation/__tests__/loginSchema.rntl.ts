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

  describe('boundary tests', () => {
    describe('password length boundaries', () => {
      it('should reject password with exactly 7 characters (below minimum)', async () => {
        const data = { ...validData, password: '1234567' };
        await expect(loginSchema.validate(data)).rejects.toThrow(
          'Password must be at least 8 characters'
        );
      });

      it('should accept password with exactly 8 characters (at minimum)', async () => {
        const data = { ...validData, password: '12345678' };
        await expect(loginSchema.validate(data)).resolves.toBeDefined();
      });

      it('should accept password with 9 characters (above minimum)', async () => {
        const data = { ...validData, password: '123456789' };
        await expect(loginSchema.validate(data)).resolves.toBeDefined();
      });

      it('should accept password with exactly 128 characters (at maximum)', async () => {
        const data = { ...validData, password: 'a'.repeat(128) };
        await expect(loginSchema.validate(data)).resolves.toBeDefined();
      });

      it('should reject password with exactly 129 characters (above maximum)', async () => {
        const data = { ...validData, password: 'a'.repeat(129) };
        await expect(loginSchema.validate(data)).rejects.toThrow(
          'Password must not exceed 128 characters'
        );
      });

      it('should accept password with 127 characters (below maximum)', async () => {
        const data = { ...validData, password: 'a'.repeat(127) };
        await expect(loginSchema.validate(data)).resolves.toBeDefined();
      });
    });

    describe('unicode handling', () => {
      it('should handle UTF-8 characters in email domain', async () => {
        // IDN (Internationalized Domain Name) in email
        const data = { ...validData, email: 'test@münchen.de' };
        // Standard Yup email validation may not support IDN
        // This tests current behaviour
        await expect(loginSchema.validate(data)).rejects.toThrow(
          'Please enter a valid email address'
        );
      });

      it('should handle multi-byte UTF-8 characters in password', async () => {
        const data = { ...validData, password: '日本語パスワード' };
        await expect(loginSchema.validate(data)).resolves.toBeDefined();
      });

      it('should handle Arabic characters in password', async () => {
        const data = { ...validData, password: 'كلمةالمرور123' };
        await expect(loginSchema.validate(data)).resolves.toBeDefined();
      });

      it('should handle Chinese characters in password', async () => {
        const data = { ...validData, password: '密码密码密码密码' };
        await expect(loginSchema.validate(data)).resolves.toBeDefined();
      });

      it('should count Unicode characters correctly for length', async () => {
        // 8 Chinese characters should be valid (8 chars = min)
        const data = { ...validData, password: '密码密码密码密码' };
        await expect(loginSchema.validate(data)).resolves.toBeDefined();
      });

      it('should reject 7 Unicode characters (below minimum)', async () => {
        // 7 Chinese characters should be invalid (below min 8)
        const data = { ...validData, password: '密码密码密码密' };
        await expect(loginSchema.validate(data)).rejects.toThrow(
          'Password must be at least 8 characters'
        );
      });
    });

    describe('type coercion', () => {
      it('should coerce number email to string', async () => {
        const data = { email: 12345 as unknown as string, password: 'password123' };
        await expect(loginSchema.validate(data)).rejects.toThrow(
          'Please enter a valid email address'
        );
      });

      it('should coerce number password to string', async () => {
        const data = { email: 'test@example.com', password: 12345678 as unknown as string };
        // Yup converts to string "12345678" which is valid length
        await expect(loginSchema.validate(data)).resolves.toBeDefined();
      });

      it('should handle boolean coercion', async () => {
        const data = { email: true as unknown as string, password: 'password123' };
        await expect(loginSchema.validate(data)).rejects.toThrow(
          'Please enter a valid email address'
        );
      });
    });

    describe('null vs undefined handling', () => {
      it('should reject null email', async () => {
        const data = { email: null as unknown as string, password: 'password123' };
        await expect(loginSchema.validate(data)).rejects.toThrow();
      });

      it('should reject undefined email', async () => {
        const data = { password: 'password123' };
        await expect(loginSchema.validate(data)).rejects.toThrow('Email is required');
      });

      it('should reject null password', async () => {
        const data = { email: 'test@example.com', password: null as unknown as string };
        await expect(loginSchema.validate(data)).rejects.toThrow();
      });

      it('should reject undefined password', async () => {
        const data = { email: 'test@example.com' };
        await expect(loginSchema.validate(data)).rejects.toThrow('Password is required');
      });

      it('should reject completely empty object', async () => {
        const data = {};
        await expect(loginSchema.validate(data)).rejects.toThrow();
      });
    });

    describe('whitespace handling', () => {
      it('should trim leading whitespace from email', async () => {
        const data = { ...validData, email: '   test@example.com' };
        const result = await loginSchema.validate(data);
        expect(result.email).toBe('test@example.com');
      });

      it('should trim trailing whitespace from email', async () => {
        const data = { ...validData, email: 'test@example.com   ' };
        const result = await loginSchema.validate(data);
        expect(result.email).toBe('test@example.com');
      });

      it('should not trim password whitespace', async () => {
        const data = { ...validData, password: '  password  ' };
        const result = await loginSchema.validate(data);
        expect(result.password).toBe('  password  ');
      });

      it('should reject whitespace-only email', async () => {
        const data = { ...validData, email: '   ' };
        await expect(loginSchema.validate(data)).rejects.toThrow('Email is required');
      });

      it('should accept password with only whitespace (if meets length)', async () => {
        const data = { ...validData, password: '        ' }; // 8 spaces
        await expect(loginSchema.validate(data)).resolves.toBeDefined();
      });
    });

    describe('special character handling', () => {
      it('should accept email with plus addressing', async () => {
        const data = { ...validData, email: 'test+tag@example.com' };
        await expect(loginSchema.validate(data)).resolves.toBeDefined();
      });

      it('should accept email with dots in local part', async () => {
        const data = { ...validData, email: 'first.last@example.com' };
        await expect(loginSchema.validate(data)).resolves.toBeDefined();
      });

      it('should accept password with special characters', async () => {
        const data = { ...validData, password: '!@#$%^&*()_+-=[]{}|;:' };
        await expect(loginSchema.validate(data)).resolves.toBeDefined();
      });

      it('should accept password with newline characters', async () => {
        const data = { ...validData, password: 'password\nwith\nnewlines' };
        await expect(loginSchema.validate(data)).resolves.toBeDefined();
      });

      it('should accept password with tab characters', async () => {
        const data = { ...validData, password: 'password\twith\ttabs' };
        await expect(loginSchema.validate(data)).resolves.toBeDefined();
      });
    });
  });
});
