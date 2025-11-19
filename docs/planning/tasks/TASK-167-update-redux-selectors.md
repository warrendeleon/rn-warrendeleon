# TASK-167: Update Redux Selectors for Multi-Position

**Status**: ⏳ In Progress
**Priority**: High
**Effort**: 1.5h
**Epic**: [EPIC-019](../epics/EPIC-019-work-experience-multi-position.md)

---

## Description

Update Redux selectors to handle the new `positions` array structure. Add new selectors for computing company date ranges, getting latest position, and finding positions by ID.

## New Selectors Required

### 1. selectWorkExperienceCompanyDates

Computes the overall date range for a company (earliest start to latest end across all positions).

### 2. selectLatestPosition

Returns the most recent position for a company (for list display).

### 3. selectPositionById

Finds a specific position by ID (for detail screen).

### 4. selectWorkExperienceOrClientOrPositionById

Extended version of existing selector to also search in positions arrays.

## Current Selector Updates

### selectWorkExperienceOrClientById

Needs updating to also search through `positions` arrays and return position data in a format suitable for the details screen.

## Acceptance Criteria

- [ ] Create `selectWorkExperienceCompanyDates` selector
- [ ] Create `selectLatestPosition` selector
- [ ] Create `selectPositionById` selector
- [ ] Update `selectWorkExperienceOrClientById` to search positions
- [ ] All selectors use `createSelector` for memoisation
- [ ] All selectors have proper TypeScript return types
- [ ] No TypeScript errors with `yarn typecheck`
- [ ] Existing selector tests still pass

## Implementation Notes

```typescript
// Example: selectLatestPosition
export const selectLatestPosition = createSelector(
  selectWorkExperience,
  (_state: RootState, companyId: string) => companyId,
  (workExperience, companyId) => {
    const company = workExperience.find(w => w.id === companyId);
    if (!company?.positions?.length) return null;

    // Sort by end date (most recent first)
    const sorted = [...company.positions].sort(
      (a, b) => new Date(b.end).getTime() - new Date(a.end).getTime()
    );
    return sorted[0];
  }
);
```

## Files to Modify

- `src/features/WorkExperience/store/selectors.ts`

## Related Files

- `src/features/WorkExperience/store/__tests__/selectors.rntl.ts` (tests need updating)
