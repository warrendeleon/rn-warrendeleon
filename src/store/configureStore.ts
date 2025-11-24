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
import { authReducer } from '@app/features/Auth';
import { educationReducer } from '@app/features/Education';
import { profileReducer } from '@app/features/Profile';
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
  whitelist: ['biometricEnabled'], // Only persist biometric preference
  blacklist: ['user', 'error', 'isLoading'], // NEVER persist tokens or user data
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
