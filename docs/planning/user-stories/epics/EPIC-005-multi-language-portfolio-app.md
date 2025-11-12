# EPIC-005: Multi-Language Portfolio App

**Epic ID**: EPIC-005
**Title**: Multi-Language Portfolio App with GitHub Data Fetching
**Status**: Not Started
**Priority**: High
**Created**: 2025-01-12
**Owner**: Warren de Leon
**Category**: Feature Development

---

## Executive Summary

Build a multi-language portfolio application that fetches profile data from GitHub, displays it with a polished splash screen animation, and supports 5 languages (English, Spanish, Catalan, Polish, Tagalog) with full Redux state management and persistence.

**Business Impact**: Complete professional portfolio app with internation

al reach, offline-first architecture, and production-ready data layer.

---

## Business Value

### Problem

Current app lacks:

- **Profile Data Layer**: No way to display work experience, education, skills
- **Data Fetching**: No integration with external data sources
- **Splash Screen**: No polished loading experience
- **Multi-language Content**: UI translations exist but no content data in multiple languages
- **State Persistence**: No offline data storage

This leads to:

- Incomplete portfolio presentation
- Poor first-launch experience
- Limited international audience
- Data fetched repeatedly (no caching)

### Opportunity

By implementing complete portfolio data layer:

- **Professional Presentation**: Full CV/portfolio with work experience, education, skills
- **GitHub Integration**: Fetch data from public GitHub repository
- **Polished UX**: Animated splash screen while data loads
- **Multi-language**: Content available in 5 languages
- **Offline-First**: Redux-persist for cached data
- **Future-Ready**: Scalable architecture for additional features

### Success Metrics

| Metric               | Current | Target | Business Impact            |
| -------------------- | ------- | ------ | -------------------------- |
| Supported languages  | 2 (UI)  | 5      | +150% language coverage    |
| Data sources         | 0       | 1      | GitHub integration         |
| Profile completeness | 0%      | 100%   | Full professional CV       |
| Splash screen        | No      | Yes    | Polished first impression  |
| Data persistence     | No      | Yes    | Offline-first architecture |
| Redux slices         | 1       | 4      | Complete data layer        |

---

## Scope

### In Scope

**Data Management**:

- Copy profile data from old repo (en, es)
- Translate to 3 new languages (ca, pl, tl)
- Store in `src/test-utils/fixtures/api/{locale}/`
- TypeScript types for all data structures

**Redux Data Layer**:

- Axios GitHub API client
- Profile, WorkXP, Education Redux slices
- Async thunks for data fetching
- Selectors for data access
- redux-persist configuration

**Splash Screen**:

- react-native-bootsplash installation
- iOS/Android native configuration
- Lottie animation (Logo component)
- Data loading orchestration
- Error handling

**Internationalization**:

- Translate UI strings (ca.json, pl.json, tl.json)
- Update i18n config for 5 languages
- iOS/Android native locale configuration
- Language selector UI updates

**Testing**:

- RNTL tests for Redux layer
- RNTL tests for Splash screen
- E2E tests for language switching
- E2E tests for data loading/persistence
- Mock GitHub API in tests

### Out of Scope

- Backend API (using GitHub raw content)
- User authentication
- Data editing/updating
- Video content integration
- Right-to-left (RTL) language support

---

## Timeline & Dates

**Start Date**: 2025-01-12
**Target Date**: 2025-01-19
**Completed Date**: _Not yet completed_

**Estimated Duration**: 7 days (~28 hours total)

---

## Budget & Resources

**Budget**: £0
**Actual Cost**: _To be tracked_
**Total Effort**: 28 hours
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

**Risk 1**: GitHub API Rate Limiting

- **Likelihood**: Low
- **Impact**: Medium
- **Mitigation**: Use redux-persist to cache data; only fetch on first launch or manual refresh

**Risk 2**: Translation Quality

- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**: Use professional translations; verify with native speakers

**Risk 3**: Splash Screen Performance

- **Likelihood**: Low
- **Impact**: Low
- **Mitigation**: Optimize Lottie animation; test on low-end devices

---

## User Stories

| ID                                                          | User Story                      | Status      | Story Points |
| ----------------------------------------------------------- | ------------------------------- | ----------- | ------------ |
| [US-006](../stories/US-006-data-migration-and-structure.md) | Data Migration & Structure      | Not Started | 3            |
| [US-007](../stories/US-007-redux-data-layer.md)             | Redux Data Layer                | Not Started | 5            |
| [US-008](../stories/US-008-splash-screen-with-loading.md)   | Splash Screen with Data Loading | Not Started | 5            |
| [US-009](../stories/US-009-internationalization.md)         | Internationalization (5 langs)  | Not Started | 3            |
| [US-010](../stories/US-010-testing-coverage.md)             | Testing Coverage                | Not Started | 5            |

