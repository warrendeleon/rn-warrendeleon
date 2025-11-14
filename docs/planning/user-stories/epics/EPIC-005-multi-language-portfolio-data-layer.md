# EPIC-005: Multi-Language Portfolio Data Layer

**Epic ID**: EPIC-005
**Title**: Multi-Language Portfolio Data Layer
**Status**: In Progress
**Priority**: High
**Created**: 2025-01-12
**Updated**: 2025-01-14
**Owner**: Warren de Leon
**Category**: State Management / Data Architecture

---

## Executive Summary

Build a robust multi-language data layer for portfolio content, fetching profile data from GitHub and supporting 5 languages (English, Spanish, Catalan, Polish, Tagalog) with full Redux state management and offline-first persistence.

**Business Impact**: Complete professional portfolio data architecture with international reach, offline-first design, and production-ready state management.

**Scope Change (2025-01-14)**: Splash screen functionality moved to EPIC-006 to create focused, manageable epics with clear technical boundaries.

---

## Business Value

### Problem

Current app lacks:

- **Profile Data Layer**: No way to display work experience, education, skills
- **Data Fetching**: No integration with external data sources
- **Multi-language Content**: UI translations exist but no content data in multiple languages
- **State Persistence**: No offline data storage

This leads to:

- Incomplete portfolio presentation
- Limited international audience
- Data fetched repeatedly (no caching)
- Poor offline experience

### Opportunity

By implementing complete portfolio data layer:

- **Professional Presentation**: Full CV/portfolio with work experience, education, skills
- **GitHub Integration**: Fetch data from public GitHub repository (acts as CDN)
- **Multi-language**: Content available in 5 languages
- **Offline-First**: Redux-persist for cached data
- **Future-Ready**: Scalable architecture for additional features

### Success Metrics

| Metric               | Current | Target | Business Impact            |
| -------------------- | ------- | ------ | -------------------------- |
| Supported languages  | 2 (UI)  | 5      | +150% language coverage    |
| Data sources         | 0       | 1      | GitHub integration         |
| Profile completeness | 0%      | 100%   | Full professional CV       |
| Data persistence     | No      | Yes    | Offline-first architecture |
| Redux slices         | 1       | 4      | Complete data layer        |
| Test coverage        | 0%      | 100%   | Data layer reliability     |

---

## Scope

### In Scope

**Data Management**:

- Copy profile data from old repo (en, es)
- Translate to 3 new languages (ca, pl, tl)
- Store in `src/test-utils/fixtures/api/{locale}/`
- TypeScript types for all data structures (Profile, WorkXP, Education, Client)

**Redux Data Layer**:

- Axios GitHub API client
- Profile, WorkXP, Education Redux slices
- Async thunks for data fetching
- Memoised selectors for data access
- redux-persist configuration (settings only)

**Internationalization**:

- Translate UI strings (ca.json, pl.json, tl.json)
- Update i18n config for 5 languages
- iOS/Android native locale configuration
- Language selector UI updates

**Testing**:

- RNTL tests for Redux layer (100% coverage)
- E2E tests for language switching
- E2E tests for data loading/persistence
- Mock GitHub API in tests

### Out of Scope

- **Splash screen** (moved to EPIC-006)
- Backend API (using GitHub raw content as CDN)
- User authentication
- Data editing/updating
- Video content integration
- Right-to-left (RTL) language support

---

## Timeline & Dates

**Start Date**: 2025-01-12
**Target Date**: 2025-01-18
**Completed Date**: _Not yet completed_

**Estimated Duration**: 6 days (~19 hours total)

---

## Budget & Resources

**Budget**: £0
**Actual Cost**: _To be tracked_
**Total Effort**: 19 hours (reduced from 28 after EPIC-006 split)
**Actual Effort**: _To be tracked_

---

## Stakeholders

**Owner**: Warren de Leon
**Stakeholders**: International users, recruiters, portfolio viewers

---

## ROI & Risk

**ROI Score**: High
**Risk Level**: Medium

### Key Risks

**Risk 1**: GitHub API Structure Changes

- **Likelihood**: Low
- **Impact**: High
- **Mitigation**: Use local fixtures as source of truth; GitHub is just a CDN; version control data structure

**Risk 2**: Translation Quality

- **Likelihood**: High
- **Impact**: Medium
- **Mitigation**: Use professional translations; verify with native speakers; iterative improvement approach

**Risk 3**: Redux-persist Conflicts

- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**: Only persist settings (not profile data); clear migration strategy; test thoroughly

**Risk 4**: Data Schema Evolution

- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**: Strong TypeScript types; schema versioning; migration utilities

---

## User Stories

| ID                                                          | User Story                 | Status      | Story Points |
| ----------------------------------------------------------- | -------------------------- | ----------- | ------------ |
| [US-006](../stories/US-006-data-migration-and-structure.md) | Data Migration & Structure | Completed   | 3            |
| [US-007](../stories/US-007-redux-data-layer.md)             | Redux Data Layer           | In Progress | 5            |
| [US-009](../stories/US-009-internationalization.md)         | Internationalization       | Completed   | 3            |
| [US-010](../stories/US-010-data-layer-testing.md)           | Data Layer Testing         | Not Started | 5            |

