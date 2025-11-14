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
import { educationReducer } from '@app/features/Education';
import { profileReducer } from '@app/features/Profile';
import { settingsReducer } from '@app/features/Settings/store';
import { workXPReducer } from '@app/features/WorkXP';

/**
 * Root reducer combining all slices
 * Separates persisted (settings) from non-persisted (profile, workXP, education) state
 */
const rootReducer = combineReducers({
  settings: settingsReducer,
  profile: profileReducer,
  workXP: workXPReducer,
  education: educationReducer,
  // Future: Add auth reducer here without persistence
  // auth: authReducer, // Will use EncryptedStorage separately
});

/**
 * Redux Persist configuration for settings
 * Uses AsyncStorage for non-sensitive data (theme, language, etc.)
 */
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings'], // Only persist settings
  // Future: Blacklist auth or create separate encrypted persist config
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Configure Redux store with security best practices:
 * - Disable Redux DevTools in production
 * - Add serializable check middleware (ignores redux-persist actions)
 * - Separate sensitive data (future auth) from settings
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
