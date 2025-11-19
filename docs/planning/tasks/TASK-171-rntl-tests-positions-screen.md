# TASK-171: RNTL Tests for WorkExperiencePositionsScreen

**Status**: 📋 To Do
**Priority**: High
**Effort**: 1h
**Epic**: [EPIC-019](../epics/EPIC-019-work-experience-multi-position.md)

---

## Description

Create comprehensive RNTL unit tests for the new `WorkExperiencePositionsScreen` component, following existing test patterns in the codebase.

## Test Cases

### Rendering

- [ ] Renders list of positions for a company
- [ ] Shows position title for each item
- [ ] Shows date range for each item
- [ ] Positions sorted by date (most recent first)
- [ ] Shows company logo in header

### Navigation

- [ ] Navigates to details screen on position tap
- [ ] Passes correct position ID to details screen

### Edge Cases

- [ ] Handles empty positions array gracefully
- [ ] Handles missing work experience data

### Accessibility

- [ ] All items have correct accessibilityRole
- [ ] All items have accessibilityLabel
- [ ] All items have accessibilityHint
- [ ] Touch targets meet 44×44 minimum

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

- [ ] All test cases pass with `yarn test`
- [ ] Coverage threshold met for new screen
- [ ] Tests follow existing patterns in codebase
- [ ] No flaky tests
- [ ] Proper mocking of navigation and Redux state

## Test File Location

`src/features/WorkExperience/__tests__/WorkExperiencePositionsScreen.rntl.tsx`

## Related Files

- `src/features/WorkExperience/WorkExperiencePositionsScreen.tsx`
- `src/features/WorkExperience/__tests__/WorkExperienceScreen.rntl.tsx` (reference)
- `src/features/WorkExperience/__tests__/WorkExperienceClientsScreen.rntl.tsx` (reference, if exists)
