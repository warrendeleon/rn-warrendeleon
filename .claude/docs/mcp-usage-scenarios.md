# MCP Usage Scenarios

Real-world examples of when and how to use each MCP effectively.

## Context7 MCP Examples

### Scenario 1: Adding React Navigation Type Safety

**Problem**: Need to add new screen to navigation with proper TypeScript types

**Solution**:

```typescript
// 1. Resolve library ID
mcp__context7__resolve - library - id({ libraryName: 'react-navigation' });

// 2. Get TypeScript documentation
mcp__context7__get -
  library -
  docs({
    context7CompatibleLibraryID: '/react-navigation/react-navigation',
    topic: 'TypeScript types for Stack Navigator params',
  });

// 3. Apply to codebase
export type RootStackParamList = {
  NewScreen: { userId: string }; // ← From Context7 docs
};
```

### Scenario 2: Detox Matchers and Assertions

**Problem**: Need to verify element visibility in E2E test

**Solution**:

```typescript
mcp__context7__get -
  library -
  docs({
    context7CompatibleLibraryID: '/wix/detox',
    topic: 'matchers and assertions',
  });

// Result: Use waitFor + toBeVisible
await waitFor(element(by.id('element')))
  .toBeVisible()
  .withTimeout(5000);
```

### Scenario 3: Redux Toolkit Selectors

**Problem**: Creating memoized selectors for performance

**Solution**:

```typescript
mcp__context7__get -
  library -
  docs({
    context7CompatibleLibraryID: '/reduxjs/redux-toolkit',
    topic: 'createSelector memoization',
  });

// Result: Use Reselect's createSelector
import { createSelector } from '@reduxjs/toolkit';

export const selectFilteredItems = createSelector([selectItems, selectFilter], (items, filter) =>
  items.filter(item => item.type === filter)
);
```

### Scenario 4: Jest Testing Library Queries

**Problem**: Finding best query method for accessibility testing

**Solution**:

```typescript
mcp__context7__get -
  library -
  docs({
    context7CompatibleLibraryID: '/testing-library/react-testing-library',
    topic: 'query priority and accessibility',
  });

// Result: Use getByRole with accessible name
const button = screen.getByRole('button', { name: /submit/i });
```

### Scenario 5: React Navigation Options

**Problem**: Configuring navigation header with custom styling

**Solution**:

```typescript
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/react-navigation/react-navigation",
  topic: "screen options and header configuration"
})

// Result: Apply proper headerStyle options
<Stack.Screen
  name="Settings"
  component={SettingsScreen}
  options={{
    headerStyle: { backgroundColor: '#f4511e' },
    headerTintColor: '#fff',
    headerBackButtonDisplayMode: 'minimal'
  }}
/>
```

### Scenario 6: i18next Configuration

**Problem**: Setting up language detection with fallbacks

**Solution**:

```typescript
mcp__context7__get -
  library -
  docs({
    context7CompatibleLibraryID: '/i18next/i18next',
    topic: 'language detection and fallback',
  });

// Result: Configure detection with proper fallback chain
i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  detection: {
    order: ['localStorage', 'navigator'],
  },
});
```

## WebSearch MCP Examples

### Scenario 1: Latest Performance Best Practices

**Problem**: Want to ensure performance optimizations follow 2025 standards

**Solution**:

```bash
WebSearch({ query: "React Native performance optimization best practices 2025" })
```

**Result**: Learn about new Hermes optimizations, latest React 18 concurrent features, modern lazy loading patterns

### Scenario 2: Breaking Changes in Library Update

**Problem**: Upgrading React Navigation from v6 to v7

**Solution**:

```bash
WebSearch({ query: "React Navigation v7 breaking changes migration guide" })
```

**Result**: Discover API changes, deprecated methods, migration steps

### Scenario 3: Community Solutions for Edge Cases

**Problem**: Detox tests failing on CI but passing locally

**Solution**:

```bash
WebSearch({ query: "Detox E2E tests failing CI GitHub Actions 2025" })
```

**Result**: Find recent GitHub issues, workarounds, CI configuration examples

### Scenario 4: Modern State Management Patterns

**Problem**: Deciding between Redux Toolkit vs Zustand for new feature

**Solution**:

```bash
WebSearch({ query: "Redux Toolkit vs Zustand React Native 2025 comparison" })
```

**Result**: Current community preferences, bundle size comparisons, DX considerations

### Scenario 5: Accessibility Standards

**Problem**: Implementing WCAG 2.2 compliance in React Native

**Solution**:

```bash
WebSearch({ query: "React Native WCAG 2.2 accessibility implementation 2025" })
```

**Result**: Latest accessibility APIs, testing tools, real-world examples

## React Native Guide MCP Examples

### Scenario 1: Analyzing Component for Performance Issues

**Problem**: Component seems slow, need performance analysis

