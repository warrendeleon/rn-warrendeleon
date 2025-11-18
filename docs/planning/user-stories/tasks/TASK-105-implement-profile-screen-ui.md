# TASK-105: Implement Profile Screen UI

**Epic**: [EPIC-012: Profile Screen Implementation](../epics/EPIC-012-profile-screen-implementation.md)
**User Story**: [US-021: Profile Screen UI Redesign](../stories/US-021-profile-screen-ui.md)
**Status**: ✅ Done
**Priority**: High
**Estimated Effort**: 2 hours
**Actual Effort**: 2 hours
**Created**: 2025-01-17
**Completed**: 2025-11-18

---

## Context

Create the Profile Screen component to display Warren's profile information, including name, headline, profile photo, social links, and navigation shortcuts to related sections. The screen should follow the app's design system and support dark mode with full accessibility compliance.

## Technical Details

### Component Structure

**File**: `src/features/Profile/ProfileScreen.tsx`

The ProfileScreen component should:

1. Display profile photo with fallback placeholder
2. Show name and headline
3. Display social media links (GitHub, LinkedIn, email)
4. Provide navigation shortcuts (Education, Work Experience, CV)
5. Fetch profile data from Redux state
6. Handle loading and error states gracefully
7. Support dark mode with appropriate colours
8. Include proper accessibility props for EAA compliance

### Data Structure

Profile data from Redux:

```typescript
interface Profile {
  name: string;
  headline: string;
  bio?: string;
  profilePhoto?: string;
  email: string;
  phone?: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  location?: string;
}
```

### Component Props

```typescript
interface ProfileScreenProps {
  // Component receives data from Redux via useSelector
  // No required props
}
```

### Styling Approach

Use NativeWind (Tailwind for React Native) with GlueStack UI components:

- **Container**: Full screen with safe area
- **Header**: Profile section with photo and name
- **Bio section**: Headline and optional bio text
- **Social links**: Horizontal list of tappable link icons
- **Quick links**: Grid or list of navigation shortcuts
- **Dark mode**: Use app color scheme from Redux

### Key Features

1. **Profile Photo Display**
   - Image component with fallback to placeholder
   - Circular styling with shadow effect
   - Border radius appropriate for portrait photos

2. **Social Links**
   - GitHub, LinkedIn, email as primary links
   - Tappable with appropriate URLs
   - Icons from GlueStack UI Icon Library
   - Proper touch targets (44×44 minimum)

3. **Navigation Shortcuts**
   - Visual buttons to navigate to Education, Work Experience, CV
   - Uses navigation prop from React Navigation
   - Proper routing with correct screen names

4. **Loading State**
   - Activity indicator while data loads from Redux
   - Skeleton loading effect (optional enhancement)

5. **Error State**
   - Error message display if data fetch fails
   - Retry button to attempt reload
   - Graceful fallback rendering

6. **Accessibility (EAA Compliance)**
   - All interactive elements have testID
   - Proper accessibilityRole for buttons/links
   - accessibilityLabel for images (profile photo)
   - accessibilityHint for actions
   - Minimum touch targets: 44×44 (iOS) / 48×48 (Android)
   - Proper heading hierarchy
   - Sufficient colour contrast (4.5:1 for text)

### Files to Create

- `src/features/Profile/ProfileScreen.tsx` - Main screen component
- `src/features/Profile/index.ts` - Export file

### Files to Modify

- `src/navigation/RootStack.tsx` - Add ProfileScreen route (if not already present)
- `src/types/portfolio.ts` - Ensure Profile type is properly defined

## Acceptance Criteria

- ✅ ProfileScreen component created and renders without errors
- ✅ Profile photo displays correctly with fallback placeholder
- ✅ Name and headline display prominently
- ✅ Social links are tappable and navigate to correct URLs (opens in browser/email)
- ✅ Navigation shortcuts work (Education, Work Experience, CV)
- ✅ Loading state displays while fetching data
- ✅ Error state displays with appropriate message and retry option
- ✅ Dark mode fully supported (background, text, icon colours)
- ✅ All interactive elements have proper testIDs for testing
- ✅ EAA accessibility compliance: proper labels, roles, and touch targets
- ✅ Component integrates with Redux (useSelector for profile data)
- ✅ TypeScript types are strict with no `any` types
- ✅ Component follows project's style and naming conventions
- ✅ No console warnings or errors
- ✅ Responsive on iOS and Android devices

## Test Scenarios

### Component Rendering

1. ✅ Component renders without errors
2. ✅ Profile photo displays when available
3. ✅ Placeholder displays when photo is missing
4. ✅ Name and headline display correctly
5. ✅ Social links render with proper icons

### User Interactions

6. ✅ Tapping GitHub link opens GitHub profile
7. ✅ Tapping LinkedIn link opens LinkedIn profile
8. ✅ Tapping email link opens email composer
9. ✅ Tapping Education button navigates to Education screen
10. ✅ Tapping Work Experience button navigates to Work Experience screen
11. ✅ Tapping CV button navigates to CV viewer

### State Management

12. ✅ Loads profile data from Redux state
13. ✅ Displays loading indicator during data fetch
14. ✅ Displays error state when API fails
15. ✅ Shows retry button in error state

### Styling & Theme

16. ✅ Light mode styling displays correctly
17. ✅ Dark mode styling displays correctly
18. ✅ Theme changes update profile screen colours
19. ✅ Proper spacing and alignment on all devices

### Accessibility

20. ✅ All buttons have proper accessibilityRole
21. ✅ All buttons have descriptive accessibilityLabel
22. ✅ Images have proper accessibilityLabel (profile photo)
23. ✅ Screen reader announces content in logical order
24. ✅ All touch targets meet 44×44 (iOS) / 48×48 (Android) minimum
25. ✅ Colour contrast meets 4.5:1 for text requirement

## Dependencies

**Prerequisites**:

- ✅ Profile Redux slice created (EPIC-005 - TASK-032)
- ✅ Profile API integration (EPIC-005)
- ✅ React Navigation configured
- ✅ GlueStack UI + NativeWind configured
- ✅ Redux and redux-persist configured

**Enables**:

- TASK-106: i18n translations for profile screen
- TASK-107: Unit tests for profile screen
- TASK-108: E2E tests for profile navigation

## Success Criteria

- All acceptance criteria met
- Component tested manually on iOS and Android
- No performance regressions
- Follows project's code standards and patterns
- Ready for unit and E2E testing phases

## Implementation Notes

- Use `useSelector` to access profile data from Redux
- Use `useNavigation` hook for navigation actions
- Use `useAppColorScheme` hook for dark mode colours
- Leverage GlueStack UI components for consistency
- Add proper TypeScript types for all props and state
- Include comprehensive comments for complex logic
- Test on both iOS and Android before marking complete

## Notes

- Profile data likely available from TASK-032 (Profile Redux slice)
- Reuse navigation patterns from existing screens (Education, WorkExperience)
- Follow the same accessibility patterns as Education and WorkExperience screens
- Consider performance: profile data is likely static and cached via redux-persist
- If profile photo is remote URL, ensure proper image caching
- Test with actual profile data from Redux to ensure integration works
