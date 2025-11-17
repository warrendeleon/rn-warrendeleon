# React Native Portfolio App - Planning Hub

**Last Updated**: 2025-01-17
**Overall Progress**: 79% (108/137 tasks completed)

---

## 📊 Quick Stats

| Metric               | Count      | Progress                                     |
| -------------------- | ---------- | -------------------------------------------- |
| **Epics**            | 15 total   | 10 completed, 2 in progress, 3 not started   |
| **User Stories**     | 27 total   | 14 completed, 4 in progress, 9 not started   |
| **Tasks**            | 137 total  | 108 completed, 0 in progress, 29 not started |
| **Estimated Effort** | ~281 hours | ~210 hours completed, ~71 hours remaining    |

---

## 🎯 Epics Overview

| Epic ID                                                             | Title                         | Status         | Tasks        | Priority | Notes                                                     |
| ------------------------------------------------------------------- | ----------------------------- | -------------- | ------------ | -------- | --------------------------------------------------------- |
| [EPIC-001](./epics/EPIC-001-performance-optimization.md)            | Performance Optimization      | ✅ Completed   | 10/10 (100%) | High     | All memoisation and optimisation tasks complete           |
| [EPIC-002](./epics/EPIC-002-quality-reliability.md)                 | Quality & Reliability         | ✅ Completed   | 10/10 (100%) | High     | Error boundaries and E2E error state tests complete       |
| [EPIC-003](./epics/EPIC-003-accessibility-compliance.md)            | Accessibility & Compliance    | ⏳ In Progress | 3/4 (75%)    | High     | Pending manual VoiceOver/TalkBack testing                 |
| [EPIC-004](./epics/EPIC-004-code-quality-tech-debt.md)              | Code Quality & Tech Debt      | ✅ Completed   | 3/3 (100%)   | Medium   | Dependencies cleaned, types added                         |
| [EPIC-005](./epics/EPIC-005-multi-language-portfolio-data-layer.md) | Multi-Language Data Layer     | ⏳ In Progress | 24/27 (89%)  | High     | Language & data E2E tests complete, 3 tasks remaining     |
| [EPIC-006](./epics/EPIC-006-splash-screen-loading-animation.md)     | Splash Screen & Animation     | ✅ Completed   | 10/10 (100%) | High     | Implementation and E2E tests complete                     |
| [EPIC-007](./epics/EPIC-007-home-screen-redesign.md)                | Home Screen UI Redesign       | ✅ Completed   | 4/4 (100%)   | Medium   | Button groups and ProfileCard complete                    |
| [EPIC-008](./epics/EPIC-008-document-viewing.md)                    | Document Viewing              | ✅ Completed   | 6/6 (100%)   | Medium   | CV PDF viewer with share functionality complete           |
| [EPIC-009](./epics/EPIC-009-education-display-enhancement.md)       | Education Display             | ✅ Completed   | 6/6 (100%)   | Medium   | Education screen and E2E tests complete                   |
| [EPIC-010](./epics/EPIC-010-work-experience-display.md)             | Work Experience Display       | ✅ Completed   | 8/8 (100%)   | High     | Navigation, screen tests (unit + E2E) complete            |
| [EPIC-011](./epics/EPIC-011-component-naming-clarity.md)            | Component Naming Clarity      | ✅ Completed   | 16/16 (100%) | Medium   | All components renamed to purpose-based names - complete! |
| [EPIC-012](./epics/EPIC-012-profile-screen-implementation.md)       | Profile Screen Implementation | ✅ Completed   | 2/2 (100%)   | Medium   | ProfileScreen UI and i18n translations complete           |
| [EPIC-013](./epics/EPIC-013-production-readiness.md)                | Production Readiness          | ✅ Completed   | 11/11 (100%) | Critical | Security hardening and test coverage complete             |
| [EPIC-014](./epics/EPIC-014-performance-quality-phase-2.md)         | Performance & Quality Phase 2 | 📋 Not Started | 0/10 (0%)    | High     | React.memo, responsive layouts, data caching, tech debt   |
| [EPIC-015](./epics/EPIC-015-testing-compliance-expansion.md)        | Testing & Compliance          | 📋 Not Started | 0/9 (0%)     | Medium   | E2E test expansion, complete EAA compliance (June 2025)   |

---

## 📖 User Stories Overview

| Story ID                                                                                  | Title                              | Epic     | Status         | Tasks | Priority |
| ----------------------------------------------------------------------------------------- | ---------------------------------- | -------- | -------------- | ----- | -------- |
| [US-001](./stories/US-001-smooth-responsive-interactions.md)                              | Smooth & Responsive Interactions   | EPIC-001 | ✅ Completed   | 10/10 | High     |
| [US-002](./stories/US-002-graceful-error-handling.md)                                     | Graceful Error Handling            | EPIC-002 | ⏳ In Progress | 3/4   | High     |
| [US-003](./stories/US-003-inclusive-screen-reader-support.md)                             | Inclusive Screen Reader Support    | EPIC-003 | ⏳ In Progress | 3/4   | High     |
| [US-004](./stories/US-004-comprehensive-test-coverage.md)                                 | Comprehensive Test Coverage        | EPIC-002 | ✅ Completed   | 6/6   | High     |
| [US-006](./stories/US-006-data-migration-and-structure.md)                                | Data Migration & Structure         | EPIC-005 | ✅ Completed   | 5/5   | High     |
| [US-007](./stories/US-007-redux-data-layer.md)                                            | Redux Data Layer                   | EPIC-005 | ✅ Completed   | 9/9   | High     |
| [US-008](./stories/US-008-splash-screen-with-loading.md)                                  | Splash Screen with Animated Logo   | EPIC-006 | ✅ Completed   | 8/8   | High     |
| [US-009](./stories/US-009-internationalization.md)                                        | Internationalization (5 Languages) | EPIC-005 | ✅ Completed   | 5/5   | Medium   |
| [US-010](./stories/US-010-data-layer-testing.md)                                          | Data Layer Testing (E2E)           | EPIC-005 | ⏳ In Progress | 4/4   | High     |
| [US-012](./stories/US-012-api-layer-testing.md)                                           | API Layer Unit Testing             | EPIC-005 | ✅ Completed   | 5/5   | High     |
| [US-011](./stories/US-011-splash-screen-testing.md)                                       | Splash Screen Testing              | EPIC-006 | ⏳ In Progress | 1/2   | Medium   |
| [US-013](./stories/US-013-profile-card-home-screen.md)                                    | Display Profile Card on Home       | EPIC-007 | ✅ Completed   | 4/4   | Medium   |
| [US-014](./stories/US-014-home-screen-button-groups.md)                                   | Home Screen Button Groups          | EPIC-007 | ✅ Completed   | 2/2   | Medium   |
| [US-015](./stories/US-015-cv-pdf-viewer.md)                                               | CV PDF Viewer                      | EPIC-008 | ✅ Completed   | 6/6   | Medium   |
| [US-016](./stories/US-016-education-screen-svg-logos.md)                                  | Education Screen with SVG Logos    | EPIC-009 | ⏳ In Progress | 5/6   | Medium   |
| [US-017](./stories/US-017-work-experience-screen-display.md)                              | Work Experience Screen Display     | EPIC-010 | ⏳ In Progress | 3/5   | High     |
| [US-018](./stories/US-018-work-experience-redux-state.md)                                 | Work Experience Redux State        | EPIC-010 | ✅ Completed   | 4/4   | High     |
| [US-019](./stories/US-019-work-experience-navigation.md)                                  | Work Experience Navigation         | EPIC-010 | ⏳ In Progress | 1/3   | Medium   |
| [US-020](./stories/US-020-refactor-button-group-component-names-purpose-based-clarity.md) | Refactor Button Group Names        | EPIC-011 | ✅ Completed   | 13/13 | High     |
| [US-021](./stories/US-021-profile-screen-ui.md)                                           | Profile Screen UI Redesign         | EPIC-012 | ✅ Completed   | 2/2   | Medium   |
| [US-022](./stories/US-022-security-hardening.md)                                          | Security Hardening                 | EPIC-013 | ✅ Completed   | 6/6   | Critical |
| [US-023](./stories/US-023-test-coverage-completion.md)                                    | Test Coverage Completion           | EPIC-013 | ✅ Completed   | 5/5   | Critical |
| [US-024](./stories/US-024-performance-optimization-phase-2.md)                            | Performance Optimization Phase 2   | EPIC-014 | 📋 Not Started | 0/4   | High     |
| [US-025](./stories/US-025-eaa-compliance-completion.md)                                   | EAA Compliance Completion          | EPIC-015 | 📋 Not Started | 0/3   | High     |
| [US-026](./stories/US-026-e2e-test-expansion.md)                                          | E2E Test Coverage Expansion        | EPIC-015 | 📋 Not Started | 0/6   | Medium   |
| [US-027](./stories/US-027-code-quality-tech-debt.md)                                      | Code Quality & Tech Debt           | EPIC-014 | 📋 Not Started | 0/6   | Medium   |

