# US-024: Performance Optimization Phase 2

**Story ID**: US-024
**Title**: Performance Optimization Phase 2
**Epic**: [EPIC-014: Performance & Quality Phase 2](../epics/EPIC-014-performance-quality-phase-2.md)
**Status**: ⏳ In Progress
**Priority**: 🟠 High
**Created**: 2025-01-17
**Assigned To**: Warren de Leon
**Category**: Performance

---

## User Story

**As a** mobile app user,
**I want** faster app renders, responsive layouts, and intelligent data loading,
**So that** the app feels snappy and professional on all devices and orientations.

---

## Context & Rationale

Current performance issues affect user experience:

1. **Missing React.memo**: Pure components (DetailListGroup, SettingsItem, ButtonGroupDivider) re-render unnecessarily, causing slowdowns
2. **Non-responsive Layout**: ProfileScreen uses `Dimensions.get()` at module level, which doesn't update on device rotation, breaking landscape mode
3. **Fixed Splash Duration**: SplashScreen always shows 4.5 seconds even if data loads in 1 second, wasting user time
4. **No API Caching**: Same data fetched multiple times per session, wasting bandwidth and causing unnecessary loading states

These issues compound to create a sluggish, unpolished experience, especially on mid-range devices.

**Real-world scenario**: User rotates device from portrait to landscape while viewing ProfileScreen. Layout doesn't adjust because `Dimensions.get()` was called at module level. User then navigates between screens, triggering duplicate API calls because there's no caching. Meanwhile, app launch always takes 4.5 seconds even though profile data loads in 1 second.

**Related Epic**: See [EPIC-014](../epics/EPIC-014-performance-quality-phase-2.md) for complete performance strategy and business value.

---

## Benefits

### User Experience

- 15-20% faster renders with React.memo
- Responsive layouts work correctly on rotation
- Faster perceived app launch (1.5-2.5s vs fixed 4.5s)
- Reduced loading states with API caching
- Smoother interactions overall

### Business Impact

- Higher app store ratings (better performance = better reviews)
- Reduced bandwidth costs with caching
- Better experience on mid-range and budget devices
- Competitive parity with polished apps
- Lower user churn

### Technical Benefits

- Established performance patterns for future features
- Responsive layout hooks prevent rotation bugs
- Parallel data loading patterns documented
- RTK Query foundation for future API features (optional)

---

## Impact & Effort

**Impact**: High
**Effort**: Medium-High
**Story Points**: 21

**Effort Estimate**: 13 hours (5h required + 8h optional RTK Query)
**Actual Effort**: _To be tracked_

---

## Risks & Mitigation

### Risk 1: React.memo Breaks Component Behaviour

**Impact**: Memoized components don't update when they should
**Likelihood**: Low
**Mitigation**:

- Only memoize truly pure components
- Comprehensive testing of all interactive scenarios
- Test both memoized and un-memoized behaviour
- Code review focus on prop stability

### Risk 2: useWindowDimensions Causes Re-renders

**Impact**: Switching to hook might cause performance regression
**Likelihood**: Low
**Mitigation**:

- Benchmark before/after with React DevTools Profiler
- Only subscribe to dimensions where layout needs to be responsive
- Use memoization for computed layout values

### Risk 3: RTK Query Migration Complexity

**Impact**: 8-hour migration might be too complex for this sprint
**Likelihood**: Medium
**Mitigation**:

- Mark RTK Query as **optional** task
- Can defer to future sprint if timeline tight
- Other optimizations provide immediate value without it

---

## Pros & Cons

### Pros

✅ Measurable performance improvements (15-20% faster)
✅ Fixes critical rotation bug in ProfileScreen
✅ Better user experience (faster launch, less waiting)
✅ Reduces bandwidth usage with caching
✅ Patterns applicable to all future features

### Cons

❌ React.memo adds code complexity
❌ RTK Query is large optional dependency (8h effort)
❌ Splash timing optimization requires careful tuning
❌ Performance testing requires profiling tools

**Trade-off**: Moderate complexity increase for significant UX improvement. Worth the investment.

---

## Acceptance Criteria

### Functional

- [ ] DetailListGroup, SettingsItem, ButtonGroupDivider wrapped with React.memo
- [ ] ProfileScreen uses useWindowDimensions (layout updates on rotation)
- [ ] Splash screen loads data in parallel with Promise.all
- [ ] Splash shows minimum 1.5s, then completes when data ready (not fixed 4.5s)
- [ ] All existing functionality works identically

### Coverage

- [ ] All optimized components have tests
- [ ] Performance improvements measured with React DevTools Profiler
- [ ] No regressions on slower devices

### Technical

- [ ] App renders 15-20% faster (measured with Profiler)
- [ ] ProfileScreen layout updates correctly on rotation
- [ ] Splash screen dynamic timing working correctly
- [ ] Optional: RTK Query implemented for API caching (if timeline allows)
- [ ] All tests pass (100% coverage maintained)
- [ ] `yarn validate` passes (0 errors, 0 failures)

---

## Test Scenarios

### Scenario 1: React.memo Prevents Re-renders

```gherkin
Given DetailListGroup is wrapped with React.memo
And the component is rendered in a list
When the parent component re-renders with identical props
Then DetailListGroup should NOT re-render
And React DevTools Profiler should confirm this
```

### Scenario 2: Responsive Layout on Rotation

```gherkin
Given I am viewing ProfileScreen in portrait mode
When I rotate the device to landscape
Then the ProfileScreen layout should update to new dimensions
And the background image should resize correctly
And all content should remain visible
```

