// @ts-ignore
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock.js';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
