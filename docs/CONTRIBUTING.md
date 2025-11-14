# Contributing Guide

This document outlines the guidelines and best practices for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Code Style](#code-style)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Code Review Guidelines](#code-review-guidelines)
- [Common Review Feedback Patterns](#common-review-feedback-patterns)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome constructive feedback
- Focus on what's best for the project
- Show empathy towards other contributors

### Unacceptable Behaviour

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

## Troubleshooting

### Pre-commit Hook Failures

This project uses Git hooks (via Husky) to run quality checks before commits. If your commit fails, follow these steps:

#### ESLint Errors

**Problem:** Commit fails with ESLint errors

**Solution:**

```bash
# Auto-fix ESLint issues
yarn lint:fix

# If issues remain, manually fix them based on error messages
yarn lint

# Retry commit
git commit
```

**Common ESLint Issues:**

| Error                          | Cause                                | Fix                                 |
| ------------------------------ | ------------------------------------ | ----------------------------------- |
| `'var' is not allowed`         | Using `var` instead of `const`/`let` | Replace `var` with `const` or `let` |
| `Missing return type`          | Function without return type         | Add explicit return type            |
| `Unused variable`              | Imported but not used                | Remove import or use the variable   |
| `Unexpected console statement` | `console.log` in production          | Remove or use debug logger          |

#### Prettier Formatting Issues

**Problem:** Commit fails due to formatting

**Solution:**

```bash
# Format all files
yarn format

# Retry commit
git commit
```

**Note:** Prettier runs automatically in the pre-commit hook. If it modifies files, you need to stage them again:

```bash
# Stage formatted files
git add .

# Retry commit
git commit
```

#### TypeScript Type Errors

**Problem:** Commit fails with TypeScript errors

**Solution:**

```bash
# Run type check to see all errors
yarn typecheck

# Fix type errors manually
# Common fixes:
# - Add missing types
# - Fix type mismatches
# - Add type assertions (use sparingly)

# Retry commit
git commit
```

**Common TypeScript Issues:**

| Error                                     | Cause                       | Fix                                |
| ----------------------------------------- | --------------------------- | ---------------------------------- |
| `Type 'any' is not allowed`               | Using `any` type            | Use specific type or `unknown`     |
| `Property does not exist on type`         | Accessing non-existent prop | Check spelling or add to interface |
| `Argument is not assignable to parameter` | Type mismatch               | Fix type or add type conversion    |
| `Cannot find module`                      | Missing types package       | Install `@types/*` package         |

#### Test Failures

**Problem:** Commit fails because tests are failing

**Solution:**

```bash
# Run tests to identify failures
yarn test

# Fix failing tests
# Common causes:
# - Code changes broke tests
# - Missing test updates
# - Snapshot mismatches

# Update snapshots if needed
yarn test -u

# Retry commit
git commit
```

#### Coverage Below Threshold

**Problem:** Commit fails due to insufficient test coverage

**Solution:**

```bash
# Check coverage report
yarn test:coverage

# Identify uncovered code in output
# Add tests for uncovered lines/branches

# Retry commit
git commit
```

**Coverage Requirements:**

- Minimum: 85% for statements, branches, functions, and lines
- Target: 100% for Redux logic (actions, reducers, selectors)

#### Gitmoji Format Issues

**Problem:** Commit fails due to incorrect commit message format

**Solution:**

```bash
# Ensure commit message follows format:
# <emoji> <type>(<scope>): <subject>

# Good examples:
git commit -m "✨ feat(home): add user profile button"
git commit -m "🐛 fix(settings): correct language persistence"
git commit -m "📝 docs(readme): update setup instructions"

# Bad examples (will fail):
git commit -m "feat(home): add user profile button"  # Missing emoji
git commit -m "✨ Add button"  # Missing type and scope
git commit -m "✨ feat: add button"  # Missing scope
```

#### Bypassing Hooks (Not Recommended)

**Problem:** Need to commit urgently without running hooks

**Solution:**

```bash
# Use --no-verify flag (use sparingly!)
git commit --no-verify -m "✨ feat(home): urgent fix"

# WARNING: Only use in emergencies. The commit MUST pass all checks
# before being merged. CI will run the same checks anyway.
```

**When to bypass hooks:**

- Emergency hotfix (but still fix issues before PR)
- Hook configuration issues (then fix the hook)
- Never bypass for convenience

### Dependency Installation Issues

#### Yarn Install Fails

**Problem:** `yarn install` fails with errors

**Solution:**

```bash
# Clear Yarn cache
yarn cache clean

# Remove node_modules
rm -rf node_modules

# Reinstall
yarn install

# If still failing, check Node.js version
node --version  # Should be v22.x
nvm use  # Use version from .nvmrc
```

#### iOS Pod Install Fails

**Problem:** `pod install` fails

**Solution:**

```bash
cd ios

# Clear CocoaPods cache
rm -rf Pods Podfile.lock
pod deintegrate
pod cache clean --all

# Reinstall
pod install

cd ..
```

### Build Issues

#### Clean Build Required

**Problem:** Build fails with cached state issues

**Solution:**

```bash
# Clean everything
yarn clean

# Or clean selectively:
yarn clean:ios      # iOS only
yarn clean:android  # Android only
yarn clean:node     # node_modules only

# Reinstall and rebuild
yarn install
cd ios && pod install && cd ..
yarn ios  # or yarn android
```

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

**📖 For a comprehensive guide with examples and best practices, see [Git Commit Guide](GIT_COMMIT_GUIDE.md).**

### Gitmoji Convention

We use [Gitmoji](https://gitmoji.dev/) for commit messages:

```
<emoji> <type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Common Emojis (Quick Reference)

This table shows frequently used gitmojis. For the complete list, visit [gitmoji.dev](https://gitmoji.dev).

| Emoji | Code                      | Type     | Description             |
| ----- | ------------------------- | -------- | ----------------------- |
| ✨    | `:sparkles:`              | feat     | New feature             |
| 🐛    | `:bug:`                   | fix      | Bug fix                 |
| 🚑    | `:ambulance:`             | hotfix   | Critical hotfix         |
| ♻️    | `:recycle:`               | refactor | Code refactoring        |
| 📝    | `:memo:`                  | docs     | Documentation           |
| ✅    | `:white_check_mark:`      | test     | Tests                   |
| 🎨    | `:art:`                   | style    | Code style/formatting   |
| ⚡️   | `:zap:`                   | perf     | Performance improvement |
| 🏗️    | `:building_construction:` | arch     | Architecture change     |
| 🔧    | `:wrench:`                | chore    | Configuration/tooling   |
| 🌐    | `:globe_with_meridians:`  | i18n     | Internationalization    |
| ♿    | `:wheelchair:`            | a11y     | Accessibility           |
| 🔒    | `:lock:`                  | security | Security fix            |
| 💄    | `:lipstick:`              | ui       | UI/styling              |
| 💥    | `:boom:`                  | breaking | Breaking changes        |

### Examples

**Feature with Multiple Changes:**

```
✨ feat(home): add user profile button

- Added ButtonWithChevron component under Home feature
- Integrated with React Navigation for profile navigation
- Added comprehensive unit tests achieving 100% coverage
- Created Storybook story with multiple variants
- Added i18n support for button label

Technical details:
- Uses GlueStack UI Button with custom chevron icon
- Follows feature-first architecture pattern
- Added testID for E2E testing support
```

**Bug Fix with Root Cause:**

```
🐛 fix(settings): correct language persistence on app restart

Fixed issue where selected language reverted to English after
app restart despite being saved to Redux state.

Root cause: Language slice was not included in Redux persist
whitelist configuration in store/index.ts.

Solution: Added 'settings' to persistConfig whitelist to ensure
language preference persists across app sessions.

Tested on both iOS and Android with multiple language switches.
```

**Refactor with Performance Impact:**

```
♻️ refactor(components): extract shared button utilities

Extracted button helper functions to reduce code duplication
and improve maintainability.

Changes:
- Created src/shared/utils/buttonUtils.ts
- Extracted getButtonVariant, getButtonGroupVariant
- Updated ButtonWithChevron to use shared utilities
- Updated SettingsButton to use shared utilities

Impact:
- Reduced code duplication by 50% (120 lines → 60 lines)
- Improved reusability for future button components
- Added unit tests for utility functions (100% coverage)
```

**Documentation with Context:**

```
📝 docs(testing): add comprehensive E2E testing guide

Added detailed guide covering Detox, Cucumber, and MSW integration.

Contents:
- Step-by-step setup instructions
- Page Object Pattern examples
- Gherkin scenario best practices
- MSW API mocking patterns
- Comprehensive troubleshooting section

Also added Mermaid diagrams to visualise:
- Test execution flow
- MSW request interception flow
- Test file organisation structure
```

**Tests with Coverage Details:**

```
✅ test(home): achieve 100% coverage for HomeScreen

Added comprehensive test suite covering all user interactions
and edge cases.

Tests added:
- User presses profile button → navigates correctly
- Renders correctly with all children
- Displays translated title correctly
- Handles navigation failure gracefully
- Works with different screen sizes

Coverage: Increased from 65% to 100% (statements, branches, functions, lines)
```

**Performance Improvement:**

```
⚡️ perf(home): optimise user list rendering

Improved performance for screens with large user lists.

Changes:
- Wrapped UserCard in React.memo to prevent unnecessary re-renders
- Used useMemo for expensive filter operations
- Implemented FlatList with proper key extraction
- Added getItemLayout for FlatList optimisation

Results:
- Reduced re-renders by 70% during scroll
- Improved FPS from 45 to 60 during rapid scrolling
- Reduced memory usage by 30% for 1000+ item lists

Tested with React DevTools Profiler on both platforms.
```

**Breaking Change:**

```
💥 feat(auth)!: migrate to new authentication API

BREAKING CHANGE: Migrated from v1 to v2 authentication API.

Migration required:
- Update API_BASE_URL in .env files
- Authentication tokens now use JWT format
- Login response structure changed

New structure:
{
  "token": "jwt_token_here",
  "user": { "id": "...", "email": "..." }
}

Old structure (no longer supported):
{
  "auth_key": "...",
  "user_data": { ... }
}

See MIGRATION.md for detailed upgrade instructions.
```

**Multiple Types:**

```
🔧 chore(deps): upgrade React Native to 0.73

Upgraded React Native and related dependencies to latest stable version.

Changes:
- Upgraded react-native from 0.72.1 to 0.73.0
- Upgraded react from 18.2.0 to 18.3.0
- Updated @react-navigation packages to compatible versions
- Regenerated iOS Podfile.lock
- Updated Android Gradle configuration

Testing:
- ✅ All unit tests passing
- ✅ All E2E tests passing
- ✅ iOS build successful (tested on iPhone 15 Pro simulator)
- ✅ Android build successful (tested on Pixel 7 emulator)
- ✅ No runtime errors or warnings

Breaking changes: None (backward compatible)
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

#### Pre-PR Checklist

Run through this comprehensive checklist before creating your PR:

**Code Quality:**

- ✅ All tests pass locally (`yarn test`)
- ✅ Test coverage meets requirements (85% minimum, 100% for Redux)
- ✅ Code is linted with no errors (`yarn lint`)
- ✅ TypeScript type check passes (`yarn typecheck`)
- ✅ No `console.log` statements in production code
- ✅ No commented-out code (remove or explain why it's there)
- ✅ No `TODO` comments without issue references
- ✅ No hardcoded values that should be constants or config

**Testing:**

- ✅ Added unit tests for new functions/components
- ✅ Added integration tests for new features
- ✅ Added E2E tests for critical user flows (if applicable)
- ✅ Tested all edge cases and error scenarios
- ✅ Tested on both iOS and Android (if UI changes)
- ✅ Tested with different screen sizes/orientations (if UI changes)
- ✅ All existing tests still pass

**Documentation:**

- ✅ Updated relevant documentation files
- ✅ Added JSDoc comments for public APIs
- ✅ Updated README if setup process changed
- ✅ Added comments for complex logic
- ✅ Updated type definitions if APIs changed

**Code Review Readiness:**

- ✅ Self-reviewed the code (read through your own changes)
- ✅ Verified no unintended changes included
- ✅ Removed debug code and temporary changes
- ✅ Checked for typos in code and comments
- ✅ Ensured commit messages follow gitmoji convention
- ✅ Branch is up to date with `main`

**Performance & Security:**

- ✅ No performance regressions introduced
- ✅ No memory leaks (checked with profiler if applicable)
- ✅ No security vulnerabilities (no exposed secrets, proper validation)
- ✅ Images optimised (if adding new images)
- ✅ Dependencies justified (if adding new dependencies)

```bash
# Validate everything
yarn validate

# Run full test suite with coverage
yarn test:coverage

# Update branch with main
git checkout main
git pull
git checkout your-branch
git rebase main

# Verify app runs on both platforms
yarn ios
yarn android
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
// Component behaviour
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

1. **Test Behaviour, Not Implementation**
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

## Common Review Feedback Patterns

Understanding common review feedback helps you write better code proactively. Here are patterns reviewers frequently comment on:

### Performance Issues

#### Unnecessary Re-renders

**Feedback:** "This component re-renders unnecessarily. Consider using `React.memo` or `useMemo`."

**Problem:**

```typescript
// Component re-renders every time parent re-renders
export const UserCard = ({ user }: { user: User }) => {
  return <Text>{user.name}</Text>;
};

// Or expensive computation runs on every render
const filteredItems = items.filter(item => item.active); // Runs every render
```

**Solution:**

```typescript
// Use React.memo to prevent unnecessary re-renders
export const UserCard = React.memo(({ user }: { user: User }) => {
  return <Text>{user.name}</Text>;
});

// Use useMemo for expensive computations
const filteredItems = useMemo(() => items.filter(item => item.active), [items]);
```

#### Inefficient Selectors

**Feedback:** "This selector creates a new object reference on every call. Use `createSelector` from reselect."

**Problem:**

```typescript
// Creates new array on every call
const selectActiveUsers = (state: RootState) => state.users.filter(u => u.active);
```

**Solution:**

```typescript
// Memoised selector
const selectActiveUsers = createSelector([selectUsers], users => users.filter(u => u.active));
```

### Type Safety Issues

#### Using `any` Type

**Feedback:** "Avoid using `any`. Use a specific type or `unknown` if the type is truly unknown."

**Problem:**

```typescript
const handleData = (data: any) => {
  // Unsafe - no type checking
  console.log(data.name);
};
```

**Solution:**

```typescript
// Use specific interface
interface UserData {
  name: string;
  email: string;
}

const handleData = (data: UserData) => {
  console.log(data.name); // Type-safe
};

// Or use unknown for truly unknown types
const handleData = (data: unknown) => {
  if (typeof data === 'object' && data !== null && 'name' in data) {
    console.log((data as { name: string }).name);
  }
};
```

#### Missing Return Type

**Feedback:** "Add explicit return type for better type safety."

**Problem:**

```typescript
const calculateTotal = (items: Item[]) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};
```

**Solution:**

```typescript
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};
```

### Testing Issues

#### Testing Implementation Instead of Behaviour

**Feedback:** "This test is too implementation-focused. Test user behaviour instead."

**Problem:**

```typescript
// Testing implementation details
it('calls useState with 0', () => {
  const spy = jest.spyOn(React, 'useState');
  render(<Counter />);
  expect(spy).toHaveBeenCalledWith(0);
});
```

**Solution:**

```typescript
// Testing user behaviour
it('displays initial count of 0', () => {
  const { getByText } = render(<Counter />);
  expect(getByText('Count: 0')).toBeTruthy();
});

it('increments count when button is pressed', () => {
  const { getByText, getByTestId } = render(<Counter />);
  fireEvent.press(getByTestId('increment-button'));
  expect(getByText('Count: 1')).toBeTruthy();
});
```

#### Insufficient Test Coverage

**Feedback:** "Please add tests for edge cases and error scenarios."

**Problem:**

```typescript
// Only testing happy path
it('fetches user successfully', async () => {
  const user = await fetchUser('123');
  expect(user.id).toBe('123');
});
```

**Solution:**

```typescript
// Testing happy path
it('fetches user successfully', async () => {
  mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockUser });
  const user = await fetchUser('123');
  expect(user.id).toBe('123');
});

