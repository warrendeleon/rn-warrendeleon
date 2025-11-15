# Git Worktree Workflow for Parallel Development

Complete guide to using git worktrees for concurrent AI agent execution.

## When to Use Git Worktrees

Use git worktrees for **parallel execution of multiple tasks** when running AI agents concurrently to save development time. This is the industry-standard approach for parallel AI-assisted development in 2025-2026.

### Benefits

- **Complete isolation**: No git operation conflicts between parallel tasks
- **Separate directories**: Each agent works in its own directory with dedicated branch
- **Shared git database**: Fast, disk-efficient (vs separate clones)
- **Professional workflow**: Used by experienced development teams

### When to Use

✅ **Good use cases**:

- Multiple independent tasks that modify different files
- Tasks are well-scoped with clear boundaries
- Want to save time (parallel work vs sequential)
- Working on 3+ similar tasks (e.g., memo-ing multiple components)

❌ **When NOT to use**:

- Single task or tightly coupled tasks
- Tasks that might conflict (same files being edited)
- Very quick tasks (<15 minutes) where setup overhead isn't worth it
- Learning a new codebase (better to work sequentially first)

---

## Complete Workflow Example

**Scenario**: Apply useCallback optimization to 3 different screens simultaneously.

### Phase 1: Setup (5 minutes)

From the main repository directory:

```bash
# Create 3 worktrees for parallel tasks
git worktree add ../wt-task-007 -b task/007-usecallback-settings main
git worktree add ../wt-task-008 -b task/008-usecallback-language main
git worktree add ../wt-task-009 -b task/009-usecallback-appearance main

# Verify setup
git worktree list
```

**Output**:

```
/Users/dev/warrendeleon                  [main]
/Users/dev/wt-task-007                   [task/007-usecallback-settings]
/Users/dev/wt-task-008                   [task/008-usecallback-language]
/Users/dev/wt-task-009                   [task/009-usecallback-appearance]
```

**What this does**:

- Creates 3 new directories at the same level as your main repo
- Each directory has its own git branch
- All share the same `.git` database (efficient)
- Each starts from `main` branch state

### Phase 2: Parallel Work (30-45 minutes)

Launch 3 AI agents (Claude, Cursor, etc.), one for each worktree:

**Agent 1** (in `wt-task-007`):

```bash
cd /Users/dev/wt-task-007

# Agent works on SettingsScreen.tsx
# - Adds useCallback for handlers
# - Runs validation: yarn typecheck && yarn lint && yarn test
# - Commits: git commit -m "..."
```

**Agent 2** (in `wt-task-008`):

```bash
cd /Users/dev/wt-task-008

# Agent works on LanguageScreen.tsx
# - Adds useCallback for handlers
# - Runs validation: yarn typecheck && yarn lint && yarn test
# - Commits: git commit -m "..."
```

**Agent 3** (in `wt-task-009`):

```bash
cd /Users/dev/wt-task-009

# Agent works on AppearanceScreen.tsx
# - Adds useCallback for handlers
# - Runs validation: yarn typecheck && yarn lint && yarn test
# - Commits: git commit -m "..."
```

**Important**:

- Agents stay in their worktree directory
- Each agent validates their changes before committing
- Agents do NOT merge - they just commit
- Agents do NOT push to remote

### Phase 3: Sequential Merge with Rebase (15-20 minutes)

Return to main repository directory:

```bash
cd /Users/dev/warrendeleon
git checkout main
```

**Merge Task 1**:

```bash
# 1. Rebase onto latest main
git checkout task/007-usecallback-settings
git rebase main

# 2. Fast-forward merge
git checkout main
git merge --ff-only task/007-usecallback-settings

# 3. VALIDATION CHECKPOINT
yarn typecheck && yarn lint && yarn test

# 4. If passes, delete branch
git branch -d task/007-usecallback-settings
```

**Merge Task 2**:

```bash
# 1. Rebase onto updated main (includes Task 1 now)
git checkout task/008-usecallback-language
git rebase main

# Handle conflicts if any:
# - Fix conflicts in affected files
# - git add <files>
# - git rebase --continue

# 2. Fast-forward merge
git checkout main
git merge --ff-only task/008-usecallback-language

# 3. VALIDATION CHECKPOINT
yarn typecheck && yarn lint && yarn test

# 4. Delete branch
git branch -d task/008-usecallback-language
```

**Merge Task 3**:

```bash
# Same process
git checkout task/009-usecallback-appearance
git rebase main
git checkout main
git merge --ff-only task/009-usecallback-appearance
yarn typecheck && yarn lint && yarn test
git branch -d task/009-usecallback-appearance
```

**Why sequential merge**:

- Each merge is a validation checkpoint
- Conflicts are resolved incrementally
- If Task 2 conflicts with Task 1, you know immediately
- Linear git history (no merge bubbles)

### Phase 4: Cleanup (2 minutes)

```bash
# Remove worktrees
git worktree remove ../wt-task-007
git worktree remove ../wt-task-008
git worktree remove ../wt-task-009

# Verify cleanup
git worktree list
# Should only show main repo
```

If worktree has uncommitted changes:

```bash
git worktree remove --force ../wt-task-xxx
```

---

## Advanced Scenarios

### Scenario 1: Handling Conflicts During Rebase

```bash
git checkout task/008-usecallback-language
git rebase main

# Conflict appears in package.json
# CONFLICT (content): Merge conflict in package.json

# 1. Open conflicted file, resolve manually
# 2. Stage resolved files
git add package.json

# 3. Continue rebase
git rebase --continue

# 4. If more conflicts, repeat
# 5. Once done, merge as normal
git checkout main
git merge --ff-only task/008-usecallback-language
```

