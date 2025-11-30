import { z } from 'zod';

/**
 * Supabase Storage API Request/Response Schemas
 * Used for runtime validation with Zod
 *
 * These schemas validate responses from Supabase Storage endpoints
 * (file uploads, downloads, URL generation, etc.)
 */

// Upload Response Schema
export const SupabaseUploadResponseSchema = z.object({
  Key: z.string(),
  path: z.string().optional(),
});

export type SupabaseUploadResponse = z.infer<typeof SupabaseUploadResponseSchema>;

// File Object Schema
export const SupabaseFileObjectSchema = z.object({
  name: z.string(),
  id: z.string().uuid().optional(),
  updated_at: z.string().optional(),
  created_at: z.string().optional(),
  last_accessed_at: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type SupabaseFileObject = z.infer<typeof SupabaseFileObjectSchema>;

// Public URL Response Schema
export const SupabasePublicURLSchema = z.object({
  publicURL: z.string().url().nullable(),
});

export type SupabasePublicURL = z.infer<typeof SupabasePublicURLSchema>;

// User Profile Schema (for profile updates, not portfolio profile)
export const SupabaseUserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().nullable().optional(),
  profilePicture: z.string().url().nullable(),
  authProvider: z.enum(['email', 'linkedin', 'magic_link']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SupabaseUserProfile = z.infer<typeof SupabaseUserProfileSchema>;

// Update Profile Request Schema
export const SupabaseUpdateProfileRequestSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  profilePicture: z.string().url().optional(),
});

export type SupabaseUpdateProfileRequest = z.infer<typeof SupabaseUpdateProfileRequestSchema>;
