# TASK-142: Document StyleSheet.create() Usage Justifications

**Task ID**: TASK-142
**Epic**: [EPIC-014](../epics/EPIC-014-performance-quality-phase-2.md)
**User Story**: [US-027](../stories/US-027-code-quality-tech-debt.md)
**Status**: ✅ Done
**Priority**: 🟢 Low
**Effort**: 1 hour

## Context

After migrating to GlueStack UI patterns (TASK-138, TASK-139, TASK-140, TASK-141), some files will still use `StyleSheet.create()` for legitimate reasons (pure RN components, platform-specific styles, performance-critical layouts).

This task ensures all remaining `StyleSheet.create()` usage is:

1. **Justified** (documented WHY it's necessary)
2. **Minimal** (only used where absolutely needed)
3. **Consistent** (follows documented exceptions)

**Rule**: StyleSheet.create() is ACCEPTABLE for pure React Native components without GlueStack equivalents.

**Related**: See `.claude/docs/react-patterns.md` for styling approach and component selection standards.

## Technical Details

### Files with Justified StyleSheet.create() Usage (5 files)

Based on comprehensive audit, these files have legitimate StyleSheet.create() usage:

1. **SplashScreen.tsx** (`src/features/Splash/SplashScreen.tsx`)
   - **Reason**: Uses RN View for layout (flex: 1, alignItems, justifyContent)
   - **Justification**: Core layout container, no GlueStack equivalent needed here
   - **Lines**: 50-60

2. **WebViewScreen.tsx** (`src/features/WebView/WebViewScreen.tsx`)
   - **Reason**: Uses RN View containers and Text for error/loading states
   - **Justification**: Layout styles for RN components
   - **Lines**: 124-147
   - **Note**: May be partially migrated in TASK-138 (verify after completion)

3. **PDFScreen.tsx** (`src/features/PDF/PDFScreen.tsx`)
   - **Reason**: Third-party component styling (react-native-pdf), button layouts
   - **Justification**: TouchableOpacity for share button, View containers
   - **Lines**: 131-166
   - **Note**: PDF wrapper migrated in TASK-141, but other styles may remain

4. **ProfileScreen.tsx** (`src/features/Profile/ProfileScreen.tsx`)
   - **Reason**: RN View/ScrollView layout, complex layout calculations
   - **Justification**: Container layouts, social icon dimensions, responsive design
   - **Lines**: 415-446
   - **Note**: Some inline styles also used with NativeWind className (hybrid approach)

5. **DetailListGroup.tsx** (`src/components/DetailListGroup/DetailListGroup.tsx`)
   - **Reason**: Uses `StyleSheet.hairlineWidth` for divider
   - **Justification**: Platform-specific hairline width (best practice for 1px dividers)
   - **Lines**: 104-169 (specifically line 149: `borderBottomWidth: StyleSheet.hairlineWidth`)
   - **Note**: TouchableOpacity usage may be migrated in TASK-139

### Documentation Tasks

**Phase 1**: Audit Remaining StyleSheet Usage (30min)

After completing TASK-138, TASK-139, TASK-140, TASK-141, verify which files still use StyleSheet.create():

```bash
# Find all StyleSheet.create usage
grep -r "StyleSheet.create" src/ --include="*.tsx" --include="*.ts" -n
```

**Expected results**: 5 files or fewer (SplashScreen, WebViewScreen, PDFScreen, ProfileScreen, DetailListGroup)

**Phase 2**: Add Inline Documentation (15min)

For each file with StyleSheet.create(), add a comment explaining WHY:

```typescript
// StyleSheet.create used here for RN View layout (no GlueStack equivalent)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

**Example comments**:

- `// StyleSheet.create for RN ScrollView layout (platform-specific styles)`
- `// StyleSheet.create for hairlineWidth divider (platform-specific value)`
- `// StyleSheet.create for third-party component (react-native-pdf)`
- `// StyleSheet.create for complex layout calculations requiring StyleSheet`

**Phase 3**: Update Documentation (15min)

Update `.claude/docs/react-patterns.md` section "Styling Approach" to include:

**Acceptable StyleSheet.create() Use Cases**:

1. ✅ Pure RN components (View, ScrollView without GlueStack equivalent)
2. ✅ Platform-specific values (`StyleSheet.hairlineWidth`, `Platform.select`)
3. ✅ Third-party component styling (when not using `styled()` wrapper)
4. ✅ Complex layout calculations requiring StyleSheet API
5. ❌ NOT for GlueStack UI components (use inline props instead)

**Phase 4**: Create Verification Checklist (Optional)

Add to CLAUDE.md or react-patterns.md:

**StyleSheet.create() Checklist** (for future code reviews):

- [ ] Is this component using GlueStack UI? → Use inline props instead
- [ ] Is this a pure RN component? → StyleSheet.create OK
- [ ] Uses platform-specific values? → StyleSheet.create OK
- [ ] Complex calculations? → StyleSheet.create OK
- [ ] Can this be converted to `styled()` wrapper? → Consider refactoring

## Acceptance Criteria

### Audit

- [x] All files with StyleSheet.create() identified and listed
- [x] Each usage verified as justified (pure RN components, platform-specific, etc.)
- [x] No unnecessary StyleSheet.create() found in GlueStack component files

### Documentation

- [x] Inline comments added to each file explaining WHY StyleSheet.create() is used
- [x] `.claude/docs/react-patterns.md` updated with acceptable use cases
- [x] Examples added showing when to use StyleSheet vs inline props

### Verification

- [x] All StyleSheet.create() usage follows documented guidelines
- [x] Future developers understand when StyleSheet.create() is acceptable
- [x] CLAUDE.md or react-patterns.md includes quick reference checklist

## Definition of Done

- All remaining StyleSheet.create() usage is justified and documented
- Inline comments explain WHY in each file
- `.claude/docs/react-patterns.md` updated with acceptable use cases
- No StyleSheet.create() in GlueStack UI component files
- Clear guidelines for future development

**Last Updated**: 2025-01-17
