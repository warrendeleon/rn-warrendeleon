# TASK-025: Extract Accessibility Label Utilities

**ID**: TASK-025
**Title**: Extract Accessibility Label Utility Functions
**Epic**: [EPIC-004: Code Quality & Technical Debt](../epics/EPIC-004-code-quality-tech-debt.md)
**User Story**: N/A (Technical task)
**Created**: 2025-01-11
**Completed**: _Not yet completed_
**Status**: Not Started
**Priority**: Medium
**Effort Estimate**: 1 hour
**Tags**: `refactoring`, `utilities`, `accessibility`, `dry`

---

## Context

After implementing accessibility labels across components (TASK-014, 015, 016), evaluate if there's a pattern worth extracting into utility functions. Only extract if pattern appears 3+ times.

**Principle**: Prefer explicit over clever. Only abstract if it provides clear value.

---

## Technical Details

### Potential Utility Functions

**Option 1: createAccessibilityProps**

```typescript
// src/utils/accessibility.ts
export const createAccessibilityProps = (
  label: string,
  options?: {
    endLabel?: string;
    hint?: string;
    role?: 'button' | 'header' | 'text';
    state?: {selected?: boolean};
  }
) => ({
  accessibilityLabel: label + (options?.endLabel ? `, ${options.endLabel}` : ''),
  accessibilityRole: options?.role || 'button',
  ...(options?.hint && {accessibilityHint: options.hint}),
  ...(options?.state && {accessibilityState: options.state}),
});

// Usage
<Button {...createAccessibilityProps('Language', {endLabel: 'English', hint: 'Opens language selection'})} />
```

**Decision Criteria**:

- Is this pattern used 3+ times?
- Does it reduce duplication significantly?
- Is it clearer than inline props?
- Will it be maintained?

---

## Acceptance Criteria

- [ ] Evaluate if utility extraction provides value (3+ usages, clearer code)
- [ ] If yes: Create utility function with tests (100% coverage)
- [ ] If yes: Refactor existing code to use utility
- [ ] If no: Document decision not to extract
- [ ] All tests pass

---

## Alternative: No Extraction

If pattern isn't common enough or doesn't provide clear value, **don't extract**. Keep accessibility props inline - they're already clear and explicit.

---

## Dependencies

**Blockers**: [TASK-017](./TASK-017-test-screen-readers.md)

---

## Success Criteria

✅ Evaluated extraction value (extract only if beneficial)
✅ If extracted: Utility created with tests
✅ If not extracted: Decision documented

---

**Last Updated**: 2025-01-11
