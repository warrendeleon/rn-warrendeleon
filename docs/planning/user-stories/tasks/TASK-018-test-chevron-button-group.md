# TASK-018: Test ChevronButtonGroup

**ID**: TASK-018
**Title**: Add Tests for ChevronButtonGroup Component
**Epic**: [EPIC-002: Quality & Reliability](../epics/EPIC-002-quality-reliability.md)
**User Story**: [US-004: Comprehensive Test Coverage](../stories/US-004-comprehensive-test-coverage.md)
**Created**: 2025-01-11
**Completed**: _Not yet completed_
**Status**: Not Started
**Priority**: Medium
**Effort Estimate**: 1 hour
**Tags**: `testing`, `coverage`, `jest`

---

## Context

ChevronButtonGroup currently has 0% coverage. Add comprehensive tests to reach 100%.

---

## Technical Details

### Files to Create

- `src/features/[location]/__tests__/ChevronButtonGroup.test.tsx`

### Test Cases

1. Renders correct number of buttons from config
2. Applies correct groupVariant (top/middle/bottom)
3. Renders dividers between buttons
4. Calls onPress handlers when buttons pressed
5. Passes props correctly to ButtonWithChevron
6. Handles edge cases (empty config, single button)

---

## Acceptance Criteria

- [ ] 100% coverage on ChevronButtonGroup
- [ ] All test cases pass
- [ ] Uses renderWithProviders for Gluestack UI
- [ ] Meaningful assertions

---

## Test Scenarios

See [US-004 Test Scenarios](../stories/US-004-comprehensive-test-coverage.md#chevronbuttongroup-component).

---

## Dependencies

**Blockers**: [TASK-024](./TASK-024-add-missing-types.md)

---

**Last Updated**: 2025-01-11
