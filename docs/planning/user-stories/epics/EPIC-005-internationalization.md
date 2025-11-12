# EPIC-005: Internationalization

**Epic ID**: EPIC-005
**Title**: Multi-Language Support with Profile Data
**Status**: Not Started
**Priority**: High
**Created**: 2025-01-12
**Owner**: Warren de Leon
**Category**: Internationalization

---

## Executive Summary

Expand app's language support from 2 to 5 languages with comprehensive profile data localisation, enabling native-language experiences for English (UK), Spanish (Spain), Polish, Catalan, and Tagalog speakers.

**Business Impact**: 3x language coverage, expanded market reach, localised professional profiles for multilingual audiences

---

## Business Value

### Problem

Current limitations restrict market reach:

- **Limited Languages**: Only English (UK) and Spanish (Spain) supported
- **Missing Locales**: No support for Polish, Catalan, or Tagalog speakers
- **Profile Data Gap**: Professional profile content not available in all target languages
- **Native Config Missing**: iOS/Android native localisation not configured for new languages

This leads to:

- Lost users in Poland, Catalonia, and Philippines markets
- Poor user experience for non-English/Spanish speakers
- Incomplete language switcher functionality
- Reduced professional profile accessibility for multilingual job markets

### Opportunity

By adding 3 new languages with full profile data:

- **Market Expansion**: Reach Polish (~50M speakers), Catalan (~10M), Tagalog (~90M)
- **Professional Presence**: Localised CV/portfolio for target job markets
- **Better UX**: Complete native-language experience across entire app
- **Competitive Edge**: Few portfol

io apps offer this breadth of localisation

- **Future-Ready**: Scalable i18n infrastructure for additional languages

### Success Metrics

| Metric                       | Current | Target | Business Impact            |
| ---------------------------- | ------- | ------ | -------------------------- |
| Supported languages          | 2       | 5      | +150% language coverage    |
| Profile data completeness    | 40%     | 100%   | Full multilingual content  |
| Native platform locales      | 2       | 5      | iOS/Android native support |
| Language switcher options    | 2       | 5      | Complete functionality     |
| E2E language switching tests | 0       | 5      | Quality assurance          |

---

## Scope

### In Scope

**Data Migration** (5 languages):

- English (UK) profile, work experience, education JSON files
- Spanish (Spain) profile, work experience, education JSON files
- Polish profile, work experience, education JSON files
- Catalan profile, work experience, education JSON files
- Tagalog profile, work experience, education JSON files

**Implementation**:

- i18n locale files for all 5 languages
- Redux language selector support for new languages
- Data fetching infrastructure (axios) for all locales
- Unit tests for language switching

**Native Platform Configuration**:

- iOS Info.plist CFBundleLocalizations
- Android values-{locale}/strings.xml resources

**E2E Testing**:

- Detox + Cucumber language switching tests for all 5 languages

### Out of Scope

- Right-to-left (RTL) language support (not needed for target languages)
- Translation management system integration (manual for now)
- Automated translation (human-quality translations required)
- Dynamic language loading (bundle all at build time)

---

## Timeline & Dates

**Start Date**: 2025-01-12
**Target Date**: 2025-01-15
**Completed Date**: _Not yet completed_

**Estimated Duration**: 3 days (16 hours total)

---

## Budget & Resources

**Budget**: £0
**Actual Cost**: _To be tracked_
**Total Effort**: 16 hours
**Actual Effort**: _To be tracked_

---

## Stakeholders

**Owner**: Warren de Leon
**Stakeholders**: International users, recruitment teams, translation reviewers

---

## ROI & Risk

**ROI Score**: High
**Risk Level**: Low

### Key Risks

**Risk 1**: Translation Quality

- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**: Use human translators for Polish/Catalan/Tagalog; verify with native speakers

**Risk 2**: Data File Structure Inconsistencies

