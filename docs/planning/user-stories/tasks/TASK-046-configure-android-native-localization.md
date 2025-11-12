# TASK-046: Configure Android Native Localisation

**Task ID**: TASK-046
**Title**: Configure Android Native Localisation
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

Configure Android native platform support for all 5 languages (en-GB, es-ES, pl-PL, ca-ES, tl-PH) by creating values-{locale}/strings.xml resource directories. This ensures Android recognises the app supports these languages and integrates properly with system settings.

**Current State**: Android values/ directory likely only has values/ (default) and values-es/ (Spanish) resource directories.

**Desired State**: Android has values-en-rGB/, values-es-rES/, values-pl-rPL/, values-ca-rES/, values-tl-rPH/ directories with strings.xml declaring app name localisation, enabling system integration.

---

## Technical Details

### Files to Create

1. **`android/app/src/main/res/values-en-rGB/strings.xml`** - English (UK) resources
2. **`android/app/src/main/res/values-es-rES/strings.xml`** - Spanish (Spain) resources
3. **`android/app/src/main/res/values-pl-rPL/strings.xml`** - Polish resources
4. **`android/app/src/main/res/values-ca-rES/strings.xml`** - Catalan resources
5. **`android/app/src/main/res/values-tl-rPH/strings.xml`** - Tagalog resources

### Implementation

**Directory Structure**:

```
android/app/src/main/res/
├── values/
│   └── strings.xml (default/fallback)
├── values-en-rGB/
│   └── strings.xml
├── values-es-rES/
│   └── strings.xml
├── values-pl-rPL/
│   └── strings.xml
├── values-ca-rES/
│   └── strings.xml
└── values-tl-rPH/
    └── strings.xml
```

**Example strings.xml**:

```xml
<!-- values-en-rGB/strings.xml -->
<resources>
    <string name="app_name">Warren de Leon</string>
</resources>

<!-- values-es-rES/strings.xml -->
<resources>
    <string name="app_name">Warren de Leon</string>
</resources>

<!-- values-pl-rPL/strings.xml -->
<resources>
    <string name="app_name">Warren de Leon</string>
</resources>

<!-- values-ca-rES/strings.xml -->
<resources>
    <string name="app_name">Warren de Leon</string>
</resources>

<!-- values-tl-rPH/strings.xml -->
<resources>
    <string name="app_name">Warren de Leon</string>
</resources>
```

### Why This Matters

1. **System Integration**: Android uses this to recognise supported languages
2. **Google Play Store**: Declares available languages in Play Console
3. **Native Formatting**: Enables proper date/number/currency formatting per locale
4. **Settings Integration**: App appears in Android Settings > Language & Input

---

## Acceptance Criteria

- [ ] All 5 values-{locale}/ directories created with correct naming (en-rGB, es-rES, pl-rPL, ca-rES, tl-rPH)
- [ ] Each directory contains strings.xml with app_name resource
- [ ] Android build succeeds after changes
- [ ] Android Settings recognises app as multilingual
- [ ] App launches without errors on Android emulator
- [ ] Language preference persists across app restarts
- [ ] TypeScript compilation passes (`yarn typecheck`)
- [ ] Android build passes (`yarn android`)

---

## Test Scenarios

**Scenario 1: Android Recognises All Languages**

```gherkin
Given values-{locale}/ directories exist for all 5 languages
When the Android app is built
Then Android Settings should recognise the app supports 5 languages
And no build errors should occur
```

**Scenario 2: System Integration Works**

```gherkin
Given the app is installed on Android
When the user changes device language to Catalan
And launches the app
Then the app should detect Catalan as system language
And offer Catalan as a language option
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
- [ ] All 5 values-{locale}/ directories created
- [ ] Android build succeeds
- [ ] No regressions in Android functionality
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

**Enables**: Complete Android native multilingual support

---

## Git & PR Information

**Branch Name**: `feature/TASK-046-configure-android-native-localization`

**PR Link**: _Not yet created_

**PR Status**: _N/A_

**Commit Hash**: _Not yet committed_

---

## Code Quality Metrics

**Code Coverage**: N/A (configuration files)

**Files Modified**: 0

**Files Created**: 5

**Review Time**: _To be tracked_

**Rework Count**: 0

---

## Implementation Notes

**Key Changes**:

- Create values-en-rGB/ directory with strings.xml
- Create values-es-rES/ directory with strings.xml
- Create values-pl-rPL/ directory with strings.xml
- Create values-ca-rES/ directory with strings.xml
- Create values-tl-rPH/ directory with strings.xml
- Clean Android build after changes
- Rebuild Android app to apply changes

**Validation Results**:

- Android Build: _To be checked_
- Language Recognition: _To be checked_
- System Integration: _To be checked_

**Impact**: Enables Android native recognition of 5 supported languages

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

✅ All 5 values-{locale}/ directories created with strings.xml
✅ Android build succeeds without errors
✅ Android Settings recognises app as multilingual
✅ No regressions in Android functionality

---

## Verification

**Verified**: No

**Verification Steps**:

1. Create all 5 values-{locale}/ directories
2. Add strings.xml to each directory with app_name resource
3. Clean Android build: `yarn clean:android`
4. Run `yarn android` - build succeeds
5. Launch app in emulator - no errors
6. Check Android Settings > Language & Input - app appears
7. Verify language preference persists across app restarts

---

## Related Tasks

- [TASK-040](./TASK-040-implement-english-uk-support.md) - English implementation (blocker)
- [TASK-044](./TASK-044-implement-tagalog-support.md) - Tagalog implementation (blocker)
- [TASK-045](./TASK-045-configure-ios-native-localization.md) - iOS native config

---

## References

- [Epic EPIC-005](../epics/EPIC-005-internationalization.md)
- [User Story US-006](../stories/US-006-multi-language-profile-data.md)
- [Android Localisation Guide](https://developer.android.com/guide/topics/resources/localization)
- [Android Resources Overview](https://developer.android.com/guide/topics/resources/providing-resources)

---

**Last Updated**: 2025-01-12
