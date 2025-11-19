# TASK-160: Create Education Schema

**Status**: 📋 To Do
**Priority**: High
**Effort**: 1h
**Epic**: [EPIC-018](../epics/EPIC-018-zod-schema-validation.md)

---

## What You'll Do

Create a Zod schema for Education API responses. Education data is an array of educational history items.

---

## Prerequisites

- [ ] TASK-157 completed (Zod installed)
- [ ] TASK-159 completed (Profile schema pattern)

---

## Step-by-Step Instructions

### Step 1: Create Education Schema

**File: `src/schemas/education.schema.ts`**

```typescript
/**
 * Education Data Schema
 *
 * Validates education history data from GitHub API.
 */

import { z } from 'zod';

/**
 * Single education entry schema
 */
export const EducationItemSchema = z.object({
  id: z.string().min(1, 'Education ID is required'),

  institution: z.string().min(1, 'Institution name is required'),

  logo: z.string().url('Logo must be a valid URL'),

  degree: z.string().min(1, 'Degree is required'),

  location: z.string().min(1, 'Location is required'),

  start: z.string().min(1, 'Start date is required'),

  end: z.string().min(1, 'End date is required'),

  certificateUrl: z.string().url().optional().or(z.literal('')),
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

---

### Step 2: Update Schemas Index

Add to `src/schemas/index.ts`:

```typescript
export {
  EducationSchema,
  EducationItemSchema,
  type Education,
  type EducationList,
} from './education.schema';
```

---

### Step 3: Verify and Commit

```bash
yarn typecheck
git add src/schemas/education.schema.ts src/schemas/index.ts
git commit -m "✨ feat(schemas): add Zod schema for Education data

- Create EducationItemSchema for single entry
- Create EducationSchema for array of items
- Validate required fields and URLs

Part of EPIC-018: Zod Schema Validation Integration
TASK-160"
```

---

## Verification Checklist

- [ ] Schema file exists
- [ ] Exported from index
- [ ] TypeScript passes
- [ ] Handles optional certificateUrl

---

## Next Steps

- [TASK-161](./TASK-161-create-work-experience-schema.md) - Create Work Experience Schema
