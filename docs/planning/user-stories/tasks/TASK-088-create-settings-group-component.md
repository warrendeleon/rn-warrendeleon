# TASK-088: Create SettingsGroup Component

**Task ID**: TASK-088
**Title**: Create SettingsGroup Component (renamed from ChevronButtonGroup)
**Epic**: [EPIC-011: Component Naming Clarity](../epics/EPIC-011-component-naming-clarity.md)
**User Story**: [US-020: Refactor Button Group Component Names](../stories/US-020-refactor-button-group-component-names-purpose-based-clarity.md)
**Status**: To Do
**Priority**: High
**Created**: 2025-01-16
**Assigned To**: Warren de Leon
**Reviewer**: Warren de Leon
**Category**: Refactor

---

## Context

Create new `SettingsGroup` component as a renamed version of `ChevronButtonGroup`. This component is specifically for settings and navigation menus with icons, end labels, and chevrons.

**Current State**: Only `ChevronButtonGroup` exists

**Desired State**: Both `ChevronButtonGroup` (deprecated) and `SettingsGroup` (new) exist side-by-side during migration

---

## Technical Details

### Files to Create

1. **`src/components/SettingsGroup/SettingsGroup.tsx`**
2. **`src/components/SettingsGroup/index.ts`**
3. **`src/components/SettingsGroup/__tests__/SettingsGroup.rntl.tsx`**

### Files to Reference (Copy From)

1. **`src/components/ChevronButtonGroup/ChevronButtonGroup.tsx`**
2. **`src/components/ChevronButtonGroup/index.ts`**
3. **`src/components/ChevronButtonGroup/__tests__/ChevronButtonGroup.rntl.tsx`**

### Implementation

**Steps**:

1. Copy `ChevronButtonGroup/` directory to `SettingsGroup/`
2. Rename all instances of `ChevronButtonGroup` → `SettingsGroup` in files
3. Rename types: `ChevronButtonGroupProps` → `SettingsGroupProps`, `ChevronButtonGroupItem` → `SettingsGroupItem`
4. Update test file imports and test names
5. Update barrel export in `index.ts`

**File Structure**:

```
src/components/SettingsGroup/
├── SettingsGroup.tsx
├── index.ts
└── __tests__/
    └── SettingsGroup.rntl.tsx
```

### Why This Matters

1. **Purpose-based naming**: "SettingsGroup" immediately communicates use case
2. **Co-existence**: Can migrate screens gradually without breaking changes
3. **Test coverage maintained**: Tests copied and renamed ensure no coverage loss

---

## Acceptance Criteria

- [ ] `SettingsGroup.tsx` created with exact same functionality as `ChevronButtonGroup`
- [ ] All props/types renamed (`SettingsGroupProps`, `SettingsGroupItem`)
- [ ] Test file created and all tests pass
- [ ] Barrel export created (`index.ts`)
- [ ] TypeScript compilation passes (`yarn typecheck`)
- [ ] ESLint passes (`yarn lint`)
- [ ] Test coverage maintained (run `yarn test SettingsGroup`)

---

## Test Scenarios

**Scenario 1: SettingsGroup Renders Correctly**

```gherkin
Given I have created SettingsGroup component
When I render it with test items (label, icon, endLabel)
Then it displays exactly like ChevronButtonGroup
And all tests pass
```

**Scenario 2: SettingsGroup TypeScript Types Work**

```gherkin
Given I have created SettingsGroupProps and SettingsGroupItem types
When I use them in TypeScript code
Then TypeScript compilation passes
And autocomplete shows correct props
```

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code written and follows project conventions
- [ ] Tests written and passing
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] No regressions introduced

---

## Story Points & Effort

**Story Points**: 0.5
**Effort Estimate**: 0.25 hours
**Actual Effort**: _To be tracked_

---

## Dependencies

**Blockers**: [TASK-087](./TASK-087-create-migration-plan-document.md) (migration plan)

**Blocks**: [TASK-093](./TASK-093-migrate-settings-screen.md) (SettingsScreen migration)

**Enables**: Migration of SettingsScreen

---

## Git & PR Information

**Branch Name**: Can be part of larger migration branch or separate

**Commit Message**:

```
✨ feat(components): create SettingsGroup component

Add purpose-based SettingsGroup component (renamed from ChevronButtonGroup):
- Exact copy of ChevronButtonGroup with updated naming
- SettingsGroupProps and SettingsGroupItem types
- Full test coverage maintained
- Enables gradual migration from old name

Related: EPIC-011, US-020, TASK-088
```

---

## Implementation Notes

**Key Changes**:

- Copy ChevronButtonGroup → SettingsGroup
- Rename all types and exports
- Ensure tests pass

**Validation Results**:

- TypeScript: Pass
- ESLint: Pass
- Tests: Pass

---

## Related Tasks

- [TASK-093](./TASK-093-migrate-settings-screen.md): Uses this component

---

**Last Updated**: 2025-01-16
