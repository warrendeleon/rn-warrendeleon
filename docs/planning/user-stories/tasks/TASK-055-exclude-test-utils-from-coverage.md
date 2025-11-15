# TASK-055: Exclude Test Utilities from Jest Coverage

**Task ID**: TASK-055
**Title**: Exclude Test Utilities from Jest Coverage
**Epic**: [EPIC-002: Quality & Reliability](../epics/EPIC-002-quality-reliability.md)
**User Story**: [US-004-comprehensive-test-coverage](../stories/US-004-comprehensive-test-coverage.md)
**Status**: To Do
**Priority**: Medium
**Created**: 2025-01-15
**Assigned To**: Warren de Leon
**Category**: Configuration

---

## Context

The Jest coverage configuration currently includes `src/test-utils/**` in coverage reports, which is incorrect. Test utilities like `renderWithProviders.tsx` and Cucumber helpers are test infrastructure, not application code that needs testing.

Including test utilities in coverage:

- Gives false coverage metrics
- Inflates coverage percentages artificially
- Goes against industry best practices
- Makes it harder to identify actual gaps in application code coverage

This task updates `jest.config.cjs` to properly exclude the `test-utils` directory from coverage collection.

---

## Acceptance Criteria

- [ ] `src/test-utils/**` added to `collectCoverageFrom` exclusions in `jest.config.cjs`
- [ ] `yarn test:coverage` no longer reports coverage for test utilities
- [ ] Coverage report only includes application code
- [ ] All tests still pass after configuration change
- [ ] TypeScript and lint checks pass

---

## Story Points & Effort

**Story Points**: N/A
**Effort Estimate**: 15 minutes

---

## Definition of Ready

- [x] Task description clear
- [x] Acceptance criteria defined
- [x] Related to US-004 (test coverage improvements)

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Tests passing (`yarn test:coverage`)
- [ ] Lint and typecheck passing
- [ ] User story documentation updated
- [ ] No regressions

---

**Last Updated**: 2025-01-15
