# TASK-151: RNTL Tests for WorkExperienceClientsScreen

**Status**: ✅ Done
**Priority**: High
**Effort**: 1h
**Epic**: [EPIC-017](../epics/EPIC-017-test-coverage-improvements.md)

---

## Description

Create full RNTL unit tests for `WorkExperienceClientsScreen.tsx`. This screen displays a list of clients for a specific work experience entry.

## Current State

- No RNTL tests exist
- Partially covered by E2E WorkExperienceFlow tests
- Uses `selectWorkExperienceById` selector

## Acceptance Criteria

- [x] Test initial render with clients list
- [x] Test navigation to WorkExperienceDetails when client tapped
- [x] Test loading state
- [x] Test error state
- [x] Test empty clients list
- [x] Test client item rendering (logo, name, period)
- [x] Test accessibility props (EAA compliance)
- [x] All tests pass with `yarn test`
- [x] Coverage threshold met

## Implementation Notes

```typescript
// Key areas to test:
- Client list rendering with FlatList
- Navigation to details screen
- Selector: selectWorkExperienceById(state, workExperienceId)
- Route params handling
- Dark/light theme support
```

## Test File Location

`src/features/WorkExperience/__tests__/WorkExperienceClientsScreen.rntl.tsx`

## Related Files

- `src/features/WorkExperience/WorkExperienceClientsScreen.tsx`
- `src/features/WorkExperience/store/selectors.ts`
