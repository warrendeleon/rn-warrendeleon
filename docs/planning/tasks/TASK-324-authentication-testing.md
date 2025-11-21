# TASK-324: Authentication Testing

**ID**: TASK-324 | **Epic**: [EPIC-029](../epics/EPIC-029-security-audit.md) | **User Story**: [US-057](../stories/US-057-owasp-compliance-audit.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Conduct penetration testing for authentication and authorization mechanisms. Test JWT token security, session management, refresh token rotation, PIN authentication, biometric authentication, and OAuth flows for vulnerabilities.

---

## Acceptance Criteria

- [ ] JWT token security tested
- [ ] Refresh token rotation verified
- [ ] Session management tested
- [ ] PIN authentication security tested
- [ ] Biometric authentication tested
- [ ] OAuth flow security tested
- [ ] Token expiration validated
- [ ] All vulnerabilities documented
- [ ] Test report generated

---

## Authentication Security Test Plan

### 1. JWT Token Security Testing

#### Test 1.1: Token Storage Security

**Objective**: Verify JWT tokens stored securely in Keychain, not AsyncStorage

**Test Steps**:

```bash
# Use objection to inspect storage
objection -g com.warrendeleon explore

# In objection REPL
ios keychain dump                    # Should find access_token
env                                   # Should NOT find access_token in env vars
```

**Expected Result**:

- ✅ `access_token` found in iOS Keychain
- ✅ `refresh_token` found in iOS Keychain
- ❌ Tokens NOT in AsyncStorage
- ❌ Tokens NOT in app environment variables

**Test Case**:

```typescript
// src/services/auth/__tests__/TokenStorage.security.test.ts

describe('JWT Token Storage Security', () => {
  it('should store tokens in Keychain only', async () => {
    const token = 'test.jwt.token';
    await AuthService.setAccessToken(token);

    // Verify in Keychain
    const keychainToken = await Keychain.getGenericPassword({
      service: 'supabase_access_token',
    });
    expect(keychainToken.password).toBe(token);

    // Verify NOT in AsyncStorage
    const asyncToken = await AsyncStorage.getItem('access_token');
    expect(asyncToken).toBeNull();

    // Verify NOT in EncryptedStorage
    const encryptedToken = await EncryptedStorage.getItem('access_token');
    expect(encryptedToken).toBeNull();
  });

  it('should clear tokens from all storage on logout', async () => {
    await AuthService.login('user@example.com', 'password');
    await AuthService.logout();

    // Verify cleared from Keychain
    const keychainToken = await Keychain.getGenericPassword({
      service: 'supabase_access_token',
    });
    expect(keychainToken).toBeFalsy();

    // Verify cleared from Redux
    const state = store.getState();
    expect(state.auth.accessToken).toBeNull();
  });
});
```

---

#### Test 1.2: Token Tampering Detection

**Objective**: Verify app rejects tampered JWT tokens

**Test Steps**:

```typescript
// src/services/auth/__tests__/TokenTampering.security.test.ts

describe('JWT Token Tampering Detection', () => {
  it('should reject tampered token signature', async () => {
    const validToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0In0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    // Tamper with signature (change last character)
    const tamperedToken = validToken.slice(0, -1) + 'X';

    await AuthService.setAccessToken(tamperedToken);

    // Try to make authenticated request
    await expect(apiClient.get('/api/protected')).rejects.toThrow('Invalid token');
  });

  it('should reject token with modified payload', async () => {
    // Original token with role: 'user'
    const originalToken = generateToken({ userId: '123', role: 'user' });

    // Manually modify payload to role: 'admin' (keep signature)
    const [header, payload, signature] = originalToken.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    decodedPayload.role = 'admin';
    const modifiedPayload = btoa(JSON.stringify(decodedPayload));
    const tamperedToken = `${header}.${modifiedPayload}.${signature}`;

    await AuthService.setAccessToken(tamperedToken);

    // Try to access admin endpoint
    await expect(apiClient.get('/api/admin/users')).rejects.toThrow('Invalid token');
  });

  it('should validate token expiration', async () => {
    // Create expired token
    const expiredToken = generateToken({
      userId: '123',
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    });

    await AuthService.setAccessToken(expiredToken);

    // Try to make request
    await expect(apiClient.get('/api/protected')).rejects.toThrow('Token expired');
  });
});
```

---

### 2. Session Management Testing

#### Test 2.1: Session Timeout

**Objective**: Verify session expires after inactivity period

**Test Steps**:

1. Login to app
2. Wait for inactivity timeout (15 minutes)
3. Try to perform action requiring authentication
4. Verify user is logged out

**Test Case**:

```typescript
// src/services/auth/__tests__/SessionTimeout.security.test.ts

describe('Session Management Security', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should expire session after inactivity timeout', async () => {
    await AuthService.login('user@example.com', 'password');

    // Wait 15 minutes (inactivity timeout)
    jest.advanceTimersByTime(15 * 60 * 1000);

    // Try to make authenticated request
    await expect(apiClient.get('/api/profile')).rejects.toThrow('Session expired');

    // Verify user logged out
    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(false);
  });

  it('should reset timeout on user activity', async () => {
    await AuthService.login('user@example.com', 'password');

    // Wait 10 minutes
    jest.advanceTimersByTime(10 * 60 * 1000);

    // User activity (API call)
    await apiClient.get('/api/profile');

    // Wait another 10 minutes (total 20, but timeout reset at 10)
    jest.advanceTimersByTime(10 * 60 * 1000);

    // Session should still be valid
    const response = await apiClient.get('/api/profile');
    expect(response.status).toBe(200);
  });

  it('should force logout on concurrent sessions exceeding limit', async () => {
    // Login from device 1
    const session1 = await AuthService.login('user@example.com', 'password');

    // Login from device 2
    const session2 = await AuthService.login('user@example.com', 'password');

    // Login from device 3 (exceeds concurrent session limit of 2)
    const session3 = await AuthService.login('user@example.com', 'password');

    // Verify device 1 session invalidated
    await expect(
      apiClient.get('/api/profile', {
        headers: { Authorization: `Bearer ${session1.accessToken}` },
      })
    ).rejects.toThrow('Session invalidated');

    // Verify devices 2 and 3 still valid
    const response2 = await apiClient.get('/api/profile', {
      headers: { Authorization: `Bearer ${session2.accessToken}` },
    });
    expect(response2.status).toBe(200);
  });
});
```

---

### 3. Refresh Token Security Testing

#### Test 3.1: Refresh Token Rotation

**Objective**: Verify refresh tokens are rotated on each use

**Test Steps**:

```typescript
// src/services/auth/__tests__/RefreshTokenRotation.security.test.ts

describe('Refresh Token Rotation', () => {
  it('should issue new refresh token on refresh', async () => {
    const { accessToken, refreshToken } = await AuthService.login('user@example.com', 'password');

    // Wait for access token to expire
    jest.advanceTimersByTime(60 * 60 * 1000); // 1 hour

    // Refresh tokens
    const refreshed = await AuthService.refreshTokens(refreshToken);

    // Verify new tokens issued
    expect(refreshed.accessToken).not.toBe(accessToken);
    expect(refreshed.refreshToken).not.toBe(refreshToken);

    // Verify old refresh token invalidated
    await expect(AuthService.refreshTokens(refreshToken)).rejects.toThrow('Invalid refresh token');
  });

  it('should detect refresh token reuse (replay attack)', async () => {
    const { refreshToken } = await AuthService.login('user@example.com', 'password');

    // Use refresh token once
    const refreshed1 = await AuthService.refreshTokens(refreshToken);

    // Try to reuse old refresh token
    await expect(AuthService.refreshTokens(refreshToken)).rejects.toThrow('Token reuse detected');

    // Verify all tokens for user invalidated (security measure)
    await expect(
      apiClient.get('/api/profile', {
        headers: { Authorization: `Bearer ${refreshed1.accessToken}` },
      })
    ).rejects.toThrow('Session invalidated');
  });

  it('should expire refresh token after max lifetime', async () => {
    const { refreshToken } = await AuthService.login('user@example.com', 'password');

    // Wait for refresh token max lifetime (30 days)
    jest.advanceTimersByTime(30 * 24 * 60 * 60 * 1000);

    // Try to refresh
    await expect(AuthService.refreshTokens(refreshToken)).rejects.toThrow('Refresh token expired');

    // User must re-authenticate
    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(false);
  });
});
```

---

### 4. PIN Authentication Security Testing

#### Test 4.1: PIN Hash Security

**Objective**: Verify PIN is hashed with bcrypt, not stored in plaintext

**Test Steps**:

```typescript
// src/services/auth/__tests__/PINSecurity.security.test.ts

describe('PIN Authentication Security', () => {
  it('should hash PIN with bcrypt before storage', async () => {
    const pin = '123456';
    await AuthService.setPIN(pin);

    // Get stored hash from Keychain
    const storedHash = await Keychain.getGenericPassword({
      service: 'pin_hash',
    });

    // Verify it's a bcrypt hash (starts with $2a$10$)
    expect(storedHash.password).toMatch(/^\$2[aby]\$10\$/);

    // Verify it's NOT the plaintext PIN
    expect(storedHash.password).not.toBe(pin);
  });

  it('should verify PIN using constant-time comparison', async () => {
    const correctPIN = '123456';
    const incorrectPIN = '654321';

    await AuthService.setPIN(correctPIN);

    // Measure verification time for correct PIN
    const startCorrect = Date.now();
    const resultCorrect = await AuthService.verifyPIN(correctPIN);
    const timeCorrect = Date.now() - startCorrect;

    // Measure verification time for incorrect PIN
    const startIncorrect = Date.now();
    const resultIncorrect = await AuthService.verifyPIN(incorrectPIN);
    const timeIncorrect = Date.now() - startIncorrect;

    // Times should be similar (within 10ms) - constant-time
    expect(Math.abs(timeCorrect - timeIncorrect)).toBeLessThan(10);

    expect(resultCorrect).toBe(true);
    expect(resultIncorrect).toBe(false);
  });

  it('should implement rate limiting for PIN attempts', async () => {
    const correctPIN = '123456';
    await AuthService.setPIN(correctPIN);

    // Try 5 incorrect attempts
    for (let i = 0; i < 5; i++) {
      await expect(AuthService.verifyPIN('000000')).resolves.toBe(false);
    }

    // 6th attempt should be rate limited
    await expect(AuthService.verifyPIN(correctPIN)).rejects.toThrow(
      'Too many attempts. Try again in 5 minutes.'
    );
  });

  it('should lock account after max failed attempts', async () => {
    const correctPIN = '123456';
    await AuthService.setPIN(correctPIN);

    // Try 10 incorrect attempts (max limit)
    for (let i = 0; i < 10; i++) {
      try {
        await AuthService.verifyPIN('000000');
      } catch (error) {
        // Rate limiting errors
      }
    }

    // Account should be locked
    await expect(AuthService.verifyPIN(correctPIN)).rejects.toThrow(
      'Account locked. Contact support.'
    );
  });
});
```

---

### 5. Biometric Authentication Security Testing

#### Test 5.1: Biometric Bypass Prevention

**Objective**: Verify biometric auth cannot be bypassed

**Test Steps**:

```typescript
// src/services/auth/__tests__/BiometricSecurity.security.test.ts

describe('Biometric Authentication Security', () => {
  it('should require hardware-backed biometric', async () => {
    const biometricInfo = await AuthService.getBiometricInfo();

    if (biometricInfo.available) {
      expect(biometricInfo.isHardwareBacked).toBe(true);
    }
  });

  it('should invalidate biometric auth when new fingerprint added', async () => {
    // Enable biometric auth
    await AuthService.enableBiometric();

    // Simulate new fingerprint enrolled (biometricChanged event)
    // This requires native implementation

    // Try to authenticate
    await expect(AuthService.authenticateWithBiometric()).rejects.toThrow(
      'Biometric configuration changed. Please re-enable.'
    );
  });

  it('should fall back to PIN when biometric fails', async () => {
    await AuthService.enableBiometric();
    await AuthService.setPIN('123456');

    // Simulate biometric failure
    jest.spyOn(BiometricAuth, 'authenticate').mockRejectedValue(new Error('Biometric failed'));

    // Should prompt for PIN
    const fallbackPrompt = await AuthService.authenticateWithBiometric();
    expect(fallbackPrompt.fallbackToPIN).toBe(true);
  });

  it('should not store biometric data locally', async () => {
    await AuthService.enableBiometric();

    // Check Keychain
    const keychainData = await Keychain.getAllGenericPasswordServices();
    const hasBiometricData = keychainData.some(
      service => service.includes('fingerprint') || service.includes('face')
    );

    expect(hasBiometricData).toBe(false);

    // Check AsyncStorage
    const asyncKeys = await AsyncStorage.getAllKeys();
    const hasBiometricKey = asyncKeys.some(
      key => key.includes('biometric') || key.includes('fingerprint')
    );

    expect(hasBiometricKey).toBe(false);
  });
});
```

---

### 6. OAuth Flow Security Testing

#### Test 6.1: PKCE Implementation

**Objective**: Verify OAuth uses PKCE to prevent authorization code interception

**Test Steps**:

```typescript
// src/services/auth/__tests__/OAuthSecurity.security.test.ts

describe('OAuth Flow Security', () => {
  it('should use PKCE for OAuth authorization', async () => {
    const oauth = new OAuthService();

    const authUrl = await oauth.getAuthorizationUrl();

    // Verify code_challenge parameter present
    const url = new URL(authUrl);
    expect(url.searchParams.has('code_challenge')).toBe(true);
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');

    // Verify code_verifier stored securely
    const verifier = await Keychain.getGenericPassword({
      service: 'oauth_code_verifier',
    });
    expect(verifier).toBeTruthy();
    expect(verifier.password.length).toBeGreaterThanOrEqual(43); // Min length
  });

  it('should validate state parameter to prevent CSRF', async () => {
    const oauth = new OAuthService();

    const authUrl = await oauth.getAuthorizationUrl();
    const url = new URL(authUrl);
    const state = url.searchParams.get('state');

    // Try to exchange code with wrong state
    await expect(oauth.handleCallback('auth_code_123', 'wrong_state')).rejects.toThrow(
      'Invalid state parameter'
    );

    // Correct state should work
    await expect(oauth.handleCallback('auth_code_123', state)).resolves.toBeTruthy();
  });

  it('should enforce redirect URI validation', async () => {
    const oauth = new OAuthService();

    // Try to use unauthorized redirect URI
    await expect(
      oauth.getAuthorizationUrl({ redirectUri: 'https://evil.com/callback' })
    ).rejects.toThrow('Unauthorized redirect URI');

    // Registered URI should work
    await expect(
      oauth.getAuthorizationUrl({ redirectUri: 'myapp://oauth/callback' })
    ).resolves.toBeTruthy();
  });
});
```

---

### 7. Authorization Testing

#### Test 7.1: Role-Based Access Control (RBAC)

**Objective**: Verify users can only access resources they're authorized for

**Test Steps**:

```typescript
// src/services/auth/__tests__/Authorization.security.test.ts

describe('Authorization Security', () => {
  it('should enforce role-based access control', async () => {
    // Login as regular user
    await AuthService.login('user@example.com', 'password');

    // Try to access admin endpoint
    await expect(apiClient.get('/api/admin/users')).rejects.toThrow('Forbidden');

    // User endpoint should work
    const response = await apiClient.get('/api/user/profile');
    expect(response.status).toBe(200);
  });

  it('should prevent privilege escalation via token manipulation', async () => {
    const userToken = await AuthService.login('user@example.com', 'password');

    // Try to modify claims in token
    const [header, payload, signature] = userToken.accessToken.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    decodedPayload.role = 'admin';
    const tamperedToken = `${header}.${btoa(JSON.stringify(decodedPayload))}.${signature}`;

    // Try to use tampered token
    await expect(
      apiClient.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${tamperedToken}` },
      })
    ).rejects.toThrow('Invalid token');
  });

  it('should validate resource ownership', async () => {
    // User 1 login
    const user1 = await AuthService.login('user1@example.com', 'password');

    // User 2 login
    const user2 = await AuthService.login('user2@example.com', 'password');

    // User 1 creates resource
    const resource = await apiClient.post(
      '/api/resources',
      { name: 'Test' },
      {
        headers: { Authorization: `Bearer ${user1.accessToken}` },
      }
    );

    // User 2 tries to access User 1's resource
    await expect(
      apiClient.get(`/api/resources/${resource.data.id}`, {
        headers: { Authorization: `Bearer ${user2.accessToken}` },
      })
    ).rejects.toThrow('Forbidden');
  });
});
```

---

## Manual Penetration Testing

### Test Scenario 1: Session Hijacking

**Tools**: Burp Suite, mitmproxy

**Steps**:

1. Intercept authentication request
2. Extract session token
3. Try to use token from different device
4. Verify session invalidation mechanisms

**Expected**: Session token bound to device fingerprint, IP validation

---

### Test Scenario 2: Brute Force Protection

**Tools**: Custom script, Burp Intruder

**Steps**:

```python
# scripts/security/brute-force-test.py

