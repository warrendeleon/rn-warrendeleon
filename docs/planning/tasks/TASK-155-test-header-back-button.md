# TASK-155: Unit Tests for HeaderBackButton Component

**Status**: ✅ Done
**Priority**: Medium
**Effort**: 0.75h
**Epic**: [EPIC-017](../epics/EPIC-017-test-coverage-improvements.md)

---

## Description

Add proper unit tests for the `HeaderBackButton` component. Currently only has story tests which don't assert functionality.

## Current State

- Only story tests exist (`HeaderBackButton.stories.rntl.tsx`)
- Stories don't contain assertions
- Missing unit test coverage

## Acceptance Criteria

- [x] Test renders back icon correctly
- [x] Test onPress handler is called
- [x] Test disabled state
- [x] Test accessibility role (button)
- [x] Test accessibility label
- [x] Test dark/light theme support
- [x] Test touch target size (44x44 minimum for EAA)
- [x] All tests pass with `yarn test`
- [x] Coverage threshold met

## Implementation Notes

```typescript
// Key areas to test:
- Pressable onPress handler
- ChevronLeft icon rendering
- Disabled prop handling
- Accessibility props
- Theme-aware icon colours
- Touch target sizing
```

## Test File Location

`src/components/HeaderBackButton/__tests__/HeaderBackButton.rntl.tsx`

## Related Files

- `src/components/HeaderBackButton/HeaderBackButton.tsx`
- `src/components/HeaderBackButton/__tests__/HeaderBackButton.stories.rntl.tsx`
