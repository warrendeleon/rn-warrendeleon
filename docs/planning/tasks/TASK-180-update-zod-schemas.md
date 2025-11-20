# TASK-180: Update Zod Schemas for New Structure

**Status**: 📋 To Do
**Priority**: High
**Effort**: 2h
**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)

---

## Description

Update all Zod schemas in `src/schemas/` to match the new fixture data structure. This includes updating field names, adding new nested schemas, and ensuring type inference produces the correct TypeScript types.

---

## Current State

The current Zod schemas match the old data structure:

### education.schema.ts

```typescript
export const EducationItemSchema = z.object({
  location: z.string().min(1),
  title: z.string().min(1),
  logo: z.string().url(),
  start: z.string().min(1),
  end: z.string().optional(),
  certificate: z.string().url().optional(),
});
```

### profile.schema.ts

```typescript
export const ProfileSchema = z.object({
  // ...
  carousel: z.array(z.string().url()),
  // ...
});
```

### workExperience.schema.ts

```typescript
export const PositionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  start: z.string().min(1),
  end: z.string().min(1),
  description: z.string().min(1),
  programmingLanguages: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
  unitTest: z.array(z.string()).optional(),
  e2e: z.array(z.string()).optional(),
  devTools: z.array(z.string()).optional(),
  agileMethodology: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
});

export const ClientSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  // ...
});

export const WorkExperienceItemSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  logo: z.string().url().optional(),
  positions: z.array(PositionSchema).min(1),
  clients: z.array(ClientSchema).optional(),
});
```

---

## Target State

Updated Zod schemas matching the new structure:

### education.schema.ts

```typescript
export const EducationItemSchema = z.object({
  id: z.string().uuid(),
  institution: z.string().min(1),
  title: z.string().min(1),
  logo: z.string().url(),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, 'Must be YYYY-MM format'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .nullable(),
  certificateUrl: z.string().url().nullable(),
});
```

### profile.schema.ts

```typescript
export const ProfileSchema = z.object({
  // ...
  galleryImages: z.array(z.string().url()),
  // ...
});
```

### workExperience.schema.ts

```typescript
// New: Testing config schema
export const TestingConfigSchema = z.object({
  unit: z.array(z.string()).nullable(),
  e2e: z.array(z.string()).nullable(),
});

// New: Technologies schema
export const TechnologiesSchema = z.object({
  languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  testing: TestingConfigSchema,
  tools: z.array(z.string()),
  ci: z.array(z.string()).nullable(),
  methodology: z.array(z.string()),
});

// New: Client reference schema (simplified)
export const ClientReferenceSchema = z.object({
  name: z.string().min(1),
  logo: z.string().url(),
});

// Updated: Position schema
export const PositionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, 'Must be YYYY-MM format'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .nullable(),
  description: z.string().min(1),
  responsibilities: z.array(z.string()).nullable(),
  technologies: TechnologiesSchema.nullable(),
  client: ClientReferenceSchema.nullable(),
});

// Updated: Work experience item schema (no clients array)
export const WorkExperienceItemSchema = z.object({
  id: z.string().uuid(),
  company: z.string().min(1),
  logo: z.string().url().optional(),
  positions: z.array(PositionSchema).min(1),
  // clients removed
});
```

---

## Step-by-Step Instructions

### Step 1: Update education.schema.ts

**File**: `src/schemas/education.schema.ts`

```typescript
/**
 * Education Data Schema
 *
 * Validates education history from GitHub API.
 */

import { z } from 'zod';

/**
 * ISO date format validator (YYYY-MM)
 */
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}$/, 'Must be ISO 8601 format: YYYY-MM');

/**
 * Single education entry
 */
export const EducationItemSchema = z.object({
  id: z.string().uuid('Must be valid UUID'),
  institution: z.string().min(1, 'Institution is required'),
  title: z.string().min(1, 'Title is required'),
  logo: z.string().url('Must be valid URL'),
  startDate: isoDateSchema,
  endDate: isoDateSchema.nullable(),
  certificateUrl: z.string().url().nullable(),
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
```

### Step 2: Update profile.schema.ts

**File**: `src/schemas/profile.schema.ts`

Update the `carousel` field to `galleryImages`:

```typescript
export const ProfileSchema = z.object({
  profilePicture: z.string().url(),
  name: z.string().min(1),
  lastName: z.string().min(1),
  headline: z.string().min(1),
  namePronunciation: z.string().min(1),
  namePronunciationAudioTrack: z.string().url(),
  email: z.string().email(),
  phone: z.string().min(1),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD for birthday
  location: LocationSchema,
  galleryImages: z.array(z.string().url()), // Renamed from carousel
  socials: SocialsSchema,
});
```

### Step 3: Update workExperience.schema.ts

