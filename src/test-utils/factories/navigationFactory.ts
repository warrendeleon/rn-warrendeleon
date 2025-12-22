/**
 * Navigation Test Factories
 *
 * Factory functions for creating mock navigation objects in tests.
 * Supports React Navigation's NativeStackNavigationProp and route objects.
 */

import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@app/navigation';

type ScreenName = keyof RootStackParamList;

/**
 * Creates a mock navigation object for testing screens
 *
 * @param screenName - The name of the screen being tested
 * @returns Mock navigation object with all required methods
 */
export function createMockNavigation<T extends ScreenName>(
  screenName: T
): NativeStackNavigationProp<RootStackParamList, T> {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
    setParams: jest.fn(),
    addListener: jest.fn(() => () => {}),
    removeListener: jest.fn(),
    dispatch: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
    getId: jest.fn(),
    getParent: jest.fn(),
    getState: jest.fn(() => ({
      key: screenName,
      index: 0,
      routeNames: [screenName],
      routes: [{ key: screenName, name: screenName, params: undefined }],
    })),
    push: jest.fn(),
    pop: jest.fn(),
    popTo: jest.fn(),
    popToTop: jest.fn(),
    replace: jest.fn(),
  } as unknown as NativeStackNavigationProp<RootStackParamList, T>;
}

/**
 * Creates a mock route object for testing screens
 *
 * @param screenName - The name of the screen being tested
 * @param params - Optional route parameters
 * @returns Mock route object
 */
export function createMockRoute<T extends ScreenName>(
  screenName: T,
  params?: RootStackParamList[T]
): RouteProp<RootStackParamList, T> {
  // Cast via unknown for React Navigation's stricter RouteProp typing
  // which requires Extract<T, string> but our ScreenName type is keyof RootStackParamList
  return {
    key: screenName,
    name: screenName,
    params,
  } as unknown as RouteProp<RootStackParamList, T>;
}

/**
 * Screen props type for testing
 */
export interface ScreenTestProps<T extends ScreenName> {
  navigation: NativeStackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
}

/**
 * Creates both navigation and route objects for a screen
 *
 * @param screenName - The name of the screen being tested
 * @param params - Optional route parameters
 * @returns Object containing navigation and route mocks
 */
export function createScreenProps<T extends ScreenName>(
  screenName: T,
  params?: RootStackParamList[T]
): ScreenTestProps<T> {
  return {
    navigation: createMockNavigation(screenName),
    route: createMockRoute(screenName, params),
  };
}

// Pre-configured factories for common screens
export const loginScreenProps = (): ScreenTestProps<'Login'> => createScreenProps('Login');
export const registrationScreenProps = (): ScreenTestProps<'Registration'> =>
  createScreenProps('Registration');
export const forgotPasswordScreenProps = (): ScreenTestProps<'ForgotPassword'> =>
  createScreenProps('ForgotPassword');
export const resetPasswordScreenProps = (
  params?: RootStackParamList['ResetPassword']
): ScreenTestProps<'ResetPassword'> => createScreenProps('ResetPassword', params);
export const homeScreenProps = (): ScreenTestProps<'Home'> => createScreenProps('Home');
export const profileScreenProps = (): ScreenTestProps<'Profile'> => createScreenProps('Profile');
export const settingsScreenProps = (): ScreenTestProps<'Settings'> => createScreenProps('Settings');
export const editAccountScreenProps = (): ScreenTestProps<'EditAccount'> =>
  createScreenProps('EditAccount');
