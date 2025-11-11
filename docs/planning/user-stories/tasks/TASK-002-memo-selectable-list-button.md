# TASK-002: React.memo SelectableListButton

**ID**: TASK-002
**Title**: Wrap SelectableListButton with React.memo
**Epic**: [EPIC-001: Performance Optimization](../epics/EPIC-001-performance-optimization.md)
**User Story**: [US-001: Smooth & Responsive Interactions](../stories/US-001-smooth-responsive-interactions.md)
**Created**: 2025-01-11
**Completed**: _Not yet completed_
**Status**: Not Started
**Priority**: High
**Effort Estimate**: 0.5 hours
**Tags**: `performance`, `memoization`, `react-memo`

---

## Context

SelectableListButton renders in Language and Appearance selection lists. Prevent unnecessary re-renders with React.memo.

**Pattern**: See [TASK-001](./TASK-001-memo-button-with-chevron.md) for similar implementation.

---

## Technical Details

### Files to Modify

- Find SelectableListButton component file (likely in `src/features/Settings/components/` or similar)

### Implementation

Wrap component export with `React.memo()`.

---

## Acceptance Criteria

- [ ] SelectableListButton wrapped with React.memo
- [ ] Profiler confirms reduced re-renders
- [ ] All tests pass

---

## Dependencies

**Blockers**: [TASK-011](./TASK-011-create-error-boundary.md)

---

**Last Updated**: 2025-01-11
