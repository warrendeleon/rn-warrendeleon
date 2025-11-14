# TASK-049: Update Language Selector UI

**Task ID**: TASK-049
**Title**: Update Language Selector UI
**Epic**: [EPIC-005: Multi-Language Portfolio App](../epics/EPIC-005-multi-language-portfolio-app.md)
**User Story**: [US-009-internationalization](../stories/US-009-internationalization.md)
**Status**: Done
**Priority**: Medium
**Created**: 2025-01-12
**Assigned To**: Warren de Leon
**Category**: Implementation

---

## Context

Update language selector in Settings to show all 5 language options.

---

## Acceptance Criteria

- [x] LanguageScreen shows 5 options
- [x] Language names displayed in their native language
- [x] Selection triggers i18n language change
- [x] Redux state updates correctly
- [x] Tests pass

---

## Story Points & Effort

**Story Points**: N/A
**Effort Estimate**: 1h

---

## Definition of Ready

- [x] Task description clear
- [x] Acceptance criteria defined

---

## Definition of Done

- [x] All acceptance criteria met
- [x] Tests passing
- [x] No regressions

---

## Implementation Notes

Updated `src/features/Settings/LanguageScreen.tsx` to display all 5 language options:

- English
- Spanish (Español)
- Catalan (Català)
- Polish (Polski)
- Tagalog

Also updated the `Language` type in `src/features/Settings/store/reducer.ts` from `'en' | 'es'` to `'en' | 'es' | 'ca' | 'pl' | 'tl'`.

Language names are displayed using translation keys (e.g., `t('language.english')`) so they appear in the currently selected language.

---

**Last Updated**: 2025-01-14
