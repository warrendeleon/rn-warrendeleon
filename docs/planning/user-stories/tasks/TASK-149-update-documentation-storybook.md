# TASK-149: Update Project Documentation for Storybook

**Task ID**: TASK-149
**Title**: Update Project Documentation
**Epic**: [EPIC-016: Storybook Re-integration](../epics/EPIC-016-storybook-reintegration.md)
**User Story**: [US-028: Storybook Setup and Stories](../stories/US-028-storybook-setup-and-stories.md)
**Status**: 📋 To Do
**Priority**: Medium
**Effort**: 1h
**Created**: 2025-11-18
**Assigned To**: Warren de Leon
**Category**: Documentation

---

## Overview

Update all project documentation to reflect the Storybook re-integration, including README.md and CLAUDE.md updates.

---

## Files to Update

### 1. README.md

Add a "Storybook" section:

```markdown
## Storybook

This project uses [Storybook](https://storybook.js.org/) v10 for component development and documentation.

### Running Storybook

1. **Toggle Mode**: Use the developer toggle in Settings to enable Storybook mode
2. **Restart App**: App will launch in Storybook instead of main app
3. **Browse Components**: Navigate through all available component stories

### Creating Stories

Stories are located alongside their components:
```

src/components/Logo/
├── Logo.tsx
└── Logo.stories.tsx

````

Example story:

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import { Logo } from './Logo';

const meta: Meta<typeof Logo> = {
  title: 'Components/Logo',
  component: Logo,
};

export default meta;

type Story = StoryObj<typeof Logo>;

export const Default: Story = {
  args: {
    size: 'medium',
  },
};
````

### Regenerating Stories

After adding new stories, regenerate the requirements:

```bash
yarn storybook-generate
```

### Testing Stories

Stories are tested with Jest:

```bash
yarn test --testPathPattern="stories.test"
```

````

---

### 2. CLAUDE.md

Update the Project Overview section to mention Storybook is back:

```markdown
**Note**: Storybook v10.0.7 re-integrated (November 2025) after compatibility issues with RN 0.82.1 were resolved.
````

Add Storybook commands to Essential Commands:

````markdown
### Storybook

```bash
yarn storybook-generate  # Regenerate story requirements
```
````

````

---

### 3. docs/README.md (if exists)

Add Storybook section explaining:

- How to use Storybook
- How to create stories
- Controls, Actions, Backgrounds, Notes addons
- Story testing approach

---

### 4. CONTRIBUTING.md (if exists)

Add section for component contributors:

```markdown
## Creating Components

When creating new components:

1. Create the component in `src/components/ComponentName/`
2. Create a story file: `ComponentName.stories.tsx`
3. Create a story test: `ComponentName.stories.test.tsx`
4. Run `yarn storybook-generate` to register the story
5. Test the story in Storybook UI
````

---

## Verification Checklist

- [ ] README.md updated with Storybook section
- [ ] CLAUDE.md note updated about Storybook status
- [ ] Essential commands include storybook-generate
- [ ] Story creation instructions clear
- [ ] Testing approach documented
- [ ] All documentation accurate and up to date

---

## Acceptance Criteria

- [ ] README.md has clear Storybook usage instructions
- [ ] CLAUDE.md reflects Storybook re-integration
- [ ] Documentation matches actual implementation
- [ ] Examples are correct and work
- [ ] No outdated references to "Storybook removed"

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Documentation reviewed for accuracy
- [ ] No broken links or references
- [ ] All files committed
- [ ] EPIC-016 ready for completion

---

## Notes

- **Remove Old Notes**: Delete any documentation saying "Storybook removed"
- **Update CLAUDE.md**: The note at line 423 needs updating
- **Accuracy**: All commands and code examples must work as documented

**Last Updated**: 2025-11-18
