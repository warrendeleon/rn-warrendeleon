import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';

import reactotron from '@app/config/reactotron';
// Reducers come from each feature's store submodule, not its public barrel.
// The barrels also export screens, and those screens import `@app/store`, which
// imports this file. Going through a barrel therefore closes a require cycle:
// when the app is the entry point, `settingsReducer` is still undefined at the
// moment combineReducers runs and Redux silently drops the slice.
// See the eslint.config.mjs override that allows these deep imports here.
import { authReducer } from '@app/features/Auth/store';
import { educationReducer } from '@app/features/Education/store';
import { profileReducer } from '@app/features/Profile/store';
import { settingsReducer } from '@app/features/Settings/store';
import { workExperienceReducer } from '@app/features/WorkExperience/store';

/**
 * Redux Persist configuration for auth slice
 * Only persists non-sensitive data (biometric preference)
 * Tokens and user data are stored in SecureStore/EncryptedStore
 */
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  // Positive list only: everything not named here (user, error, isLoading) is
  // ephemeral, so tokens and user data can never reach AsyncStorage via Redux.
  whitelist: ['biometricEnabled'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

/**
 * Root reducer combining all slices
 * Separates persisted (settings, auth) from non-persisted (profile, workXP, workExperience, education) state
 */
const rootReducer = combineReducers({
  settings: settingsReducer,
  auth: persistedAuthReducer,
  profile: profileReducer,
  workExperience: workExperienceReducer,
  education: educationReducer,
});

/**
 * Redux Persist configuration for root
 * Uses AsyncStorage for non-sensitive data (theme, language, etc.)
 * Auth is handled separately with its own persist config
 */
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings'], // Only persist settings (auth handled separately)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Configure Redux store with security best practices:
 * - Disable Redux DevTools in production
 * - Add serializable check middleware (ignores redux-persist actions)
 * - Separate sensitive data (auth uses SecureStore/EncryptedStore, only biometric pref in Redux)
 * - Connect to Reactotron in development for Redux debugging
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: __DEV__, // Only enable DevTools in development
  enhancers: getDefaultEnhancers =>
    __DEV__ && reactotron.createEnhancer
      ? getDefaultEnhancers().concat(reactotron.createEnhancer())
      : getDefaultEnhancers(),
});

export const persistor = persistStore(store);

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
