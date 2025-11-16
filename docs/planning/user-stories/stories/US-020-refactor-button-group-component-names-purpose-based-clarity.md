# US-020: Refactor Button Group Component Names for Purpose-Based Clarity

**Story ID**: US-020
**Title**: Refactor Button Group Component Names for Purpose-Based Clarity
**Epic**: [EPIC-011: Component Naming Clarity](../epics/EPIC-011-component-naming-clarity.md)
**Status**: In Progress
**Priority**: High
**Created**: 2025-01-16
**Assigned To**: Warren de Leon
**Category**: Tech Debt

---

## User Story

**As a** developer working on the React Native app,
**I want** button component names to clearly communicate their purpose and use case,
**So that** I can quickly select the right component without reading documentation or inspecting code.

---

## Context & Rationale

The current button and button group components have implementation-focused names that don't reveal their intended use case. When adding features or maintaining existing screens, developers must spend time understanding which component is appropriate for their needs.

For example:

- "ChevronButtonGroup" tells me it has chevrons, but not that it's specifically for settings/navigation menus
- "MenuButtonGroupSVG" is vague ("menu" could mean anything) and exposes implementation detail ("SVG")
- "SelectableButtonGroup" describes behaviour but not the use case (single-selection picker)

This creates friction during development and increases cognitive load.

**Real-world scenario**: A developer needs to add a new settings option. They see "ChevronButtonGroup" and "SelectableButtonGroup" in autocomplete. Without reading the code or docs, they can't determine which is correct. With purpose-based names like "SettingsGroup" and "PickerGroup", the answer is immediately obvious.

**Related Epic**: See [EPIC-011](../epics/EPIC-011-component-naming-clarity.md) for business impact and success metrics.

---

## Benefits

### User Experience

- No direct user-facing benefits (internal refactor)
- Indirect: Faster feature development = faster user value delivery

### Business Impact

- **90% reduction in component selection time** (5 mins → 30 seconds)
- **83% reduction in onboarding time** for button components (30 mins → 5 mins)
- **Zero wrong component selection** (names match use cases exactly)
- **Improved code maintainability** (future developers understand intent immediately)

### Technical Benefits

- **Self-documenting code**: Component names reveal purpose
- **Better discoverability**: Can search/autocomplete by use case
- **Type safety maintained**: All TypeScript types carry over
- **Test coverage preserved**: All tests updated, no coverage loss

---

## Impact & Effort

**Impact**: High
**Effort**: Medium
**Story Points**: 8

**Effort Estimate**: 6.5 hours
**Actual Effort**: _To be tracked_

---

## Risks & Mitigation

### Risk 1: Breaking Changes During Migration

**Impact**: Could break functionality if migration incomplete or tests fail
**Likelihood**: Low
**Mitigation**:

- Create new components alongside old (no deletions until migration complete)
- Migrate one screen at a time with validation after each
- Run `yarn validate` after every screen migration
- Only remove old components after all screens migrated successfully

### Risk 2: Missed References to Old Names

**Impact**: Build failures or runtime errors if old imports remain
**Likelihood**: Medium
**Mitigation**:

- Use grep to verify no old imports remain before removal
- TypeScript will catch import errors at compile time
- Deprecation warnings will catch any runtime usage
- Final verification task ensures complete cleanup

---

## Pros & Cons

### Pros

✅ **Instant clarity**: Component name reveals use case (SettingsGroup vs ChevronButtonGroup)
✅ **Faster development**: No time wasted looking up which component to use
✅ **Fewer bugs**: Can't use wrong component if name matches use case exactly
✅ **Better onboarding**: New developers understand components from names alone
✅ **Self-documenting**: Code reads like prose, no mental translation needed
✅ **Low risk**: Pure rename refactor, no functional changes

### Cons

❌ **Migration effort**: 6.5 hours to rename and migrate all usages
❌ **Git history noise**: Rename creates churn in git blame (mitigated by git blame -C)
❌ **Learning curve**: Existing developers must learn new names (minimal, names are intuitive)

**Trade-off**: Short-term migration cost for long-term clarity and maintainability. The investment pays off immediately and compounds over time as the codebase grows.

---

## Acceptance Criteria

### Functional

