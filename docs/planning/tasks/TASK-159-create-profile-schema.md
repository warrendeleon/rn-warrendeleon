# TASK-159: Create Profile Schema

**Status**: ✅ Done
**Priority**: High
**Effort**: 1.5h
**Epic**: [EPIC-018](../epics/EPIC-018-zod-schema-validation.md)

---

## What You'll Do

Create a Zod schema for the Profile API response. This ensures all profile data from GitHub is valid before storing in Redux.

---

## Prerequisites

- [x] TASK-157 completed (Zod installed)
- [x] TASK-158 completed (understand schema pattern)

---

## Current Profile Type

Located in `src/types/portfolio.ts`:

```typescript
export interface Profile {
  profilePicture: string;
  name: string;
  lastName: string;
  headline: string;
  namePronunciation: string;
  namePronunciationAudioTrack: string;
  email: string;
  phone: string;
  birthday: string;
  location: Location;
  carousel: string[];
  socials: Socials;
}
```

---

## Step-by-Step Instructions

### Step 1: Create the Profile Schema File

**File: `src/schemas/profile.schema.ts`**

```typescript
/**
 * Profile Data Schema
 *
 * Validates profile data fetched from GitHub API.
 * Ensures all required fields are present and correctly typed.
 */

import { z } from 'zod';

/**
 * Location schema (nested object)
 */
const LocationSchema = z.object({
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
});

/**
 * Social media links schema (nested object)
 * All fields are optional as user may not have all social accounts
 */
const SocialsSchema = z.object({
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
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

  namePronunciation: z.string().default(''),

  namePronunciationAudioTrack: z.string().default(''),

  email: z.string().email('Invalid email address'),

  phone: z.string().min(1, 'Phone number is required'),

  birthday: z.string().min(1, 'Birthday is required'),

  location: LocationSchema,

  carousel: z.array(z.string().url()).default([]),

  socials: SocialsSchema,
});

/**
 * TypeScript types inferred from schema
 */
export type Profile = z.infer<typeof ProfileSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Socials = z.infer<typeof SocialsSchema>;
```

---

### Step 2: Update Schemas Index

**File: `src/schemas/index.ts`**

```typescript
/**
 * Zod Schema Exports
 */

// Environment configuration schema
export { EnvSchema, APP_ENV_VALUES, type EnvConfig, type AppEnv } from './env.schema';

// Profile schema
export { ProfileSchema, type Profile, type Location, type Socials } from './profile.schema';

// Other schemas (uncomment as created)
// export { EducationSchema, type Education } from './education.schema';
// export { WorkExperienceSchema, type WorkExperience } from './workExperience.schema';
```

---

### Step 3: Update Types Export (Optional)

You can keep `src/types/portfolio.ts` for backward compatibility or update imports to use schemas directly. For now, keep both and migrate gradually.

---

### Step 4: Test the Schema

Create a test file to verify:

```bash
yarn test src/schemas/__tests__/profile.schema.rntl.ts
```

If test doesn't exist yet, create it in TASK-163.

---

### Step 5: Verify TypeScript

```bash
yarn typecheck
```

**Expected**: No errors.

---

### Step 6: Commit

```bash
git add src/schemas/profile.schema.ts src/schemas/index.ts
git commit -m "✨ feat(schemas): add Zod schema for Profile data

- Create ProfileSchema with nested Location and Socials
- Add validation for URLs, emails, required fields
- Export inferred TypeScript types

Part of EPIC-018: Zod Schema Validation Integration
TASK-159"
```

---

## Verification Checklist

- [x] `src/schemas/profile.schema.ts` exists
- [x] Schema exported from `src/schemas/index.ts`
- [x] `yarn typecheck` passes
- [x] Schema validates sample profile data correctly

---

## Troubleshooting

### Error: "Property 'x' does not exist on type 'Profile'"

**Cause**: Old imports still use types from portfolio.ts.
**Fix**: Either update imports or keep portfolio.ts re-exporting from schema.

### Validation fails on empty strings

**Cause**: Fields like `namePronunciation` may be empty in data.
**Fix**: Use `.default('')` or `.optional()` for optional fields.

---

## Next Steps

- [TASK-160](./TASK-160-create-education-schema.md) - Create Education Schema
