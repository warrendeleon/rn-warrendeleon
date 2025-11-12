# TASK-036: Copy Spanish (Spain) Profile Data

**Task ID**: TASK-036
**Title**: Copy Spanish (Spain) Profile Data
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

Spanish (Spain) translations already exist for UI elements but profile data needs to be migrated to the new i18n structure. This task involves copying and validating existing Spanish profile data into the locale-specific directory.

**Current State**: Spanish (Spain) profile data exists in old repository but not yet migrated to `src/test-utils/fixtures/api/es-ES/` structure.

**Desired State**: Complete Spanish (Spain) profile data files migrated to new i18n-ready file structure with validated JSON format and proper Castilian Spanish.

---

## Technical Details

### Files to Create

1. **`src/test-utils/fixtures/api/es-ES/profile.json`**
2. **`src/test-utils/fixtures/api/es-ES/work-experience.json`**
3. **`src/test-utils/fixtures/api/es-ES/education.json`**
4. **`src/test-utils/fixtures/api/es-ES/skills.json`**

### Implementation

**File Structure**:

```typescript
// src/test-utils/fixtures/api/es-ES/profile.json
{
  "name": "Warren de Leon",
  "title": "Ingeniero Senior de Software",
  "location": "Londres, Reino Unido",
  "email": "contact@example.com",
  "summary": "Desarrollador full-stack especializado en React Native...",
  "languages": ["en-GB", "es-ES", "pl-PL", "ca-ES", "tl-PH"]
}
```

### Why This Matters

1. **Existing Translations**: Leverages already-translated UI content for profile data
2. **Spanish Market**: Reaches 500M+ Spanish speakers globally
3. **Quality Baseline**: Validates translation quality before expanding to other languages

---

## Acceptance Criteria

- [ ] All 4 Spanish (Spain) JSON files created in `src/test-utils/fixtures/api/es-ES/`
- [ ] JSON files pass Prettier formatting (alphabetically sorted keys)
- [ ] TypeScript types validate all JSON structures
- [ ] No syntax errors or malformed JSON
- [ ] All text in Castilian Spanish (Spain variant)
- [ ] Proper Spanish accent marks (á, é, í, ó, ú, ñ)
- [ ] TypeScript compilation passes (`yarn typecheck`)
- [ ] ESLint passes (`yarn lint`)

---

## Test Scenarios

**Scenario 1: Spanish Characters Preserved**

```gherkin
Given Spanish (Spain) profile JSON files exist
When files are formatted with Prettier
Then Spanish accent marks are preserved correctly
And ñ characters display properly
```

**Scenario 2: Translation Quality**

```gherkin
Given Spanish profile data is migrated
When compared with English (UK) baseline
Then all sections are translated completely
And Castilian Spanish conventions are followed
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
- [ ] Spanish translations verified
- [ ] PR merged to main
- [ ] No regressions introduced

---

## Story Points & Effort

**Story Points**: 0.5
**Effort Estimate**: 0.5 hours
**Actual Effort**: _To be tracked_

---

## Dependencies

**Blockers**: TASK-035 (English baseline for structure reference)

**Blocks**: TASK-041 (Spanish implementation)

**Enables**: Spanish language switcher functionality

---

## Git & PR Information

**Branch Name**: `feature/TASK-036-copy-spanish-spain-profile-data`

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

- Create `src/test-utils/fixtures/api/es-ES/` directory structure
- Migrate Spanish profile data from old repository
- Ensure Castilian Spanish conventions (Spain, not Latin America)
- Preserve Spanish accent marks and special characters
- Validate JSON syntax and structure

**Validation Results**:

- TypeScript: _To be checked_
- Prettier: _To be checked_
- JSON Parse: _To be checked_
- Spanish Translation: _To be checked_

**Impact**: Enables Spanish-speaking users to view profile in native language

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

✅ All 4 Spanish (Spain) JSON files created and validated
✅ Prettier formatting applied successfully
✅ TypeScript types validate all structures
✅ Spanish accent marks and ñ preserved correctly
✅ JSON syntax error-free

---

## Verification

**Verified**: No

**Verification Steps**:

1. Run `yarn typecheck` - passes without errors
2. Run `yarn lint:fix` - Prettier formats all JSON files
3. Manually review JSON structure matches English baseline
4. Verify Castilian Spanish spelling and conventions
5. Check accent marks render correctly (á, é, í, ó, ú, ñ)

---

## Related Tasks

- [TASK-035](./TASK-035-copy-english-uk-profile-data.md) - English baseline
- [TASK-037](./TASK-037-copy-polish-profile-data.md) - Polish translation
- [TASK-041](./TASK-041-implement-spanish-spain-support.md) - Spanish implementation

---

## References

- [Epic EPIC-005](../epics/EPIC-005-internationalization.md)
- [User Story US-006](../stories/US-006-multi-language-profile-data.md)
- [Spanish Language Guidelines](https://www.rae.es/) - Real Academia Española

---

**Last Updated**: 2025-01-12
