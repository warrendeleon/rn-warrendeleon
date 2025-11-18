# TASK-140: Evaluate and Migrate to GlueStack ScrollView

**Task ID**: TASK-140
**Epic**: [EPIC-014](../epics/EPIC-014-performance-quality-phase-2.md)
**User Story**: [US-027](../stories/US-027-code-quality-tech-debt.md)
**Status**: ✅ Completed
**Priority**: 🟡 Medium
**Effort**: 4 hours

## Context

11 files in the codebase currently use React Native `<ScrollView />`. GlueStack UI provides a ScrollView equivalent, but it needs to be evaluated for feature completeness before migration.

**Specific concerns**:

- `contentContainerStyle` prop support
- `ref` forwarding for scroll control
- Performance parity with RN ScrollView
- Compatibility with existing scroll behaviour

**Related**: See `.claude/docs/react-patterns.md` for component selection guidance.

## Technical Details

### Files Using RN ScrollView (11 files)

1. **HomeScreen.tsx** (`src/features/Home/HomeScreen.tsx`)
   - Lines 173-176
   - Uses: Basic scrolling container

2. **SplashScreen.tsx** (`src/features/Splash/SplashScreen.tsx`)
   - Line 3 (import only, not actively used)
   - Status: May not need ScrollView at all

3. **ProfileScreen.tsx** (`src/features/Profile/ProfileScreen.tsx`)
   - Lines 291-295
   - Uses: `contentContainerStyle` prop

4. **EducationScreen.tsx** (`src/features/Education/EducationScreen.tsx`)
   - Lines 63-67
   - Uses: Basic scrolling container

5. **WorkExperienceScreen.tsx** (`src/features/WorkExperience/WorkExperienceScreen.tsx`)
   - Lines 87-91
   - Uses: Basic scrolling container

6. **WorkExperienceClientsScreen.tsx** (`src/features/WorkExperience/WorkExperienceClientsScreen.tsx`)
   - Lines 78-82
   - Uses: Basic scrolling container

7. **WorkExperienceDetailsScreen.tsx** (`src/features/WorkExperience/WorkExperienceDetailsScreen.tsx`)
   - Lines 127-130, 157-161
   - Uses: Multiple ScrollViews with `contentContainerStyle`

8. **LanguageScreen.tsx** (`src/features/Settings/LanguageScreen.tsx`)
   - Lines 51-55
   - Uses: Basic scrolling container

9. **AppearanceScreen.tsx** (`src/features/Settings/AppearanceScreen.tsx`)
   - Lines 48-52
   - Uses: Basic scrolling container

10. **SettingsScreen.tsx** (`src/features/Settings/SettingsScreen.tsx`)
    - Lines 114-119
    - Uses: Basic scrolling container

11. **MockStatusScreen.tsx** (`src/features/MockStatus/MockStatusScreen.tsx`)
    - Lines 55-60
    - Uses: Basic scrolling container

### Evaluation Criteria

**Phase 1: Research (1h)**

Use Context7 MCP to research GlueStack ScrollView:

```typescript
// Example Context7 MCP query
mcp__context7__resolve - library - id({ libraryName: 'gluestack-ui' });
mcp__context7__get -
  library -
  docs({
    context7CompatibleLibraryID: '/gluestack-ui/...',
    topic: 'ScrollView component API, props, and limitations',
  });
```

**Questions to answer**:

1. Does GlueStack ScrollView support `contentContainerStyle`?
2. Does it support `ref` forwarding (`scrollTo`, `scrollToEnd` methods)?
3. Are there known performance differences vs RN ScrollView?
4. Does it support all standard ScrollView props (horizontal, showsScrollIndicator, etc.)?
5. Are there any breaking changes or limitations?

**Phase 2: Proof of Concept (1h)**

Test GlueStack ScrollView in ONE file:

1. Pick a simple file (e.g., LanguageScreen or AppearanceScreen)
2. Replace RN ScrollView with GlueStack ScrollView
3. Test all functionality (scrolling, layout, styling)
4. Measure performance (if possible)
5. Document findings

**Phase 3: Decision (30min)**

Based on research and POC, make decision:

**Option A: MIGRATE** (if feature-complete)

- Document migration plan for 11 files
- Create acceptance criteria for each file
- Estimate effort for full migration (2-3h)

