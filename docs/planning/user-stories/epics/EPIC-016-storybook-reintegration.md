# EPIC-016: Storybook Re-integration

**Epic ID**: EPIC-016
**Title**: Storybook Re-integration with React Native 0.82.1
**Status**: 📋 To Do
**Priority**: Medium
**Created**: 2025-11-18
**Owner**: Warren de Leon

---

## Overview

Re-integrate Storybook into the project now that `@storybook/react-native` v10.0.7 supports React Native 0.82.1. Storybook was removed on November 3, 2025 due to incompatibility with RN 0.82.1's New Architecture. The v10 release (November 4-12, 2025) resolved these issues.

Storybook enables isolated component development, visual testing, and serves as living documentation for the design system.

---

## Business Value

- **Component Development**: Build and test UI components in isolation without running full app
- **Design System Documentation**: Automatic documentation of all component variants and props
- **Visual Regression Testing**: Catch unintended UI changes before they reach production
- **Developer Onboarding**: New team members can explore components interactively
- **Accessibility Testing**: Test components with accessibility addons

---

## User Stories

| User Story                                                 | Title                       | Priority | Status |
| ---------------------------------------------------------- | --------------------------- | -------- | ------ |
| [US-028](../stories/US-028-storybook-setup-and-stories.md) | Storybook Setup and Stories | High     | To Do  |

---

## Tasks

### Installation & Configuration (6 tasks)

| Task                                                            | Title                               | Effort | Priority | Status |
| --------------------------------------------------------------- | ----------------------------------- | ------ | -------- | ------ |
| [TASK-143](../tasks/TASK-143-install-storybook-core.md)         | Install Storybook Core Dependencies | 3h     | High     | To Do  |
| [TASK-144](../tasks/TASK-144-configure-storybook-metro.md)      | Configure Storybook Metro & Entry   | 2h     | High     | To Do  |
| [TASK-145](../tasks/TASK-145-install-storybook-addons.md)       | Install Storybook Addons            | 2h     | High     | To Do  |
| [TASK-146](../tasks/TASK-146-configure-storybook-toggle.md)     | Configure Storybook Dev Toggle      | 1h     | Medium   | To Do  |
| [TASK-147](../tasks/TASK-147-create-component-stories.md)       | Create Stories for All Components   | 6h     | High     | To Do  |
| [TASK-148](../tasks/TASK-148-test-storybook-stories.md)         | Test Storybook Stories with Jest    | 3h     | Medium   | To Do  |
| [TASK-149](../tasks/TASK-149-update-documentation-storybook.md) | Update Project Documentation        | 1h     | Medium   | To Do  |

**Total Tasks**: 7
**Total Effort**: 18h

---

## Technical Architecture

### Core Dependencies

```json
{
  "dependencies": {
    "@gorhom/bottom-sheet": "^5.0.0",
    "react-native-gesture-handler": ">=2",
    "react-native-reanimated": ">=2",
    "react-native-safe-area-context": "*"
  },
  "devDependencies": {
    "storybook": "^10.0.0",
    "@storybook/react-native": "^10.0.7",
    "@storybook/addon-ondevice-controls": "^10.0.0",
    "@storybook/addon-ondevice-actions": "^10.0.0",
    "@storybook/addon-ondevice-backgrounds": "^10.0.0",
    "@storybook/addon-ondevice-notes": "^10.0.0",
    "@react-native-community/datetimepicker": "*",
    "@react-native-community/slider": "*"
  }
}
```

### File Structure

```
.rnstorybook/
├── main.ts          # Storybook config (addons, stories pattern)
├── preview.ts       # Global decorators and parameters
├── index.tsx        # Storybook entry point
└── storybook.requires.ts  # Auto-generated story imports

src/
├── components/
│   ├── Logo/
│   │   ├── Logo.tsx
│   │   └── Logo.stories.tsx          # Component story
│   ├── ProfileCard/
│   │   ├── ProfileCard.tsx
│   │   └── ProfileCard.stories.tsx
│   └── ... (12 components total)
```

---

## Components Requiring Stories

All 12 shared components need Storybook stories:

| Component          | Location                             | Controls Needed              |
| ------------------ | ------------------------------------ | ---------------------------- |
| Logo               | `src/components/Logo/`               | darkMode, animation toggle   |
| ProfileCard        | `src/components/ProfileCard/`        | profile data, loading, error |
| SettingsGroup      | `src/components/SettingsGroup/`      | title, children              |
| SettingsItem       | `src/components/SettingsItem/`       | icon, title, onPress, value  |
| DetailListGroup    | `src/components/DetailListGroup/`    | title, items                 |
| PickerGroup        | `src/components/PickerGroup/`        | title, options, selected     |
| PickerItem         | `src/components/PickerItem/`         | label, selected, onPress     |
| ButtonGroup        | `src/components/ButtonGroup/`        | children                     |
| ButtonGroupDivider | `src/components/ButtonGroupDivider/` | (no props)                   |
| HeaderBackButton   | `src/components/HeaderBackButton/`   | onPress, tintColor           |
| ErrorBoundary      | `src/components/ErrorBoundary/`      | (wrap with error trigger)    |
| FallbackUI         | `src/components/ErrorBoundary/`      | error message, onReset       |

---

## Success Criteria

- [ ] Storybook v10.0.7 successfully installed
- [ ] Metro bundler configured with `withStorybook` wrapper
- [ ] All 4 addons working (Controls, Actions, Backgrounds, Notes)
- [ ] All 12 components have complete stories
- [ ] Stories render correctly on iOS simulator
- [ ] Dev menu toggle to switch between app and Storybook
- [ ] Story tests pass in CI
- [ ] Documentation updated (README.md, CONTRIBUTING.md)
- [ ] No regressions in existing tests

---

## Risks & Mitigations

| Risk                         | Likelihood | Impact | Mitigation                         |
| ---------------------------- | ---------- | ------ | ---------------------------------- |
| Metro config conflicts       | Medium     | High   | Test in isolation branch first     |
| Controls addon slider issues | Medium     | Medium | Use @react-native-community/slider |
| Bottom sheet conflicts       | Low        | High   | Use @gorhom/bottom-sheet v5        |
| Bundle size increase         | Low        | Low    | Storybook only in dev builds       |

---

## Timeline History

| Date       | Status      | Notes                                        |
| ---------- | ----------- | -------------------------------------------- |
| 2025-11-18 | Not Started | Epic created after Storybook v10.0.7 release |

---

**Last Updated**: 2025-11-18
