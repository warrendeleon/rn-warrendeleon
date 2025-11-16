# EPIC-011: Component Naming Clarity

**Epic ID**: EPIC-011
**Title**: Component Naming Clarity - Purpose-Based Component Names
**Status**: In Progress
**Priority**: Medium
**Created**: 2025-01-16
**Owner**: Warren de Leon
**Category**: Tech Debt

---

## Executive Summary

Rename button and button group components from implementation-focused names (ChevronButtonGroup, MenuButtonGroupSVG) to purpose-based names (SettingsGroup, DetailListGroup) that immediately communicate use case and intent, improving developer experience and code discoverability.

**Business Impact**: Faster onboarding, reduced cognitive load, fewer bugs from using wrong component, clearer codebase intent

---

## Business Value

### Problem

Current component names describe implementation details rather than purpose:

- **ChevronButtonGroup**: Name reveals visual (chevron) but not use case (settings/navigation)
- **MenuButtonGroupSVG**: "Menu" is vague, "SVG" is implementation detail, doesn't reveal it's for rich content lists
- **SelectableButtonGroup**: Describes behaviour (selectable) but not purpose (single-selection picker)
- **ButtonWithChevron**: Generic name doesn't indicate it's specifically for settings navigation
- **SelectableListButton**: Describes mechanic not purpose

This leads to:

- Developer confusion: "Which button group should I use for [feature]?"
- Time waste: Reading through multiple component files to understand differences
- Wrong component selection: Using ChevronButtonGroup when DetailListGroup is needed
- Poor code archaeology: Future developers can't understand intent from names alone
- Harder onboarding: New team members need to memorise implementation-to-purpose mapping

### Opportunity

By renaming to purpose-based names:

- **Instant Clarity**: `<SettingsGroup />` vs `<ChevronButtonGroup />` - purpose immediately clear
- **Discoverability**: Developers can find correct component from autocomplete/search by use case
- **Self-Documenting**: Code reads like prose, no mental translation needed
- **Fewer Bugs**: Can't accidentally use wrong component if name matches use case
- **Faster Development**: No time wasted reading docs to understand which component fits

### Success Metrics

| Metric                     | Current | Target  | Business Impact          |
| -------------------------- | ------- | ------- | ------------------------ |
| Component selection time   | ~5 mins | ~30 sec | 90% reduction in lookup  |
| Wrong component usage rate | Unknown | 0%      | Zero selection mistakes  |
| Onboarding time (buttons)  | ~30min  | ~5 min  | 83% reduction in ramp-up |
| Developer satisfaction     | Unknown | High    | Improved DX scores       |

---

## Scope

### In Scope

**Component Renaming**:

- ChevronButtonGroup → SettingsGroup
- MenuButtonGroupSVG → DetailListGroup
- SelectableButtonGroup → PickerGroup
- ButtonWithChevron → SettingsItem
- SelectableListButton → PickerItem

**Migration Strategy**:

- Create new components with purpose-based names
- Migrate all screens one-by-one with validation
- Deprecate old components with @deprecated JSDoc tags
- Remove old components after full migration

**Testing**:

- All existing tests updated to use new names
- No functional changes - pure rename refactor
- 100% test coverage maintained

### Out of Scope

- ButtonGroup (base component) - already well-named
- ListGroup rename - base component name is acceptable
- Functional changes to components - pure rename only
- New component features - separate initiative
- Consolidating components - analysis showed current separation is optimal

---

## Timeline & Dates

**Start Date**: 2025-01-16
**Target Date**: 2025-01-17
**Completed Date**: _Not yet completed_

**Estimated Duration**: 1-2 days (6.5 hours total)

---

## Budget & Resources

**Budget**: £0
**Actual Cost**: _To be tracked_
**Total Effort**: 6.5 hours
**Actual Effort**: _To be tracked_

---

## Stakeholders

**Owner**: Warren de Leon
**Stakeholders**: Development team, future contributors

---

## ROI & Risk

**ROI Score**: High
**Risk Level**: Low

### Key Risks

**Risk 1**: Breaking Changes During Migration

