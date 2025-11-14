# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### User-Facing Features

#### Settings & Preferences

- Settings screen with iOS-style UI following Apple's design language
- Theme preference (System, Light, Dark) with persistence
- Language selection (English, Spanish) with device locale detection
- Appearance settings screen
- Language settings screen

#### Internationalisation (i18n)

- Full i18n support using i18next and react-i18next
- English and Spanish translations
- Device locale detection and fallback
- Locale parity testing to ensure translation completeness

#### User Interface

- iOS Settings-style UI using GlueStack UI and NativeWind (Tailwind CSS)
- Dark mode support with system colour scheme detection
- Grouped list components with rounded corners
- Coloured icon backgrounds with rounded squares
- Minimal navigation (chevron-only back button)
- Accessibility labels across all screens and components

#### Error Handling

- ErrorBoundary component with fallback UI
- Graceful error recovery with "Try Again" functionality
- E2E testing for error scenarios

### Technical Foundation

#### Architecture

- Feature-first project organisation
- Barrel exports with `@app` path alias
- Separation of concerns (features, components, navigation, store)
- Provider hierarchy: ErrorBoundary → Redux → GluestackUI → NavigationContainer → i18next

#### State Management

- Redux Toolkit for global state
- Redux Persist with AsyncStorage
- Settings slice with theme and language preferences
- Reselect for optimised selectors
- Reactotron integration for development debugging

#### Testing & Quality

- Jest + React Native Testing Library
- 97 passing tests across 20 suites
- 100% coverage on business logic (Redux slices, selectors, utilities, shared components)
- 85% global coverage threshold
- Detox + Cucumber for E2E testing with BDD scenarios
- Custom test utilities (renderWithProviders, common step definitions)
- Recursive dismiss pattern for React Native dev error screens

#### Performance Optimisations

- React.memo for list components (70% re-render reduction)
- useMemo for computed values
- useCallback for stable function references
- Async operations support (2-3x performance improvement)
- 58-60 FPS scrolling performance

#### Code Quality

- TypeScript 5.8.3 with strict mode
- ESLint 9 flat config with auto-fix
- Prettier for code formatting
- Pre-commit hooks (Husky + lint-staged) for automated checks
- Import sorting with eslint-plugin-simple-import-sort

#### Documentation

- Comprehensive documentation in `/docs` folder
- Mermaid diagrams for architecture visualisation
- UK English throughout all documentation
- Notion workspace integration for planning
- Epic/User Story/Task structure with 5 Epics planned

### Technology Stack

- React Native 0.82.1
- TypeScript 5.8.3
- Yarn 3.6.4 (Berry)
- Node.js 22.12
- GlueStack UI v1.1.73
- NativeWind v4.2.1 (Tailwind CSS for React Native)
- React Navigation v7.1.19
- Redux Toolkit v2.10.1
- i18next v25.6.0 + react-i18next v16.2.4
- Jest + React Native Testing Library
- Detox + Cucumber for E2E
- Hermes JavaScript engine (enabled)

---

## [0.0.1] - 2025-11-03

### Project Restart

- Complete project restart with React Native 0.82.1
- Fresh TypeScript configuration with strict mode
- Yarn 3.6.4 package manager setup
- Basic navigation structure using React Navigation 7
- Initial ESLint and Prettier configuration

**Note**: This release represents the project restart on 3 November 2025. The previous version (v2.0.0 from 2022 using NativeBase) has been deprecated and is not maintained. All old code was removed to start fresh with modern React Native architecture.

---

_First formal release will be cut when MVP features are complete (target: v0.1.0-alpha)_