**Total Stories**: 5
**Total Story Points**: 21

---

## Tasks

| ID       | Task                                     | Status | Effort | Priority |
| -------- | ---------------------------------------- | ------ | ------ | -------- |
| TASK-026 | Copy en/es data from old repo            | To Do  | 0.5h   | High     |
| TASK-027 | Translate Catalan data                   | To Do  | 1h     | High     |
| TASK-028 | Translate Polish data                    | To Do  | 1h     | High     |
| TASK-029 | Translate Tagalog data                   | To Do  | 1h     | High     |
| TASK-030 | Create TypeScript types                  | To Do  | 1h     | High     |
| TASK-031 | Set up Axios GitHub API client           | To Do  | 1h     | High     |
| TASK-032 | Create profile Redux slice               | To Do  | 1.5h   | High     |
| TASK-033 | Create workXP Redux slice                | To Do  | 1h     | High     |
| TASK-034 | Create education Redux slice             | To Do  | 1h     | High     |
| TASK-035 | Configure redux-persist                  | To Do  | 0.5h   | High     |
| TASK-036 | Add unit tests for Redux layer           | To Do  | 2h     | High     |
| TASK-037 | Install react-native-bootsplash          | To Do  | 0.5h   | High     |
| TASK-038 | Configure iOS native splash              | To Do  | 1h     | High     |
| TASK-039 | Configure Android native splash          | To Do  | 1h     | High     |
| TASK-040 | Install lottie-react-native              | To Do  | 0.5h   | High     |
| TASK-041 | Copy logo animation assets               | To Do  | 0.5h   | Medium   |
| TASK-042 | Create Logo component                    | To Do  | 1h     | High     |
| TASK-043 | Create SplashScreen component            | To Do  | 2h     | High     |
| TASK-044 | Integrate splash with React Navigation   | To Do  | 1h     | High     |
| TASK-045 | Translate i18n locale files (ca, pl, tl) | To Do  | 2h     | Medium   |
| TASK-046 | Update i18n config for 5 languages       | To Do  | 0.5h   | Medium   |
| TASK-047 | Configure iOS Info.plist                 | To Do  | 0.5h   | Medium   |
| TASK-048 | Configure Android strings.xml            | To Do  | 1h     | Medium   |
| TASK-049 | Update language selector UI              | To Do  | 1h     | Medium   |
| TASK-050 | RNTL tests for Redux data layer          | To Do  | 2h     | High     |
| TASK-051 | RNTL tests for Splash screen             | To Do  | 1.5h   | High     |
| TASK-052 | E2E tests for language switching         | To Do  | 1.5h   | High     |
| TASK-053 | E2E tests for data loading/persistence   | To Do  | 2h     | High     |
| TASK-054 | Mock GitHub API in E2E tests             | To Do  | 1h     | High     |

**Total Tasks**: 29
**Total Effort**: 28 hours

---

## Definition of Done

This epic is complete when:

1. ✅ All 5 Languages Supported: en, es, ca, pl, tl with UI + content data
2. ✅ GitHub Data Fetching: Profile, WorkXP, Education loaded from GitHub
3. ✅ Redux Data Layer: Complete with async thunks, selectors, persistence
4. ✅ Splash Screen: Native + animated logo + data loading orchestration
5. ✅ All Tests Pass: RNTL + E2E coverage for all features
6. ✅ No Regressions: Existing functionality unchanged

---

## Status History

| Date       | Status      | Notes        |
| ---------- | ----------- | ------------ |
| 2025-01-12 | Not Started | Epic created |

---

## Related Epics

- EPIC-001: Performance Optimization
- EPIC-002: Quality & Reliability
- Future: Backend API integration
- Future: Content management system

---

## References

- [Old Repository](https://github.com/warrendeleon/rn-warrendeleon/tree/fbea2378ec61d843568a2ae5531cc61dcd221993)
- [React Native Bootsplash](https://github.com/zoontek/react-native-bootsplash)
- [Lottie React Native](https://github.com/lottie-react-native/lottie-react-native)
- [Redux Toolkit Async Thunks](https://redux-toolkit.js.org/api/createAsyncThunk)

---

**Last Updated**: 2025-01-12
