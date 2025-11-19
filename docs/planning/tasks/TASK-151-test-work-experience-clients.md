# TASK-151: RNTL Tests for WorkExperienceClientsScreen

**Status**: 📋 To Do
**Priority**: High
**Effort**: 1h
**Epic**: [EPIC-017](../epics/EPIC-017-test-coverage-improvements.md)

---

## Description

Create comprehensive RNTL unit tests for `WorkExperienceClientsScreen.tsx`. This screen displays a list of clients for a specific work experience entry.

## Current State

- No RNTL tests exist
- Partially covered by E2E WorkExperienceFlow tests
- Uses `selectWorkExperienceById` selector

## Acceptance Criteria

- [ ] Test initial render with clients list
- [ ] Test navigation to WorkExperienceDetails when client tapped
- [ ] Test loading state
- [ ] Test error state
- [ ] Test empty clients list
- [ ] Test client item rendering (logo, name, period)
- [ ] Test accessibility props (EAA compliance)
- [ ] All tests pass with `yarn test`
- [ ] Coverage threshold met

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
