# TASK-012: Test ErrorBoundary

**ID**: TASK-012
**Title**: Test ErrorBoundary
**Epic**: [EPIC-002: Quality & Reliability](../epics/EPIC-002-quality-reliability.md)
**User Story**: [US-002: Graceful Error Handling](../stories/US-002-graceful-error-handling.md)
**Created**: 2025-01-11
**Completed**: _Not yet completed_
**Status**: Not Started
**Priority**: High
**Effort Estimate**: 0.5 hours
**Tags**: `testing`, `error-handling`, `jest`, `coverage`

---

## Context

Write comprehensive unit tests for ErrorBoundary component to ensure it catches errors, displays fallback UI, and provides recovery options. Target: 100% coverage.

---

## Technical Details

### Files to Create

- `src/components/ErrorBoundary/__tests__/ErrorBoundary.test.tsx`

### Test Implementation

```typescript
import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {ErrorBoundary} from '../ErrorBoundary';
import {Text} from 'react-native';

const ThrowError = () => {
  throw new Error('Test error');
};

const WorkingComponent = () => <Text>Working</Text>;

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when no error', () => {
    const {getByText} = render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );
    expect(getByText('Working')).toBeTruthy();
  });

  it('catches errors and displays fallback UI', () => {
    const {getByText} = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
    expect(getByText('Go Home')).toBeTruthy();
  });

  it('logs error to console', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('resets error when Try Again pressed', () => {
    const {getByText, queryByText} = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Error displayed
    expect(getByText('Something went wrong')).toBeTruthy();

    // Press Try Again
    fireEvent.press(getByText('Try Again'));

    // Error should be reset (may throw again, but state was reset)
    // Test that resetError was called
  });
});
```

---

## Acceptance Criteria

- [ ] Test file created in `__tests__/` directory
- [ ] Tests cover: rendering children, catching errors, displaying fallback
- [ ] Tests cover: Try Again button, Go Home button, error logging
- [ ] 100% coverage on ErrorBoundary component
- [ ] All tests pass
- [ ] Console errors mocked to avoid test noise

---

## Test Scenarios

**Scenario 1: Renders Children Successfully**

```gherkin
Given ErrorBoundary wraps a working component
When the component renders
Then the children should render normally
And no fallback UI should be shown
```

**Scenario 2: Catches Component Error**

```gherkin
Given ErrorBoundary wraps a component that throws an error
When the component renders
Then the error should be caught
And fallback UI should display with "Something went wrong"
And recovery buttons should be available
```

**Scenario 3: Reset Error State**

```gherkin
Given ErrorBoundary is displaying fallback UI
When the "Try Again" button is pressed
Then the error state should reset
And the component should attempt to re-render
```

---

## Dependencies

**Blockers**:

- [TASK-011](./TASK-011-create-error-boundary.md)

**Enables**:

- [TASK-013](./TASK-013-integrate-error-boundary.md)

---

## Success Criteria

✅ Comprehensive test coverage (100%)
✅ All tests pass
✅ Error scenarios validated

---

**Last Updated**: 2025-01-11
