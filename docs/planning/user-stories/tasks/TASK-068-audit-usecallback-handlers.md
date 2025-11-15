# TASK-068: Audit and Add useCallback for Event Handlers

**Task ID**: TASK-068
**Title**: Audit Event Handlers and Add Missing useCallback
**User Story**: New - Performance & Code Quality
**Epic**: [EPIC-002: Quality & Reliability](../epics/EPIC-002-quality-reliability.md)
**Status**: Not Started
**Priority**: Medium
**Created**: 2025-11-15
**Effort Estimate**: 1.5 hours

---

## Description

Audit all React components for event handlers (onPress, onChange, etc.) and ensure they use `useCallback` when passed to memoized components. This prevents unnecessary re-renders and follows React performance best practices.

**Current Problem**:

- Some inline arrow functions in event handlers
- Missing useCallback wrappers for callbacks passed to React.memo'd components
- Inconsistent patterns across the codebase

**Solution**:

- Audit all components for inline event handlers
- Wrap handlers in useCallback where appropriate
- Ensure proper dependency arrays
- HomeScreen already refactored as example (completed)

---

## Acceptance Criteria

- [ ] All components audited for inline event handlers
- [ ] useCallback added where handlers are passed to memo'd components
- [ ] Dependency arrays correctly specified
- [ ] No performance regressions
- [ ] All tests still pass
- [ ] Documentation updated with useCallback guidelines

---

## Why useCallback Matters

**Performance Impact**:

- Without useCallback: New function reference on every render
- React.memo sees different reference → component re-renders unnecessarily
- With useCallback: Stable function reference → prevents re-renders

**When to Use**:

1. ✅ Passing callbacks to `React.memo'd` components
2. ✅ Callbacks used as dependencies in useEffect/useMemo
3. ✅ Event handlers in lists/frequently rendered components
4. ❌ Event handlers in components not optimized with React.memo
5. ❌ Top-level handlers that don't propagate down

**Example**:

```typescript
// ❌ Bad: New function reference every render
const MyComponent = () => {
  return <MemoizedButton onPress={() => console.log('click')} />;
};

// ✅ Good: Stable reference with useCallback
const MyComponent = () => {
  const handlePress = useCallback(() => {
    console.log('click');
  }, []);

  return <MemoizedButton onPress={handlePress} />;
};
```

---

## Implementation Details

**Audit Strategy**:

1. **Search Patterns** (0.5h):

   ```bash
   # Find inline arrow functions in onPress
   grep -r "onPress={() =>" src/features --include="*.tsx"
   grep -r "onPress={()=>" src/components --include="*.tsx"

   # Find inline arrow functions in useMemo/items arrays
   grep -r "useMemo" src/features --include="*.tsx" -A 20 | grep "onPress"
   ```

2. **Component Analysis** (0.5h):
   - Check which components use React.memo
   - Identify handlers passed to these components
   - Determine if useCallback is needed

3. **Refactoring** (0.5h):
   - Extract inline functions
   - Wrap in useCallback
   - Add correct dependency arrays
   - Update useMemo dependencies if needed

**Refactoring Example** (HomeScreen already done):

**Before**:

```typescript
const items = useMemo(
  () => [
    {
      label: 'Contact',
      onPress: () => {}, // TODO: implement
    },
  ],
  [t]
);
```

**After**:

```typescript
const handleContact = useCallback(() => {
  // TODO: implement
}, []);

const items = useMemo(
  () => [
    {
      label: 'Contact',
      onPress: handleContact,
    },
  ],
  [t, handleContact]
);
```

---

## Components to Audit

**Memoized Components** (Priority):

- `ButtonWithChevron` (React.memo) ✅
- `SelectableListButton` (React.memo) ✅
- `ButtonGroupDivider` (React.memo) ✅
- `ProfileCard` (React.memo) ✅

**Features Using Memoized Components**:

