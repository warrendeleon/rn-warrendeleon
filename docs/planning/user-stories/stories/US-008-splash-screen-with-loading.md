# US-008: Splash Screen with Data Loading

**Story ID**: US-008
**Title**: Splash Screen with Animated Logo and Data Loading
**Epic**: [EPIC-006: Splash Screen with Loading Animation](../epics/EPIC-006-splash-screen-loading-animation.md)
**Status**: Backlog
**Priority**: High
**Created**: 2025-01-12
**Updated**: 2025-01-14
**Assigned To**: Warren de Leon
**Category**: UX/UI

---

## User Story

**As a** user,
**I want** a splash screen with logo animation while data loads from GitHub,
**So that** I see a polished loading experience on first launch.

---

## Context & Rationale

Implement native splash screens (iOS/Android) and animated logo component using Lottie, orchestrating data fetching while providing visual feedback.

---

## Acceptance Criteria

- [ ] react-native-bootsplash installed and configured
- [ ] iOS native splash screen configured
- [ ] Android native splash screen configured
- [ ] Lottie animation assets copied
- [ ] Logo component with light/dark theme support
- [ ] SplashScreen component dispatches all data fetches
- [ ] Loading states handled (pending, success, error)
- [ ] Integrates with React Navigation

---

## Story Points & Effort

**Story Points**: 5
**Effort Estimate**: 7.5 hours

---

## Tasks

| ID                                                                 | Task                                   | Effort | Status |
| ------------------------------------------------------------------ | -------------------------------------- | ------ | ------ |
| [TASK-037](../tasks/TASK-037-install-react-native-bootsplash.md)   | Install react-native-bootsplash        | 0.5h   | To Do  |
| [TASK-038](../tasks/TASK-038-configure-ios-native-splash.md)       | Configure iOS native splash            | 1h     | To Do  |
| [TASK-039](../tasks/TASK-039-configure-android-native-splash.md)   | Configure Android native splash        | 1h     | To Do  |
| [TASK-040](../tasks/TASK-040-install-lottie-react-native.md)       | Install lottie-react-native            | 0.5h   | To Do  |
| [TASK-041](../tasks/TASK-041-copy-logo-animation-assets.md)        | Copy logo animation assets             | 0.5h   | To Do  |
| [TASK-042](../tasks/TASK-042-create-logo-component.md)             | Create Logo component                  | 1h     | To Do  |
| [TASK-043](../tasks/TASK-043-create-splashscreen-component.md)     | Create SplashScreen component          | 2h     | To Do  |
| [TASK-044](../tasks/TASK-044-integrate-splash-react-navigation.md) | Integrate splash with React Navigation | 1h     | To Do  |

---

## Related User Stories

- [US-011](./US-011-splash-screen-testing.md) - Testing for this user story
- Data layer user stories in EPIC-005 (provides data to load during splash)

---

## Notes

**2025-01-14**: Moved from EPIC-005 to EPIC-006 during epic restructuring. Splash screen development is now separate from data layer work, allowing parallel development and clearer technical boundaries.

---

**Last Updated**: 2025-01-14
