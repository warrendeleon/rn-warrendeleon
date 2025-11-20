# TASK-177: Flatten Clients Structure into Positions

**Status**: 📋 To Do
**Priority**: High
**Effort**: 3h
**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)

---

## Description

Restructure the xDesign work experience entry to move client engagements from a separate `clients` array into the `positions` array. Each client engagement becomes a position with a `client` object, reflecting the actual employment structure where different client projects had different titles.

---

## Current State

The xDesign entry has a confusing structure with both `positions` and `clients` arrays:

```json
{
  "id": "bfb3c0e3-3e58-4ea6-aa6f-39b52d6d674f",
  "company": "xDesign",
  "logo": "...",
  "positions": [
    {
      "id": "e5f6a7b8-c9d0-1234-ef01-567890123456",
      "title": "Lead React Native Developer",
      "start": "Sept 2021",
      "end": "Apr 2022",
      "description": "I worked as a Lead React Native Developer at xDesign..."
      // No tech stack details
    }
  ],
  "clients": [
    {
      "id": "6d263e52-5ebf-4394-9ff6-8d9aa9d16690",
      "company": "Fanduel",
      "logo": "...",
      "start": "Jan 2022",
      "end": "Present",  // Incorrect - should end when xDesign ended
      "type": "contract",
      "position": "Lead React Native Developer",
      "programmingLanguages": [...],
      "techStack": [...],
      ...
    },
    {
      "id": "e0686319-2744-4b1b-abec-b90d0832d0b7",
      "company": "Zonal",
      "logo": "...",
      "start": "Sept 2021",
      "end": "Dec 2021",
      "type": "contract",
      "position": "Senior React Native Developer",  // Different title!
      ...
    }
  ]
}
```

### Problems with Current Structure

1. The `positions` entry has no tech stack details
2. `clients` duplicates the position title
3. Fanduel end date "Present" is wrong (xDesign ended Apr 2022)
4. Two different titles (Lead vs Senior) for different clients
5. Unclear relationship between company and clients

---

## Target State

Client engagements become positions with a `client` object:

```json
{
  "id": "bfb3c0e3-3e58-4ea6-aa6f-39b52d6d674f",
  "company": "xDesign",
  "logo": "https://raw.githubusercontent.com/.../xdesign.svg",
  "positions": [
    {
      "id": "6d263e52-5ebf-4394-9ff6-8d9aa9d16690",
      "title": "Lead React Native Developer",
      "startDate": "2022-01",
      "endDate": "2022-04",
      "description": "I was lead software engineer for FanDuel...",
      "responsibilities": null,
      "technologies": {
        "languages": ["TypeScript"],
        "frameworks": ["React Native", "ReactJS", "Redux", "RxJS", "React Navigation"],
        "testing": {
          "unit": null,
          "e2e": null
        },
        "tools": ["WebStorm", "Xcode", "Android Studio", "Git"],
        "ci": null,
        "methodology": ["Scrum"]
      },
      "client": {
        "name": "Fanduel",
        "logo": "https://raw.githubusercontent.com/.../fanduel.svg"
      }
    },
    {
      "id": "e0686319-2744-4b1b-abec-b90d0832d0b7",
      "title": "Senior React Native Developer",
      "startDate": "2021-09",
      "endDate": "2021-12",
      "description": "I was part of the team working for a client called Zonal...",
      "responsibilities": null,
      "technologies": {
        "languages": ["TypeScript"],
        "frameworks": [
          "React Native",
          "Redux",
          "Redux Toolkit",
          "Redux Thunk",
          "React Navigation v6"
        ],
        "testing": {
          "unit": ["React Native Testing Library"],
          "e2e": ["Detox"]
        },
        "tools": ["WebStorm", "Xcode", "Android Studio", "Git"],
        "ci": ["Bitrise"],
        "methodology": ["Scrum"]
      },
      "client": {
        "name": "Zonal",
        "logo": "https://raw.githubusercontent.com/.../zonal.svg"
      }
    }
  ]
}
```

---

## Step-by-Step Instructions

### Step 1: Identify All Positions for xDesign

Based on the current data, there are two client engagements that should become positions:

