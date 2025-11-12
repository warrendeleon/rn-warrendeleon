# TASK-043: Implement Catalan Language Support

**Task ID**: TASK-043
**Title**: Implement Catalan Language Support
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

Extend the `useProfileData` hook to support Catalan profile data loading. Follows the same pattern as previous language implementations but for the `ca-ES` locale, including proper support for Catalan diacritics and special characters.

**Current State**: `useProfileData` hook supports English (UK), Spanish (Spain), and Polish only.

**Desired State**: When user selects "Català" from language switcher, profile data loads from `src/test-utils/fixtures/api/ca-ES/` JSON files and displays in Catalan with correct diacritics.

---

## Technical Details

### Files to Modify

1. **`src/i18n/locales/ca.json`** - Create or update Catalan locale file with profile data keys
2. **`src/hooks/useProfileData.ts`** - Ensure hook supports 'ca-ES' locale
3. **`src/features/Home/HomeScreen.tsx`** - Verify Catalan data displays correctly

### Files to Create

1. **`src/i18n/locales/ca.json`** - Catalan UI translations (if doesn't exist)
2. **`src/test-utils/fixtures/api/ca-ES/__tests__/profile.test.ts`** - Test Catalan profile data loading

### Implementation

**Before**:

```typescript
// Hook supports en-GB, es-ES, pl-PL only
const supportedLocales = ['en-GB', 'es-ES', 'pl-PL'];
```

**After**:

```typescript
// Hook supports en-GB, es-ES, pl-PL, ca-ES
const supportedLocales = ['en-GB', 'es-ES', 'pl-PL', 'ca-ES', 'tl-PH'];
const validLocale = supportedLocales.includes(locale) ? locale : 'en-GB';
```

### Why This Matters

1. **Catalan Market**: Reaches 10M Catalan speakers in Barcelona tech hub
2. **Character Validation**: Tests Catalan diacritics (à, è, é, í, ï, ó, ò, ú, ü, ç, l·l) render correctly
3. **Regional Language Support**: Demonstrates commitment to regional languages beyond national ones

---

## Acceptance Criteria

- [ ] Catalan locale file `src/i18n/locales/ca.json` created with UI translations
- [ ] Catalan profile data loads from `src/test-utils/fixtures/api/ca-ES/` when language is 'ca-ES'
- [ ] HomeScreen displays Catalan profile data correctly
- [ ] Catalan diacritics (à, è, é, í, ï, ó, ò, ú, ü, ç, l·l) render properly
- [ ] Language switcher shows "Català" option
- [ ] Language switcher triggers Catalan data reload
- [ ] Unit tests for Catalan profile data loading pass
- [ ] Integration test verifies Catalan profile displays
- [ ] TypeScript compilation passes (`yarn typecheck`)
- [ ] ESLint passes (`yarn lint`)
- [ ] All existing tests pass (`yarn test`)

---

## Test Scenarios

**Scenario 1: Load Catalan Profile Data**

```gherkin
Given the app language is set to "ca-ES"
When the Home screen renders
Then profile data should load from ca-ES JSON files
And display "Enginyer Sènior de Programari" as the title
And Catalan diacritics should render correctly
```

**Scenario 2: Switch to Catalan Language**

```gherkin
Given the Home screen is displaying Spanish (Spain) profile
When the user changes language to "Català"
Then profile data should reload from ca-ES JSON files
And all text should display in Catalan
And characters like à, è, é, í, ï, ó, ç, l·l should render properly
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
- [ ] Tests written and passing
- [ ] Code reviewed and approved
- [ ] PR merged to main
- [ ] Documentation updated (if needed)
- [ ] No regressions introduced

---

## Story Points & Effort

**Story Points**: 2
**Effort Estimate**: 2 hours
**Actual Effort**: _To be tracked_

---

## Dependencies

**Blockers**: TASK-038 (Catalan profile data), TASK-040 (English implementation pattern)

**Blocks**: None (can run in parallel with TASK-044)

**Enables**: Complete Catalan multilingual experience

---

## Git & PR Information

**Branch Name**: `feature/TASK-043-implement-catalan-support`

**PR Link**: _Not yet created_

**PR Status**: _N/A_

**Commit Hash**: _Not yet committed_

---

## Code Quality Metrics

**Code Coverage**: Maintain 100% for useProfileData hook

**Files Modified**: 3

**Files Created**: 2

**Review Time**: _To be tracked_

**Rework Count**: 0

---

## Implementation Notes

**Key Changes**:

- Create `src/i18n/locales/ca.json` with Catalan UI translations
- Extend `useProfileData` hook to support 'ca-ES' locale
- Add "Català" to language switcher options
- Add unit tests for Catalan profile data loading
- Add integration test for Catalan language switch
- Verify Catalan diacritics and special characters (including l·l) render correctly

**Validation Results**:

- TypeScript: _To be checked_
- ESLint: _To be checked_
- Tests: _To be checked_
- Catalan Diacritics: _To be checked_

**Impact**: Enables Catalan-speaking users to view complete profile in Catalan

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

✅ Catalan locale file created with UI translations
✅ Catalan profile loads from ca-ES JSON files
✅ Catalan diacritics (à, è, é, í, ï, ó, ò, ú, ü, ç, l·l) render correctly
✅ Language switcher includes "Català" option
✅ All tests pass with no regressions
✅ 100% coverage maintained for hook

---

## Verification

**Verified**: No

**Verification Steps**:

1. Run `yarn test` - Catalan profile tests pass
2. Run `yarn typecheck` - passes without errors
3. Launch app, switch to "Català"
4. Verify profile displays in Catalan
5. Verify diacritics and special characters render correctly (à, è, é, í, ï, ó, ò, ú, ü, ç, l·l)
6. Run full test suite - all tests pass

---

## Related Tasks

- [TASK-038](./TASK-038-copy-catalan-profile-data.md) - Catalan profile data (blocker)
- [TASK-040](./TASK-040-implement-english-uk-support.md) - English implementation (blocker)
- [TASK-044](./TASK-044-implement-tagalog-support.md) - Tagalog implementation

---

## References

- [Epic EPIC-005](../epics/EPIC-005-internationalization.md)
- [User Story US-006](../stories/US-006-multi-language-profile-data.md)
- [TERMCAT Catalan Language Authority](https://www.termcat.cat/)

---

**Last Updated**: 2025-01-12
