# Component Renaming Migration Plan

**Epic**: [EPIC-011: Component Naming Clarity](./user-stories/epics/EPIC-011-component-naming-clarity.md)
**User Story**: [US-020: Refactor Button Group Names](./user-stories/stories/US-020-refactor-button-group-component-names-purpose-based-clarity.md)
**Created**: 2025-01-16
**Status**: In Progress

---

## Executive Summary

This document provides a comprehensive step-by-step plan for renaming button and button group components from implementation-focused names to purpose-based names that clearly communicate use case.

**Goal**: Improve developer experience by making component names self-documenting.

**Scope**: 5 components renamed, 5 screens migrated, 13 tasks total

**Timeline**: 6.5 hours estimated (1-2 days)

**Risk Level**: Low (pure rename refactor, no functional changes)

---

## Naming Mapping Table

| Old Name                | New Name          | Component Type | Usage                            | Purpose                                       |
| ----------------------- | ----------------- | -------------- | -------------------------------- | --------------------------------------------- |
| `ChevronButtonGroup`    | `SettingsGroup`   | Group          | SettingsScreen                   | Settings/navigation menus                     |
| `MenuButtonGroupSVG`    | `DetailListGroup` | Group          | EducationScreen, WorkXPScreen    | Rich content lists (logos, subtitles, badges) |
| `SelectableButtonGroup` | `PickerGroup`     | Group          | LanguageScreen, AppearanceScreen | Single-selection pickers                      |
| `ButtonWithChevron`     | `SettingsItem`    | Item           | Used by SettingsGroup            | Individual settings/navigation item           |
| `SelectableListButton`  | `PickerItem`      | Item           | Used by PickerGroup              | Individual picker option                      |

**Type Renames**:

| Old Type                     | New Type               |
| ---------------------------- | ---------------------- |
| `ChevronButtonGroupProps`    | `SettingsGroupProps`   |
| `ChevronButtonGroupItem`     | `SettingsGroupItem`    |
| `MenuButtonGroupSVGProps`    | `DetailListGroupProps` |
| `MenuButtonGroupSVGItem`     | `DetailListGroupItem`  |
| `SelectableButtonGroupProps` | `PickerGroupProps`     |
| `SelectableButtonGroupItem`  | `PickerGroupItem`      |
| `ButtonWithChevronProps`     | `SettingsItemProps`    |
| `SelectableListButtonProps`  | `PickerItemProps`      |

---

## Migration Sequence

### Phase 1: Create New Components (Tasks 088-092) - 1.25h

**Objective**: Create all new components as exact copies of old components with updated names.

**Tasks**:

1. **TASK-088**: Create `SettingsGroup` (0.25h)
   - Copy `ChevronButtonGroup/` → `SettingsGroup/`
   - Rename all instances of `ChevronButtonGroup` → `SettingsGroup`
   - Rename types: `ChevronButtonGroupProps` → `SettingsGroupProps`, etc.
   - Update tests
   - **Validation**: `yarn typecheck && yarn test SettingsGroup`

2. **TASK-089**: Create `DetailListGroup` (0.25h)
   - Copy `MenuButtonGroupSVG/` → `DetailListGroup/`
   - Rename all instances
   - Update tests
   - **Validation**: `yarn typecheck && yarn test DetailListGroup`

3. **TASK-090**: Create `PickerGroup` (0.25h)
   - Copy `SelectableButtonGroup/` → `PickerGroup/`
   - Rename all instances
   - Update tests
   - **Validation**: `yarn typecheck && yarn test PickerGroup`

4. **TASK-091**: Create `SettingsItem` (0.25h)
   - Copy `ButtonWithChevron/` → `SettingsItem/`
   - Rename all instances
   - Update `SettingsGroup` to use `SettingsItem` internally
   - Update tests
   - **Validation**: `yarn typecheck && yarn test SettingsItem && yarn test SettingsGroup`

5. **TASK-092**: Create `PickerItem` (0.25h)
   - Copy `SelectableListButton/` → `PickerItem/`
   - Rename all instances
   - Update `PickerGroup` to use `PickerItem` internally
   - Update tests
   - **Validation**: `yarn typecheck && yarn test PickerItem && yarn test PickerGroup`

**Phase 1 Validation**:

```bash
# All new components created
ls -la src/components/SettingsGroup
ls -la src/components/DetailListGroup
ls -la src/components/PickerGroup
ls -la src/components/SettingsItem
ls -la src/components/PickerItem

# TypeScript compiles
yarn typecheck

# All new component tests pass
yarn test SettingsGroup
yarn test DetailListGroup
yarn test PickerGroup
yarn test SettingsItem
yarn test PickerItem

# Full validation
yarn validate
```

**Commit After Phase 1**:

