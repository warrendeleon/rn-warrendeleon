# US-015: CV PDF Viewer

**Epic**: [EPIC-008: Document Viewing](../epics/EPIC-008-document-viewing.md)
**Status**: ✅ Completed
**Priority**: Medium
**Estimated Effort**: ~5.5 hours
**Created**: 2025-11-15
**Last Updated**: 2025-11-15
**Completed**: 2025-11-15

---

## User Story

> **As a** potential employer or recruiter viewing my portfolio app
> **I want** to view Warren's CV/resume within the app
> **So that** I can quickly review his qualifications and experience without leaving the app or opening external applications

## Context & Rationale

The HomeScreen includes a "My CV" button that currently has no functionality. Adding a native PDF viewer allows users to:

- Read the CV without app switching
- Share the CV via native share functionality
- Experience a professional, seamless portfolio presentation

This aligns with the app's goal of being a comprehensive portfolio showcase.

## Benefits

### User Experience

- **Seamless viewing**: No external apps or browser tabs required
- **Quick access**: One tap from HomeScreen to full CV
- **Easy sharing**: Native share sheet for sending CV to contacts
- **Consistent UX**: Matches app's design language and theme

### Business Impact

- **Professional presentation**: Demonstrates attention to detail
- **Improved engagement**: Users more likely to view CV if it's easy
- **Versatility**: Foundation for viewing other documents (certificates, recommendations)

### Technical

- **Reusable component**: Can display any PDF URL
- **Native performance**: Better than WebView-based solutions
- **Future-proof**: Easy to extend with annotations, downloads, etc.

## Acceptance Criteria

### Functional

- ✅ Tapping "My CV" button navigates to PDFScreen
- ✅ PDF loads from URL: `https://warrendeleon.com/wp-content/uploads/2025/06/CV_WARRENDELEON_2025.pdf`
- ✅ Share button in header right opens native share sheet
- ✅ Loading indicator shows during PDF download
- ✅ Error message displays if PDF fails to load
- ✅ Back button returns to HomeScreen

### Performance

- ✅ PDF renders within 2 seconds on good network
- ✅ Smooth scrolling and zooming
- ✅ Caching prevents re-downloading on revisit

### Technical

- ✅ PDF route added to RootStackParamList
- ✅ Type-safe navigation with URI parameter
- ✅ React Navigation header integration
- ✅ Dark mode background matches app theme

## Test Scenarios

### Scenario 1: Successfully view CV

**GIVEN** I am on the HomeScreen
**WHEN** I tap the "My CV" button
**THEN** I should navigate to the PDF viewer
**AND** see a loading indicator
**AND** the CV PDF should render fully
**AND** I should be able to scroll through pages

### Scenario 2: Share CV

**GIVEN** I am viewing the CV PDF
**WHEN** I tap the share button in the header
**THEN** the native share sheet should appear
**AND** I should be able to share via messaging, email, or other apps

### Scenario 3: Handle loading errors

**GIVEN** I am on the HomeScreen
**AND** I have no internet connection
**WHEN** I tap the "My CV" button
**THEN** I should navigate to the PDF viewer
**AND** see a loading indicator
**AND** see an error message after timeout
**AND** see a retry button

### Scenario 4: Dark mode support

**GIVEN** the app is in dark mode
**WHEN** I navigate to the PDF viewer
**THEN** the background should be dark
**AND** the PDF should render with appropriate contrast

## Tasks

| Task ID                                                   | Title                                 | Status         | Effort | Priority |
| --------------------------------------------------------- | ------------------------------------- | -------------- | ------ | -------- |
| [TASK-067](../tasks/TASK-067-install-react-native-pdf.md) | Install react-native-pdf Dependencies | ⭕ Not Started | 0.5h   | High     |
| [TASK-068](../tasks/TASK-068-create-pdf-screen.md)        | Create PDFScreen Component            | ⭕ Not Started | 1h     | High     |
| [TASK-069](../tasks/TASK-069-add-pdf-navigation-route.md) | Add PDF Route to Navigation           | ⭕ Not Started | 0.5h   | High     |
| [TASK-070](../tasks/TASK-070-add-pdf-share-button.md)     | Add Share Button to PDF Header        | ⭕ Not Started | 1h     | Medium   |
| [TASK-071](../tasks/TASK-071-unit-tests-pdf-screen.md)    | Unit Tests for PDFScreen              | ⭕ Not Started | 1h     | Medium   |
| [TASK-072](../tasks/TASK-072-e2e-tests-pdf-viewer.md)     | E2E Tests for PDF Viewer Flow         | ⭕ Not Started | 1.5h   | Medium   |

**Total Effort**: 5.5 hours

## Dependencies

**Prerequisites**:

- ✅ react-native-webview installed (for comparison testing)
- ✅ React Navigation configured
- ✅ HomeScreen button already exists

**Blocks**:

- Future: Portfolio document library feature
- Future: Offline document management

## Implementation Phases

### Phase 1: Library Setup (0.5h)

- Install react-native-pdf and react-native-blob-util
- Run pod install for iOS native dependencies
- Verify library compatibility with RN 0.82.1

### Phase 2: Core Implementation (1.5h)

- Create PDFScreen component with basic rendering
- Add PDF route to RootStackParamList
- Update HomeScreen to navigate with CV URL
- Test basic PDF viewing on iOS and Android

### Phase 3: Share Functionality (1h)

- Install react-native-share
- Add share button to navigation header
- Implement share handler
- Test on iOS and Android

### Phase 4: Polish & Error Handling (1h)

- Add loading indicator
- Add error states with retry
- Dark mode styling
- Performance optimization

### Phase 5: Testing (1.5h)

- Unit tests for component
- E2E test for navigation flow
- E2E test for share functionality
- Manual testing on devices

## Success Criteria

- ✅ CV PDF loads and displays correctly
- ✅ Share functionality works on iOS and Android
- ✅ Loading and error states implemented
- ✅ All tests passing (unit + E2E)
- ✅ Performance meets 2-second load time target
- ✅ Dark mode support verified

## Related Documentation

- Epic: [EPIC-008: Document Viewing](../epics/EPIC-008-document-viewing.md)
- Architecture: [Feature-First Structure](../../../../ARCHITECTURE.md)
- Library: [react-native-pdf Documentation](https://github.com/wonday/react-native-pdf)
