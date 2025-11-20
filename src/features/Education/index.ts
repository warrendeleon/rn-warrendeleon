// Export store first to avoid circular dependency issues
export type { EducationState } from './store';
export {
  clearEducation,
  educationReducer,
  fetchEducation,
  selectEducation,
  selectEducationByInstitution,
  selectEducationError,
  selectEducationLoading,
  selectEducationWithCertificates,
} from './store';

// Export screen component last
export { EducationScreen } from './EducationScreen';
