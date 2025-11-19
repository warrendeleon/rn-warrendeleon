/**
 * Profile Data Schema
 *
 * Validates profile data fetched from GitHub API.
 * Ensures all required fields are present and correctly typed.
 */

import { z } from 'zod';

/**
 * Geographic coordinates schema
 */
export const CoordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

/**
 * Location schema (nested object)
 */
export const LocationSchema = z.object({
  cityTown: z.string().min(1, 'City/Town is required'),
  county: z.string().min(1, 'County is required'),
  country: z.string().min(1, 'Country is required'),
  coordinates: CoordinatesSchema,
});

/**
 * Social media links schema (nested object)
 * All fields are URLs for social media profiles
 */
export const SocialsSchema = z.object({
  facebook: z.string().url('Facebook must be a valid URL'),
  twitter: z.string().url('Twitter must be a valid URL'),
  instagram: z.string().url('Instagram must be a valid URL'),
  linkedIn: z.string().url('LinkedIn must be a valid URL'),
});

/**
 * Profile Schema
 *
 * Validates the complete profile object from API response.
 */
export const ProfileSchema = z.object({
  profilePicture: z.string().url('Profile picture must be a valid URL'),

  name: z.string().min(1, 'Name is required'),

  lastName: z.string().min(1, 'Last name is required'),

  headline: z.string().min(1, 'Headline is required'),

  namePronunciation: z.string(),

  namePronunciationAudioTrack: z.string(),

  email: z.string().email('Invalid email address'),

  phone: z.string().min(1, 'Phone number is required'),

  birthday: z.string().min(1, 'Birthday is required'),

  location: LocationSchema,

  carousel: z.array(z.string().url('Carousel image must be a valid URL')),

  socials: SocialsSchema,
});

/**
 * TypeScript types inferred from schema
 */
export type Profile = z.infer<typeof ProfileSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Socials = z.infer<typeof SocialsSchema>;
export type Coordinates = z.infer<typeof CoordinatesSchema>;
