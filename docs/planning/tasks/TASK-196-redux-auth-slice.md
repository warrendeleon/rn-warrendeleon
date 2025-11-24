# TASK-196: Redux Auth Slice

**Task ID**: TASK-196
**Title**: Redux Auth Slice (State Management for Authentication)
**User Story**: [US-033](../stories/US-033-email-password-registration.md) - Email/Password Registration
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md) - Registration & Profile Setup
**Status**: ⏳ In Progress
**Priority**: Critical
**Effort**: 3 hours
**Owner**: Warren de Leon
**Created**: 2025-11-21

---

## Context

Redux Toolkit manages authentication state across the app (logged in/out, user data, loading states). This slice integrates with SecureStore/EncryptedStore for persistence and provides a single source of truth for auth status.

**Why Redux for Auth?**:

- Centralized state (accessible from any component)
- Predictable state updates (actions, reducers)
- DevTools for debugging
- Middleware support (logging, persistence)
- Type-safe with TypeScript

**Security Considerations**:

- ❌ **NEVER store tokens in Redux** (use SecureStore only)
- ✅ Store user profile data (email, name) from EncryptedStore
- ✅ Store auth status flags (isAuthenticated, isLoading)
- ✅ Clear state on logout

**Integration Points**:

- SecureStore: Token management
- EncryptedStore: User profile data
- Supabase Auth Client: API calls
- Navigation: Redirect based on auth status

---

## Objective

Create Redux auth slice:

1. Define auth state interface
2. Create async thunks for auth actions (login, register, logout)
3. Create reducers for state management
4. Add selectors for component access
5. Integrate with SecureStore/EncryptedStore
6. Add 100% unit test coverage
7. Document usage patterns

**Deliverable**: Production-ready Redux auth slice with full TypeScript types and tests.

---

## Implementation Guide

### Auth State Interface

Create `/Users/warrendeleon/Developer/warrendeleon/src/redux/slices/authSlice.ts`:

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabaseAuthClient } from '@/api/supabase/auth.client';
import { SecureStore, SecureStoreKey } from '@/utils/storage/SecureStore';
import { EncryptedStore, EncryptedStoreKey } from '@/utils/storage/EncryptedStore';
import type { RootState } from '../store';

/**
 * Auth State Interface
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string | null;
    email: string | null;
    fullName: string | null;
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
 * Async Thunks
 */

// Register new user
export const register = createAsyncThunk(
  'auth/register',
  async (
    credentials: { email: string; password: string; fullName: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await supabaseAuthClient.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: { full_name: credentials.fullName },
        },
      });

      if (!response.user) {
        throw new Error('Registration failed');
      }

      return {
        id: response.user.id,
        email: response.user.email,
        fullName: credentials.fullName,
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
      const response = await supabaseAuthClient.signIn(credentials);

      // Retrieve user data from Encrypted Storage
      const fullName = await EncryptedStore.get(EncryptedStoreKey.USER_FULL_NAME);
      const profilePicture = await EncryptedStore.get(EncryptedStoreKey.PROFILE_PICTURE_URL);
      const authProvider = await EncryptedStore.get(EncryptedStoreKey.AUTH_PROVIDER);

      return {
        id: response.user.id,
        email: response.user.email,
        fullName: fullName || response.user.user_metadata?.full_name || null,
        profilePicture: profilePicture || null,
        authProvider: (authProvider as AuthState['user']['authProvider']) || 'email',
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
      const isAuthenticated = await supabaseAuthClient.isAuthenticated();

      if (!isAuthenticated) {
        return null;
      }

      // Retrieve user data from storage
      const userId = await SecureStore.get(SecureStoreKey.USER_ID);
      const email = await EncryptedStore.get(EncryptedStoreKey.USER_EMAIL);
      const fullName = await EncryptedStore.get(EncryptedStoreKey.USER_FULL_NAME);
      const profilePicture = await EncryptedStore.get(EncryptedStoreKey.PROFILE_PICTURE_URL);
      const authProvider = await EncryptedStore.get(EncryptedStoreKey.AUTH_PROVIDER);
      const biometricPref = await SecureStore.get(SecureStoreKey.BIOMETRIC_PREFERENCE);

      return {
        id: userId,
        email,
        fullName,
        profilePicture,
        authProvider: authProvider as AuthState['user']['authProvider'],
        biometricEnabled: biometricPref === 'enabled',
      };
    } catch (error) {
      return rejectWithValue('Session check failed');
    }
  }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await supabaseAuthClient.logout();
    return null;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
  }
});

