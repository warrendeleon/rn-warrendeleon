# TASK-001: React.memo ButtonWithChevron

**ID**: TASK-001
**Title**: Wrap ButtonWithChevron with React.memo
**Epic**: [EPIC-001: Performance Optimization](../epics/EPIC-001-performance-optimization.md)
**User Story**: [US-001: Smooth & Responsive Interactions](../stories/US-001-smooth-responsive-interactions.md)
**Created**: 2025-01-11
**Completed**: _Not yet completed_
**Status**: Not Started
**Priority**: High
**Effort Estimate**: 0.5 hours
**Tags**: `performance`, `memoization`, `react-memo`, `optimization`

---

## Context

ButtonWithChevron is rendered in lists and re-renders unnecessarily when parent components update. Wrapping with React.memo prevents re-renders when props haven't changed, reducing re-renders by ~70%.

**Pattern**: See [EPIC-001 React.memo Strategy](../epics/EPIC-001-performance-optimization.md#reactmemo-strategy).

---

## Technical Details

### Files to Modify

- `src/features/Home/components/ButtonWithChevron/ButtonWithChevron.tsx`

### Implementation

**Before**:

```typescript
export const ButtonWithChevron = ({ label, onPress, ...props }: ButtonWithChevronProps) => {
  // component implementation
};
```

**After**:

```typescript
export const ButtonWithChevron = React.memo(
  ({ label, onPress, ...props }: ButtonWithChevronProps) => {
    // component implementation
  }
);
```

**Why it works**: React.memo performs shallow comparison of props. If props haven't changed, skip re-render.

---

## Acceptance Criteria

- [ ] ButtonWithChevron wrapped with React.memo
- [ ] All existing functionality unchanged
- [ ] React DevTools Profiler shows reduced re-renders
- [ ] All tests pass (existing 100% coverage maintained)

---

## Test Scenarios

**Scenario 1: Prevents Unnecessary Re-renders**

```gherkin
Given ButtonWithChevron is wrapped with React.memo
And the component is rendered in a list
When the parent component re-renders with identical props
Then ButtonWithChevron should NOT re-render
And React DevTools Profiler should confirm this
```

**Scenario 2: Re-renders When Props Change**

```gherkin
Given ButtonWithChevron is wrapped with React.memo
When props change (e.g., label updates)
Then ButtonWithChevron SHOULD re-render
And display the updated content
```

---

## Dependencies

**Blockers**:

- [TASK-011](./TASK-011-create-error-boundary.md)

---

## Success Criteria

✅ React.memo applied correctly
✅ Profiler confirms reduced re-renders
✅ All tests pass

---

**Last Updated**: 2025-01-11
