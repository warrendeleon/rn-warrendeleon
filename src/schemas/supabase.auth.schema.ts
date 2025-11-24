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

// Identity data schema
export const SupabaseIdentityDataSchema = z.object({
  email: z.string().email().optional(),
  email_verified: z.boolean().optional(),
  phone_verified: z.boolean().optional(),
  sub: z.string().optional(),
});

export type SupabaseIdentityData = z.infer<typeof SupabaseIdentityDataSchema>;

// Identity schema
export const SupabaseIdentitySchema = z.object({
  id: z.string(),
  user_id: z.string().uuid(),
  identity_data: SupabaseIdentityDataSchema.optional(),
  provider: z.string(),
  last_sign_in_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type SupabaseIdentity = z.infer<typeof SupabaseIdentitySchema>;

// User object schema
export const SupabaseUserSchema = z.object({
  id: z.string().uuid(),
  aud: z.string(),
  role: z.string().optional(),
  email: z.string().email(),
  email_confirmed_at: z.string().nullable(),
  phone: z.string().nullable(),
  confirmed_at: z.string().nullable(),
  last_sign_in_at: z.string().nullable(),
  app_metadata: SupabaseAppMetadataSchema.optional(),
  user_metadata: SupabaseUserMetadataSchema.optional(),
  identities: z.array(SupabaseIdentitySchema).optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
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

// Sign Up Request
export const SupabaseSignUpRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  options: z
    .object({
      data: SupabaseUserMetadataSchema.optional(), // User metadata
      emailRedirectTo: z.string().url().optional(),
    })
    .optional(),
});

export type SupabaseSignUpRequest = z.infer<typeof SupabaseSignUpRequestSchema>;

// Sign Up Response
export const SupabaseSignUpResponseSchema = z.object({
  user: SupabaseUserSchema.nullable(),
  session: SupabaseSessionSchema.nullable(),
});

export type SupabaseSignUpResponse = z.infer<typeof SupabaseSignUpResponseSchema>;

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