**Solution**:

```typescript
mcp__react -
  native -
  guide__analyze_component({
    code: `
    export const MyListItem = ({ item, onPress }) => {
      return <TouchableOpacity onPress={onPress}>...</TouchableOpacity>
    };
  `,
    type: 'functional',
  });
```

**Result**:

- Missing React.memo - causes unnecessary re-renders
- onPress not memoized - breaks React.memo optimization
- Recommendation: Wrap with React.memo, use useCallback for onPress

### Scenario 2: Generating Comprehensive Tests

**Problem**: Need to write tests for new ErrorBoundary component

**Solution**:

```typescript
mcp__react -
  native -
  guide__generate_component_test({
    component_name: 'ErrorBoundary',
    component_code: `<ErrorBoundary component code>`,
    test_type: 'comprehensive',
    include_accessibility: true,
    include_performance: true,
  });
```

**Result**: Complete test suite with unit tests, accessibility checks, performance tests

### Scenario 3: Architecture Advice for New Feature

**Problem**: Planning offline-first sync feature architecture

**Solution**:

```typescript
mcp__react -
  native -
  guide__architecture_advice({
    project_type: 'complex_app',
    features: ['offline-first', 'sync', 'conflict-resolution'],
  });
```

**Result**: Recommended patterns for offline storage, sync strategies, Redux integration

### Scenario 4: Debugging Navigation Issues

**Problem**: Navigation stack not resetting properly after logout

**Solution**:

```typescript
mcp__react -
  native -
  guide__debug_issue({
    issue_type: 'navigation',
    platform: 'both',
    error_message: 'Cannot reset navigation state',
  });
```

**Result**: Common causes, recommended navigation reset patterns, code examples

### Scenario 5: Test Coverage Analysis

**Problem**: Need to improve test coverage strategically

**Solution**:

```typescript
mcp__react -
  native -
  guide__analyze_test_coverage({
    project_path: '/path/to/project',
    coverage_threshold: 85,
    generate_report: true,
  });
```

**Result**: Identified untested business logic, suggested test priorities, example tests

## Decision Tree

```
Need to implement feature?
├─ Library API involved?
│  └─ YES → Context7 (get docs first)
├─ Performance concern?
│  └─ YES → React Native Guide MCP (analyze)
├─ Need latest trends?
│  └─ YES → WebSearch
└─ Project-specific?
   └─ YES → File reads (no MCP)
```

## Quick Reference Table

| Task                      | Primary MCP                      | Secondary MCP                      |
| ------------------------- | -------------------------------- | ---------------------------------- |
| Add new navigation screen | Context7 (React Navigation)      | -                                  |
| Write E2E tests           | Context7 (Detox)                 | React Native Guide (generate_test) |
| Optimize component        | React Native Guide (analyze)     | Context7 (React docs)              |
| Learn new library API     | Context7                         | -                                  |
| Check breaking changes    | WebSearch                        | Context7                           |
| Debug framework issue     | WebSearch                        | React Native Guide (debug)         |
| Architectural decision    | React Native Guide (advice)      | WebSearch (trends)                 |
| Test coverage gaps        | React Native Guide (coverage)    | -                                  |
| Accessibility compliance  | React Native Guide (analyze)     | WebSearch (WCAG)                   |
| Bundle size optimization  | React Native Guide (performance) | WebSearch (techniques)             |

## Anti-Patterns to Avoid

### ❌ Don't: Use Context7 for project-specific questions

```typescript
// Bad
mcp__context7__get -
  library -
  docs({
    context7CompatibleLibraryID: '/react-navigation/react-navigation',
    topic: 'How does SettingsScreen navigate to LanguageScreen',
  });

// Good - just read the file
Read({ file_path: '/path/to/SettingsScreen.tsx' });
```

### ❌ Don't: Use WebSearch for stable API documentation

```typescript
// Bad
WebSearch({ query: 'React Navigation Stack Navigator API' });

// Good - Context7 has up-to-date docs
mcp__context7__get -
  library -
  docs({
    context7CompatibleLibraryID: '/react-navigation/react-navigation',
  });
```

### ❌ Don't: Skip MCPs when they would help

```typescript
// Bad - guessing at Detox API
await element(by.id('button')).tap(); // Hope this works?

// Good - verify with Context7
mcp__context7__get -
  library -
  docs({
    context7CompatibleLibraryID: '/wix/detox',
    topic: 'element interactions',
  });
// Confirms: tap() is correct, but should add waitFor for reliability
```

## Summary

**Default to Context7** for any library-related questions. It's fast, accurate, and comprehensive.

**Use WebSearch** when you need current trends, recent changes, or community solutions.

**Use React Native Guide** for analyzing existing code, generating tests, or getting architecture advice.

**Always prefer MCPs over guessing** - the token cost is minimal compared to the time saved by accurate information.
