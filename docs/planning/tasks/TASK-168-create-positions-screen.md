# TASK-168: Create WorkExperiencePositionsScreen

**Status**: ✅ Done
**Priority**: High
**Effort**: 2h
**Epic**: [EPIC-019](../epics/EPIC-019-work-experience-multi-position.md)

---

## Description

Create a new screen to display the list of positions at a company, following the same pattern as `WorkExperienceClientsScreen`. This screen shows when a company has multiple positions.

## Screen Behaviour

- Receives `workExperienceId` as navigation parameter
- Displays list of positions for that company
- Each item shows: position title, date range
- Sorted by date (most recent first)
- Tap navigates to `WorkExperienceDetails` with position ID

## UI Requirements

- Use `DetailListGroup` component (same as clients screen)
- Show position title as label
- Show date range as subtitle (e.g., "Oct 2023 - Dec 2025")
- Include chevron for navigation affordance
- Follow EAA accessibility requirements:
  - `accessibilityRole="button"`
  - `accessibilityLabel` with position title
  - `accessibilityHint` describing navigation action
  - Minimum touch target 44×44

## Component Structure

```typescript
const WorkExperiencePositionsScreen: React.FC = () => {
  const { workExperienceId } = useRoute<...>().params;
  const workExperience = useSelector(state =>
    selectWorkExperienceById(state, workExperienceId)
  );

  const items = useMemo(() =>
    workExperience?.positions?.map(position => ({
      id: position.id,
      label: position.title,
      subtitle: `${position.start} - ${position.end}`,
      onPress: () => navigation.navigate('WorkExperienceDetails', {
        workExperienceId: position.id
      }),
      // ... accessibility props
    })) ?? [],
    [workExperience, navigation]
  );

  return <DetailListGroup items={items} />;
};

export default React.memo(WorkExperiencePositionsScreen);
```

## Acceptance Criteria

- [ ] Create `WorkExperiencePositionsScreen.tsx` in WorkExperience feature
- [ ] Use `DetailListGroup` component for list display
- [ ] Fetch positions from Redux using appropriate selector
- [ ] Sort positions by date (most recent first)
- [ ] Navigate to details screen on item tap
- [ ] Add EAA accessibility props to all interactive elements
- [ ] Use `React.memo` for component optimisation
- [ ] Use `useMemo` for items array
- [ ] Use `useCallback` for event handlers
- [ ] Add `testID` props for E2E testing
- [ ] No TypeScript or ESLint errors

## Navigation Setup

Add route to `RootStackParamList`:

```typescript
WorkExperiencePositions: {
  workExperienceId: string;
}
```

## i18n

Add translations for screen title (e.g., "Positions at Sky") in all 5 languages.

## Files to Create

- `src/features/WorkExperience/WorkExperiencePositionsScreen.tsx`

## Files to Modify

- `src/navigation/RootNavigator/RootNavigator.tsx` (add route)
- `src/locales/en/translation.json` (add translations)
- `src/locales/es/translation.json`
- `src/locales/ca/translation.json`
- `src/locales/pl/translation.json`
- `src/locales/tl/translation.json`
