# TASK-097: Migrate AppearanceScreen

**Task ID**: TASK-097
**Title**: Migrate AppearanceScreen to use PickerGroup
**Epic**: [EPIC-011: Component Naming Clarity](../epics/EPIC-011-component-naming-clarity.md)
**User Story**: [US-020: Refactor Button Group Component Names](../stories/US-020-refactor-button-group-component-names-purpose-based-clarity.md)
**Status**: ✅ Done
**Priority**: Medium
**Created**: 2025-01-16
**Assigned To**: Warren de Leon
**Reviewer**: Warren de Leon
**Category**: Refactor

---

## Context

Migrate `AppearanceScreen` from using `SelectableButtonGroup` to using `PickerGroup`.

**Current State**: AppearanceScreen imports and uses SelectableButtonGroup

**Desired State**: AppearanceScreen imports and uses PickerGroup

---

## Technical Details

### Files to Modify

1. **`src/screens/AppearanceScreen.tsx`** - Update import and component usage
2. **`src/screens/__tests__/AppearanceScreen.rntl.tsx`** - Update test imports if needed

---

## Acceptance Criteria

- [x] AppearanceScreen imports `PickerGroup` instead of `SelectableButtonGroup`
- [x] All functionality preserved (theme selection with checkmarks)
- [x] Tests updated and passing
- [x] `yarn validate` passes

---

## Story Points & Effort

**Effort Estimate**: 0.5 hours

---

## Dependencies

**Blockers**: [TASK-090](./TASK-090-create-picker-group-component.md)

---

**Last Updated**: 2025-01-16
