# TASK-260: Supabase Password Reset API Integration

**ID**: TASK-260 | **Epic**: [EPIC-024](../epics/EPIC-024-password-recovery.md) | **User Story**: [US-045](../stories/US-045-reset-password-with-token.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Integrate Supabase Auth REST API for resetting password with recovery token. Verify token validity, update password, handle errors, and manage session tokens after successful reset. Use custom REST API (NO Supabase SDK) for authentication operations.

---

## Acceptance Criteria

- [ ] Password reset API integration in `passwordResetService.ts` (extends TASK-254)
- [ ] Verify recovery token before showing reset form
- [ ] Update password with recovery token
- [ ] Return new access and refresh tokens after reset
- [ ] Handle invalid/expired token errors
- [ ] Handle weak password errors
- [ ] Store new tokens in Keychain (Tier 1)
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Extended Password Reset Service

```typescript
// src/services/auth/passwordResetService.ts (additions to TASK-254)

import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { storeAccessToken, storeRefreshToken } from '../storage/keychainService';

// Zod schema for password reset success response
const PasswordResetSuccessSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    aud: z.string(),
    role: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

/**
 * Verify password reset token validity (Extended implementation)
 *
 * @param token - Recovery token from deep link
 * @returns Promise<boolean> - True if token is valid
 */
export const verifyPasswordResetToken = async (token: string): Promise<boolean> => {
  if (!token || token.trim().length === 0) {
    console.error('Empty token provided');
    return false;
  }

  try {
    // Verify token by attempting to get user data
    const response = await axios.get(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      timeout: 10000,
    });

    // Token is valid if we get a 200 response with user data
    if (response.status === 200 && response.data?.id) {
      console.log('Password reset token is valid');
      return true;
    }

    console.warn('Invalid token response:', response.status);
    return false;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 401) {
        console.error('Token is invalid or expired');
        return false;
      }

      if (axiosError.response?.status === 403) {
        console.error('Token is not authorized');
        return false;
      }

      console.error('Token verification failed:', axiosError.message);
    } else {
      console.error('Unexpected error during token verification:', error);
    }

    return false;
  }
};

/**
 * Reset password using recovery token (Extended implementation)
 *
 * Flow:
 * 1. Validate inputs
 * 2. Send password update request with recovery token
 * 3. Receive new access and refresh tokens
 * 4. Store tokens in Keychain (Tier 1 storage)
 * 5. Return success
 *
 * @param token - Recovery token from deep link
 * @param newPassword - New password
 * @returns Promise<void> - Throws error if reset fails
 */
export const resetPasswordWithToken = async (token: string, newPassword: string): Promise<void> => {
  // Step 1: Validate inputs
  if (!token || token.trim().length === 0) {
    throw new Error('Invalid or expired reset token');
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  try {
    // Step 2: Send password update request
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

    // Step 3: Validate and parse response
    let parsedResponse;
    try {
      parsedResponse = PasswordResetSuccessSchema.parse(response.data);
    } catch (zodError) {
      console.error('Invalid password reset response:', zodError);
      throw new Error('Received invalid response from server');
    }

    // Step 4: Store new tokens in Keychain (Tier 1 - Hardware-backed)
    await storeAccessToken(parsedResponse.access_token);
    await storeRefreshToken(parsedResponse.refresh_token);

    console.log('Password reset successfully, new tokens stored');
  } catch (error) {
    console.error('Password reset failed:', error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Handle network errors
      if (!axiosError.response) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }

      // Handle invalid/expired token
      if (axiosError.response.status === 401) {
        throw new Error('Invalid or expired reset token. Please request a new password reset.');
      }

      // Handle forbidden (e.g., token already used)
      if (axiosError.response.status === 403) {
        throw new Error(
          'This reset link has already been used. Please request a new password reset.'
        );
      }

      // Handle weak password
      if (axiosError.response.status === 422) {
        try {
          const errorData = SupabaseErrorSchema.parse(axiosError.response.data);

          // Check for specific password-related errors
          if (
            errorData.error?.includes('password') ||
            errorData.error_description?.includes('password')
          ) {
            throw new Error(
              errorData.error_description || 'Password does not meet security requirements.'
            );
          }

          throw new Error(errorData.error_description || errorData.error);
        } catch (zodError) {
          throw new Error('Password does not meet security requirements.');
        }
      }

      // Handle rate limiting
      if (axiosError.response.status === 429) {
        throw new Error('Too many password reset attempts. Please try again later.');
      }

      // Handle server errors
      if (axiosError.response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }

      // Parse Supabase error response
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
 * Get password reset token metadata (for debugging)
 *
 * @param token - Recovery token
 * @returns Token metadata or null if invalid
 */
export const getPasswordResetTokenMetadata = async (
  token: string
): Promise<{
  userId: string;
  email: string;
  issuedAt: string;
} | null> => {
  try {
    const response = await axios.get(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      timeout: 10000,
    });

    if (response.status === 200 && response.data) {
      return {
        userId: response.data.id,
        email: response.data.email,
        issuedAt: response.data.updated_at || response.data.created_at,
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to get token metadata:', error);
    return null;
  }
};
```

---

### Keychain Service Integration

```typescript
// src/services/storage/keychainService.ts (relevant methods)

import * as Keychain from 'react-native-keychain';

const ACCESS_TOKEN_SERVICE = 'auth_access_token';
const REFRESH_TOKEN_SERVICE = 'auth_refresh_token';

/**
 * Store access token in Keychain (Tier 1 - Hardware-backed)
 */
export const storeAccessToken = async (token: string): Promise<void> => {
  try {
    await Keychain.setGenericPassword('access_token', token, {
      service: ACCESS_TOKEN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
    });
    console.log('Access token stored in Keychain');
  } catch (error) {
    console.error('Failed to store access token:', error);
    throw error;
  }
};

/**
 * Store refresh token in Keychain (Tier 1 - Hardware-backed)
 */
export const storeRefreshToken = async (token: string): Promise<void> => {
  try {
    await Keychain.setGenericPassword('refresh_token', token, {
      service: REFRESH_TOKEN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
    });
    console.log('Refresh token stored in Keychain');
  } catch (error) {
    console.error('Failed to store refresh token:', error);
    throw error;
  }
};

/**
 * Retrieve access token from Keychain
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: ACCESS_TOKEN_SERVICE,
    });

    if (credentials) {
      return credentials.password;
    }

    return null;
  } catch (error) {
    console.error('Failed to retrieve access token:', error);
    return null;
  }
};

/**
 * Retrieve refresh token from Keychain
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: REFRESH_TOKEN_SERVICE,
    });

    if (credentials) {
      return credentials.password;
    }

    return null;
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error);
    return null;
  }
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/services/auth/__tests__/passwordResetService.extended.test.ts

import axios, { AxiosError } from 'axios';
import {
  verifyPasswordResetToken,
  resetPasswordWithToken,
  getPasswordResetTokenMetadata,
} from '../passwordResetService';
import * as keychainService from '../../storage/keychainService';

jest.mock('axios');
jest.mock('../../storage/keychainService');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockKeychain = keychainService as jest.Mocked<typeof keychainService>;

describe('passwordResetService (Extended)', () => {
  const testToken = 'recovery_token_12345';
  const testPassword = 'NewSecurePassword123!';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyPasswordResetToken (Extended)', () => {
    it('should verify valid token', async () => {
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: {
          id: 'user-123',
          email: 'user@example.com',
          aud: 'authenticated',
          role: 'authenticated',
        },
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

    it('should reject invalid token (401)', async () => {
      mockAxios.get.mockRejectedValue({
        isAxiosError: true,
        response: { status: 401 },
      } as AxiosError);

      const result = await verifyPasswordResetToken(testToken);

      expect(result).toBe(false);
    });

    it('should reject expired token (403)', async () => {
      mockAxios.get.mockRejectedValue({
        isAxiosError: true,
        response: { status: 403 },
      } as AxiosError);

      const result = await verifyPasswordResetToken(testToken);

      expect(result).toBe(false);
    });

    it('should handle empty token', async () => {
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

  describe('resetPasswordWithToken (Extended)', () => {
    const mockTokenResponse = {
      access_token: 'new_access_token_123',
      refresh_token: 'new_refresh_token_456',
      token_type: 'bearer',
      expires_in: 3600,
      user: {
        id: 'user-123',
        email: 'user@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-21T00:00:00Z',
      },
    };

    beforeEach(() => {
      mockKeychain.storeAccessToken.mockResolvedValue();
      mockKeychain.storeRefreshToken.mockResolvedValue();
    });

    it('should reset password and store new tokens', async () => {
      mockAxios.put.mockResolvedValue({
        status: 200,
        data: mockTokenResponse,
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

      expect(mockKeychain.storeAccessToken).toHaveBeenCalledWith('new_access_token_123');
      expect(mockKeychain.storeRefreshToken).toHaveBeenCalledWith('new_refresh_token_456');
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

    it('should handle invalid/expired token (401)', async () => {
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

      expect(mockKeychain.storeAccessToken).not.toHaveBeenCalled();
    });

    it('should handle token already used (403)', async () => {
      mockAxios.put.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 403,
          data: { error: 'token_already_used' },
        },
      } as AxiosError);

      await expect(resetPasswordWithToken(testToken, testPassword)).rejects.toThrow(
        'This reset link has already been used'
      );
    });

    it('should handle weak password (422)', async () => {
      mockAxios.put.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 422,
          data: {
            error: 'weak_password',
            error_description: 'Password is too weak',
          },
        },
      } as AxiosError);

      await expect(resetPasswordWithToken(testToken, testPassword)).rejects.toThrow(
        'Password is too weak'
      );
    });

    it('should handle rate limiting (429)', async () => {
      mockAxios.put.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 429,
          data: { error: 'too_many_requests' },
        },
      } as AxiosError);

      await expect(resetPasswordWithToken(testToken, testPassword)).rejects.toThrow(
        'Too many password reset attempts'
      );
    });

    it('should handle server errors (500+)', async () => {
      mockAxios.put.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 500,
          data: { error: 'internal_server_error' },
        },
      } as AxiosError);

      await expect(resetPasswordWithToken(testToken, testPassword)).rejects.toThrow(
        'Server error. Please try again later.'
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

    it('should handle invalid response schema', async () => {
      mockAxios.put.mockResolvedValue({
        status: 200,
        data: { invalid_field: 'unexpected' },
      });

      await expect(resetPasswordWithToken(testToken, testPassword)).rejects.toThrow(
        'Received invalid response from server'
      );

      expect(mockKeychain.storeAccessToken).not.toHaveBeenCalled();
    });

    it('should handle keychain storage failure', async () => {
      mockAxios.put.mockResolvedValue({
        status: 200,
        data: mockTokenResponse,
      });

      mockKeychain.storeAccessToken.mockRejectedValue(new Error('Keychain error'));

      await expect(resetPasswordWithToken(testToken, testPassword)).rejects.toThrow();
    });
  });

  describe('getPasswordResetTokenMetadata', () => {
    it('should retrieve token metadata', async () => {
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: {
          id: 'user-123',
          email: 'user@example.com',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-21T00:00:00Z',
        },
      });

      const metadata = await getPasswordResetTokenMetadata(testToken);

      expect(metadata).toEqual({
        userId: 'user-123',
        email: 'user@example.com',
        issuedAt: '2025-01-21T00:00:00Z',
      });
    });

    it('should return null for invalid token', async () => {
      mockAxios.get.mockRejectedValue({
        isAxiosError: true,
        response: { status: 401 },
      } as AxiosError);

      const metadata = await getPasswordResetTokenMetadata(testToken);

      expect(metadata).toBeNull();
    });
  });
});
```

---

## Dependencies

- axios (already in project)
- zod (runtime validation)
- react-native-keychain (Tier 1 storage)
- Password reset service (TASK-254)
- Keychain service (TASK-234)

---

## Definition of Done

- [ ] Password reset API integration complete
- [ ] Token verification working
- [ ] Password update working
- [ ] New tokens stored in Keychain
- [ ] All error cases handled
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-045](../stories/US-045-reset-password-with-token.md), [TASK-254](TASK-254-supabase-recovery-api.md), [TASK-257](TASK-257-reset-password-ui.md), [TASK-259](TASK-259-password-validation.md)
