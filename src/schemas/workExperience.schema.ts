/**
 * Work Experience Data Schema
 *
 * Validates work experience history from GitHub API.
 * Includes nested Position, Technologies, and Client Reference objects.
 */

import { z } from 'zod';

/**
 * Date format validator - accepts both YYYY and YYYY-MM formats
 */
const dateSchema = z
  .string()
  .refine(val => /^\d{4}(-\d{2})?$/.test(val), 'Must be YYYY or YYYY-MM format');

/**
 * Testing framework configuration schema
 */
export const TestingConfigSchema = z.object({
  unit: z.array(z.string()).nullable(),
  e2e: z.array(z.string()).nullable(),
});

/**
 * Technology stack schema
 */
export const TechnologiesSchema = z.object({
  languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  testing: TestingConfigSchema.nullable(),
  tools: z.array(z.string()),
  ci: z.array(z.string()).nullable(),
  methodology: z.array(z.string()),
});

/**
 * Client reference schema (for contract positions)
 */
export const ClientReferenceSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  logo: z.string().url('Client logo must be a valid URL'),
});

/**
 * Position schema (for multiple roles at same company)
 * Developer roles have technologies, manager roles have responsibilities
 */
export const PositionSchema = z.object({
  id: z.string().min(1, 'Position ID is required'),

  title: z.string().min(1, 'Position title is required'),

  startDate: dateSchema,

  endDate: z.preprocess(val => (val === '' ? null : val), dateSchema.nullable()),

  description: z.string().min(1, 'Description is required'),

  responsibilities: z.array(z.string()).nullable(),

  technologies: TechnologiesSchema.nullable(),

  client: ClientReferenceSchema.nullish(),
});

/**
 * Single work experience entry (company with positions)
 */
export const WorkExperienceItemSchema = z.object({
  id: z.string().min(1, 'Work experience ID is required'),

  company: z.string().min(1, 'Company name is required'),

  logo: z.string().url('Company logo must be a valid URL').optional(),

  positions: z.array(PositionSchema).min(1, 'At least one position is required'),
});

/**
 * Array of work experience items
 */
export const WorkExperienceSchema = z.array(WorkExperienceItemSchema);

/**
 * TypeScript types
 */
export type TestingConfig = z.infer<typeof TestingConfigSchema>;
export type Technologies = z.infer<typeof TechnologiesSchema>;
export type ClientReference = z.infer<typeof ClientReferenceSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type WorkExperience = z.infer<typeof WorkExperienceItemSchema>;
export type WorkExperienceList = z.infer<typeof WorkExperienceSchema>;
