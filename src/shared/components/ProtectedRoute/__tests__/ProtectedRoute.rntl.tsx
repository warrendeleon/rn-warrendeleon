/**
 * Tests for ProtectedRoute (withAuth HOC)
 *
 */

import React from 'react';
import { Text } from 'react-native';
import { render, screen, waitFor } from '@testing-library/react-native';

import { AuthContext, type AuthContextValue } from '@app/features/Auth/context';

import { withAuth } from '../ProtectedRoute';

// Mock navigation
const mockReset = jest.fn();
const mockRouteName = 'ProtectedScreen';
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    reset: mockReset,
  }),
  useRoute: () => ({
    name: mockRouteName,
  }),
}));

describe('withAuth HOC', () => {
  // Simple test component
  const TestScreen: React.FC<{ message?: string }> = ({ message = 'Protected Content' }) => (
    <Text testID="protected-content">{message}</Text>
  );

  const ProtectedScreen = withAuth(TestScreen);

  const createMockAuthContext = (overrides: Partial<AuthContextValue> = {}): AuthContextValue => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    intendedRoute: null,
    setIntendedRoute: jest.fn(),
    clearIntendedRoute: jest.fn(),
    ...overrides,
  });

  const createWrapper = (contextValue: AuthContextValue) => {
    return ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when authenticated', () => {
    it('displays protected content when user is authenticated', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: true,
        isLoading: false,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      expect(screen.getByTestId('protected-content')).toBeTruthy();
      expect(screen.getByText('Protected Content')).toBeTruthy();
    });

    it('should pass props to wrapped component', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: true,
        isLoading: false,
      });

      await render(<ProtectedScreen message="Custom Message" />, {
        wrapper: createWrapper(authContext),
      });

      expect(screen.getByText('Custom Message')).toBeTruthy();
    });

    it('should not redirect to login', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: true,
        isLoading: false,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      expect(mockReset).not.toHaveBeenCalled();
    });
  });

  describe('when not authenticated', () => {
    it('should not render the wrapped component', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: false,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      await waitFor(
        () => {
          expect(screen.queryByTestId('protected-content')).toBeNull();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should save intended route', async () => {
      const setIntendedRoute = jest.fn();
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: false,
        setIntendedRoute,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      await waitFor(
        () => {
          expect(setIntendedRoute).toHaveBeenCalledWith(mockRouteName);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should redirect to login screen', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: false,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      await waitFor(
        () => {
          expect(mockReset).toHaveBeenCalledWith({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'Login' }],
          });
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('when loading', () => {
    it('displays loading spinner while auth state is being determined', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      expect(screen.getByTestId('auth-loading-indicator')).toBeTruthy();
    });

    it('should not render protected content while loading', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      expect(screen.queryByTestId('protected-content')).toBeNull();
    });

    it('should not redirect while loading', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      expect(mockReset).not.toHaveBeenCalled();
    });

    it('should have accessible loading indicator', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      const loadingIndicator = screen.getByTestId('auth-loading-indicator');
      expect(loadingIndicator.props.accessibilityRole).toBe('progressbar');
      expect(loadingIndicator.props.accessibilityLabel).toBe('Checking authentication status');
    });
  });

  describe('display name', () => {
    it('should set display name for debugging', () => {
      expect(ProtectedScreen.displayName).toBe('withAuth(TestScreen)');
    });

    it('should handle component without name', () => {
      const AnonymousComponent: React.FC = () => <Text>Anonymous</Text>;
      const ProtectedAnonymous = withAuth(AnonymousComponent);

      // React assigns 'AnonymousComponent' as the name
      expect(ProtectedAnonymous.displayName).toMatch(/withAuth\(/);
    });

    it('should use displayName if available', () => {
      const NamedComponent: React.FC = () => <Text>Named</Text>;
      NamedComponent.displayName = 'CustomDisplayName';
      const ProtectedNamed = withAuth(NamedComponent);

      expect(ProtectedNamed.displayName).toBe('withAuth(CustomDisplayName)');
    });
  });

  describe('session security', () => {
    it('should immediately redirect when authentication becomes invalid', async () => {
      // Start authenticated
      const initialContext = createMockAuthContext({
        isAuthenticated: true,
        isLoading: false,
      });

      const { rerender } = await render(<ProtectedScreen />, {
        wrapper: createWrapper(initialContext),
      });

      // Content is shown
      expect(screen.getByTestId('protected-content')).toBeTruthy();
      expect(mockReset).not.toHaveBeenCalled();

      // Session becomes invalid (e.g., token expired)
      const invalidatedContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: false,
      });

      await rerender(
        <AuthContext.Provider value={invalidatedContext}>
          <ProtectedScreen />
        </AuthContext.Provider>
      );

      // Should redirect to login
      await waitFor(
        () => {
          expect(mockReset).toHaveBeenCalled();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should not render protected content during auth state transitions', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      // During loading/transition, protected content should not be visible
      expect(screen.queryByTestId('protected-content')).toBeNull();
      // Loading indicator should be shown instead
      expect(screen.getByTestId('auth-loading-indicator')).toBeTruthy();
    });

    it('should save intended route before redirecting', async () => {
      const setIntendedRoute = jest.fn();
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: false,
        setIntendedRoute,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      // Should save the route user was trying to access
      await waitFor(
        () => {
          expect(setIntendedRoute).toHaveBeenCalledWith(mockRouteName);
        },
        { timeout: 3000, interval: 100 }
      );

      // Then redirect
      await waitFor(
        () => {
          expect(mockReset).toHaveBeenCalled();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should redirect to login with proper navigation stack', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: false,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      await waitFor(
        () => {
          // Should reset to proper navigation state (Home -> Login)
          expect(mockReset).toHaveBeenCalledWith({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'Login' }],
          });
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('transition states', () => {
    it('should handle transition from loading to authenticated', async () => {
      const initialContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
      });

      const { rerender } = await render(<ProtectedScreen />, {
        wrapper: createWrapper(initialContext),
      });

      // Initially loading
      expect(screen.getByTestId('auth-loading-indicator')).toBeTruthy();

      // Simulate auth check complete - now authenticated
      const authenticatedContext = createMockAuthContext({
        isAuthenticated: true,
        isLoading: false,
      });

      await rerender(
        <AuthContext.Provider value={authenticatedContext}>
          <ProtectedScreen />
        </AuthContext.Provider>
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('protected-content')).toBeTruthy();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle transition from loading to not authenticated', async () => {
      const initialContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
      });

      const { rerender } = await render(<ProtectedScreen />, {
        wrapper: createWrapper(initialContext),
      });

      // Initially loading
      expect(screen.getByTestId('auth-loading-indicator')).toBeTruthy();

      // Simulate auth check complete - not authenticated
      const unauthenticatedContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: false,
      });

      await rerender(
        <AuthContext.Provider value={unauthenticatedContext}>
          <ProtectedScreen />
        </AuthContext.Provider>
      );

      await waitFor(
        () => {
          expect(mockReset).toHaveBeenCalled();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('focus management after navigation', () => {
    it('should maintain accessible loading indicator during auth check', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      const loadingIndicator = screen.getByTestId('auth-loading-indicator');
      // Loading indicator should be accessible for screen readers
      expect(loadingIndicator.props.accessibilityRole).toBe('progressbar');
      expect(loadingIndicator.props.accessibilityLabel).toBeTruthy();
    });

    it('should preserve focus context when transitioning to authenticated', async () => {
      const initialContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
      });

      const { rerender } = await render(<ProtectedScreen />, {
        wrapper: createWrapper(initialContext),
      });

      // Initially loading
      expect(screen.getByTestId('auth-loading-indicator')).toBeTruthy();

      // Simulate successful auth
      const authenticatedContext = createMockAuthContext({
        isAuthenticated: true,
        isLoading: false,
      });

      await rerender(
        <AuthContext.Provider value={authenticatedContext}>
          <ProtectedScreen />
        </AuthContext.Provider>
      );

      await waitFor(
        () => {
          const content = screen.getByTestId('protected-content');
          // Protected content should be accessible (not hidden from accessibility tree)
          expect(content.props.accessible).not.toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should not show protected content briefly during redirect', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: false,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      // Content should never be visible during redirect
      await waitFor(
        () => {
          expect(screen.queryByTestId('protected-content')).toBeNull();
        },
        { timeout: 3000, interval: 100 }
      );

      // Redirect should have been triggered
      expect(mockReset).toHaveBeenCalled();
    });
  });
});
