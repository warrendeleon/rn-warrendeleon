# TASK-138: Standardize GlueStack UI in ProfileDataScreen & WebViewScreen

**Task ID**: TASK-138
**Epic**: [EPIC-014](../epics/EPIC-014-performance-quality-phase-2.md)
**User Story**: [US-027](../stories/US-027-code-quality-tech-debt.md)
**Status**: 📋 Not Started
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

- [ ] ProfileDataScreen uses GlueStack UI (no StyleSheet.create)
- [ ] WebViewScreen uses GlueStack UI (no StyleSheet.create)
- [ ] All RN Text → GlueStack Text migration complete
- [ ] All RN View → GlueStack Box migration complete (WebViewScreen)
- [ ] Styling matches exactly as before (no visual regressions)
- [ ] Unit tests passing: `yarn test ProfileDataScreen WebViewScreen`
- [ ] Full validation passing: `yarn validate`
- [ ] Visual regression testing complete

## Definition of Done

- ProfileDataScreen and WebViewScreen fully migrated to GlueStack UI patterns
- No StyleSheet.create in these files
- Consistent use of GlueStack tokens ($colors, $space, $sizes)
- All tests passing (unit tests + yarn validate)
- No visual regressions confirmed

**Last Updated**: 2025-01-17
