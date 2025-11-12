# TASK-035: Copy English (UK) Profile Data

**Task ID**: TASK-035
**Title**: Copy English (UK) Profile Data
**Epic**: [EPIC-005: Internationalization](../epics/EPIC-005-internationalization.md)
**User Story**: [US-006: Multi-Language Profile Data Migration](../stories/US-006-multi-language-profile-data.md)
**Status**: To Do
**Priority**: High
**Created**: 2025-01-12
**Assigned To**: Warren de Leon
**Reviewer**: _To be assigned_
**Category**: Internationalization

---

## Context

English (UK) will serve as the baseline profile data for all other language translations. This task involves copying and validating existing profile JSON data from the old repository into the new internationalisation structure.

**Current State**: Profile data exists in old repository but not yet migrated to `src/test-utils/fixtures/api/en-GB/` structure.

**Desired State**: Complete English (UK) profile data files (personal info, work experience, education, skills) migrated to new i18n-ready file structure with validated JSON format.

---

## Technical Details

### Files to Create

1. **`src/test-utils/fixtures/api/en-GB/profile.json`**
2. **`src/test-utils/fixtures/api/en-GB/work-experience.json`**
3. **`src/test-utils/fixtures/api/en-GB/education.json`**
4. **`src/test-utils/fixtures/api/en-GB/skills.json`**

### Implementation

**File Structure**:

```typescript
// src/test-utils/fixtures/api/en-GB/profile.json
{
  "name": "Warren de Leon",
  "title": "Senior Software Engineer",
  "location": "London, UK",
  "email": "contact@example.com",
  "summary": "Full-stack developer specialising in React Native...",
  "languages": ["en-GB", "es-ES", "pl-PL", "ca-ES", "tl-PH"]
}
```

### Why This Matters

1. **Baseline for Translations**: English (UK) serves as reference for all other language versions
2. **JSON Validation**: Ensures TypeScript types and JSON structure are correct from the start
3. **Data Quality**: Validates content before translation effort begins

---

## Acceptance Criteria

- [ ] All 4 English (UK) JSON files created in `src/test-utils/fixtures/api/en-GB/`
- [ ] JSON files pass Prettier formatting (alphabetically sorted keys)
- [ ] TypeScript types validate all JSON structures
- [ ] No syntax errors or malformed JSON
- [ ] All text in British English (colour, organisation, specialise)
- [ ] TypeScript compilation passes (`yarn typecheck`)
- [ ] ESLint passes (`yarn lint`)

---

## Test Scenarios

**Scenario 1: JSON Files Validate**

```gherkin
Given English (UK) profile JSON files exist
When TypeScript types are applied
Then all files pass type validation
And no JSON parse errors occur
```

**Scenario 2: Prettier Formatting**

```gherkin
Given profile JSON files are created
When Prettier runs
Then all object keys are alphabetically sorted
And formatting is consistent across all files
```

---

## Definition of Ready

- [x] Task description clear and complete
- [x] Acceptance criteria defined
- [x] Story points estimated
- [x] Technical approach identified
- [x] Dependencies identified
- [x] Epic and User Story linked

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code written and follows project conventions
- [ ] JSON files pass Prettier validation
- [ ] TypeScript types validate structure
- [ ] PR merged to main
- [ ] No regressions introduced

---

## Story Points & Effort

**Story Points**: 0.5
**Effort Estimate**: 0.5 hours
**Actual Effort**: _To be tracked_

---

## Dependencies

**Blockers**: None - can start immediately

**Blocks**: TASK-036, TASK-037, TASK-038, TASK-039 (translations need baseline)

**Enables**: All language implementation tasks (TASK-040 to TASK-044)

---

## Git & PR Information

**Branch Name**: `feature/TASK-035-copy-english-uk-profile-data`

**PR Link**: _Not yet created_

**PR Status**: _N/A_

**Commit Hash**: _Not yet committed_

---

## Code Quality Metrics

**Code Coverage**: N/A (data files)

**Files Modified**: 0

**Files Created**: 4

**Review Time**: _To be tracked_

**Rework Count**: 0

---

## Implementation Notes

**Key Changes**:

- Create `src/test-utils/fixtures/api/en-GB/` directory structure
- Migrate profile data from old repository
- Ensure British English spelling throughout
- Validate JSON syntax and structure

**Validation Results**:

- TypeScript: _To be checked_
- Prettier: _To be checked_
- JSON Parse: _To be checked_

**Impact**: Establishes baseline for 4 additional language translations

---

## Blocked Information

**Blocked**: No

**Blocked Since**: _N/A_

**Blocked Reason**: _N/A_

---

## Timeline & Dates

**Start Date**: _Not yet started_

**Completed Date**: _Not yet completed_

**Archive Date**: _N/A_

---

## Status History

_Auto-tracked when status changes_

| Date       | Status | Notes        |
| ---------- | ------ | ------------ |
| 2025-01-12 | To Do  | Task created |

---

## Work Log

_Manual developer notes for significant updates_

---

## Technical Debt

**Introduces Technical Debt**: No

**Pays Down Technical Debt**: No

---

## Success Criteria

✅ All 4 English (UK) JSON files created and validated
✅ Prettier formatting applied successfully
✅ TypeScript types validate all structures
✅ British English spelling consistent
✅ JSON syntax error-free

---

## Verification

**Verified**: No

**Verification Steps**:

1. Run `yarn typecheck` - passes without errors
2. Run `yarn lint:fix` - Prettier formats all JSON files
3. Manually review JSON structure matches TypeScript types
4. Verify British English spelling (colour, organisation, specialise)

---

## Related Tasks

- [TASK-036](./TASK-036-copy-spanish-spain-profile-data.md) - Spanish translation
- [TASK-037](./TASK-037-copy-polish-profile-data.md) - Polish translation
- [TASK-040](./TASK-040-implement-english-uk-support.md) - English (UK) implementation

---

## References

- [Epic EPIC-005](../epics/EPIC-005-internationalization.md)
- [User Story US-006](../stories/US-006-multi-language-profile-data.md)
- [i18next Documentation](https://www.i18next.com/)

---

**Last Updated**: 2025-01-12
