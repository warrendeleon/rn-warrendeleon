/**
 * Education Data Schema
 *
 * Validates education history data from GitHub API.
 */

import { z } from 'zod';

/**
 * Date format validator - accepts both YYYY and YYYY-MM formats
 */
const dateSchema = z
  .string()
  .refine(val => /^\d{4}(-\d{2})?$/.test(val), 'Must be YYYY or YYYY-MM format');

/**
 * Single education entry schema
 */
export const EducationItemSchema = z.object({
  id: z.string().uuid('Must be valid UUID'),

  institution: z.string().min(1, 'Institution is required'),

  title: z.string().min(1, 'Title is required'),

  logo: z.string().url('Logo must be a valid URL'),

  startDate: dateSchema,

  endDate: dateSchema.nullable(),

  certificateUrl: z.string().url('Certificate must be a valid URL').nullable(),
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
