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

// Re-export profile from Profile feature
export type { ProfileState } from '@app/features/Profile';
export {
  clearProfile,
  fetchProfile,
  selectProfile,
  selectProfileError,
  selectProfileLoading,
  selectProfileLocation,
  selectProfileName,
  selectProfileSocials,
} from '@app/features/Profile';

// Re-export work experience from WorkExperience feature
export type { WorkExperienceState } from '@app/features/WorkExperience';
export {
  clearWorkExperience,
  fetchWorkExperience,
  selectWorkExperience,
  selectWorkExperienceByCompany,
  selectWorkExperienceError,
  selectWorkExperienceLoading,
  selectWorkExperienceWithClients,
} from '@app/features/WorkExperience';

// Re-export education from Education feature
export type { EducationState } from '@app/features/Education';
export {
  clearEducation,
  fetchEducation,
  selectEducation,
  selectEducationByLocation,
  selectEducationError,
  selectEducationLoading,
  selectEducationWithCertificates,
} from '@app/features/Education';