```bash
git add src/components/SettingsGroup \
        src/components/DetailListGroup \
        src/components/PickerGroup \
        src/components/SettingsItem \
        src/components/PickerItem

git commit -m "$(cat <<'EOF'
✨ feat(components): add purpose-based button group components

Create new components with purpose-based names:
- SettingsGroup (was ChevronButtonGroup)
- DetailListGroup (was MenuButtonGroupSVG)
- PickerGroup (was SelectableButtonGroup)
- SettingsItem (was ButtonWithChevron)
- PickerItem (was SelectableListButton)

All components are exact copies with updated naming.
Old components remain for gradual migration.
Full test coverage maintained.

Related: EPIC-011, US-020, TASK-088 through TASK-092
EOF
)"
```

---

### Phase 2: Migrate Screens (Tasks 093-097) - 2.5h

**Objective**: Migrate each screen one at a time from old components to new components, validating after each migration.

**Important**: Migrate ONE screen at a time. Run full validation after EACH screen before moving to the next.

**Tasks**:

1. **TASK-093**: Migrate SettingsScreen (0.5h)
   - **File**: `src/screens/SettingsScreen.tsx`
   - **Change**: `import { ChevronButtonGroup }` → `import { SettingsGroup }`
   - **Change**: `<ChevronButtonGroup />` → `<SettingsGroup />`
   - **File**: `src/screens/__tests__/SettingsScreen.rntl.tsx` (update if needed)
   - **Validation**:
     ```bash
     yarn test SettingsScreen
     yarn validate
     # Manual: Navigate to Settings screen in app, verify it looks identical
     ```
   - **Commit**:

     ```bash
     git add src/screens/SettingsScreen.tsx src/screens/__tests__/SettingsScreen.rntl.tsx
     git commit -m "♻️ refactor(screens): migrate SettingsScreen to SettingsGroup

     Replace ChevronButtonGroup with purpose-based SettingsGroup.
     No functional changes - pure rename for clarity.

     Related: EPIC-011, US-020, TASK-093"
     ```

2. **TASK-094**: Migrate EducationScreen (0.5h)
   - **File**: `src/screens/EducationDataScreen.tsx`
   - **Change**: `import { MenuButtonGroupSVG }` → `import { DetailListGroup }`
   - **Change**: `<MenuButtonGroupSVG />` → `<DetailListGroup />`
   - **File**: `src/screens/__tests__/EducationDataScreen.rntl.tsx`
   - **Validation**: Same as above
   - **Commit**: Similar pattern

3. **TASK-095**: Migrate WorkXPScreen (0.5h)
   - **File**: `src/screens/WorkXPScreen.tsx`
   - **Change**: `import { MenuButtonGroupSVG }` → `import { DetailListGroup }`
   - **Validation**: Same as above

4. **TASK-096**: Migrate LanguageScreen (0.5h)
   - **File**: `src/screens/LanguageScreen.tsx`
   - **Change**: `import { SelectableButtonGroup }` → `import { PickerGroup }`
   - **Validation**: Same as above

5. **TASK-097**: Migrate AppearanceScreen (0.5h)
   - **File**: `src/screens/AppearanceScreen.tsx`
   - **Change**: `import { SelectableButtonGroup }` → `import { PickerGroup }`
   - **Validation**: Same as above

**Phase 2 Validation Checklist** (After EACH Screen):

```bash
# 1. TypeScript compiles
yarn typecheck

# 2. Linting passes
yarn lint

# 3. Screen tests pass
yarn test <ScreenName>

# 4. Full validation
yarn validate

# 5. Visual inspection (manual)
# - Launch app
# - Navigate to migrated screen
# - Verify appearance identical to before
# - Verify all interactions work

# 6. Commit before moving to next screen
git add src/screens/<ScreenName>.tsx src/screens/__tests__/<ScreenName>.rntl.tsx
git commit -m "♻️ refactor: migrate <ScreenName> to new component"
```

**Do NOT proceed to next screen until current screen passes all validation.**

---

### Phase 3: Cleanup (Tasks 098-099) - 2h

**Objective**: Deprecate and then remove old components after all screens migrated.

**Tasks**:

