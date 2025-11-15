# Changelog Workflow Guide

This guide explains how to maintain the `CHANGELOG.md` file following Keep a Changelog conventions.

## Overview

The project uses **Keep a Changelog** format with:

- UK English spelling throughout
- Gitmoji-enhanced category headers (see `gitmoji-reference.md` for complete list of 60+ gitmojis)
- Lightweight maintenance (update on milestones, not every commit)
- `[Unreleased]` section for ongoing work
- Semantic versioning for releases

## When to Update CHANGELOG.md

### ✅ DO Update When:

1. **Epic Completion** - Major feature set is complete
2. **Breaking Changes** - Any API or behaviour changes that affect users
3. **User-Facing Features** - New screens, components, or functionality
4. **Important Bug Fixes** - Fixes that significantly improve UX
5. **Pre-Release Milestones** - Alpha, beta, or release candidate
6. **Official Releases** - When cutting a version tag

### ❌ DON'T Update For:

1. **Internal Refactors** - Code organisation changes with no user impact
2. **Test Suite Changes** - Adding/updating tests
3. **Documentation Updates** - Unless it's a major docs overhaul
4. **Dependency Updates** - Unless it fixes a critical issue
5. **Technical Debt** - Internal improvements
6. **Every Single Commit** - That's what git history is for

## Category Mapping (Gitmoji → Changelog)

**IMPORTANT**: This is a subset of commonly used gitmojis. For the **complete list of 60+ gitmojis**, see `.claude/docs/gitmoji-reference.md`. Always consult the complete reference when choosing gitmojis for commits.

**Common gitmojis** (frequently used in this project):

| Gitmoji | Commit Type | Changelog Section    | Example                   |
| ------- | ----------- | -------------------- | ------------------------- |
| ✨      | feat        | Added                | New Settings screen       |
| 🐛      | fix         | Fixed                | Fix navigation crash      |
| ♻️      | refactor    | Refactored\*         | Restructure Redux store   |
| ⚡      | perf        | Performance          | Optimise list rendering   |
| ✅      | test        | Testing\*            | Add E2E test suite        |
| 📝      | docs        | Documentation\*      | Add architecture guide    |
| 🔧      | chore       | Maintenance\*        | Update ESLint config      |
| ♿      | a11y        | Accessibility        | Add screen reader labels  |
| 🔥      | remove      | Removed              | Remove deprecated API     |
| 🔒      | security    | Security             | Fix XSS vulnerability     |
| 💄      | style       | UI/UX                | Update theme colours      |
| 🌐      | i18n        | Internationalisation | Add French translations   |
| 🚑      | hotfix      | Fixed (Critical)     | Emergency production fix  |
| 🏗️      | arch        | Architecture         | Major architecture change |
| 💥      | breaking    | Breaking Changes     | Remove deprecated API     |

\* _Optional sections - only include if user-facing or significant_

**Complete mapping**: See `gitmoji-reference.md` for comprehensive changelog mapping of all 60+ gitmojis.

## Workflow: Adding Entries

### 1. During Development

Continue using detailed gitmoji commit messages as normal:

```bash
git commit -m "✨ feat(settings): add dark mode toggle

- Add theme preference selector (System, Light, Dark)
- Persist selection to AsyncStorage via Redux
- Update useAppColorScheme hook to respect preference
- Add tests for theme switching logic

Validates: yarn test SettingsScreen.test.tsx
Completes: TASK-012"
```

**Don't update CHANGELOG yet** - wait for milestone completion.

### 2. On Milestone/Epic Completion

When you complete a major milestone (Epic, feature set, or pre-release):

1. Review commits since last changelog update:

   ```bash
   git log --oneline --since="2025-11-03"
   ```

2. Group changes by category (Added, Fixed, Performance, etc.)

3. Update `[Unreleased]` section:

   ```markdown
   ## [Unreleased]

   ### Added

   - Dark mode support with system/light/dark preference
   - User profile screen with avatar upload
   - Push notification settings

   ### Fixed

   - Navigation crash on deep links
   - Memory leak in Settings screen

   ### Performance

   - Optimised FlatList rendering (70% faster scrolling)
   ```

4. Commit the changelog update:
   ```bash
   git add CHANGELOG.md
   git commit -m "📝 docs(changelog): update for EPIC-002 completion"
   ```

### 3. Cutting a Release

When ready to tag a version (e.g., `v0.1.0-alpha`):

1. **Move `[Unreleased]` to versioned section**:

   ```markdown
   ## [Unreleased]

   _(Empty - awaiting next development cycle)_

   ## [0.1.0-alpha] - 2025-11-20

   ### Added

   - Dark mode support with system/light/dark preference
   - User profile screen with avatar upload
   - Push notification settings

   ### Fixed

   - Navigation crash on deep links
   - Memory leak in Settings screen
   ```

2. **Update comparison links at bottom**:

   ```markdown
   [Unreleased]: https://github.com/warrendeleon/project/compare/v0.1.0-alpha...HEAD
   [0.1.0-alpha]: https://github.com/warrendeleon/project/releases/tag/v0.1.0-alpha
   ```

3. **Update `package.json` version**:

   ```bash
   # Update "version": "0.1.0-alpha" in package.json
   yarn version --new-version 0.1.0-alpha --no-git-tag-version
   ```

