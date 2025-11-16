# React Native Portfolio App - Planning Hub

**Last Updated**: 2025-01-16
**Overall Progress**: 96% (100/104 tasks completed)

---

## 📊 Quick Stats

| Metric               | Count      | Progress                                               |
| -------------------- | ---------- | ------------------------------------------------------ |
| **Epics**            | 19 total   | 10 completed, 1 in progress, 8 planned                 |
| **User Stories**     | 57 total   | 12 completed, 5 in progress, 2 not started, 38 planned |
| **Tasks**            | 104 total  | 100 completed, 4 in progress                           |
| **Estimated Effort** | ~216 hours | ~78 hours completed, ~138 hours remaining              |

---

## 🎯 Epics Overview

| Epic ID                                                             | Title                          | Status         | Tasks        | Priority | Notes                                                     |
| ------------------------------------------------------------------- | ------------------------------ | -------------- | ------------ | -------- | --------------------------------------------------------- |
| [EPIC-001](./epics/EPIC-001-performance-optimization.md)            | Performance Optimization       | ✅ Completed   | 10/10 (100%) | High     | All memoisation and optimisation tasks complete           |
| [EPIC-002](./epics/EPIC-002-quality-reliability.md)                 | Quality & Reliability          | ✅ Completed   | 10/10 (100%) | High     | Error boundaries and E2E error state tests complete       |
| [EPIC-003](./epics/EPIC-003-accessibility-compliance.md)            | Accessibility & Compliance     | ⏳ In Progress | 3/4 (75%)    | High     | Pending manual VoiceOver/TalkBack testing                 |
| [EPIC-004](./epics/EPIC-004-code-quality-tech-debt.md)              | Code Quality & Tech Debt       | ✅ Completed   | 3/3 (100%)   | Medium   | Dependencies cleaned, types added                         |
| [EPIC-005](./epics/EPIC-005-multi-language-portfolio-data-layer.md) | Multi-Language Data Layer      | ⏳ In Progress | 24/27 (89%)  | High     | Language & data E2E tests complete, 3 tasks remaining     |
| [EPIC-006](./epics/EPIC-006-splash-screen-loading-animation.md)     | Splash Screen & Animation      | ✅ Completed   | 10/10 (100%) | High     | Implementation and E2E tests complete                     |
| [EPIC-007](./epics/EPIC-007-home-screen-redesign.md)                | Home Screen UI Redesign        | ✅ Completed   | 4/4 (100%)   | Medium   | Button groups and ProfileCard complete                    |
| [EPIC-008](./epics/EPIC-008-document-viewing.md)                    | Document Viewing               | ✅ Completed   | 6/6 (100%)   | Medium   | CV PDF viewer with share functionality complete           |
| [EPIC-009](./epics/EPIC-009-education-display-enhancement.md)       | Education Display              | ✅ Completed   | 6/6 (100%)   | Medium   | Education screen and E2E tests complete                   |
| [EPIC-010](./epics/EPIC-010-work-experience-display.md)             | Work Experience Display        | ✅ Completed   | 8/8 (100%)   | High     | Navigation, screen tests (unit + E2E) complete            |
| [EPIC-011](./epics/EPIC-011-component-naming-clarity.md)            | Component Naming Clarity       | ✅ Completed   | 16/16 (100%) | Medium   | All components renamed to purpose-based names - complete! |
| [EPIC-012](./epics/EPIC-012-firebase-backend-integration.md)        | Firebase Backend Integration   | 📋 Planned     | TBD          | High     | Phase 2 - REST API + Calendar + Push Notifications        |
| [EPIC-013](./epics/EPIC-013-user-authentication-system.md)          | User Authentication System     | 📋 Planned     | TBD          | High     | Phase 2 - Registration + Login + Protected Routes         |
| [EPIC-014](./epics/EPIC-014-videos-section-youtube.md)              | Videos Section (YouTube)       | 📋 Planned     | TBD          | Medium   | Phase 3 - YouTube API + Video Player                      |
| [EPIC-015](./epics/EPIC-015-realtime-chat-feature.md)               | Real-time Chat Feature         | 📋 Planned     | TBD          | High     | Phase 3 - Firestore/RTDB + Push Notifications             |
| [EPIC-016](./epics/EPIC-016-meeting-booking-system.md)              | Meeting Booking System         | 📋 Planned     | TBD          | High     | Phase 3 - Calendar API + Google Meet Integration          |
| [EPIC-017](./epics/EPIC-017-blog-articles-integration.md)           | Blog/Articles Integration      | 📋 Planned     | TBD          | Medium   | Phase 4 - Medium/Dev.to RSS Feed                          |
| [EPIC-018](./epics/EPIC-018-profile-redesign-enhancement.md)        | Profile Redesign & Enhancement | 📋 Planned     | TBD          | Medium   | Phase 5 - Structured UI + Skills + Projects (optional)    |
| [EPIC-019](./epics/EPIC-019-app-store-launch-preparation.md)        | App Store Launch Preparation   | 📋 Planned     | TBD          | High     | Phase 6 - Branding + Marketing + Legal + Beta Testing     |

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

