# TASK-115: Test selectWorkExperienceOrClientById

**Task ID**: TASK-115
**Title**: Test selectWorkExperienceOrClientById Selector
**Epic**: [EPIC-013: Production Readiness - Security & Testing](../epics/EPIC-013-production-readiness.md)
**User Story**: [US-023: Test Coverage Completion](../stories/US-023-test-coverage-completion.md)
**Status**: ✅ Done
**Priority**: 🟠 High
**Created**: 2025-01-17
**Assigned To**: Warren de Leon
**Category**: Testing

---

## Context

Complex 40-line selector handling both work experience and client lookups is completely untested. Must achieve 100% test coverage.

---

## Technical Details

### Files to Create/Modify

- `src/features/WorkExperience/store/__tests__/selectors.test.ts`

### Test Scenarios Needed

1. **Work Experience Lookup**:
   - Valid work experience ID returns correct object
   - Invalid work experience ID returns undefined
   - Empty state returns undefined

2. **Client Lookup**:
   - Valid client ID within work experience returns correct client
   - Invalid client ID returns undefined
   - Nested client lookup works correctly

3. **Edge Cases**:
   - Null/undefined state
   - Empty work experience array
   - Work experience without clients array

---

## Acceptance Criteria

- [x] 100% line coverage for selectWorkExperienceOrClientById
- [x] All edge cases tested
- [x] Both work experience and client paths covered
- [x] Error cases tested
- [x] All tests passing

---

## Story Points & Effort

**Effort Estimate**: 2 hours

---

**Last Updated**: 2025-01-17
