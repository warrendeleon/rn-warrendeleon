# EPIC-001: Performance Optimization

**Epic ID**: EPIC-001
**Title**: Performance Optimization - Eliminate Unnecessary Re-renders
**Status**: Not Started
**Priority**: High
**Created**: 2025-01-11
**Owner**: Warren de Leon
**Category**: Performance

---

## Executive Summary

Optimise React Native app performance by implementing memoisation strategies to reduce component re-renders by 70-80%, resulting in smooth 60 FPS scrolling and dramatically improved user experience.

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

By implementing performance optimisations:

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

**Component Memoisation** (React.memo):

- ButtonWithChevron
- SelectableListButton
- ButtonGroupDivider

**Computed Value Optimisation** (useMemo):

- SettingsScreen settingsItems array
- LanguageScreen languageItems array
- AppearanceScreen themeItems array

**Event Handler Optimisation** (useCallback):

- SettingsScreen navigation handlers
- LanguageScreen selection handler
- AppearanceScreen selection handler

**Redux Optimisation**:

- Memoised selectors with createSelector from Reselect

### Out of Scope

- Native module optimisation (separate initiative)
- Image optimisation (no custom images yet)
- Bundle size optimisation (covered in EPIC-004)
- Navigation optimisation (already using react-native-screens)
- List virtualisation (not needed for current list sizes)

---

## Timeline & Dates

**Start Date**: 2025-01-11
**Target Date**: 2025-01-13
**Completed Date**: _Not yet completed_

**Estimated Duration**: 1-2 days (6 hours total)

---

## Budget & Resources

**Budget**: £0
**Actual Cost**: _To be tracked_
**Total Effort**: 6 hours
**Actual Effort**: _To be tracked_

---

## Stakeholders

**Owner**: Warren de Leon
**Stakeholders**: Development team, end users

---

## ROI & Risk

**ROI Score**: High
**Risk Level**: Low

### Key Risks

**Risk 1**: Over-optimisation

- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**: Only memo components in lists or with expensive renders; profile before/after

**Risk 2**: Stale Closures

- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**: Enable `exhaustive-deps` ESLint rule; comprehensive testing

**Risk 3**: Memory Overhead

- **Likelihood**: Low
- **Impact**: Low
- **Mitigation**: Profile memory; overhead is minimal (<1MB expected)

---

## User Stories

| ID                                                            | User Story                       | Status      | Story Points |
| ------------------------------------------------------------- | -------------------------------- | ----------- | ------------ |
| [US-001](../stories/US-001-smooth-responsive-interactions.md) | Smooth & Responsive Interactions | Not Started | 8            |

**Total Stories**: 1

---

## Tasks

| ID                                                             | Task                            | Status | Effort | Priority |
| -------------------------------------------------------------- | ------------------------------- | ------ | ------ | -------- |
| [TASK-001](../tasks/TASK-001-memo-button-with-chevron.md)      | React.memo ButtonWithChevron    | To Do  | 0.5h   | High     |
| [TASK-002](../tasks/TASK-002-memo-selectable-list-button.md)   | React.memo SelectableListButton | To Do  | 0.5h   | High     |
| [TASK-003](../tasks/TASK-003-memo-button-group-divider.md)     | React.memo ButtonGroupDivider   | To Do  | 0.5h   | High     |
| [TASK-004](../tasks/TASK-004-usememo-settings-screen.md)       | useMemo SettingsScreen          | To Do  | 0.75h  | High     |
| [TASK-005](../tasks/TASK-005-usememo-language-screen.md)       | useMemo LanguageScreen          | To Do  | 0.5h   | High     |
| [TASK-006](../tasks/TASK-006-usememo-appearance-screen.md)     | useMemo AppearanceScreen        | To Do  | 0.5h   | High     |
| [TASK-007](../tasks/TASK-007-usecallback-settings-screen.md)   | useCallback SettingsScreen      | To Do  | 0.5h   | High     |
| [TASK-008](../tasks/TASK-008-usecallback-language-screen.md)   | useCallback LanguageScreen      | To Do  | 0.5h   | High     |
| [TASK-009](../tasks/TASK-009-usecallback-appearance-screen.md) | useCallback AppearanceScreen    | To Do  | 0.5h   | High     |
| [TASK-010](../tasks/TASK-010-optimize-redux-selectors.md)      | Optimise Redux Selectors        | To Do  | 1h     | Medium   |

**Total Tasks**: 10
**Total Effort**: 6 hours

---

## Definition of Done

This epic is complete when:

1. ✅ Performance Target Met: Re-renders reduced by 70%+ (30→9 or fewer per scroll)
2. ✅ Frame Rate Improved: Consistent 58-60 FPS during interactions
3. ✅ All Tasks Complete: 10 tasks done, tested, and merged
4. ✅ No Regressions: Existing functionality unchanged
5. ✅ Pattern Established: Documentation updated with memoisation guidelines

---

## Status History

_Auto-tracked when status changes_

| Date       | Status      | Notes        |
| ---------- | ----------- | ------------ |
| 2025-01-11 | Not Started | Epic created |

---

## Related Epics

- [EPIC-002](./EPIC-002-quality-reliability.md) - Testing depends on these changes
- [EPIC-004](./EPIC-004-code-quality-tech-debt.md) - Utilities may be extracted from this work

---

## References

- [React Documentation - Memo](https://react.dev/reference/react/memo)
- [React Documentation - useMemo](https://react.dev/reference/react/useMemo)
- [React Documentation - useCallback](https://react.dev/reference/react/useCallback)
- [Reselect Documentation](https://github.com/reduxjs/reselect)
- [Project Architecture](../../ARCHITECTURE.md)

---

**Last Updated**: 2025-01-12
