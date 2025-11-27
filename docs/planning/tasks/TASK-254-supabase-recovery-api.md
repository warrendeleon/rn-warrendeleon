# TASK-254: Supabase Recovery API Integration

**ID**: TASK-254 | **Epic**: [EPIC-024](../epics/EPIC-024-password-recovery.md) | **User Story**: [US-044](../stories/US-044-forgot-password-request.md)
**Status**: ⏳ In Progress | **Effort**: 2h

---

## File Structure

```
src/features/Auth/
├── api/
│   ├── passwordReset.ts             # Password recovery API client
│   └── __tests__/
│       └── passwordReset.test.ts
└── utils/
    └── rateLimiter.ts               # TASK-253 (imported by this API)
```

**Note**: Password recovery API is Auth-specific functionality, co-located with the Auth feature following feature-first architecture (established in TASK-196).

---

## Task Description

Integrate Supabase Auth REST API for password recovery. Send recovery email with magic link, handle rate limiting, and provide clear user feedback. Use custom REST API (NO Supabase SDK) for authentication operations.

---

## Acceptance Criteria

- [ ] Password reset API client created in `src/features/Auth/api/passwordReset.ts`
- [ ] Custom REST API integration for password recovery
- [ ] Send recovery email via Supabase Auth API
- [ ] Integrate rate limiting (3 requests per hour)
- [ ] Handle Supabase errors appropriately
- [ ] Clear error messages for user feedback
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Password Reset Service

