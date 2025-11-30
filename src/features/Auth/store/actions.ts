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
      if (credentials.phoneNumber) {
        await EncryptedStore.set(EncryptedStoreKey.USER_PHONE_NUMBER, credentials.phoneNumber);
      }

      return {
        id: response.user.id,
        email: response.user.email ?? null,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        phoneNumber: credentials.phoneNumber || null,
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
      const phoneNumber = await EncryptedStore.get(EncryptedStoreKey.USER_PHONE_NUMBER);
      const profilePicture = await EncryptedStore.get(EncryptedStoreKey.PROFILE_PICTURE_URL);
      const authProvider = await EncryptedStore.get(EncryptedStoreKey.AUTH_PROVIDER);

      // Check both user_metadata and raw_user_meta_data for REST API compatibility
      const metadata = response.user.user_metadata || response.user.raw_user_meta_data;
      const userFirstName =
        firstName || (typeof metadata?.first_name === 'string' ? metadata.first_name : null);
      const userLastName =
        lastName || (typeof metadata?.last_name === 'string' ? metadata.last_name : null);
      const userPhoneNumber =
        phoneNumber || (typeof metadata?.phone_number === 'string' ? metadata.phone_number : null);
      const provider = (authProvider as 'email' | 'linkedin' | 'magic_link' | null) || 'email';

      // Persist user data to EncryptedStore if retrieved from user_metadata (for session restore)
      if (userFirstName && !firstName) {
        await EncryptedStore.set(EncryptedStoreKey.USER_FIRST_NAME, userFirstName);
      }
      if (userLastName && !lastName) {
        await EncryptedStore.set(EncryptedStoreKey.USER_LAST_NAME, userLastName);
      }
      if (userPhoneNumber && !phoneNumber) {
        await EncryptedStore.set(EncryptedStoreKey.USER_PHONE_NUMBER, userPhoneNumber);
      }

      return {
        id: response.user.id,
        email: response.user.email,
        firstName: userFirstName,
        lastName: userLastName,
        phoneNumber: userPhoneNumber,
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
      const phoneNumber = await EncryptedStore.get(EncryptedStoreKey.USER_PHONE_NUMBER);
      const profilePicture = await EncryptedStore.get(EncryptedStoreKey.PROFILE_PICTURE_URL);
      const authProvider = await EncryptedStore.get(EncryptedStoreKey.AUTH_PROVIDER);
      const biometricPref = await SecureStore.get(SecureStoreKey.BIOMETRIC_PREFERENCE);

      const provider = (authProvider as 'email' | 'linkedin' | 'magic_link' | null) || null;

      return {
        id: userId,
        email,
        firstName,
        lastName,
        phoneNumber,
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

// Refresh user data from backend
export const refreshUser = createAsyncThunk('auth/refreshUser', async (_, { rejectWithValue }) => {
  try {
    const user = await SupabaseAuthClient.getCurrentUser();

    if (!user) {
      return null;
    }

    // Get additional data from storage
    const firstName = await EncryptedStore.get(EncryptedStoreKey.USER_FIRST_NAME);
    const lastName = await EncryptedStore.get(EncryptedStoreKey.USER_LAST_NAME);
    const phoneNumber = await EncryptedStore.get(EncryptedStoreKey.USER_PHONE_NUMBER);
    const profilePicture = await EncryptedStore.get(EncryptedStoreKey.PROFILE_PICTURE_URL);
    const authProvider = await EncryptedStore.get(EncryptedStoreKey.AUTH_PROVIDER);

    // Prefer user_metadata from backend (check both user_metadata and raw_user_meta_data for REST API compatibility)
    const metadata = user.user_metadata || user.raw_user_meta_data;
    const userFirstName =
      typeof metadata?.first_name === 'string' ? metadata.first_name : firstName;
    const userLastName = typeof metadata?.last_name === 'string' ? metadata.last_name : lastName;
    const userPhoneNumber =
      typeof metadata?.phone_number === 'string' ? metadata.phone_number : phoneNumber;
    const provider = (authProvider as 'email' | 'linkedin' | 'magic_link' | null) || 'email';

    // Update storage if backend has newer data
    if (userFirstName && userFirstName !== firstName) {
      await EncryptedStore.set(EncryptedStoreKey.USER_FIRST_NAME, userFirstName);
    }
    if (userLastName && userLastName !== lastName) {
      await EncryptedStore.set(EncryptedStoreKey.USER_LAST_NAME, userLastName);
    }
    if (userPhoneNumber && userPhoneNumber !== phoneNumber) {
      await EncryptedStore.set(EncryptedStoreKey.USER_PHONE_NUMBER, userPhoneNumber);
    }

    return {
      id: user.id,
      email: user.email,
      firstName: userFirstName,
      lastName: userLastName,
      phoneNumber: userPhoneNumber,
      profilePicture: profilePicture || null,
      authProvider: provider,
    };
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to refresh user');
  }
});

// Update user profile (first name, last name, phone number) - persists to backend
export const updateUserProfileAsync = createAsyncThunk(
  'auth/updateUserProfile',
  async (
    updates: { firstName?: string; lastName?: string; phoneNumber?: string },
    { rejectWithValue }
  ) => {
    try {
      const updatedUser = await SupabaseAuthClient.updateUser(updates);

      // Get additional data from storage
      const profilePicture = await EncryptedStore.get(EncryptedStoreKey.PROFILE_PICTURE_URL);
      const authProvider = await EncryptedStore.get(EncryptedStoreKey.AUTH_PROVIDER);
      const provider = (authProvider as 'email' | 'linkedin' | 'magic_link' | null) || 'email';

      // Use updated values from response (check both user_metadata and raw_user_meta_data), or fallback to passed values
      const metadata = updatedUser.user_metadata || updatedUser.raw_user_meta_data;
      const firstName =
        typeof metadata?.first_name === 'string' ? metadata.first_name : updates.firstName;
      const lastName =
        typeof metadata?.last_name === 'string' ? metadata.last_name : updates.lastName;
      const phoneNumber =
        typeof metadata?.phone_number === 'string' ? metadata.phone_number : updates.phoneNumber;

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        phoneNumber: phoneNumber ?? null,
        profilePicture: profilePicture || null,
        authProvider: provider,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update profile');
    }
  }
);
