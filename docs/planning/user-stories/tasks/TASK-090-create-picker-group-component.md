# TASK-090: Create PickerGroup Component

**Task ID**: TASK-090
**Title**: Create PickerGroup Component (renamed from SelectableButtonGroup)
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

Create new `PickerGroup` component as a renamed version of `SelectableButtonGroup`. This component is specifically for single-selection pickers (language, theme/appearance).

**Current State**: Only `SelectableButtonGroup` exists

**Desired State**: Both `SelectableButtonGroup` (deprecated) and `PickerGroup` (new) exist side-by-side during migration

---

## Technical Details

### Files to Create

1. **`src/components/PickerGroup/PickerGroup.tsx`**
2. **`src/components/PickerGroup/index.ts`**
3. **`src/components/PickerGroup/__tests__/PickerGroup.rntl.tsx`**

### Files to Reference (Copy From)

1. **`src/components/SelectableButtonGroup/SelectableButtonGroup.tsx`**
2. **`src/components/SelectableButtonGroup/index.ts`**
3. **`src/components/SelectableButtonGroup/__tests__/SelectableButtonGroup.rntl.tsx`**

### Implementation

**Steps**:

1. Copy `SelectableButtonGroup/` directory to `PickerGroup/`
2. Rename all instances of `SelectableButtonGroup` → `PickerGroup` in files
3. Rename types: `SelectableButtonGroupProps` → `PickerGroupProps`, `SelectableButtonGroupItem` → `PickerGroupItem`
4. Update test file imports and test names
5. Update barrel export in `index.ts`

---

## Acceptance Criteria

- [ ] `PickerGroup.tsx` created with exact same functionality as `SelectableButtonGroup`
- [ ] All props/types renamed (`PickerGroupProps`, `PickerGroupItem`)
- [ ] Test file created and all tests pass
- [ ] TypeScript compilation passes (`yarn typecheck`)
- [ ] Test coverage maintained (run `yarn test PickerGroup`)

---

## Story Points & Effort

**Effort Estimate**: 0.25 hours

---

## Dependencies

**Blockers**: [TASK-087](./TASK-087-create-migration-plan-document.md)

**Blocks**: [TASK-096](./TASK-096-migrate-language-screen.md), [TASK-097](./TASK-097-migrate-appearance-screen.md)

---

**Last Updated**: 2025-01-16