import requests
import time

API_URL = 'https://your-api.com/api/auth/login'
EMAIL = 'test@example.com'

# Try 100 login attempts
for i in range(100):
    response = requests.post(API_URL, json={
        'email': EMAIL,
        'password': f'password{i}'
    })

    if response.status_code == 429:
        print(f'✅ Rate limiting triggered at attempt {i}')
        break
    elif i > 10 and response.status_code == 200:
        print(f'❌ No rate limiting - brute force possible')
        break

    time.sleep(0.5)
```

**Expected**: Rate limiting after 5-10 attempts

---

### Test Scenario 3: Token Leakage

**Tools**: Burp Suite, Wireshark

**Steps**:

1. Monitor all network traffic
2. Check for tokens in:
   - URL parameters
   - HTTP GET requests
   - Unencrypted connections
   - Log files
   - Error messages

**Expected**: Tokens only in Authorization header over HTTPS

---

## Reporting Template

```markdown
## Authentication Security Test Report

**Test Date**: 2025-11-21
**Tester**: [Name]
**Application**: Warren DeLeon Portfolio v1.0.0

---

### Summary

| Category           | Tests | Passed | Failed | Risk      |
| ------------------ | ----- | ------ | ------ | --------- |
| Token Storage      | 5     | 5      | 0      | ✅ Low    |
| Session Management | 4     | 3      | 1      | ⚠️ Medium |
| Refresh Tokens     | 3     | 3      | 0      | ✅ Low    |
| PIN Security       | 4     | 4      | 0      | ✅ Low    |
| Biometric Auth     | 4     | 4      | 0      | ✅ Low    |
| OAuth Flow         | 3     | 3      | 0      | ✅ Low    |
| Authorization      | 3     | 3      | 0      | ✅ Low    |

**Overall Risk**: ⚠️ Medium

---

### Failed Tests

#### Test: Session Timeout Reset

**Status**: ❌ Failed
**Risk**: Medium
**Description**: Session timeout not properly reset on user activity
**Impact**: Users may be logged out unexpectedly
**Remediation**: Implement activity tracking middleware
**Priority**: High
```

---

## Definition of Done

- [ ] All JWT token security tests passing
- [ ] Refresh token rotation verified
- [ ] Session management tests complete
- [ ] PIN authentication security validated
- [ ] Biometric authentication tested
- [ ] OAuth flow security verified
- [ ] Authorization tests passing
- [ ] Manual penetration tests complete
- [ ] All vulnerabilities documented
- [ ] Test report generated
- [ ] Remediation plan created for failures

---

**Last Updated**: 2025-11-21
**Related**: [US-057](../stories/US-057-owasp-compliance-audit.md), [EPIC-029](../epics/EPIC-029-security-audit.md), [TASK-323](TASK-323-dynamic-analysis-setup.md)
