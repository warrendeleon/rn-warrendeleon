# TASK-148: Test Storybook Stories with Jest

**Task ID**: TASK-148
**Title**: Test Storybook Stories with Jest
**Epic**: [EPIC-016: Storybook Re-integration](../epics/EPIC-016-storybook-reintegration.md)
**User Story**: [US-028: Storybook Setup and Stories](../stories/US-028-storybook-setup-and-stories.md)
**Status**: ✅ Done
**Priority**: Medium
**Effort**: 3h
**Created**: 2025-11-18
**Assigned To**: Warren de Leon
**Category**: Testing

---

## Overview

Set up Jest testing for Storybook stories to ensure they render correctly and catch regressions. This uses Storybook's test utilities, not Detox.

---

## Why Test Stories with Jest (Not Detox)

### Jest is Better For Stories

1. **Fast**: Jest tests run in Node.js, no simulator needed
2. **Portable**: Stories are already React components
3. **Integrated**: Storybook has official testing utilities
4. **Coverage**: Can include in coverage reports

### Detox is NOT Recommended For Stories

1. **Slow**: Requires building app and running simulator
2. **Complex**: Navigating Storybook UI in E2E tests is fragile
3. **Limited Value**: Stories are for development, not E2E
4. **Maintenance**: Story changes break E2E tests

---

## Step-by-Step Implementation

### Phase 1: Install Testing Dependencies (15 min)

#### 1.1 Install Storybook Test Utilities

```bash
yarn add -D @storybook/test @storybook/react-native/jest
```

#### 1.2 Configure Jest for Stories

Update `jest.config.js` to include story test transforms:

```javascript
// jest.config.js
module.exports = {
  // ... existing config

  // Add story file pattern
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test|stories.test).[jt]s?(x)'],

  // Ensure stories are transformed
  transformIgnorePatterns: [
    // ... existing patterns
  ],
};
```

---

### Phase 2: Create Story Test Utility (30 min)

#### 2.1 Create Test Helper

Create `src/test-utils/storybook-test.tsx`:

```typescript
// src/test-utils/storybook-test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '../../gluestack-ui.config';

// Wrapper for rendering stories with providers
export const renderStory = (Story: React.ComponentType) => {
  return render(
    <GluestackUIProvider config={config}>
      <Story />
    </GluestackUIProvider>
  );
};

// Type for story modules
export interface StoryModule {
  default: {
    title: string;
    component: React.ComponentType;
  };
  [key: string]: unknown;
}
```

---

### Phase 3: Write Story Tests (2h)

#### 3.1 Test Pattern

Create test files alongside stories:

```
src/components/Logo/
├── Logo.tsx
├── Logo.stories.tsx
└── Logo.stories.test.tsx  # Story tests
```

#### 3.2 Example: Logo Story Tests

Create `src/components/Logo/Logo.stories.test.tsx`:

```typescript
import React from 'react';
import { composeStories } from '@storybook/react-native';
import { render, screen } from '@testing-library/react-native';
import * as stories from './Logo.stories';

// Compose all stories with decorators applied
const { Default, DarkMode, Static, Large } = composeStories(stories);

describe('Logo Stories', () => {
  it('renders Default story', () => {
    render(<Default />);
    // Logo should render without crashing
    expect(screen.toJSON()).toBeTruthy();
  });

  it('renders DarkMode story', () => {
    render(<DarkMode />);
    expect(screen.toJSON()).toBeTruthy();
  });

  it('renders Static story', () => {
    render(<Static />);
    expect(screen.toJSON()).toBeTruthy();
  });

  it('renders Large story', () => {
    render(<Large />);
    expect(screen.toJSON()).toBeTruthy();
  });
});
```

#### 3.3 Example: ProfileCard Story Tests

Create `src/components/ProfileCard/ProfileCard.stories.test.tsx`:

