# Git Workflows

> Advanced git workflows and history management techniques

## Table of Contents

- [Rebase-Only Merge Strategy](#rebase-only-merge-strategy)
- [Git History Cleanup](#git-history-cleanup)
- [Worktree Workflows](#worktree-workflows)

---

## Rebase-Only Merge Strategy

**IMPORTANT**: All merges must use **rebase + fast-forward** to maintain linear commit history.

### Correct Workflow

```bash
# 1. Rebase feature onto main
git checkout feature/my-branch
git rebase main

# 2. Fast-forward merge
git checkout main
git merge --ff-only feature/my-branch

# 3. Validate
yarn typecheck && yarn lint && yarn test

# 4. Delete branch
git branch -d feature/my-branch
```

### Why Rebase-Only?

- **Linear History**: Easy to follow commit timeline
- **No Merge Commits**: Clean `git log` without merge bubbles
- **Bisect-Friendly**: Easier to find bugs
- **Professional Standard**: Industry best practice

### Forbidden Patterns

```bash
# ❌ NEVER
git merge --no-ff feature/branch
git merge feature/branch  # Without rebase first

# ✅ ALWAYS
git rebase main && git checkout main && git merge --ff-only feature/branch
```

---

## Git History Cleanup

**Use Case**: Accidentally committed CLAUDE.md, .claude/, or other sensitive files that should never be in git history.

**⚠️ WARNING**: This rewrites git history. Only do this if:

- Commits have NOT been pushed to a shared repository, OR
- You have explicit permission to force-push (personal project)

### Method 1: git filter-branch (Legacy)

```bash
# 1. Ensure working directory is clean
git reset --hard HEAD

# 2. Remove files from entire history
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --force \
  --index-filter 'git rm -rf --cached --ignore-unmatch CLAUDE.md .claude/' \
  --prune-empty --tag-name-filter cat -- --all

# 3. Clean up filter-branch refs
rm -rf .git/refs/original/

# 4. Expire reflog and garbage collect
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Verify cleanup
git log --all --full-history -- CLAUDE.md .claude/
# Should return nothing

# 6. Force push (if already pushed to remote)
git push --force-with-lease origin main
```

### Method 2: git filter-repo (Recommended)

**Modern, safer, and faster** than filter-branch.

```bash
# 1. Install git-filter-repo
brew install git-filter-repo

# 2. Remove files from history
git filter-repo --path CLAUDE.md --path .claude --invert-paths --force

# 3. Force push (if already pushed to remote)
git push --force-with-lease origin main
```

### Post-Cleanup Checklist

1. **Verify files are untracked**: `git status`
2. **Ensure .gitignore includes them**:
   ```bash
   # Check .gitignore
   grep -E "CLAUDE|\.claude" .gitignore || echo "⚠️ Add to .gitignore"
   ```
3. **Communicate with team** if repository is shared
4. **Clone fresh** to verify cleanup worked:
   ```bash
   cd /tmp
   git clone <repo-url> test-clone
   cd test-clone
   find . -name "CLAUDE.md" -o -name ".claude"  # Should find nothing
   ```

### Prevention Tips

**Always check before committing**:

```bash
# 1. Check what's staged
git status

# 2. Review diff of staged files
git diff --cached

# 3. Scan for forbidden files
git diff --cached --name-only | grep -i "claude\|\.env" && echo "❌ STOP" || echo "✅ Safe"
```

**Use pre-commit hooks**: The project's Husky setup already blocks some issues, but manual review is still essential.
