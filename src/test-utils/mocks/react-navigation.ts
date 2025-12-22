/**
 * Mock for @react-navigation/native hooks and navigation props used in tests
 *
 * This provides mock implementations for useNavigation and useRoute
 * that work without requiring a full Navigator stack.
 *
 * Usage for hooks:
 * ```typescript
 * import { getMockNavigation, navigationMock } from '@app/test-utils/mocks/react-navigation';
 * jest.mock('@react-navigation/native', () => navigationMock);
 * ```
 *
 * Usage for screen props (recommended):
 * ```typescript
 * import { createMockScreenProps } from '@app/test-utils/mocks/react-navigation';
 * const { navigation, route } = createMockScreenProps('Login');
 * <LoginScreen navigation={navigation} route={route} />
 * ```
 */

import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@app/navigation';

/**
 * Base mock navigation object with all required methods
 * Use this directly when you need the raw mock for assertions
 */
export const mockNavigation = {
  navigate: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  canGoBack: jest.fn().mockReturnValue(true),
  getParent: jest.fn(),
  getId: jest.fn(),
  getState: jest.fn().mockReturnValue({
    key: 'root',
    index: 0,
    routeNames: [],
    routes: [{ key: 'Test', name: 'Test', params: undefined }],
  }),
  addListener: jest.fn(() => () => {}),
  removeListener: jest.fn(),
  isFocused: jest.fn().mockReturnValue(true),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  replace: jest.fn(),
};

// Default route params for tests
const mockRoute = {
  key: 'Test-1',
  name: 'Test',
  params: {},
};

// Store for custom params set during tests
let currentRouteParams: Record<string, unknown> = {};

export const setMockRouteParams = (params: Record<string, unknown>) => {
  currentRouteParams = params;
};

export const clearMockRouteParams = () => {
  currentRouteParams = {};
};

export const getMockNavigation = () => mockNavigation;
export const getMockRoute = () => ({ ...mockRoute, params: currentRouteParams });

/**
 * Reset all navigation mocks to initial state
 * Call this in beforeEach() to ensure clean state between tests
 */
export const resetNavigationMocks = () => {
  mockNavigation.navigate.mockClear();
  mockNavigation.reset.mockClear();
  mockNavigation.goBack.mockClear();
  mockNavigation.setParams.mockClear();
  mockNavigation.dispatch.mockClear();
  mockNavigation.setOptions.mockClear();
  mockNavigation.canGoBack.mockClear().mockReturnValue(true);
  mockNavigation.getParent.mockClear();
  mockNavigation.getId.mockClear();
  mockNavigation.getState.mockClear().mockReturnValue({
    key: 'root',
    index: 0,
    routeNames: [],
    routes: [{ key: 'Test', name: 'Test', params: undefined }],
  });
  mockNavigation.addListener.mockClear().mockImplementation(() => () => {});
  mockNavigation.removeListener.mockClear();
  mockNavigation.isFocused.mockClear().mockReturnValue(true);
  mockNavigation.push.mockClear();
  mockNavigation.pop.mockClear();
  mockNavigation.popToTop.mockClear();
  mockNavigation.replace.mockClear();
  clearMockRouteParams();
};

/**
 * Create type-safe mock navigation and route props for a specific screen
 *
 * @param screenName - The name of the screen from RootStackParamList
 * @param params - Optional route params (defaults from RootStackParamList if defined)
 * @returns Object with navigation and route props ready to spread into screen component
 *
 * @example
 * ```typescript
 * const { navigation, route } = createMockScreenProps('Login');
 * renderWithProviders(<LoginScreen navigation={navigation} route={route} />);
 *
 * // With params:
 * const { navigation, route } = createMockScreenProps('Profile', { userId: '123' });
 * ```
 */
export function createMockScreenProps<T extends keyof RootStackParamList>(
  screenName: T,
  params?: RootStackParamList[T]
): {
  navigation: NativeStackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
} {
  const navigation = {
    ...mockNavigation,
    getState: jest.fn().mockReturnValue({
      key: screenName as string,
      index: 0,
      routeNames: [screenName as string],
      routes: [{ key: screenName as string, name: screenName as string, params }],
    }),
  } as unknown as NativeStackNavigationProp<RootStackParamList, T>;

  const route = {
    key: screenName as string,
    name: screenName as string,
    params,
  } as unknown as RouteProp<RootStackParamList, T>;

  return { navigation, route };
}

// Mock implementation for jest.mock
export const navigationMock = {
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useRoute: () => getMockRoute(),
  useFocusEffect: (callback: () => void) => {
    // Execute callback immediately for tests
    callback();
  },
};
