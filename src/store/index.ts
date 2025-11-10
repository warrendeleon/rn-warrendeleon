import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './configureStore';

/**
 * Typed hooks for Redux
 * Use throughout your app instead of plain `useDispatch` and `useSelector`
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// Re-export store, persistor, and types
export type { AppDispatch, RootState } from './configureStore';
export { persistor, store } from './configureStore';

// Re-export settings from Settings feature
export type { Language, SettingsState, Theme } from '@app/features/Settings';
export {
  resetSettings,
  selectLanguage,
  selectTheme,
  setLanguage,
  setTheme,
} from '@app/features/Settings';
