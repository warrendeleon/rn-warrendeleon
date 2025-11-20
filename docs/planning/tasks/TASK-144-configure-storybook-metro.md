# TASK-144: Configure Storybook Metro & Entry

**Task ID**: TASK-144
**Title**: Configure Storybook Metro & Entry
**Epic**: [EPIC-016: Storybook Re-integration](../epics/EPIC-016-storybook-reintegration.md)
**User Story**: [US-028: Storybook Setup and Stories](../stories/US-028-storybook-setup-and-stories.md)
**Status**: ✅ Done
**Priority**: High
**Effort**: 2h
**Created**: 2025-11-18
**Assigned To**: Warren de Leon
**Category**: Configuration

---

## Overview

Configure Metro bundler to work with Storybook using the `withStorybook` wrapper and set up the entry point for Storybook mode.

---

## Step-by-Step Implementation Guide

### Phase 1: Metro Configuration (45 minutes)

#### 1.1 Backup Current Metro Config

```bash
# Create backup
cp metro.config.js metro.config.js.backup
```

#### 1.2 Update metro.config.js

Replace the current `metro.config.js` with:

```javascript
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const withStorybook = require('@storybook/react-native/metro/withStorybook');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 */
const config = {
  // Your existing config options here
};

const mergedConfig = mergeConfig(defaultConfig, config);

// Wrap with Storybook
module.exports = withStorybook(mergedConfig, {
  // Enable Storybook
  enabled: true,
  // Path to Storybook config directory
  configPath: path.resolve(__dirname, './.rnstorybook'),
});
```

#### 1.3 Verify Metro Config Syntax

```bash
# Test the Metro config loads correctly
node -e "require('./metro.config.js')"

# Should complete without errors
```

---

### Phase 2: Storybook Entry Configuration (30 minutes)

#### 2.1 Review .rnstorybook/index.tsx

The init command should have created this file. Verify it contains:

```typescript
import { view } from './storybook.requires';

const StorybookUIRoot = view.getStorybookUI({
  // Options
});

export default StorybookUIRoot;
```

If not present, create it:

```typescript
// .rnstorybook/index.tsx
import { view } from './storybook.requires';

const StorybookUIRoot = view.getStorybookUI({
  storage: {
    getItem: async (key: string) => {
      return null;
    },
    setItem: async (key: string, value: string) => {
      // Optional: persist Storybook state
    },
  },
});

export default StorybookUIRoot;
```

#### 2.2 Configure preview.ts

Update `.rnstorybook/preview.ts` with global decorators:

```typescript
// .rnstorybook/preview.ts
import type { Preview } from '@storybook/react-native';
import React from 'react';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '../gluestack-ui.config';

const preview: Preview = {
  decorators: [
    (Story) => (
      <GluestackUIProvider config={config}>
        <Story />
      </GluestackUIProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
```

---

### Phase 3: App Entry Point Configuration (30 minutes)

#### 3.1 Update index.js for Storybook Toggle

Modify the root `index.js` to conditionally load Storybook:

```javascript
// index.js
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Toggle this to true to show Storybook instead of your app
const SHOW_STORYBOOK = false;

let AppEntryPoint = App;

if (SHOW_STORYBOOK) {
  AppEntryPoint = require('./.rnstorybook').default;
}

AppRegistry.registerComponent(appName, () => AppEntryPoint);
```

**Note**: This is a simple toggle. TASK-146 will implement a proper development menu toggle.

---

### Phase 4: Generate Story Requirements (15 minutes)

#### 4.1 Run Story Generator

Storybook needs to generate `storybook.requires.ts` based on your stories pattern:

```bash
# Generate story requirements
yarn storybook-generate
```

**If the command doesn't exist**, add to `package.json` scripts:

```json
{
  "scripts": {
    "storybook-generate": "sb-rn-get-stories"
  }
}
```

Then run:

```bash
yarn storybook-generate
```

#### 4.2 Verify Generated File

Check `.rnstorybook/storybook.requires.ts` was created/updated:

```bash
cat .rnstorybook/storybook.requires.ts
```

Should contain imports for any existing stories.

---

### Phase 5: Test Storybook Launch (30 minutes)

#### 5.1 Start Metro with Cache Clear

```bash
# Clear cache and start Metro
yarn start:reset
```

#### 5.2 Enable Storybook Mode

Temporarily enable Storybook in `index.js`:

```javascript
const SHOW_STORYBOOK = true; // Change to true
```

#### 5.3 Run iOS App

```bash
# Build and run iOS
yarn ios
```

**Expected Result**: App should launch showing Storybook UI with no stories (since we haven't created any yet).

#### 5.4 Verify Storybook UI Appears

You should see:

- Storybook header with navigation
- Empty story list (no stories yet)
- No crashes or errors

#### 5.5 Revert Storybook Toggle

After testing, revert to normal app mode:

```javascript
const SHOW_STORYBOOK = false; // Change back to false
```

---

## Troubleshooting Guide

### Issue 1: "Cannot find module '@storybook/react-native/metro/withStorybook'"

**Cause**: Storybook not installed correctly

**Solution**:

```bash
# Reinstall Storybook
yarn add -D @storybook/react-native@^10.0.7
```

### Issue 2: Metro Bundler Crashes on Start

**Cause**: Invalid metro.config.js syntax

**Solution**:

```bash
# Test config in isolation
node -e "require('./metro.config.js')"

# If error, restore backup
cp metro.config.js.backup metro.config.js
```

### Issue 3: "Unable to resolve './storybook.requires'"

**Cause**: Story requirements not generated

**Solution**:

```bash
# Generate story requirements
yarn storybook-generate

# Or manually create empty file
touch .rnstorybook/storybook.requires.ts
```

### Issue 4: App Crashes with GluestackUIProvider Error

**Cause**: Preview decorator referencing missing config

**Solution**: Verify `gluestack-ui.config.ts` exports `config` properly.

### Issue 5: Stories Pattern Not Finding Files

**Cause**: Incorrect stories glob pattern in main.ts

**Solution**: Update `.rnstorybook/main.ts`:

```typescript
stories: [
  '../src/components/**/*.stories.?(ts|tsx|js|jsx)',
  '../src/**/*.stories.?(ts|tsx|js|jsx)',  // Broader pattern
],
```

---

## Verification Checklist

- [x] `metro.config.js` uses `withStorybook` wrapper
- [x] `.rnstorybook/index.tsx` exports StorybookUIRoot
- [x] `.rnstorybook/preview.ts` has GluestackUIProvider decorator
- [x] `index.js` has Storybook toggle (currently set to `false`)
- [x] `storybook-generate` script added to package.json
- [x] `storybook.requires.ts` generated
- [x] Storybook UI launches successfully on iOS (tested with toggle)
- [x] App mode works normally with toggle set to `false`

---

## Acceptance Criteria

- [x] Metro config properly wraps with `withStorybook`
- [x] Storybook entry point configured correctly
- [x] Global decorators set up (GluestackUIProvider)
- [x] Toggle mechanism working in index.js
- [x] Story generator script configured
- [x] Storybook launches without errors

---

## Definition of Done

- [x] All acceptance criteria met
- [x] TypeScript compilation passes
- [x] Storybook UI visible when enabled
- [x] Normal app mode works when disabled
- [x] Ready for TASK-145 (addons installation)

---

## Notes

- **Metro Wrapper**: The `withStorybook` approach is the v10 standard - don't use manual config
- **Story Pattern**: Component stories should be in same directory as component
- **Toggle Method**: Simple constant toggle for now; proper dev menu in TASK-146

**Last Updated**: 2025-11-18
