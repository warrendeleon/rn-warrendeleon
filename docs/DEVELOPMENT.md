# Development Guide

This document covers setting up your development environment and running the app.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Running the App](#running-the-app)
- [Metro Bundler](#metro-bundler)
- [Debugging](#debugging)
- [Common Issues](#common-issues)

## Prerequisites

### Required

- **Node.js**: v18+ ([Download](https://nodejs.org/))
- **Yarn**: v3.6.4 (Berry) - installed via Corepack
- **iOS Development**:
  - macOS with Xcode 15+
  - CocoaPods (`sudo gem install cocoapods`)
- **Android Development**:
  - Android Studio
  - Android SDK (API 35)
  - Java Development Kit (JDK 17)

### Enable Corepack (for Yarn)

```bash
corepack enable
```

### Verify Installation

```bash
node --version    # Should be v18+
yarn --version    # Should be 3.6.4
```

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd warrendeleon
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Install iOS Dependencies

```bash
cd ios
pod install
cd ..
```

### 4. Environment Variables

The app uses environment-specific configuration files:

- `.env.development` - Development environment
- `.env.production` - Production environment

These files contain:

- `APP_ENV` - Environment name (development/production)
- `API_URL` - API base URL (configured for future use)

**Note**: Environment files are committed to the repo for this project. For production apps, add `.env*` to `.gitignore` and use `.env.example` templates.

## Running the App

### iOS

```bash
# Run on default simulator (iPhone 15 Pro)
yarn ios

# Run on specific simulator
yarn ios --simulator="iPhone 14"

# Run without starting Metro
yarn ios --no-packager
```

### Android

```bash
# Run on connected device/emulator
yarn android

# Clean build
cd android && ./gradlew clean && cd ..
yarn android
```

### Development Builds

```bash
# iOS with development environment
yarn ios --mode=Debug --scheme=warrendeleon

# iOS with production environment
yarn ios --mode=Release --scheme=warrendeleon-Prod
```

## Metro Bundler

### Start Metro

```bash
# Normal start
yarn start

# Reset cache
yarn start:reset
```

### Metro Commands

While Metro is running, press:

- `r` - Reload app
- `d` - Open developer menu
- `i` - Run on iOS
- `a` - Run on Android

### Clear Metro Cache

```bash
yarn start -- --reset-cache
```

## Debugging

### React Native Debugger

1. Install React Native Debugger:

```bash
brew install --cask react-native-debugger
```

2. Enable Debug Menu in app (iOS: `Cmd+D`, Android: `Cmd+M` or shake device)
3. Select "Debug" from menu

### Flipper

Flipper is configured for debugging:

1. Install Flipper: https://fbflipper.com/
2. Run app in debug mode
3. Flipper will auto-detect the app

**Available Plugins**:

- React DevTools
- Network Inspector
- Redux Inspector
- Layout Inspector

### Logging

```typescript
// Use console.log for development
console.log('Debug message');
console.warn('Warning message');
console.error('Error message');
```

**View Logs**:

```bash
# iOS
yarn ios --no-packager
# Logs appear in Xcode console

# Android
adb logcat | grep ReactNative
```

## Development Workflow

### Recommended Flow

1. **Start Metro**: `yarn start`
2. **Run App**: `yarn ios` (in new terminal)
3. **Make Changes**: Edit files, save
4. **Hot Reload**: Changes appear automatically
5. **Run Tests**: `yarn test:watch` (in new terminal)

### Fast Refresh

Fast Refresh is enabled by default:

- Saves automatically trigger updates
- Component state is preserved
- Only changed components re-render

**Limitations**:

- Class components don't preserve state
- Changes to exports require full reload
- Changes outside components require full reload

## Common Issues

### iOS Build Failures

**Problem**: CocoaPods errors

```bash
# Solution:
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

**Problem**: Xcode build fails with "Command PhaseScriptExecution failed"

```bash
# Solution: Clean Xcode build folder
# In Xcode: Product > Clean Build Folder (Cmd+Shift+K)
```

### Android Build Failures

**Problem**: Gradle build fails

```bash
# Solution: Clean and rebuild
cd android
./gradlew clean
cd ..
```

**Problem**: SDK not found

```bash
# Solution: Set ANDROID_HOME in ~/.zshrc or ~/.bashrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Metro Bundler Issues

**Problem**: Metro stuck or stale cache

```bash
# Solution:
yarn start --reset-cache
```

**Problem**: Port 8081 already in use

```bash
# Solution: Kill process on port 8081
lsof -ti:8081 | xargs kill
```

### Simulator/Emulator Issues

**Problem**: iOS Simulator not responding

```bash
# Solution: Reset simulator
xcrun simctl erase all
```

**Problem**: Android Emulator slow

```bash
# Solution: Allocate more RAM to emulator
# In Android Studio: AVD Manager > Edit > Advanced Settings > RAM
```

## Build Performance Tips

### iOS

1. **Use Debug builds during development** (faster)
2. **Disable Flipper if not using** (edit Podfile)
3. **Use incremental builds** (Xcode handles this)

### Android

1. **Enable Gradle daemon** (enabled by default)
2. **Increase Gradle memory**:
   ```
   # android/gradle.properties
   org.gradle.jvmargs=-Xmx4096m
   ```
3. **Use build cache** (enabled by default)

## Useful Commands

```bash
# Development
yarn ios                    # Run iOS app
yarn android                # Run Android app
yarn start                  # Start Metro
yarn start:reset            # Start Metro with cache reset

# Testing
yarn test                   # Run unit tests
yarn test:watch             # Run tests in watch mode
yarn test:coverage          # Run tests with coverage

# Linting
yarn lint                   # Run ESLint
yarn lint:fix               # Auto-fix ESLint issues
yarn typecheck              # Run TypeScript compiler check

# Cleaning
yarn ios --reset-cache      # Reset iOS cache
cd android && ./gradlew clean  # Clean Android build
```

## IDE Setup

### VS Code (Recommended)

**Recommended Extensions**:

- ESLint
- Prettier
- React Native Tools
- TypeScript and JavaScript Language Features

**Settings** (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Next Steps

- See [Testing](./TESTING.md) for running tests
- See [E2E Testing](./E2E_TESTING.md) for end-to-end testing
- See [Contributing](./CONTRIBUTING.md) for development guidelines
