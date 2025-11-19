/**
 * Education Data Schema
 *
 * Validates education history data from GitHub API.
 */

import { z } from 'zod';

/**
 * Single education entry schema
 * Note: Education entries don't have an id field in the data
 */
export const EducationItemSchema = z.object({
  location: z.string().min(1, 'Institution/Location is required'),

  title: z.string().min(1, 'Title is required'),

  logo: z.string().url('Logo must be a valid URL'),

  start: z.string().min(1, 'Start date is required'),

  end: z.string().optional(),

  certificate: z.string().url('Certificate must be a valid URL').optional(),
});

/**
 * Array of education items
 */
export const EducationSchema = z.array(EducationItemSchema);

/**
 * TypeScript types
 */
export type Education = z.infer<typeof EducationItemSchema>;
export type EducationList = z.infer<typeof EducationSchema>;
