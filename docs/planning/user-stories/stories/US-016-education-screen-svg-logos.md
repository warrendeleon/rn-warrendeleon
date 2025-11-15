# US-016: Education Screen with SVG Logos

**Epic**: [EPIC-009: Education Display Enhancement](../epics/EPIC-009-education-display-enhancement.md)
**Status**: ⏳ In Progress (5/6 tasks complete - 83%)
**Priority**: Medium
**Estimated Effort**: ~7.5 hours
**Created**: 2025-11-15
**Last Updated**: 2025-11-15

---

## User Story

> **As a** potential employer or recruiter viewing my portfolio app
> **I want** to see Warren's education history with recognisable logos from universities and online courses
> **So that** I can quickly scan his qualifications and access certificates without reading raw JSON data

## Context & Rationale

The current EducationDataScreen displays raw JSON data, which is not user-friendly and doesn't match the professional design standards of the rest of the app. By adding SVG logos for each educational institution and online course provider, we create a visually rich, scannable list that better showcases education credentials.

This implementation mirrors the old portfolio app's education screen design while using the new app's architecture and design system.

## Benefits

### User Experience

- **Visual recognition**: Institution logos provide instant recognition
- **Professional presentation**: Matches high-quality portfolio standards
- **Easy scanning**: Visual hierarchy makes it simple to review qualifications
- **Certificate access**: One-tap navigation to view certificates
- **Consistent design**: Matches home screen button groups and other UI elements

### Business Impact

- **Improved engagement**: Users more likely to explore education section
- **Professional credibility**: Visual polish demonstrates attention to detail
- **Portfolio completeness**: Showcases both formal education and continuous learning
- **Better storytelling**: Logos add context and credibility to each entry

### Technical

- **Reusable component**: MenuButtonGroupSvg can be used for WorkXP, skills, etc.
- **Scalable assets**: SVG logos render perfectly at any size
- **Performance**: Optimised rendering with react-native-svg
- **Maintainable**: Clear separation of data, presentation, and navigation logic

## Acceptance Criteria

### Functional

- ✅ Education screen displays list of education entries with logos
- ✅ Each entry shows institution logo, title, location, and date range
- ✅ Tapping entry with certificate navigates to WebView
- ✅ Loading state shows during data fetch
- ✅ Error state displays if data fetch fails
- ✅ Empty state displays if no education data available
- ✅ Back button returns to home screen

### Visual

- ✅ SVG logos render clearly at correct size
- ✅ Dark mode fully supported (logos, text, backgrounds)
- ✅ Layout matches home screen button group design
- ✅ Proper spacing and alignment for all elements
- ✅ Certificate indicator visible when certificate exists

### Performance

- ✅ Screen renders within 1 second after navigation
- ✅ Smooth scrolling with multiple entries
- ✅ No jank or lag when displaying SVG logos
- ✅ Data cached after initial load (Redux persist)

### Technical

- ✅ MenuButtonGroupSvg component created and tested
- ✅ All 25+ SVG logo assets added to project
- ✅ Type-safe props and navigation
- ✅ Proper error boundaries and fallbacks
- ✅ Accessibility labels and roles defined

## Test Scenarios

### Scenario 1: View education list

**GIVEN** I am on the home screen
**WHEN** I tap the "Studies" button
**THEN** I should navigate to the Education screen
**AND** see a loading indicator briefly
**AND** see a list of education entries
**AND** each entry should have an institution logo, title, location, and dates
**AND** the layout should match the app's design system

### Scenario 2: View certificate

**GIVEN** I am on the Education screen
**AND** an education entry has a certificate
**WHEN** I tap that entry
**THEN** I should navigate to a WebView
**AND** the certificate should load and display

### Scenario 3: Handle missing certificates

**GIVEN** I am on the Education screen
**AND** an education entry has no certificate
**WHEN** I tap that entry
**THEN** nothing should happen (or show an informational message)

