# Architecture

This document describes the architectural decisions and folder structure of the project.

## Table of Contents

- [Project Structure](#project-structure)
- [Feature-First Organization](#feature-first-organization)
- [Component Organization](#component-organization)
- [Shared Utilities](#shared-utilities)
- [Path Aliases](#path-aliases)
- [Design Decisions](#design-decisions)

## Project Structure

```
warrendeleon/
├── src/
│   ├── app/                    # App entry point
│   ├── components/             # Shared/reusable components
│   │   ├── ButtonWithChevron/
│   │   ├── ChevronButtonGroup/
│   │   ├── shared/            # Shared component utilities
│   │   └── index.ts           # Barrel exports
│   ├── config/                # App configuration
│   ├── features/              # Feature modules
│   │   ├── Home/
│   │   └── Settings/
│   ├── hooks/                 # Shared React hooks
│   ├── i18n/                  # Internationalization
│   ├── navigation/            # React Navigation setup
│   ├── store/                 # Redux store configuration
│   ├── test-utils/            # Testing utilities
│   │   └── cucumber/          # E2E test utilities
│   └── types/                 # TypeScript type declarations
├── ios/                       # iOS native code
├── android/                   # Android native code
└── docs/                      # Documentation
```

## Feature-First Organization

Features are organized under `src/features/` with everything related to that feature co-located:

```
features/
  Settings/
    __tests__/
      SettingsScreen.rntl.tsx      # Unit/integration tests
      SettingsScreen.feature        # E2E Gherkin scenarios
      SettingsScreen.cucumber.tsx   # E2E step definitions
    components/                     # Feature-specific components
    store/                          # Feature-specific Redux
      actions.ts
      reducer.ts
      selectors.ts
    SettingsScreen.tsx              # Main screen component
```

### Benefits

- **Cohesion**: Related code stays together
- **Scalability**: Easy to add new features without affecting existing ones
- **Discoverability**: Clear where to find feature-related code
- **Ownership**: Teams can own entire features
- **Testing**: Tests live next to the code they test

## Component Organization

### Shared Components

Reusable components live in `src/components/` and follow this structure:

```
components/
  ButtonWithChevron/
    __tests__/
      ButtonWithChevron.rntl.tsx
    ButtonWithChevron.tsx
    index.ts                        # Re-export
```

### Component Patterns

1. **Co-located Tests**: Tests live in `__tests__/` next to components
2. **Index Files**: Barrel exports for clean imports
3. **TypeScript**: All components are fully typed
4. **Test IDs**: Components include `testID` props for E2E testing

## Shared Utilities

Shared utilities are organized by domain:

### Component Shared Utilities

```
components/shared/
  types.ts          # Shared TypeScript types
  constants.ts      # Shared constants
  utils.ts          # Shared utility functions
  __tests__/
    utils.test.ts
  index.ts          # Barrel export
```

**Example**: `GroupVariant` type and `getButtonGroupVariant` utility are shared across multiple button group components.

### Test Utilities

```
test-utils/
  index.ts                    # Unit test utilities (renderWithProviders)
  cucumber/                   # E2E test utilities
    support/
      world.ts                # Cucumber World
      hooks.ts                # Before/After hooks
    step-definitions/
      common.steps.tsx        # Shared Cucumber steps
    mocks/
      server.ts               # MSW server setup
```

## Path Aliases

The project uses TypeScript path aliases for clean imports:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@app/*": ["./src/*"]
    }
  }
}
```

**Usage:**

```typescript
// Instead of:
import { Button } from '../../../components/Button';

// Use:
import { Button } from '@app/components';
```

## Design Decisions

### 1. Feature-First vs Domain-First

**Decision**: Feature-first organization

**Rationale**:

- Better scalability for growing apps
- Clear feature boundaries
- Easier for teams to work independently
- Reduces merge conflicts

### 2. Co-located Tests

**Decision**: Tests live in `__tests__/` folders next to the code

**Rationale**:

- Easy to find tests for a component/feature
- Tests move with the code during refactoring
- Clear what's tested vs what's not

### 3. Test File Naming

**Decision**: Use suffixes to distinguish test types

- `.rntl.tsx` - Unit/integration tests (React Native Testing Library)
- `.feature` - E2E Gherkin scenarios
- `.cucumber.tsx` - E2E step definitions

**Rationale**:

- Clear test type at a glance
- Easy to configure test runners
- Supports multiple testing strategies in same folder

### 4. Shared Utilities Pattern

**Decision**: Extract shared code into dedicated `shared/` folders

**Rationale**:

- DRY principle - eliminates duplication
- Single source of truth
- Easier to maintain and update
- Clear dependencies

### 5. Index Barrel Exports

**Decision**: Use `index.ts` files to re-export from folders

**Rationale**:

- Clean import statements
- Hides internal structure
- Easy to refactor internals without breaking imports

**Example**:

```typescript
// components/shared/index.ts
export type { GroupVariant } from './types';
export { groupVariantRadius } from './constants';
export { getButtonGroupVariant } from './utils';

// Usage
import { GroupVariant, getButtonGroupVariant } from '@app/components/shared';
```

### 6. TypeScript Everywhere

**Decision**: 100% TypeScript, no JavaScript

**Rationale**:

- Type safety catches bugs early
- Better IDE support
- Self-documenting code
- Easier refactoring

### 7. Redux for State Management

**Decision**: Redux Toolkit with feature-based organization

**Rationale**:

- Predictable state management
- Great DevTools
- Easy to test
- Feature-based slices keep state organized

### 8. Component Library Choice

**Decision**: GlueStack UI + NativeWind

**Rationale**:

- Modern, accessible components
- Tailwind-like styling with NativeWind
- Good TypeScript support
- Active development

## Architecture Principles

1. **Separation of Concerns**: Features, components, and utilities are clearly separated
2. **DRY (Don't Repeat Yourself)**: Shared code is extracted and reused
3. **Single Responsibility**: Each module/component has one clear purpose
4. **Testability**: Architecture supports easy testing at all levels
5. **Scalability**: Easy to add features without refactoring existing code
6. **Type Safety**: TypeScript ensures correctness
7. **Developer Experience**: Clear structure, good tooling, fast feedback loops
