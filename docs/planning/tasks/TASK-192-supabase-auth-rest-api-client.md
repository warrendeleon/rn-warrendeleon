# TASK-192: Supabase Auth REST API Client (No SDK)

**Task ID**: TASK-192
**Title**: Supabase Auth REST API Client (Custom REST API, No SDK)
**User Story**: [US-033](../stories/US-033-email-password-registration.md) - Email/Password Registration
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md) - Registration & Profile Setup
**Status**: ⏳ In Progress
**Priority**: Critical
**Effort**: 4 hours
**Owner**: Warren de Leon
**Created**: 2025-11-21

---

## Context

The user explicitly requested to build auth flow **from scratch WITHOUT using Supabase SDK** on the React Native side. Instead, we use Supabase's REST API directly via Axios.

**Why Custom REST API (not SDK)?**:

- Full control over authentication flow
- Smaller bundle size (no Supabase JS SDK for auth)
- Better integration with 3-tier storage architecture
- Learning opportunity
- Consistent with security requirements (tokens in Keychain, not SDK's storage)

**Supabase Auth REST API Endpoints**:

- `POST /auth/v1/signup` - Register new user
- `POST /auth/v1/token?grant_type=password` - Login
- `POST /auth/v1/token?grant_type=refresh_token` - Refresh access token
- `POST /auth/v1/recover` - Password recovery
- `POST /auth/v1/magiclink` - Magic link authentication
- `POST /auth/v1/logout` - Logout (invalidate refresh token)

This task builds a comprehensive, type-safe Supabase Auth client using Axios with automatic token refresh, request/response validation, and error handling.

---

## Objective

Build Supabase Auth REST API client:

1. Install Axios and configure base client
2. Create Zod schemas for request/response validation
3. Implement auth methods (signup, login, refresh, logout)
4. Add automatic token refresh with interceptors
5. Integrate with SecureStore for token storage
6. Add comprehensive error handling
7. Create 100% unit test coverage (mocked Axios)

**Deliverable**: Production-ready Supabase Auth client with full TypeScript types, validation, and tests.

---

## Acceptance Criteria

- [ ] **Axios installed** and configured with Supabase base URL
- [ ] **Zod schemas** created for all request/response types
- [ ] **SupabaseAuthClient** class with all auth methods
- [ ] **Automatic token refresh** via Axios interceptors
- [ ] **SecureStore integration** for token persistence
- [ ] **Error handling** with user-friendly messages
- [ ] **TypeScript types** for all methods
- [ ] **100% unit test coverage** (RNTL with mocked Axios)
- [ ] **No Supabase SDK** used for auth (Axios only)
- [ ] **Environment variables** used for Supabase URL and anon key

---

## Detailed Implementation Guide

### Phase 1: Install Dependencies (10 minutes)

```bash
# Axios for HTTP requests
yarn add axios

# Zod for request/response validation
yarn add zod
```

**Expected**: Dependencies installed successfully.

---

### Phase 2: Create Zod Schemas (30 minutes)

Create `/Users/warrendeleon/Developer/warrendeleon/src/api/supabase/schemas/auth.schemas.ts`:

```typescript
import { z } from 'zod';

/**
 * Supabase Auth API Request/Response Schemas
 * Used for runtime validation with Zod
 */

// User object schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  aud: z.string(),
  role: z.string().optional(),
  email: z.string().email(),
  email_confirmed_at: z.string().nullable(),
  phone: z.string().nullable(),
  confirmed_at: z.string().nullable(),
  last_sign_in_at: z.string().nullable(),
  app_metadata: z.record(z.unknown()).optional(),
  user_metadata: z.record(z.unknown()).optional(),
  identities: z.array(z.record(z.unknown())).optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Session object schema
export const SessionSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  expires_at: z.number().optional(),
  refresh_token: z.string(),
  user: UserSchema,
});

export type Session = z.infer<typeof SessionSchema>;

// Sign Up Request
export const SignUpRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  options: z
    .object({
      data: z.record(z.unknown()).optional(), // User metadata
      emailRedirectTo: z.string().url().optional(),
    })
    .optional(),
});

export type SignUpRequest = z.infer<typeof SignUpRequestSchema>;

// Sign Up Response
export const SignUpResponseSchema = z.object({
  user: UserSchema.nullable(),
  session: SessionSchema.nullable(),
});

export type SignUpResponse = z.infer<typeof SignUpResponseSchema>;

// Sign In Request
export const SignInRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignInRequest = z.infer<typeof SignInRequestSchema>;

// Sign In Response (same as Session)
export const SignInResponseSchema = SessionSchema;
export type SignInResponse = z.infer<typeof SignInResponseSchema>;

// Refresh Token Request
export const RefreshTokenRequestSchema = z.object({
  refresh_token: z.string(),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

// Refresh Token Response
export const RefreshTokenResponseSchema = SessionSchema;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

// Error Response
export const ErrorResponseSchema = z.object({
  error: z.string(),
  error_description: z.string().optional(),
  message: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
```

**Save file**.

---

### Phase 3: Create Axios Client (30 minutes)

Create `/Users/warrendeleon/Developer/warrendeleon/src/api/supabase/client.ts`:

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import Config from 'react-native-config';
import { SecureStore, SecureStoreKey } from '@/utils/storage/SecureStore';

/**
 * Supabase Axios Client
 * Configured with base URL, headers, and automatic token refresh
 */

export class SupabaseClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    // Create Axios instance
    this.axiosInstance = axios.create({
      baseURL: Config.SUPABASE_URL,
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
        apikey: Config.SUPABASE_ANON_KEY,
      },
    });

    // Request interceptor: Add access token to headers
    this.axiosInstance.interceptors.request.use(
      async config => {
        const accessToken = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor: Handle 401 and refresh token
    this.axiosInstance.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If 401 Unauthorized and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Wait for token refresh to complete
            return new Promise(resolve => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.axiosInstance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Refresh token
            const refreshToken = await SecureStore.get(SecureStoreKey.REFRESH_TOKEN);

            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const { data } = await this.axiosInstance.post(
              '/auth/v1/token?grant_type=refresh_token',
              { refresh_token: refreshToken }
            );

            const newAccessToken = data.access_token;

            // Store new tokens
            await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, newAccessToken);
            await SecureStore.set(SecureStoreKey.REFRESH_TOKEN, data.refresh_token);

            // Notify all waiting requests
            this.refreshSubscribers.forEach(callback => callback(newAccessToken));
            this.refreshSubscribers = [];

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            await SecureStore.clear();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Get Axios instance
   */
  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const supabaseClient = new SupabaseClient();
export const supabase = supabaseClient.getInstance();
```

**Save file**.

---

### Phase 4: Create Auth Client (90 minutes)

Create `/Users/warrendeleon/Developer/warrendeleon/src/api/supabase/auth.client.ts`:

```typescript
import { supabase } from './client';
import { SecureStore, SecureStoreKey } from '@/utils/storage/SecureStore';
import { EncryptedStore, EncryptedStoreKey } from '@/utils/storage/EncryptedStore';
import {
  SignUpRequest,
  SignUpResponse,
  SignUpResponseSchema,
  SignInRequest,
  SignInResponse,
  SignInResponseSchema,
  RefreshTokenResponse,
  RefreshTokenResponseSchema,
  ErrorResponse,
} from './schemas/auth.schemas';
import { AxiosError } from 'axios';

/**
 * Supabase Auth Client (REST API, No SDK)
 */

export class SupabaseAuthClient {
  /**
   * Sign up a new user with email and password
   *
   * @param request - Email and password
   * @returns Promise<SignUpResponse> - User and session data
   * @throws Error if signup fails
   */
  async signUp(request: SignUpRequest): Promise<SignUpResponse> {
    try {
      const { data } = await supabase.post('/auth/v1/signup', request);

      // Validate response with Zod
      const validatedData = SignUpResponseSchema.parse(data);

      // Store tokens if session exists
      if (validatedData.session) {
        await this.storeSession(validatedData.session);
      }

      // Store user data in encrypted storage
      if (validatedData.user) {
        await EncryptedStore.set(EncryptedStoreKey.USER_EMAIL, validatedData.user.email);
        await SecureStore.set(SecureStoreKey.USER_ID, validatedData.user.id);
      }

      return validatedData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Sign in with email and password
   *
   * @param request - Email and password
   * @returns Promise<SignInResponse> - Session data
   * @throws Error if login fails
   */
  async signIn(request: SignInRequest): Promise<SignInResponse> {
    try {
      const { data } = await supabase.post('/auth/v1/token?grant_type=password', request);

      // Validate response with Zod
      const validatedData = SignInResponseSchema.parse(data);

      // Store session
      await this.storeSession(validatedData);

      // Store user data
      await EncryptedStore.set(EncryptedStoreKey.USER_EMAIL, validatedData.user.email);
      await SecureStore.set(SecureStoreKey.USER_ID, validatedData.user.id);

      return validatedData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh access token using refresh token
   *
   * @returns Promise<RefreshTokenResponse> - New session data
   * @throws Error if refresh fails
   */
  async refreshSession(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = await SecureStore.get(SecureStoreKey.REFRESH_TOKEN);

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const { data } = await supabase.post('/auth/v1/token?grant_type=refresh_token', {
        refresh_token: refreshToken,
      });

      // Validate response with Zod
      const validatedData = RefreshTokenResponseSchema.parse(data);

      // Store new session
      await this.storeSession(validatedData);

      return validatedData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout (invalidate refresh token on server)
   *
   * @returns Promise<void>
   */
  async logout(): Promise<void> {
    try {
      const accessToken = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);

      if (accessToken) {
        await supabase.post('/auth/v1/logout', null, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
    } catch (error) {
      // Logout errors are non-critical, continue with local cleanup
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      await this.clearSession();
    }
  }

  /**
   * Get current user from stored session
   *
   * @returns Promise<User | null> - User data or null
   */
  async getCurrentUser(): Promise<any | null> {
    try {
      const accessToken = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);

      if (!accessToken) {
        return null;
      }

      const { data } = await supabase.get('/auth/v1/user', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return data;
    } catch (error) {
      console.error('Get current user failed:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated (has valid tokens)
   *
   * @returns Promise<boolean> - True if authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const accessToken = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);
    const refreshToken = await SecureStore.get(SecureStoreKey.REFRESH_TOKEN);

    return !!(accessToken && refreshToken);
  }

  /**
   * Store session tokens in SecureStore
   *
   * @param session - Session data from Supabase
   * @returns Promise<void>
   */
  private async storeSession(session: SignInResponse): Promise<void> {
    await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, session.access_token);
    await SecureStore.set(SecureStoreKey.REFRESH_TOKEN, session.refresh_token);
  }

  /**
   * Clear all session data (logout)
   *
   * @returns Promise<void>
   */
  private async clearSession(): Promise<void> {
    await SecureStore.clear();
    await EncryptedStore.clear();
  }

  /**
   * Handle API errors and convert to user-friendly messages
   *
   * @param error - Axios error
   * @returns Error with user-friendly message
   */
  private handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const errorData = error.response?.data as ErrorResponse;

      if (errorData?.error_description) {
        return new Error(errorData.error_description);
      }

      if (errorData?.message) {
        return new Error(errorData.message);
      }

      // Map common errors to user-friendly messages
      switch (error.response?.status) {
        case 400:
          return new Error('Invalid email or password');
        case 422:
          return new Error('Email already registered');
        case 429:
          return new Error('Too many attempts. Please try again later.');
        case 500:
          return new Error('Server error. Please try again later.');
        default:
          return new Error('An unexpected error occurred');
      }
    }

    return error instanceof Error ? error : new Error('Unknown error');
  }
}

export const supabaseAuthClient = new SupabaseAuthClient();
```

**Save file**.

---

## Files Created

```
src/api/supabase/
├── client.ts                        # Created - Axios client with interceptors
├── auth.client.ts                   # Created - Auth methods (signup, login, etc.)
└── schemas/
    └── auth.schemas.ts              # Created - Zod validation schemas
```

---

## Validation

### Unit Tests (100% Coverage Required)

Create `/Users/warrendeleon/Developer/warrendeleon/src/api/supabase/__tests__/auth.client.test.ts`:

```typescript
import { supabaseAuthClient } from '../auth.client';
import { supabase } from '../client';
import { SecureStore, SecureStoreKey } from '@/utils/storage/SecureStore';
import { EncryptedStore, EncryptedStoreKey } from '@/utils/storage/EncryptedStore';

// Mock modules
jest.mock('../client');
jest.mock('@/utils/storage/SecureStore');
jest.mock('@/utils/storage/EncryptedStore');

describe('SupabaseAuthClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should sign up a new user and store session', async () => {
      const mockResponse = {
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            created_at: '2025-01-01',
          },
          session: {
            access_token: 'access_token_123',
            refresh_token: 'refresh_token_123',
            token_type: 'bearer',
            expires_in: 3600,
            user: { id: 'user-123', email: 'test@example.com' },
          },
        },
      };

      (supabase.post as jest.Mock).mockResolvedValueOnce(mockResponse);
      (SecureStore.set as jest.Mock).mockResolvedValue(true);
      (EncryptedStore.set as jest.Mock).mockResolvedValue(true);

      const result = await supabaseAuthClient.signUp({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.user).toBeDefined();
      expect(result.session).toBeDefined();
      expect(SecureStore.set).toHaveBeenCalledWith(SecureStoreKey.ACCESS_TOKEN, 'access_token_123');
      expect(EncryptedStore.set).toHaveBeenCalledWith(
        EncryptedStoreKey.USER_EMAIL,
        'test@example.com'
      );
    });

    it('should handle signup errors', async () => {
      (supabase.post as jest.Mock).mockRejectedValueOnce({
        response: { status: 422, data: { error_description: 'Email already registered' } },
      });

      await expect(
        supabaseAuthClient.signUp({
          email: 'test@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('signIn', () => {
    it('should sign in and store session', async () => {
      const mockResponse = {
        data: {
          access_token: 'access_token_123',
          refresh_token: 'refresh_token_123',
          token_type: 'bearer',
          expires_in: 3600,
          user: { id: 'user-123', email: 'test@example.com' },
        },
      };

      (supabase.post as jest.Mock).mockResolvedValueOnce(mockResponse);
      (SecureStore.set as jest.Mock).mockResolvedValue(true);
      (EncryptedStore.set as jest.Mock).mockResolvedValue(true);

      const result = await supabaseAuthClient.signIn({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.access_token).toBe('access_token_123');
      expect(SecureStore.set).toHaveBeenCalledWith(SecureStoreKey.ACCESS_TOKEN, 'access_token_123');
    });
  });

  describe('logout', () => {
    it('should logout and clear session', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValueOnce('access_token_123');
      (supabase.post as jest.Mock).mockResolvedValueOnce({});
      (SecureStore.clear as jest.Mock).mockResolvedValue(true);
      (EncryptedStore.clear as jest.Mock).mockResolvedValue(true);

      await supabaseAuthClient.logout();

      expect(supabase.post).toHaveBeenCalledWith('/auth/v1/logout', null, expect.anything());
      expect(SecureStore.clear).toHaveBeenCalled();
      expect(EncryptedStore.clear).toHaveBeenCalled();
    });
  });
});
```

**Run tests**:

```bash
yarn test src/api/supabase
```

---

## Security Checklist

- [ ] **Tokens NEVER logged** (even in error messages)
- [ ] **Tokens stored in SecureStore** (not AsyncStorage, not Redux)
- [ ] **Automatic token refresh** handles 401 errors
- [ ] **Response validation** with Zod prevents malformed data
- [ ] **Error messages** user-friendly (no technical details exposed)
- [ ] **Environment variables** used for Supabase URL and anon key

---

## Dependencies

### Depends On (Blockers)

- **TASK-187**: Supabase Setup (need Supabase URL and anon key)
- **TASK-191**: 3-Tier Storage (need SecureStore and EncryptedStore)

### Blocks (Dependent Tasks)

- **TASK-199**: Registration Screen UI (uses auth client for signup)
- **US-036**: Email/Password Login (uses auth client for signin)

---

## Additional Resources

- [Supabase Auth REST API](https://supabase.com/docs/reference/auth)
- [Axios Documentation](https://axios-http.com/)
- [Zod Documentation](https://zod.dev/)

---

**Estimated Time**: 4 hours

**Actual Time**: _To be tracked_

**Last Updated**: 2025-11-21
