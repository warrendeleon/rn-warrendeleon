# US-006: Multi-Language Profile Data Migration

**Story ID**: US-006
**Title**: Multi-Language Profile Data Migration
**Epic**: [EPIC-005: Internationalization](../epics/EPIC-005-internationalization.md)
**Status**: Backlog
**Priority**: High
**Created**: 2025-01-12
**Assigned To**: Warren de Leon
**Category**: Internationalization

---

## User Story

**As a** multilingual professional,
**I want** to view my profile, work experience, and education in my preferred language,
**So that** I can share my portfolio with recruiters and colleagues in their native language.

---

## Context & Rationale

Currently, the app supports only English (UK) and Spanish (Spain) for UI translations, but profile data (CV content, work experience, education) isn't fully localised across all target languages. This limits the app's usefulness for professionals targeting Polish, Catalan, or Tagalog-speaking job markets.

By migrating profile JSON data from the old repository and implementing i18n support for 5 languages (en-GB, es-ES, pl-PL, ca-ES, tl-PH), users can present their professional credentials authentically in multiple languages, improving their reach in international job markets.

**Real-world scenario**: A developer in Poland wants to share their portfolio with local companies. They switch the app to Polish and see their work experience, education, and skills described in natural Polish language, making it easier for recruiters to understand their background.

**Related Epic**: See [EPIC-005](../epics/EPIC-005-internationalization.md) for business impact and success metrics.

---

## Benefits

### User Experience

- Native-language profile viewing for 5 different language communities
- Seamless language switching without losing content quality
- Professional presentation in target job market's language
- Consistent localisation across UI and content

### Business Impact

- Expanded market reach to Polish (~50M), Catalan (~10M), Tagalog (~90M speakers)
- Increased user satisfaction with complete multilingual support
- Competitive advantage (few portfolio apps offer 5 languages)
- Foundation for future language expansion

### Technical Benefits

- Scalable i18n infrastructure for profile data
- Clean separation between UI translations and content data
- Reusable data fetching patterns for future content
- Comprehensive test coverage for language switching

---

## Impact & Effort

**Impact**: High
**Effort**: Medium
**Story Points**: 13

**Effort Estimate**: 16 hours
**Actual Effort**: _To be tracked_

---

## Risks & Mitigation

### Risk 1: Translation Quality

**Impact**: Poor translations damage professional credibility
**Likelihood**: Medium
**Mitigation**:

- Use human translators for Polish, Catalan, Tagalog content
- Verify translations with native speakers
- Maintain glossary for technical terms

### Risk 2: JSON Structure Inconsistencies

**Impact**: Runtime errors from malformed data files
**Likelihood**: Low
**Mitigation**:

- Validate JSON structure with TypeScript types
- Prettier auto-sorts keys alphabetically
- Comprehensive unit tests for data loading

---

## Pros & Cons

### Pros

✅ Reaches 150M+ additional language speakers globally
✅ Complete professional portfolio in 5 languages
✅ Native platform support (iOS/Android locale configuration)
✅ Future-proof infrastructure for more languages

### Cons

❌ Initial translation effort for Polish, Catalan, Tagalog
❌ Maintenance overhead for keeping 5 language versions in sync
❌ Storage overhead for 5x profile data JSON files

**Trade-off**: Maintenance cost justified by significantly expanded market reach and user satisfaction.

---

## Acceptance Criteria

### Functional

- [ ] All 5 languages load profile data without errors
- [ ] Language switcher shows all 5 options (English UK, Spanish Spain, Polish, Catalan, Tagalog)
- [ ] Profile, work experience, education data displays in selected language
- [ ] Data fetched from correct locale-specific JSON files
- [ ] Redux language state persists across app restarts

### Coverage

- [ ] Unit tests for language switching logic
- [ ] Unit tests for data fetching per locale
- [ ] E2E tests for language switcher on iOS and Android

### Technical

- [ ] iOS Info.plist includes all 5 CFBundleLocalizations
- [ ] Android values-{locale}/strings.xml created for all 5 locales
- [ ] JSON files pass Prettier formatting (alphabetically sorted keys)
- [ ] TypeScript types for profile data structures
- [ ] All existing tests pass
- [ ] No regressions in English/Spanish functionality

---

## Test Scenarios

### Scenario 1: Switch to Polish Language

```gherkin
Given I am on the Language screen
When I select "Polski" from the language list
Then the app UI should display in Polish
And my profile data should load from pl-PL JSON files
And work experience descriptions should be in Polish
And education details should be in Polish
```

### Scenario 2: Switch to Catalan Language

```gherkin
Given I am on the Language screen
When I select "Català" from the language list
Then the app UI should display in Catalan
And my profile data should load from ca-ES JSON files
And all professional content should be in Catalan
```

### Scenario 3: Switch to Tagalog Language

```gherkin
Given I am on the Language screen
When I select "Tagalog" from the language list
Then the app UI should display in Tagalog
And my profile data should load from tl-PH JSON files
And all CV content should be in Tagalog
```

### E2E Testing (Detox + Cucumber)

```gherkin
Scenario: Language switching persists across app restarts
  Given I am on the Language screen
  When I select "Polski" language
  And I restart the app
  Then the app should still display in Polish
  And profile data should still be in Polish
```

---

## Definition of Ready

