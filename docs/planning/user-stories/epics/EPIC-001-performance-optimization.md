# EPIC-001: Performance Optimization

**ID**: EPIC-001
**Title**: Performance Optimization - Eliminate Unnecessary Re-renders
**Created**: 2025-01-11
**Status**: Not Started
**Priority**: High
**Total Effort**: 6 hours
**Total Tasks**: 10

---

## Executive Summary

Optimize React Native app performance by implementing memoization strategies to reduce component re-renders by 70-80%, resulting in smooth 60 FPS scrolling and dramatically improved user experience.

**Business Impact**: Better app store ratings, reduced user churn, competitive performance advantage

---

## Business Value

### Problem

Users are experiencing:

- Stuttering and lag during scrolling
- Delayed button responses
- Visible frame drops during interactions
- Poor performance on mid-range devices

This leads to:

- Negative app store reviews mentioning performance
- Support tickets about "slow app"
- User churn to competitors with smoother apps
- Damage to brand perception

### Opportunity

By implementing performance optimizations:

- **User Satisfaction**: Smooth, responsive interactions increase engagement
- **App Store**: Better ratings improve discovery and downloads
- **Competitive Edge**: Performance parity with top apps in category
- **Device Support**: Works well even on 3-year-old phones
- **Developer Velocity**: Established patterns for future components

### Success Metrics

| Metric                  | Current        | Target    | Business Impact    |
| ----------------------- | -------------- | --------- | ------------------ |
| App Store rating        | 4.2★           | 4.5★+     | +15% downloads     |
| Performance complaints  | 15% of tickets | <5%       | -67% support load  |
| Frame rate (scroll)     | 45 FPS         | 58-60 FPS | Smooth experience  |
| Component re-renders    | 30/scroll      | 6/scroll  | -80% wasted cycles |
| User retention (week 1) | 65%            | 75%+      | +10% retention     |

---

## Scope

### In Scope

**Component Memoization** (React.memo):

- ButtonWithChevron
- SelectableListButton
- ButtonGroupDivider

**Computed Value Optimization** (useMemo):

- SettingsScreen settingsItems array
- LanguageScreen languageItems array
- AppearanceScreen themeItems array

**Event Handler Optimization** (useCallback):

- SettingsScreen navigation handlers
- LanguageScreen selection handler
- AppearanceScreen selection handler

**Redux Optimization**:

- Memoised selectors with createSelector from Reselect

### Out of Scope

- Native module optimization (separate initiative)
- Image optimization (no custom images yet)
- Bundle size optimization (covered in EPIC-004)
- Navigation optimization (already using react-native-screens)
- List virtualization (not needed for current list sizes)

---

## User Stories

### [US-001: Smooth & Responsive Interactions](../stories/US-001-smooth-responsive-interactions.md)

**As a** mobile app user,
**I want** smooth scrolling through lists and instant button responses,
**So that** the app feels fast and professional.

**Value**: Directly addresses the #1 user complaint about app performance

**Tasks**: 10 tasks (TASK-001 through TASK-010)

---

## Technical Approach

### React.memo Strategy

Wrap list components in React.memo to prevent re-renders when props haven't changed:

```typescript
// Before: Re-renders on every parent update
export const ButtonWithChevron = ({ label, onPress }) => { ... }

// After: Only re-renders when props change
export const ButtonWithChevron = React.memo(({ label, onPress }) => { ... })
```

**Impact**: 70-80% reduction in list component re-renders

### useMemo Strategy

Memoize expensive array computations in screens:

```typescript
// Before: Recalculates on every render
const settingsItems = [
  /* expensive array creation */
];

// After: Only recalculates when dependencies change
const settingsItems = useMemo(
  () => [
    /* array */
  ],
  [dependencies]
);
```

**Impact**: Eliminates redundant computations, 15% faster screen renders

### useCallback Strategy

Memoize event handlers to prevent child component re-renders:

```typescript
// Before: New function on every render
const handlePress = () => navigation.navigate('Screen');

// After: Same function reference across renders
const handlePress = useCallback(() => navigation.navigate('Screen'), [navigation]);
```

**Impact**: Prevents unnecessary child re-renders, completes memoization strategy

### createSelector Strategy

Memoize Redux selectors to prevent recomputation:

```typescript
// Before: Recomputes on every access
export const selectTheme = state => state.settings.theme;

// After: Memoised, only recomputes when slice changes
export const selectTheme = createSelector(selectSettings, settings => settings.theme);
```

**Impact**: Reduces Redux overhead, faster state access

---

