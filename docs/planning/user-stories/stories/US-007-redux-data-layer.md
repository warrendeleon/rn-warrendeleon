# US-007: Redux Data Layer

**Story ID**: US-007
**Title**: Redux Data Layer with GitHub Fetching
**Epic**: [EPIC-005: Multi-Language Portfolio Data Layer](../epics/EPIC-005-multi-language-portfolio-data-layer.md)
**Status**: Backlog
**Priority**: High
**Created**: 2025-01-12
**Assigned To**: Warren de Leon
**Category**: State Management

---

## User Story

**As a** developer,
**I want** Redux slices for profile data with GitHub fetching via Axios,
**So that** data persists in the app and can be loaded from GitHub on demand.

---

## Context & Rationale

Implement complete Redux data layer following Redux Toolkit best practices, using async thunks for GitHub data fetching, selectors for data access, and redux-persist for offline-first architecture.

---

## Acceptance Criteria

- [ ] Axios GitHub API client configured
- [ ] Profile Redux slice with async thunk
- [ ] WorkXP Redux slice with async thunk
- [ ] Education Redux slice with async thunk
- [ ] redux-persist configured (settings only)
- [ ] Unit tests for all slices (100% coverage)
- [ ] Data fetches from correct locale-specific URLs

---

## Story Points & Effort

**Story Points**: 5
**Effort Estimate**: 7.5 hours

---

## Tasks

| ID                                                             | Task                           | Effort | Status |
| -------------------------------------------------------------- | ------------------------------ | ------ | ------ |
| [TASK-031](../tasks/TASK-031-setup-axios-github-api-client.md) | Set up Axios GitHub API client | 1h     | To Do  |
| [TASK-032](../tasks/TASK-032-create-profile-redux-slice.md)    | Create profile Redux slice     | 1.5h   | To Do  |
| [TASK-033](../tasks/TASK-033-create-workxp-redux-slice.md)     | Create workXP Redux slice      | 1h     | To Do  |
| [TASK-034](../tasks/TASK-034-create-education-redux-slice.md)  | Create education Redux slice   | 1h     | To Do  |
| [TASK-035](../tasks/TASK-035-configure-redux-persist.md)       | Configure redux-persist        | 0.5h   | To Do  |
| [TASK-036](../tasks/TASK-036-unit-tests-redux-layer.md)        | Add unit tests for Redux layer | 2h     | To Do  |

---

**Last Updated**: 2025-01-12
