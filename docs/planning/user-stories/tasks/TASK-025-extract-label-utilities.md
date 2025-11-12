# TASK-025: Extract Accessibility Label Utilities

**ID**: TASK-025
**Title**: Extract Accessibility Label Utility Functions
**Epic**: [EPIC-004: Code Quality & Technical Debt](../epics/EPIC-004-code-quality-tech-debt.md)
**User Story**: N/A (Technical task)
**Created**: 2025-01-11
**Completed**: 2025-01-12
**Status**: Completed
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

- [x] Evaluate if utility extraction provides value (3+ usages, clearer code)
- [x] If no: Document decision not to extract
- [x] All tests pass (no changes made)

---

## Alternative: No Extraction

If pattern isn't common enough or doesn't provide clear value, **don't extract**. Keep accessibility props inline - they're already clear and explicit.

---

## Dependencies

**Blockers**: [TASK-017](./TASK-017-test-screen-readers.md)

---

## Success Criteria

✅ Evaluated extraction value (extract only if beneficial)
✅ Decision documented: No extraction (see below)

---

## Implementation Decision: No Extraction

**Date**: 2025-01-12

**Decision**: Do NOT extract accessibility label utilities

### Analysis Summary

Analyzed all accessibility prop patterns across components:

**Pattern 1: Label concatenation**
- `ButtonWithChevron`: `label + (endLabel ? ', ${endLabel}' : '')`
- `SelectableListButton`: `label + (isSelected ? ', selected' : '')`
- Usage: 2 times with **different semantics** (navigation hint vs state)

**Pattern 2: accessibilityRole="button"**
- Usage: 2 times (only in button components, component-specific)

**Pattern 3: accessibilityRole="header"**
- Usage: 3 times (section headers in screens, already one-liners)

**Pattern 4: Screen-level accessibilityLabel**
- Usage: 4 times (simple prop pass-through: `accessibilityLabel={t('key')}`)

**Pattern 5: accessibilityState**
- Usage: 1 time (SelectableListButton only)

**Pattern 6: accessibilityHint**
- Usage: 1 time (optional prop, rarely used)

### Decision Criteria Evaluation

❌ **Pattern repeats 3+ times**: Only trivial patterns (screen labels, role="header") meet this threshold

❌ **Reduces duplication significantly**: Patterns are simple one-liners or have different semantics

❌ **Clearer than inline props**: Inline props are explicit and easy to understand; utility would add indirection

❌ **Will be maintained**: Patterns are stable and component-specific; low maintenance burden either way

### Rationale

1. **Different semantics**: Label concatenation serves different purposes (endLabel for navigation vs isSelected for state). Abstracting these into one utility would force awkward parameters.

2. **Trivial props**: Screen labels (`accessibilityLabel={t('key')}`) and headers (`accessibilityRole="header"`) are already one-liners. A utility provides no benefit.

3. **Component-specific**: Each component has unique accessibility needs. `ButtonWithChevron` needs optional hint, `SelectableListButton` needs state, screens need simple labels.

4. **Clarity loss**: Current inline props are explicit:
   ```tsx
   // Clear and explicit ✅
   <Pressable
     accessibilityLabel={label + (endLabel ? `, ${endLabel}` : '')}
     accessibilityRole="button"
     accessibilityHint={accessibilityHint}
   />

   // vs utility (more obscure) ❌
   <Pressable {...createAccessibilityProps(label, {endLabel, hint: accessibilityHint})} />
   ```

5. **Over-abstraction**: Creating a utility for 2-4 simple usages violates the "prefer explicit over clever" principle from CLAUDE.md.

### Recommendation

**Keep accessibility props inline.** They are:
- Already clear and explicit
- Component-specific by nature
- Easy to test and maintain
- More readable than abstracted utilities

If a truly common pattern emerges in the future (10+ identical usages), revisit this decision.

---

**Last Updated**: 2025-01-12
