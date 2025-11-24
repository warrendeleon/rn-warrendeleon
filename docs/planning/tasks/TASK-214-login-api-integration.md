# TASK-214: Login API Integration

**ID**: TASK-214 | **Title**: Integrate Supabase Auth API for Email/Password Login
**User Story**: [US-036](../stories/US-036-email-password-login.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: High | **Effort**: 2h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

## File Structure

```
src/features/Auth/
├── api/
│   └── api.ts              # signIn method already implemented (TASK-192)
├── store/
│   └── actions.ts          # login action already implemented (TASK-196)
└── screens/
    └── LoginScreen.tsx     # Integration point (TASK-213)
```

**Note**: Login API client and Redux actions already implemented in TASK-192/196. This task focuses on integration with LoginScreen.

---

## Context & Background

### Why This Task Matters

The login API integration is the core authentication mechanism that:

1. **Validates User Credentials**: Verifies email/password against Supabase Auth database
2. **Issues Security Tokens**: Returns access token (1h lifetime) and refresh token (30 days)
3. **Manages Sessions**: Establishes user session for the app
4. **Handles Errors**: Provides specific error messages for different failure scenarios

**Authentication Flow**:

```
User submits login form
  → App calls POST /auth/v1/token (Supabase Auth API)
  → Supabase validates email/password
  → Success → Returns access_token + refresh_token + user metadata
  → Store access_token in Keychain (service: auth_access_token)
  → Store refresh_token in Keychain (service: auth_refresh_token)
  → Store user metadata in Encrypted Storage
  → Update Redux state (isAuthenticated: true, user: {...})
  → Navigate to Home screen
  → Failure → Return error (401, 400, 429, 500)
  → Display error message to user
```

**Token Storage Strategy** (3-Tier Architecture):

```
Tier 1 (Keychain - Hardware-backed):
  - access_token (1h lifetime)
  - refresh_token (30 days)
  - PIN hash (if biometric fallback enabled)

Tier 2 (Encrypted Storage - AES-256):
  - User email
  - User full name
  - Profile picture URL
  - User ID (UUID)

Tier 3 (AsyncStorage - Plain text):
  - Theme preference
  - Language preference
  - Last login timestamp
```

### API Endpoint Specification

**Supabase Auth API**: `POST https://PROJECT_ID.supabase.co/auth/v1/token?grant_type=password`

**Request Headers**:

```
Content-Type: application/json
apikey: YOUR_SUPABASE_ANON_KEY
```

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (Success - 200)**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "v1.MRjVvFwKpwpDqrG...",
  "user": {
    "id": "f7b3c5d1-8e9a-4b2c-9d0e-1f2a3b4c5d6e",
    "email": "user@example.com",
    "email_confirmed_at": "2025-11-21T10:30:00Z",
    "created_at": "2025-11-20T08:15:00Z",
    "updated_at": "2025-11-21T10:30:00Z",
    "user_metadata": {
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  }
}
```

**Response (Error - 400 Bad Request)**:

```json
{
  "error": "invalid_grant",
  "error_description": "Invalid login credentials"
}
```

**Response (Error - 429 Too Many Requests)**:

```json
{
  "error": "rate_limit_exceeded",
  "error_description": "Email rate limit exceeded"
}
```

---

## Objective

Build complete login API integration with:

1. Axios HTTP client for Supabase Auth API
2. Zod response validation
3. Token storage in Keychain (hardware-backed)
4. User metadata storage in Encrypted Storage
5. Redux state management
6. Error handling for all scenarios (401, 400, 429, network errors)
7. Loading state management

---

## Detailed Implementation Guide

### Phase 1: Set Up Axios Client (15 minutes)

**File**: `src/api/client.ts`

**Deliverables**:

- Axios instance with Supabase base URL
- Default headers (apikey)
- Request/response interceptors (logging)

**Code**:

```typescript
// src/api/client.ts
import axios from 'axios';
import Config from 'react-native-config';

export const apiClient = axios.create({
  baseURL: Config.SUPABASE_URL,
  headers: {
    'Content-Type': 'application/json',
    apikey: Config.SUPABASE_ANON_KEY,
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor (logging)
apiClient.interceptors.request.use(
  config => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    // Mask sensitive data in logs
    if (config.data?.password) {
      console.log('[API Request] Body:', { ...config.data, password: '***REDACTED***' });
    } else {
      console.log('[API Request] Body:', config.data);
    }
    return config;
  },
  error => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor (logging)
apiClient.interceptors.response.use(
  response => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    // Mask tokens in logs
    if (response.data?.access_token) {
      console.log('[API Response] Data:', {
        ...response.data,
        access_token: '***REDACTED***',
        refresh_token: '***REDACTED***',
      });
    } else {
      console.log('[API Response] Data:', response.data);
    }
    return response;
  },
  error => {
    console.error('[API Response Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
```

**Environment Variables** (`.env.development`):

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

---

### Phase 2: Create Zod Response Schemas (20 minutes)

**File**: `src/api/auth/schemas.ts`

**Deliverables**:

- Zod schema for successful login response
- Zod schema for error response
- TypeScript types inferred from schemas

**Code**:

```typescript
// src/api/auth/schemas.ts
import { z } from 'zod';

// User metadata schema
export const userMetadataSchema = z.object({
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

// User schema
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  email_confirmed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  user_metadata: userMetadataSchema.optional(),
});

// Successful login response schema
export const loginResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.literal('bearer'),
  expires_in: z.number().positive(),
  refresh_token: z.string().min(1),
  user: userSchema,
});

// Error response schema
export const authErrorSchema = z.object({
  error: z.string(),
  error_description: z.string(),
});

// TypeScript types
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type AuthError = z.infer<typeof authErrorSchema>;
export type User = z.infer<typeof userSchema>;
```

**Validation**:

```bash
yarn typecheck
```

---

### Phase 3: Create Login API Function (30 minutes)

**File**: `src/api/auth/login.ts`

**Deliverables**:

- `loginWithEmail` function
- Response validation with Zod
- Error handling (typed errors)

**Code**:

```typescript
// src/api/auth/login.ts
import { apiClient } from '../client';
import { loginResponseSchema, authErrorSchema, LoginResponse, AuthError } from './schemas';

export interface LoginCredentials {
  email: string;
  password: string;
}

export class LoginError extends Error {
  constructor(
    public code: string,
    public description: string,
    public statusCode?: number
  ) {
    super(description);
    this.name = 'LoginError';
  }
}

export const loginWithEmail = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post('/auth/v1/token?grant_type=password', credentials);

    // Validate response with Zod
    const validation = loginResponseSchema.safeParse(response.data);

    if (!validation.success) {
      console.error('[Login] Invalid response format:', validation.error);
      throw new LoginError('invalid_response', 'Received invalid response from server', 500);
    }

    return validation.data;
  } catch (error: any) {
    // Handle Axios errors
    if (error.response) {
      // Server responded with error
      const errorValidation = authErrorSchema.safeParse(error.response.data);

      if (errorValidation.success) {
        const { error: code, error_description } = errorValidation.data;

        throw new LoginError(code, error_description, error.response.status);
      } else {
        // Unknown error format
        throw new LoginError(
          'unknown_error',
          'An unexpected error occurred',
          error.response.status
        );
      }
    } else if (error.request) {
      // Network error (no response)
      throw new LoginError(
        'network_error',
        'Network error. Please check your connection and try again.',
        0
      );
    } else {
      // Other error (e.g., request setup error)
      throw new LoginError('unknown_error', error.message || 'An unexpected error occurred', 0);
    }
  }
};
```

**Test File**:

```typescript
// src/api/auth/__tests__/login.test.ts
import { loginWithEmail, LoginError } from '../login';
import { apiClient } from '../../client';

jest.mock('../../client');

describe('loginWithEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return login response on success', async () => {
    const mockResponse = {
      data: {
        access_token: 'mock_access_token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock_refresh_token',
        user: {
          id: 'f7b3c5d1-8e9a-4b2c-9d0e-1f2a3b4c5d6e',
          email: 'user@example.com',
          email_confirmed_at: '2025-11-21T10:30:00Z',
          created_at: '2025-11-20T08:15:00Z',
          updated_at: '2025-11-21T10:30:00Z',
          user_metadata: {
            full_name: 'John Doe',
          },
        },
      },
    };

    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await loginWithEmail({
      email: 'user@example.com',
      password: 'SecurePass123',
    });

    expect(result.access_token).toBe('mock_access_token');
    expect(result.user.email).toBe('user@example.com');
  });

  it('should throw LoginError on invalid credentials (401)', async () => {
    const mockError = {
      response: {
        status: 401,
        data: {
          error: 'invalid_grant',
          error_description: 'Invalid login credentials',
        },
      },
    };

    (apiClient.post as jest.Mock).mockRejectedValue(mockError);

    await expect(
      loginWithEmail({
        email: 'wrong@example.com',
        password: 'WrongPassword',
      })
    ).rejects.toThrow(LoginError);

    try {
      await loginWithEmail({ email: 'wrong@example.com', password: 'WrongPassword' });
    } catch (error) {
      expect(error).toBeInstanceOf(LoginError);
      expect((error as LoginError).code).toBe('invalid_grant');
      expect((error as LoginError).statusCode).toBe(401);
    }
  });

  it('should throw LoginError on network error', async () => {
    const mockError = {
      request: {},
      message: 'Network Error',
    };

    (apiClient.post as jest.Mock).mockRejectedValue(mockError);

    await expect(
      loginWithEmail({
        email: 'user@example.com',
        password: 'SecurePass123',
      })
    ).rejects.toThrow(LoginError);

    try {
      await loginWithEmail({ email: 'user@example.com', password: 'SecurePass123' });
    } catch (error) {
      expect(error).toBeInstanceOf(LoginError);
      expect((error as LoginError).code).toBe('network_error');
    }
  });
});
```

---

### Phase 4: Create Token Storage Utilities (20 minutes)

**File**: `src/utils/tokenStorage.ts`

**Deliverables**:

- `storeTokens` function (Keychain)
- `getAccessToken` function (Keychain)
- `getRefreshToken` function (Keychain)
- `clearTokens` function (Keychain)

**Code**:

```typescript
// src/utils/tokenStorage.ts
import * as Keychain from 'react-native-keychain';