### Scenario 2: Aborting Failed Merge

```bash
# If rebase goes wrong
git rebase --abort

# Return to main, investigate
git checkout main

# Review what changed in both branches
git diff main task/008-usecallback-language
```

### Scenario 3: Task Failed Validation

```bash
# Task merged but validation failed
git checkout main
git merge --ff-only task/007-usecallback-settings

yarn typecheck  # ❌ FAILS

# Undo merge
git reset --hard HEAD~1

# Fix in worktree or manually in main
cd ../wt-task-007
# Fix issues
git commit --amend
# Try merge again from main repo
```

### Scenario 4: Updating Worktree Mid-Work

If main branch gets updated while agents are working:

```bash
# In worktree
cd /Users/dev/wt-task-007

# Fetch latest main
git fetch origin main

# Rebase current work onto new main
git rebase origin/main

# Continue work
```

**Note**: Generally avoid this - let agents finish their work first.

---

## Node Modules Consideration

Each worktree may need its own `node_modules` if:

- Running tests locally in worktree
- Using different dependency versions
- Package.json changes between branches

```bash
# In worktree
cd /Users/dev/wt-task-007
yarn install  # Creates separate node_modules

# Or symlink from main (if dependencies identical)
ln -s ../warrendeleon/node_modules node_modules
```

**Recommendation**: If just editing code and validating in main repo, skip node_modules in worktrees.

---

## Best Practices

### 1. Clear Task Boundaries

✅ **Good task separation**:

- Task 1: Optimize SettingsScreen
- Task 2: Optimize LanguageScreen
- Task 3: Optimize AppearanceScreen

❌ **Bad task separation** (will conflict):

- Task 1: Update Redux store + SettingsScreen
- Task 2: Update Redux store + LanguageScreen
- → Both touch Redux store → conflict

### 2. Descriptive Branch Names

```bash
# ✅ Good - clear, includes task ID
git worktree add ../wt-task-007 -b task/007-usecallback-settings main

# ❌ Bad - vague
git worktree add ../wt-temp -b temp-branch main
```

### 3. Validate After Each Merge

```bash
# Always run full validation
yarn typecheck && yarn lint && yarn test

# If any fail, stop and fix before next merge
```

### 4. Keep Worktrees Short-Lived

- Create worktrees for parallel work session
- Merge all within 1-2 hours
- Clean up immediately after merging
- Don't let worktrees sit for days

### 5. Communicate with Agents

Give each agent clear instructions:

```
You are working in worktree: /Users/dev/wt-task-007
Your branch: task/007-usecallback-settings
Your task: Add useCallback to SettingsScreen handlers

Steps:
1. Edit src/features/Settings/SettingsScreen.tsx
2. Add useCallback for handleLanguagePress and handleAppearancePress
3. Run: yarn typecheck && yarn lint && yarn test
4. Commit with message: "⚡ perf: add useCallback to SettingsScreen handlers"
5. STAY IN THIS DIRECTORY - do not merge
```

---

## Troubleshooting

### Issue: "fatal: 'branch' is already checked out"

```bash
# You're trying to checkout a branch that's in use by a worktree
# Solution: List worktrees to find where it's checked out
git worktree list

# Remove that worktree first
git worktree remove ../wt-task-xxx
```

### Issue: Worktree directory still exists after removal

```bash
# Sometimes directory lingers
git worktree remove ../wt-task-007  # Removes from git
rm -rf ../wt-task-007               # Remove directory manually
```

### Issue: Forgot which worktree has which branch

```bash
# List all worktrees with branches
git worktree list

# Remove specific worktree
git worktree remove /Users/dev/wt-task-007
```

### Issue: Need to cancel parallel work

```bash
# Remove all worktrees
git worktree remove ../wt-task-007
git worktree remove ../wt-task-008
git worktree remove ../wt-task-009

# Delete branches (if not merged)
git branch -D task/007-usecallback-settings
git branch -D task/008-usecallback-language
git branch -D task/009-usecallback-appearance
```

---

## Workflow Comparison

### Without Worktrees (Sequential)

```
Task 1: 15 minutes
Task 2: 15 minutes
Task 3: 15 minutes
Total: 45 minutes
```

### With Worktrees (Parallel)

```
Setup: 5 minutes
Tasks 1+2+3 (parallel): 15 minutes
Merge: 15 minutes
Total: 35 minutes
Saved: 10 minutes (22% faster)
```

**More tasks = more savings**:

- 5 tasks: ~40% faster
- 10 tasks: ~55% faster

---

## Quick Reference Commands

```bash
# Create worktree
git worktree add <path> -b <branch-name> <start-point>

# List worktrees
git worktree list

# Remove worktree
git worktree remove <path>

# Force remove (with uncommitted changes)
git worktree remove --force <path>

# Prune stale worktrees
git worktree prune
```

---

## Summary

**Worktrees are best for**:

- Parallel AI agent execution
- Independent tasks on separate files
- Saving time on bulk similar work

**Key workflow**:

1. Setup: Create worktrees from main
2. Parallel: Agents work independently, commit to their branch
3. Sequential: Merge one at a time with validation checkpoints
4. Cleanup: Remove worktrees and branches

**Remember**:

- Always rebase before merge
- Always validate after each merge
- Keep worktrees short-lived
- Use clear branch names
- Communicate boundaries to agents

**With proper use**, worktrees can significantly speed up development while maintaining code quality and git history cleanliness.
