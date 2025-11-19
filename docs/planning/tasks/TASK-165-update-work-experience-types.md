# TASK-165: Update WorkExperience TypeScript Types

**Status**: ⏳ In Progress
**Priority**: High
**Effort**: 1h
**Epic**: [EPIC-019](../epics/EPIC-019-work-experience-multi-position.md)

---

## Description

Update the WorkExperience TypeScript types to support multiple positions at the same company. Add a new `Position` interface and update `WorkExperience` to use a `positions` array, following the same pattern as the existing `clients` array.

## Current State

```typescript
// Current structure in src/types/portfolio.ts
export interface WorkExperience {
  id: string;
  company: string;
  logo?: string;
  position: string; // Single position only
  start: string;
  end: string;
  // ... tech fields
  clients?: Client[];
}
```

## Target State

```typescript
export interface Position {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  // Technical fields (for developer roles)
  programmingLanguages?: string[];
  techStack?: string[];
  unitTest?: string[];
  e2e?: string[];
  devTools?: string[];
  agileMethodology?: string[];
  // Management fields (for manager roles)
  responsibilities?: string[];
}

export interface WorkExperience {
  id: string;
  company: string;
  logo?: string;
  positions: Position[]; // Multiple positions support
  clients?: Client[];
}
```

## Acceptance Criteria

- [ ] Create `Position` interface with all required fields
- [ ] Add optional `responsibilities` field for manager roles
- [ ] Update `WorkExperience` to use `positions` array
- [ ] Remove deprecated single `position`, `start`, `end`, `description` fields from WorkExperience
- [ ] Export `Position` type from portfolio.ts
- [ ] No TypeScript errors with `yarn typecheck`
- [ ] Update any type guards or utility functions that reference old structure

## Implementation Notes

- The `responsibilities` field is an array of strings for manager roles (replaces tech stack sections)
- Position `id` should be UUID format for consistency
- Keep `clients` array unchanged - it works alongside positions

## Files to Modify

- `src/types/portfolio.ts`

## Related Files

- `src/features/WorkExperience/store/selectors.ts` (will need updates in TASK-167)
- All fixture files (will be updated in TASK-166)
