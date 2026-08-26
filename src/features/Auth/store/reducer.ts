import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  type AuthErrorPayload,
  checkSession,
  login,
  logout,
  refreshUser,
  register,
  updateUserProfileAsync,
} from './actions';

/**
 * Helper to extract error message from payload
 * Supports both string (legacy) and AuthErrorPayload formats
 */
const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === 'string') {
    return payload;
  }
  if (payload && typeof payload === 'object' && 'message' in payload) {
    return (payload as AuthErrorPayload).message;
  }
  return 'An error occurred';
};

/**
 * Auth State Interface
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    profilePicture: string | null;
    authProvider: 'email' | 'linkedin' | 'magic_link' | null;
  } | null;
  error: string | null;
  biometricEnabled: boolean;
}

/**
 * Initial State
 */
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true, // Start true to check existing session
  user: null,
  error: null,
  biometricEnabled: false,
};

/**
 * Auth slice for managing authentication state
 * Handles user registration, login, logout, and session management
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error
    clearError: state => {
      state.error = null;
    },

    // Update user profile (after profile edit)
    updateUserProfile: (
      state,
      action: PayloadAction<{
        firstName?: string;
        lastName?: string;
        profilePicture?: string;
      }>
    ) => {
      if (state.user) {
        if (action.payload.firstName !== undefined) {
          state.user.firstName = action.payload.firstName;
        }
        if (action.payload.lastName !== undefined) {
          state.user.lastName = action.payload.lastName;
        }
        if (action.payload.profilePicture !== undefined) {
          state.user.profilePicture = action.payload.profilePicture;
        }
      }
    },

    // Enable/disable biometrics
    setBiometricEnabled: (state, action: PayloadAction<boolean>) => {
      state.biometricEnabled = action.payload;
    },
  },
  extraReducers: builder => {
    // Register
    builder
      .addCase(register.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = {
          ...action.payload,
          profilePicture: null,
        };
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = extractErrorMessage(action.payload);
      });

    // Login
    builder
      .addCase(login.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = extractErrorMessage(action.payload);
      });

    // Check Session
    builder
      .addCase(checkSession.pending, state => {
        state.isLoading = true;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload;
          // biometricEnabled is rehydrated by redux-persist; leave it alone.
        } else {
          state.isAuthenticated = false;
          state.user = null;
        }
      })
      .addCase(checkSession.rejected, state => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      });

    // Logout
    builder
      .addCase(logout.pending, state => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, state => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        state.biometricEnabled = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        // Still clear local state even if API call failed
        state.isAuthenticated = false;
        state.user = null;
        state.biometricEnabled = false;
        state.error = extractErrorMessage(action.payload);
      });

    // Refresh User (background operation - no loading state)
    builder.addCase(refreshUser.fulfilled, (state, action) => {
      if (action.payload) {
        state.user = action.payload;
      }
    });

    // Update User Profile (async - persists to backend)
    builder
      .addCase(updateUserProfileAsync.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = extractErrorMessage(action.payload);
      });
  },
});

export const authReducer = authSlice.reducer;
export const { clearError, updateUserProfile, setBiometricEnabled } = authSlice.actions;
