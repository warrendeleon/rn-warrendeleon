# TASK-146: Configure Storybook Dev Toggle

**Task ID**: TASK-146
**Title**: Configure Storybook Dev Toggle
**Epic**: [EPIC-016: Storybook Re-integration](../epics/EPIC-016-storybook-reintegration.md)
**User Story**: [US-028: Storybook Setup and Stories](../stories/US-028-storybook-setup-and-stories.md)
**Status**: ✅ Done
**Priority**: Medium
**Effort**: 1h
**Created**: 2025-11-18
**Assigned To**: Warren de Leon
**Category**: Developer Experience

---

## Overview

Implement a convenient development menu toggle to switch between the main app and Storybook without changing code.

---

## Step-by-Step Implementation Guide

### Phase 1: Create Storybook Toggle Service (20 minutes)

#### 1.1 Create Toggle Service

Create `src/services/storybook-toggle.ts`:

```typescript
// src/services/storybook-toggle.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORYBOOK_KEY = '@warrendeleon/storybook-enabled';

export const StorybookToggle = {
  async isEnabled(): Promise<boolean> {
    if (__DEV__) {
      const value = await AsyncStorage.getItem(STORYBOOK_KEY);
      return value === 'true';
    }
    return false;
  },

  async toggle(): Promise<boolean> {
    if (__DEV__) {
      const current = await this.isEnabled();
      const newValue = !current;
      await AsyncStorage.setItem(STORYBOOK_KEY, newValue.toString());
      return newValue;
    }
    return false;
  },

  async enable(): Promise<void> {
    if (__DEV__) {
      await AsyncStorage.setItem(STORYBOOK_KEY, 'true');
    }
  },

  async disable(): Promise<void> {
    if (__DEV__) {
      await AsyncStorage.setItem(STORYBOOK_KEY, 'false');
    }
  },
};
```

---

### Phase 2: Update App Entry Point (20 minutes)

#### 2.1 Update index.js

Replace the simple toggle with async loading:

```javascript
// index.js
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

let AppEntryPoint;

// Check if Storybook should be shown
const loadApp = async () => {
  if (__DEV__) {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const storybookEnabled = await AsyncStorage.getItem('@warrendeleon/storybook-enabled');

    if (storybookEnabled === 'true') {
      AppEntryPoint = require('./.rnstorybook').default;
      return;
    }
  }
  AppEntryPoint = require('./App').default;
};

// Load and register
loadApp().then(() => {
  AppRegistry.registerComponent(appName, () => AppEntryPoint);
});
```

**Note**: This pattern loads the correct entry point based on AsyncStorage before registering the app.

#### 2.2 Alternative: Environment Variable Approach

If you prefer environment variables (simpler, requires rebuild):

```javascript
// index.js
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

let AppEntryPoint = App;

if (__DEV__ && process.env.STORYBOOK_ENABLED === 'true') {
  AppEntryPoint = require('./.rnstorybook').default;
}

AppRegistry.registerComponent(appName, () => AppEntryPoint);
```

Then update package.json:

```json
{
  "scripts": {
    "storybook": "STORYBOOK_ENABLED=true yarn start"
  }
}
```

---

### Phase 3: Add Dev Menu Toggle (20 minutes)

#### 3.1 Create Dev Menu Button Component

For a runtime toggle, create `src/components/DevMenu/StorybookToggleButton.tsx`:

```typescript
// src/components/DevMenu/StorybookToggleButton.tsx
import React from 'react';
import { Alert } from 'react-native';
import { Pressable, Text } from '@gluestack-ui/themed';
import DeviceInfo from 'react-native-device-info';
import { StorybookToggle } from '../../services/storybook-toggle';

export const StorybookToggleButton: React.FC = () => {
  if (!__DEV__) {
    return null;
  }

  const handleToggle = async () => {
    const willEnable = await StorybookToggle.toggle();

    Alert.alert(
      'Storybook Toggle',
      `Storybook will be ${willEnable ? 'enabled' : 'disabled'} on next app restart.`,
      [
        {
          text: 'Restart Now',
          onPress: () => {
            // Force app restart
            DeviceInfo.getApplicationName().then(() => {
              // This triggers a reload in development
              if (__DEV__) {
                const { DevSettings } = require('react-native');
                DevSettings.reload();
              }
            });
          },
        },
        { text: 'Later', style: 'cancel' },
      ]
    );
  };

  return (
    <Pressable
      onPress={handleToggle}
      p="$3"
      bg="$primary500"
      borderRadius="$md"
      accessibilityRole="button"
      accessibilityLabel="Toggle Storybook mode"
      accessibilityHint="Switches between main app and Storybook component viewer"
    >
      <Text color="$white" fontWeight="$bold">
        Toggle Storybook
      </Text>
    </Pressable>
  );
};
```

#### 3.2 Add to Settings Screen (Optional)

Add the toggle button to your Settings screen for easy access:

```typescript
// In SettingsScreen.tsx
import { StorybookToggleButton } from '../components/DevMenu/StorybookToggleButton';

// In render
{__DEV__ && (
  <StorybookToggleButton />
)}
```

---

### Phase 4: Test Toggle Functionality (15 minutes)

#### 4.1 Test Enable Storybook

1. Run app in development: `yarn ios`
2. Navigate to Settings (or wherever toggle is placed)
3. Tap "Toggle Storybook"
4. Confirm restart
5. Verify Storybook UI appears

#### 4.2 Test Disable Storybook

1. In Storybook mode, find way back to toggle (may need to use React Native dev menu)
2. Toggle off
3. Restart
4. Verify main app appears

---

## Troubleshooting Guide

### Issue 1: App Stuck on Storybook, Can't Get Back

**Solution**: Clear AsyncStorage:

```bash
# In React Native dev menu (shake device or Cmd+D in simulator)
# Select "Debug" -> Open console -> Run:
AsyncStorage.removeItem('@warrendeleon/storybook-enabled')
# Then reload app
```

Or reset simulator:

```bash
xcrun simctl erase booted
```

### Issue 2: Toggle Button Not Appearing

**Cause**: Not in **DEV** mode

**Solution**: Ensure running development build:

```bash
yarn ios  # Not yarn ios:release
```

### Issue 3: DevSettings.reload() Not Working

**Cause**: Not available in all React Native versions

**Solution**: Show alert instructing manual reload:

```typescript
Alert.alert('Restart Required', 'Please manually restart the app (Cmd+R or shake device).');
```

---

## Verification Checklist

- [x] `StorybookToggle` service created
- [x] `index.js` updated to check toggle on startup
- [x] Toggle button component created (if using runtime toggle)
- [x] Toggle enables Storybook on restart
- [x] Toggle disables Storybook on restart
- [x] Button only appears in **DEV** mode
- [x] Accessibility props on toggle button

---

## Acceptance Criteria

- [x] Development toggle mechanism implemented
- [x] Can switch to Storybook without code changes
- [x] Can switch back to main app
- [x] Toggle only available in development builds
- [x] Clear user feedback about restart requirement

---

## Definition of Done

- [x] All acceptance criteria met
- [x] Toggle tested in both directions
- [x] No production code affected
- [x] Documentation clear on usage
- [x] Ready for TASK-147 (create stories)

---

## Notes

- **Restart Required**: React Native app registration happens once at startup, so restart is needed
- **DEV Only**: All toggle code should be wrapped in `__DEV__` checks
- **Simpler Alternative**: Environment variable approach is simpler but requires rebuild

**Last Updated**: 2025-11-18
