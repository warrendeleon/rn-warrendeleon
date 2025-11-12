# TASK-026: ButtonGroup Abstraction

**ID**: TASK-026
**Title**: Create ButtonGroup Component Abstraction
**Epic**: [EPIC-004: Code Quality & Technical Debt](../epics/EPIC-004-code-quality-tech-debt.md)
**User Story**: N/A (Technical task)
**Created**: 2025-01-11
**Completed**: _Not yet completed_
**Status**: Not Started
**Priority**: Low
**Effort Estimate**: 2.5 hours
**Tags**: `refactoring`, `abstraction`, `architecture`

---

## Context

ChevronButtonGroup and SelectableButtonGroup share similar patterns (groupVariant logic, dividers). Consider extracting shared logic into a reusable ButtonGroup abstraction.

**Caution**: This is a larger refactoring. Only proceed if the abstraction is clearly beneficial and doesn't introduce unnecessary complexity.

---

## Technical Details

### Current State

- ChevronButtonGroup: Renders ButtonWithChevron components in groups
- SelectableButtonGroup: Renders SelectableListButton components in groups
- Both handle groupVariant (top/middle/bottom/single)
- Both render dividers between buttons

### Proposed Abstraction

**Option 1: Generic ButtonGroup Component**

```typescript
interface ButtonGroupProps<T> {
  items: T[];
  renderButton: (item: T, variant: GroupVariant) => ReactNode;
  renderDivider?: () => ReactNode;
}

export function ButtonGroup<T>({items, renderButton, renderDivider}: ButtonGroupProps<T>) {
  return (
    <>
      {items.map((item, index) => {
        const variant = getGroupVariant(index, items.length);
        return (
          <React.Fragment key={index}>
            {renderButton(item, variant)}
            {index < items.length - 1 && renderDivider?.()}
          </React.Fragment>
        );
      })}
    </>
  );
}
```

**Option 2: Shared Utility Function**

```typescript
// src/utils/buttonGroup.ts
export const getGroupVariant = (index: number, total: number): GroupVariant => {
  if (total === 1) return 'single';
  if (index === 0) return 'top';
  if (index === total - 1) return 'bottom';
  return 'middle';
};
```

**Decision Criteria**:

- Does abstraction reduce code duplication significantly?
- Is abstraction clearer than current implementation?
- Will abstraction be reused for future button groups?
- Does abstraction add unnecessary complexity?

---

## Acceptance Criteria

- [ ] Evaluate if abstraction provides value
- [ ] If yes: Design abstraction (generic component or utility)
- [ ] If yes: Implement with comprehensive tests (100% coverage)
- [ ] If yes: Refactor existing components to use abstraction
- [ ] If yes: Update documentation
- [ ] If no: Document decision not to abstract
- [ ] All existing tests pass

---

## Risks

### Risk: Over-abstraction

**Impact**: Code becomes harder to understand
**Mitigation**: Only abstract if pattern is used 3+ times and abstraction is clearly simpler

### Risk: Premature Optimization

**Impact**: Wasted effort on abstraction that's never reused
**Mitigation**: Defer this task until there's clear evidence of need (e.g., 3rd button group type needed)

---

## Alternative: No Abstraction

**Recommendation**: Consider deferring this task until there's a 3rd button group type that would benefit from abstraction. Current duplication might be acceptable (2 instances).

**YAGNI Principle**: You Aren't Gonna Need It - don't build abstractions until you have 3+ concrete use cases.

---

## Dependencies

**Blockers**: None (can run anytime, but low priority)

---

## Success Criteria

✅ Evaluated abstraction value (abstract only if clearly beneficial)
✅ If abstracted: Generic component or utility created with tests
✅ If not abstracted: Decision documented (YAGNI)

---

**Last Updated**: 2025-01-11