---

## ✅ Tasks Status (All 138 Tasks)

### EPIC-001: Performance Optimization (10 tasks) ✅

| Task ID                                                       | Title                           | Status       | Effort | Priority |
| ------------------------------------------------------------- | ------------------------------- | ------------ | ------ | -------- |
| [TASK-001](./tasks/TASK-001-memo-button-with-chevron.md)      | React.memo ButtonWithChevron    | ✅ Completed | 0.5h   | High     |
| [TASK-002](./tasks/TASK-002-memo-selectable-list-button.md)   | React.memo SelectableListButton | ✅ Completed | 0.5h   | High     |
| [TASK-003](./tasks/TASK-003-memo-button-group-divider.md)     | React.memo ButtonGroupDivider   | ✅ Completed | 0.5h   | High     |
| [TASK-004](./tasks/TASK-004-usememo-settings-screen.md)       | useMemo SettingsScreen          | ✅ Completed | 0.75h  | High     |
| [TASK-005](./tasks/TASK-005-usememo-language-screen.md)       | useMemo LanguageScreen          | ✅ Completed | 0.5h   | High     |
| [TASK-006](./tasks/TASK-006-usememo-appearance-screen.md)     | useMemo AppearanceScreen        | ✅ Completed | 0.5h   | High     |
| [TASK-007](./tasks/TASK-007-usecallback-settings-screen.md)   | useCallback SettingsScreen      | ✅ Completed | 0.5h   | High     |
| [TASK-008](./tasks/TASK-008-usecallback-language-screen.md)   | useCallback LanguageScreen      | ✅ Completed | 0.5h   | High     |
| [TASK-009](./tasks/TASK-009-usecallback-appearance-screen.md) | useCallback AppearanceScreen    | ✅ Completed | 0.5h   | High     |
| [TASK-010](./tasks/TASK-010-optimize-redux-selectors.md)      | Optimise Redux Selectors        | ✅ Completed | 1h     | Medium   |

### EPIC-002: Quality & Reliability (10 tasks) ⏳

| Task ID                                                          | Title                                    | Status       | Effort | Priority |
| ---------------------------------------------------------------- | ---------------------------------------- | ------------ | ------ | -------- |
| [TASK-011](./tasks/TASK-011-create-error-boundary.md)            | Create ErrorBoundary Component           | ✅ Completed | 1h     | High     |
| [TASK-012](./tasks/TASK-012-test-error-boundary.md)              | Test ErrorBoundary                       | ✅ Completed | 0.5h   | High     |
| [TASK-013](./tasks/TASK-013-integrate-error-boundary.md)         | Integrate ErrorBoundary                  | ✅ Completed | 0.5h   | High     |
| [TASK-018](./tasks/TASK-018-test-chevron-button-group.md)        | Test ChevronButtonGroup                  | ✅ Completed | 1h     | Medium   |
| [TASK-019](./tasks/TASK-019-test-selectable-button-group.md)     | Test SelectableButtonGroup               | ✅ Completed | 1h     | Medium   |
| [TASK-020](./tasks/TASK-020-test-button-with-chevron.md)         | Complete ButtonWithChevron Test Coverage | ✅ Completed | 0.5h   | Medium   |
| [TASK-021](./tasks/TASK-021-test-use-app-color-scheme.md)        | Add Tests for useAppColorScheme Hook     | ✅ Completed | 1h     | Medium   |
| [TASK-022](./tasks/TASK-022-integration-test-settings.md)        | Integration Tests Settings Flow          | ✅ Completed | 0.5h   | Medium   |
| [TASK-055](./tasks/TASK-055-exclude-test-utils-from-coverage.md) | Exclude Test Utils from Jest Coverage    | ✅ Completed | 0.25h  | Medium   |
| [TASK-062](./tasks/TASK-062-e2e-tests-error-states.md)           | E2E Tests for Error States/Recovery      | ✅ Completed | 2h     | High     |

### EPIC-003: Accessibility & Compliance (4 tasks) ⏳

| Task ID                                                           | Title                                      | Status         | Effort | Priority |
| ----------------------------------------------------------------- | ------------------------------------------ | -------------- | ------ | -------- |
| [TASK-014](./tasks/TASK-014-accessibility-button-with-chevron.md) | Accessibility ButtonWithChevron            | ✅ Completed   | 0.5h   | High     |
| [TASK-015](./tasks/TASK-015-accessibility-selectable-list.md)     | Accessibility SelectableListButton         | ✅ Completed   | 0.5h   | High     |
| [TASK-016](./tasks/TASK-016-accessibility-all-screens.md)         | Accessibility All Screens                  | ✅ Completed   | 0.5h   | High     |
| [TASK-017](./tasks/TASK-017-test-screen-readers.md)               | Manual Testing with VoiceOver and TalkBack | ⭕ Not Started | 0.5h   | High     |

### EPIC-004: Code Quality & Technical Debt (3 tasks) ✅

| Task ID                                                       | Title                                       | Status       | Effort | Priority |
| ------------------------------------------------------------- | ------------------------------------------- | ------------ | ------ | -------- |
| [TASK-023](./tasks/TASK-023-remove-unused-dependencies.md)    | Remove Unused Dependencies                  | ✅ Completed | 0.25h  | High     |
| [TASK-024](./tasks/TASK-024-add-missing-types.md)             | Add Missing @types/node                     | ✅ Completed | 0.25h  | High     |
| [TASK-025](./tasks/TASK-025-standardise-component-imports.md) | Standardise Component Imports to @app Alias | ✅ Completed | 0.25h  | Low      |

