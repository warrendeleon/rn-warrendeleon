# TASK-064: Integrate ProfileCard in HomeScreen

**Task ID**: TASK-064
**Title**: Integrate ProfileCard in HomeScreen
**User Story**: [US-013: Profile Card on Home Screen](../stories/US-013-profile-card-home-screen.md)
**Epic**: [EPIC-007: Home Screen UI Redesign](../epics/EPIC-007-home-screen-redesign.md)
**Status**: Not Started
**Priority**: Medium
**Created**: 2025-11-15
**Effort Estimate**: 0.5 hours

---

## Description

Integrate the ProfileCard component at the top of the HomeScreen, above the button groups. Connect it to Redux profile data and implement navigation to the ProfileData screen.

---

## Acceptance Criteria

- [ ] ProfileCard imported in HomeScreen
- [ ] Positioned above the button groups
- [ ] Data passed from Redux selectProfile selector
- [ ] Navigation to ProfileData screen on press
- [ ] Proper spacing (16px margin bottom)
- [ ] Renders correctly in light/dark theme
- [ ] No layout shifts or flicker on load

---

## Implementation Details

**HomeScreen Changes:**

1. **Import ProfileCard**:

```typescript
import { ProfileCard } from '@app/components';
```

2. **Add Redux Selector**:

```typescript
const profile = useAppSelector(selectProfile);
```

3. **Navigation Handler**:

```typescript
const handleProfilePress = useCallback(() => {
  navigation.navigate('ProfileData');
}, [navigation]);
```

4. **Layout Position**:

```tsx
<ScrollView {...props}>
  <ProfileCard
    profilePicture={profile.profilePicture}
    name={profile.name}
    lastName={profile.lastName}
    onPress={handleProfilePress}
  />

  <View className="mt-4">
    <Text>Work & Learning</Text>
    <ChevronButtonGroup items={workLearningItems} />
  </View>
  {/* ... rest of button groups */}
</ScrollView>
```

**Spacing:**

- ProfileCard: margin-bottom 16px
- First button group: margin-top 8px for visual separation

---

## Technical Approach

1. Import ProfileCard and selectProfile
2. Get profile data from Redux
3. Create navigation handler with useCallback
4. Add ProfileCard above existing content
5. Adjust spacing for visual hierarchy
6. Verify theme switching works
7. Test navigation flow

---

## Testing Notes

Should be manually tested before TASK-066:

- ProfileCard displays correct data
- Pressing card navigates to ProfileData
- Back button returns to Home
- Theme changes reflected immediately
- No performance issues or re-renders

---

## Related Tasks

- [TASK-063](./TASK-063-create-profile-card.md) - ProfileCard component (prerequisite)
- [TASK-065](./TASK-065-test-profile-card.md) - ProfileCard unit tests
- [TASK-066](./TASK-066-update-home-screen-tests.md) - HomeScreen integration tests (depends on this)

---

## Notes

ProfileData screen already exists, so no new screen creation needed. Just wire up the navigation.

---

**Last Updated**: 2025-11-15
