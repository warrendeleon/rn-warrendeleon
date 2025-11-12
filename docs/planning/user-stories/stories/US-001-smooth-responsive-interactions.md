# US-001: Smooth & Responsive Interactions

**ID**: US-001
**Title**: Smooth & Responsive Interactions
**Epic**: [EPIC-001: Performance Optimization](../epics/EPIC-001-performance-optimization.md)
**Created**: 2025-01-11
**Completed**: _Not yet completed_
**Status**: Not Started
**Priority**: High
**Effort Estimate**: 6 hours
**Tags**: `performance`, `ux`, `memoization`, `redux`

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
- Reduced user churn and complaints
- Competitive parity with polished apps
- Better first impressions for new users

### Technical Benefits

- Established memoization patterns for future features
- Reduced CPU usage and battery drain
- Foundation for more complex UI features
- Developer confidence in performance

---

## Risks & Mitigation

### Risk 1: Incorrect Dependency Arrays

**Impact**: Stale closures cause bugs where UI doesn't update
**Likelihood**: Medium
**Mitigation**:

- Enable ESLint `exhaustive-deps` rule
- Comprehensive testing of all interactive scenarios
- Code review focus on dependency arrays

### Risk 2: Over-memoization Complexity

**Impact**: Code becomes harder to understand and maintain
**Likelihood**: Low
**Mitigation**:

- Only memoize components in lists or with expensive renders
- Document why each memoization exists
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
❌ Marginal memory overhead from memoization caches
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

### Performance

- [ ] Component re-renders reduced by 70%+ (30 → 9 or fewer per scroll)
- [ ] Frame rate improved to 58-60 FPS during interactions
- [ ] React DevTools Profiler shows memoization working
- [ ] No performance regressions on slower devices

### Technical

- [ ] All components in lists wrapped with React.memo
- [ ] Expensive computations wrapped with useMemo
- [ ] Event handlers wrapped with useCallback
- [ ] Redux selectors use createSelector (Reselect)
- [ ] All tests pass (100% coverage maintained)
- [ ] ESLint exhaustive-deps rule enabled and passing

---

## Test Scenarios

### Performance Testing

**Scenario 1: Settings Screen Scroll Performance**

```gherkin
Given I am on the Settings screen
When I scroll up and down through the settings list rapidly
Then the frame rate should remain at 58-60 FPS
And there should be no visible stuttering or lag
And React DevTools Profiler shows ButtonWithChevron not re-rendering unnecessarily
```

**Scenario 2: Button Response Time**

```gherkin
Given I am on the Settings screen
When I tap the "Language" button
Then the navigation should occur instantly (< 100ms)
And there should be no visible delay or frame drop
```

**Scenario 3: Re-render Count Validation**

```gherkin
Given React DevTools Profiler is recording
When I scroll through the Settings screen once
Then the total number of component re-renders should be 9 or fewer
And each ButtonWithChevron should re-render at most once
```

### Regression Testing

**Scenario 4: Functionality Unchanged**

```gherkin
Given the performance optimisations are applied
When I interact with all screens (Settings, Language, Appearance)
Then all navigation should work identically to before
And all theme changes should apply correctly
And all language changes should apply correctly
```

---

## Dependencies

### Blockers

- [TASK-023](../tasks/TASK-023-remove-unused-dependencies.md): Remove unused dependencies first
- [TASK-024](../tasks/TASK-024-add-missing-types.md): Add @types/node first
- [TASK-011](../tasks/TASK-011-create-error-boundary.md): Error Boundary in place as safety net

### Related Stories

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
| [TASK-010](../tasks/TASK-010-optimize-redux-selectors.md)      | Optimize Redux Selectors        | 1h     | Medium   | Not Started |

**Total**: 10 tasks, 6 hours

---

## Implementation Phases

### Phase 1: Component Memoization (1.5h)

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

### Phase 4: Redux Optimization (1h)

Memoize Redux selectors with createSelector:

- TASK-010: All Redux selectors

**Validation**: Selectors only recompute when slice changes

### Phase 5: Validation & Testing (0.25h)

- Run React DevTools Profiler measurements
- Verify 70%+ re-render reduction
- Test on physical device (iPhone)
- Confirm 58-60 FPS during interactions

---

## Success Criteria

This user story is complete when:

1. ✅ **Performance Target Met**: 70%+ reduction in re-renders (30 → 9 or fewer per scroll)
2. ✅ **Frame Rate Achieved**: Consistent 58-60 FPS during scrolling and interactions
3. ✅ **All Tasks Complete**: 10 tasks implemented, tested, and merged
4. ✅ **Zero Regressions**: All existing functionality works identically
5. ✅ **Profiler Validation**: React DevTools Profiler confirms memoization effectiveness
6. ✅ **Physical Device Testing**: Tested on actual iPhone, performance validated

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

**Last Updated**: 2025-01-11