- [ ] All new components created with purpose-based names (SettingsGroup, DetailListGroup, PickerGroup, SettingsItem, PickerItem)
- [ ] All 5 screens migrated successfully (Settings, Education, WorkXP, Language, Appearance)
- [ ] All functionality preserved - no behaviour changes
- [ ] Old components removed from codebase after migration complete

### Coverage

- [ ] All existing unit tests updated to use new component names
- [ ] All tests passing after migration
- [ ] Test coverage maintained at 85%+ (no coverage loss)
- [ ] New component test files created (mirror old test structure)

### Technical

- [ ] TypeScript compilation passes (`yarn typecheck`)
- [ ] ESLint passes (`yarn lint`)
- [ ] All tests pass (`yarn validate`)
- [ ] No references to old component names in codebase (verified via grep)
- [ ] Migration plan document created and committed
- [ ] No regressions introduced

---

## Test Scenarios

### Scenario 1: SettingsScreen Uses SettingsGroup

```gherkin
Given I have migrated SettingsScreen to use SettingsGroup
When I render SettingsScreen
Then it displays settings items with icons, end labels, and chevrons
And all interactions work identically to before migration
And tests pass with new component name
```

### Scenario 2: LanguageScreen Uses PickerGroup

```gherkin
Given I have migrated LanguageScreen to use PickerGroup
When I render LanguageScreen
Then it displays language options with checkmarks for selected language
And selection behaviour works identically to before migration
And tests pass with new component name
```

### Scenario 3: EducationScreen Uses DetailListGroup

```gherkin
Given I have migrated EducationScreen to use DetailListGroup
When I render EducationScreen
Then it displays education items with SVG logos, subtitles, and chevrons
And all interactions work identically to before migration
And tests pass with new component name
```

### E2E Testing (Detox + Cucumber)

```gherkin
Scenario: All screens work after migration
  Given I have migrated all 5 screens to new component names
  When I navigate through Settings → Language → Appearance flows
  Then all interactions work as expected
  And Education screen displays correctly with SVG logos
  And Work Experience screen displays correctly with company logos
  And no runtime errors occur
```

---

## Definition of Ready

- [x] User story statement written (As a/I want/So that)
- [x] Acceptance criteria defined
- [x] Story points estimated
- [x] Dependencies identified
- [x] Epic linked
- [x] Technical approach discussed

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Tests written and passing (unit + integration + E2E)
- [ ] Documentation updated
- [ ] No regressions
- [ ] Migration complete and old components removed

---

## Dependencies

### Blockers

None - all component code exists and is tested

### Enables

- Clearer codebase for future features
- Easier onboarding for new developers
- Foundation for potential component library extraction

---

## Tasks

| ID                                                                  | Task                             | Effort | Priority | Status      |
| ------------------------------------------------------------------- | -------------------------------- | ------ | -------- | ----------- |
| [TASK-087](../tasks/TASK-087-create-migration-plan-document.md)     | Create Migration Plan Document   | 0.5h   | High     | In Progress |
| [TASK-088](../tasks/TASK-088-create-settings-group-component.md)    | Create SettingsGroup Component   | 0.25h  | High     | To Do       |
| [TASK-089](../tasks/TASK-089-create-detail-list-group-component.md) | Create DetailListGroup Component | 0.25h  | High     | To Do       |
| [TASK-090](../tasks/TASK-090-create-picker-group-component.md)      | Create PickerGroup Component     | 0.25h  | High     | To Do       |
| [TASK-091](../tasks/TASK-091-create-settings-item-component.md)     | Create SettingsItem Component    | 0.25h  | High     | To Do       |
| [TASK-092](../tasks/TASK-092-create-picker-item-component.md)       | Create PickerItem Component      | 0.25h  | High     | To Do       |
| [TASK-093](../tasks/TASK-093-migrate-settings-screen.md)            | Migrate SettingsScreen           | 0.5h   | High     | To Do       |
| [TASK-094](../tasks/TASK-094-migrate-education-screen.md)           | Migrate EducationScreen          | 0.5h   | High     | To Do       |
| [TASK-095](../tasks/TASK-095-migrate-work-xp-screen.md)             | Migrate WorkXPScreen             | 0.5h   | High     | To Do       |
| [TASK-096](../tasks/TASK-096-migrate-language-screen.md)            | Migrate LanguageScreen           | 0.5h   | Medium   | To Do       |
| [TASK-097](../tasks/TASK-097-migrate-appearance-screen.md)          | Migrate AppearanceScreen         | 0.5h   | Medium   | To Do       |
| [TASK-098](../tasks/TASK-098-deprecate-old-components.md)           | Deprecate Old Components         | 0.5h   | Medium   | To Do       |
| [TASK-099](../tasks/TASK-099-remove-old-components.md)              | Remove Old Components            | 1.5h   | Low      | To Do       |

