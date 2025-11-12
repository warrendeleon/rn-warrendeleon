# TASK-037: Copy Polish Profile Data

**Task ID**: TASK-037
**Title**: Copy Polish Profile Data
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

Polish translation expands the app's reach to the 50 million Polish speakers globally. This task involves translating English (UK) profile data into Polish or copying existing translations from the old repository.

**Current State**: No Polish profile data in new i18n structure.

**Desired State**: Complete Polish profile data files translated and validated in `src/test-utils/fixtures/api/pl-PL/` with proper Polish grammar, diacritics, and professional terminology.

---

## Technical Details

### Files to Create

1. **`src/test-utils/fixtures/api/pl-PL/profile.json`**
2. **`src/test-utils/fixtures/api/pl-PL/work-experience.json`**
3. **`src/test-utils/fixtures/api/pl-PL/education.json`**
4. **`src/test-utils/fixtures/api/pl-PL/skills.json`**

### Implementation

**File Structure**:

```typescript
// src/test-utils/fixtures/api/pl-PL/profile.json
{
  "name": "Warren de Leon",
  "title": "Starszy Inżynier Oprogramowania",
  "location": "Londyn, Wielka Brytania",
  "email": "contact@example.com",
  "summary": "Programista full-stack specjalizujący się w React Native...",
  "languages": ["en-GB", "es-ES", "pl-PL", "ca-ES", "tl-PH"]
}
```

### Why This Matters

1. **Polish Market**: Reaches 50M Polish speakers, growing tech market in Central Europe
2. **Professional Quality**: Human translation ensures technical terminology is accurate
3. **Character Support**: Validates Polish diacritics (ą, ć, ę, ł, ń, ó, ś, ź, ż) render correctly

---

## Acceptance Criteria

- [ ] All 4 Polish JSON files created in `src/test-utils/fixtures/api/pl-PL/`
- [ ] JSON files pass Prettier formatting (alphabetically sorted keys)
- [ ] TypeScript types validate all JSON structures
- [ ] No syntax errors or malformed JSON
- [ ] All text professionally translated to Polish
- [ ] Polish diacritics preserved correctly (ą, ć, ę, ł, ń, ó, ś, ź, ż)
- [ ] Technical terms use proper Polish IT vocabulary
- [ ] Translation verified by native Polish speaker (if available)
- [ ] TypeScript compilation passes (`yarn typecheck`)
- [ ] ESLint passes (`yarn lint`)

---

## Test Scenarios

**Scenario 1: Polish Diacritics Preserved**

```gherkin
Given Polish profile JSON files exist
When files are formatted with Prettier
Then Polish diacritics are preserved correctly
And characters like ą, ć, ę, ł, ń render properly
```

**Scenario 2: Professional Translation Quality**

```gherkin
Given Polish profile data is translated
When compared with English (UK) baseline
Then all technical terms use correct Polish IT vocabulary
And grammar follows Polish conventions
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
- [ ] Polish translations verified
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

**Blocks**: TASK-042 (Polish implementation)

**Enables**: Polish language switcher functionality

---

## Git & PR Information

**Branch Name**: `feature/TASK-037-copy-polish-profile-data`

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

- Create `src/test-utils/fixtures/api/pl-PL/` directory structure
- Translate profile data from English (UK) baseline or copy from old repository
- Ensure professional Polish IT terminology
- Preserve Polish diacritical marks
- Validate JSON syntax and structure

**Validation Results**:

- TypeScript: _To be checked_
- Prettier: _To be checked_
- JSON Parse: _To be checked_
- Polish Translation: _To be checked_
- Native Speaker Review: _To be checked_

**Impact**: Enables Polish-speaking users to view profile in native language

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

✅ All 4 Polish JSON files created and validated
✅ Prettier formatting applied successfully
✅ TypeScript types validate all structures
✅ Polish diacritics (ą, ć, ę, ł, ń, ó, ś, ź, ż) preserved correctly
✅ Professional Polish IT terminology used
✅ JSON syntax error-free

---

## Verification

**Verified**: No

**Verification Steps**:

1. Run `yarn typecheck` - passes without errors
2. Run `yarn lint:fix` - Prettier formats all JSON files
3. Manually review JSON structure matches English baseline
4. Verify Polish diacritics render correctly
5. Check technical terms use proper Polish IT vocabulary
6. Native speaker review (if available)

---

## Related Tasks

- [TASK-035](./TASK-035-copy-english-uk-profile-data.md) - English baseline
- [TASK-038](./TASK-038-copy-catalan-profile-data.md) - Catalan translation
- [TASK-042](./TASK-042-implement-polish-support.md) - Polish implementation

---

## References

- [Epic EPIC-005](../epics/EPIC-005-internationalization.md)
- [User Story US-006](../stories/US-006-multi-language-profile-data.md)
- [Polish Language Guidelines](https://sjp.pwn.pl/) - Słownik Języka Polskiego

---

**Last Updated**: 2025-01-12
