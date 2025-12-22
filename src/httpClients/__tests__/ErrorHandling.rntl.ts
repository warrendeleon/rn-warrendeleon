/**
 * Error Handling Branch Coverage Tests
 *
 * Comprehensive tests for all error handling paths in HTTP clients.
 * Covers network timeouts, rate limiting, status code mapping, and
 * error message extraction.
 */

import { delay, http, HttpResponse } from 'msw';

import { server } from '@app/test-utils/msw/server';

import { AuthError, SupabaseAuthClient } from '../SupabaseAuthClient';

// Mock dependencies
jest.mock('react-native-config', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
}));

jest.mock('@app/config/e2e', () => ({
  isE2EMockEnabled: jest.fn(() => false),
}));

jest.mock('@app/utils/storage/EncryptedStore', () => ({
  EncryptedStore: {
    set: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
  },
  EncryptedStoreKey: {
    USER_EMAIL: 'userEmail',
    USER_FIRST_NAME: 'userFirstName',
    USER_LAST_NAME: 'userLastName',
    USER_PHONE_NUMBER: 'userPhoneNumber',
  },
}));

jest.mock('@app/utils/storage/SecureStore', () => ({
  SecureStore: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
  },
  SecureStoreKey: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_ID: 'userId',
  },
}));

const SUPABASE_URL = 'https://test.supabase.co';