### EPIC-005: Multi-Language Portfolio Data Layer (27 tasks) ⏳

| Task ID                                                             | Title                                         | Status       | Effort | Priority |
| ------------------------------------------------------------------- | --------------------------------------------- | ------------ | ------ | -------- |
| [TASK-026](./tasks/TASK-026-copy-english-spanish-data.md)           | Copy English/Spanish Data from Old Repo       | ✅ Done      | 0.5h   | High     |
| [TASK-027](./tasks/TASK-027-translate-catalan-data.md)              | Translate Profile Data to Catalan             | ✅ Done      | 1h     | High     |
| [TASK-028](./tasks/TASK-028-translate-polish-data.md)               | Translate Profile Data to Polish              | ✅ Done      | 1h     | High     |
| [TASK-029](./tasks/TASK-029-translate-tagalog-data.md)              | Translate Profile Data to Tagalog             | ✅ Done      | 1h     | High     |
| [TASK-030](./tasks/TASK-030-create-typescript-types.md)             | Create TypeScript Types for Profile Data      | ✅ Done      | 1h     | High     |
| [TASK-031](./tasks/TASK-031-setup-axios-github-api-client.md)       | Set Up Axios GitHub API Client                | ✅ Done      | 1h     | High     |
| [TASK-032](./tasks/TASK-032-create-profile-redux-slice.md)          | Create Profile Redux Slice                    | ✅ Done      | 1.5h   | High     |
| [TASK-033](./tasks/TASK-033-create-workxp-redux-slice.md)           | Create WorkXP Redux Slice                     | ✅ Done      | 1h     | High     |
| [TASK-034](./tasks/TASK-034-create-education-redux-slice.md)        | Create Education Redux Slice                  | ✅ Done      | 1h     | High     |
| [TASK-035](./tasks/TASK-035-configure-redux-persist.md)             | Configure Redux-Persist                       | ✅ Done      | 0.5h   | High     |
| [TASK-036](./tasks/TASK-036-unit-tests-redux-layer.md)              | Add Unit Tests for Redux Layer                | ✅ Done      | 2h     | High     |
| [TASK-045](./tasks/TASK-045-translate-i18n-locale-files.md)         | Translate i18n Locale Files (ca, pl, tl)      | ✅ Done      | 2h     | Medium   |
| [TASK-046](./tasks/TASK-046-update-i18n-config-5-languages.md)      | Update i18n Config for 5 Languages            | ✅ Done      | 0.5h   | Medium   |
| [TASK-047](./tasks/TASK-047-configure-ios-info-plist-languages.md)  | Configure iOS Info.plist for 5 Languages      | ✅ Done      | 0.5h   | Medium   |
| [TASK-048](./tasks/TASK-048-configure-android-strings-languages.md) | Configure Android strings.xml for 5 Languages | ✅ Done      | 1h     | Medium   |
| [TASK-049](./tasks/TASK-049-update-language-selector-ui.md)         | Update Language Selector UI                   | ✅ Done      | 1h     | Medium   |
| [TASK-050](./tasks/TASK-050-rntl-tests-redux-data-layer.md)         | RNTL Tests for Redux Data Layer               | ✅ Done      | 2h     | High     |
| [TASK-052](./tasks/TASK-052-e2e-tests-language-switching.md)        | E2E Tests for Language Switching              | ✅ Done      | 1.5h   | High     |
| [TASK-053](./tasks/TASK-053-e2e-tests-data-loading-persistence.md)  | E2E Tests for Data Loading & Persistence      | ✅ Done      | 2h     | High     |
| [TASK-054](./tasks/TASK-054-mock-github-api-e2e-tests.md)           | Mock GitHub API in E2E Tests                  | ✅ Done      | 1h     | High     |
| [TASK-056](./tasks/TASK-056-install-axios-mock-adapter.md)          | Install axios-mock-adapter                    | ✅ Done      | 0.25h  | High     |
| [TASK-057](./tasks/TASK-057-api-tests-profile.md)                   | Create API Tests for Profile Feature          | ✅ Done      | 1h     | High     |
| [TASK-058](./tasks/TASK-058-api-tests-education.md)                 | Create API Tests for Education Feature        | ✅ Done      | 1h     | High     |
| [TASK-059](./tasks/TASK-059-api-tests-workxp.md)                    | Create API Tests for WorkXP Feature           | ✅ Done      | 1h     | High     |
| [TASK-060](./tasks/TASK-060-document-api-testing-standard.md)       | Document API Testing Standard                 | ✅ Done      | 0.75h  | Medium   |
| [TASK-103](./tasks/TASK-103-mock-status-verification-screen.md)     | Mock Status Verification Screen               | ✅ Completed | 2h     | Medium   |
| [TASK-104](./tasks/TASK-104-migrate-msw-to-metro-mocking.md)        | Migrate MSW to Metro Mocking for E2E Tests    | ✅ Completed | 3h     | High     |

### EPIC-006: Splash Screen with Loading Animation (10 tasks) ⏳

| Task ID                                                           | Title                                  | Status       | Effort | Priority |
| ----------------------------------------------------------------- | -------------------------------------- | ------------ | ------ | -------- |
| [TASK-037](./tasks/TASK-037-install-react-native-bootsplash.md)   | Install react-native-bootsplash        | ✅ Done      | 0.5h   | High     |
| [TASK-038](./tasks/TASK-038-configure-ios-native-splash.md)       | Configure iOS Native Splash Screen     | ✅ Done      | 1h     | High     |
| [TASK-039](./tasks/TASK-039-configure-android-native-splash.md)   | Configure Android Native Splash Screen | ✅ Done      | 1h     | High     |
| [TASK-040](./tasks/TASK-040-install-lottie-react-native.md)       | Install lottie-react-native            | ✅ Done      | 0.5h   | High     |
| [TASK-041](./tasks/TASK-041-copy-logo-animation-assets.md)        | Copy Logo Animation Assets             | ✅ Done      | 0.5h   | Medium   |
| [TASK-042](./tasks/TASK-042-create-logo-component.md)             | Create Logo Component                  | ✅ Done      | 1h     | High     |
| [TASK-043](./tasks/TASK-043-create-splashscreen-component.md)     | Create SplashScreen Component          | ✅ Done      | 2h     | High     |
| [TASK-044](./tasks/TASK-044-integrate-splash-react-navigation.md) | Integrate Splash with React Navigation | ✅ Done      | 1h     | High     |
| [TASK-051](./tasks/TASK-051-rntl-tests-splash-screen.md)          | RNTL Tests for Splash Screen           | ✅ Done      | 1.5h   | High     |
| [TASK-061](./tasks/TASK-061-e2e-tests-splash-screen-flow.md)      | E2E Tests for Splash Screen Flow       | ✅ Completed | 2h     | High     |

### EPIC-007: Home Screen UI Redesign (4 tasks) ✅