**Option B: KEEP RN ScrollView** (if limitations found)

- Document WHY we're keeping RN ScrollView
- Update `.claude/docs/react-patterns.md` with exception
- Add StyleSheet.create justification for these files

**Phase 4: Migration (1.5h) - Only if Option A**

Migrate all 11 files using this pattern:

**Before**:

```typescript
import {ScrollView, StyleSheet} from 'react-native';

<ScrollView
  style={styles.container}
  contentContainerStyle={styles.contentContainer}
>
  {children}
</ScrollView>

const styles = StyleSheet.create({
  container: {flex: 1},
  contentContainer: {padding: 16},
});
```

**After**:

```typescript
import {ScrollView} from '@gluestack-ui/themed';

<ScrollView flex={1} contentContainerStyle={{padding: '$4'}}>
  {children}
</ScrollView>
```

**Testing for each file**:

1. Visual regression check (compare screenshots)
2. Test scroll behaviour (smooth scrolling, bounce effect)
3. Run unit tests: `yarn test <filename>`
4. Run full validation: `yarn validate`

## Acceptance Criteria

### Phase 1: Research

- [ ] Context7 MCP query completed for GlueStack ScrollView
- [ ] All evaluation questions answered and documented
- [ ] Pros/cons comparison table created

### Phase 2: Proof of Concept

- [ ] POC completed in 1 file (LanguageScreen or AppearanceScreen)
- [ ] Functionality tested (scrolling, layout, styling)
- [ ] Findings documented (what works, what doesn't)

### Phase 3: Decision

- [ ] Decision made: MIGRATE or KEEP RN ScrollView
- [ ] Decision rationale documented in task notes or `.claude/docs/react-patterns.md`
- [ ] If MIGRATE: Migration plan documented with effort estimate
- [ ] If KEEP: Exception documented in patterns guide

### Phase 4: Migration (Only if Option A chosen)

- [ ] All 11 files migrated to GlueStack ScrollView
- [ ] Visual regression testing complete (no styling changes)
- [ ] Scroll behaviour matches RN ScrollView exactly
- [ ] All unit tests passing
- [ ] `yarn validate` passing
- [ ] E2E tests passing (if affected screens have E2E coverage)

## Definition of Done

**If MIGRATE**:

- All 11 files using GlueStack ScrollView
- No visual or functional regressions
- All tests passing
- Migration documented

**If KEEP RN ScrollView**:

- Decision rationale clearly documented
- Exception added to `.claude/docs/react-patterns.md`
- StyleSheet.create usage justified for ScrollView files
- Future developers understand WHY we kept RN ScrollView

## Completion Notes

**Decision**: MIGRATE to GlueStack ScrollView ✅

**Research Findings**:

- GlueStack ScrollView is a `styled()` wrapper around React Native ScrollView
- Supports all RN ScrollView props including `contentContainerStyle`
- Custom property resolver translates GlueStack design tokens
- Identical performance (no overhead)
- No breaking changes or limitations

**Implementation Summary**:

- **Phase 1 (Research)**: Analyzed GlueStack ScrollView implementation via direct code inspection
- **Phase 2 (POC)**: Successfully migrated AppearanceScreen - all tests passed
- **Phase 3 (Decision)**: Approved migration based on feature parity and token support
- **Phase 4 (Migration)**: Migrated all 10 remaining files

**Files Migrated** (11 total):

1. ✅ AppearanceScreen.tsx (POC)
2. ✅ LanguageScreen.tsx
3. ✅ SettingsScreen.tsx
4. ✅ MockStatusScreen.tsx
5. ✅ HomeScreen.tsx
6. ✅ EducationScreen.tsx
7. ✅ WorkExperienceScreen.tsx
8. ✅ WorkExperienceClientsScreen.tsx
9. ✅ WorkExperienceDetailsScreen.tsx
10. ✅ ProfileScreen.tsx (contentContainerStyle)
11. ⏭️ SplashScreen.tsx (no ScrollView used - skipped)

**Test Updates**:

- Fixed WorkExperienceScreen tests to use GlueStack prop assertions (`bg`, `color`)
- All 464 tests passing

**Validation**: ✅ yarn validate (0 errors, 0 warnings, 0 failures)

**Last Updated**: 2025-01-18
