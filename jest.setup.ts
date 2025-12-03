/* eslint-disable @typescript-eslint/no-require-imports */
import '@testing-library/jest-native/extend-expect';

import { server } from './src/test-utils/msw/server';

// Enable test-only UI components for RNTL tests
process.env.ENABLE_TEST_UI = 'true';

// MSW server lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const RN = require('react-native');
  return {
    GestureHandlerRootView: RN.View,
    Swipeable: RN.View,
    DrawerLayout: RN.View,
    State: {},
    ScrollView: RN.ScrollView,
    Slider: RN.View,
    Switch: RN.Switch,
    TextInput: RN.TextInput,
    ToolbarAndroid: RN.View,
    ViewPagerAndroid: RN.View,
    DrawerLayoutAndroid: RN.View,
    WebView: RN.View,
    NativeViewGestureHandler: RN.View,
    TapGestureHandler: RN.View,
    FlingGestureHandler: RN.View,
    ForceTouchGestureHandler: RN.View,
    LongPressGestureHandler: RN.View,
    PanGestureHandler: RN.View,
    PinchGestureHandler: RN.View,
    RotationGestureHandler: RN.View,
    RawButton: RN.View,
    BaseButton: RN.View,
    RectButton: RN.View,
    BorderlessButton: RN.View,
    FlatList: RN.FlatList,
    gestureHandlerRootHOC: (component: unknown) => component,
    Directions: {},
  };
});

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
    ButtonSpinner: mockRN.ActivityIndicator,
    Pressable: mockRN.Pressable,

    // Form components
    Input: mockRN.View,
    InputField: mockRN.TextInput,
    InputSlot: mockRN.View,
    InputIcon: mockRN.View,
    Switch: mockRN.Switch,
    FormControl: mockRN.View,
    FormControlLabel: mockRN.View,
    FormControlLabelText: mockRN.Text,
    FormControlHelper: mockRN.View,
    FormControlHelperText: mockRN.Text,
    FormControlError: mockRN.View,
    FormControlErrorText: mockRN.Text,
    FormControlErrorIcon: mockRN.View,

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

// Mock react-native-safe-area-context with displayName for css-interop compatibility
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');

  // Create components with displayName for css-interop compatibility
  const SafeAreaProvider = ({ children }: { children: React.ReactNode }) => children;
  SafeAreaProvider.displayName = 'SafeAreaProvider';

  const SafeAreaView = ({ children }: { children: React.ReactNode }) => children;
  SafeAreaView.displayName = 'SafeAreaView';

  const SafeAreaInsetsContext = React.createContext({ top: 0, right: 0, bottom: 0, left: 0 });
  SafeAreaInsetsContext.displayName = 'SafeAreaInsetsContext';

  return {
    SafeAreaProvider,
    SafeAreaView,
    SafeAreaInsetsContext,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 0, height: 0 }),
    initialWindowMetrics: {
      frame: { x: 0, y: 0, width: 0, height: 0 },
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    },
  };
});

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
    msg.includes('SafeAreaView has been deprecated') ||
    msg.includes('not wrapped in act(')
  ) {
    return;
  }

  originalError(...args);
};

const originalWarn = console.warn;

console.warn = (...args: unknown[]) => {
  const msg = String(args[0]);

  if (msg.includes('SafeAreaView has been deprecated') || msg.includes('NativeEventEmitter')) {
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
  const React = require('react');

  // Create a mock navigation ref
  const mockNavigationRef = {
    isReady: jest.fn(() => false),
    navigate: jest.fn(),
    dispatch: jest.fn(),
    reset: jest.fn(),
    goBack: jest.fn(),
    current: null,
    getRootState: jest.fn(),
    resetRoot: jest.fn(),
    getCurrentRoute: jest.fn(),
    getCurrentOptions: jest.fn(),
  };

  return {
    useNavigation: () => ({
      navigate: jest.fn(),
      dispatch: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
      reset: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
      name: 'MockRoute',
    }),
    useFocusEffect: jest.fn(callback => {
      // Call the callback immediately for testing
      React.useEffect(() => {
        callback();
      }, [callback]);
    }),
    useIsFocused: jest.fn(() => true),
    NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
    createNavigationContainerRef: jest.fn(() => mockNavigationRef),
    getStateFromPath: jest.fn(),
    getPathFromState: jest.fn(),
    CommonActions: {
      reset: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
    },
    StackActions: {
      push: jest.fn(),
      pop: jest.fn(),
      replace: jest.fn(),
    },
  };
});

// Mock navigation/navigationRef module to avoid module-level createNavigationContainerRef call
jest.mock('@app/navigation/navigationRef', () => ({
  navigationRef: {
    isReady: jest.fn(() => false),
    navigate: jest.fn(),
    dispatch: jest.fn(),
    reset: jest.fn(),
    goBack: jest.fn(),
    current: null,
  },
  navigate: jest.fn(),
  resetToRoute: jest.fn(),
}));

