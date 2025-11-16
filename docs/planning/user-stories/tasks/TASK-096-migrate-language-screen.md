# TASK-096: Migrate LanguageScreen

**Task ID**: TASK-096
**Title**: Migrate LanguageScreen to use PickerGroup
**Epic**: [EPIC-011: Component Naming Clarity](../epics/EPIC-011-component-naming-clarity.md)
**User Story**: [US-020: Refactor Button Group Component Names](../stories/US-020-refactor-button-group-component-names-purpose-based-clarity.md)
**Status**: To Do
**Priority**: Medium
**Created**: 2025-01-16
**Assigned To**: Warren de Leon
**Reviewer**: Warren de Leon
**Category**: Refactor

---

## Context

Migrate `LanguageScreen` from using `SelectableButtonGroup` to using `PickerGroup`.

**Current State**: LanguageScreen imports and uses SelectableButtonGroup

**Desired State**: LanguageScreen imports and uses PickerGroup

---

## Technical Details

### Files to Modify

1. **`src/screens/LanguageScreen.tsx`** - Update import and component usage
2. **`src/screens/__tests__/LanguageScreen.rntl.tsx`** - Update test imports if needed

---

## Acceptance Criteria

- [ ] LanguageScreen imports `PickerGroup` instead of `SelectableButtonGroup`
- [ ] All functionality preserved (language selection with checkmarks)
- [ ] Tests updated and passing
- [ ] `yarn validate` passes

---

## Story Points & Effort

**Effort Estimate**: 0.5 hours

---

## Dependencies

**Blockers**: [TASK-090](./TASK-090-create-picker-group-component.md)

---

**Last Updated**: 2025-01-16
