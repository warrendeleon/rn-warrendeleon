# TASK-026: Copy English/Spanish Data from Old Repo

**Task ID**: TASK-026
**Title**: Copy English/Spanish Data from Old Repo
**Epic**: [EPIC-005: Multi-Language Portfolio App](../epics/EPIC-005-multi-language-portfolio-app.md)
**User Story**: [US-006-data-migration-and-structure](../stories/US-006-data-migration-and-structure.md)
**Status**: Done
**Priority**: High
**Created**: 2025-01-12
**Assigned To**: Warren de Leon
**Category**: Implementation

---

## Context

Copy profile.json, workxp.json, education.json from old repo to src/test-utils/fixtures/api/en/ and /es/

---

## Acceptance Criteria

- [x] en/ folder created with 3 JSON files
- [x] es/ folder created with 3 JSON files
- [x] JSON files pass Prettier formatting
- [x] All typos fixed (warrrendeleon.com, Desarrollow)

---

## Story Points & Effort

**Story Points**: N/A (part of story)
**Effort Estimate**: 0.5h

---

## Definition of Ready

- [x] Task description clear
- [x] Acceptance criteria defined
- [x] Story points estimated
- [x] Dependencies identified

---

## Definition of Done

- [x] All acceptance criteria met
- [x] Code reviewed
- [x] Tests passing
- [x] No regressions

---

## Implementation Notes

Successfully copied profile, work experience, and education data from old repository to new structure:

**Created files:**

- `src/test-utils/fixtures/api/en/profile.json`
- `src/test-utils/fixtures/api/en/workxp.json`
- `src/test-utils/fixtures/api/en/education.json`
- `src/test-utils/fixtures/api/es/profile.json`
- `src/test-utils/fixtures/api/es/workxp.json`
- `src/test-utils/fixtures/api/es/education.json`

**Typos fixed:**

- Email: "warrrendeleon.com" → "warrendeleon.com" (removed extra 'r')
- Spanish education: "Desarrollow" → "Desarrollo" (removed extra 'w')
- JSON syntax: Escaped quotes in "La CaixaBank" for valid JSON

All files formatted with Prettier and pass validation.

---

**Last Updated**: 2025-01-14