4. **Commit and tag**:

   ```bash
   git add CHANGELOG.md package.json
   git commit -m "📝 docs(changelog): release v0.1.0-alpha"
   git tag -a v0.1.0-alpha -m "Release v0.1.0-alpha"
   git push origin main --tags
   ```

## Example: Full Changelog Structure

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Biometric authentication (Face ID, Touch ID)
- Offline mode with local data caching

### Changed

- Updated onboarding flow with 3-step wizard

## [0.2.0-beta] - 2025-12-15

### Added

- User profiles with avatar upload
- Push notification preferences
- In-app feedback form

### Fixed

- Crash on iOS when selecting photos
- Memory leak in Settings screen

### Performance

- Reduced app startup time by 40%

## [0.1.0-alpha] - 2025-11-20

### Added

- Dark mode support
- Settings screen with theme/language
- Internationalisation (English, Spanish)

### Technical Foundation

- React Native 0.82.1 + TypeScript
- Redux Toolkit state management
- Detox E2E testing

## [0.0.1] - 2025-11-03

Initial project setup (restart from 2022 version).

[Unreleased]: https://github.com/warrendeleon/project/compare/v0.2.0-beta...HEAD
[0.2.0-beta]: https://github.com/warrendeleon/project/compare/v0.1.0-alpha...v0.2.0-beta
[0.1.0-alpha]: https://github.com/warrendeleon/project/compare/v0.0.1...v0.1.0-alpha
[0.0.1]: https://github.com/warrendeleon/project/releases/tag/v0.0.1
```

## Versioning Guidelines

### Pre-Release Versions

| Version       | When to Use                                 | Example                    |
| ------------- | ------------------------------------------- | -------------------------- |
| `0.1.0-alpha` | First testable build, foundation complete   | Settings + basic features  |
| `0.1.0-beta`  | Feature-complete for MVP, ready for testing | All planned features done  |
| `0.1.0-rc1`   | Release candidate, final testing            | Production-ready candidate |
| `0.1.0`       | First stable MVP release                    | Public-ready MVP           |

### Semantic Versioning

- **Major (1.0.0)**: Breaking changes, major rewrites
- **Minor (0.1.0)**: New features, backwards-compatible
- **Patch (0.0.1)**: Bug fixes, no new features

### Pre-1.0.0 Rule

Before version `1.0.0`, the API is considered unstable:

- `0.x.y` versions may include breaking changes in minor versions
- Document breaking changes clearly in changelog
- First stable public release should be `1.0.0`

## Writing Style Guidelines

### UK English

- ✅ "Optimise" not "Optimize"
- ✅ "Colour" not "Color"
- ✅ "Behaviour" not "Behavior"
- ✅ "Synchronise" not "Synchronize"

### Natural Language

- ✅ "Add dark mode support"
- ❌ "Implement comprehensive dark mode functionality"

- ✅ "Fix crash on Settings screen"
- ❌ "Resolve critical issue impacting Settings module"

- ✅ "Optimise list rendering performance"
- ❌ "Enhance and optimise list rendering performance metrics"

### Active Voice

- ✅ "Add user profile screen"
- ❌ "User profile screen has been added"

- ✅ "Fix navigation crash"
- ❌ "Navigation crash was fixed"

## Integration with Notion

Since CHANGELOG.md is a tracked document (see CLAUDE.md), it should be synced to Notion:

1. **After updating CHANGELOG.md in git**:
   - Commit to git first
   - Run `/sync-docs-to-notion` (when available)
   - Or manually copy to Notion page

2. **Notion Changelog Page Structure**:
   - Title: "Changelog"
   - Database: Link to Releases database (if exists)
   - Content: Full CHANGELOG.md markdown
   - Properties: Last Updated, Version

## Quick Reference

### Minimal Changelog Entry

```markdown
## [Unreleased]

### Added

- Feature X

### Fixed

- Bug Y
```

### Comprehensive Entry

```markdown
## [0.1.0-alpha] - 2025-11-20

### Added

- Dark mode with system/light/dark preference
- User profile screen with avatar upload
- Push notification settings

### Changed

- Updated onboarding flow with progressive disclosure

### Fixed

- Navigation crash on deep link handling
- Memory leak in Settings screen
- Accessibility labels for VoiceOver

### Performance

- Optimised FlatList rendering (70% faster)
- Reduced app startup time by 40%

### Security

- Fixed XSS vulnerability in user input fields

### Breaking Changes

- Removed deprecated `legacyTheme` prop from ThemeProvider
- Changed `language` prop to `locale` in i18n config
```

## Common Mistakes to Avoid

### ❌ Too Granular

```markdown
### Added

- Add useState hook to SettingsScreen
- Import React.memo from react
- Create settingsSlice.ts file
```

These are implementation details, not user-facing changes.

### ✅ User-Focused

```markdown
### Added

- Settings screen with theme and language preferences
```

### ❌ No Context

```markdown
### Fixed

- Bug in component
```

What bug? Which component?

### ✅ Clear Context

```markdown
### Fixed

- Navigation crash when opening Settings from deep link
```

### ❌ AI Speak

```markdown
### Added

- Comprehensive dark mode functionality leveraging system preferences
```

### ✅ Natural Language

```markdown
### Added

- Dark mode support with system preference detection
```

## Summary

**Philosophy**: CHANGELOG.md is for **users and future you**, not for every commit detail.

**Update frequency**: Milestones, not commits

**Style**: UK English, natural language, active voice

**Focus**: User-facing changes and breaking changes

**Versioning**: Semantic versioning with pre-release tags for development
