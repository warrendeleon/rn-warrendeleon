# TASK-060: Document API Testing Standard

**Task ID**: TASK-060
**Title**: Document API Testing Standard in Architecture Docs
**Epic**: [EPIC-005: Multi-Language Portfolio Data Layer](../epics/EPIC-005-multi-language-portfolio-data-layer.md)
**User Story**: [US-012: API Layer Unit Testing](../stories/US-012-api-layer-testing.md)
**Status**: Done
**Priority**: Medium
**Created**: 2025-11-15
**Assigned To**: Warren de Leon
**Category**: Documentation

---

## Context

Update architecture documentation to establish API testing as the standard for future features.

---

## Acceptance Criteria

- [x] `.claude/docs/architecture-testing.md` updated with API testing section
- [x] Document two-layer testing approach (API + Redux)
- [x] Include code examples using axios-mock-adapter
- [x] Document when to use API tests vs Redux tests
- [x] Reference old app pattern
- [x] Add to "Testing Requirements" section

---

## Story Points & Effort

**Story Points**: N/A
**Effort Estimate**: 0.75h

---

## Documentation Sections to Add

### Two-Layer Testing Approach

Document:

- Layer 1: API Unit Tests (test HTTP, URLs, errors)
- Layer 2: Redux Tests (test state management)
- When to use each layer
- Benefits of defence-in-depth

### API Testing Pattern

Include:

- axios-mock-adapter setup
- MockAdapter usage
- Test structure example
- Coverage expectations (100%)

### Guidelines for New Features

- Always create `api/api.ts` for API functions
- Always create `api/__tests__/api.test.ts` for tests
- Extract API logic from Redux thunks
- Maintain separation of concerns

---

## Definition of Ready

- [x] Task description clear
- [x] Acceptance criteria defined
- [x] All API tests implemented (TASK-057, 058, 059 complete)

---

## Definition of Done

- [x] Architecture docs updated
- [x] Examples included
- [x] Guidelines clear
- [x] Reviewed for accuracy

---

**Completed**: 2025-11-15
**Last Updated**: 2025-11-15
