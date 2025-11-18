# TASK-139: Replace React Native Primitives with GlueStack UI

**Task ID**: TASK-139
**Epic**: [EPIC-014](../epics/EPIC-014-performance-quality-phase-2.md)
**User Story**: [US-027](../stories/US-027-code-quality-tech-debt.md)
**Status**: 📋 Not Started
**Priority**: 🔴 High
**Effort**: 10 hours

## Context

Comprehensive codebase audit revealed 13 files using RN `<View />` instead of GlueStack `<Box />`, 10 files using RN `<Text />` instead of GlueStack `<Text />`, and 2 files using `<TouchableOpacity />` instead of GlueStack `<Pressable />`.

This creates inconsistent styling patterns and prevents leveraging GlueStack's token system and NativeWind utilities.

**Related**: See `.claude/docs/react-patterns.md` for full component selection standards and migration patterns.

## Technical Details

### Migration Pattern

**Before (RN primitives)**:

```typescript
import {View, Text, TouchableOpacity} from 'react-native';

<View style={{flex: 1, padding: 16}}>
  <Text style={{fontSize: 14, color: '#000000'}}>Hello</Text>
  <TouchableOpacity onPress={handlePress}>
    <Text>Press Me</Text>
  </TouchableOpacity>
</View>
```

**After (GlueStack UI)**:

```typescript
import {Box, Text, Pressable} from '@gluestack-ui/themed';

<Box flex={1} p="$4">
  <Text fontSize="$sm" color="$textDark950">Hello</Text>
  <Pressable onPress={handlePress}>
    <Text>Press Me</Text>
  </Pressable>
</Box>
```

### Files to Migrate

#### Replace RN `<View />` → GlueStack `<Box />` (13 files, ~45 instances)

1. **HomeScreen.tsx** (`src/features/Home/HomeScreen.tsx`)
   - 4 instances at lines 181, 191, 202, 213

2. **SplashScreen.tsx** (`src/features/Splash/SplashScreen.tsx`)
   - 1 instance at line 37

3. **ProfileScreen.tsx** (`src/features/Profile/ProfileScreen.tsx`)
   - 13 instances at lines 214, 215, 233, 252, 269, 271, 282, 297, etc.

4. **EducationScreen.tsx** (`src/features/Education/EducationScreen.tsx`)
   - 1 instance at line 72

5. **WorkExperienceScreen.tsx** (`src/features/WorkExperience/WorkExperienceScreen.tsx`)
   - 1 instance at line 100

6. **WorkExperienceClientsScreen.tsx** (`src/features/WorkExperience/WorkExperienceClientsScreen.tsx`)
   - 1 instance at line 87

7. **WorkExperienceDetailsScreen.tsx** (`src/features/WorkExperience/WorkExperienceDetailsScreen.tsx`)
   - 10 instances at lines 63, 76, 81, 100, 132, 145, 165, 203, 249, 286

8. **ButtonGroup.tsx** (`src/components/ButtonGroup/ButtonGroup.tsx`)
   - 1 instance at line 29

9. **ButtonGroupDivider.tsx** (`src/components/ButtonGroupDivider/ButtonGroupDivider.tsx`)
   - 1 instance at line 25

10. **DetailListGroup.tsx** (`src/components/DetailListGroup/DetailListGroup.tsx`)
    - 7 instances at lines 33, 45, 52, 65, 71, 80, 95

11. **MockStatusScreen.tsx** (`src/features/MockStatus/MockStatusScreen.tsx`)
    - 4 instances at lines 62, 133, 140, 151

12. **LanguageScreen.tsx** (`src/features/Settings/LanguageScreen.tsx`)
    - 1 instance at line 58

13. **AppearanceScreen.tsx** (`src/features/Settings/AppearanceScreen.tsx`)
    - 1 instance at line 55

#### Replace RN `<Text />` → GlueStack `<Text />` (10 files, ~32 instances)

