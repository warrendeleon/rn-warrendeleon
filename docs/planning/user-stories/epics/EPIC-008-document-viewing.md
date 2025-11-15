# EPIC-008: Document Viewing

**Status**: ⏳ In Progress
**Priority**: Medium
**Estimated Effort**: ~5.5 hours
**Owner**: Portfolio App Team
**Created**: 2025-11-15
**Last Updated**: 2025-11-15

---

## Overview

Enable users to view PDF documents within the app, starting with the CV/resume. This provides a professional way to showcase portfolio documents without requiring external apps or browsers.

## Business Value

**User Experience**:

- Seamless in-app document viewing
- Professional presentation of CV
- Easy sharing functionality
- No external app dependencies

**Technical Benefits**:

- Reusable PDF viewing component
- Foundation for viewing other documents (certificates, recommendations, etc.)
- Native PDF rendering with react-native-pdf

## Scope

### In Scope

- CV PDF viewer with native rendering
- Share functionality (iOS/Android native share)
- Loading and error states
- Responsive layout (phone/tablet)
- Dark mode support (PDF background)

### Out of Scope

- PDF editing or annotation
- Multiple document management
- Offline document syncing
- PDF generation from data

## User Stories

| Story ID                                     | Title         | Status         | Tasks | Priority |
| -------------------------------------------- | ------------- | -------------- | ----- | -------- |
| [US-015](../stories/US-015-cv-pdf-viewer.md) | CV PDF Viewer | ⏳ In Progress | 0/6   | Medium   |

## Success Criteria

- ✅ PDF renders correctly on iOS and Android
- ✅ Share button works with native sharing
- ✅ Loading states show during PDF download
- ✅ Error handling for network failures
- ✅ Dark mode background matches app theme
- ✅ All tests passing (unit + E2E)

## Dependencies

**Prerequisites**:

- ✅ React Navigation setup (EPIC-007)
- ✅ Theme system (EPIC-001)
- ✅ Error boundaries (EPIC-002)

**Enables**:

- Future: Portfolio document library
- Future: Certificate/recommendation viewing
- Future: Download and offline viewing

## Technical Approach

**Library**: react-native-pdf@7.0.3

- Native PDF rendering via PDFKit (iOS) and PdfRenderer (Android)
- Supports URL loading with caching
- Zero dependencies on WebView

**Architecture**:

```
src/features/PDF/
├── PDFScreen.tsx         # Main PDF viewer
├── index.ts              # Barrel export
└── __tests__/
    └── PDFScreen.rntl.tsx # Unit tests
```

**Navigation Integration**:

```typescript
// RootStackParamList
PDF: { uri: string; title?: string }
```

**Share Implementation**:

- React Navigation headerRight button
- react-native-share for native sharing
- Handles both iOS and Android share sheets

## Timeline

**Total**: ~5.5 hours

| Phase          | Duration | Tasks                                       |
| -------------- | -------- | ------------------------------------------- |
| Setup          | 0.5h     | Install dependencies, configure iOS/Android |
| Implementation | 2.5h     | PDFScreen, navigation, share button         |
| Testing        | 2.5h     | Unit tests, E2E tests, manual testing       |

## Risks & Mitigation

| Risk                    | Impact                                | Mitigation                                    |
| ----------------------- | ------------------------------------- | --------------------------------------------- |
| Large PDF files (>10MB) | Slow loading, memory issues           | Implement loading indicator, optimize caching |
| Network failures        | Poor UX if offline                    | Add error states, retry functionality         |
| Platform differences    | iOS/Android rendering inconsistencies | Test on both platforms, handle edge cases     |

## Related Documentation

- [ARCHITECTURE.md](../../../../ARCHITECTURE.md#features-structure)
- [React Native PDF Docs](https://github.com/wonday/react-native-pdf)
- [React Navigation: Header Buttons](https://reactnavigation.org/docs/header-buttons/)
