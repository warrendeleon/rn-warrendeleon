# 🪶 warrendeleon

<p align="center">
  <img src="https://img.shields.io/badge/react--native-0.82.1-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/typescript-5.x-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/yarn-1.22.x-2C8EBB?style=for-the-badge&logo=yarn" />
  <img src="https://img.shields.io/badge/node-22.x-5FA04E?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" />
</p>

A **React Native** application built with **TypeScript**, using **Yarn** as the package manager.  
This project is configured for both **iOS** and **Android**, with **Hermes** enabled for improved performance.

---

## 🚀 Tech Stack

- **React Native:** 0.82.1  
- **Language:** TypeScript  
- **Package Manager:** Yarn  
- **JavaScript Engine:** Hermes  
- **Linting & Formatting:** ESLint + Prettier (recommended setup)  
- **Build Tools:** Xcode 26 / Android SDK 35  

---

<details>
<summary>🧩 <b>Available Scripts</b> (click to expand)</summary>

| Command | Description |
|----------|-------------|
| `yarn start` | Start the Metro bundler |
| `yarn ios` | Build and run the iOS app (launches Simulator) |
| `yarn android` | Build and run the Android app |
| `yarn lint` | Run ESLint for code quality checks |
| `yarn lint:fix` | Automatically fix lint issues where possible |
| `yarn format` | Format code using Prettier |

</details>

---

## 🧑‍💻 Development setup

These steps describe the environment used to develop this app on macOS (Apple Silicon).

### Prerequisites

- **macOS** (Apple Silicon)
- **Homebrew** installed

### Node & Yarn

```bash
node -v    # 22.x
yarn -v    # 1.22.x
```

If Node isn’t installed via a version manager yet, use `nvm`:

```bash
brew install nvm
mkdir -p ~/.nvm
# Add the NVM init snippet from brew to your ~/.zshrc, then:
nvm install 22
nvm use 22
```

### Java (JDK 17 – Temurin)

Install Temurin 17:

```bash
brew install --cask temurin@17
```

In `~/.zshrc`:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"
```

Reload:

```bash
source ~/.zshrc
java -version
```

### Android SDK

Install **Android Studio**, then in `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Reload:

```bash
source ~/.zshrc
adb devices
```

You should see a list (possibly empty) of devices with no error.

### Xcode (iOS)

- Install **Xcode 26+** from the Mac App Store.
- Open Xcode once and accept the licence / install components.

Check:

```bash
xcodebuild -version
xcode-select -p
```

`xcode-select -p` should point to `/Applications/Xcode.app/Contents/Developer`.

### CocoaPods

```bash
sudo gem install cocoapods
pod --version
```

---

## 🧑‍💻 Getting Started (project)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/warrendeleon.git
cd warrendeleon
```

### 2. Install dependencies

```bash
yarn install
```

### 3. iOS pods

```bash
cd ios
pod install
cd ..
```

---

## 📱 Running the app

### iOS

```bash
yarn ios
```

This will:

- Start Metro
- Build the iOS app with Xcode
- Launch the iOS simulator (e.g. iPhone 15 Pro)

### Android

1. Start an Android emulator from Android Studio (or connect a device).
2. Run:

```bash
yarn android
```

---

## 🧩 Project Structure

```text
warrendeleon/
├── android/              # Native Android project
├── ios/                  # Native iOS project (.xcworkspace, Pods, etc.)
├── src/                  # App source (recommended place for your code)
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screens / routes
│   ├── navigation/       # Navigation setup (if used)
│   └── utils/            # Helpers & utilities
├── App.tsx               # Root component
├── index.tsx             # Entry file
├── tsconfig.json         # TypeScript configuration
├── package.json
└── README.md
```

---

## 🧹 Linting & Formatting (recommended)

Install ESLint + Prettier:

```bash
yarn add -D   eslint   @react-native/eslint-config   @typescript-eslint/eslint-plugin   @typescript-eslint/parser   prettier   eslint-config-prettier   eslint-plugin-prettier
```

Create `.eslintrc.js`:

```js
module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'warn',
  },
};
```

Create `.prettierrc`:

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "semi": true
}
```

Add scripts in `package.json`:

```jsonc
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write ."
  }
}
```

Run:

```bash
yarn lint
yarn format
```

---

## 🧠 Useful Commands

| Command        | Description                          |
|----------------|--------------------------------------|
| `yarn start`   | Start Metro bundler                  |
| `yarn ios`     | Build & run iOS app                  |
| `yarn android` | Build & run Android app              |
| `yarn lint`    | Run ESLint                           |
| `yarn lint:fix`| Auto-fix lint issues where possible  |
| `yarn format`  | Run Prettier over the codebase       |

---

## 🛠 Requirements (summary)

| Tool | Recommended Version |
|------|----------------------|
| Node.js | 22.x |
| Yarn | 1.22.x |
| Java | Temurin 17 |
| Android SDK | 35+ |
| Xcode | 26.0.1 |
| CocoaPods | 1.16.x |

---

## 🧾 License

This project is licensed under the [MIT License](LICENSE).
