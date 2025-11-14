# US-001: Smooth & Responsive Interactions

**Story ID**: US-001
**Title**: Smooth & Responsive Interactions
**Epic**: [EPIC-001: Performance Optimization](../epics/EPIC-001-performance-optimization.md)
**Status**: Completed
**Priority**: High
**Created**: 2025-01-11
**Assigned To**: Warren de Leon
**Category**: Performance

---

## User Story

**As a** mobile app user,
**I want** smooth scrolling through lists and instant button responses,
**So that** the app feels fast and professional like native iOS apps.

---

## Context & Rationale

Users experience lag, stuttering, and delayed responses when interacting with the app, particularly when scrolling through Settings, Language, and Appearance screens. This is caused by excessive component re-renders (30 per scroll vs target of 6) and frame drops (45 FPS vs target of 60 FPS).

React Native apps can achieve native-level performance when properly optimised. The primary culprits are:

1. **Component Re-renders**: Components re-render even when props haven't changed
2. **Expensive Computations**: Arrays and objects recreated on every render
3. **Unstable References**: Event handlers create new functions on every render
4. **Redux Overhead**: Selectors recompute unnecessarily

This user story addresses the #1 user complaint about app performance and directly impacts app store ratings and user retention.

**Real-world scenario**: A user scrolling through the Settings screen to change language expects instant 60 FPS scrolling like iOS native apps. Currently, they experience visible stuttering and frame drops.

**Related Epic**: See [EPIC-001](../epics/EPIC-001-performance-optimization.md) for business value, success metrics, and technical approach details.

---

## Benefits

### User Experience

- Smooth 60 FPS scrolling matches native iOS apps
- Instant button feedback improves perceived performance
- No visible lag or stuttering during interactions
- Better experience on mid-range and older devices

### Business Impact

- Higher app store ratings (target: 4.2★ → 4.5★+)
- Reduced user churn from performance complaints (-67% support tickets)
- Competitive parity with polished apps
- Better first impressions for new users

### Technical Benefits

- Established memoisation patterns for future features
- Reduced CPU usage and battery drain
- Foundation for more complex UI features
- Developer confidence in performance

---

## Impact & Effort

**Impact**: High
**Effort**: Medium
**Story Points**: 8

**Effort Estimate**: 6 hours
**Actual Effort**: _To be tracked_

---

## Risks & Mitigation

### Risk 1: Incorrect Dependency Arrays

**Impact**: Stale closures cause bugs where UI doesn't update
**Likelihood**: Medium
**Mitigation**:

- Enable ESLint `exhaustive-deps` rule
- Comprehensive testing of all interactive scenarios
- Code review focus on dependency arrays

### Risk 2: Over-memoisation Complexity

**Impact**: Code becomes harder to understand and maintain
**Likelihood**: Low
**Mitigation**:

- Only memoize components in lists or with expensive renders
- Document why each memoisation exists
- Profile before/after to prove value

---

## Pros & Cons

### Pros

✅ Dramatically improves user experience (60 FPS scrolling)
✅ Reduces complaints and support tickets
✅ Establishes performance patterns for future work
✅ Low risk (pure optimisation, no behaviour changes)
✅ Measurable impact via React DevTools Profiler

### Cons

❌ Adds complexity with useMemo/useCallback/React.memo
❌ Requires discipline with dependency arrays
❌ Marginal memory overhead from memoisation caches
❌ May need refactoring if component logic changes

**Trade-off**: Slight code complexity increase for significant UX improvement. The benefits far outweigh the costs.

---

## Acceptance Criteria

### Functional

- [ ] Scrolling through Settings screen is smooth (no stuttering)
- [ ] Scrolling through Language selection is smooth
- [ ] Scrolling through Appearance selection is smooth
- [ ] Button presses respond instantly (no delay)
- [ ] All existing functionality works identically

### Coverage

