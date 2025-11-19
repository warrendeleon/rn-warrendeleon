# TASK-172: Update E2E Tests for Work Experience Flow

**Status**: ✅ Done
**Priority**: High
**Effort**: 2h
**Epic**: [EPIC-019](../epics/EPIC-019-work-experience-multi-position.md)

---

## Description

Update Detox E2E tests to cover the new multi-position navigation flow. Add scenarios for companies with multiple positions and verify the positions list screen and navigation to position details.

## New Test Scenarios

### Feature: Work Experience Positions Flow

```gherkin
Scenario: View positions list for company with multiple positions
  Given I am on the Home screen
  When I tap on "Work Experience"
  And I tap on "Sky"
  Then I should see the positions list screen
  And I should see "Software Engineering Manager"
  And I should see "Senior React Native Engineer"

Scenario: Navigate to manager position details
  Given I am on the Sky positions list
  When I tap on "Software Engineering Manager"
  Then I should see the position details screen
  And I should see "Key Responsibilities"
  And I should not see "Tech Stack"

Scenario: Navigate to developer position details
  Given I am on the Sky positions list
  When I tap on "Senior React Native Engineer"
  Then I should see the position details screen
  And I should see "Tech Stack"
  And I should not see "Key Responsibilities"
```

## Existing Test Updates

Update existing work experience E2E tests to work with new data structure:

- Tests that navigate directly to details need updating if they reference Sky
- Badge count assertions may need updating

## Test IDs Required

Ensure these testIDs exist in components:

- `positions-list-screen`
- `position-item-{id}`
- `responsibilities-section`
- `tech-stack-section`

## Acceptance Criteria

- [ ] Add new scenarios to `WorkExperienceFlow.feature`
- [ ] Implement step definitions for new scenarios
- [ ] Update existing tests for new data structure
- [ ] All E2E tests pass with `yarn detox:ios:test`
- [ ] Tests cover happy path navigation
- [ ] Tests verify role-specific content display
- [ ] No flaky tests

## Files to Modify

- `src/features/WorkExperience/__tests__/WorkExperienceFlow.feature`
- `src/features/WorkExperience/__tests__/WorkExperienceFlow.cucumber.tsx`
- May need to update fixture data in test setup

## Related Files

- `e2e/` directory (Detox configuration)
- `src/test-utils/fixtures/api/en/workxp.json` (E2E uses these fixtures)
