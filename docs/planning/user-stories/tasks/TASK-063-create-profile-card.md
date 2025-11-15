# TASK-063: Create ProfileCard Component

**Task ID**: TASK-063
**Title**: Create ProfileCard Component
**User Story**: [US-013: Profile Card on Home Screen](../stories/US-013-profile-card-home-screen.md)
**Epic**: [EPIC-007: Home Screen UI Redesign](../epics/EPIC-007-home-screen-redesign.md)
**Status**: Not Started
**Priority**: Medium
**Created**: 2025-11-15
**Effort Estimate**: 1.5 hours

---

## Description

Create a ProfileCard component that displays the user's avatar, name, and surname at the top of the Home screen. The component should follow iOS design patterns, match the styling of ChevronButtonGroup, and include a chevron icon to indicate it's tappable.

---

## Acceptance Criteria

- [ ] Component created at `src/components/ProfileCard/ProfileCard.tsx`
- [ ] Displays avatar image from profilePicture URL
- [ ] Shows full name (name + lastName) with proper spacing
- [ ] Includes subtitle text "View Profile" below name
- [ ] Right-aligned chevron icon using MaterialCommunityIcons
- [ ] Pressable with onPress handler prop
- [ ] Responsive to light/dark theme
- [ ] Uses SF Pro Text font
- [ ] Matches iOS styling (rounded corners, shadows, padding)
- [ ] TypeScript types defined for all props
- [ ] Exported from components barrel file

---

## Implementation Details

**File Structure:**

```
src/components/ProfileCard/
├── ProfileCard.tsx
└── index.ts
```

**Component Props:**

```typescript
type ProfileCardProps = {
  profilePicture: string;
  name: string;
  lastName: string;
  onPress: () => void;
};
```

**Layout:**

- Horizontal flexbox layout
- Avatar (48x48) on left with 12px right margin
- Name/subtitle in center with flex-grow
- Chevron icon (20px) on right, center-aligned

**Styling:**

- Background: white (light), #1C1C1E (dark)
- Border radius: 12px
- Padding: 12px
- Height: ~80px
- Press state: slight opacity change
- Name: SF Pro Text Semibold (17px)
- Subtitle: SF Pro Text Regular (15px), grey colour

**Icons:**

- Use MaterialCommunityIcons 'chevron-right'
- Size: 20px
- Colour: grey (#8E8E93 light, #98989D dark)

---

## Technical Approach

1. Create component file structure
2. Define TypeScript types
3. Implement component with pressable container
4. Add avatar with react-native Image component
5. Add name/subtitle layout with Text components
6. Add chevron icon
7. Apply theme-aware styling with useAppColorScheme
8. Export from barrel file

**Dependencies:**

- react-native (View, Text, Image, Pressable)
- react-native-vector-icons/MaterialCommunityIcons
- useAppColorScheme hook
- NativeWind for styling

---

## Testing Notes

Will be tested in TASK-065. Component should:

- Render avatar correctly
- Display name and lastName combined
- Show "View Profile" subtitle
- Call onPress when pressed
- Respond to theme changes

---

## Related Tasks

- [TASK-064](./TASK-064-integrate-profile-card-home.md) - Integration in HomeScreen
- [TASK-065](./TASK-065-test-profile-card.md) - Unit tests
- [TASK-066](./TASK-066-update-home-screen-tests.md) - HomeScreen integration tests

---

## Notes

Based on ViewProfileButton from old app but modernised with:

- MaterialCommunityIcons instead of FontAwesome
- NativeWind/Tailwind styling
- SF Pro Text font
- Simplified API (removed unused props)

---

**Last Updated**: 2025-11-15
