/**
 * Tests for AuthError Class
 *
 * Unit tests for the custom AuthError class used by SupabaseAuthClient.
 * Tests error creation, inheritance, error handling patterns, and serialisation.
 */

import { AuthError } from '../SupabaseAuthClient';

describe('AuthError', () => {
  describe('constructor', () => {
    it('should create error with message only', () => {
      const error = new AuthError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.name).toBe('AuthError');
      expect(error.code).toBeUndefined();
    });

    it('should create error with message and code', () => {
      const error = new AuthError('Invalid credentials', 'invalid_credentials');

      expect(error.message).toBe('Invalid credentials');
      expect(error.code).toBe('invalid_credentials');
    });

    it('should create error with email_not_confirmed code', () => {
      const error = new AuthError('Email not confirmed', 'email_not_confirmed');

      expect(error.message).toBe('Email not confirmed');
      expect(error.code).toBe('email_not_confirmed');
    });

    it('should create error with user_already_exists code', () => {
      const error = new AuthError('User already exists', 'user_already_exists');

      expect(error.message).toBe('User already exists');
      expect(error.code).toBe('user_already_exists');
    });

    it('should create error with rate_limit_exceeded code', () => {
      const error = new AuthError('Too many attempts', 'rate_limit_exceeded');

      expect(error.message).toBe('Too many attempts');
      expect(error.code).toBe('rate_limit_exceeded');
    });

    it('should create error with server_error code', () => {
      const error = new AuthError('Server error', 'server_error');

      expect(error.message).toBe('Server error');
      expect(error.code).toBe('server_error');
    });
  });

  describe('inheritance', () => {
    it('should be instanceof Error', () => {
      const error = new AuthError('Test error');

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instanceof AuthError', () => {
      const error = new AuthError('Test error');

      expect(error).toBeInstanceOf(AuthError);
    });

    it('should have proper prototype chain', () => {
      const error = new AuthError('Test error');

      expect(Object.getPrototypeOf(error)).toBe(AuthError.prototype);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('error handling patterns', () => {
    it('should be catchable as Error', () => {
      const throwAndCatch = () => {
        try {
          throw new AuthError('Test error', 'test_code');
        } catch (e) {
          if (e instanceof Error) {
            return e;
          }
          throw e;
        }
      };

      const caught = throwAndCatch();
      expect(caught).toBeInstanceOf(AuthError);
    });

    it('should support error code checking', () => {
      const error = new AuthError('Email not confirmed', 'email_not_confirmed');

      const isEmailNotConfirmed = error.code === 'email_not_confirmed';
      expect(isEmailNotConfirmed).toBe(true);
    });

    it('should have stack trace', () => {
      const error = new AuthError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AuthError');
    });
  });

  describe('serialisation', () => {
    it('converts to formatted string with error name prefix', () => {
      const error = new AuthError('Test error');

      expect(error.toString()).toBe('AuthError: Test error');
    });

    it('serialises message and code properties to JSON format', () => {
      const error = new AuthError('Test error', 'test_code');

      expect(JSON.stringify({ message: error.message, code: error.code })).toBe(
        '{"message":"Test error","code":"test_code"}'
      );
    });
  });
});
