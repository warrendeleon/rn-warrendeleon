# TASK-143: Install Storybook Core Dependencies

**Task ID**: TASK-143
**Title**: Install Storybook Core Dependencies
**Epic**: [EPIC-016: Storybook Re-integration](../epics/EPIC-016-storybook-reintegration.md)
**User Story**: [US-028: Storybook Setup and Stories](../stories/US-028-storybook-setup-and-stories.md)
**Status**: 📋 To Do
**Priority**: High
**Effort**: 3h
**Created**: 2025-11-18
**Assigned To**: Warren de Leon
**Category**: Development Infrastructure

---

## Overview

Install the core Storybook React Native v10.0.7 packages and their peer dependencies. This is the foundation for all other Storybook tasks.

---

## Step-by-Step Implementation Guide

### Phase 1: Pre-Installation Checks (15 minutes)

#### 1.1 Verify React Native Version Compatibility

```bash
# Check current React Native version
yarn info react-native version

# Expected output: 0.82.1
# Storybook v10 requires: react-native >= 0.72.0 ✅
```

#### 1.2 Check for Conflicting Packages

```bash
# Check if any old Storybook packages exist
yarn info @storybook/react-native 2>/dev/null && echo "Found old Storybook" || echo "No old Storybook - safe to proceed"

# Check for conflicting bottom sheet versions
yarn info @gorhom/bottom-sheet version 2>/dev/null
```

#### 1.3 Clean Yarn Cache (Recommended)

```bash
# Clear Yarn cache to avoid stale packages
yarn cache clean
```

---

### Phase 2: Install Core Dependencies (30 minutes)

#### 2.1 Install Storybook Core

**IMPORTANT**: Install exact versions to avoid compatibility issues.

```bash
# Install Storybook v10 core packages
yarn add -D storybook@^10.0.0 @storybook/react-native@^10.0.7
```

**Expected Output**:

```
➤ YN0000: · Yarn 3.6.4
➤ YN0000: ┌ Resolution step
➤ YN0000: └ Completed
➤ YN0000: ┌ Fetch step
➤ YN0013: │ storybook@npm:10.0.0 can't be found...
➤ YN0000: └ Completed
➤ YN0000: ┌ Link step
➤ YN0000: └ Completed
➤ YN0000: · Done
```

#### 2.2 Install Required Peer Dependencies

Storybook v10 has these critical peer dependencies:

```bash
# Install bottom sheet (CRITICAL - caused previous issues)
yarn add @gorhom/bottom-sheet@^5.0.0

# Install other peer dependencies
yarn add react-native-safe-area-context
```

**Note**: `react-native-gesture-handler` and `react-native-reanimated` should already be installed from React Navigation.

#### 2.3 Verify Peer Dependencies

```bash
# Check all required peer dependencies are installed
yarn info @gorhom/bottom-sheet version
yarn info react-native-gesture-handler version
yarn info react-native-reanimated version
yarn info react-native-safe-area-context version

# Expected:
# @gorhom/bottom-sheet: 5.x.x
# react-native-gesture-handler: 2.x.x
# react-native-reanimated: 3.x.x
# react-native-safe-area-context: 4.x.x or higher
```

---

### Phase 3: Initialise Storybook (45 minutes)

#### 3.1 Run Storybook Init

```bash
# Initialize Storybook for React Native
npx storybook@latest init --type react_native
```

**What this creates**:

```
.rnstorybook/
├── main.ts              # Storybook configuration
├── preview.ts           # Global decorators and parameters
├── index.tsx            # Storybook entry point
└── storybook.requires.ts  # Auto-generated (DO NOT EDIT)
```

**Expected prompts**:

- "Do you want to install addon-ondevice-controls?" → **Yes**
- "Do you want to install addon-ondevice-actions?" → **Yes**

#### 3.2 Verify Generated Files

Check that all files were created:

```bash
# List Storybook directory
ls -la .rnstorybook/

# Expected output:
# total 32
# drwxr-xr-x  6 user  staff   192 Nov 18 12:00 .
# drwxr-xr-x 26 user  staff   832 Nov 18 12:00 ..
# -rw-r--r--  1 user  staff   523 Nov 18 12:00 index.tsx
# -rw-r--r--  1 user  staff   456 Nov 18 12:00 main.ts
# -rw-r--r--  1 user  staff   234 Nov 18 12:00 preview.ts
# -rw-r--r--  1 user  staff  1234 Nov 18 12:00 storybook.requires.ts
```

