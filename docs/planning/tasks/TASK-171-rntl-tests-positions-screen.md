# TASK-171: RNTL Tests for WorkExperiencePositionsScreen

**Status**: ✅ Done
**Priority**: High
**Effort**: 1h
**Epic**: [EPIC-019](../epics/EPIC-019-work-experience-multi-position.md)

---

## Description

Create comprehensive RNTL unit tests for the new `WorkExperiencePositionsScreen` component, following existing test patterns in the codebase.

## Test Cases

### Rendering

- [x] Renders list of positions for a company
- [x] Shows position title for each item
- [x] Shows date range for each item
- [x] Positions sorted by date (most recent first)
- [x] Shows company logo in header

### Navigation

- [x] Navigates to details screen on position tap
- [x] Passes correct position ID to details screen

### Edge Cases

- [x] Handles empty positions array gracefully
- [x] Handles missing work experience data

### Accessibility

- [x] All items have correct accessibilityRole
- [x] All items have accessibilityLabel
- [x] All items have accessibilityHint
- [x] Touch targets meet 44×44 minimum

## Test Setup

```typescript
import { render, fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@app/test-utils';
import WorkExperiencePositionsScreen from '../WorkExperiencePositionsScreen';

const mockNavigation = {
  navigate: jest.fn(),
};

const mockWorkExperience = {
  id: 'sky-id',
  company: 'Sky',
  logo: 'https://example.com/sky.svg',
  positions: [
    {
      id: 'pos-1',
      title: 'Software Engineering Manager',
      start: 'Oct 2023',
      end: 'Dec 2025',
      description: '...',
      responsibilities: ['...'],
    },
    {
      id: 'pos-2',
      title: 'Senior React Native Engineer',
      start: 'Jan 2023',
      end: 'Oct 2023',
      description: '...',
      techStack: ['...'],
    },
  ],
};
```

## Acceptance Criteria

- [x] All test cases pass with `yarn test`
- [x] Coverage threshold met for new screen
- [x] Tests follow existing patterns in codebase
- [x] No flaky tests
- [x] Proper mocking of navigation and Redux state

## Test File Location

`src/features/WorkExperience/__tests__/WorkExperiencePositionsScreen.rntl.tsx`

## Related Files

- `src/features/WorkExperience/WorkExperiencePositionsScreen.tsx`
- `src/features/WorkExperience/__tests__/WorkExperienceScreen.rntl.tsx` (reference)
- `src/features/WorkExperience/__tests__/WorkExperienceClientsScreen.rntl.tsx` (reference, if exists)
