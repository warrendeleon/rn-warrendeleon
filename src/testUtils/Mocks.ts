// @ts-ignore
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock.js';
require('jest-fetch-mock').enableMocks();

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-localize', () => ({
  getLocales: jest.fn(() => [
    {countryCode: 'GB', isRTL: false, languageCode: 'en', languageTag: 'en-GB'},
    {countryCode: 'ES', isRTL: false, languageCode: 'es', languageTag: 'es-ES'},
  ]),
}));
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

