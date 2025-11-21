# US-030: Type System Updates

**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)
**Status**: ✅ Done
**Effort**: 4 hours

---

## User Story

**As a** developer working with portfolio data
**I want** TypeScript types and Zod schemas updated to match the new data structure
**So that** I have compile-time type safety and runtime validation for the normalised data

---

## Background

After restructuring the fixture data (US-028 and US-029), the TypeScript types and Zod validation schemas need to be updated to reflect:

- ISO 8601 date formats
- Flattened positions structure
- Normalised field names
- Explicit null types for optional fields
- UUID identifiers for all entities

Without updated types and schemas:

- TypeScript won't catch type errors
- Runtime validation will fail
- API responses won't be validated correctly
- Redux state types will be incorrect

---

## Acceptance Criteria

- [ ] TypeScript types updated for all data entities
- [ ] Zod schemas updated for runtime validation
- [ ] Date fields typed as ISO 8601 strings
- [ ] Optional fields explicitly typed as `| null`
- [ ] UUID fields typed correctly
- [ ] All type exports updated
- [ ] TypeScript strict mode compliance
- [ ] All compilation errors resolved

---

## Technical Details

### Updated TypeScript Types

```typescript
// src/types/workExperience.ts

export interface WorkExperience {
  id: string; // UUID
  company: string;
  companyLogo?: string | null;
  startDate: string; // ISO 8601
  endDate: string | null; // ISO 8601 or null if current
  positions: Position[]; // Flattened from clients
  techStack: string[]; // Normalised field name
}

export interface Position {
  id: string; // UUID
  clientName: string; // Flattened from nested client
  role: string;
  startDate: string; // ISO 8601
  endDate: string | null; // ISO 8601 or null if current
  description: string;
  responsibilities: string[];
  achievements: string[];
  techStack: string[]; // Normalised field name
}
```

### Updated Zod Schemas

```typescript
// src/schemas/workExperience.ts

import { z } from 'zod';

export const PositionSchema = z.object({
  id: z.string().uuid(),
  clientName: z.string(),
  role: z.string(),
  startDate: z.string().datetime(), // ISO 8601
  endDate: z.string().datetime().nullable(), // ISO 8601 or null
  description: z.string(),
  responsibilities: z.array(z.string()),
  achievements: z.array(z.string()),
  techStack: z.array(z.string()), // Normalised field name
});

export const WorkExperienceSchema = z.object({
  id: z.string().uuid(),
  company: z.string(),
  companyLogo: z.string().url().nullable(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable(),
  positions: z.array(PositionSchema), // Flattened structure
  techStack: z.array(z.string()),
});
```

---

## Related Tasks

- [TASK-179](../tasks/TASK-179-update-typescript-types.md): Update TypeScript Types for New Structure (2h)
- [TASK-180](../tasks/TASK-180-update-zod-schemas.md): Update Zod Schemas for New Structure (2h)

---

## Definition of Done

- [ ] All TypeScript types updated
- [ ] All Zod schemas updated
- [ ] No TypeScript compilation errors
- [ ] Zod validation passes for fixture data
- [ ] API client type inference correct
- [ ] Redux state types correct
- [ ] Component prop types correct
- [ ] All tests passing with new types

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md), [US-029](US-029-structure-normalisation.md), [US-031](US-031-codebase-integration.md)
