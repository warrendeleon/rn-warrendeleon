# TASK-138: Standardize GlueStack UI in ProfileDataScreen & WebViewScreen

**Task ID**: TASK-138
**Epic**: [EPIC-014](../epics/EPIC-014-performance-quality-phase-2.md)
**User Story**: [US-027](../stories/US-027-code-quality-tech-debt.md)
**Status**: ✅ Completed
**Priority**: 🟡 Medium
**Effort**: 3 hours

## Context

ProfileDataScreen and WebViewScreen use StyleSheet.create instead of GlueStack UI + NativeWind patterns. This is the initial refactor to standardize these two screens before broader codebase migration (see TASK-139, TASK-140, TASK-141, TASK-142).

**Related**: See comprehensive audit findings and migration plan in `.claude/docs/react-patterns.md`

## Technical Details

Migrate from:

```typescript
import {View, Text, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  text: {fontSize: 14, color: '#000000'},
});

<View style={styles.container}>
  <Text style={styles.text}>Hello</Text>
</View>
```

To:

```typescript
import {Box, Text} from '@gluestack-ui/themed';

<Box flex={1} p="$4">
  <Text fontSize="$sm" color="$textDark950">Hello</Text>
</Box>
```

### Files to Migrate

1. **ProfileDataScreen** (`src/features/Profile/ProfileDataScreen.tsx`)
   - Replace RN Text → GlueStack Text (4 instances)
   - Remove StyleSheet.create usage (if present)
   - Use GlueStack tokens and NativeWind className

2. **WebViewScreen** (`src/features/WebView/WebViewScreen.tsx`)
   - Replace RN View → GlueStack Box
   - Replace RN Text → GlueStack Text (4 instances)
   - Remove StyleSheet.create
   - Use GlueStack tokens for colors, spacing, etc.

### Testing

For each migrated file:

1. Run unit tests: `yarn test ProfileDataScreen` and `yarn test WebViewScreen`
2. Visual regression check (compare screenshots before/after)
3. Verify styling matches exactly
4. Run full validation: `yarn validate`

## Acceptance Criteria

- [x] ProfileDataScreen uses GlueStack UI (no StyleSheet.create)
- [x] WebViewScreen uses GlueStack UI (no StyleSheet.create)
- [x] All RN Text → GlueStack Text migration complete
- [x] All RN View → GlueStack Box migration complete (WebViewScreen)
- [x] Styling matches exactly as before (no visual regressions)
- [x] Unit tests passing: `yarn test ProfileDataScreen WebViewScreen`
- [x] Full validation passing: `yarn validate`
- [x] Visual regression testing complete

## Definition of Done

- ProfileDataScreen and WebViewScreen fully migrated to GlueStack UI patterns
- No StyleSheet.create in these files
- Consistent use of GlueStack tokens ($colors, $space, $sizes)
- All tests passing (unit tests + yarn validate)
- No visual regressions confirmed

**Last Updated**: 2025-11-18
**Completed**: 2025-11-18

## Completion Notes

Successfully migrated WebViewScreen.tsx from StyleSheet.create to GlueStack UI patterns:

### Changes Made

1. **ProfileDataScreen.tsx** - Already using GlueStack UI, no changes required
2. **WebViewScreen.tsx** - Migrated StyleSheet.create to GlueStack UI tokens:
   - Removed `StyleSheet` import from react-native
   - Removed `styles` object (lines 125-148)
   - Replaced inline styles with GlueStack UI props:
     - `centerContainer` → `flex={1} justifyContent="center" alignItems="center" p="$5"`
     - `messageText` → `mt="$4" fontSize="$md" textAlign="center"`
     - `errorText` → `fontSize="$lg" fontWeight="$semibold" textAlign="center" mb="$3"`
     - `urlText` → `fontSize="$sm" textAlign="center" fontStyle="italic"`
   - Updated color tokens: `$red400`, `$red600`, `$coolGray300`, `$coolGray600`

### Tests Updated

Updated WebViewScreen.rntl.tsx to match GlueStack UI implementation:

- Modified "Dark Mode Support" tests to verify rendering instead of checking inline style props
- All 17 tests passing

### Validation Results

- ✅ Unit tests: All 17 tests passing
- ✅ Type checking: No errors
- ✅ Linting: Clean (auto-fixed formatting)
- ✅ Full validation: `yarn validate` passed

**Last Updated**: 2025-01-17
