# 🪶 warrendeleon

<p align="center">
  <img src="https://img.shields.io/badge/react--native-0.82.1-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/typescript-5.x-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/yarn-3.6.4-2C8EBB?style=for-the-badge&logo=yarn" />
  <img src="https://img.shields.io/badge/node-22.x-5FA04E?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" />
</p>

## 📑 Table of Contents

- [🧭 Project Overview](#-project-overview)
- [🚀 Tech Stack](#-tech-stack)
- [🧩 Available Scripts](#-available-scripts-click-to-expand)
- [🧩 Project Structure](#-project-structure)
- [🧑‍💻 Development Setup](#-development-setup)
- [📱 Running the App](#-running-the-app)
- [🧪 Testing](#-testing)
- [🧹 Code Quality](#-code-quality)
- [🧷 Git Hooks & Commit Conventions](#-git-hooks--commit-conventions)
- [🛠 Troubleshooting](#-troubleshooting)
- [🛠 Requirements Summary](#-requirements-summary)
- [📝 License](#-license)
- [🤝 Contributing](#-contributing)
- [📧 Contact](#-contact)

## 🧭 Project Overview

_Placeholder: Brief summary of the app’s purpose, architecture, and goals will be added here._

A **React Native** application built with **TypeScript**, using **Yarn** as the package manager.
This project is configured for both **iOS** and **Android**, with **Hermes** enabled for improved performance.

---

## 🚀 Tech Stack

- **React Native:** 0.82.1
- **React Native CLI:** 20.0.2
- **Language:** TypeScript 5.8.3
- **Package Manager:** Yarn 3.6.4 (Berry)
- **JavaScript Engine:** Hermes
- **Environment Management:** react-native-config
- **Linting & Formatting:** ESLint 9 (flat config) + Prettier
- **Build Tools:** Xcode 26 / Android SDK 35 / Android Studio 2023.1+
- **CocoaPods:** 1.16.x

---

## 🧩 Available Scripts (click to expand)

<details>
<summary>🧩 <b>Available Scripts</b> (click to expand)</summary>

### 🚧 Development

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `yarn start`       | Start the Metro bundler         |
| `yarn start:reset` | Start Metro and clear its cache |

---

### 📱 Run / Build

| Command                | Description                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| `yarn ios`             | Build and run the iOS app in Debug (default `warrendeleon` scheme) |
| `yarn ios:release`     | Build and run iOS with `warrendeleon-Prod` scheme in Release mode  |
| `yarn android`         | Build and run the Android app in Debug                             |
| `yarn android:release` | Build and run the Android app in Release mode                      |
| `yarn android:apk`     | Build a Release APK and print the output path                      |
| `yarn android:aab`     | Build a Release AAB and print the output path                      |

---

### 🧪 Testing

| Command              | Description                                   |
| -------------------- | --------------------------------------------- |
| `yarn test`          | Run Jest tests once                           |
| `yarn test:watch`    | Run Jest in watch mode                        |
| `yarn test:coverage` | Run Jest tests and generate a coverage report |

---

### 🧹 Maintenance

| Command             | Description                                         |
| ------------------- | --------------------------------------------------- |
| `yarn lint`         | Run ESLint for code quality checks                  |
| `yarn lint:fix`     | Automatically fix lint issues where possible        |
| `yarn format`       | Format code using Prettier                          |
| `yarn format:check` | Check formatting without writing changes            |
| `yarn typecheck`    | Run a full TypeScript typecheck (`tsc --noEmit`)    |
| `yarn validate`     | Run typecheck, lint, and tests together             |
| `yarn clean`        | Clean Android/iOS builds and reinstall node modules |
| `yarn doctor`       | Run `react-native doctor` to check the environment  |

</details>

---

## 🧩 Project Structure

```text
rn-warrendeleon/
├── android/              # Native Android project
├── ios/                  # Native iOS project (.xcworkspace, Pods, etc.)
├── docs/                 # Documentation files
├── src/
│   ├── App.tsx           # Root component
│   ├── features/         # Feature-first modules (screens, feature-specific logic, tests)
│   ├── components/       # Shared/reusable UI components
│   ├── navigation/       # Navigation setup (RootNavigator, types)
│   ├── i18n/             # Internationalisation (i18next config, locales)
│   ├── __tests__/        # Tests related to src code
│   └── config/           # Configuration (e.g. env.ts for environment variables)
├── __tests__/            # Jest test files at root level
├── index.js              # Entry file
├── eslint.config.mjs     # ESLint flat config
├── .prettierrc           # Prettier configuration
├── tsconfig.json         # TypeScript configuration
├── babel.config.js       # Babel configuration
├── metro.config.js       # Metro bundler configuration
├── jest.config.cjs       # Jest configuration
├── package.json
└── README.md
```

---

## 🧑‍💻 Development Setup

These steps describe the environment used to develop this app on macOS (Apple Silicon).

### Prerequisites

- **macOS** (Apple Silicon recommended)
- **Homebrew** installed

### Node & Yarn

This project uses **Node.js 22.x** and **Yarn 3.6.4** (Berry).

```bash
# Check versions
node -v    # Should be 22.x
yarn -v    # Should be 3.6.4
```

#### Install Node with nvm (recommended)

```bash
# Install nvm
brew install nvm
mkdir -p ~/.nvm

# Add to ~/.zshrc:
export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"

# Reload and install Node
source ~/.zshrc
nvm install 22
nvm use 22
nvm alias default 22
```

#### Yarn is managed by the project

Yarn 3.6.4 is automatically managed via Corepack (included with Node.js 22). You don't need to install it globally.

```bash
# Enable Corepack if not already enabled
corepack enable
```

---

### Java (JDK 17 – Temurin)

Install Temurin 17 for Android development:

```bash
brew install --cask temurin@17
```

Add to `~/.zshrc`:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"
```

Reload and verify:

```bash
source ~/.zshrc
java -version  # Should show Temurin 17
```

---

### Android SDK

1. Install **Android Studio** from [developer.android.com](https://developer.android.com/studio) (minimum version 2023.1)
2. Open Android Studio and install:
   - Android SDK Platform 35
   - Android SDK Build-Tools
   - Android Emulator
   - Intel x86 Emulator Accelerator (HAXM) or use ARM images

Add to `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Reload and verify:

```bash
source ~/.zshrc
adb devices  # Should list connected devices (or empty list with no error)
```

---

### Xcode (iOS)

1. Install **Xcode 26+** from the Mac App Store
2. Open Xcode and accept the license agreement
3. Install additional components when prompted

Verify installation:

```bash
xcodebuild -version  # Should show Xcode 26.x
xcode-select -p      # Should show /Applications/Xcode.app/Contents/Developer
```

---

### CocoaPods

CocoaPods is required for iOS dependency management:

```bash
sudo gem install cocoapods
pod --version  # Should show 1.16.x or higher
```

---

## 📱 Running the App

### iOS

This project supports multiple build schemes for iOS:

| Scheme                      | Environment File | Build Type | Example Command                                      |
| --------------------------- | ---------------- | ---------- | ---------------------------------------------------- |
| warrendeleon                | .env.development | Debug      | `yarn ios` or `yarn ios --scheme warrendeleon`       |
| warrendeleon-Prod           | .env.production  | Debug      | `yarn ios --scheme warrendeleon-Prod`                |
| warrendeleon-Prod (Release) | .env.production  | Release    | `yarn ios --scheme warrendeleon-Prod --mode Release` |

### Environment files

Environment variables are managed using **react-native-config**. These files live in the project root and define environment-specific settings.

- `.env.development` – used by the `warrendeleon` scheme (Debug)
  Example contents:

  ```
  API_URL=https://api.dev.example.com
  FEATURE_FLAG=true
  ```

- `.env.production` – used by the `warrendeleon-Prod` scheme (Debug and Release)
  Example contents:
  ```
  API_URL=https://api.example.com
  FEATURE_FLAG=false
  ```
  > ⚠️ **Important:** `.env.production` contains sensitive production keys and **should NOT be committed** to source control.
  > Provide `.env.production.example` as a template for collaborators.

These files **should not be committed** to source control. You can create `.env.development` and `.env.production` locally with your own API keys or URLs.
If needed, provide `.env.development.example` and `.env.production.example` as templates for collaborators.

To run the app with the development scheme (this is the default scheme used by `yarn ios`):

```bash
# Default:
yarn ios

# Explicitly specifying the scheme:
yarn ios --scheme warrendeleon
```

To run the app with the production scheme (which uses `.env.production`):

```bash
# Run with the production scheme using the default mode (usually Debug)
yarn ios --scheme warrendeleon-Prod

# Run with the production scheme in Release mode
yarn ios --scheme warrendeleon-Prod --mode Release
```

> ℹ️ The `--mode` flag determines the Xcode build configuration:
>
> - `--mode Debug` enables developer tools and logging (default).
> - `--mode Release` creates an optimised production build without dev tools.

Using `--mode` controls the Xcode build configuration:

- `--mode Debug` (default) builds a debug binary with DevTools, log output, etc.
- `--mode Release` builds an optimized release binary, closer to what ships to users.

Both commands use the `warrendeleon-Prod` scheme (and therefore `.env.production`); the difference is whether you want a Debug or Release build of that scheme.

As a shortcut, you can also run:

```bash
yarn ios:release
```

which is equivalent to running the `warrendeleon-Prod` scheme in Release mode.

### Android

```bash
# Start an Android emulator from Android Studio first
# Or connect a physical device with USB debugging enabled

# Run the app
yarn android

# Or specify a device
yarn android --deviceId=<device-id>
```

To run a Release build on a device or emulator:

```bash
yarn android:release
```

The output APK and AAB files will be located in the standard build directories, typically under:

- `android/app/build/outputs/apk/release/` for APK
- `android/app/build/outputs/bundle/release/` for AAB

To build release artifacts without installing them:

```bash
# Build a Release APK and print its path
yarn android:apk

# Build a Release AAB and print its path
yarn android:aab
```

---

## 🧪 Testing

This project uses Jest and React Native Testing Library for unit and integration tests, with snapshot testing for UI stability.

Refer to `jest.setup.ts` for test environment configuration and setup details.

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage
```

### Running Individual Tests

You can run a specific test file or test name using Jest CLI:

```bash
yarn test path/to/file.test.ts
```

or

```bash
yarn test -t "test name"
```

### React Native Testing Library

This project uses [React Native Testing Library](https://testing-library.com/docs/react-native-testing-library/intro) to test UI components with a focus on user interactions and accessibility.

### Snapshot Testing

Snapshot testing is used to capture the rendered output of components and detect unintended UI changes. Snapshots are stored alongside test files.

### Coverage Reports

Running tests with coverage (`yarn test --coverage`) produces a report showing the percentage of code covered by tests, helping identify untested parts of the codebase. The coverage output is saved in the `coverage/` folder.

---

## 🧹 Code Quality

### Linting

This project uses **ESLint 9** with the flat config format (`eslint.config.mjs`):

```bash
# Check for lint issues
yarn lint

# Auto-fix issues
yarn lint:fix
```

### Formatting

Prettier is configured to format code consistently:

```bash
# Format all files
yarn format
```

### Type checking

TypeScript is used for static typing:

```bash
# Run a full-project typecheck
yarn typecheck
```

### One-shot validation

To run typecheck, lint, and tests together:

```bash
yarn validate
```

---

## 🧷 Git Hooks & Commit Conventions

This repo uses [gitmoji](https://gitmoji.dev/) + conventional-style prefixes in commit messages, for example:

- `✨ feat: add new feature`
- `🐛 fix: resolve a bug`
- `🧹 chore: clean up or refactor`
- `✅ test: add or update tests`
- `📝 docs: update documentation`

This is optional but recommended to keep history easy to read.

Example of a full commit command:

```bash
git add . && git commit -m "✨ feat: add new feature"
```

Husky + lint-staged enforce code quality checks before commits to ensure consistency.

- On `git commit`, `lint-staged` will:
  - Run `eslint --fix`, `prettier --write`, and `tsc-files --noEmit` on staged `*.js, *.jsx, *.ts, *.tsx` files
  - Run `prettier --write` on staged `*.json, *.md, *.yml, *.yaml` files

If a check fails, the commit will be aborted so you can fix the issues first.

This ensures code quality is maintained before changes are committed.

### Configuration

- **ESLint config:** `eslint.config.mjs` (flat config format)
- **Prettier config:** `.prettierrc`
- **TypeScript config:** `tsconfig.json`

---

## 🛠 Troubleshooting

Before trying manual fixes, you can run:

```bash
yarn doctor
```

This runs `react-native doctor` through the project's script for convenience.

This checks your React Native development environment and suggests fixes for common issues.

### iOS Build Issues

```bash
# Clean build folders
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

> 💡 You can also use the shortcut:
>
> ```bash
> yarn clean
> ```
>
> which cleans Android/iOS builds and reinstalls node modules.
>
> After cleaning, reopen the `.xcworkspace` file in Xcode to avoid build issues.

**Note:** When switching between build schemes (`warrendeleon` and `warrendeleon-Prod`), it's recommended to clean Xcode's Derived Data to avoid caching issues and verify that the correct `.env` files are present and properly configured for each scheme.

If `pod install` fails, try:

```bash
sudo arch -arm64 gem install ffi
```

### Android Build Issues

```bash
# Clean Android build
cd android
./gradlew clean
cd ..
```

If you see ‘Permission denied’ on gradlew, run:

```bash
chmod +x android/gradlew
```

### Metro Bundler Issues

```bash
# Clear Metro cache
yarn start --reset-cache
```

---

## 🛠 Requirements Summary

| Tool           | Required Version           |
| -------------- | -------------------------- |
| Node.js        | 22.x                       |
| Yarn           | 3.6.4 (managed by project) |
| Java           | Temurin 17                 |
| Android SDK    | API level 35+              |
| Android Studio | 2023.1+                    |
| Xcode          | 26.0+                      |
| CocoaPods      | 1.16+                      |

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Contact

For questions or support, please open an issue on GitHub.
