# TASK-100: Fix E2E Tests for Renamed Home Screen Buttons

**Task ID**: TASK-100
**Title**: Fix E2E tests for renamed Home screen buttons (profile-data, workxp-data, education-data)
**Epic**: N/A
**User Story**: N/A
**Status**: To Do
**Priority**: High
**Created**: 2025-01-16
**Assigned To**: Warren de Leon
**Reviewer**: Warren de Leon
**Category**: Bug Fix - E2E Tests

---

## Context

Multiple E2E test scenarios are failing because they reference old button testIDs that no longer exist on the Home screen.

**Current State**:

- E2E tests look for buttons with testIDs: `home-profile-data`, `home-workxp-data`, `home-education-data`
- These buttons do not exist in the current Home screen implementation
- Actual Home screen has different button testIDs: `home-work-experience-button`, `home-education-button`, `home-cv-button`, etc.

**Desired State**: E2E tests updated to use correct testIDs from current Home screen implementation

**Failing Scenarios**:

- Data Loading & Persistence: All 5 scenarios failing (Profile data, Work experience data, Education data, All three sources, Data persists)
- Language Switching: All 6 scenarios failing (Switch to Spanish/Catalan/Polish/Tagalog/English, Language persists)
- Home Screen: 1 scenario failing (Navigate to Settings)

**Error**: `function timed out, ensure the promise resolves within 5000 milliseconds`

---

## Technical Details

### Files to Modify

1. **E2E Feature Files** - Update step references to use correct button testIDs
   - Check all `*.feature` or `*.cucumber.tsx` files
   - Replace references to `home-profile-data`, `home-workxp-data`, `home-education-data`

2. **E2E Step Definitions** - Update Detox element selectors
   - Check step definition files for button tap steps
   - Update testIDs to match current Home screen implementation

### Current Home Screen testIDs

From `src/features/Home/HomeScreen.tsx`:

- `home-work-experience-button` (for Work Experience)
- `home-education-button` (for Education)
- `home-cv-button` (for CV/PDF)
- `home-videos-button` (for Videos)
- `home-contact-button` (for Contact)
- `home-book-meeting-button` (for Book Meeting)
- `home-github-button` (for GitHub)
- `home-settings-button` (for Settings)

**Note**: There are NO buttons for "profile-data", "workxp-data", or "education-data" - these may need to be removed or remap to existing buttons.

---

## Acceptance Criteria

- [ ] All E2E feature files updated with correct button testIDs
- [ ] All E2E step definitions updated with correct Detox selectors
- [ ] E2E tests referencing old buttons either:
  - Updated to use equivalent existing buttons, OR
  - Removed if functionality no longer exists
- [ ] All affected E2E scenarios pass
- [ ] `yarn detox:ios:test` passes with 0 failures for updated tests

---

## Story Points & Effort

**Effort Estimate**: 2 hours

---

## Dependencies

**Blockers**: None

---

**Last Updated**: 2025-01-16