- **Likelihood**: Low
- **Impact**: Medium
- **Mitigation**: Phased migration (new components alongside old), deprecation period, comprehensive testing at each step

**Risk 2**: Incomplete Migration (Old Names Linger)

- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**: Checklist-based migration, grep verification for old imports, final cleanup task that removes old components entirely

**Risk 3**: Test Failures During Migration

- **Likelihood**: Low
- **Impact**: Low
- **Mitigation**: Run `yarn validate` after each screen migration, fix issues immediately before proceeding

---

## User Stories

| ID                                                                                         | User Story                                        | Status      | Story Points |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------- | ----------- | ------------ |
| [US-020](../stories/US-020-refactor-button-group-component-names-purpose-based-clarity.md) | Refactor Button Group Component Names for Clarity | In Progress | 8            |

**Total Stories**: 1

---

## Tasks

| ID                                                                  | Task                             | Status      | Effort | Priority |
| ------------------------------------------------------------------- | -------------------------------- | ----------- | ------ | -------- |
| [TASK-087](../tasks/TASK-087-create-migration-plan-document.md)     | Create Migration Plan Document   | In Progress | 0.5h   | High     |
| [TASK-088](../tasks/TASK-088-create-settings-group-component.md)    | Create SettingsGroup Component   | To Do       | 0.25h  | High     |
| [TASK-089](../tasks/TASK-089-create-detail-list-group-component.md) | Create DetailListGroup Component | To Do       | 0.25h  | High     |
| [TASK-090](../tasks/TASK-090-create-picker-group-component.md)      | Create PickerGroup Component     | To Do       | 0.25h  | High     |
| [TASK-091](../tasks/TASK-091-create-settings-item-component.md)     | Create SettingsItem Component    | To Do       | 0.25h  | High     |
| [TASK-092](../tasks/TASK-092-create-picker-item-component.md)       | Create PickerItem Component      | To Do       | 0.25h  | High     |
| [TASK-093](../tasks/TASK-093-migrate-settings-screen.md)            | Migrate SettingsScreen           | To Do       | 0.5h   | High     |
| [TASK-094](../tasks/TASK-094-migrate-education-screen.md)           | Migrate EducationScreen          | To Do       | 0.5h   | High     |
| [TASK-095](../tasks/TASK-095-migrate-work-xp-screen.md)             | Migrate WorkXPScreen             | To Do       | 0.5h   | High     |
| [TASK-096](../tasks/TASK-096-migrate-language-screen.md)            | Migrate LanguageScreen           | To Do       | 0.5h   | Medium   |
| [TASK-097](../tasks/TASK-097-migrate-appearance-screen.md)          | Migrate AppearanceScreen         | To Do       | 0.5h   | Medium   |
| [TASK-098](../tasks/TASK-098-deprecate-old-components.md)           | Deprecate Old Components         | To Do       | 0.5h   | Medium   |
| [TASK-099](../tasks/TASK-099-remove-old-components.md)              | Remove Old Components            | To Do       | 1.5h   | Low      |

**Total Tasks**: 13
**Total Effort**: 6.5 hours

---

## Definition of Done

This epic is complete when:

1. ✅ All new components created with purpose-based names
2. ✅ All 5 screens migrated to new components (Settings, Education, WorkXP, Language, Appearance)
3. ✅ All tests updated and passing with new component names
4. ✅ Old components removed from codebase entirely
5. ✅ No references to old component names in imports or tests
6. ✅ `yarn validate` passes (typecheck + lint + test)
7. ✅ Migration plan document created and committed

---

## Status History

_Auto-tracked when status changes_

| Date       | Status      | Notes                    |
| ---------- | ----------- | ------------------------ |
| 2025-01-16 | In Progress | Epic created and started |

---

## Related Epics

- [EPIC-004](./EPIC-004-code-quality-tech-debt.md) - Related tech debt cleanup
- [EPIC-007](./EPIC-007-home-screen-redesign.md) - Uses button groups in Home screen

---

## References

- Component Analysis Report: Claude Code conversation 2025-01-16
- iOS Human Interface Guidelines: List and Collections
- React Native Best Practices: Component Naming Conventions

---

**Last Updated**: 2025-01-16
