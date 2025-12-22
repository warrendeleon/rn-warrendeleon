/**
 * Security Tests for SupabaseAuthClient
 *
 * Tests security-related functionality:
 * - Token validation
 * - Input sanitisation
 * - Session fixation prevention
 * - API key security
 * - Credential handling
 */

import { http, HttpResponse } from 'msw';

import { server } from '@app/test-utils/msw/server';

import { SupabaseAuthClient } from '../SupabaseAuthClient';

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

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  aud: 'authenticated',
  email: 'test@example.com',
  email_confirmed_at: '2025-01-01T00:00:00Z',
  phone: null,
  confirmed_at: '2025-01-01T00:00:00Z',
  last_sign_in_at: '2025-01-01T00:00:00Z',
  created_at: '2025-01-01T00:00:00Z',
};

describe('SupabaseAuthClient - Security: Token Validation', () => {
  it('rejects malformed access tokens', async () => {
    const { SecureStore } = require('@app/utils/storage/SecureStore');
    const { isE2EMockEnabled } = require('@app/config/e2e');

    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
    (SecureStore.get as jest.Mock).mockResolvedValue('invalid_token_format');

    server.use(
      http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
        return HttpResponse.json({ error: 'bad_jwt', msg: 'Invalid JWT format' }, { status: 401 });
      })
    );

    const result = await SupabaseAuthClient.getCurrentUser();

    // Should return null for invalid token, not throw
    expect(result).toBeNull();
  });

  it('handles expired token during user fetch', async () => {
    const { SecureStore } = require('@app/utils/storage/SecureStore');
    const { isE2EMockEnabled } = require('@app/config/e2e');

    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
    (SecureStore.get as jest.Mock).mockResolvedValue('expired_token');

    server.use(
      http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
        return HttpResponse.json(
          { error_code: 'bad_jwt', msg: 'JWT token is expired' },
          { status: 403 }
        );
      })
    );

    const result = await SupabaseAuthClient.getCurrentUser();

    // Should gracefully return null for expired token
    expect(result).toBeNull();
  });
});

describe('SupabaseAuthClient - Security: Input Sanitisation', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    SupabaseAuthClient.resetMockState();
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
  });

  it('handles email with SQL injection attempt', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'validation_failed', msg: 'Invalid email format' },
          { status: 422 }
        );
      })
    );

    await expect(
      SupabaseAuthClient.signUp({
        email: "admin'--@example.com",
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });

  it('handles email with XSS attempt', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'validation_failed', msg: 'Invalid email format' },
          { status: 422 }
        );
      })
    );

    await expect(
      SupabaseAuthClient.signUp({
        email: '<script>alert("xss")</script>@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });

  it('handles password with special characters safely', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json({
          ...mockUser,
          email_confirmed_at: null,
        });
      })
    );

    // Password with special characters should be handled safely
    const result = await SupabaseAuthClient.signUp({
      email: 'test@example.com',
      password: 'P@$$w0rd!<>&"\'',
    });

    expect(result.user?.email).toBe('test@example.com');
  });
});

describe('Session fixation prevention', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    SupabaseAuthClient.resetMockState();
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
  });

  it('should generate new tokens on each login', async () => {
    let loginCount = 0;
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
        loginCount++;
        return HttpResponse.json({
          access_token: `unique_access_token_${loginCount}_${Date.now()}`,
          refresh_token: `unique_refresh_token_${loginCount}_${Date.now()}`,
          token_type: 'bearer',
          expires_in: 3600,
          user: mockUser,
        });
      })
    );

    // First login
    const result1 = await SupabaseAuthClient.signIn({
      email: 'test@example.com',
      password: 'Password123!',
    });

    // Second login (same user)
    const result2 = await SupabaseAuthClient.signIn({
      email: 'test@example.com',
      password: 'Password123!',
    });

    // Each login should get unique tokens (session fixation prevention)
    expect(result1.access_token).not.toBe(result2.access_token);
    expect(result1.refresh_token).not.toBe(result2.refresh_token);
  });

  it('should store new tokens replacing old ones on re-authentication', async () => {
    const { SecureStore, SecureStoreKey } = require('@app/utils/storage/SecureStore');

    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
        return HttpResponse.json({
          access_token: 'new_access_token',
          refresh_token: 'new_refresh_token',
          token_type: 'bearer',
          expires_in: 3600,
          user: mockUser,
        });
      })
    );

    await SupabaseAuthClient.signIn({
      email: 'test@example.com',
      password: 'Password123!',
    });

    // Verify tokens are stored (replacing any previous)
    expect(SecureStore.set).toHaveBeenCalledWith(SecureStoreKey.ACCESS_TOKEN, 'new_access_token');
    expect(SecureStore.set).toHaveBeenCalledWith(SecureStoreKey.REFRESH_TOKEN, 'new_refresh_token');
  });

  it('should clear all tokens on logout', async () => {
    const { SecureStore } = require('@app/utils/storage/SecureStore');
    (SecureStore.get as jest.Mock).mockResolvedValue('mock_access_token');

    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
        return HttpResponse.json({ success: true });
      })
    );

    await SupabaseAuthClient.logout();

    // Verify clear was called to remove all secure data
    expect(SecureStore.clear).toHaveBeenCalled();
  });
});

