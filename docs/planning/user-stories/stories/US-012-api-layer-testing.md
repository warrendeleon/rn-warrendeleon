# US-012: API Layer Unit Testing

**Story ID**: US-012
**Title**: API Layer Unit Testing
**Epic**: [EPIC-005: Multi-Language Portfolio Data Layer](../epics/EPIC-005-multi-language-portfolio-data-layer.md)
**Status**: Not Started
**Priority**: High
**Created**: 2025-11-15
**Updated**: 2025-11-15
**Assigned To**: Warren de Leon
**Category**: Testing

---

## User Story

**As a** developer,
**I want** dedicated unit tests for the API layer using axios-mock-adapter,
**So that** HTTP requests, URL construction, and error handling are tested independently from Redux logic.

---

## Context & Rationale

The current app tests Redux async thunks with mocked axios, but lacks dedicated API layer tests. The old app (before August 2023 migration) had dedicated `api.unit.ts` files that tested the API layer in isolation using `axios-mock-adapter`.

This creates coverage gaps:

- GithubApiClient configuration is untested
- URL construction with locale/language is untested
- HTTP error handling is tested only through Redux layer
- No defence-in-depth for API bugs

Restoring the two-layer testing approach provides:

- API layer tested in isolation (fast, focused unit tests)
- Redux layer tested separately (state management logic)
- Better separation of concerns
- Easier debugging (can identify if bug is in API or Redux layer)

This follows the pattern from the old app: https://github.com/warrendeleon/rn-warrendeleon/blob/salve-tech-test/src/modules/profile/__test__/api.unit.ts

---

## Acceptance Criteria

- [ ] axios-mock-adapter installed as dev dependency
- [ ] API functions extracted from Redux thunks to `api/api.ts` files
- [ ] Profile API tests with 100% coverage
- [ ] Education API tests with 100% coverage
- [ ] WorkXP API tests with 100% coverage
- [ ] All API tests follow old app pattern (MockAdapter, success/error scenarios)
- [ ] Architecture docs updated with API testing standard
- [ ] All tests passing with 100% API layer coverage

---

## Story Points & Effort

**Story Points**: 3
**Effort Estimate**: 4 hours

---

## Tasks

| ID                                                             | Task                                   | Effort | Status      |
| -------------------------------------------------------------- | -------------------------------------- | ------ | ----------- |
| [TASK-056](../tasks/TASK-056-install-axios-mock-adapter.md)    | Install axios-mock-adapter             | 0.25h  | Not Started |
| [TASK-057](../tasks/TASK-057-api-tests-profile.md)             | Create API tests for Profile feature   | 1h     | Not Started |
| [TASK-058](../tasks/TASK-058-api-tests-education.md)           | Create API tests for Education feature | 1h     | Not Started |
| [TASK-059](../tasks/TASK-059-api-tests-workxp.md)              | Create API tests for WorkXP feature    | 1h     | Not Started |
| [TASK-060](../tasks/TASK-060-document-api-testing-standard.md) | Document API testing standard          | 0.75h  | Not Started |

---

## Related User Stories

- [US-007](./US-007-redux-data-layer.md) - Redux layer being tested
- [US-010](./US-010-data-layer-testing.md) - Data layer testing (E2E focus)
- [US-004](./US-004-comprehensive-test-coverage.md) - Component testing coverage

---

## Definition of Ready

- [x] User story statement written
- [x] Acceptance criteria defined
- [x] Story points estimated
- [x] Epic linked
- [x] Tasks created

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tests passing
- [ ] 100% coverage for API layer
- [ ] No regressions
- [ ] Documentation updated

---

## Benefits

### Two-Layer Testing Approach

**Layer 1: API Unit Tests** (NEW)

- Tests HTTP requests in isolation
- Tests URL construction
- Tests axios configuration
- Fast, focused tests

**Layer 2: Redux Tests** (EXISTING)

- Tests state management
- Tests async thunk logic
- Tests reducer behaviour
- Integration with mocked API

This provides defence-in-depth: API bugs caught at API layer, Redux bugs caught at Redux layer.

---

**Last Updated**: 2025-11-15
