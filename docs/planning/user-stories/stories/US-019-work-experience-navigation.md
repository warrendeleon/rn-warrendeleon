# US-019: Work Experience Navigation & Routing

**User Story ID**: US-019
**Epic**: [EPIC-010: Work Experience Display Enhancement](../epics/EPIC-010-work-experience-display.md)
**Status**: Planning
**Priority**: Medium
**Estimated Effort**: 2-3 hours
**Created**: 2025-11-15

---

## User Story

**As a** portfolio visitor
**I want** to navigate seamlessly between Work Experience, Company Details, and Client listings
**So that** I can explore work history in detail without confusion

---

## Context & Rationale

Navigation is critical for a multi-level work experience display. Users need clear pathways to:

1. View the full work experience list
2. Drill down to company-specific details
3. View client projects for multi-client positions

This user story focuses on the navigation architecture, route configuration, and screen transitions that make the work experience exploration intuitive and performant.

---

## Benefits

### User Experience

- **Clear Hierarchy**: Home → Work Experience → Company Details/Clients
- **Contextual Headers**: Screen headers show company names dynamically
- **Back Navigation**: Intuitive back button behaviour
- **Smooth Transitions**: No janky animations or delays

### Technical

- **Type Safety**: Typed navigation params prevent runtime errors
- **Maintainability**: Centralised route configuration
- **Performance**: Lazy-loaded screens, efficient transitions
- **Consistency**: Matches existing navigation patterns

---

## Acceptance Criteria

### Functional Requirements

1. **Route Configuration**
   - [ ] `WorkXPData` route added to RootStackParamList
   - [ ] `WorkXPDetails` route added for company details
   - [ ] `Clients` route added for client listings
   - [ ] All routes have typed parameters

2. **Navigation from Home**
   - [ ] Home screen "Work Experience" button navigates to WorkXPData screen
   - [ ] Navigation uses typed `navigate()` with correct route name

3. **Dynamic Screen Headers**
   - [ ] WorkXPData screen shows "Work Experience" title
   - [ ] WorkXPDetails screen shows company name in header
   - [ ] Clients screen shows company name in header
   - [ ] Headers update dynamically based on route params

4. **Navigation Logic**
   - [ ] Tapping work item without clients → navigates to WorkXPDetails with `workXPId` param
   - [ ] Tapping work item with clients → navigates to Clients with `company` and `workXPId` params
   - [ ] Back button returns to previous screen correctly

### Technical Requirements

- [ ] Routes follow naming convention: PascalCase
- [ ] Navigation params are TypeScript typed
- [ ] Uses React Navigation v7.x native-stack navigator
- [ ] Screen components are lazy-loaded for performance
- [ ] Navigation is tested in E2E scenarios

---

## Test Scenarios

### GIVEN/WHEN/THEN (for Detox E2E)

```gherkin
Feature: Work Experience Navigation

  Scenario: Navigate from Home to Work Experience
    Given I am on the Home screen
    When I tap the "Work Experience" button
    Then I should see the Work Experience screen
    And the header should say "Work Experience"

  Scenario: Navigate to company details
    Given I am on the Work Experience screen
    When I tap a work experience item without clients
    Then I should navigate to the Company Details screen
    And the header should show the company name
    And I should see company-specific information

  Scenario: Navigate to client listings
    Given I am on the Work Experience screen
    When I tap a work experience item with clients
    Then I should navigate to the Clients screen
    And the header should show the company name
    And I should see a list of clients

  Scenario: Back navigation from company details
    Given I am on the Company Details screen
    When I tap the back button
    Then I should return to the Work Experience screen

  Scenario: Back navigation from client listings
    Given I am on the Clients screen
    When I tap the back button
    Then I should return to the Work Experience screen
```

---

## Dependencies & Blockers

### Dependencies

- **US-017**: WorkXPScreen component must exist
- **React Navigation v7**: Already installed ✅
- **TypeScript**: Route types must be defined (TASK-079)

### Blockers

None. Dependencies are met or in progress.

---

## Tasks

| Task ID                                                           | Title                                    | Status   | Effort |
| ----------------------------------------------------------------- | ---------------------------------------- | -------- | ------ |
| [TASK-079](../tasks/TASK-079-work-experience-types.md)            | Define Work Experience TypeScript Types  | Planning | 0.5h   |
| [TASK-081](../tasks/TASK-081-work-experience-navigation-setup.md) | Set up Work Experience Navigation Routes | Planning | 1h     |
| [TASK-083](../tasks/TASK-083-e2e-tests-work-experience-screen.md) | E2E Tests for Work Experience Flow       | Planning | 2h     |

**Total Estimated Effort**: 3.5 hours

---

## Success Criteria

1. ✅ All navigation routes work correctly
2. ✅ TypeScript navigation params are fully typed
3. ✅ Dynamic headers display correct company names
4. ✅ Back navigation returns to correct screen
5. ✅ No navigation errors or warnings in console
6. ✅ E2E tests cover all navigation paths
7. ✅ Navigation transitions are smooth (no jank)

---

## Notes

- Follow Education screen navigation pattern (EPIC-009)
- Ensure navigation params are validated at runtime
- Consider adding navigation guards for invalid params
- May need to pass additional data (logo URL) to avoid re-fetching
