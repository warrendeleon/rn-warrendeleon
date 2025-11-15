# EPIC-009: Education Display Enhancement

**Status**: ⭕ Not Started
**Priority**: Medium
**Estimated Effort**: ~7.5 hours
**Owner**: Portfolio App Team
**Created**: 2025-11-15
**Last Updated**: 2025-11-15

---

## Overview

Transform the Education screen from a basic JSON data display into a professional, visually rich presentation using SVG logos for each educational institution and course. This brings the Education section in line with the overall portfolio app design standards and provides a better user experience.

## Business Value

**User Experience**:

- Professional visual presentation of education history
- Recognisable institution/course logos improve scannability
- Consistent design language across all portfolio sections
- Easy navigation to certificates via WebView

**Technical Benefits**:

- Reusable MenuButtonGroupSvg component for displaying logo-based lists
- SVG assets for education institutions (universities, online courses)
- Foundation for similar visual displays in other features
- Improved visual hierarchy and information architecture

## Scope

### In Scope

- Replace JSON display with professional menu button list
- Add 25+ SVG logos for educational institutions and online courses
- Create/update MenuButtonGroupSvg component for logo-based button lists
- Add navigation to certificate WebView when certificates are available
- Support for both formal education (universities) and online courses (Udemy, etc.)
- Dark mode support for all UI elements
- Loading and error states

### Out of Scope

- Certificate upload or management functionality
- Education data editing or CRUD operations
- Multiple language support for institution names (use API data as-is)
- PDF certificate viewer (use WebView for now)
- Timeline or chronological visualisation

## User Stories

| Story ID                                                  | Title                           | Status         | Tasks | Priority |
| --------------------------------------------------------- | ------------------------------- | -------------- | ----- | -------- |
| [US-016](../stories/US-016-education-screen-svg-logos.md) | Education Screen with SVG Logos | ⭕ Not Started | 0/6   | Medium   |

## Success Criteria

- ✅ EducationDataScreen displays education entries with SVG logos
- ✅ MenuButtonGroupSvg component created and tested
- ✅ All 25+ SVG logo assets added to project
- ✅ Tapping entries with certificates navigates to WebView
- ✅ Loading and error states match app design standards
- ✅ Dark mode fully supported
- ✅ All tests passing (unit + E2E)

## Dependencies

**Prerequisites**:

- ✅ Education Redux slice exists (EPIC-005)
- ✅ Education API integration exists (EPIC-005)
- ✅ WebView screen exists for certificate viewing
- ✅ react-native-svg installed

**Enables**:

- Future: WorkXP screen with company logos
- Future: Skills/certifications visual display
- Future: Portfolio projects with technology logos

## Technical Approach

**SVG Logo Assets**:

Source: Old portfolio app repository

- 25+ SVG files for institutions (universities, online course providers)
- Logos include: Stucom, Teknon, Udemy, BP, Sky, Nucleus, and 19 more
- Location: `src/assets/svg/logos/education/`

**Component Architecture**:

```
src/features/Education/
├── EducationDataScreen.tsx    # Updated with MenuButtonGroupSvg
├── components/
│   └── MenuButtonGroupSvg.tsx # New reusable component
├── index.ts
└── __tests__/
    ├── EducationDataScreen.rntl.tsx
    ├── MenuButtonGroupSvg.rntl.tsx
    └── education-screen.feature  # E2E
```

**MenuButtonGroupSvg Component**:

```typescript
interface MenuButtonGroupSvgProps {
  items: Array<{
    id: string;
    label: string;
    subtitle?: string;
    logoUri: string; // SVG logo URI
    onPress?: () => void;
  }>;
  loading?: boolean;
  error?: string;
}
```

**Integration with Education Data**:

- Map `Education.logo` field to SVG logo asset
- Display `Education.title` as main label
- Display `Education.location` as subtitle
- Format date range from `start` and `end` fields
- Show certificate icon/indicator when `Education.certificate` exists
- Navigate to WebView with `certificate` URL on tap

## Timeline

**Total**: ~7.5 hours

| Phase      | Duration | Tasks                                          |
| ---------- | -------- | ---------------------------------------------- |
| Asset Prep | 0.75h    | Download and organise 25+ SVG logos            |
| Components | 2.5h     | Create MenuButtonGroupSvg, update Education UI |
| Navigation | 0.5h     | Add certificate WebView navigation             |
| Testing    | 3.75h    | Unit tests (2h), E2E tests (1.75h)             |

## Risks & Mitigation

| Risk                           | Impact                         | Mitigation                                       |
| ------------------------------ | ------------------------------ | ------------------------------------------------ |
| SVG rendering performance      | Slow rendering with many logos | Use SvgUri with caching, test on low-end devices |
| Missing logos for institutions | Inconsistent visual experience | Create fallback icon or text-based display       |
| Logo licensing issues          | Legal concerns                 | Verify fair use or replace with custom designs   |
| Certificate URLs broken        | Poor UX when tapping entries   | Add error handling, fallback to alert message    |

## Related Documentation

- [ARCHITECTURE.md](../../../../ARCHITECTURE.md#features-structure)
- [EPIC-005: Multi-Language Portfolio Data Layer](./EPIC-005-multi-language-portfolio-data-layer.md)
- [Education Types](../../../../src/types/portfolio.ts)
- [react-native-svg Documentation](https://github.com/software-mansion/react-native-svg)
