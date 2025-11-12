# TASK-045: Configure iOS Native Localisation

**Task ID**: TASK-045
**Title**: Configure iOS Native Localisation
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

Configure iOS native platform support for all 5 languages (en-GB, es-ES, pl-PL, ca-ES, tl-PH) by updating Info.plist with CFBundleLocalizations. This ensures iOS recognizes the app supports these languages and integrates properly with system settings.

**Current State**: iOS Info.plist likely only lists en (English) and es (Spanish) as supported localisations.

**Desired State**: Info.plist declares all 5 supported languages, iOS Settings recognises the app as multilingual, and system integration works correctly (date formatting, number formatting, etc.).

---

## Technical Details

### Files to Modify

1. **`ios/warrendeleon/Info.plist`** - Add CFBundleLocalizations array with all 5 locales

### Implementation

**Before**:

```xml
<!-- Info.plist - Current state -->
<key>CFBundleLocalizations</key>
<array>
  <string>en</string>
  <string>es</string>
</array>
```

**After**:

```xml
<!-- Info.plist - All 5 languages declared -->
<key>CFBundleLocalizations</key>
<array>
  <string>en-GB</string>
  <string>es-ES</string>
  <string>pl-PL</string>
  <string>ca-ES</string>
  <string>tl-PH</string>
</array>
```

### Why This Matters

1. **System Integration**: iOS uses this to recognise supported languages
2. **App Store**: Declares available languages in App Store Connect
3. **Native Formatting**: Enables proper date/number/currency formatting per locale
4. **Settings Integration**: App appears in iOS Settings > Language & Region

---

## Acceptance Criteria

- [ ] `ios/warrendeleon/Info.plist` updated with CFBundleLocalizations array
- [ ] All 5 locales declared: en-GB, es-ES, pl-PL, ca-ES, tl-PH
- [ ] iOS build succeeds after changes
- [ ] iOS Settings recognises app as multilingual
- [ ] App launches without errors on iOS simulator
- [ ] Language preference persists across app restarts
- [ ] TypeScript compilation passes (`yarn typecheck`)
- [ ] iOS build passes (`yarn ios`)

---

## Test Scenarios

**Scenario 1: iOS Recognises All Languages**

```gherkin
Given Info.plist declares all 5 languages
When the iOS app is built
Then iOS Settings should recognise the app supports 5 languages
And no build errors should occur
```

**Scenario 2: System Integration Works**

```gherkin
Given the app is installed on iOS
When the user changes device language to Polish
And launches the app
Then the app should detect Polish as system language
And offer Polish as a language option
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
- [ ] Info.plist updated correctly
- [ ] iOS build succeeds
- [ ] No regressions in iOS functionality
- [ ] PR merged to main
- [ ] Documentation updated (if needed)

---

## Story Points & Effort

**Story Points**: 1
**Effort Estimate**: 1 hour
**Actual Effort**: _To be tracked_

---

## Dependencies

**Blockers**: TASK-040, TASK-041, TASK-042, TASK-043, TASK-044 (all language implementations should be complete)

**Blocks**: None

**Enables**: Complete iOS native multilingual support

---

## Git & PR Information

**Branch Name**: `feature/TASK-045-configure-ios-native-localization`

**PR Link**: _Not yet created_

**PR Status**: _N/A_

**Commit Hash**: _Not yet committed_

---

## Code Quality Metrics

**Code Coverage**: N/A (configuration file)

**Files Modified**: 1

**Files Created**: 0

**Review Time**: _To be tracked_

**Rework Count**: 0

---

## Implementation Notes

**Key Changes**:

- Update `ios/warrendeleon/Info.plist` with CFBundleLocalizations array
- Declare all 5 locales: en-GB, es-ES, pl-PL, ca-ES, tl-PH
- Clean Xcode Derived Data after changes
- Rebuild iOS app to apply changes

**Validation Results**:

- iOS Build: _To be checked_
- Language Recognition: _To be checked_
- System Integration: _To be checked_

**Impact**: Enables iOS native recognition of 5 supported languages

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

✅ CFBundleLocalizations array includes all 5 locales
✅ iOS build succeeds without errors
✅ iOS Settings recognises app as multilingual
✅ No regressions in iOS functionality

---

## Verification

**Verified**: No

**Verification Steps**:

1. Update Info.plist with all 5 locales
2. Clean Xcode Derived Data: `Product > Clean Build Folder`
3. Run `yarn ios` - build succeeds
4. Launch app in simulator - no errors
5. Check iOS Settings > Language & Region - app appears
6. Verify language preference persists across app restarts

---

## Related Tasks

- [TASK-040](./TASK-040-implement-english-uk-support.md) - English implementation (blocker)
- [TASK-044](./TASK-044-implement-tagalog-support.md) - Tagalog implementation (blocker)
- [TASK-046](./TASK-046-configure-android-native-localization.md) - Android native config

---

## References

- [Epic EPIC-005](../epics/EPIC-005-internationalization.md)
- [User Story US-006](../stories/US-006-multi-language-profile-data.md)
- [Apple iOS Localisation Guide](https://developer.apple.com/documentation/xcode/localization)
- [CFBundleLocalizations Documentation](https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundlelocalizations)

---

**Last Updated**: 2025-01-12
