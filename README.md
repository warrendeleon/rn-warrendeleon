# 🪶 warrendeleon

<p align="center">
  <img src="https://img.shields.io/badge/react--native-0.82.1-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/typescript-5.x-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/yarn-3.6.4-2C8EBB?style=for-the-badge&logo=yarn" />
  <img src="https://img.shields.io/badge/node-22.x-5FA04E?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" />
</p>

A **React Native** application built with **TypeScript**, using **Yarn** as the package manager.  
This project is configured for both **iOS** and **Android**, with **Hermes** enabled for improved performance.

---

## 📋 Quick Start

```bash
# Clone the repository
git clone https://github.com/warrendeleon/rn-warrendeleon.git
cd rn-warrendeleon

# Install dependencies
yarn install

# iOS setup
cd ios && pod install && cd ..

# Run on iOS
yarn ios

# Run on Android (start emulator first)
yarn android
```

---

## 🚀 Tech Stack

- **React Native:** 0.82.1
- **Language:** TypeScript 5.8.3
- **Package Manager:** Yarn 3.6.4 (Berry)
- **JavaScript Engine:** Hermes
- **Linting & Formatting:** ESLint 9 (flat config) + Prettier
- **Build Tools:** Xcode 26 / Android SDK 35

---

<details>
<summary>🧩 <b>Available Scripts</b> (click to expand)</summary>

| Command | Description |
|----------|-------------|
| `yarn start` | Start the Metro bundler |
| `yarn ios` | Build and run the iOS app (launches Simulator) |
| `yarn android` | Build and run the Android app |
| `yarn test` | Run Jest tests |
| `yarn lint` | Run ESLint for code quality checks |
| `yarn lint:fix` | Automatically fix lint issues where possible |
| `yarn format` | Format code using Prettier |

</details>

---

## 🧩 Project Structure

```text
rn-warrendeleon/
├── android/              # Native Android project
├── ios/                  # Native iOS project (.xcworkspace, Pods, etc.)
├── __tests__/            # Jest test files
├── App.tsx               # Root component
├── index.js              # Entry file
├── eslint.config.mjs     # ESLint flat config
├── .prettierrc           # Prettier configuration
├── tsconfig.json         # TypeScript configuration
├── babel.config.js       # Babel configuration
├── metro.config.js       # Metro bundler configuration
├── jest.config.js        # Jest configuration
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

1. Install **Android Studio** from [developer.android.com](https://developer.android.com/studio)
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

```bash
# Install iOS dependencies first (one time)
cd ios
pod install
cd ..

# Run the app
yarn ios

# Or specify a device
yarn ios --simulator="iPhone 16 Pro"
```

### Android

```bash
# Start an Android emulator from Android Studio first
# Or connect a physical device with USB debugging enabled

# Run the app
yarn android

# Or specify a device
yarn android --deviceId=<device-id>
```

---

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage
```

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

Prettier is configured to format code automatically:

```bash
# Format all files
yarn format
```

### Configuration

- **ESLint config:** `eslint.config.mjs` (flat config format)
- **Prettier config:** `.prettierrc`
- **TypeScript config:** `tsconfig.json`

---

## 🛠 Troubleshooting

### iOS Build Issues

```bash
# Clean build folders
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Android Build Issues

```bash
# Clean Android build
cd android
./gradlew clean
cd ..
```

### Metro Bundler Issues

```bash
# Clear Metro cache
yarn start --reset-cache
```

---

## 🛠 Requirements Summary

| Tool | Required Version |
|------|------------------|
| Node.js | 22.x |
| Yarn | 3.6.4 (managed by project) |
| Java | Temurin 17 |
| Android SDK | 35+ |
| Xcode | 26.0+ |
| CocoaPods | 1.16+ |

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Contact

For questions or support, please open an issue on GitHub.
```
