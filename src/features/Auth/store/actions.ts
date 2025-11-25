import { createAsyncThunk } from '@reduxjs/toolkit';

import { EncryptedStore, EncryptedStoreKey } from '@app/utils/storage/EncryptedStore';
import { SecureStore, SecureStoreKey } from '@app/utils/storage/SecureStore';

import { SupabaseAuthClient } from '../api/api';

/**
 * Async thunks for authentication actions
 */

// Register new user
export const register = createAsyncThunk(
  'auth/register',
  async (
    credentials: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await SupabaseAuthClient.signUp({
        email: credentials.email,
        password: credentials.password,
        data: {
          first_name: credentials.firstName,
          last_name: credentials.lastName,
          ...(credentials.phoneNumber && { phone_number: credentials.phoneNumber }),
        },
      });

      if (!response.user) {
        throw new Error('Registration failed');
      }

      // Store user data in encrypted storage for session restoration
      await EncryptedStore.set(EncryptedStoreKey.USER_FIRST_NAME, credentials.firstName);
      await EncryptedStore.set(EncryptedStoreKey.USER_LAST_NAME, credentials.lastName);
      await EncryptedStore.set(EncryptedStoreKey.AUTH_PROVIDER, 'email');

      return {
        id: response.user.id,
        email: response.user.email ?? null,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        authProvider: 'email' as const,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed');
    }
  }
);

// Login with email/password
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await SupabaseAuthClient.signIn(credentials);

      // Retrieve user data from Encrypted Storage
      const firstName = await EncryptedStore.get(EncryptedStoreKey.USER_FIRST_NAME);
      const lastName = await EncryptedStore.get(EncryptedStoreKey.USER_LAST_NAME);
      const profilePicture = await EncryptedStore.get(EncryptedStoreKey.PROFILE_PICTURE_URL);
      const authProvider = await EncryptedStore.get(EncryptedStoreKey.AUTH_PROVIDER);

      const userFirstName =
        firstName ||
        (typeof response.user.user_metadata?.first_name === 'string'
          ? response.user.user_metadata.first_name
          : null);
      const userLastName =
        lastName ||
        (typeof response.user.user_metadata?.last_name === 'string'
          ? response.user.user_metadata.last_name
          : null);
      const provider = (authProvider as 'email' | 'linkedin' | 'magic_link' | null) || 'email';

      return {
        id: response.user.id,
        email: response.user.email,
        firstName: userFirstName,
        lastName: userLastName,
        profilePicture: profilePicture || null,
        authProvider: provider,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

// Check existing session on app start
export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const isAuthenticated = await SupabaseAuthClient.isAuthenticated();

      if (!isAuthenticated) {
        return null;
      }

      // Retrieve user data from storage
      const userId = await SecureStore.get(SecureStoreKey.USER_ID);
      const email = await EncryptedStore.get(EncryptedStoreKey.USER_EMAIL);
      const firstName = await EncryptedStore.get(EncryptedStoreKey.USER_FIRST_NAME);
      const lastName = await EncryptedStore.get(EncryptedStoreKey.USER_LAST_NAME);
      const profilePicture = await EncryptedStore.get(EncryptedStoreKey.PROFILE_PICTURE_URL);
      const authProvider = await EncryptedStore.get(EncryptedStoreKey.AUTH_PROVIDER);
      const biometricPref = await SecureStore.get(SecureStoreKey.BIOMETRIC_PREFERENCE);

      const provider = (authProvider as 'email' | 'linkedin' | 'magic_link' | null) || null;

      return {
        id: userId,
        email,
        firstName,
        lastName,
        profilePicture,
        authProvider: provider,
        biometricEnabled: biometricPref === 'enabled',
      };
    } catch {
      return rejectWithValue('Session check failed');
    }
  }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await SupabaseAuthClient.logout();
    return null;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
  }
});
