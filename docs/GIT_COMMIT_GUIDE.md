# Git Commit Message Guide

This guide explains our commit message format and conventions.

## Why Gitmoji?

We use [Gitmoji](https://gitmoji.dev) to make commit messages more visual and easier to scan. Each emoji represents a category of change, making it quick to understand what a commit does at a glance.

## Format

```
[emoji] [type]([scope]): [subject]

[multi-line body with bullet points]
- Detail 1
- Detail 2
- Detail 3

[optional footer]
```

### Components

- **Emoji**: Visual indicator of change type (see table below)
- **Type**: Conventional commit type (feat, fix, refactor, etc.)
- **Scope**: Area of code affected (optional but recommended)
- **Subject**: Brief description in imperative mood
- **Body**: Detailed explanation with bullet points
- **Footer**: Optional references (task IDs, breaking changes)

## Common Gitmojis for React Native

Complete list: [gitmoji.dev](https://gitmoji.dev)

### Features & Additions

| Emoji | Code                         | Type | Use When                          |
| ----- | ---------------------------- | ---- | --------------------------------- |
| ✨    | `:sparkles:`                 | feat | New features, screens, components |
| 🎉    | `:tada:`                     | init | Initial project setup             |
| 🍱    | `:bento:`                    | feat | Adding assets (images, fonts)     |
| 📈    | `:chart_with_upwards_trend:` | feat | Analytics or tracking             |

### Bug Fixes

| Emoji | Code                 | Type   | Use When                   |
| ----- | -------------------- | ------ | -------------------------- |
| 🐛    | `:bug:`              | fix    | Standard bug fixes         |
| 🚑    | `:ambulance:`        | hotfix | Critical production fixes  |
| 🩹    | `:adhesive_bandage:` | fix    | Simple, non-critical fixes |
| ✏️    | `:pencil2:`          | fix    | Typos in code or text      |

### Code Quality

| Emoji | Code                      | Type     | Use When                    |
| ----- | ------------------------- | -------- | --------------------------- |
| ♻️    | `:recycle:`               | refactor | Code restructuring          |
| 🎨    | `:art:`                   | refactor | Code structure improvements |
| 🏗️    | `:building_construction:` | arch     | Architecture changes        |
| 🔥    | `:fire:`                  | remove   | Removing code or files      |

### Performance

| Emoji | Code      | Type | Use When                  |
| ----- | --------- | ---- | ------------------------- |
| ⚡    | `:zap:`   | perf | Performance optimisations |
| 💫    | `:dizzy:` | ui   | Animations, transitions   |

### UI/UX

| Emoji | Code                  | Type | Use When                   |
| ----- | --------------------- | ---- | -------------------------- |
| 💄    | `:lipstick:`          | ui   | UI and styling changes     |
| 📱    | `:iphone:`            | ui   | Responsive design work     |
| 🚸    | `:children_crossing:` | ux   | UX improvements            |
| ♿    | `:wheelchair:`        | a11y | Accessibility improvements |

### Testing

| Emoji | Code                 | Type | Use When                   |
| ----- | -------------------- | ---- | -------------------------- |
| ✅    | `:white_check_mark:` | test | Adding or updating tests   |
| 🧪    | `:test_tube:`        | test | Adding failing tests (TDD) |
| 🤡    | `:clown_face:`       | test | Mock data, stubs           |

### Documentation

| Emoji | Code     | Type | Use When              |
| ----- | -------- | ---- | --------------------- |
| 📝    | `:memo:` | docs | Documentation changes |
| 💡    | `:bulb:` | docs | Code comments         |

### Internationalisation

| Emoji | Code                     | Type | Use When                     |
| ----- | ------------------------ | ---- | ---------------------------- |
| 🌐    | `:globe_with_meridians:` | i18n | Translations, locale changes |

### Configuration & Dependencies

| Emoji | Code                 | Type  | Use When                 |
| ----- | -------------------- | ----- | ------------------------ |
| 🔧    | `:wrench:`           | chore | Config file changes      |
| 🔨    | `:hammer:`           | chore | Build scripts, dev tools |
| ➕    | `:heavy_plus_sign:`  | deps  | Add dependency           |
| ➖    | `:heavy_minus_sign:` | deps  | Remove dependency        |
| ⬆️    | `:arrow_up:`         | deps  | Upgrade dependency       |
| ⬇️    | `:arrow_down:`       | deps  | Downgrade dependency     |
| 📌    | `:pushpin:`          | deps  | Pin dependency version   |

### Security

| Emoji | Code                     | Type     | Use When           |
| ----- | ------------------------ | -------- | ------------------ |
| 🔒    | `:lock:`                 | security | Security fixes     |
| 🔐    | `:closed_lock_with_key:` | security | Secrets management |
| 🛂    | `:passport_control:`     | security | Auth/authorisation |

### Critical Changes

| Emoji | Code               | Type     | Use When                           |
| ----- | ------------------ | -------- | ---------------------------------- |
| 💥    | `:boom:`           | breaking | Breaking changes (ALWAYS document) |
| 🚨    | `:rotating_light:` | lint     | Fixing linter warnings             |

### TypeScript

| Emoji | Code      | Type  | Use When                    |
| ----- | --------- | ----- | --------------------------- |
| 🏷️    | `:label:` | types | TypeScript types/interfaces |

### CI/CD

| Emoji | Code                    | Type | Use When         |
| ----- | ----------------------- | ---- | ---------------- |
| 💚    | `:green_heart:`         | ci   | Fixing CI build  |
| 👷    | `:construction_worker:` | ci   | Adding CI config |

### Database

| Emoji | Code              | Type | Use When         |
| ----- | ----------------- | ---- | ---------------- |
| 🗃️    | `:card_file_box:` | db   | Database changes |
| 🌱    | `:seedling:`      | db   | Seed files       |

## Project-Specific Conventions

### UK English Spelling

Always use UK English in commit messages:

- ✅ "Optimise" not "Optimize"
- ✅ "Colour" not "Color"
- ✅ "Behaviour" not "Behavior"
- ✅ "Synchronise" not "Synchronize"
- ✅ "Initialise" not "Initialize"

### Natural Language

Write naturally, not formally:

- ✅ "Add dark mode support"
- ❌ "Implement comprehensive dark mode functionality"

- ✅ "Fix crash on Settings screen"
- ❌ "Resolve critical issue impacting Settings module"

### Active Voice

Use imperative mood (commands):

- ✅ "Add user profile screen"
- ❌ "User profile screen has been added"

- ✅ "Fix navigation crash"
- ❌ "Navigation crash was fixed"

### Subject Line Rules

- Imperative mood: "add", "fix", "update" (not "added", "fixes", "updates")
- Include scope when helpful: `feat(settings):`, `fix(i18n):`
- Keep under 72 characters
- No period at the end

### Body Requirements

- Use bullet points with `-` prefix
- Start bullets with capital letter
- Be specific about what changed
- Include quantified impact when possible (e.g., "70% faster", "100% coverage")
- Mention validation status ("All tests pass", "yarn validate passes")
- Natural, conversational tone

## Examples from Project History

### Feature Addition

```
✨ feat(state): add Redux state management with Settings feature

- Add Redux Toolkit for state management with settings slice (theme, language)
- Integrate redux-persist for state persistence using AsyncStorage
- Add Reactotron for Redux debugging in development
- Create Settings screen with navigation from Home
- Add comprehensive test coverage (47 tests passing, 89% coverage)
- Configure ESLint to recognise __DEV__ global variable
- Mock Reactotron in Jest for proper test execution
```

**Why this works**:

- Clear feature description in subject
- Bulleted details explain what was added
- Quantified test coverage
- Natural language, not robotic

### Performance Optimisation

```
⚡ perf(components): wrap ButtonWithChevron with React.memo

- Wrap component export with React.memo for performance optimisation
- Prevents unnecessary re-renders when props haven't changed
- Reduces re-renders by ~70% in Settings screen lists
- All 97 tests pass with 100% coverage maintained
- TypeScript and ESLint validation passes
```

**Why this works**:

- Clear subject with scope
- Quantified impact (70% reduction)
- Validation status included
- UK spelling ("optimisation")

### Bug Fix

```
🐛 fix(navigation): correct back button display mode

- Set headerBackButtonDisplayMode to 'minimal' for iOS Settings style
- Removes back button text, shows chevron only
- Tested on iOS simulator (iPhone 14 Pro)
- All E2E tests pass
```

**Why this works**:

- Specific about what was fixed
- Explains the change
- Testing mentioned

### Refactoring

```
♻️ refactor(structure): rename screens to features for feature-first architecture

Refactored project structure to align with feature-based organisation instead
of screen-based. Each feature now owns its screens, components, hooks, and tests.

- Renamed src/screens → src/features
- Updated imports and navigation references accordingly
- Keeps @app alias intact for consistent internal imports
```

**Why this works**:

- High-level summary paragraph
- Specific changes bulleted
- Uses "organisation" (UK spelling)

### Documentation

```
📝 docs(planning): create hierarchical epic/story/task structure

Complete planning documentation system with 4 Epics, 4 User Stories, and 26 Tasks:
- docs/planning/user-stories/README.md - Central navigation hub
- 4 Epics focusing on Performance, Quality, Accessibility, Code Quality
- 4 User Stories with detailed context and test scenarios
- 26 Task files with implementation details and GIVEN/WHEN/THEN scenarios
- Total effort: 18.5 hours across 26 tasks
- Full cross-referencing with markdown links
- UK English spelling throughout
```

**Why this works**:

- Opening summary sentence
- Nested bullets for sub-items
- Quantified deliverables
- Natural language

### Testing

```
✅ test(coverage): achieve 100% coverage on business logic

- Configure sustainable coverage strategy with per-directory thresholds
- Exclude presentation components (screens, navigation) from coverage
- Exclude infrastructure config (store setup, dev tools)
- Add comprehensive tests for store configuration
- Improve component test assertions
- 55 passing tests, 100% coverage on business logic
```

**Why this works**:

- Focus on "business logic" not just "coverage"
- Explains strategy (what's excluded and why)
- Results quantified

### Configuration Change

```
🔧 chore(config): migrate to ESLint 9 flat config

- Replace .eslintrc.js with eslint.config.js (flat config format)
- Add @eslint/js and typescript-eslint packages
- Configure simple-import-sort for automatic import organisation
- Update lint scripts in package.json
- All files reformatted with new rules
- Validation passes: yarn lint ✅
```

**Why this works**:

- Specific about config type (flat config)
- Lists new packages added
- Validation status
- UK spelling ("organisation")

## Mapping to CHANGELOG.md

When updating `CHANGELOG.md`, commits map to these sections:

| Gitmoji        | Changelog Section        | Include When               |
| -------------- | ------------------------ | -------------------------- |
| ✨ 🎉 🍱       | **Added**                | User-facing features       |
| 🐛 🚑 🩹 ✏️    | **Fixed**                | Bug fixes                  |
| 💥             | **Breaking Changes**     | ALWAYS (critical)          |
| ♻️ 🎨 🚚 🏗️    | **Changed**              | Modified behaviour         |
| 🔥 ⚰️          | **Removed**              | Deleted features           |
| ⚡ 💫          | **Performance**          | Optimisations              |
| 🔒 🔐 🛂       | **Security**             | Security improvements      |
| ♿ 🚸          | **Accessibility**        | A11y improvements          |
| 💄 📱          | **UI/UX**                | Visual/UX changes          |
| 🌐             | **Internationalisation** | Translations               |
| ✅ 🧪          | **Testing**              | Significant test additions |
| 🔧 🔨 ⬆️ ➕ ➖ | **Maintenance**          | Config, deps (if notable)  |

See [CHANGELOG.md](../CHANGELOG.md) for examples.

## Anti-Patterns to Avoid

### ❌ Too Vague

```
✨ feat: add stuff
```

What stuff? Which feature? No context.

### ❌ AI-Style Formality

```
🔧 chore(config): update configuration files to utilise modern patterns

This commit is responsible for updating the configuration files in order to
leverage modern patterns. Additionally, the implementation facilitates better
developer experience going forward.
```

Problems: "utilise", "leverage", "facilitate", "this commit is responsible for"

### ❌ Missing Details

```
⚡ perf: add React.memo
```

Which component? Why? What's the impact?

### ❌ Mixing Multiple Unrelated Changes

```
✨ feat: add settings screen and fix navigation bug and update docs
```

These should be 3 separate commits.

### ❌ No Validation Status

```
♻️ refactor(store): simplify Redux slice structure
```

Did tests pass? Did validation pass? Always include this.

## ✅ Good Patterns

### Include Scope

```
✅ ✨ feat(settings): add dark mode toggle
❌ ✨ feat: add dark mode toggle
```

### Quantify Impact

```
✅ ⚡ perf(list): reduce re-renders by 70%
❌ ⚡ perf(list): improve performance
```

### Show Validation

```
✅ All tests pass (97/97), coverage maintained at 100%
❌ (no mention of tests)
```

### Be Specific

```
✅ 🐛 fix(i18n): resolve missing Spanish translation for Settings screen
❌ 🐛 fix: fix translation
```

## Tools

### Using HEREDOC for Multi-line Commits

For commits with multiple lines, use HEREDOC to preserve formatting:

```bash
git commit -m "$(cat <<'EOF'
✨ feat(settings): add language selection

- Add Language screen with English/Spanish options
- Integrate with i18next for locale switching
- Persist language preference to Redux store
- Update Settings screen with language selector button
- All tests pass (97/97)
EOF
)"
```

### Checking Recent Commit Style

Before committing, check recent commits to match the project style:

```bash
git log --oneline -10
```

## Quick Checklist

Before committing:

- [ ] Staged the right files (`git status`)
- [ ] Chose accurate gitmoji from [gitmoji.dev](https://gitmoji.dev)
- [ ] Used imperative mood in subject
- [ ] Included scope (e.g., `feat(settings):`)
- [ ] Subject under 72 characters
- [ ] Added bullet points explaining changes
- [ ] Used UK English spelling
- [ ] Natural, conversational tone (not AI-formal)
- [ ] Included validation status
- [ ] Mentioned test results if applicable
- [ ] No typos in commit message

## Questions?

- **Complete gitmoji list**: [gitmoji.dev](https://gitmoji.dev)
- **Contributing guide**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Changelog format**: [CHANGELOG.md](../CHANGELOG.md)

---

Remember: Commit messages are for your future self and your team. Write them as you'd want to read them.