- [ ] React DevTools Profiler shows memoisation working
- [ ] No performance regressions on slower devices

### Technical

- [ ] Component re-renders reduced by 70%+ (30 → 9 or fewer per scroll)
- [ ] Frame rate improved to 58-60 FPS during interactions
- [ ] All components in lists wrapped with React.memo
- [ ] Expensive computations wrapped with useMemo
- [ ] Event handlers wrapped with useCallback
- [ ] Redux selectors use createSelector (Reselect)
- [ ] All tests pass (100% coverage maintained)
- [ ] ESLint exhaustive-deps rule enabled and passing
- [ ] No regressions introduced

---

## Test Scenarios

### Scenario 1: Settings Screen Scroll Performance

```gherkin
Given I am on the Settings screen
When I scroll up and down through the settings list rapidly
Then the frame rate should remain at 58-60 FPS
And there should be no visible stuttering or lag
And React DevTools Profiler shows ButtonWithChevron not re-rendering unnecessarily
```

### Scenario 2: Button Response Time

```gherkin
Given I am on the Settings screen
When I tap the "Language" button
Then the navigation should occur instantly (< 100ms)
And there should be no visible delay or frame drop
```

### Scenario 3: Re-render Count Validation

```gherkin
Given React DevTools Profiler is recording
When I scroll through the Settings screen once
Then the total number of component re-renders should be 9 or fewer
And each ButtonWithChevron should re-render at most once
```

### Scenario 4: Functionality Unchanged

