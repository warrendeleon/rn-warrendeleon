# TASK-337: Auth Navigation RNTL Tests

**Task ID**: TASK-337
**Title**: Auth Navigation RNTL Tests
**User Story**: [US-060](../stories/US-060-auth-navigation-foundation.md) - Auth Navigation Foundation
**Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md) - Login & Session Management
**Status**: 📋 To Do
**Priority**: High
**Effort**: 2 hours
**Owner**: Warren de Leon
**Created**: 2025-11-25
**Dependencies**: TASK-333, TASK-334, TASK-335

---

## Context

Full unit tests for the auth navigation foundation components. Tests should cover AuthContext, useAuth hook, and ProtectedRoute HOC with 100% coverage.

---

## Objective

Write RNTL tests for:

1. AuthContext provider and value
2. useAuth hook
3. ProtectedRoute HOC (withAuth)
4. Integration scenarios

**Deliverable**: 100% test coverage for auth navigation code.

---

## Test Files

### AuthContext Tests

Create `src/features/Auth/context/__tests__/AuthContext.rntl.tsx`:

```typescript
import React from 'react';

import { renderHook, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { checkSession } from '../../store';
import { AuthContext, AuthProvider } from '../AuthContext';

// Mock Redux store
const mockStore = {
  getState: () => ({
    auth: {
      isAuthenticated: false,
      isLoading: true,
      user: null,
    },
  }),
  subscribe: jest.fn(),
  dispatch: jest.fn(),
};

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider store={mockStore as any}>{children}</Provider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthProvider', () => {
    it('dispatches checkSession on mount', async () => {
      renderHook(
        () => {
          const context = React.useContext(AuthContext);
          return context;
        },
        {
          wrapper: ({ children }) => (
            <Provider store={mockStore as any}>
              <AuthProvider>{children}</AuthProvider>
            </Provider>
          ),
        }
      );

      await waitFor(() => {
        expect(mockStore.dispatch).toHaveBeenCalled();
      });
    });

    it('provides auth context value', () => {
      const { result } = renderHook(
        () => {
          const context = React.useContext(AuthContext);
          return context;
        },
        {
          wrapper: ({ children }) => (
            <Provider store={mockStore as any}>
              <AuthProvider>{children}</AuthProvider>
            </Provider>
          ),
        }
      );

      expect(result.current).toEqual(
        expect.objectContaining({
          isAuthenticated: expect.any(Boolean),
          isLoading: expect.any(Boolean),
          user: expect.anything(),
          intendedRoute: null,
          setIntendedRoute: expect.any(Function),
          clearIntendedRoute: expect.any(Function),
        })
      );
    });

    it('manages intendedRoute state', () => {
      const { result } = renderHook(
        () => {
          const context = React.useContext(AuthContext);
          return context;
        },
        {
          wrapper: ({ children }) => (
            <Provider store={mockStore as any}>
              <AuthProvider>{children}</AuthProvider>
            </Provider>
          ),
        }
      );

      // Initial state
      expect(result.current?.intendedRoute).toBeNull();

      // Set intended route
      result.current?.setIntendedRoute('BookACall');
      expect(result.current?.intendedRoute).toBe('BookACall');

      // Clear intended route
      result.current?.clearIntendedRoute();
      expect(result.current?.intendedRoute).toBeNull();
    });
  });
});
```

### useAuth Hook Tests

Create `src/features/Auth/hooks/__tests__/useAuth.rntl.tsx`:

```typescript
import React from 'react';

import { renderHook } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { AuthProvider } from '../../context';
import { useAuth } from '../useAuth';

const mockStore = {
  getState: () => ({
    auth: {
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-123', email: 'test@example.com' },
    },
  }),
  subscribe: jest.fn(),
  dispatch: jest.fn(),
};

describe('useAuth', () => {
  it('returns auth context value when used within AuthProvider', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore as any}>
          <AuthProvider>{children}</AuthProvider>
        </Provider>
      ),
    });

    expect(result.current).toEqual(
      expect.objectContaining({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'user-123', email: 'test@example.com' },
      })
    );
  });

  it('throws error when used outside AuthProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleError.mockRestore();
  });
});
```

### ProtectedRoute HOC Tests

Create `src/components/ProtectedRoute/__tests__/ProtectedRoute.rntl.tsx`:

```typescript
import React from 'react';

import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { withAuth } from '../ProtectedRoute';

// Mock useAuth hook
const mockUseAuth = jest.fn();
jest.mock('@app/features/Auth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({ name: 'ProtectedScreen' }),
}));

const TestComponent: React.FC = () => <Text>Protected Content</Text>;
const ProtectedTestComponent = withAuth(TestComponent);

describe('withAuth HOC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading indicator when isLoading is true', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      setIntendedRoute: jest.fn(),
    });

    const { getByRole } = render(<ProtectedTestComponent />);

    expect(getByRole('progressbar')).toBeTruthy();
  });

  it('renders wrapped component when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      setIntendedRoute: jest.fn(),
    });

    const { getByText } = render(<ProtectedTestComponent />);

    expect(getByText('Protected Content')).toBeTruthy();
  });

  it('navigates to Login when not authenticated', async () => {
    const mockSetIntendedRoute = jest.fn();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      setIntendedRoute: mockSetIntendedRoute,
    });

    render(<ProtectedTestComponent />);

    await waitFor(() => {
      expect(mockSetIntendedRoute).toHaveBeenCalledWith('ProtectedScreen');
      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });

  it('returns null while redirecting (no flash)', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      setIntendedRoute: jest.fn(),
    });

    const { toJSON } = render(<ProtectedTestComponent />);

    expect(toJSON()).toBeNull();
  });

  it('sets correct display name for debugging', () => {
    expect(ProtectedTestComponent.displayName).toBe('withAuth(TestComponent)');
  });
});
```

---

## Coverage Requirements

| File                 | Coverage Target |
| -------------------- | --------------- |
| `AuthContext.tsx`    | 100%            |
| `useAuth.ts`         | 100%            |
| `ProtectedRoute.tsx` | 100%            |

---

## Acceptance Criteria

- [ ] AuthContext tests complete with 100% coverage
- [ ] useAuth hook tests complete with 100% coverage
- [ ] ProtectedRoute HOC tests complete with 100% coverage
- [ ] All tests pass
- [ ] Tests follow existing patterns (renderWithProviders, etc.)
- [ ] Tests are in correct `__tests__/` directories

---

**Estimated Time**: 2 hours
**Last Updated**: 2025-11-25
