# TASK-021: Test useAppColorScheme Hook

**ID**: TASK-021
**Title**: Add Tests for useAppColorScheme Hook
**Epic**: [EPIC-002: Quality & Reliability](../epics/EPIC-002-quality-reliability.md)
**User Story**: [US-004: Comprehensive Test Coverage](../stories/US-004-comprehensive-test-coverage.md)
**Created**: 2025-01-11
**Completed**: _Not yet completed_
**Status**: Not Started
**Priority**: Medium
**Effort Estimate**: 1 hour
**Tags**: `testing`, `hooks`, `coverage`, `jest`

---

## Context

useAppColorScheme hook has 0% coverage. Add comprehensive tests to reach 100%.

---

## Technical Details

### Test Cases

1. Returns 'dark' when theme='system' and device is dark
2. Returns 'light' when theme='system' and device is light
3. Returns 'light' when theme='light' (overrides system)
4. Returns 'dark' when theme='dark' (overrides system)
5. Integrates with Redux state correctly

### Testing Approach

Use `@testing-library/react-hooks` or `renderHook` from React Native Testing Library.

---

## Acceptance Criteria

- [ ] 100% coverage on useAppColorScheme
- [ ] All theme scenarios tested
- [ ] Mock Redux state and useColorScheme
- [ ] All tests pass

---

## Test Scenarios

See [US-004 Test Scenarios](../stories/US-004-comprehensive-test-coverage.md#useappcolorscheme-hook).

---

## Dependencies

**Blockers**: [TASK-024](./TASK-024-add-missing-types.md)

---

**Last Updated**: 2025-01-11
