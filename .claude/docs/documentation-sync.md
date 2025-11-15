# Documentation Bi-directional Sync

> Guide for keeping documentation synchronized between Git and Notion

**CRITICAL**: Documentation files exist in BOTH git and Notion with manual sync required.

## The Rule

**Git = Source of truth for**:

- Code examples in docs
- Technical accuracy
- Version history

**Notion = Source of truth for**:

- Visual presentation
- Quick edits by non-developers
- Cross-linking with tickets

## Manual Sync Process

### When editing in git/IDE

1. Make changes to `.md` file
2. Commit to git
3. Run `/sync-docs-to-notion` command (when available)
4. Or manually copy content to Notion page

### When editing in Notion

1. Make changes in Notion page
2. Run `/sync-notion-to-docs` command (when available)
3. Or manually copy content to `.md` file
4. Commit with message: `📝 docs: sync from Notion - [page]`

## Tracked Documentation

Files synced between Git ↔ Notion:

- `README.md`
- `CHANGELOG.md`
- `docs/ARCHITECTURE.md`
- `docs/DEVELOPMENT.md`
- `docs/TESTING.md`
- `docs/E2E_TESTING.md`
- `docs/I18N.md`
- `docs/STATE_MANAGEMENT.md`
- `docs/WORKFLOWS.md`
- `docs/CHEATSHEET.md`
- `docs/CONTRIBUTING.md`

**NOT synced** (Git only):

- `package.json`
- Configuration files
- Code files

## Future Automation

Sync commands will be added to `.claude/commands/`:

- `/sync-docs-to-notion` - Push git docs to Notion
- `/sync-notion-to-docs` - Pull Notion docs to git
- `/sync-status` - Check sync status of all docs

**For now**: Manual sync required. Keep both in sync when making doc changes.

## Sync Workflow Example

### Scenario 1: Update Documentation in Git

```bash
# 1. Edit the file
vim docs/ARCHITECTURE.md

# 2. Commit changes
git add docs/ARCHITECTURE.md
git commit -m "📝 docs(architecture): update Redux store structure"

# 3. Sync to Notion (manual until command available)
# - Open Notion page for ARCHITECTURE.md
# - Copy/paste updated content
# - Verify formatting
```

### Scenario 2: Update Documentation in Notion

```bash
# 1. Edit in Notion UI
# - Make changes to page
# - Save automatically

# 2. Pull changes to git
/sync-notion-to-docs  # When command available

# 3. Review and commit
git diff docs/ARCHITECTURE.md
git add docs/ARCHITECTURE.md
git commit -m "📝 docs: sync from Notion - ARCHITECTURE.md"
```

## Best Practices

1. **Always sync after major updates** - Don't let docs drift between systems
2. **Git is authoritative for code** - Code examples should originate in git
3. **Notion is better for collaboration** - Use for reviews and comments
4. **Commit sync changes separately** - Don't mix doc syncs with feature work
5. **Verify formatting after sync** - Markdown → Notion → Markdown can have quirks

## Troubleshooting Sync Issues

### Formatting Differences

- **Lists**: Ensure proper indentation (2 spaces for nested items)
- **Code blocks**: Use triple backticks with language identifier
- **Tables**: Use pipe syntax, ensure alignment
- **Links**: Verify relative paths work in both systems

### Conflict Resolution

If both git and Notion have conflicting changes:

1. Determine which is more recent
2. Manually merge changes
3. Update both systems
4. Document conflict in commit message

### Large Files

For documentation larger than 5000 lines:

1. Consider splitting into multiple files
2. Use clear navigation/TOC
3. Sync in chunks if needed
4. Test rendering in both systems
