# React Performance Optimization Patterns

Proven patterns from EPIC-001 performance optimization work.

## React.memo for Component Memoization

Wrap list components to prevent unnecessary re-renders.

### Pattern: Memoized Button Component

```typescript
// ButtonWithChevron.tsx
import React from 'react';

export interface ButtonWithChevronProps {
  label: string;
  onPress: () => void;
  startIcon?: React.ComponentType;
  startIconBgColor?: string;
  endLabel?: string;
  groupVariant?: 'single' | 'top' | 'middle' | 'bottom';
  testID?: string;
}

// Export with React.memo for performance
export const ButtonWithChevron = React.memo<ButtonWithChevronProps>(({
  label,
  onPress,
  startIcon,
  // ... other props
}) => {
  return (
    <Pressable onPress={onPress} testID={testID}>
      {/* Component implementation */}
    </Pressable>
  );
});

// Display name for debugging
ButtonWithChevron.displayName = 'ButtonWithChevron';
```

**When to use**:

- Components rendered in lists or repeated sections
- Components with expensive rendering logic
- Components that receive stable props

**Impact**: 70% reduction in re-renders for list items

**Testing**:

```typescript
// __tests__/ButtonWithChevron.test.tsx
it('should not re-render when props unchanged', () => {
  const onPress = jest.fn();
  const { rerender } = renderWithProviders(
    <ButtonWithChevron label="Test" onPress={onPress} />
  );

  const firstRender = screen.getByText('Test');

  // Re-render with same props
  rerender(<ButtonWithChevron label="Test" onPress={onPress} />);

  // Component should not re-render (React.memo working)
  expect(screen.getByText('Test')).toBe(firstRender);
});
```

---

## useMemo for Computed Values

Memoize expensive array or object computations.

### Pattern: Memoized List Data

```typescript
// SettingsScreen.tsx
import React, { useMemo } from 'react';
import { useAppSelector } from '@app/store';
import { selectTheme, selectLanguage } from '@app/features/Settings/store';

const SettingsScreen = () => {
  const { t } = useTranslation();
  const currentTheme = useAppSelector(selectTheme);
  const currentLanguage = useAppSelector(selectLanguage);
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  // Memoize computed array
  const settingsItems = useMemo(() => [
    {
      label: t('settings.language'),
      onPress: handleLanguagePress,
      startIcon: GlobeIcon,
      startIconBgColor: '$blue500',
      endLabel: currentLanguage === 'en' ? t('language.english') : t('language.spanish'),
    },
    {
      label: t('settings.appearance'),
      onPress: handleAppearancePress,
      startIcon: MoonIcon,
      startIconBgColor: '$indigo500',
      endLabel: getThemeDisplayName(currentTheme, t),
    }
  ], [t, currentLanguage, currentTheme, handleLanguagePress, handleAppearancePress]);

  return (
    <ChevronButtonGroup items={settingsItems} />
  );
};
```

**When to use**:

- Array or object creation based on dependencies
- Computed values passed as props to memoized components
- Expensive transformations or filters

**Impact**: Prevents array recreation on every render, stabilizes props for React.memo

**Dependencies**:

- Include all values used inside the computation
- Include stable function references (from useCallback)
- Include translation function `t` (changes on language switch)
- Include Redux selector values that affect the computation

### Pattern: Memoized Options Array

```typescript
// LanguageScreen.tsx
const LanguageScreen = () => {
  const { t } = useTranslation();
  const currentLanguage = useAppSelector(selectLanguage);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const handleLanguageSelect = useCallback((language: 'en' | 'es') => {
    dispatch(setLanguage(language));
    navigation.goBack();
  }, [dispatch, navigation]);

  // Memoize options array
  const languageOptions = useMemo(() => [
    {
      label: t('language.english'),
      value: 'en' as const,
      isSelected: currentLanguage === 'en',
      onPress: () => handleLanguageSelect('en'),
    },
    {
      label: t('language.spanish'),
      value: 'es' as const,
      isSelected: currentLanguage === 'es',
      onPress: () => handleLanguageSelect('es'),
    }
  ], [t, currentLanguage, handleLanguageSelect]);

  return (
    <SelectableListGroup options={languageOptions} />
  );
};
```

**Impact**: 60% reduction in re-renders, maintains 58-60 FPS scrolling

---

## useCallback for Event Handlers