- ✅ `HomeScreen` - Already refactored (5 handlers with useCallback)
- [ ] `SettingsScreen` - Check button handlers
- [ ] `LanguageScreen` - Check selection handlers
- [ ] `AppearanceScreen` - Check theme handlers
- [ ] `ProfileDataScreen` - Check any interactive elements
- [ ] `EducationDataScreen` - Check any interactive elements
- [ ] `WorkXPDataScreen` - Check any interactive elements

**Search Commands**:

```bash
# Find all React.memo components
grep -r "React.memo" src/components --include="*.tsx"

# Find components using these memoized components
grep -r "ButtonWithChevron\|SelectableListButton\|ProfileCard" src/features --include="*.tsx"
```

---

## Technical Approach

1. **Identify Patterns** (0.25h):
   - List all React.memo'd components
   - Find features using these components
   - Check for inline handlers

2. **Prioritize Refactoring** (0.25h):
   - High: Handlers in frequently rendered lists
   - Medium: Handlers passed to memo'd components
   - Low: Handlers in rarely re-rendered components

3. **Refactor and Test** (0.75h):
   - Extract inline functions
   - Add useCallback wrappers
   - Test each component after changes
   - Verify no regressions

4. **Document Pattern** (0.25h):
   - Add to code style guide
   - Update component documentation
   - Add examples for future reference

---

## Dependency Array Guidelines

**Empty Dependencies** `[]`:

- Handler doesn't use any props or state
- Safe to use same function reference forever

**With Dependencies** `[navigation, someValue]`:

- Handler uses props, state, or other values
- Recreate when dependencies change

**Example**:

```typescript
const handlePress = useCallback(() => {
  navigation.navigate('Profile');
}, [navigation]); // Depends on navigation

const handleLog = useCallback(() => {
  console.log('Static log');
}, []); // No dependencies
```

---

## Benefits

**Performance**:

- Prevents unnecessary re-renders of memoized components
- Reduces reconciliation work in React
- Smoother UI, especially in lists

**Code Quality**:

- Consistent patterns across codebase
- Clear intent (optimized handler)
- Better integration with React DevTools profiler

**Maintainability**:

- Easier to add features to existing handlers
- Dependency tracking makes data flow explicit
- Future developers follow established pattern

---

## Edge Cases

**When NOT to Use useCallback**:

```typescript
// ❌ Don't wrap if component isn't memoized
<NonMemoizedButton onPress={() => handleClick()} />

// ✅ Just use inline if no optimization needed
<View onPress={() => console.log('click')} />
```

**When useCallback Isn't Enough**:

```typescript
// If child component isn't memoized, useCallback alone won't help
// Must also wrap child with React.memo
const MemoizedChild = React.memo(Child);
```

---

## Testing Strategy

**Before Refactoring**:

- Run full test suite: `yarn test`
- Note any performance baselines

**After Refactoring**:

- All tests must pass
- No functional changes
- Optional: Use React DevTools Profiler to verify fewer re-renders

**Validation**:

```bash
# Run tests for refactored components
yarn test src/features/Settings
yarn test src/features/Profile

# Type check
yarn typecheck

# Lint check
yarn lint
```

---

## Related Tasks

- [TASK-067](./TASK-067-refactor-tests-use-fixtures.md) - Test fixture refactoring (separate effort)
- ✅ HomeScreen refactored (completed with TASK-068 prep)

---

## Notes

This is both a performance optimization and code quality improvement. While the performance gains may be small in most cases, the consistency and best practice adherence is valuable.

**Completed Example**: HomeScreen now has 5 properly wrapped handlers:

- `handleProfilePress`
- `handleWorkPress`
- `handleEducationPress`
- `handleCV`
- `handleVideos`
- `handleContact`
- `handleBookMeeting`
- `handleGitHub`
- `handleSettings`

**Priority Justification**: Medium priority because:

- Performance impact is moderate (already using React.memo)
- Code quality improvement
- Sets good pattern for future development
- Low risk, high learning value

---

**Last Updated**: 2025-11-15