1. **Fanduel** (Jan 2022 - Apr 2022) - Lead React Native Developer
2. **Zonal** (Sept 2021 - Dec 2021) - Senior React Native Developer

### Step 2: Create Position Objects from Client Data

For each client entry, create a position object:

```json
{
  "id": "keep-existing-client-id",
  "title": "title-from-client-position-field",
  "startDate": "convert-to-iso",
  "endDate": "convert-to-iso-or-null",
  "description": "description-from-client",
  "responsibilities": null,
  "technologies": {
    "languages": ["from-programmingLanguages"],
    "frameworks": ["from-techStack"],
    "testing": {
      "unit": ["from-unitTest-or-null"],
      "e2e": ["from-e2e-or-null"]
    },
    "tools": ["from-devTools"],
    "ci": ["from-ci-if-exists-or-null"],
    "methodology": ["from-agileMethodology"]
  },
  "client": {
    "name": "company-from-client",
    "logo": "logo-from-client"
  }
}
```

### Step 3: Fix Date Issues

- Fanduel `end: "Present"` should be `endDate: "2022-04"` (when xDesign employment ended)
- Convert all dates to ISO format

### Step 4: Remove the Old Positions Entry

The original position entry with generic description gets removed - the client positions contain all the relevant information.

### Step 5: Remove the Clients Array

Delete the entire `clients` array from the xDesign entry. All client information is now in the positions.

### Step 6: Update All 5 Locale Variants

Apply the same restructuring to:

- `src/test-utils/fixtures/api/en/workxp.json`
- `src/test-utils/fixtures/api/es/workxp.json`
- `src/test-utils/fixtures/api/ca/workxp.json`
- `src/test-utils/fixtures/api/pl/workxp.json`
- `src/test-utils/fixtures/api/tl/workxp.json`

### Step 7: Verification

```bash
# Check that no clients arrays remain
grep -r '"clients":' src/test-utils/fixtures/api/*/workxp.json

# Should return no results

# Check xDesign has correct number of positions
grep -A 2 '"company": "xDesign"' src/test-utils/fixtures/api/en/workxp.json

# Verify client objects exist in positions
grep -r '"client":' src/test-utils/fixtures/api/*/workxp.json
```

---

## Files to Modify

- `src/test-utils/fixtures/api/en/workxp.json`
- `src/test-utils/fixtures/api/es/workxp.json`
- `src/test-utils/fixtures/api/ca/workxp.json`
- `src/test-utils/fixtures/api/pl/workxp.json`
- `src/test-utils/fixtures/api/tl/workxp.json`

---

## Acceptance Criteria

- [ ] `clients` array removed from xDesign entry
- [ ] Two client positions added to xDesign positions array
- [ ] Each position has a `client` object with name and logo
- [ ] Position IDs preserved from original client IDs
- [ ] Fanduel end date corrected to "2022-04"
- [ ] All tech stack data migrated to technologies object
- [ ] Original generic xDesign position removed
- [ ] All 5 locale variants updated consistently
- [ ] Chronological order maintained (Fanduel first, then Zonal)

---

## Implementation Notes

- **Position ordering**: Order positions by end date descending (most recent first), so Fanduel (Jan-Apr 2022) comes before Zonal (Sept-Dec 2021).
- **ID preservation**: Keep the original client IDs as the position IDs to maintain consistency.
- **Client object**: The client object is minimal (name + logo only). All other data (dates, tech stack) belongs to the position.
- **Description**: Use the description from the client entry, not the generic xDesign description.

---

## Edge Cases

- **Only xDesign has clients**: No other company in the fixtures has a clients array, so this change only affects one entry per locale.
- **Future consultancy work**: If more consultancy roles are added, follow this same pattern - positions with client objects.

---

## Dependencies

- [TASK-173](./TASK-173-standardise-date-formats.md) - Dates must be standardised
- [TASK-175](./TASK-175-add-explicit-nulls.md) - Must understand null handling
- [TASK-178](./TASK-178-normalise-tech-stack-fields.md) - Tech stack structure needed

---

## Next Steps

- [TASK-178](./TASK-178-normalise-tech-stack-fields.md) - Normalise Technology Stack Fields
