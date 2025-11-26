import React, { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { Box } from '@gluestack-ui/themed';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useAuth } from '@app/features/Auth';
import type { RootStackParamList } from '@app/navigation';

/**
 * Loading Indicator Component
 * EAA Compliant with proper accessibility
 */
const LoadingIndicator: React.FC = () => (
  <Box
    flex={1}
    justifyContent="center"
    alignItems="center"
    accessibilityRole="progressbar"
    accessibilityLabel="Checking authentication status"
    testID="auth-loading-indicator"
  >
    <ActivityIndicator size="large" />
  </Box>
);

/**
 * withAuth Higher-Order Component
 *
 * Wraps screen components to require authentication.
 * Redirects to Login if not authenticated, saving intended route.
 *
 * @param WrappedComponent - Screen component to protect
 * @returns Protected screen component
 *
 * @example
 * ```tsx
 * // In screen file
 * const BookACallScreen: React.FC = () => { ... };
 * export default withAuth(BookACallScreen);
 *
 * // In navigator
 * <Stack.Screen name="BookACall" component={BookACallScreen} />
 * ```
 */
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  const ProtectedComponent: React.FC<P> = props => {
    const { isAuthenticated, isLoading, setIntendedRoute } = useAuth();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        // Save intended destination for post-login redirect
        setIntendedRoute(route.name);
        // Replace current screen with Login so back button returns to previous screen
        navigation.reset({
          index: 1,
          routes: [{ name: 'Home' }, { name: 'Login' }],
        });
      }
    }, [isAuthenticated, isLoading, navigation, route.name, setIntendedRoute]);

    // Show loading while checking auth status
    if (isLoading) {
      return <LoadingIndicator />;
    }

    // Return null while redirecting to prevent flash
    if (!isAuthenticated) {
      return null;
    }

    // Render protected screen when authenticated
    return <WrappedComponent {...props} />;
  };

  // Set display name for debugging
  const wrappedName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  ProtectedComponent.displayName = `withAuth(${wrappedName})`;

  return ProtectedComponent;
};
