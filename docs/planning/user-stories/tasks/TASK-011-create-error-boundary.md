# TASK-011: Create ErrorBoundary Component

**ID**: TASK-011
**Title**: Create ErrorBoundary Component
**Epic**: [EPIC-002: Quality & Reliability](../epics/EPIC-002-quality-reliability.md)
**User Story**: [US-002: Graceful Error Handling](../stories/US-002-graceful-error-handling.md)
**Created**: 2025-01-11
**Completed**: _Not yet completed_
**Status**: Not Started
**Priority**: High
**Effort Estimate**: 1 hour
**Tags**: `error-handling`, `reliability`, `react`, `production`

---

## Context

Create a React Error Boundary component to catch JavaScript errors in component trees, log them, and display fallback UI. This prevents full-app crashes from component errors.

**Implementation**: See [EPIC-002](../epics/EPIC-002-quality-reliability.md#error-boundary-pattern) for pattern details and [US-002](../stories/US-002-graceful-error-handling.md) for user value.

---

## Technical Details

### Files to Create

- `src/components/ErrorBoundary/ErrorBoundary.tsx` - Main boundary class component
- `src/components/ErrorBoundary/FallbackUI.tsx` - Error display component
- `src/components/ErrorBoundary/index.ts` - Barrel export

### Implementation

**ErrorBoundary.tsx**:

```typescript
import React, {Component, ReactNode} from 'react';
import {FallbackUI} from './FallbackUI';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error: Error): State {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console (future: send to error monitoring service)
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({hasError: false, error: null});
  };

  render() {
    if (this.state.hasError) {
      return (
        <FallbackUI
          error={this.state.error}
          onReset={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}
```

**FallbackUI.tsx**:

```typescript
import React from 'react';
import {View, Text, Button} from 'react-native';
import {useNavigation} from '@react-navigation/native';

interface Props {
  error: Error | null;
  onReset: () => void;
}

export const FallbackUI: React.FC<Props> = ({error, onReset}) => {
  const navigation = useNavigation();

  const goHome = () => {
    onReset();
    navigation.navigate('Home');
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
      <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 16}}>
        Something went wrong
      </Text>
      <Text style={{fontSize: 16, marginBottom: 32, textAlign: 'center'}}>
        {__DEV__ ? error?.message : 'An unexpected error occurred'}
      </Text>
      <Button title="Try Again" onPress={onReset} />
      <View style={{height: 16}} />
      <Button title="Go Home" onPress={goHome} />
    </View>
  );
};
```

---

## Acceptance Criteria

- [ ] ErrorBoundary class component created with getDerivedStateFromError
- [ ] componentDidCatch logs errors to console
- [ ] FallbackUI displays clear error message
- [ ] "Try Again" button resets error state
- [ ] "Go Home" button navigates to Home screen
- [ ] TypeScript types are correct
- [ ] Component follows React best practices
- [ ] Error details shown in DEV, hidden in production

---

## Test Scenarios

See [TASK-012](./TASK-012-test-error-boundary.md) for comprehensive test scenarios.

---

## Dependencies

**Blockers**:

- [TASK-023](./TASK-023-remove-unused-dependencies.md)
- [TASK-024](./TASK-024-add-missing-types.md)

**Enables**:

- [TASK-012](./TASK-012-test-error-boundary.md) - Testing
- [TASK-013](./TASK-013-integrate-error-boundary.md) - Integration

---

## Success Criteria

✅ ErrorBoundary and FallbackUI components created
✅ TypeScript compilation successful
✅ Manual testing shows error catching works
✅ Files exported from index.ts

---

**Last Updated**: 2025-01-11
