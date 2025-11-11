# Testing Guide

This document covers unit and integration testing with Jest and React Native Testing Library.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Setup](#test-setup)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Coverage Requirements](#coverage-requirements)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Testing Philosophy

### What We Test

1. **Business Logic** (100% coverage required)
   - Redux actions, reducers, selectors
   - Utility functions
   - Custom hooks
   - Configuration and setup

2. **Component Behavior** (85% coverage target)
   - User interactions
   - Conditional rendering
   - Props validation
   - Event handlers

### What We Don't Test

- Third-party libraries
- React Native framework code
- Simple presentational components with no logic
- Type definitions

### Testing Pyramid

```
        /\
       /E2E\       <- E2E tests (Detox + Cucumber)
      /------\
     /  Inte- \    <- Integration tests (RTL)
    /  gration \
   /------------\
  /    Unit      \ <- Unit tests (Jest)
 /----------------\
```

## Test Setup

### Tech Stack

- **Jest**: Test runner and assertion library
- **React Native Testing Library**: Component testing utilities
- **@testing-library/react-hooks**: Hook testing
- **Custom Utilities**: `renderWithProviders` for GlueStack + Redux

### File Naming Convention

All tests use the `.rntl.tsx` suffix:

```
HomeScreen.tsx
HomeScreen.rntl.tsx
```

This distinguishes unit/integration tests from E2E tests (`.feature`, `.cucumber.tsx`).

### Configuration

Jest configuration is in `jest.config.cjs`:

```javascript
module.exports = {
  preset: 'react-native',
  testMatch: ['**/*.rntl.tsx'], // Only run .rntl.tsx files
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 85,
      functions: 85,
      lines: 85,
    },
  },
};
```

## Running Tests

### All Tests

```bash
yarn test
```

### Watch Mode

```bash
yarn test:watch
```

### With Coverage

```bash
yarn test:coverage
```

### Specific File

```bash
yarn test HomeScreen.rntl.tsx
```

### Update Snapshots

```bash
yarn test -u
```

## Writing Tests

### Basic Component Test

```typescript
import React from 'react';
import { renderWithProviders } from '@app/test-utils';
import { HomeScreen } from '../HomeScreen';

describe('HomeScreen', () => {
  it('renders without crashing', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);
    expect(getByText('Home')).toBeTruthy();
  });

  it('navigates to Settings when button pressed', () => {
    const navigate = jest.fn();
    const { getByText } = renderWithProviders(
      <HomeScreen navigation={{ navigate }} />
    );

    fireEvent.press(getByText('Settings'));
    expect(navigate).toHaveBeenCalledWith('Settings');
  });
});
```

### Testing with Props

```typescript
it('renders with custom label', () => {
  const { getByText } = renderWithProviders(
    <Button label="Click me" onPress={jest.fn()} />
  );

  expect(getByText('Click me')).toBeTruthy();
});
```

### Testing User Interactions

```typescript
import { fireEvent } from '@testing-library/react-native';

it('calls onPress when button is tapped', () => {
  const onPress = jest.fn();
  const { getByTestId } = renderWithProviders(
    <Button testID="my-button" onPress={onPress} />
  );

  fireEvent.press(getByTestId('my-button'));
  expect(onPress).toHaveBeenCalledTimes(1);
});
```

### Testing with Redux

```typescript
import { renderWithProviders } from '@app/test-utils';
import { setTheme } from '../store/actions';

it('updates theme in Redux store', () => {
  const { store } = renderWithProviders(<AppearanceScreen />);

  store.dispatch(setTheme('dark'));

  const state = store.getState();
  expect(state.settings.theme).toBe('dark');
});
```

### Testing Redux Logic

```typescript
import { settingsReducer } from '../reducer';
import { setTheme, setLanguage } from '../actions';

describe('settingsReducer', () => {
  it('updates theme', () => {
    const initialState = { theme: 'light', language: 'en' };
    const newState = settingsReducer(initialState, setTheme('dark'));

    expect(newState.theme).toBe('dark');
  });
});
```

### Testing Selectors

```typescript
import { selectTheme } from '../selectors';

describe('settingsSelectors', () => {
  it('selects theme from state', () => {
    const state = {
      settings: { theme: 'dark', language: 'en' },
    };

    expect(selectTheme(state)).toBe('dark');
  });
});
```

### Testing Utilities

```typescript
import { getButtonGroupVariant } from '../utils';

describe('getButtonGroupVariant', () => {
  it('returns single for a single item', () => {
    expect(getButtonGroupVariant(0, 1)).toBe('single');
  });

  it('returns top for the first item of multiple', () => {
    expect(getButtonGroupVariant(0, 3)).toBe('top');
  });
});
```

### Mocking

#### Mock Functions

```typescript
const mockNavigate = jest.fn();
```

#### Mock Modules

```typescript
jest.mock('@app/hooks/useAppColorScheme', () => ({
  useAppColorScheme: () => 'light',
}));
```

#### Mock React Native APIs

```typescript
import * as ReactNative from 'react-native';

jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');
```

## Coverage Requirements

### Global Thresholds

- **85% minimum** for all metrics (statements, branches, functions, lines)

### Business Logic

- **100% coverage** required for:
  - Redux actions
  - Redux reducers
  - Redux selectors
  - Utility functions
  - Custom hooks
  - Configuration files

### Component Coverage

- **Focus on behavior, not implementation**
- Test all user-facing interactions
- Test conditional rendering paths
- Test error states

### View Coverage Report

```bash
yarn test:coverage
open coverage/lcov-report/index.html
```

## Best Practices

### 1. Test Behavior, Not Implementation

**Bad**:

```typescript
it('calls setState', () => {
  const { rerender } = render(<Component />);
  // Testing internal state
});
```

**Good**:

```typescript
it('displays updated text when button clicked', () => {
  const { getByText, getByTestId } = render(<Component />);
  fireEvent.press(getByTestId('button'));
  expect(getByText('Updated')).toBeTruthy();
});
```

### 2. Use renderWithProviders

Always use `renderWithProviders` for components that use:

- GlueStack UI components
- Redux hooks
- i18n hooks

```typescript
import { renderWithProviders } from '@app/test-utils';

const { getByText } = renderWithProviders(<MyComponent />);
```

### 3. Use Descriptive Test Names

**Bad**:

```typescript
it('works', () => { ... });
```

**Good**:

```typescript
it('displays error message when form submission fails', () => { ... });
```

### 4. Follow AAA Pattern

```typescript
it('description', () => {
  // Arrange
  const props = { label: 'Test' };

  // Act
  const { getByText } = renderWithProviders(<Button {...props} />);

  // Assert
  expect(getByText('Test')).toBeTruthy();
});
```

### 5. Test Edge Cases

```typescript
describe('getButtonGroupVariant', () => {
  it('handles single item', () => { ... });
  it('handles first item', () => { ... });
  it('handles middle items', () => { ... });
  it('handles last item', () => { ... });
  it('handles empty array', () => { ... });  // Edge case
});
```

### 6. Keep Tests Independent

Each test should:

- Set up its own data
- Not depend on other tests
- Clean up after itself

### 7. Use testID for Elements

```typescript
// Component
<Button testID="submit-button" onPress={onSubmit} />

// Test
const { getByTestID } = render(<Form />);
fireEvent.press(getByTestID('submit-button'));
```

## Troubleshooting

### Tests Not Running

**Problem**: Jest not finding tests

**Solution**: Verify file naming (`.rntl.tsx`)

```bash
# Check jest config
cat jest.config.cjs | grep testMatch
```

### Mocks Not Working

**Problem**: Module mocks not applying

**Solution**: Ensure mocks are defined before imports

```typescript
jest.mock('@app/hooks/useTheme');
import { useTheme } from '@app/hooks/useTheme';
```

### Async Tests Timing Out

**Problem**: Test hangs or times out

**Solution**: Use `waitFor` for async operations

```typescript
import { waitFor } from '@testing-library/react-native';

await waitFor(() => {
  expect(getByText('Loaded')).toBeTruthy();
});
```

### Coverage Not Accurate

**Problem**: Coverage report shows untested code as tested

**Solution**: Check for:

- Unused imports
- Dead code
- Unreachable branches

### React Native Components Not Rendering

**Problem**: `ReferenceError: View is not defined`

**Solution**: Ensure `preset: 'react-native'` in jest.config.cjs

## Test Organization

### Component Tests

```typescript
describe('MyComponent', () => {
  describe('rendering', () => {
    it('renders without crashing', () => { ... });
    it('renders with props', () => { ... });
  });

  describe('interactions', () => {
    it('handles button press', () => { ... });
  });

  describe('edge cases', () => {
    it('handles empty state', () => { ... });
  });
});
```

### Redux Tests

```typescript
describe('settingsActions', () => {
  describe('setTheme', () => {
    it('creates action with theme payload', () => { ... });
  });
});
```

## Next Steps

- See [E2E Testing](./E2E_TESTING.md) for end-to-end testing
- See [Contributing](./CONTRIBUTING.md) for code quality standards
