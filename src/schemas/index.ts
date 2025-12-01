/**
 * Zod Schema Exports
 *
 * This file exports all Zod schemas used for runtime validation.
 * Schemas validate data from APIs, environment variables, and other sources.
 *
 * Usage:
 * import { ProfileSchema, EnvSchema } from '@app/schemas';
 *
 * const profile = ProfileSchema.parse(apiResponse);
 */

// Environment configuration schema
export { APP_ENV_VALUES, type AppEnv, type EnvConfig, EnvSchema } from './env.schema';

// Profile schema
export {
  type Coordinates,
  CoordinatesSchema,
  type Location,
  LocationSchema,
  type Profile,
  ProfileSchema,
  type Socials,
  SocialsSchema,
} from './profile.schema';

// Education schema
export {
  type Education,
  EducationItemSchema,
  type EducationList,
  EducationSchema,
} from './education.schema';

// Work Experience schema
export {
  type ClientReference,
  ClientReferenceSchema,
  type Position,
  PositionSchema,
  type Technologies,
  TechnologiesSchema,
  type TestingConfig,
  TestingConfigSchema,
  type WorkExperience,
  WorkExperienceItemSchema,
  type WorkExperienceList,
  WorkExperienceSchema,
} from './workExperience.schema';

// Supabase Auth schema
export {
  AUTH_ERROR_CODES,
  type AuthErrorCode,
  type SupabaseAppMetadata,
  SupabaseAppMetadataSchema,
  type SupabaseErrorResponse,
  SupabaseErrorResponseSchema,
  type SupabaseIdentity,
  type SupabaseIdentityData,
  SupabaseIdentityDataSchema,
  SupabaseIdentitySchema,
  type SupabaseRefreshTokenRequest,
  SupabaseRefreshTokenRequestSchema,
  type SupabaseRefreshTokenResponse,
  SupabaseRefreshTokenResponseSchema,
  type SupabaseSession,
  SupabaseSessionSchema,
  type SupabaseSignInRequest,
  SupabaseSignInRequestSchema,
  type SupabaseSignInResponse,
  SupabaseSignInResponseSchema,
  type SupabaseSignUpRequest,
  SupabaseSignUpRequestSchema,
  type SupabaseSignUpResponse,
  SupabaseSignUpResponseSchema,
  type SupabaseUser,
  type SupabaseUserMetadata,
  SupabaseUserMetadataSchema,
  SupabaseUserSchema,
} from './supabase.auth.schema';

// Supabase Storage schema
export {
  type SupabaseFileObject,
  SupabaseFileObjectSchema,
  type SupabasePublicURL,
  SupabasePublicURLSchema,
  type SupabaseUpdateProfileRequest,
  SupabaseUpdateProfileRequestSchema,
  type SupabaseUploadResponse,
  SupabaseUploadResponseSchema,
  type SupabaseUserProfile,
  SupabaseUserProfileSchema,
} from './supabase.storage.schema';