---

## ✅ Tasks Status (All 99 Tasks)

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

| Task ID                                                             | Title                                         | Status         | Effort | Priority |
| ------------------------------------------------------------------- | --------------------------------------------- | -------------- | ------ | -------- |
| [TASK-026](./tasks/TASK-026-copy-english-spanish-data.md)           | Copy English/Spanish Data from Old Repo       | ✅ Done        | 0.5h   | High     |
| [TASK-027](./tasks/TASK-027-translate-catalan-data.md)              | Translate Profile Data to Catalan             | ✅ Done        | 1h     | High     |
| [TASK-028](./tasks/TASK-028-translate-polish-data.md)               | Translate Profile Data to Polish              | ✅ Done        | 1h     | High     |
| [TASK-029](./tasks/TASK-029-translate-tagalog-data.md)              | Translate Profile Data to Tagalog             | ✅ Done        | 1h     | High     |
| [TASK-030](./tasks/TASK-030-create-typescript-types.md)             | Create TypeScript Types for Profile Data      | ✅ Done        | 1h     | High     |
| [TASK-031](./tasks/TASK-031-setup-axios-github-api-client.md)       | Set Up Axios GitHub API Client                | ✅ Done        | 1h     | High     |
| [TASK-032](./tasks/TASK-032-create-profile-redux-slice.md)          | Create Profile Redux Slice                    | ✅ Done        | 1.5h   | High     |
| [TASK-033](./tasks/TASK-033-create-workxp-redux-slice.md)           | Create WorkXP Redux Slice                     | ✅ Done        | 1h     | High     |
| [TASK-034](./tasks/TASK-034-create-education-redux-slice.md)        | Create Education Redux Slice                  | ✅ Done        | 1h     | High     |
| [TASK-035](./tasks/TASK-035-configure-redux-persist.md)             | Configure Redux-Persist                       | ✅ Done        | 0.5h   | High     |
| [TASK-036](./tasks/TASK-036-unit-tests-redux-layer.md)              | Add Unit Tests for Redux Layer                | ✅ Done        | 2h     | High     |
| [TASK-045](./tasks/TASK-045-translate-i18n-locale-files.md)         | Translate i18n Locale Files (ca, pl, tl)      | ✅ Done        | 2h     | Medium   |
| [TASK-046](./tasks/TASK-046-update-i18n-config-5-languages.md)      | Update i18n Config for 5 Languages            | ✅ Done        | 0.5h   | Medium   |
| [TASK-047](./tasks/TASK-047-configure-ios-info-plist-languages.md)  | Configure iOS Info.plist for 5 Languages      | ✅ Done        | 0.5h   | Medium   |
| [TASK-048](./tasks/TASK-048-configure-android-strings-languages.md) | Configure Android strings.xml for 5 Languages | ✅ Done        | 1h     | Medium   |
| [TASK-049](./tasks/TASK-049-update-language-selector-ui.md)         | Update Language Selector UI                   | ✅ Done        | 1h     | Medium   |
| [TASK-050](./tasks/TASK-050-rntl-tests-redux-data-layer.md)         | RNTL Tests for Redux Data Layer               | ✅ Done        | 2h     | High     |
| [TASK-052](./tasks/TASK-052-e2e-tests-language-switching.md)        | E2E Tests for Language Switching              | ✅ Done        | 1.5h   | High     |
| [TASK-053](./tasks/TASK-053-e2e-tests-data-loading-persistence.md)  | E2E Tests for Data Loading & Persistence      | ✅ Done        | 2h     | High     |
| [TASK-054](./tasks/TASK-054-mock-github-api-e2e-tests.md)           | Mock GitHub API in E2E Tests                  | ✅ Done        | 1h     | High     |
| [TASK-056](./tasks/TASK-056-install-axios-mock-adapter.md)          | Install axios-mock-adapter                    | ✅ Done        | 0.25h  | High     |
| [TASK-057](./tasks/TASK-057-api-tests-profile.md)                   | Create API Tests for Profile Feature          | ✅ Done        | 1h     | High     |
| [TASK-058](./tasks/TASK-058-api-tests-education.md)                 | Create API Tests for Education Feature        | ✅ Done        | 1h     | High     |
| [TASK-059](./tasks/TASK-059-api-tests-workxp.md)                    | Create API Tests for WorkXP Feature           | ✅ Done        | 1h     | High     |
| [TASK-060](./tasks/TASK-060-document-api-testing-standard.md)       | Document API Testing Standard                 | ✅ Done        | 0.75h  | Medium   |
| [TASK-103](./tasks/TASK-103-mock-status-verification-screen.md)     | Mock Status Verification Screen               | 🚧 Blocked     | 2h     | Medium   |
| [TASK-104](./tasks/TASK-104-migrate-msw-to-metro-mocking.md)        | Migrate MSW to Metro Mocking for E2E Tests    | ⏳ In Progress | 3h     | High     |

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

