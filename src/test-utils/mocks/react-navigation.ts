/**
 * Mock for @react-navigation/native hooks used in tests
 *
 * This provides mock implementations for useNavigation and useRoute
 * that work without requiring a full Navigator stack.
 */

const mockNavigation = {
  navigate: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  canGoBack: jest.fn().mockReturnValue(true),
  getParent: jest.fn(),
  getState: jest.fn().mockReturnValue({ routes: [], index: 0 }),
  addListener: jest.fn(() => () => {}),
  removeListener: jest.fn(),
  isFocused: jest.fn().mockReturnValue(true),
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
