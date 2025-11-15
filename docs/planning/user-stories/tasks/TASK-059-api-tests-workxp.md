# TASK-059: Create API Tests for WorkXP Feature

**Task ID**: TASK-059
**Title**: Create API Tests for WorkXP Feature
**Epic**: [EPIC-005: Multi-Language Portfolio Data Layer](../epics/EPIC-005-multi-language-portfolio-data-layer.md)
**User Story**: [US-012: API Layer Unit Testing](../stories/US-012-api-layer-testing.md)
**Status**: Done
**Priority**: High
**Created**: 2025-11-15
**Assigned To**: Warren de Leon
**Category**: Testing

---

## Context

Extract WorkXP API logic from Redux thunk and create dedicated unit tests using axios-mock-adapter.

---

## Acceptance Criteria

- [x] API function extracted to `src/features/WorkXP/api/api.ts`
- [x] Test file created at `src/features/WorkXP/api/__tests__/api.test.ts`
- [x] Tests use MockAdapter pattern
- [x] Test success scenario (200 response)
- [x] Test network error scenario
- [x] Test 404 error scenario
- [x] Test correct URL construction with locale
- [x] 100% coverage for WorkXP API functions
- [x] Redux thunk updated to use extracted API function
- [x] All tests passing

---

## Story Points & Effort

**Story Points**: N/A
**Effort Estimate**: 1h

---

## Implementation Pattern

Follow same pattern as TASK-057 (Profile API tests).

```typescript
// src/features/WorkXP/api/api.ts
export const fetchWorkXPData = async (language: string) => {
  return GithubApiClient.get<WorkXP[]>(`/${language}/workxp.json`);
};
```

---

## Definition of Ready

- [x] Task description clear
- [x] Acceptance criteria defined
- [x] TASK-057 completed (reference implementation)

---

## Definition of Done

- [x] API function extracted
- [x] Tests written and passing
- [x] 100% coverage
- [x] Redux thunk refactored
- [x] No regressions

---

**Completed**: 2025-11-15
**Last Updated**: 2025-11-15
