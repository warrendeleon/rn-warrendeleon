# EPIC-004: Code Quality & Technical Debt

**Epic ID**: EPIC-004
**Title**: Code Quality & Technical Debt - Foundation Cleanup
**Status**: Not Started
**Priority**: Medium
**Created**: 2025-01-11
**Owner**: Warren de Leon
**Category**: Tech Debt

---

## Executive Summary

Clean up technical debt by removing unused dependencies, adding missing types, and extracting reusable utilities, creating a solid foundation for rapid feature development without accumulated cruft.

**Business Impact**: Faster builds, smaller bundle size, reduced maintenance burden, easier onboarding

---

## Business Value

### Problem

Technical debt accumulates and creates friction:

- **Unused Dependencies**: 586MB bundle includes unused packages, slower builds
- **Missing Types**: `@types/node` missing causes type errors in build scripts
- **Code Duplication**: Accessibility label patterns repeated across components
- **Architectural Debt**: ButtonGroup abstraction not yet extracted (future work)

This leads to:

- Slower build times (unnecessary dependency compilation)
- Larger app bundle size (unused code shipped to users)
- Confusion for new developers (which deps are actually used?)
- Maintenance burden (updating unused packages)
- Brittle code (duplicated logic harder to maintain)

### Opportunity

By cleaning up technical debt:

- **Build Performance**: 10-15% faster builds with fewer dependencies
- **Bundle Size**: 5-10% smaller bundle (-30-50MB estimated)
- **Developer Experience**: Cleaner codebase, easier to understand
- **Maintenance**: Less surface area for security vulnerabilities
- **Foundation**: Clean base for future features

### Success Metrics

| Metric                    | Current  | Target  | Business Impact     |
| ------------------------- | -------- | ------- | ------------------- |
| Bundle size               | 586MB    | ~550MB  | -5-10% bundle size  |
| Build time                | Baseline | -10-15% | Faster CI/CD        |
| Dependency count          | Unknown  | Reduced | Less maintenance    |
| Type errors in build      | Present  | 0       | Clean type checking |
| Code duplication (labels) | High     | Low     | Easier maintenance  |

---

## Scope

### In Scope

**Dependency Cleanup** (Prerequisites):

- Remove unused npm packages
- Add missing `@types/node` for build scripts

**Code Quality**:

- Extract accessibility label utility pattern (if beneficial)
- Standardise component imports to @app alias

### Out of Scope

- ButtonGroup abstraction (larger refactoring, separate initiative)
- Bundle optimisation tooling (Metro config, code splitting - future)
- Dependency upgrades (separate security/maintenance task)
- General refactoring beyond targeted improvements

---

## Timeline & Dates

**Start Date**: 2025-01-11
**Target Date**: 2025-01-12
**Completed Date**: _Not yet completed_

**Estimated Duration**: 1 day (4.25 hours total)

---

## Budget & Resources

**Budget**: £0
**Actual Cost**: _To be tracked_
**Total Effort**: 4.25 hours
**Actual Effort**: _To be tracked_

---

## Stakeholders

**Owner**: Warren de Leon
**Stakeholders**: Development team, DevOps

---

## ROI & Risk

**ROI Score**: Medium
**Risk Level**: Low

### Key Risks

**Risk 1**: Accidentally Removing Used Dependencies

- **Likelihood**: Low
- **Impact**: High
- **Mitigation**: Test thoroughly after removal; check runtime and build-time usage; use `depcheck` as guide not authority

**Risk 2**: Breaking Changes from Adding Types

- **Likelihood**: Low
- **Impact**: Medium
- **Mitigation**: Test TypeScript compilation; verify no type conflicts; can scope types to specific files if needed

**Risk 3**: Over-abstraction

- **Likelihood**: Medium
- **Impact**: Low
- **Mitigation**: Only extract utilities when pattern appears 3+ times; prefer explicit over clever; validate value before abstracting

---

## User Stories

**No User Stories** - This epic is purely technical and does not directly solve user-facing problems. Benefits are internal (developer experience, build performance, maintainability).

---

## Tasks

| ID                                                             | Task                            | Status    | Effort | Priority |
| -------------------------------------------------------------- | ------------------------------- | --------- | ------ | -------- |
| [TASK-023](../tasks/TASK-023-remove-unused-dependencies.md)    | Remove Unused Dependencies      | To Do     | 0.25h  | High     |
| [TASK-024](../tasks/TASK-024-add-missing-types.md)             | Add Missing @types/node         | To Do     | 0.25h  | High     |
| [TASK-025](../tasks/TASK-025-extract-label-utilities.md)       | Extract Accessibility Utilities | To Do     | 1h     | Medium   |
| [TASK-026](../tasks/TASK-026-button-group-abstraction.md)      | ButtonGroup Abstraction         | To Do     | 2.5h   | Low      |
| [TASK-027](../tasks/TASK-027-standardise-component-imports.md) | Standardise Component Imports   | Completed | 0.25h  | Low      |

**Total Tasks**: 5
**Total Effort**: 4.25 hours

---

## Definition of Done

This epic is complete when:

1. ✅ Clean Dependencies: All unused packages removed, all required packages present
2. ✅ Type Safety: Zero type errors, `@types/node` installed
3. ✅ Reduced Bundle: Bundle size reduced by 5-10% (~30-50MB)
4. ✅ No Regressions: All functionality works, all tests pass
5. ✅ Documentation: README updated if any significant changes

---

## Status History

_Auto-tracked when status changes_

| Date       | Status      | Notes        |
| ---------- | ----------- | ------------ |
| 2025-01-11 | Not Started | Epic created |

---

## Related Epics

- [EPIC-001](./EPIC-001-performance-optimization.md) - Depends on clean dependencies
- [EPIC-002](./EPIC-002-quality-reliability.md) - Depends on clean foundation
- [EPIC-003](./EPIC-003-accessibility-compliance.md) - May benefit from extracted utilities

---

## References

- [depcheck](https://github.com/depcheck/depcheck) - Dependency analysis tool
- [Metro Bundler](https://facebook.github.io/metro/) - React Native bundler
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Last Updated**: 2025-01-12
