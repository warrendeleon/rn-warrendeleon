# US-028: Storybook Setup and Component Stories

**User Story ID**: US-028
**Title**: Storybook Setup and Component Stories
**Epic**: [EPIC-016: Storybook Re-integration](../epics/EPIC-016-storybook-reintegration.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-11-18
**Owner**: Warren de Leon

---

## User Story

**As a** developer working on the warrendeleon project,
**I want** Storybook re-integrated with all component stories,
**So that** I can develop, test, and document UI components in isolation without running the full application.

---

## Background

Storybook was removed on November 3, 2025 (commit `cbdb342`) due to incompatibility with React Native 0.82.1's New Architecture. The `@storybook/react-native` v10.0.7 release (November 12, 2025) resolved these issues with peer dependency `react-native: ">=0.72.0"`.

Previous installation had issues with:

- Bottom sheet dependency conflicts
- Controls addon requiring additional native modules
- Metro configuration complexity

This user story covers complete re-integration with all lessons learned applied.

---

## Acceptance Criteria

### Installation & Configuration

- [ ] Storybook v10.0.7 core packages installed and working
- [ ] Metro bundler configured with `withStorybook` wrapper
- [ ] All 4 on-device addons installed and functional:
  - [ ] Controls (with slider and date picker dependencies)
  - [ ] Actions
  - [ ] Backgrounds
  - [ ] Notes
- [ ] Development toggle to switch between app and Storybook
- [ ] iOS Pods installed without conflicts

### Component Stories

- [ ] All 12 shared components have complete stories:
  - [ ] Logo
  - [ ] ProfileCard
  - [ ] SettingsGroup
  - [ ] SettingsItem
  - [ ] DetailListGroup
  - [ ] PickerGroup
  - [ ] PickerItem
  - [ ] ButtonGroup
  - [ ] ButtonGroupDivider
  - [ ] HeaderBackButton
  - [ ] ErrorBoundary
  - [ ] FallbackUI
- [ ] Stories demonstrate all props and variants
- [ ] Stories include accessibility documentation

### Testing & Documentation

- [ ] Stories render correctly on iOS simulator
- [ ] Story tests pass in Jest
- [ ] README.md updated with Storybook instructions
- [ ] No regressions in existing tests
- [ ] Full validation passes (`yarn validate`)

---

## Tasks

| Task                                                            | Title                               | Effort | Priority | Status |
| --------------------------------------------------------------- | ----------------------------------- | ------ | -------- | ------ |
| [TASK-143](../tasks/TASK-143-install-storybook-core.md)         | Install Storybook Core Dependencies | 3h     | High     | To Do  |
| [TASK-144](../tasks/TASK-144-configure-storybook-metro.md)      | Configure Storybook Metro & Entry   | 2h     | High     | To Do  |
| [TASK-145](../tasks/TASK-145-install-storybook-addons.md)       | Install Storybook Addons            | 2h     | High     | To Do  |
| [TASK-146](../tasks/TASK-146-configure-storybook-toggle.md)     | Configure Storybook Dev Toggle      | 1h     | Medium   | To Do  |
| [TASK-147](../tasks/TASK-147-create-component-stories.md)       | Create Stories for All Components   | 6h     | High     | To Do  |
| [TASK-148](../tasks/TASK-148-test-storybook-stories.md)         | Test Storybook Stories with Jest    | 3h     | Medium   | To Do  |
| [TASK-149](../tasks/TASK-149-update-documentation-storybook.md) | Update Project Documentation        | 1h     | Medium   | To Do  |

**Total Effort**: 18h

---

## Dependencies

- React Native 0.82.1 (existing)
- React 18.3.1 (existing)
- Yarn 3.6.4 Berry (existing)

---

## Notes

### Previous Issues to Avoid

1. **Bottom Sheet Conflicts**: Ensure `@gorhom/bottom-sheet@>=5` is used (v10 peer dependency)
2. **Controls Addon Native Modules**: Must install `@react-native-community/slider` and `@react-native-community/datetimepicker`
3. **Metro Config**: Must use `withStorybook()` wrapper, not manual config
4. **Story Pattern**: Use `.stories.tsx` in same directory as component

### Testing Strategy

Stories will be tested using Jest with `@storybook/react-native`'s test utilities, not Detox. Detox E2E testing of Storybook is not recommended as it adds complexity without significant benefit.

---

**Last Updated**: 2025-11-18