- **Likelihood**: Low
- **Impact**: Medium
- **Mitigation**: Validate JSON structure; Prettier auto-sorts keys; comprehensive tests

**Risk 3**: Platform Locale Configuration Errors

- **Likelihood**: Low
- **Impact**: Low
- **Mitigation**: Test language switching on both iOS and Android; verify native behaviour

---

## User Stories

| ID                                                         | User Story                            | Status      | Story Points |
| ---------------------------------------------------------- | ------------------------------------- | ----------- | ------------ |
| [US-006](../stories/US-006-multi-language-profile-data.md) | Multi-Language Profile Data Migration | Not Started | 13           |

**Total Stories**: 1

---

## Tasks

| ID                                                                     | Task                                       | Status | Effort | Priority |
| ---------------------------------------------------------------------- | ------------------------------------------ | ------ | ------ | -------- |
| [TASK-035](../tasks/TASK-035-copy-english-uk-profile-data.md)          | Copy English (UK) Profile Data             | To Do  | 0.5h   | High     |
| [TASK-036](../tasks/TASK-036-copy-spanish-spain-profile-data.md)       | Copy Spanish (Spain) Profile Data          | To Do  | 0.5h   | High     |
| [TASK-037](../tasks/TASK-037-copy-polish-profile-data.md)              | Copy Polish Profile Data                   | To Do  | 1h     | Medium   |
| [TASK-038](../tasks/TASK-038-copy-catalan-profile-data.md)             | Copy Catalan Profile Data                  | To Do  | 1h     | Medium   |
| [TASK-039](../tasks/TASK-039-copy-tagalog-profile-data.md)             | Copy Tagalog Profile Data                  | To Do  | 1h     | Medium   |
| [TASK-040](../tasks/TASK-040-implement-english-uk-support.md)          | Implement English (UK) Language Support    | To Do  | 2h     | High     |
| [TASK-041](../tasks/TASK-041-implement-spanish-spain-support.md)       | Implement Spanish (Spain) Language Support | To Do  | 2h     | High     |
| [TASK-042](../tasks/TASK-042-implement-polish-support.md)              | Implement Polish Language Support          | To Do  | 2h     | Medium   |
| [TASK-043](../tasks/TASK-043-implement-catalan-support.md)             | Implement Catalan Language Support         | To Do  | 2h     | Medium   |
| [TASK-044](../tasks/TASK-044-implement-tagalog-support.md)             | Implement Tagalog Language Support         | To Do  | 2h     | Medium   |
| [TASK-045](../tasks/TASK-045-configure-ios-native-localization.md)     | Configure iOS Native Localisation          | To Do  | 1h     | High     |
| [TASK-046](../tasks/TASK-046-configure-android-native-localization.md) | Configure Android Native Localisation      | To Do  | 1h     | High     |

**Total Tasks**: 12
**Total Effort**: 16 hours

---

## Definition of Done

This epic is complete when:

1. ✅ All 5 Languages Supported: en-GB, es-ES, pl-PL, ca-ES, tl-PH fully functional
2. ✅ Complete Profile Data: All JSON files migrated for all languages
3. ✅ Native Configuration: iOS and Android recognise all 5 locales
4. ✅ E2E Tests Pass: Language switching verified on both platforms
5. ✅ No Regressions: Existing en/es functionality unchanged

---

## Status History

_Auto-tracked when status changes_

| Date       | Status      | Notes        |
| ---------- | ----------- | ------------ |
| 2025-01-12 | Not Started | Epic created |

---

## Related Epics

- Future: Translation management system integration
- Future: Additional language support (French, German, etc.)

---

## References

- [i18next Documentation](https://www.i18next.com/)
- [React i18next](https://react.i18next.com/)
- [iOS Localization Guide](https://developer.apple.com/documentation/xcode/localization)
- [Android Localization Guide](https://developer.android.com/guide/topics/resources/localization)
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)

---

**Last Updated**: 2025-01-12