1. **EducationScreen.tsx** - 1 instance at line 73
2. **WorkExperienceScreen.tsx** - 1 instance at line 101
3. **WorkExperienceClientsScreen.tsx** - 1 instance at line 91
4. **WorkExperienceDetailsScreen.tsx** - 12 instances at lines 69, 96, 145, 148, 216, 226, 237, 262, 268, etc.
5. **ProfileDataScreen.tsx** - 4 instances at lines 31, 40, 46, 55
6. **DetailListGroup.tsx** - 5 instances at lines 46, 72, 76, 83, 84
7. **WebViewScreen.tsx** - 4 instances at lines 89, 105, 106, 122
8. **PDFScreen.tsx** - 3 instances at lines 105, 121, 122

#### Replace RN `<TouchableOpacity />` → GlueStack `<Pressable />` (2 files)

1. **PDFScreen.tsx** (`src/features/PDF/PDFScreen.tsx`)
   - 1 instance at lines 75-80 (share button in header)

2. **DetailListGroup.tsx** (`src/components/DetailListGroup/DetailListGroup.tsx`)
   - 1 instance at lines 55-93 (list item wrapper)

### Migration Strategy

**Approach**: Migrate one file at a time, test, and commit incrementally.

**For each file**:

1. Update imports: `import {Box, Text, Pressable} from '@gluestack-ui/themed';`
2. Replace component names: `<View>` → `<Box>`, `<Text>` → `<Text>`, `<TouchableOpacity>` → `<Pressable>`
3. Convert inline styles to GlueStack props:
   - `style={{flex: 1}}` → `flex={1}`
   - `style={{padding: 16}}` → `p="$4"`
   - `style={{backgroundColor: '#FFFFFF'}}` → `bg="$white"`
4. Run tests: `yarn test <filename>`
5. Visual regression check (compare screenshots)
6. Commit: `♻️ refactor(<feature>): replace RN primitives with GlueStack UI`

### Token Conversion Reference

| RN Inline Style             | GlueStack Prop         |
| --------------------------- | ---------------------- |
| `{flex: 1}`                 | `flex={1}`             |
| `{padding: 16}`             | `p="$4"`               |
| `{margin: 8}`               | `m="$2"`               |
| `{backgroundColor: '#FFF'}` | `bg="$white"`          |
| `{fontSize: 14}`            | `fontSize="$sm"`       |
| `{color: '#000'}`           | `color="$textDark950"` |
| `{borderRadius: 8}`         | `borderRadius="$md"`   |

**Full token reference**: See GlueStack UI docs or `.claude/docs/react-patterns.md`

## Acceptance Criteria

### View → Box Migration

- [ ] All 13 files migrated from RN View to GlueStack Box
- [ ] All ~45 instances replaced
- [ ] Styling matches exactly (no visual regressions)
- [ ] Unit tests passing for all migrated files

### Text → GlueStack Text Migration

- [ ] All 10 files migrated from RN Text to GlueStack Text
- [ ] All ~32 instances replaced
- [ ] Token-based font sizes and colors used
- [ ] Unit tests passing for all migrated files

### TouchableOpacity → Pressable Migration

- [ ] PDFScreen.tsx share button using GlueStack Pressable
- [ ] DetailListGroup.tsx list items using GlueStack Pressable
- [ ] Interaction behaviour matches exactly (opacity, active state)
- [ ] Unit tests passing

### Testing & Validation

- [ ] `yarn validate` passing (typecheck + lint + all tests)
- [ ] Visual regression testing complete (screenshots compared)
- [ ] E2E tests passing (if affected screens have E2E coverage)
- [ ] No styling regressions reported

## Definition of Done

- All React Native primitives (View, Text, TouchableOpacity) replaced with GlueStack UI equivalents
- Consistent use of GlueStack tokens ($colors, $space, $sizes, $fontSizes)
- All files using inline props with GlueStack (no StyleSheet.create for GlueStack components)
- All unit tests passing
- `yarn validate` passing
- No visual regressions
- Incremental commits for each file or group of related files

**Last Updated**: 2025-01-17
