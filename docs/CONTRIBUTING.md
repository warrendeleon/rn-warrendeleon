# Contributing Guide

This document outlines the guidelines and best practices for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Code Review Guidelines](#code-review-guidelines)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome constructive feedback
- Focus on what's best for the project
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment or discriminatory language
- Personal attacks
- Publishing others' private information
- Other conduct inappropriate in a professional setting

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Development Environment** set up (see [Development Guide](./DEVELOPMENT.md))
2. **Understanding of Architecture** (see [Architecture](./ARCHITECTURE.md))
3. **Familiarity with Tech Stack**:
   - React Native 0.82.1
   - TypeScript
   - Redux Toolkit
   - i18next
   - GlueStack UI + NativeWind
   - Jest + React Native Testing Library

### First-Time Contributors

If you're new to the project:

1. **Read Documentation**: Start with [README.md](../README.md), [ARCHITECTURE.md](./ARCHITECTURE.md), and [DEVELOPMENT.md](./DEVELOPMENT.md)
2. **Setup Project**: Follow setup instructions in [Development Guide](./DEVELOPMENT.md)
3. **Run Tests**: Verify everything works with `yarn test`
4. **Look for Issues**: Check issues labeled `good-first-issue` or `help-wanted`

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Feature branch
git checkout -b feat/feature-name

# Bug fix branch
git checkout -b fix/bug-description

# Refactor branch
git checkout -b refactor/what-youre-refactoring

# Documentation branch
git checkout -b docs/what-youre-documenting
```

**Branch Naming Convention:**

- `feat/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation changes
- `test/` - Test additions/changes
- `chore/` - Build process, dependencies, etc.

### 2. Make Changes

Follow these guidelines:

- **Write Clean Code**: Follow [Code Style](#code-style) guidelines
- **Write Tests**: All new code must have tests (see [Testing Requirements](#testing-requirements))
- **Update Documentation**: Document new features or API changes
- **Keep Commits Small**: Make atomic, focused commits

### 3. Test Your Changes

Before committing, ensure:

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Type check
yarn typecheck

# Lint
yarn lint

# Run all checks
yarn validate
```

### 4. Commit Changes

Follow [Commit Message Format](#commit-message-format):

```bash
git add .
git commit -m "✨ feat(home): add user profile button"
```

### 5. Push and Create PR

```bash
git push -u origin feat/feature-name
```

Then create a Pull Request following [PR Process](#pull-request-process).

## Code Style

### TypeScript

**Always use TypeScript, never JavaScript:**

```typescript
// Good
export const HomeScreen = (): JSX.Element => {
  return <View />;
};

// Bad
export const HomeScreen = () => {
  return <View />;
};
```

**Type all parameters and return values:**

```typescript
// Good
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// Bad
const calculateTotal = items => {
  return items.reduce((sum, item) => sum + item.price, 0);
};
```

**Use interfaces for object types:**

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

// Avoid (use interface instead)
type User = {
  id: string;
  name: string;
  email: string;
};
```

**Use type for unions and primitives:**

```typescript
// Good
type Theme = 'light' | 'dark' | 'system';
type Status = 'idle' | 'loading' | 'success' | 'error';
```

### Components

**Use functional components with hooks:**

```typescript
// Good
export const HomeScreen = () => {
  const [count, setCount] = useState(0);

  return <View>{/* ... */}</View>;
};

// Bad (class components)
export class HomeScreen extends React.Component {
  state = { count: 0 };
  render() {
    return <View>{/* ... */}</View>;
  }
}
```

**Extract complex JSX into components:**

```typescript
// Good
const UserCard = ({ user }: { user: User }) => (
  <View>
    <Text>{user.name}</Text>
    <Text>{user.email}</Text>
  </View>
);

export const UserList = ({ users }: { users: User[] }) => (
  <View>
    {users.map(user => (
      <UserCard key={user.id} user={user} />
    ))}
  </View>
);

// Bad
export const UserList = ({ users }: { users: User[] }) => (
  <View>
    {users.map(user => (
      <View key={user.id}>
        <Text>{user.name}</Text>
        <Text>{user.email}</Text>
      </View>
    ))}
  </View>
);
```

**Always add testID for E2E testing:**

```typescript
// Good
<Button testID="submit-button" onPress={handleSubmit}>
  Submit
</Button>

// Bad
<Button onPress={handleSubmit}>Submit</Button>
```

### Naming Conventions

**Components**: PascalCase

```typescript
export const HomeScreen = () => {
  /* ... */
};
export const ButtonWithChevron = () => {
  /* ... */
};
```

**Functions/Variables**: camelCase

```typescript
const handlePress = () => {
  /* ... */
};
const isLoading = true;
```

**Constants**: UPPER_SNAKE_CASE

```typescript
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
```

**Types/Interfaces**: PascalCase

```typescript
interface User {
  /* ... */
}
type Theme = 'light' | 'dark';
```

**Files**: Match export name

```typescript
// HomeScreen.tsx
export const HomeScreen = () => {
  /* ... */
};

// buttonUtils.ts
export const getButtonVariant = () => {
  /* ... */
};
```

### Imports

**Order imports:**

1. React/React Native
2. Third-party libraries
3. App imports (using `@app/` alias)
4. Relative imports
5. Types

```typescript
// 1. React/React Native
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

// 2. Third-party
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

// 3. App imports
import { Button } from '@app/components';
import { useAppSelector, useAppDispatch } from '@app/store/hooks';
import { selectTheme } from '@app/features/Settings/store/selectors';

// 4. Relative imports
import { Header } from './components/Header';
import { useHomeData } from './hooks/useHomeData';

// 5. Types
import type { NavigationProp } from '@react-navigation/native';
import type { Theme } from '@app/features/Settings/store/reducer';
```

**Use ESLint plugin for auto-sorting:**

```bash
yarn lint:fix
```

### Formatting

**Use Prettier (configured):**

```bash
yarn format
```

**Key settings:**

- **Indent**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Always
- **Trailing commas**: es5
- **Line width**: 100

## Commit Message Format

### Gitmoji Convention

We use [Gitmoji](https://gitmoji.dev/) for commit messages:

```
<emoji> <type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Common Emojis

| Emoji | Code                      | Type     | Description             |
| ----- | ------------------------- | -------- | ----------------------- |
| ✨    | `:sparkles:`              | feat     | New feature             |
| 🐛    | `:bug:`                   | fix      | Bug fix                 |
| ♻️    | `:recycle:`               | refactor | Code refactoring        |
| 📝    | `:memo:`                  | docs     | Documentation           |
| ✅    | `:white_check_mark:`      | test     | Tests                   |
| 🎨    | `:art:`                   | style    | Code style/formatting   |
| ⚡️   | `:zap:`                   | perf     | Performance improvement |
| 🏗️    | `:building_construction:` | arch     | Architecture change     |
| 🔧    | `:wrench:`                | chore    | Configuration/tooling   |
| 🌐    | `:globe_with_meridians:`  | i18n     | Internationalization    |

### Examples

**Feature:**

```
✨ feat(home): add user profile button

- Added ButtonWithChevron component
- Integrated with navigation
- Added tests and Storybook story
```

**Bug Fix:**

```
🐛 fix(settings): correct language persistence

Fixed issue where selected language wasn't persisted
after app restart due to missing Redux persist config.
```

**Refactor:**

```
♻️ refactor(components): extract shared button utilities

- Created shared/utils.ts for button helpers
- Updated ButtonWithChevron to use shared utilities
- Reduced code duplication by 50%
```

**Documentation:**

```
📝 docs(testing): add E2E testing guide

Added comprehensive guide for Detox + Cucumber + MSW
including setup, examples, and troubleshooting.
```

**Tests:**

```
✅ test(home): achieve 100% coverage for HomeScreen

- Added tests for all user interactions
- Added tests for navigation
- Added edge case tests
```

### Scope

The scope should be the feature or area affected:

- `home` - Home feature
- `settings` - Settings feature
- `components` - Shared components
- `store` - Redux store
- `i18n` - Internationalization
- `navigation` - Navigation
- `build` - Build configuration
- `deps` - Dependencies

### Subject

- Use imperative mood: "add" not "added" or "adds"
- Don't capitalize first letter
- No period at the end
- Keep under 72 characters

**Good:**

```
✨ feat(home): add user profile button
🐛 fix(settings): correct language persistence
```

**Bad:**

```
✨ feat(home): Added user profile button.
🐛 fix(settings): Fixes the language persistence issue
```

## Pull Request Process

### 1. Before Creating PR

Ensure:

- ✅ All tests pass (`yarn test`)
- ✅ Code is linted (`yarn lint`)
- ✅ Types are valid (`yarn typecheck`)
- ✅ Coverage meets requirements (85% minimum)
- ✅ Documentation is updated
- ✅ Branch is up to date with `main`

```bash
# Validate everything
yarn validate

# Update branch
git checkout main
git pull
git checkout your-branch
git rebase main
```

### 2. Create PR

**Title Format:**

```
<emoji> <type>(<scope>): <description>
```

**Example:**

```
✨ feat(home): add user profile button
```

**Description Template:**

```markdown
## Summary

Brief description of changes (1-3 bullet points)

- Added user profile button to home screen
- Integrated with navigation stack
- Added comprehensive test coverage

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [x] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

Describe how you tested your changes:

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing performed

**Test Coverage:** 95%

## Screenshots (if applicable)

[Add screenshots or videos demonstrating the changes]

## Checklist

- [x] Code follows project style guidelines
- [x] Self-review completed
- [x] Comments added for complex code
- [x] Documentation updated
- [x] No new warnings generated
- [x] Tests added and passing
- [x] Coverage requirements met (85%+)

## Related Issues

Closes #123
Relates to #456
```

### 3. PR Review Process

**Reviewers will check:**

1. **Code Quality**
   - Follows style guidelines
   - Readable and maintainable
   - Proper error handling
   - No code smells

2. **Tests**
   - Adequate coverage (85%+ minimum)
   - Tests are meaningful
   - Edge cases covered
   - No flaky tests

3. **Performance**
   - No unnecessary re-renders
   - Optimized data structures
   - No memory leaks
   - Lazy loading where appropriate

4. **Security**
   - No sensitive data in code
   - Proper input validation
   - No security vulnerabilities

5. **Documentation**
   - Code is self-documenting
   - Complex logic explained
   - Public APIs documented
   - README/docs updated

### 4. Addressing Feedback

**When changes are requested:**

1. **Respond to Comments**: Acknowledge feedback
2. **Make Changes**: Address all review comments
3. **Push Updates**: Push changes to same branch
4. **Request Re-review**: After all changes made

**Example Response:**

```markdown
> Consider extracting this into a separate component

Good catch! Extracted into `UserProfileCard` component. See commit abc123.
```

### 5. Merging

**Requirements for merge:**

- ✅ At least 1 approval
- ✅ All checks passing (tests, lint, typecheck)
- ✅ No merge conflicts
- ✅ Up to date with `main`

**Merge Strategy:**

- Use **Squash and Merge** for feature branches
- Use **Rebase and Merge** for small fixes
- Never use **Merge Commit** (keeps history clean)

## Testing Requirements

### Coverage Requirements

**Minimum Coverage: 85%** for all metrics:

- Statements: 85%
- Branches: 85%
- Functions: 85%
- Lines: 85%

**100% Coverage Required for:**

- Redux actions
- Redux reducers
- Redux selectors
- Utility functions
- Custom hooks

### Test Types

**Unit Tests (required):**

```typescript
// Component behavior
describe('ButtonWithChevron', () => {
  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithProviders(
      <ButtonWithChevron testID="button" onPress={onPress} />
    );

    fireEvent.press(getByTestId('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

**Integration Tests (required for features):**

```typescript
// Multiple components working together
describe('Settings Flow', () => {
  it('changes language and persists', async () => {
    const { getByText, store } = renderWithProviders(<SettingsScreen />);

    fireEvent.press(getByText('Language'));
    fireEvent.press(getByText('Spanish'));

    await waitFor(() => {
      expect(store.getState().settings.language).toBe('es');
    });
  });
});
```

**E2E Tests (required for critical flows):**

```gherkin
Feature: User Authentication
  @critical
  Scenario: User logs in successfully
    Given I am on the login screen
    When I enter valid credentials
    And I tap the login button
    Then I should be on the home screen
```

### Test Guidelines

1. **Test Behavior, Not Implementation**
2. **Use Descriptive Test Names**
3. **Follow AAA Pattern** (Arrange, Act, Assert)
4. **Keep Tests Independent**
5. **Mock External Dependencies**
6. **Test Edge Cases**

See [Testing Guide](./TESTING.md) for details.

## Documentation

### Code Comments

**When to add comments:**

- Complex algorithms
- Non-obvious business logic
- Workarounds for bugs
- TODOs with context

**Don't comment:**

- Obvious code
- Bad code (refactor instead)
- Outdated information

**Good Comments:**

```typescript
// Calculate discount based on tier system introduced in PROJ-123
// Bronze: 5%, Silver: 10%, Gold: 15%
const calculateDiscount = (tier: Tier, amount: number): number => {
  // ...
};

// TODO: Replace with API call when backend is ready (PROJ-456)
const mockUserData = {
  /* ... */
};
```

**Bad Comments:**

```typescript
// Set the theme to dark
setTheme('dark');

// This is a button
<Button />
```

### JSDoc for Public APIs

````typescript
/**
 * Calculates button variant based on position in group
 *
 * @param index - Current button index (0-based)
 * @param totalCount - Total number of buttons in group
 * @returns Variant name ('single' | 'top' | 'middle' | 'bottom')
 *
 * @example
 * ```typescript
 * getButtonGroupVariant(0, 3) // Returns 'top'
 * getButtonGroupVariant(1, 3) // Returns 'middle'
 * getButtonGroupVariant(2, 3) // Returns 'bottom'
 * ```
 */
export const getButtonGroupVariant = (index: number, totalCount: number): GroupVariant => {
  // ...
};
````

### README Updates

Update README.md when:

- Adding new features
- Changing setup process
- Updating dependencies
- Changing scripts

### Documentation Files

Update relevant docs when:

- Changing architecture
- Adding new patterns
- Updating workflows
- Changing best practices

## Code Review Guidelines

### As a Reviewer

**Do:**

- ✅ Be respectful and constructive
- ✅ Ask questions instead of making demands
- ✅ Suggest alternatives
- ✅ Praise good solutions
- ✅ Focus on high-impact issues

**Don't:**

- ❌ Be condescending
- ❌ Nitpick minor style issues (let linters handle it)
- ❌ Block on personal preferences
- ❌ Make it personal

**Comment Examples:**

**Good:**

```markdown
> Consider using useMemo here to avoid recalculating on every render.
> What do you think?

> Nice work extracting this into a reusable hook!

> Could you add a test for the error case? This would help prevent regressions.
```

**Bad:**

```markdown
> This is wrong. Use useMemo.

> Why didn't you test this?

> This code is terrible.
```

### As a Contributor

**Do:**

- ✅ Respond to all comments
- ✅ Ask for clarification if needed
- ✅ Be open to suggestions
- ✅ Explain your reasoning
- ✅ Thank reviewers

**Don't:**

- ❌ Take feedback personally
- ❌ Ignore comments
- ❌ Be defensive
- ❌ Rush to merge

**Response Examples:**

**Good:**

```markdown
> Consider using useMemo here

Good point! Changed in commit abc123. Thanks for catching this!

> Could you add a test for the error case?

Absolutely. Added test in commit def456.

> Why did you choose this approach?

Great question! I went with this approach because... However, I'm open to
alternatives if you think there's a better way.
```

## Questions?

If you have questions:

1. Check existing documentation
2. Search closed issues/PRs
3. Ask in issue comments
4. Create a discussion thread

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Next Steps

- Read [Architecture](./ARCHITECTURE.md) to understand project structure
- See [Development](./DEVELOPMENT.md) to set up your environment
- Check [Testing](./TESTING.md) for testing guidelines
- Review [State Management](./STATE_MANAGEMENT.md) for Redux patterns
- Learn [I18n](./I18N.md) for internationalization
