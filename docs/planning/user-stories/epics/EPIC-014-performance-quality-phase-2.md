# EPIC-014: Performance & Quality Phase 2

**Epic ID**: EPIC-014
**Epic Title**: Performance & Quality Phase 2
**Status**: 📋 Not Started
**Priority**: 🟠 High
**Progress**: 0/10 tasks completed (0%)
**Created**: 2025-01-17
**Last Updated**: 2025-01-17
**Target Date**: 2025-01-31 (2 weeks after EPIC-013)

---

## Executive Summary

Optimise application performance and code quality through React memoisation, responsive layout hooks, intelligent data loading, code standardisation, and technical debt cleanup. This epic focuses on improving user experience through faster renders, reduced API calls, and consistent architecture patterns.

---

## Business Context

### Problem Statement

Current performance and quality issues:

- **Slow renders**: Missing React.memo on pure components causes unnecessary re-renders
- **Layout bugs**: `Dimensions.get()` at module level doesn't update on device rotation
- **Poor UX**: Splash screen forces 4.5s wait even if data loads in 1 second
- **Wasted bandwidth**: Same data refetched multiple times (no caching)
- **Inconsistent patterns**: Mixing GlueStack UI with raw StyleSheet.create
- **Dead code**: MSW comments reference removed library

### Business Value

1. **Better Performance**: 15-20% faster renders, 50% faster data loading with caching
2. **Improved UX**: Dynamic splash timing, responsive layouts on rotation
3. **Reduced Costs**: Less API bandwidth usage with intelligent caching
4. **Code Quality**: Consistent patterns, easier maintenance
5. **Developer Experience**: Clear architecture, less technical debt

### Success Metrics

- App renders 15-20% faster (measured with React DevTools Profiler)
- Splash screen shows minimum time, not fixed 4.5s
- API calls reduced by 50% with RTK Query caching
- 100% GlueStack UI usage (no StyleSheet.create in feature code)
- Zero references to removed libraries (MSW)

---

## Scope

### In Scope

1. **Performance Optimization** (US-024)
   - Add React.memo to DetailListGroup, SettingsItem, ButtonGroupDivider
   - Replace Dimensions.get() with useWindowDimensions hook
   - Optimise splash screen with parallel data loading + dynamic timing
   - **Optional**: Implement RTK Query for automatic API caching

2. **Code Quality & Tech Debt** (US-027)
   - Standardise error handling patterns across features
   - Replace magic numbers with named constants
   - Implement TODO handlers or remove dead code in HomeScreen
   - Remove MSW from devDependencies
   - Update MockStatusScreen comments (Metro, not MSW)
   - Standardise on GlueStack UI (eliminate StyleSheet.create mixing)

### Out of Scope

- Security fixes (EPIC-013)
- Test coverage expansion (EPIC-015)
- EAA compliance (EPIC-015)
- New feature development

---

## User Stories

| ID                                                              | Title                            | Priority  | Tasks | Status         |
| --------------------------------------------------------------- | -------------------------------- | --------- | ----- | -------------- |
| [US-024](../stories/US-024-performance-optimization-phase-2.md) | Performance Optimization Phase 2 | 🟠 High   | 4     | 📋 Not Started |
| [US-027](../stories/US-027-code-quality-tech-debt.md)           | Code Quality & Tech Debt         | 🟡 Medium | 6     | 📋 Not Started |

---

## Tasks Breakdown

### US-024: Performance Optimization Phase 2 (4 tasks, 13 hours)

| Task ID                                                    | Title                                             | Effort | Priority  | Status         |
| ---------------------------------------------------------- | ------------------------------------------------- | ------ | --------- | -------------- |
| [TASK-138](../tasks/TASK-138-add-react-memo-components.md) | Add React.memo to Pure Components                 | 2h     | 🟠 High   | 📋 Not Started |
| [TASK-137](../tasks/TASK-137-fix-dimensions-hook.md)       | Replace Dimensions.get() with useWindowDimensions | 1h     | 🟠 High   | 📋 Not Started |
| [TASK-138](../tasks/TASK-138-optimize-splash-loading.md)   | Optimise Splash Screen Data Loading               | 2h     | 🟠 High   | 📋 Not Started |
| [TASK-137](../tasks/TASK-137-implement-rtk-query.md)       | Implement RTK Query for API Caching               | 8h     | 🟡 Medium | 📋 Not Started |

