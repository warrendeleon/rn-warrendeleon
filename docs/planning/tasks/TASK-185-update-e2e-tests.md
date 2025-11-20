# TASK-185: Update E2E Tests for New Data Structure

**Status**: ✅ Completed
**Priority**: Medium
**Effort**: 1.5h
**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)

---

## Description

Update all Detox E2E tests and Cucumber step definitions to work with the new fixture data structure. This includes updating mock data references, expected text assertions, and any navigation tests that depend on the data structure.

---

## Test Files to Update

### Feature Files (Cucumber)

- `e2e/features/*.feature`

### Step Definitions

- `e2e/step-definitions/*.ts`

### Support Files

- `e2e/support/mocks.ts` (if exists)
- `e2e/support/fixtures.ts` (if exists)

---

## Step-by-Step Instructions

### Step 1: Update E2E Mock/Fixture Data

If E2E tests use separate fixture data, update it to match the new structure:

```typescript
// e2e/support/fixtures.ts

export const e2eEducation = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    institution: 'Udemy',
    title: 'CircleCI: The complete introduction',
    logo: 'https://raw.githubusercontent.com/.../udemy.svg',
    startDate: '2021-04',
    endDate: null,
    certificateUrl: 'https://udemy-certificate.s3.amazonaws.com/...',
  },
  // ... more entries
];

export const e2eWorkExperience = [
  {
    id: '75313d55-2ef2-4a68-b183-f4b32e88b397',
    company: 'Sky',
    logo: 'https://raw.githubusercontent.com/.../sky.svg',
    positions: [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        title: 'Software Engineering Manager',
        startDate: '2023-10',
        endDate: null, // Current position
        description: '...',
        responsibilities: ['People Leadership: ...'],
        technologies: null,
        client: null,
      },
    ],
  },
  // ... more entries
];
```

### Step 2: Update Feature File Assertions

If feature files contain specific text expectations:

**File**: `e2e/features/Education.feature`

```gherkin
# Before
Scenario: View education details
  Given I am on the education screen
  Then I should see "April 2021"

# After
Scenario: View education details
  Given I am on the education screen
  Then I should see "Apr 2021"  # Formatted from ISO
```

### Step 3: Update Step Definitions

**File**: `e2e/step-definitions/education.steps.ts`

```typescript
// Update any hardcoded expectations
Then('I should see the education institution', async () => {
  // Before: await expect(element(by.text('Location:'))).toBeVisible();
  // After:
  await expect(element(by.text('Udemy'))).toBeVisible();
});

Then('I should see the certificate link', async () => {
  // Element might have new testID if field renamed
  await expect(element(by.id('certificate-link'))).toBeVisible();
});
```

### Step 4: Update Work Experience Step Definitions

**File**: `e2e/step-definitions/workExperience.steps.ts`

```typescript
// Before - separate client navigation
When('I tap on the client {string}', async (clientName: string) => {
  await element(by.text(clientName)).tap();
});

// After - client is part of position
When('I tap on the position for client {string}', async (clientName: string) => {
  // Client positions show client name in the position item
  await element(by.text(clientName)).tap();
});

Then('I should see the technologies section', async () => {
  await expect(element(by.id('technologies-section'))).toBeVisible();
  await expect(element(by.text('TypeScript'))).toBeVisible();
});

Then('I should see the responsibilities section', async () => {
  await expect(element(by.id('responsibilities-section'))).toBeVisible();
});
```

### Step 5: Update Date Display Assertions

If tests check for displayed dates:

```typescript
// Before
Then('I should see start date {string}', async (date: string) => {
  // Expected: "April 2021"
  await expect(element(by.text(date))).toBeVisible();
});

// After - dates are formatted from ISO
Then('I should see start date {string}', async (date: string) => {
  // Expected: "Apr 2021" (formatted from "2021-04")
  await expect(element(by.text(date))).toBeVisible();
});
```

### Step 6: Update Navigation Tests

If tests navigate to specific items by ID:

```typescript
// Before - might navigate to client screen
Given('I navigate to client details', async () => {
  await element(by.id('client-item-1')).tap();
});

// After - navigate to position details
Given('I navigate to position details', async () => {
  await element(by.id('position-item-1')).tap();
});
```

### Step 7: Build and Run E2E Tests

```bash
# Rebuild the app for Detox
yarn detox:ios:build

# Run E2E tests
yarn detox:ios:test

# Run specific feature
yarn detox:ios:test e2e/features/Education.feature
```

### Step 8: Debug Failing Tests

If tests fail:

1. Check Metro logs for data loading errors
2. Take screenshots to see what's displayed
3. Verify testIDs match between code and tests
4. Ensure mock data structure is correct

---

## Files to Modify

### Feature Files

- `e2e/features/Education.feature`
- `e2e/features/WorkExperience.feature`
- `e2e/features/Profile.feature`

### Step Definitions

- `e2e/step-definitions/education.steps.ts`
- `e2e/step-definitions/workExperience.steps.ts`
- `e2e/step-definitions/profile.steps.ts`

### Support

- `e2e/support/mocks.ts`
- `e2e/support/fixtures.ts`

---

## Acceptance Criteria

- [x] E2E fixtures updated to new structure
- [x] All date assertions use formatted ISO dates
- [x] Education tests use new field names
- [x] Work experience tests handle technologies object
- [x] Client navigation tests updated
- [x] All E2E tests pass
- [x] No testID mismatches

---

## Implementation Notes

- **Date formatting**: E2E tests should expect dates formatted for display (e.g., "Apr 2021"), not raw ISO format ("2021-04").
- **TestID consistency**: If components rename testIDs (e.g., from `carousel` to `gallery`), update E2E tests accordingly.
- **Mock server**: If using a mock server for E2E tests, ensure it returns data in the new format.

---

## Dependencies

- [TASK-183](./TASK-183-update-ui-components.md) - UI must be updated first
- [TASK-184](./TASK-184-update-unit-tests.md) - Unit tests should pass first

---

## Next Steps

- [TASK-186](./TASK-186-validate-locale-variants.md) - Validate All Locale Variants
