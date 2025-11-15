# US-017: Work Experience Screen with Company Logos

**User Story ID**: US-017
**Epic**: [EPIC-010: Work Experience Display Enhancement](../epics/EPIC-010-work-experience-display.md)
**Status**: Planning
**Priority**: High
**Estimated Effort**: 5-6 hours
**Created**: 2025-11-15

---

## User Story

**As a** portfolio visitor (recruiter, potential client, or colleague)
**I want** to view a comprehensive list of work experience with company logos and employment details
**So that** I can quickly assess professional background, career progression, and company associations

---

## Context & Rationale

The Work Experience screen is a critical component of the portfolio app, providing visitors with immediate visual recognition of career history through company branding. This screen serves as the primary entry point for exploring detailed work history, including specific projects and client relationships.

Similar to the Education screen (US-016), this feature leverages SVG logos for crisp rendering on any device and provides intuitive navigation to drill down into company-specific details or client listings.

---

## Benefits

### User Experience

- **Visual Recognition**: Company logos provide instant brand recognition
- **Career Timeline**: Reverse chronological order shows progression clearly
- **Quick Scanning**: Logo + title + dates format enables rapid assessment
- **Intuitive Navigation**: Tap to view company details or client projects

### Business Impact

- **Professional Credibility**: Detailed work history builds trust
- **Engagement**: Interactive elements encourage exploration
- **Completeness**: Fills critical gap in portfolio presentation
- **Brand Association**: Associates profile with recognisable company brands

### Technical

- **Reusability**: Leverages MenuButtonGroupSvg from Education screen
- **Performance**: Memoized selectors prevent unnecessary re-renders
- **Consistency**: Matches Education screen UX patterns
- **Accessibility**: WCAG 2.1 AA compliance with proper labels

---

## Acceptance Criteria

### Functional Requirements

1. **Display Work Experience List**
   - [ ] Shows all work experiences in reverse chronological order (newest first)
   - [ ] Each item displays: company logo (SVG), position title, employment dates
   - [ ] Client count badge appears for positions with multiple clients
   - [ ] Loading indicator shows while fetching data
   - [ ] Error message displays if API call fails
   - [ ] Empty state message if no work experience data

2. **Visual Design**
   - [ ] Company logos render at consistent size (50x50px)
   - [ ] Logo backgrounds adapt to colour scheme (light grey in light mode, white in dark mode)
   - [ ] Dividers align with text (not logo edge)
   - [ ] iOS-style grouped list appearance with rounded corners
   - [ ] Client count badge visually distinct (number in circle)

3. **Interactions**
   - [ ] Tapping item with no clients → navigates to company details screen
   - [ ] Tapping item with clients → navigates to client listing screen
   - [ ] Proper touch feedback (opacity change on press)
   - [ ] Smooth navigation transitions

4. **Internationalisation**
   - [ ] All static text uses i18next translation keys
   - [ ] Employment dates format according to locale
   - [ ] Supports all app languages (EN, ES, CA, PL, TL)

5. **Accessibility**
   - [ ] Screen reader announces "Work Experience" heading
   - [ ] Each item has descriptive accessibility label: "{position} at {company}, {startDate} to {endDate}"
   - [ ] Client count badge has accessibility hint: "Tap to view {count} clients"
   - [ ] Focus order is logical (top to bottom)
   - [ ] Minimum touch target size: 44x44pt

### Performance Requirements

- [ ] Screen renders within 100ms after navigation
- [ ] Logo SVGs load within 500ms each
- [ ] No janky scrolling (60 FPS maintained)
- [ ] Memory usage < 50MB for typical dataset (10-15 positions)

### Technical Requirements

- [ ] Component follows feature-first architecture: `src/features/WorkExperience/WorkXPScreen.tsx`
- [ ] Uses MenuButtonGroupSvg component for rendering
- [ ] Integrates with work experience Redux slice (US-018)
- [ ] Dark mode fully supported
- [ ] TypeScript strict mode compliance
- [ ] Component is memoized with React.memo

---

## Test Scenarios

### GIVEN/WHEN/THEN (for Detox E2E)

```gherkin
Feature: Work Experience Screen Display

  Scenario: View work experience list
    Given I am on the Home screen
    When I tap the "Work Experience" button
    Then I should see the Work Experience screen
    And I should see a list of work experiences
    And each item should display a company logo, position title, and dates
    And the list should be ordered by start date (newest first)

  Scenario: Navigate to company details
    Given I am on the Work Experience screen
    And I see a work experience item without client count badge
    When I tap the work experience item
    Then I should navigate to the Company Details screen
    And the screen header should show the company name

  Scenario: Navigate to client listings
    Given I am on the Work Experience screen
    And I see a work experience item with "3 clients" badge
    When I tap the work experience item
    Then I should navigate to the Clients screen
    And the screen header should show the company name
    And I should see a list of 3 clients

  Scenario: Handle loading state
    Given the API is slow to respond
    When I navigate to the Work Experience screen
    Then I should see a loading indicator
    And the loading indicator should disappear when data loads

  Scenario: Handle error state
    Given the API returns an error
    When I navigate to the Work Experience screen
    Then I should see an error message
    And the error message should be user-friendly

  Scenario: Dark mode support
    Given dark mode is enabled
    When I view the Work Experience screen
    Then logo backgrounds should be white
    And dividers should use dark mode colour (#3A3A3C)
    And text should be light coloured
```

---

## Dependencies & Blockers

### Dependencies

- **US-018**: Work Experience Redux State Management (must complete first)
- **TASK-074**: MenuButtonGroupSvg component (already complete ✅)
- **EPIC-005**: API must return work experience data with logo URLs
- **Home Screen**: Navigation button must route to Work Experience screen

### Blockers

None identified. All prerequisites are met or in progress.

---

## Tasks

| Task ID                                                            | Title                                    | Status   | Effort |
| ------------------------------------------------------------------ | ---------------------------------------- | -------- | ------ |
| [TASK-079](../tasks/TASK-079-work-experience-types.md)             | Define Work Experience TypeScript Types  | Planning | 0.5h   |
| [TASK-080](../tasks/TASK-080-create-work-experience-screen.md)     | Create WorkXPScreen Component            | Planning | 2h     |
| [TASK-081](../tasks/TASK-081-work-experience-navigation-setup.md)  | Set up Work Experience Navigation Routes | Planning | 1h     |
| [TASK-082](../tasks/TASK-082-unit-tests-work-experience-screen.md) | Unit Tests for WorkXPScreen              | Planning | 2h     |
| [TASK-083](../tasks/TASK-083-e2e-tests-work-experience-screen.md)  | E2E Tests for Work Experience Flow       | Planning | 2h     |

**Total Estimated Effort**: 7.5 hours

---

## Success Criteria

1. ✅ Work experience screen matches Education screen UX quality
2. ✅ All company logos render correctly without errors
3. ✅ Navigation flows work smoothly (details or clients)
4. ✅ Loading and error states handled gracefully
5. ✅ Dark mode looks professional and consistent
6. ✅ Passes all accessibility audits (WCAG 2.1 AA)
7. ✅ E2E tests cover all navigation scenarios
8. ✅ Zero TypeScript errors, zero lint warnings

---

## Notes

- Follow EPIC-009 Education screen implementation as reference
- Reuse MenuButtonGroupSvg component with client count badge customisation
- Ensure client count badge is visually distinct but not distracting
- Consider adding empty state illustration in future iteration
- Timeline visualisation could be added as future enhancement
