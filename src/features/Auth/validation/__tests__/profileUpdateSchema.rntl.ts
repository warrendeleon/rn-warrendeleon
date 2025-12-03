import { changePasswordSchema, profileUpdateSchema } from '../profileUpdateSchema';

describe('profileUpdateSchema', () => {
  describe('valid data', () => {
    it('should validate complete profile update data', async () => {
      const validData = {
        firstName: 'Warren',
        lastName: 'de Leon',
        email: 'test@example.com',
        phoneNumber: '+447911123456',
      };
      await expect(profileUpdateSchema.validate(validData)).resolves.toMatchObject(validData);
    });

    it('should validate partial profile update (only firstName)', async () => {
      const data = { firstName: 'Warren' };
      await expect(profileUpdateSchema.validate(data)).resolves.toMatchObject(data);
    });

    it('should validate partial profile update (only email)', async () => {
      const data = { email: 'test@example.com' };
      await expect(profileUpdateSchema.validate(data)).resolves.toMatchObject(data);
    });

    it('should validate empty object (no updates)', async () => {
      const data = {};
      await expect(profileUpdateSchema.validate(data)).resolves.toEqual({});
    });

    it('should lowercase email', async () => {
      const data = { email: 'TEST@EXAMPLE.COM' };
      const result = await profileUpdateSchema.validate(data);
      expect(result.email).toBe('test@example.com');
    });

    it('should trim whitespace', async () => {
      const data = {
        firstName: '  Warren  ',
        lastName: '  de Leon  ',
        email: '  test@example.com  ',
      };
      const result = await profileUpdateSchema.validate(data);
      expect(result.firstName).toBe('Warren');
      expect(result.lastName).toBe('de Leon');
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('firstName validation', () => {
    it('should reject first name shorter than 2 characters', async () => {
      const data = { firstName: 'W' };
      await expect(profileUpdateSchema.validate(data)).rejects.toThrow(
        'First name must be at least 2 characters'
      );
    });

    it('should reject first name longer than 50 characters', async () => {
      const data = { firstName: 'W'.repeat(51) };
      await expect(profileUpdateSchema.validate(data)).rejects.toThrow('First name is too long');
    });

    it('should reject first name with numbers (noHomographs fails first)', async () => {
      const data = { firstName: 'Warren123' };
      await expect(profileUpdateSchema.validate(data)).rejects.toThrow(
        'First name contains invalid characters'
      );
    });

    it('should accept first name with hyphens and apostrophes', async () => {
      const data = { firstName: "Mary-Jane O'Brien" };
      await expect(profileUpdateSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('lastName validation', () => {
    it('should reject last name shorter than 2 characters', async () => {
      const data = { lastName: 'L' };
      await expect(profileUpdateSchema.validate(data)).rejects.toThrow(
        'Last name must be at least 2 characters'
      );
    });

    it('should reject last name longer than 50 characters', async () => {
      const data = { lastName: 'L'.repeat(51) };
      await expect(profileUpdateSchema.validate(data)).rejects.toThrow('Last name is too long');
    });

    it('should reject last name with numbers (noHomographs fails first)', async () => {
      const data = { lastName: 'Leon123' };
      await expect(profileUpdateSchema.validate(data)).rejects.toThrow(
        'Last name contains invalid characters'
      );
    });

    it('should reject last name with Cyrillic characters (homograph)', async () => {
      // "Lеоn" - L + Cyrillic е + Cyrillic о + n (mixed scripts)
      const data = { lastName: 'Lеоn' };
      await expect(profileUpdateSchema.validate(data)).rejects.toThrow(
        'Name cannot contain mixed character sets'
      );
    });
  });

  describe('homograph validation (firstName)', () => {
    it('should reject first name with Cyrillic characters (homograph)', async () => {
      // "Јohn" - Cyrillic J + Latin ohn (mixed scripts)
      const data = { firstName: 'Јohn' };
      await expect(profileUpdateSchema.validate(data)).rejects.toThrow(
        'Name cannot contain mixed character sets'
      );
    });

    it('should reject first name with mixed Latin and Cyrillic', async () => {
      // "Mаry" - M + Cyrillic а + ry (mixed scripts)
      const data = { firstName: 'Mаry' };
      await expect(profileUpdateSchema.validate(data)).rejects.toThrow(
        'Name cannot contain mixed character sets'
      );
    });

    it('should accept valid Latin names', async () => {
      const data = { firstName: "Mary-Jane O'Brien" };
      await expect(profileUpdateSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('email validation', () => {
    it('should reject invalid email format', async () => {
      const data = { email: 'not-an-email' };
      await expect(profileUpdateSchema.validate(data)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });

    it('should accept valid email', async () => {
      const data = { email: 'valid@example.com' };
      await expect(profileUpdateSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('phoneNumber validation', () => {
    it('should reject phone number without country code', async () => {
      const data = { phoneNumber: '07700900000' };
      await expect(profileUpdateSchema.validate(data)).rejects.toThrow(
        'Please enter a valid mobile number'
      );
    });

    it('should accept valid phone number', async () => {
      const data = { phoneNumber: '+447911123456' };
      await expect(profileUpdateSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('emoji validation', () => {
    it('should reject first name with emojis (noHomographs fails first)', async () => {
      const data = { firstName: 'Warren😀' };
      await expect(profileUpdateSchema.validate(data)).rejects.toThrow(
        'First name contains invalid characters'
      );
    });

    it('should reject last name with emojis (noHomographs fails first)', async () => {
      const data = { lastName: 'Leon😀' };
      await expect(profileUpdateSchema.validate(data)).rejects.toThrow(
        'Last name contains invalid characters'
      );
    });

    it('should reject email with emojis (email validation fails first)', async () => {
      const data = { email: 'test😀@example.com' };
      await expect(profileUpdateSchema.validate(data)).rejects.toThrow(
        'Please enter a valid email address'
      );
    });

    it('should reject phone number with emojis (regex fails first)', async () => {
      const data = { phoneNumber: '+44770090😀' };
      await expect(profileUpdateSchema.validate(data)).rejects.toThrow(
        'Please enter a valid mobile number'
      );
    });
  });
});

describe('changePasswordSchema', () => {
  const validData = {
    currentPassword: 'OldPassword123!',
    newPassword: 'NewPassword456!',
    confirmNewPassword: 'NewPassword456!',
  };

  describe('valid data', () => {
    it('should validate correct password change data', async () => {
      await expect(changePasswordSchema.validate(validData)).resolves.toMatchObject(validData);
    });
  });

  describe('currentPassword validation', () => {
    it('should reject missing current password', async () => {
      const data = { ...validData, currentPassword: '' };
      await expect(changePasswordSchema.validate(data)).rejects.toThrow(
        'Current password is required'
      );
    });

    it('should accept any non-empty current password', async () => {
      const data = { ...validData, currentPassword: 'any' };
      await expect(changePasswordSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('newPassword validation', () => {
    it('should reject missing new password', async () => {
      const data = { currentPassword: 'OldPassword123!' };
      await expect(changePasswordSchema.validate(data)).rejects.toThrow();
    });

    it('should reject new password shorter than 8 characters', async () => {
      const data = { ...validData, newPassword: 'Short1!', confirmNewPassword: 'Short1!' };
      await expect(changePasswordSchema.validate(data)).rejects.toThrow(
        'Password must be at least 8 characters'
      );
    });

    it('should reject new password without uppercase', async () => {
      const data = {
        ...validData,
        newPassword: 'lowercase123!',
        confirmNewPassword: 'lowercase123!',
      };
      await expect(changePasswordSchema.validate(data)).rejects.toThrow(
        'Password must include uppercase, lowercase, number, and special character'
      );
    });

    it('should reject new password without lowercase', async () => {
      const data = {
        ...validData,
        newPassword: 'UPPERCASE123!',
        confirmNewPassword: 'UPPERCASE123!',
      };
      await expect(changePasswordSchema.validate(data)).rejects.toThrow(
        'Password must include uppercase, lowercase, number, and special character'
      );
    });

    it('should reject new password without number', async () => {
      const data = { ...validData, newPassword: 'NoNumber!', confirmNewPassword: 'NoNumber!' };
      await expect(changePasswordSchema.validate(data)).rejects.toThrow(
        'Password must include uppercase, lowercase, number, and special character'
      );
    });

    it('should reject new password without special character', async () => {
      const data = {
        ...validData,
        newPassword: 'NoSpecial123',
        confirmNewPassword: 'NoSpecial123',
      };
      await expect(changePasswordSchema.validate(data)).rejects.toThrow(
        'Password must include uppercase, lowercase, number, and special character'
      );
    });

    it('should reject new password same as current password', async () => {
      const data = {
        currentPassword: 'SamePassword123!',
        newPassword: 'SamePassword123!',
        confirmNewPassword: 'SamePassword123!',
      };
      await expect(changePasswordSchema.validate(data)).rejects.toThrow(
        'New password must be different from current password'
      );
    });

    it('should accept new password different from current', async () => {
      const data = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword456!',
        confirmNewPassword: 'NewPassword456!',
      };
      await expect(changePasswordSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('confirmNewPassword validation', () => {
    it('should reject missing confirm new password', async () => {
      const data = { ...validData };
      delete (data as Partial<typeof validData>).confirmNewPassword;
      await expect(changePasswordSchema.validate(data)).rejects.toThrow(
        'Please confirm your new password'
      );
    });

    it('should reject mismatched passwords', async () => {
      const data = {
        ...validData,
        newPassword: 'NewPassword456!',
        confirmNewPassword: 'DifferentPassword789!',
      };
      await expect(changePasswordSchema.validate(data)).rejects.toThrow('Passwords must match');
    });

    it('should accept matching passwords', async () => {
      const data = {
        ...validData,
        newPassword: 'MatchingPassword123!',
        confirmNewPassword: 'MatchingPassword123!',
      };
      await expect(changePasswordSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('emoji validation', () => {
    it('should reject current password with emojis', async () => {
      const data = { ...validData, currentPassword: 'Pass😀' };
      await expect(changePasswordSchema.validate(data)).rejects.toThrow(
        'Password cannot contain emojis'
      );
    });

    it('should reject new password with emojis (noEmoji fails first)', async () => {
      const data = {
        ...validData,
        newPassword: 'NewPassword456!😀',
        confirmNewPassword: 'NewPassword456!😀',
      };
      await expect(changePasswordSchema.validate(data)).rejects.toThrow(
        'Password cannot contain emojis'
      );
    });

    it('should reject confirm new password with emojis (oneOf fails first)', async () => {
      const data = { ...validData, confirmNewPassword: 'NewPassword456!😀' };
      await expect(changePasswordSchema.validate(data)).rejects.toThrow('Passwords must match');
    });
  });
});
