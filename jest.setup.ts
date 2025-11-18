/* eslint-disable @typescript-eslint/no-require-imports */
import '@testing-library/jest-native/extend-expect';

// Enable test-only UI components for RNTL tests
process.env.ENABLE_TEST_UI = 'true';

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

// Mock react-native-config
jest.mock('react-native-config', () => ({
  APP_ENV: 'development',
  API_URL: 'https://raw.githubusercontent.com/warrendeleon/warrendeleon/main/api',
  E2E_MOCK: 'false',
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

// Mock @gluestack-ui/themed
jest.mock('@gluestack-ui/themed', () => {
  const mockRN = require('react-native');

  return {
    // Layout components
    Box: mockRN.View,
    VStack: mockRN.View,
    HStack: mockRN.View,
    Center: mockRN.View,
    Divider: mockRN.View,
    Spinner: mockRN.ActivityIndicator,

    // Typography
    Text: mockRN.Text,
    Heading: mockRN.Text,

    // Interactive components
    Button: mockRN.Pressable,
    ButtonText: mockRN.Text,
    ButtonIcon: mockRN.View,
    Pressable: mockRN.Pressable,

    // Avatar components
    Avatar: mockRN.View,
    AvatarImage: mockRN.Image,
    AvatarFallbackText: mockRN.Text,

    // Icon components
    Icon: mockRN.View,
    ChevronRightIcon: mockRN.View,
    ChevronLeftIcon: mockRN.View,
    ChevronDownIcon: mockRN.View,
    ChevronUpIcon: mockRN.View,

    // Image
    Image: mockRN.Image,

    // ScrollView
    ScrollView: mockRN.ScrollView,

    // GluestackUIProvider (pass through children)
    GluestackUIProvider: ({ children }: { children?: unknown }) => children,

    // Config
    config: {},
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

// Mock react-native-bootsplash
jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn(() => Promise.resolve()),
  show: jest.fn(() => Promise.resolve()),
  getVisibilityStatus: jest.fn(() => Promise.resolve('hidden')),
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

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
}));

// Mock redux-persist
jest.mock('redux-persist', () => {
  const actual = jest.requireActual('redux-persist');
  return {
    ...actual,
    persistReducer: jest.fn((_config, reducer) => reducer),
    persistStore: jest.fn(() => ({
      purge: jest.fn(() => Promise.resolve()),
      flush: jest.fn(() => Promise.resolve()),
      pause: jest.fn(),
      persist: jest.fn(),
      subscribe: jest.fn(() => jest.fn()),
      getState: jest.fn(() => ({ bootstrapped: true })),
    })),
  };
});

// Mock redux-persist/integration/react PersistGate
jest.mock('redux-persist/integration/react', () => ({
  PersistGate: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Reactotron for tests
jest.mock('reactotron-react-native', () => ({
  default: {
    configure: jest.fn(() => ({
      useReactNative: jest.fn(() => ({
        use: jest.fn(() => ({
          connect: jest.fn(() => ({
            createEnhancer: jest.fn(() => (next: unknown) => next),
          })),
        })),
      })),
    })),
  },
}));

jest.mock('reactotron-redux', () => ({
  reactotronRedux: jest.fn(() => ({})),
}));

// Mock the Reactotron config file
jest.mock('@app/config/reactotron', () => ({
  default: {
    createEnhancer: () => (createStore: unknown) => createStore,
  },
}));

// Mock react-native-blob-util
jest.mock('react-native-blob-util', () => ({
  default: {
    fetch: jest.fn(() => Promise.resolve({ path: jest.fn(() => '/mock/path') })),
    fs: {
      dirs: {
        CacheDir: '/mock/cache',
        DocumentDir: '/mock/documents',
      },
      exists: jest.fn(() => Promise.resolve(true)),
      unlink: jest.fn(() => Promise.resolve()),
    },
    config: jest.fn(() => ({
      fetch: jest.fn(() => Promise.resolve({ path: jest.fn(() => '/mock/path') })),
    })),
  },
}));

// Mock react-native-pdf
jest.mock('react-native-pdf', () => 'Pdf');

// Mock react-native-share
jest.mock('react-native-share', () => ({
  default: {
    open: jest.fn(() => Promise.resolve({ success: true })),
  },
}));

// Mock react-native-webview
jest.mock('react-native-webview', () => {
  const mockRN = require('react-native');
  return {
    default: mockRN.View,
  };
});

// Initialize i18n for tests
// Must be imported after all mocks to ensure react-native-localize mock is applied
import i18n from './src/i18n';

// Ensure i18n is initialized before tests run
if (!i18n.isInitialized) {
  throw new Error('i18n failed to initialize in test environment');
}
