# TASK-009: useCallback AppearanceScreen

**ID**: TASK-009
**Title**: useCallback for AppearanceScreen Selection Handler
**Epic**: [EPIC-001: Performance Optimization](../epics/EPIC-001-performance-optimization.md)
**User Story**: [US-001: Smooth & Responsive Interactions](../stories/US-001-smooth-responsive-interactions.md)
**Created**: 2025-01-11
**Completed**: 2025-01-12
**Status**: Completed
**Priority**: High
**Effort Estimate**: 0.5 hours
**Tags**: `performance`, `usecallback`

---

## Context

AppearanceScreen creates new selection handler on every render. Wrap with useCallback.

**Pattern**: See [TASK-007](./TASK-007-usecallback-settings-screen.md) for similar implementation.

---

## Technical Details

### Files to Modify

- `src/features/Settings/AppearanceScreen.tsx`

### Implementation

Wrap theme selection handler with `useCallback(() => {...}, [dependencies])`.

---

## Acceptance Criteria

- [x] Selection handler wrapped with useCallback
- [x] Dependency array correct (`[dispatch, navigation]`)
- [x] ESLint passes

---

## Dependencies

**Blockers**: [TASK-006](./TASK-006-usememo-appearance-screen.md)

---

**Last Updated**: 2025-01-12
