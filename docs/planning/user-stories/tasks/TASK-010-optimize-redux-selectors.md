# TASK-010: Optimize Redux Selectors

**ID**: TASK-010
**Title**: Memoize Redux Selectors with createSelector
**Epic**: [EPIC-001: Performance Optimization](../epics/EPIC-001-performance-optimization.md)
**User Story**: [US-001: Smooth & Responsive Interactions](../stories/US-001-smooth-responsive-interactions.md)
**Created**: 2025-01-11
**Completed**: _Not yet completed_
**Status**: Not Started
**Priority**: Medium
**Effort Estimate**: 1 hour
**Tags**: `performance`, `redux`, `reselect`, `optimization`

---

## Context

Redux selectors currently recompute on every access. Use `createSelector` from Reselect to memoize selectors and only recompute when dependencies change.

**Pattern**: See [EPIC-001 createSelector Strategy](../epics/EPIC-001-performance-optimization.md#createselector-strategy).

---

## Technical Details

### Files to Modify

- `src/features/Settings/store/selectors.ts`

### Implementation

**Before**:

```typescript
export const selectTheme = (state: RootState) => state.settings.theme;
export const selectLanguage = (state: RootState) => state.settings.language;
```

**After**:

```typescript
import { createSelector } from '@reduxjs/toolkit';

const selectSettings = (state: RootState) => state.settings;

export const selectTheme = createSelector(selectSettings, settings => settings.theme);

export const selectLanguage = createSelector(selectSettings, settings => settings.language);
```

---

## Acceptance Criteria

- [ ] All selectors use createSelector
- [ ] Selectors only recompute when state slice changes
- [ ] All existing functionality unchanged
- [ ] Tests verify memoization works

---

## Test Scenarios

**Scenario 1: Selector Memoization**

```gherkin
Given a Redux selector using createSelector
When I call the selector twice with the same state
Then the result should be memoized (same reference)
And the selector function should only execute once
```

**Scenario 2: Selector Recomputes When Needed**

```gherkin
Given a Redux selector using createSelector
When the relevant state changes
Then the selector should recompute
And return the new value
```

---

## Dependencies

**Blockers**: [TASK-009](./TASK-009-usecallback-appearance-screen.md)

---

## Success Criteria

✅ All selectors memoized with createSelector
✅ Performance improvement measurable
✅ All tests pass

---

**Last Updated**: 2025-01-11
