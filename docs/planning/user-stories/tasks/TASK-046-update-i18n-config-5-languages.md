# TASK-046: Update i18n Config for 5 Languages

**Task ID**: TASK-046
**Title**: Update i18n Config for 5 Languages
**Epic**: [EPIC-005: Multi-Language Portfolio App](../epics/EPIC-005-multi-language-portfolio-app.md)
**User Story**: [US-009-internationalization](../stories/US-009-internationalization.md)
**Status**: Done
**Priority**: Medium
**Created**: 2025-01-12
**Assigned To**: Warren de Leon
**Category**: Implementation

---

## Context

Update i18n configuration to support all 5 languages.

---

## Acceptance Criteria

- [x] src/i18n/resources.ts updated
- [x] ca, pl, tl added to resources
- [x] Language detection supports all 5
- [x] Tests pass

---

## Story Points & Effort

**Story Points**: N/A
**Effort Estimate**: 0.5h

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

Updated `src/i18n/resources.ts` to import and export all 5 language resources (ca, en, es, pl, tl). The i18n configuration in `src/i18n/index.ts` already has the language detection logic via `resolveLanguageTag()` that automatically supports any languages in the resources object.

TypeScript types automatically update due to `typeof resources` pattern.

---

**Last Updated**: 2025-01-14
