# US-009: Internationalization (5 Languages)

**Story ID**: US-009
**Title**: Internationalization with 5 Languages
**Epic**: [EPIC-005: Multi-Language Portfolio Data Layer](../epics/EPIC-005-multi-language-portfolio-data-layer.md)
**Status**: Backlog
**Priority**: Medium
**Created**: 2025-01-12
**Assigned To**: Warren de Leon
**Category**: Internationalization

---

## User Story

**As a** user,
**I want** to switch between 5 languages (en, es, ca, pl, tl) with localized UI and content,
**So that** I can use the app in my preferred language.

---

## Context & Rationale

Extend i18n support from 2 to 5 languages, adding UI translations and native platform configuration for Catalan, Polish, and Tagalog.

---

## Acceptance Criteria

- [ ] i18n locale files translated (ca.json, pl.json, tl.json)
- [ ] i18n config updated for 5 languages
- [ ] iOS Info.plist includes all 5 CFBundleLocalizations
- [ ] Android strings.xml created for all 5 locales
- [ ] Language selector UI shows all 5 options
- [ ] Language switching triggers correct data reload

---

## Story Points & Effort

**Story Points**: 3
**Effort Estimate**: 5 hours

---

## Tasks

| ID                                                                   | Task                                     | Effort | Status |
| -------------------------------------------------------------------- | ---------------------------------------- | ------ | ------ |
| [TASK-045](../tasks/TASK-045-translate-i18n-locale-files.md)         | Translate i18n locale files (ca, pl, tl) | 2h     | To Do  |
| [TASK-046](../tasks/TASK-046-update-i18n-config-5-languages.md)      | Update i18n config for 5 languages       | 0.5h   | To Do  |
| [TASK-047](../tasks/TASK-047-configure-ios-info-plist-languages.md)  | Configure iOS Info.plist                 | 0.5h   | To Do  |
| [TASK-048](../tasks/TASK-048-configure-android-strings-languages.md) | Configure Android strings.xml            | 1h     | To Do  |
| [TASK-049](../tasks/TASK-049-update-language-selector-ui.md)         | Update language selector UI              | 1h     | To Do  |

---

**Last Updated**: 2025-01-12
