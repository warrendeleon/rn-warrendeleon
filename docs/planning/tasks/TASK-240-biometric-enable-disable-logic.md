# TASK-240: Biometric Enable/Disable Logic with Redux Integration

**ID**: TASK-240 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-041](../stories/US-041-toggle-biometric-auth.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Integrate biometric enable/disable logic with Redux store for state management. Create Redux slice for biometric settings, implement thunks for enable/disable operations, persist biometric state, and integrate with login flow.

---

## Acceptance Criteria

- [ ] Redux slice created for biometric settings
- [ ] `enableBiometricThunk` action implemented
- [ ] `disableBiometricThunk` action implemented
- [ ] State persisted to AsyncStorage
- [ ] Integration with login flow (check biometric before PIN)
- [ ] Loading and error states managed
- [ ] TypeScript types defined
- [ ] 100% unit test coverage for slice and thunks

---

## Implementation Details

### Redux Slice

```typescript
// src/store/slices/biometricSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  checkBiometric Capability,
  enableBiometric,
  disableBiometric,
  authenticateWithBiometric,
} from '../../services/biometric/biometricService';
import { BiometricType, BiometricCapability } from '../../types/biometric';

/**
 * Biometric state interface
 */
export interface BiometricState {
  isEnabled: boolean;
  isAvailable: boolean;
  biometricType: BiometricType;
  isLoading: boolean;
  error: string | null;
  lastCheckTime: number | null;
}

/**
 * Initial state
 */
const initialState: BiometricState = {
  isEnabled: false,
  isAvailable: false,
  biometricType: null,
  isLoading: false,
  error: null,
  lastCheckTime: null,
};

/**
 * Async thunk to check biometric capability
 */
export const checkBiometricCapabilityThunk = createAsyncThunk(
  'biometric/checkCapability',
  async (_, { rejectWithValue }) => {
    try {
      const capability = await checkBiometricCapability();
      return capability;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check biometric capability');
    }
  }
);

/**
 * Async thunk to enable biometric authentication
 */
export const enableBiometricThunk = createAsyncThunk(
  'biometric/enable',
  async (_, { rejectWithValue }) => {
    try {
      await enableBiometric();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to enable biometric authentication');
    }
  }
);

/**
 * Async thunk to disable biometric authentication
 */
export const disableBiometricThunk = createAsyncThunk(
  'biometric/disable',
  async (_, { rejectWithValue }) => {
    try {
      await disableBiometric();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to disable biometric authentication');
    }
  }
);

/**
 * Async thunk to authenticate with biometric
 */
export const authenticateWithBiometricThunk = createAsyncThunk(
  'biometric/authenticate',
  async (_, { rejectWithValue }) => {
    try {
      const success = await authenticateWithBiometric();
      if (!success) {
        return rejectWithValue('Biometric authentication failed');
      }
      return success;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Biometric authentication failed');
    }
  }
);

/**
 * Biometric slice
 */
const biometricSlice = createSlice({
  name: 'biometric',
  initialState,
  reducers: {
    /**
     * Reset biometric state
     */
    resetBiometricState: (state) => {
      state.isEnabled = false;
      state.isAvailable = false;
      state.biometricType = null;
      state.isLoading = false;
      state.error = null;
      state.lastCheckTime = null;
    },

    /**
     * Clear biometric error
     */
    clearBiometricError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Check capability
    builder
      .addCase(checkBiometricCapabilityThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkBiometricCapabilityThunk.fulfilled, (state, action: PayloadAction<BiometricCapability>) => {
        state.isLoading = false;
        state.isAvailable = action.payload.available;
        state.biometricType = action.payload.biometricType;
        state.isEnabled = action.payload.isCurrentlyEnabled;
        state.lastCheckTime = Date.now();
        state.error = action.payload.error || null;
      })
      .addCase(checkBiometricCapabilityThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Enable biometric
    builder
      .addCase(enableBiometricThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(enableBiometricThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isEnabled = true;
        state.error = null;
      })
      .addCase(enableBiometricThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isEnabled = false;
        state.error = action.payload as string;
      });

    // Disable biometric
    builder
      .addCase(disableBiometricThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(disableBiometricThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isEnabled = false;
        state.error = null;
      })
      .addCase(disableBiometricThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Authenticate
    builder
      .addCase(authenticateWithBiometricThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authenticateWithBiometricThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(authenticateWithBiometricThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetBiometricState, clearBiometricError } = biometricSlice.actions;

export default biometricSlice.reducer;

/**
 * Selectors
 */
export const selectBiometric = (state: { biometric: BiometricState }) => state.biometric;
export const selectIsBiometricEnabled = (state: { biometric: BiometricState }) => state.biometric.isEnabled;
export const selectIsBiometricAvailable = (state: { biometric: BiometricState }) => state.biometric.isAvailable;
export const selectBiometricType = (state: { biometric: BiometricState }) => state.biometric.biometricType;
export const selectBiometricLoading = (state: { biometric: BiometricState }) => state.biometric.isLoading;
export const selectBiometricError = (state: { biometric: BiometricState }) => state.biometric.error;
```

### Store Configuration

```typescript
// src/store/index.ts (update)

import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

import authReducer from './slices/authSlice';
import biometricReducer from './slices/biometricSlice'; // NEW

const rootReducer = combineReducers({
  auth: authReducer,
  biometric: biometricReducer, // NEW
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'biometric'], // Persist biometric state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Integration with Login Flow

```typescript
// src/screens/auth/LoginScreen.tsx (updated)

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  checkBiometricCapabilityThunk,
  authenticateWithBiometricThunk,
  selectIsBiometricEnabled,
  selectIsBiometricAvailable,
} from '../../store/slices/biometricSlice';
import { loginWithPINThunk } from '../../store/slices/authSlice';

