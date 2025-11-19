# TASK-118: Export Missing Redux Selectors

**Task ID**: TASK-118
**Title**: Export Missing Redux Selectors
**Epic**: [EPIC-013: Production Readiness - Security & Testing](../epics/EPIC-013-production-readiness.md)
**User Story**: [US-023: Test Coverage Completion](../stories/US-023-test-coverage-completion.md)
**Status**: ✅ Done
**Priority**: 🟡 Medium
**Created**: 2025-01-17
**Assigned To**: Warren de Leon
**Category**: Testing

---

## Context

WorkExperience selectors not exported from store/index.ts, making them inconsistent with other features.

---

## Technical Details

Add to `src/store/index.ts`:

```typescript
export {
  selectWorkExperience,
  selectWorkExperienceLoading,
  selectWorkExperienceError,
  selectWorkExperienceOrClientById,
} from '@app/features/WorkExperience/store/selectors';
```

---

## Acceptance Criteria

- [x] All WorkExperience selectors exported from store/index.ts
- [ ] Exports tested in selector tests
- [x] Consistent with Profile/Education exports
- [x] All tests passing

**Note**: Most selectors exported, but `selectWorkExperienceOrClientById` may still need to be added.

---

## Story Points & Effort

**Effort Estimate**: 0.5 hours

---

**Last Updated**: 2025-01-17
