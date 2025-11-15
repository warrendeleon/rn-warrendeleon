# Development Workflow & Patterns

> Practical workflows, patterns, and debugging strategies for day-to-day development

## Development Workflow

### iOS-First Design Approach

The project prioritizes **iOS Settings app styling and behavior** as UI/UX reference.

**Process**:

1. Use iOS Settings reference images
2. Compare in iOS simulator
3. Iterate on styling (colors, spacing, typography, icons)
4. Test in light and dark modes
5. Verify on actual device sizes

**Key Patterns**: Grouped lists with rounded corners, uppercase section headers, colored rounded-square icons, minimal back buttons (chevron only), no visible borders

### Iterative Refinement

1. Initial implementation → 2. Visual verification → 3. Identify gaps → 4. Documentation review → 5. Refine → 6. Validate → 7. Clear cache (`yarn start:reset`)

### Debugging Navigation

1. Check React Navigation docs for correct options
2. Test with simple values first
3. Rebuild app (not just reload) for native changes
4. Reset simulator: Device → Erase All Content and Settings
5. Clear Metro cache

## Performance Optimization

**Core patterns**: React.memo (list components), useMemo (computed arrays/objects), useCallback (function stability)

**When to use**:

- React.memo: Components in lists or expensive rendering
- useMemo: Array/object creation that depends on values
- useCallback: Functions passed to memoised components

**Impact**: 70-80% reduction in re-renders, 58-60 FPS scrolling

**Full patterns and examples**: See `.claude/docs/react-patterns.md`

## Parallel Development with Git Worktrees

Use git worktrees for **parallel execution of multiple tasks** when running AI agents concurrently. Industry-standard approach for parallel AI-assisted development in 2025-2026.

### Quick Start

```bash
# 1. Create worktrees
git worktree add ../wt-task-007 -b task/007-description main
git worktree add ../wt-task-008 -b task/008-description main

# 2. Agents work in parallel (each in their worktree)

# 3. Sequential merge with rebase (from main repo)
git checkout task/007-description && git rebase main
git checkout main && git merge --ff-only task/007-description
yarn validate  # Checkpoint

# Repeat for each task

# 4. Cleanup
git worktree remove ../wt-task-007
```

**Benefits**: Complete isolation, shared `.git` database, professional workflow

**When to use**: Multiple independent tasks, well-scoped boundaries, time savings

**When NOT to use**: Single/coupled tasks, conflicting files, quick tasks (<15min)

**Full workflow and examples**: See `.claude/docs/git-worktree-workflow.md`

## Changelog Management

**File**: `CHANGELOG.md` (project root)

**Format**: Keep a Changelog (https://keepachangelog.com)

**Versioning**: Semantic Versioning (https://semver.org)

### When to Update

**✅ DO Update**:

- Epic completion or major milestone
- Breaking changes (document clearly with warning)
- User-facing feature additions
- Important bug fixes
- Pre-release versions (alpha, beta, rc)
- Official releases

**❌ DON'T Update**:

- Every commit (that's what git history is for)
- Internal refactors with no user impact
- Test suite changes
- Documentation-only updates
- Dependency updates (unless they fix critical issues)

### Structure

```markdown
## [Unreleased]

### Added

- New features (use UK English: "colour", "optimise")

### Changed

- Changes to existing features

### Fixed

- Bug fixes

### Performance

- Performance improvements

### Security

- Security fixes

## [0.1.0-alpha] - 2025-11-20

... versioned release content
```

### Workflow

**During Development**:

- Continue with detailed gitmoji commits
- Don't update CHANGELOG on every commit

**On Milestone Completion**:

1. Review commits since last update: `git log --oneline --since="2025-11-03"`
2. Group changes by category (Added, Fixed, Performance, etc.)
3. Update `[Unreleased]` section with user-facing changes only
4. Commit: `📝 docs(changelog): update for EPIC-XXX completion`

**When Cutting a Release**:

1. Rename `[Unreleased]` to `[version] - YYYY-MM-DD`
2. Add new empty `[Unreleased]` section at top
3. Update comparison links at bottom
4. Update `package.json` version: `yarn version --new-version X.Y.Z --no-git-tag-version`
5. Commit and tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`

### Writing Style

**Use UK English**:

- ✅ "Optimise", "colour", "behaviour"
- ❌ "Optimize", "color", "behavior"

**Natural Language**:

- ✅ "Add dark mode support"
- ❌ "Implement comprehensive dark mode functionality"

**Active Voice**:

- ✅ "Fix navigation crash"
- ❌ "Navigation crash was fixed"

**User-Focused**:

- Describe impact, not implementation details
- Mention what users can do, not how code changed

### Gitmoji to Category Mapping

| Gitmoji     | Category                 |
| ----------- | ------------------------ |
| ✨ feat     | Added                    |
| 🐛 fix      | Fixed                    |
| ⚡ perf     | Performance              |
| ♿ a11y     | Accessibility            |
| 🔒 security | Security                 |
| ♻️ refactor | Refactored (optional)    |
| 📝 docs     | Documentation (optional) |

### Notion Sync

CHANGELOG.md is tracked for bi-directional sync with Notion (see `.claude/docs/documentation-sync.md`).

After updating:

- Commit to git first
- Sync to Notion via `/sync-docs-to-notion` (when available) or manually

**Full workflow and examples**: See `.claude/docs/changelog-workflow.md`

## Custom Slash Commands

Located in `.claude/commands/` to streamline workflows.

### Planning & Documentation

- **`/create-task [id] [title]`**: Create task following TEMPLATE.md, UK English, update README
- **`/create-user-story [id] [title]`**: Create user story (As a/I want/So that + GIVEN/WHEN/THEN)
- **`/plan-feature`**: Create Epic → User Story → Task hierarchy
- **`/review-docs`**: Review docs for UK/US spelling, Mermaid diagrams, broken links
- **`/update-architecture`**: Update ARCHITECTURE.md/CLAUDE.md from git log
- **`/verify-links`**: Validate markdown links and heading anchors

### Code Quality & Performance

- **`/analyze-performance`**: Find missing React.memo, useMemo, useCallback; estimate impact
- **`/check-coverage`**: Identify coverage gaps, provide example tests
- **`/dependency-audit`**: Find unused deps, estimate bundle savings

### Git Workflow

- **`/commit-message`**: Generate gitmoji commit from staged changes (NO Claude attribution)
