import { z } from 'zod';

/**
 * Supabase Auth API Request/Response Schemas
 * Used for runtime validation with Zod
 */

// App metadata schema (provider info, roles, etc.)
export const SupabaseAppMetadataSchema = z.object({
  provider: z.string().optional(),
  providers: z.array(z.string()).optional(),
});

export type SupabaseAppMetadata = z.infer<typeof SupabaseAppMetadataSchema>;

// User metadata schema (custom user data)
export const SupabaseUserMetadataSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()])
);

export type SupabaseUserMetadata = z.infer<typeof SupabaseUserMetadataSchema>;

// Identity data schema (flexible to accept additional user metadata)
export const SupabaseIdentityDataSchema = z
  .object({
    email: z.string().email().optional(),
    email_verified: z.boolean().optional(),
    phone_verified: z.boolean().optional(),
    sub: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  })
  .passthrough(); // Allow additional fields

export type SupabaseIdentityData = z.infer<typeof SupabaseIdentityDataSchema>;

// Identity schema
export const SupabaseIdentitySchema = z.object({
  identity_id: z.string().optional(), // New field in recent Supabase versions
  id: z.string(),
  user_id: z.string().uuid(),
  identity_data: SupabaseIdentityDataSchema.optional(),
  provider: z.string(),
  last_sign_in_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  email: z.string().email().optional(), // Can be present on identity
});

export type SupabaseIdentity = z.infer<typeof SupabaseIdentitySchema>;

// User object schema
// Supports both REST API format (raw_*_meta_data) and SDK format (*_metadata)
export const SupabaseUserSchema = z.object({
  id: z.string().uuid(),
  aud: z.string().optional(), // Not always present in REST API responses
  role: z.string().optional(),
  email: z.string().email(),
  email_confirmed_at: z.string().nullable().optional(),
  phone: z.string().nullable(),
  confirmed_at: z.string().nullable().optional(), // Not present on signup response
  confirmation_sent_at: z.string().nullable().optional(),
  last_sign_in_at: z.string().nullable().optional(), // Not present on signup response
  // REST API returns raw_*_meta_data, SDK returns *_metadata
  app_metadata: SupabaseAppMetadataSchema.optional(),
  raw_app_meta_data: SupabaseAppMetadataSchema.optional(),
  user_metadata: SupabaseUserMetadataSchema.optional(),
  raw_user_meta_data: SupabaseUserMetadataSchema.optional(),
  identities: z.array(SupabaseIdentitySchema).optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  // Additional fields from REST API
  banned_until: z.string().nullable().optional(),
  is_anonymous: z.boolean().optional(),
  is_sso_user: z.boolean().optional(),
  invited_at: z.string().nullable().optional(),
  providers: z.array(z.string()).optional(),
});

export type SupabaseUser = z.infer<typeof SupabaseUserSchema>;

// Session object schema
export const SupabaseSessionSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  expires_at: z.number().optional(),
  refresh_token: z.string(),
  user: SupabaseUserSchema,
});

export type SupabaseSession = z.infer<typeof SupabaseSessionSchema>;

// Sign Up Request (REST API format - data at root level, not nested under options)
export const SupabaseSignUpRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  data: SupabaseUserMetadataSchema.optional(), // User metadata (first_name, last_name, etc.)
});

export type SupabaseSignUpRequest = z.infer<typeof SupabaseSignUpRequestSchema>;

// Sign Up Response Schema (for validation)
// When email confirmation is required, Supabase returns the user object directly (no session)
// When email confirmation is disabled, it returns { user, session }
// We use a union to handle both cases during validation
export const SupabaseSignUpResponseSchema = z.union([
  // Case 1: User object returned directly (email confirmation required)
  SupabaseUserSchema,
  // Case 2: Wrapped response (email confirmation disabled)
  z.object({
    user: SupabaseUserSchema.nullish(),
    session: SupabaseSessionSchema.nullish(),
  }),
]);

// Normalized response type (always { user, session } after processing in API layer)
export type SupabaseSignUpResponse = {
  user: SupabaseUser | null | undefined;
  session: SupabaseSession | null | undefined;
};

// Sign In Request
export const SupabaseSignInRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SupabaseSignInRequest = z.infer<typeof SupabaseSignInRequestSchema>;

// Sign In Response (same as Session)
export const SupabaseSignInResponseSchema = SupabaseSessionSchema;
export type SupabaseSignInResponse = z.infer<typeof SupabaseSignInResponseSchema>;

// Refresh Token Request
export const SupabaseRefreshTokenRequestSchema = z.object({
  refresh_token: z.string(),
});

export type SupabaseRefreshTokenRequest = z.infer<typeof SupabaseRefreshTokenRequestSchema>;

// Refresh Token Response
export const SupabaseRefreshTokenResponseSchema = SupabaseSessionSchema;
export type SupabaseRefreshTokenResponse = z.infer<typeof SupabaseRefreshTokenResponseSchema>;

// Error Response
export const SupabaseErrorResponseSchema = z.object({
  error: z.string(),
  error_description: z.string().optional(),
  message: z.string().optional(),
});

export type SupabaseErrorResponse = z.infer<typeof SupabaseErrorResponseSchema>;