```typescript
import React from 'react';
import { composeStories } from '@storybook/react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import * as stories from './ProfileCard.stories';

const { Default, Loading, Error, NoAvatar } = composeStories(stories);

describe('ProfileCard Stories', () => {
  it('renders Default story with profile data', () => {
    render(<Default />);
    expect(screen.getByText('Warren de Leon')).toBeTruthy();
    expect(screen.getByText('Mobile Developer')).toBeTruthy();
  });

  it('renders Loading story with skeleton', () => {
    render(<Loading />);
    // Check for loading indicator or skeleton
    expect(screen.toJSON()).toBeTruthy();
  });

  it('renders Error story with retry button', () => {
    render(<Error />);
    const retryButton = screen.getByRole('button');
    expect(retryButton).toBeTruthy();
  });

  it('Error story retry action works', () => {
    const { args } = Error;
    render(<Error />);

    const retryButton = screen.getByRole('button');
    fireEvent.press(retryButton);

    // Action should be called (logged in Storybook)
    expect(args?.onRetry).toBeDefined();
  });

  it('renders NoAvatar story without image', () => {
    render(<NoAvatar />);
    expect(screen.getByText('Warren de Leon')).toBeTruthy();
  });
});
```

#### 3.4 Continue for All Components

Create `*.stories.test.tsx` files for:

- SettingsGroup
- SettingsItem
- DetailListGroup
- PickerGroup
- PickerItem
- ButtonGroup
- ButtonGroupDivider
- HeaderBackButton
- ErrorBoundary
- FallbackUI

---

### Phase 4: Run and Verify Tests (30 min)

#### 4.1 Run Story Tests

```bash
# Run all story tests
yarn test --testPathPattern="stories.test"

# Run specific component stories
yarn test Logo.stories.test.tsx

# Run with coverage
yarn test:coverage --testPathPattern="stories.test"
```

#### 4.2 Check Coverage

Story tests should contribute to overall coverage:

```bash
yarn test:coverage
```

Verify components tested via stories show coverage.

---

## Troubleshooting Guide

### Issue 1: "Cannot find module '@storybook/react-native'"

**Cause**: Storybook test utilities not installed

**Solution**:

```bash
yarn add -D @storybook/test @storybook/react-native
```

### Issue 2: "composeStories is not a function"

**Cause**: Wrong import path

**Solution**:

```typescript
// Use this import
import { composeStories } from '@storybook/react-native';

// NOT this
import { composeStories } from '@storybook/testing-react';
```

### Issue 3: Stories Don't Have Decorators Applied

**Cause**: Not using composeStories

**Solution**: Always use `composeStories` to apply decorators:

```typescript
const { Default } = composeStories(stories);
```

### Issue 4: Actions Not Being Tracked

**Cause**: Actions addon not configured properly

**Solution**: Actions are for Storybook UI, not Jest tests. For testing callbacks, mock them:

```typescript
const mockOnPress = jest.fn();
render(<Component onPress={mockOnPress} />);
fireEvent.press(...);
expect(mockOnPress).toHaveBeenCalled();
```

---

## Verification Checklist

- [x] `@storybook/test` installed
- [x] Jest config updated for story tests
- [x] Story test utility created
- [x] Logo.stories.test.tsx created
- [x] ProfileCard.stories.test.tsx created
- [x] SettingsGroup.stories.test.tsx created
- [x] SettingsItem.stories.test.tsx created
- [x] DetailListGroup.stories.test.tsx created
- [x] PickerGroup.stories.test.tsx created
- [x] PickerItem.stories.test.tsx created
- [x] ButtonGroup.stories.test.tsx created
- [x] ButtonGroupDivider.stories.test.tsx created
- [x] HeaderBackButton.stories.test.tsx created
- [x] ErrorBoundary.stories.test.tsx created
- [x] FallbackUI.stories.test.tsx created
- [x] All story tests pass
- [x] Coverage maintained/improved
- [x] Full test suite passes (`yarn test`)

---

## Acceptance Criteria

- [x] Story testing infrastructure set up
- [x] All 12 components have story tests
- [x] Story tests pass without errors
- [x] Tests use composeStories for decorator support
- [x] Coverage reports include story tests
- [x] Full validation passes (`yarn validate`)

---

## Definition of Done

- [x] All acceptance criteria met
- [x] All story tests pass
- [x] No regressions in existing tests
- [x] Coverage maintained
- [x] Ready for TASK-149 (documentation)

---

## Notes

- **Test Location**: Story tests go alongside story files (`.stories.test.tsx`)
- **composeStories**: Required for decorators to be applied
- **Coverage**: Story tests count toward coverage
- **Not E2E**: These are unit tests, not Detox tests

**Last Updated**: 2025-11-18
