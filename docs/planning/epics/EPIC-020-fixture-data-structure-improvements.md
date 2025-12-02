# EPIC-020: Fixture Data Structure Improvements

**Status**: ✅ Completed
**Priority**: Medium
**Estimated Effort**: 24h
**Complexity**: Moderate

---

## Overview

The API fixture data files in `src/test-utils/fixtures/api/` have grown organically and now contain inconsistencies in date formats, field naming, and data structures. This epic standardises these fixtures to improve maintainability, type safety, and data quality across all five language variants.

---

## Why Improve the Data Structure?

### Current Problems

1. **Inconsistent Date Formats**
   - Some dates use "April 2021", others "Oct 2023", others just "2014"
   - "Present" is used instead of `null` for ongoing positions
   - Makes sorting, filtering, and comparison difficult

2. **Missing Identifiers**
   - Education entries lack unique IDs
   - Makes referencing specific entries impossible

3. **Implicit Optionality**
   - Optional fields are simply omitted rather than explicitly `null`
   - Harder to understand data shape at a glance

4. **Confusing Nested Structure**
   - `clients` array at the same level as `positions` in xDesign entry
   - Each client has its own `position` field, duplicating parent
   - Unclear relationship between company, position, and client

5. **Inconsistent Tech Stack Fields**
   - Six different field names: `programmingLanguages`, `techStack`, `unitTest`, `e2e`, `devTools`, `agileMethodology`
   - Some entries have all fields, others have none

6. **Ambiguous Field Names**
   - `location` in education (should be `institution`)
   - `carousel` in profile (should be `galleryImages`)

### Benefits of Standardisation

| Benefit                  | Description                                               |
| ------------------------ | --------------------------------------------------------- |
| **Type Safety**          | Consistent structure makes TypeScript types more accurate |
| **Validation**           | Zod schemas can be more precise with standardised data    |
| **Maintainability**      | Easier to update fixtures when structure is clear         |
| **Data Quality**         | ISO dates enable proper sorting and comparison            |
| **Developer Experience** | Predictable field names and structures                    |

---

## What Will Change

### 1. Date Format Standardisation

**Before**:

```json
"start": "April 2021",
"end": "Present"
```

**After**:

```json
"startDate": "2021-04",
"endDate": null
```

### 2. Education IDs

**Before**:

```json
{ "location": "Udemy", "title": "..." }
```

**After**:

```json
{ "id": "uuid-here", "institution": "Udemy", "title": "..." }
```

### 3. Explicit Nulls

**Before**:

```json
{ "title": "...", "start": "2021" }
```

**After**:

```json
{ "title": "...", "startDate": "2021-01", "endDate": null, "certificateUrl": null }
```

### 4. Flattened Client Structure

**Before**:

```json
{
  "company": "xDesign",
  "positions": [{ "title": "Lead RN Developer", ... }],
  "clients": [
    { "company": "Fanduel", "position": "Lead RN Developer", ... },
    { "company": "Zonal", "position": "Senior RN Developer", ... }
  ]
}
```

**After**:

```json
{
  "company": "xDesign",
  "positions": [
    {
      "title": "Lead React Native Developer",
      "client": { "name": "Fanduel", "logo": "svg/fanduel.svg" },
      ...
    },
    {
      "title": "Senior React Native Developer",
      "client": { "name": "Zonal", "logo": "svg/zonal.svg" },
      ...
    }
  ]
}
```

### 5. Normalised Tech Stack

**Before**:

```json
"programmingLanguages": ["Typescript"],
"techStack": ["React Native", "Redux"],
"unitTest": ["RNTL"],
"e2e": ["Detox"],
"devTools": ["Webstorm", "XCode"],
"agileMethodology": ["SCRUM"]
```

**After**:

```json
"technologies": {
  "languages": ["TypeScript"],
  "frameworks": ["React Native", "Redux Toolkit"],
  "testing": {
    "unit": ["React Native Testing Library"],
    "e2e": ["Detox"]
  },
  "tools": ["WebStorm", "Xcode", "Git"],
  "ci": ["CircleCI"],
  "methodology": ["Scrum"]
}
```

### 6. Renamed Fields

| Current       | New              | File           |
| ------------- | ---------------- | -------------- |
| `location`    | `institution`    | education.json |
| `carousel`    | `galleryImages`  | profile.json   |
| `start`       | `startDate`      | all files      |
| `end`         | `endDate`        | all files      |
| `certificate` | `certificateUrl` | education.json |

---

## User Stories

### US-028: Data Format Standardisation

