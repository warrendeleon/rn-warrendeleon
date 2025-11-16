# TASK-091: Create SettingsItem Component

**Task ID**: TASK-091
**Title**: Create SettingsItem Component (renamed from ButtonWithChevron)
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

Create new `SettingsItem` component as a renamed version of `ButtonWithChevron`. This is the individual button component used within `SettingsGroup`.

**Current State**: Only `ButtonWithChevron` exists

**Desired State**: Both `ButtonWithChevron` (deprecated) and `SettingsItem` (new) exist side-by-side during migration

---

## Technical Details

### Files to Create

1. **`src/components/SettingsItem/SettingsItem.tsx`**
2. **`src/components/SettingsItem/index.ts`**
3. **`src/components/SettingsItem/__tests__/SettingsItem.rntl.tsx`**

### Files to Reference (Copy From)

1. **`src/components/ButtonWithChevron/ButtonWithChevron.tsx`**
2. **`src/components/ButtonWithChevron/index.ts`**
3. **`src/components/ButtonWithChevron/__tests__/ButtonWithChevron.rntl.tsx`**

---

## Acceptance Criteria

- [ ] `SettingsItem.tsx` created with exact same functionality as `ButtonWithChevron`
- [ ] All props/types renamed (`SettingsItemProps`)
- [ ] Test file created and all tests pass
- [ ] TypeScript compilation passes
- [ ] Update `SettingsGroup` to use `SettingsItem` internally

---

## Story Points & Effort

**Effort Estimate**: 0.25 hours

---

## Dependencies

**Blockers**: [TASK-087](./TASK-087-create-migration-plan-document.md)

**Blocks**: [TASK-088](./TASK-088-create-settings-group-component.md) (SettingsGroup needs this)

---

**Last Updated**: 2025-01-16
