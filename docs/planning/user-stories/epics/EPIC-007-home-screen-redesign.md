# EPIC-007: Home Screen UI Redesign

**Epic ID**: EPIC-007
**Title**: Home Screen UI Redesign
**Status**: In Progress
**Priority**: Medium
**Created**: 2025-11-15
**Updated**: 2025-11-15
**Category**: UI/UX

---

## Epic Statement

**As a** user,
**I want** a modern, iOS-styled Home screen with clear visual hierarchy,
**So that** I can easily navigate to different sections of the app and see my profile at a glance.

---

## Business Value

A well-designed Home screen is the first thing users see when opening the app. It sets the tone for the entire user experience and makes navigation intuitive. The redesign brings the app in line with modern iOS design patterns, improving usability and visual appeal.

**Key Benefits:**

- Clear visual hierarchy with profile card at top
- Organised button groups for logical navigation
- Consistent iOS styling across both platforms
- Improved discoverability of app features
- Professional, polished appearance

---

## Success Criteria

- [ ] Home screen uses button groups for organised navigation
- [ ] Profile card displayed at top with avatar and name
- [ ] All buttons use vector icons with appropriate colours
- [ ] SF Pro Text font applied throughout
- [ ] Responsive to light/dark theme changes
- [ ] Smooth navigation to all linked screens
- [ ] All components have unit test coverage
- [ ] Matches iOS design patterns and feels native

---

## Scope

### In Scope

**Phase 1: Button Groups** ✅ Completed

- ChevronButtonGroup implementation
- Three button groups: Work & Learning, Contact, Settings
- MaterialCommunityIcons integration
- SF Pro Text fonts for both platforms
- Natural translations in 5 languages

**Phase 2: Profile Card** 🔄 Current

- ProfileCard component with avatar
- Integration with Redux profile data
- Navigation to Profile Data screen
- Unit tests and integration tests

**Phase 3: Polish** (Future)

- Animations and transitions
- Pull-to-refresh for data reload
- Loading states for profile data

### Out of Scope

- Profile Data screen redesign (separate epic)
- Settings screens redesign (separate epic)
- Backend/API changes
- New features or functionality

---

## User Stories

| Story ID                                                 | Title                       | Status      | Tasks | Effort |
| -------------------------------------------------------- | --------------------------- | ----------- | ----- | ------ |
| [US-013](../stories/US-013-profile-card-home-screen.md)  | Profile Card on Home Screen | Not Started | 0/4   | 3.5h   |
| [US-014](../stories/US-014-home-screen-button-groups.md) | Home Screen Button Groups   | Completed   | 4/4   | 4h     |

---

## Tasks Summary

### Completed Tasks (4/4)

1. ✅ Install react-native-vector-icons and configure for iOS/Android
2. ✅ Install SF Pro Text fonts for both platforms
3. ✅ Redesign HomeScreen with ChevronButtonGroup
4. ✅ Add translations for all buttons in 5 languages

### Remaining Tasks (4/4)

1. ⏳ Create ProfileCard component
2. ⏳ Integrate ProfileCard in HomeScreen
3. ⏳ Add unit tests for ProfileCard
4. ⏳ Update HomeScreen integration tests

**Total Effort**: 7.5 hours (4h completed, 3.5h remaining)

---

## Technical Approach

### Design System

**Typography:**

- SF Pro Text (all platforms)
- Font weights: Regular (400), Medium (500), Semibold (600)

**Icons:**

- MaterialCommunityIcons for all icons
- Icon background colours follow iOS palette
- Consistent sizing (20-24px)

**Layout:**

- iOS-style rounded cards with shadows
- Light mode: white backgrounds
- Dark mode: dark grey (#1C1C1E) backgrounds
- Consistent padding and spacing

**Components:**

- ChevronButtonGroup for grouped navigation
- ProfileCard for user profile display
- All components responsive to theme changes

### Integration Points

**Redux:**

- Profile data from `selectProfile` selector
- Theme from `selectTheme` selector
- Language from `selectLanguage` selector

**Navigation:**

- React Navigation for screen transitions
- Type-safe navigation params
- Proper back button behaviour

---

## Dependencies

**Completed:**

- ✅ react-native-vector-icons installed
- ✅ SF Pro Text fonts installed
- ✅ ChevronButtonGroup component
- ✅ Redux profile slice with data

**Required:**

- Profile data available in Redux store
- ProfileData screen exists for navigation
- Avatar images accessible from GitHub API

---

## Risks & Mitigation

| Risk                              | Impact | Mitigation                                      |
| --------------------------------- | ------ | ----------------------------------------------- |
| Profile data not loaded on launch | High   | Show placeholder/skeleton while loading         |
| Avatar image fails to load        | Medium | Fallback to initials in coloured circle         |
| Theme changes not reflected       | Medium | Ensure all components use theme-aware selectors |
| Font not loading properly         | Low    | Test on both platforms, verify font files       |

---

## Testing Strategy

**Unit Tests:**

- ProfileCard component renders correctly
- Props passed correctly to child components
- Navigation called with correct params
- Theme changes reflected in styles

**Integration Tests:**

- HomeScreen renders with ProfileCard
- Pressing ProfileCard navigates to ProfileData
- Data from Redux displayed correctly
- All buttons navigate to correct screens

**Visual Testing:**

- Manual testing on iOS simulator
- Manual testing on Android emulator
- Light and dark theme verification
- Different screen sizes (iPhone SE, Pro Max, tablets)

---

## Progress Tracking

**Overall Progress**: 50% (4/8 tasks completed)

**Completed (2025-11-15):**

- ✅ Button groups redesign
- ✅ Vector icons integration
- ✅ SF Pro Text fonts
- ✅ Translations for all buttons

**In Progress:**

- 🔄 ProfileCard component

**Next Up:**

- ProfileCard integration
- Unit tests
- HomeScreen integration tests

---

## Related Epics

- [EPIC-005: Multi-Language Portfolio Data Layer](./EPIC-005-multi-language-portfolio-data-layer.md) - Provides profile data
- [EPIC-001: Performance Optimization](./EPIC-001-performance-optimization.md) - Memoization patterns used

---

## Notes

**2025-11-15**: Created Epic after completing button groups redesign. Split from EPIC-005 as this is UI work, not data layer work. ProfileCard is the next component to implement.

The button groups work was done as an exploratory task and is now being formalised into this Epic structure. Going forward, all Home screen UI work will be tracked under EPIC-007.

---

**Last Updated**: 2025-11-15
