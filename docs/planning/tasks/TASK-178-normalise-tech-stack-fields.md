# TASK-178: Normalise Technology Stack Fields

**Status**: ✅ Completed
**Priority**: Medium
**Effort**: 2h
**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)

---

## Description

Restructure the scattered technology-related fields (`programmingLanguages`, `techStack`, `unitTest`, `e2e`, `devTools`, `agileMethodology`) into a single, organised `technologies` object. This improves data organisation and makes the structure more intuitive.

---

## Current State

Technology fields are scattered at the position level with inconsistent presence:

```json
{
  "title": "Senior React Native Engineer",
  "programmingLanguages": ["Typescript"],
  "techStack": ["React Native", "Apollo GraphQL", "Redux", "Redux Toolkit", "React Navigation v6"],
  "unitTest": ["RNTL"],
  "e2e": ["Webdriver IO"],
  "devTools": ["Webstorm", "XCode", "Android Studio", "Git", "Circle CI"],
  "agileMethodology": ["Scrum", "Kanban"]
}
```

### Problems

1. Six separate fields cluttering the position object
2. `devTools` mixes IDEs with CI tools
3. CI tools sometimes in `devTools`, sometimes separate
4. Inconsistent capitalisation ("Typescript" vs "TypeScript", "XCode" vs "Xcode")
5. Manager roles don't have these fields at all

---

## Target State

All technology fields grouped under a `technologies` object:

```json
{
  "title": "Senior React Native Engineer",
  "technologies": {
    "languages": ["TypeScript"],
    "frameworks": [
      "React Native",
      "Apollo GraphQL",
      "Redux",
      "Redux Toolkit",
      "React Navigation v6"
    ],
    "testing": {
      "unit": ["React Native Testing Library"],
      "e2e": ["WebdriverIO"]
    },
    "tools": ["WebStorm", "Xcode", "Android Studio", "Git"],
    "ci": ["CircleCI"],
    "methodology": ["Scrum", "Kanban"]
  }
}
```

### Benefits

1. Single `technologies` object instead of 6 scattered fields
2. Clear separation of tools vs CI
3. Standardised names with correct capitalisation
4. `null` for manager roles (explicit about no tech stack)
5. Nested `testing` object for unit/e2e

---

## Step-by-Step Instructions

### Step 1: Create Technology Name Standardisation Map

Standardise common technology names:

| Current      | Standard                     |
| ------------ | ---------------------------- |
| Typescript   | TypeScript                   |
| Javascript   | JavaScript                   |
| XCode        | Xcode                        |
| Webstorm     | WebStorm                     |
| RNTL         | React Native Testing Library |
| Webdriver IO | WebdriverIO                  |
| Circle CI    | CircleCI                     |
| SCRUM        | Scrum                        |

### Step 2: Identify CI Tools in devTools

Extract CI tools from devTools into separate `ci` field:

| Tool         | Category                   |
| ------------ | -------------------------- |
| CircleCI     | ci                         |
| Bitrise      | ci                         |
| Azure DevOps | ci                         |
| Gitlab       | ci                         |
| Jira         | tools (project management) |
| Heroku       | tools (deployment)         |

### Step 3: Update Each Position

For each developer position, transform the fields:

```json
// Before
{
  "programmingLanguages": ["Typescript"],
  "techStack": ["React Native", "Redux"],
  "unitTest": ["RNTL"],
  "e2e": ["Detox"],
  "devTools": ["Webstorm", "XCode", "Git", "Circle CI"],
  "agileMethodology": ["SCRUM"]
}

// After
{
  "technologies": {
    "languages": ["TypeScript"],
    "frameworks": ["React Native", "Redux"],
    "testing": {
      "unit": ["React Native Testing Library"],
      "e2e": ["Detox"]
    },
    "tools": ["WebStorm", "Xcode", "Git"],
    "ci": ["CircleCI"],
    "methodology": ["Scrum"]
  }
}
```

### Step 4: Handle Manager Roles

Manager roles have `responsibilities` instead of `technologies`:

```json
{
  "title": "Software Engineering Manager",
  "responsibilities": ["People Leadership: ...", "Agile Delivery: ..."],
  "technologies": null
}
```

### Step 5: Handle Missing Fields

When a category is missing (no unit tests, no CI, etc.), use `null`:

```json
{
  "technologies": {
    "languages": ["TypeScript"],
    "frameworks": ["React Native"],
    "testing": {
      "unit": null,
      "e2e": null
    },
    "tools": ["WebStorm", "Git"],
    "ci": null,
    "methodology": ["Scrum"]
  }
}
```

### Step 6: Update All Positions Across All Locales

Apply to every position in:

- `src/test-utils/fixtures/api/en/workxp.json`
- `src/test-utils/fixtures/api/es/workxp.json`
- `src/test-utils/fixtures/api/ca/workxp.json`
- `src/test-utils/fixtures/api/pl/workxp.json`
- `src/test-utils/fixtures/api/tl/workxp.json`

### Step 7: Verification

```bash
# Check for old field names - should return no results
grep -r '"programmingLanguages":' src/test-utils/fixtures/api/
grep -r '"techStack":' src/test-utils/fixtures/api/
grep -r '"unitTest":' src/test-utils/fixtures/api/
grep -r '"e2e":' src/test-utils/fixtures/api/
grep -r '"devTools":' src/test-utils/fixtures/api/
grep -r '"agileMethodology":' src/test-utils/fixtures/api/

# Check for new structure
grep -r '"technologies":' src/test-utils/fixtures/api/*/workxp.json
```

---

## Complete Field Mapping

### technologies.languages

Source: `programmingLanguages`

### technologies.frameworks

Source: `techStack`

### technologies.testing.unit

Source: `unitTest`

### technologies.testing.e2e

Source: `e2e`

### technologies.tools

Source: `devTools` (minus CI tools)
Includes: IDEs, Git, project management tools, deployment tools

### technologies.ci

Source: extracted from `devTools`
Includes: CircleCI, Bitrise, Azure DevOps, Gitlab

### technologies.methodology

Source: `agileMethodology`

---

## Files to Modify

- `src/test-utils/fixtures/api/en/workxp.json`
- `src/test-utils/fixtures/api/es/workxp.json`
- `src/test-utils/fixtures/api/ca/workxp.json`
- `src/test-utils/fixtures/api/pl/workxp.json`
- `src/test-utils/fixtures/api/tl/workxp.json`

---

## Acceptance Criteria

- [x] All old tech fields removed (`programmingLanguages`, `techStack`, etc.)
- [x] All positions have `technologies` field (object or null)
- [x] Manager roles have `technologies: null`
- [x] CI tools extracted from devTools into separate `ci` field
- [x] Technology names standardised (TypeScript, Xcode, etc.)
- [x] Missing categories use `null` not empty arrays
- [x] All 5 locale variants updated consistently

---

## Implementation Notes

- **Empty arrays vs null**: Use `null` when the category doesn't apply (e.g., no testing). Use an empty array only if testing was attempted but no tools were used (unlikely).
- **Capitalisation**: Be consistent - "TypeScript", "JavaScript", "Xcode", "WebStorm", "CircleCI".
- **Tool classification**: When uncertain if something is a tool or CI, consider: does it run builds/tests automatically? If yes, it's CI.

---

## Dependencies

- [TASK-177](./TASK-177-flatten-clients-structure.md) - Clients flattening uses this structure
- [TASK-175](./TASK-175-add-explicit-nulls.md) - Null handling pattern established there

---

## Next Steps

- [TASK-179](./TASK-179-update-typescript-types.md) - Update TypeScript Types for New Structure
