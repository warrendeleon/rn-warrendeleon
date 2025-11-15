# TASK-072: E2E Tests for PDF Viewer Flow

**Epic**: [EPIC-008: Document Viewing](../epics/EPIC-008-document-viewing.md)
**User Story**: [US-015: CV PDF Viewer](../stories/US-015-cv-pdf-viewer.md)
**Status**: ⭕ Not Started
**Priority**: Medium
**Estimated Effort**: 1.5 hours
**Created**: 2025-11-15

---

## Context

Add end-to-end tests for the complete PDF viewing flow using Detox + Cucumber to ensure users can navigate to the CV, view it, and share it successfully.

## Technical Details

### Test File

**File**: `src/features/PDF/__tests__/PDFViewing.cucumber.tsx`

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { by, element, expect as detoxExpect } from 'detox';

Given('I am on the HomeScreen', async () => {
  await detoxExpect(element(by.text('Home'))).toBeVisible();
});

When('I tap the My CV button', async () => {
  await element(by.text('My CV')).tap();
});

Then('I should see the PDF viewer screen', async () => {
  await detoxExpect(element(by.text('CV'))).toBeVisible();
});

Then('the PDF should load successfully', async () => {
  // Wait for PDF to render (check for share button as proxy)
  await waitFor(element(by.id('pdf-share-button')))
    .toBeVisible()
    .withTimeout(5000);
});

When('I tap the share button', async () => {
  await element(by.id('pdf-share-button')).tap();
});

Then('the native share sheet should appear', async () => {
  // Platform-specific validation
  if (device.getPlatform() === 'ios') {
    await detoxExpect(element(by.label('Share'))).toBeVisible();
  } else {
    await detoxExpect(element(by.text('Share'))).toBeVisible();
  }
});

When('I cancel the share sheet', async () => {
  if (device.getPlatform() === 'ios') {
    await element(by.label('Cancel')).tap();
  } else {
    await device.pressBack();
  }
});

Then('I should return to the PDF viewer', async () => {
  await detoxExpect(element(by.text('CV'))).toBeVisible();
});
```

### Feature File

**File**: `src/features/PDF/__tests__/PDFViewing.feature`

```gherkin
Feature: CV PDF Viewing
  As a portfolio app user
  I want to view Warren's CV in the app
  So that I can review his qualifications

  Scenario: Navigate to CV PDF from HomeScreen
    Given I am on the HomeScreen
    When I tap the My CV button
    Then I should see the PDF viewer screen
    And the PDF should load successfully

  Scenario: Share CV PDF
    Given I am on the HomeScreen
    When I tap the My CV button
    And I wait for the PDF to load
    And I tap the share button
    Then the native share sheet should appear

  Scenario: Cancel PDF share
    Given I am on the HomeScreen
    When I tap the My CV button
    And I wait for the PDF to load
    And I tap the share button
    And I cancel the share sheet
    Then I should return to the PDF viewer

  Scenario: Navigate back from PDF viewer
    Given I am on the HomeScreen
    When I tap the My CV button
    And I wait for the PDF to load
    And I tap the back button
    Then I should return to the HomeScreen
```

### Files Affected

- `src/features/PDF/__tests__/PDFViewing.feature` (new)
- `src/features/PDF/__tests__/PDFViewing.cucumber.tsx` (new)
- `src/features/PDF/PDFScreen.tsx` - Add testID for share button

### Test Coverage

**Flows Tested**:

1. Navigation from HomeScreen to PDF viewer
2. PDF loading and rendering
3. Share button functionality
4. Share sheet appearance
5. Cancel share flow
6. Back navigation

## Acceptance Criteria

- ✅ Feature file created with BDD scenarios
- ✅ Step definitions implemented
- ✅ Navigation flow tested
- ✅ PDF loading tested (via proxy indicators)
- ✅ Share functionality tested
- ✅ Cancel share tested
- ✅ Back navigation tested
- ✅ Tests pass on both iOS and Android
- ✅ All tests run with `yarn detox:ios:test`

## Test Scenarios

### Scenario 1: Complete PDF viewing flow

**GIVEN** I am on the HomeScreen
**WHEN** I tap "My CV" button
**THEN** I should navigate to PDF screen
**AND** the PDF should load
**AND** I should see the CV content

### Scenario 2: Share functionality

**GIVEN** I am viewing the PDF
**WHEN** I tap the share button
**THEN** the share sheet should open
**AND** I should see sharing options

### Scenario 3: Navigation back

**GIVEN** I am viewing the PDF
**WHEN** I tap the back button
**THEN** I should return to HomeScreen

## Dependencies

**Prerequisites**:

- ✅ TASK-068: Create PDFScreen Component
- ✅ TASK-069: Add PDF Navigation Route
- ✅ TASK-070: Add Share Button

**Enables**:

- Complete test coverage for PDF feature
- Confidence in production deployment

## Success Criteria

- All E2E scenarios pass on iOS and Android
- PDF viewing flow fully validated
- Share functionality verified
- Ready for production release

## Notes

- Cannot fully test PDF rendering in Detox (native component)
- Use share button visibility as proxy for PDF load
- Platform-specific share sheet validation
- Share completion not tested (would require accepting system prompts)
- Focus on navigation and UI interactions
