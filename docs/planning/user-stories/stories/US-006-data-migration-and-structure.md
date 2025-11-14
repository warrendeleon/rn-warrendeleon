# US-006: Data Migration & Structure

**Story ID**: US-006
**Title**: Data Migration & Structure
**Epic**: [EPIC-005: Multi-Language Portfolio Data Layer](../epics/EPIC-005-multi-language-portfolio-data-layer.md)
**Status**: Backlog
**Priority**: High
**Created**: 2025-01-12
**Assigned To**: Warren de Leon
**Category**: Data Management

---

## User Story

**As a** developer,
**I want** the profile data migrated from the old repo and structured for multi-language support,
**So that** the app can fetch and display localized portfolio content from GitHub.

---

## Context & Rationale

The old repository contains complete profile data (work experience, education, skills) in English and Spanish. This data needs to be copied to the new codebase, translated to 3 additional languages (Catalan, Polish, Tagalog), and structured in a way that:

1. Can be fetched from GitHub raw content API
2. Can be used locally in E2E tests (no network calls)
3. Has proper TypeScript type safety

---

## Acceptance Criteria

- [x] Data copied from old repo to `src/test-utils/fixtures/api/en/` and `/es/`
- [x] Catalan translations in `src/test-utils/fixtures/api/ca/`
- [x] Polish translations in `src/test-utils/fixtures/api/pl/`
- [x] Tagalog translations in `src/test-utils/fixtures/api/tl/`
- [ ] TypeScript types created (Profile, WorkXP, Education, Client)
- [x] All JSON files pass Prettier formatting
- [ ] Data structure validated against types

---

## Story Points & Effort

**Story Points**: 3
**Effort Estimate**: 4.5 hours

---

## Tasks

| ID                                                         | Task                          | Effort | Status |
| ---------------------------------------------------------- | ----------------------------- | ------ | ------ |
| [TASK-026](../tasks/TASK-026-copy-english-spanish-data.md) | Copy en/es data from old repo | 0.5h   | Done   |
| [TASK-027](../tasks/TASK-027-translate-catalan-data.md)    | Translate Catalan data        | 1h     | Done   |
| [TASK-028](../tasks/TASK-028-translate-polish-data.md)     | Translate Polish data         | 1h     | Done   |
| [TASK-029](../tasks/TASK-029-translate-tagalog-data.md)    | Translate Tagalog data        | 1h     | Done   |
| [TASK-030](../tasks/TASK-030-create-typescript-types.md)   | Create TypeScript types       | 1h     | To Do  |

---

**Last Updated**: 2025-01-14
