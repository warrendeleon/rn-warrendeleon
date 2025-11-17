# TASK-138: Standardize on GlueStack UI Patterns

**Task ID**: TASK-138  
**Epic**: [EPIC-014](../epics/EPIC-014-performance-quality-phase-2.md)  
**User Story**: [US-027](../stories/US-027-code-quality-tech-debt.md)  
**Status**: 📋 Not Started  
**Priority**: 🟡 Medium  
**Effort**: 3 hours

## Context

ProfileDataScreen and WebViewScreen use StyleSheet.create instead of GlueStack UI + NativeWind patterns. Standardize to architectural standard.

## Technical Details

Migrate from:

```typescript
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});
<View style={styles.container}>
```

To:

```typescript
<Box flex={1} p="$4">
```

## Acceptance Criteria

- [ ] ProfileDataScreen uses GlueStack UI (no StyleSheet.create)
- [ ] WebViewScreen uses GlueStack UI (no StyleSheet.create)
- [ ] Styling matches exactly as before
- [ ] Visual regression testing complete
- [ ] All tests passing

**Last Updated**: 2025-01-17