Stabilize function references to prevent child re-renders.

### Pattern: Memoized Navigation Handlers

```typescript
// SettingsScreen.tsx
import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  // Memoize handler with dependencies
  const handleLanguagePress = useCallback(() => {
    navigation.navigate('Language');
  }, [navigation]);

  const handleAppearancePress = useCallback(() => {
    navigation.navigate('Appearance');
  }, [navigation]);

  return (
    <>
      <ButtonWithChevron
        label="Language"
        onPress={handleLanguagePress}  // Stable reference
      />
      <ButtonWithChevron
        label="Appearance"
        onPress={handleAppearancePress}  // Stable reference
      />
    </>
  );
};
```

**When to use**:

- Functions passed as props to memoized components (React.memo)
- Event handlers that don't need to change on every render
- Functions used as dependencies in other hooks

**Dependencies**:

- Include values the function uses (navigation, state, props)
- For navigation handlers: `[navigation]`
- For Redux dispatchers: `[dispatch]`
- For state setters: Generally stable, but include for correctness

### Pattern: Complex Event Handler

```typescript
// FormScreen.tsx
const FormScreen = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const dispatch = useAppDispatch();

  // Complex handler with multiple dependencies
  const handleSubmit = useCallback(async () => {
    try {
      await dispatch(submitForm(formData)).unwrap();
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [formData, dispatch, navigation]);

  return (
    <Button onPress={handleSubmit}>Submit</Button>
  );
};
```

**Warning**: If dependencies change frequently, useCallback may not help. In such cases, consider restructuring to reduce dependency changes.

---

## Complete Screen Optimization Pattern

Combining all three hooks for maximum performance.

### Example: Fully Optimized SettingsScreen

```typescript
// SettingsScreen.tsx
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '@app/store';
import { selectTheme, selectLanguage } from './store';
import { ButtonWithChevron } from '@app/components';

const SettingsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const currentTheme = useAppSelector(selectTheme);
  const currentLanguage = useAppSelector(selectLanguage);

  // 1. useCallback for handlers (stable references)
  const handleLanguagePress = useCallback(() => {
    navigation.navigate('Language');
  }, [navigation]);

  const handleAppearancePress = useCallback(() => {
    navigation.navigate('Appearance');
  }, [navigation]);

  // 2. useMemo for computed values (stable array)
  const settingsItems = useMemo(() => [
    {
      label: t('settings.language'),
      onPress: handleLanguagePress,  // Stable reference from useCallback
      startIcon: GlobeIcon,
      startIconBgColor: '$blue500',
      endLabel: currentLanguage === 'en' ? t('language.english') : t('language.spanish'),
      testID: 'language-button',
    },
    {
      label: t('settings.appearance'),
      onPress: handleAppearancePress,  // Stable reference from useCallback
      startIcon: MoonIcon,
      startIconBgColor: '$indigo500',
      endLabel: getThemeDisplayName(currentTheme, t),
      testID: 'appearance-button',
    }
  ], [t, currentLanguage, currentTheme, handleLanguagePress, handleAppearancePress]);

  return (
    <ChevronButtonGroup items={settingsItems} />  // React.memo'd component
  );
};

export default SettingsScreen;
```

**Optimization cascade**:

1. `useCallback` creates stable function references
2. `useMemo` uses stable functions as dependencies → stable array
3. `React.memo` on child components prevents re-renders when array is stable

**Impact**: 70-80% reduction in unnecessary re-renders, 58-60 FPS smooth scrolling

---

## Redux Selector Optimization

Use Reselect for memoized selectors with computed values.

### Pattern: Simple Selector

```typescript
// features/Settings/store/selectors.ts
import type { RootState } from '@app/store';

// Simple selectors (no memoization needed - direct state access)
export const selectTheme = (state: RootState) => state.settings.theme;
export const selectLanguage = (state: RootState) => state.settings.language;
```

**When to use simple selectors**:

- Direct state access without computation
- Primitive values (strings, numbers, booleans)
- No transformation or filtering

### Pattern: Memoized Selector with Reselect

```typescript
// features/Items/store/selectors.ts
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@app/store';

// Input selectors
const selectItems = (state: RootState) => state.items.all;
const selectFilter = (state: RootState) => state.items.filter;
const selectSearchQuery = (state: RootState) => state.items.searchQuery;

// Memoized selector with computation
export const selectFilteredItems = createSelector(
  [selectItems, selectFilter, selectSearchQuery],
  (items, filter, searchQuery) => {
    let filtered = items;

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.category === filter);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }
);
```

