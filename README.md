# Warren's React Native App

<p align="center">
  <img src="https://img.shields.io/badge/react--native-0.82.1-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/typescript-5.8.3-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/redux--toolkit-2.x-764ABC?style=for-the-badge&logo=redux" />
  <img src="https://img.shields.io/badge/jest-29.x-C21325?style=for-the-badge&logo=jest" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/gluestack--ui-1.1.x-8B5CF6?style=for-the-badge" />
  <img src="https://img.shields.io/badge/nativewind-4.x-38BDF8?style=for-the-badge&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/coverage-85%25-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" />
</p>

---

## About

A modern React Native application built with TypeScript, featuring a **feature-first architecture** and comprehensive testing suite. Built with industry best practices for scalable mobile development.

**Key Features:**

- 🏗️ Feature-first architecture for better code organisation
- 🌍 Full internationalisation (English & Spanish)
- 🎨 Modern UI with GlueStack UI + NativeWind (Tailwind for React Native)
- 🧪 Comprehensive testing (Jest + React Native Testing Library + Detox E2E)
- 📦 Redux Toolkit for state management
- 🎯 85%+ test coverage

---

## Quick Start

```bash
# Install dependencies
yarn install

# Install iOS dependencies
cd ios && pod install && cd ..

# Run on iOS
yarn ios

# Run on Android (start emulator first)
yarn android
```

**That's it!** You should now have the app running on your simulator/emulator.

---

## Tech Stack

- **React Native** 0.82.1 with TypeScript 5.8.3
- **UI Framework:** GlueStack UI + NativeWind
- **State Management:** Redux Toolkit with Redux Persist
- **Navigation:** React Navigation 7 (Native Stack)
- **Internationalisation:** i18next + react-i18next
- **Testing:** Jest + React Native Testing Library + Detox
- **Code Quality:** ESLint 9 + Prettier + Husky
- **Package Manager:** Yarn 3.6.4 (Berry)

---

## Documentation

Comprehensive guides are available in the `/docs` folder. Here's how to navigate them:

### 📋 Project Information

- **[Changelog](CHANGELOG.md)** - Version history and release notes
- **[Git Commit Guide](docs/GIT_COMMIT_GUIDE.md)** - Commit message format and gitmoji conventions
- **[Contributing](docs/CONTRIBUTING.md)** - Code standards and PR process

### 📖 How to Use This Documentation

**New to the project?** Follow this onboarding path:

1. **[Development Guide](docs/DEVELOPMENT.md)** - Set up your environment, install dependencies, and run the app
2. **[Architecture](docs/ARCHITECTURE.md)** - Understand the project structure and feature-first organisation
3. **[Git Commit Guide](docs/GIT_COMMIT_GUIDE.md)** - Learn our commit message format with gitmoji
4. **[Contributing](docs/CONTRIBUTING.md)** - Code standards and PR process

**Working on specific features?**

- 🎨 **UI & Components** → [Architecture Guide](docs/ARCHITECTURE.md#component-patterns)
- 🧪 **Unit Testing** → [Testing Guide](docs/TESTING.md)
- 🎭 **E2E Testing** → [E2E Testing Guide](docs/E2E_TESTING.md)
- 🌍 **Translations** → [Internationalisation Guide](docs/I18N.md)
- 📦 **State Management** → [State Management Guide](docs/STATE_MANAGEMENT.md)

**Need quick help?**

- ⚡ **Quick Commands** → [Cheatsheet](docs/CHEATSHEET.md) _(coming soon)_
- 🔄 **Common Workflows** → [Workflows Guide](docs/WORKFLOWS.md) _(coming soon)_

### 📚 Core Documentation

- **[Architecture](docs/ARCHITECTURE.md)** - Project structure, feature-first organisation, and design decisions
- **[Development](docs/DEVELOPMENT.md)** - Setup guide, running the app, debugging, and troubleshooting
- **[Testing](docs/TESTING.md)** - Unit and integration testing with Jest and React Native Testing Library
- **[E2E Testing](docs/E2E_TESTING.md)** - End-to-end testing with Detox, Cucumber, and MSW

### 🛠️ Feature-Specific Guides

- **[Internationalisation](docs/I18N.md)** - i18n setup, adding translations, and language management
- **[State Management](docs/STATE_MANAGEMENT.md)** - Redux Toolkit usage, creating features, and best practices
- **[Git Commit Guide](docs/GIT_COMMIT_GUIDE.md)** - Commit message format and gitmoji conventions
- **[Contributing](docs/CONTRIBUTING.md)** - Code style and PR process

---

## Available Commands

```bash
# Development
yarn start              # Start Metro bundler
yarn start:reset        # Start Metro with cache reset
yarn ios                # Run iOS app (Debug)
yarn android            # Run Android app (Debug)

# Testing
yarn test               # Run unit tests
yarn test:watch         # Run tests in watch mode
yarn test:coverage      # Run tests with coverage report
yarn detox:ios:build    # Build app for iOS E2E tests
yarn detox:ios:test     # Run iOS E2E tests
yarn e2e:ios            # Build + run iOS E2E tests (convenience)

# Code Quality
yarn lint               # Run ESLint
yarn lint:fix           # Auto-fix ESLint issues
yarn typecheck          # Run TypeScript type check
yarn validate           # Run typecheck, lint, and tests
```

> **Note:** See [Cheatsheet](docs/CHEATSHEET.md) for a complete command reference _(coming soon)_.

---

## Project Structure

```
warrendeleon/
├── docs/                  # Documentation
├── src/
│   ├── app/              # App entry point
│   ├── components/       # Shared components
│   ├── features/         # Feature modules (screens, components, tests)
│   ├── navigation/       # Navigation setup
│   ├── i18n/             # Internationalisation
│   ├── store/            # Redux store
│   └── test-utils/       # Testing utilities
├── ios/                  # iOS native code
└── android/              # Android native code
```

See [Architecture Guide](docs/ARCHITECTURE.md#project-structure) for detailed structure explanation.

---

## Requirements

| Tool           | Version |
| -------------- | ------- |
| Node.js        | 22.x    |
| Yarn           | 3.6.4   |
| Xcode          | 26.0+   |
| Android Studio | 2023.1+ |
| Java (JDK)     | 17      |
| CocoaPods      | 1.16+   |

See [Development Guide](docs/DEVELOPMENT.md#prerequisites) for detailed setup instructions.

---

## License

MIT

---

## Contributing

Contributions are welcome! See [Contributing Guide](docs/CONTRIBUTING.md) for details on:

- Code style and conventions
- Commit message format (gitmoji)
- PR process and requirements
- Testing standards

---

## Contact

For questions or support, please open an issue on GitHub.