// Mock navigation/linking module to avoid module-level dependencies
jest.mock('@app/navigation/linking', () => ({
  linkingConfiguration: {
    prefixes: ['warrendeleonapp://'],
    config: { screens: {} },
  },
  setOnAuthTokensStored: jest.fn(),
}));

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

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  MainBundlePath: '/mock/bundle',
  DocumentDirectoryPath: '/mock/documents',
  exists: jest.fn(() => Promise.resolve(true)),
  readFile: jest.fn(() => Promise.resolve('')),
  writeFile: jest.fn(() => Promise.resolve()),
  unlink: jest.fn(() => Promise.resolve()),
  mkdir: jest.fn(() => Promise.resolve()),
  copyFile: jest.fn(() => Promise.resolve()),
  moveFile: jest.fn(() => Promise.resolve()),
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

// Mock react-native-encrypted-storage
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WhenUnlockedThisDeviceOnly',
  },
  ACCESS_CONTROL: {
    BIOMETRY_ANY_OR_DEVICE_PASSCODE: 'BiometryAnyOrDevicePasscode',
  },
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  check: jest.fn(() => Promise.resolve('granted')),
  request: jest.fn(() => Promise.resolve('granted')),
  openSettings: jest.fn(() => Promise.resolve()),
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_MEDIA_IMAGES: 'android.permission.READ_MEDIA_IMAGES',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
    UNAVAILABLE: 'unavailable',
    LIMITED: 'limited',
  },
}));

// Mock @infinitered/react-native-mlkit-face-detection (Android face detection)
jest.mock('@infinitered/react-native-mlkit-face-detection', () => ({
  RNMLKitFaceDetector: {
    detectFaces: jest.fn(() =>
      Promise.resolve({
        faces: [
          {
            boundingBox: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 },
          },
        ],
      })
    ),
  },
  useFacesInPhoto: jest.fn(() => ({
    faces: [],
    status: 'ready',
  })),
}));

// Mock jpeg-js
jest.mock('jpeg-js', () => ({
  decode: jest.fn(() => ({
    width: 224,
    height: 224,
    data: new Uint8Array(224 * 224 * 4).fill(128), // Mock RGBA data
  })),
  encode: jest.fn(),
}));

// Mock TensorFlow.js
jest.mock('@tensorflow/tfjs', () => ({
  ready: jest.fn(() => Promise.resolve()),
  dispose: jest.fn(),
  util: {
    encodeString: jest.fn(() => new Uint8Array()),
  },
}));

// Mock TensorFlow.js React Native
jest.mock('@tensorflow/tfjs-react-native', () => ({
  decodeJpeg: jest.fn(() => ({})),
}));

// Mock NSFWJS
jest.mock('nsfwjs', () => ({
  load: jest.fn(() =>
    Promise.resolve({
      classify: jest.fn(() =>
        Promise.resolve([
          { className: 'Neutral', probability: 0.95 },
          { className: 'Drawing', probability: 0.03 },
          { className: 'Sexy', probability: 0.01 },
          { className: 'Porn', probability: 0.005 },
          { className: 'Hentai', probability: 0.005 },
        ])
      ),
    })
  ),
}));

// Mock react-native-image-crop-picker
jest.mock('react-native-image-crop-picker', () => ({
  openCamera: jest.fn(() =>
    Promise.resolve({
      path: 'file://mock-image.jpg',
      width: 800,
      height: 800,
      mime: 'image/jpeg',
      size: 150000,
    })
  ),
  openPicker: jest.fn(() =>
    Promise.resolve({
      path: 'file://mock-image.jpg',
      width: 800,
      height: 800,
      mime: 'image/jpeg',
      size: 150000,
    })
  ),
  clean: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-compressor
jest.mock('react-native-compressor', () => ({
  Image: {
    compress: jest.fn(uri => Promise.resolve(uri)),
  },
}));

// Mock react-native-fast-tflite
jest.mock('react-native-fast-tflite', () => ({
  loadTensorflowModel: jest.fn(() =>
    Promise.resolve({
      run: jest.fn(() =>
        Promise.resolve([
          // NSFW model output: [drawings, hentai, neutral, porn, sexy]
          new Float32Array([0.02, 0.01, 0.95, 0.01, 0.01]),
        ])
      ),
      runSync: jest.fn(() => [new Float32Array([0.02, 0.01, 0.95, 0.01, 0.01])]),
    })
  ),
  useTensorflowModel: jest.fn(() => ({
    state: 'loaded',
    model: {
      run: jest.fn(() => Promise.resolve([new Float32Array([0.02, 0.01, 0.95, 0.01, 0.01])])),
      runSync: jest.fn(() => [new Float32Array([0.02, 0.01, 0.95, 0.01, 0.01])]),
    },
  })),
}));

// Initialize i18n for tests
// Must be imported after all mocks to ensure react-native-localize mock is applied
import i18n from './src/i18n';

// Ensure i18n is initialized before tests run
if (!i18n.isInitialized) {
  throw new Error('i18n failed to initialize in test environment');
}
