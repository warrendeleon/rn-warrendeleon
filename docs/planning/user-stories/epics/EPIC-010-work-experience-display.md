# EPIC-010: Work Experience Display Enhancement

**Epic ID**: EPIC-010
**Epic Title**: Work Experience Display Enhancement
**Status**: ⏳ In Progress
**Priority**: High
**Progress**: 6/8 tasks completed (75%)
**Created**: 2025-11-15
**Last Updated**: 2025-11-16
**Target Date**: 2025-11-20

---

## Executive Summary

Implement a comprehensive work experience display screen that showcases professional career history with company logos, position details, employment dates, and client information. This feature enhances the portfolio app by providing visitors with a detailed, visually appealing view of work experience organised by company, with drill-down navigation to see project details and client listings.

---

## Business Context

### Problem Statement

The app currently lacks a dedicated work experience screen to showcase professional history. Users navigating from the Home screen cannot view:

- Career progression across different companies
- Employment timeline and duration
- Client relationships and project work
- Company branding (logos) for visual recognition

This gap prevents the app from serving as a complete portfolio showcase, particularly for recruiters and potential clients who need to quickly assess professional background.

### Business Value

1. **Professional Credibility**: Detailed work history builds trust with recruiters and clients
2. **User Engagement**: Interactive navigation to company details and client listings keeps users exploring
3. **Portfolio Completeness**: Fills critical gap in profile presentation
4. **Brand Association**: Company logos provide immediate visual recognition and credibility

### Success Metrics

- Work experience screen loads data in < 1s
- All company logos render correctly (100% success rate)
- Navigation to company details/clients works reliably
- User engagement: 80%+ of visitors view work experience
- Zero accessibility violations (WCAG 2.1 Level AA)

---

## Scope

### In Scope

1. **Work Experience List Screen**
   - Display all work experiences in reverse chronological order
   - Show company logo (SVG), position title, employment dates
   - Client count badge for multi-client positions
   - Loading and error states
   - Dark mode support

2. **Redux State Management**
   - Work experience slice with actions, reducers, selectors
   - API integration to fetch work experience data
   - Error handling and loading states
   - Memoized selectors for performance

3. **Navigation**
   - Route configuration for work experience screens
   - Navigation from Home screen
   - Drill-down to company details or client listings
   - Dynamic screen headers showing company names

4. **Testing**
   - Unit tests for Redux logic (100% coverage)
   - Component tests for WorkXPScreen
   - E2E tests for navigation flows
   - Accessibility tests

### Out of Scope

- Work experience CRUD operations (create/edit/delete)
- Timeline visualisation
- Search/filter functionality
- Export to PDF/resume format
- Recommendations or endorsements
- Skills tagging

### Dependencies

- ✅ **EPIC-005**: Multi-language portfolio data layer (API must return work experience data)
- ✅ **EPIC-009**: Education Display Enhancement (reuse MenuButtonGroupSvg component)
- ✅ **EPIC-007**: Home Screen Redesign (navigation from Work Experience button)

---

## User Stories

| ID                                                            | Title                                     | Status         | Tasks | Priority |
| ------------------------------------------------------------- | ----------------------------------------- | -------------- | ----- | -------- |
| [US-017](../stories/US-017-work-experience-screen-display.md) | Work Experience Screen with Company Logos | ⏳ In Progress | 2/5   | High     |
| [US-018](../stories/US-018-work-experience-redux-state.md)    | Work Experience Redux State Management    | ✅ Completed   | 4/4   | High     |
| [US-019](../stories/US-019-work-experience-navigation.md)     | Work Experience Navigation & Routing      | ⭕ Not Started | 0/3   | Medium   |

---

## Technical Approach

### Architecture Pattern

Follow **feature-first architecture**:

```
src/features/WorkExperience/
├── WorkXPScreen.tsx          # Main screen component
├── __tests__/
│   └── WorkXPScreen.rntl.tsx
├── api/
│   ├── api.ts                # API client for work experience
│   └── __tests__/
│       └── api.test.ts
└── store/
    ├── index.ts
    ├── actions.ts            # Async thunks
    ├── reducer.ts            # Redux slice
    ├── selectors.ts          # Memoized selectors
    └── __tests__/
        ├── actions.test.ts
        ├── reducer.test.ts
        └── selectors.test.ts
```

### Component Reuse

Reuse **MenuButtonGroupSvg** from EPIC-009:

- Same SVG logo rendering
- Same loading/error states
- Same dark mode support
- Customise: badge counts for client numbers

### Data Flow

1. User navigates to Work Experience screen
2. `WorkXPScreen` dispatches `fetchWorkExperience()` thunk
3. API fetches data from backend
4. Redux stores data, updates loading state
5. Selectors provide memoized data to component
6. MenuButtonGroupSvg renders list with logos
7. User taps item → navigate to details/clients

---

## Risks & Mitigation

| Risk                                       | Impact | Probability | Mitigation                                         |
| ------------------------------------------ | ------ | ----------- | -------------------------------------------------- |
| API returns malformed work experience data | High   | Low         | Validate with Zod schema, handle errors gracefully |
| Company logos fail to load (404/CORS)      | Medium | Medium      | Show fallback icon, log errors to monitoring       |
| Large dataset causes performance issues    | Medium | Low         | Implement pagination, virtualisation if needed     |
| Client count badge UX unclear              | Low    | Medium      | Add accessibility label, tooltip                   |

---

## Timeline & Effort

**Total Estimated Effort**: ~12-14 hours

### Phase 1: Redux & API Layer (4-5 hours)

- Work experience Redux slice
- API integration
- Unit tests for state management

### Phase 2: UI Implementation (5-6 hours)

- WorkXPScreen component
- MenuButtonGroupSvg integration
- Dark mode support
- Component tests

### Phase 3: Navigation & E2E (3 hours)

- Navigation setup
- Dynamic headers
- E2E test scenarios

---

## Acceptance Criteria

### Must Have

- ✅ Work experience screen displays all positions in reverse chronological order
- ✅ Each item shows company logo, position title, employment dates
- ✅ Client count badge displays for multi-client positions
- ✅ Tapping item navigates to appropriate screen (details or clients)
- ✅ Loading state shows while fetching data
- ✅ Error state handles API failures gracefully
- ✅ Dark mode fully supported
- ✅ All text is internationalised (i18next)
- ✅ Zero accessibility violations (WCAG 2.1 AA)
- ✅ 100% test coverage on business logic

### Should Have

- ✅ Company logos render from remote SVG URLs
- ✅ Dynamic screen header shows company name
- ✅ Smooth navigation transitions
- ✅ Memoized selectors prevent re-renders

### Could Have

- Empty state message when no work experience
- Pull-to-refresh functionality
- Skeleton loading animation

---

## Related Documentation

- [EPIC-009: Education Display Enhancement](./EPIC-009-education-display-enhancement.md) (similar pattern)
- [EPIC-005: Multi-language Portfolio Data Layer](./EPIC-005-multi-language-portfolio-data-layer.md) (API dependency)
- [EPIC-007: Home Screen Redesign](./EPIC-007-home-screen-redesign.md) (navigation entry point)
- [MenuButtonGroupSvg Component](../../src/components/MenuButtonGroupSvg/MenuButtonGroupSvg.tsx)
- [Architecture Documentation](../../ARCHITECTURE.md)

---

## Notes

- Follow same pattern as Education screen implementation (EPIC-009)
- Reuse MenuButtonGroupSvg component to maintain UI consistency
- Work experience data structure should match Education pattern where applicable
- Consider adding timeline visualisation in future iteration