#### 3.3 Review main.ts Configuration

Open `.rnstorybook/main.ts` and verify it looks like:

```typescript
import type { StorybookConfig } from '@storybook/react-native';

const main: StorybookConfig = {
  stories: ['../src/components/**/*.stories.?(ts|tsx|js|jsx)'],
  addons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
};

export default main;
```

---

### Phase 4: Install iOS Dependencies (30 minutes)

#### 4.1 Install CocoaPods

```bash
# Navigate to iOS directory and install pods
cd ios && pod install && cd ..
```

**Expected**: Should complete without errors. Watch for:

- `@gorhom/bottom-sheet` pod installation
- No duplicate symbol errors

#### 4.2 Handle Pod Errors (If Any)

**If you see "Unable to find a specification for..."**:

```bash
# Clean pod cache and reinstall
cd ios
pod cache clean --all
pod deintegrate
pod setup
pod install
cd ..
```

**If you see "Multiple commands produce..."**:

```bash
# Clean Xcode build folder
cd ios
xcodebuild clean -workspace warrendeleon.xcworkspace -scheme warrendeleon
pod install
cd ..
```

---

### Phase 5: Verify Installation (30 minutes)

#### 5.1 TypeScript Check

```bash
# Run TypeScript to check for type errors
yarn typecheck
```

**Expected**: No errors related to Storybook

#### 5.2 Lint Check

```bash
# Run ESLint
yarn lint
```

**Expected**: No errors (warnings are acceptable)

#### 5.3 Check Package.json

Verify these entries exist in `package.json`:

**devDependencies**:

```json
{
  "storybook": "^10.0.0",
  "@storybook/react-native": "^10.0.7"
}
```

**dependencies**:

```json
{
  "@gorhom/bottom-sheet": "^5.0.0"
}
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: "Cannot find module '@storybook/react-native'"

**Cause**: Package not installed correctly

**Solution**:

```bash
# Remove node_modules and reinstall
rm -rf node_modules
yarn install
```

#### Issue 2: "Peer dependency conflict with @gorhom/bottom-sheet"

**Cause**: Version mismatch

**Solution**:

```bash
# Install exact version
yarn add @gorhom/bottom-sheet@5.0.0 --exact

# If still failing, use resolutions in package.json
"resolutions": {
  "@gorhom/bottom-sheet": "5.0.0"
}
```

#### Issue 3: Pod Install Fails with "CDN: trunk URL couldn't be downloaded"

**Cause**: CocoaPods CDN issues

**Solution**:

```bash
# Update CocoaPods repo
pod repo update

# Or use legacy method
cd ios
pod install --repo-update
cd ..
```

#### Issue 4: Metro Bundler Errors

**Cause**: Cache issues

**Solution**:

```bash
# Clear Metro cache
yarn start:reset

# Or manually clear
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
```

#### Issue 5: "Error: Unable to resolve module 'react-native-reanimated'"

**Cause**: Missing or incompatible reanimated version

**Solution**:

```bash
# Install compatible version
yarn add react-native-reanimated@^3.0.0

# Rebuild iOS
cd ios && pod install && cd ..
```

---

## Verification Checklist

Before marking this task complete, verify ALL of the following:

- [ ] `storybook@^10.0.0` installed in devDependencies
- [ ] `@storybook/react-native@^10.0.7` installed in devDependencies
- [ ] `@gorhom/bottom-sheet@^5.0.0` installed in dependencies
- [ ] `.rnstorybook/` directory exists with main.ts, preview.ts, index.tsx
- [ ] `yarn typecheck` passes with no Storybook-related errors
- [ ] `yarn lint` passes with no Storybook-related errors
- [ ] iOS pods installed successfully
- [ ] No peer dependency warnings for Storybook packages

---

## Acceptance Criteria

- [x] Core Storybook packages installed
- [x] Peer dependencies satisfied
- [x] `.rnstorybook/` directory created with configuration files
- [x] iOS Pods installed without errors
- [x] TypeScript compilation passes
- [x] ESLint passes

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] TypeScript and lint validation passes
- [ ] iOS pods installed successfully
- [ ] No peer dependency warnings
- [ ] Ready for TASK-144 (Metro configuration)

---

## Notes

- **Version Lock**: Storybook v10 is required for RN 0.82.1 compatibility
- **Bottom Sheet**: This was a major pain point previously - v5 is required
- **Init Command**: The `npx storybook@latest init` handles most setup automatically

**Last Updated**: 2025-11-18