export const LoginScreen: React.FC = () => {
  const dispatch = useDispatch();
  const isBiometricEnabled = useSelector(selectIsBiometricEnabled);
  const isBiometricAvailable = useSelector(selectIsBiometricAvailable);

  useEffect(() => {
    // Check biometric capability on mount
    dispatch(checkBiometricCapabilityThunk());
  }, [dispatch]);

  useEffect(() => {
    // Auto-prompt biometric if enabled
    if (isBiometricEnabled && isBiometricAvailable) {
      promptBiometricAuth();
    }
  }, [isBiometricEnabled, isBiometricAvailable]);

  const promptBiometricAuth = async () => {
    try {
      const resultAction = await dispatch(authenticateWithBiometricThunk());

      if (authenticateWithBiometricThunk.fulfilled.match(resultAction)) {
        // Biometric authentication succeeded, navigate to app
        navigation.navigate('MainApp');
      } else {
        // Biometric authentication failed, show PIN input
        console.log('Biometric failed, falling back to PIN');
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
    }
  };

  const handlePINSubmit = async (pin: string) => {
    const resultAction = await dispatch(loginWithPINThunk(pin));

    if (loginWithPINThunk.fulfilled.match(resultAction)) {
      navigation.navigate('MainApp');
    }
  };

  return (
    // ... LoginScreen UI with PIN input
  );
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/store/slices/__tests__/biometricSlice.test.ts

import biometricReducer, {
  checkBiometricCapabilityThunk,
  enableBiometricThunk,
  disableBiometricThunk,
  authenticateWithBiometricThunk,
  resetBiometricState,
  clearBiometricError,
} from '../biometricSlice';
import * as biometricService from '../../../services/biometric/biometricService';

jest.mock('../../../services/biometric/biometricService');

const mockBiometricService = biometricService as jest.Mocked<typeof biometricService>;

describe('biometricSlice', () => {
  const initialState = {
    isEnabled: false,
    isAvailable: false,
    biometricType: null,
    isLoading: false,
    error: null,
    lastCheckTime: null,
  };

  describe('reducers', () => {
    it('should handle resetBiometricState', () => {
      const modifiedState = {
        ...initialState,
        isEnabled: true,
        isAvailable: true,
        biometricType: 'FaceID' as const,
        error: 'Some error',
      };

      const state = biometricReducer(modifiedState, resetBiometricState());

      expect(state).toEqual(initialState);
    });

    it('should handle clearBiometricError', () => {
      const modifiedState = {
        ...initialState,
        error: 'Some error',
      };

      const state = biometricReducer(modifiedState, clearBiometricError());

      expect(state.error).toBeNull();
    });
  });

  describe('checkBiometricCapabilityThunk', () => {
    it('should handle successful capability check', async () => {
      const capability = {
        available: true,
        biometricType: 'FaceID' as const,
        isCurrentlyEnabled: true,
      };

      mockBiometricService.checkBiometricCapability.mockResolvedValue(capability);

      const action = await checkBiometricCapabilityThunk()(jest.fn(), jest.fn(), undefined);

      expect(action.type).toBe(checkBiometricCapabilityThunk.fulfilled.type);
      expect(action.payload).toEqual(capability);
    });

    it('should set loading state while checking', () => {
      const state = biometricReducer(
        initialState,
        checkBiometricCapabilityThunk.pending('', undefined)
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should update state on successful check', () => {
      const capability = {
        available: true,
        biometricType: 'FaceID' as const,
        isCurrentlyEnabled: true,
      };

      const state = biometricReducer(
        initialState,
        checkBiometricCapabilityThunk.fulfilled(capability, '', undefined)
      );

      expect(state.isLoading).toBe(false);
      expect(state.isAvailable).toBe(true);
      expect(state.biometricType).toBe('FaceID');
      expect(state.isEnabled).toBe(true);
      expect(state.lastCheckTime).toBeTruthy();
    });
  });

  describe('enableBiometricThunk', () => {
    it('should handle successful enable', async () => {
      mockBiometricService.enableBiometric.mockResolvedValue();

      const action = await enableBiometricThunk()(jest.fn(), jest.fn(), undefined);

      expect(action.type).toBe(enableBiometricThunk.fulfilled.type);
    });

    it('should set isEnabled to true on success', () => {
      const state = biometricReducer(
        initialState,
        enableBiometricThunk.fulfilled(true, '', undefined)
      );

      expect(state.isLoading).toBe(false);
      expect(state.isEnabled).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle enable failure', () => {
      const error = 'Failed to enable biometric';

      const state = biometricReducer(
        initialState,
        enableBiometricThunk.rejected(null, '', undefined, error)
      );

      expect(state.isLoading).toBe(false);
      expect(state.isEnabled).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('disableBiometricThunk', () => {
    it('should handle successful disable', async () => {
      mockBiometricService.disableBiometric.mockResolvedValue();

      const action = await disableBiometricThunk()(jest.fn(), jest.fn(), undefined);

      expect(action.type).toBe(disableBiometricThunk.fulfilled.type);
    });

    it('should set isEnabled to false on success', () => {
      const state = biometricReducer(
        { ...initialState, isEnabled: true },
        disableBiometricThunk.fulfilled(true, '', undefined)
      );

      expect(state.isLoading).toBe(false);
      expect(state.isEnabled).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('authenticateWithBiometricThunk', () => {
    it('should handle successful authentication', async () => {
      mockBiometricService.authenticateWithBiometric.mockResolvedValue(true);

      const action = await authenticateWithBiometricThunk()(jest.fn(), jest.fn(), undefined);

      expect(action.type).toBe(authenticateWithBiometricThunk.fulfilled.type);
    });

    it('should handle authentication failure', async () => {
      mockBiometricService.authenticateWithBiometric.mockResolvedValue(false);

      const action = await authenticateWithBiometricThunk()(jest.fn(), jest.fn(), undefined);

      expect(action.type).toBe(authenticateWithBiometricThunk.rejected.type);
    });
  });
});
```

---

## Dependencies

- Redux Toolkit
- Redux Persist
- Biometric service (TASK-239)

---

## Definition of Done

- [ ] Redux slice implemented with all thunks
- [ ] State persistence configured
- [ ] Integration with login flow complete
- [ ] All selectors exported
- [ ] TypeScript types defined
- [ ] 100% unit test coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-041](../stories/US-041-toggle-biometric-auth.md), [TASK-238](TASK-238-biometric-toggle-ui.md), [TASK-239](TASK-239-biometric-capability-check.md)
