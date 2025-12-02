/**
 * Tests for Supabase Auth Schemas
 * @jest-environment node
 */

import { z } from 'zod';

import {
  AUTH_ERROR_CODES,
  SupabaseAppMetadataSchema,
  SupabaseErrorResponseSchema,
  SupabaseIdentityDataSchema,
  SupabaseIdentitySchema,
  SupabaseRefreshTokenRequestSchema,
  SupabaseRefreshTokenResponseSchema,
  SupabaseSessionSchema,
  SupabaseSignInRequestSchema,
  SupabaseSignInResponseSchema,
  SupabaseSignUpRequestSchema,
  SupabaseSignUpResponseSchema,
  SupabaseUserMetadataSchema,
  SupabaseUserSchema,
} from '../supabase.auth.schema';

describe('supabase.auth.schema', () => {
  describe('SupabaseAppMetadataSchema', () => {
    it('should validate valid app metadata', () => {
      const validData = {
        provider: 'email',
        providers: ['email', 'google'],
      };
      expect(() => SupabaseAppMetadataSchema.parse(validData)).not.toThrow();
    });

    it('should allow empty object', () => {
      expect(() => SupabaseAppMetadataSchema.parse({})).not.toThrow();
    });

    it('should allow partial data', () => {
      expect(() => SupabaseAppMetadataSchema.parse({ provider: 'email' })).not.toThrow();
      expect(() => SupabaseAppMetadataSchema.parse({ providers: ['email'] })).not.toThrow();
    });
  });

  describe('SupabaseUserMetadataSchema', () => {
    it('should validate valid user metadata', () => {
      const validData = {
        first_name: 'John',
        last_name: 'Doe',
        age: 30,
        verified: true,
        nickname: null,
      };
      expect(() => SupabaseUserMetadataSchema.parse(validData)).not.toThrow();
    });

    it('should allow empty object', () => {
      expect(() => SupabaseUserMetadataSchema.parse({})).not.toThrow();
    });

    it('should reject invalid value types', () => {
      const invalidData = {
        nested: { foo: 'bar' }, // Objects not allowed
      };
      expect(() => SupabaseUserMetadataSchema.parse(invalidData)).toThrow();
    });
  });

  describe('SupabaseIdentityDataSchema', () => {
    it('should validate valid identity data', () => {
      const validData = {
        email: 'test@example.com',
        email_verified: true,
        phone_verified: false,
        sub: 'sub-123',
        first_name: 'John',
        last_name: 'Doe',
      };
      expect(() => SupabaseIdentityDataSchema.parse(validData)).not.toThrow();
    });

    it('should allow additional fields via passthrough', () => {
      const dataWithExtra = {
        email: 'test@example.com',
        custom_field: 'custom_value',
      };
      const result = SupabaseIdentityDataSchema.parse(dataWithExtra);
      expect(result.custom_field).toBe('custom_value');
    });

    it('should reject invalid email format', () => {
      const invalidData = { email: 'not-an-email' };
      expect(() => SupabaseIdentityDataSchema.parse(invalidData)).toThrow();
    });
  });

  describe('SupabaseIdentitySchema', () => {
    it('should validate valid identity', () => {
      const validData = {
        id: 'identity-123',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        provider: 'email',
        last_sign_in_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(() => SupabaseIdentitySchema.parse(validData)).not.toThrow();
    });

    it('should allow null last_sign_in_at', () => {
      const validData = {
        id: 'identity-123',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        provider: 'email',
        last_sign_in_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(() => SupabaseIdentitySchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid user_id format (non-UUID)', () => {
      const invalidData = {
        id: 'identity-123',
        user_id: 'not-a-uuid',
        provider: 'email',
        last_sign_in_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(() => SupabaseIdentitySchema.parse(invalidData)).toThrow();
    });
  });

  describe('SupabaseUserSchema', () => {
    const validUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      phone: null,
      created_at: '2024-01-01T00:00:00Z',
    };

    it('should validate minimal valid user', () => {
      expect(() => SupabaseUserSchema.parse(validUser)).not.toThrow();
    });

    it('should validate full user object', () => {
      const fullUser = {
        ...validUser,
        aud: 'authenticated',
        role: 'authenticated',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        confirmed_at: '2024-01-01T00:00:00Z',
        last_sign_in_at: '2024-01-01T00:00:00Z',
        app_metadata: { provider: 'email' },
        user_metadata: { first_name: 'John' },
        identities: [],
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(() => SupabaseUserSchema.parse(fullUser)).not.toThrow();
    });

    it('should allow raw_*_meta_data fields (REST API format)', () => {
      const restApiUser = {
        ...validUser,
        raw_app_meta_data: { provider: 'email' },
        raw_user_meta_data: { first_name: 'John' },
      };
      expect(() => SupabaseUserSchema.parse(restApiUser)).not.toThrow();
    });

    it('should reject invalid id format (non-UUID)', () => {
      const invalidUser = { ...validUser, id: 'not-a-uuid' };
      expect(() => SupabaseUserSchema.parse(invalidUser)).toThrow();
    });

    it('should reject invalid email format', () => {
      const invalidUser = { ...validUser, email: 'not-an-email' };
      expect(() => SupabaseUserSchema.parse(invalidUser)).toThrow();
    });

    it('should allow nullable fields', () => {
      const userWithNulls = {
        ...validUser,
        email_confirmed_at: null,
        confirmed_at: null,
        last_sign_in_at: null,
        banned_until: null,
        invited_at: null,
      };
      expect(() => SupabaseUserSchema.parse(userWithNulls)).not.toThrow();
    });
  });

  describe('SupabaseSessionSchema', () => {
    const validUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      phone: null,
      created_at: '2024-01-01T00:00:00Z',
    };

    it('should validate valid session', () => {
      const validSession = {
        access_token: 'access-token-123',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'refresh-token-123',
        user: validUser,
      };
      expect(() => SupabaseSessionSchema.parse(validSession)).not.toThrow();
    });

    it('should allow optional expires_at', () => {
      const sessionWithExpiresAt = {
        access_token: 'access-token-123',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: 1704067200,
        refresh_token: 'refresh-token-123',
        user: validUser,
      };
      expect(() => SupabaseSessionSchema.parse(sessionWithExpiresAt)).not.toThrow();
    });

    it('should reject missing required fields', () => {
      const invalidSession = {
        access_token: 'access-token-123',
        // missing token_type, expires_in, refresh_token, user
      };
      expect(() => SupabaseSessionSchema.parse(invalidSession)).toThrow();
    });
  });

  describe('SupabaseSignUpRequestSchema', () => {
    it('should validate valid sign up request', () => {
      const validRequest = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      expect(() => SupabaseSignUpRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should validate request with user metadata', () => {
      const requestWithMetadata = {
        email: 'test@example.com',
        password: 'Password123!',
        data: {
          first_name: 'John',
          last_name: 'Doe',
        },
      };
      expect(() => SupabaseSignUpRequestSchema.parse(requestWithMetadata)).not.toThrow();
    });

    it('should reject password less than 8 characters', () => {
      const invalidRequest = {
        email: 'test@example.com',
        password: 'short',
      };
      expect(() => SupabaseSignUpRequestSchema.parse(invalidRequest)).toThrow();
    });

    it('should reject invalid email format', () => {
      const invalidRequest = {
        email: 'not-an-email',
        password: 'Password123!',
      };
      expect(() => SupabaseSignUpRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe('SupabaseSignUpResponseSchema', () => {
    const validUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      phone: null,
      created_at: '2024-01-01T00:00:00Z',
    };

    it('should validate user object directly (email confirmation required)', () => {
      expect(() => SupabaseSignUpResponseSchema.parse(validUser)).not.toThrow();
    });

    it('should validate wrapped response (email confirmation disabled)', () => {
      const wrappedResponse = {
        user: validUser,
        session: {
          access_token: 'token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'refresh',
          user: validUser,
        },
      };
      expect(() => SupabaseSignUpResponseSchema.parse(wrappedResponse)).not.toThrow();
    });

    it('should validate wrapped response with null user/session', () => {
      const nullResponse = {
        user: null,
        session: null,
      };
      expect(() => SupabaseSignUpResponseSchema.parse(nullResponse)).not.toThrow();
    });
  });

  describe('SupabaseSignInRequestSchema', () => {
    it('should validate valid sign in request', () => {
      const validRequest = {
        email: 'test@example.com',
        password: 'password123',
      };
      expect(() => SupabaseSignInRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should allow any password length (no minimum for sign in)', () => {
      const shortPasswordRequest = {
        email: 'test@example.com',
        password: 'a',
      };
      expect(() => SupabaseSignInRequestSchema.parse(shortPasswordRequest)).not.toThrow();
    });

    it('should reject invalid email format', () => {
      const invalidRequest = {
        email: 'invalid',
        password: 'password123',
      };
      expect(() => SupabaseSignInRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe('SupabaseSignInResponseSchema', () => {
    it('should be same as SupabaseSessionSchema', () => {
      expect(SupabaseSignInResponseSchema).toBe(SupabaseSessionSchema);
    });
  });

  describe('SupabaseRefreshTokenRequestSchema', () => {
    it('should validate valid refresh token request', () => {
      const validRequest = {
        refresh_token: 'refresh-token-123',
      };
      expect(() => SupabaseRefreshTokenRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should reject missing refresh_token', () => {
      expect(() => SupabaseRefreshTokenRequestSchema.parse({})).toThrow();
    });
  });

  describe('SupabaseRefreshTokenResponseSchema', () => {
    it('should be same as SupabaseSessionSchema', () => {
      expect(SupabaseRefreshTokenResponseSchema).toBe(SupabaseSessionSchema);
    });
  });

  describe('SupabaseErrorResponseSchema', () => {
    it('should validate HTTPError format', () => {
      const httpError = {
        code: 400,
        error_code: 'email_not_confirmed',
        msg: 'Email not confirmed',
      };
      expect(() => SupabaseErrorResponseSchema.parse(httpError)).not.toThrow();
    });

    it('should validate OAuth error format', () => {
      const oauthError = {
        error: 'invalid_grant',
        error_description: 'Invalid credentials',
      };
      expect(() => SupabaseErrorResponseSchema.parse(oauthError)).not.toThrow();
    });

    it('should validate legacy message format', () => {
      const legacyError = {
        message: 'An error occurred',
      };
      expect(() => SupabaseErrorResponseSchema.parse(legacyError)).not.toThrow();
    });

    it('should allow empty object', () => {
      expect(() => SupabaseErrorResponseSchema.parse({})).not.toThrow();
    });
  });

  describe('AUTH_ERROR_CODES', () => {
    it('should have EMAIL_NOT_CONFIRMED constant', () => {
      expect(AUTH_ERROR_CODES.EMAIL_NOT_CONFIRMED).toBe('email_not_confirmed');
    });

    it('should have USER_ALREADY_EXISTS constant', () => {
      expect(AUTH_ERROR_CODES.USER_ALREADY_EXISTS).toBe('user_already_exists');
    });

    it('should have INVALID_CREDENTIALS constant', () => {
      expect(AUTH_ERROR_CODES.INVALID_CREDENTIALS).toBe('invalid_credentials');
    });

    it('should be immutable via TypeScript as const', () => {
      // AUTH_ERROR_CODES is 'as const' which makes it readonly at compile time
      // Runtime check that it has expected structure (TypeScript prevents modification)
      expect(Object.keys(AUTH_ERROR_CODES)).toHaveLength(3);
      expect(AUTH_ERROR_CODES).toEqual({
        EMAIL_NOT_CONFIRMED: 'email_not_confirmed',
        USER_ALREADY_EXISTS: 'user_already_exists',
        INVALID_CREDENTIALS: 'invalid_credentials',
      });
    });
  });

  describe('Type inference', () => {
    it('should infer correct types from schemas', () => {
      // These are compile-time checks - if this file compiles, types are correct
      type AppMetadata = z.infer<typeof SupabaseAppMetadataSchema>;
      type UserMetadata = z.infer<typeof SupabaseUserMetadataSchema>;
      type User = z.infer<typeof SupabaseUserSchema>;
      type Session = z.infer<typeof SupabaseSessionSchema>;

      // Runtime assertion that the types exist
      const appMetadata: AppMetadata = {};
      const userMetadata: UserMetadata = {};
      const user: User = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        phone: null,
        created_at: '2024-01-01T00:00:00Z',
      };
      const session: Session = {
        access_token: 'token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'refresh',
        user,
      };

      expect(appMetadata).toBeDefined();
      expect(userMetadata).toBeDefined();
      expect(user).toBeDefined();
      expect(session).toBeDefined();
    });
  });
});
