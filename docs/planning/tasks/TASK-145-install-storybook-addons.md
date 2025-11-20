# TASK-145: Install Storybook Addons

**Task ID**: TASK-145
**Title**: Install Storybook Addons
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

Install and configure all four Storybook on-device addons: Controls, Actions, Backgrounds, and Notes. Special attention to Controls addon which requires additional native dependencies that caused previous issues.

---

## Step-by-Step Implementation Guide

### Phase 1: Install Controls Addon (45 minutes)

**⚠️ CRITICAL**: This addon caused previous issues. Follow exactly.

#### 1.1 Install Controls Addon with Dependencies

The Controls addon requires native UI components for sliders and date pickers:

```bash
# Install controls addon AND its required native dependencies
yarn add -D @storybook/addon-ondevice-controls

# Install native slider component (CRITICAL - missing this caused previous issues)
yarn add @react-native-community/slider

# Install native date picker component
yarn add @react-native-community/datetimepicker
```

#### 1.2 Install iOS Pods for Native Components

```bash
# Install pods for the new native components
cd ios && pod install && cd ..
```

**Watch for errors with**:

- `RNCSlider` pod
- `RNDateTimePicker` pod

#### 1.3 Verify Native Modules Installed

```bash
# Check slider is in pods
grep -r "RNCSlider" ios/Podfile.lock && echo "✅ Slider installed" || echo "❌ Slider missing"

# Check date picker is in pods
grep -r "RNDateTimePicker" ios/Podfile.lock && echo "✅ DatePicker installed" || echo "❌ DatePicker missing"
```

---

### Phase 2: Install Actions Addon (15 minutes)

#### 2.1 Install Actions Addon

```bash
# Install actions addon and its dependency
yarn add -D @storybook/addon-ondevice-actions @storybook/addon-actions
```

**Note**: `@storybook/addon-actions` is required as a peer dependency for the on-device version.

---

### Phase 3: Install Backgrounds Addon (10 minutes)

#### 3.1 Install Backgrounds Addon

```bash
# Install backgrounds addon
yarn add -D @storybook/addon-ondevice-backgrounds
```

This addon has no additional dependencies.

---

### Phase 4: Install Notes Addon (10 minutes)

#### 4.1 Install Notes Addon

```bash
# Install notes addon
yarn add -D @storybook/addon-ondevice-notes
```

This addon has no additional dependencies.

---

### Phase 5: Configure Addons in main.ts (20 minutes)

#### 5.1 Update .rnstorybook/main.ts

```typescript
// .rnstorybook/main.ts
import type { StorybookConfig } from '@storybook/react-native';

const main: StorybookConfig = {
  stories: ['../src/components/**/*.stories.?(ts|tsx|js|jsx)'],
  addons: [
    '@storybook/addon-ondevice-controls',
    '@storybook/addon-ondevice-actions',
    '@storybook/addon-ondevice-backgrounds',
    '@storybook/addon-ondevice-notes',
  ],
};

export default main;
```

#### 5.2 Configure Backgrounds Options (Optional)

You can preset background colours in `preview.ts`:

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
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#FFFFFF' },
        { name: 'dark', value: '#1A1A1A' },
        { name: 'gray', value: '#F5F5F5' },
      ],
    },
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

### Phase 6: Rebuild and Test (30 minutes)

#### 6.1 Clear Metro Cache

```bash
yarn start:reset
```

#### 6.2 Rebuild iOS App

**CRITICAL**: Must rebuild after adding native modules.

```bash
# Full clean rebuild
yarn clean:ios
yarn ios
```

#### 6.3 Test Addons in Storybook

1. Temporarily enable Storybook in `index.js`:

   ```javascript
   const SHOW_STORYBOOK = true;
   ```

2. Run the app:

   ```bash
   yarn ios
   ```

3. Verify each addon appears in Storybook UI:
   - **Controls tab**: Should show (empty until stories added)
   - **Actions tab**: Should show (empty until stories added)
   - **Backgrounds tab**: Should show colour options
   - **Notes tab**: Should show (empty until stories added)

4. Revert toggle:
   ```javascript
   const SHOW_STORYBOOK = false;
   ```

---

## Troubleshooting Guide

### Issue 1: "Cannot find module '@react-native-community/slider'"

**Cause**: Native slider not installed or linked

**Solution**:

```bash
# Reinstall slider
yarn add @react-native-community/slider

# Reinstall pods
cd ios && pod install && cd ..

# Rebuild app
yarn clean:ios && yarn ios
```

### Issue 2: Controls Addon Shows "Unsupported control type"

**Cause**: Slider or DatePicker not available

**Solution**: Ensure both native modules are installed and pods are updated:

```bash
yarn add @react-native-community/slider @react-native-community/datetimepicker
cd ios && pod install && cd ..
```

### Issue 3: "RNCSlider" Symbol Not Found

**Cause**: Pod not properly linked

**Solution**:

```bash
cd ios
pod deintegrate
pod install
cd ..
yarn clean:ios
yarn ios
```

### Issue 4: Actions Tab Empty After Adding Actions

**Cause**: Actions not imported in story

**Solution**: Ensure story imports `action`:

```typescript
import { action } from '@storybook/addon-actions';

export const Primary: Story = {
  args: {
    onPress: action('button-pressed'),
  },
};
```

### Issue 5: Backgrounds Not Changing

**Cause**: Background decorator not wrapping story

**Solution**: This is expected - backgrounds work by changing the Storybook canvas background, not the component background.

### Issue 6: Metro Bundler Can't Find Addon

**Cause**: Addon not in main.ts addons array

**Solution**: Verify `.rnstorybook/main.ts` has all four addons listed.

---

## Verification Checklist

### Packages Installed

- [x] `@storybook/addon-ondevice-controls` in devDependencies
- [x] `@react-native-community/slider` in dependencies
- [x] `@react-native-community/datetimepicker` in dependencies
- [x] `@storybook/addon-ondevice-actions` in devDependencies
- [x] `@storybook/addon-actions` in devDependencies
- [x] `@storybook/addon-ondevice-backgrounds` in devDependencies
- [x] `@storybook/addon-ondevice-notes` in devDependencies

### Configuration

- [x] All four addons listed in `.rnstorybook/main.ts`
- [x] Backgrounds configured in `preview.ts` parameters

### Native Modules

- [x] `RNCSlider` pod installed (check Podfile.lock)
- [x] `RNDateTimePicker` pod installed (check Podfile.lock)

### Testing

- [x] Storybook launches without crashes
- [x] All four addon tabs visible in Storybook UI
- [x] Background colours can be switched
- [x] TypeScript compilation passes
- [x] Lint passes

---

## Acceptance Criteria

- [x] All four addons installed and configured
- [x] Native dependencies for Controls installed (slider, datetimepicker)
- [x] iOS Pods installed without errors
- [x] Addons visible in Storybook UI
- [x] TypeScript compilation passes
- [x] Lint passes

---

## Definition of Done

- [x] All acceptance criteria met
- [x] All verification checklist items complete
- [x] App rebuilds successfully with new native modules
- [x] Addons functional in Storybook
- [x] Ready for TASK-146 (dev toggle) or TASK-147 (stories)

---

## Notes

- **Controls Pain Point**: The slider and datetimepicker were the exact dependencies that caused previous issues
- **Rebuild Required**: Any time you add native modules (`@react-native-community/*`), you MUST rebuild the app
- **Actions Dependency**: The `@storybook/addon-actions` is a peer dep of the ondevice version

**Last Updated**: 2025-11-18
