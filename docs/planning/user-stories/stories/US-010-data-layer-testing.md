# US-010: Data Layer Testing

**Story ID**: US-010
**Title**: Comprehensive Testing for Data Layer
**Epic**: [EPIC-005: Multi-Language Portfolio Data Layer](../epics/EPIC-005-multi-language-portfolio-data-layer.md)
**Status**: In Progress
**Priority**: High
**Created**: 2025-01-14
**Updated**: 2025-11-15
**Assigned To**: Warren de Leon
**Category**: Testing

---

## User Story

**As a** developer,
**I want** comprehensive tests for the Redux data layer and multi-language support,
**So that** data fetching, persistence, and language switching are reliable and maintainable.

---

## Context & Rationale

This story covers testing for the core data architecture: Redux slices, async thunks, selectors, persistence, and multi-language data loading. Tests ensure the data layer is robust and regression-free.

Split from original US-010 to focus specifically on data layer testing (separate from splash screen testing in US-011).

---

## Acceptance Criteria

- [x] RNTL tests for all Redux slices (profile, workXP, education) with 100% coverage
- [x] Tests for async thunks (loading, success, error states)
- [x] Tests for memoised selectors
- [ ] E2E tests for language switching triggering correct data reload
- [ ] E2E tests for data persistence (redux-persist)
- [ ] GitHub API mocked in tests using local fixtures

---

## Story Points & Effort

**Story Points**: 5
**Effort Estimate**: 6.5 hours

---

## Tasks

| ID                                                                  | Task                                   | Effort | Status |
| ------------------------------------------------------------------- | -------------------------------------- | ------ | ------ |
| [TASK-050](../tasks/TASK-050-rntl-tests-redux-data-layer.md)        | RNTL tests for Redux data layer        | 2h     | Done   |
| [TASK-052](../tasks/TASK-052-e2e-tests-language-switching.md)       | E2E tests for language switching       | 1.5h   | To Do  |
| [TASK-053](../tasks/TASK-053-e2e-tests-data-loading-persistence.md) | E2E tests for data loading/persistence | 2h     | To Do  |
| [TASK-054](../tasks/TASK-054-mock-github-api-e2e-tests.md)          | Mock GitHub API in E2E tests           | 1h     | To Do  |

---

## Related User Stories

- [US-006](./US-006-data-migration-and-structure.md) - Data being tested
- [US-007](./US-007-redux-data-layer.md) - Redux layer being tested
- [US-009](./US-009-internationalization.md) - Language switching being tested
- [US-011](./US-011-splash-screen-testing.md) - Splash screen testing (separate)

---

**Last Updated**: 2025-11-15
