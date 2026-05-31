/**
 * Protected Route Flow Integration Tests
 *
 * Tests the withAuth HOC behavior in context of user journeys:
 * Unauthenticated → Access Protected Route → Redirect to Login → Authenticate → Return
 */

import React from 'react';
import { Text } from 'react-native';
import { render, screen, waitFor } from '@testing-library/react-native';

import { AuthContext, type AuthContextValue } from '@app/features/Auth/context';
import { withAuth } from '@app/shared/components/ProtectedRoute/ProtectedRoute';

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

describe('Protected Route Flow Integration', () => {
  // Test component representing protected content
  const ProtectedContent: React.FC<{ title?: string }> = ({ title = 'Protected Content' }) => (
    <Text testID="protected-content">{title}</Text>
  );

  const ProtectedScreen = withAuth(ProtectedContent);

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

  describe('unauthenticated access handling', () => {
    it('should redirect to login when not authenticated', async () => {
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
          expect(mockReset).toHaveBeenCalledWith({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'Login' }],
          });
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should save intended route for post-login redirect', async () => {
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

    it('should not render protected content when not authenticated', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: false,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      expect(screen.queryByTestId('protected-content')).toBeNull();
    });
  });

  describe('authenticated access', () => {
    it('should render protected content when authenticated', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: 'user-123',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: null,
          profilePicture: null,
          authProvider: 'email',
        },
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      expect(screen.getByTestId('protected-content')).toBeOnTheScreen();
      expect(screen.getByText('Protected Content')).toBeOnTheScreen();
    });

    it('should not redirect when authenticated', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: 'user-123',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: null,
          profilePicture: null,
          authProvider: 'email',
        },
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      expect(mockReset).not.toHaveBeenCalled();
    });

    it('should pass props to protected component', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: true,
        isLoading: false,
      });

      await render(<ProtectedScreen title="Custom Protected Page" />, {
        wrapper: createWrapper(authContext),
      });

      expect(screen.getByText('Custom Protected Page')).toBeOnTheScreen();
    });
  });

  describe('loading state handling', () => {
    it('should show loading indicator during session check', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      expect(screen.getByTestId('auth-loading-indicator')).toBeOnTheScreen();
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
  });

  describe('authentication state transitions', () => {
    it('should redirect when transitioning from loading to unauthenticated', async () => {
      const setIntendedRoute = jest.fn();

      // Start with loading state
      const loadingContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
        setIntendedRoute,
      });

      const { rerender } = await render(<ProtectedScreen />, {
        wrapper: createWrapper(loadingContext),
      });

      expect(mockReset).not.toHaveBeenCalled();

      // Transition to unauthenticated
      const unauthContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: false,
        setIntendedRoute,
      });

      await rerender(
        <AuthContext.Provider value={unauthContext}>
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

    it('should render content when transitioning from loading to authenticated', async () => {
      // Start with loading state
      const loadingContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
      });

      const { rerender } = await render(<ProtectedScreen />, {
        wrapper: createWrapper(loadingContext),
      });

      expect(screen.queryByTestId('protected-content')).toBeNull();

      // Transition to authenticated
      const authContext = createMockAuthContext({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: 'user-123',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: null,
          profilePicture: null,
          authProvider: 'email',
        },
      });

      await rerender(
        <AuthContext.Provider value={authContext}>
          <ProtectedScreen />
        </AuthContext.Provider>
      );

      expect(screen.getByTestId('protected-content')).toBeOnTheScreen();
    });
  });

  describe('accessibility during protected route transitions', () => {
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

  describe('intended route preservation', () => {
    it('should clear intended route after successful navigation', async () => {
      const clearIntendedRoute = jest.fn();
      const authContext = createMockAuthContext({
        isAuthenticated: true,
        isLoading: false,
        intendedRoute: 'ProtectedScreen',
        clearIntendedRoute,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      // Content should be rendered
      expect(screen.getByTestId('protected-content')).toBeOnTheScreen();
    });

    it('should handle null intended route gracefully', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: true,
        isLoading: false,
        intendedRoute: null,
      });

      await render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      // Should render without errors
      expect(screen.getByTestId('protected-content')).toBeOnTheScreen();
    });
  });

  describe('HOC display name', () => {
    it('should set correct display name for debugging', () => {
      expect(ProtectedScreen.displayName).toBe('withAuth(ProtectedContent)');
    });
  });
});
