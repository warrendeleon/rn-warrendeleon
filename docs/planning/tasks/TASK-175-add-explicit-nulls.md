# TASK-175: Add Explicit Nulls for Optional Fields

**Status**: 📋 To Do
**Priority**: Medium
**Effort**: 1.5h
**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)

---

## Description

Replace omitted optional fields with explicit `null` values across all fixture files. This makes the data structure predictable and self-documenting, clearly showing which fields exist but have no value versus fields that don't apply.

---

## Current State

Optional fields are simply omitted when they have no value:

```json
// education.json - certificate omitted when not applicable
{
  "location": "Stucom Centre d'Estudis",
  "title": "Multiplatform Applications Development",
  "start": "2014",
  "end": "2016"
  // No certificate field at all
}

// workxp.json - tech fields omitted for manager roles
{
  "title": "Software Engineering Manager",
  "start": "Oct 2023",
  "end": "Dec 2025",
  "description": "...",
  "responsibilities": [...]
  // No programmingLanguages, techStack, etc.
}
```

---

## Target State

All optional fields present with explicit `null` values:

```json
// education.json
{
  "id": "uuid-here",
  "institution": "Stucom Centre d'Estudis",
  "title": "Multiplatform Applications Development",
  "logo": "https://...",
  "startDate": "2014-01",
  "endDate": "2016-12",
  "certificateUrl": null
}

// workxp.json - position with technologies object
{
  "id": "uuid-here",
  "title": "Software Engineering Manager",
  "startDate": "2023-10",
  "endDate": "2025-12",
  "description": "...",
  "responsibilities": [...],
  "technologies": null
}
```

---

## Step-by-Step Instructions

### Step 1: Identify Optional Fields by File Type

#### profile.json

No optional fields that need explicit nulls (all fields are required).

#### education.json

| Field            | Type           | When null                              |
| ---------------- | -------------- | -------------------------------------- |
| `endDate`        | string \| null | Ongoing education or single-date entry |
| `certificateUrl` | string \| null | No certificate for this education      |

#### workxp.json (positions)

| Field              | Type             | When null                           |
| ------------------ | ---------------- | ----------------------------------- |
| `endDate`          | string \| null   | Current position                    |
| `responsibilities` | string[] \| null | Developer role (not manager)        |
| `technologies`     | object \| null   | Manager role (not developer)        |
| `client`           | object \| null   | Direct employment (not client work) |

### Step 2: Update education.json (All Locales)

For each education entry, ensure these fields are present:

```json
{
  "id": "...",
  "institution": "...",
  "title": "...",
  "logo": "...",
  "startDate": "YYYY-MM",
  "endDate": "YYYY-MM" | null,
  "certificateUrl": "https://..." | null
}
```

**Example - Certificate course**:

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "institution": "Udemy",
  "title": "CircleCI: The complete introduction",
  "logo": "https://raw.githubusercontent.com/.../udemy.svg",
  "startDate": "2021-04",
  "endDate": null,
  "certificateUrl": "https://udemy-certificate.s3.amazonaws.com/..."
}
```

**Example - Degree programme**:

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "institution": "Stucom Centre d'Estudis",
  "title": "Multiplatform Applications Development",
  "logo": "https://raw.githubusercontent.com/.../stucom.svg",
  "startDate": "2014-01",
  "endDate": "2016-12",
  "certificateUrl": null
}
```

### Step 3: Update workxp.json Positions (All Locales)

For positions, the structure depends on whether it's a manager role or developer role:

**Manager role** (has responsibilities, no technologies):

```json
{
  "id": "...",
  "title": "Software Engineering Manager",
  "startDate": "2023-10",
  "endDate": null,
  "description": "...",
  "responsibilities": ["People Leadership: ...", "Agile Delivery: ..."],
  "technologies": null,
  "client": null
}
```

**Developer role** (has technologies, no responsibilities):

```json
{
  "id": "...",
  "title": "Senior React Native Engineer",
  "startDate": "2023-01",
  "endDate": "2023-10",
  "description": "...",
  "responsibilities": null,
  "technologies": {
    "languages": ["TypeScript"],
    "frameworks": ["React Native", "Redux Toolkit"],
    "testing": { "unit": ["RNTL"], "e2e": ["WebdriverIO"] },
    "tools": ["WebStorm", "Xcode", "Android Studio", "Git"],
    "ci": ["CircleCI"],
    "methodology": ["Scrum", "Kanban"]
  },
  "client": null
}
```

**Client engagement** (has client object):

```json
{
  "id": "...",
  "title": "Lead React Native Developer",
  "startDate": "2022-01",
  "endDate": "2022-04",
  "description": "...",
  "responsibilities": null,
  "technologies": { ... },
  "client": {
    "name": "Fanduel",
    "logo": "svg/fanduel.svg"
  }
}
```

### Step 4: Apply to All 5 Locale Variants

Update all files in:

- `src/test-utils/fixtures/api/en/`
- `src/test-utils/fixtures/api/es/`
- `src/test-utils/fixtures/api/ca/`
- `src/test-utils/fixtures/api/pl/`
- `src/test-utils/fixtures/api/tl/`

### Step 5: Verification

```bash
# Verify all education entries have certificateUrl field
grep -c '"certificateUrl":' src/test-utils/fixtures/api/*/education.json
# Should show 6 for each locale

# Verify structure consistency
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/test-utils/fixtures/api/en/education.json'));
data.forEach((item, i) => {
  const fields = Object.keys(item);
  console.log(\`Entry \${i}: \${fields.join(', ')}\`);
});
"
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

- [ ] All education entries have `endDate` field (value or null)
- [ ] All education entries have `certificateUrl` field (value or null)
- [ ] All position entries have `endDate` field (value or null)
- [ ] All position entries have `responsibilities` field (array or null)
- [ ] All position entries have `technologies` field (object or null)
- [ ] All position entries have `client` field (object or null)
- [ ] Field order is consistent across all entries
- [ ] All 5 locale variants updated consistently

---

## Implementation Notes

- **Field ordering**: Keep fields in a consistent order for readability. Suggested order for positions: `id`, `title`, `startDate`, `endDate`, `description`, `responsibilities`, `technologies`, `client`.
- **Mutually exclusive fields**: `responsibilities` and `technologies` are mutually exclusive - one will always be `null`.
- **JSON formatting**: Use 2-space indentation for consistency with existing files.

---

## Dependencies

- [TASK-173](./TASK-173-standardise-date-formats.md) - Date fields must be renamed first
- [TASK-174](./TASK-174-add-education-uuids.md) - Education IDs must be added first

---

## Next Steps

- [TASK-176](./TASK-176-rename-ambiguous-fields.md) - Rename Ambiguous Field Names
