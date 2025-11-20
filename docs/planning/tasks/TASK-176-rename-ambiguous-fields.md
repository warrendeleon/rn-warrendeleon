# TASK-176: Rename Ambiguous Field Names

**Status**: ✅ Completed
**Priority**: Medium
**Effort**: 1h
**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)

---

## Description

Rename fields with ambiguous names to more descriptive, self-documenting alternatives. This improves code readability and reduces confusion about what each field represents.

---

## Fields to Rename

| File           | Current Name  | New Name         | Reason                                                                     |
| -------------- | ------------- | ---------------- | -------------------------------------------------------------------------- |
| education.json | `location`    | `institution`    | "Location" implies geography; "institution" clearly means educational body |
| education.json | `certificate` | `certificateUrl` | Clarifies it's a URL, not certificate data                                 |
| profile.json   | `carousel`    | `galleryImages`  | "Carousel" is a UI component; "galleryImages" describes the content        |

---

## Step-by-Step Instructions

### Step 1: Update education.json (All Locales)

Rename fields in each education entry:

```json
// Before
{
  "location": "Udemy",
  "title": "...",
  "logo": "...",
  "start": "...",
  "certificate": "https://..."
}

// After
{
  "id": "...",
  "institution": "Udemy",
  "title": "...",
  "logo": "...",
  "startDate": "...",
  "endDate": null,
  "certificateUrl": "https://..."
}
```

Update all 5 locale files:

- `src/test-utils/fixtures/api/en/education.json`
- `src/test-utils/fixtures/api/es/education.json`
- `src/test-utils/fixtures/api/ca/education.json`
- `src/test-utils/fixtures/api/pl/education.json`
- `src/test-utils/fixtures/api/tl/education.json`

### Step 2: Update profile.json (All Locales)

Rename the carousel field:

```json
// Before
{
  "profilePicture": "...",
  "name": "Warren",
  "carousel": [
    "https://github.com/.../profile-01.jpg?raw=true",
    "https://github.com/.../profile-02.jpg?raw=true",
    ...
  ],
  "socials": {...}
}

// After
{
  "profilePicture": "...",
  "name": "Warren",
  "galleryImages": [
    "https://github.com/.../profile-01.jpg?raw=true",
    "https://github.com/.../profile-02.jpg?raw=true",
    ...
  ],
  "socials": {...}
}
```

Update all 5 locale files:

- `src/test-utils/fixtures/api/en/profile.json`
- `src/test-utils/fixtures/api/es/profile.json`
- `src/test-utils/fixtures/api/ca/profile.json`
- `src/test-utils/fixtures/api/pl/profile.json`
- `src/test-utils/fixtures/api/tl/profile.json`

### Step 3: Verification

```bash
# Check for old field names - should return no results
grep -r '"location":' src/test-utils/fixtures/api/*/education.json
grep -r '"certificate":' src/test-utils/fixtures/api/*/education.json
grep -r '"carousel":' src/test-utils/fixtures/api/*/profile.json

# Check for new field names - should show results
grep -r '"institution":' src/test-utils/fixtures/api/*/education.json
grep -r '"certificateUrl":' src/test-utils/fixtures/api/*/education.json
grep -r '"galleryImages":' src/test-utils/fixtures/api/*/profile.json
```

---

## Files to Modify

### Education Files (5)

- `src/test-utils/fixtures/api/en/education.json`
- `src/test-utils/fixtures/api/es/education.json`
- `src/test-utils/fixtures/api/ca/education.json`
- `src/test-utils/fixtures/api/pl/education.json`
- `src/test-utils/fixtures/api/tl/education.json`

### Profile Files (5)

- `src/test-utils/fixtures/api/en/profile.json`
- `src/test-utils/fixtures/api/es/profile.json`
- `src/test-utils/fixtures/api/ca/profile.json`
- `src/test-utils/fixtures/api/pl/profile.json`
- `src/test-utils/fixtures/api/tl/profile.json`

---

## Acceptance Criteria

- [x] `location` renamed to `institution` in all education files
- [x] `certificate` renamed to `certificateUrl` in all education files
- [x] `carousel` renamed to `galleryImages` in all profile files
- [x] No occurrences of old field names remain
- [x] All 5 locale variants updated consistently

---

## Implementation Notes

- **Field position**: When renaming, keep the field in the same relative position in the JSON object for consistency.
- **Case convention**: Use camelCase for all field names (consistent with TypeScript conventions).
- **Value preservation**: Only rename the field key, not the value.

---

## Dependencies

- [TASK-173](./TASK-173-standardise-date-formats.md) - Date fields renamed there
- [TASK-174](./TASK-174-add-education-uuids.md) - IDs added there
- [TASK-175](./TASK-175-add-explicit-nulls.md) - Nulls added there

---

## Next Steps

- [TASK-177](./TASK-177-flatten-clients-structure.md) - Flatten Clients Structure into Positions