/**
 * Auth Slice
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
        fullName?: string;
        profilePicture?: string;
      }>
    ) => {
      if (state.user) {
        if (action.payload.fullName !== undefined) {
          state.user.fullName = action.payload.fullName;
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
        state.error = action.payload as string;
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
        state.error = action.payload as string;
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
          state.biometricEnabled = action.payload.biometricEnabled;
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
        state.error = action.payload as string;
      });
  },
});

/**
 * Actions
 */
export const { clearError, updateUserProfile, setBiometricEnabled } = authSlice.actions;

/**
 * Selectors
 */
export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectBiometricEnabled = (state: RootState) => state.auth.biometricEnabled;

/**
 * Reducer
 */
export default authSlice.reducer;
```

---

### Redux Store Configuration

Update `/Users/warrendeleon/Developer/warrendeleon/src/redux/store.ts`:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';

// Persist config for auth slice (ONLY non-sensitive data)
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['biometricEnabled'], // Only persist biometric preference
  blacklist: ['user', 'error', 'isLoading'], // NEVER persist tokens or user data
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    // ... other reducers
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

### Usage in Components

```typescript
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { register, selectAuthLoading, selectAuthError } from '@/redux/slices/authSlice';

const RegistrationScreen = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const handleRegister = async (data: RegistrationFormData) => {
    const result = await dispatch(
      register({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      })
    ).unwrap();

    // Navigate to BiometricSetupScreen
    navigation.navigate('BiometricSetup');
  };

  return (
    // UI implementation
    <Button onPress={handleSubmit(handleRegister)} isLoading={isLoading}>
      <ButtonText>Register</ButtonText>
    </Button>
  );
};
```

---

## Tests

Create `/Users/warrendeleon/Developer/warrendeleon/src/redux/slices/__tests__/authSlice.test.ts`:

```typescript
import authReducer, {
  register,
  login,
  logout,
  checkSession,
  clearError,
  updateUserProfile,
  AuthState,
} from '../authSlice';
import { supabaseAuthClient } from '@/api/supabase/auth.client';

jest.mock('@/api/supabase/auth.client');
jest.mock('@/utils/storage/SecureStore');
jest.mock('@/utils/storage/EncryptedStore');

describe('authSlice', () => {
  const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
    biometricEnabled: false,
  };

  it('should return initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('register', () => {
    it('should handle successful registration', () => {
      const action = {
        type: register.fulfilled.type,
        payload: {
          id: 'user-123',
          email: 'test@example.com',
          fullName: 'Warren de Leon',
          authProvider: 'email',
        },
      };

      const state = authReducer(initialState, action);

      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe('test@example.com');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle registration failure', () => {
      const action = {
        type: register.rejected.type,
        payload: 'Email already exists',
      };

      const state = authReducer(initialState, action);

      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Email already exists');
    });
  });

  describe('logout', () => {
    it('should clear auth state on logout', () => {
      const authenticatedState: AuthState = {
        ...initialState,
        isAuthenticated: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          fullName: 'Warren',
          profilePicture: null,
          authProvider: 'email',
        },
      };

      const action = { type: logout.fulfilled.type, payload: null };
      const state = authReducer(authenticatedState, action);

      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.biometricEnabled).toBe(false);
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile data', () => {
      const authenticatedState: AuthState = {
        ...initialState,
        isAuthenticated: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          fullName: 'Warren',
          profilePicture: null,
          authProvider: 'email',
        },
      };

      const state = authReducer(
        authenticatedState,
        updateUserProfile({
          fullName: 'Warren de Leon',
          profilePicture: 'https://example.com/picture.jpg',
        })
      );

      expect(state.user?.fullName).toBe('Warren de Leon');
      expect(state.user?.profilePicture).toBe('https://example.com/picture.jpg');
    });
  });
});
```

---

## Security Checklist

- [ ] **Tokens NEVER in Redux** (verified - only in SecureStore)
- [ ] **User data from EncryptedStore** (not plain AsyncStorage)
- [ ] **Auth status cleared on logout** (all state reset)
- [ ] **Persist whitelist minimal** (only biometric preference)
- [ ] **Error messages sanitized** (no technical details exposed)

---

**Estimated Time**: 3 hours

**Last Updated**: 2025-11-21