// Testing error cases
it('throws error when user not found', async () => {
  mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
  await expect(fetchUser('999')).rejects.toThrow('User not found');
});

it('throws error when network fails', async () => {
  mockFetch.mockRejectedValueOnce(new Error('Network error'));
  await expect(fetchUser('123')).rejects.toThrow('Network error');
});

// Testing edge cases
it('handles empty user ID', async () => {
  await expect(fetchUser('')).rejects.toThrow('Invalid user ID');
});
```

### Code Organisation Issues

#### Component Too Large

**Feedback:** "This component is doing too much. Consider extracting logic into hooks or splitting into smaller components."

**Problem:**

```typescript
// 300+ line component with multiple responsibilities
export const UserProfile = () => {
  // Fetch user data
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    /* fetch logic */
  }, []);

  // Handle form
  const [formData, setFormData] = useState({});
  const handleSubmit = () => {
    /* submit logic */
  };

  // Handle avatar upload
  const handleAvatarUpload = () => {
    /* upload logic */
  };

  return <View>{/* complex JSX */}</View>;
};
```

**Solution:**

```typescript
// Extract data fetching to custom hook
const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    /* fetch logic */
  }, [userId]);
  return user;
};

// Extract form logic to custom hook
const useProfileForm = (user: User) => {
  const [formData, setFormData] = useState({});
  const handleSubmit = () => {
    /* submit logic */
  };
  return { formData, setFormData, handleSubmit };
};

