# TASK-099: Remove Old Components

**Task ID**: TASK-099
**Title**: Remove Old Component Files After Migration Complete
**Epic**: [EPIC-011: Component Naming Clarity](../epics/EPIC-011-component-naming-clarity.md)
**User Story**: [US-020: Refactor Button Group Component Names](../stories/US-020-refactor-button-group-component-names-purpose-based-clarity.md)
**Status**: To Do
**Priority**: Low
**Created**: 2025-01-16
**Assigned To**: Warren de Leon
**Reviewer**: Warren de Leon
**Category**: Refactor

---

## Context

After all screens are migrated and old components are deprecated, remove the old component files entirely to complete the migration.

**Current State**: Old components exist with `@deprecated` tags

**Desired State**: Old components completely removed from codebase

---

## Technical Details

### Files to Delete

1. **`src/components/ChevronButtonGroup/`** (entire directory)
2. **`src/components/MenuButtonGroupSVG/`** (entire directory)
3. **`src/components/SelectableButtonGroup/`** (entire directory)
4. **`src/components/ButtonWithChevron/`** (entire directory)
5. **`src/components/SelectableListButton/`** (entire directory)

### Verification Before Deletion

Run grep to ensure no references remain:

```bash
grep -r "ChevronButtonGroup" src/
grep -r "MenuButtonGroupSVG" src/
grep -r "SelectableButtonGroup" src/
grep -r "ButtonWithChevron" src/
grep -r "SelectableListButton" src/
```

All should return zero results (or only comments/docs).

---

## Acceptance Criteria

- [ ] Verified zero references to old component names via grep
- [ ] All 5 old component directories deleted
- [ ] TypeScript compilation passes (`yarn typecheck`)
- [ ] All tests pass (`yarn test`)
- [ ] `yarn validate` passes
- [ ] No runtime errors when navigating through app

---

## Test Scenarios

**Scenario 1: No Old References Exist**

```gherkin
Given I have migrated all screens to new components
When I grep for old component names
Then zero results are returned
And it is safe to delete old files
```

**Scenario 2: App Works After Deletion**

```gherkin
Given I have deleted all old component files
When I run yarn validate
Then TypeScript compiles without errors
And all tests pass
And the app runs without runtime errors
```

---

## Story Points & Effort

**Effort Estimate**: 1.5 hours (includes thorough testing)

---

## Dependencies

**Blockers**: All tasks (TASK-087 through TASK-098)

**Enables**: Clean codebase with only purpose-based component names

---

**Last Updated**: 2025-01-16
