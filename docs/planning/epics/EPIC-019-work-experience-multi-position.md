# EPIC-019: Work Experience Multi-Position Support

**Status**: 📋 To Do
**Priority**: High
**Estimated Effort**: 12h

---

## Overview

Enhance the Work Experience feature to support multiple positions at the same company, following the same navigation pattern as the existing clients feature. This allows accurate representation of career progression within a single organisation (e.g., starting as Senior React Native Engineer and progressing to Software Engineering Manager at Sky).

## Business Context

The current data structure only supports a single position per company entry. This doesn't accurately represent career progression where someone may have held multiple roles at the same organisation. The solution reuses the proven clients navigation pattern for consistency.

## User Experience

### List View

- Shows company name with **latest position title**
- Date range spans **entire tenure** at company (start of first position to end of last)
- Badge shows position count (e.g., "2") when multiple positions exist
- Example: "Sky - Software Engineering Manager (Jan 2023 - Dec 2025)" with badge "2"

### Positions List (new screen, like Clients)

- Tap company with multiple positions → shows list of positions
- Each position shows: title, date range
- Sorted by date (most recent first)
- Example positions for Sky:
  - Software Engineering Manager (Oct 2023 - Dec 2025)
  - Senior React Native Engineer (Jan 2023 - Oct 2023)

### Position Details

- Tap position → shows position details
- Adapts sections based on role content:
  - Developer roles: tech stack, testing tools, dev tools
  - Manager roles: key responsibilities (no tech stack)

## Technical Approach

### Data Structure Changes

Add `positions` array to `WorkExperience` interface, mirroring how `clients` works:

```typescript
export interface Position {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  // Technical fields (for developer roles)
  programmingLanguages?: string[];
  techStack?: string[];
  unitTest?: string[];
  e2e?: string[];
  devTools?: string[];
  agileMethodology?: string[];
  // Management fields (for manager roles)
  responsibilities?: string[];
}

export interface WorkExperience {
  id: string;
  company: string;
  logo?: string;
  positions: Position[]; // Multiple positions
  clients?: Client[];
}
```

### Navigation Flow

```
WorkExperience List
  ├── Company with clients → WorkExperienceClients → WorkExperienceDetails
  ├── Company with positions → WorkExperiencePositions (NEW) → WorkExperienceDetails
  └── Company with single position → WorkExperienceDetails
```

### Backward Compatibility

- Migrate existing single-position entries to use `positions` array with one item
- Update all 5 language fixtures (en, es, ca, pl, tl)

## Tasks

| Task ID                                                         | Title                                            | Effort | Priority |
| --------------------------------------------------------------- | ------------------------------------------------ | ------ | -------- |
| [TASK-165](../tasks/TASK-165-update-work-experience-types.md)   | Update WorkExperience TypeScript Types           | 1h     | High     |
| [TASK-166](../tasks/TASK-166-update-sky-fixture-data.md)        | Update Sky Fixture Data (All Languages)          | 2h     | High     |
| [TASK-167](../tasks/TASK-167-update-redux-selectors.md)         | Update Redux Selectors for Multi-Position        | 1.5h   | High     |
| [TASK-168](../tasks/TASK-168-create-positions-screen.md)        | Create WorkExperiencePositionsScreen             | 2h     | High     |
| [TASK-169](../tasks/TASK-169-update-list-screen-navigation.md)  | Update List Screen Navigation Logic              | 1h     | High     |
| [TASK-170](../tasks/TASK-170-update-details-screen-sections.md) | Update Details Screen for Role-Specific Sections | 1.5h   | High     |
| [TASK-171](../tasks/TASK-171-rntl-tests-positions-screen.md)    | RNTL Tests for WorkExperiencePositionsScreen     | 1h     | High     |
| [TASK-172](../tasks/TASK-172-update-e2e-work-experience.md)     | Update E2E Tests for Work Experience Flow        | 2h     | High     |

## Acceptance Criteria

- [ ] Sky shows "Software Engineering Manager" with "Jan 2023 - Dec 2025" in list
- [ ] Sky shows badge "2" indicating multiple positions
- [ ] Tapping Sky navigates to positions list screen
- [ ] Positions list shows both roles with correct dates
- [ ] Tapping a position shows appropriate detail view
- [ ] Manager role shows responsibilities section (no tech stack)
- [ ] Developer role shows tech stack sections (no responsibilities)
- [ ] All 5 language fixtures updated with Sky positions data
- [ ] All RNTL tests pass with `yarn test`
- [ ] All E2E tests pass with `yarn detox:ios:test`
- [ ] No TypeScript or ESLint errors
- [ ] EAA accessibility compliance maintained

## Dependencies

- None (can be worked on independently)

## Related

- Follows same pattern as EPIC-010 (Work Experience Display Enhancement)
- Reuses clients navigation pattern for consistency
