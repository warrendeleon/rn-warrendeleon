# TASK-023: Remove Unused Dependencies

**ID**: TASK-023
**Title**: Remove Unused Dependencies
**Epic**: [EPIC-004: Code Quality & Technical Debt](../epics/EPIC-004-code-quality-tech-debt.md)
**User Story**: N/A (Technical task)
**Created**: 2025-01-11
**Completed**: _Not yet completed_
**Status**: Not Started
**Priority**: High
**Effort Estimate**: 0.25 hours (15 minutes)
**Tags**: `dependencies`, `bundle-size`, `cleanup`, `tech-debt`

---

## Context

The project currently has 586MB bundle size which likely includes unused npm packages. Removing unused dependencies will:

- Reduce bundle size by 5-10% (~30-50MB)
- Speed up install times (`yarn install`)
- Reduce build times (fewer packages to process)
- Simplify dependency tree
- Reduce security surface area

**Blocks**: This task must complete before other work begins, ensuring a clean foundation.

---

## Technical Details

### Files Affected

- `package.json` - Remove unused package entries
- `yarn.lock` - Auto-updated when packages removed

### Implementation Approach

1. **Analyze dependencies**:

```bash
npx depcheck
```

2. **Manual verification**: For each flagged package, search codebase:

```bash
grep -r "from 'package-name'" src/
grep -r 'require("package-name")' src/
```

3. **Remove if unused**:

```bash
yarn remove package-name
```

4. **Test thoroughly**:

```bash
yarn validate  # typecheck + lint + test
yarn ios       # Verify iOS build
yarn android   # Verify Android build
```

---

## Acceptance Criteria

- [ ] `depcheck` analysis complete
- [ ] All genuinely unused packages identified
- [ ] Packages removed from package.json
- [ ] yarn.lock updated automatically
- [ ] `yarn validate` passes
- [ ] iOS build succeeds
- [ ] Android build succeeds
- [ ] App functions identically (no regressions)
- [ ] Bundle size measured and documented

---

## Test Scenarios

**Scenario 1: Identify Unused Packages**

```gherkin
Given I run npx depcheck
When the analysis completes
Then I should see a list of potentially unused dependencies
And I verify each package with grep to confirm it's unused
```

**Scenario 2: Remove Package Safely**

```gherkin
Given I've confirmed a package is unused
When I run yarn remove package-name
Then package.json should be updated
And yarn.lock should be updated
And yarn install should complete successfully
```

**Scenario 3: Verify No Regressions**

```gherkin
Given I've removed unused dependencies
When I run yarn validate
Then all typechecks should pass
And all lints should pass
And all tests should pass
And both iOS and Android builds should succeed
```

---

## Impact Metrics

| Metric           | Before   | After | Target          |
| ---------------- | -------- | ----- | --------------- |
| Bundle size      | 586MB    | TBD   | ~550MB (-5-10%) |
| Install time     | Baseline | TBD   | Faster          |
| Dependency count | Unknown  | TBD   | Reduced         |

---

## Success Criteria

✅ All unused dependencies removed safely
✅ No build errors, no test failures
✅ Bundle size reduced
✅ Documentation updated if significant changes

---

**Last Updated**: 2025-01-11