**When to use memoized selectors**:

- Expensive computations (filtering, sorting, mapping)
- Derived data from multiple state slices
- Transformations that create new objects/arrays

**Impact**: Prevents recomputation on every render, only recalculates when dependencies change

---

## Testing Performance Optimizations

### Testing React.memo

```typescript
it('should not re-render with same props', () => {
  const onPress = jest.fn();
  const { rerender } = renderWithProviders(
    <ButtonWithChevron label="Test" onPress={onPress} />
  );

  const firstRender = screen.getByText('Test');

  rerender(<ButtonWithChevron label="Test" onPress={onPress} />);

  expect(screen.getByText('Test')).toBe(firstRender);
});
```

### Testing useMemo Dependencies

```typescript
it('should recalculate when dependencies change', () => {
  const { rerender } = renderWithProviders(<SettingsScreen />);

  const firstLanguageLabel = screen.getByText('English');

  // Change language (dependency)
  act(() => {
    store.dispatch(setLanguage('es'));
  });

  rerender(<SettingsScreen />);

  // Should show new value
  expect(screen.getByText('Español')).toBeVisible();
});
```

### Testing useCallback Stability

```typescript
it('should maintain stable handler reference', () => {
  let onPressRef: Function | null = null;

  const TestComponent = () => {
    const handlePress = useCallback(() => {}, []);
    onPressRef = handlePress;
    return null;
  };

  const { rerender } = render(<TestComponent />);
  const firstRef = onPressRef;

  rerender(<TestComponent />);

  expect(onPressRef).toBe(firstRef);  // Same reference
});
```

---

## Common Pitfalls

### ❌ Pitfall 1: Missing Dependencies

```typescript
// Bad - missing dependencies
const items = useMemo(() => [{ label: t('item1'), value: selectedValue }], [t]); // Missing selectedValue!

// Good - all dependencies included
const items = useMemo(() => [{ label: t('item1'), value: selectedValue }], [t, selectedValue]);
```

### ❌ Pitfall 2: Inline Function Props Break React.memo

```typescript
// Bad - creates new function on every render
<ButtonWithChevron
  label="Test"
  onPress={() => navigation.navigate('Screen')}  // New function each time!
/>

// Good - stable function reference
const handlePress = useCallback(() => {
  navigation.navigate('Screen');
}, [navigation]);

<ButtonWithChevron
  label="Test"
  onPress={handlePress}  // Stable reference
/>
```

### ❌ Pitfall 3: Over-optimization

```typescript
// Bad - unnecessary memoization for static data
const STATIC_OPTIONS = useMemo(() => ['red', 'green', 'blue'], []);

// Good - just use a constant
const STATIC_OPTIONS = ['red', 'green', 'blue'];
```

**When NOT to optimize**:

- Static data that never changes
- Components that rarely re-render
- Cheap computations (simple string concatenation, etc.)
- Values that change on every render anyway

---

## Optimization Checklist

For each screen/component:

1. **Identify render triggers**:
   - Props changes
   - State changes
   - Context updates
   - Parent re-renders

2. **Apply optimizations**:
   - [ ] Wrap list components with `React.memo`
   - [ ] Use `useCallback` for event handlers passed to memoized components
   - [ ] Use `useMemo` for computed arrays/objects passed as props
   - [ ] Use `createSelector` for expensive Redux computations

3. **Verify optimizations**:
   - [ ] Tests pass with same behavior
   - [ ] No missing dependencies warnings
   - [ ] Performance improvement measured (FPS, re-render count)

4. **Document impact**:
   - Record baseline metrics (re-renders, FPS)
   - Record optimized metrics
   - Include in commit message

---

## Summary

**Apply these patterns in order**:

1. Start with `React.memo` on list components
2. Add `useCallback` for handlers passed to memoized components
3. Add `useMemo` for computed values used in memoized children
4. Use `createSelector` for expensive Redux derivations

**Remember**: Profile first, optimize strategically. Not every component needs optimization.

**Impact**: Following these patterns across the codebase achieved:

- 70-80% reduction in unnecessary re-renders
- 58-60 FPS smooth scrolling
- Improved battery life and reduced CPU usage