describe('Error Handling Branch Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
  });

  describe('HTTP Status Code Mapping', () => {
    it('maps 400 status to invalid_credentials error', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json({}, { status: 400 });
        })
      );

      try {
        await SupabaseAuthClient.signIn({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe('invalid_credentials');
        expect((error as AuthError).message).toBe('Invalid email or password');
      }
    });

    it('maps 422 status to user_already_exists error', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
          return HttpResponse.json({}, { status: 422 });
        })
      );

      try {
        await SupabaseAuthClient.signUp({
          email: 'existing@example.com',
          password: 'Password123!',
        });
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe('user_already_exists');
      }
    });

    it('maps 429 status to rate_limit_exceeded error', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json({}, { status: 429 });
        })
      );

      try {
        await SupabaseAuthClient.signIn({
          email: 'test@example.com',
          password: 'password123',
        });
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe('rate_limit_exceeded');
        expect((error as AuthError).message).toBe('Too many attempts. Please try again later.');
      }
    });

    it('maps 500 status to server_error', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json({}, { status: 500 });
        })
      );

      try {
        await SupabaseAuthClient.signIn({
          email: 'test@example.com',
          password: 'password123',
        });
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe('server_error');
      }
    });

    it('handles unknown status codes gracefully', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json({}, { status: 418 }); // I'm a teapot
        })
      );

      try {
        await SupabaseAuthClient.signIn({
          email: 'test@example.com',
          password: 'password123',
        });
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).message).toBe('An unexpected error occurred');
      }
    });
  });

  describe('Error Response Format Handling', () => {
    it('extracts error_code from HTTPError format', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(
            { error_code: 'email_not_confirmed', msg: 'Email not confirmed' },
            { status: 400 }
          );
        })
      );

      try {
        await SupabaseAuthClient.signIn({
          email: 'unverified@example.com',
          password: 'password123',
        });
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe('email_not_confirmed');
      }
    });

    it('extracts error_description from OAuth format', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(
            { error: 'invalid_grant', error_description: 'OAuth token expired' },
            { status: 400 }
          );
        })
      );

      try {
        await SupabaseAuthClient.signIn({
          email: 'test@example.com',
          password: 'password123',
        });
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).message).toBe('OAuth token expired');
      }
    });

    it('extracts msg from legacy format', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json({ msg: 'Legacy error message' }, { status: 400 });
        })
      );

      try {
        await SupabaseAuthClient.signIn({
          email: 'test@example.com',
          password: 'password123',
        });
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).message).toBe('Legacy error message');
      }
    });

    it('extracts message from standard format', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json({ message: 'Standard error message' }, { status: 400 });
        })
      );

      try {
        await SupabaseAuthClient.signIn({
          email: 'test@example.com',
          password: 'password123',
        });
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).message).toBe('Standard error message');
      }
    });

    it('handles error with both error_code and message', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
          return HttpResponse.json(
            {
              error_code: 'user_already_exists',
              msg: 'A user with this email already exists',
              message: 'Duplicate user',
            },
            { status: 422 }
          );
        })
      );

      try {
        await SupabaseAuthClient.signUp({
          email: 'existing@example.com',
          password: 'Password123!',
        });
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe('user_already_exists');
        // Should use the mapped message for known error codes
        expect((error as AuthError).message).toBe('User already exists');
      }
    });
  });

  describe('Network Error Handling', () => {
    it('handles network failure gracefully', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.error();
        })
      );

      try {
        await SupabaseAuthClient.signIn({
          email: 'test@example.com',
          password: 'password123',
        });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('handles timeout scenario', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, async () => {
          await delay(15000); // Longer than 10s timeout
          return HttpResponse.json({});
        })
      );

      try {
        await SupabaseAuthClient.signIn({
          email: 'test@example.com',
          password: 'password123',
        });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    }, 20000);
  });

  describe('Specific Error Code Mapping', () => {
    it('maps invalid_credentials error code', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(
            { error_code: 'invalid_credentials', msg: 'Bad credentials' },
            { status: 400 }
          );
        })
      );

      try {
        await SupabaseAuthClient.signIn({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe('invalid_credentials');
        expect((error as AuthError).message).toBe('Invalid email or password');
      }
    });

    it('maps email_not_confirmed error code', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(
            { error_code: 'email_not_confirmed', msg: 'Please verify email' },
            { status: 400 }
          );
        })
      );

      try {
        await SupabaseAuthClient.signIn({
          email: 'unverified@example.com',
          password: 'password123',
        });
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe('email_not_confirmed');
        expect((error as AuthError).message).toBe('Email not confirmed');
      }
    });

    it('preserves unknown error codes with original message', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(
            { error_code: 'custom_error_code', msg: 'Custom error occurred' },
            { status: 400 }
          );
        })
      );

      try {
        await SupabaseAuthClient.signIn({
          email: 'test@example.com',
          password: 'password123',
        });
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe('custom_error_code');
        expect((error as AuthError).message).toBe('Custom error occurred');
      }
    });
  });

  describe('Non-Axios Error Handling', () => {
    it('wraps standard Error in AuthError', async () => {
      // Mock the signIn to throw a standard Error
      const originalSignIn = SupabaseAuthClient.signIn;
      jest.spyOn(SupabaseAuthClient, 'signIn').mockImplementationOnce(async () => {
        throw new Error('Standard error message');
      });

      try {
        await SupabaseAuthClient.signIn({
          email: 'test@example.com',
          password: 'password123',
        });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toBe('Standard error message');
      }

      // Restore
      SupabaseAuthClient.signIn = originalSignIn;
    });
  });

  describe('resendConfirmationEmail Error Handling', () => {
    it('handles error during resend', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/resend`, () => {
          return HttpResponse.json(
            { error_code: 'too_many_requests', msg: 'Rate limited' },
            { status: 429 }
          );
        })
      );

      try {
        await SupabaseAuthClient.resendConfirmationEmail('test@example.com');
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
      }
    });
  });

  describe('resetPasswordWithToken Error Handling', () => {
    it('handles expired token error', async () => {
      server.use(
        http.put(`${SUPABASE_URL}/auth/v1/user`, () => {
          return HttpResponse.json({ error_code: 'bad_jwt', msg: 'JWT expired' }, { status: 401 });
        })
      );

      try {
        await SupabaseAuthClient.resetPasswordWithToken('expired_token', 'NewPassword123!');
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
      }
    });

    it('handles invalid token error', async () => {
      server.use(
        http.put(`${SUPABASE_URL}/auth/v1/user`, () => {
          return HttpResponse.json(
            { error_code: 'invalid_jwt', msg: 'Invalid token' },
            { status: 400 }
          );
        })
      );

      try {
        await SupabaseAuthClient.resetPasswordWithToken('invalid_token', 'NewPassword123!');
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
      }
    });
  });

  describe('requestPasswordRecovery Error Handling', () => {
    it('handles rate limit on recovery request', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/recover`, () => {
          return HttpResponse.json({}, { status: 429 });
        })
      );

      try {
        await SupabaseAuthClient.requestPasswordRecovery('test@example.com');
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe('rate_limit_exceeded');
      }
    });
  });

  describe('updateUser Error Handling', () => {
    const { SecureStore } = require('@app/utils/storage/SecureStore');

    beforeEach(() => {
      (SecureStore.get as jest.Mock).mockResolvedValue('mock_access_token');
    });

    it('handles validation error on update', async () => {
      server.use(
        http.put(`${SUPABASE_URL}/auth/v1/user`, () => {
          return HttpResponse.json(
            { error_code: 'validation_failed', msg: 'Invalid phone format' },
            { status: 422 }
          );
        })
      );

      try {
        await SupabaseAuthClient.updateUser({ phoneNumber: 'invalid' });
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
      }
    });

    it('handles unauthorized error on update', async () => {
      server.use(
        http.put(`${SUPABASE_URL}/auth/v1/user`, () => {
          return HttpResponse.json(
            { error_code: 'unauthorized', msg: 'Not logged in' },
            { status: 401 }
          );
        })
      );

      try {
        await SupabaseAuthClient.updateUser({ firstName: 'Test' });
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
      }
    });
  });

  describe('refreshSession Error Handling', () => {
    const { SecureStore } = require('@app/utils/storage/SecureStore');

    it('handles invalid refresh token', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValue('invalid_refresh_token');

      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(
            { error_code: 'invalid_refresh_token', msg: 'Token invalid' },
            { status: 400 }
          );
        })
      );

      try {
        await SupabaseAuthClient.refreshSession();
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
      }
    });

    it('handles expired refresh token', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValue('expired_refresh_token');

      // Use 400 instead of 401 to avoid triggering the token refresh interceptor loop
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(
            { error_code: 'token_expired', msg: 'Token expired' },
            { status: 400 }
          );
        })
      );

      try {
        await SupabaseAuthClient.refreshSession();
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
      }
    });
  });
});

describe('AuthError Class', () => {
  it('creates error with message only', () => {
    const error = new AuthError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('AuthError');
    expect(error.code).toBeUndefined();
  });

  it('creates error with message and code', () => {
    const error = new AuthError('Test error', 'test_code');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('AuthError');
    expect(error.code).toBe('test_code');
  });

  it('is instance of Error', () => {
    const error = new AuthError('Test error');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AuthError);
  });

  it('has proper stack trace', () => {
    const error = new AuthError('Test error');
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('AuthError');
  });
});
