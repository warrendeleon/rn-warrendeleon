# TASK-093: Migrate SettingsScreen

**Task ID**: TASK-093
**Title**: Migrate SettingsScreen to use SettingsGroup
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

Migrate `SettingsScreen` from using `ChevronButtonGroup` to using `SettingsGroup`.

**Current State**: SettingsScreen imports and uses ChevronButtonGroup

**Desired State**: SettingsScreen imports and uses SettingsGroup

---

## Technical Details

### Files to Modify

1. **`src/screens/SettingsScreen.tsx`** - Update import and component usage
2. **`src/screens/__tests__/SettingsScreen.rntl.tsx`** - Update test imports if needed

### Implementation

**Before**:

```typescript
import { ChevronButtonGroup } from '@app/components/ChevronButtonGroup';
```

**After**:

```typescript
import { SettingsGroup } from '@app/components/SettingsGroup';
```

---

## Acceptance Criteria

- [ ] SettingsScreen imports `SettingsGroup` instead of `ChevronButtonGroup`
- [ ] All functionality preserved (no behaviour changes)
- [ ] Tests updated and passing
- [ ] `yarn validate` passes
- [ ] Visual inspection: Settings screen looks identical

---

## Story Points & Effort

**Effort Estimate**: 0.5 hours

---

## Dependencies

**Blockers**: [TASK-088](./TASK-088-create-settings-group-component.md)

---

**Last Updated**: 2025-01-16