| Task ID                                                     | Title                         | Status       | Effort | Priority |
| ----------------------------------------------------------- | ----------------------------- | ------------ | ------ | -------- |
| [TASK-063](./tasks/TASK-063-create-profile-card.md)         | Create ProfileCard Component  | ✅ Completed | 1.5h   | Medium   |
| [TASK-064](./tasks/TASK-064-integrate-profile-card-home.md) | Integrate ProfileCard in Home | ✅ Completed | 0.5h   | Medium   |
| [TASK-065](./tasks/TASK-065-test-profile-card.md)           | Unit Tests for ProfileCard    | ✅ Completed | 1h     | Medium   |
| [TASK-066](./tasks/TASK-066-update-home-screen-tests.md)    | Update HomeScreen Tests       | ✅ Completed | 0.5h   | Medium   |

### EPIC-008: Document Viewing (6 tasks) ✅

| Task ID                                                  | Title                                 | Status       | Effort | Priority |
| -------------------------------------------------------- | ------------------------------------- | ------------ | ------ | -------- |
| [TASK-067](./tasks/TASK-067-install-react-native-pdf.md) | Install react-native-pdf Dependencies | ✅ Completed | 0.5h   | High     |
| [TASK-068](./tasks/TASK-068-create-pdf-screen.md)        | Create PDFScreen Component            | ✅ Completed | 1h     | High     |
| [TASK-069](./tasks/TASK-069-add-pdf-navigation-route.md) | Add PDF Route to Navigation           | ✅ Completed | 0.5h   | High     |
| [TASK-070](./tasks/TASK-070-add-pdf-share-button.md)     | Add Share Button to PDF Header        | ✅ Completed | 1h     | Medium   |
| [TASK-071](./tasks/TASK-071-unit-tests-pdf-screen.md)    | Unit Tests for PDFScreen              | ✅ Completed | 1h     | Medium   |
| [TASK-072](./tasks/TASK-072-e2e-tests-pdf-viewer.md)     | E2E Tests for PDF Viewer Flow         | ✅ Completed | 1.5h   | Medium   |

### EPIC-009: Education Display Enhancement (6 tasks) ⏳

| Task ID                                                      | Title                               | Status       | Effort | Priority |
| ------------------------------------------------------------ | ----------------------------------- | ------------ | ------ | -------- |
| [TASK-073](./tasks/TASK-073-download-svg-logo-assets.md)     | Download and Add SVG Logo Assets    | ✅ Completed | 0.75h  | High     |
| [TASK-074](./tasks/TASK-074-create-menu-button-group-svg.md) | Create MenuButtonGroupSvg Component | ✅ Completed | 1.5h   | High     |
| [TASK-075](./tasks/TASK-075-update-education-data-screen.md) | Update EducationDataScreen UI       | ✅ Completed | 1.25h  | High     |
| [TASK-076](./tasks/TASK-076-add-certificate-navigation.md)   | Add Certificate WebView Navigation  | ✅ Completed | 0.5h   | Medium   |
| [TASK-077](./tasks/TASK-077-unit-tests-education-screen.md)  | Unit Tests for Education Screen     | ✅ Completed | 2h     | Medium   |
| [TASK-078](./tasks/TASK-078-e2e-tests-education-screen.md)   | E2E Tests for Education Screen Flow | ✅ Completed | 1.5h   | Medium   |

### EPIC-010: Work Experience Display Enhancement (8 tasks) ✅

| Task ID                                                           | Title                                    | Status       | Effort | Priority |
| ----------------------------------------------------------------- | ---------------------------------------- | ------------ | ------ | -------- |
| [TASK-079](./tasks/TASK-079-work-experience-types.md)             | Define Work Experience TypeScript Types  | ✅ Completed | 0.5h   | High     |
| [TASK-080](./tasks/TASK-080-create-work-experience-screen.md)     | Create WorkXPScreen Component            | ✅ Completed | 2h     | High     |
| [TASK-081](./tasks/TASK-081-work-experience-navigation-setup.md)  | Set up Work Experience Navigation Routes | ✅ Completed | 1h     | High     |
| [TASK-082](./tasks/TASK-082-unit-tests-work-experience-screen.md) | Unit Tests for WorkXPScreen              | ✅ Completed | 2h     | Medium   |
| [TASK-083](./tasks/TASK-083-e2e-tests-work-experience-screen.md)  | E2E Tests for Work Experience Flow       | ✅ Completed | 2h     | Medium   |
| [TASK-084](./tasks/TASK-084-work-experience-api-client.md)        | Create Work Experience API Client        | ✅ Completed | 1.5h   | High     |
| [TASK-085](./tasks/TASK-085-work-experience-redux-slice.md)       | Implement Work Experience Redux Slice    | ✅ Completed | 2h     | High     |
| [TASK-086](./tasks/TASK-086-unit-tests-work-experience-redux.md)  | Unit Tests for Work Experience Redux     | ✅ Completed | 2h     | Medium   |

### EPIC-011: Component Naming Clarity (13 tasks) ✅

| Task ID                                                            | Title                                         | Status       | Effort | Priority |
| ------------------------------------------------------------------ | --------------------------------------------- | ------------ | ------ | -------- |
| [TASK-087](./tasks/TASK-087-create-migration-plan-document.md)     | Create Migration Plan Document                | ✅ Completed | 0.5h   | High     |
| [TASK-088](./tasks/TASK-088-create-settings-group-component.md)    | Create SettingsGroup Component                | ✅ Completed | 0.25h  | High     |
| [TASK-089](./tasks/TASK-089-create-detail-list-group-component.md) | Create DetailListGroup Component              | ✅ Completed | 0.25h  | High     |
| [TASK-090](./tasks/TASK-090-create-picker-group-component.md)      | Create PickerGroup Component                  | ✅ Completed | 0.25h  | High     |
| [TASK-091](./tasks/TASK-091-create-settings-item-component.md)     | Create SettingsItem Component                 | ✅ Completed | 0.25h  | High     |
| [TASK-092](./tasks/TASK-092-create-picker-item-component.md)       | Create PickerItem Component                   | ✅ Completed | 0.25h  | High     |
| [TASK-093](./tasks/TASK-093-migrate-settings-screen.md)            | Migrate SettingsScreen                        | ✅ Completed | 0.5h   | High     |
| [TASK-094](./tasks/TASK-094-migrate-education-screen.md)           | Migrate EducationScreen                       | ✅ Completed | 0.5h   | High     |
| [TASK-095](./tasks/TASK-095-migrate-work-xp-screen.md)             | Migrate WorkXPScreen                          | ✅ Completed | 0.5h   | High     |
| [TASK-096](./tasks/TASK-096-migrate-language-screen.md)            | Migrate LanguageScreen                        | ✅ Completed | 0.5h   | Medium   |
| [TASK-097](./tasks/TASK-097-migrate-appearance-screen.md)          | Migrate AppearanceScreen                      | ✅ Completed | 0.5h   | Medium   |
| [TASK-098](./tasks/TASK-098-deprecate-old-components.md)           | Deprecate Old Components                      | ✅ Completed | 0.5h   | Medium   |
| [TASK-099](./tasks/TASK-099-remove-old-components.md)              | Remove Old Components                         | ✅ Completed | 1.5h   | Low      |
| [TASK-100](./tasks/TASK-100-fix-e2e-home-button-test-ids.md)       | Fix E2E Tests for Renamed Home Screen Buttons | ✅ Completed | 2h     | High     |
| [TASK-101](./tasks/TASK-101-fix-e2e-pdf-step-definitions.md)       | Fix PDF Viewing E2E Step Definitions          | ✅ Completed | 0.5h   | High     |
| [TASK-102](./tasks/TASK-102-fix-e2e-app-restart-timeout.md)        | Fix App Restart E2E Step Timeout              | ✅ Completed | 1h     | High     |
| [TASK-103](./tasks/TASK-103-mock-status-verification-screen.md)    | Mock Status Verification Screen               | ✅ Completed | 2h     | Medium   |
| [TASK-104](./tasks/TASK-104-migrate-msw-to-metro-mocking.md)       | Migrate MSW to Metro Mocking for E2E Tests    | ✅ Completed | 3h     | High     |

