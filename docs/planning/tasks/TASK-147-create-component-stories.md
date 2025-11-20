# TASK-147: Create Stories for All Components

**Task ID**: TASK-147
**Title**: Create Stories for All Components
**Epic**: [EPIC-016: Storybook Re-integration](../epics/EPIC-016-storybook-reintegration.md)
**User Story**: [US-028: Storybook Setup and Stories](../stories/US-028-storybook-setup-and-stories.md)
**Status**: ✅ Done
**Priority**: High
**Effort**: 6h
**Created**: 2025-11-18
**Assigned To**: Warren de Leon
**Category**: Component Development

---

## Overview

Create comprehensive Storybook stories for all 12 shared components in the project. Each story should demonstrate all props, variants, and accessibility features.

---

## Components to Cover

| #   | Component          | Location                             | Priority | Complexity |
| --- | ------------------ | ------------------------------------ | -------- | ---------- |
| 1   | Logo               | `src/components/Logo/`               | High     | Medium     |
| 2   | ProfileCard        | `src/components/ProfileCard/`        | High     | High       |
| 3   | SettingsGroup      | `src/components/SettingsGroup/`      | Medium   | Low        |
| 4   | SettingsItem       | `src/components/SettingsItem/`       | Medium   | Medium     |
| 5   | DetailListGroup    | `src/components/DetailListGroup/`    | Medium   | Medium     |
| 6   | PickerGroup        | `src/components/PickerGroup/`        | Medium   | Medium     |
| 7   | PickerItem         | `src/components/PickerItem/`         | Medium   | Low        |
| 8   | ButtonGroup        | `src/components/ButtonGroup/`        | Low      | Low        |
| 9   | ButtonGroupDivider | `src/components/ButtonGroupDivider/` | Low      | Trivial    |
| 10  | HeaderBackButton   | `src/components/HeaderBackButton/`   | Medium   | Low        |
| 11  | ErrorBoundary      | `src/components/ErrorBoundary/`      | High     | Medium     |
| 12  | FallbackUI         | `src/components/ErrorBoundary/`      | High     | Medium     |

---

## Story Template

Use this template for each component:

```typescript
// ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-native';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  argTypes: {
    // Define controls for each prop
    propName: {
      control: 'text', // or 'boolean', 'select', 'number', 'color'
      description: 'Description of what this prop does',
    },
  },
  parameters: {
    notes: `
      ## ComponentName

      Brief description of component purpose and usage.

      ### Accessibility
      - Supports screen readers
      - Has proper focus management

      ### Usage
      \`\`\`tsx
      <ComponentName prop="value" />
      \`\`\`
    `,
  },
};

export default meta;

type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  args: {
    // Default prop values
  },
};

export const WithVariant: Story = {
  args: {
    // Variant prop values
  },
};

// Add more variants as needed
```

---

## Step-by-Step Implementation

### Component 1: Logo (30 min)

Create `src/components/Logo/Logo.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import { Logo } from './Logo';

const meta: Meta<typeof Logo> = {
  title: 'Components/Logo',
  component: Logo,
  argTypes: {
    darkMode: {
      control: 'boolean',
      description: 'Use dark mode variant',
    },
    animated: {
      control: 'boolean',
      description: 'Enable animation',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Logo size',
    },
  },
  parameters: {
    notes: `
      ## Logo Component

      The main application logo with optional animation and dark mode support.

      ### Accessibility
      - Decorative image, hidden from screen readers when appropriate
      - Animation respects reduced motion preferences
    `,
  },
};

export default meta;

type Story = StoryObj<typeof Logo>;

export const Default: Story = {
  args: {
    darkMode: false,
    animated: true,
    size: 'medium',
  },
};

export const DarkMode: Story = {
  args: {
    darkMode: true,
    animated: true,
    size: 'medium',
  },
};

export const Static: Story = {
  args: {
    darkMode: false,
    animated: false,
    size: 'medium',
  },
};

export const Large: Story = {
  args: {
    darkMode: false,
    animated: true,
    size: 'large',
  },
};
```

### Component 2: ProfileCard (45 min)

Create `src/components/ProfileCard/ProfileCard.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import { ProfileCard } from './ProfileCard';

const meta: Meta<typeof ProfileCard> = {
  title: 'Components/ProfileCard',
  component: ProfileCard,
  argTypes: {
    name: {
      control: 'text',
      description: 'User display name',
    },
    title: {
      control: 'text',
      description: 'Job title or role',
    },
    location: {
      control: 'text',
      description: 'User location',
    },
    avatarUrl: {
      control: 'text',
      description: 'URL to avatar image',
    },
    isLoading: {
      control: 'boolean',
      description: 'Show loading skeleton',
    },
    hasError: {
      control: 'boolean',
      description: 'Show error state',
    },
  },
  parameters: {
    notes: `
      ## ProfileCard Component

      Displays user profile information with avatar, name, title, and location.

      ### States
      - Default: Shows profile data
      - Loading: Shows skeleton placeholder
      - Error: Shows error message with retry

      ### Accessibility
      - Avatar has appropriate alt text
      - Loading state announced to screen readers
      - Error state includes actionable retry
    `,
  },
};

