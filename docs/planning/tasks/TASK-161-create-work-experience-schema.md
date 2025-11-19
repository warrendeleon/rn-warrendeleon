# TASK-161: Create Work Experience Schema

**Status**: ⏳ In Progress
**Priority**: High
**Effort**: 1h
**Epic**: [EPIC-018](../epics/EPIC-018-zod-schema-validation.md)

---

## What You'll Do

Create a Zod schema for Work Experience API responses. This is the most complex schema as it includes nested Position and Client objects, with support for both developer roles (tech fields) and manager roles (responsibilities).

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
 * Includes nested Position and Client objects.
 */

import { z } from 'zod';

/**
 * Position schema (for multiple roles at same company)
 * Developer roles have tech fields, manager roles have responsibilities
 */
export const PositionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  start: z.string().min(1),
  end: z.string().min(1),
  description: z.string().min(1),
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
 * Single work experience entry (company with positions)
 */
export const WorkExperienceItemSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  logo: z.string().url().optional(),
  positions: z.array(PositionSchema).min(1), // At least one position required
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
```

---

### Step 2: Update Schemas Index

Add to `src/schemas/index.ts`:

```typescript
export {
  WorkExperienceSchema,
  WorkExperienceItemSchema,
  PositionSchema,
  ClientSchema,
  type Position,
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

- Create PositionSchema for multi-position support
- Support both developer (tech fields) and manager (responsibilities) roles
- Create WorkExperienceItemSchema with positions array
- Create ClientSchema for nested contract clients

Part of EPIC-018: Zod Schema Validation Integration
TASK-161"
```

---

## Verification Checklist

- [ ] Schema handles positions array (multi-position support)
- [ ] PositionSchema supports both tech fields and responsibilities
- [ ] Schema handles nested clients array
- [ ] Optional fields properly defined
- [ ] TypeScript passes

---

## Next Steps

- [TASK-162](./TASK-162-integrate-api-validation.md) - Integrate Validation into API Layer