// Split into smaller components
const AvatarUpload = ({ onUpload }: { onUpload: (file: File) => void }) => {
  /* avatar upload UI */
};

// Main component is now much simpler
export const UserProfile = ({ userId }: { userId: string }) => {
  const user = useUserData(userId);
  const { formData, setFormData, handleSubmit } = useProfileForm(user);

  return (
    <View>
      <AvatarUpload onUpload={handleAvatarUpload} />
      {/* simplified JSX */}
    </View>
  );
};
```

#### Missing Abstraction

**Feedback:** "This logic is duplicated in multiple places. Extract to a shared utility."

**Problem:**

```typescript
// Duplicated in multiple components
const formatDate = (date: Date) => {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};
```

**Solution:**

```typescript
// Create shared utility
// src/shared/utils/dateUtils.ts
export const formatDate = (date: Date): string => {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

// Import and use
import { formatDate } from '@app/shared/utils/dateUtils';
```

### Redux/State Management Issues

#### Mutating State Directly

**Feedback:** "Don't mutate state directly. Redux Toolkit uses Immer, but be careful with nested objects."

**Problem:**

```typescript
// Direct mutation (bad even though Immer handles it in reducers)
reducers: {
  updateUser: (state, action) => {
    state.user.name = action.payload.name; // Works but misleading
    state.user.settings = action.payload.settings; // Might not update reference
  };
}
```

**Solution:**

```typescript
// Clear immutable update pattern
reducers: {
  updateUser: (state, action) => {
    state.user = {
      ...state.user,
      name: action.payload.name,
      settings: { ...state.user.settings, ...action.payload.settings },
    };
  };
}

// Or let Immer handle it with clear intent
reducers: {
  updateUser: (state, action) => {
    Object.assign(state.user, action.payload);
  };
}
```

#### Not Using Selectors

**Feedback:** "Access state through selectors instead of directly in components."

**Problem:**

```typescript
// Accessing state directly
const user = useAppSelector(state => state.user.data);
const isLoading = useAppSelector(state => state.user.loading);
```

**Solution:**

```typescript
// Create selectors
// store/selectors.ts
export const selectUser = (state: RootState) => state.user.data;
export const selectUserLoading = (state: RootState) => state.user.loading;

// Use selectors
const user = useAppSelector(selectUser);
const isLoading = useAppSelector(selectUserLoading);
```

### Internationalisation Issues

#### Hardcoded Strings

**Feedback:** "Don't hardcode user-facing strings. Use i18n translations."

**Problem:**

```typescript
<Button>Submit</Button>
<Text>Welcome to the app!</Text>
```

**Solution:**

```typescript
// Add to translations
// locales/en.json
{
  "common": {
    "submit": "Submit",
    "welcome": "Welcome to the app!"
  }
}

// Use in component
const { t } = useTranslation();

<Button>{t('common.submit')}</Button>
<Text>{t('common.welcome')}</Text>
```

### Accessibility Issues

#### Missing testID

**Feedback:** "Add testID to interactive elements for E2E testing."

**Problem:**

```typescript
<Button onPress={handleSubmit}>Submit</Button>
<TextInput onChangeText={setText} />
```

**Solution:**

```typescript
<Button testID="submit-button" onPress={handleSubmit}>
  Submit
</Button>
<TextInput testID="email-input" onChangeText={setText} />
```

### Security Issues

#### Exposed Secrets

**Feedback:** "Don't commit secrets or API keys. Use environment variables."

**Problem:**

```typescript
const API_KEY = 'sk_live_abc123xyz';
fetch(`https://api.example.com?key=${API_KEY}`);
```

**Solution:**

```typescript
// .env.development
API_KEY = sk_test_abc123xyz;

// .env.production (not committed)
API_KEY = sk_live_abc123xyz;

// In code
import Config from 'react-native-config';
fetch(`https://api.example.com?key=${Config.API_KEY}`);
```

#### Missing Input Validation

**Feedback:** "Validate user input before processing."

**Problem:**

```typescript
const handleEmail = (email: string) => {
  sendEmail(email); // No validation
};
```

**Solution:**

```typescript
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleEmail = (email: string) => {
  if (!email.trim()) {
    throw new Error('Email is required');
  }
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }
  sendEmail(email);
};
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