export default meta;

type Story = StoryObj<typeof ProfileCard>;

export const Default: Story = {
  args: {
    name: 'Warren de Leon',
    title: 'Mobile Developer',
    location: 'Dublin, Ireland',
    avatarUrl: 'https://github.com/warrendeleon.png',
    isLoading: false,
    hasError: false,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    hasError: true,
    onRetry: action('retry-pressed'),
  },
};

export const NoAvatar: Story = {
  args: {
    name: 'Warren de Leon',
    title: 'Mobile Developer',
    location: 'Dublin, Ireland',
    avatarUrl: '',
  },
};
```

### Component 3: SettingsGroup (20 min)

Create `src/components/SettingsGroup/SettingsGroup.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { Text } from '@gluestack-ui/themed';
import { SettingsGroup } from './SettingsGroup';

const meta: Meta<typeof SettingsGroup> = {
  title: 'Components/SettingsGroup',
  component: SettingsGroup,
  argTypes: {
    title: {
      control: 'text',
      description: 'Group title',
    },
  },
  parameters: {
    notes: `
      ## SettingsGroup Component

      Container for grouping related settings items with a title.

      ### Accessibility
      - Title serves as group label
      - Children properly grouped semantically
    `,
  },
};

export default meta;

type Story = StoryObj<typeof SettingsGroup>;

export const Default: Story = {
  args: {
    title: 'Preferences',
  },
  render: (args) => (
    <SettingsGroup {...args}>
      <Text>Settings item 1</Text>
      <Text>Settings item 2</Text>
    </SettingsGroup>
  ),
};

export const WithLongTitle: Story = {
  args: {
    title: 'Application Preferences and Configuration Options',
  },
  render: (args) => (
    <SettingsGroup {...args}>
      <Text>Content here</Text>
    </SettingsGroup>
  ),
};
```

### Components 4-12: Continue Pattern

Follow the same pattern for remaining components:

- **SettingsItem**: Show icon variants, press actions, value displays
- **DetailListGroup**: Show with different item counts, titles
- **PickerGroup**: Show with options, selected state
- **PickerItem**: Show selected/unselected states
- **ButtonGroup**: Show with multiple buttons
- **ButtonGroupDivider**: Show standalone and in group
- **HeaderBackButton**: Show with different tintColors
- **ErrorBoundary**: Show with error trigger component
- **FallbackUI**: Show different error messages, retry action

---

## After Creating All Stories

### Generate Story Requirements

```bash
yarn storybook-generate
```

### Test All Stories

1. Enable Storybook mode
2. Navigate through each story
3. Test controls work correctly
4. Test actions log properly
5. Test backgrounds switch correctly
6. Review notes display correctly

---

## Verification Checklist

- [x] Logo.stories.tsx created with 4+ variants
- [x] ProfileCard.stories.tsx created with loading/error states
- [x] SettingsGroup.stories.tsx created
- [x] SettingsItem.stories.tsx created
- [x] DetailListGroup.stories.tsx created
- [x] PickerGroup.stories.tsx created
- [x] PickerItem.stories.tsx created
- [x] ButtonGroup.stories.tsx created
- [x] ButtonGroupDivider.stories.tsx created
- [x] HeaderBackButton.stories.tsx created
- [x] ErrorBoundary.stories.tsx created
- [x] FallbackUI.stories.tsx created
- [x] All stories render without errors
- [x] Controls work for all applicable props
- [x] Actions log correctly
- [x] Notes display component documentation
- [x] TypeScript compilation passes
- [x] Lint passes

---

## Acceptance Criteria

- [x] All 12 components have story files
- [x] Each story demonstrates all props and variants
- [x] Controls addon configured for all editable props
- [x] Actions addon configured for all callbacks
- [x] Notes include usage and accessibility info
- [x] Stories render correctly in Storybook

---

## Definition of Done

- [x] All acceptance criteria met
- [x] All 12 story files created and working
- [x] Story requirements generated
- [x] All stories tested in Storybook UI
- [x] TypeScript and lint pass
- [x] Ready for TASK-148 (story tests)

---

## Notes

- **Estimated Time Per Component**: Simple (20 min), Medium (30 min), Complex (45 min)
- **Story Location**: Same directory as component
- **Naming Convention**: `ComponentName.stories.tsx`
- **Controls**: Use appropriate control types (text, boolean, select, number, color)

**Last Updated**: 2025-11-18
