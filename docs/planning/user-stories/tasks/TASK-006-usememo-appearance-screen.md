# TASK-006: useMemo AppearanceScreen

**ID**: TASK-006
**Title**: useMemo for AppearanceScreen themeItems Array
**Epic**: [EPIC-001: Performance Optimization](../epics/EPIC-001-performance-optimization.md)
**User Story**: [US-001: Smooth & Responsive Interactions](../stories/US-001-smooth-responsive-interactions.md)
**Created**: 2025-01-11
**Completed**: 2025-11-11
**Status**: Completed
**Priority**: High
**Effort Estimate**: 0.5 hours
**Tags**: `performance`, `usememo`

---

## Context

AppearanceScreen creates themeItems array on every render. Wrap with useMemo.

**Pattern**: See [TASK-004](./TASK-004-usememo-settings-screen.md) for similar implementation.

---

## Technical Details

### Files to Modify

- `src/features/Settings/AppearanceScreen.tsx`

### Implementation

Wrap themeItems array with `useMemo(() => [...], [dependencies])`.

---

## Acceptance Criteria

- [x] themeItems wrapped with useMemo
- [x] Dependency array correct
- [x] ESLint passes

---

## Dependencies

**Blockers**: [TASK-003](./TASK-003-memo-button-group-divider.md)

---

**Last Updated**: 2025-01-11
