# TASK-092: Create PickerItem Component

**Task ID**: TASK-092
**Title**: Create PickerItem Component (renamed from SelectableListButton)
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

Create new `PickerItem` component as a renamed version of `SelectableListButton`. This is the individual button component used within `PickerGroup`.

**Current State**: Only `SelectableListButton` exists

**Desired State**: Both `SelectableListButton` (deprecated) and `PickerItem` (new) exist side-by-side during migration

---

## Technical Details

### Files to Create

1. **`src/components/PickerItem/PickerItem.tsx`**
2. **`src/components/PickerItem/index.ts`**
3. **`src/components/PickerItem/__tests__/PickerItem.rntl.tsx`**

### Files to Reference (Copy From)

1. **`src/components/SelectableListButton/SelectableListButton.tsx`**
2. **`src/components/SelectableListButton/index.ts`**
3. **`src/components/SelectableListButton/__tests__/SelectableListButton.rntl.tsx`**

---

## Acceptance Criteria

- [ ] `PickerItem.tsx` created with exact same functionality as `SelectableListButton`
- [ ] All props/types renamed (`PickerItemProps`)
- [ ] Test file created and all tests pass
- [ ] TypeScript compilation passes
- [ ] Update `PickerGroup` to use `PickerItem` internally

---

## Story Points & Effort

**Effort Estimate**: 0.25 hours

---

## Dependencies

**Blockers**: [TASK-087](./TASK-087-create-migration-plan-document.md)

**Blocks**: [TASK-090](./TASK-090-create-picker-group-component.md) (PickerGroup needs this)

---

**Last Updated**: 2025-01-16
