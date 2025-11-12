# TASK-040: Implement English (UK) Language Support

**Task ID**: TASK-040
**Title**: Implement English (UK) Language Support
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

Implement i18next support for loading English (UK) profile data when the user selects "English (UK)" from the language switcher. This involves creating data fetching hooks, Redux integration, and UI updates.

**Current State**: Language switcher exists but doesn't load locale-specific profile data. Only UI translations work.

**Desired State**: When user selects English (UK), profile data (name, title, work experience, education, skills) loads from `src/test-utils/fixtures/api/en-GB/` JSON files and displays in the app.

---

## Technical Details

### Files to Modify

1. **`src/i18n/locales/en.json`** - Add profile data keys
2. **`src/store/slices/settingsSlice.ts`** - Ensure language state handles 'en-GB'
3. **`src/features/Home/HomeScreen.tsx`** - Display profile data from i18n

### Files to Create

1. **`src/hooks/useProfileData.ts`** - Custom hook for loading profile data
2. **`src/types/profile.ts`** - TypeScript types for profile data structures
3. **`src/test-utils/fixtures/api/en-GB/__tests__/profile.test.ts`** - Test profile data loading

### Implementation

**Before**:

```typescript
// Profile data hardcoded or missing
const HomeScreen = () => {
  return <Text>Warren de Leon</Text>;
};
```

**After**:

```typescript
// src/hooks/useProfileData.ts
import { useTranslation } from 'react-i18next';

export const useProfileData = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language; // 'en-GB', 'es-ES', etc.

  const profileData = useMemo(() => {
    // Load from locale-specific JSON files
    return require(`@app/test-utils/fixtures/api/${locale}/profile.json`);
  }, [locale]);

  return profileData;
};

// src/features/Home/HomeScreen.tsx
const HomeScreen = () => {
  const profileData = useProfileData();

  return (
    <Box>
      <Text>{profileData.name}</Text>
      <Text>{profileData.title}</Text>
      <Text>{profileData.summary}</Text>
    </Box>
  );
};
```

### Why This Matters

1. **Complete i18n**: Extends i18n beyond UI strings to actual content data
2. **User Experience**: Profile content matches selected language
3. **Pattern Establishment**: Creates reusable pattern for other languages (TASK-041 to TASK-044)

---

## Acceptance Criteria

- [ ] `useProfileData` hook created and exports profile, work experience, education, skills
- [ ] TypeScript types defined for all profile data structures
- [ ] English (UK) profile data loads from `src/test-utils/fixtures/api/en-GB/` when language is 'en-GB'
- [ ] HomeScreen displays profile data using `useProfileData` hook
- [ ] Language switcher triggers re-fetch of profile data
- [ ] Redux language state correctly triggers hook updates
- [ ] Unit tests for `useProfileData` hook pass (100% coverage)
- [ ] Integration test verifies English (UK) profile data displays
- [ ] TypeScript compilation passes (`yarn typecheck`)
- [ ] ESLint passes (`yarn lint`)
- [ ] All existing tests pass (`yarn test`)

---

## Test Scenarios

**Scenario 1: Load English (UK) Profile Data**

```gherkin
Given the app language is set to "en-GB"
When the Home screen renders
Then profile data should load from en-GB JSON files
And display "Warren de Leon" as the name
And display "Senior Software Engineer" as the title
```

**Scenario 2: Language Change Updates Profile**

```gherkin
Given the Home screen is displaying English (UK) profile
When the user changes language to Spanish (Spain)
Then profile data should reload from es-ES JSON files
And all profile content should update to Spanish
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
- [ ] Tests written and passing (100% coverage for hook)
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

**Blockers**: TASK-035 (English UK profile data files must exist)

**Blocks**: TASK-041, TASK-042, TASK-043, TASK-044 (other languages follow this pattern)

**Enables**: Complete English (UK) multilingual experience

---

## Git & PR Information

**Branch Name**: `feature/TASK-040-implement-english-uk-support`

**PR Link**: _Not yet created_

**PR Status**: _N/A_

**Commit Hash**: _Not yet committed_

---

## Code Quality Metrics

**Code Coverage**: 100% (target for useProfileData hook)

**Files Modified**: 3

**Files Created**: 3

**Review Time**: _To be tracked_

**Rework Count**: 0

---

## Implementation Notes

**Key Changes**:

- Create `useProfileData` custom hook with locale-based data loading
- Add TypeScript types for profile, work experience, education, skills
- Update HomeScreen to use hook instead of hardcoded data
- Add unit tests for hook (mock i18n language changes)
- Add integration test for Home screen with profile data

**Validation Results**:

- TypeScript: _To be checked_
- ESLint: _To be checked_
- Tests: _To be checked_
- Coverage: _To be checked_ (target 100% for hook)

**Impact**: Enables English (UK) users to view complete profile in British English

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

✅ `useProfileData` hook created with 100% test coverage
✅ TypeScript types validate all profile data
✅ English (UK) profile loads from en-GB JSON files
✅ Language changes trigger profile data reload
✅ All tests pass with no regressions

---

## Verification

**Verified**: No

**Verification Steps**:

1. Run `yarn test useProfileData.test.ts` - 100% coverage
2. Run `yarn typecheck` - passes without errors
3. Launch app in simulator, verify English (UK) profile displays
4. Switch language, verify profile data reloads
5. Run full test suite - all tests pass

---

## Related Tasks

- [TASK-035](./TASK-035-copy-english-uk-profile-data.md) - English UK profile data (blocker)
- [TASK-041](./TASK-041-implement-spanish-spain-support.md) - Spanish implementation
- [TASK-042](./TASK-042-implement-polish-support.md) - Polish implementation

---

## References

- [Epic EPIC-005](../epics/EPIC-005-internationalization.md)
- [User Story US-006](../stories/US-006-multi-language-profile-data.md)
- [React i18next Hooks](https://react.i18next.com/latest/usetranslation-hook)

---

**Last Updated**: 2025-01-12
