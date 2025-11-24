import Config from 'react-native-config';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import {
  SupabaseErrorResponse,
  SupabaseRefreshTokenResponse,
  SupabaseRefreshTokenResponseSchema,
  SupabaseSignInRequest,
  SupabaseSignInResponse,
  SupabaseSignInResponseSchema,
  SupabaseSignUpRequest,
  SupabaseSignUpResponse,
  SupabaseSignUpResponseSchema,
  SupabaseUser,
  SupabaseUserSchema,
} from '@app/schemas';
import { EncryptedStore, EncryptedStoreKey } from '@app/utils/storage/EncryptedStore';
import { SecureStore, SecureStoreKey } from '@app/utils/storage/SecureStore';

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
   * @param request - Email and password
   * @returns Promise<SupabaseSignUpResponse> - User and session data
   * @throws Error if signup fails
   */
  async signUp(request: SupabaseSignUpRequest): Promise<SupabaseSignUpResponse> {
    try {
      const { data } = await this.axiosInstance.post('/auth/v1/signup', request);

      // Validate response with Zod
      const validatedData = SupabaseSignUpResponseSchema.parse(data);

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
   * @returns Promise<SupabaseSignInResponse> - Session data
   * @throws Error if login fails
   */
  async signIn(request: SupabaseSignInRequest): Promise<SupabaseSignInResponse> {
    try {
      const { data } = await this.axiosInstance.post('/auth/v1/token?grant_type=password', request);

      // Validate response with Zod
      const validatedData = SupabaseSignInResponseSchema.parse(data);

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

      // Validate response with Zod
      const validatedData = SupabaseRefreshTokenResponseSchema.parse(data);

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
   * @returns Promise<SupabaseUser | null> - User data or null
   */
  async getCurrentUser(): Promise<SupabaseUser | null> {
    try {
      const accessToken = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);

      if (!accessToken) {
        return null;
      }

      const { data } = await this.axiosInstance.get('/auth/v1/user', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Validate response with Zod
      const validatedData = SupabaseUserSchema.parse(data);

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
