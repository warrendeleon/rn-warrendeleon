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

    it('should reject first name with numbers (noHomographs fails first)', async () => {
      const data = { ...validData, firstName: 'Warren123' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name contains invalid characters'
      );
    });

    it('should reject first name with special characters (noHomographs fails first)', async () => {
      const data = { ...validData, firstName: 'Warren@' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name contains invalid characters'
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

    it('should reject first name with Cyrillic characters (homograph)', async () => {
      // "Јohn" - Cyrillic J + Latin ohn (mixed scripts)
      const data = { ...validData, firstName: 'Јohn' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Name cannot contain mixed character sets'
      );
    });

    it('should reject first name with Greek characters (homograph)', async () => {
      // "Jοhn" - Latin J + Greek omicron + Latin hn (mixed scripts)
      const data = { ...validData, firstName: 'Jοhn' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Name cannot contain mixed character sets'
      );
    });

    it('should reject first name with mixed Latin and Cyrillic', async () => {
      // "Mаry" - M + Cyrillic а + ry (mixed scripts)
      const data = { ...validData, firstName: 'Mаry' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Name cannot contain mixed character sets'
      );
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

    it('should reject last name with numbers (noHomographs fails first)', async () => {
      const data = { ...validData, lastName: 'Leon123' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Last name contains invalid characters'
      );
    });

    it('should reject last name with Cyrillic characters (homograph)', async () => {
      // "Lеоn" - L + Cyrillic е + Cyrillic о + n (mixed scripts)
      const data = { ...validData, lastName: 'Lеоn' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Name cannot contain mixed character sets'
      );
    });

    it('should reject last name with Greek characters (homograph)', async () => {
      // "Leοn" - Le + Greek omicron + n (mixed scripts)
      const data = { ...validData, lastName: 'Leοn' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Name cannot contain mixed character sets'
      );
    });

    it('should reject last name with mixed Latin and Cyrillic', async () => {
      // "dе Leon" - d + Cyrillic е + space + Leon (mixed scripts)
      const data = { ...validData, lastName: 'dе Leon' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Name cannot contain mixed character sets'
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
    it('should reject first name with emojis (noHomographs fails first)', async () => {
      const data = { ...validData, firstName: 'Warren😀' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name contains invalid characters'
      );
    });

    it('should reject last name with emojis (noHomographs fails first)', async () => {
      const data = { ...validData, lastName: 'Leon😀' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Last name contains invalid characters'
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

  describe('XSS and injection prevention', () => {
    it('should reject first name with HTML script tags', async () => {
      const data = { ...validData, firstName: '<script>alert("xss")</script>' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name contains invalid characters'
      );
    });

    it('should reject last name with HTML script tags', async () => {
      const data = { ...validData, lastName: '<script>alert("xss")</script>' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Last name contains invalid characters'
      );
    });

    it('should reject first name with HTML event handlers', async () => {
      const data = { ...validData, firstName: 'onload=alert(1)' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name contains invalid characters'
      );
    });

    it('should reject email with javascript: protocol', async () => {
      const data = { ...validData, email: 'javascript:alert(1)@example.com' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });

    it('should reject first name with SQL injection attempt', async () => {
      const data = { ...validData, firstName: "'; DROP TABLE users; --" };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name contains invalid characters'
      );
    });

    it('should reject last name with SQL injection attempt', async () => {
      const data = { ...validData, lastName: "' OR '1'='1" };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Last name contains invalid characters'
      );
    });

    it('should reject first name with null byte injection', async () => {
      const data = { ...validData, firstName: 'Warren\x00Admin' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name contains invalid characters'
      );
    });

    it('should reject email with encoded XSS', async () => {
      const data = { ...validData, email: '%3Cscript%3Ealert(1)%3C/script%3E@example.com' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });
  });

  describe('boundary and stress testing', () => {
    it('should handle maximum length first name (50 chars)', async () => {
      const data = { ...validData, firstName: 'A'.repeat(50) };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should handle maximum length last name (50 chars)', async () => {
      const data = { ...validData, lastName: 'B'.repeat(50) };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should handle maximum length password (128 chars)', async () => {
      const maxPassword = 'Aa1!' + 'x'.repeat(124);
      const data = { ...validData, password: maxPassword, confirmPassword: maxPassword };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should reject extremely long first name (1000 chars)', async () => {
      const data = { ...validData, firstName: 'A'.repeat(1000) };
      await expect(registrationSchema.validate(data)).rejects.toThrow('First name is too long');
    });

    it('should reject extremely long last name (1000 chars)', async () => {
      const data = { ...validData, lastName: 'B'.repeat(1000) };
      await expect(registrationSchema.validate(data)).rejects.toThrow('Last name is too long');
    });

    it('should accept long emails (no max length in schema)', async () => {
      // Note: Schema has no email max length constraint
      // Long emails are valid if they pass email format validation
      const data = { ...validData, email: 'a'.repeat(250) + '@example.com' };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should handle whitespace-only inputs', async () => {
      const data = { ...validData, firstName: '   ' };
      await expect(registrationSchema.validate(data)).rejects.toThrow('First name is required');
    });

    it('should accept newline characters in names (regex uses \\s)', async () => {
      // Note: The name regex /^[a-zA-Z\s'-]+$/ uses \s which matches all whitespace
      // including newlines. This documents current behaviour.
      const data = { ...validData, firstName: 'Warren\nEvil' };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept tab characters in names (regex uses \\s)', async () => {
      // Note: The name regex /^[a-zA-Z\s'-]+$/ uses \s which matches all whitespace
      // including tabs. This documents current behaviour.
      const data = { ...validData, firstName: 'Warren\tEvil' };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('exact boundary tests', () => {
    describe('firstName length boundaries', () => {
      it('should reject firstName with 1 character (below minimum)', async () => {
        const data = { ...validData, firstName: 'A' };
        await expect(registrationSchema.validate(data)).rejects.toThrow(
          'First name must be at least 2 characters'
        );
      });

      it('should accept firstName with 2 characters (at minimum)', async () => {
        const data = { ...validData, firstName: 'Ab' };
        await expect(registrationSchema.validate(data)).resolves.toBeDefined();
      });

      it('should accept firstName with 49 characters (below maximum)', async () => {
        const data = { ...validData, firstName: 'A'.repeat(49) };
        await expect(registrationSchema.validate(data)).resolves.toBeDefined();
      });

      it('should accept firstName with 50 characters (at maximum)', async () => {
        const data = { ...validData, firstName: 'A'.repeat(50) };
        await expect(registrationSchema.validate(data)).resolves.toBeDefined();
      });

      it('should reject firstName with 51 characters (above maximum)', async () => {
        const data = { ...validData, firstName: 'A'.repeat(51) };
        await expect(registrationSchema.validate(data)).rejects.toThrow('First name is too long');
      });
    });

    describe('lastName length boundaries', () => {
      it('should reject lastName with 1 character (below minimum)', async () => {
        const data = { ...validData, lastName: 'A' };
        await expect(registrationSchema.validate(data)).rejects.toThrow(
          'Last name must be at least 2 characters'
        );
      });

      it('should accept lastName with 2 characters (at minimum)', async () => {
        const data = { ...validData, lastName: 'Ab' };
        await expect(registrationSchema.validate(data)).resolves.toBeDefined();
      });

      it('should accept lastName with 49 characters (below maximum)', async () => {
        const data = { ...validData, lastName: 'A'.repeat(49) };
        await expect(registrationSchema.validate(data)).resolves.toBeDefined();
      });

      it('should accept lastName with 50 characters (at maximum)', async () => {
        const data = { ...validData, lastName: 'A'.repeat(50) };
        await expect(registrationSchema.validate(data)).resolves.toBeDefined();
      });

      it('should reject lastName with 51 characters (above maximum)', async () => {
        const data = { ...validData, lastName: 'A'.repeat(51) };
        await expect(registrationSchema.validate(data)).rejects.toThrow('Last name is too long');
      });
    });

    describe('password length boundaries', () => {
      it('should reject password with 7 characters (below minimum)', async () => {
        const data = { ...validData, password: 'Aa1!xxx', confirmPassword: 'Aa1!xxx' };
        await expect(registrationSchema.validate(data)).rejects.toThrow(
          'Password must be at least 8 characters'
        );
      });

      it('should accept password with 8 characters (at minimum)', async () => {
        const data = { ...validData, password: 'Aa1!xxxx', confirmPassword: 'Aa1!xxxx' };
        await expect(registrationSchema.validate(data)).resolves.toBeDefined();
      });

      it('should accept password with 127 characters (below maximum)', async () => {
        const pass = 'Aa1!' + 'x'.repeat(123);
        const data = { ...validData, password: pass, confirmPassword: pass };
        await expect(registrationSchema.validate(data)).resolves.toBeDefined();
      });

      it('should accept password with 128 characters (at maximum)', async () => {
        const pass = 'Aa1!' + 'x'.repeat(124);
        const data = { ...validData, password: pass, confirmPassword: pass };
        await expect(registrationSchema.validate(data)).resolves.toBeDefined();
      });

      it('should reject password with 129 characters (above maximum)', async () => {
        const pass = 'Aa1!' + 'x'.repeat(125);
        const data = { ...validData, password: pass, confirmPassword: pass };
        await expect(registrationSchema.validate(data)).rejects.toThrow(
          'Password must not exceed 128 characters'
        );
      });
    });
  });

  describe('type coercion and null handling', () => {
    it('should reject null firstName', async () => {
      const data = { ...validData, firstName: null as unknown as string };
      await expect(registrationSchema.validate(data)).rejects.toThrow();
    });

    it('should reject null lastName', async () => {
      const data = { ...validData, lastName: null as unknown as string };
      await expect(registrationSchema.validate(data)).rejects.toThrow();
    });

    it('should reject null email', async () => {
      const data = { ...validData, email: null as unknown as string };
      await expect(registrationSchema.validate(data)).rejects.toThrow();
    });

    it('should reject null phoneNumber', async () => {
      const data = { ...validData, phoneNumber: null as unknown as string };
      await expect(registrationSchema.validate(data)).rejects.toThrow();
    });

    it('should reject undefined acceptTerms', async () => {
      const data = { ...validData };
      delete (data as Partial<typeof validData>).acceptTerms;
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'You must accept the terms and conditions'
      );
    });

    it('should handle number coercion for phoneNumber', async () => {
      const data = { ...validData, phoneNumber: 447911123456 as unknown as string };
      // Yup converts to string "447911123456" which lacks +
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Please enter a valid mobile number'
      );
    });
  });

  describe('unicode handling in names', () => {
    it('should reject accented Latin firstName - caught by noHomographs or regex', async () => {
      // Current schema applies noHomographs which may catch some accented chars
      // or the matches() regex /^[a-zA-Z\s'-]+$/ fails for non-ASCII
      const data = { ...validData, firstName: 'José', lastName: 'Smith' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name contains invalid characters'
      );
    });

    it('should reject accented Latin lastName - caught by noHomographs', async () => {
      // García contains 'í' and 'á' which are flagged by noHomographs
      const data = { ...validData, firstName: 'John', lastName: 'García' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Last name contains invalid characters'
      );
    });

    it('should reject mixed script names (Latin + Cyrillic) - mixed scripts rule', async () => {
      // 'Jоhn' has Latin J and Cyrillic о - caught by containsMixedScripts check
      const data = { ...validData, firstName: 'Jоhn', lastName: 'Smith' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'Name cannot contain mixed character sets'
      );
    });

    it('should reject names with diacritical marks - caught by noHomographs rule', async () => {
      // Current schema applies noHomographs which flags diacritical marks
      const data = { ...validData, firstName: 'Renée', lastName: 'Smith' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name contains invalid characters'
      );
    });

    it('should reject Nordic names - caught by noHomographs rule', async () => {
      // Current schema applies noHomographs which flags Nordic characters
      const data = { ...validData, firstName: 'Björk', lastName: 'Smith' };
      await expect(registrationSchema.validate(data)).rejects.toThrow(
        'First name contains invalid characters'
      );
    });

    it('should accept ASCII-only names with apostrophes', async () => {
      const data = { ...validData, firstName: "O'Brien", lastName: "D'Angelo" };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });

    it('should accept ASCII-only names with hyphens', async () => {
      const data = { ...validData, firstName: 'Mary-Jane', lastName: 'Smith-Jones' };
      await expect(registrationSchema.validate(data)).resolves.toBeDefined();
    });
  });
});
