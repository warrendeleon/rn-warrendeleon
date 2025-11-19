# TASK-161: Create Work Experience Schema

**Status**: 📋 To Do
**Priority**: High
**Effort**: 1h
**Epic**: [EPIC-018](../epics/EPIC-018-zod-schema-validation.md)

---

## What You'll Do

Create a Zod schema for Work Experience API responses. This is the most complex schema as it includes nested Client objects.

---

## Prerequisites

- [ ] TASK-157 completed (Zod installed)
- [ ] TASK-160 completed (Education schema pattern)

---

## Step-by-Step Instructions

### Step 1: Create Work Experience Schema

**File: `src/schemas/workExperience.schema.ts`**

```typescript
/**
 * Work Experience Data Schema
 *
 * Validates work experience history from GitHub API.
 * Includes nested Client objects for contract work.
 */

import { z } from 'zod';

/**
 * Client schema (for contract work)
 */
export const ClientSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  logo: z.string().url(),
  start: z.string().min(1),
  end: z.string().min(1),
  type: z.string().min(1),
  position: z.string().min(1),
  programmingLanguages: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([]),
  unitTest: z.array(z.string()).optional(),
  e2e: z.array(z.string()).optional(),
  devTools: z.array(z.string()).default([]),
  projectManagement: z.array(z.string()).default([]),
  ci: z.array(z.string()).default([]),
});

/**
 * Single work experience entry
 */
export const WorkExperienceItemSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  logo: z.string().url(),
  start: z.string().min(1),
  end: z.string().min(1),
  type: z.string().min(1),
  position: z.string().min(1),
  programmingLanguages: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([]),
  unitTest: z.array(z.string()).optional(),
  e2e: z.array(z.string()).optional(),
  devTools: z.array(z.string()).default([]),
  projectManagement: z.array(z.string()).default([]),
  ci: z.array(z.string()).default([]),
  description: z.string().optional(),
  clients: z.array(ClientSchema).optional(),
});

/**
 * Array of work experience items
 */
export const WorkExperienceSchema = z.array(WorkExperienceItemSchema);

/**
 * TypeScript types
 */
export type Client = z.infer<typeof ClientSchema>;
export type WorkExperience = z.infer<typeof WorkExperienceItemSchema>;
export type WorkExperienceList = z.infer<typeof WorkExperienceSchema>;
```

---

### Step 2: Update Schemas Index

Add to `src/schemas/index.ts`:

```typescript
export {
  WorkExperienceSchema,
  WorkExperienceItemSchema,
  ClientSchema,
  type WorkExperience,
  type WorkExperienceList,
  type Client,
} from './workExperience.schema';
```

---

### Step 3: Verify and Commit

```bash
yarn typecheck
git add src/schemas/workExperience.schema.ts src/schemas/index.ts
git commit -m "✨ feat(schemas): add Zod schema for Work Experience data

- Create WorkExperienceItemSchema with all tech fields
- Create ClientSchema for nested contract clients
- Handle optional arrays with defaults

Part of EPIC-018: Zod Schema Validation Integration
TASK-161"
```

---

## Verification Checklist

- [ ] Schema handles nested clients array
- [ ] Optional fields properly defined
- [ ] Default values for empty arrays
- [ ] TypeScript passes

---

## Next Steps

- [TASK-162](./TASK-162-integrate-api-validation.md) - Integrate Validation into API Layer
