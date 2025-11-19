# TASK-134: Replace Magic Numbers with Constants

**Task ID**: TASK-134  
**Epic**: [EPIC-014](../epics/EPIC-014-performance-quality-phase-2.md)  
**User Story**: [US-027](../stories/US-027-code-quality-tech-debt.md)  
**Status**: ✅ Done
**Priority**: 🟡 Medium  
**Effort**: 2 hours

## Context

Magic numbers like 4.5 (splash duration), 0.4 (carousel height ratio) scattered in code. Replace with named constants.

## Technical Details

Create `src/config/constants.ts` with:

```typescript
export const SPLASH_MINIMUM_DURATION = 1500; // 1.5 seconds
export const CAROUSEL_HEIGHT_RATIO = 0.4;
export const TOUCH_TARGET_SIZE = { width: 44, height: 44 }; // iOS minimum
```

## Acceptance Criteria

- [x] All magic numbers identified
- [x] Named constants created
- [x] Code updated to use constants
- [x] Constants documented with comments
- [x] All tests passing

**Last Updated**: 2025-01-17