```gherkin
Given the performance optimisations are applied
When I interact with all screens (Settings, Language, Appearance)
Then all navigation should work identically to before
And all theme changes should apply correctly
And all language changes should apply correctly
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
- [ ] Tests written and passing (unit + integration)
- [ ] Documentation updated
- [ ] No regressions
- [ ] Deployed to staging
- [ ] Product owner approval

---

## Dependencies

### Blockers

- [TASK-023](../tasks/TASK-023-remove-unused-dependencies.md): Remove unused dependencies first
- [TASK-024](../tasks/TASK-024-add-missing-types.md): Add @types/node first
- [TASK-011](../tasks/TASK-011-create-error-boundary.md): Error Boundary in place as safety net

### Enables

- [US-004](./US-004-comprehensive-test-coverage.md): Tests validate performance improvements

---

## Tasks

| ID                                                             | Task                            | Effort | Priority | Status      |
| -------------------------------------------------------------- | ------------------------------- | ------ | -------- | ----------- |
| [TASK-001](../tasks/TASK-001-memo-button-with-chevron.md)      | React.memo ButtonWithChevron    | 0.5h   | High     | Not Started |
| [TASK-002](../tasks/TASK-002-memo-selectable-list-button.md)   | React.memo SelectableListButton | 0.5h   | High     | Not Started |
| [TASK-003](../tasks/TASK-003-memo-button-group-divider.md)     | React.memo ButtonGroupDivider   | 0.5h   | High     | Not Started |
| [TASK-004](../tasks/TASK-004-usememo-settings-screen.md)       | useMemo SettingsScreen          | 0.75h  | High     | Not Started |
| [TASK-005](../tasks/TASK-005-usememo-language-screen.md)       | useMemo LanguageScreen          | 0.5h   | High     | Not Started |
| [TASK-006](../tasks/TASK-006-usememo-appearance-screen.md)     | useMemo AppearanceScreen        | 0.5h   | High     | Not Started |
| [TASK-007](../tasks/TASK-007-usecallback-settings-screen.md)   | useCallback SettingsScreen      | 0.5h   | High     | Not Started |
| [TASK-008](../tasks/TASK-008-usecallback-language-screen.md)   | useCallback LanguageScreen      | 0.5h   | High     | Not Started |
| [TASK-009](../tasks/TASK-009-usecallback-appearance-screen.md) | useCallback AppearanceScreen    | 0.5h   | High     | Not Started |
| [TASK-010](../tasks/TASK-010-optimize-redux-selectors.md)      | Optimise Redux Selectors        | 1h     | Medium   | Not Started |

**Total Tasks**: 10
**Total Effort**: 6 hours

---

## Implementation Phases

### Phase 1: Component Memoisation (1.5h)

Apply React.memo to list components to prevent unnecessary re-renders:

- TASK-001: ButtonWithChevron
- TASK-002: SelectableListButton
- TASK-003: ButtonGroupDivider

**Validation**: React DevTools Profiler shows reduced re-renders

### Phase 2: Computed Values (1.75h)

Wrap expensive array computations with useMemo:

- TASK-004: SettingsScreen settingsItems array
- TASK-005: LanguageScreen languageItems array
- TASK-006: AppearanceScreen themeItems array

**Validation**: Arrays maintain stable references across renders

### Phase 3: Event Handlers (1.5h)

Wrap event handlers with useCallback:

- TASK-007: SettingsScreen navigation handlers
- TASK-008: LanguageScreen selection handler
- TASK-009: AppearanceScreen selection handler

**Validation**: Function references stable, child components don't re-render

### Phase 4: Redux Optimisation (1h)

Memoize Redux selectors with createSelector:

- TASK-010: All Redux selectors

**Validation**: Selectors only recompute when slice changes

### Phase 5: Validation & Testing (0.25h)

- Run React DevTools Profiler measurements
- Verify 70%+ re-render reduction
- Test on physical device (iPhone)
- Confirm 58-60 FPS during interactions

---

## Timeline & Dates

**Start Date**: 2025-01-11
**Completed Date**: _Not yet completed_

---

## Blocked Information

**Blocked Since**: _Not blocked_
**Blocked Reason**: _N/A_

---

## Status History

_Auto-tracked when status changes_

| Date       | Status      | Notes         |
| ---------- | ----------- | ------------- |
| 2025-01-11 | Not Started | Story created |

---

## Work Log

_Manual developer notes for significant updates_

---

## Technical Debt

**Technical Debt Score**: 0

This story pays down performance debt by implementing memoisation patterns.

---

## Success Criteria

This user story is complete when:

1. ✅ **Performance Target Met**: 70%+ reduction in re-renders (30 → 9 or fewer per scroll)
2. ✅ **Frame Rate Achieved**: Consistent 58-60 FPS during scrolling and interactions
3. ✅ **All Tasks Complete**: 10 tasks implemented, tested, and merged
4. ✅ **Zero Regressions**: All existing functionality works identically
5. ✅ **Profiler Validation**: React DevTools Profiler confirms memoisation effectiveness
6. ✅ **Physical Device Testing**: Tested on actual iPhone, performance validated

---

## Alternative Approaches

### Alternative 1: FlatList Virtualisation

Use FlatList instead of ScrollView for lists.

**Pros**: Built-in virtualisation, handles large lists well
**Cons**: Current lists are small (< 10 items), unnecessary complexity

**Decision**: Memoisation sufficient for current list sizes (future consideration for large lists)

### Alternative 2: Native Optimisation

Optimise at native module level instead of React layer.

**Pros**: Potentially better performance
**Cons**: High complexity, React-level optimisation usually sufficient

**Decision**: React-level optimisation first, native optimisation only if needed

---

## Notes & Learnings

_To be filled in during/after implementation_

---

## References

- [React.memo Documentation](https://react.dev/reference/react/memo)
- [useMemo Hook Documentation](https://react.dev/reference/react/useMemo)
- [useCallback Hook Documentation](https://react.dev/reference/react/useCallback)
- [Reselect Library](https://github.com/reduxjs/reselect)
- [React DevTools Profiler](https://react.dev/reference/react/Profiler)
- [EPIC-001: Performance Optimization](../epics/EPIC-001-performance-optimization.md)

---

**Last Updated**: 2025-01-12