### Scenario 3: Dynamic Splash Screen Timing

```gherkin
Given the app is launching
When profile data loads in 1 second
Then the splash screen should show for minimum 1.5 seconds
And close immediately after data is ready

Given the app is launching
When profile data takes 3 seconds to load
Then the splash screen should wait for data to complete
And close once data is ready (no fixed 4.5s wait)
```

### Scenario 4: Parallel Data Loading

```gherkin
Given the splash screen is initiating data load
When multiple API calls need to be made (profile, education, work experience)
Then all API calls should execute in parallel (Promise.all)
And splash should close once all complete
And not sequentially wait for each one
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
- [ ] Tests written and passing
- [ ] Performance measurements documented
- [ ] No regressions
- [ ] Documentation updated

---

## Dependencies

### Blockers

- [US-022](./US-022-security-hardening.md): Security fixes should complete first
- [US-023](./US-023-test-coverage-completion.md): Testing foundation should be solid

### Enables

- Future performance optimizations
- Better user experience across all features

---

## Tasks

| ID                                                         | Task                                              | Effort | Priority  | Status         |
| ---------------------------------------------------------- | ------------------------------------------------- | ------ | --------- | -------------- |
| [TASK-120](../tasks/TASK-120-add-react-memo-components.md) | Add React.memo to Pure Components                 | 2h     | 🟠 High   | ✅ Complete    |
| [TASK-121](../tasks/TASK-121-fix-dimensions-hook.md)       | Replace Dimensions.get() with useWindowDimensions | 1h     | 🟠 High   | ✅ Complete    |
| [TASK-122](../tasks/TASK-122-optimize-splash-loading.md)   | Optimise Splash Screen Data Loading               | 2h     | 🟠 High   | ✅ Complete    |
| [TASK-123](../tasks/TASK-123-implement-rtk-query.md)       | Implement RTK Query for API Caching (OPTIONAL)    | 8h     | 🟡 Medium | 📋 Not Started |

**Total Tasks**: 4
**Total Effort**: 13 hours (5h required + 8h optional)

---

## Implementation Phases

### Phase 1: React.memo (2h)

- TASK-122: Wrap DetailListGroup, SettingsItem, ButtonGroupDivider
- Test each component for proper memoization

**Validation**: React DevTools Profiler shows 15-20% render improvement

### Phase 2: Responsive Layout (1h)

- TASK-123: Replace Dimensions.get() with useWindowDimensions in ProfileScreen
- Test rotation in simulator and physical device

**Validation**: Layout updates correctly on rotation

### Phase 3: Splash Optimization (2h)

- TASK-122: Parallel data loading + dynamic timing
- Minimum 1.5s splash, maximum when data ready

**Validation**: Splash timing adapts to actual load time

### Phase 4: API Caching - OPTIONAL (8h)

- TASK-123: Integrate RTK Query for automatic caching
- Migrate Profile/Education/WorkExperience endpoints

**Validation**: 50% reduction in duplicate API calls

---

## Timeline & Dates

**Start Date**: _Not yet started_
**Target Completion**: 2025-02-03 (1 week, parallel with EPIC-015)
**Completed Date**: _Not yet completed_

---

## Blocked Information

**Blocked**: No
**Blocked Since**: _N/A_
**Blocked Reason**: _N/A_

---

## Status History

_Auto-tracked when status changes_

| Date       | Status      | Notes         |
| ---------- | ----------- | ------------- |
| 2025-01-17 | Not Started | Story created |

---

## Work Log

_Manual developer notes for significant updates_

---

## Technical Debt

**Technical Debt Score**: -3 (pays down performance debt)

This story addresses performance anti-patterns and establishes optimized patterns.

---

## Success Criteria

This user story is complete when:

1. ✅ **React.memo Applied**: 15-20% faster renders measured with Profiler
2. ✅ **Responsive Layout**: ProfileScreen works correctly on rotation
3. ✅ **Dynamic Splash**: Timing adapts to actual data load time
4. ✅ **All Tests Pass**: Zero failures, coverage maintained
5. ✅ **No Regressions**: Existing functionality unchanged
6. ✅ **Optional RTK Query**: API caching implemented (if timeline allows)

---

## Alternative Approaches

### Alternative 1: FlatList Virtualization

Use FlatList instead of mapping components.

**Pros**: Better for very large lists (100+ items)
**Cons**: Current lists are small (< 20 items), React.memo sufficient

**Decision**: React.memo is simpler and adequate for current list sizes

### Alternative 2: Apollo Client Instead of RTK Query

Use Apollo Client for GraphQL API caching.

**Pros**: More powerful for complex GraphQL APIs
**Cons**: App uses REST APIs, not GraphQL; RTK Query better fit

**Decision**: RTK Query is better fit for REST APIs

### Alternative 3: Keep Fixed Splash Duration

Don't optimize splash timing, keep 4.5s fixed.

**Pros**: Simpler implementation
**Cons**: Poor user experience when data loads quickly

**Decision**: Dynamic timing provides better UX, worth the effort

---

## Notes & Learnings

_To be filled in during/after implementation_

---

## References

- [React.memo Documentation](https://react.dev/reference/react/memo)
- [useWindowDimensions Hook](https://reactnative.dev/docs/usewindowdimensions)
- [React DevTools Profiler](https://react.dev/reference/react/Profiler)
- [RTK Query Tutorial](https://redux-toolkit.js.org/tutorials/rtk-query)
- [Promise.all MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [EPIC-014: Performance & Quality Phase 2](../epics/EPIC-014-performance-quality-phase-2.md)

---

**Last Updated**: 2025-01-17