describe('API key security', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    SupabaseAuthClient.resetMockState();
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
  });

  it('should not expose API key in error messages', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'server_error', msg: 'Internal server error' },
          { status: 500 }
        );
      })
    );

    try {
      await SupabaseAuthClient.signUp({
        email: 'test@example.com',
        password: 'Password123!',
      });
    } catch (error) {
      // Error message should not contain the anon key
      expect((error as Error).message).not.toContain('test-anon-key');
    }
  });

  it('should not log access tokens in error scenarios', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const { SecureStore } = require('@app/utils/storage/SecureStore');
    (SecureStore.get as jest.Mock).mockResolvedValue('sensitive_access_token_12345');

    server.use(
      http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
        return HttpResponse.json({ error: 'server_error', msg: 'Internal error' }, { status: 500 });
      })
    );

    await SupabaseAuthClient.getCurrentUser();

    // Check no logged message contains the token
    const allLoggedContent = consoleErrorSpy.mock.calls.flat().join(' ');
    expect(allLoggedContent).not.toContain('sensitive_access_token_12345');

    consoleErrorSpy.mockRestore();
  });
});

describe('Token validation security', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    SupabaseAuthClient.resetMockState();
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
  });

  it('should reject empty access token', async () => {
    const { SecureStore } = require('@app/utils/storage/SecureStore');
    (SecureStore.get as jest.Mock).mockResolvedValue('');

    const result = await SupabaseAuthClient.getCurrentUser();

    // Empty token should be treated as no authentication
    expect(result).toBeNull();
  });

  it('should reject whitespace-only access token', async () => {
    const { SecureStore } = require('@app/utils/storage/SecureStore');
    (SecureStore.get as jest.Mock).mockResolvedValue('   ');

    server.use(
      http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
        return HttpResponse.json({ error: 'bad_jwt', msg: 'invalid JWT' }, { status: 401 });
      })
    );

    const result = await SupabaseAuthClient.getCurrentUser();

    expect(result).toBeNull();
  });

  it('should handle token with null bytes safely', async () => {
    const { SecureStore } = require('@app/utils/storage/SecureStore');
    (SecureStore.get as jest.Mock).mockResolvedValue('token\x00with\x00nulls');

    server.use(
      http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
        return HttpResponse.json({ error: 'bad_jwt', msg: 'invalid JWT format' }, { status: 401 });
      })
    );

    // Should handle gracefully, not crash
    const result = await SupabaseAuthClient.getCurrentUser();

    expect(result).toBeNull();
  });
});