### US-027: Code Quality & Tech Debt (6 tasks, 10.75 hours)

| Task ID                                                     | Title                                | Effort | Priority  | Status         |
| ----------------------------------------------------------- | ------------------------------------ | ------ | --------- | -------------- |
| [TASK-137](../tasks/TASK-137-standardize-error-handling.md) | Standardise Error Handling Patterns  | 3h     | 🟡 Medium | 📋 Not Started |
| [TASK-138](../tasks/TASK-138-replace-magic-numbers.md)      | Replace Magic Numbers with Constants | 2h     | 🟡 Medium | 📋 Not Started |
| [TASK-137](../tasks/TASK-137-implement-todo-handlers.md)    | Implement or Remove TODO Handlers    | 2h     | 🟡 Medium | 📋 Not Started |
| [TASK-138](../tasks/TASK-138-remove-msw-devdependency.md)   | Remove MSW from devDependencies      | 0.5h   | 🟡 Medium | 📋 Not Started |
| [TASK-137](../tasks/TASK-137-update-mockstatus-comments.md) | Update MockStatusScreen Comments     | 0.25h  | 🟡 Medium | 📋 Not Started |
| [TASK-138](../tasks/TASK-138-standardize-gluestack-ui.md)   | Standardise on GlueStack UI Patterns | 3h     | 🟡 Medium | 📋 Not Started |

---

## Dependencies

### Upstream Dependencies

- **EPIC-013** should be completed first (ensures secure foundation)

### Downstream Dependencies

- None (can run in parallel with EPIC-015)

---

## Risks & Mitigation

| Risk                                  | Impact | Likelihood | Mitigation                                                    |
| ------------------------------------- | ------ | ---------- | ------------------------------------------------------------- |
| React.memo breaks component behaviour | Medium | Low        | Test thoroughly, only memoize truly pure components           |
| RTK Query migration complex           | High   | Medium     | Mark as optional, can defer to later sprint                   |
| Performance gains not measurable      | Low    | Medium     | Use React DevTools Profiler for baseline + after measurements |

---

## Acceptance Criteria

- [ ] DetailListGroup, SettingsItem, ButtonGroupDivider wrapped with React.memo
- [ ] ProfileScreen uses useWindowDimensions instead of Dimensions.get()
- [ ] Splash screen loads data in parallel with Promise.all
- [ ] Splash shows minimum 1.5s, then completes when data ready (not fixed 4.5s)
- [ ] Error handling standardised across Profile/Education/WorkExperience
- [ ] All magic numbers replaced with named constants
- [ ] HomeScreen TODO handlers implemented or removed
- [ ] MSW removed from package.json devDependencies
- [ ] MockStatusScreen comments updated (no MSW references)
- [ ] ProfileDataScreen/WebViewScreen use GlueStack UI (no StyleSheet.create)
- [ ] App renders 15-20% faster (measured with Profiler)
- [ ] `yarn validate` passes (0 errors, 0 failures)

---

## Performance Measurement

**Baseline** (before EPIC-014):

```bash
# Use React DevTools Profiler to measure:
- ProfileScreen initial render: ~X ms
- SettingsScreen re-render on theme change: ~X ms
- Splash screen total time: 4.5s fixed

# API calls:
- Profile data: fetched N times per session
- Education data: fetched N times per session
```

**Target** (after EPIC-014):

```bash
# Expected improvements:
- ProfileScreen initial render: 15-20% faster
- SettingsScreen re-render: 20-30% faster (React.memo)
- Splash screen: 1.5-2.5s (dynamic based on data)

# API calls (with RTK Query):
- Profile data: fetched once, cached for 60s
- 50% reduction in duplicate API calls
```

---

## Notes

**Why High Priority**: Performance directly impacts user experience. Faster app = happier users = better reviews.

**Parallel Work**: Can run alongside EPIC-015 (different focus areas).

**RTK Query**: Marked as optional (8h effort). Can defer if timeline tight - other optimizations provide immediate value.

---

**Related Epics**: EPIC-013 (Production Readiness), EPIC-015 (Testing Expansion)