- [x] User story statement written (As a/I want/So that)
- [x] Acceptance criteria defined
- [x] Story points estimated
- [x] Dependencies identified
- [x] Epic linked
- [x] Technical approach discussed

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Tests written and passing (unit + E2E)
- [ ] Documentation updated
- [ ] No regressions
- [ ] Deployed to staging
- [ ] Product owner approval

---

## Dependencies

### Blockers

None - can start immediately

### Enables

- Future language additions (French, German, etc.)
- Translation management system integration
- Localised marketing materials

---

## Tasks

| ID                                                                     | Task                                       | Effort | Priority | Status |
| ---------------------------------------------------------------------- | ------------------------------------------ | ------ | -------- | ------ |
| [TASK-035](../tasks/TASK-035-copy-english-uk-profile-data.md)          | Copy English (UK) Profile Data             | 0.5h   | High     | To Do  |
| [TASK-036](../tasks/TASK-036-copy-spanish-spain-profile-data.md)       | Copy Spanish (Spain) Profile Data          | 0.5h   | High     | To Do  |
| [TASK-037](../tasks/TASK-037-copy-polish-profile-data.md)              | Copy Polish Profile Data                   | 1h     | Medium   | To Do  |
| [TASK-038](../tasks/TASK-038-copy-catalan-profile-data.md)             | Copy Catalan Profile Data                  | 1h     | Medium   | To Do  |
| [TASK-039](../tasks/TASK-039-copy-tagalog-profile-data.md)             | Copy Tagalog Profile Data                  | 1h     | Medium   | To Do  |
| [TASK-040](../tasks/TASK-040-implement-english-uk-support.md)          | Implement English (UK) Language Support    | 2h     | High     | To Do  |
| [TASK-041](../tasks/TASK-041-implement-spanish-spain-support.md)       | Implement Spanish (Spain) Language Support | 2h     | High     | To Do  |
| [TASK-042](../tasks/TASK-042-implement-polish-support.md)              | Implement Polish Language Support          | 2h     | Medium   | To Do  |
| [TASK-043](../tasks/TASK-043-implement-catalan-support.md)             | Implement Catalan Language Support         | 2h     | Medium   | To Do  |
| [TASK-044](../tasks/TASK-044-implement-tagalog-support.md)             | Implement Tagalog Language Support         | 2h     | Medium   | To Do  |
| [TASK-045](../tasks/TASK-045-configure-ios-native-localization.md)     | Configure iOS Native Localisation          | 1h     | High     | To Do  |
| [TASK-046](../tasks/TASK-046-configure-android-native-localization.md) | Configure Android Native Localisation      | 1h     | High     | To Do  |

**Total Tasks**: 12
**Total Effort**: 16 hours

---

## Implementation Phases

### Phase 1: Data Migration (4h)

Copy and validate JSON profile data files for all 5 languages:

- TASK-035: English (UK) baseline
- TASK-036: Spanish (Spain) existing
- TASK-037, 038, 039: Polish, Catalan, Tagalog new translations

**Validation**: JSON files pass Prettier, TypeScript types validate structure

### Phase 2: Language Implementation (10h)

Implement i18n support and data fetching for each language:

- TASK-040, 041: English (UK), Spanish (Spain) - update existing
- TASK-042, 043, 044: Polish, Catalan, Tagalog - implement new

**Validation**: Language switcher shows all 5 options, profile data loads correctly

### Phase 3: Native Platform Configuration (2h)

Configure iOS and Android native locale support:

- TASK-045: iOS Info.plist CFBundleLocalizations
- TASK-046: Android values-{locale}/strings.xml resources

**Validation**: Native OS recognises all 5 languages, system integration works

---

## Timeline & Dates

**Start Date**: 2025-01-12
**Completed Date**: _Not yet completed_

---

## Blocked Information

**Blocked Since**: _Not blocked_
**Blocked Reason**: _N/A_

---

## Status History

_Auto-tracked when status changes_

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2025-01-12 | Backlog | Story created |

---

## Work Log

_Manual developer notes for significant updates_

---

## Technical Debt

**Technical Debt Score**: 0

This story pays down i18n debt by completing multilingual support infrastructure.

---

## Success Criteria

This user story is complete when:

1. ✅ All 5 languages functional with complete profile data
2. ✅ Language switcher works on iOS and Android
3. ✅ Native platform locale configuration complete
4. ✅ All 12 tasks complete
5. ✅ All tests passing (unit + E2E)
6. ✅ Documentation updated

---

## Alternative Approaches

### Alternative 1: Server-Side Translation API

Fetch translations from backend API instead of bundling JSON files.

**Pros**: Easier to update translations, smaller app bundle
**Cons**: Requires network connection, adds backend complexity, latency

**Decision**: Use bundled JSON files for offline-first experience, simpler implementation

### Alternative 2: Machine Translation

Use Google Translate API for Polish, Catalan, Tagalog content.

**Pros**: Faster implementation, no human translator cost
**Cons**: Poor quality for professional content, lacks context, unnatural phrasing

**Decision**: Use human translations to maintain professional quality

---

## Notes & Learnings

_To be filled in during/after implementation_

---

## References

- [Epic EPIC-005](../epics/EPIC-005-internationalization.md)
- [i18next Documentation](https://www.i18next.com/)
- [React i18next](https://react.i18next.com/)

---

**Last Updated**: 2025-01-12