## Dependencies

### Prerequisites

- [TASK-023](../tasks/TASK-023-remove-unused-dependencies.md): Remove unused deps (clean start)
- [TASK-024](../tasks/TASK-024-add-missing-types.md): Add @types/node (complete dependencies)
- [TASK-011](../tasks/TASK-011-create-error-boundary.md): Error Boundary in place (safety net)

### Blocks

This epic must be completed before:

- [EPIC-002: Quality & Reliability](./EPIC-002-quality-reliability.md) testing tasks
- Significant new feature development (establishes patterns first)

---

## Risks & Mitigation

### Risk 1: Over-optimization

**Risk**: Memoizing everything creates complexity without benefit
**Likelihood**: Medium
**Mitigation**: Only memo components in lists or with expensive renders; profile before/after

### Risk 2: Stale Closures

**Risk**: Incorrect dependency arrays cause bugs
**Likelihood**: Medium
**Mitigation**: Enable `exhaustive-deps` ESLint rule; comprehensive testing

### Risk 3: Memory Overhead

**Risk**: Memoization caches increase memory usage
**Likelihood**: Low
**Mitigation**: Profile memory; overhead is minimal (<1MB expected)

---

## Timeline

**Estimated Duration**: 1-2 days (6 hours total)

### Day 1 (4 hours)

- Component memoization (TASK-001, 002, 003): 1.5h
- Computed value optimization (TASK-004, 005, 006): 1.75h
- Event handler optimization start (TASK-007): 0.75h

### Day 2 (2 hours)

- Complete event handlers (TASK-008, 009): 0.75h
- Redux selectors (TASK-010): 1h
- Testing and verification: 0.25h

---

## Tasks

| ID                                                             | Task                            | Effort | Priority |
| -------------------------------------------------------------- | ------------------------------- | ------ | -------- |
| [TASK-001](../tasks/TASK-001-memo-button-with-chevron.md)      | React.memo ButtonWithChevron    | 0.5h   | High     |
| [TASK-002](../tasks/TASK-002-memo-selectable-list-button.md)   | React.memo SelectableListButton | 0.5h   | High     |
| [TASK-003](../tasks/TASK-003-memo-button-group-divider.md)     | React.memo ButtonGroupDivider   | 0.5h   | High     |
| [TASK-004](../tasks/TASK-004-usememo-settings-screen.md)       | useMemo SettingsScreen          | 0.75h  | High     |
| [TASK-005](../tasks/TASK-005-usememo-language-screen.md)       | useMemo LanguageScreen          | 0.5h   | High     |
| [TASK-006](../tasks/TASK-006-usememo-appearance-screen.md)     | useMemo AppearanceScreen        | 0.5h   | High     |
| [TASK-007](../tasks/TASK-007-usecallback-settings-screen.md)   | useCallback SettingsScreen      | 0.5h   | High     |
| [TASK-008](../tasks/TASK-008-usecallback-language-screen.md)   | useCallback LanguageScreen      | 0.5h   | High     |
| [TASK-009](../tasks/TASK-009-usecallback-appearance-screen.md) | useCallback AppearanceScreen    | 0.5h   | High     |
| [TASK-010](../tasks/TASK-010-optimize-redux-selectors.md)      | Optimize Redux Selectors        | 1h     | Medium   |

**Total**: 10 tasks, 6 hours

---

## Success Criteria

This epic is successful when:

1. ✅ **Performance Target Met**: Re-renders reduced by 70%+ (30→9 or fewer per scroll)
2. ✅ **Frame Rate Improved**: Consistent 58-60 FPS during interactions
3. ✅ **All Tasks Complete**: 10 tasks done, tested, and merged
4. ✅ **No Regressions**: Existing functionality unchanged
5. ✅ **Pattern Established**: Documentation updated with memoization guidelines

**Validation**: React DevTools Profiler measurements + user testing

---

## Related Epics

- [EPIC-002: Quality & Reliability](./EPIC-002-quality-reliability.md) - Testing depends on these changes
- [EPIC-004: Code Quality](./EPIC-004-code-quality-tech-debt.md) - Utilities may be extracted from this work

---

## References

- [React Documentation - Memo](https://react.dev/reference/react/memo)
- [React Documentation - useMemo](https://react.dev/reference/react/useMemo)
- [React Documentation - useCallback](https://react.dev/reference/react/useCallback)
- [Reselect Documentation](https://github.com/reduxjs/reselect)
- [Project Architecture](../../ARCHITECTURE.md)

---

**Last Updated**: 2025-01-11