**Total Tasks**: 13
**Total Effort**: 6.5 hours

---

## Implementation Phases

### Phase 1: Create New Components (1.25h)

Create all new components with purpose-based names as exact copies of old components with updated names and exports.

- TASK-088: Create SettingsGroup (copy of ChevronButtonGroup)
- TASK-089: Create DetailListGroup (copy of MenuButtonGroupSVG)
- TASK-090: Create PickerGroup (copy of SelectableButtonGroup)
- TASK-091: Create SettingsItem (copy of ButtonWithChevron)
- TASK-092: Create PickerItem (copy of SelectableListButton)

**Validation**: All new components exist, TypeScript compiles, tests pass

### Phase 2: Migrate Screens (2.5h)

Migrate each screen one at a time with validation after each.

- TASK-093: Migrate SettingsScreen (validate)
- TASK-094: Migrate EducationScreen (validate)
- TASK-095: Migrate WorkXPScreen (validate)
- TASK-096: Migrate LanguageScreen (validate)
- TASK-097: Migrate AppearanceScreen (validate)

**Validation**: After each screen, run `yarn validate` and verify functionality

### Phase 3: Cleanup (2h)

Remove old components and ensure no references remain.

- TASK-098: Add @deprecated tags to old components
- TASK-099: Remove old components entirely after grep verification

**Validation**: Grep shows zero references to old names, all tests pass

---

## Timeline & Dates

**Start Date**: 2025-01-16
**Completed Date**: _Not yet completed_

---

## Blocked Information

**Blocked Since**: _Not blocked_
**Blocked Reason**: _N/A_

---

## Status History

_Auto-tracked when status changes_

| Date       | Status      | Notes                     |
| ---------- | ----------- | ------------------------- |
| 2025-01-16 | In Progress | Story created and started |

---

## Work Log

_Manual developer notes for significant updates_

**2025-01-16**: Story created. Migration plan task started.

---

## Technical Debt

**Technical Debt Score**: -5 (pays down debt)

This story pays down technical debt by improving component naming clarity. No new technical debt introduced.

---

## Success Criteria

This user story is complete when:

1. ✅ All 5 new components created and tested
2. ✅ All 5 screens migrated and validated
3. ✅ All old components removed
4. ✅ Zero references to old names in codebase
5. ✅ All tasks complete
6. ✅ All tests passing
7. ✅ Documentation updated

---

## Alternative Approaches

### Alternative 1: Keep Current Names

Keep implementation-focused names (ChevronButtonGroup, MenuButtonGroupSVG, etc.)

**Pros**: No migration effort, no git history churn
**Cons**: Developer confusion continues, onboarding remains slow, wrong component selection continues

**Decision**: Rejected. Short-term migration cost is worth long-term clarity.

### Alternative 2: Consolidate Into Single Component

Create one mega-component with variant prop instead of separate components.

**Pros**: Fewer components to name
**Cons**: Type safety loss, props explosion, runtime overhead, testing complexity

**Decision**: Rejected. Analysis showed current separation is optimal. See component analysis report.

### Alternative 3: Use Namespace Pattern

Use namespacing like `ButtonGroup.Settings`, `ButtonGroup.DetailList`, etc.

**Pros**: Groups related components, clear hierarchy
**Cons**: Doesn't work well with React Native imports, less discoverable in autocomplete, verbose

**Decision**: Rejected. Flat structure with purpose-based names is clearer and more idiomatic.

---

## Notes & Learnings

_To be filled in during/after implementation_

---

## References

- [Epic](../epics/EPIC-011-component-naming-clarity.md)
- Component Analysis Report: Claude Code conversation 2025-01-16
- iOS Human Interface Guidelines: List and Collections
- React Component Naming Best Practices

---

**Last Updated**: 2025-01-16