### EPIC-012: Profile Screen Implementation (4 tasks) ⏳

| Task ID                                                          | Title                                      | Status       | Effort | Priority |
| ---------------------------------------------------------------- | ------------------------------------------ | ------------ | ------ | -------- |
| [TASK-105](./tasks/TASK-105-implement-profile-screen-ui.md)      | Implement ProfileScreen UI with sections   | ✅ Completed | 2h     | High     |
| [TASK-106](./tasks/TASK-106-add-profile-i18n-translations.md)    | Add i18next translations (all 5 languages) | ✅ Completed | 1.5h   | Medium   |
| [TASK-107](./tasks/TASK-107-write-profile-screen-tests.md)       | Write RNTL Tests for ProfileScreen         | ✅ Completed | 1.5h   | High     |
| [TASK-108](./tasks/TASK-108-add-profile-e2e-navigation-tests.md) | Add E2E Tests for Profile Navigation       | ✅ Completed | 1h     | Medium   |

### EPIC-013: Production Readiness - Security & Testing (11 tasks) 📋

#### US-022: Security Hardening (6 tasks)

| Task ID                                                              | Title                                | Status       | Effort | Priority |
| -------------------------------------------------------------------- | ------------------------------------ | ------------ | ------ | -------- |
| [TASK-109](./tasks/TASK-109-remove-production-console-statements.md) | Remove Production Console Statements | ✅ Completed | 3h     | Critical |
| [TASK-110](./tasks/TASK-110-add-webview-url-validation.md)           | Add WebView URL Validation           | ✅ Completed | 2h     | Critical |
| [TASK-111](./tasks/TASK-111-add-pdf-url-validation.md)               | Add PDF URL Validation               | ✅ Completed | 1h     | High     |
| [TASK-112](./tasks/TASK-112-audit-svg-http-urls.md)                  | Audit SVG Files for HTTP URLs        | ✅ Completed | 1h     | Medium   |
| [TASK-113](./tasks/TASK-113-verify-env-gitignore.md)                 | Verify .env in .gitignore            | ✅ Completed | 0.5h   | Medium   |
| [TASK-114](./tasks/TASK-114-add-env-precommit-hook.md)               | Add .env Pre-commit Hook             | ✅ Completed | 0.5h   | Medium   |

#### US-023: Test Coverage Completion (5 tasks)

| Task ID                                                               | Title                                 | Status       | Effort | Priority |
| --------------------------------------------------------------------- | ------------------------------------- | ------------ | ------ | -------- |
| [TASK-115](./tasks/TASK-115-test-select-work-experience-or-client.md) | Test selectWorkExperienceOrClientById | ✅ Completed | 2h     | High     |
| [TASK-116](./tasks/TASK-116-test-e2e-mocking-logic.md)                | Test E2E Mocking Logic in API Files   | ✅ Completed | 4h     | High     |
| [TASK-117](./tasks/TASK-117-test-github-api-client.md)                | Create GithubApiClient Tests          | ✅ Completed | 1h     | High     |
| [TASK-118](./tasks/TASK-118-export-missing-selectors.md)              | Export Missing Redux Selectors        | ✅ Completed | 0.5h   | Medium   |
| [TASK-119](./tasks/TASK-119-remove-msw-dead-code.md)                  | Remove MSW from devDependencies       | ✅ Completed | 1h     | Medium   |

### EPIC-014: Performance & Quality Phase 2 (10 tasks) 📋

#### US-024: Performance Optimization Phase 2 (4 tasks)

| Task ID                                                   | Title                                             | Status         | Effort | Priority |
| --------------------------------------------------------- | ------------------------------------------------- | -------------- | ------ | -------- |
| [TASK-120](./tasks/TASK-120-add-react-memo-components.md) | Add React.memo to Pure Components                 | 📋 Not Started | 2h     | High     |
| [TASK-121](./tasks/TASK-121-fix-dimensions-hook.md)       | Replace Dimensions.get() with useWindowDimensions | 📋 Not Started | 1h     | High     |
| [TASK-122](./tasks/TASK-122-optimize-splash-loading.md)   | Optimize Splash Screen Data Loading               | 📋 Not Started | 2h     | High     |
| [TASK-123](./tasks/TASK-123-implement-rtk-query.md)       | Implement RTK Query for API Caching (OPTIONAL)    | 📋 Not Started | 8h     | Medium   |

#### US-027: Code Quality & Tech Debt (6 tasks)

| Task ID                                                    | Title                                | Status         | Effort | Priority |
| ---------------------------------------------------------- | ------------------------------------ | -------------- | ------ | -------- |
| [TASK-133](./tasks/TASK-133-standardize-error-handling.md) | Standardize Error Handling Patterns  | 📋 Not Started | 3h     | Medium   |
| [TASK-134](./tasks/TASK-134-replace-magic-numbers.md)      | Replace Magic Numbers with Constants | 📋 Not Started | 2h     | Medium   |
| [TASK-135](./tasks/TASK-135-implement-todo-handlers.md)    | Implement or Remove TODO Handlers    | 📋 Not Started | 2h     | Medium   |
| [TASK-136](./tasks/TASK-136-remove-msw-devdependency.md)   | Remove MSW from devDependencies      | 📋 Not Started | 0.5h   | Medium   |
| [TASK-137](./tasks/TASK-137-update-mockstatus-comments.md) | Update MockStatusScreen Comments     | 📋 Not Started | 0.25h  | Medium   |
| [TASK-138](./tasks/TASK-138-standardize-gluestack-ui.md)   | Standardize on GlueStack UI Patterns | 📋 Not Started | 3h     | Medium   |

### EPIC-015: Testing & Compliance Expansion (9 tasks) 📋

#### US-025: EAA Compliance Completion (3 tasks)