1.  **TASK-098**: Deprecate Old Components (0.5h)
    - **Files to Modify**:
      - `src/components/ChevronButtonGroup/ChevronButtonGroup.tsx`
      - `src/components/MenuButtonGroupSVG/MenuButtonGroupSVG.tsx`
      - `src/components/SelectableButtonGroup/SelectableButtonGroup.tsx`
      - `src/components/ButtonWithChevron/ButtonWithChevron.tsx`
      - `src/components/SelectableListButton/SelectableListButton.tsx`

    - **Add JSDoc at top of each component**:

      ```typescript
      /**
       * @deprecated Use SettingsGroup instead. This component will be removed.
       * ChevronButtonGroup has been renamed to SettingsGroup for purpose-based clarity.
       */
      export const ChevronButtonGroup = ...
      ```

    - **Validation**:

      ```bash
      yarn typecheck  # Should show deprecation warnings if old components imported
      yarn lint
      yarn validate
      ```

    - **Commit**:

      ```bash
      git add src/components/ChevronButtonGroup \
              src/components/MenuButtonGroupSVG \
              src/components/SelectableButtonGroup \
              src/components/ButtonWithChevron \
              src/components/SelectableListButton

      git commit -m "🏷️ deprecate(components): mark old button components as deprecated

      Add @deprecated tags to old components:
      - ChevronButtonGroup → use SettingsGroup
      - MenuButtonGroupSVG → use DetailListGroup
      - SelectableButtonGroup → use PickerGroup
      - ButtonWithChevron → use SettingsItem
      - SelectableListButton → use PickerItem

      These components will be removed in next phase.

      Related: EPIC-011, US-020, TASK-098"
      ```

2.  **TASK-099**: Remove Old Components (1.5h)
    - **Pre-Removal Verification**:

      ```bash
      # Verify NO references to old components remain
      grep -r "ChevronButtonGroup" src/ --exclude-dir=ChevronButtonGroup
      grep -r "MenuButtonGroupSVG" src/ --exclude-dir=MenuButtonGroupSVG
      grep -r "SelectableButtonGroup" src/ --exclude-dir=SelectableButtonGroup
      grep -r "ButtonWithChevron" src/ --exclude-dir=ButtonWithChevron
      grep -r "SelectableListButton" src/ --exclude-dir=SelectableListButton

      # All above commands should return ZERO results
      # If any results found, migration is incomplete - DO NOT PROCEED
      ```

    - **Remove Directories**:

      ```bash
      rm -rf src/components/ChevronButtonGroup
      rm -rf src/components/MenuButtonGroupSVG
      rm -rf src/components/SelectableButtonGroup
      rm -rf src/components/ButtonWithChevron
      rm -rf src/components/SelectableListButton
      ```

    - **Validation** (Critical - Run All):

      ```bash
      # 1. TypeScript compiles (no import errors)
      yarn typecheck

      # 2. Linting passes
      yarn lint

      # 3. All tests pass
      yarn test

      # 4. Full validation
      yarn validate

      # 5. App runs without errors
      yarn start:reset
      yarn ios  # Or android

      # 6. Manual testing - navigate through ALL screens:
      # - Settings → Language → Appearance
      # - Education screen
      # - Work Experience screen
      # - Verify all functionality intact
      ```

    - **Final Verification** (Before Commit):

      ```bash
      # Grep one more time to ensure old names gone
      grep -r "ChevronButtonGroup" src/
      grep -r "MenuButtonGroupSVG" src/
      grep -r "SelectableButtonGroup" src/
      grep -r "ButtonWithChevron" src/
      grep -r "SelectableListButton" src/

      # Should return ZERO results
      ```

    - **Commit**:
      ```bash
      git add src/components/

           git commit -m "$(cat <<'EOF'

      🔥 remove(components): delete old button components after migration

Remove deprecated components after successful migration:

- ChevronButtonGroup (replaced by SettingsGroup)
- MenuButtonGroupSVG (replaced by DetailListGroup)
- SelectableButtonGroup (replaced by PickerGroup)
- ButtonWithChevron (replaced by SettingsItem)
- SelectableListButton (replaced by PickerItem)

All screens migrated to new purpose-based names.
Zero references to old names remain in codebase.
Full validation passed.

Related: EPIC-011, US-020, TASK-099
EOF
)"
```

**Phase 3 Final Validation**:

After removal commit, run comprehensive validation:

```bash
# Clean build
yarn clean
yarn install

# Full validation suite
yarn validate

# iOS build test
yarn ios

# Android build test (optional but recommended)
yarn android

# E2E tests (if time allows)
yarn detox:ios:build
yarn detox:ios:test
```

If ANY validation fails, DO NOT push. Investigate and fix before proceeding.

---

## Rollback Strategy

If issues arise at any phase, follow these rollback steps:

### During Phase 1 (New Component Creation)

**Issue**: New component doesn't work as expected

**Rollback**:

```bash
# Simply delete the new component directory
rm -rf src/components/<NewComponentName>

# Revert commit if already committed
git reset --hard HEAD~1

# No risk - old components still exist and in use
```

### During Phase 2 (Screen Migration)

**Issue**: Screen doesn't work after migration

**Rollback**:

```bash
# Option 1: Git revert the screen migration commit
git revert HEAD

# Option 2: Manual revert - change import back
# Change: import { SettingsGroup } → import { ChevronButtonGroup }
# Change: <SettingsGroup /> → <ChevronButtonGroup />

# Validate
yarn validate
```