| Task ID                                                            | Title                                         | Status         | Effort | Priority |
| ------------------------------------------------------------------ | --------------------------------------------- | -------------- | ------ | -------- |
| [TASK-087](./tasks/TASK-087-create-migration-plan-document.md)     | Create Migration Plan Document                | ✅ Completed   | 0.5h   | High     |
| [TASK-088](./tasks/TASK-088-create-settings-group-component.md)    | Create SettingsGroup Component                | ✅ Completed   | 0.25h  | High     |
| [TASK-089](./tasks/TASK-089-create-detail-list-group-component.md) | Create DetailListGroup Component              | ✅ Completed   | 0.25h  | High     |
| [TASK-090](./tasks/TASK-090-create-picker-group-component.md)      | Create PickerGroup Component                  | ✅ Completed   | 0.25h  | High     |
| [TASK-091](./tasks/TASK-091-create-settings-item-component.md)     | Create SettingsItem Component                 | ✅ Completed   | 0.25h  | High     |
| [TASK-092](./tasks/TASK-092-create-picker-item-component.md)       | Create PickerItem Component                   | ✅ Completed   | 0.25h  | High     |
| [TASK-093](./tasks/TASK-093-migrate-settings-screen.md)            | Migrate SettingsScreen                        | ✅ Completed   | 0.5h   | High     |
| [TASK-094](./tasks/TASK-094-migrate-education-screen.md)           | Migrate EducationScreen                       | ✅ Completed   | 0.5h   | High     |
| [TASK-095](./tasks/TASK-095-migrate-work-xp-screen.md)             | Migrate WorkXPScreen                          | ✅ Completed   | 0.5h   | High     |
| [TASK-096](./tasks/TASK-096-migrate-language-screen.md)            | Migrate LanguageScreen                        | ✅ Completed   | 0.5h   | Medium   |
| [TASK-097](./tasks/TASK-097-migrate-appearance-screen.md)          | Migrate AppearanceScreen                      | ✅ Completed   | 0.5h   | Medium   |
| [TASK-098](./tasks/TASK-098-deprecate-old-components.md)           | Deprecate Old Components                      | ✅ Completed   | 0.5h   | Medium   |
| [TASK-099](./tasks/TASK-099-remove-old-components.md)              | Remove Old Components                         | ✅ Completed   | 1.5h   | Low      |
| [TASK-100](./tasks/TASK-100-fix-e2e-home-button-test-ids.md)       | Fix E2E Tests for Renamed Home Screen Buttons | ✅ Completed   | 2h     | High     |
| [TASK-101](./tasks/TASK-101-fix-e2e-pdf-step-definitions.md)       | Fix PDF Viewing E2E Step Definitions          | ✅ Completed   | 0.5h   | High     |
| [TASK-102](./tasks/TASK-102-fix-e2e-app-restart-timeout.md)        | Fix App Restart E2E Step Timeout              | ✅ Completed   | 1h     | High     |
| [TASK-103](./tasks/TASK-103-mock-status-verification-screen.md)    | Mock Status Verification Screen               | ⏳ In Progress | 2h     | Medium   |

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
│   ├── EPIC-012-firebase-backend-integration.md ✨ NEW
│   ├── EPIC-013-user-authentication-system.md ✨ NEW
│   ├── EPIC-014-videos-section-youtube.md ✨ NEW
│   ├── EPIC-015-realtime-chat-feature.md ✨ NEW
│   ├── EPIC-016-meeting-booking-system.md ✨ NEW
│   ├── EPIC-017-blog-articles-integration.md ✨ NEW
│   ├── EPIC-018-profile-redesign-enhancement.md ✨ NEW
│   └── EPIC-019-app-store-launch-preparation.md ✨ NEW
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
│   └── US-021 to US-057 (Epics 012-019) - TBD
└── tasks/
    ├── TASK-001 to TASK-025 (Epics 001-004)
    ├── TASK-026 to TASK-062 (Epics 005-006)
    ├── TASK-063 to TASK-066 (Epic 007)
    ├── TASK-067 to TASK-072 (Epic 008)
    ├── TASK-073 to TASK-078 (Epic 009)
    ├── TASK-079 to TASK-086 (Epic 010)
    ├── TASK-087 to TASK-102 (Epic 011)
    └── TASK-103+ (Epics 012-019) - TBD
```

---

## Legend

- ✅ **Completed**: Task fully implemented, tested, and merged
- ⏳ **In Progress**: Work started or partially complete
- ⭕ **Not Started**: Not yet begun
- **Done**: Used interchangeably with Completed for EPIC-005/006 tasks