**Total Stories**: 4
**Total Story Points**: 16 (reduced from 21)

---

## Tasks

| ID                                                                   | Task                                     | Status | Effort | Priority |
| -------------------------------------------------------------------- | ---------------------------------------- | ------ | ------ | -------- |
| [TASK-026](../tasks/TASK-026-copy-english-spanish-data.md)           | Copy en/es data from old repo            | Done   | 0.5h   | High     |
| [TASK-027](../tasks/TASK-027-translate-catalan-data.md)              | Translate Catalan data                   | Done   | 1h     | High     |
| [TASK-028](../tasks/TASK-028-translate-polish-data.md)               | Translate Polish data                    | Done   | 1h     | High     |
| [TASK-029](../tasks/TASK-029-translate-tagalog-data.md)              | Translate Tagalog data                   | Done   | 1h     | High     |
| [TASK-030](../tasks/TASK-030-create-typescript-types.md)             | Create TypeScript types                  | Done   | 1h     | High     |
| [TASK-031](../tasks/TASK-031-setup-axios-github-api-client.md)       | Set up Axios GitHub API client           | Done   | 1h     | High     |
| [TASK-032](../tasks/TASK-032-create-profile-redux-slice.md)          | Create profile Redux slice               | Done   | 1.5h   | High     |
| [TASK-033](../tasks/TASK-033-create-workxp-redux-slice.md)           | Create workXP Redux slice                | Done   | 1h     | High     |
| [TASK-034](../tasks/TASK-034-create-education-redux-slice.md)        | Create education Redux slice             | Done   | 1h     | High     |
| [TASK-035](../tasks/TASK-035-configure-redux-persist.md)             | Configure redux-persist                  | Done   | 0.5h   | High     |
| [TASK-036](../tasks/TASK-036-unit-tests-redux-layer.md)              | Add unit tests for Redux layer           | To Do  | 2h     | High     |
| [TASK-045](../tasks/TASK-045-translate-i18n-locale-files.md)         | Translate i18n locale files (ca, pl, tl) | Done   | 2h     | Medium   |
| [TASK-046](../tasks/TASK-046-update-i18n-config-5-languages.md)      | Update i18n config for 5 languages       | Done   | 0.5h   | Medium   |
| [TASK-047](../tasks/TASK-047-configure-ios-info-plist-languages.md)  | Configure iOS Info.plist                 | Done   | 0.5h   | Medium   |
| [TASK-048](../tasks/TASK-048-configure-android-strings-languages.md) | Configure Android strings.xml            | Done   | 1h     | Medium   |
| [TASK-049](../tasks/TASK-049-update-language-selector-ui.md)         | Update language selector UI              | Done   | 1h     | Medium   |
| [TASK-050](../tasks/TASK-050-rntl-tests-redux-data-layer.md)         | RNTL tests for Redux data layer          | To Do  | 2h     | High     |
| [TASK-052](../tasks/TASK-052-e2e-tests-language-switching.md)        | E2E tests for language switching         | To Do  | 1.5h   | High     |
| [TASK-053](../tasks/TASK-053-e2e-tests-data-loading-persistence.md)  | E2E tests for data loading/persistence   | To Do  | 2h     | High     |
| [TASK-054](../tasks/TASK-054-mock-github-api-e2e-tests.md)           | Mock GitHub API in E2E tests             | To Do  | 1h     | High     |

**Total Tasks**: 20 (reduced from 29)
**Total Effort**: 19 hours (reduced from 28)

---

## Definition of Done

This epic is complete when:

1. ✅ All 5 Languages Supported: en, es, ca, pl, tl with UI + content data
2. ✅ GitHub Data Fetching: Profile, WorkXP, Education loaded from GitHub
3. ✅ Redux Data Layer: Complete with async thunks, memoised selectors, persistence
4. ✅ All Data Tests Pass: RNTL + E2E coverage for Redux and language switching
5. ✅ No Regressions: Existing functionality unchanged
6. ✅ Type Safety: Zero TypeScript errors in data layer

---

## Status History

| Date       | Status      | Notes                                                      |
| ---------- | ----------- | ---------------------------------------------------------- |
| 2025-01-12 | Not Started | Epic created                                               |
| 2025-01-14 | In Progress | Epic split: Splash screen moved to EPIC-006, scope reduced |
| 2025-01-14 | In Progress | 14 of 20 tasks completed, 6 testing tasks remaining        |

---

## Related Epics

- [EPIC-001](./EPIC-001-performance-optimization.md): Performance Optimization
- [EPIC-002](./EPIC-002-quality-reliability.md): Quality & Reliability
- [EPIC-006](./EPIC-006-splash-screen-loading-animation.md): Splash Screen (split from this epic)
- Future: Backend API integration
- Future: Content management system

---

## References

- [Old Repository](https://github.com/warrendeleon/rn-warrendeleon/tree/fbea2378ec61d843568a2ae5531cc61dcd221993)
- [Redux Toolkit Async Thunks](https://redux-toolkit.js.org/api/createAsyncThunk)
- [Redux Toolkit createSelector](https://redux-toolkit.js.org/api/createSelector)
- [i18next Documentation](https://www.i18next.com/)
- [Axios Documentation](https://axios-http.com/)

---

**Last Updated**: 2025-01-14
