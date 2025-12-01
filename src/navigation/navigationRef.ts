import { createNavigationContainerRef, StackActions } from '@react-navigation/native';

import type { RootStackParamList } from './RootNavigator/RootNavigator';

/**
 * Navigation reference for programmatic navigation
 *
 * Used for deep link handling during warm starts when React Navigation's
 * built-in linking doesn't properly trigger navigation.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a screen programmatically
 *
 * Safe to call even when navigation isn't ready - will be a no-op.
 */
export const navigate = <RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
): void => {
  if (navigationRef.isReady()) {
    // Use push to ensure we navigate even if already on the same screen type
    navigationRef.dispatch(StackActions.push(name, params));
  }
};

/**
 * Reset navigation state to a specific route
 *
 * Used for deep links that need to reset the navigation stack.
 */
export const resetToRoute = <RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
): void => {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 1,
      routes: [{ name: 'Home' }, { name, params }],
    });
  }
};
