# TASK-027: Standardise Component Imports to @app Alias

**ID**: TASK-027
**Title**: Standardise Component Imports to Use @app Alias
**Epic**: [EPIC-004: Code Quality & Technical Debt](../epics/EPIC-004-code-quality-tech-debt.md)
**User Story**: N/A (Technical task)
**Created**: 2025-01-12
**Completed**: 2025-01-12
**Status**: Completed
**Priority**: Low
**Effort Estimate**: 0.25 hours
**Tags**: `refactoring`, `imports`, `consistency`, `code-quality`

---

## Context

ChevronButtonGroup and SelectableButtonGroup currently use relative imports (`../ButtonGroupDivider/ButtonGroupDivider`) for sibling components. The project convention is to use the `@app` alias for cross-component imports to maintain consistency and improve maintainability.

**Current Inconsistency**:

- Other components (HomeScreen, SettingsScreen, etc.) use `@app/components` for importing shared components
- ChevronButtonGroup and SelectableButtonGroup use relative `../` imports
- All imported components are already exported from `src/components/index.ts` barrel

---

## Technical Details

### Files to Modify

1. **`src/components/ChevronButtonGroup/ChevronButtonGroup.tsx`** (lines 6-7)
2. **`src/components/SelectableButtonGroup/SelectableButtonGroup.tsx`** (lines 6-7)

### Implementation

**ChevronButtonGroup - Before**:

```typescript
import { ButtonGroupDivider } from '../ButtonGroupDivider/ButtonGroupDivider';
import { ButtonWithChevron } from '../ButtonWithChevron/ButtonWithChevron';
```

**ChevronButtonGroup - After**:

```typescript
import { ButtonGroupDivider, ButtonWithChevron } from '@app/components';
```

**SelectableButtonGroup - Before**:

```typescript
import { ButtonGroupDivider } from '../ButtonGroupDivider/ButtonGroupDivider';
import { SelectableListButton } from '../SelectableListButton/SelectableListButton';
```

**SelectableButtonGroup - After**:

```typescript
import { ButtonGroupDivider, SelectableListButton } from '@app/components';
```

### Why This Matters

1. **Consistency**: Matches established project pattern used across features
2. **Maintainability**: Easier to refactor/move components without updating relative paths
3. **Readability**: Clear that imports come from shared component library
4. **DRY**: Leverages existing barrel export in `src/components/index.ts`

---

## Acceptance Criteria

- [x] ChevronButtonGroup imports updated to use @app alias
- [x] SelectableButtonGroup imports updated to use @app alias
- [x] All imports combined into single line where applicable
- [x] TypeScript compilation passes
- [x] ESLint passes
- [x] All tests pass (no behaviour changes)

---

## Test Scenarios

**Scenario 1: No Behaviour Change**

```gherkin
Given ChevronButtonGroup uses @app imports
When the component is rendered with items
Then it should render identically to before
And all tests should pass
```

**Scenario 2: No Behaviour Change**

```gherkin
Given SelectableButtonGroup uses @app imports
When the component is rendered with items
Then it should render identically to before
And all tests should pass
```

---

## Dependencies

**Blockers**: None (independent refactoring)

---

## Success Criteria

✅ All 4 imports updated to use @app alias
✅ TypeScript compiles without errors
✅ All 166 tests pass
✅ ESLint passes with no warnings

---

## Implementation Notes

**Files Changed**:

1. `src/components/ChevronButtonGroup/ChevronButtonGroup.tsx`
   - Combined 3 imports into single @app/components import
   - Before: 3 lines (1 @app/components/shared + 2 relative)
   - After: 1 line with all imports from @app/components

2. `src/components/SelectableButtonGroup/SelectableButtonGroup.tsx`
   - Combined 3 imports into single @app/components import
   - Before: 3 lines (1 @app/components/shared + 2 relative)
   - After: 1 line with all imports from @app/components

**Validation Results**:

- TypeScript: ✅ No errors
- ESLint: ✅ No warnings
- Tests: ✅ 166/166 passing (21 suites)
- No behaviour changes (zero-cost refactoring)

**Impact**: Improved code consistency and maintainability with no runtime changes.

---

**Last Updated**: 2025-01-12
