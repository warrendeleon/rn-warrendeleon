# US-021: Profile Screen UI Redesign

**Epic**: [EPIC-012: Profile Screen Implementation](../epics/EPIC-012-profile-screen-implementation.md)
**Status**: ⏳ In Progress
**Priority**: Medium
**Estimated Effort**: ~6 hours
**Actual Effort**: ~5 hours so far
**Created**: 2025-01-17
**Last Updated**: 2025-11-18

---

## User Story

> **As a** recruiter or potential employer viewing my portfolio app
> **I want** to see Warren's detailed profile information with professional branding
> **So that** I can quickly understand his background, skills, and experience at a glance

## Context & Rationale

The profile screen is a central hub that showcases Warren's professional identity within the app. It displays personal information, profile photo, headline, and quick access to key sections. This screen serves as the entry point for deeper exploration of education, work experience, and other portfolio content.

By implementing a well-designed, visually polished profile screen, we enhance the first impression and make the app feel more professional and complete.

## Benefits

### User Experience

- **Professional presentation**: Clean, modern profile display matches portfolio app quality
- **Visual hierarchy**: Important information is easy to find and read
- **Quick navigation**: Links to education, work experience, and CV from profile
- **Responsive layout**: Works well on all screen sizes and orientations
- **Dark mode support**: Consistent with app-wide theming

### Business Impact

- **First impression**: Strong visual identity helps with portfolio credibility
- **User engagement**: Profile screen encourages exploration of other sections
- **Professional brand**: Polished UI reflects attention to detail
- **Complete experience**: Fills gap in content hierarchy

### Technical

- **Reusable patterns**: Profile components can inform future feature screens
- **Design consistency**: Follows GlueStack UI + NativeWind patterns
- **Performance**: Optimised rendering and data fetching
- **Maintainability**: Clear component structure and prop interfaces

## Acceptance Criteria

### Functional

- ✅ Profile screen displays Warren's name, headline, and profile photo
- ✅ Profile photo loads and displays correctly
- ✅ Social links (GitHub, LinkedIn, etc.) are displayed and tappable
- ✅ Edit button available for future enhancement
- ✅ Section links visible (Education, Work Experience, CV, Skills)
- ✅ Profile data loads from Redux state
- ✅ Loading state displays during initial data fetch
- ✅ Error state displays if data fetch fails
- ✅ Graceful fallback for missing profile photo

### Visual

- ✅ Layout matches professional portfolio design standards
- ✅ Dark mode fully supported
- ✅ Proper spacing and alignment of all elements
- ✅ Profile photo styled with border/shadow for depth
- ✅ Social icons render clearly
- ✅ Text hierarchy visually distinct

### Performance

- ✅ Screen renders within 800ms after navigation
- ✅ No jank when scrolling through content
- ✅ Smooth transitions and animations
- ✅ Redux persist enables offline profile viewing

### Technical

- ✅ TypeScript types for profile data defined
- ✅ Profile component created with proper structure
- ✅ Props properly documented
- ✅ Accessibility labels and roles defined (EAA compliance)
- ✅ Touch targets meet minimum 44×44 (iOS) / 48×48 (Android) requirements

## Test Scenarios

### Scenario 1: View profile information

**GIVEN** I launch the app and navigate to the Profile screen
**WHEN** the profile data loads
**THEN** I should see Warren's name, headline, and profile photo
**AND** the layout should be visually polished and professional

### Scenario 2: View social links

**GIVEN** I am viewing the profile screen
**WHEN** I look at the social links section
**THEN** I should see GitHub, LinkedIn, and other social links
**AND** tapping a link should open the corresponding social profile

### Scenario 3: Navigate to related sections

**GIVEN** I am viewing the profile screen
**WHEN** I tap "View Education" or "View Work Experience"
**THEN** I should navigate to that section

### Scenario 4: Dark mode support

**GIVEN** the app is in dark mode
**WHEN** I view the profile screen
**THEN** the background should be dark
**AND** text should be light coloured
**AND** images should render properly with good contrast
**AND** the overall design should match dark mode standards

### Scenario 5: Handle missing profile photo

**GIVEN** the profile photo fails to load
**WHEN** I view the profile screen
**THEN** a placeholder image should display
**AND** the rest of the profile should render normally

## Tasks

| Task ID                                                           | Title                                   | Status       | Effort | Priority |
| ----------------------------------------------------------------- | --------------------------------------- | ------------ | ------ | -------- |
| [TASK-105](../tasks/TASK-105-implement-profile-screen-ui.md)      | Implement Profile Screen UI             | ✅ Completed | 2h     | High     |
| [TASK-106](../tasks/TASK-106-add-profile-i18n-translations.md)    | Add Profile i18n Translations (5 langs) | ✅ Completed | 1.5h   | Medium   |
| [TASK-107](../tasks/TASK-107-write-profile-screen-tests.md)       | Write Profile Screen Tests (RNTL)       | ✅ Completed | 1.5h   | High     |
| [TASK-108](../tasks/TASK-108-add-profile-e2e-navigation-tests.md) | Add Profile E2E Navigation Tests        | ✅ Completed | 1h     | Medium   |

**Total Effort**: 6 hours

## Dependencies

**Prerequisites**:

- ✅ Profile Redux slice (EPIC-005 - TASK-032)
- ✅ Profile API integration (EPIC-005)
- ✅ Navigation structure (React Navigation v7.1.19)
- ✅ GlueStack UI + NativeWind configured
- ✅ i18next configured with 5 languages

**Blocks**:

- Future: Profile editing functionality
- Future: Skills section on profile
- Future: Portfolio projects display

## Implementation Phases

### Phase 1: Component Creation (2 hours)

- Create ProfileScreen component
- Define TypeScript interfaces for profile data
- Implement profile photo display with fallback
- Add social links section
- Add navigation shortcuts to other sections
- Support dark mode theming
- Add accessibility props (EAA compliance)

### Phase 2: Internationalization (1 hour)

- Add profile-related strings to i18n locale files
- Support all 5 languages (en, es, ca, pl, tl)
- Test locale switching on profile screen

### Phase 3: Testing (2.5 hours)

- Unit tests for profile component (RNTL) - 1.5h
- E2E navigation tests (Detox/Cucumber) - 1h

## Success Criteria

- ✅ Profile screen displays Warren's information professionally
- ✅ All social links functional
- ✅ Dark mode fully supported
- ✅ Loading and error states handled gracefully
- ✅ All tests passing (unit + E2E)
- ✅ EAA accessibility compliance
- ✅ Performance meets 800ms render target
- ✅ All 5 languages supported with natural translations

## Related Documentation

- Epic: [EPIC-012: Profile Screen Implementation](../epics/EPIC-012-profile-screen-implementation.md)
- Architecture: [Feature-First Structure](../../../../ARCHITECTURE.md)
- Types: [Portfolio Types](../../../../src/types/portfolio.ts)
- Accessibility: [EAA Compliance Guide](./../../../docs/accessibility-guide.md)
