# TASK-174: Add UUIDs to Education Entries

**Status**: ✅ Completed
**Priority**: High
**Effort**: 1h
**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)

---

## Description

Add unique UUID identifiers to all education entries across all locale variants. This enables direct referencing of specific education items, consistent with the pattern already used in work experience entries.

---

## Current State

Education entries lack unique identifiers:

```json
[
  {
    "location": "Udemy",
    "title": "CircleCI: The complete introduction",
    "logo": "https://...",
    "start": "April 2021",
    "certificate": "https://..."
  },
  {
    "location": "Stucom Centre d'Estudis",
    "title": "Multiplatform Applications Development",
    "logo": "https://...",
    "start": "2014",
    "end": "2016"
  }
]
```

---

## Target State

Each education entry has a unique UUID:

```json
[
  {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "institution": "Udemy",
    "title": "CircleCI: The complete introduction",
    "logo": "https://...",
    "startDate": "2021-04",
    "endDate": null,
    "certificateUrl": "https://..."
  },
  {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "institution": "Stucom Centre d'Estudis",
    "title": "Multiplatform Applications Development",
    "logo": "https://...",
    "startDate": "2014-01",
    "endDate": "2016-12",
    "certificateUrl": null
  }
]
```

---

## Step-by-Step Instructions

### Step 1: Generate UUIDs

Generate 6 unique UUIDs (one for each education entry). Use consistent IDs across all locale variants since they represent the same educational credentials.

You can generate UUIDs using:

```bash
# macOS/Linux
uuidgen | tr '[:upper:]' '[:lower:]'

# Or use an online generator
# https://www.uuidgenerator.net/
```

### Step 2: Assign UUIDs to Education Entries

Assign UUIDs based on the education entry (by title), ensuring the same entry gets the same UUID across all locales:

| Education Title                          | UUID                |
| ---------------------------------------- | ------------------- |
| CircleCI: The complete introduction      | `edu-001-uuid-here` |
| Fastlane for React Native                | `edu-002-uuid-here` |
| Multiplatform Applications Development   | `edu-003-uuid-here` |
| Oracle Certification Associate, Java SE7 | `edu-004-uuid-here` |
| Web Applications Development             | `edu-005-uuid-here` |
| Networks and microcomputing systems      | `edu-006-uuid-here` |

### Step 3: Update English Education File

**File**: `src/test-utils/fixtures/api/en/education.json`

Add `id` as the first field in each entry:

```json
[
  {
    "id": "generated-uuid-1",
    "institution": "Udemy",
    "title": "CircleCI: The complete introduction",
    ...
  },
  {
    "id": "generated-uuid-2",
    "institution": "Udemy",
    "title": "Fastlane for React Native: Deploy your app autonomously!",
    ...
  },
  // ... remaining entries
]
```

### Step 4: Update Other Locale Variants

Apply the **same UUIDs** to:

- `src/test-utils/fixtures/api/es/education.json`
- `src/test-utils/fixtures/api/ca/education.json`
- `src/test-utils/fixtures/api/pl/education.json`
- `src/test-utils/fixtures/api/tl/education.json`

**Important**: The UUIDs must be identical across all locales for the same education entry.

### Step 5: Verification

```bash
# Check that all entries have IDs
grep -c '"id":' src/test-utils/fixtures/api/*/education.json

# Should show 6 for each locale (6 education entries each)

# Verify consistent IDs across locales
grep '"id":' src/test-utils/fixtures/api/en/education.json
grep '"id":' src/test-utils/fixtures/api/es/education.json

# Should show matching UUIDs in the same order
```

---

## Files to Modify

- `src/test-utils/fixtures/api/en/education.json`
- `src/test-utils/fixtures/api/es/education.json`
- `src/test-utils/fixtures/api/ca/education.json`
- `src/test-utils/fixtures/api/pl/education.json`
- `src/test-utils/fixtures/api/tl/education.json`

---

## Acceptance Criteria

- [x] All 6 education entries have unique UUIDs
- [x] UUIDs are valid UUID v4 format
- [x] Same education entry has same UUID across all 5 locales
- [x] `id` is the first field in each entry (for consistency)
- [x] UUIDs are lowercase (standard convention)

---

## Implementation Notes

- **UUID consistency**: The same educational credential must have the same UUID across all language variants. The institution name may be translated, but the ID stays constant.
- **Ordering**: Keep `id` as the first field in each JSON object for readability and consistency with work experience entries.
- **Format**: Use lowercase UUIDs (e.g., `f47ac10b-58cc-4372-a567-0e02b2c3d479`).

---

## Dependencies

- [TASK-173](./TASK-173-standardise-date-formats.md) - Should be done first (changes field names)

---

## Next Steps

- [TASK-175](./TASK-175-add-explicit-nulls.md) - Add Explicit Nulls for Optional Fields