| Task ID                                                    | Title                                    | Status         | Effort | Priority |
| ---------------------------------------------------------- | ---------------------------------------- | -------------- | ------ | -------- |
| [TASK-124](./tasks/TASK-124-eaa-webview-screen.md)         | Add EAA Props to WebViewScreen           | 📋 Not Started | 2h     | High     |
| [TASK-125](./tasks/TASK-125-eaa-profile-data-screen.md)    | Add EAA Props to ProfileDataScreen       | 📋 Not Started | 1h     | High     |
| [TASK-126](./tasks/TASK-126-voiceover-talkback-testing.md) | VoiceOver/TalkBack Testing Documentation | 📋 Not Started | 2h     | High     |

#### US-026: E2E Test Coverage Expansion (6 tasks)

| Task ID                                                   | Title                                  | Status         | Effort | Priority |
| --------------------------------------------------------- | -------------------------------------- | -------------- | ------ | -------- |
| [TASK-127](./tasks/TASK-127-e2e-profile-navigation.md)    | E2E Test ProfileScreen Navigation      | 📋 Not Started | 2h     | Medium   |
| [TASK-128](./tasks/TASK-128-e2e-profile-social-links.md)  | E2E Test ProfileScreen Social Links    | 📋 Not Started | 2h     | Medium   |
| [TASK-129](./tasks/TASK-129-e2e-webview-loading.md)       | E2E Test WebView URL Loading           | 📋 Not Started | 1h     | Medium   |
| [TASK-130](./tasks/TASK-130-e2e-email-phone-links.md)     | E2E Test Email/Phone Link Interactions | 📋 Not Started | 2h     | Medium   |
| [TASK-131](./tasks/TASK-131-e2e-language-standalone.md)   | E2E Test Language Screen Standalone    | 📋 Not Started | 2h     | Medium   |
| [TASK-132](./tasks/TASK-132-e2e-appearance-standalone.md) | E2E Test Appearance Screen Standalone  | 📋 Not Started | 2h     | Medium   |

---

## 🎯 What's Next? (6 Remaining Tasks)

### ✅ E2E Test Fixes Complete!

**Status**: All critical E2E test failures resolved

- ✅ **TASK-100**: Fixed home button testIDs
- ✅ **TASK-101**: Fixed PDF step definitions and documented touch event limitation
- ✅ **TASK-102**: Fixed app restart timeout with proper i18next sync

**Current E2E Coverage**: 47/47 steps passing (7 scenarios implemented, skipped scenarios pending features)
**Result**: Clean test suite - ready for new E2E coverage expansion

---

### Critical Path - E2E Test Coverage (100% Goal)

**Current E2E Coverage**: 100% of implemented features tested
**Target**: Expand coverage to remaining features

**Recommended Sequence** (after fixes above):

1. ✅ **TASK-054**: Mock GitHub API in E2E Tests (1h) - **COMPLETED**
   - MSW configured with all 5 languages
   - Local fixtures integrated
   - E2E hooks updated

2. **TASK-061**: E2E Tests for Splash Screen Flow (2h) - High Priority (EPIC-006)
   - Test splash → data loading → transition
   - Requires TASK-054 complete

3. **TASK-062**: E2E Tests for Error States (2h) - High Priority (EPIC-002)
   - Test network errors, API failures, recovery
   - Requires TASK-054 complete

**Total Effort**: 4 hours remaining for 100% E2E coverage (after fixing existing failures)

### Home Screen UI - ProfileCard Feature (EPIC-007)

**Current Progress**: Button groups complete (commit ed34c00)
**Next**: ProfileCard component implementation

**Recommended Sequence**:

1. **TASK-063**: Create ProfileCard Component (1.5h) - Medium Priority
   - Avatar, name display, chevron icon
   - Based on old app's ViewProfileButton
   - iOS-style design matching button groups

2. **TASK-064**: Integrate ProfileCard in HomeScreen (0.5h) - Medium Priority
   - Position above button groups
   - Connect Redux profile data
   - Navigation to ProfileData screen

3. **TASK-065**: Unit Tests for ProfileCard (1h) - Medium Priority
   - Rendering, props, interactions
   - Theme support tests

4. **TASK-066**: Update HomeScreen Integration Tests (0.5h) - Medium Priority
   - Add ProfileCard to existing test suite
   - Verify navigation, data display

**Total Effort**: 3.5 hours for ProfileCard feature completion

### Accessibility (Separate Track)

- **TASK-017**: Manual VoiceOver/TalkBack Testing (0.5h) - High Priority (EPIC-003)

### Recently Completed (2025-11-15)

- ✅ **US-014**: Home Screen Button Groups (4h) - Complete redesign with icons, fonts, translations (commit ed34c00)
- ✅ **TASK-052**: E2E Tests for Language Switching (1.5h) - Tests all 5 languages with data reload
- ✅ **TASK-053**: E2E Tests for Data Loading & Persistence (2h) - Tests initial fetch, display, restart
- ✅ **TASK-054**: Mock GitHub API in E2E Tests (1h) - MSW configured with all fixtures
- ✅ **TASK-060**: Document API Testing Standard (0.75h)
- ✅ **TASK-057/058/059**: API Tests for Profile/Education/WorkXP (3h)
- ✅ **TASK-056**: Install axios-mock-adapter (0.25h)
- ✅ **TASK-050/051**: RNTL Tests for Redux + Splash (3.5h)
- ✅ **TASK-036**: Add Unit Tests for Redux Layer (2h)

### Coverage Assessment Completed (2025-11-15)

- ✅ **E2E Coverage Audit**: Identified gaps in Splash flow, error states
- ✅ **New Tickets Created**: TASK-061 (Splash E2E), TASK-062 (Error E2E)
- 📊 **Coverage Analysis**: 75% → 100% target with 5 remaining E2E tasks

**Note**: E2E testing now prioritised for 100% project coverage. All unit, integration, and API layer tests are complete with full documentation. The five E2E tasks above will complete comprehensive test coverage across all app flows.

---

## 📂 Directory Structure

