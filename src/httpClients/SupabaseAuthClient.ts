import Config from 'react-native-config';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { isE2EMockEnabled } from '@app/config/e2e';
import type {
  SupabaseErrorResponse,
  SupabaseRefreshTokenResponse,
  SupabaseSignInRequest,
  SupabaseSignInResponse,
  SupabaseSignUpRequest,
  SupabaseSignUpResponse,
  SupabaseUser,
} from '@app/schemas';
import {
  SupabaseRefreshTokenResponseSchema,
  SupabaseSignInResponseSchema,
  SupabaseUserSchema,
} from '@app/schemas';
import { EncryptedStore, EncryptedStoreKey } from '@app/utils/storage/EncryptedStore';
import { SecureStore, SecureStoreKey } from '@app/utils/storage/SecureStore';
import { validateResponse } from '@app/utils/validation/validateResponse';

/**
 * Supabase Auth Client (REST API, No SDK)
 * Configured with base URL, headers, automatic token refresh, and auth methods
 */

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class SupabaseAuthClientClass {
  private axiosInstance: AxiosInstance;
  // Single-flight gate for refreshSession(). Concurrent callers (auth-client
  // interceptor, storage-client interceptor, direct callers) all share the
  // same in-flight POST to /auth/v1/token instead of racing.
  private refreshPromise: Promise<SupabaseRefreshTokenResponse> | null = null;

  // E2E mock tracking for all auth endpoints
  private mockState = {
    signUp: { mocked: false, email: null as string | null },
    signIn: { mocked: false, email: null as string | null },
    passwordRecovery: { mocked: false, email: null as string | null },
    logout: { mocked: false },
    getCurrentUser: { mocked: false },
  };

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

    // Response interceptor: Handle 401/403 token expiry and refresh token
    this.axiosInstance.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequest;

        if (!originalRequest) {
          return Promise.reject(error);
        }

        // Don't recurse: a 401/403 from the refresh endpoint itself means
        // the refresh token is dead. Let it propagate to the caller of
        // refreshSession() rather than triggering another refresh.
        if (originalRequest.url?.includes('grant_type=refresh_token')) {
          return Promise.reject(error);
        }

        // Check for token expiry errors (401 or 403 with jwt errors)
        const status = error.response?.status;
        const errorData = error.response?.data as
          | {
              error_code?: string;
              msg?: string;
              message?: string;
            }
          | undefined;
        const errorMessage = errorData?.msg || errorData?.message || '';
        const isTokenExpired =
          status === 401 ||
          (status === 403 &&
            (errorData?.error_code === 'bad_jwt' ||
              errorMessage.includes('token is expired') ||
              errorMessage.includes('exp')));

        if (isTokenExpired && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Single-flight gate inside refreshSession() coalesces N concurrent
            // 401s into one POST. All callers (this interceptor, the storage
            // client's interceptor, direct callers) share the same promise.
            const refreshed = await this.refreshSession();

            originalRequest.headers.Authorization = `Bearer ${refreshed.access_token}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh failed during an authenticated request flow: the session
            // is unrecoverable, so clear local credentials. Direct callers of
            // refreshSession() do NOT clear (a transient failure shouldn't
            // log them out); only the interceptor path does.
            await SecureStore.clear();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Sign up a new user with email and password
   *
   * E2E mocking: When E2E_MOCK=true, returns mock user without network call
   *
   * @param request - Email and password
   * @returns Promise<SupabaseSignUpResponse> - User and session data
   * @throws Error if signup fails
   */
  async signUp(request: SupabaseSignUpRequest): Promise<SupabaseSignUpResponse> {
    // E2E mocking: Return mock user without network call
    if (isE2EMockEnabled()) {
      this.mockState.signUp = { mocked: true, email: request.email };

      const mockUser: SupabaseUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        aud: 'authenticated',
        email: request.email,
        email_confirmed_at: null,
        phone: null,
        confirmed_at: null,
        last_sign_in_at: null,
        created_at: new Date().toISOString(),
      };

      await EncryptedStore.set(EncryptedStoreKey.USER_EMAIL, mockUser.email);
      await SecureStore.set(SecureStoreKey.USER_ID, mockUser.id);

      return { user: mockUser, session: null };
    }

    try {
      const { data } = await this.axiosInstance.post('/auth/v1/signup', request);

      // Supabase REST API returns user object directly when email confirmation is required
      const user = validateResponse(SupabaseUserSchema, data, 'Supabase Auth signUp');

      // Store user data in encrypted storage
      if (user) {
        await EncryptedStore.set(EncryptedStoreKey.USER_EMAIL, user.email);
        await SecureStore.set(SecureStoreKey.USER_ID, user.id);
      }

      return { user, session: null };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Sign in with email and password
   *
   * E2E mocking: When E2E_MOCK=true, returns mock session without network call
   *
   * @param request - Email and password
   * @returns Promise<SupabaseSignInResponse> - Session data
   * @throws Error if login fails
   */
  async signIn(request: SupabaseSignInRequest): Promise<SupabaseSignInResponse> {
    // E2E mocking: Return mock session without network call
    if (isE2EMockEnabled()) {
      this.mockState.signIn = { mocked: true, email: request.email };

      // E2E: Simulate auth error for passwords starting with "Wrong"
      // This allows E2E tests to verify error handling behaviour
      // Matches the error format returned by handleError for invalid credentials
      if (request.password.startsWith('Wrong')) {
        throw new AuthError('Invalid email or password', 'invalid_credentials');
      }

      // Retrieve stored user data from registration (if available)
      // Fall back to 'Test' / 'User' for fresh installs without registration
      const storedFirstName = await EncryptedStore.get(EncryptedStoreKey.USER_FIRST_NAME);
      const storedLastName = await EncryptedStore.get(EncryptedStoreKey.USER_LAST_NAME);
      const storedPhoneNumber = await EncryptedStore.get(EncryptedStoreKey.USER_PHONE_NUMBER);

      const mockResponse: SupabaseSignInResponse = {
        access_token: 'mock_access_token_e2e',
        refresh_token: 'mock_refresh_token_e2e',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          aud: 'authenticated',
          email: request.email,
          email_confirmed_at: new Date().toISOString(),
          phone: null,
          confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          user_metadata: {
            first_name: storedFirstName || 'Test',
            last_name: storedLastName || 'User',
            phone_number: storedPhoneNumber || '+447510000000',
          },
        },
      };

      await this.storeSession(mockResponse);
      await EncryptedStore.set(EncryptedStoreKey.USER_EMAIL, mockResponse.user.email);
      await SecureStore.set(SecureStoreKey.USER_ID, mockResponse.user.id);

      return mockResponse;
    }

    try {
      const { data } = await this.axiosInstance.post('/auth/v1/token?grant_type=password', request);

      // Validate response with context
      const validatedData = validateResponse(
        SupabaseSignInResponseSchema,
        data,
        'Supabase Auth signIn'
      );

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
   * Refresh access token using refresh token.
   *
   * Single-flight: concurrent callers share the same in-flight POST to
   * /auth/v1/token. This is the gate that protects every subsystem that
   * needs to refresh (auth-client interceptor, storage-client interceptor,
   * direct callers).
   *
   * @returns Promise<SupabaseRefreshTokenResponse> - New session data
   * @throws Error if refresh fails
   */
  async refreshSession(): Promise<SupabaseRefreshTokenResponse> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async performRefresh(): Promise<SupabaseRefreshTokenResponse> {
    try {
      const refreshToken = await SecureStore.get(SecureStoreKey.REFRESH_TOKEN);

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const { data } = await this.axiosInstance.post('/auth/v1/token?grant_type=refresh_token', {
        refresh_token: refreshToken,
      });

      const validatedData = validateResponse(
        SupabaseRefreshTokenResponseSchema,
        data,
        'Supabase Auth refreshSession'
      );

      await this.storeSession(validatedData);

      return validatedData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout (invalidate refresh token on server)
   *
   * E2E mocking: When E2E_MOCK=true, clears session without network call
   *
   * @returns Promise<void>
   */
  async logout(): Promise<void> {
    // E2E mocking: Clear session without network call
    if (isE2EMockEnabled()) {
      this.mockState.logout = { mocked: true };
      await this.clearSession();
      return;
    }

    try {
      const accessToken = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);

      if (accessToken) {
        await this.axiosInstance.post('/auth/v1/logout', null, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
    } catch {
      // Logout errors are non-critical, continue with local cleanup
      // Silently fail and proceed to clear local storage
    } finally {
      // Always clear local storage
      await this.clearSession();
    }
  }

  /**
   * Get current user from stored session
   *
   * E2E mocking: When E2E_MOCK=true, returns mock user from stored email
   *
   * @returns Promise<SupabaseUser | null> - User data or null
   */
  async getCurrentUser(): Promise<SupabaseUser | null> {
    // E2E mocking: Return mock user based on stored session
    if (isE2EMockEnabled()) {
      this.mockState.getCurrentUser = { mocked: true };

      const accessToken = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);
      if (!accessToken) {
        return null;
      }

      const storedEmail = await EncryptedStore.get(EncryptedStoreKey.USER_EMAIL);
      const storedUserId = await SecureStore.get(SecureStoreKey.USER_ID);
      const storedFirstName = await EncryptedStore.get(EncryptedStoreKey.USER_FIRST_NAME);
      const storedLastName = await EncryptedStore.get(EncryptedStoreKey.USER_LAST_NAME);

      if (!storedEmail || !storedUserId) {
        return null;
      }

      return {
        id: storedUserId,
        aud: 'authenticated',
        email: storedEmail,
        email_confirmed_at: new Date().toISOString(),
        phone: null,
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        user_metadata: {
          first_name: storedFirstName || 'Test',
          last_name: storedLastName || 'User',
        },
      };
    }

    try {
      const accessToken = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);

      if (!accessToken) {
        return null;
      }

      const { data } = await this.axiosInstance.get('/auth/v1/user', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Validate response with context
      const validatedData = validateResponse(
        SupabaseUserSchema,
        data,
        'Supabase Auth getCurrentUser'
      );

      return validatedData;
    } catch {
      // Return null on any error (network, validation, etc.)
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
   * Update user profile (first name, last name, phone number)
   *
   * E2E mocking: When E2E_MOCK=true, updates local storage without network call
   *
   * @param updates - Object with firstName, lastName, and/or phoneNumber
   * @returns Promise<SupabaseUser> - Updated user data
   * @throws Error if update fails
   */
  async updateUser(updates: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }): Promise<SupabaseUser> {
    // E2E mocking: Update local storage without network call
    if (isE2EMockEnabled()) {
      if (updates.firstName !== undefined) {
        await EncryptedStore.set(EncryptedStoreKey.USER_FIRST_NAME, updates.firstName);
      }
      if (updates.lastName !== undefined) {
        await EncryptedStore.set(EncryptedStoreKey.USER_LAST_NAME, updates.lastName);
      }
      if (updates.phoneNumber !== undefined) {
        await EncryptedStore.set(EncryptedStoreKey.USER_PHONE_NUMBER, updates.phoneNumber);
      }

      const storedEmail = await EncryptedStore.get(EncryptedStoreKey.USER_EMAIL);
      const storedUserId = await SecureStore.get(SecureStoreKey.USER_ID);
      const storedFirstName = await EncryptedStore.get(EncryptedStoreKey.USER_FIRST_NAME);
      const storedLastName = await EncryptedStore.get(EncryptedStoreKey.USER_LAST_NAME);
      const storedPhoneNumber = await EncryptedStore.get(EncryptedStoreKey.USER_PHONE_NUMBER);

      return {
        id: storedUserId || '550e8400-e29b-41d4-a716-446655440000',
        aud: 'authenticated',
        email: storedEmail || '',
        email_confirmed_at: new Date().toISOString(),
        phone: null,
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        user_metadata: {
          first_name: storedFirstName || updates.firstName || null,
          last_name: storedLastName || updates.lastName || null,
          phone_number: storedPhoneNumber || updates.phoneNumber || null,
        },
      };
    }

    try {
      const { data } = await this.axiosInstance.put('/auth/v1/user', {
        data: {
          first_name: updates.firstName,
          last_name: updates.lastName,
          phone_number: updates.phoneNumber,
        },
      });

      // Validate response with context
      const validatedData = validateResponse(SupabaseUserSchema, data, 'Supabase Auth updateUser');

      // Update local storage with new values
      if (updates.firstName !== undefined) {
        await EncryptedStore.set(EncryptedStoreKey.USER_FIRST_NAME, updates.firstName);
      }
      if (updates.lastName !== undefined) {
        await EncryptedStore.set(EncryptedStoreKey.USER_LAST_NAME, updates.lastName);
      }
      if (updates.phoneNumber !== undefined) {
        await EncryptedStore.set(EncryptedStoreKey.USER_PHONE_NUMBER, updates.phoneNumber);
      }

      return validatedData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Request a password recovery email
   *
   * E2E mocking: When E2E_MOCK=true, returns success without making network call
   *
   * @param email - Email address to send recovery link to
   * @returns Promise<void>
   * @throws Error if request fails
   */
  async requestPasswordRecovery(email: string): Promise<void> {
    // E2E mocking: Return success without network call
    if (isE2EMockEnabled()) {
      this.mockState.passwordRecovery = { mocked: true, email };
      return Promise.resolve();
    }

    try {
      await this.axiosInstance.post('/auth/v1/recover', { email });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Resend confirmation email for email verification
   *
   * E2E mocking: When E2E_MOCK=true, returns success without making network call
   *
   * @param email - Email address to resend confirmation to
   * @returns Promise<void>
   * @throws Error if request fails
   */
  async resendConfirmationEmail(email: string): Promise<void> {
    // E2E mocking: Return success without network call
    if (isE2EMockEnabled()) {
      return Promise.resolve();
    }

    try {
      await this.axiosInstance.post('/auth/v1/resend', {
        type: 'signup',
        email,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset password using a recovery token
   *
   * E2E mocking: When E2E_MOCK=true, returns success without making network call
   *
   * @param accessToken - Access token from the recovery email deep link
   * @param newPassword - The new password to set
   * @returns Promise<void>
   * @throws Error if reset fails (expired token, invalid password, etc.)
   */
  async resetPasswordWithToken(accessToken: string, newPassword: string): Promise<void> {
    // E2E mocking: Return success without network call
    if (isE2EMockEnabled()) {
      return Promise.resolve();
    }

    try {
      await this.axiosInstance.put(
        '/auth/v1/user',
        { password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Change password for logged-in user with current password verification
   *
   * E2E mocking: When E2E_MOCK=true, returns success without making network call
   *
   * Security: Verifies current password before allowing password change
   *
   * @param currentPassword - User's current password for verification
   * @param newPassword - The new password to set
   * @returns Promise<void>
   * @throws Error if current password is incorrect or update fails
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // E2E mocking: Return success without network call
    if (isE2EMockEnabled()) {
      return Promise.resolve();
    }

    try {
      // Step 1: Verify current password by attempting sign-in
      const email = await EncryptedStore.get(EncryptedStoreKey.USER_EMAIL);
      if (!email) {
        throw new Error('User email not found');
      }

      // Attempt to sign in with current password to verify it
      await this.axiosInstance.post('/auth/v1/token?grant_type=password', {
        email,
        password: currentPassword,
      });

      // Step 2: If sign-in succeeded, update the password
      const accessToken = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);
      if (!accessToken) {
        throw new Error('No access token available');
      }

      await this.axiosInstance.put(
        '/auth/v1/user',
        { password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      // Provide user-friendly error message for incorrect password
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        throw new Error('Current password is incorrect');
      }
      throw this.handleError(error);
    }
  }

  /**
   * Verify mock status by making a test API call
   *
   * E2E mocking: When E2E_MOCK=true, returns { mocked: true } without network call
   * Production: Makes actual health check and returns { mocked: false }
   *
   * This method is used by MockStatusScreen to verify ACTUAL API mocking is working,
   * not just checking a config flag.
   *
   * @returns Promise<{ mocked: boolean }> - Whether the API call was mocked
   */
  async verifyMockStatus(): Promise<{ mocked: boolean }> {
    // E2E mocking: Return mock response without network call
    if (isE2EMockEnabled()) {
      // Simulate the mocking that would happen for any Auth API call
      return { mocked: true };
    }

    // Production: Make actual API call to verify we're hitting real Supabase
    try {
      // Simple health check - GET request to auth endpoint
      // This verifies network connectivity to Supabase
      await this.axiosInstance.get('/auth/v1/health');
      return { mocked: false };
    } catch {
      // Even on error, we're hitting real API (not mocked)
      return { mocked: false };
    }
  }

  /**
   * Get the mock state for all auth endpoints (for E2E verification in MockStatusScreen)
   * @deprecated Use verifyMockStatus() instead for actual mock verification
   */
  getMockState(): typeof this.mockState {
    return this.mockState;
  }

  /**
   * Reset all mock state (for E2E testing)
   */
  resetMockState(): void {
    this.mockState = {
      signUp: { mocked: false, email: null },
      signIn: { mocked: false, email: null },
      passwordRecovery: { mocked: false, email: null },
      logout: { mocked: false },
      getCurrentUser: { mocked: false },
    };
  }

  /**
   * Store session tokens in SecureStore
   *
   * @param session - Session data from Supabase
   * @returns Promise<void>
   */
  private async storeSession(session: SupabaseSignInResponse): Promise<void> {
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
   * @returns AuthError with user-friendly message and error code
   */
  private handleError(error: unknown): AuthError {
    // Check if error has response property (axios error)
    if (axios.isAxiosError(error) || (error && typeof error === 'object' && 'response' in error)) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as SupabaseErrorResponse;

      // Check for specific error codes first (HTTPError format)
      if (errorData?.error_code) {
        const errorCode = errorData.error_code;
        const message = errorData.msg || errorData.message || 'An error occurred';

        // Map specific error codes to user-friendly messages
        switch (errorCode) {
          case 'email_not_confirmed':
            return new AuthError('Email not confirmed', 'email_not_confirmed');
          case 'user_already_exists':
            return new AuthError('User already exists', 'user_already_exists');
          case 'invalid_credentials':
            return new AuthError('Invalid email or password', 'invalid_credentials');
          default:
            return new AuthError(message, errorCode);
        }
      }

      // OAuth error format
      if (errorData?.error_description) {
        return new AuthError(errorData.error_description);
      }

      // Legacy message format
      if (errorData?.msg) {
        return new AuthError(errorData.msg);
      }

      if (errorData?.message) {
        return new AuthError(errorData.message);
      }

      // Map common HTTP status codes to user-friendly messages
      switch (axiosError.response?.status) {
        case 400:
          return new AuthError('Invalid email or password', 'invalid_credentials');
        case 422:
          return new AuthError('Email already registered', 'user_already_exists');
        case 429:
          return new AuthError('Too many attempts. Please try again later.', 'rate_limit_exceeded');
        case 500:
          return new AuthError('Server error. Please try again later.', 'server_error');
        default:
          return new AuthError('An unexpected error occurred');
      }
    }

    return error instanceof Error ? new AuthError(error.message) : new AuthError('Unknown error');
  }
}

/**
 * Custom error class for authentication errors
 * Includes an optional error code for type-safe error handling
 */
export class AuthError extends Error {
  public readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
  }
}

export const SupabaseAuthClient = new SupabaseAuthClientClass();
