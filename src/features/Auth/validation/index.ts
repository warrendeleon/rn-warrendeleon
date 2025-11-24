/**
 * Auth Validation Schemas
 *
 * Central export for all authentication-related validation schemas
 * using Yup for declarative form validation with React Hook Form
 */

// Import custom validation rules (must be imported to register custom methods)
import './customRules';

// Registration
export type { RegistrationFormData } from './registrationSchema';
export { registrationSchema } from './registrationSchema';

// Login
export type { LoginFormData } from './loginSchema';
export { loginSchema } from './loginSchema';

// Password Recovery & Reset
export type { PasswordRecoveryFormData, PasswordResetFormData } from './passwordRecoverySchema';
export { passwordRecoverySchema, passwordResetSchema } from './passwordRecoverySchema';

// Profile Update
export type { ChangePasswordFormData, ProfileUpdateFormData } from './profileUpdateSchema';
export { changePasswordSchema, profileUpdateSchema } from './profileUpdateSchema';

// Rate Limiting
export type { RateLimitError, RateLimitStatus } from './rateLimitSchema';
export { rateLimitErrorSchema, rateLimitStatusSchema } from './rateLimitSchema';