```
docs/planning/user-stories/
├── README.md (this file - planning hub)
├── .templates/
│   ├── epic-template.md
│   ├── user-story-template.md
│   └── task-template.md
├── epics/
│   ├── EPIC-001-performance-optimization.md
│   ├── EPIC-002-quality-reliability.md
│   ├── EPIC-003-accessibility-compliance.md
│   ├── EPIC-004-code-quality-tech-debt.md
│   ├── EPIC-005-multi-language-portfolio-data-layer.md
│   ├── EPIC-006-splash-screen-loading-animation.md
│   ├── EPIC-007-home-screen-redesign.md
│   ├── EPIC-008-document-viewing.md
│   ├── EPIC-009-education-display-enhancement.md
│   ├── EPIC-010-work-experience-display.md
│   ├── EPIC-011-component-naming-clarity.md
│   ├── EPIC-012-profile-screen-implementation.md
│   ├── EPIC-013-production-readiness.md
│   ├── EPIC-014-performance-quality-phase-2.md
│   └── EPIC-015-testing-compliance-expansion.md
├── stories/
│   ├── US-001-smooth-responsive-interactions.md
│   ├── US-002-graceful-error-handling.md
│   ├── US-003-inclusive-screen-reader-support.md
│   ├── US-004-comprehensive-test-coverage.md
│   ├── US-006-data-migration-and-structure.md
│   ├── US-007-redux-data-layer.md
│   ├── US-008-splash-screen-with-loading.md
│   ├── US-009-internationalization.md
│   ├── US-010-data-layer-testing.md
│   ├── US-011-splash-screen-testing.md
│   ├── US-012-api-layer-testing.md
│   ├── US-013-profile-card-home-screen.md
│   ├── US-014-home-screen-button-groups.md
│   ├── US-015-cv-pdf-viewer.md
│   ├── US-016-education-screen-svg-logos.md
│   ├── US-017-work-experience-screen-display.md
│   ├── US-018-work-experience-redux-state.md
│   ├── US-019-work-experience-navigation.md
│   ├── US-020-refactor-button-group-component-names-purpose-based-clarity.md
│   ├── US-021-profile-screen-ui.md
│   ├── US-022-security-hardening.md
│   ├── US-023-test-coverage-completion.md
│   ├── US-024-performance-optimization-phase-2.md
│   ├── US-025-eaa-compliance-completion.md
│   ├── US-026-e2e-test-expansion.md
│   └── US-027-code-quality-tech-debt.md
└── tasks/
    ├── TASK-001 to TASK-025 (Epics 001-004)
    ├── TASK-026 to TASK-062 (Epics 005-006)
    ├── TASK-063 to TASK-066 (Epic 007)
    ├── TASK-067 to TASK-072 (Epic 008)
    ├── TASK-073 to TASK-078 (Epic 009)
    ├── TASK-079 to TASK-086 (Epic 010)
    ├── TASK-087 to TASK-104 (Epic 011)
    ├── TASK-105 to TASK-108 (Epic 012)
    ├── TASK-109 to TASK-119 (Epic 013: Security & Testing)
    ├── TASK-120 to TASK-123, TASK-133 to TASK-138 (Epic 014: Performance & Quality)
    └── TASK-124 to TASK-132 (Epic 015: Testing & Compliance)
```

---

## 🚀 Recommended Execution Plan

**Purpose**: Phased approach with maximum parallelization using git worktrees

**Key Principles**:

- ✅ Test before commit (ZERO TOLERANCE)
- ✅ Rebase-only merge strategy (linear history)
- ✅ Validation checkpoint after each merge
- ✅ Git worktrees for parallel work (separate terminals)
- ✅ Sequential merge to main (validation checkpoints)

---

### Phase 1: Production Readiness (EPIC-013) - CRITICAL

**Duration**: 1 week (5 days)
**Effort**: 21 hours
**Priority**: 🔴 MUST complete before production launch

**Approach**: Parallel work with 2 worktrees (Security + Testing)

#### Day 1-2: Security Hardening (Worktree 1) - 8 hours

**Setup worktree**:

```bash
git worktree add ../wt-security -b epic-013/security main
cd ../wt-security
```

**Sequential tasks** (must be done in order):

1. **TASK-109**: Remove production console statements (3h)
   - ProfileScreen.tsx, ErrorBoundary.tsx
   - Replace with `__DEV__` conditionals or Sentry
   - **Test**: `yarn test ProfileScreen` → `yarn validate`
   - **Commit**: `🔒 security(console): remove production console statements`

2. **TASK-110**: Add WebView URL validation (2h)
   - Add domain whitelist ['github.com', 'warrendeleon.com']
   - **Test**: `yarn test WebViewScreen` → `yarn validate`
   - **Commit**: `🔒 security(webview): add URL validation with whitelist`

3. **TASK-111**: Add PDF URL validation (1h)
   - Add URL validation for PDFScreen
   - **Test**: `yarn test PDFScreen` → `yarn validate`
   - **Commit**: `🔒 security(pdf): add URL validation`

4. **TASK-112**: Audit SVG HTTP URLs (1h)
   - Find and replace http:// → https:// in SVG files
   - **Commit**: `🔒 security(assets): replace HTTP with HTTPS in SVG files`

5. **TASK-113**: Verify .env gitignore (0.5h)
   - Check .gitignore has `.env*` (excluding `.env.example`)
   - **Commit**: `🔧 chore(git): verify .env files in gitignore`

6. **TASK-114**: Add .env pre-commit hook (0.5h)
   - Update `.husky/pre-commit` to block .env commits
   - **Test**: Try committing .env (should fail)
   - **Commit**: `🔒 security(git): add pre-commit hook for .env protection`

**Merge security worktree**:

```bash
cd /path/to/main-repo
git checkout epic-013/security && git rebase main
git checkout main && git merge --ff-only epic-013/security
yarn validate  # Checkpoint ✅
git worktree remove ../wt-security
git branch -d epic-013/security
```

#### Day 3-5: Test Coverage Completion (Worktree 2) - 8.5 hours

**Setup worktree**:

```bash
git worktree add ../wt-testing -b epic-013/testing main
cd ../wt-testing
```

**Sequential tasks**:

1. **TASK-115**: Test `selectWorkExperienceOrClientById` (2h)
   - Add 5 test cases in `selectors.rntl.ts`
   - **Test**: `yarn test WorkExperience/store/selectors` → 100% coverage
   - **Commit**: `✅ test(workxp): add tests for selectWorkExperienceOrClientById`

2. **TASK-116**: Test E2E mocking logic (4h)
   - Test E2E branches in Profile/Education/WorkExperience API files
   - Test fixture loading for all 5 languages
   - **Test**: `yarn test Profile/api` → `yarn validate`
   - **Commit**: `✅ test(api): add tests for E2E mocking logic`

3. **TASK-117**: Test GithubApiClient (1h)
   - Create `__tests__/GithubApiClient.test.ts`
   - Test baseURL, timeout, headers
   - **Test**: `yarn test httpClients` → `yarn validate`
   - **Commit**: `✅ test(http): add GithubApiClient configuration tests`

4. **TASK-118**: Export missing selectors (0.5h)
   - Add exports to `store/index.ts`
   - **Commit**: `♻️ refactor(store): export missing WorkExperience selectors`

5. **TASK-119**: Remove MSW dead code (1h)
   - Remove `msw` from package.json devDependencies
   - Update MockStatusScreen comments (Metro, not MSW)
   - **Test**: `yarn validate`
   - **Commit**: `🔥 chore(deps): remove MSW dead code`

**Merge testing worktree**:

```bash
cd /path/to/main-repo
git checkout epic-013/testing && git rebase main
git checkout main && git merge --ff-only epic-013/testing
yarn validate  # Checkpoint ✅
git worktree remove ../wt-testing
git branch -d epic-013/testing
```

**✅ Phase 1 Complete**: Production-ready security + 100% test coverage

---

### Phase 2: Performance & Testing (EPIC-014 + EPIC-015) - Parallel

**Duration**: 2 weeks
**Effort**: 39.75 hours total (23.75h + 16h)
**Priority**: 🟠 High / 🟡 Medium

**Approach**: Run 2 epics in parallel using worktrees (Team A + Team B)

#### Team A: Performance & Quality (EPIC-014) - 23.75 hours

**Setup worktree**:

```bash
git worktree add ../wt-performance -b epic-014/performance main
cd ../wt-performance
```

**Week 1 - Performance Tasks** (5 hours):

