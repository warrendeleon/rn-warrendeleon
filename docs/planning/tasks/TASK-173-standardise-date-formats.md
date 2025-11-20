# TASK-173: Standardise Date Formats to ISO 8601

**Status**: ⏳ In Progress
**Priority**: High
**Effort**: 2h
**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)

---

## Description

Convert all date strings in fixture files from inconsistent formats (e.g., "April 2021", "Oct 2023", "2014", "Present") to ISO 8601 format (YYYY-MM). This enables proper date parsing, sorting, and comparison throughout the application.

---

## Current State

The fixture files use various inconsistent date formats:

```json
// education.json - Various formats
"start": "April 2021"
"start": "March 2021"
"start": "2014"
"end": "2016"

// workxp.json - More variations
"start": "Oct 2023"
"start": "Sept 2021"
"end": "Present"
"end": "Dec 2025"
```

---

## Target State

All dates in ISO 8601 YYYY-MM format:

```json
// education.json
"startDate": "2021-04",
"endDate": null,
"certificateUrl": "https://..."

// workxp.json
"startDate": "2023-10",
"endDate": "2025-12",
// or for current positions
"startDate": "2023-10",
"endDate": null
```

---

## Step-by-Step Instructions

### Step 1: Create Date Conversion Reference

Use this mapping for month conversions:

| Month              | ISO |
| ------------------ | --- |
| January/Jan        | 01  |
| February/Feb       | 02  |
| March/Mar          | 03  |
| April/Apr          | 04  |
| May                | 05  |
| June/Jun           | 06  |
| July/Jul           | 07  |
| August/Aug         | 08  |
| September/Sept/Sep | 09  |
| October/Oct        | 10  |
| November/Nov       | 11  |
| December/Dec       | 12  |

### Step 2: Update profile.json (All Locales)

**Fields to update**:

- `birthday`: "1990-05-11" → Keep as-is (already ISO format)

No date changes needed for profile.json.

### Step 3: Update education.json (All Locales)

**Fields to rename and convert**:

- `start` → `startDate`
- `end` → `endDate`

**Example conversions**:

```json
// Before
{
  "location": "Udemy",
  "title": "CircleCI: The complete introduction",
  "start": "April 2021",
  "certificate": "https://..."
}

// After
{
  "institution": "Udemy",
  "title": "CircleCI: The complete introduction",
  "startDate": "2021-04",
  "endDate": null,
  "certificateUrl": "https://..."
}
```

**Full education date mappings**:

| Original start | → startDate | Original end | → endDate |
| -------------- | ----------- | ------------ | --------- |
| "April 2021"   | "2021-04"   | (none)       | null      |
| "March 2021"   | "2021-03"   | (none)       | null      |
| "2014"         | "2014-01"   | "2016"       | "2016-12" |
| "2014"         | "2014-01"   | (none)       | null      |
| "2012"         | "2012-01"   | "2014"       | "2014-12" |
| "2009"         | "2009-01"   | "2011"       | "2011-12" |

**Note**: When only a year is given, use January (-01) for start dates and December (-12) for end dates.

### Step 4: Update workxp.json (All Locales)

**Fields to rename and convert in positions**:

- `start` → `startDate`
- `end` → `endDate`

**Fields to rename and convert in clients**:

- `start` → `startDate`
- `end` → `endDate`

**Example conversions**:

```json
// Before (position)
{
  "title": "Software Engineering Manager",
  "start": "Oct 2023",
  "end": "Dec 2025"
}

// After
{
  "title": "Software Engineering Manager",
  "startDate": "2023-10",
  "endDate": "2025-12"
}

// Before (ongoing position)
{
  "title": "Senior React Native Engineer",
  "start": "Jan 2023",
  "end": "Oct 2023"
}

// After
{
  "title": "Senior React Native Engineer",
  "startDate": "2023-01",
  "endDate": "2023-10"
}
```

**Handling "Present"**:

```json
// Before
"end": "Present"

// After
"endDate": null
```

### Step 5: Apply to All Locale Variants

Update all 15 fixture files across 5 locales:

- `src/test-utils/fixtures/api/en/`
- `src/test-utils/fixtures/api/es/`
- `src/test-utils/fixtures/api/ca/`
- `src/test-utils/fixtures/api/pl/`
- `src/test-utils/fixtures/api/tl/`

### Step 6: Verification

```bash
# Check for old date field names
grep -r '"start":' src/test-utils/fixtures/api/
grep -r '"end":' src/test-utils/fixtures/api/

# Should return no results - all converted to startDate/endDate

# Check for "Present" strings
grep -r '"Present"' src/test-utils/fixtures/api/

# Should return no results - all converted to null
```

---

## Files to Modify

### Education Files (5)

- `src/test-utils/fixtures/api/en/education.json`
- `src/test-utils/fixtures/api/es/education.json`
- `src/test-utils/fixtures/api/ca/education.json`
- `src/test-utils/fixtures/api/pl/education.json`
- `src/test-utils/fixtures/api/tl/education.json`

### Work Experience Files (5)

- `src/test-utils/fixtures/api/en/workxp.json`
- `src/test-utils/fixtures/api/es/workxp.json`
- `src/test-utils/fixtures/api/ca/workxp.json`
- `src/test-utils/fixtures/api/pl/workxp.json`
- `src/test-utils/fixtures/api/tl/workxp.json`

---

## Acceptance Criteria

- [ ] All `start` fields renamed to `startDate`
- [ ] All `end` fields renamed to `endDate`
- [ ] All dates in YYYY-MM format
- [ ] "Present" values converted to `null`
- [ ] Year-only dates have appropriate month (-01 for start, -12 for end)
- [ ] All 5 locale variants updated consistently
- [ ] No remaining old date format strings in fixtures

---

## Implementation Notes

- **Month resolution**: When a date like "2014" is given without a month, use "-01" (January) for start dates and "-12" (December) for end dates. This preserves chronological ordering.
- **Null for ongoing**: Use `null` rather than omitting the field to make the data structure explicit.
- **Birthday exception**: The birthday field in profile.json is already in ISO format (YYYY-MM-DD) and should remain as a full date.

---

## Dependencies

- None (first task in the epic)

---

## Next Steps

- [TASK-174](./TASK-174-add-education-uuids.md) - Add UUIDs to Education Entries
