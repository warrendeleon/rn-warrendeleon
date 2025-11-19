# TASK-169: Update List Screen Navigation Logic

**Status**: 📋 To Do
**Priority**: High
**Effort**: 1h
**Epic**: [EPIC-019](../epics/EPIC-019-work-experience-multi-position.md)

---

## Description

Update `WorkExperienceScreen` to handle the new positions array and navigate appropriately based on whether a company has clients, multiple positions, or a single position.

## Navigation Logic

```typescript
const handlePress = (item: WorkExperience) => {
  if (item.clients?.length) {
    // Has clients → show clients list
    navigation.navigate('WorkExperienceClients', { workExperienceId: item.id });
  } else if (item.positions?.length > 1) {
    // Multiple positions → show positions list
    navigation.navigate('WorkExperiencePositions', { workExperienceId: item.id });
  } else {
    // Single position → show details directly
    navigation.navigate('WorkExperienceDetails', {
      workExperienceId: item.positions[0].id,
    });
  }
};
```

## List Item Display Updates

For each work experience item in the list:

- **Label**: Company name
- **Subtitle**: Latest position title + company date range
- **Badge**: Position count if > 1, OR client count if has clients

```typescript
const getListItem = (workExperience: WorkExperience) => {
  const latestPosition = getLatestPosition(workExperience.positions);
  const dateRange = getCompanyDateRange(workExperience.positions);

  return {
    id: workExperience.id,
    label: workExperience.company,
    subtitle: `${latestPosition.title} (${dateRange})`,
    logoUri: workExperience.logo,
    badge: workExperience.clients?.length
      ? String(workExperience.clients.length)
      : workExperience.positions.length > 1
        ? String(workExperience.positions.length)
        : undefined,
    // ... rest of props
  };
};
```

## Helper Functions

### getLatestPosition

Returns the most recent position (by end date).

### getCompanyDateRange

Returns formatted date range: `${earliestStart} - ${latestEnd}`

## Acceptance Criteria

- [ ] Update navigation logic to handle three scenarios (clients, positions, single)
- [ ] Display latest position title in subtitle
- [ ] Display company date range (full tenure)
- [ ] Show badge for position count when > 1
- [ ] Show badge for client count (existing behaviour)
- [ ] Use `useCallback` for navigation handlers
- [ ] Use `useMemo` for computed list items
- [ ] Maintain EAA accessibility compliance
- [ ] No TypeScript or ESLint errors
- [ ] Existing E2E tests don't break (may need updates)

## Files to Modify

- `src/features/WorkExperience/WorkExperienceScreen.tsx`

## Related Files

- `src/features/WorkExperience/store/selectors.ts` (helper functions may go here)