**File**: `src/schemas/workExperience.schema.ts`

```typescript
/**
 * Work Experience Data Schema
 *
 * Validates work experience history from GitHub API.
 * Includes nested Technologies and ClientReference objects.
 */

import { z } from 'zod';

/**
 * ISO date format validator (YYYY-MM)
 */
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}$/, 'Must be ISO 8601 format: YYYY-MM');

/**
 * Testing configuration schema
 */
export const TestingConfigSchema = z.object({
  unit: z.array(z.string()).nullable(),
  e2e: z.array(z.string()).nullable(),
});

/**
 * Technologies schema for developer positions
 */
export const TechnologiesSchema = z.object({
  languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  testing: TestingConfigSchema,
  tools: z.array(z.string()),
  ci: z.array(z.string()).nullable(),
  methodology: z.array(z.string()),
});

/**
 * Client reference for contract positions
 */
export const ClientReferenceSchema = z.object({
  name: z.string().min(1),
  logo: z.string().url(),
});

/**
 * Position schema (for multiple roles at same company)
 * Developer roles have technologies, manager roles have responsibilities
 */
export const PositionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  startDate: isoDateSchema,
  endDate: isoDateSchema.nullable(),
  description: z.string().min(1),
  responsibilities: z.array(z.string()).nullable(),
  technologies: TechnologiesSchema.nullable(),
  client: ClientReferenceSchema.nullable(),
});

/**
 * Single work experience entry (company with positions)
 */
export const WorkExperienceItemSchema = z.object({
  id: z.string().uuid(),
  company: z.string().min(1),
  logo: z.string().url().optional(),
  positions: z.array(PositionSchema).min(1),
});

/**
 * Array of work experience items
 */
export const WorkExperienceSchema = z.array(WorkExperienceItemSchema);

/**
 * TypeScript types inferred from schemas
 */
export type TestingConfig = z.infer<typeof TestingConfigSchema>;
export type Technologies = z.infer<typeof TechnologiesSchema>;
export type ClientReference = z.infer<typeof ClientReferenceSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type WorkExperience = z.infer<typeof WorkExperienceItemSchema>;
export type WorkExperienceList = z.infer<typeof WorkExperienceSchema>;
```

### Step 4: Update schemas/index.ts

Update the exports to include new schemas and remove old ones:

```typescript
// Education
export {
  EducationSchema,
  EducationItemSchema,
  type Education,
  type EducationList,
} from './education.schema';

// Profile
export {
  ProfileSchema,
  LocationSchema,
  CoordinatesSchema,
  SocialsSchema,
  type Profile,
  type Location,
  type Coordinates,
  type Socials,
} from './profile.schema';

// Work Experience
export {
  WorkExperienceSchema,
  WorkExperienceItemSchema,
  PositionSchema,
  TechnologiesSchema,
  TestingConfigSchema,
  ClientReferenceSchema,
  type Position,
  type WorkExperience,
  type WorkExperienceList,
  type Technologies,
  type TestingConfig,
  type ClientReference,
} from './workExperience.schema';
```

### Step 5: Remove ClientSchema Export

Remove any exports of the old `ClientSchema` and `Client` type.

### Step 6: Verification

```bash
yarn typecheck
yarn test src/schemas
```

---

## Files to Modify

- `src/schemas/education.schema.ts`
- `src/schemas/profile.schema.ts`
- `src/schemas/workExperience.schema.ts`
- `src/schemas/index.ts`

---

## Acceptance Criteria

- [ ] `EducationItemSchema` updated with new field names and ID
- [ ] `ProfileSchema` updated with `galleryImages`
- [ ] `TestingConfigSchema` created
- [ ] `TechnologiesSchema` created
- [ ] `ClientReferenceSchema` created
- [ ] `PositionSchema` updated with new structure
- [ ] `WorkExperienceItemSchema` updated (clients removed)
- [ ] Old `ClientSchema` removed
- [ ] All schemas have proper Zod validation messages
- [ ] ISO date validation added for date fields
- [ ] Type exports updated in index.ts
- [ ] Schema tests pass (`yarn test src/schemas`)

---

## Implementation Notes

- **Date validation**: Use regex for ISO 8601 YYYY-MM format validation.
- **UUID validation**: Zod has built-in `.uuid()` validator - use it instead of `.min(1)`.
- **Nullable vs optional**: Use `.nullable()` for fields that are always present but may be null. Use `.optional()` for fields that may be omitted.
- **Error messages**: Add descriptive error messages to validators for better debugging.

---

## Dependencies

- [TASK-179](./TASK-179-update-typescript-types.md) - TypeScript types should be updated first

---

## Next Steps

- [TASK-181](./TASK-181-update-redux-selectors.md) - Update Redux Selectors for New Structure