describe('SupabaseAuthClient - Security: LDAP Injection Prevention', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    SupabaseAuthClient.resetMockState();
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
  });

  it('handles email with LDAP filter injection attempt', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'validation_failed', msg: 'Invalid email format' },
          { status: 422 }
        );
      })
    );

    // LDAP filter injection: )(uid=*))(|(uid=*
    await expect(
      SupabaseAuthClient.signUp({
        email: ')(uid=*))(|(uid=*@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });

  it('handles email with LDAP distinguished name injection', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'validation_failed', msg: 'Invalid email format' },
          { status: 422 }
        );
      })
    );

    // LDAP DN injection: cn=admin,dc=example,dc=com
    await expect(
      SupabaseAuthClient.signUp({
        email: 'cn=admin,dc=example,dc=com@test.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });

  it('handles password with LDAP special characters safely', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json({
          ...mockUser,
          email_confirmed_at: null,
        });
      })
    );

    // Password with LDAP special characters should be handled safely
    const result = await SupabaseAuthClient.signUp({
      email: 'test@example.com',
      password: 'P@ss*()\\|&!word123',
    });

    expect(result.user?.email).toBe('test@example.com');
  });

  it('handles email with LDAP wildcard injection', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
        return HttpResponse.json(
          { error: 'invalid_credentials', msg: 'Invalid login credentials' },
          { status: 400 }
        );
      })
    );

    // LDAP wildcard injection attempt
    await expect(
      SupabaseAuthClient.signIn({
        email: '*@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });

  it('handles email with LDAP parentheses escape attempt', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
        return HttpResponse.json(
          { error: 'invalid_credentials', msg: 'Invalid login credentials' },
          { status: 400 }
        );
      })
    );

    // LDAP parentheses escape attempt: admin)(&))
    await expect(
      SupabaseAuthClient.signIn({
        email: 'admin)(&))@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });
});

describe('SupabaseAuthClient - Security: XXE Prevention', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    SupabaseAuthClient.resetMockState();
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
  });

  it('handles email containing XML entity reference', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'validation_failed', msg: 'Invalid email format' },
          { status: 422 }
        );
      })
    );

    // XML entity reference in email
    await expect(
      SupabaseAuthClient.signUp({
        email: '&lt;script&gt;alert(1)&lt;/script&gt;@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });

  it('handles email containing XML CDATA section', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'validation_failed', msg: 'Invalid email format' },
          { status: 422 }
        );
      })
    );

    // CDATA section injection attempt
    await expect(
      SupabaseAuthClient.signUp({
        email: '<![CDATA[test]]>@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });

  it('handles email with DOCTYPE declaration injection', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'validation_failed', msg: 'Invalid email format' },
          { status: 422 }
        );
      })
    );

    // DOCTYPE declaration injection
    await expect(
      SupabaseAuthClient.signUp({
        email: '<!DOCTYPE foo>@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });

  it('handles password with XML entity expansion safely', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json({
          ...mockUser,
          email_confirmed_at: null,
        });
      })
    );

    // Password with XML-like content should be handled safely (JSON encoding)
    const result = await SupabaseAuthClient.signUp({
      email: 'test@example.com',
      password: 'P@ss&amp;&lt;&gt;&quot;word123!',
    });

    expect(result.user?.email).toBe('test@example.com');
  });

  it('handles email with external entity reference attempt', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'validation_failed', msg: 'Invalid email format' },
          { status: 422 }
        );
      })
    );

    // External entity reference attempt: <!ENTITY xxe SYSTEM "file:///etc/passwd">
    await expect(
      SupabaseAuthClient.signUp({
        email: '<!ENTITY xxe SYSTEM "file:///etc/passwd">@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });

  it('handles email with parameter entity injection', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'validation_failed', msg: 'Invalid email format' },
          { status: 422 }
        );
      })
    );

    // Parameter entity injection: %xxe;
    await expect(
      SupabaseAuthClient.signUp({
        email: '%xxe;@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });
});

describe('SupabaseAuthClient - Security: SSRF Prevention', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    SupabaseAuthClient.resetMockState();
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
  });

  it('handles email containing localhost URL', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'validation_failed', msg: 'Invalid email format' },
          { status: 422 }
        );
      })
    );

    // SSRF attempt with localhost
    await expect(
      SupabaseAuthClient.signUp({
        email: 'http://localhost:8080@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });

  it('handles email containing internal IP address', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'validation_failed', msg: 'Invalid email format' },
          { status: 422 }
        );
      })
    );

    // SSRF attempt with internal IP (192.168.x.x)
    await expect(
      SupabaseAuthClient.signUp({
        email: 'http://192.168.1.1@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });

  it('handles email containing AWS metadata URL', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'validation_failed', msg: 'Invalid email format' },
          { status: 422 }
        );
      })
    );

    // SSRF attempt targeting AWS metadata endpoint
    await expect(
      SupabaseAuthClient.signUp({
        email: 'http://169.254.169.254/latest/meta-data@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });

  it('handles email containing file:// protocol', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'validation_failed', msg: 'Invalid email format' },
          { status: 422 }
        );
      })
    );

    // SSRF attempt with file protocol
    await expect(
      SupabaseAuthClient.signUp({
        email: 'file:///etc/passwd@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });

  it('handles email containing IPv6 loopback', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'validation_failed', msg: 'Invalid email format' },
          { status: 422 }
        );
      })
    );

    // SSRF attempt with IPv6 loopback
    await expect(
      SupabaseAuthClient.signUp({
        email: 'http://[::1]:8080@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });

  it('handles email containing DNS rebinding attempt', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'validation_failed', msg: 'Invalid email format' },
          { status: 422 }
        );
      })
    );

    // DNS rebinding style attack domain
    await expect(
      SupabaseAuthClient.signUp({
        email: 'http://127.0.0.1.nip.io@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });

  it('handles email containing gopher protocol (legacy SSRF)', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'validation_failed', msg: 'Invalid email format' },
          { status: 422 }
        );
      })
    );

    // Gopher protocol SSRF attempt
    await expect(
      SupabaseAuthClient.signUp({
        email: 'gopher://localhost:9000@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });

  it('handles email containing cloud metadata URL variants', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
        return HttpResponse.json(
          { error: 'validation_failed', msg: 'Invalid email format' },
          { status: 422 }
        );
      })
    );

    // GCP metadata endpoint
    await expect(
      SupabaseAuthClient.signUp({
        email: 'http://metadata.google.internal@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });
});