1. **TASK-120**: Add React.memo to components (2h)
   - DetailListGroup, SettingsItem, ButtonGroupDivider
   - **Test**: `yarn test` for each component → measure performance
   - **Commit**: `⚡ perf(components): add React.memo to pure components`

2. **TASK-121**: Fix Dimensions.get() (1h)
   - Replace with `useWindowDimensions()` in ProfileScreen
   - **Test**: `yarn test ProfileScreen` → test rotation behaviour
   - **Commit**: `🐛 fix(profile): use useWindowDimensions for responsive layout`

3. **TASK-122**: Optimize splash screen (2h)
   - Parallel data loading with Promise.all
   - Dynamic timing (minimum 1.5s, complete when ready)
   - **Test**: `yarn test SplashScreen` → `yarn detox:ios:test -f "Splash"`
   - **Commit**: `⚡ perf(splash): optimize data loading with parallel requests`

**Week 2 - Code Quality Tasks** (10.75 hours):

4. **TASK-133**: Standardize error handling (3h)
   - Unified pattern across Profile/Education/WorkExperience
   - **Test**: `yarn validate`
   - **Commit**: `♻️ refactor(errors): standardize error handling patterns`

5. **TASK-134**: Replace magic numbers (2h)
   - Named constants for timeouts, dimensions, ratios
   - **Test**: `yarn validate`
   - **Commit**: `♻️ refactor(constants): replace magic numbers with named constants`

6. **TASK-135**: Implement TODO handlers (2h)
   - HomeScreen TODO functions (Videos, Contact, BookMeeting)
   - **Test**: `yarn test HomeScreen` → `yarn validate`
   - **Commit**: `✨ feat(home): implement TODO handlers for Videos/Contact/Meeting`

7. **TASK-136**: Remove MSW devDependency (0.5h)
   - (Already done in TASK-119, skip or amend)

8. **TASK-137**: Update MockStatusScreen comments (0.25h)
   - (Already done in TASK-119, skip or amend)

9. **TASK-138**: Standardize GlueStack UI (3h)
   - ProfileDataScreen, WebViewScreen use GlueStack UI consistently
   - Remove StyleSheet.create mixing
   - **Test**: `yarn test` → `yarn validate`
   - **Commit**: `♻️ refactor(ui): standardize on GlueStack UI patterns`

**OPTIONAL** - **TASK-123**: Implement RTK Query (8h)

- Large task - defer if timeline tight
- High impact but not blocking

**Merge performance worktree**:

```bash
cd /path/to/main-repo
git checkout epic-014/performance && git rebase main
git checkout main && git merge --ff-only epic-014/performance
yarn validate  # Checkpoint ✅
git worktree remove ../wt-performance
git branch -d epic-014/performance
```

#### Team B: Testing & Compliance (EPIC-015) - 16 hours

**Can run in parallel with Team A** (separate worktree)

**Setup worktree**:

```bash
git worktree add ../wt-testing-compliance -b epic-015/testing main
cd ../wt-testing-compliance
```

**Week 1 - EAA Compliance Tasks** (5 hours):

1. **TASK-124**: Add EAA props to WebViewScreen (2h)
   - accessibilityRole, accessibilityLabel, accessibilityHint
   - **Test**: `yarn test WebViewScreen` → verify props
   - **Commit**: `♿ a11y(webview): add EAA accessibility props`

2. **TASK-125**: Add EAA props to ProfileDataScreen (1h)
   - accessibilityRole="text" for Text elements
   - **Test**: `yarn test ProfileDataScreen` → verify props
   - **Commit**: `♿ a11y(profile): add EAA accessibility props to ProfileDataScreen`

3. **TASK-126**: VoiceOver/TalkBack testing docs (2h)
   - Create testing procedure document
   - Manual testing checklist
   - **Commit**: `📝 docs(a11y): add VoiceOver/TalkBack testing procedure`

**Week 2 - E2E Test Expansion** (11 hours):

**Build Detox once**:

```bash
yarn detox:ios:build
```

4. **TASK-127**: E2E ProfileScreen navigation (2h)
   - Home → Profile → Back
   - **Test**: `yarn detox:ios:test -f "Profile navigation"`
   - **Commit**: `✅ test(e2e): add ProfileScreen navigation tests`

5. **TASK-128**: E2E ProfileScreen social links (2h)
   - Social buttons → WebView
   - **Test**: `yarn detox:ios:test -f "Profile social"`
   - **Commit**: `✅ test(e2e): add ProfileScreen social link tests`

6. **TASK-129**: E2E WebView URL loading (1h)
   - WebView validates and loads URL
   - **Test**: `yarn detox:ios:test -f "WebView"`
   - **Commit**: `✅ test(e2e): add WebView URL loading tests`

7. **TASK-130**: E2E email/phone links (2h)
   - Test link existence and tappability (not actual app opening)
   - **Test**: `yarn detox:ios:test -f "Contact links"`
   - **Commit**: `✅ test(e2e): add email/phone link interaction tests`

8. **TASK-131**: E2E Language screen standalone (2h)
   - Settings → Language → Change → Back
   - **Test**: `yarn detox:ios:test -f "Language"`
   - **Commit**: `✅ test(e2e): add Language screen standalone tests`

9. **TASK-132**: E2E Appearance screen standalone (2h)
   - Settings → Appearance → Toggle → Back
   - **Test**: `yarn detox:ios:test -f "Appearance"`
   - **Commit**: `✅ test(e2e): add Appearance screen standalone tests`

**Final E2E validation**:

```bash
yarn detox:ios:test  # Full suite must pass
```

**Merge testing/compliance worktree**:

```bash
cd /path/to/main-repo
git checkout epic-015/testing && git rebase main
git checkout main && git merge --ff-only epic-015/testing
yarn validate  # Checkpoint ✅
yarn detox:ios:test  # E2E validation ✅
git worktree remove ../wt-testing-compliance
git branch -d epic-015/testing
```

**✅ Phase 2 Complete**: Optimized performance + complete test coverage + full EAA compliance

---

### Summary: Parallelization Strategy

**Phase 1** (EPIC-013):

- 🔴 **Sequential** (1 week) - Security + Testing must be done carefully
- Use 1 worktree at a time for critical production fixes
- **Checkpoint**: `yarn validate` after each merge

**Phase 2** (EPIC-014 + EPIC-015):

- 🟢 **Parallel** (2 weeks) - Performance and Testing can run simultaneously
- Use 2 worktrees in 2 separate Claude Code terminals
- **Team A**: Performance & quality improvements
- **Team B**: E2E tests + EAA compliance
- No file conflicts (different areas of codebase)
- **Checkpoint**: `yarn validate` + `yarn detox:ios:test` after each merge

**Git Worktree Benefits**:

- Complete isolation between parallel work
- No context switching
- No stashing/unstashing
- Each worktree has own branch
- Sequential merge ensures validation checkpoints

**Total Time Savings**: ~50% faster than sequential work (Phase 2)

---

## Legend

- ✅ **Completed**: Task fully implemented, tested, and merged
- ⏳ **In Progress**: Work started or partially complete
- ⭕ **Not Started**: Not yet begun
- **Done**: Used interchangeably with Completed for EPIC-005/006 tasks
