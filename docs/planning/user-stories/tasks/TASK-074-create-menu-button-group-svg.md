# TASK-074: Create MenuButtonGroupSvg Component

**Epic**: [EPIC-009: Education Display Enhancement](../epics/EPIC-009-education-display-enhancement.md)
**User Story**: [US-016: Education Screen with SVG Logos](../stories/US-016-education-screen-svg-logos.md)
**Status**: ⭕ Not Started
**Priority**: High
**Estimated Effort**: 1.5 hours
**Created**: 2025-11-15

---

## Context

Create a reusable MenuButtonGroupSvg component that displays a list of menu buttons with SVG logos. This component will be used initially for the Education screen but designed to be reusable for WorkXP, skills, and other logo-based lists.

The component is similar to the existing ChevronButtonGroup but includes SVG logo rendering capability.

## Technical Details

### Component Location

```
src/components/MenuButtonGroupSvg/
├── MenuButtonGroupSvg.tsx
├── index.ts
└── __tests__/
    └── MenuButtonGroupSvg.rntl.tsx
```

### TypeScript Interface

```typescript
export interface MenuButtonGroupSvgItem {
  id: string;
  label: string;
  subtitle?: string;
  logoUri: string; // Local SVG file path or remote URL
  onPress?: () => void;
  testID?: string;
  showChevron?: boolean;
}

export interface MenuButtonGroupSvgProps {
  items: MenuButtonGroupSvgItem[];
  loading?: boolean;
  error?: string;
}
```

### Implementation

**File**: `src/components/MenuButtonGroupSvg/MenuButtonGroupSvg.tsx`

```typescript
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { ChevronRight } from 'lucide-react-native';

import { useAppColorScheme } from '@app/hooks';

export interface MenuButtonGroupSvgItem {
  id: string;
  label: string;
  subtitle?: string;
  logoUri: string;
  onPress?: () => void;
  testID?: string;
  showChevron?: boolean;
}

export interface MenuButtonGroupSvgProps {
  items: MenuButtonGroupSvgItem[];
  loading?: boolean;
  error?: string;
}

export const MenuButtonGroupSvg: React.FC<MenuButtonGroupSvgProps> = ({
  items,
  loading,
  error,
}) => {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#000000'} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <Text style={[styles.errorText, { color: '#FF3B30' }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.buttonGroup, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <TouchableOpacity
            testID={item.testID}
            style={styles.button}
            onPress={item.onPress}
            activeOpacity={item.onPress ? 0.7 : 1}
            disabled={!item.onPress}
          >
            <View style={styles.logoContainer}>
              <SvgUri uri={item.logoUri} width={40} height={40} />
            </View>

            <View style={styles.contentContainer}>
              <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {item.label}
              </Text>
              {item.subtitle && (
                <Text style={[styles.subtitle, { color: '#8E8E93' }]}>
                  {item.subtitle}
                </Text>
              )}
            </View>

            {(item.showChevron ?? true) && item.onPress && (
              <ChevronRight size={20} color="#8E8E93" />
            )}
          </TouchableOpacity>

          {index < items.length - 1 && (
            <View style={[styles.divider, { backgroundColor: isDark ? '#38383A' : '#C6C6C8' }]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
  },
  buttonGroup: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 60,
  },
  logoContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 78, // Align with text, not logo
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
```

### Barrel Export

**File**: `src/components/MenuButtonGroupSvg/index.ts`

```typescript
export { MenuButtonGroupSvg } from './MenuButtonGroupSvg';
export type { MenuButtonGroupSvgItem, MenuButtonGroupSvgProps } from './MenuButtonGroupSvg';
```

### Update Components Index

**File**: `src/components/index.ts`

Add export:

```typescript
export * from './MenuButtonGroupSvg';
```

### Files Affected

- `src/components/MenuButtonGroupSvg/MenuButtonGroupSvg.tsx` - New component
- `src/components/MenuButtonGroupSvg/index.ts` - New barrel export
- `src/components/index.ts` - Add MenuButtonGroupSvg export

## Acceptance Criteria

- ✅ MenuButtonGroupSvg component created
- ✅ TypeScript interfaces defined with proper types
- ✅ SVG logos render correctly at 40x40 size
- ✅ Loading state shows ActivityIndicator
- ✅ Error state displays error message
- ✅ Dark mode fully supported
- ✅ Chevron icon appears when item has onPress
- ✅ Dividers between items (except last)
- ✅ Tappable with proper opacity feedback
- ✅ Disabled state when no onPress handler
- ✅ Subtitle support (optional second line)
- ✅ Proper spacing and alignment
- ✅ Component exported from components index

## Test Scenarios

### Scenario 1: Render with items

**GIVEN** MenuButtonGroupSvg receives valid items
**WHEN** the component renders
**THEN** each item should display with logo, label, and chevron
**AND** dividers should appear between items
**AND** logos should render at correct size

### Scenario 2: Handle press

**GIVEN** an item has an onPress handler
**WHEN** I tap that item
**THEN** the onPress handler should be called
**AND** opacity should change during press

### Scenario 3: Loading state

**GIVEN** loading prop is true
**WHEN** the component renders
**THEN** I should see an ActivityIndicator
**AND** no items should be visible

### Scenario 4: Error state

**GIVEN** error prop has a message
**WHEN** the component renders
**THEN** I should see the error message
**AND** no items should be visible

### Scenario 5: Dark mode

**GIVEN** the app is in dark mode
**WHEN** the component renders
**THEN** background should be dark (#1C1C1E)
**AND** text should be light (#FFFFFF)
**AND** dividers should be dark (#38383A)

## Dependencies

**Prerequisites**:

- ✅ react-native-svg installed
- ✅ TASK-073: SVG logo assets available

**Enables**:

- TASK-075: Update EducationDataScreen UI
- Future: WorkXP screen implementation
- Future: Skills display implementation

## Success Criteria

- Component renders SVG logos reliably
- Dark mode support complete
- Reusable for other features
- Type-safe props and exports
- Proper loading and error states
- Professional iOS-style design

## Notes

- Component design matches ChevronButtonGroup for consistency
- SVG logos cached by react-native-svg for performance
- Divider margin aligns with text, not logo (iOS standard)
- Chevron optional via showChevron prop
- Subtitle optional for flexibility
- Component is feature-agnostic and reusable
