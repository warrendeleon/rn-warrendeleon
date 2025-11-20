# TASK-186: Validate All Locale Variants

**Status**: ⏳ In Progress
**Priority**: High
**Effort**: 1h
**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)

---

## Description

Final validation task to ensure all 5 locale variants (en, es, ca, pl, tl) have been updated consistently with the new data structure. This includes verifying field names, data formats, IDs, and overall structure consistency across all languages.

---

## Locales to Validate

| Code | Language | Directory                         |
| ---- | -------- | --------------------------------- |
| en   | English  | `src/test-utils/fixtures/api/en/` |
| es   | Spanish  | `src/test-utils/fixtures/api/es/` |
| ca   | Catalan  | `src/test-utils/fixtures/api/ca/` |
| pl   | Polish   | `src/test-utils/fixtures/api/pl/` |
| tl   | Tagalog  | `src/test-utils/fixtures/api/tl/` |

---

## Step-by-Step Instructions

### Step 1: Create Validation Script

Create a script to automatically validate consistency:

```javascript
// scripts/validate-fixtures.js

const fs = require('fs');
const path = require('path');

const LOCALES = ['en', 'es', 'ca', 'pl', 'tl'];
const FILES = ['profile.json', 'education.json', 'workxp.json'];
const FIXTURES_PATH = 'src/test-utils/fixtures/api';

function validateFixtures() {
  const errors = [];
  const warnings = [];

  // Load English as reference
  const enData = {};
  FILES.forEach(file => {
    enData[file] = JSON.parse(fs.readFileSync(path.join(FIXTURES_PATH, 'en', file)));
  });

  LOCALES.forEach(locale => {
    FILES.forEach(file => {
      const filePath = path.join(FIXTURES_PATH, locale, file);
      const data = JSON.parse(fs.readFileSync(filePath));

      // Check structure matches English
      if (file === 'education.json') {
        validateEducation(locale, data, enData[file], errors);
      } else if (file === 'profile.json') {
        validateProfile(locale, data, errors);
      } else if (file === 'workxp.json') {
        validateWorkExperience(locale, data, enData[file], errors);
      }
    });
  });

  return { errors, warnings };
}

function validateEducation(locale, data, enData, errors) {
  // Check same number of entries
  if (data.length !== enData.length) {
    errors.push(`${locale}/education.json: Expected ${enData.length} entries, got ${data.length}`);
  }

  data.forEach((item, i) => {
    // Check required fields
    if (!item.id) errors.push(`${locale}/education.json[${i}]: Missing id`);
    if (!item.institution) errors.push(`${locale}/education.json[${i}]: Missing institution`);
    if (!item.startDate) errors.push(`${locale}/education.json[${i}]: Missing startDate`);
    if (!item.hasOwnProperty('endDate'))
      errors.push(`${locale}/education.json[${i}]: Missing endDate`);
    if (!item.hasOwnProperty('certificateUrl'))
      errors.push(`${locale}/education.json[${i}]: Missing certificateUrl`);

    // Check ID matches English (same entry)
    if (enData[i] && item.id !== enData[i].id) {
      errors.push(`${locale}/education.json[${i}]: ID mismatch (expected ${enData[i].id})`);
    }

    // Check date format
    if (item.startDate && !/^\d{4}-\d{2}$/.test(item.startDate)) {
      errors.push(`${locale}/education.json[${i}]: Invalid startDate format: ${item.startDate}`);
    }
    if (item.endDate && !/^\d{4}-\d{2}$/.test(item.endDate)) {
      errors.push(`${locale}/education.json[${i}]: Invalid endDate format: ${item.endDate}`);
    }

    // Check for old field names
    if (item.location) errors.push(`${locale}/education.json[${i}]: Has old field 'location'`);
    if (item.start) errors.push(`${locale}/education.json[${i}]: Has old field 'start'`);
    if (item.end) errors.push(`${locale}/education.json[${i}]: Has old field 'end'`);
    if (item.certificate)
      errors.push(`${locale}/education.json[${i}]: Has old field 'certificate'`);
  });
}

function validateProfile(locale, data, errors) {
  // Check for galleryImages (not carousel)
  if (!data.galleryImages) {
    errors.push(`${locale}/profile.json: Missing galleryImages`);
  }
  if (data.carousel) {
    errors.push(`${locale}/profile.json: Has old field 'carousel'`);
  }
}

function validateWorkExperience(locale, data, enData, errors) {
  // Check same number of companies
  if (data.length !== enData.length) {
    errors.push(`${locale}/workxp.json: Expected ${enData.length} companies, got ${data.length}`);
  }

  data.forEach((company, i) => {
    // Check no clients array
    if (company.clients) {
      errors.push(`${locale}/workxp.json[${i}]: Has deprecated 'clients' array`);
    }

    // Check positions
    company.positions?.forEach((pos, j) => {
      // Check required fields
      if (!pos.startDate)
        errors.push(`${locale}/workxp.json[${i}].positions[${j}]: Missing startDate`);
      if (!pos.hasOwnProperty('endDate'))
        errors.push(`${locale}/workxp.json[${i}].positions[${j}]: Missing endDate`);
      if (!pos.hasOwnProperty('technologies'))
        errors.push(`${locale}/workxp.json[${i}].positions[${j}]: Missing technologies`);
      if (!pos.hasOwnProperty('responsibilities'))
        errors.push(`${locale}/workxp.json[${i}].positions[${j}]: Missing responsibilities`);
      if (!pos.hasOwnProperty('client'))
        errors.push(`${locale}/workxp.json[${i}].positions[${j}]: Missing client`);

      // Check for old field names
      if (pos.start)
        errors.push(`${locale}/workxp.json[${i}].positions[${j}]: Has old field 'start'`);
      if (pos.end) errors.push(`${locale}/workxp.json[${i}].positions[${j}]: Has old field 'end'`);
      if (pos.programmingLanguages)
        errors.push(
          `${locale}/workxp.json[${i}].positions[${j}]: Has old field 'programmingLanguages'`
        );
      if (pos.techStack)
        errors.push(`${locale}/workxp.json[${i}].positions[${j}]: Has old field 'techStack'`);
    });
  });
}

// Run validation
const { errors, warnings } = validateFixtures();

if (errors.length > 0) {
  console.error('\n❌ Validation errors:\n');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log('\n✅ All locale variants validated successfully!\n');
}

if (warnings.length > 0) {
  console.warn('\n⚠️ Warnings:\n');
  warnings.forEach(w => console.warn(`  - ${w}`));
}
```