**As a** developer maintaining the portfolio app
**I want** consistent date formats and explicit field values
**So that** I can reliably parse, sort, and validate the data

**Acceptance Criteria**:

- All dates use ISO 8601 format (YYYY-MM)
- Ongoing positions use `null` instead of "Present"
- All optional fields have explicit `null` values
- Education entries have unique UUIDs

### US-029: Structure Normalisation

**As a** developer working with work experience data
**I want** a clear, non-redundant structure for positions and clients
**So that** I can understand the data relationships without confusion

**Acceptance Criteria**:

- Client engagements are positions with a `client` object
- Technology stack fields are grouped under `technologies`
- Field names are unambiguous and self-documenting

### US-030: Type System Updates

**As a** developer using TypeScript and Zod
**I want** the types and schemas to match the new data structure
**So that** I get accurate type checking and validation

**Acceptance Criteria**:

- TypeScript interfaces updated for new structure
- Zod schemas updated for new structure
- Types exported correctly from all modules

### US-031: Codebase Integration

**As a** developer maintaining the app
**I want** all code that uses the fixtures to work with the new structure
**So that** the app functions correctly after the migration

**Acceptance Criteria**:

- Redux selectors updated for new field names
- API clients parse new structure correctly
- UI components display data correctly

### US-032: Testing & Validation

**As a** developer ensuring quality
**I want** all tests to pass with the new data structure
**So that** I can be confident the migration is complete

**Acceptance Criteria**:

- All unit tests pass
- All E2E tests pass
- All five language variants are consistent

---

## Tasks

### US-028: Data Format Standardisation (4 tasks)

| Task ID                                                   | Title                                  | Effort | Priority | Description                                         |
| --------------------------------------------------------- | -------------------------------------- | ------ | -------- | --------------------------------------------------- |
| [TASK-173](../tasks/TASK-173-standardise-date-formats.md) | Standardise Date Formats to ISO 8601   | 2h     | High     | Convert all dates to YYYY-MM format                 |
| [TASK-174](../tasks/TASK-174-add-education-uuids.md)      | Add UUIDs to Education Entries         | 1h     | High     | Generate and add unique IDs to education items      |
| [TASK-175](../tasks/TASK-175-add-explicit-nulls.md)       | Add Explicit Nulls for Optional Fields | 1.5h   | Medium   | Replace omitted fields with explicit null values    |
| [TASK-176](../tasks/TASK-176-rename-ambiguous-fields.md)  | Rename Ambiguous Field Names           | 1h     | Medium   | Rename location→institution, carousel→galleryImages |

### US-029: Structure Normalisation (2 tasks)

| Task ID                                                      | Title                                    | Effort | Priority | Description                                  |
| ------------------------------------------------------------ | ---------------------------------------- | ------ | -------- | -------------------------------------------- |
| [TASK-177](../tasks/TASK-177-flatten-clients-structure.md)   | Flatten Clients Structure into Positions | 3h     | High     | Move client engagements into positions array |
| [TASK-178](../tasks/TASK-178-normalise-tech-stack-fields.md) | Normalise Technology Stack Fields        | 2h     | Medium   | Group tech fields under technologies object  |

### US-030: Type System Updates (2 tasks)

| Task ID                                                  | Title                                     | Effort | Priority | Description                            |
| -------------------------------------------------------- | ----------------------------------------- | ------ | -------- | -------------------------------------- |
| [TASK-179](../tasks/TASK-179-update-typescript-types.md) | Update TypeScript Types for New Structure | 2h     | High     | Modify interfaces in portfolio.ts      |
| [TASK-180](../tasks/TASK-180-update-zod-schemas.md)      | Update Zod Schemas for New Structure      | 2h     | High     | Modify schemas to match new data shape |

### US-031: Codebase Integration (3 tasks)

| Task ID                                                 | Title                                    | Effort | Priority | Description                              |
| ------------------------------------------------------- | ---------------------------------------- | ------ | -------- | ---------------------------------------- |
| [TASK-181](../tasks/TASK-181-update-redux-selectors.md) | Update Redux Selectors for New Structure | 2h     | High     | Update all selectors for new field names |
| [TASK-182](../tasks/TASK-182-update-api-clients.md)     | Update API Client Functions              | 1.5h   | High     | Update fetch functions for new structure |
| [TASK-183](../tasks/TASK-183-update-ui-components.md)   | Update UI Components for New Field Names | 2h     | High     | Update all screens and components        |

### US-032: Testing & Validation (3 tasks)