### Scenario 4: Dark mode support

**GIVEN** the app is in dark mode
**WHEN** I navigate to the Education screen
**THEN** the background should be dark
**AND** text should be light coloured
**AND** logos should render properly against dark background
**AND** the overall design should match dark mode standards

### Scenario 5: Error handling

**GIVEN** I am on the home screen
**AND** the education API fails
**WHEN** I navigate to the Education screen
**THEN** I should see an error message
**AND** the error should be user-friendly
**AND** there should be a retry option

## Tasks

| Task ID                                                       | Title                               | Status         | Effort | Priority |
| ------------------------------------------------------------- | ----------------------------------- | -------------- | ------ | -------- |
| [TASK-073](../tasks/TASK-073-download-svg-logo-assets.md)     | Download and Add SVG Logo Assets    | ⭕ Not Started | 0.75h  | High     |
| [TASK-074](../tasks/TASK-074-create-menu-button-group-svg.md) | Create MenuButtonGroupSvg Component | ⭕ Not Started | 1.5h   | High     |
| [TASK-075](../tasks/TASK-075-update-education-data-screen.md) | Update EducationDataScreen UI       | ⭕ Not Started | 1.25h  | High     |
| [TASK-076](../tasks/TASK-076-add-certificate-navigation.md)   | Add Certificate WebView Navigation  | ⭕ Not Started | 0.5h   | Medium   |
| [TASK-077](../tasks/TASK-077-unit-tests-education-screen.md)  | Unit Tests for Education Screen     | ⭕ Not Started | 2h     | Medium   |
| [TASK-078](../tasks/TASK-078-e2e-tests-education-screen.md)   | E2E Tests for Education Screen Flow | ⭕ Not Started | 1.5h   | Medium   |

**Total Effort**: 7.5 hours

## Dependencies

**Prerequisites**:

- ✅ Education Redux slice (EPIC-005)
- ✅ Education API integration (EPIC-005)
- ✅ WebView screen for certificates
- ✅ react-native-svg installed

**Blocks**:

- Future: WorkXP screen with company logos
- Future: Skills display with technology logos

## Implementation Phases

### Phase 1: Asset Preparation (0.75h)

- Download 25+ SVG logo files from old repository
- Organise logos in `src/assets/svg/logos/education/`
- Verify SVG files are valid and optimised
- Create index file for easy imports

### Phase 2: Component Creation (1.5h)

- Create MenuButtonGroupSvg component
- Define TypeScript interfaces for props
- Implement SVG logo rendering with SvgUri
- Add loading and error states
- Support dark mode theming
- Add accessibility labels

### Phase 3: Education Screen Update (1.75h)

- Update EducationDataScreen to use MenuButtonGroupSvg
- Map education data to component props
- Implement certificate navigation handler
- Add empty state when no data
- Test on iOS and Android

### Phase 4: Testing (3.5h)

- Unit tests for MenuButtonGroupSvg component
- Unit tests for EducationDataScreen
- Integration tests for data mapping
- E2E test for navigation flow
- E2E test for certificate viewing
- Manual testing on devices

## Success Criteria

- ✅ Education screen displays professional logo-based list
- ✅ All institution logos render correctly
- ✅ Certificate navigation works on iOS and Android
- ✅ Loading, error, and empty states implemented
- ✅ All tests passing (unit + E2E)
- ✅ Dark mode fully supported
- ✅ Performance meets 1-second render target

## Related Documentation

- Epic: [EPIC-009: Education Display Enhancement](../epics/EPIC-009-education-display-enhancement.md)
- Architecture: [Feature-First Structure](../../../../ARCHITECTURE.md)
- Old Implementation: [Education.tsx Reference](https://github.com/warrendeleon/rn-warrendeleon/blob/fbea2378ec61d843568a2ae5531cc61dcd221993/src/screens/education/Education.tsx)
- Types: [Portfolio Types](../../../../src/types/portfolio.ts)
