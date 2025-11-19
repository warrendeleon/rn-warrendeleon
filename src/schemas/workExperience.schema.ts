/**
 * Work Experience Data Schema
 *
 * Validates work experience history from GitHub API.
 * Includes nested Position and Client objects.
 */

import { z } from 'zod';

/**
 * Position schema (for multiple roles at same company)
 * Developer roles have tech fields, manager roles have responsibilities
 */
export const PositionSchema = z.object({
  id: z.string().min(1, 'Position ID is required'),
  title: z.string().min(1, 'Position title is required'),
  start: z.string().min(1, 'Start date is required'),
  end: z.string().min(1, 'End date is required'),
  description: z.string().min(1, 'Description is required'),
  // Technical fields (for developer roles)
  programmingLanguages: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
  unitTest: z.array(z.string()).optional(),
  e2e: z.array(z.string()).optional(),
  devTools: z.array(z.string()).optional(),
  agileMethodology: z.array(z.string()).optional(),
  // Management fields (for manager roles)
  responsibilities: z.array(z.string()).optional(),
});

/**
 * Client schema (for contract work)
 */
export const ClientSchema = z.object({
  id: z.string().min(1, 'Client ID is required'),
  company: z.string().min(1, 'Company name is required'),
  logo: z.string().url('Logo must be a valid URL'),
  start: z.string().min(1, 'Start date is required'),
  end: z.string().min(1, 'End date is required'),
  type: z.string().min(1, 'Type is required'),
  position: z.string().min(1, 'Position is required'),
  programmingLanguages: z.array(z.string()),
  techStack: z.array(z.string()),
  unitTest: z.array(z.string()).optional(),
  e2e: z.array(z.string()).optional(),
  devTools: z.array(z.string()),
  agileMethodology: z.array(z.string()),
  description: z.string().min(1, 'Description is required'),
});

/**
 * Single work experience entry (company with positions)
 */
export const WorkExperienceItemSchema = z.object({
  id: z.string().min(1, 'Work experience ID is required'),
  company: z.string().min(1, 'Company name is required'),
  logo: z.string().url('Logo must be a valid URL').optional(),
  positions: z.array(PositionSchema).min(1, 'At least one position is required'),
  clients: z.array(ClientSchema).optional(),
});

/**
 * Array of work experience items
 */
export const WorkExperienceSchema = z.array(WorkExperienceItemSchema);

/**
 * TypeScript types
 */
export type Position = z.infer<typeof PositionSchema>;
export type Client = z.infer<typeof ClientSchema>;
export type WorkExperience = z.infer<typeof WorkExperienceItemSchema>;
export type WorkExperienceList = z.infer<typeof WorkExperienceSchema>;