| Task ID                                                   | Title                                    | Effort | Priority | Description                                      |
| --------------------------------------------------------- | ---------------------------------------- | ------ | -------- | ------------------------------------------------ |
| [TASK-184](../tasks/TASK-184-update-unit-tests.md)        | Update Unit Tests for New Data Structure | 2h     | High     | Fix all unit tests for new structure             |
| [TASK-185](../tasks/TASK-185-update-e2e-tests.md)         | Update E2E Tests for New Data Structure  | 1.5h   | Medium   | Fix all E2E tests for new structure              |
| [TASK-186](../tasks/TASK-186-validate-locale-variants.md) | Validate All Locale Variants             | 1h     | High     | Ensure all 5 languages have consistent structure |

---

## Acceptance Criteria

- [x] All dates in ISO 8601 format (YYYY-MM)
- [x] All education entries have unique UUIDs
- [x] All optional fields have explicit `null` values
- [x] Client engagements are positions with `client` object
- [x] Technology fields grouped under `technologies`
- [x] Field names are unambiguous
- [x] TypeScript types match new structure
- [x] Zod schemas match new structure
- [x] All Redux selectors work correctly
- [x] All UI components display correctly
- [x] All unit tests pass (`yarn test`)
- [x] All E2E tests pass (`yarn detox:ios:test`)
- [x] No TypeScript errors (`yarn typecheck`)
- [x] No ESLint errors (`yarn lint`)
- [x] All 5 language variants are consistent

---

## Implementation Order

**Phase 1: Fixture Updates** (TASK-173 to TASK-178)

- Update all JSON fixture files first
- Can be done in parallel across different file types

**Phase 2: Type System** (TASK-179 to TASK-180)

- Update TypeScript types and Zod schemas
- Must complete before codebase integration

**Phase 3: Codebase Integration** (TASK-181 to TASK-183)

- Update selectors, API clients, and UI components
- Sequential dependencies within this phase

**Phase 4: Testing** (TASK-184 to TASK-186)

- Fix tests and validate all variants
- Final validation before marking complete

---

## Files Affected

### Fixture Files (15 files)

```
src/test-utils/fixtures/api/
├── en/
│   ├── profile.json
│   ├── education.json
│   └── workxp.json
├── es/
│   ├── profile.json
│   ├── education.json
│   └── workxp.json
├── ca/
│   ├── profile.json
│   ├── education.json
│   └── workxp.json
├── pl/
│   ├── profile.json
│   ├── education.json
│   └── workxp.json
└── tl/
    ├── profile.json
    ├── education.json
    └── workxp.json
```

### Type/Schema Files

```
src/
├── types/
│   └── portfolio.ts
└── schemas/
    ├── profile.schema.ts
    ├── education.schema.ts
    └── workExperience.schema.ts
```

### Feature Files

```
src/features/
├── Profile/
│   ├── store/selectors.ts
│   └── screens/*.tsx
├── Education/
│   ├── store/selectors.ts
│   └── screens/*.tsx
└── WorkExperience/
    ├── store/selectors.ts
    └── screens/*.tsx
```

---

## Risk Assessment

| Risk                            | Likelihood | Impact | Mitigation                                   |
| ------------------------------- | ---------- | ------ | -------------------------------------------- |
| Breaking existing functionality | Medium     | High   | Full test coverage before migration          |
| Inconsistent locale variants    | Medium     | Medium | TASK-186 specifically validates all variants |
| Missing field updates in UI     | Medium     | Medium | Grep for old field names after migration     |
| Complex merge conflicts         | Low        | Medium | Complete in single focused effort            |

---

## Dependencies

- **EPIC-018** (Zod Schema Validation) - Schemas must be updated for new structure
- **EPIC-019** (Multi-Position Support) - Already established positions array pattern

---

## Related

- [EPIC-018](./EPIC-018-zod-schema-validation.md) - Zod schemas need updating
- [EPIC-019](./EPIC-019-work-experience-multi-position.md) - Positions array pattern
- [EPIC-005](./EPIC-005-multi-language-portfolio-data-layer.md) - Original data layer setup

---

## Glossary

| Term               | Definition                                                                   |
| ------------------ | ---------------------------------------------------------------------------- |
| **ISO 8601**       | International standard for date formats (YYYY-MM-DD or YYYY-MM)              |
| **UUID**           | Universally Unique Identifier (e.g., "a1b2c3d4-e5f6-7890-abcd-ef1234567890") |
| **Fixture**        | Test data files used for mocking API responses                               |
| **Locale variant** | Language-specific version of data (en, es, ca, pl, tl)                       |
| **Explicit null**  | Deliberately setting a field to `null` rather than omitting it               |
