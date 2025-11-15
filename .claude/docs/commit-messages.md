# Git Commit Message Examples

Real commit messages from this project's history, demonstrating the gitmoji + conventional commit format with natural human language.

**⚠️ IMPORTANT**: These examples use a subset of common gitmojis. For the **complete list of 60+ gitmojis** with descriptions and use cases, see `gitmoji-reference.md`. Always consult the complete reference to pick the most accurate gitmoji for your commit.

## Format Template

```
[gitmoji] [type]([scope]): [subject]

[multi-line body with bullet points]
- Detail 1
- Detail 2
- Detail 3
```

## Performance Optimization Examples

### Example 1: Component Memoization

```
⚡ perf(components): wrap ButtonWithChevron with React.memo
- Wrap component export with React.memo for performance optimization
- Prevents unnecessary re-renders when props haven't changed
- Reduces re-renders by ~70% in Settings screen lists
- All 97 tests pass with 100% coverage maintained
- TypeScript and ESLint validation passes

Completes TASK-001 from EPIC-001 performance optimization
```

**Why this works**:

- Clear subject line with scope
- Quantified impact (70% reduction)
- Validation status included
- References related task

### Example 2: useCallback Optimization

```
✨ feat(performance): add useCallback to SettingsScreen handlers
- Wrap handleLanguagePress with useCallback and [navigation] dependency
- Wrap handleAppearancePress with useCallback and [navigation] dependency
- Prevents unnecessary re-renders of ChevronButtonGroup children
- Maintains stable function references across renders
- All validations pass: typecheck ✅ lint ✅ tests 97/97 ✅

Completes TASK-007
```

**Why this works**:

- Specific technical details (dependencies listed)
- Clear benefit statement
- Emoji checkmarks for validation (acceptable in commit body)
- Concise task reference

### Example 3: useMemo Optimization

```
⚡ perf(screens): memoize computed values in LanguageScreen
- Wrap languageOptions array with useMemo
- Dependencies: [t, currentLanguage]
- Prevents array recreation on every render
- Stabilizes SelectableListButton props for React.memo
- Reduces re-renders by 60%, maintains 58-60 FPS scrolling

All tests pass, coverage maintained at 100%
```

**Why this works**:

- Dependency array shown for clarity
- Performance metrics included
- Explains cascade effect (stabilizes props)

## Feature Addition Examples

### Example 4: Redux State Management

```
✨ feat(state): add Redux state management with Settings feature
- Add Redux Toolkit for state management with settings slice (theme, language)
- Integrate redux-persist for state persistence using AsyncStorage
- Add Reactotron for Redux debugging in development
- Create Settings screen with navigation from Home
- Add comprehensive test coverage (47 tests passing, 89% coverage)
- Configure ESLint to recognize __DEV__ global variable
- Mock Reactotron in Jest for proper test execution
```

**Why this works**:

- Multiple related changes grouped logically
- Tools and their purposes explained
- Testing infrastructure changes included
- Coverage stats provided

### Example 5: Error Handling Feature

```
✨ feat(error-handling): add ErrorBoundary with comprehensive testing
- Create ErrorBoundary component with fallback UI
- Add "Try Again" and "Go Home" recovery options
- Integrate at app root to catch all React errors
- Add unit tests with React Testing Library (100% coverage)
- Create Detox E2E tests with Cucumber BDD scenarios
- Add TestErrorButton component (DEV-only) for testing
- Implement recursive dismiss for React Native error screens

Testing: 97 unit tests pass, 3 E2E scenarios pass (22 steps)
```

**Why this works**:

- Feature described with all components
- Testing approach explained (unit + E2E)
- Special techniques mentioned (recursive dismiss)

## Test Addition Examples

### Example 6: E2E Tests

```
✅ test(e2e): add ErrorBoundary E2E tests with Detox
- Create Cucumber feature file for ErrorBoundary testing
- Add TestErrorButton component (DEV-only) to trigger errors
- Implement recursive dismiss logic for React Native error screens
- Handle both red error screens and yellow warnings (up to 10 dismisses)
- Add missing step definitions for text and element assertions
- Test results: 3 scenarios passed, 22 steps passed

E2E tests verify ErrorBoundary catches errors, displays fallback UI,
and provides working recovery options (Try Again, Go Home).

Completes TASK-013
```

**Why this works**:

- Special techniques explained (recursive dismiss)
- Test results quantified
- Summary of what tests verify
- No "AI speak" - sounds like human wrote it

### Example 7: Coverage Strategy

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

