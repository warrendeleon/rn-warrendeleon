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
    it('should render the wrapped component', () => {
      const authContext = createMockAuthContext({
        isAuthenticated: true,
        isLoading: false,
      });

      render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      expect(screen.getByTestId('protected-content')).toBeTruthy();
      expect(screen.getByText('Protected Content')).toBeTruthy();
    });

    it('should pass props to wrapped component', () => {
      const authContext = createMockAuthContext({
        isAuthenticated: true,
        isLoading: false,
      });

      render(<ProtectedScreen message="Custom Message" />, {
        wrapper: createWrapper(authContext),
      });

      expect(screen.getByText('Custom Message')).toBeTruthy();
    });

    it('should not redirect to login', () => {
      const authContext = createMockAuthContext({
        isAuthenticated: true,
        isLoading: false,
      });

      render(<ProtectedScreen />, {
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

      render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).toBeNull();
      });
    });

    it('should save intended route', async () => {
      const setIntendedRoute = jest.fn();
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: false,
        setIntendedRoute,
      });

      render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      await waitFor(() => {
        expect(setIntendedRoute).toHaveBeenCalledWith(mockRouteName);
      });
    });

    it('should redirect to login screen', async () => {
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: false,
      });

      render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      await waitFor(() => {
        expect(mockReset).toHaveBeenCalledWith({
          index: 1,
          routes: [{ name: 'Home' }, { name: 'Login' }],
        });
      });
    });
  });

  describe('when loading', () => {
    it('should render loading indicator', () => {
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
      });

      render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      expect(screen.getByTestId('auth-loading-indicator')).toBeTruthy();
    });

    it('should not render protected content while loading', () => {
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
      });

      render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      expect(screen.queryByTestId('protected-content')).toBeNull();
    });

    it('should not redirect while loading', () => {
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
      });

      render(<ProtectedScreen />, {
        wrapper: createWrapper(authContext),
      });

      expect(mockReset).not.toHaveBeenCalled();
    });

    it('should have accessible loading indicator', () => {
      const authContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
      });

      render(<ProtectedScreen />, {
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

  describe('transition states', () => {
    it('should handle transition from loading to authenticated', async () => {
      const initialContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
      });

      const { rerender } = render(<ProtectedScreen />, {
        wrapper: createWrapper(initialContext),
      });

      // Initially loading
      expect(screen.getByTestId('auth-loading-indicator')).toBeTruthy();

      // Simulate auth check complete - now authenticated
      const authenticatedContext = createMockAuthContext({
        isAuthenticated: true,
        isLoading: false,
      });

      rerender(
        <AuthContext.Provider value={authenticatedContext}>
          <ProtectedScreen />
        </AuthContext.Provider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeTruthy();
      });
    });

    it('should handle transition from loading to not authenticated', async () => {
      const initialContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: true,
      });

      const { rerender } = render(<ProtectedScreen />, {
        wrapper: createWrapper(initialContext),
      });

      // Initially loading
      expect(screen.getByTestId('auth-loading-indicator')).toBeTruthy();

      // Simulate auth check complete - not authenticated
      const unauthenticatedContext = createMockAuthContext({
        isAuthenticated: false,
        isLoading: false,
      });

      rerender(
        <AuthContext.Provider value={unauthenticatedContext}>
          <ProtectedScreen />
        </AuthContext.Provider>
      );

      await waitFor(() => {
        expect(mockReset).toHaveBeenCalled();
      });
    });
  });
});
