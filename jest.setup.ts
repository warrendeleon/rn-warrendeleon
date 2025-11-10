/* eslint-disable @typescript-eslint/no-require-imports */
import '@testing-library/jest-native/extend-expect';

// Mock NativeWind and react-native-css-interop
jest.mock('react-native-css-interop', () => ({
  remapProps: jest.fn(),
  cssInterop: jest.fn(),
  createInteropElement: jest.fn(component => component),
}));

jest.mock('nativewind', () => ({
  useColorScheme: jest.fn(),
  useDeviceContext: jest.fn(),
  cssInterop: jest.fn(),
}));

// Mock react-native-worklets
jest.mock('react-native-worklets', () => ({
  useWorklet: jest.fn(fn => fn),
  useSharedValue: jest.fn(value => ({ value })),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    default: {
      View,
      Text: require('react-native').Text,
      ScrollView: require('react-native').ScrollView,
      FlatList: require('react-native').FlatList,
      createAnimatedComponent: (component: unknown) => component,
    },
    useSharedValue: jest.fn(value => ({ value })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn(value => value),
    withSpring: jest.fn(value => value),
    withRepeat: jest.fn(value => value),
    withSequence: jest.fn((...values) => values[0]),
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      bezier: jest.fn(),
    },
    runOnJS: jest.fn(fn => fn),
  };
});

// Mock @legendapp/motion
jest.mock('@legendapp/motion', () => {
  const RN = require('react-native');

  return {
    Motion: {
      View: RN.View,
      Text: RN.Text,
      ScrollView: RN.ScrollView,
      Image: RN.Image,
      Pressable: RN.Pressable,
    },
    AnimatePresence: ({ children }: { children?: unknown }) => children,
    createMotionAnimatedComponent: (component: unknown) => component,
    motionAnimatedDriver: jest.fn(),
  };
});

// Mock @expo/html-elements
jest.mock('@expo/html-elements', () => {
  const RN = require('react-native');
  return {
    H1: RN.Text,
    H2: RN.Text,
    H3: RN.Text,
    H4: RN.Text,
    H5: RN.Text,
    H6: RN.Text,
    P: RN.Text,
    A: RN.Text,
    Span: RN.Text,
    Div: RN.View,
    Section: RN.View,
    Article: RN.View,
    Header: RN.View,
    Footer: RN.View,
    Main: RN.View,
  };
});

// Mock @react-aria/utils to prevent react-dom import
jest.mock('@react-aria/utils', () => ({
  useLayoutEffect: require('react').useEffect,
  useEffectEvent: jest.fn(fn => fn),
  mergeProps: jest.fn((...args) => Object.assign({}, ...args)),
  mergeRefs: jest.fn(),
  focusWithoutScrolling: jest.fn(),
  openLink: jest.fn(),
  runAfterTransition: jest.fn(fn => fn()),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const originalError = console.error;

console.error = (...args: unknown[]) => {
  const msg = String(args[0]);

  if (
    msg.includes('Symbols are not valid as a React child') ||
    msg.includes('SafeAreaView has been deprecated')
  ) {
    return;
  }

  originalError(...args);
};

const originalWarn = console.warn;

console.warn = (...args: unknown[]) => {
  const msg = String(args[0]);

  if (msg.includes('SafeAreaView has been deprecated')) {
    return;
  }

  originalWarn(...args);
};

// Mock react-native-localize to avoid native dependency issues in Jest
jest.mock('react-native-localize', () => ({
  getLocales: () => [
    {
      languageTag: 'en',
      isRTL: false,
    },
  ],
  findBestAvailableLanguage: (tags: string[]) => {
    const languageTag = tags[0] ?? 'en';
    return { languageTag, isRTL: false };
  },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock react-navigation/native
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      dispatch: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});

// Mock react-navigation/native-stack so Navigator/Screen behave minimally in tests
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => {
    const MockNavigator = ({ children }: { children?: React.ReactNode }) => children ?? null;

    const MockScreen = ({
      component: Component,
      children,
      ...rest
    }: {
      component?: (props: Record<string, unknown>) => unknown;
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => {
      if (Component) {
        // Call the component as a function to avoid JSX in this .ts file
        return Component(rest);
      }
      return children ?? null;
    };

    return {
      Navigator: MockNavigator,
      Screen: MockScreen,
    };
  },
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => {
  return {
    enableScreens: jest.fn(),
  };
});
