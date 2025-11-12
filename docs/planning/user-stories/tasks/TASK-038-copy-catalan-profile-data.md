# TASK-038: Copy Catalan Profile Data

**Task ID**: TASK-038
**Title**: Copy Catalan Profile Data
**Epic**: [EPIC-005: Internationalization](../epics/EPIC-005-internationalization.md)
**User Story**: [US-006: Multi-Language Profile Data Migration](../stories/US-006-multi-language-profile-data.md)
**Status**: To Do
**Priority**: Medium
**Created**: 2025-01-12
**Assigned To**: Warren de Leon
**Reviewer**: _To be assigned_
**Category**: Internationalization

---

## Context

Catalan translation expands the app's reach to the 10 million Catalan speakers in Catalonia, Valencia, and Balearic Islands. This task involves translating English (UK) profile data into Catalan or copying existing translations from the old repository.

**Current State**: No Catalan profile data in new i18n structure.

**Desired State**: Complete Catalan profile data files translated and validated in `src/test-utils/fixtures/api/ca-ES/` with proper Catalan grammar, diacritics, and professional terminology.

---

## Technical Details

### Files to Create

1. **`src/test-utils/fixtures/api/ca-ES/profile.json`**
2. **`src/test-utils/fixtures/api/ca-ES/work-experience.json`**
3. **`src/test-utils/fixtures/api/ca-ES/education.json`**
4. **`src/test-utils/fixtures/api/ca-ES/skills.json`**

### Implementation

**File Structure**:

```typescript
// src/test-utils/fixtures/api/ca-ES/profile.json
{
  "name": "Warren de Leon",
  "title": "Enginyer Sènior de Programari",
  "location": "Londres, Regne Unit",
  "email": "contact@example.com",
  "summary": "Desenvolupador full-stack especialitzat en React Native...",
  "languages": ["en-GB", "es-ES", "pl-PL", "ca-ES", "tl-PH"]
}
```

### Why This Matters

1. **Catalan Market**: Reaches 10M Catalan speakers, strong tech community in Barcelona
2. **Cultural Relevance**: Demonstrates commitment to regional languages and cultural diversity
3. **Character Support**: Validates Catalan diacritics (à, è, é, í, ï, ó, ò, ú, ü, ç, l·l) render correctly

---

## Acceptance Criteria

- [ ] All 4 Catalan JSON files created in `src/test-utils/fixtures/api/ca-ES/`
- [ ] JSON files pass Prettier formatting (alphabetically sorted keys)
- [ ] TypeScript types validate all JSON structures
- [ ] No syntax errors or malformed JSON
- [ ] All text professionally translated to Catalan
- [ ] Catalan diacritics preserved correctly (à, è, é, í, ï, ó, ò, ú, ü, ç, l·l)
- [ ] Technical terms use proper Catalan IT vocabulary
- [ ] Translation verified by native Catalan speaker (if available)
- [ ] TypeScript compilation passes (`yarn typecheck`)
- [ ] ESLint passes (`yarn lint`)

---

## Test Scenarios

**Scenario 1: Catalan Diacritics Preserved**

```gherkin
Given Catalan profile JSON files exist
When files are formatted with Prettier
Then Catalan diacritics are preserved correctly
And characters like à, è, é, í, ï, ó, ò, ú, ü, ç, l·l render properly
```

**Scenario 2: Professional Translation Quality**

```gherkin
Given Catalan profile data is translated
When compared with English (UK) baseline
Then all technical terms use correct Catalan IT vocabulary
And grammar follows Catalan conventions
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
- [ ] Catalan translations verified
- [ ] Native speaker review completed (if available)
- [ ] PR merged to main
- [ ] No regressions introduced

---

## Story Points & Effort

**Story Points**: 1
**Effort Estimate**: 1 hour
**Actual Effort**: _To be tracked_

---

## Dependencies

**Blockers**: TASK-035 (English baseline for translation reference)

**Blocks**: TASK-043 (Catalan implementation)

**Enables**: Catalan language switcher functionality

---

## Git & PR Information

**Branch Name**: `feature/TASK-038-copy-catalan-profile-data`

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

- Create `src/test-utils/fixtures/api/ca-ES/` directory structure
- Translate profile data from English (UK) baseline or copy from old repository
- Ensure professional Catalan IT terminology
- Preserve Catalan diacritical marks and special characters (including l·l)
- Validate JSON syntax and structure

**Validation Results**:

- TypeScript: _To be checked_
- Prettier: _To be checked_
- JSON Parse: _To be checked_
- Catalan Translation: _To be checked_
- Native Speaker Review: _To be checked_

**Impact**: Enables Catalan-speaking users to view profile in native language

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

✅ All 4 Catalan JSON files created and validated
✅ Prettier formatting applied successfully
✅ TypeScript types validate all structures
✅ Catalan diacritics (à, è, é, í, ï, ó, ò, ú, ü, ç, l·l) preserved correctly
✅ Professional Catalan IT terminology used
✅ JSON syntax error-free

---

## Verification

**Verified**: No

**Verification Steps**:

1. Run `yarn typecheck` - passes without errors
2. Run `yarn lint:fix` - Prettier formats all JSON files
3. Manually review JSON structure matches English baseline
4. Verify Catalan diacritics and special characters render correctly
5. Check technical terms use proper Catalan IT vocabulary
6. Native speaker review (if available)

---

## Related Tasks

- [TASK-035](./TASK-035-copy-english-uk-profile-data.md) - English baseline
- [TASK-039](./TASK-039-copy-tagalog-profile-data.md) - Tagalog translation
- [TASK-043](./TASK-043-implement-catalan-support.md) - Catalan implementation

---

## References

- [Epic EPIC-005](../epics/EPIC-005-internationalization.md)
- [User Story US-006](../stories/US-006-multi-language-profile-data.md)
- [Catalan Language Guidelines](https://www.termcat.cat/) - TERMCAT Centre de Terminologia

---

**Last Updated**: 2025-01-12
