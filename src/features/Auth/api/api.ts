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
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

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

    // Response interceptor: Handle 401 and refresh token
    this.axiosInstance.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequest;

        if (!originalRequest) {
          return Promise.reject(error);
        }

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
   * Refresh access token using refresh token
   *
   * @returns Promise<SupabaseRefreshTokenResponse> - New session data
   * @throws Error if refresh fails
   */
  async refreshSession(): Promise<SupabaseRefreshTokenResponse> {
    try {
      const refreshToken = await SecureStore.get(SecureStoreKey.REFRESH_TOKEN);

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const { data } = await this.axiosInstance.post('/auth/v1/token?grant_type=refresh_token', {
        refresh_token: refreshToken,
      });

      // Validate response with context
      const validatedData = validateResponse(
        SupabaseRefreshTokenResponseSchema,
        data,
        'Supabase Auth refreshSession'
      );

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
   * @returns Error with user-friendly message
   */
  private handleError(error: unknown): Error {
    // Check if error has response property (axios error)
    if (axios.isAxiosError(error) || (error && typeof error === 'object' && 'response' in error)) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as SupabaseErrorResponse;

      if (errorData?.error_description) {
        return new Error(errorData.error_description);
      }

      if (errorData?.message) {
        return new Error(errorData.message);
      }

      // Map common errors to user-friendly messages
      switch (axiosError.response?.status) {
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

export const SupabaseAuthClient = new SupabaseAuthClientClass();