### Step 2: Run Validation Script

```bash
node scripts/validate-fixtures.js
```

### Step 3: Manual Spot Checks

Even with automation, do manual checks:

#### Check 1: Date Format Consistency

```bash
# Should return empty (no old formats)
grep -r '"start":' src/test-utils/fixtures/api/
grep -r '"end":' src/test-utils/fixtures/api/
grep -r '"Present"' src/test-utils/fixtures/api/
```

#### Check 2: Field Name Consistency

```bash
# Should return empty (old names removed)
grep -r '"location":' src/test-utils/fixtures/api/*/education.json
grep -r '"carousel":' src/test-utils/fixtures/api/*/profile.json
grep -r '"clients":' src/test-utils/fixtures/api/*/workxp.json
```

#### Check 3: ID Consistency Across Locales

```bash
# Compare IDs across locales
diff <(jq '.[].id' src/test-utils/fixtures/api/en/education.json) \
     <(jq '.[].id' src/test-utils/fixtures/api/es/education.json)

# Should show no differences
```

### Step 4: Zod Validation Test

Use Zod schemas to validate all fixtures:

```typescript
// In a test file or script
import { EducationSchema, ProfileSchema, WorkExperienceSchema } from '@app/schemas';
import enProfile from '@test-utils/fixtures/api/en/profile.json';
import enEducation from '@test-utils/fixtures/api/en/education.json';
import enWorkxp from '@test-utils/fixtures/api/en/workxp.json';
// ... import other locales

describe('Fixture validation', () => {
  const locales = ['en', 'es', 'ca', 'pl', 'tl'];

  locales.forEach(locale => {
    describe(locale, () => {
      it('should have valid profile data', () => {
        expect(() => ProfileSchema.parse(/* load locale profile */)).not.toThrow();
      });

      it('should have valid education data', () => {
        expect(() => EducationSchema.parse(/* load locale education */)).not.toThrow();
      });

      it('should have valid work experience data', () => {
        expect(() => WorkExperienceSchema.parse(/* load locale workxp */)).not.toThrow();
      });
    });
  });
});
```

### Step 5: Visual Verification

Run the app with each locale and verify data displays correctly:

```bash
yarn ios
# Change language in Settings to each locale
# Check Profile, Education, WorkExperience screens
```

### Step 6: Final Full Test Suite

```bash
yarn validate  # typecheck + lint + test
yarn detox:ios:build && yarn detox:ios:test
```

---

## Validation Checklist

### For Each Locale (en, es, ca, pl, tl)

#### profile.json

- [ ] Has `galleryImages` (not `carousel`)
- [ ] All URLs are valid

#### education.json

- [ ] All entries have `id` field
- [ ] All entries have `institution` (not `location`)
- [ ] All entries have `startDate` in YYYY-MM format
- [ ] All entries have `endDate` (YYYY-MM or null)
- [ ] All entries have `certificateUrl` (URL or null)
- [ ] IDs match English locale (same education = same ID)

#### workxp.json

- [ ] No `clients` array
- [ ] All positions have `startDate` in YYYY-MM format
- [ ] All positions have `endDate` (YYYY-MM or null)
- [ ] All positions have `technologies` (object or null)
- [ ] All positions have `responsibilities` (array or null)
- [ ] All positions have `client` (object or null)
- [ ] Company IDs match English locale
- [ ] Position IDs match English locale

---

## Acceptance Criteria

- [ ] Validation script created and runs without errors
- [ ] All 5 locales pass automated validation
- [ ] No old field names remain in any file
- [ ] All date formats are ISO 8601 (YYYY-MM)
- [ ] IDs are consistent across locales
- [ ] Zod schema validation passes for all files
- [ ] App displays data correctly for all locales
- [ ] `yarn validate` passes
- [ ] E2E tests pass

---

## Implementation Notes

- **ID consistency**: The same education/company/position must have the same UUID across all locales - only the content is translated.
- **Validation script**: Consider adding this script to CI/CD to prevent future inconsistencies.
- **Translations**: Field names (`institution`, `galleryImages`, etc.) are not translated - they're technical identifiers. Only the content values are translated.

---

## Dependencies

- [TASK-173](./TASK-173-standardise-date-formats.md) to [TASK-185](./TASK-185-update-e2e-tests.md) - All previous tasks must be complete

---

## Completion

This is the final task in EPIC-020. After this task:

1. Update Epic status to ✅ Done
2. Update PROJECT_HUB.md
3. Commit all changes with appropriate gitmoji
