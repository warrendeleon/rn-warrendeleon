# TASK-101: Fix PDF Viewing E2E Step Definitions

**Task ID**: TASK-101
**Title**: Fix PDF viewing E2E step definition mismatches (HomeScreen vs Home screen)
**Epic**: N/A
**User Story**: N/A
**Status**: ✅ Done
**Priority**: High
**Created**: 2025-01-16
**Assigned To**: Warren de Leon
**Reviewer**: Warren de Leon
**Category**: Bug Fix - E2E Tests

---

## Context

All PDF viewing E2E scenarios are failing due to a step definition mismatch between "HomeScreen" and "Home screen".

**Current State**:

- PDF viewing feature file uses step: `I am on the HomeScreen`
- Step definition expects: `I am on the "Home" screen` (with quotes and lowercase "s")
- This mismatch causes all 4 PDF viewing scenarios to fail immediately

**Desired State**: Consistent step definitions across all E2E tests

**Failing Scenarios**:

- CV PDF Viewing: All 4 scenarios failing
  - Navigate to CV PDF from HomeScreen
  - Share CV PDF
  - Cancel PDF share
  - Navigate back from PDF viewer

**Error**: `Test Failed: No elements found for "MATCHER(text == "Home")"`

---

## Technical Details

### Files to Modify

1. **PDF Viewing Feature File** (`src/features/PDF/__tests__/PDFViewing.cucumber.tsx` or similar)
   - Update step: `I am on the HomeScreen` → `I am on the "Home" screen`
   - Ensure consistency with other E2E tests

2. **Step Definitions** (if needed)
   - Verify step definition for "I am on the [screen name]" accepts screen names with quotes
   - Ensure it matches against screen title text or testID correctly

### Step Pattern

**Before**:

```gherkin
Given I am on the HomeScreen
```

**After**:

```gherkin
Given I am on the "Home" screen
```

---

## Acceptance Criteria

- [x] PDF viewing feature file updated with correct step syntax
- [x] Step definition pattern consistent across all features
- [x] All 4 PDF viewing scenarios pass
- [x] No similar mismatches exist in other feature files
- [x] `yarn detox:ios:test` passes for PDF viewing tests

---

## Story Points & Effort

**Effort Estimate**: 0.5 hours

---

## Dependencies

**Blockers**: None

---

**Last Updated**: 2025-01-16
