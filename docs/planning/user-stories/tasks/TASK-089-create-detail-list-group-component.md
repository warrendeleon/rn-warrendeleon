# TASK-089: Create DetailListGroup Component

**Task ID**: TASK-089
**Title**: Create DetailListGroup Component (renamed from MenuButtonGroupSVG)
**Epic**: [EPIC-011: Component Naming Clarity](../epics/EPIC-011-component-naming-clarity.md)
**User Story**: [US-020: Refactor Button Group Component Names](../stories/US-020-refactor-button-group-component-names-purpose-based-clarity.md)
**Status**: To Do
**Priority**: High
**Created**: 2025-01-16
**Assigned To**: Warren de Leon
**Reviewer**: Warren de Leon
**Category**: Refactor

---

## Context

Create new `DetailListGroup` component as a renamed version of `MenuButtonGroupSVG`. This component is specifically for rich content lists with SVG logos, subtitles, badges, and loading states (education, work experience).

**Current State**: Only `MenuButtonGroupSVG` exists

**Desired State**: Both `MenuButtonGroupSVG` (deprecated) and `DetailListGroup` (new) exist side-by-side during migration

---

## Technical Details

### Files to Create

1. **`src/components/DetailListGroup/DetailListGroup.tsx`**
2. **`src/components/DetailListGroup/index.ts`**
3. **`src/components/DetailListGroup/__tests__/DetailListGroup.rntl.tsx`**

### Files to Reference (Copy From)

1. **`src/components/MenuButtonGroupSVG/MenuButtonGroupSVG.tsx`**
2. **`src/components/MenuButtonGroupSVG/index.ts`**
3. **`src/components/MenuButtonGroupSVG/__tests__/MenuButtonGroupSVG.rntl.tsx`**

### Implementation

**Steps**:

1. Copy `MenuButtonGroupSVG/` directory to `DetailListGroup/`
2. Rename all instances of `MenuButtonGroupSVG` → `DetailListGroup` in files
3. Rename types: `MenuButtonGroupSVGProps` → `DetailListGroupProps`, `MenuButtonGroupSVGItem` → `DetailListGroupItem`
4. Update test file imports and test names
5. Update barrel export in `index.ts`

**File Structure**:

```
src/components/DetailListGroup/
├── DetailListGroup.tsx
├── index.ts
└── __tests__/
    └── DetailListGroup.rntl.tsx
```

### Why This Matters

1. **Purpose-based naming**: "DetailListGroup" reveals it's for rich content with details
2. **Removes implementation detail**: No "SVG" in name (implementation detail)
3. **Clearer use case**: Education/work history lists are "detail lists"

---

## Acceptance Criteria

- [ ] `DetailListGroup.tsx` created with exact same functionality as `MenuButtonGroupSVG`
- [ ] All props/types renamed (`DetailListGroupProps`, `DetailListGroupItem`)
- [ ] Test file created and all tests pass
- [ ] Barrel export created (`index.ts`)
- [ ] TypeScript compilation passes (`yarn typecheck`)
- [ ] ESLint passes (`yarn lint`)
- [ ] Test coverage maintained (run `yarn test DetailListGroup`)

---

## Story Points & Effort

**Story Points**: 0.5
**Effort Estimate**: 0.25 hours
**Actual Effort**: _To be tracked_

---

## Dependencies

**Blockers**: [TASK-087](./TASK-087-create-migration-plan-document.md) (migration plan)

**Blocks**: [TASK-094](./TASK-094-migrate-education-screen.md), [TASK-095](./TASK-095-migrate-work-xp-screen.md)

**Enables**: Migration of EducationScreen and WorkXPScreen

---

**Last Updated**: 2025-01-16