```typescript
// src/features/Auth/api/passwordReset.ts

import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { checkPasswordResetRateLimit, recordPasswordResetRequest } from '../utils/rateLimiter';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Zod schema for Supabase password recovery response
const SupabaseRecoveryResponseSchema = z.object({
  message: z.string().optional(),
});

// Zod schema for Supabase error response
const SupabaseErrorSchema = z.object({
  error: z.string(),
  error_description: z.string().optional(),
});

export interface PasswordResetResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Request a password reset email from Supabase Auth
 *
 * Flow:
 * 1. Check rate limit (3 requests per hour)
 * 2. Send password recovery request to Supabase Auth REST API
 * 3. Record successful request for rate limiting
 * 4. Return success/error response
 *
 * @param email - User's email address
 * @returns Promise<void> - Throws error if request fails
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  // Step 1: Validate email format
  if (!email || !email.includes('@')) {
    throw new Error('Please provide a valid email address');
  }

  // Step 2: Check rate limit
  const rateLimitResult = await checkPasswordResetRateLimit(email);

  if (!rateLimitResult.allowed) {
    throw new Error(rateLimitResult.error || 'Rate limit exceeded');
  }

  try {
    // Step 3: Send password recovery request to Supabase Auth REST API
    const response = await axios.post(
      `${SUPABASE_URL}/auth/v1/recover`,
      {
        email: email.toLowerCase().trim(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
        },
        timeout: 10000, // 10 second timeout
      }
    );

    // Step 4: Validate response
    try {
      SupabaseRecoveryResponseSchema.parse(response.data);
    } catch (zodError) {
      console.error('Invalid Supabase recovery response:', zodError);
      throw new Error('Received invalid response from server');
    }

    // Step 5: Record successful request for rate limiting
    await recordPasswordResetRequest(email);

    // Note: Supabase always returns 200 OK even if email doesn't exist
    // This is a security feature to prevent email enumeration
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Password reset request failed:', error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Handle network errors
      if (!axiosError.response) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }

      // Handle Supabase API errors
      if (axiosError.response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }

      if (axiosError.response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }

      // Parse Supabase error response
      try {
        const errorData = SupabaseErrorSchema.parse(axiosError.response.data);
        throw new Error(errorData.error_description || errorData.error);
      } catch (zodError) {
        throw new Error('Failed to send password reset email. Please try again.');
      }
    }

    throw new Error('Failed to send password reset email. Please try again.');
  }
};

/**
 * Verify password reset token validity
 * This is called when user opens the reset password link
 *
 * @param token - Recovery token from deep link
 * @returns Promise<boolean> - True if token is valid
 */
export const verifyPasswordResetToken = async (token: string): Promise<boolean> => {
  if (!token || token.trim().length === 0) {
    return false;
  }

  try {
    // Verify token by attempting to get session
    const response = await axios.get(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      timeout: 10000,
    });

    return response.status === 200 && response.data?.id;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

/**
 * Reset password using recovery token
 *
 * @param token - Recovery token from deep link
 * @param newPassword - New password
 * @returns Promise<void> - Throws error if reset fails
 */
export const resetPasswordWithToken = async (token: string, newPassword: string): Promise<void> => {
  if (!token || token.trim().length === 0) {
    throw new Error('Invalid or expired reset token');
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  try {
    // Update password using recovery token
    const response = await axios.put(
      `${SUPABASE_URL}/auth/v1/user`,
      {
        password: newPassword,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          apikey: SUPABASE_ANON_KEY,
        },
        timeout: 10000,
      }
    );

    if (response.status !== 200) {
      throw new Error('Failed to reset password');
    }

    console.log('Password reset successfully');
  } catch (error) {
    console.error('Password reset failed:', error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (!axiosError.response) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }

      if (axiosError.response.status === 401) {
        throw new Error('Invalid or expired reset token. Please request a new password reset.');
      }

      if (axiosError.response.status === 422) {
        throw new Error('Password does not meet security requirements.');
      }

      if (axiosError.response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }

      try {
        const errorData = SupabaseErrorSchema.parse(axiosError.response.data);
        throw new Error(errorData.error_description || errorData.error);
      } catch (zodError) {
        throw new Error('Failed to reset password. Please try again.');
      }
    }

    throw new Error('Failed to reset password. Please try again.');
  }
};

/**
 * Get password reset configuration
 * (For display purposes - e.g., showing rate limit info to user)
 */
export const getPasswordResetConfig = () => {
  return {
    maxRequestsPerHour: 3,
    timeWindowMinutes: 60,
    tokenExpirationMinutes: 60,
    minPasswordLength: 8,
  };
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/features/Auth/api/__tests__/passwordReset.test.ts

import axios, { AxiosError } from 'axios';
import {
  requestPasswordReset,
  verifyPasswordResetToken,
  resetPasswordWithToken,
  getPasswordResetConfig,
} from '../passwordReset';
import * as rateLimiter from '../../utils/rateLimiter';

jest.mock('axios');
jest.mock('../../utils/rateLimiter');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockRateLimiter = rateLimiter as jest.Mocked<typeof rateLimiter>;

describe('passwordResetService', () => {
  const testEmail = 'user@example.com';
  const testToken = 'recovery_token_12345';
  const testPassword = 'NewSecurePassword123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPasswordReset', () => {
    beforeEach(() => {
      mockRateLimiter.checkPasswordResetRateLimit.mockResolvedValue({
        allowed: true,
        requestsRemaining: 2,
      });
      mockRateLimiter.recordPasswordResetRequest.mockResolvedValue(undefined);
    });

    it('should send password reset request successfully', async () => {
      mockAxios.post.mockResolvedValue({
        status: 200,
        data: { message: 'Recovery email sent' },
      });

      await expect(requestPasswordReset(testEmail)).resolves.toBeUndefined();

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/v1/recover'),
        { email: testEmail },
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            apikey: expect.any(String),
          }),
        })
      );

      expect(mockRateLimiter.recordPasswordResetRequest).toHaveBeenCalledWith(testEmail);
    });

    it('should normalize email to lowercase and trim', async () => {
      mockAxios.post.mockResolvedValue({
        status: 200,
        data: { message: 'Recovery email sent' },
      });

      await requestPasswordReset('  USER@EXAMPLE.COM  ');

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        { email: 'user@example.com' },
        expect.any(Object)
      );
    });

    it('should throw error for invalid email', async () => {
      await expect(requestPasswordReset('invalid-email')).rejects.toThrow(
        'Please provide a valid email address'
      );

      expect(mockAxios.post).not.toHaveBeenCalled();
    });

    it('should throw error when rate limit exceeded', async () => {
      mockRateLimiter.checkPasswordResetRateLimit.mockResolvedValue({
        allowed: false,
        requestsRemaining: 0,
        resetTime: new Date(),
        error: 'Rate limit exceeded',
      });

      await expect(requestPasswordReset(testEmail)).rejects.toThrow('Rate limit exceeded');

      expect(mockAxios.post).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      mockAxios.post.mockRejectedValue({
        isAxiosError: true,
        message: 'Network Error',
      } as AxiosError);

      await expect(requestPasswordReset(testEmail)).rejects.toThrow('Unable to connect to server');
    });

    it('should handle 429 Too Many Requests', async () => {
      mockAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 429,
          data: { error: 'Too many requests' },
        },
      } as AxiosError);

      await expect(requestPasswordReset(testEmail)).rejects.toThrow(
        'Too many requests. Please try again later.'
      );
    });

    it('should handle server errors (500+)', async () => {
      mockAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 500,
          data: { error: 'Internal server error' },
        },
      } as AxiosError);

      await expect(requestPasswordReset(testEmail)).rejects.toThrow(
        'Server error. Please try again later.'
      );
    });

    it('should handle Supabase error responses', async () => {
      mockAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            error: 'invalid_request',
            error_description: 'Email format is invalid',
          },
        },
      } as AxiosError);

      await expect(requestPasswordReset(testEmail)).rejects.toThrow('Email format is invalid');
    });

    it('should not record request if API call fails', async () => {
      mockAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 400,
          data: { error: 'Bad request' },
        },
      } as AxiosError);

      await expect(requestPasswordReset(testEmail)).rejects.toThrow();

      expect(mockRateLimiter.recordPasswordResetRequest).not.toHaveBeenCalled();
    });

    it('should validate Supabase response schema', async () => {
      mockAxios.post.mockResolvedValue({
        status: 200,
        data: { invalid_field: 'unexpected' },
      });

      // Should not throw - Zod schema allows optional fields
      await expect(requestPasswordReset(testEmail)).resolves.toBeUndefined();
    });
  });

  describe('verifyPasswordResetToken', () => {
    it('should verify valid token', async () => {
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: { id: 'user-123', email: testEmail },
      });

      const result = await verifyPasswordResetToken(testToken);

      expect(result).toBe(true);
      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/auth/v1/user'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${testToken}`,
          }),
        })
      );
    });

    it('should return false for invalid token', async () => {
      mockAxios.get.mockRejectedValue({
        isAxiosError: true,
        response: { status: 401 },
      } as AxiosError);

      const result = await verifyPasswordResetToken('invalid-token');

      expect(result).toBe(false);
    });

    it('should return false for empty token', async () => {
      const result = await verifyPasswordResetToken('');

      expect(result).toBe(false);
      expect(mockAxios.get).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      mockAxios.get.mockRejectedValue({
        isAxiosError: true,
        message: 'Network Error',
      } as AxiosError);

      const result = await verifyPasswordResetToken(testToken);

      expect(result).toBe(false);
    });
  });

  describe('resetPasswordWithToken', () => {
    it('should reset password successfully', async () => {
      mockAxios.put.mockResolvedValue({
        status: 200,
        data: { user: { id: 'user-123' } },
      });

      await expect(resetPasswordWithToken(testToken, testPassword)).resolves.toBeUndefined();

      expect(mockAxios.put).toHaveBeenCalledWith(
        expect.stringContaining('/auth/v1/user'),
        { password: testPassword },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${testToken}`,
          }),
        })
      );
    });

    it('should throw error for empty token', async () => {
      await expect(resetPasswordWithToken('', testPassword)).rejects.toThrow(
        'Invalid or expired reset token'
      );

      expect(mockAxios.put).not.toHaveBeenCalled();
    });

    it('should throw error for short password', async () => {
      await expect(resetPasswordWithToken(testToken, 'short')).rejects.toThrow(
        'Password must be at least 8 characters long'
      );

      expect(mockAxios.put).not.toHaveBeenCalled();
    });

    it('should handle invalid or expired token', async () => {
      mockAxios.put.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 401,
          data: { error: 'invalid_token' },
        },
      } as AxiosError);

      await expect(resetPasswordWithToken(testToken, testPassword)).rejects.toThrow(
        'Invalid or expired reset token'
      );
    });

    it('should handle weak password errors', async () => {
      mockAxios.put.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 422,
          data: { error: 'weak_password' },
        },
      } as AxiosError);

      await expect(resetPasswordWithToken(testToken, testPassword)).rejects.toThrow(
        'Password does not meet security requirements'
      );
    });

    it('should handle network errors', async () => {
      mockAxios.put.mockRejectedValue({
        isAxiosError: true,
        message: 'Network Error',
      } as AxiosError);

      await expect(resetPasswordWithToken(testToken, testPassword)).rejects.toThrow(
        'Unable to connect to server'
      );
    });

    it('should handle server errors', async () => {
      mockAxios.put.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 500,
          data: { error: 'Internal server error' },
        },
      } as AxiosError);

      await expect(resetPasswordWithToken(testToken, testPassword)).rejects.toThrow(
        'Server error. Please try again later.'
      );
    });
  });

  describe('getPasswordResetConfig', () => {
    it('should return password reset configuration', () => {
      const config = getPasswordResetConfig();

      expect(config).toEqual({
        maxRequestsPerHour: 3,
        timeWindowMinutes: 60,
        tokenExpirationMinutes: 60,
        minPasswordLength: 8,
      });
    });
  });
});
```

---

## Dependencies

- axios (already in project)
- zod (runtime validation)
- Rate limiter service (TASK-253)
- Environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`

---

## Definition of Done

- [ ] Password reset service implemented
- [ ] Custom REST API integration working
- [ ] Rate limiting integrated
- [ ] Token verification working
- [ ] Password reset with token working
- [ ] All error cases handled
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-044](../stories/US-044-forgot-password-request.md), [TASK-252](TASK-252-forgot-password-ui.md), [TASK-253](TASK-253-rate-limiter-implementation.md), [TASK-255](TASK-255-forgot-password-rntl-tests.md)
