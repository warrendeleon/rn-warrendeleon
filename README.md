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
  <img src="https://img.shields.io/badge/storybook-10.x-FF4785?style=for-the-badge&logo=storybook" />
  <img src="https://img.shields.io/badge/coverage-75%25-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" />
</p>

---

## About

A modern React Native application built with TypeScript, featuring a **feature-first architecture** and comprehensive testing suite. Built with industry best practices for scalable mobile development.

**Key Features:**

- 🏗️ Feature-first architecture for better code organisation
- 🌍 Full internationalisation (English & Spanish)
- 🎨 Modern UI with GlueStack UI + NativeWind (Tailwind for React Native)
- 📚 Storybook for isolated component development and documentation
- 🧪 Comprehensive testing (Jest + React Native Testing Library + Detox E2E)
- 📦 Redux Toolkit for state management
- 🎯 75%+ test coverage (100% store, 92% components, 77% screens)

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
- **Component Development:** Storybook 10
- **State Management:** Redux Toolkit with Redux Persist
- **Navigation:** React Navigation 7 (Native Stack)
- **Internationalisation:** i18next + react-i18next
- **Data Validation:** Zod (runtime schema validation)
- **Testing:** Jest + React Native Testing Library + Detox
- **Code Quality:** ESLint 9 + Prettier + Husky
- **Package Manager:** Yarn 3.6.4 (Berry)

---

## Documentation

Comprehensive guides are available in the `/docs` folder. Here's how to navigate them:

### 📋 Project Information

- **[Changelog](CHANGELOG.md)** - Version history and release notes

### 📖 How to Use This Documentation

**New to the project?** Follow this onboarding path:

1. **[Development Guide](docs/readme/DEVELOPMENT.md)** - Set up your environment, install dependencies, and run the app
2. **[Architecture](docs/readme/ARCHITECTURE.md)** - Understand the project structure and feature-first organisation
3. **[Cheatsheet](docs/readme/CHEATSHEET.md)** - Quick reference for commands and patterns

**Working on specific features?**

- 🎨 **UI & Components** → [Architecture Guide](docs/readme/ARCHITECTURE.md#component-patterns)
- 🧪 **Unit Testing** → [Testing Guide](docs/readme/TESTING.md)
- 🎭 **E2E Testing** → [E2E Testing Guide](docs/readme/E2E_TESTING.md)
- 🌍 **Translations** → [Internationalisation Guide](docs/readme/I18N.md)
- 📦 **State Management** → [State Management Guide](docs/readme/STATE_MANAGEMENT.md)

**Need quick help?**

- ⚡ **Quick Commands** → [Cheatsheet](docs/readme/CHEATSHEET.md)
- 🔄 **Common Workflows** → [Workflows Guide](docs/readme/WORKFLOWS.md)

### 📚 Core Documentation

- **[Architecture](docs/readme/ARCHITECTURE.md)** - Project structure, feature-first organisation, and design decisions
- **[Development](docs/readme/DEVELOPMENT.md)** - Setup guide, running the app, debugging, and troubleshooting
- **[Testing](docs/readme/TESTING.md)** - Unit and integration testing with Jest and React Native Testing Library
- **[MSW Testing Guide](docs/readme/MSW_TESTING_GUIDE.md)** - Advanced Redux integration testing with Mock Service Worker
- **[E2E Testing](docs/readme/E2E_TESTING.md)** - End-to-end testing with Detox, Cucumber, and MSW

### 🛠️ Feature-Specific Guides

- **[Internationalisation](docs/readme/I18N.md)** - i18n setup, adding translations, and language management
- **[State Management](docs/readme/STATE_MANAGEMENT.md)** - Redux Toolkit usage, creating features, and best practices
- **[Storybook](docs/readme/STORYBOOK.md)** - Component development and documentation
- **[Accessibility](docs/readme/ACCESSIBILITY.md)** - EAA compliance and WCAG 2.1 guidelines
- **[Performance](docs/readme/PERFORMANCE.md)** - Optimisation patterns and profiling
- **[Security](docs/readme/SECURITY.md)** - Security best practices

---

## Available Commands

```bash
# Development
yarn start              # Start Metro bundler
yarn start:reset        # Start Metro with cache reset
yarn ios                # Run iOS app (Debug)
yarn android            # Run Android app (Debug)

# Storybook
yarn storybook:ios      # Run Storybook on iOS
yarn storybook:android  # Run Storybook on Android
yarn storybook-generate # Regenerate story requirements

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

> **Note:** See [Cheatsheet](docs/readme/CHEATSHEET.md) for a complete command reference.

---

## Project Structure

```
warrendeleon/
├── .rnstorybook/         # Storybook configuration
├── docs/                  # Documentation
├── src/
│   ├── app/              # App entry point
│   ├── components/       # Shared components (with .stories.tsx files)
│   ├── features/         # Feature modules (screens, components, tests)
│   ├── navigation/       # Navigation setup
│   ├── i18n/             # Internationalisation
│   ├── schemas/          # Zod validation schemas
│   ├── store/            # Redux store
│   └── test-utils/       # Testing utilities
├── ios/                  # iOS native code
└── android/              # Android native code
```

See [Architecture Guide](docs/readme/ARCHITECTURE.md#project-structure) for detailed structure explanation.

---

## Requirements

| Tool           | Version |
| -------------- | ------- |
| Node.js        | 22.x    |
| Yarn           | 3.6.4   |
| Xcode          | 16.0+   |
| Android Studio | 2023.1+ |
| Java (JDK)     | 17      |
| CocoaPods      | 1.16+   |

See [Development Guide](docs/readme/DEVELOPMENT.md#prerequisites) for detailed setup instructions.

---

## License

MIT

---

## Contact

For questions or support, please open an issue on GitHub.
