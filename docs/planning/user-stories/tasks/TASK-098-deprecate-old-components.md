# TASK-098: Deprecate Old Components

**Task ID**: TASK-098
**Title**: Add @deprecated Tags to Old Components
**Epic**: [EPIC-011: Component Naming Clarity](../epics/EPIC-011-component-naming-clarity.md)
**User Story**: [US-020: Refactor Button Group Component Names](../stories/US-020-refactor-button-group-component-names-purpose-based-clarity.md)
**Status**: To Do
**Priority**: Medium
**Created**: 2025-01-16
**Assigned To**: Warren de Leon
**Reviewer**: Warren de Leon
**Category**: Refactor

---

## Context

After all screens are migrated, add `@deprecated` JSDoc tags to old components to signal they should not be used.

**Current State**: Old components have no deprecation warnings

**Desired State**: Old components have `@deprecated` tags with migration instructions

---

## Technical Details

### Files to Modify

1. **`src/components/ChevronButtonGroup/ChevronButtonGroup.tsx`**
2. **`src/components/MenuButtonGroupSVG/MenuButtonGroupSVG.tsx`**
3. **`src/components/SelectableButtonGroup/SelectableButtonGroup.tsx`**
4. **`src/components/ButtonWithChevron/ButtonWithChevron.tsx`**
5. **`src/components/SelectableListButton/SelectableListButton.tsx`**

### Implementation

Add JSDoc comment at top of each component:

```typescript
/**
 * @deprecated Use SettingsGroup instead. This component will be removed in next version.
 * ChevronButtonGroup has been renamed to SettingsGroup for clarity.
 */
export const ChevronButtonGroup = ...
```

---

## Acceptance Criteria

- [ ] All 5 old components have `@deprecated` JSDoc tags
- [ ] Deprecation messages include new component name
- [ ] TypeScript shows deprecation warnings when importing old components
- [ ] `yarn validate` still passes (deprecation is warning, not error)

---

## Story Points & Effort

**Effort Estimate**: 0.5 hours

---

## Dependencies

**Blockers**: All migration tasks (TASK-093 through TASK-097)

**Enables**: [TASK-099](./TASK-099-remove-old-components.md)

---

**Last Updated**: 2025-01-16