const ACCESS_TOKEN_SERVICE = 'auth_access_token';
const REFRESH_TOKEN_SERVICE = 'auth_refresh_token';

export const storeTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    // Store access token
    await Keychain.setGenericPassword(ACCESS_TOKEN_SERVICE, accessToken, {
      service: ACCESS_TOKEN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    // Store refresh token
    await Keychain.setGenericPassword(REFRESH_TOKEN_SERVICE, refreshToken, {
      service: REFRESH_TOKEN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    console.log('[TokenStorage] Tokens stored successfully');
  } catch (error) {
    console.error('[TokenStorage] Error storing tokens:', error);
    throw new Error('Failed to store tokens securely');
  }
};

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
    console.error('[TokenStorage] Error retrieving access token:', error);
    return null;
  }
};

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
    console.error('[TokenStorage] Error retrieving refresh token:', error);
    return null;
  }
};

export const clearTokens = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service: ACCESS_TOKEN_SERVICE });
    await Keychain.resetGenericPassword({ service: REFRESH_TOKEN_SERVICE });

    console.log('[TokenStorage] Tokens cleared successfully');
  } catch (error) {
    console.error('[TokenStorage] Error clearing tokens:', error);
    throw new Error('Failed to clear tokens');
  }
};
```

---

### Phase 5: Create useLogin Hook (25 minutes)

**File**: `src/hooks/useLogin.ts`

**Deliverables**:

- `useLogin` hook with loading/error state
- Token storage integration
- Redux dispatch integration
- Navigation integration

**Code**:

```typescript
// src/hooks/useLogin.ts
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { loginWithEmail, LoginCredentials, LoginError } from '../api/auth/login';
import { storeTokens } from '../utils/tokenStorage';
import { setUser, setAuthenticated } from '../store/auth/authSlice';
import EncryptedStorage from 'react-native-encrypted-storage';

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useLogin = (): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call login API
      const response = await loginWithEmail(credentials);

      // Store tokens in Keychain
      await storeTokens(response.access_token, response.refresh_token);

      // Store user metadata in Encrypted Storage
      await EncryptedStorage.setItem(
        'user_metadata',
        JSON.stringify({
          id: response.user.id,
          email: response.user.email,
          full_name: response.user.user_metadata?.full_name,
          avatar_url: response.user.user_metadata?.avatar_url,
        })
      );

      // Update Redux state
      dispatch(
        setUser({
          id: response.user.id,
          email: response.user.email,
          fullName: response.user.user_metadata?.full_name,
          avatarUrl: response.user.user_metadata?.avatar_url,
        })
      );
      dispatch(setAuthenticated(true));

      // Navigate to Home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (err) {
      if (err instanceof LoginError) {
        // Handle specific login errors
        switch (err.code) {
          case 'invalid_grant':
            setError('Incorrect email or password. Please try again.');
            break;
          case 'rate_limit_exceeded':
            setError('Too many login attempts. Please try again later.');
            break;
          case 'network_error':
            setError('Network error. Please check your connection.');
            break;
          default:
            setError('An unexpected error occurred. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }

      console.error('[useLogin] Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    login,
    isLoading,
    error,
    clearError,
  };
};
```

---

### Phase 6: Integrate useLogin Hook into LoginScreen (10 minutes)

**File**: Update `src/screens/auth/LoginScreen.tsx`

**Deliverables**:

- Replace placeholder `onSubmit` with `useLogin` hook
- Display API error messages

**Code**:

```typescript
// src/screens/auth/LoginScreen.tsx (updated)
import { useLogin } from '../../hooks/useLogin';
import { Alert } from '@gluestack-ui/themed';

export const LoginScreen: React.FC = () => {
  const { login, isLoading, error, clearError } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };

  return (
    <SafeAreaView testID="login-screen" className="flex-1 bg-white">
      {/* ... existing code */}

      {/* API Error Message */}
      {error && (
        <Alert variant="error" className="mb-4" testID="login-error">
          <AlertText>{error}</AlertText>
          <Pressable onPress={clearError}>
            <Text>×</Text>
          </Pressable>
        </Alert>
      )}

      {/* Email Input */}
      {/* ... existing code */}

      {/* Password Input */}
      {/* ... existing code */}

      {/* Log In Button */}
      <Button
        onPress={handleSubmit(onSubmit)}
        testID="login-button"
        isDisabled={isLoading}
        size="lg"
        className="mb-4"
      >
        {isLoading && <ButtonSpinner />}
        <ButtonText>{isLoading ? 'Logging in...' : 'Log In'}</ButtonText>
      </Button>

      {/* ... existing code */}
    </SafeAreaView>
  );
};
```

---

## Acceptance Criteria

**Functional Requirements**:

- [ ] `loginWithEmail` function calls Supabase Auth API correctly
- [ ] Response validated with Zod schema
- [ ] Access token stored in Keychain (`auth_access_token` service)
- [ ] Refresh token stored in Keychain (`auth_refresh_token` service)
- [ ] User metadata stored in Encrypted Storage
- [ ] Redux state updated (`isAuthenticated: true`, user metadata)
- [ ] Navigation to Home screen on success
- [ ] Error messages displayed for all scenarios

**Error Handling**:

- [ ] 401 (invalid credentials) → "Incorrect email or password"
- [ ] 429 (rate limit) → "Too many login attempts. Please try again later."
- [ ] Network error → "Network error. Please check your connection."
- [ ] Invalid response → "Received invalid response from server"

**Security**:

- [ ] Tokens NEVER logged (masked in console)
- [ ] Tokens stored in hardware-backed Keychain
- [ ] User metadata encrypted (Encrypted Storage)
- [ ] Password NEVER stored anywhere

**Performance**:

- [ ] API call completes <2 seconds (normal network)
- [ ] Token storage <50ms
- [ ] Total login flow <3 seconds

---

## Testing

### Unit Tests

```bash
yarn test src/api/auth/__tests__/login.test.ts
yarn test src/hooks/__tests__/useLogin.test.ts
yarn test src/utils/__tests__/tokenStorage.test.ts
```

### Integration Testing

**Manual Test**:

1. Enter valid email/password → Tap "Log In"
2. Verify loading state appears
3. Verify navigation to Home screen
4. Verify tokens stored in Keychain (check Keychain logs)
5. Verify user metadata in Encrypted Storage (check logs)

**Error Scenarios**:

1. Enter wrong email/password → Verify error "Incorrect email or password"
2. Disconnect network → Tap "Log In" → Verify error "Network error"
3. Tap "Log In" 10 times rapidly → Verify rate limit error

---

## Troubleshooting

### Issue: "Invalid response format" error

**Cause**: Zod validation failing due to unexpected API response structure.

**Debug**:

```typescript
const validation = loginResponseSchema.safeParse(response.data);
if (!validation.success) {
  console.error('Validation errors:', validation.error.errors);
}
```

**Fix**: Update Zod schema to match actual API response.

---

### Issue: Tokens not persisting after app restart

**Cause**: Keychain not configured correctly.

**Fix**:

```typescript
await Keychain.setGenericPassword(ACCESS_TOKEN_SERVICE, accessToken, {
  service: ACCESS_TOKEN_SERVICE,
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY, // Important!
});
```

---

### Issue: Network timeout on slow connections

**Cause**: Default Axios timeout too short.

**Fix**:

```typescript
export const apiClient = axios.create({
  baseURL: Config.SUPABASE_URL,
  timeout: 15000, // Increase to 15 seconds
});
```

---

## Definition of Done

**Code Complete**:

- [ ] `loginWithEmail` function working
- [ ] Zod validation working
- [ ] Token storage in Keychain working
- [ ] User metadata storage working
- [ ] Redux state update working
- [ ] Navigation working
- [ ] Error handling for all scenarios

**Quality**:

- [ ] `yarn typecheck` passes
- [ ] `yarn lint` passes
- [ ] Unit tests pass (100% coverage)
- [ ] Manual testing complete

**Security**:

- [ ] Tokens NEVER logged
- [ ] Keychain using hardware-backed storage
- [ ] Password never stored

**Documentation**:

- [ ] All functions documented with JSDoc
- [ ] Error codes documented
- [ ] Usage examples in comments

---

**Dependencies**:

- TASK-213 (Login UI Form) must be complete
- `axios` installed: `yarn add axios`
- `react-native-keychain` installed: `yarn add react-native-keychain && cd ios && pod install`
- `react-native-encrypted-storage` installed: `yarn add react-native-encrypted-storage && cd ios && pod install`
- `react-native-config` installed: `yarn add react-native-config`
- Supabase project configured with Auth enabled

**Next Task**: [TASK-215](TASK-215-login-rntl-tests.md) - Login RNTL Tests

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 2 hours
**Actual Effort**: _[To be filled after completion]_
