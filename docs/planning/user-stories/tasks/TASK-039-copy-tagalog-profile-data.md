# TASK-039: Copy Tagalog Profile Data

**Task ID**: TASK-039
**Title**: Copy Tagalog Profile Data
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

Tagalog translation expands the app's reach to the 90 million Filipino speakers globally. This task involves translating English (UK) profile data into Tagalog or copying existing translations from the old repository.

**Current State**: No Tagalog profile data in new i18n structure.

**Desired State**: Complete Tagalog profile data files translated and validated in `src/test-utils/fixtures/api/tl-PH/` with proper Tagalog grammar and professional terminology.

---

## Technical Details

### Files to Create

1. **`src/test-utils/fixtures/api/tl-PH/profile.json`**
2. **`src/test-utils/fixtures/api/tl-PH/work-experience.json`**
3. **`src/test-utils/fixtures/api/tl-PH/education.json`**
4. **`src/test-utils/fixtures/api/tl-PH/skills.json`**

### Implementation

**File Structure**:

```typescript
// src/test-utils/fixtures/api/tl-PH/profile.json
{
  "name": "Warren de Leon",
  "title": "Senior na Inhinyero ng Software",
  "location": "London, United Kingdom",
  "email": "contact@example.com",
  "summary": "Full-stack developer na dalubhasa sa React Native...",
  "languages": ["en-GB", "es-ES", "pl-PL", "ca-ES", "tl-PH"]
}
```

### Why This Matters

1. **Filipino Market**: Reaches 90M+ Tagalog speakers, growing tech workforce in the Philippines
2. **Professional Quality**: Human translation ensures technical terminology is accurate and culturally appropriate
3. **Regional Representation**: Demonstrates commitment to Asian markets and Filipino diaspora

---

## Acceptance Criteria

- [ ] All 4 Tagalog JSON files created in `src/test-utils/fixtures/api/tl-PH/`
- [ ] JSON files pass Prettier formatting (alphabetically sorted keys)
- [ ] TypeScript types validate all JSON structures
- [ ] No syntax errors or malformed JSON
- [ ] All text professionally translated to Tagalog
- [ ] Technical terms use proper Tagalog IT vocabulary (or accepted loanwords)
- [ ] Translation verified by native Tagalog speaker (if available)
- [ ] TypeScript compilation passes (`yarn typecheck`)
- [ ] ESLint passes (`yarn lint`)

---

## Test Scenarios

**Scenario 1: Tagalog Translation Preserved**

```gherkin
Given Tagalog profile JSON files exist
When files are formatted with Prettier
Then Tagalog text is preserved correctly
And special characters render properly
```

**Scenario 2: Professional Translation Quality**

```gherkin
Given Tagalog profile data is translated
When compared with English (UK) baseline
Then all technical terms use correct Tagalog IT vocabulary
And grammar follows Tagalog conventions
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
- [ ] Tagalog translations verified
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

**Blocks**: TASK-044 (Tagalog implementation)

**Enables**: Tagalog language switcher functionality

---

## Git & PR Information

**Branch Name**: `feature/TASK-039-copy-tagalog-profile-data`

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

- Create `src/test-utils/fixtures/api/tl-PH/` directory structure
- Translate profile data from English (UK) baseline or copy from old repository
- Ensure professional Tagalog IT terminology (balance native terms and accepted English loanwords)
- Validate JSON syntax and structure

**Validation Results**:

- TypeScript: _To be checked_
- Prettier: _To be checked_
- JSON Parse: _To be checked_
- Tagalog Translation: _To be checked_
- Native Speaker Review: _To be checked_

**Impact**: Enables Tagalog-speaking users to view profile in native language

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

✅ All 4 Tagalog JSON files created and validated
✅ Prettier formatting applied successfully
✅ TypeScript types validate all structures
✅ Professional Tagalog IT terminology used
✅ JSON syntax error-free

---

## Verification

**Verified**: No

**Verification Steps**:

1. Run `yarn typecheck` - passes without errors
2. Run `yarn lint:fix` - Prettier formats all JSON files
3. Manually review JSON structure matches English baseline
4. Verify Tagalog text renders correctly
5. Check technical terms use proper Tagalog IT vocabulary
6. Native speaker review (if available)

---

## Related Tasks

- [TASK-035](./TASK-035-copy-english-uk-profile-data.md) - English baseline
- [TASK-036](./TASK-036-copy-spanish-spain-profile-data.md) - Spanish translation
- [TASK-044](./TASK-044-implement-tagalog-support.md) - Tagalog implementation

---

## References

- [Epic EPIC-005](../epics/EPIC-005-internationalization.md)
- [User Story US-006](../stories/US-006-multi-language-profile-data.md)
- [Komisyon sa Wikang Filipino](http://kwf.gov.ph/) - Official Tagalog language authority

---

**Last Updated**: 2025-01-12
