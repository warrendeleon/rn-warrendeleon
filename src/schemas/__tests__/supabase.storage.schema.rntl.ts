import {
  SupabaseFileObjectSchema,
  SupabasePublicURLSchema,
  SupabaseUpdateProfileRequestSchema,
  SupabaseUploadResponseSchema,
  SupabaseUserProfileSchema,
} from '../supabase.storage.schema';

describe('Supabase Storage Schemas', () => {
  describe('SupabaseUploadResponseSchema', () => {
    it('should validate correct upload response', () => {
      const data = {
        Key: 'avatars/user-123.jpg',
        path: 'user-123.jpg',
      };

      const result = SupabaseUploadResponseSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('should validate upload response without optional path', () => {
      const data = {
        Key: 'avatars/user-123.jpg',
      };

      const result = SupabaseUploadResponseSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('should throw on missing Key', () => {
      const data = {
        path: 'user-123.jpg',
      };

      expect(() => SupabaseUploadResponseSchema.parse(data)).toThrow();
    });
  });

  describe('SupabaseFileObjectSchema', () => {
    it('should validate complete file object', () => {
      const data = {
        name: 'avatar.jpg',
        id: '123e4567-e89b-12d3-a456-426614174000',
        updated_at: '2025-11-24T10:00:00Z',
        created_at: '2025-11-24T09:00:00Z',
        last_accessed_at: '2025-11-24T11:00:00Z',
        metadata: { size: 1024, contentType: 'image/jpeg' },
      };

      const result = SupabaseFileObjectSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('should validate file object with only required fields', () => {
      const data = {
        name: 'avatar.jpg',
      };

      const result = SupabaseFileObjectSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('should throw on invalid UUID', () => {
      const data = {
        name: 'avatar.jpg',
        id: 'invalid-uuid',
      };

      expect(() => SupabaseFileObjectSchema.parse(data)).toThrow();
    });

    it('should throw on missing name', () => {
      const data = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      expect(() => SupabaseFileObjectSchema.parse(data)).toThrow();
    });
  });

  describe('SupabasePublicURLSchema', () => {
    it('should validate public URL', () => {
      const data = {
        publicURL: 'https://example.com/storage/avatars/user-123.jpg',
      };

      const result = SupabasePublicURLSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('should validate null public URL', () => {
      const data = {
        publicURL: null,
      };

      const result = SupabasePublicURLSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('should throw on invalid URL', () => {
      const data = {
        publicURL: 'not-a-valid-url',
      };

      expect(() => SupabasePublicURLSchema.parse(data)).toThrow();
    });

    it('should throw on missing publicURL field', () => {
      const data = {};

      expect(() => SupabasePublicURLSchema.parse(data)).toThrow();
    });
  });

  describe('SupabaseUserProfileSchema', () => {
    it('should validate complete user profile', () => {
      const data = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'warren@example.com',
        firstName: 'Warren',
        lastName: 'DeLeon',
        profilePicture: 'https://example.com/avatar.jpg',
        authProvider: 'email' as const,
        createdAt: '2025-11-24T09:00:00Z',
        updatedAt: '2025-11-24T10:00:00Z',
      };

      const result = SupabaseUserProfileSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('should validate profile with null profilePicture', () => {
      const data = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'warren@example.com',
        firstName: 'Warren',
        lastName: 'DeLeon',
        phoneNumber: null,
        profilePicture: null,
        authProvider: 'linkedin' as const,
        createdAt: '2025-11-24T09:00:00Z',
        updatedAt: '2025-11-24T10:00:00Z',
      };

      const result = SupabaseUserProfileSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('should throw on invalid email', () => {
      const data = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'not-an-email',
        firstName: 'Warren',
        lastName: 'DeLeon',
        phoneNumber: null,
        profilePicture: null,
        authProvider: 'email' as const,
        createdAt: '2025-11-24T09:00:00Z',
        updatedAt: '2025-11-24T10:00:00Z',
      };

      expect(() => SupabaseUserProfileSchema.parse(data)).toThrow();
    });

    it('should throw on invalid authProvider', () => {
      const data = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'warren@example.com',
        firstName: 'Warren',
        lastName: 'DeLeon',
        phoneNumber: null,
        profilePicture: null,
        authProvider: 'google', // Not in enum
        createdAt: '2025-11-24T09:00:00Z',
        updatedAt: '2025-11-24T10:00:00Z',
      };

      expect(() => SupabaseUserProfileSchema.parse(data)).toThrow();
    });

    it('should validate magic_link authProvider', () => {
      const data = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'warren@example.com',
        firstName: 'Warren',
        lastName: 'DeLeon',
        phoneNumber: null,
        profilePicture: null,
        authProvider: 'magic_link' as const,
        createdAt: '2025-11-24T09:00:00Z',
        updatedAt: '2025-11-24T10:00:00Z',
      };

      const result = SupabaseUserProfileSchema.parse(data);

      expect(result).toEqual(data);
    });
  });

  describe('SupabaseUpdateProfileRequestSchema', () => {
    it('should validate complete update request', () => {
      const data = {
        firstName: 'Warren',
        lastName: 'DeLeon',
        profilePicture: 'https://example.com/avatar.jpg',
      };

      const result = SupabaseUpdateProfileRequestSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('should validate request with only firstName', () => {
      const data = {
        firstName: 'Warren',
      };

      const result = SupabaseUpdateProfileRequestSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('should validate request with only lastName', () => {
      const data = {
        lastName: 'DeLeon',
      };

      const result = SupabaseUpdateProfileRequestSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('should validate request with only profilePicture', () => {
      const data = {
        profilePicture: 'https://example.com/avatar.jpg',
      };

      const result = SupabaseUpdateProfileRequestSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('should validate empty request', () => {
      const data = {};

      const result = SupabaseUpdateProfileRequestSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('should throw on invalid profilePicture URL', () => {
      const data = {
        profilePicture: 'not-a-valid-url',
      };

      expect(() => SupabaseUpdateProfileRequestSchema.parse(data)).toThrow();
    });
  });
});