### During Phase 3 (Cleanup)

**Issue**: App breaks after old component removal

**Rollback**:

```bash
# Option 1: Git revert the removal commit
git revert HEAD

# Option 2: Restore from git history
git checkout HEAD~1 -- src/components/ChevronButtonGroup
git checkout HEAD~1 -- src/components/MenuButtonGroupSVG
# ... etc for all removed components

# Investigate which screen still references old component
grep -r "ChevronButtonGroup" src/

# Fix the missed screen migration
# Then retry cleanup phase
```

---

## Verification Commands Reference

### Quick Validation (After Each Task)

```bash
# TypeScript
yarn typecheck

# Linting
yarn lint

# Specific component tests
yarn test <ComponentName>

# Specific screen tests
yarn test <ScreenName>
```

### Full Validation (After Each Screen Migration)

```bash
# Complete validation suite
yarn validate

# Equivalent to:
yarn typecheck && yarn lint && yarn test
```

### Grep Verification (Before Old Component Removal)

```bash
# Check for any remaining references
grep -r "ChevronButtonGroup" src/ --exclude-dir=ChevronButtonGroup
grep -r "MenuButtonGroupSVG" src/ --exclude-dir=MenuButtonGroupSVG
grep -r "SelectableButtonGroup" src/ --exclude-dir=SelectableButtonGroup
grep -r "ButtonWithChevron" src/ --exclude-dir=ButtonWithChevron
grep -r "SelectableListButton" src/ --exclude-dir=SelectableListButton

# All should return ZERO results
```

### Visual Inspection Checklist

After each screen migration, manually test:

- [ ] Settings screen: Icons display, end labels show, chevrons present, press works
- [ ] Education screen: SVG logos load, subtitles display, press navigates
- [ ] Work Experience screen: Company logos load, dates format correctly, press works
- [ ] Language screen: All 5 languages listed, checkmark shows for selected language
- [ ] Appearance screen: All 3 themes listed, checkmark shows for selected theme

---

## Success Criteria

Migration is complete when:

1. ✅ All 5 new components created and tested
2. ✅ All 5 screens migrated to new components
3. ✅ All old components removed from codebase
4. ✅ Zero grep results for old component names in `src/`
5. ✅ TypeScript compilation passes (`yarn typecheck`)
6. ✅ ESLint passes (`yarn lint`)
7. ✅ All tests pass (`yarn test`)
8. ✅ Full validation passes (`yarn validate`)
9. ✅ App runs without errors (manual test all screens)
10. ✅ All commits follow conventional commit format
11. ✅ Migration plan document committed to repo

---

## Timeline

**Total Estimated Duration**: 6.5 hours

| Phase   | Tasks        | Duration | Can Parallelize? |
| ------- | ------------ | -------- | ---------------- |
| Phase 1 | TASK-088-092 | 1.25h    | No (sequential)  |
| Phase 2 | TASK-093-097 | 2.5h     | No (one-by-one)  |
| Phase 3 | TASK-098-099 | 2h       | No (sequential)  |
| Buffer  | Testing      | 0.75h    | -                |

**Recommended Schedule**:

- **Day 1 Morning**: Phase 1 (create all new components) - 1.25h
- **Day 1 Afternoon**: Phase 2 Part 1 (migrate Settings, Education, WorkXP) - 1.5h
- **Day 2 Morning**: Phase 2 Part 2 (migrate Language, Appearance) - 1h
- **Day 2 Afternoon**: Phase 3 (deprecate + remove) - 2h

---

## Risk Mitigation

| Risk                          | Likelihood | Impact | Mitigation                                            |
| ----------------------------- | ---------- | ------ | ----------------------------------------------------- |
| Missed screen migration       | Medium     | High   | Grep verification before removal, comprehensive tests |
| Test failures after migration | Low        | Medium | Run `yarn validate` after EACH screen                 |
| Visual regression             | Low        | Low    | Manual visual inspection checklist                    |
| Breaking changes in PR        | Low        | High   | Phased commits, can revert individual screens         |

---

## Notes

- **Do NOT skip validation steps** - they catch issues early
- **Do NOT batch screen migrations** - migrate one at a time with validation
- **Do NOT remove old components** until grep shows zero references
- **Do commit frequently** - each phase should have its own commit
- **Do test manually** - automated tests don't catch everything

---

## Related Documentation

- [EPIC-011: Component Naming Clarity](./user-stories/epics/EPIC-011-component-naming-clarity.md)
- [US-020: Refactor Button Group Names](./user-stories/stories/US-020-refactor-button-group-component-names-purpose-based-clarity.md)
- Component Analysis Report: Claude Code conversation 2025-01-16

---

**Last Updated**: 2025-01-16
