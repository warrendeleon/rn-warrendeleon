# TASK-094: Migrate EducationScreen

**Task ID**: TASK-094
**Title**: Migrate EducationScreen to use DetailListGroup
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

Migrate `EducationScreen` from using `MenuButtonGroupSVG` to using `DetailListGroup`.

**Current State**: EducationScreen imports and uses MenuButtonGroupSVG

**Desired State**: EducationScreen imports and uses DetailListGroup

---

## Technical Details

### Files to Modify

1. **`src/screens/EducationDataScreen.tsx`** - Update import and component usage
2. **`src/screens/__tests__/EducationDataScreen.rntl.tsx`** - Update test imports if needed

---

## Acceptance Criteria

- [ ] EducationScreen imports `DetailListGroup` instead of `MenuButtonGroupSVG`
- [ ] All functionality preserved (logos, subtitles, badges work)
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
