# TASK-095: Migrate WorkXPScreen

**Task ID**: TASK-095
**Title**: Migrate WorkXPScreen to use DetailListGroup
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

Migrate `WorkXPScreen` from using `MenuButtonGroupSVG` to using `DetailListGroup`.

**Current State**: WorkXPScreen imports and uses MenuButtonGroupSVG

**Desired State**: WorkXPScreen imports and uses DetailListGroup

---

## Technical Details

### Files to Modify

1. **`src/screens/WorkXPScreen.tsx`** - Update import and component usage
2. **`src/screens/__tests__/WorkXPScreen.rntl.tsx`** - Update test imports if needed

---

## Acceptance Criteria

- [ ] WorkXPScreen imports `DetailListGroup` instead of `MenuButtonGroupSVG`
- [ ] All functionality preserved (company logos, dates work)
- [ ] Tests updated and passing
- [ ] `yarn validate` passes

---

## Story Points & Effort

**Effort Estimate**: 0.5 hours

---

## Dependencies

**Blockers**: [TASK-089](./TASK-089-create-detail-list-group-component.md)

---

**Last Updated**: 2025-01-16
