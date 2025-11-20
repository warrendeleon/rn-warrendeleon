# TASK-154: Unit Tests for ButtonGroup Component

**Status**: ⏳ In Progress
**Priority**: Medium
**Effort**: 0.75h
**Epic**: [EPIC-017](../epics/EPIC-017-test-coverage-improvements.md)

---

## Description

Add proper unit tests for the `ButtonGroup` component. Currently only has story tests which don't assert functionality.

## Current State

- Only story tests exist (`ButtonGroup.stories.rntl.tsx`)
- Stories don't contain assertions
- Missing unit test coverage

## Acceptance Criteria

- [ ] Test renders children correctly
- [ ] Test single item layout
- [ ] Test multiple items layout
- [ ] Test spacing between items
- [ ] Test dark/light theme support
- [ ] Test accessibility container role
- [ ] All tests pass with `yarn test`
- [ ] Coverage threshold met

## Implementation Notes

```typescript
// Key areas to test:
- Children rendering
- Box layout props
- Gap/spacing between items
- Theme-aware styling
- GroupVariant logic for child components
```

## Test File Location

`src/components/ButtonGroup/__tests__/ButtonGroup.rntl.tsx`

## Related Files

- `src/components/ButtonGroup/ButtonGroup.tsx`
- `src/components/ButtonGroup/__tests__/ButtonGroup.stories.rntl.tsx`
