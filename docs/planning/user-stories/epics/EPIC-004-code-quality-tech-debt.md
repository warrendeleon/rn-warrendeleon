# EPIC-004: Code Quality & Technical Debt

**ID**: EPIC-004
**Title**: Code Quality & Technical Debt - Foundation Cleanup
**Created**: 2025-01-11
**Status**: Not Started
**Priority**: Medium
**Total Effort**: 4.25 hours
**Total Tasks**: 5

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

**Utility Extraction** (Code Quality):

- Extract accessibility label utility pattern (if beneficial)

### Out of Scope

- ButtonGroup abstraction (larger refactoring, separate initiative)
- Bundle optimization tooling (Metro config, code splitting - future)
- Dependency upgrades (separate security/maintenance task)
- General refactoring beyond targeted improvements

---

## User Stories

**No User Stories** - This epic is purely technical and does not directly solve user-facing problems. The benefits are internal (developer experience, build performance, maintainability).

---

## Technical Approach

### Dependency Analysis

Identify and remove unused packages:

```bash
# Analyze dependencies
npx depcheck

# Check actual imports
grep -r "from '
package-name'" src/

# Remove if unused
yarn remove package-name
```

**Impact**: Cleaner dependency tree, faster installs, smaller bundle

### Type Completeness

Add missing TypeScript types for Node.js APIs used in build scripts:

```bash
yarn add -D @types/node
```

**Impact**: Clean type checking, no build warnings, better IDE support

### Utility Extraction Pattern

Extract reusable accessibility label utilities if pattern emerges:

```typescript
// Before: Repeated in every component
accessibilityLabel={t('settings.title')}
accessibilityHint={t('settings.hint')}
accessibilityRole="button"

// After: Utility function (if beneficial)
const a11yProps = createAccessibilityProps('settings', 'button');
```

**Impact**: DRY code, consistent accessibility implementation

---

## Dependencies

### Prerequisites

**None** - This epic can start immediately and should be completed before other epics to establish clean foundation.

### Blocks

This epic's prerequisites (TASK-023, TASK-024) block:

- [EPIC-001: Performance](./EPIC-001-performance-optimization.md) (clean dependencies first)
- [EPIC-002: Quality](./EPIC-002-quality-reliability.md) (clean foundation for tests)

---

## Risks & Mitigation

### Risk 1: Accidentally Removing Used Dependencies

**Risk**: Package appears unused but is actually required
**Likelihood**: Low
**Mitigation**: Test thoroughly after removal; check runtime and build-time usage; use `depcheck` as guide not authority

### Risk 2: Breaking Changes from Adding Types

**Risk**: `@types/node` conflicts with React Native types
**Likelihood**: Low
**Mitigation**: Test TypeScript compilation; verify no type conflicts; can scope types to specific files if needed

### Risk 3: Over-abstraction

**Risk**: Creating utilities that are used only once or twice
**Likelihood**: Medium
**Mitigation**: Only extract utilities when pattern appears 3+ times; prefer explicit over clever; validate value before abstracting

---

## Timeline

**Estimated Duration**: 1 day (4.25 hours total)

### Day 1 (4.25 hours)

- Remove unused dependencies (TASK-023): 0.25h
- Add @types/node (TASK-024): 0.25h
- Standardise component imports (TASK-027): 0.25h
- Extract label utilities (TASK-025): 1h
- ButtonGroup abstraction analysis (TASK-026): 2.5h

**Note**: This epic can run in parallel with other work after TASK-023 and TASK-024 are complete

---

## Tasks

| ID                                                             | Task                            | Effort | Priority |
| -------------------------------------------------------------- | ------------------------------- | ------ | -------- |
| [TASK-023](../tasks/TASK-023-remove-unused-dependencies.md)    | Remove Unused Dependencies      | 0.25h  | High     |
| [TASK-024](../tasks/TASK-024-add-missing-types.md)             | Add Missing @types/node         | 0.25h  | High     |
| [TASK-025](../tasks/TASK-025-extract-label-utilities.md)       | Extract Accessibility Utilities | 1h     | Medium   |
| [TASK-026](../tasks/TASK-026-button-group-abstraction.md)      | ButtonGroup Abstraction         | 2.5h   | Low      |
| [TASK-027](../tasks/TASK-027-standardise-component-imports.md) | Standardise Component Imports   | 0.25h  | Low      |

**Total**: 5 tasks, 4.25 hours

---

## Success Criteria

This epic is successful when:

1. ✅ **Clean Dependencies**: All unused packages removed, all required packages present
2. ✅ **Type Safety**: Zero type errors, `@types/node` installed
3. ✅ **Reduced Bundle**: Bundle size reduced by 5-10% (~30-50MB)
4. ✅ **No Regressions**: All functionality works, all tests pass
5. ✅ **Documentation**: README updated if any significant changes

**Validation**: `yarn validate` passes + bundle size comparison + manual testing

---

## Related Epics

- [EPIC-001: Performance](./EPIC-001-performance-optimization.md) - Depends on clean dependencies
- [EPIC-002: Quality](./EPIC-002-quality-reliability.md) - Depends on clean foundation
- [EPIC-003: Accessibility](./EPIC-003-accessibility-compliance.md) - May benefit from extracted utilities

---

## References

- [depcheck](https://github.com/depcheck/depcheck) - Dependency analysis tool
- [Metro Bundler](https://facebook.github.io/metro/) - React Native bundler
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Last Updated**: 2025-01-11
