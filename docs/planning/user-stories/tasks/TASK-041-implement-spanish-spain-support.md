# TASK-041: Implement Spanish (Spain) Language Support

**Task ID**: TASK-041
**Title**: Implement Spanish (Spain) Language Support
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

Extend the `useProfileData` hook to support Spanish (Spain) profile data loading. Follows the same pattern as TASK-040 but for the `es-ES` locale.

**Current State**: `useProfileData` hook supports English (UK) only.

**Desired State**: When user selects "Español (España)" from language switcher, profile data loads from `src/test-utils/fixtures/api/es-ES/` JSON files and displays in Castilian Spanish.

---

## Technical Details

### Files to Modify

1. **`src/i18n/locales/es.json`** - Add profile data keys
2. **`src/hooks/useProfileData.ts`** - Ensure hook supports 'es-ES' locale
3. **`src/features/Home/HomeScreen.tsx`** - Verify Spanish data displays correctly

### Files to Create

1. **`src/test-utils/fixtures/api/es-ES/__tests__/profile.test.ts`** - Test Spanish profile data loading

### Implementation

**Before**:

```typescript
// Hook only supports en-GB
export const useProfileData = () => {
  const { i18n } = useTranslation();
  const locale = i18n.language; // Only 'en-GB' works

  return require(`@app/test-utils/fixtures/api/${locale}/profile.json`);
};
```

**After**:

```typescript
// Hook supports en-GB and es-ES
export const useProfileData = () => {
  const { i18n } = useTranslation();
  const locale = i18n.language; // 'en-GB' or 'es-ES'

  // Validate locale exists
  const supportedLocales = ['en-GB', 'es-ES', 'pl-PL', 'ca-ES', 'tl-PH'];
  const validLocale = supportedLocales.includes(locale) ? locale : 'en-GB';

  return require(`@app/test-utils/fixtures/api/${validLocale}/profile.json`);
};
```

### Why This Matters

1. **Spanish Market**: Enables 500M+ Spanish speakers to view profile in native language
2. **Validation**: Confirms hook pattern works for multiple languages
3. **Quality Check**: Tests Spanish accent marks and special characters render correctly

---

## Acceptance Criteria

- [ ] Spanish (Spain) profile data loads from `src/test-utils/fixtures/api/es-ES/` when language is 'es-ES'
- [ ] HomeScreen displays Spanish profile data correctly
- [ ] Spanish accent marks (á, é, í, ó, ú, ñ) render properly
- [ ] Language switcher triggers Spanish data reload
- [ ] Unit tests for Spanish profile data loading pass
- [ ] Integration test verifies Spanish profile displays
- [ ] TypeScript compilation passes (`yarn typecheck`)
- [ ] ESLint passes (`yarn lint`)
- [ ] All existing tests pass (`yarn test`)

---

## Test Scenarios

**Scenario 1: Load Spanish Profile Data**

```gherkin
Given the app language is set to "es-ES"
When the Home screen renders
Then profile data should load from es-ES JSON files
And display "Ingeniero Senior de Software" as the title
And Spanish accent marks should render correctly
```

**Scenario 2: Switch from English to Spanish**

```gherkin
Given the Home screen is displaying English (UK) profile
When the user changes language to "Español (España)"
Then profile data should reload from es-ES JSON files
And all text should display in Castilian Spanish
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

**Blockers**: TASK-036 (Spanish profile data), TASK-040 (English implementation pattern)

**Blocks**: None (can run in parallel with TASK-042, 043, 044)

**Enables**: Complete Spanish multilingual experience

---

## Git & PR Information

**Branch Name**: `feature/TASK-041-implement-spanish-spain-support`

**PR Link**: _Not yet created_

**PR Status**: _N/A_

**Commit Hash**: _Not yet committed_

---

## Code Quality Metrics

**Code Coverage**: Maintain 100% for useProfileData hook

**Files Modified**: 3

**Files Created**: 1

**Review Time**: _To be tracked_

**Rework Count**: 0

---

## Implementation Notes

**Key Changes**:

- Extend `useProfileData` hook to support 'es-ES' locale
- Add unit tests for Spanish profile data loading
- Add integration test for Spanish language switch
- Verify Spanish accent marks render correctly in simulator

**Validation Results**:

- TypeScript: _To be checked_
- ESLint: _To be checked_
- Tests: _To be checked_
- Spanish Rendering: _To be checked_

**Impact**: Enables Spanish-speaking users to view complete profile in Castilian Spanish

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

✅ Spanish (Spain) profile loads from es-ES JSON files
✅ Spanish accent marks (á, é, í, ó, ú, ñ) render correctly
✅ Language changes trigger Spanish data reload
✅ All tests pass with no regressions
✅ 100% coverage maintained for hook

---

## Verification

**Verified**: No

**Verification Steps**:

1. Run `yarn test` - Spanish profile tests pass
2. Run `yarn typecheck` - passes without errors
3. Launch app, switch to "Español (España)"
4. Verify profile displays in Spanish
5. Verify accent marks render correctly
6. Run full test suite - all tests pass

---

## Related Tasks

- [TASK-036](./TASK-036-copy-spanish-spain-profile-data.md) - Spanish profile data (blocker)
- [TASK-040](./TASK-040-implement-english-uk-support.md) - English implementation (blocker)
- [TASK-042](./TASK-042-implement-polish-support.md) - Polish implementation

---

## References

- [Epic EPIC-005](../epics/EPIC-005-internationalization.md)
- [User Story US-006](../stories/US-006-multi-language-profile-data.md)
- [React i18next Language Detection](https://react.i18next.com/latest/i18next-instance)

---

**Last Updated**: 2025-01-12