- Strategy explained (what's excluded and why)
- Focus on "business logic" not just "coverage"
- Results quantified

## Refactoring Examples

### Example 8: Architecture Change

```
🏗️ refactor(structure): rename screens to features for feature-first architecture
Refactored project structure to align with feature-based organisation instead
of screen-based. Each feature now owns its screens, components, hooks, and tests.

- Renamed src/screens → src/features
- Updated imports and navigation references accordingly
- Keeps @app alias intact for consistent internal imports
```

**Why this works**:

- High-level summary in first paragraph
- Specific changes bulleted
- Uses "organisation" (UK spelling per project standard)

### Example 9: Code Quality

```
♻️ refactor(components): simplify SelectableListButton implementation
- Remove redundant conditional logic
- Extract constant for checkmark width (CHECKMARK_WIDTH = 16)
- Improve readability with early returns
- No behavior changes - all tests still pass
```

**Why this works**:

- Specific improvements listed
- Confirms no behavior change
- Validation mentioned

## Maintenance Examples

### Example 10: Dependency Cleanup

```
🔧 chore(dependencies): remove unused packages and fix TypeScript errors
- Remove unused dependencies: @types/jest, babel-preset-expo
- Fix TypeScript errors after removing @types/jest
- Update jest.config.js to use correct types
- All tests pass after cleanup (97/97)
- yarn validate passes: typecheck ✅ lint ✅ tests ✅

Reduces bundle size by ~2.3MB
```

**Why this works**:

- Lists what was removed
- Mentions cleanup work (fixing errors)
- Impact quantified (bundle size)

### Example 11: Configuration Update

```
🔧 chore: improve Node config portability and enhance documentation
- Add .nvmrc file for consistent Node version (22.12) across team
- Configure portable nvm setup in ios/.xcode.env for Xcode builds
- Remove machine-specific ios/.xcode.env.local and add to .gitignore
- Enhance README with comprehensive improvements:
    * Add 3 rows of technology and quality badges
    * Document import path aliases (@app)
    * Add internationalization details (English, Spanish)
    * Document environment variables and iOS build schemes
    * Add testing coverage thresholds (85% enforcement)
    * Document testing utilities in src/test-utils/
    * Add troubleshooting for Node version issues in Xcode
    * Improve Quick Start with .env verification step
    * Update project structure to match actual folders

This commit improves developer onboarding and ensures consistent Node.js
configuration across different development machines.
```

**Why this works**:

- Nested bullets for related sub-changes
- Closing paragraph summarizes benefits
- Natural language, conversational tone

## Documentation Examples

### Example 12: Planning Docs

```
📝 docs(planning): create complete hierarchical epic/story/task structure for
React Native optimizations
- Create 4 Epics for major optimization initiatives
- Create 4 User Stories mapping to user problems
- Create 26 Tasks with technical implementation details
- Add comprehensive README with role-based navigation
- Add TEMPLATE.md with examples for future tasks
- Use UK English throughout (organisation, behaviour, etc.)

Structure provides clear Epic → User Story → Task hierarchy with
full cross-referencing for traceability.
```

**Why this works**:

- Quantified deliverables (4 epics, 4 stories, 26 tasks)
- Calls out UK English standard
- Explains purpose in closing paragraph

## Anti-Patterns to Avoid

### ❌ Bad: AI-style formality

```
🔧 chore(config): update configuration files to utilize modern patterns
This commit is responsible for updating the configuration files in order to
leverage modern patterns. Additionally, the implementation facilitates better
developer experience going forward.

- Modified configuration
- Enhanced patterns
- Optimized workflow
```

**Problems**:

- "Utilize", "leverage", "facilitate" = AI words
- "This commit is responsible for" = robotic
- "Additionally" = formal connector
- Vague bullets ("Modified configuration" - what specifically?)

### ✅ Good: Natural human style

```
🔧 chore(config): modernize ESLint and Prettier setup
Update config files to use ESLint 9 flat config and integrate Prettier.

- Migrate from .eslintrc.js to eslint.config.js (flat config)
- Add Prettier integration with eslint-plugin-prettier
- Configure import sorting with simple-import-sort
- All files reformatted with new rules
```

**Why this works**:

- "Modernize", "update", "use" = natural words
- Direct statement, no "this commit"
- "And" instead of "additionally"
- Specific changes listed

### ❌ Bad: Too technical, no context

```
⚡ perf: add React.memo
- Add React.memo to component
```

**Problems**:

- Which component?
- Why add it?
- What's the impact?
- Did tests pass?

### ✅ Good: Context with impact

```
⚡ perf(components): wrap ButtonWithChevron with React.memo
- Prevents unnecessary re-renders in Settings list
- Reduces re-renders by 70%
- All tests pass
```

## Writing Guidelines Summary

**Subject Line**:

- Imperative mood: "add", "fix", "update" (not "added", "fixes", "updates")
- Include scope in parentheses when helpful
- Under 72 characters
- Specific and descriptive

**Body**:

- Use bullet points with `-` prefix
- Start bullets with capital letter
- Be specific about what changed
- Include quantified impact when possible
- Mention validation status
- Natural language, no AI formality
- Conversational tone

**What to Include**:

- Specific file/component names
- Quantified metrics (% improvement, test count)
- Related task/epic references
- Breaking changes or important notes
- Dependencies or follow-up work needed

**What to Avoid**:

- AI attribution or mentions
- Robotic formal language
- Vague descriptions
- Batching unrelated changes
- Missing validation status
